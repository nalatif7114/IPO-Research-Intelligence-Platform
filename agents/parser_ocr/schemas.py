from __future__ import annotations

from pydantic import BaseModel, Field


class SectionInfo(BaseModel):
    """Metadata about a parsed document section."""

    title: str
    start_page: int
    end_page: int
    content_type: str = "text"


class ParserInput(BaseModel):
    """Input schema for the Parser & OCR Agent."""

    document_id: str
    storage_path: str


class ParserOutput(BaseModel):
    """Output schema for the Parser & OCR Agent."""

    document_id: str
    sections: list[SectionInfo] = Field(default_factory=list)
    tables_count: int = 0
    ocr_confidence: float = 0.0
