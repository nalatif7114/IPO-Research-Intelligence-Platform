from __future__ import annotations
import abc
import uuid
import re
from pydantic import BaseModel, Field
from typing import Optional

from rag.loader import ParsedPage

class ChunkMetadata(BaseModel):
    document_id: str
    chunk_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: int
    section: Optional[str] = None
    heading: Optional[str] = None
    hierarchy_level: str  # "document", "section", "paragraph", "semantic"

class Chunk(BaseModel):
    content: str
    metadata: ChunkMetadata

class BaseChunker(abc.ABC):
    """Abstract interface for chunking documents."""
    @abc.abstractmethod
    def chunk(self, pages: list[ParsedPage], document_id: str) -> list[Chunk]:
        pass

class HierarchicalChunker(BaseChunker):
    """Chunks documents into multi-level hierarchical representations."""
    
    def chunk(self, pages: list[ParsedPage], document_id: str) -> list[Chunk]:
        chunks = []
        
        # 1. Document Level Chunk (Abstract/Summary mock)
        chunks.append(Chunk(
            content="[Document Level Summary] Full prospectus overview.",
            metadata=ChunkMetadata(
                document_id=document_id, 
                page=1, 
                hierarchy_level="document"
            )
        ))
        
        current_section = "General"
        current_heading = None
        
        for page in pages:
            text = page.text
            
            # Simple heuristic: Double newlines separate paragraphs
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            
            for p in paragraphs:
                # Detect mock headings/sections (e.g., ALL CAPS or "Section X")
                if p.isupper() and len(p) < 60:
                    current_section = p
                    current_heading = p
                    
                    # Section Level Chunk
                    chunks.append(Chunk(
                        content=f"[Section: {current_section}]",
                        metadata=ChunkMetadata(
                            document_id=document_id,
                            page=page.page_number,
                            section=current_section,
                            heading=current_heading,
                            hierarchy_level="section"
                        )
                    ))
                    continue
                
                # Paragraph Level Chunk
                chunks.append(Chunk(
                    content=p,
                    metadata=ChunkMetadata(
                        document_id=document_id,
                        page=page.page_number,
                        section=current_section,
                        heading=current_heading,
                        hierarchy_level="paragraph"
                    )
                ))
                
                # Semantic Chunks (mock split by sentences for MVP)
                sentences = re.split(r'(?<=[.!?]) +', p)
                for sentence in sentences:
                    if len(sentence) > 10:
                        chunks.append(Chunk(
                            content=sentence,
                            metadata=ChunkMetadata(
                                document_id=document_id,
                                page=page.page_number,
                                section=current_section,
                                heading=current_heading,
                                hierarchy_level="semantic"
                            )
                        ))
                        
        return chunks
