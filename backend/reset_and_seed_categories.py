import os
import shutil
import sqlite3
import datetime
from pathlib import Path
from backend.config import settings

# 7 Essential Real Bakery Categories
CATEGORIES = [
    {
        "id": "c0000000-0000-0000-0000-000000000001",
        "name": "Birthday Cakes",
        "slug": "birthday-cakes",
        "description": "Handcrafted celebration centrepieces tailored for unforgettable birthday milestones.",
        "image_url": "/categories/birthday.webp",
        "icon": "PartyPopper",
        "color": "#FFF5F7",
        "accent": "#E11D48",
        "sort_order": 1,
    },
    {
        "id": "c0000000-0000-0000-0000-000000000002",
        "name": "Wedding & Tiered Cakes",
        "slug": "wedding-tiered-cakes",
        "description": "Grand architectural multi-tiered masterworks with delicate textures, florals and luxury accents.",
        "image_url": "/categories/tiered.webp",
        "icon": "Crown",
        "color": "#F9F9F9",
        "accent": "#C89B3C",
        "sort_order": 2,
    },
    {
        "id": "c0000000-0000-0000-0000-000000000003",
        "name": "Anniversary & Romance",
        "slug": "anniversary-cakes",
        "description": "Romantic signature cakes, heart designs, and milestone celebration confections.",
        "image_url": "/categories/romantic.webp",
        "icon": "Heart",
        "color": "#FFF9EE",
        "accent": "#B88E3E",
        "sort_order": 3,
    },
    {
        "id": "c0000000-0000-0000-0000-000000000004",
        "name": "Bento & Petite Cakes",
        "slug": "bento-petite-cakes",
        "description": "Minimalist Korean-style lunchbox bento cakes crafted for intimate celebrations.",
        "image_url": "/categories/bento.webp",
        "icon": "Shapes",
        "color": "#F4F6F8",
        "accent": "#475569",
        "sort_order": 4,
    },
    {
        "id": "c0000000-0000-0000-0000-000000000005",
        "name": "Botanical & Floral Cakes",
        "slug": "botanical-floral-cakes",
        "description": "Intricately piped sugar florals, fresh blossoms, and delicate botanical infusions.",
        "image_url": "/categories/floral.webp",
        "icon": "Flower2",
        "color": "#FFF0F3",
        "accent": "#DB2777",
        "sort_order": 5,
    },
    {
        "id": "c0000000-0000-0000-0000-000000000006",
        "name": "Pure Belgian Chocolate",
        "slug": "belgian-chocolate-cakes",
        "description": "Decadent single-origin Belgian chocolate ganache, silk truffles, and rich cocoa sponges.",
        "image_url": "/categories/chocolate.webp",
        "icon": "Cookie",
        "color": "#F6F1EA",
        "accent": "#6B4423",
        "sort_order": 6,
    },
    {
        "id": "c0000000-0000-0000-0000-000000000007",
        "name": "Custom & Theme Cakes",
        "slug": "custom-theme-cakes",
        "description": "Bespoke novelty, themed creations, and personalized artistry crafted to your imagination.",
        "image_url": "/categories/custom.webp",
        "icon": "Palette",
        "color": "#FDF2EC",
        "accent": "#EA580C",
        "sort_order": 7,
    },
]

def reset_sqlite():
    db_path = settings.DB_PATH
    print(f"[SQLite] Connecting to {db_path}...")
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    # 1. Delete all cakes
    cursor.execute("DELETE FROM cakes")
    cakes_deleted = cursor.rowcount
    print(f"[SQLite] Deleted {cakes_deleted} cakes.")

    # 2. Delete all jobs
    cursor.execute("DELETE FROM processing_jobs")
    jobs_deleted = cursor.rowcount
    print(f"[SQLite] Deleted {jobs_deleted} processing jobs.")

    # 3. Clean and reset categories
    cursor.execute("DELETE FROM categories")
    print("[SQLite] Cleared old categories.")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    for cat in CATEGORIES:
        cursor.execute("""
            INSERT INTO categories (
                id, name, slug, description, image_url, icon, color, accent, active, sort_order, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cat["id"],
            cat["name"],
            cat["slug"],
            cat["description"],
            cat["image_url"],
            cat["icon"],
            cat["color"],
            cat["accent"],
            1,
            cat["sort_order"],
            now_iso,
            now_iso,
        ))
    conn.commit()
    conn.close()
    print(f"[SQLite] Successfully seeded {len(CATEGORIES)} real bakery categories.")

def reset_postgres():
    try:
        import psycopg2
        print(f"[PostgreSQL] Connecting to Supabase pooler at {settings.SUPABASE_HOST}...")
        conn = psycopg2.connect(
            host=settings.SUPABASE_HOST,
            port=settings.SUPABASE_PORT,
            user=settings.SUPABASE_USER,
            password=settings.SUPABASE_PASSWORD,
            dbname=settings.SUPABASE_DB,
            connect_timeout=10,
        )
        conn.autocommit = True
        cur = conn.cursor()

        # 1. Delete all cakes
        cur.execute("DELETE FROM cakes;")
        print("[PostgreSQL] Deleted all cakes.")

        # 2. Delete all processing jobs if table exists
        try:
            cur.execute("DELETE FROM processing_jobs;")
            print("[PostgreSQL] Deleted all processing jobs.")
        except Exception:
            pass

        # Ensure columns exist
        cur.execute("ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Cake';")
        cur.execute("ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#FAF6F0';")
        cur.execute("ALTER TABLE categories ADD COLUMN IF NOT EXISTS accent TEXT DEFAULT '#B88E3E';")

        # 3. Clean and reset categories
        cur.execute("DELETE FROM categories;")
        print("[PostgreSQL] Cleared old categories.")

        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        for cat in CATEGORIES:
            cur.execute("""
                INSERT INTO categories (
                    id, name, slug, description, image_url, icon, color, accent, active, sort_order, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                cat["id"],
                cat["name"],
                cat["slug"],
                cat["description"],
                cat["image_url"],
                cat["icon"],
                cat["color"],
                cat["accent"],
                True,
                cat["sort_order"],
                now_iso,
                now_iso,
            ))

        conn.close()
        print(f"[PostgreSQL] Successfully seeded {len(CATEGORIES)} real bakery categories in Supabase.")
    except Exception as e:
        print(f"[PostgreSQL] Notice: Could not connect to Postgres pooler ({e}). SQLite is fully reset.")

def clean_media_dirs():
    media_dirs = [
        settings.UPLOAD_DIR,
        settings.PROCESSED_DIR,
        settings.THUMBNAIL_DIR,
    ]
    cleaned_count = 0
    for d in media_dirs:
        if d.exists():
            for f in d.iterdir():
                if f.is_file():
                    try:
                        f.unlink()
                        cleaned_count += 1
                    except Exception:
                        pass
    print(f"[Media] Cleaned {cleaned_count} temporary cached files in uploads/processed/thumbnails.")

if __name__ == "__main__":
    print("=== LUSH LAYERS DATABASE CLEANUP & RESET ===")
    reset_sqlite()
    reset_postgres()
    clean_media_dirs()
    print("=== DATABASE RESET COMPLETE ===")
