from pydantic import BaseModel
class EvaluationInput(BaseModel):
    job_id: str
    final_report_path: str
class EvaluationOutput(BaseModel):
    score: int
