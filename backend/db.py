import json
import uuid
import sqlite3
import datetime
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
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                cake_name TEXT NOT NULL,
                flavour TEXT,
                selected_size TEXT,
                custom_message TEXT,
                status TEXT NOT NULL DEFAULT 'New',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)



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
    def get_cakes(self, status: Optional[str] = None, category_id: Optional[str] = None, flavour: Optional[str] = None, search: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
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
        if search:
            query += " AND (LOWER(c.name) LIKE LOWER(?) OR LOWER(c.flavour) LIKE LOWER(?) OR LOWER(c.description) LIKE LOWER(?))"
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
            
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

        cursor.execute("""
            INSERT INTO cakes (
                id, name, slug, flavour, category_id, description,
                available_sizes, image_url, cloudinary_public_id, status,
                ai_metadata, created_at, updated_at, published_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            None
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
            if k in ("name", "slug", "flavour", "category_id", "description", "image_url", "cloudinary_public_id", "status"):
                fields.append(f"{k} = ?")
                params.append(v)
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

    def update_job(self, job_id: str, status: Optional[str] = None, progress: Optional[int] = None, error_message: Optional[str] = None, cake_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
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
    def create_enquiry(self, data: Dict[str, Any]) -> Dict[str, Any]:
        enquiry_id = data.get("id") or f"enq-{str(uuid.uuid4())[:8]}"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        conn = self._get_conn()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO enquiries (
                id, customer_name, phone, cake_name, flavour, selected_size,
                custom_message, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            enquiry_id,
            data.get("customer_name", "Anonymous Patron"),
            data.get("phone", ""),
            data.get("cake_name", "Bespoke Confection"),
            data.get("flavour", "Chef's Signature"),
            data.get("selected_size", "1.0 kg"),
            data.get("custom_message", ""),
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
                    "customer_name": data.get("customer_name"),
                    "phone": data.get("phone"),
                    "cake_name": data.get("cake_name"),
                    "flavour": data.get("flavour"),
                    "selected_size": data.get("selected_size"),
                    "custom_message": data.get("custom_message"),
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

    def get_enquiries(self, status: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM enquiries"
        params = []
        if status:
            query += " WHERE status = ?"
            params.append(status)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows

    def update_enquiry_status(self, enquiry_id: str, status: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        cursor.execute("""
            UPDATE enquiries SET status = ?, updated_at = ? WHERE id = ?
        """, (status, now, enquiry_id))
        conn.commit()
        conn.close()

        if self.supabase:
            try:
                self.supabase.table("enquiries").update({
                    "status": status,
                    "updated_at": now
                }).eq("id", enquiry_id).execute()
            except Exception:
                pass

        return self.get_enquiry_by_id(enquiry_id)

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
                "completed": enquiry_counts.get("Completed", 0),
                "cancelled": enquiry_counts.get("Cancelled", 0),
            }
        }

db = Database()
