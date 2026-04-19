"""
NeuroSkin AI — CNN Inference Service
Loads two EfficientNet-B3 models (lesion + skin) and runs dual inference.
Architecture exactly matches the training notebook.
"""

import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image

from .config import (
    LESION_MODEL_PATH, SKIN_MODEL_PATH,
    LESION_CLASSES, SKIN_CLASSES,
    IMG_SIZE, IMAGENET_MEAN, IMAGENET_STD,
)

# ── Device ────────────────────────────────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ── Model builder (matches training notebook exactly) ─────────────────────────
def _build_model(num_classes: int) -> nn.Module:
    """Build EfficientNet-B3 with the custom classifier head from training."""
    model = models.efficientnet_b3(weights=None)  # no pretrained — we'll load our own
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.4),
        nn.Linear(in_features, 512),
        nn.BatchNorm1d(512),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.3),
        nn.Linear(512, 256),
        nn.ReLU(inplace=True),
        nn.Linear(256, num_classes),
    )
    return model


def load_model(path: str, num_classes: int) -> nn.Module:
    """Load a trained model checkpoint and set to eval mode."""
    model = _build_model(num_classes)
    state_dict = torch.load(path, map_location=device, weights_only=True)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model


# ── Preprocessing (matches training notebook val_tf) ──────────────────────────
inference_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
])


def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Convert raw image bytes to a preprocessed tensor ready for the model."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = inference_transform(img)
    return tensor.unsqueeze(0).to(device)  # add batch dim


# ── Prediction ────────────────────────────────────────────────────────────────
def predict_top3(model: nn.Module, image_tensor: torch.Tensor, class_names: list) -> list:
    """
    Run inference and return top-3 predictions.
    Returns: [{"id": "melanoma", "name": "Melanoma", "confidence": 82.4}, ...]
    """
    with torch.no_grad():
        logits = model(image_tensor)
        probs = torch.softmax(logits, dim=1).squeeze(0)

    # Get top 3
    top3_probs, top3_indices = torch.topk(probs, k=min(3, len(class_names)))

    results = []
    for prob, idx in zip(top3_probs, top3_indices):
        class_id = class_names[idx.item()]
        results.append({
            "id": class_id,
            "name": class_id.replace("_", " ").title(),
            "confidence": float(prob.item()),
        })
    return results


# ── Lazy model loading (loaded once on first call) ────────────────────────────
_lesion_model = None
_skin_model = None


def _ensure_models_loaded():
    global _lesion_model, _skin_model
    if _lesion_model is None:
        print(f"[CNN] Loading lesion model from {LESION_MODEL_PATH} ...")
        _lesion_model = load_model(LESION_MODEL_PATH, len(LESION_CLASSES))
        print("[CNN] Lesion model loaded ✓")
    if _skin_model is None:
        print(f"[CNN] Loading skin model from {SKIN_MODEL_PATH} ...")
        _skin_model = load_model(SKIN_MODEL_PATH, len(SKIN_CLASSES))
        print("[CNN] Skin model loaded ✓")


def get_lesion_model() -> nn.Module:
    _ensure_models_loaded()
    return _lesion_model


def get_skin_model() -> nn.Module:
    _ensure_models_loaded()
    return _skin_model


def run_dual_cnn(image_bytes: bytes) -> list:
    """
    Run both CNN models on the image, merge 6 predictions, return global top 3.
    """
    _ensure_models_loaded()

    tensor = preprocess_image(image_bytes)

    lesion_preds = predict_top3(_lesion_model, tensor, LESION_CLASSES)
    skin_preds = predict_top3(_skin_model, tensor, SKIN_CLASSES)

    # Merge all 6 predictions, sort by confidence, take top 3
    all_preds = lesion_preds + skin_preds
    all_preds.sort(key=lambda x: x["confidence"], reverse=True)

    # Take top 3 — renormalize confidences to sum to ~100
    top3 = all_preds[:3]
    total = sum(p["confidence"] for p in top3)
    if total > 0:
        for p in top3:
            p["confidence"] = float(p["confidence"] / total)

    return top3
