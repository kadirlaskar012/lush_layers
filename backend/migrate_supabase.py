import os
import psycopg2
from pathlib import Path

SCHEMA_FILE = Path(__file__).resolve().parent.parent / "supabase" / "schema.sql"

HOST = "aws-0-ap-northeast-1.pooler.supabase.com"
PORT = 6543
USER = "postgres.phpisimuahahngdaeohg"
PASSWORD = "2IiVSM6jSwDN6dvr"
DBNAME = "postgres"

def apply_schema():
    print(f"Connecting to Supabase PostgreSQL at {HOST}:{PORT}...")
    conn = psycopg2.connect(
        host=HOST,
        port=PORT,
        user=USER,
        password=PASSWORD,
        dbname=DBNAME,
        connect_timeout=15
    )
    conn.autocommit = True
    cur = conn.cursor()

    print("Reading schema.sql...")
    sql_script = SCHEMA_FILE.read_text(encoding="utf-8")

    print("Executing schema.sql on Supabase...")
    cur.execute(sql_script)
    print("Schema applied successfully!")

    # Verify tables
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = [row[0] for row in cur.fetchall()]
    print("Verified public tables in Supabase:", tables)

    cur.execute("SELECT count(*) FROM categories;")
    cat_count = cur.fetchone()[0]
    print(f"Verified seed categories in Supabase: {cat_count}")

    conn.close()

if __name__ == "__main__":
    apply_schema()
