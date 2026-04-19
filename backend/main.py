from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import json

from .cnn_inference import run_dual_cnn
from .symptom_map import get_symptoms_for_diseases
from .neuroskin_rag import neuroskin_full_pipeline
from .gradcam_service import generate_gradcam_base64

app = FastAPI(title="NeuroSkin AI API")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "NeuroSkin AI Backend is running."}


@app.post("/api/predict")
async def predict_cnn(image: UploadFile = File(...)):
    """Runs the two CNN models on the uploaded image and returns top-3 predictions."""
    try:
        contents = await image.read()
        top3 = run_dual_cnn(contents)
        return {"predictions": top3}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class DiseaseIdsRequest(BaseModel):
    disease_ids: List[str]

@app.post("/api/symptoms")
def get_symptoms(req: DiseaseIdsRequest):
    """Returns the symptom checklists for the provided list of disease IDs."""
    symptoms = get_symptoms_for_diseases(req.disease_ids)
    return {"symptoms": symptoms}


class AnalyzeRequest(BaseModel):
    top_3_predictions: List[Dict[str, Any]]
    severity: str
    symptom_answers: str

@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    """Runs the RAG pipeline given top-3 CNN predictions and selected symptoms."""
    try:
        result = neuroskin_full_pipeline(
            top_3_predictions=req.top_3_predictions,
            severity=req.severity,
            symptom_answers=req.symptom_answers
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/gradcam")
async def generate_gradcam(image: UploadFile = File(...), condition: str = Form(...)):
    """Generates a Grad-CAM heatmap for the given image and target condition."""
    try:
        contents = await image.read()
        cam_base64 = generate_gradcam_base64(contents, condition)
        return {"gradcam_image": cam_base64}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
