from pydantic import BaseModel
from typing import List

class ReportGeneratorInput(BaseModel):
    document_id: str
    job_id: str

class ReportGeneratorOutput(BaseModel):
    investment_report_markdown: str
    citations: List[str]
