"""
NeuroSkin AI — Configuration
Loads environment variables and defines constants used across the backend.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env from this directory
_env_path = Path(__file__).parent / ".env"
load_dotenv(_env_path)

# ── API Keys ──────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MONGODB_URI = os.getenv("MONGODB_URI", "")
NOMIC_API_KEY = os.getenv("NOMIC_API_KEY", "")
COHERE_API_KEY = os.getenv("COHERE_API_KEY", "")

# Warn but don't crash — the pipeline can work without RAG if MongoDB/Nomic/Cohere are missing
_missing = []
if not GROQ_API_KEY:
    _missing.append("GROQ_API_KEY")
if not MONGODB_URI:
    _missing.append("MONGODB_URI")
if not NOMIC_API_KEY:
    _missing.append("NOMIC_API_KEY")
if not COHERE_API_KEY:
    _missing.append("COHERE_API_KEY")

if _missing:
    print(f"[CONFIG] WARNING: Missing environment variables: {', '.join(_missing)}")
    print("[CONFIG] The backend will still work but RAG context may be unavailable.")

# GROQ is required for the LLM — hard fail if missing
if not GROQ_API_KEY:
    print("[CONFIG] CRITICAL: GROQ_API_KEY is required for the LLM pipeline.")
    print("[CONFIG] Set it in backend/.env and restart.")
    sys.exit(1)

# ── MongoDB Settings ──────────────────────────────────────────────────────────
MONGO_DB_NAME = "neuroskin"
MONGO_COLLECTION_NAME = "dermatology_v3"
MONGO_INDEX_NAME = "neuroskin_vector_index"

# ── CNN Model Paths ───────────────────────────────────────────────────────────
_project_root = Path(__file__).parent.parent  # Final HOF/
LESION_MODEL_PATH = str(_project_root / "CNN Models" / "lesion_model.pth")
SKIN_MODEL_PATH = str(_project_root / "CNN Models" / "skin_model.pth")

# ── CNN Class Labels (exact order from training notebook) ─────────────────────
LESION_CLASSES = ["melanoma", "basal_cell_carcinoma", "actinic_keratosis", "benign_keratosis"]
SKIN_CLASSES = ["acne", "eczema", "psoriasis", "ringworm"]

# ── Image Settings ────────────────────────────────────────────────────────────
IMG_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
