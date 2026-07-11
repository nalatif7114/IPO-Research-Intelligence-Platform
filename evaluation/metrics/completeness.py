from __future__ import annotations
import abc

class CompletenessMetric(abc.ABC):
    """Measures if all required information is present."""
    
    @abc.abstractmethod
    def compute(self, generated_text: str, requirements: list[str]) -> float:
        pass
