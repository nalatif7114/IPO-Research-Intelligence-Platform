import json
import structlog
import asyncio
from agents.agent_common.base_agent import BaseAgent, AgentConfig
from agents.chunking_embedding.schemas import ChunkingEmbeddingInput, ChunkingEmbeddingOutput
from backend.app.config import get_settings
from storage.minio_storage import MinIOStorage
from rag.chunker import HierarchicalChunker
from rag.loader import ParsedPage
from vector_store.qdrant_client import QdrantVectorStore
from agents.agent_common.provider_factory import get_llm_provider

logger = structlog.stdlib.get_logger(__name__)

class ChunkingEmbeddingAgent(BaseAgent[ChunkingEmbeddingInput, ChunkingEmbeddingOutput]):
    def __init__(self):
        super().__init__(AgentConfig(name="chunking_embedding"))
        self.settings = get_settings()
        self.storage = MinIOStorage(
            endpoint=self.settings.minio_endpoint,
            access_key=self.settings.minio_access_key,
            secret_key=self.settings.minio_secret_key,
            bucket=self.settings.minio_bucket,
            secure=self.settings.minio_use_ssl,
        )
        self.chunker = HierarchicalChunker()
        self.vector_store = QdrantVectorStore(
            host=self.settings.qdrant_host,
            port=self.settings.qdrant_port,
            embedding_dim=self.settings.embedding_dimensions
        )
        self.provider = get_llm_provider()
        
    async def validate_input(self, input_data: ChunkingEmbeddingInput) -> bool:
        if not input_data.document_id or not input_data.parsed_storage_path:
            return False
        return True
        
    async def execute(self, input_data: ChunkingEmbeddingInput) -> ChunkingEmbeddingOutput:
        logger.info("starting_chunking_embedding", document_id=input_data.document_id)
        
        # 1. Download parsed JSON
        try:
            raw_data = await self.storage.download(input_data.parsed_storage_path)
            parsed_json = json.loads(raw_data)
            pages = [ParsedPage(**page_dict) for page_dict in parsed_json]
        except Exception as e:
            logger.error("failed_to_download_or_parse", error=str(e), path=input_data.parsed_storage_path)
            # Note: The ParserOcrAgent is currently a stub and doesn't upload the file to MinIO.
            # This will raise a NoSuchKey/S3Error during execution.
            raise
            
        # 2. Chunking
        chunks = self.chunker.chunk(pages, input_data.document_id)
        if not chunks:
            return ChunkingEmbeddingOutput(
                total_chunks=0, 
                embedding_dimensions=self.settings.embedding_dimensions
            )
            
        # 3. Generate Embeddings in batches
        embedded_vectors = []
        batch_size = 16
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            texts = [c.content for c in batch]
            try:
                embeddings = await self.provider.embeddings(texts)
                for chunk, embedding in zip(batch, embeddings):
                    payload = chunk.metadata.model_dump()
                    payload["content"] = chunk.content
                    
                    embedded_vectors.append({
                        "id": chunk.metadata.chunk_id,
                        "vector": embedding,
                        "payload": payload
                    })
            except Exception as e:
                logger.error("embedding_generation_failed", error=str(e), batch_start=i)
                raise
                
        # 4. Upsert to Qdrant
        collection_name = "global_prospectus_collection"
        await self.vector_store.upsert(collection=collection_name, vectors=embedded_vectors)
        
        logger.info("chunking_embedding_completed", document_id=input_data.document_id, total_chunks=len(embedded_vectors))
        return ChunkingEmbeddingOutput(
            total_chunks=len(embedded_vectors), 
            embedding_dimensions=self.settings.embedding_dimensions
        )
        
    async def handle_error(self, error: Exception) -> None:
        logger.error("chunking_embedding_agent_error", error=str(error))
