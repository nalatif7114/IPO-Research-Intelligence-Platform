import re

with open("agents/orchestrator/agent.py", "r") as f:
    content = f.read()

helper_code = """
    async def _update_job_step(self, job_id: str, step_name: str, step_order: int, status: str, result: dict = None):
        from backend.app.database.session import async_session_factory
        from backend.app.models.job import JobStep, JobStatus, Job
        from sqlalchemy import select
        from datetime import datetime, timezone
        import uuid
        
        async with async_session_factory() as session:
            stmt = select(JobStep).where(JobStep.job_id == uuid.UUID(job_id), JobStep.step_name == step_name)
            step = (await session.execute(stmt)).scalar_one_or_none()
            
            if not step:
                step = JobStep(
                    job_id=uuid.UUID(job_id),
                    step_name=step_name,
                    step_order=step_order,
                    status=JobStatus(status),
                    started_at=datetime.now(timezone.utc) if status == "running" else None,
                    progress=50.0 if status == "running" else (100.0 if status == "completed" else 0.0),
                    result=result
                )
                session.add(step)
            else:
                step.status = JobStatus(status)
                if status == "completed":
                    step.completed_at = datetime.now(timezone.utc)
                    step.progress = 100.0
                if result:
                    step.result = result
            
            if status == "completed":
                stmt_job = select(Job).where(Job.id == uuid.UUID(job_id))
                job = (await session.execute(stmt_job)).scalar_one_or_none()
                if job:
                    job.progress = min(99.0, job.progress + 9.0)
            
            await session.commit()

    def _wrap_node(self, step_name: str, step_order: int, node_func):
        async def wrapper(state: dict) -> dict:
            await self._update_job_step(state["job_id"], step_name, step_order, "running")
            try:
                new_state = await node_func(state)
                await self._update_job_step(state["job_id"], step_name, step_order, "completed")
                return new_state
            except Exception as e:
                await self._update_job_step(state["job_id"], step_name, step_order, "failed", {"error": str(e)})
                raise
        return wrapper
"""

# Insert helper code after _build_graph
content = content.replace("    def _build_graph(self):", helper_code + "\n    def _build_graph(self):")

# Replace add_node calls
replacements = {
    'workflow.add_node("agent_document_intake", self._node_document_intake)': 'workflow.add_node("agent_document_intake", self._wrap_node("Document Intake", 1, self._node_document_intake))',
    'workflow.add_node("agent_parser_ocr", self._node_parser_ocr)': 'workflow.add_node("agent_parser_ocr", self._wrap_node("Document Parsing", 2, self._node_parser_ocr))',
    'workflow.add_node("agent_chunking_embedding", self._node_chunking_embedding)': 'workflow.add_node("agent_chunking_embedding", self._wrap_node("Chunking & Embedding", 3, self._node_chunking_embedding))',
    'workflow.add_node("agent_business_analysis", self._node_business_analysis)': 'workflow.add_node("agent_business_analysis", self._wrap_node("Business Analysis", 4, self._node_business_analysis))',
    'workflow.add_node("agent_financial_analysis", self._node_financial_analysis)': 'workflow.add_node("agent_financial_analysis", self._wrap_node("Financial Analysis", 5, self._node_financial_analysis))',
    'workflow.add_node("agent_risk_assessment_p1", self._node_risk_assessment_p1)': 'workflow.add_node("agent_risk_assessment_p1", self._wrap_node("Risk Assessment Phase 1", 6, self._node_risk_assessment_p1))',
    'workflow.add_node("agent_valuation", self._node_valuation)': 'workflow.add_node("agent_valuation", self._wrap_node("Valuation Modeling", 7, self._node_valuation))',
    'workflow.add_node("agent_risk_assessment_p2", self._node_risk_assessment_p2)': 'workflow.add_node("agent_risk_assessment_p2", self._wrap_node("Risk Assessment Phase 2", 8, self._node_risk_assessment_p2))',
    'workflow.add_node("agent_governance", self._node_governance)': 'workflow.add_node("agent_governance", self._wrap_node("Governance Analysis", 9, self._node_governance))',
    'workflow.add_node("agent_report_generator", self._node_report_generator)': 'workflow.add_node("agent_report_generator", self._wrap_node("Report Synthesis", 10, self._node_report_generator))',
    'workflow.add_node("agent_evaluation", self._node_evaluation)': 'workflow.add_node("agent_evaluation", self._wrap_node("Quality Check", 11, self._node_evaluation))',
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Update execute method to save final state to Job.result
execute_old = """
        # Invoke the LangGraph workflow
        final_state = await self.graph.ainvoke(initial_state)
        
        return OrchestratorOutput(
"""
execute_new = """
        # Invoke the LangGraph workflow
        final_state = await self.graph.ainvoke(initial_state)
        
        from backend.app.database.session import async_session_factory
        from backend.app.models.job import Job, JobStatus
        from sqlalchemy import select
        import uuid
        from datetime import datetime, timezone
        
        async with async_session_factory() as session:
            stmt = select(Job).where(Job.id == uuid.UUID(input_data.job_id))
            job = (await session.execute(stmt)).scalar_one_or_none()
            if job:
                # Store final_state in result for caching
                job.result = dict(final_state)
                job.status = JobStatus.COMPLETED
                job.progress = 100.0
                job.completed_at = datetime.now(timezone.utc)
            await session.commit()
            
        return OrchestratorOutput(
"""
content = content.replace(execute_old, execute_new)

with open("agents/orchestrator/agent.py", "w") as f:
    f.write(content)
print("Updated agent.py")
