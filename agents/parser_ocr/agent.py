from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.parser_ocr.schemas import ParserOcrInput, ParserOcrOutput
import asyncio

class ParserOcrAgent(BaseAgent[ParserOcrInput, ParserOcrOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="parser_ocr"))
        
    async def validate_input(self, input_data: ParserOcrInput) -> bool:
        return True
        
    async def execute(self, input_data: ParserOcrInput) -> ParserOcrOutput:
        await asyncio.sleep(0.5)
        return ParserOcrOutput(parsed_storage_path=f"parsed/{input_data.document_id}.json", parsed_sections=["Risk Factors", "MD&A"])
        
    async def handle_error(self, error: Exception) -> None:
        pass
