<div align="center">

<h1 align="center"><strong>ForgeSight</strong></h1>

### AI-Powered Deepfake Image Detection System


[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://reactjs.org/)
[![JAX](https://img.shields.io/badge/ML-JAX%20%2F%20Flax-A67C52)](https://jax.readthedocs.io/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python)](https://python.org)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-4A90D9?logo=vercel)](https://forgesight-polaris.vercel.app)

**ForgeSight** is an end-to-end deepfake image detection prototype that combines a modern React frontend, a FastAPI backend, and a custom JAX/Flax Hybrid Vision Transformer (HybridViT) model. Upload an image — get a verdict.

---

</div>

## ✨ What ForgeSight Does

| Feature | Description |
|---|---|
| 🖼️ **Image Upload** | Accept JPG, PNG, or WEBP via a clean browser interface |
| 🤖 **AI Inference** | Run a custom HybridViT model to classify image authenticity |
| 🏷️ **Verdict Engine** | Returns `REAL` or `FAKE` with a confidence score |
| 🔎 **Gemini Explanation** | Optionally uses Google Gemini to generate visual explanation bullets for suspicious media |
| 🗄️ **Forensic Logging** | Logs every detection to a local SQLite database (media hash + metadata) |
| 📋 **Audit Endpoint** | Query recent detections via a dedicated REST endpoint |

---

## 🏗️ Architecture Overview

```
Browser (React 18)
       │
       │  POST /v1/detect/frame  (multipart image)
       ▼
FastAPI Backend
       ├── model_inference.py  →  JAX/Flax HybridViT model
       ├── Gemini SDK          →  Optional natural-language explanation
       └── db.py / db_utils.py →  SQLite forensic audit log
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Core UI framework |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Icon system |
| **GSAP** | Advanced animation support |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server |
| **Python Multipart** | File upload handling |
| **Python Dotenv** | Environment variable management |
| **Google GenAI SDK** | Gemini-powered explanations |
| **SQLite** | Local forensic detection log |

### Machine Learning
| Technology | Purpose |
|---|---|
| **JAX + JAXLIB** | High-performance numerical computing |
| **Flax** | Neural network library on top of JAX |
| **HybridViT (custom)** | Core deepfake classification model |
| **Pillow** | Image preprocessing |
| **Msgpack** | Model weight serialization/loading |

---

## 📁 Project Structure

```text
ForgeSight/
│
├── forgesight-prod/              # ⚛️  React Frontend
│   ├── src/
│   │   ├── components/           # UI components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── utils/                # Helper utilities
│   │   └── App.jsx               # Root application
│   └── package.json
│
├── backend/                      # 🐍 FastAPI Backend + Inference
│   ├── main.py                   # App entry point & route definitions
│   ├── model_inference.py        # HybridViT inference logic
│   ├── db.py                     # SQLite schema setup
│   ├── db_utils.py               # DB read/write helpers
│   └── requirements.txt
│
└── ml_pipeline/                  # 🧠 Model Training Scripts
    ├── kaggle_training.py        # Training pipeline (Kaggle environment)
    └── requirements.txt
```

---

## 🚀 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- pip & npm

---

### 1 · Backend

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Initialize the SQLite database
python db.py

# Start the API server
uvicorn main:app --reload
```

> Backend runs at **http://localhost:8000**

---

### 2 · Frontend

```bash
# Navigate to frontend directory
cd forgesight-prod

# Install Node dependencies
npm install

# Start the development server
npm start
```

> Frontend runs at **http://localhost:3000**

---

### 3 · Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```


---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check / welcome message |
| `POST` | `/v1/detect/frame` | Upload an image and receive inference results |
| `GET` | `/v1/audit?limit=10` | Fetch recent detection log entries |

### Example Response — `/v1/detect/frame`

```json
{
  "verdict": "FAKE",
  "confidence": 0.94,
  "media_hash": "a3f9d...",
  "gemini_explanation": [
    "Unnatural skin texture near jawline",
    "Inconsistent lighting on left cheek",
    "Eye reflection artifacts detected"
  ]
}
```

---

## 🖥️ How to Use

1. Open **http://localhost:3000** in your browser
2. Navigate to the **Detection Console**
3. Upload a `.jpg`, `.png`, or `.webp` image
4. View the verdict (`REAL` / `FAKE`) and confidence score.

---

## 📺 Project Demo
Click the button or the image below to view the demo video on Google Drive.

[![Watch Demo Video](https://img.shields.io/badge/Demo-Play%20Video-red?style=for-the-badge&logo=googledrive)](https://drive.google.com/file/d/15Q9NLs9_dVcy4fKxDtjpQENn-04VS_pi/view?usp=drivesdk)

---

## 📄 License

This project is licensed under the **MIT License**

---
