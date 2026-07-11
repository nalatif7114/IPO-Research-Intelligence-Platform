from __future__ import annotations
from pydantic import BaseModel
from typing import Optional

class RiskInput(BaseModel):
    document_id: str
    context_chunks: list[dict]
    financial_data: Optional[dict] = None
    business_data: Optional[dict] = None

class RiskOutput(BaseModel):
    risk_factors: list[dict]
    red_flags: list[dict]
    overall_risk_rating: str
    risk_heat_map: dict
    source_citations: list[dict]
