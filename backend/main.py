"""
NeuroSkin AI — FastAPI Application
Three endpoints:
  POST /api/analyze   → run dual CNN, return top-3 + symptoms
  POST /api/diagnose  → LLM/RAG final diagnosis
  POST /api/gradcam   → Grad-CAM heatmap overlay
"""

import base64
import traceback

from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from cnn_inference import run_dual_cnn, _ensure_models_loaded
from symptom_map import get_symptoms_for_diseases
from gradcam_service import generate_gradcam
import neuroskin_rag_pipeline


# ── Startup / Shutdown ────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-load CNN models on startup so the first request isn't slow."""
    print("[NeuroSkin] Loading CNN models on startup...")
    try:
        _ensure_models_loaded()
        print("[NeuroSkin] CNN models ready [OK]")
    except Exception as e:
        print(f"[NeuroSkin] WARNING: Could not pre-load models: {e}")
        print("[NeuroSkin] Models will be loaded on first request instead.")
    yield
    print("[NeuroSkin] Shutting down.")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="NeuroSkin AI",
    description="Skin disease detection backend — CNN + LLM + Grad-CAM",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ─────────────────────────────────────────────────

class PredictionItem(BaseModel):
    id: str
    name: str
    confidence: float


class AnalyzeResponse(BaseModel):
    predictions: list[PredictionItem]
    symptoms: dict[str, list[str]]


class DiagnoseRequest(BaseModel):
    predictions: list[PredictionItem]
    selected_symptoms: list[str]


class MedicineItem(BaseModel):
    name: str
    usage: str


class DiagnoseResponse(BaseModel):
    name: str
    confidence: float
    description: str
    medicines: list[MedicineItem]
    care: list[str]
    severity: str


class GradCamResponse(BaseModel):
    heatmap: str  # base64 PNG


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ── 1. ANALYZE: Upload image → dual CNN → top-3 + symptoms ───────────────────

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_image(image: UploadFile = File(...)):
    """
    Accepts an image upload, runs both CNN models (lesion + skin disease),
    merges the 6 predictions into the global top 3, and returns the
    predictions along with the symptom checklist for each predicted disease.
    """
    try:
        image_bytes = await image.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")

        # Run dual CNN inference
        top3 = run_dual_cnn(image_bytes)

        # Get symptoms for the top-3 diseases
        disease_ids = [p["id"] for p in top3]
        symptoms = get_symptoms_for_diseases(disease_ids)

        return AnalyzeResponse(
            predictions=[PredictionItem(**p) for p in top3],
            symptoms=symptoms,
        )

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ── 2. DIAGNOSE: predictions + symptoms → LLM → final diagnosis ──────────────

@app.post("/api/diagnose", response_model=DiagnoseResponse)
async def diagnose(req: DiagnoseRequest):
    """
    Takes the top-3 CNN predictions and the symptoms the user selected.
    Runs the LLM/RAG pipeline to produce a single final diagnosis with
    description, medicines, care tips, and severity.
    """
    try:
        predictions_dicts = [p.model_dump() for p in req.predictions]

        result = await neuroskin_rag_pipeline.get_final_diagnosis(
            predictions=predictions_dicts,
            selected_symptoms=req.selected_symptoms,
        )

        return DiagnoseResponse(
            name=result["name"],
            confidence=result["confidence"],
            description=result["description"],
            medicines=[MedicineItem(**m) for m in result["medicines"]],
            care=result["care"],
            severity=result["severity"],
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Diagnosis failed: {str(e)}")


# ── 3. GRAD-CAM: image + class → heatmap overlay ─────────────────────────────

@app.post("/api/gradcam", response_model=GradCamResponse)
async def gradcam(
    image: UploadFile = File(...),
    class_name: str = Form(...),
):
    """
    Generates a Grad-CAM heatmap overlay for the uploaded image and the
    specified predicted class. Returns a base64-encoded PNG.
    """
    try:
        image_bytes = await image.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file")

        heatmap_b64 = generate_gradcam(image_bytes, class_name)

        return GradCamResponse(heatmap=heatmap_b64)

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Grad-CAM failed: {str(e)}")
