import asyncio
import io
from PIL import Image

import main
import cnn_inference
import neuroskin_rag_pipeline
import gradcam_service

async def test_all():
    print("Testing main and its dependencies...")
    # 1. Test CNN Inference
    print("Creating dummy image...")
    img = Image.new('RGB', (300, 300), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()
    
    print("Testing dual CNN...")
    top3 = cnn_inference.run_dual_cnn(img_bytes)
    print("Top 3:", top3)
    
    # 2. Test GradCAM
    print("Testing GradCAM...")
    heatmap = gradcam_service.generate_gradcam(img_bytes, top3[0]["id"])
    print("Heatmap generated (length):", len(heatmap))
    
    # 3. Test RAG Pipeline
    print("Testing RAG Pipeline...")
    predictions = top3
    selected_symptoms = ["Asymmetric shape of the mole or spot", "Irregular or ragged borders"]
    result = await neuroskin_rag_pipeline.get_final_diagnosis(predictions, selected_symptoms)
    print("RAG Result:", result)

if __name__ == "__main__":
    asyncio.run(test_all())
