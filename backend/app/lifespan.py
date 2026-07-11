"""FastAPI application lifespan context manager."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI

logger = structlog.stdlib.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown lifecycle events.

    Startup:
        - Logs application start
        - Placeholder for database pool, Redis, and Qdrant client initialisation

    Shutdown:
        - Logs application stop
        - Placeholder for graceful connection cleanup
    """
    logger.info("application_startup", message="IPO Research Intelligence Platform starting …")

    # TODO: initialise async DB engine pool
    # TODO: initialise Redis connection pool
    # TODO: initialise Qdrant client

    yield

    # TODO: close DB engine
    # TODO: close Redis pool
    # TODO: close Qdrant client

    logger.info("application_shutdown", message="IPO Research Intelligence Platform stopped.")
