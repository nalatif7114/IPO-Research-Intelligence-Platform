from __future__ import annotations
import abc
from pydantic import BaseModel
from rag.retriever import RetrievalResult

class ContextWindow(BaseModel):
    context_text: str
    chunks_used: list[str]
    total_tokens: int

class ContextBuilder(abc.ABC):
    """Abstract interface for building context windows."""
    
    @abc.abstractmethod
    def build_context(self, chunks: list[RetrievalResult], token_budget: int) -> ContextWindow:
        pass

class TokenBudgetContextBuilder(ContextBuilder):
    """Context builder with deduplication, sorting, and token budgeting."""
    
    def _mock_count_tokens(self, text: str) -> int:
        """Mock token counter (approx 4 chars per token)."""
        return len(text) // 4
        
    def build_context(self, chunks: list[RetrievalResult], token_budget: int) -> ContextWindow:
        # 1. Deduplicate by chunk_id
        seen = set()
        deduped = []
        for c in chunks:
            if c.chunk_id not in seen:
                seen.add(c.chunk_id)
                deduped.append(c)
                
        # 2. Sort by relevance (assuming they come in sorted from reranker, but we ensure it)
        deduped.sort(key=lambda x: x.score, reverse=True)
        
        # 3. Apply token budget
        final_text_blocks = []
        used_ids = []
        current_tokens = 0
        
        for c in deduped:
            c_tokens = self._mock_count_tokens(c.text)
            # Add some overhead for metadata formatting
            c_tokens += 10 
            
            if current_tokens + c_tokens <= token_budget:
                # Format chunk with metadata
                meta = c.metadata
                header = f"[Doc: {meta.get('document_id', 'UNK')} | Page: {meta.get('page', 'UNK')} | Section: {meta.get('section', 'UNK')}]"
                block = f"{header}\n{c.text}"
                
                final_text_blocks.append(block)
                used_ids.append(c.chunk_id)
                current_tokens += c_tokens
            else:
                break
                
        return ContextWindow(
            context_text="\n\n---\n\n".join(final_text_blocks),
            chunks_used=used_ids,
            total_tokens=current_tokens
        )
