import os
import json
import psycopg2
import cloudinary
import cloudinary.uploader
from pathlib import Path
from backend.db import db
from backend.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name="gviwlymx",
    api_key="744243533944857",
    api_secret="nVxhpeqHF6E6FOUScc_XCZBhQaM",
    secure=True
)

# Configure Supabase
HOST = settings.SUPABASE_HOST
PORT = settings.SUPABASE_PORT
USER = settings.SUPABASE_USER
PASSWORD = settings.SUPABASE_PASSWORD
DBNAME = settings.SUPABASE_DB

def sync():
    print("=== SYNCING ALL DATA TO CLOUDINARY & SUPABASE ===")
    conn = psycopg2.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        dbname=DBNAME
    )
    conn.autocommit = True
    cur = conn.cursor()

    # 1. Sync reviews
    reviews = db.get_reviews()
    print(f"Syncing {len(reviews)} reviews...")
    for idx, r in enumerate(reviews, 1):
        valid_uuid = f"00000000-0000-0000-0000-{idx:012d}"
        cur.execute("""
            INSERT INTO reviews (id, customer_name, customer_location, review_text, rating, status, created_at, approved_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                approved_at = EXCLUDED.approved_at;
        """, (
            valid_uuid,
            r["customer_name"],
            r.get("customer_location", "Verified Guest"),
            r["review_text"],
            r["rating"],
            r["status"],
            r["created_at"],
            r.get("approved_at")
        ))
    print("Reviews synced!")

    # 2. Sync cakes & upload images to Cloudinary
    cakes = db.get_cakes(status=None, limit=200)
    print(f"Processing & syncing {len(cakes)} cakes to Cloudinary and Supabase...")

    for c in cakes:
        img_url = c["image_url"]
        pub_id = c.get("cloudinary_public_id")
        
        # Check if image is local and upload to Cloudinary
        if not img_url.startswith("https://res.cloudinary.com"):
            local_filename = Path(img_url).name
            local_path = settings.PROCESSED_DIR / local_filename
            if not local_path.exists():
                local_path = settings.UPLOAD_DIR / local_filename

            if local_path.exists():
                try:
                    c_res = cloudinary.uploader.upload(
                        str(local_path),
                        folder="lush_layers/cakes",
                        public_id=f"cake_{c['slug'][:30]}",
                        overwrite=True,
                        format="webp"
                    )
                    img_url = c_res.get("secure_url", img_url)
                    pub_id = c_res.get("public_id")
                    # Update local db too
                    db.update_cake(c["id"], {"image_url": img_url, "cloudinary_public_id": pub_id})
                    print(f"  [OK] Uploaded to Cloudinary: {pub_id}")
                except Exception as e:
                    print(f"  Warning: Cloudinary upload failed for {local_filename}: {e}")

        # Insert / Upsert into Supabase
        cur.execute("""
            INSERT INTO cakes (
                id, name, slug, flavour, category_id, description,
                available_sizes, image_url, cloudinary_public_id, status,
                ai_metadata, is_hero, is_trending, is_inspiration, display_id,
                created_at, updated_at, published_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (slug) DO UPDATE SET
                image_url = EXCLUDED.image_url,
                cloudinary_public_id = EXCLUDED.cloudinary_public_id,
                status = EXCLUDED.status,
                is_hero = EXCLUDED.is_hero,
                is_trending = EXCLUDED.is_trending,
                is_inspiration = EXCLUDED.is_inspiration,
                display_id = EXCLUDED.display_id,
                updated_at = EXCLUDED.updated_at,
                published_at = EXCLUDED.published_at;
        """, (
            c["id"],
            c["name"],
            c["slug"],
            c["flavour"],
            c.get("category_id"),
            c.get("description", ""),
            json.dumps(c.get("available_sizes", ["0.5 kg", "1.0 kg"])),
            img_url,
            pub_id,
            c["status"],
            json.dumps(c.get("ai_metadata", {})),
            bool(c.get("is_hero")),
            bool(c.get("is_trending")),
            bool(c.get("is_inspiration")),
            c.get("display_id"),
            c["created_at"],
            c["updated_at"],
            c.get("published_at")
        ))

    cur.execute("SELECT count(*), status FROM cakes GROUP BY status;")
    print("Supabase Cake counts by status:", cur.fetchall())
    conn.close()
    print("=== SYNC COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    sync()
