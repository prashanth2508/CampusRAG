import fitz  # PyMuPDF
import hashlib
import os
import re
from typing import List, Dict, Any, Tuple

class PDFService:
    @staticmethod
    def calculate_checksum(file_bytes: bytes) -> str:
        """Calculate SHA-256 hash of file content for duplicate detection."""
        return hashlib.sha256(file_bytes).hexdigest()

    @staticmethod
    def extract_pages(file_path: str) -> List[Dict[str, Any]]:
        """
        Extract text page by page from PDF.
        Returns a list of dicts: [{"page_number": int, "text": str, "has_ocr": bool}]
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at {file_path}")

        doc = fitz.open(file_path)
        pages_data = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            raw_text = page.get_text("text") or ""
            cleaned = PDFService.clean_text(raw_text)

            is_scanned = len(cleaned.strip()) < 10
            
            pages_data.append({
                "page_number": page_num + 1,
                "text": cleaned,
                "is_scanned": is_scanned
            })

        doc.close()
        return pages_data

    @staticmethod
    def clean_text(text: str) -> str:
        """Clean and normalize extracted PDF text."""
        # Replace multiple spaces, newlines, control characters
        text = re.sub(r'[\r\n]+', '\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        return text.strip()

    @staticmethod
    def chunk_extracted_pages(
        pages_data: List[Dict[str, Any]], 
        chunk_size: int = 600, 
        chunk_overlap: int = 100,
        metadata: Dict[str, Any] = None
    ) -> List[Dict[str, Any]]:
        """
        Split extracted pages into overlapping chunks while retaining page_number and metadata.
        """
        metadata = metadata or {}
        chunks = []
        chunk_index = 0

        for page_info in pages_data:
            page_num = page_info["page_number"]
            text = page_info["text"]

            if not text:
                continue

            # Split page text into sentences/paragraphs
            paragraphs = text.split("\n")
            current_chunk = ""

            for paragraph in paragraphs:
                if len(current_chunk) + len(paragraph) + 1 <= chunk_size:
                    current_chunk += (paragraph + " ")
                else:
                    if current_chunk.strip():
                        chunks.append({
                            "chunk_id": f"{metadata.get('document_id', 'doc')}_p{page_num}_c{chunk_index}",
                            "text": current_chunk.strip(),
                            "metadata": {
                                **metadata,
                                "page_number": page_num,
                                "chunk_index": chunk_index
                            }
                        })
                        chunk_index += 1

                    # Handle overlap
                    words = current_chunk.split()
                    overlap_text = " ".join(words[-20:]) if len(words) >= 20 else ""
                    current_chunk = overlap_text + " " + paragraph + " "

            if current_chunk.strip():
                chunks.append({
                    "chunk_id": f"{metadata.get('document_id', 'doc')}_p{page_num}_c{chunk_index}",
                    "text": current_chunk.strip(),
                    "metadata": {
                        **metadata,
                        "page_number": page_num,
                        "chunk_index": chunk_index
                    }
                })
                chunk_index += 1

        # If document has no extractable text (e.g. scanned textbook / lecture slides),
        # create visual indexing chunks for each page so every page and diagram is searchable
        if not chunks and pages_data:
            subj = metadata.get("subject", "Academic Material")
            mod = metadata.get("module", "Module")
            doc_title = metadata.get("document_name", "Academic Document")
            dept = metadata.get("department", "CSE")
            sem = metadata.get("semester", "5")
            
            for page_info in pages_data:
                page_num = page_info["page_number"]
                page_text = page_info.get("text", "").strip()
                synthetic_text = (
                    f"Subject: {subj}\n"
                    f"Department: {dept} • Semester {sem}\n"
                    f"Module: {mod}\n"
                    f"Document: {doc_title} (Page {page_num})\n"
                    f"Topics: Academic material, textbook diagrams, flowcharts, state transitions, derivations, and formulas for {subj} - {mod}.\n"
                    + (f"Extracted terms: {page_text}" if page_text else f"Visual Page: High-resolution textbook page image & diagram available.")
                )
                chunks.append({
                    "chunk_id": f"{metadata.get('document_id', 'doc')}_p{page_num}_c0",
                    "text": synthetic_text,
                    "metadata": {
                        **metadata,
                        "page_number": page_num,
                        "chunk_index": 0,
                        "is_visual_page": True
                    }
                })

        return chunks
