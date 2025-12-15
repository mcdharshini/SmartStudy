
import os
import tempfile
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import chromadb
import PyPDF2
from dotenv import load_dotenv
from pydantic import BaseModel
from app.rag_core import RagEngine
import requests
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
import wikipedia

load_dotenv()

app = FastAPI(
    title="Smart Study Hub API",
    description="AI-powered study companion with RAG capabilities",
    version="1.0.0"
)

# Create static dir if not exists
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

embedder = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path="vector_db")
collection = client.get_or_create_collection("docs")
rag = RagEngine()


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
    difficulty: str = "medium"
    num_questions: int = 5


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


def get_youtube_video_id(url: str) -> Optional[str]:
    """Extract video ID from various YouTube URL formats.
    
    Supports multiple URL patterns including youtu.be, youtube.com/watch,
    youtube.com/embed, and youtube.com/v/ formats.
    
    Args:
        url: YouTube URL in any supported format
        
    Returns:
        Video ID string if found, None otherwise
    """
    query = urlparse(url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    if query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            p = parse_qs(query.query)
            return p['v'][0]
        if query.path[:7] == '/embed/':
            return query.path.split('/')[2]
        if query.path[:3] == '/v/':
            return query.path.split('/')[2]
    return None


def extract_youtube_transcript(video_id: str) -> str:
    """Fetch and translate YouTube video transcript to English.
    
    Attempts to retrieve transcript with the following priority:
    1. Manual English transcript
    2. Auto-generated English transcript
    3. Any available language, translated to English
    
    Args:
        video_id: YouTube video identifier
        
    Returns:
        Formatted transcript text with language code, or error message
    """
    try:
        print(f"Fetching transcript list for YouTube Video: {video_id}")
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        transcript = None
        
        try:
           transcript = transcript_list.find_transcript(['en'])
        except:
            for t in transcript_list:
                transcript = t
                break
        
        if transcript:
            if not transcript.is_translatable and transcript.language_code != 'en':
                pass
            elif transcript.language_code != 'en':
                try:
                    transcript = transcript.translate('en')
                except Exception as e:
                    print(f"Translation failed: {e}")

            full_data = transcript.fetch()
            full_transcript = " ".join([t['text'] for t in full_data])
            return f"YouTube Video Transcript ({transcript.language_code}):\\n\\n{full_transcript}"
            
        return "Error: No transcript found for this video."

    except Exception as e:
        print(f"Error fetching YouTube transcript: {e}")
        return f"Error: Could not retrieve YouTube transcript. The video might not have captions enabled. ({str(e)})"


def crawl_website_content(url: str) -> str:
    """Scrape and extract clean text content from a website.
    
    Removes scripts, styles, navigation, headers, footers, and cleans
    whitespace to extract the main textual content.
    
    Args:
        url: Website URL to scrape
        
    Returns:
        Cleaned text content from the website, or empty string on error
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()
            
        text = soup.get_text()
        
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\\n'.join(chunk for chunk in chunks if chunk)
        
        return f"Website Content ({url}):\\n\\n{text}"
    except Exception as e:
        print(f"Error scraping URL: {e}")
        return ""


def fetch_wikipedia_content(query: str) -> str:
    """Retrieve content from a Wikipedia article.
    
    Handles disambiguation errors and page not found errors gracefully.
    
    Args:
        query: Wikipedia topic or article name (can include 'wikipedia:' prefix)
        
    Returns:
        Wikipedia article content with title, or error message
    """
    try:
        topic = query.replace("wikipedia:", "").strip()
        print(f"Searching Wikipedia for: {topic}")
        
        page = wikipedia.page(topic, auto_suggest=True)
        return f"Wikipedia Article ({page.title}):\\n\\n{page.content}"
    except wikipedia.exceptions.DisambiguationError as e:
        return f"Error: Wikipedia query is ambiguous. Possible options: {', '.join(e.options[:5])}"
    except wikipedia.exceptions.PageError:
        return f"Error: Wikipedia page '{topic}' not found."
    except Exception as e:
        return f"Error fetching Wikipedia: {e}"


def process_url_content(url_or_query: str) -> str:
    """Route URL or query to the appropriate content extraction function.
    
    Determines the type of content (Wikipedia, YouTube, or general website)
    and delegates to the appropriate handler.
    
    Args:
        url_or_query: URL or query string (supports 'wikipedia:' prefix)
        
    Returns:
        Extracted content from the appropriate source
    """
    if url_or_query.lower().startswith("wikipedia:"):
        return fetch_wikipedia_content(url_or_query)

    video_id = get_youtube_video_id(url_or_query)
    if video_id:
        return extract_youtube_transcript(video_id)
    
    return crawl_website_content(url_or_query)


def extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract text content from PDF file bytes.
    
    Creates a temporary file to process the PDF and extracts text from
    all pages. Cleans up the temporary file after processing.
    
    Args:
        pdf_bytes: PDF file content as bytes
        
    Returns:
        Extracted text from all PDF pages
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        try:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name
        finally:
            tmp.close()

    try:
        reader = PyPDF2.PdfReader(tmp_path)
        full_text = ""

        for page in reader.pages:
            txt = page.extract_text()
            if txt:
                full_text += txt + "\\n"
        return full_text
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.get(
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


@app.post(
    "/upload_pdf",
    summary="Upload and process PDF document",
    response_description="Processing results with chunk count and extracted text"
)
async def upload_pdf(pdf: UploadFile = File(...), notebook_id: str = Form(None)):
    """Upload a PDF file, extract text, and store in vector database.
    
    Processes the PDF by:
    1. Extracting text from all pages
    2. Chunking text into manageable pieces
    3. Generating embeddings
    4. Storing in ChromaDB for RAG queries
    
    Args:
        pdf: PDF file upload
        notebook_id: Optional notebook identifier for organization
        
    Returns:
        dict: Processing results including chunk count, filename, and extracted text
    """
    pdf_bytes = await pdf.read()

    # Save file locally for static serving
    upload_dir = "static/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, pdf.filename)
    
    with open(file_path, "wb") as f:
        f.write(pdf_bytes)

    text = extract_pdf_text(pdf_bytes)
    
    if not text.strip():
        return {
            "message": "PDF uploaded but no text extraction was possible (it might be an image-only PDF).",
            "chunks": 0,
            "filename": pdf.filename
        }

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_text(text)

    embeddings = embedder.encode(chunks).tolist()

    metadatas = [{"source": pdf.filename, "notebook_id": notebook_id or "general"} for _ in chunks]

    ids = [f"{pdf.filename}-{i}" for i in range(len(chunks))]
    
    if chunks:
        collection.add(documents=chunks, embeddings=embeddings, ids=ids, metadatas=metadatas)

    return {
        "message": "PDF extracted and stored.",
        "chunks": len(chunks),
        "filename": pdf.filename,
        "notebook_id": notebook_id,
        "text": text,
        "url": f"http://127.0.0.1:8000/static/uploads/{pdf.filename}"
    }


@app.post(
    "/upload_url",
    summary="Process URL content",
    response_description="Processing results with extracted content and AI summary"
)
async def upload_url(req: UrlRequest):
    """Process content from a URL (website, YouTube, or Wikipedia).
    
    Supports multiple content types:
    - Regular websites (scraped and cleaned)
    - YouTube videos (transcript extraction)
    - Wikipedia articles (via 'wikipedia:' prefix)
    
    Processes content by:
    1. Extracting text from the source
    2. Chunking and embedding
    3. Storing in vector database
    4. Generating AI summary
    
    Args:
        req: URL request containing url, optional notebook_id, and optional name
        
    Returns:
        dict: Processing results with chunks, text, and AI-generated summary
        
    Raises:
        HTTPException: If text extraction fails
    """
    print(f"Scraping URL: {req.url}")
    text = process_url_content(req.url)
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Failed to extract text from URL.")

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_text(text)
    
    embeddings = embedder.encode(chunks).tolist()
    
    filename = req.name or req.url
    ids = [f"{filename}-{i}" for i in range(len(chunks))]
    metadatas = [{"source": filename, "notebook_id": req.notebook_id or "general"} for _ in chunks]
    
    if chunks:
        collection.add(documents=chunks, embeddings=embeddings, ids=ids, metadatas=metadatas)
    
    is_youtube = "YouTube Video Transcript" in text[:50]
    
    if is_youtube:
        summary_prompt = "The following is a transcript of a YouTube video. Summarize the key concepts, main arguments, and any educational takeaways."
    else:
        summary_prompt = "Summarize the key points of the following web page content."

    summary = rag.generate_answer(summary_prompt, text[:4000])

    return {
        "message": "URL content processed.",
        "chunks": len(chunks),
        "filename": filename,
        "notebook_id": req.notebook_id,
        "text": text,
        "summary": summary
    }


@app.post(
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


@app.post(
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
