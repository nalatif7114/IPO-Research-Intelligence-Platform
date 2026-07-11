"""Pydantic schemas for report endpoints."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ReportCitationResponse(BaseModel):
    """A single citation within a report."""

    citation_index: int = Field(..., description="Citation ordinal.")
    citation_text: str | None = Field(default=None)
    page_reference: str | None = Field(default=None)

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    """Full report detail response."""

    id: str = Field(..., description="Report UUID.")
    prospectus_id: str = Field(..., description="Related prospectus UUID.")
    report_type: str = Field(..., description="Type of report.")
    report_format: str = Field(..., description="Output format.")
    title: str = Field(..., description="Report title.")
    content: str | None = Field(default=None)
    file_path: str | None = Field(default=None)
    created_at: datetime = Field(..., description="Creation timestamp.")
    citations: list[ReportCitationResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ReportListResponse(BaseModel):
    """Lightweight report summary for list views."""

    id: str = Field(..., description="Report UUID.")
    title: str = Field(...)
    report_type: str = Field(...)
    report_format: str = Field(...)
    created_at: datetime = Field(...)

    model_config = {"from_attributes": True}
