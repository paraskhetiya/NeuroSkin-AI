"""
NeuroSkin AI — RAG Pipeline
Combines CNN predictions + user symptoms + trusted medical knowledge + RAG
context to produce a structured final diagnosis via an LLM.

Converted from neuroskin_rag_pipeline_v4 notebook.
"""

import json
import re
from typing import Optional

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from config import (
    GROQ_API_KEY,
    MONGODB_URI,
    MONGO_DB_NAME,
    MONGO_COLLECTION_NAME,
    MONGO_INDEX_NAME,
    NOMIC_API_KEY,
    COHERE_API_KEY,
)

# ═══════════════════════════════════════════════════════════════════════════════
# 1. TRUSTED DISEASE KNOWLEDGE BASE
#    Sourced from Mayo Clinic, AAD, NHS, DermNet NZ.
#    This is the hardcoded "if-else type" info the LLM uses as ground truth.
# ═══════════════════════════════════════════════════════════════════════════════

DISEASE_KNOWLEDGE: dict[str, dict] = {
    "melanoma": {
        "description": (
            "Melanoma is the most serious type of skin cancer. It develops in melanocytes, "
            "the cells that give skin its colour. Melanoma can appear as a new dark spot or "
            "develop from an existing mole that changes in size, shape, or colour. Early "
            "detection is critical — when caught before it spreads, the 5-year survival rate "
            "is over 99%. The ABCDE rule (Asymmetry, Border, Colour, Diameter, Evolving) is "
            "the standard clinical screening guideline."
        ),
        "medicines": [
            {"name": "Surgical excision", "usage": "Primary treatment — wide local excision with safety margins determined by tumour thickness (Breslow depth)."},
            {"name": "Immunotherapy (pembrolizumab / nivolumab)", "usage": "For advanced or metastatic melanoma — checkpoint inhibitors that help the immune system attack cancer cells."},
            {"name": "Targeted therapy (dabrafenib + trametinib)", "usage": "For BRAF-mutated melanoma — blocks specific growth-signalling proteins."},
        ],
        "care": [
            "See a dermatologist or oncologist IMMEDIATELY — melanoma requires professional medical management.",
            "Do NOT attempt to treat melanoma with over-the-counter creams or home remedies.",
            "Use broad-spectrum SPF 50+ sunscreen daily and avoid peak sun hours (10 AM – 4 PM).",
            "Perform monthly skin self-exams using the ABCDE criteria.",
            "Wear protective clothing including wide-brimmed hats and UV-blocking sunglasses.",
            "Keep all follow-up appointments — melanoma recurrence monitoring is essential.",
        ],
        "severity": "see-doctor",
    },
    "basal_cell_carcinoma": {
        "description": (
            "Basal cell carcinoma (BCC) is the most common type of skin cancer worldwide. "
            "It arises from basal cells in the epidermis and typically appears as a pearly or "
            "waxy bump, a flat flesh-coloured or brown scar-like lesion, or a bleeding/scabbing "
            "sore that heals and recurs. BCC grows slowly and rarely metastasises, but it can "
            "cause significant local tissue destruction if untreated. Chronic UV exposure is "
            "the primary risk factor."
        ),
        "medicines": [
            {"name": "Surgical excision or Mohs surgery", "usage": "Gold-standard treatment — Mohs micrographic surgery achieves >99% cure rate by examining 100% of margins."},
            {"name": "Imiquimod 5% cream", "usage": "For superficial BCC — apply 5 times per week for 6 weeks. Activates local immune response."},
            {"name": "Fluorouracil (5-FU) 5% cream", "usage": "For superficial BCC — apply twice daily for 3–6 weeks. Destroys abnormal cells topically."},
        ],
        "care": [
            "Consult a dermatologist for biopsy and definitive treatment planning.",
            "Apply broad-spectrum SPF 50+ sunscreen daily to all exposed skin.",
            "Avoid tanning beds — UV radiation is the primary cause of BCC.",
            "Schedule 6-monthly skin checks — patients with one BCC have 50% risk of a new one within 5 years.",
            "Protect surgical sites from sun exposure during healing.",
            "Report any new pearly bumps or non-healing sores promptly.",
        ],
        "severity": "see-doctor",
    },
    "actinic_keratosis": {
        "description": (
            "Actinic keratosis (AK), also called solar keratosis, is a rough, scaly patch on "
            "sun-damaged skin. AKs are pre-cancerous — without treatment, 5–10% may progress "
            "to squamous cell carcinoma. They feel like sandpaper and are typically pink, red, "
            "or brown. Most common on sun-exposed areas: face, ears, scalp, forearms, and "
            "backs of hands. Fair-skinned individuals and those with chronic sun exposure are "
            "at highest risk."
        ),
        "medicines": [
            {"name": "Fluorouracil (5-FU) 5% cream", "usage": "Apply twice daily for 2–4 weeks. Causes expected redness/crusting as abnormal cells are destroyed."},
            {"name": "Imiquimod 3.75% or 5% cream", "usage": "Apply at bedtime 2–3 times per week for 16 weeks (3.75%) or 2 times/week for 16 weeks (5%)."},
            {"name": "Cryotherapy (liquid nitrogen)", "usage": "In-office procedure — dermatologist freezes individual AKs. Most effective for isolated lesions."},
        ],
        "care": [
            "Schedule a dermatologist visit — AKs require monitoring to prevent progression to squamous cell carcinoma.",
            "Apply SPF 50+ sunscreen every 2 hours when outdoors.",
            "Wear a wide-brimmed hat and long sleeves during peak sun hours.",
            "Avoid picking or scratching the scaly patches — this can cause infection.",
            "Use emollient moisturisers to reduce dryness and discomfort.",
            "Return for follow-up every 6–12 months — new AKs commonly develop.",
        ],
        "severity": "see-doctor",
    },
    "benign_keratosis": {
        "description": (
            "Benign keratosis (seborrheic keratosis) is one of the most common non-cancerous "
            "skin growths in older adults. They appear as waxy, 'stuck-on' looking growths "
            "that are brown, black, or tan. They are harmless and do not become cancerous. "
            "They can appear on the face, chest, shoulders, or back. No treatment is medically "
            "necessary, but removal may be desired for cosmetic reasons or if they become "
            "irritated by clothing."
        ),
        "medicines": [
            {"name": "No medication required", "usage": "Benign keratoses are harmless. Treatment is only for cosmetic purposes or if irritated."},
            {"name": "Cryotherapy (optional)", "usage": "Dermatologist can freeze with liquid nitrogen for cosmetic removal. Covered by insurance only if symptomatic."},
            {"name": "Electrodesiccation / curettage (optional)", "usage": "Minor in-office procedure to scrape off the growth if it causes irritation."},
        ],
        "care": [
            "No urgent medical treatment is needed — this is a benign (non-cancerous) condition.",
            "Avoid picking or scratching — this may cause irritation, bleeding, or infection.",
            "If a growth changes rapidly in colour, shape, or size, see a dermatologist to rule out melanoma.",
            "Wear soft, non-abrasive clothing over affected areas to prevent irritation.",
            "Use gentle moisturisers if the area feels dry or rough.",
            "Schedule a routine skin check annually, especially if you have many growths.",
        ],
        "severity": "mild",
    },
    "acne": {
        "description": (
            "Acne vulgaris is a chronic inflammatory skin condition affecting hair follicles "
            "and sebaceous glands. It presents as comedones (blackheads and whiteheads), "
            "papules, pustules, nodules, or cysts, primarily on the face, chest, and back. "
            "Acne is caused by excess sebum production, clogged pores, bacteria "
            "(Cutibacterium acnes), and inflammation. It affects 85% of people between "
            "ages 12–24 and can cause significant psychological distress and scarring."
        ),
        "medicines": [
            {"name": "Benzoyl peroxide 2.5–5% gel/wash", "usage": "Apply once daily to affected areas. Kills acne bacteria and unclogs pores. Start with lower strength to reduce irritation."},
            {"name": "Adapalene 0.1% gel (Differin)", "usage": "Apply a thin layer at bedtime. Retinoid that prevents clogged pores. Results take 8–12 weeks. Use sunscreen during the day."},
            {"name": "Clindamycin 1% gel/lotion", "usage": "Apply twice daily. Topical antibiotic that reduces acne bacteria. Best used with benzoyl peroxide to prevent resistance."},
        ],
        "care": [
            "Wash affected areas gently twice daily with a mild, non-comedogenic cleanser.",
            "Do NOT squeeze, pick, or pop pimples — this worsens inflammation and causes scarring.",
            "Use oil-free, non-comedogenic moisturisers and sunscreen.",
            "Change pillowcases frequently and avoid touching your face.",
            "Be patient — most acne treatments take 6–12 weeks to show results.",
            "If over-the-counter treatments fail after 3 months, consult a dermatologist for prescription options.",
        ],
        "severity": "mild",
    },
    "eczema": {
        "description": (
            "Eczema (atopic dermatitis) is a chronic inflammatory skin condition characterised "
            "by intensely itchy, red, dry, and cracked skin. It is driven by a defective skin "
            "barrier, immune dysregulation, and environmental triggers. Eczema commonly affects "
            "the inner elbows, behind the knees, hands, and face. It follows a relapsing-remitting "
            "pattern and is strongly associated with a personal or family history of asthma, "
            "hay fever, or food allergies (the 'atopic triad')."
        ),
        "medicines": [
            {"name": "Hydrocortisone 1% cream (OTC)", "usage": "Apply a thin layer to affected areas twice daily for up to 7 days. For mild flares on body (not face)."},
            {"name": "Tacrolimus 0.1% ointment (Protopic)", "usage": "Prescription calcineurin inhibitor — apply twice daily. Safe for face and sensitive areas. Avoids steroid side effects."},
            {"name": "Cetirizine 10mg or hydroxyzine 25mg", "usage": "Oral antihistamine for itch relief, especially at night. Hydroxyzine is more sedating — take at bedtime."},
        ],
        "care": [
            "Moisturise liberally and frequently — apply a thick emollient (like CeraVe or Vanicream) immediately after bathing.",
            "Take short, lukewarm baths or showers (max 10 minutes). Avoid hot water.",
            "Use fragrance-free, dye-free soaps and laundry detergents.",
            "Wear soft, breathable fabrics (cotton). Avoid wool and synthetic materials next to skin.",
            "Identify and avoid personal triggers (stress, sweat, certain foods, pet dander).",
            "Keep fingernails short to minimise damage from scratching.",
        ],
        "severity": "moderate",
    },
    "psoriasis": {
        "description": (
            "Psoriasis is a chronic autoimmune disease that causes rapid skin cell turnover, "
            "resulting in thick, silvery-white scaly plaques on well-defined red patches. "
            "The most common form (plaque psoriasis) affects the elbows, knees, scalp, and "
            "lower back. It is driven by an overactive immune system (T-cells) and has a "
            "strong genetic component. Psoriasis is associated with psoriatic arthritis, "
            "cardiovascular disease, and mental health conditions."
        ),
        "medicines": [
            {"name": "Betamethasone dipropionate 0.05% cream", "usage": "Apply a thin layer twice daily to plaques for up to 4 weeks. Potent topical steroid for body (not face/folds)."},
            {"name": "Calcipotriol (Dovonex) 0.005% ointment", "usage": "Apply twice daily. Vitamin D analogue that slows skin cell growth. Often combined with betamethasone."},
            {"name": "Methotrexate (prescription)", "usage": "Oral systemic treatment for moderate-to-severe psoriasis — 7.5–25mg once weekly. Requires regular blood monitoring."},
        ],
        "care": [
            "Keep skin well-moisturised — apply a thick emollient after bathing to lock in moisture.",
            "Avoid triggers: stress, alcohol, smoking, and certain medications (lithium, beta-blockers).",
            "Use gentle, fragrance-free products. Avoid harsh soaps that strip natural oils.",
            "Get brief, controlled sun exposure (10–15 minutes) — UV light can help, but avoid sunburn.",
            "Do NOT pick or scratch plaques — this triggers the Koebner phenomenon (new plaques at injury sites).",
            "See a rheumatologist if you develop joint pain, stiffness, or swelling — psoriatic arthritis screening.",
        ],
        "severity": "moderate",
    },
    "ringworm": {
        "description": (
            "Ringworm (tinea corporis) is a superficial fungal infection of the skin caused by "
            "dermatophyte fungi (Trichophyton, Microsporum, or Epidermophyton species). Despite "
            "the name, it is not caused by a worm. It presents as a ring-shaped, red, scaly "
            "patch with central clearing and a raised, active border. It spreads through direct "
            "skin contact, contaminated surfaces (towels, gym mats), or contact with infected "
            "animals. Warm, humid environments and excessive sweating increase risk."
        ),
        "medicines": [
            {"name": "Clotrimazole 1% cream", "usage": "Apply a thin layer to the affected area and 2cm beyond the border, twice daily for 2–4 weeks. Continue 1 week after lesion clears."},
            {"name": "Terbinafine 1% cream (Lamisil)", "usage": "Apply once or twice daily for 1–2 weeks. More potent fungicidal action than clotrimazole."},
            {"name": "Oral fluconazole 150mg (if extensive)", "usage": "Once weekly for 2–4 weeks for widespread or resistant infection. Prescription required."},
        ],
        "care": [
            "Keep the affected area clean and completely dry — fungi thrive in moisture.",
            "Wear loose, breathable cotton clothing. Avoid synthetic fabrics over the lesion.",
            "Do NOT share towels, combs, bedding, or clothing until fully healed.",
            "Wash hands thoroughly after touching the affected area or applying cream.",
            "Wash clothing and towels that contact the infection in hot water.",
            "If no improvement after 2 weeks of antifungal cream, see a doctor — oral treatment may be needed.",
        ],
        "severity": "mild",
    },
}


