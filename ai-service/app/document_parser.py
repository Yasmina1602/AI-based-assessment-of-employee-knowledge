import io
import re
from typing import List, Dict, Any
from pypdf import PdfReader
from docx import Document

class DocumentParser:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        reader = PdfReader(io.BytesIO(file_bytes))
        text_parts = []
        for page_idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                text_parts.append(page_text.strip())
        return "\n\n".join(text_parts)

    @staticmethod
    def extract_text_from_docx(file_bytes: bytes) -> str:
        doc = Document(io.BytesIO(file_bytes))
        text_parts = []
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text.strip())
        return "\n\n".join(text_parts)

    @staticmethod
    def clean_text(text: str) -> str:
        # Normalize whitespace, remove extra carriage returns
        text = re.sub(r'\r\n|\r', '\n', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'[ \t]{2,}', ' ', text)
        return text.strip()

    @classmethod
    def chunk_text(
        cls,
        text: str,
        chunk_size: int = 800,
        chunk_overlap: int = 150
    ) -> List[Dict[str, Any]]:
        """
        Splits text into coherent chunks based on paragraphs or sentences.
        """
        cleaned = cls.clean_text(text)
        if not cleaned:
            return []

        paragraphs = [p.strip() for p in cleaned.split("\n\n") if p.strip()]
        chunks = []
        current_chunk = ""
        current_index = 0

        for para in paragraphs:
            if len(current_chunk) + len(para) + 2 <= chunk_size:
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
            else:
                if current_chunk:
                    chunks.append({
                        "index": current_index,
                        "content": current_chunk,
                        "length": len(current_chunk)
                    })
                    current_index += 1
                    # Handle overlap by taking tail of previous chunk
                    overlap_text = current_chunk[-chunk_overlap:] if len(current_chunk) > chunk_overlap else ""
                    current_chunk = (overlap_text + "\n\n" + para).strip() if overlap_text else para
                else:
                    # Very long paragraph exceeds chunk_size, split by sentences
                    sentences = re.split(r'(?<=[.!?])\s+', para)
                    sub_chunk = ""
                    for s in sentences:
                        if len(sub_chunk) + len(s) + 1 <= chunk_size:
                            sub_chunk += " " + s if sub_chunk else s
                        else:
                            if sub_chunk:
                                chunks.append({
                                    "index": current_index,
                                    "content": sub_chunk.strip(),
                                    "length": len(sub_chunk.strip())
                                })
                                current_index += 1
                            sub_chunk = s
                    if sub_chunk:
                        current_chunk = sub_chunk.strip()

        if current_chunk:
            chunks.append({
                "index": current_index,
                "content": current_chunk.strip(),
                "length": len(current_chunk.strip())
            })

        return chunks

