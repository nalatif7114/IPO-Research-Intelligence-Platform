from __future__ import annotations
import abc

class ReportQualityMetric(abc.ABC):
    """Measures overall structure, tone, and readability."""
    
    @abc.abstractmethod
    def compute(self, report_text: str) -> float:
        pass
