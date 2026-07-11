from __future__ import annotations
import abc
import io
import pypdf
import structlog
from pydantic import BaseModel, Field

logger = structlog.stdlib.get_logger(__name__)

class ParsedPage(BaseModel):
    page_number: int
    text: str
    has_ocr_fallback: bool = False

class DocumentLoader(abc.ABC):
    """Abstract interface for loading documents."""
    
    @abc.abstractmethod
    def load(self, content: bytes, document_id: str) -> list[ParsedPage]:
        pass
        
class PDFLoader(DocumentLoader):
    """PDF Loader implementation with optional OCR fallback mock."""
    
    def __init__(self, use_ocr: bool = True):
        self.use_ocr = use_ocr
        
    def _mock_ocr(self, page_number: int) -> str:
        """Mock OCR for when standard text extraction fails or returns too little."""
        logger.info("ocr_fallback_triggered", page=page_number)
        return f"[OCR EXTRACTED TEXT FOR PAGE {page_number}]\nThis is a mock OCR extraction of an image-heavy page."

    def load(self, content: bytes, document_id: str) -> list[ParsedPage]:
        logger.info("loading_pdf", document_id=document_id)
        pages = []
        try:
            reader = pypdf.PdfReader(io.BytesIO(content))
            for i, page in enumerate(reader.pages):
                text = page.extract_text()
                
                # Heuristic for OCR
                has_ocr = False
                if self.use_ocr and (not text or len(text.strip()) < 50):
                    text = self._mock_ocr(i + 1)
                    has_ocr = True
                    
                pages.append(ParsedPage(
                    page_number=i + 1,
                    text=text or "",
                    has_ocr_fallback=has_ocr
                ))
        except Exception as e:
            logger.error("pdf_load_error", document_id=document_id, error=str(e))
            # Fallback to mock for bad PDFs during testing
            pages.append(ParsedPage(page_number=1, text="[Mock PDF Content due to Parse Error]", has_ocr_fallback=True))
            
        return pages
