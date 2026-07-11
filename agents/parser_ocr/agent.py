from __future__ import annotations
from agents.agent_common.base_agent import BaseAgent
from agents.parser_ocr.schemas import ParserInput, ParserOutput

class ParserOCRAgent(BaseAgent[ParserInput, ParserOutput]):
    """Agent responsible for parsing documents and performing OCR."""
    
    async def execute(self, input_data: ParserInput) -> ParserOutput:
        raise NotImplementedError
        
    async def validate_input(self, input_data: ParserInput) -> bool:
        raise NotImplementedError
        
    async def handle_error(self, error: Exception) -> None:
        raise NotImplementedError
