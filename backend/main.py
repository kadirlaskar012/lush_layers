import os
import shutil
import uuid
import asyncio
import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
import httpx
from pydantic import BaseModel

from backend.config import settings
from backend.db import db
from backend.queue_manager import job_queue
from backend.processor import processor
from backend.ai_analyzer import ai_analyzer
from backend.storage import storage

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    settings.ensure_directories()
    job_queue.start()
    lan_ip = settings.get_lan_ip()
    print("=" * 60)
    print(f"  LUSH LAYERS Local Backend is RUNNING")
    print(f"  Local Access:      http://localhost:{settings.PORT}")
    print(f"  LAN Access:        http://{lan_ip}:{settings.PORT}")
    print(f"  LAN Upload Portal: http://{lan_ip}:{settings.PORT}/portal")
    print("=" * 60)
    yield
    # Shutdown
    await job_queue.stop()
    print("[Backend] Shutdown complete.")

app = FastAPI(
    title="LUSH LAYERS - Local Processing Backend",
    description="LAN-accessible background ingestion & processing system for LUSH LAYERS boutique bakery.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for LAN access and Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount media directory for static serving
app.mount("/media", StaticFiles(directory=str(settings.MEDIA_DIR)), name="media")

# Helper to trigger Next.js ISR revalidation
async def trigger_frontend_revalidation(paths: List[str] = None):
    if not paths:
        paths = ["/", "/cakes"]
    revalidate_url = f"{settings.NEXTJS_URL}/api/revalidate"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            for path in paths:
                await client.post(
                    revalidate_url,
                    json={"path": path, "secret": settings.REVALIDATE_SECRET}
                )
    except Exception as e:
        print(f"[Revalidate] Next.js revalidation warning (frontend may be starting): {e}")

# ==========================================
# SYSTEM & LAN STATUS
# ==========================================
@app.get("/api/system/status")
async def get_system_status():
    lan_ip = settings.get_lan_ip()
    stats = db.get_admin_stats()
    return {
        "status": "online",
        "lan_ip": lan_ip,
        "port": settings.PORT,
        "lan_url": f"http://{lan_ip}:{settings.PORT}",
        "stats": stats,
        "concurrency_limit": settings.MAX_CONCURRENT_JOBS,
        "cloudinary_enabled": storage.is_cloudinary_configured,
        "supabase_connected": db.is_connected
    }

@app.get("/api/admin/stats")
async def get_admin_stats_endpoint():
    return db.get_admin_stats()

# ==========================================
# BULK UPLOAD & JOB QUEUE
# ==========================================
@app.post("/api/upload/bulk")
async def upload_bulk_images(
    files: List[UploadFile] = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Accepts multiple cake images.
    Creates background jobs and enqueues them for parallel processing.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    created_jobs = []
    
    for file in files:
        ext = Path(file.filename).suffix.lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            continue

        unique_filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
        dest_path = settings.UPLOAD_DIR / unique_filename

        # Write uploaded file to disk
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = dest_path.stat().st_size
        
        # Enqueue job
        job_id = await job_queue.enqueue(
            file_path=dest_path,
            file_name=file.filename,
            original_size_bytes=file_size
        )
        created_jobs.append({
            "job_id": job_id,
            "filename": file.filename,
            "size_bytes": file_size,
            "status": "queued"
        })

    return {
        "message": f"Successfully queued {len(created_jobs)} images for parallel processing.",
        "total_queued": len(created_jobs),
        "jobs": created_jobs
    }

@app.get("/api/jobs")
async def list_jobs(limit: int = Query(50, ge=1, le=200)):
    return db.get_jobs(limit=limit)

@app.get("/api/jobs/{job_id}")
async def get_job_detail(job_id: str):
    job = db.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job

@app.post("/api/jobs/{job_id}/retry")
async def retry_job(job_id: str):
    success = await job_queue.retry(job_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to retry job. Verify original image exists.")
    return {"message": "Job re-enqueued for processing.", "job_id": job_id}

# ==========================================
# CAKES MANAGEMENT & WORKFLOW
# ==========================================
class CakeUpdateRequest(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    flavour: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    available_sizes: Optional[List[str]] = None
    image_url: Optional[str] = None

@app.get("/api/cakes")
async def list_cakes(
    status: Optional[str] = None,
    category_id: Optional[str] = None,
    flavour: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(100, ge=1, le=300)
):
    """
    Returns list of cakes filtered by status, category, flavour, or search.
    STRICT RULE: NO PRICE RETURNED.
    """
    return db.get_cakes(
        status=status,
        category_id=category_id,
        flavour=flavour,
        search=search,
        limit=limit
    )

@app.get("/api/cakes/pending")
async def list_pending_cakes():
    return db.get_cakes(status="pending")

@app.get("/api/cakes/approved")
async def list_approved_cakes():
    """
    Returns all approved cakes (both staged and published).
    A published cake remains part of the approved collection.
    """
    return db.get_cakes(status="approved,published")

@app.get("/api/cakes/{cake_id}")
async def get_cake(cake_id: str):
    cake = db.get_cake_by_id(cake_id)
    if not cake:
        # Also check by slug
        cake = db.get_cake_by_slug(cake_id)
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found.")
    return cake

@app.put("/api/cakes/{cake_id}")
async def update_cake(cake_id: str, payload: CakeUpdateRequest):
    updates = {k: v for k, v in payload.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided for update.")
    
    updated = db.update_cake(cake_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Cake not found.")
    return updated

@app.post("/api/cakes/{cake_id}/approve")
async def approve_cake(cake_id: str):
    approved = db.approve_cake(cake_id)
    if not approved:
        raise HTTPException(status_code=404, detail="Cake not found.")
    return {"message": "Cake approved successfully.", "cake": approved}

@app.post("/api/cakes/{cake_id}/reject")
async def reject_cake(cake_id: str):
    rejected = db.reject_cake(cake_id)
    if not rejected:
        raise HTTPException(status_code=404, detail="Cake not found.")
    return {"message": "Cake rejected.", "cake": rejected}

@app.post("/api/cakes/{cake_id}/publish")
async def publish_cake(cake_id: str, background_tasks: BackgroundTasks):
    """
    Publishes cake to live catalog.
    MANDATORY: Image must be present.
    Triggers ISR cache revalidation.
    """
    try:
        published = db.publish_cake(cake_id)
        if not published:
            raise HTTPException(status_code=404, detail="Cake not found.")
        
        # Trigger Next.js revalidation in background
        background_tasks.add_task(
            trigger_frontend_revalidation,
            ["/", "/cakes", f"/cakes/{published['slug']}"]
        )
        return {"message": "Cake published successfully to public catalog.", "cake": published}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/cakes/{cake_id}")
async def delete_cake(cake_id: str, background_tasks: BackgroundTasks):
    cake = db.get_cake_by_id(cake_id)
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found.")
    
    deleted = db.delete_cake(cake_id)
    if deleted:
        background_tasks.add_task(trigger_frontend_revalidation, ["/", "/cakes"])
        return {"message": "Cake deleted successfully."}
    raise HTTPException(status_code=500, detail="Failed to delete cake.")

@app.post("/api/cakes/{cake_id}/unpublish")
async def unpublish_cake(cake_id: str, background_tasks: BackgroundTasks):
    """
    Reverts a published cake back to approved (staged) status.
    Removes it from live catalog and triggers ISR revalidation.
    """
    cake = db.get_cake_by_id(cake_id)
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found.")
    
    updated = db.update_cake(cake_id, {"status": "approved"})
    background_tasks.add_task(trigger_frontend_revalidation, ["/", "/cakes", f"/cakes/{cake['slug']}"])
    return {"message": "Cake moved back to staged approval.", "cake": updated}

@app.post("/api/cakes/{cake_id}/restore")
async def restore_cake(cake_id: str):
    """
    Restores a rejected cake back to pending state for review.
    """
    cake = db.get_cake_by_id(cake_id)
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found.")
    
    restored = db.restore_cake(cake_id)
    return {"message": "Cake restored to pending approval.", "cake": restored}

# --- CUSTOMER ENQUIRIES / ORDERS ---
class EnquiryCreateRequest(BaseModel):
    customer_name: str
    phone: str
    cake_name: str
    flavour: Optional[str] = "Chef's Signature"
    selected_size: Optional[str] = "1.0 kg"
    custom_message: Optional[str] = ""

class EnquiryStatusUpdateRequest(BaseModel):
    status: str  # New, Contacted, Confirmed, Completed, Cancelled

@app.post("/api/enquiries")
async def create_enquiry(payload: EnquiryCreateRequest):
    """
    Registers customer WhatsApp order/enquiry. ZERO PRICE.
    """
    enquiry = db.create_enquiry(payload.dict())
    return {"message": "Enquiry registered successfully.", "enquiry": enquiry}

@app.get("/api/enquiries")
async def list_enquiries(status: Optional[str] = None, limit: int = Query(100, ge=1, le=500)):
    """
    Returns list of customer orders / WhatsApp enquiries for Admin management.
    """
    return db.get_enquiries(status=status, limit=limit)

@app.patch("/api/enquiries/{enquiry_id}")
async def update_enquiry_status(enquiry_id: str, payload: EnquiryStatusUpdateRequest):
    """
    Updates the status of an order/enquiry.
    """
    updated = db.update_enquiry_status(enquiry_id, payload.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Enquiry not found.")
    return {"message": "Enquiry status updated.", "enquiry": updated}

@app.delete("/api/enquiries/{enquiry_id}")
async def delete_enquiry(enquiry_id: str):
    deleted = db.delete_enquiry(enquiry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Enquiry not found.")
    return {"message": "Enquiry deleted successfully."}

async def _execute_ai_generation_for_cake(cake: Dict[str, Any], is_regenerate: bool = False) -> Dict[str, Any]:
    cake_id = cake["id"]
    ai_meta = cake.get("ai_metadata") or {}
    
    # Update temporary status to generating
    ai_meta["ai_status"] = "generating"
    db.update_cake(cake_id, {"ai_metadata": ai_meta})
    
    # 1. Locate or fetch image
    image_input = None
    local_preview_url = ai_meta.get("local_preview_url", "")
    filename = Path(local_preview_url).name if local_preview_url else None
    
    if filename and (settings.PROCESSED_DIR / filename).exists():
        image_input = settings.PROCESSED_DIR / filename
    else:
        # Search processed dir
        matches = list(settings.PROCESSED_DIR.glob(f"cake_{cake_id[:8]}*.webp"))
        if matches:
            image_input = matches[0]
        elif cake.get("image_url"):
            img_url = cake["image_url"]
            if img_url.startswith("/"):
                img_url = f"http://127.0.0.1:{settings.PORT}{img_url}"
            image_input = img_url

    if not image_input:
        ai_meta["ai_status"] = "failed"
        ai_meta["ai_error"] = "Image source not found for AI analysis."
        db.update_cake(cake_id, {"ai_metadata": ai_meta})
        raise ValueError("Image source not available for AI analysis.")

    # 2. Get active DB categories
    categories = db.get_categories(active_only=True)
    cat_names = [c["name"] for c in categories]

    # 3. Run AI analysis in threadpool executor
    loop = asyncio.get_event_loop()
    ai_result = await loop.run_in_executor(
        None,
        lambda: ai_analyzer.analyze_cake_image(
            image_input,
            valid_categories=cat_names
        )
    )

    # 4. Map category to DB category id or None if "Needs Review"
    matched_category_id = None
    sugg_cat = ai_result.get("category", "")
    if sugg_cat and sugg_cat != "Needs Review":
        for cat in categories:
            if cat["name"].lower() == sugg_cat.lower() or cat["slug"].lower() in sugg_cat.lower():
                matched_category_id = cat["id"]
                break

    # 5. Update cake record - STRICT: status MUST REMAIN pending
    ai_meta.update({
        "ai_status": "generated",
        "suggested_name": ai_result.get("name"),
        "suggested_flavour": ai_result.get("flavour"),
        "suggested_category": sugg_cat,
        "suggested_category_id": matched_category_id,
        "suggested_description": ai_result.get("description"),
        "suggested_sizes": ai_result.get("available_sizes", []),
        "tags": ai_result.get("tags", []),
        "confidence": ai_result.get("confidence_score", 0.95),
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "regenerated": is_regenerate,
        "ai_error": None
    })

    updated = db.update_cake(cake_id, {
        "name": ai_result.get("name", cake["name"]),
        "flavour": ai_result.get("flavour", "Not specified"),
        "category_id": matched_category_id,
        "description": ai_result.get("description", cake.get("description", "")),
        "available_sizes": ai_result.get("available_sizes", cake.get("available_sizes")),
        "ai_metadata": ai_meta
        # STRICT RULE: Status MUST REMAIN pending
    })

    return updated

@app.post("/api/cakes/{cake_id}/ai-generate")
async def generate_cake_ai(cake_id: str):
    """
    Analyzes cake image and generates metadata suggestions for a single pending cake.
    Status remains strictly PENDING.
    """
    cake = db.get_cake_by_id(cake_id)
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found.")
    
    try:
        updated = await _execute_ai_generation_for_cake(cake, is_regenerate=False)
        return {"message": "AI metadata generated successfully.", "cake": updated}
    except Exception as e:
        ai_meta = cake.get("ai_metadata") or {}
        ai_meta["ai_status"] = "failed"
        ai_meta["ai_error"] = str(e)
        db.update_cake(cake_id, {"ai_metadata": ai_meta})
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

@app.post("/api/cakes/{cake_id}/regenerate-ai")
async def regenerate_cake_ai(cake_id: str):
    """
    Re-runs AI analysis on cake image and produces fresh suggested title, flavour, category, and description.
    """
    cake = db.get_cake_by_id(cake_id)
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found.")
    
    try:
        updated = await _execute_ai_generation_for_cake(cake, is_regenerate=True)
        return {"message": "AI suggestions regenerated.", "cake": updated}
    except Exception as e:
        ai_meta = cake.get("ai_metadata") or {}
        ai_meta["ai_status"] = "failed"
        ai_meta["ai_error"] = str(e)
        db.update_cake(cake_id, {"ai_metadata": ai_meta})
        raise HTTPException(status_code=500, detail=f"AI regeneration failed: {str(e)}")

@app.post("/api/cakes/pending/ai-generate-all")
async def generate_all_pending_ai():
    """
    Bulk generates AI metadata for all pending cakes where ai_status != 'generated'.
    Processes each cake independently; individual failures do not block others.
    """
    pending_cakes = db.get_cakes(status="pending", limit=300)
    to_generate = []
    for c in pending_cakes:
        ai_meta = c.get("ai_metadata") or {}
        if ai_meta.get("ai_status") != "generated":
            to_generate.append(c)

    results = []
    succeeded = 0
    failed = 0

    for cake in to_generate:
        try:
            updated = await _execute_ai_generation_for_cake(cake, is_regenerate=False)
            results.append({"id": cake["id"], "name": updated["name"], "status": "generated"})
            succeeded += 1
        except Exception as e:
            failed += 1
            results.append({"id": cake["id"], "name": cake["name"], "status": "failed", "error": str(e)})

    return {
        "message": f"Bulk AI generation completed. {succeeded} succeeded, {failed} failed.",
        "total_pending": len(pending_cakes),
        "queued": len(to_generate),
        "succeeded": succeeded,
        "failed": failed,
        "results": results
    }

@app.post("/api/cakes/{cake_id}/reprocess")
async def reprocess_cake_image(cake_id: str):
    """
    Re-executes background removal and clean white background compositing.
    """
    cake = db.get_cake_by_id(cake_id)
    if not cake:
        raise HTTPException(status_code=404, detail="Cake not found.")

    ai_meta = cake.get("ai_metadata") or {}
    orig_name = ai_meta.get("original_file")
    
    possible_file = None
    if orig_name:
        for p in settings.UPLOAD_DIR.glob(f"*{orig_name}*"):
            possible_file = p
            break
            
    if not possible_file or not possible_file.exists():
        raise HTTPException(status_code=400, detail="Original uploaded source file not found to reprocess.")

    result = processor.process_cake_image(possible_file, f"cake_{cake_id[:8]}_reproc")
    upload_res = storage.upload_image(Path(result["master_path"]), f"cake_{cake_id[:8]}_reproc")

    ai_meta.update({
        "local_preview_url": result["relative_master_url"],
        "local_thumb_url": result["relative_thumb_url"]
    })

    updated = db.update_cake(cake_id, {
        "image_url": upload_res["image_url"],
        "cloudinary_public_id": upload_res.get("cloudinary_public_id"),
        "ai_metadata": ai_meta
    })

    return {"message": "Image reprocessed successfully.", "cake": updated}

# ==========================================
# CATEGORIES & REVIEWS
# ==========================================
class CategoryCreateRequest(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = ""
    image_url: Optional[str] = "/categories/default.webp"
    icon: Optional[str] = "Cake"
    color: Optional[str] = "#FAF6F0"
    accent: Optional[str] = "#B88E3E"
    active: Optional[bool] = True
    sort_order: Optional[int] = 0

class CategoryUpdateRequest(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    accent: Optional[str] = None
    active: Optional[bool] = None
    sort_order: Optional[int] = None

@app.get("/api/categories")
async def get_categories(all: bool = False):
    return db.get_categories(active_only=not all)

@app.post("/api/categories")
async def create_category(payload: CategoryCreateRequest):
    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Category name cannot be empty")
    try:
        created = db.create_category(payload.dict())
        return {"message": "Category created successfully", "category": created}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/api/categories/{cat_id}")
async def update_category(cat_id: str, payload: CategoryUpdateRequest):
    updates = payload.dict(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update")
    updated = db.update_category(cat_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category icon and details updated successfully", "category": updated}

class ReviewCreateRequest(BaseModel):
    customer_name: str
    customer_location: Optional[str] = "Verified Guest"
    review_text: str
    rating: int
    cake_id: Optional[str] = None

@app.get("/api/reviews")
async def list_reviews(status: Optional[str] = Query(None)):
    return db.get_reviews(status=status)

@app.post("/api/reviews")
async def submit_review(payload: ReviewCreateRequest):
    """Submits a customer review. ALWAYS starts as pending until approved."""
    if payload.rating < 1 or payload.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5.")
    if not payload.customer_name.strip() or not payload.review_text.strip():
        raise HTTPException(status_code=400, detail="Name and review text are required.")
        
    created = db.create_review(payload.dict())
    return {"message": "Thank you! Your review has been submitted for moderation.", "review": created}

@app.post("/api/reviews/{review_id}/approve")
async def approve_review(review_id: str, background_tasks: BackgroundTasks):
    success = db.update_review_status(review_id, "approved")
    if not success:
        raise HTTPException(status_code=404, detail="Review not found.")
    background_tasks.add_task(trigger_frontend_revalidation, ["/", "/reviews"])
    return {"message": "Review approved and published."}

@app.post("/api/reviews/{review_id}/reject")
async def reject_review(review_id: str):
    success = db.update_review_status(review_id, "rejected")
    if not success:
        raise HTTPException(status_code=404, detail="Review not found.")
    return {"message": "Review rejected."}

@app.delete("/api/reviews/{review_id}")
async def delete_review(review_id: str, background_tasks: BackgroundTasks):
    success = db.delete_review(review_id)
    if not success:
        raise HTTPException(status_code=404, detail="Review not found.")
    background_tasks.add_task(trigger_frontend_revalidation, ["/", "/reviews"])
    return {"message": "Review deleted."}

# ==========================================
# BUILT-IN LAN UPLOAD PORTAL
# ==========================================
@app.get("/portal", response_class=HTMLResponse)
@app.get("/", response_class=HTMLResponse)
async def serve_lan_portal():
    lan_ip = settings.get_lan_ip()
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LUSH LAYERS • Local LAN Processing Center</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            :root {{
                --bg: #141110;
                --surface: #1E1918;
                --surface-card: #27211F;
                --gold: #D4AF37;
                --gold-light: #F6E7B9;
                --cream: #FBF8F3;
                --muted: #A39691;
                --border: rgba(212, 175, 55, 0.2);
                --success: #10B981;
                --warn: #F59E0B;
                --error: #EF4444;
            }}
            * {{ box-sizing: border-box; margin: 0; padding: 0; }}
            body {{
                font-family: 'Plus Jakarta Sans', sans-serif;
                background-color: var(--bg);
                color: var(--cream);
                min-height: 100vh;
                padding: 2rem 1.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
            }}
            header {{
                text-align: center;
                max-width: 800px;
                margin-bottom: 2.5rem;
            }}
            .brand {{
                font-family: 'Playfair Display', serif;
                font-size: 2.5rem;
                letter-spacing: 0.15em;
                color: var(--gold-light);
                margin-bottom: 0.35rem;
                text-transform: uppercase;
            }}
            .tagline {{
                font-size: 0.95rem;
                letter-spacing: 0.25em;
                color: var(--gold);
                text-transform: uppercase;
                margin-bottom: 1.25rem;
            }}
            .lan-badge {{
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(212, 175, 55, 0.1);
                border: 1px solid var(--border);
                padding: 0.5rem 1.25rem;
                border-radius: 9999px;
                font-size: 0.85rem;
                color: var(--gold-light);
            }}
            .pulse-dot {{
                width: 8px;
                height: 8px;
                background: var(--success);
                border-radius: 50%;
                box-shadow: 0 0 10px var(--success);
            }}
            .container {{
                width: 100%;
                max-width: 1100px;
                display: grid;
                grid-template-columns: 1fr;
                gap: 2rem;
            }}
            @media (min-width: 900px) {{
                .container {{ grid-template-columns: 1fr 1fr; }}
            }}
            .card {{
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 16px;
                padding: 2rem;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            }}
            .card-title {{
                font-family: 'Playfair Display', serif;
                font-size: 1.4rem;
                color: var(--gold-light);
                margin-bottom: 1.25rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }}
            .upload-zone {{
                border: 2px dashed var(--border);
                border-radius: 12px;
                padding: 3rem 1.5rem;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                background: rgba(255,255,255,0.01);
            }}
            .upload-zone:hover, .upload-zone.dragover {{
                border-color: var(--gold);
                background: rgba(212, 175, 55, 0.05);
            }}
            .upload-btn {{
                background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
                color: #000;
                font-weight: 600;
                border: none;
                padding: 0.85rem 2rem;
                border-radius: 9999px;
                font-size: 0.95rem;
                cursor: pointer;
                margin-top: 1.5rem;
                display: inline-block;
                transition: transform 0.2s, box-shadow 0.2s;
            }}
            .upload-btn:hover {{
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(212, 175, 55, 0.35);
            }}
            .stats-grid {{
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                margin-bottom: 1.5rem;
            }}
            .stat-box {{
                background: var(--surface-card);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 10px;
                padding: 1rem;
                text-align: center;
            }}
            .stat-num {{
                font-size: 1.75rem;
                font-weight: 700;
                color: var(--gold-light);
            }}
            .stat-label {{
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: var(--muted);
                margin-top: 0.25rem;
            }}
            .job-list {{
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                max-height: 480px;
                overflow-y: auto;
            }}
            .job-item {{
                background: var(--surface-card);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 8px;
                padding: 0.9rem 1rem;
            }}
            .job-header {{
                display: flex;
                justify-content: space-between;
                font-size: 0.85rem;
                margin-bottom: 0.5rem;
            }}
            .job-name {{
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 220px;
            }}
            .status-pill {{
                padding: 0.2rem 0.6rem;
                border-radius: 9999px;
                font-size: 0.7rem;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.05em;
            }}
            .status-completed {{ background: rgba(16,185,129,0.15); color: #34D399; }}
            .status-processing, .status-image_processed, .status-ai_processing, .status-uploading {{ background: rgba(245,158,11,0.15); color: #FBBF24; }}
            .status-queued {{ background: rgba(163,150,145,0.15); color: #D1D5DB; }}
            .status-failed {{ background: rgba(239,68,68,0.15); color: #F87171; }}
            .progress-bar-bg {{
                height: 5px;
                background: rgba(255,255,255,0.08);
                border-radius: 9999px;
                overflow: hidden;
            }}
            .progress-bar-fill {{
                height: 100%;
                background: linear-gradient(90deg, #D4AF37, #F6E7B9);
                transition: width 0.3s ease;
            }}
            .quick-links {{
                margin-top: 2rem;
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                justify-content: center;
            }}
            .link-pill {{
                color: var(--cream);
                text-decoration: none;
                background: rgba(255,255,255,0.04);
                border: 1px solid var(--border);
                padding: 0.6rem 1.25rem;
                border-radius: 9999px;
                font-size: 0.85rem;
                transition: all 0.2s;
            }}
            .link-pill:hover {{
                border-color: var(--gold);
                color: var(--gold-light);
            }}
        </style>
    </head>
    <body>
        <header>
            <div class="brand">LUSH LAYERS</div>
            <div class="tagline">Made with Love • Processing Center</div>
            <div class="lan-badge">
                <span class="pulse-dot"></span>
                <span>LAN Address: <strong>http://{lan_ip}:{settings.PORT}</strong></span>
            </div>
        </header>

        <div class="container">
            <!-- Left: Bulk Upload -->
            <div class="card">
                <div class="card-title">
                    <span>Bulk Cake Upload</span>
                    <span style="font-size: 0.8rem; color: var(--muted); font-family: sans-serif;">Parallel Engine</span>
                </div>
                <div class="upload-zone" id="dropZone" onclick="document.getElementById('fileInput').click()">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.75rem; color: var(--gold);">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p style="font-size: 1rem; font-weight: 500; margin-bottom: 0.35rem;">Drag & drop 20+ cake images</p>
                    <p style="font-size: 0.8rem; color: var(--muted);">Supports JPG, PNG, WEBP, AVIF (Max 25MB each)</p>
                    <input type="file" id="fileInput" multiple accept="image/*" style="display: none;" onchange="handleFilesSelected(this.files)">
                </div>
                <div style="text-align: center;">
                    <button class="upload-btn" id="uploadBtn" style="display: none;" onclick="startUpload()">Upload & Process Selected Files</button>
                    <div id="fileCountText" style="margin-top: 1rem; font-size: 0.85rem; color: var(--gold-light);"></div>
                </div>
            </div>

            <!-- Right: Queue & Stats -->
            <div class="card">
                <div class="card-title">
                    <span>Queue & Activity</span>
                    <button onclick="fetchJobs()" style="background: none; border: 1px solid var(--border); color: var(--muted); padding: 0.25rem 0.75rem; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">Refresh</button>
                </div>
                <div class="stats-grid" id="statsGrid">
                    <div class="stat-box"><div class="stat-num" id="statPending">-</div><div class="stat-label">Pending Approval</div></div>
                    <div class="stat-box"><div class="stat-num" id="statProcessing">-</div><div class="stat-label">In Processing</div></div>
                    <div class="stat-box"><div class="stat-num" id="statPublished">-</div><div class="stat-label">Published Live</div></div>
                </div>
                <div class="job-list" id="jobList">
                    <p style="color: var(--muted); font-size: 0.85rem; text-align: center; padding: 2rem;">No active processing jobs.</p>
                </div>
            </div>
        </div>

        <div class="quick-links">
            <a href="http://{lan_ip}:3000/admin" class="link-pill" target="_blank">Next.js Admin Dashboard ↗</a>
            <a href="http://{lan_ip}:3000/admin/cakes/pending" class="link-pill" target="_blank">Pending Cakes Queue ↗</a>
            <a href="http://{lan_ip}:3000" class="link-pill" target="_blank">Public LUSH LAYERS Website ↗</a>
            <a href="/docs" class="link-pill" target="_blank">FastAPI OpenAPI Specs ↗</a>
        </div>

        <script>
            let selectedFiles = [];
            const dropZone = document.getElementById('dropZone');
            const fileInput = document.getElementById('fileInput');
            const uploadBtn = document.getElementById('uploadBtn');
            const fileCountText = document.getElementById('fileCountText');

            ['dragenter', 'dragover'].forEach(name => {{
                dropZone.addEventListener(name, (e) => {{ e.preventDefault(); dropZone.classList.add('dragover'); }});
            }});
            ['dragleave', 'drop'].forEach(name => {{
                dropZone.addEventListener(name, (e) => {{ e.preventDefault(); dropZone.classList.remove('dragover'); }});
            }});

            dropZone.addEventListener('drop', (e) => {{
                if (e.dataTransfer.files.length) handleFilesSelected(e.dataTransfer.files);
            }});

            function handleFilesSelected(files) {{
                selectedFiles = Array.from(files);
                if (selectedFiles.length > 0) {{
                    fileCountText.innerText = selectedFiles.length + " cake image(s) selected ready to process.";
                    uploadBtn.style.display = "inline-block";
                }}
            }}

            async function startUpload() {{
                if (!selectedFiles.length) return;
                uploadBtn.disabled = true;
                uploadBtn.innerText = "Enqueuing Images...";

                const formData = new FormData();
                selectedFiles.forEach(file => formData.append("files", file));

                try {{
                    const resp = await fetch("/api/upload/bulk", {{ method: "POST", body: formData }});
                    const res = await resp.json();
                    fileCountText.innerText = "Enqueued " + res.total_queued + " images for parallel processing!";
                    uploadBtn.style.display = "none";
                    selectedFiles = [];
                    fetchJobs();
                }} catch (err) {{
                    alert("Upload failed: " + err.message);
                }} finally {{
                    uploadBtn.disabled = false;
                    uploadBtn.innerText = "Upload & Process Selected Files";
                }}
            }}

            async function fetchJobs() {{
                try {{
                    const [jobsResp, statusResp] = await Promise.all([
                        fetch("/api/jobs?limit=25"),
                        fetch("/api/system/status")
                    ]);
                    const jobs = await jobsResp.json();
                    const status = await statusResp.json();

                    document.getElementById('statPending').innerText = status.stats.pending;
                    document.getElementById('statProcessing').innerText = status.stats.processing;
                    document.getElementById('statPublished').innerText = status.stats.published;

                    const listEl = document.getElementById('jobList');
                    if (!jobs.length) {{
                        listEl.innerHTML = '<p style="color: var(--muted); font-size: 0.85rem; text-align: center; padding: 2rem;">No processing jobs yet.</p>';
                        return;
                    }}

                    listEl.innerHTML = jobs.map(j => `
                        <div class="job-item">
                            <div class="job-header">
                                <span class="job-name" title="${{j.file_name}}">${{j.file_name}}</span>
                                <span class="status-pill status-${{j.status}}">${{j.status.replace('_', ' ')}}</span>
                            </div>
                            <div class="progress-bar-bg">
                                <div class="progress-bar-fill" style="width: ${{j.progress}}%;"></div>
                            </div>
                            ${{j.error_message ? `<div style="font-size: 0.72rem; color: #F87171; margin-top: 0.35rem;">${{j.error_message}}</div>` : ''}}
                        </div>
                    `).join('');
                }} catch (e) {{
                    console.error("Fetch jobs error", e);
                }}
            }}

            // Poll every 2 seconds
            setInterval(fetchJobs, 2000);
            fetchJobs();
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
