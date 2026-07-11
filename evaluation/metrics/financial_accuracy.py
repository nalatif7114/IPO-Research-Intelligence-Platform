from __future__ import annotations
import abc

class FinancialAccuracyMetric(abc.ABC):
    """Measures accuracy of financial numbers extracted vs source."""
    
    @abc.abstractmethod
    def compute(self, extracted_data: dict, source_data: dict) -> float:
        pass
