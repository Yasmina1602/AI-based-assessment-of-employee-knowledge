import numpy as np
import logging
from typing import List, Dict, Any
from app.database import get_chunks_for_department
from app.gemini_client import gemini_client

logger = logging.getLogger("rag_engine")

class RAGEngine:
    @staticmethod
    def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return float(np.dot(a, b) / (norm_a * norm_b))

    @classmethod
    async def search_relevant_chunks(
        cls,
        department_id: int,
        query: str,
        top_k: int = 5,
        threshold: float = 0.4
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top_k chunks for the given department matching the query semantically.
        """
        # 1. Fetch all chunks for this department from DB
        chunks = await get_chunks_for_department(department_id)
        if not chunks:
            logger.warning(f"No chunks found for department {department_id}")
            return []

        # 2. Compute query embedding
        query_embedding = await gemini_client.get_embedding(query)

        # 3. Compute cosine similarities
        scored_chunks = []
        for ch in chunks:
            score = cls.cosine_similarity(query_embedding, ch["embedding"])
            if score >= threshold:
                scored_chunks.append({
                    "id": ch["id"],
                    "document_id": ch["document_id"],
                    "content": ch["content"],
                    "score": round(score, 4),
                    "metadata": ch["metadata"]
                })

        # 4. Sort descending by score
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]

rag_engine = RAGEngine()

