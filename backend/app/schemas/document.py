from pydantic import BaseModel, Field
from typing import Optional

class DocumentResponse(BaseModel):
    id: str
    name: str
    originalFileName: str
    department: str
    semester: str
    subject: str
    module: str
    documentType: str
    academicYear: str
    description: Optional[str] = ""
    filePath: str
    status: str  # "Uploaded", "Processing", "Processed", "Failed"
    chunkCount: int = 0
    uploadedBy: str
    checksum: Optional[str] = None
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None
