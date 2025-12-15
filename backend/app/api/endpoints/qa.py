from fastapi import APIRouter, Form
from typing import Optional
from app.models.schemas import QuizRequest
from app.core.services import embedder, collection, rag

router = APIRouter()

@router.post(
    "/ask",
    summary="Ask a question using RAG",
    response_description="AI-generated answer with context preview"
)
async def ask(question: str = Form(...), filename: Optional[str] = Form(None)): 
    """Answer a question using Retrieval-Augmented Generation (RAG).
    
    Retrieves relevant context from the vector database and generates
    an AI-powered answer using the Groq LLM.
    
    Args:
        question: The question to answer
        filename: Optional filename to filter context by specific document
        
    Returns:
        dict: Question, AI-generated answer, and context preview
    """
    q_embed = embedder.encode([question]).tolist()
    
    query_params = {
        "query_embeddings": q_embed,
        "n_results": 5
    }
    
    if filename:
        query_params["where"] = {"source": filename}
        print(f"Filtering RAG context for file: {filename}")

    results = collection.query(**query_params)

    if not results or not results["documents"] or not results["documents"][0]:
        context = "No specific documents found. Answering based on general knowledge."
        source_preview = "General Knowledge"
    else:
        context = " ".join(results["documents"][0])
        source_preview = context[:200] + "..."

    answer = rag.generate_answer(question, context)

    return {
        "question": question,
        "answer": answer,
        "context_used_preview": source_preview
    }


@router.post(
    "/generate_quiz",
    summary="Generate a quiz from documents",
    response_description="Generated quiz with questions and answers"
)
async def generate_quiz_endpoint(req: QuizRequest):
    """Generate a quiz based on uploaded documents and specified topic.
    
    Retrieves relevant context from the vector database and uses AI
    to generate quiz questions with multiple choice or true/false format.
    
    Args:
        req: Quiz request with topic, difficulty, and number of questions
        
    Returns:
        dict: Generated quiz in JSON format with questions, options, and answers
    """
    q_embed = embedder.encode([req.topic]).tolist()
    
    results = collection.query(query_embeddings=q_embed, n_results=15)
    
    if not results or not results["documents"] or not results["documents"][0]:
        context = f"Topic: {req.topic}. No specific uploaded documents found, please generate a quiz based on general academic knowledge of this topic."
    else:
        context = " ".join(results["documents"][0])

    quiz_json = rag.generate_quiz(
        topic=req.topic,
        context=context,
        difficulty=req.difficulty,
        num_questions=req.num_questions
    )

    return quiz_json
