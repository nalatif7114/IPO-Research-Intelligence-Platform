"""FastAPI application lifespan context manager."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI

from backend.app.database.base import Base
from backend.app.database.session import async_engine
# Import all models to ensure they are registered with Base
from backend.app.models.company import Company
from backend.app.models.prospectus import Prospectus
from backend.app.models.document import Document
from backend.app.models.job import Job

logger = structlog.stdlib.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown lifecycle events."""
    logger.info("application_startup", message="IPO Research Intelligence Platform starting …")

    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield

    await async_engine.dispose()
    logger.info("application_shutdown", message="IPO Research Intelligence Platform stopped.")
