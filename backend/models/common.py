"""Shared Pydantic models / enums.  Language set must match frontend `src/types/index.ts`."""

from __future__ import annotations

from typing import Literal

Language = Literal[
    "en",
    "hi",
    "bn",
    "te",
    "mr",
    "ta",
    "ur",
    "gu",
    "kn",
    "ml",
    "or",
    "pa",
    "as",
    "sa",
]

LANGUAGE_LABELS: dict[Language, str] = {
    "en": "English",
    "hi": "हिन्दी (Hindi)",
    "bn": "বাংলা (Bengali)",
    "te": "తెలుగు (Telugu)",
    "mr": "मराठी (Marathi)",
    "ta": "தமிழ் (Tamil)",
    "ur": "اردو (Urdu)",
    "gu": "ગુજરાતી (Gujarati)",
    "kn": "ಕನ್ನಡ (Kannada)",
    "ml": "മലയാളം (Malayalam)",
    "or": "ଓଡ଼ିଆ (Odia)",
    "pa": "ਪੰਜਾਬੀ (Punjabi)",
    "as": "অসমীয়া (Assamese)",
    "sa": "संस्कृतम् (Sanskrit)",
}

SUPPORTED_LANGUAGES: list[Language] = list(LANGUAGE_LABELS.keys())

__all__ = ["Language", "LANGUAGE_LABELS", "SUPPORTED_LANGUAGES"]
