# backend/app/rag/ingest.py
import os
import json
import pickle
import faiss
import numpy as np
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from app.core.config import (
    DOCS_PATH as DOCS_PATH_STR,      # Likely a string in your config
    VECTOR_DB_PATH as VECTOR_DB_PATH_STR,
    VECTOR_DB_META_PATH as VECTOR_DB_META_PATH_STR,
)
from pathlib import Path

# Convert config paths to Path objects for consistent, safe handling
DOCS_PATH = Path(DOCS_PATH_STR)
VECTOR_DB_PATH = Path(VECTOR_DB_PATH_STR)
VECTOR_DB_META_PATH = Path(VECTOR_DB_META_PATH_STR)

# Correct path for books: goes up two levels from this file
# File location: backend/app/rag/ingest.py
# → parent.parent = backend/app → data folder is here
APP_DIR = Path(__file__).resolve().parent.parent
BOOKS_PATH = APP_DIR / "data" / "books"

# Load model once
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def chunk_text(text: str, chunk_size: int = 200, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
        if i + chunk_size >= len(words):
            break
    return chunks


def ingest_json_docs(all_chunks: list, metadata: list):
    """Ingest JSON documents from DOCS_PATH."""
    if not DOCS_PATH.exists():
        print(f"Warning: DOCS_PATH not found at {DOCS_PATH}")
        return

    print(f"Found docs directory: {DOCS_PATH}")
    for file_path in DOCS_PATH.iterdir():
        if not file_path.name.endswith(".json"):
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                docs = json.load(f)
        except Exception as e:
            print(f"Error reading {file_path.name}: {e}")
            continue

        for doc in docs:
            chunks = chunk_text(doc["body"])
            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                metadata.append({
                    "doc_id": doc["id"],
                    "title": doc["title"],
                    "chunk_id": f"{doc['id']}_chunk{i}",
                    "text": chunk,
                    "source": "json"
                })


def ingest_pdf_books(all_chunks: list, metadata: list):
    """Ingest PDF books from BOOKS_PATH."""
    if not BOOKS_PATH.exists():
        print(f"No books directory found at {BOOKS_PATH}. Skipping PDF ingestion.")
        return

    print(f"Found books directory: {BOOKS_PATH}")
    pdf_files = [f for f in BOOKS_PATH.iterdir() if f.name.lower().endswith(".pdf")]

    if not pdf_files:
        print("No PDF files found in books directory.")
        return

    for pdf_path in pdf_files:
        print(f"Ingesting PDF: {pdf_path.name}")
        try:
            reader = PdfReader(str(pdf_path))
            full_text = ""
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"

            if not full_text.strip():
                print(f"⚠️ No extractable text in {pdf_path.name}")
                continue

            chunks = chunk_text(full_text)
            book_id = pdf_path.stem

            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                metadata.append({
                    "doc_id": book_id,
                    "title": book_id.replace("_", " ").title(),
                    "chunk_id": f"{book_id}_chunk{i}",
                    "text": chunk,
                    "source": "pdf"
                })
        except Exception as e:
            print(f"Error processing {pdf_path.name}: {e}")


def ingest_docs():
    """
    Ingest both JSON docs and PDF books → build FAISS index.
    Called on startup.
    """
    all_chunks = []
    metadata = []

    ingest_json_docs(all_chunks, metadata)
    ingest_pdf_books(all_chunks, metadata)

    if not all_chunks:
        raise RuntimeError("No documents found to ingest (neither JSON nor PDF).")

    print("Generating embeddings for all chunks...")
    embeddings = model.encode(
        all_chunks,
        show_progress_bar=True
    )

    embedding_dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(embedding_dim)
    index.add(np.array(embeddings, dtype=np.float32))

    # Ensure parent directories exist
    VECTOR_DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Save
    faiss.write_index(index, VECTOR_DB_PATH)
    with open(VECTOR_DB_META_PATH, "wb") as f:
        pickle.dump(metadata, f)

    print(f"Ingested {len(all_chunks)} chunks total.")
    print("- JSON + PDF sources combined")
