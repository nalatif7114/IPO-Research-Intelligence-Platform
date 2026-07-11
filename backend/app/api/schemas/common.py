"""Common Pydantic schemas shared across API endpoints."""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class StatusResponse(BaseModel):
    """Generic status response."""

    status: str = Field(..., description="Current status string.")
    message: str = Field("", description="Human-readable message.")


class MessageResponse(BaseModel):
    """Simple message-only response."""

    message: str = Field(..., description="Human-readable message.")


class ErrorResponse(BaseModel):
    """Standard error envelope."""

    error: bool = Field(default=True, description="Always ``True`` for errors.")
    message: str = Field(..., description="Error summary.")
    detail: Any = Field(default=None, description="Additional error context.")


class PaginatedResponse(BaseModel, Generic[DataT]):
    """Paginated list response wrapper."""

    items: list[DataT] = Field(default_factory=list, description="Page of results.")
    total: int = Field(0, description="Total number of matching records.")
    page: int = Field(1, description="Current page number (1-indexed).")
    page_size: int = Field(20, description="Number of items per page.")
    pages: int = Field(0, description="Total number of pages.")
