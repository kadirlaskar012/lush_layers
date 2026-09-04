import os
import socket
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root or backend folder
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")
load_dotenv(BACKEND_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "Lush Layers Local Backend"
    HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    
    # Frontend URL & ISR Revalidation
    NEXTJS_URL: str = os.getenv("NEXTJS_URL", "http://localhost:3000")
    REVALIDATE_SECRET: str = os.getenv("REVALIDATE_SECRET", "lush_layers_revalidate_secret_key_2026")
    
    # Supabase Credentials & Direct PostgreSQL Pooler
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://phpisimuahahngdaeohg.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")))
    SUPABASE_HOST: str = os.getenv("SUPABASE_HOST", "aws-0-ap-northeast-1.pooler.supabase.com")
    SUPABASE_PORT: int = int(os.getenv("SUPABASE_PORT", "6543"))
    SUPABASE_USER: str = os.getenv("SUPABASE_USER", "postgres.phpisimuahahngdaeohg")
    SUPABASE_PASSWORD: str = os.getenv("SUPABASE_PASSWORD", "2IiVSM6jSwDN6dvr")
    SUPABASE_DB: str = os.getenv("SUPABASE_DB", "postgres")
    
    # Cloudinary Credentials
    CLOUDINARY_URL: str = os.getenv("CLOUDINARY_URL", "")
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    CLOUDINARY_FOLDER: str = os.getenv("CLOUDINARY_FOLDER", "lush_layers/cakes")
    
    # Auto-parse CLOUDINARY_URL if components not individually set
    if CLOUDINARY_URL and (not CLOUDINARY_CLOUD_NAME or not CLOUDINARY_API_KEY or not CLOUDINARY_API_SECRET):
        import re
        # Format: cloudinary://api_key:api_secret@cloud_name
        match = re.match(r"cloudinary://([^:]+):([^@]+)@(.+)", CLOUDINARY_URL.strip())
        if match:
            CLOUDINARY_API_KEY = match.group(1)
            CLOUDINARY_API_SECRET = match.group(2)
            CLOUDINARY_CLOUD_NAME = match.group(3)
    
    # AI Metadata Generation (Gemini / Local Vision Fallback)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Media & Storage Paths
    BASE_DIR: Path = BACKEND_DIR
    DATA_DIR: Path = BACKEND_DIR / "data"
    MEDIA_DIR: Path = BACKEND_DIR / "media"
    UPLOAD_DIR: Path = BACKEND_DIR / "media" / "uploads"
    PROCESSED_DIR: Path = BACKEND_DIR / "media" / "processed"
    THUMBNAIL_DIR: Path = BACKEND_DIR / "media" / "thumbnails"
    DB_PATH: Path = BACKEND_DIR / "data" / "lush_layers.db"
    
    # Processing Limits
    MAX_FILE_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic"}
    MAX_CONCURRENT_JOBS: int = 3
    
    @classmethod
    def ensure_directories(cls):
        cls.DATA_DIR.mkdir(parents=True, exist_ok=True)
        cls.MEDIA_DIR.mkdir(parents=True, exist_ok=True)
        cls.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        cls.PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        cls.THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)

    @classmethod
    def get_lan_ip(cls) -> str:
        """Find the local network IP address for other devices on the LAN."""
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.settimeout(0.5)
            # Connect to an external address (doesn't send packet) to identify the outgoing LAN IP
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except Exception:
            try:
                return socket.gethostbyname(socket.gethostname())
            except Exception:
                return "127.0.0.1"

settings = Settings()
settings.ensure_directories()
