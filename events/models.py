from __future__ import annotations
from pydantic import BaseModel
from datetime import datetime
from typing import Any

class BaseEvent(BaseModel):
    event_id: str
    timestamp: datetime
    correlation_id: str

class DocumentUploadedEvent(BaseEvent):
    document_id: str
    storage_path: str

class ParserCompletedEvent(BaseEvent):
    document_id: str
    parsed_path: str

class EmbeddingCompletedEvent(BaseEvent):
    document_id: str
    total_chunks: int

class BusinessAnalysisCompletedEvent(BaseEvent):
    document_id: str
    results: dict

class FinancialAnalysisCompletedEvent(BaseEvent):
    document_id: str
    results: dict

class ValuationCompletedEvent(BaseEvent):
    document_id: str
    results: dict

class RiskAssessmentCompletedEvent(BaseEvent):
    document_id: str
    results: dict

class GovernanceCompletedEvent(BaseEvent):
    document_id: str
    approved: bool
    results: dict

class ReportGeneratedEvent(BaseEvent):
    job_id: str
    report_path: str

class EvaluationCompletedEvent(BaseEvent):
    job_id: str
    metrics: dict

class AgentFailedEvent(BaseEvent):
    agent_name: str
    error_message: str
    details: Any
