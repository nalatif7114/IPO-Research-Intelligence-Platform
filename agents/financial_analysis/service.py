from __future__ import annotations

class FinancialAnalysisService:
    """Service layer for financial analysis operations."""
    
    async def extract_statements(self, context_chunks: list[dict], table_data: list[dict] | None) -> dict:
        raise NotImplementedError
        
    async def calculate_ratios(self, statements: dict) -> dict:
        raise NotImplementedError
        
    async def analyze_trends(self, statements: dict) -> dict:
        raise NotImplementedError
