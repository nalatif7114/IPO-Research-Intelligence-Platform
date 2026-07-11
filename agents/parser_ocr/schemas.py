from pydantic import BaseModel
class ParserOcrInput(BaseModel):
    document_id: str
    raw_storage_path: str
class ParserOcrOutput(BaseModel):
    parsed_storage_path: str
    parsed_sections: list[str]
