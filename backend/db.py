import json
import uuid
import sqlite3
import datetime
import random
from typing import Optional, List, Dict, Any
from pathlib import Path
from backend.config import settings

try:
    from supabase import create_client, Client
    HAS_SUPABASE_LIB = True
except ImportError:
    HAS_SUPABASE_LIB = False

class Database:
    def __init__(self):
        self.db_path = settings.DB_PATH
        self.supabase: Optional[Any] = None
        self.postgres_connected: bool = False
        self._init_sqlite()
        self._init_supabase()
        self._check_postgres()

    def _check_postgres(self):
        try:
            import psycopg2
            conn = psycopg2.connect(
                host=settings.SUPABASE_HOST,
                port=settings.SUPABASE_PORT,
                user=settings.SUPABASE_USER,
                password=settings.SUPABASE_PASSWORD,
                dbname=settings.SUPABASE_DB,
                connect_timeout=4
            )
            conn.close()
            self.postgres_connected = True
            print("[DB] Verified Supabase PostgreSQL connection via pooler.")
        except Exception as e:
            print(f"[DB] PostgreSQL pooler note: {e}")
            self.postgres_connected = False

    @property
    def is_connected(self) -> bool:
        return self.supabase is not None or self.postgres_connected

    def _init_supabase(self):
        if HAS_SUPABASE_LIB and settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                print("[DB] Connected to Supabase REST API successfully.")
            except Exception as e:
                print(f"[DB] Supabase connection warning: {e}. Operating in resilient local mode.")
                self.supabase = None
        else:
            self.supabase = None

    def _sync_to_postgres(self, sql: str, params: tuple):
        """Directly writes changes to Supabase PostgreSQL pooler in a non-blocking daemon thread."""
        import threading
        def _run():
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
                conn.autocommit = True
                cur = conn.cursor()
                cur.execute(sql, params)
                conn.close()
            except Exception:
                pass
        t = threading.Thread(target=_run, daemon=True)
        t.start()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), timeout=15.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_sqlite(self):
        conn = self._get_conn()
        cursor = conn.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                slug TEXT NOT NULL UNIQUE,
                description TEXT,
                image_url TEXT,
                icon TEXT DEFAULT 'Cake',
                color TEXT DEFAULT '#FAF6F0',
                accent TEXT DEFAULT '#B88E3E',
                active INTEGER DEFAULT 1 NOT NULL,
                sort_order INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        for col_name, col_type in [
            ("icon", "TEXT DEFAULT 'Cake'"),
            ("color", "TEXT DEFAULT '#FAF6F0'"),
            ("accent", "TEXT DEFAULT '#B88E3E'")
        ]:
            try:
                cursor.execute(f"ALTER TABLE categories ADD COLUMN {col_name} {col_type}")
            except Exception:
                pass

        # Cakes (Zero price column, mandatory image_url)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cakes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT NOT NULL UNIQUE,
                flavour TEXT NOT NULL,
                category_id TEXT,
                description TEXT,
                available_sizes TEXT NOT NULL DEFAULT '["0.5 kg (Small)", "1.0 kg (Medium)", "2.0 kg (Large)"]',
                image_url TEXT NOT NULL,
                cloudinary_public_id TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                ai_metadata TEXT DEFAULT '{}',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                published_at TEXT,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
            )
        """)

        # Ensure display_id column exists
        try:
            cursor.execute("ALTER TABLE cakes ADD COLUMN display_id TEXT")
        except Exception:
            pass

        # Backfill display_id for existing cakes if any are null or empty
        cursor.execute("SELECT id FROM cakes WHERE display_id IS NULL OR display_id = '' ORDER BY created_at ASC")
        unassigned = cursor.fetchall()
        if unassigned:
            cursor.execute("SELECT MAX(CAST(display_id AS INTEGER)) FROM cakes WHERE display_id GLOB '[0-9][0-9][0-9][0-9]'")
            max_row = cursor.fetchone()
            current_id = (max_row[0] if max_row and max_row[0] else 1000)
            for row in unassigned:
                current_id += 1
                cursor.execute("UPDATE cakes SET display_id = ? WHERE id = ?", (str(current_id), row["id"]))
            conn.commit()

        # Ensure curation placement columns exist (hero carousel, trending spotlight, inspiration wall)
        for col_name in ("is_hero", "is_trending", "is_inspiration"):
            try:
                cursor.execute(f"ALTER TABLE cakes ADD COLUMN {col_name} INTEGER DEFAULT 0")
            except Exception:
                pass

        # If any published cake has 0 for all placements, set default to 1 so current live cakes are shown
        cursor.execute("SELECT COUNT(*) FROM cakes WHERE is_hero = 1 OR is_trending = 1 OR is_inspiration = 1")
        if cursor.fetchone()[0] == 0:
            cursor.execute("UPDATE cakes SET is_hero = 1, is_trending = 1, is_inspiration = 1 WHERE status = 'published'")
            conn.commit()

        # Reviews
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id TEXT PRIMARY KEY,
                customer_name TEXT NOT NULL,
                customer_location TEXT,
                review_text TEXT NOT NULL,
                rating INTEGER NOT NULL,
                cake_id TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TEXT NOT NULL,
                approved_at TEXT,
                FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE SET NULL
            )
        """)

        # Processing Jobs
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS processing_jobs (
                id TEXT PRIMARY KEY,
                file_name TEXT NOT NULL,
                original_size_bytes INTEGER,
                status TEXT NOT NULL DEFAULT 'queued',
                progress INTEGER DEFAULT 0,
                error_message TEXT,
                cake_id TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                completed_at TEXT,
                FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE SET NULL
            )
        """)

        # Customer Orders / WhatsApp Enquiries (ZERO PRICE)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS enquiries (
                id TEXT PRIMARY KEY,
                enquiry_number TEXT UNIQUE,
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                cake_name TEXT NOT NULL,
                cake_image_url TEXT,
                flavour TEXT,
                selected_size TEXT,
                custom_message TEXT,
                delivery_date TEXT,
                admin_notes TEXT,
                status TEXT NOT NULL DEFAULT 'New',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        # Migration: Ensure all columns exist on enquiries table
        for col_name, col_type in [
            ("enquiry_number", "TEXT"),
            ("cake_image_url", "TEXT"),
            ("delivery_date", "TEXT"),
            ("admin_notes", "TEXT"),
        ]:
            try:
                cursor.execute(f"ALTER TABLE enquiries ADD COLUMN {col_name} {col_type}")
                conn.commit()
            except Exception:
                pass

        # Backfill any existing enquiries missing an enquiry_number
        try:
            cursor.execute("SELECT id FROM enquiries WHERE enquiry_number IS NULL OR enquiry_number = ''")
            rows_to_backfill = cursor.fetchall()
            for r in rows_to_backfill:
                eid = r[0]
                for _ in range(50):
                    cand = f"LL-{random.randint(1000, 9999)}"
                    cursor.execute("SELECT 1 FROM enquiries WHERE enquiry_number = ?", (cand,))
                    if not cursor.fetchone():
                        cursor.execute("UPDATE enquiries SET enquiry_number = ? WHERE id = ?", (cand, eid))
                        conn.commit()
                        break
        except Exception:
            pass



        # Seed categories if empty
        cursor.execute("SELECT COUNT(*) FROM categories")
        if cursor.fetchone()[0] == 0:
            now = datetime.datetime.now(datetime.timezone.utc).isoformat()
            default_categories = [
                ('c0000000-0000-0000-0000-000000000001', 'Birthday Cakes', 'birthday-cakes', 'Handcrafted celebration centrepieces tailored for unforgettable birthday milestones.', '/categories/birthday.webp', 'PartyPopper', '#FFF5F7', '#E11D48', 1, 1, now, now),
                ('c0000000-0000-0000-0000-000000000002', 'Wedding & Tiered Cakes', 'wedding-tiered-cakes', 'Grand architectural multi-tiered masterworks with delicate textures, florals and luxury accents.', '/categories/tiered.webp', 'Crown', '#F9F9F9', '#C89B3C', 1, 2, now, now),
                ('c0000000-0000-0000-0000-000000000003', 'Anniversary & Romance', 'anniversary-cakes', 'Romantic signature cakes, heart designs, and milestone celebration confections.', '/categories/romantic.webp', 'Heart', '#FFF9EE', '#B88E3E', 1, 3, now, now),
                ('c0000000-0000-0000-0000-000000000004', 'Bento & Petite Cakes', 'bento-petite-cakes', 'Minimalist Korean-style lunchbox bento cakes crafted for intimate celebrations.', '/categories/bento.webp', 'Shapes', '#F4F6F8', '#475569', 1, 4, now, now),
                ('c0000000-0000-0000-0000-000000000005', 'Botanical & Floral Cakes', 'botanical-floral-cakes', 'Intricately piped sugar florals, fresh blossoms, and delicate botanical infusions.', '/categories/floral.webp', 'Flower2', '#FFF0F3', '#DB2777', 1, 5, now, now),
                ('c0000000-0000-0000-0000-000000000006', 'Pure Belgian Chocolate', 'belgian-chocolate-cakes', 'Decadent single-origin Belgian chocolate ganache, silk truffles, and rich cocoa sponges.', '/categories/chocolate.webp', 'Cookie', '#F6F1EA', '#6B4423', 1, 6, now, now),
                ('c0000000-0000-0000-0000-000000000007', 'Custom & Theme Cakes', 'custom-theme-cakes', 'Bespoke novelty, themed creations, and personalized artistry crafted to your imagination.', '/categories/custom.webp', 'Palette', '#FDF2EC', '#EA580C', 1, 7, now, now),
            ]
            cursor.executemany("""
                INSERT INTO categories (id, name, slug, description, image_url, icon, color, accent, active, sort_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, default_categories)

        conn.commit()
        conn.close()

    # --- CATEGORIES ---
    def get_categories(self, active_only: bool = True) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        if active_only:
            cursor.execute("SELECT * FROM categories WHERE active = 1 ORDER BY sort_order ASC, name ASC")
        else:
            cursor.execute("SELECT * FROM categories ORDER BY sort_order ASC, name ASC")
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def get_category_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM categories WHERE slug = ?", (slug,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def get_category_by_id(self, cat_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM categories WHERE id = ?", (cat_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def create_category(self, data: Dict[str, Any]) -> Dict[str, Any]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cat_id = data.get("id") or str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        name = data["name"]
        slug = data.get("slug") or re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        description = data.get("description", "")
        image_url = data.get("image_url", "/categories/default.webp")
        icon = data.get("icon", "Cake")
        color = data.get("color", "#FAF6F0")
        accent = data.get("accent", "#B88E3E")
        active = 1 if data.get("active", True) else 0
        sort_order = int(data.get("sort_order", 0))
        
        cursor.execute("""
            INSERT INTO categories (id, name, slug, description, image_url, icon, color, accent, active, sort_order, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (cat_id, name, slug, description, image_url, icon, color, accent, active, sort_order, now, now))
        conn.commit()
        
        cursor.execute("SELECT * FROM categories WHERE id = ?", (cat_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row)

    def update_category(self, cat_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        allowed_keys = {"name", "slug", "description", "image_url", "icon", "color", "accent", "active", "sort_order"}
        set_clauses = []
        values = []
        for k, v in updates.items():
            if k in allowed_keys and v is not None:
                if k == "active":
                    v = 1 if v else 0
                set_clauses.append(f"{k} = ?")
                values.append(v)
                
        if not set_clauses:
            conn.close()
            return self.get_category_by_id(cat_id)
            
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        set_clauses.append("updated_at = ?")
        values.append(now)
        values.append(cat_id)
        
        sql = f"UPDATE categories SET {', '.join(set_clauses)} WHERE id = ?"
        cursor.execute(sql, tuple(values))
        conn.commit()
        
        cursor.execute("SELECT * FROM categories WHERE id = ?", (cat_id,))
        row = cursor.fetchone()
        conn.close()
        
        # Async sync to Postgres if connected
        try:
            pg_set = [f"{k} = %s" for k in updates if k in allowed_keys and updates[k] is not None]
            pg_set.append("updated_at = %s")
            pg_sql = f"UPDATE categories SET {', '.join(pg_set)} WHERE id = %s"
            self._sync_to_postgres(pg_sql, tuple(values))
        except Exception:
            pass
            
        return dict(row) if row else None

    # --- CAKES ---
    def get_cakes(self, status: Optional[str] = None, category_id: Optional[str] = None, flavour: Optional[str] = None, search: Optional[str] = None, sort_by: Optional[str] = None, placement: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        query = """
            SELECT c.*, cat.name as category_name, cat.slug as category_slug
            FROM cakes c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE 1=1
        """
        params = []
        if status:
            status_list = [s.strip() for s in status.split(",") if s.strip()]
            if len(status_list) == 1:
                query += " AND c.status = ?"
                params.append(status_list[0])
            elif len(status_list) > 1:
                placeholders = ",".join(["?"] * len(status_list))
                query += f" AND c.status IN ({placeholders})"
                params.extend(status_list)
        if category_id:
            query += " AND c.category_id = ?"
            params.append(category_id)
        if flavour:
            query += " AND LOWER(c.flavour) LIKE LOWER(?)"
            params.append(f"%{flavour}%")
        if placement:
            if placement == "hero":
                query += " AND c.is_hero = 1"
            elif placement == "trending":
                query += " AND c.is_trending = 1"
            elif placement == "inspiration":
                query += " AND c.is_inspiration = 1"
            elif placement == "none":
                query += " AND (c.is_hero = 0 OR c.is_hero IS NULL) AND (c.is_trending = 0 OR c.is_trending IS NULL) AND (c.is_inspiration = 0 OR c.is_inspiration IS NULL)"
        if search:
            clean_search = search.strip().lstrip("#")
            query += " AND (c.display_id = ? OR LOWER(c.name) LIKE LOWER(?) OR LOWER(c.flavour) LIKE LOWER(?) OR LOWER(c.description) LIKE LOWER(?))"
            search_param = f"%{search}%"
            params.extend([clean_search, search_param, search_param, search_param])
            
        if sort_by == "oldest":
            query += " ORDER BY c.created_at ASC LIMIT ?"
        elif sort_by == "id_asc":
            query += " ORDER BY CAST(COALESCE(c.display_id, '9999') AS INTEGER) ASC, c.created_at ASC LIMIT ?"
        elif sort_by == "id_desc":
            query += " ORDER BY CAST(COALESCE(c.display_id, '0') AS INTEGER) DESC, c.created_at DESC LIMIT ?"
        elif sort_by == "name_asc":
            query += " ORDER BY LOWER(c.name) ASC LIMIT ?"
        elif sort_by == "name_desc":
            query += " ORDER BY LOWER(c.name) DESC LIMIT ?"
        else:
            query += " ORDER BY c.created_at DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = []
        for row in cursor.fetchall():
            d = dict(row)
            if isinstance(d.get("available_sizes"), str):
                try:
                    d["available_sizes"] = json.loads(d["available_sizes"])
                except Exception:
                    d["available_sizes"] = ["0.5 kg", "1.0 kg"]
            if isinstance(d.get("ai_metadata"), str):
                try:
                    d["ai_metadata"] = json.loads(d["ai_metadata"])
                except Exception:
                    d["ai_metadata"] = {}
            d["is_hero"] = bool(d.get("is_hero"))
            d["is_trending"] = bool(d.get("is_trending"))
            d["is_inspiration"] = bool(d.get("is_inspiration"))
            rows.append(d)
        conn.close()
        return rows

    def get_cake_by_id(self, cake_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, cat.name as category_name, cat.slug as category_slug
            FROM cakes c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.id = ?
        """, (cake_id,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        if isinstance(d.get("available_sizes"), str):
            try:
                d["available_sizes"] = json.loads(d["available_sizes"])
            except Exception:
                d["available_sizes"] = ["0.5 kg", "1.0 kg"]
        if isinstance(d.get("ai_metadata"), str):
            try:
                d["ai_metadata"] = json.loads(d["ai_metadata"])
            except Exception:
                d["ai_metadata"] = {}
        d["is_hero"] = bool(d.get("is_hero"))
        d["is_trending"] = bool(d.get("is_trending"))
        d["is_inspiration"] = bool(d.get("is_inspiration"))
        return d

    def get_cake_by_slug(self, slug: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT c.*, cat.name as category_name, cat.slug as category_slug
            FROM cakes c
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.slug = ?
        """, (slug,))
        row = cursor.fetchone()
        conn.close()
        if not row:
            return None
        d = dict(row)
        if isinstance(d.get("available_sizes"), str):
            try:
                d["available_sizes"] = json.loads(d["available_sizes"])
            except Exception:
                d["available_sizes"] = ["0.5 kg", "1.0 kg"]
        if isinstance(d.get("ai_metadata"), str):
            try:
                d["ai_metadata"] = json.loads(d["ai_metadata"])
            except Exception:
                d["ai_metadata"] = {}
        d["is_hero"] = bool(d.get("is_hero"))
        d["is_trending"] = bool(d.get("is_trending"))
        d["is_inspiration"] = bool(d.get("is_inspiration"))
        return d

    def create_cake(self, cake_data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates a pending cake. Mandatory: image_url. Status MUST start as 'pending'."""
        if not cake_data.get("image_url"):
            raise ValueError("A cake cannot be created or published without a valid image.")

        cake_id = cake_data.get("id") or str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        sizes_json = json.dumps(cake_data.get("available_sizes", ["0.5 kg (Small)", "1.0 kg (Medium)", "2.0 kg (Large)"]))
        ai_meta_json = json.dumps(cake_data.get("ai_metadata", {}))
        
        # Ensure slug uniqueness
        base_slug = cake_data.get("slug")
        if not base_slug:
            import re
            base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', cake_data.get("name", "cake").lower()).strip('-')
        
        slug = base_slug
        conn = self._get_conn()
        cursor = conn.cursor()
        
        # Check if slug exists
        cursor.execute("SELECT COUNT(*) FROM cakes WHERE slug = ?", (slug,))
        if cursor.fetchone()[0] > 0:
            slug = f"{base_slug}-{str(uuid.uuid4())[:6]}"

        # Determine 4-digit display_id
        display_id = cake_data.get("display_id")
        if not display_id:
            cursor.execute("SELECT MAX(CAST(display_id AS INTEGER)) FROM cakes WHERE display_id GLOB '[0-9][0-9][0-9][0-9]'")
            max_row = cursor.fetchone()
            current_max = max_row[0] if max_row and max_row[0] else 1000
            display_id = str(current_max + 1)

        is_hero = 1 if cake_data.get("is_hero") else 0
        is_trending = 1 if cake_data.get("is_trending") else 0
        is_inspiration = 1 if cake_data.get("is_inspiration") else 0

        cursor.execute("""
            INSERT INTO cakes (
                id, name, slug, flavour, category_id, description,
                available_sizes, image_url, cloudinary_public_id, status,
                ai_metadata, created_at, updated_at, published_at, display_id,
                is_hero, is_trending, is_inspiration
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cake_id,
            cake_data.get("name", "Untitled Confection"),
            slug,
            cake_data.get("flavour", "Vanilla Bean"),
            cake_data.get("category_id"),
            cake_data.get("description", ""),
            sizes_json,
            cake_data.get("image_url"),
            cake_data.get("cloudinary_public_id"),
            "pending",  # STRICT: AI or upload MUST ALWAYS start as pending
            ai_meta_json,
            now,
            now,
            None,
            display_id,
            is_hero,
            is_trending,
            is_inspiration
        ))
        conn.commit()
        conn.close()

        # Also sync to Supabase PostgreSQL in real-time
        self._sync_to_postgres("""
            INSERT INTO cakes (
                id, name, slug, flavour, category_id, description,
                available_sizes, image_url, cloudinary_public_id, status,
                ai_metadata, created_at, updated_at, published_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (slug) DO UPDATE SET
                name = EXCLUDED.name,
                image_url = EXCLUDED.image_url,
                updated_at = EXCLUDED.updated_at;
        """, (
            cake_id,
            cake_data.get("name", "Untitled Confection"),
            slug,
            cake_data.get("flavour", "Vanilla Bean"),
            cake_data.get("category_id"),
            cake_data.get("description", ""),
            sizes_json,
            cake_data.get("image_url"),
            cake_data.get("cloudinary_public_id"),
            "pending",
            ai_meta_json,
            now,
            now,
            None
        ))

        return self.get_cake_by_id(cake_id)

    def update_cake(self, cake_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        fields = []
        params = []
        
        for k, v in updates.items():
            if k in ("name", "slug", "flavour", "category_id", "description", "image_url", "cloudinary_public_id", "status", "display_id"):
                fields.append(f"{k} = ?")
                params.append(v)
            elif k in ("is_hero", "is_trending", "is_inspiration"):
                fields.append(f"{k} = ?")
                params.append(1 if v else 0)
            elif k == "available_sizes":
                fields.append("available_sizes = ?")
                params.append(json.dumps(v) if not isinstance(v, str) else v)
            elif k == "ai_metadata":
                fields.append("ai_metadata = ?")
                params.append(json.dumps(v) if not isinstance(v, str) else v)
            elif k == "published_at":
                fields.append("published_at = ?")
                params.append(v)
                
        fields.append("updated_at = ?")
        params.append(now)
        params.append(cake_id)
        
        cursor.execute(f"UPDATE cakes SET {', '.join(fields)} WHERE id = ?", params)
        conn.commit()
        conn.close()

        # Supabase PostgreSQL replication
        try:
            pg_fields = []
            pg_params = []
            for k, v in updates.items():
                if k in ("name", "slug", "flavour", "category_id", "description", "image_url", "cloudinary_public_id", "status"):
                    pg_fields.append(f"{k} = %s")
                    pg_params.append(v)
                elif k in ("is_hero", "is_trending", "is_inspiration"):
                    pg_fields.append(f"{k} = %s")
                    pg_params.append(1 if v else 0)
                elif k == "available_sizes":
                    pg_fields.append("available_sizes = %s")
                    pg_params.append(json.dumps(v) if not isinstance(v, str) else v)
                elif k == "ai_metadata":
                    pg_fields.append("ai_metadata = %s")
                    pg_params.append(json.dumps(v) if not isinstance(v, str) else v)
                elif k == "published_at":
                    pg_fields.append("published_at = %s")
                    pg_params.append(v)
            if pg_fields:
                pg_fields.append("updated_at = %s")
                pg_params.append(now)
                pg_params.append(cake_id)
                self._sync_to_postgres(f"UPDATE cakes SET {', '.join(pg_fields)} WHERE id = %s", tuple(pg_params))
        except Exception:
            pass

        return self.get_cake_by_id(cake_id)

    def toggle_cake_placement(self, cake_id: str, field: str, value: Optional[bool] = None) -> Optional[Dict[str, Any]]:
        if field not in ("is_hero", "is_trending", "is_inspiration"):
            raise ValueError(f"Invalid placement field: {field}")
        cake = self.get_cake_by_id(cake_id)
        if not cake:
            return None
        new_val = (1 if value else 0) if value is not None else (0 if cake.get(field) else 1)
        return self.update_cake(cake_id, {field: new_val})

    def publish_cake(self, cake_id: str) -> Optional[Dict[str, Any]]:
        cake = self.get_cake_by_id(cake_id)
        if not cake:
            raise ValueError(f"Cake with ID {cake_id} not found.")
        if not cake.get("image_url"):
            raise ValueError("Validation Error: Cake cannot be published without a valid image.")
            
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        return self.update_cake(cake_id, {
            "status": "published",
            "published_at": now
        })

    def approve_cake(self, cake_id: str) -> Optional[Dict[str, Any]]:
        return self.update_cake(cake_id, {"status": "approved"})

    def reject_cake(self, cake_id: str) -> Optional[Dict[str, Any]]:
        return self.update_cake(cake_id, {"status": "rejected"})

    def delete_cake(self, cake_id: str) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM cakes WHERE id = ?", (cake_id,))
        rows = cursor.rowcount
        conn.commit()
        conn.close()
        
        self._sync_to_postgres("DELETE FROM cakes WHERE id = %s", (cake_id,))
        return rows > 0

    def auto_sync_cake_size(self, cake_identifier: str, new_size: str) -> Optional[Dict[str, Any]]:
        """
        Ensures that new_size (e.g. '1.5 kg') is included in the cake's available_sizes list.
        If not present, appends it and updates the database.
        Matches cake by ID, exact name, or partial name.
        """
        if not cake_identifier or not new_size or not new_size.strip():
            return None

        size_clean = new_size.strip()
        conn = self._get_conn()
        cursor = conn.cursor()

        # 1. Try finding by ID
        cursor.execute("SELECT * FROM cakes WHERE id = ?", (cake_identifier,))
        row = cursor.fetchone()

        # 2. Try finding by exact name
        if not row:
            cursor.execute("SELECT * FROM cakes WHERE LOWER(name) = LOWER(?)", (cake_identifier.strip(),))
            row = cursor.fetchone()

        # 3. Try finding by matching substring
        if not row:
            cursor.execute(
                "SELECT * FROM cakes WHERE LOWER(?) LIKE '%' || LOWER(name) || '%' OR LOWER(name) LIKE '%' || LOWER(?) || '%'",
                (cake_identifier.strip(), cake_identifier.strip())
            )
            row = cursor.fetchone()

        conn.close()
        if not row:
            return None

        cake = dict(row)
        cake_id = cake["id"]

        # Parse existing sizes
        sizes: List[str] = []
        raw_sizes = cake.get("available_sizes")
        if isinstance(raw_sizes, str):
            try:
                sizes = json.loads(raw_sizes)
            except Exception:
                sizes = ["0.5 kg", "1.0 kg"]
        elif isinstance(raw_sizes, list):
            sizes = list(raw_sizes)
        else:
            sizes = ["0.5 kg", "1.0 kg"]

        # Check if size already exists
        clean_lower = size_clean.lower()
        exists = any(
            clean_lower == s.lower() or
            (clean_lower.split()[0] in s.lower() and "kg" in clean_lower and "kg" in s.lower() and clean_lower.split()[0] == s.lower().split()[0])
            for s in sizes
        )

        if not exists:
            sizes.append(size_clean)

            def extract_weight(s: str) -> float:
                try:
                    import re
                    m = re.search(r"(\d+(?:\.\d+)?)", s)
                    return float(m.group(1)) if m else 999.0
                except Exception:
                    return 999.0

            sizes.sort(key=extract_weight)
            self.update_cake(cake_id, {"available_sizes": sizes})
            print(f"[Cake Size Auto-Sync] Added size '{size_clean}' to cake '{cake.get('name')}' (ID: {cake_id}). Available sizes now: {sizes}")
            return self.get_cake_by_id(cake_id)

        return cake

    # --- JOBS ---
    def create_job(self, file_name: str, original_size_bytes: int = 0) -> Dict[str, Any]:
        job_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO processing_jobs (
                id, file_name, original_size_bytes, status, progress, created_at, updated_at
            ) VALUES (?, ?, ?, 'queued', 0, ?, ?)
        """, (job_id, file_name, original_size_bytes, now, now))
        conn.commit()
        conn.close()
        
        if self.supabase:
            try:
                self.supabase.table("processing_jobs").insert({
                    "id": job_id,
                    "file_name": file_name,
                    "original_size_bytes": original_size_bytes,
                    "status": "queued",
                    "progress": 0,
                    "created_at": now,
                    "updated_at": now
                }).execute()
            except Exception:
                pass
                
        return self.get_job(job_id)

    def update_job(
        self,
        job_id: str,
        status: Optional[str] = None,
        progress: Optional[int] = None,
        error_message: Optional[str] = None,
        cake_id: Optional[str] = None,
        processed_size_bytes: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        fields = ["updated_at = ?"]
        params = [now]
        
        if status:
            fields.append("status = ?")
            params.append(status)
            if status in ("completed", "failed"):
                fields.append("completed_at = ?")
                params.append(now)
        if progress is not None:
            fields.append("progress = ?")
            params.append(progress)
        if error_message is not None:
            fields.append("error_message = ?")
            params.append(error_message)
        if cake_id is not None:
            fields.append("cake_id = ?")
            params.append(cake_id)
        if processed_size_bytes is not None:
            fields.append("processed_size_bytes = ?")
            params.append(processed_size_bytes)
            
        params.append(job_id)
        cursor.execute(f"UPDATE processing_jobs SET {', '.join(fields)} WHERE id = ?", params)
        conn.commit()
        conn.close()
        
        if self.supabase:
            try:
                payload = {"updated_at": now}
                if status: payload["status"] = status
                if progress is not None: payload["progress"] = progress
                if error_message is not None: payload["error_message"] = error_message
                if cake_id is not None: payload["cake_id"] = cake_id
                if processed_size_bytes is not None: payload["processed_size_bytes"] = processed_size_bytes
                if status in ("completed", "failed"): payload["completed_at"] = now
                self.supabase.table("processing_jobs").update(payload).eq("id", job_id).execute()
            except Exception:
                pass
                
        return self.get_job(job_id)

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT j.*, c.name as cake_name, c.image_url as cake_image_url, c.slug as cake_slug, c.status as cake_status
            FROM processing_jobs j
            LEFT JOIN cakes c ON j.cake_id = c.id
            WHERE j.id = ?
        """, (job_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def get_jobs(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT j.*, c.name as cake_name, c.image_url as cake_image_url, c.slug as cake_slug, c.status as cake_status
            FROM processing_jobs j
            LEFT JOIN cakes c ON j.cake_id = c.id
            ORDER BY j.created_at DESC LIMIT ?
        """, (limit,))
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    # --- REVIEWS ---
    def get_reviews(self, status: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        if status:
            cursor.execute("SELECT * FROM reviews WHERE status = ? ORDER BY created_at DESC LIMIT ?", (status, limit))
        else:
            cursor.execute("SELECT * FROM reviews ORDER BY created_at DESC LIMIT ?", (limit,))
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def create_review(self, review_data: Dict[str, Any]) -> Dict[str, Any]:
        review_id = str(uuid.uuid4())
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO reviews (
                id, customer_name, customer_location, review_text, rating,
                cake_id, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
        """, (
            review_id,
            review_data["customer_name"],
            review_data.get("customer_location", "Verified Guest"),
            review_data["review_text"],
            int(review_data["rating"]),
            review_data.get("cake_id"),
            now
        ))
        conn.commit()
        conn.close()
        return {"id": review_id, "status": "pending", **review_data}

    def update_review_status(self, review_id: str, status: str) -> bool:
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        approved_at = now if status == "approved" else None
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE reviews SET status = ?, approved_at = ? WHERE id = ?
        """, (status, approved_at, review_id))
        rows = cursor.rowcount
        conn.commit()
        conn.close()
        return rows > 0

    def delete_review(self, review_id: str) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM reviews WHERE id = ?", (review_id,))
        rows = cursor.rowcount
        conn.commit()
        conn.close()
        return rows > 0

    def restore_cake(self, cake_id: str) -> Optional[Dict[str, Any]]:
        """Restores a rejected cake back to pending state for review."""
        return self.update_cake(cake_id, {"status": "pending"})

    # --- CUSTOMER ENQUIRIES / ORDERS ---
    def _generate_unique_enquiry_number(self) -> str:
        conn = self._get_conn()
        cursor = conn.cursor()
        for _ in range(100):
            cand = f"LL-{random.randint(1000, 9999)}"
            cursor.execute("SELECT 1 FROM enquiries WHERE enquiry_number = ?", (cand,))
            if not cursor.fetchone():
                conn.close()
                return cand
        conn.close()
        return f"LL-{random.randint(10000, 99999)}"

    def create_enquiry(self, data: Dict[str, Any]) -> Dict[str, Any]:
        enquiry_id = data.get("id") or f"enq-{str(uuid.uuid4())[:8]}"
        enquiry_number = data.get("enquiry_number") or self._generate_unique_enquiry_number()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        cake_image_url = data.get("cake_image_url") or ""
        if not cake_image_url and data.get("cake_name"):
            try:
                conn_tmp = self._get_conn()
                cur_tmp = conn_tmp.cursor()
                cur_tmp.execute("SELECT image_url FROM cakes WHERE name = ? LIMIT 1", (data.get("cake_name"),))
                row_img = cur_tmp.fetchone()
                if row_img and row_img[0]:
                    cake_image_url = row_img[0]
                conn_tmp.close()
            except Exception:
                pass

        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO enquiries (
                id, enquiry_number, customer_name, phone, cake_name, cake_image_url, flavour, selected_size,
                custom_message, delivery_date, admin_notes, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            enquiry_id,
            enquiry_number,
            data.get("customer_name", "Anonymous Patron"),
            data.get("phone", ""),
            data.get("cake_name", "Bespoke Confection"),
            cake_image_url,
            data.get("flavour", "Chef's Signature"),
            data.get("selected_size", "1.0 kg"),
            data.get("custom_message", ""),
            data.get("delivery_date", ""),
            data.get("admin_notes", ""),
            data.get("status", "New"),
            now,
            now
        ))
        conn.commit()
        conn.close()

        if self.supabase:
            try:
                self.supabase.table("enquiries").insert({
                    "id": enquiry_id,
                    "enquiry_number": enquiry_number,
                    "customer_name": data.get("customer_name"),
                    "phone": data.get("phone"),
                    "cake_name": data.get("cake_name"),
                    "cake_image_url": cake_image_url,
                    "flavour": data.get("flavour"),
                    "selected_size": data.get("selected_size"),
                    "custom_message": data.get("custom_message"),
                    "delivery_date": data.get("delivery_date", ""),
                    "admin_notes": data.get("admin_notes", ""),
                    "status": data.get("status", "New"),
                    "created_at": now,
                    "updated_at": now
                }).execute()
            except Exception:
                pass

        return self.get_enquiry_by_id(enquiry_id)

    def get_enquiry_by_id(self, enquiry_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM enquiries WHERE id = ?", (enquiry_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None

    def get_enquiry_by_number(self, enquiry_number: str) -> Optional[Dict[str, Any]]:
        cleaned = enquiry_number.strip().upper().replace("#", "")
        variants = [cleaned]
        if not cleaned.startswith("LL-") and cleaned.isdigit():
            variants.append(f"LL-{cleaned}")
        elif cleaned.startswith("LL-"):
            variants.append(cleaned[3:])

        conn = self._get_conn()
        cursor = conn.cursor()
        row = None
        for v in variants:
            cursor.execute("SELECT * FROM enquiries WHERE UPPER(enquiry_number) = ? OR UPPER(id) = ?", (v, v))
            row = cursor.fetchone()
            if row:
                break
        conn.close()
        if row:
            res = dict(row)
            if not res.get("cake_image_url") and res.get("cake_name"):
                try:
                    c = self._get_conn()
                    cur = c.cursor()
                    cur.execute("SELECT image_url FROM cakes WHERE name = ? LIMIT 1", (res["cake_name"],))
                    ci = cur.fetchone()
                    if ci and ci[0]:
                        res["cake_image_url"] = ci[0]
                    c.close()
                except Exception:
                    pass
            return res
        return None

    def get_enquiries(self, status: Optional[str] = None, search: Optional[str] = None, limit: int = 200) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM enquiries WHERE 1=1"
        params = []
        if status and status.lower() != "all":
            query += " AND status = ?"
            params.append(status)
        if search:
            query += " AND (enquiry_number LIKE ? OR customer_name LIKE ? OR phone LIKE ? OR cake_name LIKE ?)"
            s_param = f"%{search.strip()}%"
            params.extend([s_param, s_param, s_param, s_param])
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def update_enquiry(self, enquiry_id: str, fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        allowed = {"status", "selected_size", "delivery_date", "admin_notes", "flavour", "cake_name", "custom_message"}
        updates = {k: v for k, v in fields.items() if k in allowed and v is not None}
        if not updates:
            return self.get_enquiry_by_id(enquiry_id)

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        updates["updated_at"] = now

        set_clauses = [f"{k} = ?" for k in updates.keys()]
        params = list(updates.values())
        params.append(enquiry_id)

        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute(f"UPDATE enquiries SET {', '.join(set_clauses)} WHERE id = ?", params)
        conn.commit()
        conn.close()

        if self.supabase:
            try:
                self.supabase.table("enquiries").update(updates).eq("id", enquiry_id).execute()
            except Exception:
                pass

        return self.get_enquiry_by_id(enquiry_id)

    def update_enquiry_status(self, enquiry_id: str, status: str) -> Optional[Dict[str, Any]]:
        return self.update_enquiry(enquiry_id, {"status": status})

    def delete_enquiry(self, enquiry_id: str) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM enquiries WHERE id = ?", (enquiry_id,))
        rows = cursor.rowcount
        conn.commit()
        conn.close()
        return rows > 0

    # --- ADMIN STATS ---
    def get_admin_stats(self) -> Dict[str, Any]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute("SELECT status, COUNT(*) FROM cakes GROUP BY status")
        cake_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        cursor.execute("SELECT status, COUNT(*) FROM processing_jobs GROUP BY status")
        job_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        cursor.execute("SELECT COUNT(*) FROM reviews WHERE status = 'pending'")
        pending_reviews = cursor.fetchone()[0]

        cursor.execute("SELECT status, COUNT(*) FROM enquiries GROUP BY status")
        enquiry_counts = {row[0]: row[1] for row in cursor.fetchall()}

        conn.close()
        return {
            "pending": cake_counts.get("pending", 0),
            "approved": cake_counts.get("approved", 0),
            "published": cake_counts.get("published", 0),
            "total_approved": cake_counts.get("approved", 0) + cake_counts.get("published", 0),
            "rejected": cake_counts.get("rejected", 0),
            "processing": job_counts.get("processing", 0) + job_counts.get("queued", 0) + job_counts.get("image_processed", 0) + job_counts.get("ai_processing", 0) + job_counts.get("uploading", 0),
            "failed": job_counts.get("failed", 0),
            "pending_reviews": pending_reviews,
            "enquiries": {
                "total": sum(enquiry_counts.values()),
                "new": enquiry_counts.get("New", 0),
                "contacted": enquiry_counts.get("Contacted", 0),
                "confirmed": enquiry_counts.get("Confirmed", 0),
                "baking": enquiry_counts.get("Baking", 0),
                "ready": enquiry_counts.get("Ready", 0),
                "delivered": enquiry_counts.get("Delivered", 0),
                "completed": enquiry_counts.get("Completed", 0) + enquiry_counts.get("Delivered", 0),
                "cancelled": enquiry_counts.get("Cancelled", 0),
            }
        }

db = Database()