# ═══════════════════════════════════════════════════════════════════════════════
# 2. RAG CHAIN (MongoDB Atlas Vector Search + Cohere Reranker + Groq LLM)
# ═══════════════════════════════════════════════════════════════════════════════

_rag_retriever = None
_llm = None


def _init_llm():
    """Initialise the Groq LLM (lazy, once)."""
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            api_key=GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=4096,
        )
    return _llm


def _init_rag_retriever():
    """
    Initialise the MongoDB Atlas Vector Search retriever with Nomic
    embeddings. Returns None if the vector store is empty or unreachable
    (the pipeline still works — just without RAG context).
    """
    global _rag_retriever
    if _rag_retriever is not None:
        return _rag_retriever

    try:
        from langchain_mongodb import MongoDBAtlasVectorSearch
        from langchain_nomic import NomicEmbeddings
        from pymongo import MongoClient

        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        db = client[MONGO_DB_NAME]
        collection = db[MONGO_COLLECTION_NAME]

        embeddings = NomicEmbeddings(
            model="nomic-embed-text-v1.5",
            nomic_api_key=NOMIC_API_KEY,
        )

        vector_store = MongoDBAtlasVectorSearch(
            collection=collection,
            embedding=embeddings,
            index_name=MONGO_INDEX_NAME,
            text_key="text",
            embedding_key="embedding",
        )

        _rag_retriever = vector_store.as_retriever(search_kwargs={"k": 5})
        print("[RAG] MongoDB Atlas vector retriever ready [OK]")
        return _rag_retriever

    except Exception as e:
        print(f"[RAG] Could not initialise vector retriever: {e}")
        print("[RAG] Pipeline will work WITHOUT RAG context.")
        return None


