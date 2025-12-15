from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.models.schemas import UrlRequest
from app.services.pdf_processor import extract_pdf_text
from app.services.content_scraper import process_url_content
from app.core.services import embedder, collection, rag

router = APIRouter()

@router.post(
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


@router.post(
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
