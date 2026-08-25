"""Typed runtime configuration — loaded from environment or .env file."""

from __future__ import annotations

from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        protected_namespaces=("settings_",),
    )

    app_name: str = Field(default="Cross-Lingual Fairness Audit API")
    app_env: str = Field(default="dev")
    app_host: str = Field(default="0.0.0.0")
    app_port: int = Field(default=8000)
    cors_origins: Optional[List[str]] = Field(default=None)

    # --- JWT ----------------------------------------------------------------
    jwt_secret: str = Field(default="change-me-please")
    jwt_algorithm: str = Field(default="HS256")
    jwt_expire_minutes: int = Field(default=1440)

    # --- MongoDB ------------------------------------------------------------
    mongo_uri: str = Field(default="mongodb://localhost:27017/fairness_audit")
    mongo_db: str = Field(default="fairness_audit")

    # --- Neo4j --------------------------------------------------------------
    neo4j_uri: str = Field(default="bolt://localhost:7687")
    neo4j_user: str = Field(default="neo4j")
    neo4j_password: str = Field(default="neo4j1234")

    # --- ChromaDB -----------------------------------------------------------
    chroma_host: str = Field(default="localhost")
    chroma_port: int = Field(default=8000)
    chroma_collection: str = Field(default="document_embeddings")

    # --- SMTP ---------------------------------------------------------------
    smtp_host: Optional[str] = Field(default=None)
    smtp_port: int = Field(default=587)
    smtp_user: Optional[str] = Field(default=None)
    smtp_pass: Optional[str] = Field(default=None)

    # --- Model cache --------------------------------------------------------
    hf_home: str = Field(default="/tmp/huggingface")
    model_cache: str = Field(default="/tmp/models")

    # --- Translation engines (3-tier fallback chain) -----------------------
    # 1) IndicTrans2 — primary (AI4Bharat / hosted inference endpoint)
    indictrans2_api_key: Optional[str] = Field(default=None)
    indictrans2_endpoint: str = Field(
        default="https://api.openbharat.ai/v1/translation/indictrans2"
    )

    # 2) Google Cloud Translation API — fallback for unsupported pairs
    google_translate_api_key: Optional[str] = Field(default=None)
    google_translate_project: Optional[str] = Field(default=None)

    # 3) Google Gemini API — context-aware translation + explanations + summaries
    gemini_api_key: Optional[str] = Field(default=None)
    gemini_model: str = Field(default="gemini-2.0-flash")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


# Backwards-compatible alias used by some routers/services
get_settings = get_settings
