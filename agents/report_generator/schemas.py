from pydantic import BaseModel
class ReportGeneratorInput(BaseModel):
    job_id: str
    document_id: str
class ReportGeneratorOutput(BaseModel):
    final_report_path: str
