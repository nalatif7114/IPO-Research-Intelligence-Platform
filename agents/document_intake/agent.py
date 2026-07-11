from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.document_intake.schemas import DocumentIntakeInput, DocumentIntakeOutput
import asyncio

class DocumentIntakeAgent(BaseAgent[DocumentIntakeInput, DocumentIntakeOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="document_intake"))
        
    async def validate_input(self, input_data: DocumentIntakeInput) -> bool:
        return True
        
    async def execute(self, input_data: DocumentIntakeInput) -> DocumentIntakeOutput:
        await asyncio.sleep(0.5)
        return DocumentIntakeOutput(raw_storage_path=f"raw/{input_data.document_id}.pdf")
        
    async def handle_error(self, error: Exception) -> None:
        pass
