from pydantic import BaseModel
class ValuationInput(BaseModel):
    document_id: str
class ValuationOutput(BaseModel):
    dcf: int
    status: str
