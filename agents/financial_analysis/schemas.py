from pydantic import BaseModel, Field
from typing import List, Generic, TypeVar

T = TypeVar('T')

class FinancialMetric(BaseModel, Generic[T]):
    value: T = Field(description="The extracted value, analysis, or 'Insufficient evidence.' if data is missing.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0. Decreases with lack of evidence.")
    citations: List[str] = Field(description="Exact sentences or excerpts from the document proving the value.")

class FinancialAnalysisInput(BaseModel):
    document_id: str

class FinancialAnalysisOutput(BaseModel):
    revenue_trend: FinancialMetric[str]
    revenue_growth: FinancialMetric[str]
    gross_profit: FinancialMetric[str]
    gross_margin: FinancialMetric[str]
    operating_profit: FinancialMetric[str]
    operating_margin: FinancialMetric[str]
    net_income: FinancialMetric[str]
    net_margin: FinancialMetric[str]
    ebitda: FinancialMetric[str]
    cash_flow: FinancialMetric[str]
    operating_cash_flow: FinancialMetric[str]
    free_cash_flow: FinancialMetric[str]
    liquidity: FinancialMetric[str]
    working_capital: FinancialMetric[str]
    debt_structure: FinancialMetric[str]
    leverage: FinancialMetric[str]
    interest_coverage: FinancialMetric[str]
    capital_structure: FinancialMetric[str]
    profitability: FinancialMetric[str]
    efficiency: FinancialMetric[str]
    financial_stability: FinancialMetric[str]
    growth_quality: FinancialMetric[str]
    financial_red_flags: FinancialMetric[List[str]]
    management_commentary: FinancialMetric[str]
    financial_risks: FinancialMetric[List[str]]
