from pydantic import BaseModel
from typing import List

class EvaluationInput(BaseModel):
    document_id: str
    target_agent: str

class EvaluationOutput(BaseModel):
    groundedness: float
    faithfulness: float
    coverage: float
    missing_evidence: List[str]
    citation_completeness: float
    confidence: float
