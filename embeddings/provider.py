from __future__ import annotations
import abc
import asyncio
import numpy as np

class EmbeddingProvider(abc.ABC):
    """Abstract interface for embedding generation."""
    
    @abc.abstractmethod
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        pass
        
    @abc.abstractmethod
    def embed_query(self, text: str) -> list[float]:
        pass

    async def aembed_documents(self, texts: list[str]) -> list[list[float]]:
        """Asynchronous embedding generation for document chunks."""
        return self.embed_documents(texts)

    async def aembed_query(self, text: str) -> list[float]:
        """Asynchronous embedding generation for a single search query."""
        return self.embed_query(text)

class MockEmbeddingProvider(EmbeddingProvider):
    """Mock implementation returning deterministic dense vectors."""
    
    def __init__(self, dimension: int = 1024):
        self.dimension = dimension
        
    def _generate_mock_vector(self, text: str) -> list[float]:
        # Hash text to seed random for deterministic mock embeddings
        seed = sum(ord(c) for c in text)
        np.random.seed(seed)
        vec = np.random.randn(self.dimension)
        vec = vec / np.linalg.norm(vec)
        return vec.tolist()
        
    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._generate_mock_vector(t) for t in texts]
        
    def embed_query(self, text: str) -> list[float]:
        return self._generate_mock_vector(text)

class ProductionEmbeddingProvider(EmbeddingProvider):
    """Production implementation using the active LLM Provider (Ollama/Gemini) for embeddings."""
    
    def __init__(self):
        from agents.agent_common.provider_factory import get_llm_provider
        self.provider = get_llm_provider()

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        try:
            loop = asyncio.get_running_loop()
            import nest_asyncio  # noqa: F401
            # Run in event loop or fallback
            return asyncio.run(self.provider.embeddings(texts))
        except RuntimeError:
            return asyncio.run(self.provider.embeddings(texts))

    def embed_query(self, text: str) -> list[float]:
        res = self.embed_documents([text])
        return res[0] if res else []

    async def aembed_documents(self, texts: list[str]) -> list[list[float]]:
        return await self.provider.embeddings(texts)

    async def aembed_query(self, text: str) -> list[float]:
        res = await self.provider.embeddings([text])
        return res[0] if res else []
