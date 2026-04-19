"""
NeuroSkin AI — Configuration
Loads environment variables and defines constants used across the backend.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from this directory
_env_path = Path(__file__).parent / ".env"
load_dotenv(_env_path)

# ── API Keys ──────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")
NOMIC_API_KEY = os.getenv("NOMIC_API_KEY")
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

assert GROQ_API_KEY, "GROQ_API_KEY not set in .env"
assert MONGODB_URI, "MONGODB_URI not set in .env"
assert NOMIC_API_KEY, "NOMIC_API_KEY not set in .env"
assert COHERE_API_KEY, "COHERE_API_KEY not set in .env"

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
