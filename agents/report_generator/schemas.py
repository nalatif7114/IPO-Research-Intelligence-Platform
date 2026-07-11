from __future__ import annotations
from pydantic import BaseModel
from typing import Optional

class ReportInput(BaseModel):
    approved_outputs: dict
    governance_report: dict
    template_config: Optional[dict] = None

class ReportOutput(BaseModel):
    report_path: str
    formats: list[str]
    scorecard_path: Optional[str] = None
