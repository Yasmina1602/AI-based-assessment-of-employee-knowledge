import asyncpg
import json
import logging
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("ai_database")

pool: Optional[asyncpg.Pool] = None

async def init_db():
    global pool
    try:
        pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            min_size=2,
            max_size=10
        )
        logger.info("Connected to PostgreSQL database pool.")

        # Ensure document_chunks table exists
        async with pool.acquire() as conn:
            # Try to enable pgvector extension if available
            try:
                await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                logger.info("pgvector extension enabled or already present.")
            except Exception as e:
                logger.warning(f"pgvector extension not installed in PostgreSQL, using float array fallback: {e}")

            await conn.execute("""
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id SERIAL PRIMARY KEY,
                    document_id INTEGER NOT NULL,
                    department_id INTEGER NOT NULL,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    metadata JSONB DEFAULT '{}'::jsonb,
                    embedding JSONB NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_chunks_doc_dept 
                ON document_chunks (document_id, department_id);
            """)
            logger.info("Table document_chunks ensured.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise e

async def close_db():
    global pool
    if pool:
        await pool.close()
        logger.info("Closed PostgreSQL connection pool.")

async def save_chunks(document_id: int, department_id: int, chunks: List[Dict[str, Any]]):
    """
    Saves chunks with embeddings for a document.
    First removes existing chunks for this document.
    """
    global pool
    if not pool:
        await init_db()

    async with pool.acquire() as conn:
        async with conn.transaction():
            # Delete existing chunks for this document
            await conn.execute(
                "DELETE FROM document_chunks WHERE document_id = $1;",
                document_id
            )

            # Insert new chunks
            query = """
                INSERT INTO document_chunks (document_id, department_id, chunk_index, content, metadata, embedding)
                VALUES ($1, $2, $3, $4, $5, $6);
            """
            for chunk in chunks:
                await conn.execute(
                    query,
                    document_id,
                    department_id,
                    chunk["index"],
                    chunk["content"],
                    json.dumps(chunk.get("metadata", {})),
                    json.dumps(chunk["embedding"])
                )
    logger.info(f"Saved {len(chunks)} chunks for document {document_id} (dept: {department_id}).")

async def get_chunks_for_department(department_id: int) -> List[Dict[str, Any]]:
    global pool
    if not pool:
        await init_db()

    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id, document_id, department_id, chunk_index, content, metadata, embedding
            FROM document_chunks
            WHERE department_id = $1
            ORDER BY document_id, chunk_index;
            """,
            department_id
        )
        results = []
        for r in rows:
            results.append({
                "id": r["id"],
                "document_id": r["document_id"],
                "department_id": r["department_id"],
                "chunk_index": r["chunk_index"],
                "content": r["content"],
                "metadata": json.loads(r["metadata"]) if isinstance(r["metadata"], str) else (r["metadata"] or {}),
                "embedding": json.loads(r["embedding"]) if isinstance(r["embedding"], str) else r["embedding"]
            })
        return results

async def delete_chunks_for_document(document_id: int):
    global pool
    if not pool:
        await init_db()

    async with pool.acquire() as conn:
        await conn.execute(
            "DELETE FROM document_chunks WHERE document_id = $1;",
            document_id
        )
    logger.info(f"Deleted chunks for document {document_id}")