def _rerank_documents(query: str, docs: list) -> list:
    """
    Use Cohere reranker to rerank retrieved documents.
    Falls back to original order if Cohere is unavailable.
    """
    if not docs:
        return docs

    try:
        import cohere

        co = cohere.Client(api_key=COHERE_API_KEY)
        doc_texts = [d.page_content for d in docs]
        response = co.rerank(
            model="rerank-english-v3.0",
            query=query,
            documents=doc_texts,
            top_n=3,
        )
        reranked = [docs[r.index] for r in response.results]
        return reranked
    except Exception as e:
        print(f"[RAG] Cohere rerank failed: {e} — using original order")
        return docs[:3]


# ═══════════════════════════════════════════════════════════════════════════════
# 3. MAIN DIAGNOSIS FUNCTION
# ═══════════════════════════════════════════════════════════════════════════════

# The prompt template that structures all the context for the LLM
DIAGNOSIS_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are NeuroSkin AI, a dermatology assistant. You are given:
1. CNN model predictions (top 3 diseases with confidence %)
2. Symptoms the user reported
3. Trusted medical knowledge about each candidate disease
4. Additional dermatology context from a knowledge base (if available)

Your task: Determine the SINGLE most likely disease from the candidates, considering both the CNN confidence AND the symptom alignment.

