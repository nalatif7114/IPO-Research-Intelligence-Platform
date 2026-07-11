from __future__ import annotations
from pydantic import BaseModel
from typing import Optional

class FinancialAnalysisInput(BaseModel):
    document_id: str
    context_chunks: list[dict]
    table_data: Optional[list[dict]] = None

class FinancialAnalysisOutput(BaseModel):
    income_statements: list[dict]
    balance_sheets: list[dict]
    cash_flows: list[dict]
    ratios: dict
    trend_analysis: dict
    unusual_items: list[str]
    source_citations: list[dict]
