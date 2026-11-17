import re
from typing import List, Dict, Any, Optional, Tuple
from app.services.vector_store import vector_store_service
from app.core.config import settings

class RetrievalService:
    @staticmethod
    def preprocess_query(query: str) -> str:
        """Clean and normalize student query."""
        query = query.strip()
        query = re.sub(r'\s+', ' ', query)
        return query

    @staticmethod
    def retrieve_context(
        query: str,
        department: Optional[str] = None,
        semester: Optional[str] = None,
        subject: Optional[str] = None,
        module: Optional[str] = None,
        top_k: int = None
    ) -> Tuple[str, List[Dict[str, Any]], float]:
        """
        Retrieve relevant context chunks for a query with academic metadata filtering.
        Returns:
            context_text (str): Formatted context string for prompt
            citations (list of dicts): Source citations metadata
            confidence (float): Overall retrieval confidence score
        """
        k = top_k or settings.TOP_K_RETRIEVAL
        clean_query = RetrievalService.preprocess_query(query)

        chunks = vector_store_service.search(
            query=clean_query,
            department=department,
            semester=semester,
            subject=subject,
            module=module,
            top_k=k
        )

        if not chunks:
            return "", [], 0.0

        formatted_context_blocks = []
        citations = []
        scores = []
        seen_citations = set()

        for idx, chunk in enumerate(chunks, 1):
            text = chunk["text"]
            meta = chunk["metadata"]
            score = chunk["similarity_score"]
            scores.append(score)

            doc_name = meta.get("document_name", "Academic Document")
            doc_id = meta.get("document_id", "")
            page_num = meta.get("page_number", 1)
            mod_name = meta.get("module", "General")
            subj_name = meta.get("subject", "")

            formatted_context_blocks.append(
                f"--- [SOURCE {idx}: {doc_name}, DocID: {doc_id}, Page: {page_num}, Subject: {subj_name}, Module: {mod_name}] ---\n{text}\n"
            )

            cite_key = f"{doc_name}_p{page_num}"
            if cite_key not in seen_citations:
                seen_citations.add(cite_key)
                citations.append({
                    "documentName": doc_name,
                    "documentId": str(doc_id),
                    "page": int(page_num),
                    "module": str(mod_name),
                    "score": float(score),
                    "excerpt": text[:150] + "..." if len(text) > 150 else text
                })

        context_text = "\n".join(formatted_context_blocks)
        avg_confidence = round(sum(scores) / len(scores), 2) if scores else 0.0

        return context_text, citations, avg_confidence

retrieval_service = RetrievalService()
