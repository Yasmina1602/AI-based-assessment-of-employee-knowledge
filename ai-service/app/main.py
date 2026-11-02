import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.config import settings
from app.database import init_db, close_db, save_chunks, delete_chunks_for_document
from app.document_parser import DocumentParser
from app.gemini_client import gemini_client
from app.rag_engine import rag_engine
from app.question_generator import question_generator
from app.evaluator import answer_evaluator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Service...")
    await init_db()
    yield
    logger.info("Shutting down AI Service...")
    await close_db()

app = FastAPI(
    title="Employee Assessment AI Microservice",
    description="RAG, Embedding, Question Generation and Open Question Evaluation Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EvaluateRequest(BaseModel):
    department_id: int
    question: str
    employee_answer: str
    evaluation_criteria: Optional[str] = None
    sample_answer: Optional[str] = None

class GenerateQuestionsRequest(BaseModel):
    document_text: str
    department_name: str
    closed_count: int = 10
    open_count: int = 3
    level: str = "Middle"

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ai-service",
        "fallback_models": settings.FALLBACK_MODELS,
        "embedding_model": settings.EMBEDDING_MODEL
    }

@app.post("/api/documents/process")
async def process_document(
    document_id: int = Form(...),
    department_id: int = Form(...),
    department_name: str = Form("Umumiy"),
    file: UploadFile = File(...)
):
    """
    Parses PDF/DOCX, splits into chunks, computes embeddings, saves to DB,
    and automatically generates test questions based strictly on the document!
    """
    try:
        content = await file.read()
        filename = file.filename.lower()
        extracted_text = ""

        if filename.endswith(".pdf"):
            extracted_text = DocumentParser.extract_text_from_pdf(content)
        elif filename.endswith(".docx") or filename.endswith(".doc"):
            extracted_text = DocumentParser.extract_text_from_docx(content)
        elif filename.endswith(".txt"):
            extracted_text = content.decode("utf-8", errors="ignore")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Faqat PDF, DOCX yoki TXT formatidagi fayllar qabul qilinadi."
            )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hujjatdan matn ajratib olinmadi yoki hujjat bo'sh."
            )

        # 1. Chunking
        raw_chunks = DocumentParser.chunk_text(extracted_text)
        if not raw_chunks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Hujjat bo'laklarga ajratilmadi."
            )

        logger.info(f"Generated {len(raw_chunks)} chunks for document {document_id}")

        # 2. Embeddings
        chunks_with_embeddings = []
        for ch in raw_chunks:
            embedding = await gemini_client.get_embedding(ch["content"])
            chunks_with_embeddings.append({
                "index": ch["index"],
                "content": ch["content"],
                "embedding": embedding,
                "metadata": {
                    "document_id": document_id,
                    "filename": file.filename,
                    "length": ch["length"]
                }
            })

        # 3. Save chunks into DB
        await save_chunks(document_id, department_id, chunks_with_embeddings)

        # 4. Generate initial questions from document
        generated_questions = await question_generator.generate_questions_from_document(
            document_text=extracted_text,
            department_name=department_name,
            closed_count=10,
            open_count=3,
            level="Middle"
        )

        return {
            "success": True,
            "document_id": document_id,
            "department_id": department_id,
            "total_chunks": len(chunks_with_embeddings),
            "generated_questions": generated_questions
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hujjatni tahlil qilishda xatolik yuz berdi: {str(e)}"
        )

@app.post("/api/documents/generate-questions")
async def generate_questions_endpoint(req: GenerateQuestionsRequest):
    """
    Manually triggers question generation for a given text or department.
    """
    try:
        result = await question_generator.generate_questions_from_document(
            document_text=req.document_text,
            department_name=req.department_name,
            closed_count=req.closed_count,
            open_count=req.open_count,
            level=req.level
        )
        return result
    except Exception as e:
        logger.error(f"Error generating questions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Savollarni generatsiya qilishda xatolik: {str(e)}"
        )

@app.post("/api/evaluate/open-question")
async def evaluate_answer_endpoint(req: EvaluateRequest):
    """
    Evaluates an open question answer using RAG + Gemini with anti-injection shield.
    """
    try:
        result = await answer_evaluator.evaluate_open_answer(
            department_id=req.department_id,
            question=req.question,
            employee_answer=req.employee_answer,
            evaluation_criteria=req.evaluation_criteria,
            sample_answer=req.sample_answer
        )
        return result
    except Exception as e:
        logger.error(f"Error evaluating open answer: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Javobni baholashda xatolik: {str(e)}"
        )

@app.delete("/api/documents/{document_id}")
async def delete_document_chunks_endpoint(document_id: int):
    try:
        await delete_chunks_for_document(document_id)
        return {"success": True, "message": f"Document {document_id} chunks deleted."}
    except Exception as e:
        logger.error(f"Error deleting chunks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

