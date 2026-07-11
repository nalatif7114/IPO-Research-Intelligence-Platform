from __future__ import annotations

class ValuationService:
    """Service layer for valuation operations."""
    
    async def run_dcf(self, financial_data: dict, assumptions: dict) -> dict:
        raise NotImplementedError
        
    async def run_relative_valuation(self, financial_data: dict, peers: list[str]) -> dict:
        raise NotImplementedError
        
    async def run_sensitivity(self, base_case: dict, variables: list[dict]) -> list[dict]:
        raise NotImplementedError
