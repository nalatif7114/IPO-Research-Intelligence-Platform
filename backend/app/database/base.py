"""Database base module — SQLAlchemy DeclarativeBase with reusable mixins."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class UUIDMixin:
    """Mixin that provides a UUID primary key column."""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        nullable=False,
    )


class TimestampMixin:
    """Mixin that provides created_at and updated_at timestamp columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SoftDeleteMixin:
    """Mixin that provides soft-delete columns (deleted_at, is_deleted)."""

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )


class Base(UUIDMixin, TimestampMixin, SoftDeleteMixin, DeclarativeBase):
    """Application-wide SQLAlchemy declarative base.

    Combines UUID primary key, automatic timestamps, and soft-delete
    capabilities so every model inherits them by default.
    """

    __abstract__ = True

    def __repr__(self) -> str:
        """Return a developer-friendly string representation."""
        return f"<{self.__class__.__name__}(id={self.id!r})>"
