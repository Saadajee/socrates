from rank_bm25 import BM25Okapi
from app.rag.retrieve import load_index
import numpy as np

def hybrid_retrieve(query: str, top_k: int = 5):
    index, metadata = load_index()

    # ---------- BM25 ----------
    corpus = [m["text"].split() for m in metadata]
    bm25 = BM25Okapi(corpus)
    bm25_scores = bm25.get_scores(query.split())

    bm25_top = np.argsort(bm25_scores)[-top_k:]

    # ---------- Embeddings ----------
    from app.rag.retrieve import model
    vec = model.encode([query])
    D, I = index.search(np.array(vec), top_k)

    # Convert L2 distance → similarity
    emb_results = []
    for idx, dist in zip(I[0], D[0]):
        similarity = 1 / (1 + dist)
        emb_results.append((idx, similarity))

    # ---------- Merge ----------
    combined = {}

    for idx, sim in emb_results:
        combined[idx] = max(sim, combined.get(idx, 0))

    for idx in bm25_top:
        combined[idx] = max(0.5, combined.get(idx, 0))  # keyword boost

    # ---------- Sort ----------
    ranked = sorted(combined.items(), key=lambda x: x[1], reverse=True)

    results = []
    for idx, score in ranked[:top_k]:
        item = metadata[idx]
        item["score"] = round(score, 3)
        results.append(item)

    return results
