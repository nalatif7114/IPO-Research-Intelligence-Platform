from __future__ import annotations

class ModelRegistry:
    """Registry for available embedding and reranking models."""
    
    def __init__(self):
        self.models = {}
        
    def register_model(self, name: str, model_impl: object) -> None:
        self.models[name] = model_impl
        
    def get_model(self, name: str) -> object:
        return self.models.get(name)
        
    def list_models(self) -> list[str]:
        return list(self.models.keys())
