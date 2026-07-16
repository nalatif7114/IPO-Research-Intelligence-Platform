# IPO Pipeline Benchmarking Report

## Environment
- Model: Ollama (qwen3:8b)
- Execution: CPU (Dockerized)

## Per-Agent Metrics
| Agent | Execution Time (s) | Prompt Tokens | Context Size (Tokens) |
|---|---|---|---|
| BusinessAnalysis | 1170.91 | 465 | 352 |
| FinancialAnalysis | 5190.89 | 2456 | 580 |
| RiskAssessment | 412.66 | 676 | 149 |
| Governance | 1198.03 | 809 | 287 |
| Valuation | 1806.05 | 897 | 0 |
| ReportGenerator | 0.00 | 373 | 300 |
| Evaluation | 0.00 | 447 | 385 |

## Bottleneck Analysis
- **Slowest Stage:** FinancialAnalysis (5190.89s)
- **Primary Cause:** High token count and extensive context retrieval in a sequential LLM generation process on CPU.

## Recommendations for Optimization
1. **Context Window Pruning:** Reduce retrieved context token budget for `FinancialAnalysis` from 2000 to 1000 tokens. The agent is likely processing redundant chunks.
2. **Parallel Sub-Agents:** `FinancialAnalysis` could be split into two parallel sub-graphs evaluating disparate sections simultaneously.
3. **Structured Schema Simplification:** Reduce the depth of the Pydantic output schema for `FinancialAnalysis`. Deeper schemas increase generation latency substantially on small models like `qwen3:8b`.
4. **Embedding Re-Ranking:** Use a smaller, faster cross-encoder or rely strictly on vector similarity to reduce retrieval time, though LLM generation dominates the bottleneck.
