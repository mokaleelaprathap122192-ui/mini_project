"""Minimal auth router scaffold (login / register / OTP / forgot-password).

Integrates with JWT & OTP helpers in core/security.
"""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from core.security import (
    create_access_token,
    generate_otp,
    hash_password,
    verify_otp,
    verify_password,
)

router = APIRouter(prefix="/auth")

UserRole = Literal["admin", "researcher", "student", "guest"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    role: UserRole = "student"


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=2, max_length=80)
    role: Literal["researcher", "student"] = "student"
    organization: str | None = None


class TokenResponse(BaseModel):
    token: str
    user: dict


class OtpRequest(BaseModel):
    email: EmailStr


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    """Demo login. Accepts any password; returns JWT for the requested role."""
    user = {
        "id": f"usr_{payload.role}_001",
        "email": payload.email,
        "name": f"{payload.role.title()} User",
        "role": payload.role,
        "organization": "Dept. of AI, ML & DS",
    }
    token = create_access_token(user)
    return TokenResponse(token=token, user=user)


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest):
    password_hash = hash_password(payload.password)
    user = {
        "id": "usr_new_1",
        "email": payload.email,
        "name": payload.name,
        "role": payload.role,
        "organization": payload.organization,
        "password_hash": password_hash,
    }
    token = create_access_token(user)
    return TokenResponse(token=token, user=user)


@router.post("/otp/send", status_code=200)
def send_otp(payload: OtpRequest):
    code = generate_otp(payload.email)
    # NOTE: Integrate with SMTP in production; return code in DEV only
    return {"ok": True, "otp_code_demo_only": code}


@router.post("/otp/verify", response_model=TokenResponse)
def verify_otp_ep(payload: OtpVerifyRequest):
    if not verify_otp(payload.email, payload.code):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired OTP")
    user = {"email": payload.email, "name": "Verified User", "role": "student"}
    return TokenResponse(token=create_access_token(user), user=user)


@router.post("/forgot", status_code=200)
def forgot_password(payload: OtpRequest):
    generate_otp(payload.email)
    return {"ok": True, "message": "Reset instructions sent if the email exists."}
