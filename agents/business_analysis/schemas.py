from pydantic import BaseModel
class BusinessAnalysisInput(BaseModel):
    document_id: str
class BusinessAnalysisOutput(BaseModel):
    market: str
    status: str
