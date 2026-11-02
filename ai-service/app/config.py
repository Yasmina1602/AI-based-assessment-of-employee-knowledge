import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import List

# Explicitly load .env from ai-service and root
env_path = Path(__file__).resolve().parent.parent / ".env"
root_env = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)
if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=False)

class Settings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:1234@localhost:5432/employee_assessment_db")
    PORT: int = int(os.getenv("PORT", "8001"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

    # Ordered list of models to try in fallback sequence (ultra-fast 3.6 & 3.1 first)
    FALLBACK_MODELS: List[str] = [
        "gemini-3.6-flash",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemma-4-26b-a4b-it",
        "gemma-4-31b-it"
    ]

    EMBEDDING_MODEL: str = "gemini-embedding-001"
    EMBEDDING_DIMENSION: int = 768

    class Config:
        extra = "allow"

settings = Settings()
