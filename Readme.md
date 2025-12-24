# Socrates – Document-Grounded Reasoning Philosopher (Assistant)

**Socrates** is a document-centric, reasoning-driven AI assistant built using a **Retrieval-Augmented Generation (RAG)** architecture.  
It is designed to think *with* your documents, not beyond them.

Rather than generating answers from unstated assumptions or general knowledge, Socrates reasons strictly from the evidence contained in your uploaded material. Every response is grounded, deliberate, and expressed in a calm, analytical, Socratic style.

At its core lies a simple principle:

**An answer is only as valid as the evidence that supports it.**

> *“Ask me anything from your documents.”*

---

## Live Deployments

| Component | URL |
|---------|-----|
| Frontend (Vercel) | https://socrates-nu.vercel.app/ |
| Backend (HuggingFace Spaces) | https://saadajee-socrates.hf.space |
| Local Frontend | http://localhost:3000/ |

---

## Key Features

- Document ingestion and semantic indexing  
- Context-aware question answering  
- Strict hallucination guardrails  
- Source-grounded responses  
- Multi-session chat system  
- Session-level chat deletion  
- Cross-session context summarization  
- React-based frontend  

---

## Architecture Overview

| Layer | Technology |
|-----|-----------|
| Frontend | React, Vite, React Router |
| Backend | FastAPI (Python) |
| LLM Provider | Groq |
| Embeddings | Sentence / Transformer Embeddings |
| Vector Store | In-memory or FAISS-like |
| Deployment | Vercel (Frontend), HuggingFace Spaces (Backend) |

---

## How Socrates Thinks

Socrates operates under both technical rigor and philosophical restraint.

- Answers are generated **only** from retrieved document context  
- If reliable evidence is unavailable, Socrates responds transparently  
- The system does not speculate beyond the provided material  

When no sufficient context exists, Socrates will state:

> *“I don’t have enough reliable context to answer this question.”*

The identity of Socrates is fixed:
- Name: **Socrates**
- Role: Reasoning guide
- Style: Calm, probing, and logical

---

## Technical Foundation

Socrates is implemented as a modern RAG pipeline:

- Documents are ingested and chunked into semantically meaningful units  
- Each chunk is embedded for efficient similarity search  
- Relevant context is retrieved at query time  
- A large language model reasons strictly over the retrieved evidence  

The model does not answer from prior assumptions or external knowledge that is not present in the documents.

---

## Purpose

Socrates is built for users who value precision over speculation and reasoning over verbosity.  
It is particularly suited for:

- Technical and engineering documentation  
- Research and academic exploration  
- Knowledge-grounded AI systems  
- Transparent, auditable reasoning workflows  

Socrates does not aim to sound intelligent.  
It aims to be **accountable**.

---

> **Knowledge begins with inquiry.  
> Wisdom begins with knowing the limits of one’s knowledge.**


---

## Chat Sessions Explained

Socrates supports **multiple independent chat sessions**:

- Each chat is a **separate context group**
- Deleting one chat **does not affect others**
- Context logic:
  - Same session → full history sent
  - Other sessions → summarized context sent

This ensures:
- Scalability
- Context safety
- Clean user experience

---

## Getting Started (Local Setup)

### Clone the Repository

```
git clone https://github.com/Saadajee/socrates.git
cd socrates
```
## Frontend Setup (React)
Install Dependencies
```
cd frontend
npm install
```
Run Frontend Locally
```
npm run dev
```
Frontend will be available at:
```
http://localhost:3000/
```

## Backend Setup (FastAPI)
Create Virtual Environment
```
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows
```
Install Dependencies
```
pip install -r requirements.txt
```
### Environment Variables
Create a .env file inside the backend directory:
```
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET="supersecretkey-change-this-in-production!!"
JWT_EXPIRES_MIN=60
```
- Never commit .env files to GitHub

Run Backend Locally 
```
uvicorn main:app --reload
```
Backend will run at:

```
http://localhost:3000
```
### Connecting Frontend & Backend
Ensure the frontend API base URL points to:

- Local Backend
```
http://localhost:8000
```
- Production Backend
```
https://saadajee-socrates.hf.space
```
🧪 Typical User Flow
- Login / Open app
- Create a new chat
- Ask questions
- Receive:
- Reasoned answers
- Grounded responses
- Source-aware outputs
- Manage chat sessions independently

### Common Issues & Fixes

❌ 404 on Refresh (Vercel)

Fix by adding vercel.json:
```
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```
 Future Improvements
- Streaming responses
- Citation panel UI
- Persistent vector database
- User authentication
- Document versioning
- Export chat sessions
- Multi-modal ingestion (PDF, images, tables)

## Support & Contact

For bugs, feature requests, or integration help:

📧 [saadimran7667@gmail.com](saadimran7667@gmail.com)
Happy to collaborate, debug, or help you extend the project further.
