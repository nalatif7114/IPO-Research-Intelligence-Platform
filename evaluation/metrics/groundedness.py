from __future__ import annotations
import abc

class GroundednessMetric(abc.ABC):
    """Measures how well statements are grounded in source text."""
    
    @abc.abstractmethod
    def compute(self, generated_text: str, source_texts: list[str]) -> float:
        pass
