# backend/app/rag/retrieve.py
import os
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
from app.core.config import VECTOR_DB_PATH, VECTOR_DB_META_PATH

# Initialize model once
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


def load_index():
    """Load FAISS index + metadata."""
    if not os.path.exists(VECTOR_DB_PATH) or not os.path.exists(VECTOR_DB_META_PATH):
        raise RuntimeError("Vector DB does not exist. Run /rag/ingest first.")
    index = faiss.read_index(VECTOR_DB_PATH)
    with open(VECTOR_DB_META_PATH, "rb") as f:
        metadata = pickle.load(f)
    return index, metadata


def build_bm25_index(metadata: list[dict]):
    """Build BM25 index from chunk text."""
    tokenized = [m["text"].split() for m in metadata]
    return BM25Okapi(tokenized)


def retrieve(query: str, top_k: int = 5):
    """
    Hybrid retrieval: FAISS embeddings + BM25 keyword search.
    Returns top_k results with normalized scores and chunk text.
    """
    index, metadata = load_index()

    # --- Embedding search ---
    vec = model.encode([query])
    D, I = index.search(np.array(vec), top_k)
    emb_results = []
    for j, i in enumerate(I[0]):
        emb_results.append({
            **metadata[i],
            "score": float(D[0][j])  # L2 distance (smaller = more similar)
        })

    # --- BM25 keyword search ---
    bm25 = build_bm25_index(metadata)
    tokenized_query = query.split()
    bm25_scores = bm25.get_scores(tokenized_query)
    bm25_results = []
    for i in np.argsort(bm25_scores)[::-1][:top_k]:
        bm25_results.append({
            **metadata[i],
            "score": float(bm25_scores[i])  # higher = more relevant
        })

    # --- Merge results (deduplicate by chunk_id) ---
    combined = {r["chunk_id"]: r for r in emb_results + bm25_results}

    # --- Normalize embedding scores to 0-1 similarity ---
    if emb_results:
        max_emb_score = max([r["score"] for r in emb_results])
        for r in combined.values():
            if r in emb_results:
                # invert L2 distance to similarity
                r["score"] = 1 / (1 + r["score"] / max_emb_score)

    # Sort by score descending
    sorted_results = sorted(combined.values(), key=lambda x: x["score"], reverse=True)

    # Limit to top_k results
    return sorted_results[:top_k]
