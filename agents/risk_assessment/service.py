from __future__ import annotations

class RiskAssessmentService:
    """Service layer for risk assessment operations."""
    
    async def extract_risks(self, context_chunks: list[dict]) -> list[dict]:
        raise NotImplementedError
        
    async def score_risks(self, risks: list[dict]) -> list[dict]:
        raise NotImplementedError
        
    async def generate_heat_map(self, scored_risks: list[dict]) -> dict:
        raise NotImplementedError
