"""
Cross-Lingual Fairness Audit Platform — FastAPI entrypoint.

Minimal scaffold. Mounts auth + NLP + audit + verify + XAI + KG + RAG routers.
Includes CORS, JWT middleware hooks, Prometheus metrics, health endpoint,
and /docs (Swagger UI) + /redoc.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add `backend/` to import path when running `uvicorn app.main:app` directly
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import ORJSONResponse  # noqa: E402

from core.config import get_settings  # noqa: E402
from routers import (  # noqa: E402
    admin,
    analytics,
    audit,
    auth,
    media,
    nlp,
    rag,
    reports,
    study,
    uploads,
    verify,
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    description=(
        "Cross-Lingual Fairness Audit of Sentiment Models on Indian Languages.\n"
        "REST API for multilingual NLP pipeline: Whisper V3, IndicTrans2, "
        "IndicBERT / XLM-R / MuRIL / mBERT ensemble, SHAP+LIME XAI, "
        "Neo4j KG, and ChromaDB GraphRAG."
    ),
    version="1.0.0",
    contact={
        "name": "G.Vaishnavi · M.Surya Teja · M.Leela Prathap",
        "email": "project@fairness.ai",
    },
    docs_url="/docs",
    redoc_url="/redoc",
    default_response_class=ORJSONResponse,
)

# ---------------------------------------------------------------------------
# CORS — allow Next.js frontend in dev & production
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3005",
        "http://127.0.0.1:3005",
        "https://fairness-audit.vercel.app",
    ]
    + (settings.cors_origins or []),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Request-Id"],
)


# ---------------------------------------------------------------------------
# Health / readiness
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": "1.0.0",
        "env": settings.app_env,
    }


# ---------------------------------------------------------------------------
# Router mounting
# ---------------------------------------------------------------------------
PREFIX = "/api"
app.include_router(auth.router, prefix=PREFIX, tags=["Auth"])
app.include_router(nlp.router, prefix=PREFIX, tags=["NLP (Language · Translation · Sentiment)"])
app.include_router(uploads.router, prefix=PREFIX, tags=["Uploads"])
app.include_router(audit.router, prefix=PREFIX, tags=["Fairness Audit"])
app.include_router(verify.router, prefix=PREFIX, tags=["Verification"])
app.include_router(rag.router, prefix=PREFIX, tags=["GraphRAG"])
app.include_router(study.router, prefix=PREFIX, tags=["Study Assistant"])
app.include_router(media.router, prefix=PREFIX, tags=["Media (Subtitles / TTS)"])
app.include_router(analytics.router, prefix=PREFIX, tags=["Analytics"])
app.include_router(reports.router, prefix=PREFIX, tags=["Reports"])
app.include_router(admin.router, prefix=PREFIX, tags=["Admin"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.app_env != "production",
        log_level="info",
    )
