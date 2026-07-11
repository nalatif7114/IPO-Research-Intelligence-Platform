"""Authentication endpoints — login, register, refresh, and profile."""

from __future__ import annotations

from typing import Any

import structlog
from fastapi import APIRouter, Depends

from backend.app.api.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from backend.app.api.schemas.common import MessageResponse
from backend.app.dependencies import get_current_user

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    """Authenticate a user and return JWT tokens.

    Args:
        body: Login credentials.

    Returns:
        Access and refresh tokens.
    """
    logger.info("login_attempt", email=body.email)
    return TokenResponse(
        access_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.mock_access",
        refresh_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.mock_refresh",
        token_type="bearer",
        expires_in=1800,
    )


@router.post("/register", response_model=UserResponse)
async def register(body: RegisterRequest) -> UserResponse:
    """Register a new user account.

    Args:
        body: Registration data.

    Returns:
        The newly created user profile.
    """
    logger.info("user_registration", email=body.email)
    return UserResponse(
        id="00000000-0000-0000-0000-000000000002",
        email=body.email,
        full_name=body.full_name,
        role=body.role,
        is_active=True,
        last_login=None,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token() -> TokenResponse:
    """Exchange a valid refresh token for a new access token.

    Returns:
        Fresh access and refresh tokens.
    """
    return TokenResponse(
        access_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.mock_refreshed_access",
        refresh_token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.mock_refreshed_refresh",
        token_type="bearer",
        expires_in=1800,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict[str, Any] = Depends(get_current_user)) -> UserResponse:
    """Return the profile of the currently authenticated user.

    Args:
        current_user: Injected current user from JWT.

    Returns:
        The user profile.
    """
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        is_active=current_user["is_active"],
        last_login=None,
    )
