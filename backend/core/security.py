"""JWT helpers + bcrypt password hashing + OTP utilities."""

from __future__ import annotations

import secrets
import time
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import bcrypt
import jwt
from core.config import get_settings

settings = get_settings()


# ---------------------------------------------------------------------------
# Passwords
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------
def create_access_token(
    subject: str | Dict[str, Any],
    expires_minutes: int | None = None,
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.jwt_expire_minutes,
    )
    payload: Dict[str, Any] = {
        "exp": expire,
        "iat": int(time.time()),
        "jti": secrets.token_urlsafe(16),
    }
    if isinstance(subject, dict):
        payload.update(subject)
    else:
        payload["sub"] = str(subject)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


# ---------------------------------------------------------------------------
# OTP (email / 2FA) — 6-digit numeric codes
# ---------------------------------------------------------------------------
_otp_store: Dict[str, tuple[str, float]] = {}  # email → (code, expires_at epoch)


def generate_otp(identifier: str, ttl_seconds: int = 300) -> str:
    code = f"{secrets.randbelow(1_000_000):06d}"
    _otp_store[identifier] = (code, time.time() + ttl_seconds)
    return code


def verify_otp(identifier: str, code: str) -> bool:
    entry = _otp_store.get(identifier)
    if not entry:
        return False
    stored, expires_at = entry
    del _otp_store[identifier]
    if time.time() > expires_at:
        return False
    return secrets.compare_digest(stored, code)
