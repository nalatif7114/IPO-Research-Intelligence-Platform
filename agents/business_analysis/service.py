from __future__ import annotations

class BusinessAnalysisService:
    """Service layer for business analysis operations."""
    
    async def analyze_business_model(self, context_chunks: list[dict]) -> dict:
        raise NotImplementedError
        
    async def analyze_market(self, context_chunks: list[dict]) -> dict:
        raise NotImplementedError
        
    async def assess_management(self, context_chunks: list[dict]) -> dict:
        raise NotImplementedError
