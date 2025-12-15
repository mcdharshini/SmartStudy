from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.api.endpoints import upload, qa, health

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

# Include routers
app.include_router(upload.router, tags=["Upload"])
app.include_router(qa.router, tags=["Q&A"])
app.include_router(health.router, tags=["Health"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
