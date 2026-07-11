from __future__ import annotations
from pydantic import BaseModel

class EvalAgentInput(BaseModel):
    report: dict
    intermediate_outputs: dict

class EvalAgentOutput(BaseModel):
    completeness_score: float
    groundedness_score: float
    consistency_score: float
    readability_score: float
    overall_score: float
    improvement_suggestions: list[str]
