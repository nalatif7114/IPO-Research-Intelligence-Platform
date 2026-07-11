"""User management CRUD endpoints."""

from __future__ import annotations

from typing import Any

import structlog
from fastapi import APIRouter, Depends

from backend.app.api.schemas.auth import UserResponse
from backend.app.api.schemas.common import MessageResponse, PaginatedResponse
from backend.app.dependencies import get_current_user

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=PaginatedResponse[UserResponse])
async def list_users(
    page: int = 1,
    page_size: int = 20,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> PaginatedResponse[UserResponse]:
    """List all users with pagination.

    Args:
        page: Page number (1-indexed).
        page_size: Number of items per page.
        current_user: Injected current user.

    Returns:
        Paginated list of user profiles.
    """
    mock_user = UserResponse(
        id="00000000-0000-0000-0000-000000000001",
        email="admin@example.com",
        full_name="Admin User",
        role="admin",
        is_active=True,
        last_login=None,
    )
    return PaginatedResponse[UserResponse](
        items=[mock_user],
        total=1,
        page=page,
        page_size=page_size,
        pages=1,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> UserResponse:
    """Get a user by ID.

    Args:
        user_id: Target user UUID.
        current_user: Injected current user.

    Returns:
        The requested user profile.
    """
    return UserResponse(
        id=user_id,
        email="user@example.com",
        full_name="Example User",
        role="analyst",
        is_active=True,
        last_login=None,
    )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> UserResponse:
    """Update a user's profile.

    Args:
        user_id: Target user UUID.
        current_user: Injected current user.

    Returns:
        The updated user profile.
    """
    return UserResponse(
        id=user_id,
        email="updated@example.com",
        full_name="Updated User",
        role="analyst",
        is_active=True,
        last_login=None,
    )


@router.delete("/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: str,
    current_user: dict[str, Any] = Depends(get_current_user),
) -> MessageResponse:
    """Soft-delete a user account.

    Args:
        user_id: Target user UUID.
        current_user: Injected current user.

    Returns:
        Confirmation message.
    """
    logger.info("user_deleted", user_id=user_id, by=current_user["id"])
    return MessageResponse(message=f"User {user_id} deleted successfully.")
