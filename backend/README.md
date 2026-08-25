# Backend — FastAPI REST Services

Production reference backend for the Cross-Lingual Fairness Audit Platform.
Uses FastAPI, Pydantic v2, PyJWT, and integrates the full AI stack.

## 📁 Layout

```
backend/
├── app/
│   ├── main.py           # FastAPI application entrypoint (CORS, JWT middleware, router mounts)
│   └── dependencies.py   # get_current_user, DB session, rate-limit helpers
├── routers/
│   ├── auth.py           # /api/auth/*   login, register, OTP, forgot-password, refresh
│   ├── uploads.py        # /api/upload   multipart + URL ingest → object storage
│   ├── nlp.py            # /api/nlp/*    language-detect, translate, sentiment, emotion, bias
│   ├── audit.py          # /api/audit/*  fairness, CLFI score, alerts
│   ├── verify.py         # /api/verify/* fact check, misinformation
│   ├── xai.py            # /api/xai/*    SHAP values, LIME explanations
│   ├── kg.py             # /api/kg/*     knowledge graph CRUD + queries
│   ├── rag.py            # /api/graphrag/*  chat, evidence retrieval
│   ├── study.py          # /api/study/*  notes, MCQs, summaries
│   ├── media.py          # /api/subtitles, /api/voice  TTS, SRT/VTT
│   ├── analytics.py      # /api/analytics/*
│   ├── reports.py        # /api/reports/*  PDF/CSV/JSON export
│   └── admin.py          # /api/admin/*  users, models, logs, datasets, API monitoring
├── services/
│   ├── whisper_v3.py     # Speech → text (Whisper Large V3)
│   ├── indictrans2.py    # Multilingual translation
│   ├── sentiment.py      # IndicBERT / XLM-R / MuRIL / mBERT + ensemble
│   ├── emotion.py        # Emotion classifier head
│   ├── bias.py           # Demographic parity, equalized odds, CLFI calculator
│   ├── factcheck.py      # Wikipedia/Gov/News retrieval + entailment verifier
│   ├── xai_service.py    # SHAP Explainer + LIME Tabular/Text
│   ├── graph.py          # Neo4j driver wrapper (KG)
│   ├── graphrag.py       # ChromaDB retriever + Llama3/Gemma generator
│   ├── subtitles.py      # Whisper + forced alignment → SRT/VTT
│   └── tts.py            # Multilingual TTS (Indic voices)
├── models/               # Pydantic v2 schemas (request/response)
│   ├── auth.py
│   ├── nlp.py
│   ├── audit.py
│   ├── verify.py
│   └── common.py
├── core/
│   ├── config.py         # PydanticSettings: MONGO_URI, NEO4J_URI, CHROMA_HOST, JWT_SECRET, …
│   ├── security.py       # JWT encode/decode, bcrypt password hashing, OTP TOTP
│   └── db.py             # MongoDB, Neo4j, ChromaDB client singletons
├── tests/
│   ├── conftest.py
│   ├── test_nlp.py
│   ├── test_audit.py
│   └── test_auth.py
├── requirements.txt
├── Dockerfile            # GPU-enabled backend image
└── README.md
```

## 🔑 Environment Variables (`backend/.env`)

```dotenv
APP_NAME="Cross-Lingual Fairness Audit API"
APP_ENV=dev
APP_HOST=0.0.0.0
APP_PORT=8000

JWT_SECRET="<openssl rand -hex 32>"
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

MONGO_URI="mongodb://localhost:27017/fairness_audit"
MONGO_DB=fairness_audit

NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="<neo4j password>"

CHROMA_HOST="localhost"
CHROMA_PORT=8000
CHROMA_COLLECTION="document_embeddings"

SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="<SG key>"

HF_HOME="/srv/huggingface"
MODEL_CACHE="/srv/models"
```

## ▶️ Run

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install --upgrade pip && pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open http://localhost:8000/docs for the Swagger UI.

> macOS note: The backend `requirements.txt` does not include `openai-whisper` or other optional audio transcription packages. If you install those separately, `llvmlite` and `numba` may need native build tools such as `cmake` and `libomp`.
>
> Example Homebrew setup:
> ```bash
> brew install cmake libomp
> export LDFLAGS="-L/opt/homebrew/opt/libomp/lib"
> export CPPFLAGS="-I/opt/homebrew/opt/libomp/include"
> ```
>
> Then install optional audio dependencies with:
> ```bash
> pip install openai-whisper
> ```

> Note: The current backend implementation includes real routes for auth, audit, and NLP. Other routers in `backend/routers/__init__.py` are provided as placeholder stubs in `backend/routers/_stubs.py`.
