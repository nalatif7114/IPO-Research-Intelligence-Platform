import os

agents_dir = 'c:/Collage/Semester 6/Data Mining/UAS/IPO/agents'

agent_configs = {
    'document_intake': {
        'input': 'DocumentIntakeInput',
        'output': 'DocumentIntakeOutput',
        'schema': 'from pydantic import BaseModel\nclass DocumentIntakeInput(BaseModel):\n    job_id: str\n    document_id: str\nclass DocumentIntakeOutput(BaseModel):\n    raw_storage_path: str\n',
        'mock': 'DocumentIntakeOutput(raw_storage_path=f"raw/{input_data.document_id}.pdf")'
    },
    'parser_ocr': {
        'input': 'ParserOcrInput',
        'output': 'ParserOcrOutput',
        'schema': 'from pydantic import BaseModel\nclass ParserOcrInput(BaseModel):\n    document_id: str\n    raw_storage_path: str\nclass ParserOcrOutput(BaseModel):\n    parsed_storage_path: str\n    parsed_sections: list[str]\n',
        'mock': 'ParserOcrOutput(parsed_storage_path=f"parsed/{input_data.document_id}.json", parsed_sections=["Risk Factors", "MD&A"])'
    },
    'chunking_embedding': {
        'input': 'ChunkingEmbeddingInput',
        'output': 'ChunkingEmbeddingOutput',
        'schema': 'from pydantic import BaseModel\nclass ChunkingEmbeddingInput(BaseModel):\n    document_id: str\n    parsed_storage_path: str\nclass ChunkingEmbeddingOutput(BaseModel):\n    total_chunks: int\n    embedding_dimensions: int\n',
        'mock': 'ChunkingEmbeddingOutput(total_chunks=100, embedding_dimensions=1024)'
    },
    'business_analysis': {
        'input': 'BusinessAnalysisInput',
        'output': 'BusinessAnalysisOutput',
        'schema': 'from pydantic import BaseModel\nclass BusinessAnalysisInput(BaseModel):\n    document_id: str\nclass BusinessAnalysisOutput(BaseModel):\n    market: str\n    status: str\n',
        'mock': 'BusinessAnalysisOutput(market="tech", status="mocked")'
    },
    'financial_analysis': {
        'input': 'FinancialAnalysisInput',
        'output': 'FinancialAnalysisOutput',
        'schema': 'from pydantic import BaseModel\nclass FinancialAnalysisInput(BaseModel):\n    document_id: str\nclass FinancialAnalysisOutput(BaseModel):\n    revenue: int\n    status: str\n',
        'mock': 'FinancialAnalysisOutput(revenue=1000000, status="mocked")'
    },
    'risk_assessment': {
        'input': 'RiskAssessmentInput',
        'output': 'RiskAssessmentOutput',
        'schema': 'from pydantic import BaseModel\nclass RiskAssessmentInput(BaseModel):\n    document_id: str\n    phase: int\nclass RiskAssessmentOutput(BaseModel):\n    identified_risks: int\n    status: str\n',
        'mock': 'RiskAssessmentOutput(identified_risks=10 if input_data.phase == 1 else 2, status="mocked")'
    },
    'valuation': {
        'input': 'ValuationInput',
        'output': 'ValuationOutput',
        'schema': 'from pydantic import BaseModel\nclass ValuationInput(BaseModel):\n    document_id: str\nclass ValuationOutput(BaseModel):\n    dcf: int\n    status: str\n',
        'mock': 'ValuationOutput(dcf=5000000, status="mocked")'
    },
    'governance': {
        'input': 'GovernanceInput',
        'output': 'GovernanceOutput',
        'schema': 'from pydantic import BaseModel\nclass GovernanceInput(BaseModel):\n    document_id: str\nclass GovernanceOutput(BaseModel):\n    approved: bool\n    report: dict\n',
        'mock': 'GovernanceOutput(approved=True, report={"status": "approved"})'
    },
    'report_generator': {
        'input': 'ReportGeneratorInput',
        'output': 'ReportGeneratorOutput',
        'schema': 'from pydantic import BaseModel\nclass ReportGeneratorInput(BaseModel):\n    job_id: str\n    document_id: str\nclass ReportGeneratorOutput(BaseModel):\n    final_report_path: str\n',
        'mock': 'ReportGeneratorOutput(final_report_path=f"reports/{input_data.job_id}.pdf")'
    },
    'evaluation': {
        'input': 'EvaluationInput',
        'output': 'EvaluationOutput',
        'schema': 'from pydantic import BaseModel\nclass EvaluationInput(BaseModel):\n    job_id: str\n    final_report_path: str\nclass EvaluationOutput(BaseModel):\n    score: int\n',
        'mock': 'EvaluationOutput(score=95)'
    },
}

for agent_name, config in agent_configs.items():
    folder = os.path.join(agents_dir, agent_name)
    os.makedirs(folder, exist_ok=True)
    
    # Write schemas.py
    with open(os.path.join(folder, 'schemas.py'), 'w', encoding='utf-8') as f:
        f.write(config['schema'])
        
    # Write agent.py
    class_name = agent_name.replace('_', ' ').title().replace(' ', '')
    agent_code = f"""from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.{agent_name}.schemas import {config['input']}, {config['output']}
import asyncio

class {class_name}Agent(BaseAgent[{config['input']}, {config['output']}]):
    def __init__(self):
        super().__init__(AgentConfig(name="{agent_name}"))
        
    async def validate_input(self, input_data: {config['input']}) -> bool:
        return True
        
    async def execute(self, input_data: {config['input']}) -> {config['output']}:
        await asyncio.sleep(0.5)
        return {config['mock']}
        
    async def handle_error(self, error: Exception) -> None:
        pass
"""
    with open(os.path.join(folder, 'agent.py'), 'w', encoding='utf-8') as f:
        f.write(agent_code)

print('All 10 agents updated with Pydantic mocks.')
