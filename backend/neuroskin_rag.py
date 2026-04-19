"""
NeuroSkin AI — RAG Pipeline
Encapsulates the LLM, MongoDB Vector Search, and Cohere Reranker logic.
"""

import json
import re
from typing import List
from functools import lru_cache

from pymongo import MongoClient
import cohere

from langchain_nomic import NomicEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from langchain_groq import ChatGroq
from langchain_core.prompts import (
    ChatPromptTemplate,
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda

from .config import (
    GROQ_API_KEY, MONGODB_URI, NOMIC_API_KEY, COHERE_API_KEY,
    MONGO_DB_NAME, MONGO_COLLECTION_NAME, MONGO_INDEX_NAME
)

# ── Initialization ────────────────────────────────────────────────────────────

embeddings = NomicEmbeddings(
    model="nomic-embed-text-v1.5",
    nomic_api_key=NOMIC_API_KEY,
    inference_mode="remote",
    dimensionality=768,
)

# Connect to MongoDB
mongo_client = MongoClient(MONGODB_URI)
collection = mongo_client[MONGO_DB_NAME][MONGO_COLLECTION_NAME]

vectorstore = MongoDBAtlasVectorSearch(
    collection=collection,
    embedding=embeddings,
    index_name=MONGO_INDEX_NAME,
)

mongo_retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 15},
)

cohere_client = cohere.Client(api_key=COHERE_API_KEY)
TOP_N_AFTER_RERANK = 5

llm = ChatGroq(
    model="llama-3.1-8b-instant",
    temperature=0,
    max_tokens=1500,
    api_key=GROQ_API_KEY,
)

# ── Reranking Logic ───────────────────────────────────────────────────────────

def rerank_documents(query: str, docs: List[Document]) -> List[Document]:
    if not docs:
        return []
    doc_texts = [doc.page_content for doc in docs]
    response = cohere_client.rerank(
        model="rerank-english-v3.0",
        query=query,
        documents=doc_texts,
        top_n=TOP_N_AFTER_RERANK,
    )
    reranked = [docs[result.index] for result in response.results]
    return reranked

@lru_cache(maxsize=64)
def _cached_retrieve_and_rerank(query: str) -> tuple:
    candidates = mongo_retriever.invoke(query)
    top_docs = rerank_documents(query, candidates)
    return tuple(top_docs)

class RerankRetriever(BaseRetriever):
    def _get_relevant_documents(self, query: str) -> List[Document]:
        return list(_cached_retrieve_and_rerank(query))

retriever = RerankRetriever()

# ── Prompt & Chain ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are NeuroSkin AI, a dermatology screening assistant.
A CNN image model has already analyzed a patient skin photo and returned its top-3 predictions.
Your job is to refine those predictions using the retrieved medical context and the patient's symptoms.

STRICT RULES — follow every one of these without exception:

1. SOURCE DISCIPLINE: "Prefer information from the retrieved context. If the context does not cover a field, use general dermatology knowledge but keep it conservative."

2. PREDICTION SCOPE: You may ONLY revise the probabilities of the 3 conditions the CNN gave you.
   Do NOT introduce new conditions. Do NOT rename CNN conditions.

3. PROBABILITY RULE: The three revised_confidence values in top_3_predictions MUST sum to exactly 100.
   Shift probability TOWARD the condition whose symptoms best match the patient's answers.
   Never change the ORDER of the top-3 conditions — only the probability values.

4. SEVERITY RULE: Use the CNN severity as a baseline. You may escalate severity (never downgrade)
   only if the patient reports symptoms like: rapid spread, bleeding, open wounds, fever,
   or signs matching urgent conditions (e.g., melanoma ABCDE criteria).

5. NO DIAGNOSIS: You are a screening assistant. Never state a definitive diagnosis.
   Always use language like "most consistent with", "likely", "suggests".

6. SAFE FALLBACK: If the medical context is too vague to support a specific claim,
   output the safest conservative response and set see_doctor to true.

7. FORMAT: Return ONLY valid JSON matching the schema below. No markdown. No explanation.
   No text before or after the JSON.

