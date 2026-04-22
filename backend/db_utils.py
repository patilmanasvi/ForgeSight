import sqlite3
import hashlib
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "forensics.db")

def generate_media_hash(image_bytes: bytes) -> str:
    """Generates a SHA-256 hash for the media for provenance tracking."""
    return hashlib.sha256(image_bytes).hexdigest()

def log_detection(image_bytes: bytes, verdict: str, confidence: float):
    """
    Logs a single detection result to the local SQLite database.
    """
    if not os.path.exists(DB_PATH):
        print("Database not initialized. Make sure to run db.py first.")
        return

    media_hash = generate_media_hash(image_bytes)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO detections (
                session_id, media_hash, verdict, confidence_score, heart_rate, pog_variance, c2pa_valid
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            "anon_session", # Placeholder
            media_hash,
            verdict,
            confidence,
            None,
            0.0,
            False # Placeholder until C2PA validation is implemented
        ))
        conn.commit()
        print(f"Successfully logged detection {media_hash[:8]}... to local database.")
    except Exception as e:
        print(f"Failed to log detection: {e}")
    finally:
        conn.close()

def get_recent_detections(limit: int = 10):
    """
    Fetches the most recent detection logs from the database.
    """
    if not os.path.exists(DB_PATH):
        return []
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Return dict-like rows
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            SELECT id, timestamp, media_hash, verdict, confidence_score, heart_rate, c2pa_valid
            FROM detections
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"Failed to fetch detections: {e}")
        return []
    finally:
        conn.close()
