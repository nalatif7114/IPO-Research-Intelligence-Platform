"""Pydantic schemas for authentication endpoints."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Request body for user login."""

    email: EmailStr = Field(..., description="User email address.")
    password: str = Field(..., min_length=8, description="User password.")


class RegisterRequest(BaseModel):
    """Request body for user registration."""

    email: EmailStr = Field(..., description="User email address.")
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name.")
    password: str = Field(..., min_length=8, description="Desired password.")
    role: str = Field(default="viewer", description="Requested role.")


class TokenResponse(BaseModel):
    """JWT token pair response."""

    access_token: str = Field(..., description="Short-lived JWT access token.")
    refresh_token: str = Field(..., description="Long-lived JWT refresh token.")
    token_type: str = Field(default="bearer", description="Token type.")
    expires_in: int = Field(..., description="Access token TTL in seconds.")


class UserResponse(BaseModel):
    """Public user profile representation."""

    id: str = Field(..., description="User UUID.")
    email: str = Field(..., description="User email address.")
    full_name: str = Field(..., description="Full name.")
    role: str = Field(..., description="User role.")
    is_active: bool = Field(..., description="Whether the account is active.")
    last_login: datetime | None = Field(default=None, description="Last login timestamp.")

    model_config = {"from_attributes": True}