RESPOND WITH VALID JSON ONLY — no markdown, no explanation outside the JSON:
{{
  "name": "Full disease name",
  "confidence": 0.85,
  "description": "2-3 sentence description of the disease, written for a patient to understand",
  "medicines": [
    {{"name": "Medicine name", "usage": "How to use it"}},
    {{"name": "Medicine name", "usage": "How to use it"}},
    {{"name": "Medicine name", "usage": "How to use it"}}
  ],
  "care": [
    "Care recommendation 1",
    "Care recommendation 2",
    "Care recommendation 3",
    "Care recommendation 4",
    "Care recommendation 5"
  ],
  "severity": "mild|moderate|see-doctor"
}}

Rules:
- confidence should be between 0.0 and 1.0
- severity must be exactly one of: "mild", "moderate", "see-doctor"
- Use "see-doctor" for any cancer, pre-cancer, or condition needing professional diagnosis
- Provide EXACTLY 3 medicines and AT LEAST 5 care recommendations
- Base your answer on the trusted medical knowledge provided — do NOT hallucinate medicines
- Description should be patient-friendly, not overly clinical"""
    ),
    (
        "human",
        """## CNN Predictions (from dual model analysis)
{cnn_predictions}

## User-Reported Symptoms
{user_symptoms}

## Trusted Medical Knowledge
{trusted_knowledge}

