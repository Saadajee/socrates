#backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DOCS_PATH = os.path.join(BASE_DIR, "app/data/docs")
VECTOR_DB_PATH = os.path.join(BASE_DIR, "app/data/vector_store.index")
VECTOR_DB_META_PATH = os.path.join(BASE_DIR, "app/data/vector_store_meta.pkl")

class Settings(BaseSettings):
    JWT_SECRET: str
    JWT_EXPIRES_MIN: int = 60
    SIMILARITY_THRESHOLD: float = 0.75
    MIN_CONTEXT_CHUNKS: int = 2


    GROQ_API_KEY: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8"
    )

settings = Settings()
