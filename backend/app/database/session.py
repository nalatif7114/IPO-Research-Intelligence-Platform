"""Async SQLAlchemy engine and session factory."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from backend.app.config import get_settings

_settings = get_settings()

import sys
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool

# Use NullPool for Celery workers to avoid asyncio loop issues with shared connection pools across forks.
# Use the default QueuePool for the FastAPI application to maintain performance and avoid port exhaustion.
pool_class = NullPool if "celery" in sys.argv[0].lower() else AsyncAdaptedQueuePool

async_engine = create_async_engine(
    _settings.database_url,
    echo=_settings.database_echo,
    pool_pre_ping=True,
    poolclass=pool_class
)

async_session_factory = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session, ensuring proper cleanup.

    Intended for use as a FastAPI dependency via ``Depends(get_session)``.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
