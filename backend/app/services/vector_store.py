import os
import chromadb
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.embedding_service import embedding_service

class VectorStoreService:
    def __init__(self):
        self.collection_name = "campusrag_academic_kb"
        self._init_client()

    def _init_client(self):
        if hasattr(self, 'collection') and self.collection is not None:
            return
        try:
            os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
            self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            print(f"VectorStoreService initialized. Collection: '{self.collection_name}' (Count: {self.collection.count()})")
        except Exception as e:
            print(f"ChromaDB persistent client init warning ({e}). Re-attempting client load...")
            self.client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> int:
        """
        Add text chunks with metadata to ChromaDB.
        """
        if not chunks:
            return 0

        self._init_client()

        ids = [chunk["chunk_id"] for chunk in chunks]
        documents = [chunk["text"] for chunk in chunks]
        
        metadatas = []
        for chunk in chunks:
            m = chunk.get("metadata", {})
            clean_meta = {}
            for k, v in m.items():
                if v is not None:
                    clean_meta[k] = str(v) if not isinstance(v, (int, float, bool, str)) else v
            metadatas.append(clean_meta)

        embeddings = embedding_service.embed_texts(documents)

        # Batch upsert in slices of 200 to prevent ChromaDB payload/batch limits
        batch_size = 200
        for i in range(0, len(chunks), batch_size):
            b_ids = ids[i:i+batch_size]
            b_docs = documents[i:i+batch_size]
            b_metas = metadatas[i:i+batch_size]
            b_embs = embeddings[i:i+batch_size]
            self.collection.upsert(
                ids=b_ids,
                documents=b_docs,
                metadatas=b_metas,
                embeddings=b_embs
            )

        return len(chunks)

    def delete_document_chunks(self, document_id: str) -> bool:
        """Delete all vector chunks associated with a specific document_id."""
        try:
            self._init_client()
            self.collection.delete(where={"document_id": str(document_id)})
            return True
        except Exception as e:
            print(f"Error deleting document chunks for {document_id}: {e}")
            return False

    def search(
        self,
        query: str,
        department: Optional[str] = None,
        semester: Optional[str] = None,
        subject: Optional[str] = None,
        module: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Perform vector similarity search with metadata filtering and automatic fallback for high recall.
        """
        self._init_client()

        if self.collection.count() == 0:
            return []

        query_vector = embedding_service.embed_query(query)

        # Build progressive filter attempts:
        filters_to_try = []

        conditions = []
        if department and department != "All Departments":
            conditions.append({"department": str(department)})
        if semester and semester != "All Semesters":
            conditions.append({"semester": str(semester)})
        if subject and subject != "All Subjects":
            conditions.append({"subject": str(subject)})
        if module and module != "All Modules":
            conditions.append({"module": str(module)})

        if len(conditions) == 1:
            filters_to_try.append(conditions[0])
        elif len(conditions) > 1:
            filters_to_try.append({"$and": conditions})

        # Relaxed department + semester filter
        dept_sem_conds = []
        if department and department != "All Departments":
            dept_sem_conds.append({"department": str(department)})
        if semester and semester != "All Semesters":
            dept_sem_conds.append({"semester": str(semester)})

        if len(dept_sem_conds) == 1:
            filters_to_try.append(dept_sem_conds[0])
        elif len(dept_sem_conds) > 1:
            filters_to_try.append({"$and": dept_sem_conds})

        filters_to_try.append(None)  # Global fallback

        retrieved_chunks = []

        for where_filter in filters_to_try:
            try:
                results = self.collection.query(
                    query_embeddings=[query_vector],
                    n_results=top_k,
                    where=where_filter,
                    include=["documents", "metadatas", "distances"]
                )

                if results and results.get("documents") and len(results["documents"]) > 0 and len(results["documents"][0]) > 0:
                    docs = results["documents"][0]
                    metas = results["metadatas"][0]
                    dists = results.get("distances", [[]])[0]

                    for i in range(len(docs)):
                        dist = dists[i] if i < len(dists) else 0.5
                        similarity = round(1.0 - dist, 4) if dist <= 1.0 else round(1.0 / (1.0 + dist), 4)

                        retrieved_chunks.append({
                            "text": docs[i],
                            "metadata": metas[i],
                            "similarity_score": similarity
                        })
                    
                    # Found chunks! Break filter loop
                    break

            except Exception as e:
                print(f"ChromaDB search filter level failed ({e}), trying next filter level...")
                continue

        return retrieved_chunks

vector_store_service = VectorStoreService()
