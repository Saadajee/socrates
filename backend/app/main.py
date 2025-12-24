# backend/app/main.py
from fastapi import FastAPI, responses
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth import router as auth_router
from app.db.session import engine
from app.db.base import Base
from app.rag.ingest import ingest_docs
from app.api.rag import router as rag_router

app = FastAPI(title="Socrates RAG Backend")

# Include routers
app.include_router(rag_router)
app.include_router(auth_router)

# Auto-ingest on startup
@app.on_event("startup")
def startup_ingest():
    ingest_docs()

# CORS - allow any origin (safe for API-only backend with separate frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables if they don't exist
Base.metadata.create_all(bind=engine)

# Simple root endpoint - this is the key fix for HF Spaces "Starting" issue
@app.get("/", response_class=responses.HTMLResponse)
def root():
    return """
    <html>
        <head>
            <title>Socrates RAG Backend</title>
            <style>
                body { font-family: system-ui, sans-serif; margin: 40px; background: #f9f9f9; line-height: 1.6; }
                a { color: #0066cc; }
                pre { background: #eee; padding: 10px; border-radius: 6px; }
            </style>
        </head>
        <body>
            <h1>Socrates Chatbot API is Running</h1>
            <p>Backend is healthy and ready.</p>
            <ul>
                <li>Interactive API documentation: <a href="/docs" target="_blank">Swagger UI (/docs)</a></li>
                <li>Alternative docs: <a href="/redoc" target="_blank">ReDoc (/redoc)</a></li>
                <li>Health check: <a href="/health">/health</a></li>
            </ul>
            <p><strong>Frontend</strong> is hosted separately on Vercel and connects to this API.</p>
            <hr>
            <small>Deployed on Hugging Face Spaces</small>
        </body>
    </html>
    """

# Health endpoint (already present, kept for clarity)
@app.get("/health")
def health():
    return {"status": "ok"}

# Detailed startup logging - helps confirm everything loaded correctly
@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("SOCRATES RAG BACKEND STARTED SUCCESSFULLY!")
    print("="*60)
    print("• Database tables ensured")
    print("• PDF ingestion completed (or skipped if no new docs)")
    print("• API endpoints mounted: /rag/* and /auth/*")
    print("• Swagger docs available at /docs")
    print("• Root page active at /")
    print("="*60 + "\n")
