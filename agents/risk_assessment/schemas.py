from pydantic import BaseModel, Field
from typing import List, Literal

class RiskAssessmentInput(BaseModel):
    document_id: str

class RiskDetail(BaseModel):
    description: str = Field(description="Detailed description of the risk, or 'Insufficient evidence.' if none found.")
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(description="Severity of the risk.")
    likelihood: Literal["LOW", "MEDIUM", "HIGH"] = Field(description="Likelihood of the risk occurring.")
    impact: str = Field(description="Potential impact on the company.")
    mitigation: str = Field(description="Stated mitigation strategies from the document.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0.")
    citations: List[str] = Field(description="Exact sentences from the context proving this risk exists.")

class RiskAssessmentOutput(BaseModel):
    operational_risk: List[RiskDetail]
    financial_risk: List[RiskDetail]
    regulatory_risk: List[RiskDetail]
    legal_risk: List[RiskDetail]
    market_risk: List[RiskDetail]
    business_risk: List[RiskDetail]
    technology_risk: List[RiskDetail]
    cybersecurity_risk: List[RiskDetail]
    liquidity_risk: List[RiskDetail]
    governance_risk: List[RiskDetail]
    macroeconomic_risk: List[RiskDetail]
    supply_chain_risk: List[RiskDetail]
    foreign_exchange_risk: List[RiskDetail]
    environmental_risk: List[RiskDetail]
    social_risk: List[RiskDetail]
