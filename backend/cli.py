#!/usr/bin/env python3
"""
🍰 LUSH LAYERS - ARTISAN CONFECTIONERY CLI
Professional Local Image Processing & Catalog Management Tool
"""

import sys
import os
import io
import re
import json
import uuid
import time
import argparse
import asyncio
from pathlib import Path
from typing import Optional, List, Dict, Any

from PIL import Image, ImageOps

import socket
import webbrowser
import subprocess

if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Terminal Colors via colorama
try:
    from colorama import init as colorama_init, Fore, Style, Back
    colorama_init(autoreset=True)
except ImportError:
    class DummyColor:
        def __getattr__(self, name):
            return ""
    Fore = Style = Back = DummyColor()

# Import Backend Modules
from backend.config import settings
from backend.db import db
from backend.processor import processor
from backend.ai_analyzer import ai_analyzer
from backend.storage import storage

import httpx

# =====================================================================
# SERVER & PROCESS MANAGEMENT HELPERS
# =====================================================================

def is_port_in_use(port: int) -> bool:
    """Checks if a TCP port is currently active on localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(('127.0.0.1', port)) == 0

def ensure_backend_running(timeout_sec: int = 15) -> bool:
    """Checks if FastAPI backend is running; starts it if not."""
    if is_port_in_use(settings.PORT):
        return True
    
    info(f"FastAPI Backend is starting on port {settings.PORT}...")
    if sys.platform == "win32":
        subprocess.Popen(
            ["cmd.exe", "/c", "start", "Lush Layers Backend (Port 8000)", sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", str(settings.PORT)],
            cwd=str(settings.PROJECT_ROOT)
        )
    else:
        subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", str(settings.PORT)],
            cwd=str(settings.PROJECT_ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
    start_t = time.time()
    while time.time() - start_t < timeout_sec:
        if is_port_in_use(settings.PORT):
            success(f"Backend server is ONLINE on http://localhost:{settings.PORT}")
            return True
        time.sleep(0.5)
    warning("Backend launch took longer than expected. Please check console window.")
    return False

def ensure_frontend_running(timeout_sec: int = 25) -> bool:
    """Checks if Next.js frontend is running; starts it if not."""
    if is_port_in_use(3000):
        return True
        
    info("Next.js Frontend website is starting on port 3000...")
    frontend_dir = settings.PROJECT_ROOT / "frontend"
    if sys.platform == "win32":
        subprocess.Popen(
            ["cmd.exe", "/c", "start", "Lush Layers Frontend (Port 3000)", "npm.cmd", "run", "dev"],
            cwd=str(frontend_dir)
        )
    else:
        subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=str(frontend_dir),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        
    start_t = time.time()
    while time.time() - start_t < timeout_sec:
        if is_port_in_use(3000):
            success("Frontend website is ONLINE on http://localhost:3000")
            return True
        time.sleep(1)
    warning("Frontend launch took longer than expected. Please check console window.")
    return False

def start_all_servers():
    """Starts both FastAPI backend and Next.js frontend."""
    info("Checking and launching all services...")
    b_ok = ensure_backend_running()
    f_ok = ensure_frontend_running()
    if b_ok and f_ok:
        success("Both Backend (:8000) and Frontend (:3000) are fully operational!")
    else:
        warning("Services initiated. Give them a few seconds to finish compilation.")

def stop_all_servers():
    """Stops servers running on port 8000 and 3000."""
    info("Stopping background servers on ports 8000 and 3000...")
    if sys.platform == "win32":
        cmd = 'Get-NetTCPConnection -LocalPort 8000,3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }'
        subprocess.run(["powershell", "-NoProfile", "-Command", cmd], capture_output=True)
    success("Servers stopped.")

def open_url(url: str):
    """Opens specified URL in default browser."""
    info(f"Opening browser: {url}")
    try:
        webbrowser.open(url)
    except Exception as e:
        warning(f"Could not open browser automatically: {e}. Please open {url} manually.")

# =====================================================================
# UI HELPER FUNCTIONS
# =====================================================================

def banner():
    b_ok = is_port_in_use(settings.PORT)
    f_ok = is_port_in_use(3000)
    
    b_badge = Fore.GREEN + "[ONLINE :8000]" if b_ok else Fore.RED + "[OFFLINE :8000]"
    f_badge = Fore.GREEN + "[ONLINE :3000]" if f_ok else Fore.RED + "[OFFLINE :3000]"
    
    print(Fore.CYAN + Style.BRIGHT + """
