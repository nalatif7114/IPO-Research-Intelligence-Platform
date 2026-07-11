# Orchestrator Agent

Coordinates the end-to-end IPO prospectus analysis pipeline.

## Purpose
The Orchestrator Agent receives an analysis request, builds a task execution DAG, dispatches work to the appropriate downstream agents, and monitors overall progress.

## Inputs
- `job_id` — unique identifier for the analysis run
- `prospectus_id` — reference to the uploaded prospectus document
- `requested_sections` — list of analysis sections to produce

## Outputs
- `job_id` — echoed for correlation
- `status` — final status of the orchestration run
- `steps_completed` — ordered list of steps that completed successfully
