# backend/app/api/rag.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
import uuid
import time
from app.core.metrics import metrics
from app.core.config import settings
from app.rag.retrieve import retrieve
from app.rag.llm import generate_answer
from app.core.deps import get_db, get_current_user
from app.db.models import User, ChatSession
from app.db.chat_memory import save_message, load_conversation, create_session
from sqlalchemy.orm import Session
from app.db.models import ChatMessage  # Add this line
from sqlalchemy import asc
from pydantic import BaseModel
from datetime import datetime


router = APIRouter(prefix="/rag", tags=["rag"])

class CreateSessionRequest(BaseModel):
    title: str = Field("New Chat", min_length=1, max_length=255)


class AskRequest(BaseModel):
    query: str = Field(..., min_length=3, max_length=500)
    session_id: int
    top_k: int = 5

class MessageItem(BaseModel):
    role: str
    content: str
    created_at: datetime | None = None

@router.get("/metrics")
def rag_metrics():
    return metrics


@router.post("/create_session")
def create_new_session(
    request: CreateSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = create_session(db, current_user.id, request.title)
    return session

@router.put("/session/{session_id}")
def rename_session(
    session_id: int,
    request: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    title = request.get("title")
    if not title or not title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found or access denied")

    session.title = title.strip()
    db.commit()
    db.refresh(session)

    return {"id": session.id, "title": session.title}

@router.get("/sessions")
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id, ChatSession.is_archived == False)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "title": s.title,
            "created_at": s.created_at,
            "updated_at": s.updated_at
        }
        for s in sessions
    ]

@router.post("/ask")
def rag_ask(
    request: AskRequest,
    current_user: User = Depends(get_current_user),  # ← Added dependency
    db: Session = Depends(get_db)
):
    trace_id = str(uuid.uuid4())
    start_time = time.time()
    metrics["total"] += 1

    # --- Load conversation if session_id provided ---
    conversation = []
    if request.session_id is not None:
        # Verify session ownership
        session = db.query(ChatSession).filter(
            ChatSession.id == request.session_id,
            ChatSession.user_id == current_user.id
        ).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or access denied")
        
        conversation = load_conversation(db, request.session_id)
        conversation = conversation[-20:]  # Keep only last 10 full exchanges (user + assistant)

    # 1. Retrieve
    results = retrieve(request.query, request.top_k)
    if not results:
        metrics["low_context"] += 1
        return {
            "answer": "I don’t have enough reliable context to answer this question.",
            "sources": [],
            "status": "low_context",
            "trace_id": trace_id,
            "session_id": request.session_id
        }

    # 2. Guardrails
    good_chunks = [r for r in results if r.get("score", 0) >= settings.SIMILARITY_THRESHOLD]
    if len(good_chunks) < settings.MIN_CONTEXT_CHUNKS:
        metrics["low_context"] += 1
        return {
            "answer": "I don’t have enough reliable context to answer this question.",
            "sources": [],
            "status": "low_context",
            "trace_id": trace_id,
            "session_id": request.session_id
        }

    # 3. Build context for LLM
    context_chunks = [r["text"] for r in good_chunks]

    # 4. Generate answer
    answer = generate_answer(context_chunks, request.query, conversation)

    metrics["ok"] += 1
    latency = round(time.time() - start_time, 3)

    # --- Save messages to session if provided ---
    if request.session_id is not None:
        save_message(db, request.session_id, "user", request.query)
        save_message(db, request.session_id, "assistant", answer)

    # Observability logging
    print({
        "trace_id": trace_id,
        "query": request.query,
        "top_scores": [r["score"] for r in good_chunks[:3]],
        "latency": latency,
        "status": "ok",
        "session_id": request.session_id
    })

    return {
        "answer": answer,
        "sources": [
            {
                "doc_id": r["doc_id"],
                "title": r["title"],
                "chunk_id": r["chunk_id"],
                "score": r["score"],
            }
            for r in good_chunks
        ],
        "status": "ok",
        "trace_id": trace_id,
        "session_id": request.session_id
    }
    
@router.delete("/session/{session_id}")
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found or access denied"
        )

    db.delete(session)
    db.commit()

    return {"status": "deleted", "session_id": session_id}

@router.get("/session/{session_id}/messages")
def get_session_messages(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve all messages for a specific session, in chronological order.
    Used by frontend to load persistent conversation history.
    """
    # Verify session exists and belongs to current user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found or access denied")

    # Load messages ordered by creation time
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(asc(ChatMessage.created_at))
        .all()
    )

    return [
        MessageItem(
            role=msg.role,
            content=msg.content,
            created_at=msg.created_at
        )
        for msg in messages
    ]