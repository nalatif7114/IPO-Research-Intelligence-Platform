from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class DocumentIntakeInput(BaseModel):
    """Input schema for the Document Intake Agent."""

    file_path: str | None = None
    url: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class DocumentIntakeOutput(BaseModel):
    """Output schema for the Document Intake Agent."""

    document_id: str
    storage_path: str
    page_count: int = 0
    document_hash: str = ""
