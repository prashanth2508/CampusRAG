import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Robustly load backend/.env relative to this file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH, override=True)
else:
    load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "CampusRAG"
    API_V1_STR: str = "/api"
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-campusrag-jwt-key-change-in-prod-2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "campusrag_db")
    
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")  # "gemini" or "openai"
    
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", str(BASE_DIR / "chroma_db"))
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads"))
    DATA_DIR: str = os.getenv("DATA_DIR", str(BASE_DIR / "data"))
    
    TOP_K_RETRIEVAL: int = int(os.getenv("TOP_K_RETRIEVAL", "5"))
    ADMIN_REGISTRATION_SECRET: str = os.getenv("ADMIN_REGISTRATION_SECRET", "campusrag-admin-key-9988")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "644095720788-r9g3vilicu1c4k3v2dp59e92gskte0qe.apps.googleusercontent.com")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    BACKEND_PUBLIC_URL: str = os.getenv("BACKEND_PUBLIC_URL", "https://campusrag-backend-x87x.onrender.com")

    # Database Configuration (PostgreSQL / SQLite)
    SQL_DATABASE_URL: str = os.getenv("SQL_DATABASE_URL", "")

    # SMTP Configuration for Real Email OTP Delivery
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "")
    SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "CampusRAG Academic Security")
    SMTP_TLS: bool = True

    class Config:
        env_file = str(ENV_PATH)
        extra = "ignore"

settings = Settings()
