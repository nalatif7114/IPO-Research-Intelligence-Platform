from __future__ import annotations
import asyncio
from celery import shared_task
from agents.orchestrator.agent import OrchestratorAgent
from agents.orchestrator.schemas import OrchestratorInput

async def _run_orchestrator(job_id: str, document_id: str, prospectus_id: str):
    import structlog
    structlog.contextvars.bind_contextvars(job_id=job_id)
    
    agent = OrchestratorAgent()
    input_data = OrchestratorInput(
        job_id=job_id,
        document_id=document_id,
        prospectus_id=prospectus_id,
        requested_sections=["all"]
    )
    await agent.execute(input_data)

@shared_task(name="workers.tasks.process_document_task")
def process_document_task(job_id: str, document_id: str, prospectus_id: str) -> None:
    """Run the orchestrator pipeline for a document."""
    asyncio.run(_run_orchestrator(job_id, document_id, prospectus_id))
