#backend\app\main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.db.session import engine
from app.db.base import Base
from app.rag.ingest import ingest_docs

from app.api.rag import router as rag_router

app = FastAPI(title="RAG Support Copilot Backend")

app.include_router(rag_router)

# Auto-ingest on startup
@app.on_event("startup")
def startup_ingest():
    ingest_docs()


# CORS - allow both common Vite ports + localhost variations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows any origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

@app.get("/health")
def health():
    return {"status": "ok"}
