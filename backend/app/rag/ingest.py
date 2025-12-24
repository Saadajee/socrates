import os
import json
import pickle
import faiss
import numpy as np
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from app.core.config import (
    DOCS_PATH,
    VECTOR_DB_PATH,
    VECTOR_DB_META_PATH,
)
from pathlib import Path


APP_DIR = Path(__file__).resolve().parent.parent
BOOKS_PATH = APP_DIR / "data" / "books"
# Initialize model once
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def chunk_text(text, chunk_size=200, overlap=50):
    """
    Split text into overlapping chunks.
    Word-based for now. Good enough. Stable.
    """
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
        if i + chunk_size >= len(words):
            break
    return chunks


def ingest_json_docs(all_chunks, metadata):
    """Ingest existing JSON docs (unchanged behavior)."""
    for fname in os.listdir(DOCS_PATH):
        if not fname.endswith(".json"):
            continue

        path = os.path.join(DOCS_PATH, fname)
        with open(path, "r", encoding="utf-8") as f:
            docs = json.load(f)

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


def ingest_pdf_books(all_chunks, metadata):
    if not os.path.exists(BOOKS_PATH):
        print("No books directory found. Skipping PDF ingestion.")
        return

    for fname in os.listdir(BOOKS_PATH):
        if not fname.lower().endswith(".pdf"):
            continue

        path = os.path.join(BOOKS_PATH, fname)
        print(f"Ingesting PDF: {fname}")

        try:
            reader = PdfReader(path)
        except Exception as e:
            print(f"❌ Failed to open PDF {fname}: {e}")
            continue

        full_text = ""

        for page_num, page in enumerate(reader.pages):
            try:
                text = page.extract_text()
            except Exception as e:
                print(f"⚠️ Skipping page {page_num} in {fname}: {e}")
                continue

            if text:
                full_text += text + "\n"

        if not full_text.strip():
            print(f"⚠️ No extractable text in {fname}")
            continue

        chunks = chunk_text(full_text)
        book_id = os.path.splitext(fname)[0]

        for i, chunk in enumerate(chunks):
            all_chunks.append(chunk)
            metadata.append({
                "doc_id": book_id,
                "title": book_id.replace("_", " ").title(),
                "chunk_id": f"{book_id}_chunk{i}",
                "text": chunk,
                "source": "pdf"
            })


def ingest_docs():
    """
    Ingest JSON docs + PDF books into a single FAISS index.
    """
    all_chunks = []
    metadata = []

    ingest_json_docs(all_chunks, metadata)
    ingest_pdf_books(all_chunks, metadata)

    if not all_chunks:
        raise RuntimeError("No documents found to ingest.")

    # Generate embeddings
    embeddings = model.encode(
        all_chunks,
        show_progress_bar=True
    )

    embedding_dim = embeddings.shape[1]

    # Create FAISS index
    index = faiss.IndexFlatL2(embedding_dim)
    index.add(np.array(embeddings, dtype=np.float32))

    # Save index + metadata
    faiss.write_index(index, VECTOR_DB_PATH)
    with open(VECTOR_DB_META_PATH, "wb") as f:
        pickle.dump(metadata, f)

    print(f"Ingested {len(all_chunks)} chunks total.")
    print(f"- JSON + PDF sources combined")
