import os
import math
import numpy as np
from typing import List
from app.core.config import settings

class EmbeddingService:
    def __init__(self):
        self._st_model = None
        self._mode = "fallback"
        self._init_model()

    def _init_model(self):
        # Prefer cached local model without network retries
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
        # 1. Try Hugging Face sentence-transformers locally
        try:
            from sentence_transformers import SentenceTransformer
            try:
                self._st_model = SentenceTransformer("all-MiniLM-L6-v2", local_files_only=True)
            except Exception:
                self._st_model = SentenceTransformer("all-MiniLM-L6-v2")
            self._mode = "sentence_transformers"
            print("EmbeddingService: Using sentence-transformers (all-MiniLM-L6-v2).")
            return
        except Exception as e:
            print(f"EmbeddingService: sentence-transformers initialization skipped ({e}).")

        # 2. Try Gemini embedding API
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self._mode = "gemini"
                print("EmbeddingService: Using Gemini API embeddings.")
                return
            except Exception as e:
                print(f"EmbeddingService: Gemini embedding initialization error: {e}")

        # 3. Deterministic normalized hash vectorizer fallback (384 dimensions)
        self._mode = "hash"
        print("EmbeddingService: Using lightweight hash vectorizer (384d fallback).")

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        if self._mode == "sentence_transformers" and self._st_model:
            try:
                embeddings = self._st_model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
                return embeddings.tolist()
            except Exception as e:
                print(f"Embedding error with ST: {e}. Falling back.")

        if self._mode == "gemini" and settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                embeddings = []
                for text in texts:
                    res = genai.embed_content(
                        model="models/text-embedding-004",
                        content=text,
                        task_type="retrieval_document"
                    )
                    embeddings.append(res["embedding"])
                return embeddings
            except Exception as e:
                print(f"Gemini embedding error: {e}")

        # Lightweight 384d hash vectorizer fallback
        return [self._hash_vectorize(t) for t in texts]

    def embed_query(self, query: str) -> List[float]:
        if self._mode == "sentence_transformers" and self._st_model:
            try:
                vec = self._st_model.encode(query, convert_to_numpy=True)
                return vec.tolist()
            except Exception:
                pass

        if self._mode == "gemini" and settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                res = genai.embed_content(
                    model="models/text-embedding-004",
                    content=query,
                    task_type="retrieval_query"
                )
                return res["embedding"]
            except Exception:
                pass

        return self._hash_vectorize(query)

    def _hash_vectorize(self, text: str, dim: int = 384) -> List[float]:
        """Simple, deterministic 384-dimensional normalized n-gram bag-of-words vectorizer."""
        vec = [0.0] * dim
        words = text.lower().split()
        if not words:
            return vec

        for word in words:
            h = int(hashlib_md5(word.encode('utf-8')).hexdigest(), 16)
            idx = h % dim
            val = (h % 100) / 100.0
            vec[idx] += val

        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec


def hashlib_md5(b: bytes):
    import hashlib
    return hashlib.md5(b)

embedding_service = EmbeddingService()
