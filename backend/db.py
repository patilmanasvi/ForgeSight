import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "forensics.db")

def init_db():
    """Initializes the local SQLite database for forensic analytics."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create the detections table based on the original BQ schema
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            session_id TEXT,
            media_hash TEXT NOT NULL,
            verdict TEXT NOT NULL,
            confidence_score REAL NOT NULL,
            heart_rate REAL,
            pog_variance REAL,
            c2pa_valid BOOLEAN,
            blockchain_tx_id TEXT
        )
    """)

    conn.commit()
    conn.close()
    print(f"Local database initialized at {DB_PATH}")

if __name__ == "__main__":
    init_db()
