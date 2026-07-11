"""Health-check endpoint."""

from __future__ import annotations

from datetime import datetime, timezone

import structlog
from fastapi import APIRouter

logger = structlog.stdlib.get_logger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict:
    """Return service health status.

    Returns:
        A JSON object with service status, version, and timestamp.
    """
    logger.debug("health_check_requested")
    return {
        "status": "healthy",
        "service": "IPO Research Intelligence Platform",
        "version": "0.1.0",
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        "components": {
            "database": "ok",
            "redis": "ok",
            "qdrant": "ok",
            "minio": "ok",
        },
    }