+----------------------------------------------------------------------+
|            * LUSH LAYERS - ALL-IN-ONE MASTER CONTROL *               |
|       Full Stack Bakery System: Python Tools + Website + Admin       |
+----------------------------------------------------------------------+""" + Style.RESET_ALL)
    print(f"  Backend: {b_badge}{Style.RESET_ALL}   Frontend: {f_badge}{Style.RESET_ALL}\n")

def info(msg: str):
    print(Fore.BLUE + Style.BRIGHT + " [INFO] " + Style.RESET_ALL + msg)

def success(msg: str):
    print(Fore.GREEN + Style.BRIGHT + " [SUCCESS] " + Style.RESET_ALL + msg)

def warning(msg: str):
    print(Fore.YELLOW + Style.BRIGHT + " [WARNING] " + Style.RESET_ALL + msg)

def error(msg: str):
    print(Fore.RED + Style.BRIGHT + " [ERROR] " + Style.RESET_ALL + msg)

def step(num: int, total: int, msg: str):
    print(Fore.MAGENTA + Style.BRIGHT + f" [{num}/{total}] " + Style.RESET_ALL + msg)

def clean_input_path(raw_path: str) -> Path:
    """Cleans Windows drag-and-drop quotes, spaces, and resolves to absolute Path."""
    p_str = raw_path.strip().strip('"').strip("'").strip()
    return Path(p_str).expanduser().resolve()

# =====================================================================
# REVALIDATION HELPER
# =====================================================================

def revalidate_frontend(paths: Optional[List[str]] = None) -> bool:
    """Triggers Next.js on-demand ISR revalidation."""
    if not paths:
        paths = ["/", "/cakes", "/reviews"]
    
    url = f"{settings.NEXTJS_URL}/api/revalidate"
    payload_secret = settings.REVALIDATE_SECRET
    
    try:
        with httpx.Client(timeout=4.0) as client:
            revalidated_any = False
            for p in paths:
                try:
                    resp = client.post(url, json={"path": p, "secret": payload_secret})
                    if resp.status_code == 200:
                        revalidated_any = True
                except Exception:
                    pass
            return revalidated_any
    except Exception as e:
        return False

# =====================================================================
# CATEGORY RESOLVER
# =====================================================================

def resolve_category(cat_input: Optional[str]) -> Optional[Dict[str, Any]]:
    """Resolves category by ID, slug, or case-insensitive name."""
    if not cat_input:
        return None
    
    categories = db.get_categories(active_only=False)
    cat_clean = cat_input.strip().lower()
    
    # Check exact ID match
    for c in categories:
        if c["id"].lower() == cat_clean:
            return c
            
    # Check exact slug match
    for c in categories:
        if c["slug"].lower() == cat_clean:
            return c
            
    # Check exact name match
    for c in categories:
        if c["name"].lower() == cat_clean:
            return c
            
    # Partial name match
    for c in categories:
        if cat_clean in c["name"].lower() or c["name"].lower() in cat_clean:
            return c
            
    return None

# =====================================================================
# CORE PROCESSING PIPELINE
# =====================================================================

def process_single_image(
    image_path: Path,
    name: Optional[str] = None,
    category_identifier: Optional[str] = None,
    flavour: Optional[str] = None,
    description: Optional[str] = None,
    sizes: Optional[List[str]] = None,
    publish: bool = False,
    use_ai: bool = True,
    remove_bg: bool = True,
    interactive_verbose: bool = True
) -> Dict[str, Any]:
    """
    Executes the full professional cake ingestion pipeline:
    1. Validate image format & integrity
    2. Remove background & composite onto 1200x1200 studio white canvas with soft drop shadow
    3. Generate 1200x1200 WebP master & 600x600 WebP thumbnail
    4. Run Google Gemini AI Vision sensory analysis (or Computer Vision fallback)
    5. Upload to local media storage and/or Cloudinary CDN
    6. Register cake in SQLite and sync to Supabase PostgreSQL
    7. Optionally publish and trigger Next.js cache revalidation
    """
    settings.ensure_directories()
    
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found at path: {image_path}")
        
    ext = image_path.suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}")
        
    cake_id = str(uuid.uuid4())
    job_base_name = f"cake_{cake_id[:8]}"
    
    total_steps = 5 if publish else 4
    current_step = 1

    # --- STEP 1: VALIDATION ---
    if interactive_verbose:
        step(current_step, total_steps, f"Validating source photo: {Fore.YELLOW}{image_path.name}{Style.RESET_ALL}")
    current_step += 1
    
    try:
        with Image.open(image_path) as test_img:
            test_img.verify()
    except Exception as e:
        raise ValueError(f"Corrupted or invalid image: {e}")

    # Check for potential duplicates before heavy processing via raw byte SHA-256
    raw_hash = processor.compute_sha256(image_path)
    duplicate_info = db.find_duplicate_cake(raw_hash=raw_hash, threshold_distance=8)
    is_duplicate = False
    duplicate_matched = None
    duplicate_score = 0.0
    duplicate_reason = None
    duplicate_of_id = None
    duplicate_of_disp = None

    if duplicate_info:
        is_duplicate = True
        duplicate_matched = duplicate_info["matched_cake"]
        duplicate_score = duplicate_info["similarity"]
        duplicate_reason = duplicate_info["reason"]
        duplicate_of_id = duplicate_matched.get("id")
        duplicate_of_disp = duplicate_matched.get("display_id")

        if interactive_verbose:
            print()
            print(Fore.YELLOW + Style.BRIGHT + "   ⚠️  [SUSPECTED DUPLICATE CAKE DETECTED - 100% RAW FILE MATCH]" + Style.RESET_ALL)
            print(f"      {Fore.WHITE}Source Photo:    {Fore.YELLOW}{image_path.name}{Style.RESET_ALL}")
            print(f"      {Fore.WHITE}Matches Cake:    {Fore.CYAN}#{duplicate_of_disp} - {duplicate_matched.get('name')}{Style.RESET_ALL}")
            print(f"      {Fore.WHITE}Match Details:   {Fore.MAGENTA}{duplicate_reason}{Style.RESET_ALL}")
            print(f"      {Fore.GREEN}ℹ️  Continuing upload (no auto-skip). Flagged in Admin Panel -> Duplicate Review.{Style.RESET_ALL}")
            print()

    # --- STEP 2: IMAGE PROCESSING (STUDIO COMPOSITING) ---
    if interactive_verbose:
        bg_msg = "Background removal + Studio contact shadow" if remove_bg else "Center-framed on studio canvas"
        step(current_step, total_steps, f"Image Processing ({bg_msg}) -> Master & Thumbnail WebP")
    current_step += 1
    
    with Image.open(image_path) as img:
        img = ImageOps.exif_transpose(img)
        
        if remove_bg:
            # Full RemBG background cutout + soft ambient drop shadow
            cutout = processor.remove_background(img)
            master_rgb = processor.composite_on_white_studio(cutout, canvas_size=1200)
        else:
            # Preserve original image background, pad & frame proportionally to 1200x1200 square
            img_rgba = img.convert("RGBA")
            cw, ch = img_rgba.size
            target_size = int(1200 * 0.90)
            scale = min(target_size / cw, target_size / ch)
            new_w, new_h = int(cw * scale), int(ch * scale)
            resized = img_rgba.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            canvas = Image.new("RGBA", (1200, 1200), (255, 255, 255, 255))
            pos_x = (1200 - new_w) // 2
            pos_y = (1200 - new_h) // 2
            canvas.paste(resized, (pos_x, pos_y), resized)
            master_rgb = canvas.convert("RGB")

    # Generate thumbnail
    thumb_rgb = master_rgb.resize((600, 600), Image.Resampling.LANCZOS)
    
    # Save to local media storage
    master_path = settings.PROCESSED_DIR / f"{job_base_name}.webp"
    thumb_path = settings.THUMBNAIL_DIR / f"{job_base_name}_thumb.webp"
    
    master_rgb.save(master_path, format="WEBP", quality=88, method=6)
    thumb_rgb.save(thumb_path, format="WEBP", quality=80, method=6)
    
    # Fallback to local media URLs
    image_url = f"/media/processed/{master_path.name}"
    cloudinary_id = None

    # Upload to Cloudinary CDN if credentials exist
    if storage.is_configured:
        try:
            cloud_res = storage.upload_image(master_path, public_id_base=job_base_name)
            if cloud_res and cloud_res.get("secure_url"):
                image_url = cloud_res["secure_url"]
                cloudinary_id = cloud_res.get("public_id")
        except Exception as e:
            if interactive_verbose:
                warning(f"Cloudinary upload note: {e}. Utilizing fast local media URL.")

    # Fetch categories for resolution
    all_categories = db.get_categories(active_only=True)
    cat_names = [c["name"] for c in all_categories]

    # --- STEP 3: AI SENSORY ANALYSIS ---
    ai_result = {}
    if use_ai:
        if interactive_verbose:
            step(current_step, total_steps, "Running Google Gemini Vision AI (Sensory analysis & storytelling)...")
        current_step += 1
        
        try:
            ai_result = ai_analyzer.analyze_cake_image(
                image_input=master_path,
                valid_categories=cat_names
            )
        except Exception as e:
            if interactive_verbose:
                warning(f"AI sensory analysis note: {e}")
            ai_result = {}
            
    # Resolve values with priority: User Explicit Arg > AI Result > Clean Filename Fallback
    final_name = name or ai_result.get("name")
    if not final_name or final_name.strip() == "":
        clean_file_title = image_path.stem.replace("_", " ").replace("-", " ").title()
        final_name = clean_file_title if not clean_file_title.lower().startswith("img") else f"Artisan Confection #{cake_id[:6].upper()}"
        
    final_flavour = flavour or ai_result.get("flavour") or "Chef's Signature Vanilla & Cocoa"
    final_desc = description or ai_result.get("description") or "An exquisite handcrafted luxury confection prepared with pure artisanal ingredients."
    
    # Category resolution
    resolved_category = None
    if category_identifier:
        resolved_category = resolve_category(category_identifier)
    elif ai_result.get("category"):
        resolved_category = resolve_category(ai_result["category"])
        
    if not resolved_category and all_categories:
        resolved_category = all_categories[0] # Fallback to first category if unassigned
        
    final_category_id = resolved_category["id"] if resolved_category else None
    final_sizes = sizes or ai_result.get("available_sizes") or ["0.5 kg (Small)", "1.0 kg (Medium)", "2.0 kg (Large)"]
    
    # --- STEP 4: DATABASE REGISTRATION ---
    if interactive_verbose:
        step(current_step, total_steps, "Writing record to SQLite & replicating to Supabase PostgreSQL...")
    current_step += 1
    
    # Compute compound studio master fingerprints
    master_fingerprints = processor.compute_compound_fingerprints(master_path)
    file_hash = master_fingerprints.get("sha256") or raw_hash
    phash = master_fingerprints.get("phash")
    color_hist = master_fingerprints.get("color_hist")

    if not is_duplicate:
        visual_dup_info = db.find_duplicate_cake(
            file_hash=file_hash,
            phash=phash,
            color_hist=color_hist,
            threshold_distance=8
        )
        if visual_dup_info:
            is_duplicate = True
            duplicate_matched = visual_dup_info["matched_cake"]
            duplicate_score = visual_dup_info["similarity"]
            duplicate_reason = visual_dup_info["reason"]
            duplicate_of_id = duplicate_matched.get("id")
            duplicate_of_disp = duplicate_matched.get("display_id")

            if interactive_verbose:
                print()
                print(Fore.YELLOW + Style.BRIGHT + f"   ⚠️  [SUSPECTED DUPLICATE CAKE DETECTED - {duplicate_score}% VISUAL MATCH]" + Style.RESET_ALL)
                print(f"      {Fore.WHITE}Processed Photo: {Fore.YELLOW}{master_path.name}{Style.RESET_ALL}")
                print(f"      {Fore.WHITE}Matches Cake:    {Fore.CYAN}#{duplicate_of_disp} - {duplicate_matched.get('name')}{Style.RESET_ALL}")
                print(f"      {Fore.WHITE}Match Details:   {Fore.MAGENTA}{duplicate_reason}{Style.RESET_ALL}")
                print(f"      {Fore.GREEN}ℹ️  Continuing upload (no auto-skip). Flagged in Admin Panel -> Duplicate Review.{Style.RESET_ALL}")
                print()

    cake_record = {
        "id": cake_id,
        "name": final_name,
        "flavour": final_flavour,
        "category_id": final_category_id,
        "description": final_desc,
        "available_sizes": final_sizes,
        "image_url": image_url,
        "cloudinary_public_id": cloudinary_id,
        "status": "duplicate" if is_duplicate else "pending",
        "raw_hash": raw_hash,
        "file_hash": file_hash,
        "phash": phash,
        "color_hist": color_hist,
        "is_duplicate": 1 if is_duplicate else 0,
        "duplicate_of_id": duplicate_of_id,
        "duplicate_of_display_id": duplicate_of_disp,
        "duplicate_score": duplicate_score,
        "duplicate_reason": duplicate_reason,
        "ai_metadata": {
            "ai_status": "generated" if ai_result else "manual",
            "source_file": image_path.name,
            "tags": ai_result.get("tags", []),
            "local_master_url": f"/media/processed/{master_path.name}",
            "local_thumb_url": f"/media/thumbnails/{thumb_path.name}",
            "duplicate_detected": is_duplicate,
            "duplicate_warning": duplicate_reason
        }
    }
    
    created_cake = db.create_cake(cake_record)
    
    # --- STEP 5: OPTIONAL IMMEDIATE PUBLISH ---
    if publish:
        if is_duplicate:
            if interactive_verbose:
                warning("Suspected duplicate was NOT auto-published. Please review in Admin Panel -> Duplicate Review.")
        else:
            if interactive_verbose:
                step(current_step, total_steps, "Publishing to live catalog & triggering Next.js cache revalidation...")
            db.publish_cake(cake_id)
            created_cake["status"] = "published"
            reval_paths = ["/", "/cakes", f"/cakes/{created_cake['slug']}"]
            if resolved_category:
                reval_paths.append(f"/category/{resolved_category['slug']}")
            revalidated = revalidate_frontend(reval_paths)
            if interactive_verbose and revalidated:
                success("Next.js storefront ISR cache revalidated successfully.")
            
    return created_cake

# =====================================================================
# INTERACTIVE WIZARD
# =====================================================================

def interactive_wizard():
    while True:
        banner()
        print(Fore.YELLOW + Style.BRIGHT + "=== [SERVER & BROWSER LAUNCHERS] ===" + Style.RESET_ALL)
        print("  1. " + Fore.CYAN + "🎨 Open Python Image Processing Web Tools (Browser: http://localhost:8000/portal)" + Style.RESET_ALL)
        print("  2. " + Fore.GREEN + "🌐 Open Website Storefront (Browser: http://localhost:3000)" + Style.RESET_ALL)
        print("  3. " + Fore.MAGENTA + "👑 Open Admin Dashboard (Browser: http://localhost:3000/admin)" + Style.RESET_ALL)
        print("  4. " + Fore.MAGENTA + "⏳ Open Pending Approval Queue (Browser: http://localhost:3000/admin/cakes/pending)" + Style.RESET_ALL)
        print("  5. " + Fore.BLUE + "🚀 Start Both Servers (Backend + Frontend)" + Style.RESET_ALL)
        print("  6. " + Fore.RED + "🛑 Stop All Servers" + Style.RESET_ALL)
        print()
        print(Fore.YELLOW + Style.BRIGHT + "=== [IMAGE PROCESSING & CATALOG TOOLS] ===" + Style.RESET_ALL)
        print("  7. " + Fore.CYAN + "🍰 Process Single Cake Photo (Terminal Drag & Drop Wizard)" + Style.RESET_ALL)
        print("  8. " + Fore.CYAN + "📁 Bulk Process Photo Folder (Terminal Batch)" + Style.RESET_ALL)
        print("  9. " + Fore.WHITE + "📋 View All Cakes in Catalog (Table)" + Style.RESET_ALL)
        print(" 10. " + Fore.WHITE + "🏷️  View Available Categories" + Style.RESET_ALL)
        print(" 11. " + Fore.GREEN + "🚀 Publish a Staged Cake by ID / Slug" + Style.RESET_ALL)
        print(" 12. " + Fore.YELLOW + "⏸️  Unpublish a Cake (Move back to Staged)" + Style.RESET_ALL)
        print(" 13. " + Fore.RED + "🗑️  Delete a Cake Record" + Style.RESET_ALL)
        print(" 14. " + Fore.BLUE + "🔄 Refresh Website Cache (Revalidate)" + Style.RESET_ALL)
        print(" 15. " + Fore.WHITE + "🩺 System Health Diagnostics" + Style.RESET_ALL)
        print(" 16. " + Fore.MAGENTA + "🔍 Run Multi-Tier Duplicate Fingerprint Backfill" + Style.RESET_ALL)
        print("  0. " + Fore.WHITE + "❌ Exit" + Style.RESET_ALL)
        print()
        
        choice = input(Fore.YELLOW + "Enter choice [0-16]: " + Style.RESET_ALL).strip()
        
        if choice == "0":
            print(Fore.CYAN + "\nExiting Lush Layers Master Control. Happy Baking!\n")
            sys.exit(0)
            
        elif choice == "1":
            ensure_backend_running()
            open_url(f"http://localhost:{settings.PORT}/portal")
            print()
            success("Python Image Processing Web Tools is now open in your browser!")
            print(Fore.WHITE + "  • Drag & drop photos into the portal to automatically process with AI & studio framing.")
            print(Fore.WHITE + "  • When processed, click 'Review & Approve' to finalize in the Admin Panel.\n")
            input(Fore.WHITE + "Press Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "2":
            ensure_backend_running()
            ensure_frontend_running()
            open_url("http://localhost:3000")
            print()
            success("Public Website is now open at http://localhost:3000\n")
            input(Fore.WHITE + "Press Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "3":
            ensure_backend_running()
            ensure_frontend_running()
            open_url("http://localhost:3000/admin")
            print()
            success("Admin Dashboard is now open at http://localhost:3000/admin\n")
            input(Fore.WHITE + "Press Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "4":
            ensure_backend_running()
            ensure_frontend_running()
            open_url("http://localhost:3000/admin/cakes/pending")
            print()
            success("Pending Approval Queue is now open at http://localhost:3000/admin/cakes/pending\n")
            input(Fore.WHITE + "Press Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "5":
            start_all_servers()
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "6":
            stop_all_servers()
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "7":
            action_interactive_add()
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "8":
            action_interactive_bulk()
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "9":
            action_list_cakes()
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "10":
            action_list_categories()
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "11":
            cid = input(Fore.YELLOW + "Enter Cake ID or Slug to PUBLISH: " + Style.RESET_ALL).strip()
            if cid:
                action_publish(cid)
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "12":
            cid = input(Fore.YELLOW + "Enter Cake ID or Slug to UNPUBLISH: " + Style.RESET_ALL).strip()
            if cid:
                action_unpublish(cid)
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "13":
            cid = input(Fore.RED + "Enter Cake ID to DELETE: " + Style.RESET_ALL).strip()
            if cid:
                confirm = input(Fore.RED + f"Are you sure you want to permanently delete '{cid}'? [y/N]: " + Style.RESET_ALL).strip().lower()
                if confirm == "y":
                    action_delete(cid)
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "14":
            action_revalidate()
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "15":
            action_diagnostics()
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        elif choice == "16":
            action_backfill_fingerprints()
            input(Fore.WHITE + "\nPress Enter to return to main menu..." + Style.RESET_ALL)
            
        else:
            warning("Invalid choice. Please enter a number from 0 to 16.")
            time.sleep(1)

def action_interactive_add():
    print(Fore.CYAN + Style.BRIGHT + "\n--- 🍰 ADD SINGLE CAKE IMAGE WIZARD ---" + Style.RESET_ALL)
    raw_path = input(Fore.YELLOW + "Drag & drop image file here (or type full path): " + Style.RESET_ALL).strip()
    if not raw_path:
        error("No path provided.")
        return
        
    img_path = clean_input_path(raw_path)
    if not img_path.exists():
        error(f"File not found: {img_path}")
        return
        
    # AI Analysis prompt
    ai_choice = input(Fore.YELLOW + "Enable Google Gemini AI sensory copywriting? [Y/n]: " + Style.RESET_ALL).strip().lower()
    use_ai = ai_choice != "n"
    
    # Background removal prompt
    bg_choice = input(Fore.YELLOW + "Remove background & composite on studio white canvas? [Y/n]: " + Style.RESET_ALL).strip().lower()
    remove_bg = bg_choice != "n"
    
    # Category selection
    cats = db.get_categories(active_only=True)
    print("\nSelect Category:")
    print("  0. Auto-detect via AI")
    for idx, c in enumerate(cats, 1):
        print(f"  {idx}. {c['name']}")
    cat_sel = input(Fore.YELLOW + f"Choose category [0-{len(cats)}]: " + Style.RESET_ALL).strip()
    
    selected_cat_id = None
    if cat_sel.isdigit() and 1 <= int(cat_sel) <= len(cats):
        selected_cat_id = cats[int(cat_sel) - 1]["id"]
        info(f"Selected category: {cats[int(cat_sel) - 1]['name']}")
    else:
        info("Category will be auto-detected by AI.")
        
    # Optional Manual Overrides
    print("\n" + Fore.WHITE + Style.DIM + "(Optional) Press Enter on any prompt below to let AI automatically generate:" + Style.RESET_ALL)
    custom_name = input(Fore.YELLOW + "Cake Title (or Enter for AI): " + Style.RESET_ALL).strip() or None
    custom_flavour = input(Fore.YELLOW + "Flavour Profile (or Enter for AI): " + Style.RESET_ALL).strip() or None
    custom_desc = input(Fore.YELLOW + "Artisan Description (or Enter for AI): " + Style.RESET_ALL).strip() or None
    
    pub_choice = input(Fore.YELLOW + "\nPublish immediately to LIVE storefront? [y/N] (Default: Stage as pending review): " + Style.RESET_ALL).strip().lower()
    publish_now = pub_choice == "y"
    
    print("\n" + Fore.CYAN + "Processing cake image... Please wait.\n" + Style.RESET_ALL)
    start_time = time.time()
    
    try:
        result = process_single_image(
            image_path=img_path,
            name=custom_name,
            category_identifier=selected_cat_id,
            flavour=custom_flavour,
            description=custom_desc,
            publish=publish_now,
            use_ai=use_ai,
            remove_bg=remove_bg,
            interactive_verbose=True
        )
        
        elapsed = time.time() - start_time
        print("\n" + Fore.GREEN + Style.BRIGHT + "==========================================================")
        print(f"  🎉 CAKE PROCESSED & SAVED IN {elapsed:.2f}s!")
        print("==========================================================" + Style.RESET_ALL)
        print(f"  {Fore.CYAN}ID:{Style.RESET_ALL}          {result['id']}")
        print(f"  {Fore.CYAN}Title:{Style.RESET_ALL}       {Fore.WHITE}{Style.BRIGHT}{result['name']}{Style.RESET_ALL}")
        print(f"  {Fore.CYAN}Slug:{Style.RESET_ALL}        {result['slug']}")
        print(f"  {Fore.CYAN}Category:{Style.RESET_ALL}    {result.get('category_name') or 'Assigned'}")
        print(f"  {Fore.CYAN}Flavour:{Style.RESET_ALL}     {result['flavour']}")
        print(f"  {Fore.CYAN}Status:{Style.RESET_ALL}      " + (Fore.GREEN if result['status'] == 'published' else Fore.YELLOW) + f"{result['status'].upper()}" + Style.RESET_ALL)
        print(f"  {Fore.CYAN}Image URL:{Style.RESET_ALL}   {result['image_url']}")
        print(f"  {Fore.CYAN}Description:{Style.RESET_ALL} {result['description']}")
        print(Fore.GREEN + Style.BRIGHT + "==========================================================\n" + Style.RESET_ALL)
        
        if result['status'] == 'pending':
            info("Cake staged in PENDING status. You can review and approve it from the Admin Portal:")
            print(f"  👉 {Fore.CYAN}http://localhost:3000/admin/cakes/pending{Style.RESET_ALL}")
        else:
            success("Cake is LIVE on the storefront:")
            print(f"  👉 {Fore.CYAN}http://localhost:3000/cakes/{result['slug']}{Style.RESET_ALL}")

    except Exception as e:
        error(f"Processing failed: {e}")

def action_interactive_bulk():
    print(Fore.CYAN + Style.BRIGHT + "\n--- 📁 BULK IMAGE FOLDER PROCESSOR ---" + Style.RESET_ALL)
    raw_folder = input(Fore.YELLOW + "Enter directory path containing cake images: " + Style.RESET_ALL).strip()
    if not raw_folder:
        error("No folder path provided.")
        return
        
    folder_path = clean_input_path(raw_folder)
    if not folder_path.exists() or not folder_path.is_dir():
        error(f"Folder not found or not a directory: {folder_path}")
        return
        
    image_files = [f for f in folder_path.iterdir() if f.is_file() and f.suffix.lower() in settings.ALLOWED_EXTENSIONS]
    if not image_files:
        warning(f"No supported cake images found in {folder_path}. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}")
        return
        
    info(f"Found {len(image_files)} cake images in directory.")
    
    pub_choice = input(Fore.YELLOW + "Publish all immediately to LIVE storefront? [y/N] (Default: Stage as pending): " + Style.RESET_ALL).strip().lower()
    publish_now = pub_choice == "y"
    
    ai_choice = input(Fore.YELLOW + "Run AI sensory copywriting for all images? [Y/n]: " + Style.RESET_ALL).strip().lower()
    use_ai = ai_choice != "n"
    
    confirm = input(Fore.GREEN + f"Ready to process {len(image_files)} images? [Y/n]: " + Style.RESET_ALL).strip().lower()
    if confirm == "n":
        return
        
    print()
    processed_count = 0
    failed_count = 0
    
    for idx, img_file in enumerate(image_files, 1):
        print(Fore.CYAN + f"[{idx}/{len(image_files)}] Processing: {img_file.name}..." + Style.RESET_ALL)
        try:
            res = process_single_image(
                image_path=img_file,
                publish=publish_now,
                use_ai=use_ai,
                remove_bg=True,
                interactive_verbose=False
            )
            success(f" -> Added: '{res['name']}' ({res['status'].upper()})")
            processed_count += 1
        except Exception as e:
            error(f" -> Failed {img_file.name}: {e}")
            failed_count += 1
            
    if publish_now:
        revalidate_frontend()
        
    print("\n" + Fore.GREEN + Style.BRIGHT + f"Bulk Processing Complete: {processed_count} added, {failed_count} failed." + Style.RESET_ALL)

# =====================================================================
# SUBCOMMAND HANDLERS
# =====================================================================

def action_list_cakes(status: Optional[str] = None, limit: int = 50):
    banner()
    cakes = db.get_cakes(status=status, limit=limit)
    if not cakes:
        info("No cakes found matching criteria in catalog.")
        return
        
    print(Fore.WHITE + Style.BRIGHT + f"\n{'ID':<38} {'STATUS':<11} {'NAME':<32} {'FLAVOUR':<25} {'CATEGORY'}")
    print("-" * 120 + Style.RESET_ALL)
    
    for c in cakes:
        st = c.get("status", "pending").upper()
        color = Fore.GREEN if st == "PUBLISHED" else (Fore.BLUE if st == "APPROVED" else Fore.YELLOW)
        cat = c.get("category_name") or "Unassigned"
        flv = (c.get("flavour") or "Standard")[:24]
        nm = c.get("name", "Untitled")[:30]
        cid = c.get("id", "")
        print(f"{cid:<38} {color}{st:<11}{Style.RESET_ALL} {nm:<32} {flv:<25} {cat}")
        
    print(Fore.WHITE + Style.DIM + f"\nTotal: {len(cakes)} cakes listed." + Style.RESET_ALL)

def action_list_categories():
    banner()
    cats = db.get_categories(active_only=False)
    print(Fore.WHITE + Style.BRIGHT + f"\n{'ID':<38} {'SORT':<6} {'NAME':<28} {'SLUG':<26} {'ACTIVE'}")
    print("-" * 105 + Style.RESET_ALL)
    
    for c in cats:
        act = Fore.GREEN + "YES" + Style.RESET_ALL if c.get("active") else Fore.RED + "NO" + Style.RESET_ALL
        print(f"{c['id']:<38} {c.get('sort_order', 0):<6} {c['name']:<28} {c['slug']:<26} {act}")

def action_publish(identifier: str):
    cake = db.get_cake_by_id(identifier) or db.get_cake_by_slug(identifier)
    if not cake:
        error(f"Cake with ID or slug '{identifier}' not found.")
        return
        
    try:
        updated = db.publish_cake(cake["id"])
        success(f"Cake '{updated['name']}' published successfully!")
        revalidate_frontend(["/", "/cakes", f"/cakes/{updated['slug']}"])
        print(f"  👉 Live link: {Fore.CYAN}http://localhost:3000/cakes/{updated['slug']}{Style.RESET_ALL}")
    except Exception as e:
        error(f"Could not publish cake: {e}")

def action_unpublish(identifier: str):
    cake = db.get_cake_by_id(identifier) or db.get_cake_by_slug(identifier)
    if not cake:
        error(f"Cake with ID or slug '{identifier}' not found.")
        return
        
    try:
        updated = db.update_cake(cake["id"], {"status": "approved"})
        success(f"Cake '{updated['name']}' moved back to staged/approved status.")
        revalidate_frontend(["/", "/cakes", f"/cakes/{updated['slug']}"])
    except Exception as e:
        error(f"Could not unpublish cake: {e}")

def action_delete(cake_id: str):
    cake = db.get_cake_by_id(cake_id)
    if not cake:
        error(f"Cake with ID '{cake_id}' not found.")
        return
        
    try:
        deleted = db.delete_cake(cake_id)
        if deleted:
            success(f"Cake '{cake['name']}' deleted from SQLite and Supabase PostgreSQL.")
            revalidate_frontend(["/", "/cakes"])
        else:
            error("Failed to delete cake record.")
    except Exception as e:
        error(f"Delete operation failed: {e}")

def action_backfill_fingerprints():
    banner()
    print(Fore.MAGENTA + Style.BRIGHT + "\n=== 🔍 MULTI-TIER DUPLICATE FINGERPRINT BACKFILL ===" + Style.RESET_ALL)
    info("Scanning all cakes in SQLite & Supabase PostgreSQL...")
    info("Computing Raw SHA-256, Studio DCT pHash, and HSV Color Histograms...")
    res = db.backfill_cake_fingerprints()
    print()
    success(f"Backfill Complete! Processed {res['total_cakes']} cakes, updated {res['updated']} cakes with compound fingerprints.")
    for d in res.get("details", []):
        print(f"  • #{d['display_id']} {Fore.WHITE}{d['name']}{Style.RESET_ALL}: raw={d['raw_hash']}... pHash={d['phash']}")
    print()

def action_revalidate():
    info("Triggering on-demand Next.js ISR cache revalidation...")
    ok = revalidate_frontend(["/", "/cakes", "/reviews"])
    if ok:
        success("Frontend cache revalidated successfully. Live pages now display freshest catalog data!")
    else:
        warning("Revalidation ping sent. Note: If Next.js dev server is starting, it will refresh automatically.")

def action_diagnostics():
    banner()
    print(Fore.WHITE + Style.BRIGHT + "\n=== LUSH LAYERS SYSTEM & CONNECTIVITY DIAGNOSTICS ===" + Style.RESET_ALL)
    
    # 1. SQLite Check
    db_exists = settings.DB_PATH.exists()
    status_sqlite = Fore.GREEN + f"OK ({settings.DB_PATH})" if db_exists else Fore.RED + "MISSING"
    print(f"  • SQLite Database:          {status_sqlite}{Style.RESET_ALL}")
    
    # 2. Supabase PostgreSQL Pooler Check
    try:
        import psycopg2
        conn = psycopg2.connect(
            host=settings.SUPABASE_HOST,
            port=settings.SUPABASE_PORT,
            user=settings.SUPABASE_USER,
            password=settings.SUPABASE_PASSWORD,
            dbname=settings.SUPABASE_DB,
            connect_timeout=3
        )
        conn.close()
        pg_status = Fore.GREEN + f"CONNECTED ({settings.SUPABASE_HOST})"
    except Exception as e:
        pg_status = Fore.YELLOW + f"NOTE ({e})"
    print(f"  • Supabase Direct Pooler:   {pg_status}{Style.RESET_ALL}")
    
    # 3. Cloudinary Check
    if storage.is_cloudinary_configured:
        c_status = Fore.GREEN + f"ACTIVE (Cloud: {settings.CLOUDINARY_CLOUD_NAME})"
    else:
        c_status = Fore.YELLOW + "STANDBY (Using High-Speed Local LAN Media Server)"
    print(f"  • Cloudinary CDN:           {c_status}{Style.RESET_ALL}")
    
    # 4. Gemini AI Key
    if settings.GEMINI_API_KEY:
        gemini_status = Fore.GREEN + f"CONFIGURED ({settings.GEMINI_API_KEY[:6]}...)"
    else:
        gemini_status = Fore.YELLOW + "NOT SET (Fallback to Intelligent Computer Vision)"
    print(f"  • Gemini AI Vision:         {gemini_status}{Style.RESET_ALL}")
    
    # 5. rembg Background Engine
    from backend.processor import REMBG_AVAILABLE
    rembg_status = Fore.GREEN + "ACTIVE (rembg u2netp ready)" if REMBG_AVAILABLE else Fore.YELLOW + "Luminosity Alpha Matting"
    print(f"  • Background Removal:       {rembg_status}{Style.RESET_ALL}")
    
    # 6. Next.js Revalidation Server
    try:
        with httpx.Client(timeout=2.0) as client:
            resp = client.get(settings.NEXTJS_URL)
            next_status = Fore.GREEN + f"ONLINE ({settings.NEXTJS_URL} - Status {resp.status_code})"
    except Exception:
        next_status = Fore.YELLOW + f"OFFLINE or STARTING ({settings.NEXTJS_URL})"
    print(f"  • Next.js Frontend Server:  {next_status}{Style.RESET_ALL}")
    
    # 7. Media Directories
    print(f"  • Processed Media Dir:      {Fore.CYAN}{settings.PROCESSED_DIR}{Style.RESET_ALL}")
    print(f"  • Thumbnails Dir:           {Fore.CYAN}{settings.THUMBNAIL_DIR}{Style.RESET_ALL}")
    print()

# =====================================================================
# CLI ARGUMENT PARSER (MAIN ENTRY)
# =====================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Lush Layers - Artisan Confectionery CLI Image Processor",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Examples:
  python -m backend.cli                          # Launch Interactive Menu
  python -m backend.cli add photo.jpg --publish  # Add cake & publish live
  python -m backend.cli bulk ./my_cakes/         # Bulk process photo directory
  python -m backend.cli list --status pending    # List all pending cakes
  python -m backend.cli publish <id_or_slug>     # Publish cake to live site
  python -m backend.cli revalidate               # Refresh website cache
        """
    )
    
    subparsers = parser.add_subparsers(dest="subcommand", help="Available commands")
    
    # Subcommand: interactive
    subparsers.add_parser("interactive", help="Launch interactive step-by-step menu")
    
    # Subcommand: add
    parser_add = subparsers.add_parser("add", help="Process and add a single cake image")
    parser_add.add_argument("image_path", nargs="?", help="Path to image file")
    parser_add.add_argument("-n", "--name", help="Custom cake title")
    parser_add.add_argument("-c", "--category", help="Category name, slug, or ID")
    parser_add.add_argument("-f", "--flavour", help="Flavour profile")
    parser_add.add_argument("-d", "--desc", help="Artisan marketing description")
    parser_add.add_argument("-s", "--sizes", help="Comma-separated sizes (e.g. '0.5 kg,1.0 kg,2.0 kg')")
    parser_add.add_argument("-p", "--publish", action="store_true", help="Publish immediately to live storefront")
    parser_add.add_argument("--no-ai", action="store_true", help="Skip Gemini AI analysis")
    parser_add.add_argument("--no-bg", action="store_true", help="Keep photo background without cutout")
    
    # Subcommand: bulk
    parser_bulk = subparsers.add_parser("bulk", help="Bulk process all cake images in a directory")
    parser_bulk.add_argument("folder_path", help="Path to folder of images")
    parser_bulk.add_argument("-p", "--publish", action="store_true", help="Publish all directly to live storefront")
    parser_bulk.add_argument("-c", "--category", help="Assign all to a specific category")
    parser_bulk.add_argument("--no-ai", action="store_true", help="Skip Gemini AI analysis for fast ingestion")
    parser_bulk.add_argument("--no-bg", action="store_true", help="Keep photo background without cutout")
    
    # Subcommand: list
    parser_list = subparsers.add_parser("list", help="List cakes in database")
    parser_list.add_argument("--status", choices=["pending", "approved", "published", "rejected", "all"], default=None, help="Filter by status")
    parser_list.add_argument("--limit", type=int, default=50, help="Max results to display")
    
    # Subcommand: categories
    subparsers.add_parser("categories", help="List all catalog categories")
    
    # Subcommand: publish
    parser_pub = subparsers.add_parser("publish", help="Publish cake to live catalog")
    parser_pub.add_argument("identifier", help="Cake ID or slug")
    
    # Subcommand: unpublish
    parser_unpub = subparsers.add_parser("unpublish", help="Revert published cake back to staged")
    parser_unpub.add_argument("identifier", help="Cake ID or slug")
    
    # Subcommand: delete
    parser_del = subparsers.add_parser("delete", help="Permanently delete a cake")
    parser_del.add_argument("cake_id", help="Cake ID")
    
    # Subcommand: revalidate
    subparsers.add_parser("revalidate", help="Trigger Next.js ISR cache revalidation")
    
    # Subcommand: diagnostics
    subparsers.add_parser("diagnostics", help="Run system health checks")

    # Browser & Server subcommands
    subparsers.add_parser("tools", help="Open Python Image Processing Web Tools in browser")
    subparsers.add_parser("site", help="Open public website in browser")
    subparsers.add_parser("admin", help="Open admin dashboard in browser")
    subparsers.add_parser("pending", help="Open pending review queue in browser")
    subparsers.add_parser("start", help="Start both servers (Backend + Frontend)")
    subparsers.add_parser("stop", help="Stop all background servers")

    args = parser.parse_args()
    
    # If no arguments provided, launch interactive menu
    if not args.subcommand or args.subcommand == "interactive":
        interactive_wizard()
        return

    if args.subcommand == "add":
        if not args.image_path:
            action_interactive_add()
            return
            
        p = clean_input_path(args.image_path)
        sizes_list = [s.strip() for s in args.sizes.split(",")] if args.sizes else None
        
        try:
            res = process_single_image(
                image_path=p,
                name=args.name,
                category_identifier=args.category,
                flavour=args.flavour,
                description=args.desc,
                sizes=sizes_list,
                publish=args.publish,
                use_ai=not args.no_ai,
                remove_bg=not args.no_bg,
                interactive_verbose=True
            )
            print()
            success(f"Cake '{res['name']}' ({res['status'].upper()}) processed successfully!")
            print(f"  ID:        {res['id']}")
            print(f"  Image URL: {res['image_url']}")
            print(f"  Slug:      {res['slug']}")
        except Exception as e:
            error(f"Processing failed: {e}")
            sys.exit(1)

    elif args.subcommand == "bulk":
        folder = clean_input_path(args.folder_path)
        if not folder.exists() or not folder.is_dir():
            error(f"Folder not found: {folder}")
            sys.exit(1)
            
        images = [f for f in folder.iterdir() if f.is_file() and f.suffix.lower() in settings.ALLOWED_EXTENSIONS]
        info(f"Processing {len(images)} images in {folder}...")
        
        added = 0
        failed = 0
        for idx, img in enumerate(images, 1):
            try:
                r = process_single_image(
                    image_path=img,
                    category_identifier=args.category,
                    publish=args.publish,
                    use_ai=not args.no_ai,
                    remove_bg=not args.no_bg,
                    interactive_verbose=False
                )
                print(Fore.GREEN + f"  [{idx}/{len(images)}] Added: {r['name']} ({r['status'].upper()})" + Style.RESET_ALL)
                added += 1
            except Exception as e:
                print(Fore.RED + f"  [{idx}/{len(images)}] Failed {img.name}: {e}" + Style.RESET_ALL)
                failed += 1
                
        if args.publish:
            revalidate_frontend()
        print()
        success(f"Bulk complete: {added} added, {failed} failed.")

    elif args.subcommand == "list":
        filter_status = None if args.status == "all" else args.status
        action_list_cakes(status=filter_status, limit=args.limit)

    elif args.subcommand == "categories":
        action_list_categories()

    elif args.subcommand == "publish":
        action_publish(args.identifier)

    elif args.subcommand == "unpublish":
        action_unpublish(args.identifier)

    elif args.subcommand == "delete":
        action_delete(args.cake_id)

    elif args.subcommand == "revalidate":
        action_revalidate()

    elif args.subcommand == "diagnostics":
        action_diagnostics()

    elif args.subcommand == "tools":
        ensure_backend_running()
        open_url(f"http://localhost:{settings.PORT}/portal")

    elif args.subcommand == "site":
        ensure_backend_running()
        ensure_frontend_running()
        open_url("http://localhost:3000")

    elif args.subcommand == "admin":
        ensure_backend_running()
        ensure_frontend_running()
        open_url("http://localhost:3000/admin")

    elif args.subcommand == "pending":
        ensure_backend_running()
        ensure_frontend_running()
        open_url("http://localhost:3000/admin/cakes/pending")

    elif args.subcommand == "start":
        start_all_servers()

    elif args.subcommand == "stop":
        stop_all_servers()

if __name__ == "__main__":
    main()
