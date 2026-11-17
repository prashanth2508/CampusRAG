import os
import shutil
import uuid
import fitz
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, BackgroundTasks, Response
from fastapi.responses import FileResponse

from app.schemas.document import DocumentResponse
from app.database.db import get_documents_col
from app.auth.deps import get_current_user, require_admin
from app.core.config import settings
from app.services.pdf_service import PDFService
from app.services.vector_store import vector_store_service

router = APIRouter(prefix="/documents", tags=["Document Management"])

def process_document_background(doc_id: str, file_path: str, doc_metadata: dict):
    """Background task to extract text, chunk, embed, and update document status."""
    docs_col = get_documents_col()
    try:
        docs_col.update_one({"_id": doc_id}, {"$set": {"status": "Processing"}})

        # 1. Read PDF & compute checksum if needed
        pages_data = PDFService.extract_pages(file_path)

        # 2. Chunk pages
        chunks = PDFService.chunk_extracted_pages(
            pages_data=pages_data,
            chunk_size=600,
            chunk_overlap=100,
            metadata={
                "document_id": doc_id,
                "document_name": doc_metadata.get("originalFileName", "Document.pdf"),
                "department": doc_metadata.get("department"),
                "semester": str(doc_metadata.get("semester")),
                "subject": doc_metadata.get("subject"),
                "module": doc_metadata.get("module")
            }
        )

        if not chunks:
            # Robust fallback: create document knowledge chunk from metadata
            chunks = [{
                "chunk_id": f"{doc_id}_c0",
                "text": f"Document: {doc_metadata.get('name')}\nSubject: {doc_metadata.get('subject')}\nModule: {doc_metadata.get('module')}\nDepartment: {doc_metadata.get('department')}\nAcademic reference material and diagrams.",
                "metadata": {
                    "document_id": doc_id,
                    "document_name": doc_metadata.get("originalFileName", "Document.pdf"),
                    "department": doc_metadata.get("department"),
                    "semester": str(doc_metadata.get("semester")),
                    "subject": doc_metadata.get("subject"),
                    "module": doc_metadata.get("module"),
                    "page_number": 1
                }
            }]

        # 3. Embed & Store in ChromaDB
        chunk_count = vector_store_service.add_chunks(chunks)

        # 4. Mark Processed in MongoDB
        docs_col.update_one(
            {"_id": doc_id},
            {"$set": {
                "status": "Processed",
                "chunkCount": chunk_count,
                "updatedAt": datetime.utcnow().isoformat()
            }}
        )
        print(f"Document {doc_id} ({doc_metadata.get('name')}) processed successfully with {chunk_count} chunks!")

    except Exception as e:
        print(f"Error processing document {doc_id}: {e}")
        docs_col.update_one({"_id": doc_id}, {"$set": {"status": "Failed", "description": str(e)}})


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    name: str = Form(...),
    department: str = Form(...),
    semester: str = Form(...),
    subject: str = Form(...),
    module: str = Form(...),
    documentType: str = Form(...),  # Notes, Syllabus, Question Paper, Reference Material, Assignment, Lab Manual, Other
    academicYear: str = Form(...),
    description: Optional[str] = Form(""),
    current_user: dict = Depends(require_admin)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

    file_bytes = await file.read()
    checksum = PDFService.calculate_checksum(file_bytes)

    docs_col = get_documents_col()
    existing_checksum = docs_col.find_one({"checksum": checksum, "status": "Processed"})
    if existing_checksum:
        raise HTTPException(
            status_code=400,
            detail=f"Duplicate PDF detected! This exact file was already uploaded as '{existing_checksum.get('name')}'."
        )

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    doc_record = {
        "_id": file_id,
        "name": name,
        "originalFileName": file.filename,
        "department": department,
        "semester": str(semester),
        "subject": subject,
        "module": module,
        "documentType": documentType,
        "academicYear": academicYear,
        "description": description or "",
        "filePath": file_path,
        "status": "Uploaded",
        "chunkCount": 0,
        "uploadedBy": current_user.get("name", "Admin"),
        "checksum": checksum,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }

    docs_col.insert_one(doc_record)

    # Launch processing pipeline
    background_tasks.add_task(process_document_background, file_id, file_path, doc_record)

    return DocumentResponse(
        id=file_id,
        name=doc_record["name"],
        originalFileName=doc_record["originalFileName"],
        department=doc_record["department"],
        semester=doc_record["semester"],
        subject=doc_record["subject"],
        module=doc_record["module"],
        documentType=doc_record["documentType"],
        academicYear=doc_record["academicYear"],
        description=doc_record["description"],
        filePath=doc_record["filePath"],
        status="Uploaded",
        chunkCount=0,
        uploadedBy=doc_record["uploadedBy"],
        checksum=checksum,
        createdAt=doc_record["createdAt"],
        updatedAt=doc_record["updatedAt"]
    )


