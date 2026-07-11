from __future__ import annotations

class EvaluationService:
    """Service layer for evaluation operations."""
    
    async def compute_metrics(self, report: dict, context: dict) -> dict:
        raise NotImplementedError
        
    async def collect_feedback(self, eval_results: dict) -> list[str]:
        raise NotImplementedError
        
    async def build_finetune_dataset(self, inputs: dict, outputs: dict) -> None:
        raise NotImplementedError
