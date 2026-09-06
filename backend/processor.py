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

    def composite_on_white_studio(self, cake_rgba: Image.Image, canvas_size: int = 1200, auto_focus: bool = True) -> Image.Image:
        """
        Composites cake cutout onto pristine studio white canvas
        with a soft ambient drop-shadow under the cake base for a photorealistic luxury feel.
        """
        # 1. Trim transparency bounding box if auto_focus is enabled
        if auto_focus:
            bbox = cake_rgba.getbbox()
            cake_cropped = cake_rgba.crop(bbox) if bbox else cake_rgba
        else:
            cake_cropped = cake_rgba

        cw, ch = cake_cropped.size
        
        # 2. Compute proportional scale to fit within canvas (84% for auto_focus, 88% for standard)
        margin_factor = 0.84 if auto_focus else 0.88
        target_max_dimension = int(canvas_size * margin_factor)
        scale = min(target_max_dimension / max(1, cw), target_max_dimension / max(1, ch))
        new_w = max(1, int(cw * scale))
        new_h = max(1, int(ch * scale))
        
        cake_resized = cake_cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # 3. Create clean white canvas
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 255))
        
        # 4. Position: center horizontally, slightly below center vertically for natural anchor
        pos_x = (canvas_size - new_w) // 2
        pos_y = (canvas_size - new_h) // 2 + int(canvas_size * 0.02)
        
        # 5. Create subtle studio soft shadow under the cake base
        shadow_canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        shadow_ellipse = Image.new("RGBA", (max(10, int(new_w * 0.75)), max(6, int(new_h * 0.12))), (0, 0, 0, 0))
        
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

    def process_cake_image(
        self,
        input_path: Path,
        output_filename_base: Optional[str] = None,
        compress: bool = True,
        white_background: bool = True,
        auto_focus: bool = True
    ) -> Dict[str, Any]:
        """
        Configurable processing workflow:
        - white_background: AI background removal + luxury studio white compositing with contact shadow
        - auto_focus: subject detection, auto-crop and 1:1 square centered framing
        - compress: WebP high-efficiency optimization (80%+ size reduction) vs master high-fidelity
        """
        valid, msg = self.validate_image(input_path)
        if not valid:
            raise ValueError(f"Image validation failed: {msg}")

        if not output_filename_base:
            output_filename_base = f"cake_{uuid.uuid4().hex[:10]}"

        with Image.open(input_path) as raw_img:
            orig_img = ImageOps.exif_transpose(raw_img)

            if white_background:
                # 1. AI Background removal
                rgba_cutout = self.remove_background(orig_img)
                # 2. Studio white background compositing with contact shadow
                master_rgb = self.composite_on_white_studio(rgba_cutout, canvas_size=1200, auto_focus=auto_focus)
            else:
                # Retain original background
                rgb_img = orig_img.convert("RGB")
                w, h = rgb_img.size
                if auto_focus:
                    # Smart center-crop to 1:1 square framing
                    min_dim = min(w, h)
                    left = (w - min_dim) // 2
                    top = (h - min_dim) // 2
                    cropped = rgb_img.crop((left, top, left + min_dim, top + min_dim))
                    master_rgb = cropped.resize((1200, 1200), Image.Resampling.LANCZOS)
                else:
                    # Fit onto 1200x1200 canvas maintaining aspect ratio
                    scale = min(1200 / max(1, w), 1200 / max(1, h))
                    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
                    resized = rgb_img.resize((nw, nh), Image.Resampling.LANCZOS)
                    master_canvas = Image.new("RGB", (1200, 1200), (250, 246, 240))
                    px = (1200 - nw) // 2
                    py = (1200 - nh) // 2
                    master_canvas.paste(resized, (px, py))
                    master_rgb = master_canvas
            
            # 3. Generate thumbnail (600x600)
            thumb_rgb = master_rgb.resize((600, 600), Image.Resampling.LANCZOS)
            
            # 4. Save WebP files with calibrated compression settings
            master_path = settings.PROCESSED_DIR / f"{output_filename_base}.webp"
            thumb_path = settings.THUMBNAIL_DIR / f"{output_filename_base}_thumb.webp"
            
            master_quality = 86 if compress else 98
            thumb_quality = 78 if compress else 90
            
            master_rgb.save(master_path, format="WEBP", quality=master_quality, method=6)
            thumb_rgb.save(thumb_path, format="WEBP", quality=thumb_quality, method=6)

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

    @staticmethod
    def compute_sha256(data_or_path: Any) -> str:
        """Computes SHA-256 hex digest from file path or bytes."""
        if isinstance(data_or_path, (str, Path)):
            p = Path(data_or_path)
            if not p.is_file():
                return ""
            hasher = hashlib.sha256()
            with open(p, "rb") as f:
                while chunk := f.read(65536):
                    hasher.update(chunk)
            return hasher.hexdigest()
        elif isinstance(data_or_path, (bytes, bytearray)):
            return hashlib.sha256(data_or_path).hexdigest()
        return ""

    @staticmethod
    def compute_dhash(img_input: Any, hash_size: int = 8) -> str:
        """
        Computes Difference Hash (dHash) visual fingerprint of an image.
        Yields a 64-bit hex string invariant to format, mild cropping, and compression.
        """
        try:
            if isinstance(img_input, (str, Path)):
                p = Path(img_input)
                if not p.is_file():
                    return ""
                img = Image.open(p)
            elif isinstance(img_input, (bytes, bytearray)):
                img = Image.open(io.BytesIO(img_input))
            elif isinstance(img_input, Image.Image):
                img = img_input
            else:
                return ""

            # Normalize orientation, convert to grayscale, and resize to (hash_size + 1, hash_size)
            gray = ImageOps.exif_transpose(img).convert("L")
            resized = gray.resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
            pixels = list(resized.getdata())

            # Compare adjacent pixels row by row
            diff_bits = []
            for row in range(hash_size):
                row_start = row * (hash_size + 1)
                for col in range(hash_size):
                    left_px = pixels[row_start + col]
                    right_px = pixels[row_start + col + 1]
                    diff_bits.append(1 if left_px > right_px else 0)

            # Convert 64 bits to 16-hex characters
            decimal_val = 0
            hex_str = []
            for idx, bit in enumerate(diff_bits):
                if bit:
                    decimal_val += 1 << (idx % 8)
                if (idx % 8) == 7:
                    hex_str.append(hex(decimal_val)[2:].zfill(2))
                    decimal_val = 0

            return "".join(hex_str)
        except Exception as e:
            print(f"[Processor] dHash calculation error: {e}")
            return ""

    @staticmethod
    def hamming_distance(hash1: str, hash2: str) -> int:
        """Computes bitwise Hamming distance between two hex hashes (0 to 64)."""
        if not hash1 or not hash2 or len(hash1) != len(hash2):
            return 999
        try:
            val1 = int(hash1, 16)
            val2 = int(hash2, 16)
            return bin(val1 ^ val2).count("1")
        except Exception:
            return 999

    @staticmethod
    def similarity_percentage(distance: int, max_bits: int = 64) -> float:
        """Converts Hamming distance to similarity percentage (100.0% = identical)."""
        if distance >= max_bits:
            return 0.0
        return round(max(0.0, (1.0 - (distance / max_bits)) * 100.0), 1)

    def compute_image_hashes(self, file_path_or_bytes: Any) -> Tuple[str, str]:
        """Computes both exact SHA-256 and visual dHash for duplicate analysis."""
        sha = self.compute_sha256(file_path_or_bytes)
        phash = self.compute_dhash(file_path_or_bytes)
        return sha, phash

processor = ImageProcessor()


