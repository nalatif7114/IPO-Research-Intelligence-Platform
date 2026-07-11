from pydantic import BaseModel
class GovernanceInput(BaseModel):
    document_id: str
class GovernanceOutput(BaseModel):
    approved: bool
    report: dict