## Additional Context from Knowledge Base
{rag_context}

Based on ALL the above, determine the most likely diagnosis and respond with the JSON."""
    ),
])


def _build_trusted_knowledge_text(prediction_ids: list[str]) -> str:
    """
    Build a formatted text block of trusted disease info for the LLM prompt.
    Only includes diseases that are in the CNN predictions.
    """
    sections = []
    for disease_id in prediction_ids:
        info = DISEASE_KNOWLEDGE.get(disease_id)
        if not info:
            continue
        section = f"### {disease_id.replace('_', ' ').title()}\n"
        section += f"Description: {info['description']}\n"
        section += f"Severity: {info['severity']}\n"
        section += "Medicines:\n"
        for med in info["medicines"]:
            section += f"  - {med['name']}: {med['usage']}\n"
        section += "Care:\n"
        for tip in info["care"]:
            section += f"  - {tip}\n"
        sections.append(section)
    return "\n".join(sections) if sections else "No trusted knowledge available for these diseases."


def _extract_json(text: str) -> dict:
    """
    Robustly extract JSON from LLM output, even if it includes markdown
    fencing or extra text.
    """
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try extracting from code fences
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try finding { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract JSON from LLM response:\n{text[:500]}")


async def get_final_diagnosis(
    predictions: list[dict],
    selected_symptoms: list[str],
) -> dict:
    """
    Main pipeline function. Takes CNN predictions and user symptoms,
    queries RAG, calls LLM, returns a structured final diagnosis dict.

    Parameters
    ----------
    predictions : list of dicts like [{"id": "melanoma", "name": "Melanoma", "confidence": 45.2}, ...]
    selected_symptoms : list of symptom strings the user checked

    Returns
    -------
    dict with keys: name, confidence, description, medicines, care, severity
    """
    llm = _init_llm()

    # 1. Format CNN predictions for the prompt
    cnn_text_lines = []
    for p in predictions:
        cnn_text_lines.append(f"- {p['name']} ({p['id']}): {p['confidence']}% confidence")
    cnn_predictions_text = "\n".join(cnn_text_lines)

    # 2. Format user symptoms
    if selected_symptoms:
        symptoms_text = "\n".join(f"- {s}" for s in selected_symptoms)
    else:
        symptoms_text = "The user reported NO symptoms from the checklist."

    # 3. Trusted knowledge for the candidate diseases
    prediction_ids = [p["id"] for p in predictions]
    trusted_text = _build_trusted_knowledge_text(prediction_ids)

    # 4. RAG context (optional — pipeline works without it)
    rag_context_text = "No additional context available."
    retriever = _init_rag_retriever()
    if retriever:
        try:
            query = f"skin disease diagnosis {' '.join(prediction_ids)} symptoms {' '.join(selected_symptoms[:3])}"
            docs = await retriever.ainvoke(query)
            docs = _rerank_documents(query, docs)
            if docs:
                rag_context_text = "\n\n".join(
                    f"[Source {i+1}]: {d.page_content[:500]}"
                    for i, d in enumerate(docs)
                )
        except Exception as e:
            print(f"[RAG] Retrieval failed: {e}")

    # 5. Build and invoke the LLM chain
    chain = DIAGNOSIS_PROMPT | llm | StrOutputParser()

    response_text = await chain.ainvoke({
        "cnn_predictions": cnn_predictions_text,
        "user_symptoms": symptoms_text,
        "trusted_knowledge": trusted_text,
        "rag_context": rag_context_text,
    })

    # 6. Parse the JSON response
    try:
        result = _extract_json(response_text)
    except ValueError as e:
        print(f"[RAG] JSON parse failed: {e}")
        # Fallback: use the top CNN prediction's trusted knowledge
        top_id = prediction_ids[0]
        info = DISEASE_KNOWLEDGE.get(top_id, DISEASE_KNOWLEDGE["acne"])
        result = {
            "name": top_id.replace("_", " ").title(),
            "confidence": predictions[0]["confidence"] / 100.0,
            "description": info["description"],
            "medicines": info["medicines"],
            "care": info["care"],
            "severity": info["severity"],
        }

    # 7. Validate and normalise the result
    if not isinstance(result.get("confidence"), (int, float)):
        result["confidence"] = 0.75
    if result["confidence"] > 1.0:
        result["confidence"] = result["confidence"] / 100.0
    if result.get("severity") not in ("mild", "moderate", "see-doctor"):
        result["severity"] = "moderate"
    if not isinstance(result.get("medicines"), list) or len(result["medicines"]) == 0:
        top_id = prediction_ids[0]
        info = DISEASE_KNOWLEDGE.get(top_id, {})
        result["medicines"] = info.get("medicines", [{"name": "Consult dermatologist", "usage": "Seek professional medical advice."}])
    if not isinstance(result.get("care"), list) or len(result["care"]) == 0:
        top_id = prediction_ids[0]
        info = DISEASE_KNOWLEDGE.get(top_id, {})
        result["care"] = info.get("care", ["Consult a dermatologist for proper care recommendations."])

    return result
