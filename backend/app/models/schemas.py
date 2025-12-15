from typing import Optional
from pydantic import BaseModel

class QuizRequest(BaseModel):
    """Request model for quiz generation.
    
    Attributes:
        topic: The topic or subject for the quiz
        context_filter: Optional filter for specific context
        difficulty: Quiz difficulty level (easy, medium, hard)
        num_questions: Number of questions to generate
    """
    topic: str
    context_filter: Optional[str] = None 
    notebook_id: Optional[str] = None
    difficulty: str = "medium"
    num_questions: int = 5

    class Config:
        extra = "allow"


class AskRequest(BaseModel):
    """Request model for RAG-based question answering.
    
    Attributes:
        question: The question to answer
    """
    question: str


class UrlRequest(BaseModel):
    """Request model for URL content processing.
    
    Attributes:
        url: The URL or query string to process
        notebook_id: Optional notebook identifier for organization
        name: Optional custom name for the document
    """
    url: str
    notebook_id: Optional[str] = None
    name: Optional[str] = None
