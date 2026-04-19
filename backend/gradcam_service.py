import io
import base64
import numpy as np
from PIL import Image
import torch
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

from .cnn_inference import preprocess_image, get_lesion_model, get_skin_model
from .config import LESION_CLASSES, SKIN_CLASSES, IMG_SIZE

def generate_gradcam_base64(image_bytes: bytes, condition: str) -> str:
    """
    Generate a Grad-CAM heatmap for the given image and target condition.
    Returns a base64 encoded PNG data URI.
    """
    if condition in LESION_CLASSES:
        model = get_lesion_model()
        class_idx = LESION_CLASSES.index(condition)
    elif condition in SKIN_CLASSES:
        model = get_skin_model()
        class_idx = SKIN_CLASSES.index(condition)
    else:
        raise ValueError(f"Unknown condition: {condition}")

    # EfficientNet-B3 target layer is typically the last block in the features
    target_layers = [model.features[-1]]

    # Prepare input tensor
    tensor = preprocess_image(image_bytes)

    # Prepare original image for overlay
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((IMG_SIZE, IMG_SIZE))
    rgb_img = np.float32(img) / 255.0

    # Initialize CAM
    # Note: efficientnet uses a lot of memory, setting use_cuda if available helps
    cam = GradCAM(model=model, target_layers=target_layers)

    targets = [ClassifierOutputTarget(class_idx)]
    
    # Generate CAM
    grayscale_cam = cam(input_tensor=tensor, targets=targets)
    grayscale_cam = grayscale_cam[0, :]

    # Overlay CAM on image
    visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)

    # Convert back to PIL Image and then base64
    cam_img = Image.fromarray(visualization)
    buffered = io.BytesIO()
    cam_img.save(buffered, format="PNG")
    cam_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{cam_str}"
