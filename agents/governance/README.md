# Governance Agent
Acts as the final reviewer before report generation, checking for hallucinations and consistency.

## Inputs
- all_agent_outputs, source_chunks

## Outputs
- hallucination_flags, consistency_issues, citation_gaps, compliance_warnings, approved
