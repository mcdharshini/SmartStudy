from sentence_transformers import SentenceTransformer
import chromadb
from app.rag_core import RagEngine
import os
from dotenv import load_dotenv

load_dotenv()

# Create static dir if not exists
os.makedirs("static/uploads", exist_ok=True)

# Initialize singletons
embedder = SentenceTransformer("all-MiniLM-L6-v2")
client = chromadb.PersistentClient(path="vector_db")
collection = client.get_or_create_collection("docs")
rag = RagEngine()

def get_embedder():
    return embedder

def get_chroma_client():
    return client

def get_collection():
    return collection

def get_rag_engine():
    return rag
