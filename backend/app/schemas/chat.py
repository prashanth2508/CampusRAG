from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class SourceCitation(BaseModel):
    documentName: str
    documentId: Optional[str] = ""
    page: int
    module: Optional[str] = ""
    score: Optional[float] = None
    excerpt: Optional[str] = ""

class ChatMessage(BaseModel):
    id: str
    role: str  # "user" | "assistant"
    content: str
    sources: Optional[List[SourceCitation]] = []
    mode: Optional[str] = "detailed"
    createdAt: Optional[str] = None

class ChatCreate(BaseModel):
    title: Optional[str] = "New Academic Chat"
    department: str
    semester: str
    subject: str
    module: Optional[str] = "All Modules"

class ChatResponse(BaseModel):
    id: str
    userId: str
    title: str
    department: str
    semester: str
    subject: str
    module: str
    messages: List[ChatMessage]
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
