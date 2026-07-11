import asyncio
import json
import uuid
import structlog
from pydantic import BaseModel

from rag.loader import PDFLoader
from rag.chunker import HierarchicalChunker
from embeddings.provider import MockEmbeddingProvider
from vector_store.qdrant_client import QdrantVectorStore
from rag.retriever import HybridRetriever, MockReRanker
from rag.context_builder import TokenBudgetContextBuilder
from rag.citation_manager import RAGCitationManager
from evaluation.metrics.rag_evaluator import MockRAGEvaluator

logger = structlog.stdlib.get_logger(__name__)

async def main():
    print("=== Phase 3 RAG Engine Verification ===")
    
    # 1. Setup Mock PDF Content
    document_id = str(uuid.uuid4())
    print(f"\n[1/7] Processing Document: {document_id}")
    dummy_pdf_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    
    # 2. Parse PDF
    print("[2/7] Loading & Parsing PDF...")
    loader = PDFLoader(use_ocr=True)
    pages = loader.load(dummy_pdf_bytes, document_id)
    print(f"Parsed {len(pages)} pages (including mock OCR fallback).")
    
    # 3. Hierarchical Chunking
    print("[3/7] Hierarchical Chunking...")
    chunker = HierarchicalChunker()
    chunks = chunker.chunk(pages, document_id)
    print(f"Generated {len(chunks)} chunks across multiple hierarchies.")
    
    # 4. Embed & Store
    print("[4/7] Generating Embeddings & Upserting to Qdrant...")
    embed_provider = MockEmbeddingProvider(dimension=1024)
    qdrant_store = QdrantVectorStore(host="qdrant", port=6333)
    collection_name = f"test_collection_{uuid.uuid4().hex[:6]}"
    
    # Prepare payload
    vectors = []
    for c in chunks:
        vec = embed_provider.embed_query(c.content)
        vectors.append({
            "id": c.metadata.chunk_id,
            "vector": vec,
            "payload": {
                "chunk_id": c.metadata.chunk_id,
                "document_id": c.metadata.document_id,
                "page": c.metadata.page,
                "section": c.metadata.section,
                "heading": c.metadata.heading,
                "hierarchy_level": c.metadata.hierarchy_level,
                "content": c.content
            }
        })
        
    await qdrant_store.upsert(collection=collection_name, vectors=vectors)
    print(f"Upserted {len(vectors)} vectors into Qdrant collection '{collection_name}'.")
    
    # 5. Retrieve Top-K
    print("\n[5/7] Executing Hybrid Retrieval & Re-ranking...")
    query = "What is the overall summary of the prospectus?"
    retriever = HybridRetriever(
        vector_store=qdrant_store,
        embedding_provider=embed_provider,
        collection_name=collection_name,
        reranker=MockReRanker()
    )
    
    results = await retriever.retrieve(query, top_k=3)
    print(f"Retrieved Top-{len(results)} chunks.")
    
    # 6. Build Context & Citations
    print("\n[6/7] Building Context & Citations...")
    citation_manager = RAGCitationManager()
    citations = citation_manager.generate_citations_from_results(results)
    
    context_builder = TokenBudgetContextBuilder()
    context_window = context_builder.build_context(results, token_budget=500)
    
    print("\n--- ASSEMBLED CONTEXT WINDOW ---")
    print(context_window.context_text)
    print("--------------------------------")
    print(f"Total Tokens: {context_window.total_tokens}")
    print(f"Chunks Used: {context_window.chunks_used}")
    
    print("\n--- GENERATED CITATIONS ---")
    for c in citations:
        print(f"[{c.chunk_id[:8]}] Page {c.page} (Section: {c.section}) - Confidence: {c.confidence:.2f}")
        
    # 7. Evaluation
    print("\n[7/7] Executing RAG Evaluation...")
    evaluator = MockRAGEvaluator()
    metrics = evaluator.evaluate(query, context_window.context_text, "[Mock Generated Answer based on Context]")
    print("Evaluation Metrics:")
    print(json.dumps(metrics.model_dump(), indent=2))
    
    print("\n=== Verification Complete ===")

if __name__ == "__main__":
    asyncio.run(main())