@router.get("", response_model=List[DocumentResponse])
def list_documents(
    department: Optional[str] = None,
    semester: Optional[str] = None,
    subject: Optional[str] = None,
    module: Optional[str] = None,
    documentType: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if department and department != "All Departments":
        query["department"] = department
    if semester and semester != "All Semesters":
        query["semester"] = str(semester)
    if subject and subject != "All Subjects":
        query["subject"] = subject
    if module and module != "All Modules":
        query["module"] = module
    if documentType and documentType != "All Types":
        query["documentType"] = documentType

    docs_col = get_documents_col()
    docs = docs_col.find(query, sort_by="createdAt", reverse=True)

    if search:
        s_lower = search.lower()
        docs = [
            d for d in docs
            if s_lower in d.get("name", "").lower() or
               s_lower in d.get("subject", "").lower() or
               s_lower in d.get("originalFileName", "").lower() or
               s_lower in d.get("description", "").lower()
        ]

    return [
        DocumentResponse(
            id=str(d["_id"]),
            name=d["name"],
            originalFileName=d.get("originalFileName", d["name"]),
            department=d["department"],
            semester=str(d["semester"]),
            subject=d["subject"],
            module=d["module"],
            documentType=d.get("documentType", "Notes"),
            academicYear=d.get("academicYear", "2025-2026"),
            description=d.get("description", ""),
            filePath=d.get("filePath", ""),
            status=d.get("status", "Processed"),
            chunkCount=d.get("chunkCount", 0),
            uploadedBy=d.get("uploadedBy", "Admin"),
            checksum=d.get("checksum"),
            createdAt=d.get("createdAt"),
            updatedAt=d.get("updatedAt")
        ) for d in docs
    ]


@router.get("/{doc_id}")
def get_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    docs_col = get_documents_col()
    doc = docs_col.find_one({"_id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


def resolve_file_path(stored_path: str) -> str:
    """Normalize file path for cross-platform compatibility (Windows vs Linux)."""
    if not stored_path:
        return ""
    norm = stored_path.replace("\\", "/")
    if os.path.exists(norm):
        return norm
    filename = os.path.basename(norm)
    candidate = os.path.join(settings.UPLOAD_DIR, filename)
    if os.path.exists(candidate):
        return candidate
    return norm


@router.get("/{doc_id}/view")
def view_document_pdf(doc_id: str):
    docs_col = get_documents_col()
    doc = docs_col.find_one({"_id": doc_id})
    file_path = resolve_file_path(doc.get("filePath", "")) if doc else ""
    if not doc or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF file not found")
    safe_filename = doc.get("originalFileName", "document.pdf")
    return FileResponse(
        file_path,
        media_type="application/pdf",
        content_disposition_type="inline",
        headers={"Content-Disposition": f'inline; filename="{safe_filename}"'}
    )


@router.get("/{doc_id}/diagram/{page_num}")
def get_document_diagram(doc_id: str, page_num: int, download: bool = False):
    """
    Extract embedded diagram / figure image from the requested PDF page.
    Falls back to high-resolution page rendering if drawing or vector.
    Serves inline for direct in-browser viewing, with optional download.
    """
    docs_col = get_documents_col()
    doc = docs_col.find_one({"_id": doc_id})
    file_path = resolve_file_path(doc.get("filePath", "")) if doc else ""
    if not doc or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF document not found")

    try:
        pdf = fitz.open(file_path)
        if page_num < 1 or page_num > len(pdf):
            raise HTTPException(status_code=400, detail="Page number out of bounds")

        page = pdf[page_num - 1]
        
        # 1. Search for largest embedded image (figures, diagrams, flowcharts)
        images = page.get_images()
        best_img = None
        best_area = 0

        for img_info in images:
            xref = img_info[0]
            try:
                extracted = pdf.extract_image(xref)
                w, h = extracted.get("width", 0), extracted.get("height", 0)
                # Filter out tiny icon decorations (< 80x80)
                if w >= 80 and h >= 80 and (w * h) > best_area:
                    best_area = w * h
                    best_img = extracted
            except Exception:
                continue

        disp_type = "attachment" if download else "inline"
        doc_base = os.path.splitext(doc.get("originalFileName", "diagram"))[0]

        if best_img:
            img_bytes = best_img["image"]
            ext = best_img.get("ext", "png").lower()
            media_type = f"image/{ext}" if ext in ["jpeg", "jpg", "png", "webp"] else "image/jpeg"
            pdf.close()
            return Response(
                content=img_bytes,
                media_type=media_type,
                headers={
                    "Content-Disposition": f'{disp_type}; filename="{doc_base}_page_{page_num}_diagram.{ext}"',
                    "Cache-Control": "public, max-age=86400"
                }
            )

        # 2. If vector/line drawing or no embedded raster image, render page pixmap
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        pdf.close()
        return Response(
            content=img_bytes,
            media_type="image/png",
            headers={
                "Content-Disposition": f'{disp_type}; filename="{doc_base}_page_{page_num}_diagram.png"',
                "Cache-Control": "public, max-age=86400"
            }
        )

    except Exception as e:
        print(f"Error extracting diagram from PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to extract diagram: {str(e)}")


@router.get("/{doc_id}/page-image/{page_num}")
def get_document_page_image(doc_id: str, page_num: int):
    """Render full PDF page at 150 DPI as PNG image."""
    docs_col = get_documents_col()
    doc = docs_col.find_one({"_id": doc_id})
    file_path = resolve_file_path(doc.get("filePath", "")) if doc else ""
    if not doc or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="PDF document not found")

    try:
        pdf = fitz.open(file_path)
        if page_num < 1 or page_num > len(pdf):
            raise HTTPException(status_code=400, detail="Page number out of bounds")

        page = pdf[page_num - 1]
        pix = page.get_pixmap(dpi=150)
        img_bytes = pix.tobytes("png")
        pdf.close()
        return Response(
            content=img_bytes,
            media_type="image/png",
            headers={"Cache-Control": "public, max-age=86400"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{doc_id}/reprocess")
def reprocess_document(doc_id: str, background_tasks: BackgroundTasks, current_user: dict = Depends(require_admin)):
    docs_col = get_documents_col()
    doc = docs_col.find_one({"_id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = resolve_file_path(doc.get("filePath", ""))
    vector_store_service.delete_document_chunks(doc_id)
    background_tasks.add_task(process_document_background, doc_id, file_path, doc)
    return {"message": "Document re-processing started in background."}


@router.delete("/{doc_id}")
def delete_document(doc_id: str, current_user: dict = Depends(require_admin)):
    docs_col = get_documents_col()
    doc = docs_col.find_one({"_id": doc_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # 1. Delete vector embeddings from ChromaDB
    vector_store_service.delete_document_chunks(doc_id)

    # 2. Delete physical PDF file
    file_path = resolve_file_path(doc.get("filePath", ""))
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

    # 3. Delete record from MongoDB
    docs_col.delete_one({"_id": doc_id})

    return {"message": "Document deleted successfully"}


@router.post("/batch-delete")
def batch_delete_documents(doc_ids: List[str], current_user: dict = Depends(require_admin)):
    """Delete multiple documents and their vector embeddings in one operation."""
    docs_col = get_documents_col()
    deleted_count = 0
    for doc_id in doc_ids:
        doc = docs_col.find_one({"_id": doc_id})
        if doc:
            vector_store_service.delete_document_chunks(doc_id)
            if doc.get("filePath") and os.path.exists(doc["filePath"]):
                try:
                    os.remove(doc["filePath"])
                except Exception:
                    pass
            docs_col.delete_one({"_id": doc_id})
            deleted_count += 1

    return {"message": f"Successfully deleted {deleted_count} documents", "deletedCount": deleted_count}
