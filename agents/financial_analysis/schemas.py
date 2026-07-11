from pydantic import BaseModel
class FinancialAnalysisInput(BaseModel):
    document_id: str
class FinancialAnalysisOutput(BaseModel):
    revenue: int
    status: str
