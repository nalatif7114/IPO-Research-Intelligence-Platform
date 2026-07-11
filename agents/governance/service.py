from __future__ import annotations

class GovernanceService:
    """Service layer for governance operations."""
    
    async def detect_hallucinations(self, agent_outputs: dict, source_chunks: list[dict]) -> list[dict]:
        raise NotImplementedError
        
    async def check_consistency(self, agent_outputs: dict) -> list[dict]:
        raise NotImplementedError
        
    async def validate_citations(self, agent_outputs: dict, source_chunks: list[dict]) -> list[dict]:
        raise NotImplementedError
        
    async def check_compliance(self, agent_outputs: dict) -> list[str]:
        raise NotImplementedError
