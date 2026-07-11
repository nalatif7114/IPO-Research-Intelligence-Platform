from pydantic import BaseModel
class DocumentIntakeInput(BaseModel):
    job_id: str
    document_id: str
class DocumentIntakeOutput(BaseModel):
    raw_storage_path: str
