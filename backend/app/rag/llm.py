#backend\app\rag\llm.py
from groq import Groq
from app.core.config import settings
from app.rag.prompt import build_prompt

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_answer(
    context_chunks: list[str],
    question: str,
    conversation: list[dict]
) -> str:
    messages = build_prompt(context_chunks, question, conversation)

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=messages,
        temperature=0.2,
        max_completion_tokens=512
    )

    return completion.choices[0].message.content.strip()
