from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.chat import SourceCitation

# Alias for backward compatibility
RAGSource = SourceCitation

class RAGQueryRequest(BaseModel):
    question: str = Field(..., min_length=2)
    department: Optional[str] = None
    semester: Optional[str] = None
    subject: Optional[str] = None
    module: Optional[str] = None
    mode: Optional[str] = "detailed"  # "simple" | "exam" | "short" | "detailed" | "viva"
    chatId: Optional[str] = None
    geminiApiKey: Optional[str] = None

class RAGQueryResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    confidence: float
    mode: str
    chatId: Optional[str] = None
