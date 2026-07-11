from __future__ import annotations

from agents.agent_common.base_agent import AgentConfig, BaseAgent
from agents.document_intake.schemas import DocumentIntakeInput, DocumentIntakeOutput


class DocumentIntakeAgent(BaseAgent[DocumentIntakeInput, DocumentIntakeOutput]):
    """Handles ingestion of prospectus documents from files or URLs.

    Validates uploads, computes document hashes, persists to storage, and
    emits a DocumentUploadedEvent on success.
    """

    def __init__(self, config: AgentConfig | None = None) -> None:
        super().__init__(config or AgentConfig(name="document_intake"))

    async def execute(self, input_data: DocumentIntakeInput) -> DocumentIntakeOutput:
        """Ingest the document and persist to object storage."""
        raise NotImplementedError

    async def validate_input(self, input_data: DocumentIntakeInput) -> bool:
        """Ensure at least one of file_path or url is provided."""
        raise NotImplementedError

    async def handle_error(self, error: Exception) -> None:
        """Handle intake errors such as corrupt files or unreachable URLs."""
        raise NotImplementedError
