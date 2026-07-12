from pydantic import BaseModel
from typing import List

class BusinessAnalysisInput(BaseModel):
    document_id: str

class BusinessAnalysisOutput(BaseModel):
    company_overview: str
    business_model: str
    revenue_streams: List[str]
    competitive_advantage: str
    industry_position: str
    swot: str
    growth_drivers: List[str]
    business_risks: List[str]
    confidence_score: float
    citations: List[str]
