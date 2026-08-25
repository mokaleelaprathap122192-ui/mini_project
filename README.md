# 🌐 Cross-Lingual Fairness Audit of Sentiment Models on Indian Languages

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade, full-stack AI platform designed to evaluate, audit, and explain **cross-lingual fairness, bias, and sentiment drift** in NLP models trained on low-resource and high-resource Indian languages (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, etc.).

---

## 📌 Features & Key Capabilities

- 📊 **Cross-Lingual Fairness Index (CLFI)**: Quantify algorithmic bias across languages using Demographic Parity, Equalized Odds, and Disparate Impact metrics.
- 🗣️ **Multilingual Sentiment & Emotion Analysis**: Multi-model support leveraging IndicBERT, XLM-RoBERTa, MuRIL, and mBERT ensembles.
- 🔍 **Explainable AI (XAI)**: Visual explanations using **SHAP** (SHapley Additive exPlanations) and **LIME** (Local Interpretable Model-agnostic Explanations) token importance highlights.
- 🌐 **3-Tier Translation Fallback Engine**: Seamless translation switching across **IndicTrans2** (Primary for Indian languages), **Google Cloud Translate API**, and **Google Gemini 2.0 Flash**.
- 🕸️ **Knowledge Graph & GraphRAG**: Neo4j knowledge representation combined with ChromaDB vector embeddings for context-aware retrieval and fact verification.
- 🎙️ **Subtitles & Speech Integration**: Automated SRT/VTT subtitle generation with forced alignment and Text-to-Speech (TTS) for Indian voices.
- 🔐 **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admins, Researchers, and Students with JWT authentication.
- 🎨 **Modern Responsive UI**: Interactive dashboard built with Next.js 14, Recharts analytics, Framer Motion animations, dark/light themes, and 3D visualizers.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 14 (App Router) + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI Primitives + Framer Motion
- **Charts & Visuals**: Recharts + React Wordcloud + Three.js / React Three Fiber
- **State & i18n**: Zustand + i18next

### **Backend**
- **Framework**: FastAPI (Python 3.10+)
- **Security & Auth**: PyJWT, Bcrypt, OAuth2 / OTP support
- **ML / NLP Libraries**: PyTorch, Hugging Face Transformers (IndicBERT, XLM-R, MuRIL), SHAP, LIME
- **Databases**:
  - **MongoDB** (Async Motor driver) – Audit logs, user management, and evaluation records
  - **Neo4j** – Knowledge Graph relations
  - **ChromaDB** – Vector Store for RAG evidence retrieval
- **API Docs**: Swagger UI (`/docs`) & ReDoc (`/redoc`)

---

## 📂 Project Structure

```
├── frontend/                     # Next.js 14 Frontend Application
│   ├── src/
│   │   ├── app/                  # App Router pages (Dashboard, Audit, NLP, Admin, etc.)
│   │   ├── components/           # UI & Feature components (Layout, NLP panels, Charts)
│   │   ├── lib/                  # API client & helper utilities
│   │   └── store/                # Global state management (Zustand)
│   ├── public/                   # Static assets & i18n translation JSONs
│   ├── package.json
│   └── tailwind.config.ts
│
└── backend/                      # FastAPI Backend Services
    ├── app/                      # Application entrypoint & dependency injection
    ├── core/                     # Database configs (Mongo, Neo4j, Chroma) & Security
    ├── routers/                  # REST API endpoints (Auth, NLP, Audit, GraphRAG, XAI, etc.)
    ├── services/                 # AI/ML business logic (Sentiment, Bias, IndicTrans2, Gemini)
    ├── models/                   # Pydantic schemas
    ├── requirements.txt
    └── .env                      # Environment configuration
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js**: `v18.x` or `v20.x` (with `npm`)
- **Python**: `v3.10` to `v3.12`
- **Git**

---

### 💻 Setup on macOS

#### 1️⃣ Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
The frontend will start at **`http://localhost:3000`**.

#### 2️⃣ Backend Setup
Open a new terminal tab:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The API documentation (Swagger UI) will be available at **`http://localhost:8000/docs`**.

---

### 💻 Setup on Windows

#### 1️⃣ Frontend Setup
Open Command Prompt (CMD) or PowerShell:
```cmd
cd frontend
npm install --legacy-peer-deps
npm run dev
```
The frontend will start at **`http://localhost:3000`**.

#### 2️⃣ Backend Setup
Open a second Command Prompt or PowerShell window:

**PowerShell:**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Command Prompt (CMD):**
```cmd
cd backend
python -m venv .venv
.\.venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🔑 Environment Variables

Create or update `.env` inside `backend/` and `frontend/` (if using client keys):

### `backend/.env`
```env
APP_NAME="Cross-Lingual Fairness Audit API"
APP_ENV=dev
APP_HOST=0.0.0.0
APP_PORT=8000

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# Databases (Optional / Defaults)
MONGO_URI="mongodb://localhost:27017/fairness_audit"
NEO4J_URI="bolt://localhost:7687"
CHROMA_HOST="localhost"

# Translation & AI APIs (Optional)
INDICTRANS2_API_KEY=""
GOOGLE_TRANSLATE_API_KEY=""
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-2.0-flash"
```

---

## 🔐 Demo Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@fairness.ai` | *(any string)* | Full access, user & system management, model configs |
| **Researcher** | `researcher@fairness.ai` | *(any string)* | Fairness audit, XAI analysis, dataset upload |
| **Student** | `student@fairness.ai` | *(any string)* | Read-only evaluation, translation, sentiment playground |

---

## 📊 API Architecture & Endpoints

| Prefix | Component | Description |
| :--- | :--- | :--- |
| `/api/auth/*` | Auth Router | User login, registration, OTP, JWT refresh |
| `/api/nlp/*` | NLP Router | Language detection, translation, sentiment & emotion scoring |
| `/api/audit/*` | Audit Engine | Cross-lingual fairness index (CLFI) and bias calculation |
| `/api/xai/*` | Explainability | Token-level SHAP values & LIME explanations |
| `/api/graphrag/*` | Knowledge RAG | Hybrid graph-vector search for evidence verification |
| `/api/reports/*` | Export Service | PDF, CSV, and JSON report downloads |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue for bug reports or feature requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

