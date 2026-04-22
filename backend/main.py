import os
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import google.genai as genai
from google.genai import types

from db_utils import log_detection, get_recent_detections
from model_inference import get_detector

# ----------------------------
# Load env
# ----------------------------
load_dotenv()

app = FastAPI()

# ----------------------------
# Gemini client
# ----------------------------
client = None
try:
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"Gemini init error: {e}")

# ----------------------------
# CORS FIXED
# ----------------------------
raw_origins = os.getenv("CORS_ALLOW_ORIGINS", "").strip()

if raw_origins == "*":
    origins = ["*"]
    allow_credentials = False
else:
    origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    if not origins:
        origins = ["https://forgesight-polaris.vercel.app"]
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Root
# ----------------------------
@app.get("/")
def read_root():
    return {"message": "ForgeSight API running"}

# ----------------------------
# Audit logs
# ----------------------------
@app.get("/v1/audit")
def get_audit_logs(limit: int = 10):
    return {"logs": get_recent_detections(limit)}

# ----------------------------
# Gemini helpers
# ----------------------------
def _safe_gemini_verdict(image_bytes, mime_type):
    if not client:
        return None
    try:
        prompt = "Return only: REAL / FAKE / UNSURE"
        response = client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt,
            ],
        )
        text = (response.text or "").strip().upper()
        return text if text in ["REAL", "FAKE", "UNSURE"] else None
    except:
        return None


def _safe_gemini_explanation(image_bytes, mime_type, verdict, confidence):
    if not client:
        return None
    if verdict not in ["FAKE", "UNSURE"]:
        return None

    try:
        prompt = (
            "Explain possible deepfake indicators in bullet points only."
        )

        response = client.models.generate_content(
            model="gemini-2.0-flash-001",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt,
            ],
        )

        return response.text.strip() if response.text else None
    except:
        return None

# ----------------------------
# MAIN DETECTION ENDPOINT
# ----------------------------
@app.post("/v1/detect/frame")
async def detect_frame(request: Request):
    print("🔵 Request received")
    form_data = await request.form()
    print("🟡 Form data parsed")
    
    if "file" not in form_data:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    file_item = form_data["file"]
    image_bytes = await file_item.read()
    mime_type = file_item.content_type or "image/jpeg"
    print(f"🟢 Image received: {len(image_bytes)} bytes, type: {mime_type}")
    
    if not mime_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only images allowed")
    
    try:
        print("⚙️ Loading detector...")
        detector = get_detector()
        print("✅ Detector loaded, running predict...")
        result = detector.predict(image_bytes)
        print(f"✅ Prediction done: {result}")

        # Gemini optional verdict
        gemini_verdict = _safe_gemini_verdict(image_bytes, mime_type)
        if gemini_verdict:
            result["gemini_verdict"] = gemini_verdict

         #Gemini explanation
        explanation = _safe_gemini_explanation(
            image_bytes,
            mime_type,
            result.get("verdict", "UNSURE"),
            float(result.get("confidence", 0.0)),
        )
        if explanation:
            result["explanation"] = explanation

        # DB log
        try:
            log_detection(image_bytes, result["verdict"], result["confidence"])
        except Exception as e:
            print("DB log failed:", e)

        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
