from __future__ import annotations

class ReportGeneratorService:
    """Service layer for report generation operations."""
    
    async def compose_report(self, outputs: dict, template: dict | None) -> str:
        raise NotImplementedError
        
    async def generate_charts(self, data: dict) -> list[str]:
        raise NotImplementedError
        
    async def render_pdf(self, html_content: str) -> str:
        raise NotImplementedError
