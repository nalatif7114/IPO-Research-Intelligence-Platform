"""FastAPI dependency injection providers."""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator
from typing import Any

from fastapi import Depends

from backend.app.config import Settings, get_settings as _get_settings
from backend.app.database.session import get_session

# Re-export so other modules can import from dependencies
get_settings = _get_settings


async def get_db_session() -> AsyncGenerator[Any, None]:
    """Yield an async SQLAlchemy session and ensure it is closed afterwards.

    This is a thin wrapper around :func:`app.database.session.get_session`
    so that all dependency injection flows through a single module.
    """
    async for session in get_session():
        yield session


async def get_current_user(
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    """Return the currently authenticated user.

    **Placeholder implementation** — returns a mock user dict until the full
    JWT verification pipeline is wired up.
    """
    return {
        "id": str(uuid.UUID("00000000-0000-0000-0000-000000000001")),
        "email": "admin@example.com",
        "full_name": "Admin User",
        "role": "admin",
        "is_active": True,
    }
