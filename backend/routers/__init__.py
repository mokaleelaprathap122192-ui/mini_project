"""Init package for routers — all routers are exported from here so app/main.py can import them directly."""

from routers import audit, auth, nlp
from routers._stubs import (
    admin,
    analytics,
    media,
    rag,
    reports,
    study,
    uploads,
    verify,
)

__all__ = [
    "admin",
    "analytics",
    "audit",
    "auth",
    "media",
    "nlp",
    "rag",
    "reports",
    "study",
    "uploads",
    "verify",
]
