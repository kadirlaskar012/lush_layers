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
    compress: bool = Form(True),
    white_background: bool = Form(True),
    auto_focus: bool = Form(True),
    ai_metadata: bool = Form(True),
    category_id: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = None
):
    """
    Accepts multiple cake images with configurable processing options:
    - compress: WebP high-efficiency optimization
    - white_background: RemBG background removal & studio white shadow
    - auto_focus: subject detection, auto-crop & 1:1 square centering
    - ai_metadata: Gemini AI sensory copywriting
    - category_id: optional pre-assigned category
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    created_jobs = []
    
    options = {
        "compress": compress,
        "white_background": white_background,
        "auto_focus": auto_focus,
        "ai_metadata": ai_metadata,
        "category_id": category_id.strip() if category_id and category_id.strip() else None
    }
    
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
        
        # Enqueue job with custom options
        job_id = await job_queue.enqueue(
            file_path=dest_path,
            file_name=file.filename,
            original_size_bytes=file_size,
            options=options
        )
        created_jobs.append({
            "job_id": job_id,
            "filename": file.filename,
            "size_bytes": file_size,
            "status": "queued",
            "options": options
        })

    return {
        "message": f"Successfully queued {len(created_jobs)} images for parallel processing.",
        "total_queued": len(created_jobs),
        "jobs": created_jobs
    }

@app.get("/api/jobs")
async def list_jobs(limit: int = Query(50, ge=1, le=200)):
    return db.get_jobs(limit=limit)

@app.post("/api/jobs/clear")
@app.delete("/api/jobs/clear")
async def clear_job_history():
    """Clears completed and failed job records from the queue."""
    conn = db._get_conn()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM processing_jobs WHERE status IN ('completed', 'failed')")
    conn.commit()
    conn.close()
    return {"message": "Job history cleared successfully."}

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
# ADVANCED IMAGE PROCESSING PORTAL (STUDIO SUITE)
# ==========================================
@app.get("/portal", response_class=HTMLResponse)
@app.get("/", response_class=HTMLResponse)
async def serve_lan_portal():
    lan_ip = settings.get_lan_ip()
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LUSH LAYERS • Python AI Image Processing Suite</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg: #0C0A09;
            --surface: rgba(24, 18, 15, 0.85);
            --surface-card: rgba(36, 28, 23, 0.7);
            --surface-card-hover: rgba(48, 38, 32, 0.85);
            --gold: #D4AF37;
            --gold-light: #F6E7B9;
            --gold-dark: #997A1E;
            --cream: #FAF6F0;
            --muted: #A89B92;
            --border: rgba(212, 175, 55, 0.22);
            --border-hover: rgba(212, 175, 55, 0.45);
            --success: #10B981;
            --success-bg: rgba(16, 185, 129, 0.15);
            --warn: #F59E0B;
            --error: #EF4444;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg);
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(212, 175, 55, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 85% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 45%);
            color: var(--cream);
            min-height: 100vh;
            padding: 2.5rem 1.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        header {{
            text-align: center;
            max-width: 900px;
            margin-bottom: 2.5rem;
            position: relative;
        }}
        .brand-title {{
            font-family: 'Playfair Display', serif;
            font-size: 2.75rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            background: linear-gradient(135deg, #FFFFFF 0%, #F6E7B9 40%, #D4AF37 80%, #AA820A 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.35rem;
            text-transform: uppercase;
        }}
        .brand-tagline {{
            font-size: 0.85rem;
            letter-spacing: 0.3em;
            color: var(--gold);
            text-transform: uppercase;
            font-weight: 500;
            margin-bottom: 1.25rem;
        }}
        .status-badge {{
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            background: rgba(212, 175, 55, 0.08);
            border: 1px solid var(--border);
            padding: 0.45rem 1.2rem;
            border-radius: 9999px;
            font-size: 0.82rem;
            color: var(--gold-light);
            backdrop-filter: blur(10px);
        }}
        .pulse-dot {{
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--success);
            animation: pulse-glow 2s infinite;
        }}
        @keyframes pulse-glow {{
            0%, 100% {{ transform: scale(1); opacity: 1; }}
            50% {{ transform: scale(1.3); opacity: 0.6; }}
        }}

        .main-container {{
            width: 100%;
            max-width: 1200px;
            display: grid;
            grid-template-columns: 1fr;
            gap: 2rem;
        }}
        @media (min-width: 960px) {{
            .main-container {{ grid-template-columns: 1.05fr 1fr; }}
        }}

        .suite-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 2rem;
            backdrop-filter: blur(20px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            transition: border-color 0.3s ease;
        }}
        .suite-card:hover {{
            border-color: var(--border-hover);
        }}
        .card-header {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(212, 175, 55, 0.12);
        }}
        .card-header-title {{
            font-family: 'Playfair Display', serif;
            font-size: 1.35rem;
            color: var(--gold-light);
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }}
        .card-header-badge {{
            font-size: 0.72rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
            background: rgba(212, 175, 55, 0.12);
            color: var(--gold);
            border: 1px solid rgba(212, 175, 55, 0.25);
        }}

        /* Drag & Drop Zone */
        .dropzone {{
            border: 2px dashed rgba(212, 175, 55, 0.3);
            border-radius: 16px;
            padding: 3.5rem 1.5rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            background: rgba(255, 255, 255, 0.015);
            position: relative;
            overflow: hidden;
        }}
        .dropzone:hover, .dropzone.dragover {{
            border-color: var(--gold);
            background: rgba(212, 175, 55, 0.06);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px -10px rgba(212, 175, 55, 0.2);
        }}
        .dropzone-icon {{
            width: 54px;
            height: 54px;
            margin: 0 auto 1.25rem;
            color: var(--gold);
            stroke-width: 1.5;
            transition: transform 0.3s ease;
        }}
        .dropzone:hover .dropzone-icon {{
            transform: scale(1.1) translateY(-4px);
        }}
        .dropzone-title {{
            font-size: 1.15rem;
            font-weight: 600;
            color: var(--cream);
            margin-bottom: 0.4rem;
        }}
        .dropzone-desc {{
            font-size: 0.85rem;
            color: var(--muted);
            margin-bottom: 1.25rem;
        }}
        .dropzone-btn {{
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
            color: #000;
            font-weight: 600;
            padding: 0.75rem 1.75rem;
            border-radius: 9999px;
            font-size: 0.88rem;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }}
        .dropzone:hover .dropzone-btn {{
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(212, 175, 55, 0.45);
        }}

        /* Stats Grid */
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.85rem;
            margin-bottom: 1.25rem;
        }}
        .stat-item {{
            background: var(--surface-card);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 0.85rem 0.65rem;
            text-align: center;
            transition: transform 0.2s ease;
        }}
        .stat-item:hover {{
            transform: translateY(-2px);
            border-color: rgba(212, 175, 55, 0.25);
        }}
        .stat-number {{
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--gold-light);
            font-family: 'Playfair Display', serif;
        }}
        .stat-name {{
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--muted);
            margin-top: 0.2rem;
        }}

        /* Jobs Queue */
        .queue-header-actions {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}
        .icon-btn {{
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border);
            color: var(--muted);
            padding: 0.35rem 0.75rem;
            border-radius: 8px;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .icon-btn:hover {{
            color: var(--gold-light);
            border-color: var(--gold);
            background: rgba(212, 175, 55, 0.1);
        }}
        .jobs-container {{
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            max-height: 480px;
            overflow-y: auto;
            padding-right: 0.25rem;
        }}
        .jobs-container::-webkit-scrollbar {{
            width: 4px;
        }}
        .jobs-container::-webkit-scrollbar-thumb {{
            background: rgba(212, 175, 55, 0.3);
            border-radius: 4px;
        }}
        .job-card {{
            background: var(--surface-card);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 1rem;
            transition: all 0.2s ease;
        }}
        .job-card:hover {{
            border-color: rgba(212, 175, 55, 0.3);
            background: var(--surface-card-hover);
        }}
        .job-card-top {{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.65rem;
        }}
        .job-info {{
            display: flex;
            align-items: center;
            gap: 0.85rem;
        }}
        .job-thumb {{
            width: 46px;
            height: 46px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid rgba(212, 175, 55, 0.4);
            background: #fff;
        }}
        .job-text-title {{
            font-size: 0.92rem;
            font-weight: 600;
            color: var(--gold-light);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 220px;
        }}
        .job-text-sub {{
            font-size: 0.75rem;
            color: var(--muted);
        }}
        .status-pill {{
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
        }}
        .status-completed {{ background: var(--success-bg); color: #34D399; border: 1px solid rgba(16,185,129,0.3); }}
        .status-processing, .status-uploading, .status-image_processed {{ background: rgba(245,158,11,0.15); color: #FBBF24; border: 1px solid rgba(245,158,11,0.3); }}
        .status-queued {{ background: rgba(163,150,145,0.15); color: #D1D5DB; border: 1px solid rgba(163,150,145,0.3); }}
        .status-failed {{ background: rgba(239,68,68,0.15); color: #F87171; border: 1px solid rgba(239,68,68,0.3); }}

        .progress-track {{
            height: 5px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 9999px;
            overflow: hidden;
            margin-top: 0.4rem;
        }}
        .progress-fill {{
            height: 100%;
            background: linear-gradient(90deg, #D4AF37, #10B981);
            transition: width 0.4s ease;
        }}

        .job-actions {{
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 0.5rem;
            margin-top: 0.75rem;
            padding-top: 0.65rem;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }}
        .action-link {{
            font-size: 0.78rem;
            color: var(--gold-light);
            text-decoration: none;
            padding: 0.35rem 0.85rem;
            border-radius: 6px;
            background: rgba(212, 175, 55, 0.12);
            border: 1px solid rgba(212, 175, 55, 0.35);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }}
        .action-link:hover {{
            background: rgba(212, 175, 55, 0.25);
            border-color: var(--gold);
            transform: translateY(-1px);
        }}

        /* MODAL POPUP */
        .modal-overlay {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.82);
            backdrop-filter: blur(12px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1.5rem;
            animation: fadeIn 0.25s ease forwards;
        }}
        @keyframes fadeIn {{
            from {{ opacity: 0; }}
            to {{ opacity: 1; }}
        }}
        .modal-content {{
            background: #181311;
            border: 1px solid var(--gold);
            border-radius: 20px;
            width: 100%;
            max-width: 620px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.15);
            padding: 2rem;
            position: relative;
            animation: modalScale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }}
        @keyframes modalScale {{
            from {{ transform: scale(0.92) translateY(20px); opacity: 0; }}
            to {{ transform: scale(1) translateY(0); opacity: 1; }}
        }}
        .modal-close {{
            position: absolute;
            top: 1.25rem;
            right: 1.25rem;
            background: none;
            border: none;
            color: var(--muted);
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.2s;
            line-height: 1;
        }}
        .modal-close:hover {{
            color: #fff;
        }}
        .modal-title {{
            font-family: 'Playfair Display', serif;
            font-size: 1.6rem;
            color: var(--gold-light);
            margin-bottom: 0.35rem;
        }}
        .modal-subtitle {{
            font-size: 0.85rem;
            color: var(--muted);
            margin-bottom: 1.5rem;
        }}

        /* Preview inside modal */
        .modal-preview-bar {{
            display: flex;
            align-items: center;
            gap: 1rem;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 0.85rem;
            margin-bottom: 1.5rem;
        }}
        .modal-preview-thumb {{
            width: 56px;
            height: 56px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid var(--border);
        }}
        .modal-preview-info {{
            flex: 1;
        }}
        .modal-preview-name {{
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--cream);
            margin-bottom: 0.25rem;
        }}
        .modal-preview-meta {{
            font-size: 0.75rem;
            color: var(--gold);
        }}

        /* Option Checkbox Cards */
        .options-list {{
            display: flex;
            flex-direction: column;
            gap: 0.85rem;
            margin-bottom: 1.5rem;
        }}
        .option-item {{
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
        }}
        .option-item:hover {{
            background: rgba(212, 175, 55, 0.05);
            border-color: rgba(212, 175, 55, 0.35);
        }}
        .option-item.checked {{
            border-color: var(--gold);
            background: rgba(212, 175, 55, 0.08);
        }}
        .custom-checkbox {{
            width: 22px;
            height: 22px;
            border: 2px solid rgba(212, 175, 55, 0.5);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.4);
            flex-shrink: 0;
            margin-top: 2px;
            transition: all 0.2s ease;
        }}
        .option-item.checked .custom-checkbox {{
            background: var(--gold);
            border-color: var(--gold);
        }}
        .custom-checkbox svg {{
            width: 14px;
            height: 14px;
            stroke: #000;
            stroke-width: 3;
            fill: none;
            display: none;
        }}
        .option-item.checked .custom-checkbox svg {{
            display: block;
        }}
        .option-content {{
            flex: 1;
        }}
        .option-label-row {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
        }}
        .option-label {{
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--cream);
        }}
        .option-badge {{
            font-size: 0.68rem;
            text-transform: uppercase;
            padding: 0.15rem 0.5rem;
            border-radius: 4px;
            background: rgba(212, 175, 55, 0.15);
            color: var(--gold-light);
            font-weight: 600;
        }}
        .option-desc {{
            font-size: 0.8rem;
            color: var(--muted);
            line-height: 1.4;
        }}

        /* Category Select in Modal */
        .category-picker {{
            margin-bottom: 1.75rem;
        }}
        .category-picker label {{
            display: block;
            font-size: 0.82rem;
            color: var(--gold-light);
            margin-bottom: 0.4rem;
            font-weight: 500;
        }}
        .category-select {{
            width: 100%;
            background: #100C0A;
            border: 1px solid var(--border);
            color: var(--cream);
            padding: 0.75rem 1rem;
            border-radius: 10px;
            font-size: 0.9rem;
            outline: none;
            transition: border-color 0.2s;
        }}
        .category-select:focus {{
            border-color: var(--gold);
        }}

        /* Modal Footer Buttons */
        .modal-actions {{
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 1rem;
        }}
        .btn-cancel {{
            background: transparent;
            border: 1px solid var(--border);
            color: var(--muted);
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            font-size: 0.88rem;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .btn-cancel:hover {{
            color: var(--cream);
            border-color: rgba(255, 255, 255, 0.3);
        }}
        .btn-submit {{
            background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%);
            color: #000;
            font-weight: 700;
            padding: 0.8rem 2rem;
            border-radius: 9999px;
            font-size: 0.92rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }}
        .btn-submit:hover {{
            transform: translateY(-2px);
            box-shadow: 0 12px 30px rgba(212, 175, 55, 0.55);
        }}

        /* Quick Links Footer */
        .quick-nav {{
            display: flex;
            gap: 0.85rem;
            flex-wrap: wrap;
            justify-content: center;
            margin: 2.5rem 0 1rem 0;
        }}
        .nav-pill {{
            color: var(--cream);
            text-decoration: none;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border);
            padding: 0.6rem 1.35rem;
            border-radius: 9999px;
            font-size: 0.85rem;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
        }}
        .nav-pill:hover {{
            border-color: var(--gold);
            color: var(--gold-light);
            background: rgba(212, 175, 55, 0.1);
            transform: translateY(-1px);
        }}
        .nav-pill-highlight {{
            border-color: var(--gold);
            color: var(--gold-light);
            background: rgba(212, 175, 55, 0.15);
        }}
    </style>
</head>
<body>
    <header>
        <div class="brand-title">LUSH LAYERS</div>
        <div class="brand-tagline">Artisan Confectionery • Python Image Processing Suite</div>
        <div class="status-badge">
            <span class="pulse-dot"></span>
            <span>Local Engine Active • Port {settings.PORT}</span>
        </div>
    </header>

    <div class="main-container">
        <!-- LEFT: Upload Suite -->
        <div class="suite-card">
            <div class="card-header">
                <div class="card-header-title">
                    <span>✨ Ingest & Studio Suite</span>
                </div>
                <span class="card-header-badge">AI Engine v2.0</span>
            </div>

            <div class="dropzone" id="dropZone" onclick="document.getElementById('fileInput').click()">
                <svg class="dropzone-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <div class="dropzone-title">Drag & drop cake photos here</div>
                <div class="dropzone-desc">Supports JPG, PNG, WEBP, AVIF (Single or Bulk 20+)</div>
                <button type="button" class="dropzone-btn">
                    <span>Choose from Device</span>
                    <span>↗</span>
                </button>
                <input type="file" id="fileInput" multiple accept="image/*" style="display: none;" onchange="handleFilesSelected(this.files)">
            </div>

            <div style="margin-top: 1.5rem; text-align: center; font-size: 0.8rem; color: var(--muted); line-height: 1.6;">
                ⚡ <strong>Automatic Pipeline:</strong> Selection triggers our studio options popup where you can toggle RemBG background removal, WebP compression, auto-crop & AI sensory notes before sending to database.
            </div>
        </div>

        <!-- RIGHT: Queue & Activity -->
        <div class="suite-card">
            <div class="card-header">
                <div class="card-header-title">
                    <span>Queue & Live Activity</span>
                </div>
                <div class="queue-header-actions">
                    <button class="icon-btn" onclick="clearJobHistory()" title="Clear finished jobs">Clear History</button>
                    <button class="icon-btn" onclick="fetchJobs()" title="Refresh now">Refresh ⟳</button>
                </div>
            </div>

            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number" id="statPending">0</div>
                    <div class="stat-name">Pending Review</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="statProcessing">0</div>
                    <div class="stat-name">In Processing</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number" id="statPublished">0</div>
                    <div class="stat-name">Published Live</div>
                </div>
            </div>

            <div class="jobs-container" id="jobsList">
                <p style="color: var(--muted); font-size: 0.85rem; text-align: center; padding: 3rem 1rem;">
                    ✨ No active processing jobs.<br>
                    <span style="font-size: 0.78rem;">Select or drop cake photos on the left to start!</span>
                </p>
            </div>
        </div>
    </div>

    <!-- CONFIG MODAL POPUP -->
    <div class="modal-overlay" id="configModal">
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()">×</button>
            <div class="modal-title">✨ Configure Image Processing</div>
            <div class="modal-subtitle">Customize AI & studio enhancement options before uploading to database</div>

            <div class="modal-preview-bar">
                <img id="modalThumb" src="" class="modal-preview-thumb" alt="Preview">
                <div class="modal-preview-info">
                    <div class="modal-preview-name" id="modalFileName">cake_sample.jpg</div>
                    <div class="modal-preview-meta" id="modalFileMeta">1 file selected • Ready</div>
                </div>
            </div>

            <div class="options-list">
                <!-- Option 1: Compression -->
                <div class="option-item checked" id="optCompressCard" onclick="toggleOption('optCompress')">
                    <div class="custom-checkbox">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <input type="checkbox" id="optCompress" checked style="display: none;">
                    <div class="option-content">
                        <div class="option-label-row">
                            <span class="option-label">Smart WebP Compression</span>
                            <span class="option-badge">Speed Optimizer</span>
                        </div>
                        <div class="option-desc">ছবির ভিজ্যুয়াল কোয়ালিটি ১০০% অক্ষুণ্ণ রেখে ফাইল সাইজ ৮০% কমায় যাতে ওয়েবসাইটে বিদ্যুত গতিতে লোড হয়।</div>
                    </div>
                </div>

                <!-- Option 2: White Studio Background -->
                <div class="option-item checked" id="optWhiteBgCard" onclick="toggleOption('optWhiteBg')">
                    <div class="custom-checkbox">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <input type="checkbox" id="optWhiteBg" checked style="display: none;">
                    <div class="option-content">
                        <div class="option-label-row">
                            <span class="option-label">Pure Studio White Background</span>
                            <span class="option-badge">RemBG Studio</span>
                        </div>
                        <div class="option-desc">AI রিমুভার দিয়ে মূল ব্যাকগ্রাউন্ড মুছে লাক্সারি পিওর হোয়াইট ব্যাকগ্রাউন্ড ও সফট কন্ট্যাক্ট শ্যাডো তৈরি করে।</div>
                    </div>
                </div>

                <!-- Option 3: Auto Focus -->
                <div class="option-item checked" id="optAutoFocusCard" onclick="toggleOption('optAutoFocus')">
                    <div class="custom-checkbox">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <input type="checkbox" id="optAutoFocus" checked style="display: none;">
                    <div class="option-content">
                        <div class="option-label-row">
                            <span class="option-label">Auto Focus & Subject Centering</span>
                            <span class="option-badge">1:1 Framing</span>
                        </div>
                        <div class="option-desc">কেকের প্রধান অংশ নিখুঁতভাবে ডিটেক্ট করে অপ্রয়োজনীয় ফাঁকা জায়গা ট্রিম করে ১:১ স্কয়ার রেশিওতে পারফেক্ট সেন্টারিং করে।</div>
                    </div>
                </div>

                <!-- Option 4: AI Copywriting -->
                <div class="option-item checked" id="optAiCard" onclick="toggleOption('optAi')">
                    <div class="custom-checkbox">
                        <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <input type="checkbox" id="optAi" checked style="display: none;">
                    <div class="option-content">
                        <div class="option-label-row">
                            <span class="option-label">Gemini AI Title & Tasting Notes</span>
                            <span class="option-badge">Sensory AI</span>
                        </div>
                        <div class="option-desc">কেকের টেক্সচার ও ডিজাইন বিশ্লেষণ করে স্বয়ংক্রিয়ভাবে আর্টিসানাল নাম, স্বাদ (Flavour) এবং মিষ্টি কাব্যিক বিবরণ তৈরি করে।</div>
                    </div>
                </div>
            </div>

            <div class="category-picker">
                <label for="categorySelect">Assign Category (ক্যাটাগরি নির্বাচন করুন):</label>
                <select id="categorySelect" class="category-select">
                    <option value="">✨ Auto-Detect Category with AI (স্মার্ট অটো ডিটেক্ট)</option>
                </select>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-cancel" onclick="closeModal()">Cancel / Re-select</button>
                <button type="button" class="btn-submit" id="submitProcessBtn" onclick="submitProcessing()">
                    <span>🚀 Upload & Process to Database</span>
                </button>
            </div>
        </div>
    </div>

    <!-- QUICK LINKS -->
    <div class="quick-nav">
        <a href="http://localhost:3000" class="nav-pill" target="_blank">🌐 Public Website (Port 3000) ↗</a>
        <a href="http://localhost:3000/admin" class="nav-pill" target="_blank">👑 Admin Dashboard ↗</a>
        <a href="http://localhost:3000/admin/cakes/pending" class="nav-pill nav-pill-highlight" target="_blank">⏳ Pending Approval Queue ↗</a>
        <a href="/docs" class="nav-pill" target="_blank">📖 Backend API Docs ↗</a>
    </div>

    <script>
        let selectedFiles = [];
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const configModal = document.getElementById('configModal');
        const submitProcessBtn = document.getElementById('submitProcessBtn');

        // Drag & Drop handlers
        ['dragenter', 'dragover'].forEach(name => {{
            dropZone.addEventListener(name, (e) => {{ e.preventDefault(); dropZone.classList.add('dragover'); }});
        }});
        ['dragleave', 'drop'].forEach(name => {{
            dropZone.addEventListener(name, (e) => {{ e.preventDefault(); dropZone.classList.remove('dragover'); }});
        }});

        dropZone.addEventListener('drop', (e) => {{
            if (e.dataTransfer.files && e.dataTransfer.files.length) {{
                handleFilesSelected(e.dataTransfer.files);
            }}
        }});

        function handleFilesSelected(files) {{
            selectedFiles = Array.from(files);
            if (!selectedFiles.length) return;

            // Open Modal
            openModalWithFiles(selectedFiles);
        }}

        function openModalWithFiles(files) {{
            const first = files[0];
            const nameEl = document.getElementById('modalFileName');
            const metaEl = document.getElementById('modalFileMeta');
            const thumbEl = document.getElementById('modalThumb');

            if (files.length === 1) {{
                nameEl.innerText = first.name;
                const sizeKb = (first.size / 1024).toFixed(1);
                metaEl.innerText = `${{sizeKb}} KB • Ready to configure`;
            }} else {{
                nameEl.innerText = `${{files.length}} Cake Images Selected`;
                const totalMb = (files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2);
                metaEl.innerText = `Bulk Ingestion • ${{totalMb}} MB total`;
            }}

            // Thumbnail preview
            const reader = new FileReader();
            reader.onload = function(e) {{
                thumbEl.src = e.target.result;
            }};
            reader.readAsDataURL(first);

            // Load Categories if not already loaded
            loadCategoriesDropdown();

            configModal.style.display = 'flex';
        }}

        function closeModal() {{
            configModal.style.display = 'none';
            fileInput.value = '';
            selectedFiles = [];
        }}

        function toggleOption(checkboxId) {{
            const cb = document.getElementById(checkboxId);
            cb.checked = !cb.checked;
            const card = document.getElementById(checkboxId + 'Card');
            if (cb.checked) {{
                card.classList.add('checked');
            }} else {{
                card.classList.remove('checked');
            }}
        }}

        async function loadCategoriesDropdown() {{
            const selectEl = document.getElementById('categorySelect');
            if (selectEl.options.length > 1) return; // already populated

            try {{
                const resp = await fetch('/api/categories');
                if (resp.ok) {{
                    const categories = await resp.json();
                    categories.forEach(cat => {{
                        const opt = document.createElement('option');
                        opt.value = cat.id;
                        opt.textContent = `${{cat.name}}`;
                        selectEl.appendChild(opt);
                    }});
                }}
            }} catch (e) {{
                console.error("Categories load note", e);
            }}
        }}

        async function submitProcessing() {{
            if (!selectedFiles.length) return;

            const optCompress = document.getElementById('optCompress').checked;
            const optWhiteBg = document.getElementById('optWhiteBg').checked;
            const optAutoFocus = document.getElementById('optAutoFocus').checked;
            const optAi = document.getElementById('optAi').checked;
            const categoryId = document.getElementById('categorySelect').value;

            submitProcessBtn.disabled = true;
            submitProcessBtn.innerHTML = "<span>Enqueuing Images...</span>";

            const formData = new FormData();
            selectedFiles.forEach(file => formData.append("files", file));
            formData.append("compress", optCompress);
            formData.append("white_background", optWhiteBg);
            formData.append("auto_focus", optAutoFocus);
            formData.append("ai_metadata", optAi);
            if (categoryId) {{
                formData.append("category_id", categoryId);
            }}

            try {{
                const resp = await fetch("/api/upload/bulk", {{
                    method: "POST",
                    body: formData
                }});
                const res = await resp.json();

                closeModal();
                fetchJobs();
            }} catch (err) {{
                alert("Upload failed: " + err.message);
            }} finally {{
                submitProcessBtn.disabled = false;
                submitProcessBtn.innerHTML = "<span>🚀 Upload & Process to Database</span>";
            }}
        }}

        async function clearJobHistory() {{
            if (!confirm("Are you sure you want to clear finished and failed jobs from queue history?")) return;
            try {{
                await fetch("/api/jobs/clear", {{ method: "POST" }});
                fetchJobs();
            }} catch (e) {{
                console.error("Clear error", e);
            }}
        }}

        async function fetchJobs() {{
            try {{
                const [jobsResp, statusResp] = await Promise.all([
                    fetch("/api/jobs?limit=30"),
                    fetch("/api/system/status")
                ]);
                const jobs = await jobsResp.json();
                const status = await statusResp.json();

                if (status.stats) {{
                    document.getElementById('statPending').innerText = status.stats.pending || 0;
                    document.getElementById('statProcessing').innerText = status.stats.processing || 0;
                    document.getElementById('statPublished').innerText = status.stats.published || 0;
                }}

                const listEl = document.getElementById('jobsList');
                if (!jobs.length) {{
                    listEl.innerHTML = `
                        <p style="color: var(--muted); font-size: 0.85rem; text-align: center; padding: 3rem 1rem;">
                            ✨ No active processing jobs.<br>
                            <span style="font-size: 0.78rem;">Select or drop cake photos on the left to start!</span>
                        </p>
                    `;
                    return;
                }}

                listEl.innerHTML = jobs.map(j => `
                    <div class="job-card">
                        <div class="job-card-top">
                            <div class="job-info">
                                ${{j.cake_image_url ? `<img src="${{j.cake_image_url}}" class="job-thumb" />` : ''}}
                                <div>
                                    <div class="job-text-title">${{j.cake_name || j.file_name}}</div>
                                    <div class="job-text-sub">${{j.file_name}} • ${{Math.round(j.original_size_bytes / 1024)}} KB</div>
                                </div>
                            </div>
                            <span class="status-pill status-${{j.status}}">${{j.status.replace('_', ' ')}}</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${{j.progress}}%;"></div>
                        </div>
                        ${{j.error_message ? `<div style="font-size: 0.75rem; color: #F87171; margin-top: 0.4rem;">${{j.error_message}}</div>` : ''}}
                        ${{j.status === 'completed' ? `
                            <div class="job-actions">
                                <a href="http://localhost:3000/admin/cakes/pending" target="_blank" class="action-link" style="color: #F6E7B9; font-weight: 600;">
                                    👉 Review in Admin (Pending) ↗
                                </a>
                                <a href="http://localhost:3000/admin" target="_blank" class="action-link">
                                    👑 Admin Dashboard ↗
                                </a>
                            </div>
                        ` : ''}}
                    </div>
                `).join('');
            }} catch (e) {{
                console.error("Fetch jobs error", e);
            }}
        }}

        // Poll jobs every 2.5 seconds
        setInterval(fetchJobs, 2500);
        fetchJobs();
    </script>
</body>
</html>
    """
    return HTMLResponse(content=html_content)