Output JSON schema:
{{
  "primary_condition": "<most likely condition from CNN top-3>",
  "summary": "<2-sentence plain-English screening summary — use 'suggests' not 'is'>",
  "top_3_predictions": [
    {{"condition": "<name>", "cnn_confidence": <float>, "revised_confidence": <float>, "symptom_match": "high|medium|low"}}
  ],
  "severity": "mild|moderate|severe|urgent",
  "severity_reason": "<one sentence grounded in the context or reported symptoms>",
  "symptoms_present": ["<symptom found in patient answers>"],
  "triggers": ["<3-5 evidence-based triggers from context>"],
  "contagion_risk": "yes — <one-line reason>  OR  no — <one-line reason>",
  "home_care_steps": ["<3-4 concise evidence-based steps from context>"],
  "things_to_avoid": ["<avoid 1 from context>"],
  "doctor_talking_points": ["<point 1>", "<point 2>", "<point 3>"],
  "see_doctor": true|false,
  "see_doctor_if": "<specific warning sign that means go now>",
  "urgency_days": <integer — 0 if urgent, else days before doctor visit recommended>,
  "typical_recovery": "<brief timeline from context>",
  "disclaimer": "AI-assisted screening only. Not a medical diagnosis. Consult a qualified dermatologist."
}}"""

combined_prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
    HumanMessagePromptTemplate.from_template(
        "CNN Top-3 Predictions: {top_3_json}\n"
        "CNN Severity Estimate: {severity}\n"
        "Patient Symptoms: {symptom_answers}\n\n"
        "Retrieved Medical Context:\n{context}\n\n"
        "Generate the full screening report JSON:"
    ),
])

def safe_json_parse(text) -> dict:
    if isinstance(text, dict):
        return text
    text = re.sub(r"```json\s*", "", str(text))
    text = re.sub(r"```\s*", "", text)
    try:
        return json.loads(text.strip())
    except Exception:
        return {"raw": text.strip()}

pipeline_chain = (
    combined_prompt
    | llm
    | StrOutputParser()
    | RunnableLambda(safe_json_parse)
)

CNN_CONFUSION_THRESHOLD = 15.0

def format_retrieved_docs(docs) -> str:
    sections = []
    for i, doc in enumerate(docs):
        src = doc.metadata.get("source_tag", "unknown")
        sections.append(f"[Source {i+1} — {src}]\n{doc.page_content.strip()}")
    return "\n\n".join(sections)

def is_cnn_confused(top_3_predictions: list) -> bool:
    if len(top_3_predictions) < 2:
        return False
    gap = top_3_predictions[0]["confidence"] - top_3_predictions[1]["confidence"]
    return gap <= CNN_CONFUSION_THRESHOLD

def neuroskin_full_pipeline(top_3_predictions: list, severity: str, symptom_answers: str) -> dict:
    if is_cnn_confused(top_3_predictions):
        top1 = top_3_predictions[0]["condition"]
        top2 = top_3_predictions[1]["condition"]
        gap = top_3_predictions[0]["confidence"] - top_3_predictions[1]["confidence"]
        return {
            "primary_condition": "inconclusive",
            "summary": (
                f"The AI image model could not confidently distinguish between "
                f"{top1.replace('_', ' ')} and {top2.replace('_', ' ')} (confidence gap: {gap:.1f}%). "
                "A dermatologist examination is required for accurate diagnosis."
            ),
            "top_3_predictions": [
                {
                    "condition": p["condition"],
                    "cnn_confidence": p["confidence"],
                    "revised_confidence": round(p["confidence"], 1),
                    "symptom_match": "unknown",
                }
                for p in top_3_predictions
            ],
            "cnn_confused": True,
            "severity": severity,
            "severity_reason": "CNN model was unable to distinguish between top conditions.",
            "symptoms_present": [],
            "triggers": ["Unknown — diagnosis required first"],
            "contagion_risk": "Unknown — diagnosis required first",
            "home_care_steps": [
                "Do not self-diagnose or self-medicate.",
                "Photograph the affected area in good lighting.",
                "Book an appointment with a dermatologist as soon as possible.",
            ],
            "things_to_avoid": ["Avoid applying unknown creams until diagnosed."],
            "doctor_talking_points": [
                "Show the AI results and explain that the model was uncertain.",
                "Describe how long the condition has been present and any changes.",
                "List all symptoms including itching, pain, or spreading.",
            ],
            "see_doctor": True,
            "see_doctor_if": "Condition is already inconclusive — please see a doctor now.",
            "urgency_days": 3,
            "typical_recovery": "Depends on confirmed diagnosis.",
            "disclaimer": "AI-assisted screening only. Not a medical diagnosis. Consult a qualified dermatologist.",
        }

    conditions_str = " ".join([p["condition"] for p in top_3_predictions])
    query = f"{conditions_str} skin symptoms {severity} {symptom_answers}"

    docs = retriever.invoke(query)
    context = format_retrieved_docs(docs)

    result = pipeline_chain.invoke({
        "top_3_json": json.dumps(top_3_predictions),
        "severity": severity,
        "symptom_answers": symptom_answers,
        "context": context,
    })

    result["cnn_confused"] = False
    return result
