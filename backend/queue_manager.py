import asyncio
import os
import uuid
from pathlib import Path
from typing import Dict, Any, Optional
from backend.config import settings
from backend.db import db
from backend.processor import processor
from backend.ai_analyzer import ai_analyzer
from backend.storage import storage

class BackgroundJobQueue:
    def __init__(self):
        self.queue: asyncio.Queue = asyncio.Queue()
        self.semaphore = asyncio.Semaphore(settings.MAX_CONCURRENT_JOBS)
        self.workers: list = []
        self.is_running = False
        self._file_paths: Dict[str, Path] = {}

    def start(self):
        """Starts the background worker tasks."""
        if not self.is_running:
            self.is_running = True
            for i in range(settings.MAX_CONCURRENT_JOBS):
                worker = asyncio.create_task(self._worker_loop(f"worker-{i+1}"))
                self.workers.append(worker)
            print(f"[Queue] Started {settings.MAX_CONCURRENT_JOBS} background worker tasks.")

    async def stop(self):
        """Gracefully stops workers."""
        self.is_running = False
        for worker in self.workers:
            worker.cancel()
        await asyncio.gather(*self.workers, return_exceptions=True)
        self.workers.clear()

    async def enqueue(self, file_path: Path, file_name: str, original_size_bytes: int = 0) -> str:
        """Creates a job in DB and adds to queue."""
        job = db.create_job(file_name, original_size_bytes)
        job_id = job["id"]
        self._file_paths[job_id] = file_path
        await self.queue.put(job_id)
        return job_id

    async def retry(self, job_id: str) -> bool:
        """Resets and retries a failed job."""
        job = db.get_job(job_id)
        if not job:
            return False
        
        file_path = self._file_paths.get(job_id)
        if not file_path or not file_path.exists():
            # Check if original file exists in upload dir
            possible_path = settings.UPLOAD_DIR / job["file_name"]
            if possible_path.exists():
                file_path = possible_path
                self._file_paths[job_id] = file_path
            else:
                db.update_job(job_id, status="failed", error_message="Original file no longer available for retry.")
                return False

        db.update_job(job_id, status="retrying", progress=0, error_message=None)
        await self.queue.put(job_id)
        return True

    async def _worker_loop(self, worker_name: str):
        """Worker task processing jobs continuously."""
        while self.is_running:
            try:
                job_id = await self.queue.get()
                async with self.semaphore:
                    await self._process_job(job_id, worker_name)
                self.queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"[Queue][{worker_name}] Worker loop exception: {e}")
                await asyncio.sleep(1)

    async def _process_job(self, job_id: str, worker_name: str):
        """Executes full processing pipeline for a single cake image."""
        job = db.get_job(job_id)
        if not job:
            return

        file_path = self._file_paths.get(job_id)
        if not file_path or not file_path.exists():
            possible_path = settings.UPLOAD_DIR / job["file_name"]
            if possible_path.exists():
                file_path = possible_path
            else:
                db.update_job(job_id, status="failed", error_message="Source image file not found.")
                return

        print(f"[Queue][{worker_name}] Starting processing for job {job_id} ({job['file_name']})")
        
        try:
            # 1. State: PROCESSING (Progress 15%)
            db.update_job(job_id, status="processing", progress=15)
            await asyncio.sleep(0.05)

            # 2. Image Processing: Background removal + White Studio + Auto Crop/Resize
            # Run CPU-bound image operations in default threadpool executor
            loop = asyncio.get_event_loop()
            proc_result = await loop.run_in_executor(
                None,
                processor.process_cake_image,
                file_path,
                f"cake_{job_id[:8]}"
            )
            
            # State: IMAGE_PROCESSED (Progress 50%)
            db.update_job(job_id, status="image_processed", progress=50)
            await asyncio.sleep(0.05)

            # 3. Storage Upload (Cloudinary / Local Fallback)
            # State: UPLOADING (Progress 80%)
            db.update_job(job_id, status="uploading", progress=80)
            
            master_file_path = Path(proc_result["master_path"])
            upload_res = await loop.run_in_executor(
                None,
                storage.upload_image,
                master_file_path,
                f"cake_{job_id[:8]}"
            )

            # 4. AI Sensory Copywriting & Categorization
            all_categories = db.get_categories(active_only=False)
            cat_names = [c["name"] for c in all_categories]
            ai_data = {}
            try:
                ai_data = await loop.run_in_executor(
                    None,
                    ai_analyzer.analyze_cake_image,
                    master_file_path,
                    None,
                    cat_names
                )
            except Exception as e:
                print(f"[Queue][{worker_name}] AI sensory analysis note: {e}")

            # Resolve Cake Attributes
            clean_title = (ai_data.get("name") if ai_data else None) or Path(job["file_name"]).stem.replace("_", " ").replace("-", " ").title()
            if not clean_title or clean_title.lower().startswith("img"):
                clean_title = f"Artisan Confection #{job_id[:6].upper()}"

            flavour = (ai_data.get("flavour") if ai_data else None) or "Chef's Signature Vanilla & Cocoa"
            description = (ai_data.get("description") if ai_data else None) or "An exquisite handcrafted luxury confection prepared with pure artisanal ingredients."

            category_id = None
            if ai_data and ai_data.get("category"):
                cat_match = next((c for c in all_categories if c["name"].lower() == ai_data["category"].lower()), None)
                if cat_match:
                    category_id = cat_match["id"]
            if not category_id and all_categories:
                category_id = all_categories[0]["id"]

            sizes = (ai_data.get("available_sizes") if ai_data else None) or ["0.5 kg (Small)", "1.0 kg (Medium)", "2.0 kg (Large)"]

            cake_record = {
                "name": clean_title,
                "flavour": flavour,
                "category_id": category_id,
                "description": description,
                "available_sizes": sizes,
                "image_url": upload_res["image_url"],
                "cloudinary_public_id": upload_res.get("cloudinary_public_id"),
                "status": "pending", # MANDATORY: Artisan approval queue
                "ai_metadata": {
                    "ai_status": "generated" if ai_data else "manual",
                    "original_file": job["file_name"],
                    "tags": ai_data.get("tags", []) if ai_data else [],
                    "local_preview_url": proc_result["relative_master_url"],
                    "local_thumb_url": proc_result["relative_thumb_url"]
                }
            }

            created_cake = db.create_cake(cake_record)

            # 7. Mark Job Completed
            db.update_job(
                job_id,
                status="completed",
                progress=100,
                cake_id=created_cake["id"],
                error_message=None
            )
            print(f"[Queue][{worker_name}] Successfully completed job {job_id} -> Cake '{created_cake['name']}' (PENDING)")

        except Exception as e:
            err = f"Processing error: {str(e)}"
            print(f"[Queue][{worker_name}] Failed job {job_id}: {err}")
            db.update_job(job_id, status="failed", progress=0, error_message=err)

job_queue = BackgroundJobQueue()
