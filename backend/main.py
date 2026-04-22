import os
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the Google GenAI SDK
import google.genai as genai
from google.genai import types

# Import Local DB Utilities
from db_utils import log_detection, get_recent_detections

# Import local JAX/Flax model
from model_inference import get_detector

# This creates our API app
app = FastAPI()

# ----------------------------
# Gemini explanation helper
# ----------------------------
def _safe_gemini_explanation(*, image_bytes: bytes, mime_type: str, verdict: str, confidence: float):
    """
    Returns a short, user-facing explanation string, or None if Gemini isn't configured.
    We keep this best-effort so detection still works without Gemini.
    """
    if client is None:
        return None

    # Only generate explanation when we're flagging the media.
    if verdict not in ("FAKE", "UNSURE"):
        return None

    try:
        prompt = (
            "You are helping explain a deepfake detector's result to an end user.\n"
            f"Local model verdict: {verdict}. Confidence: {confidence:.3f}.\n\n"
            "Task:\n"
            "- Inspect the provided image.\n"
            "- Provide 2–4 concise bullet points describing *visual artifacts* that often correlate with manipulation.\n"
            "- Use examples like: unnatural skin texture/noise patterns, edge halos, inconsistent lighting/shadows, "
            "compression artifacts, warping around facial landmarks, asymmetry, or distortion.\n"
            "- Do NOT claim certainty; phrase as 'possible indicators' and keep it short.\n\n"
            "Output format:\n"
            "- Bullet list only (no title, no extra paragraphs)."
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt,
            ],
        )

        text = getattr(response, "text", None)
        if not text:
            return None

        # Keep response compact for UI.
        return text.strip()
    except Exception as e:
        print(f"Warning: Gemini explanation generation failed: {e}")
        return None

# ----------------------------
# Gemini verdict helper
# ----------------------------
def _safe_gemini_verdict(*, image_bytes: bytes, mime_type: str):
    """
    Returns Gemini's best-effort classification: REAL / FAKE / UNSURE, or None if Gemini isn't configured.
    """
    if client is None:
        return None

    try:
        prompt = (
            "Classify whether the image looks like a deepfake.\n"
            "Return EXACTLY one of these tokens and nothing else:\n"
            "REAL\n"
            "FAKE\n"
            "UNSURE\n"
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt,
            ],
        )

        text = (getattr(response, "text", "") or "").strip().upper()
        if text in ("REAL", "FAKE", "UNSURE"):
            return text

        # Sometimes models wrap output; extract first matching token.
        for token in ("REAL", "FAKE", "UNSURE"):
            if token in text:
                return token
        return None
    except Exception as e:
        print(f"Warning: Gemini verdict generation failed: {e}")
        return None

# Initialize the Gemini client
client = None
try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        client = genai.Client(api_key=api_key)
    else:
        print("Warning: GEMINI_API_KEY is missing.")
except Exception as e:
    print(f"Warning: Could not initialize Gemini client. Error: {e}")

# This is a security feature (CORS). It tells the backend it is safe to 
# accept requests from our React frontend running on port 3000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        ["*"]
        if (os.environ.get("CORS_ALLOW_ORIGINS", "").strip() == "*")
        else (
            [
                o.strip()
                for o in os.environ.get("CORS_ALLOW_ORIGINS", "").split(",")
                if o.strip()
            ]
            or [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
            ]
        )
    ),
    # Browsers disallow credentialed requests with wildcard CORS; we also
    # set allow_credentials=false when allow_origins="*".
    allow_credentials=(
        False if (os.environ.get("CORS_ALLOW_ORIGINS", "").strip() == "*") else True
    ),
    allow_methods=["*"],
    allow_headers=["*"],
)

# This tells the API what to do when someone visits the main page "/"
@app.get("/")
def read_root():
    return {"message": "Hello! The Forgesight API is running."}

# Forensic Logs Endpoint
@app.get("/v1/audit")
def get_audit_logs(limit: int = 10):
    logs = get_recent_detections(limit)
    return {"logs": logs}

# This is the first REAL endpoint your frontend needs!
@app.post("/v1/detect/frame")
async def detect_frame(request: Request):
    # We use Request to accept the FormData blindly for now without needing extra libraries.
    form_data = await request.form()
    
    if "file" not in form_data:
        raise HTTPException(status_code=400, detail="No file uploaded")
        
    file_item = form_data["file"]
    image_bytes = await file_item.read()

    # Defensive check: this endpoint is for images only.
    mime_type = file_item.content_type or "image/jpeg"
    if not mime_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file for frame analysis.")
    
    try:
        # Get our local JAX model detector
        detector = get_detector()
        
        # Run inference
        result = detector.predict(image_bytes)

        # Optional: Gemini's own verdict (separate from our local model)
        gemini_verdict = _safe_gemini_verdict(image_bytes=image_bytes, mime_type=mime_type)
        if gemini_verdict:
            result["gemini_verdict"] = gemini_verdict
        
        # Optional: Gemini explanation for "why" the model flags it
        explanation = _safe_gemini_explanation(
            image_bytes=image_bytes,
            mime_type=mime_type,
            verdict=result.get("verdict", "UNSURE"),
            confidence=float(result.get("confidence", 0.0)),
        )
        if explanation:
            result["explanation"] = explanation

        # Log to local SQLite database
        try:
            log_detection(
                image_bytes, 
                result["verdict"], 
                result["confidence"]
            )
        except Exception as db_err:
            print(f"Warning: Failed to log to DB: {db_err}")
            
        return result

    except Exception as e:
        import traceback
        print(f"Error during local model inference: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Model analysis failed: {str(e)}")



