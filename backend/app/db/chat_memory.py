# backend/app/db/chat_memory.py
from app.db.models import ChatSession, ChatMessage
from sqlalchemy.orm import Session
from datetime import datetime

MAX_MESSAGES = 100

def create_session(db: Session, user_id: int, title: str = "New Chat") -> dict:
    session = ChatSession(
        user_id=user_id,
        title=title,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {
        "id": session.id,
        "title": session.title,
        "created_at": session.created_at,
        "updated_at": session.updated_at
    }

def get_session(db: Session, session_id: int) -> ChatSession | None:
    """
    Retrieve a chat session by ID.
    """
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()

def save_message(db: Session, session_id: int, role: str, content: str):
    """
    Save a message to a session, pruning old messages beyond MAX_MESSAGES.
    """
    # Optional safety: create session if it doesn't exist
    if not get_session(db, session_id):
        raise ValueError(f"Session {session_id} does not exist.")

    msg = ChatMessage(session_id=session_id, role=role, content=content)
    db.add(msg)
    db.commit()

    # prune old messages
    msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.desc())
        .offset(MAX_MESSAGES)
        .all()
    )
    for m in msgs:
        db.delete(m)
    db.commit()

def load_conversation(db: Session, session_id: int) -> list[dict]:
    """
    Load messages for a given session, in chronological order.
    """
    # Optional safety: return empty if session does not exist
    if not get_session(db, session_id):
        return []

    msgs = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [{"role": m.role, "content": m.content} for m in msgs]
