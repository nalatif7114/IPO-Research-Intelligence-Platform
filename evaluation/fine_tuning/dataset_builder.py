from __future__ import annotations

class DatasetBuilder:
    """Builds LLM fine-tuning datasets from corrected agent outputs."""
    
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        
    async def append_example(self, prompt: str, completion: str) -> None:
        raise NotImplementedError
        
    async def export_jsonl(self, filename: str) -> str:
        raise NotImplementedError
