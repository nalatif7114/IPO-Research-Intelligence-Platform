from __future__ import annotations
from pydantic import BaseModel
from typing import Optional

class ValuationInput(BaseModel):
    document_id: str
    financial_data: dict
    business_context: dict
    offering_price: Optional[float] = None

class ValuationOutput(BaseModel):
    dcf_valuation: dict
    relative_valuation: dict
    implied_price_range: dict
    recommendation: str
    sensitivity_tables: list[dict]
    key_assumptions: list[str]
    source_citations: list[dict]
