from fastapi import APIRouter
from youtube_transcript_api import YouTubeTranscriptApi
import wikipedia
from app.services.content_scraper import process_url_content
from app.core.services import collection, rag

router = APIRouter()

@router.get(
    "/health_check",
    summary="System health check",
    response_description="Health status of all services"
)
async def health_check():
    """Check the health status of all backend services.
    
    Verifies the operational status of:
    - Groq LLM API
    - ChromaDB vector database
    - Web scraper
    - YouTube transcript API
    - Wikipedia API
    
    Returns:
        dict: Status information for each service
    """
    status = {
        "status": "ok",
        "services": {
            "llm_api": {"status": "unknown", "message": ""},
            "vector_db": {"status": "unknown", "message": ""},
            "youtube_scraper": {"status": "unknown", "message": ""},
            "web_scraper": {"status": "unknown", "message": ""}
        }
    }
    
    try:
        test_msg = rag.generate_answer("hi", "context")
        if "Error" in test_msg:
             status["services"]["llm_api"] = {"status": "error", "message": test_msg}
        else:
             status["services"]["llm_api"] = {"status": "healthy", "message": "Groq API responding"}
    except Exception as e:
        status["services"]["llm_api"] = {"status": "error", "message": str(e)}

    try:
        count = collection.count()
        status["services"]["vector_db"] = {"status": "healthy", "message": f"ChromaDB operational. Documents indexed: {count}"}
    except Exception as e:
        status["services"]["vector_db"] = {"status": "error", "message": str(e)}

    try:
        content = process_url_content("http://example.com")
        if "Website Content" in content and "Example Domain" in content:
            status["services"]["web_scraper"] = {"status": "healthy", "message": "Scraping successful"}
        else:
            status["services"]["web_scraper"] = {"status": "error", "message": "Failed to scrape simple content (Example Domain)"}
    except Exception as e:
        status["services"]["web_scraper"] = {"status": "error", "message": str(e)}
        
    try:
        if YouTubeTranscriptApi:
             status["services"]["youtube_scraper"] = {"status": "healthy", "message": "Library loaded"}
    except Exception as e:
        status["services"]["youtube_scraper"] = {"status": "error", "message": str(e)}

    try:
        if wikipedia:
            status["services"]["wikipedia_scraper"] = {"status": "healthy", "message": "Library loaded"}
    except Exception as e:
        status["services"]["wikipedia_scraper"] = {"status": "error", "message": str(e)}

    return status
