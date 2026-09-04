import io
import os
import uuid
import hashlib
from pathlib import Path
from typing import Tuple, Dict, Any, Optional
from PIL import Image, ImageOps, ImageFilter
from backend.config import settings

# Attempt to load rembg
try:
    from rembg import remove, new_session
    REMBG_AVAILABLE = True
    try:
        # Pre-initialize session to avoid cold start latency
        REMBG_SESSION = new_session("u2netp")
    except Exception as e:
        print(f"[Processor] Could not load specific rembg session: {e}. Will use default remove.")
        REMBG_SESSION = None
except ImportError:
    REMBG_AVAILABLE = False
    REMBG_SESSION = None
    print("[Processor] rembg not installed. Fallback background processor will be active.")

class ImageProcessor:
    def __init__(self):
        self.max_size_mb = settings.MAX_FILE_SIZE_MB
        self.allowed_extensions = settings.ALLOWED_EXTENSIONS

    def validate_image(self, file_path: Path) -> Tuple[bool, str]:
        """Validates file extension, size, and integrity."""
        if not file_path.exists():
            return False, "File does not exist."
        
        ext = file_path.suffix.lower()
        if ext not in self.allowed_extensions:
            return False, f"Unsupported file extension '{ext}'. Allowed: {', '.join(self.allowed_extensions)}"
            
        file_size_mb = file_path.stat().st_size / (1024 * 1024)
        if file_size_mb > self.max_size_mb:
            return False, f"File size ({file_size_mb:.1f} MB) exceeds maximum allowed ({self.max_size_mb} MB)."
            
        try:
            with Image.open(file_path) as img:
                img.verify()
            return True, "Valid"
        except Exception as e:
            return False, f"Corrupted or invalid image: {str(e)}"

    def remove_background(self, input_image: Image.Image) -> Image.Image:
        """Removes original background and yields clean RGBA image."""
        # Normalize orientation using EXIF
        input_image = ImageOps.exif_transpose(input_image)
        if input_image.mode != "RGBA":
            input_image = input_image.convert("RGBA")

        if REMBG_AVAILABLE:
            try:
                buf = io.BytesIO()
                input_image.save(buf, format="PNG")
                img_bytes = buf.getvalue()
                
                if REMBG_SESSION:
                    result_bytes = remove(img_bytes, session=REMBG_SESSION)
                else:
                    result_bytes = remove(img_bytes)
                    
                rgba = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
                return rgba
            except Exception as e:
                print(f"[Processor] rembg removal failed: {e}. Falling back to clean alpha matting.")

        # Resilient fallback: clean alpha matting based on edge luminosity
        return self._fallback_cutout(input_image)

    def _fallback_cutout(self, img: Image.Image) -> Image.Image:
        """Simple edge-aware transparency fallback if rembg isn't available."""
        rgba = img.convert("RGBA")
        datas = rgba.getdata()
        new_data = []
        # Sample corner pixels to estimate background color
        corners = [datas[0], datas[img.width - 1], datas[-1], datas[-img.width]]
        avg_r = sum(c[0] for c in corners) // 4
        avg_g = sum(c[1] for c in corners) // 4
        avg_b = sum(c[2] for c in corners) // 4

        for item in datas:
            # Check proximity to estimated background
            diff = abs(item[0] - avg_r) + abs(item[1] - avg_g) + abs(item[2] - avg_b)
            if diff < 45:
                # Fade out background
                alpha = max(0, int((diff / 45) * 255))
                new_data.append((item[0], item[1], item[2], alpha))
            else:
                new_data.append(item)
                
        rgba.putdata(new_data)
        return rgba

    def composite_on_white_studio(self, cake_rgba: Image.Image, canvas_size: int = 1200) -> Image.Image:
        """
        Composites cake cutout onto pristine studio white canvas
        with a soft ambient drop-shadow under the cake base for a photorealistic luxury feel.
        """
        # 1. Trim transparency bounding box
        bbox = cake_rgba.getbbox()
        if bbox:
            cake_cropped = cake_rgba.crop(bbox)
        else:
            cake_cropped = cake_rgba

        cw, ch = cake_cropped.size
        
        # 2. Compute proportional scale to fit within 84% of canvas size (leaving luxury margin)
        target_max_dimension = int(canvas_size * 0.84)
        scale = min(target_max_dimension / cw, target_max_dimension / ch)
        new_w = int(cw * scale)
        new_h = int(ch * scale)
        
        cake_resized = cake_cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # 3. Create clean white canvas
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 255))
        
        # 4. Position: center horizontally, slightly below center vertically for natural anchor
        pos_x = (canvas_size - new_w) // 2
        pos_y = (canvas_size - new_h) // 2 + int(canvas_size * 0.02)
        
        # 5. Create subtle studio soft shadow under the cake base
        shadow_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        shadow_ellipse = Image.new("RGBA", (int(new_w * 0.75), int(new_h * 0.12)), (0, 0, 0, 0))
        
        # Render a soft black shadow oval
        from PIL import ImageDraw
        draw = ImageDraw.Draw(shadow_ellipse)
        draw.ellipse([0, 0, shadow_ellipse.width - 1, shadow_ellipse.height - 1], fill=(20, 15, 12, 55))
        shadow_ellipse = shadow_ellipse.filter(ImageFilter.GaussianBlur(radius=int(canvas_size * 0.025)))
        
        shadow_x = (canvas_size - shadow_ellipse.width) // 2
        shadow_y = pos_y + new_h - int(shadow_ellipse.height * 0.6)
        shadow_canvas.paste(shadow_ellipse, (shadow_x, shadow_y), shadow_ellipse)
        
        # 6. Composite shadow, then cake onto white canvas
        canvas.paste(shadow_canvas, (0, 0), shadow_canvas)
        canvas.paste(cake_resized, (pos_x, pos_y), cake_resized)
        
        return canvas.convert("RGB")

    def process_cake_image(self, input_path: Path, output_filename_base: Optional[str] = None) -> Dict[str, Any]:
        """
        Complete processing workflow:
        Validate -> Background removal -> Clean white studio compositing -> Auto-crop/resize -> WebP master & thumbnail
        """
        valid, msg = self.validate_image(input_path)
        if not valid:
            raise ValueError(f"Image validation failed: {msg}")

        if not output_filename_base:
            output_filename_base = f"cake_{uuid.uuid4().hex[:10]}"

        with Image.open(input_path) as orig_img:
            # 1. Background removal
            rgba_cutout = self.remove_background(orig_img)
            
            # 2. Studio white background compositing
            master_rgb = self.composite_on_white_studio(rgba_cutout, canvas_size=1200)
            
            # 3. Generate thumbnail (600x600)
            thumb_rgb = master_rgb.resize((600, 600), Image.Resampling.LANCZOS)
            
            # 4. Save WebP files
            master_path = settings.PROCESSED_DIR / f"{output_filename_base}.webp"
            thumb_path = settings.THUMBNAIL_DIR / f"{output_filename_base}_thumb.webp"
            
            master_rgb.save(master_path, format="WEBP", quality=90, method=6)
            thumb_rgb.save(thumb_path, format="WEBP", quality=85, method=6)

            file_hash = hashlib.md5(master_path.read_bytes()).hexdigest()

            return {
                "master_path": str(master_path),
                "master_filename": master_path.name,
                "thumbnail_path": str(thumb_path),
                "thumbnail_filename": thumb_path.name,
                "width": 1200,
                "height": 1200,
                "file_size_bytes": master_path.stat().st_size,
                "md5_hash": file_hash,
                "relative_master_url": f"/media/processed/{master_path.name}",
                "relative_thumb_url": f"/media/thumbnails/{thumb_path.name}"
            }

processor = ImageProcessor()
