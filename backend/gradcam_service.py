"""
NeuroSkin AI — Grad-CAM Service
Generates Grad-CAM heatmap overlays for EfficientNet-B3 predictions.
Returns base64-encoded PNG images that the frontend composites over the
original photo.
"""

import io
import base64
import numpy as np
import torch
from PIL import Image
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

from config import LESION_CLASSES, SKIN_CLASSES
from cnn_inference import (
    get_lesion_model,
    get_skin_model,
    inference_transform,
    device,
)


def _resolve_model_and_index(class_name: str):
    """
    Given a disease class name (e.g. 'melanoma'), determine which model
    (lesion or skin) owns that class, load it, and return (model, class_index).
    """
    class_name_lower = class_name.lower().strip()

    if class_name_lower in LESION_CLASSES:
        model = get_lesion_model()
        class_index = LESION_CLASSES.index(class_name_lower)
        return model, class_index

    if class_name_lower in SKIN_CLASSES:
        model = get_skin_model()
        class_index = SKIN_CLASSES.index(class_name_lower)
        return model, class_index

    # Fallback: use lesion model with class 0
    print(f"[GradCAM] Unknown class '{class_name}', falling back to lesion model class 0")
    return get_lesion_model(), 0


def _get_target_layer(model: torch.nn.Module):
    """
    Return the last convolutional layer of an EfficientNet-B3.
    EfficientNet's features are in model.features; the last block is [-1].
    """
    return [model.features[-1]]


def generate_gradcam(image_bytes: bytes, class_name: str) -> str:
    """
    Generate a Grad-CAM heatmap overlay for the given image and class.

    Parameters
    ----------
    image_bytes : raw bytes of the uploaded image
    class_name  : the predicted disease id (e.g. 'melanoma', 'acne')

    Returns
    -------
    A base64-encoded PNG string of the heatmap overlaid on the original image.
    """
    model, class_index = _resolve_model_and_index(class_name)
    target_layers = _get_target_layer(model)

    # ── Prepare the image for the model ──────────────────────────────────
    pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # Resize to 224x224 for the model and for the overlay
    pil_img_resized = pil_img.resize((224, 224), Image.LANCZOS)
    # Normalised numpy array in [0, 1] for show_cam_on_image
    rgb_img = np.array(pil_img_resized, dtype=np.float32) / 255.0

    # Tensor for the model (with ImageNet normalisation)
    input_tensor = inference_transform(pil_img).unsqueeze(0).to(device)

    # ── Run Grad-CAM ─────────────────────────────────────────────────────
    targets = [ClassifierOutputTarget(class_index)]

    with GradCAM(model=model, target_layers=target_layers) as cam:
        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
        # grayscale_cam shape: (1, 224, 224) → take first
        grayscale_cam = grayscale_cam[0, :]

    # ── Create overlay image ─────────────────────────────────────────────
    # show_cam_on_image expects rgb_img in [0,1] float32 and cam in [0,1]
    overlay = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True, colormap=2)
    # overlay is a uint8 numpy array (224, 224, 3)

    overlay_pil = Image.fromarray(overlay)

    # ── Encode to base64 PNG ─────────────────────────────────────────────
    buf = io.BytesIO()
    overlay_pil.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    b64_str = base64.b64encode(buf.read()).decode("utf-8")

    return b64_str
