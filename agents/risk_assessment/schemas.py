from pydantic import BaseModel
class RiskAssessmentInput(BaseModel):
    document_id: str
    phase: int
class RiskAssessmentOutput(BaseModel):
    identified_risks: int
    status: str
