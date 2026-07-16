import asyncio
from agents.agent_common.provider_factory import get_llm_provider
from agents.business_analysis.schemas import BusinessAnalysisOutput

async def main():
    print("Getting provider...")
    provider = get_llm_provider()
    
    query = "Provide a comprehensive business analysis of GoTo based on the prospectus."
    print("Calling structured_output...")
    try:
        res = await provider.structured_output(query, BusinessAnalysisOutput)
        print("Success:", res)
    except Exception as e:
        print("Exception:", e)

if __name__ == "__main__":
    asyncio.run(main())
