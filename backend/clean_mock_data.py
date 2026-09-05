import sqlite3
from backend.config import settings

def clean_sqlite():
    db_path = settings.DB_PATH
    print(f"[SQLite] Connecting to {db_path}...")
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    cursor.execute("DELETE FROM enquiries")
    enquiries_count = cursor.rowcount
    print(f"[SQLite] Deleted {enquiries_count} mock orders/enquiries.")

    cursor.execute("DELETE FROM reviews")
    reviews_count = cursor.rowcount
    print(f"[SQLite] Deleted {reviews_count} mock reviews.")

    conn.commit()
    conn.close()

def clean_postgres():
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

        try:
            cur.execute("DELETE FROM enquiries;")
            print("[PostgreSQL] Deleted all enquiries.")
        except Exception as e_enq:
            print(f"[PostgreSQL] Enquiries table notice: {e_enq}")

        try:
            cur.execute("DELETE FROM reviews;")
            print("[PostgreSQL] Deleted all reviews.")
        except Exception as e_rev:
            print(f"[PostgreSQL] Reviews table notice: {e_rev}")

        conn.close()
        print("[PostgreSQL] Cleaned Supabase data.")
    except Exception as e:
        print(f"[PostgreSQL] Notice: {e}")

if __name__ == "__main__":
    print("=== CLEANING MOCK ENQUIRIES & REVIEWS ===")
    clean_sqlite()
    clean_postgres()
    print("=== CLEANUP COMPLETE ===")
