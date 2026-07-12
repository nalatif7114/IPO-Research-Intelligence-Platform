from pydantic import BaseModel, Field
from typing import List, Literal, Generic, TypeVar, Optional, Dict, Any

T = TypeVar('T')

class ValuationMetric(BaseModel, Generic[T]):
    value: T = Field(description="The extracted/synthesized detail, or 'Insufficient evidence.' if data is missing.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0.")
    citations: List[str] = Field(description="Exact sentences or excerpts from the context proving the value.")

class ValuationInput(BaseModel):
    document_id: str
    business_analysis: Optional[Dict[str, Any]] = None
    financial_analysis: Optional[Dict[str, Any]] = None
    risk_assessment: Optional[Dict[str, Any]] = None
    governance_analysis: Optional[Dict[str, Any]] = None

class ValuationOutput(BaseModel):
    business_quality: ValuationMetric[str]
    revenue_quality: ValuationMetric[str]
    growth_quality: ValuationMetric[str]
    profitability: ValuationMetric[str]
    cash_flow_quality: ValuationMetric[str]
    balance_sheet_strength: ValuationMetric[str]
    capital_structure: ValuationMetric[str]
    competitive_advantage: ValuationMetric[str]
    corporate_governance: ValuationMetric[str]
    risk_profile: ValuationMetric[str]
    ipo_pricing_attractiveness: ValuationMetric[str]
    valuation_confidence: ValuationMetric[str]
    
    investment_recommendation: ValuationMetric[Literal["STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL", "UNKNOWN"]]
    investment_thesis: ValuationMetric[str]
    bull_case: ValuationMetric[str]
    bear_case: ValuationMetric[str]
    key_catalysts: ValuationMetric[List[str]]
    major_risks: ValuationMetric[List[str]]
    margin_of_safety_discussion: ValuationMetric[str]
