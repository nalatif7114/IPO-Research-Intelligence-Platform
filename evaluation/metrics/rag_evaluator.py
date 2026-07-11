from __future__ import annotations
import abc
import random
from pydantic import BaseModel

class EvaluationMetrics(BaseModel):
    recall_at_k: float
    precision_at_k: float
    mrr: float
    groundedness: float
    coverage: float
    faithfulness: float

class RAGEvaluator(abc.ABC):
    """Abstract interface for RAG evaluation."""
    
    @abc.abstractmethod
    def evaluate(self, query: str, context: str, response: str) -> EvaluationMetrics:
        pass

class MockRAGEvaluator(RAGEvaluator):
    """Mock implementation returning deterministic evaluation metrics."""
    
    def evaluate(self, query: str, context: str, response: str) -> EvaluationMetrics:
        # Deterministic based on query length
        base = (len(query) % 50) / 100.0 + 0.5 # Values between 0.5 and 0.99
        
        return EvaluationMetrics(
            recall_at_k=min(base + 0.1, 1.0),
            precision_at_k=base,
            mrr=min(base + 0.05, 1.0),
            groundedness=min(base + 0.2, 1.0),
            coverage=base,
            faithfulness=min(base + 0.15, 1.0)
        )
