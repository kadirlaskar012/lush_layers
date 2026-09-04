import os
from pathlib import Path
from typing import Dict, Any, Optional
from backend.config import settings

try:
    import cloudinary
    import cloudinary.uploader
    HAS_CLOUDINARY_LIB = True
except ImportError:
    HAS_CLOUDINARY_LIB = False

class StorageManager:
    def __init__(self):
        self.is_cloudinary_configured = False
        self._init_cloudinary()

    def _init_cloudinary(self):
        if (
            HAS_CLOUDINARY_LIB
            and settings.CLOUDINARY_CLOUD_NAME
            and settings.CLOUDINARY_API_KEY
            and settings.CLOUDINARY_API_SECRET
        ):
            try:
                cloudinary.config(
                    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                    api_key=settings.CLOUDINARY_API_KEY,
                    api_secret=settings.CLOUDINARY_API_SECRET,
                    secure=True
                )
                self.is_cloudinary_configured = True
                print("[Storage] Cloudinary configured successfully.")
            except Exception as e:
                print(f"[Storage] Could not initialize Cloudinary: {e}")
                self.is_cloudinary_configured = False
        else:
            self.is_cloudinary_configured = False

    def upload_image(self, local_file_path: Path, public_id_base: Optional[str] = None) -> Dict[str, Any]:
        """
        Uploads an image to Cloudinary if configured; otherwise provides
        a LAN-accessible media URL from the local server.
        """
        file_name = local_file_path.name
        lan_ip = settings.get_lan_ip()
        local_url = f"http://{lan_ip}:{settings.PORT}/media/processed/{file_name}"
        relative_url = f"/media/processed/{file_name}"

        if self.is_cloudinary_configured:
            try:
                public_id = public_id_base or f"cake_{local_file_path.stem}"
                upload_result = cloudinary.uploader.upload(
                    str(local_file_path),
                    folder=settings.CLOUDINARY_FOLDER,
                    public_id=public_id,
                    overwrite=True,
                    resource_type="image",
                    format="webp"
                )
                secure_url = upload_result.get("secure_url", local_url)
                pub_id = upload_result.get("public_id", public_id)
                print(f"[Storage] Uploaded to Cloudinary: {pub_id} -> {secure_url}")
                return {
                    "image_url": secure_url,
                    "cloudinary_public_id": pub_id,
                    "is_cloudinary": True,
                    "local_fallback_url": local_url,
                    "relative_url": relative_url
                }
            except Exception as e:
                print(f"[Storage] Cloudinary upload failed: {e}. Using local LAN URL fallback.")

        # Local LAN Fallback
        return {
            "image_url": relative_url, # relative URL works with Next.js proxy / media server
            "cloudinary_public_id": None,
            "is_cloudinary": False,
            "local_fallback_url": local_url,
            "relative_url": relative_url
        }

storage = StorageManager()
