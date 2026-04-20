# NeuroSkin AI

Skin disease detection app using dual CNN models + LLM/RAG pipeline.

## Project Structure

```
NeuroSkin_AI/
├── backend/          # FastAPI server (Python)
│   ├── main.py
│   ├── cnn_inference.py
│   ├── neuroskin_rag_pipeline.py
│   ├── gradcam_service.py
│   ├── symptom_map.py
│   ├── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example  ← copy this to .env and fill in keys
├── CNN Models/       # Model weights (NOT in git — download separately)
│   ├── lesion_model.pth
│   └── skin_model.pth
└── website/          # React frontend (TanStack Start + Vite)
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env      # fill in your API keys
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd website
npm install
npm run dev
```

## CNN Model Weights

The `.pth` files are **not included in git** (too large). Place them in the `CNN Models/` folder:
- `lesion_model.pth`
- `skin_model.pth`

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Where to get it |
|---|---|
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) |
| `NOMIC_API_KEY` | [atlas.nomic.ai](https://atlas.nomic.ai) |
| `COHERE_API_KEY` | [dashboard.cohere.com](https://dashboard.cohere.com) |

## Deployment

- **Frontend** → Cloudflare Workers: `cd website && npx wrangler deploy`
- **Backend** → Railway/Render: push to GitHub, connect repo, set env vars in dashboard
