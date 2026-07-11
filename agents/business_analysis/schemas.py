from __future__ import annotations
from pydantic import BaseModel

class BusinessAnalysisInput(BaseModel):
    document_id: str
    context_chunks: list[dict]

class BusinessAnalysisOutput(BaseModel):
    company_overview: str
    business_model: str
    market_analysis: str
    competitive_position: str
    management_assessment: str
    use_of_proceeds: str
    source_citations: list[dict]
