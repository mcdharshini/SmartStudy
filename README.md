# Smart Study Hub

**Smart Study Hub** is an AI-powered study companion that helps students organize their learning materials, generate quizzes, and get instant answers from their documents using advanced RAG (Retrieval-Augmented Generation) technology.

---

## Features

### Document Management
- **Multi-format Support**: Upload PDFs, PowerPoint presentations, Word documents, and text files
- **Web Content Integration**: Add websites, YouTube videos, and Wikipedia articles
- **Smart Organization**: Create notebooks by subject with automatic progress tracking
- **Real-time Processing**: Documents are indexed instantly for AI-powered search

### AI-Powered Learning
- **Intelligent Chat**: Ask questions and get answers sourced directly from your documents
- **Context-Aware Responses**: AI cites specific pages and snippets from your materials
- **Follow-up Suggestions**: Get smart follow-up questions to deepen understanding
- **Multi-document Search**: Query across all your study materials simultaneously

### Quiz Generation
- **Auto-Generated Quizzes**: Create quizzes from any topic or document
- **Difficulty Levels**: Choose from Easy, Medium, or Hard difficulty
- **Multiple Question Types**: MCQ and True/False questions
- **Instant Feedback**: Get explanations for correct answers
- **Focused Review**: Generate targeted quizzes for topics you struggled with

### Progress Tracking
- **Study Streaks**: Track daily study consistency
- **Performance Analytics**: Monitor quiz scores and accuracy over time
- **Skill Levels**: Track proficiency in different subjects
- **Weekly Activity**: Visualize study time across the week
- **Achievement System**: Unlock badges as you progress

### Modern UI/UX
- **Dark/Light Themes**: Beautiful color schemes optimized for studying
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Intuitive Navigation**: Easy-to-use interface with keyboard shortcuts
- **Real-time Updates**: Instant feedback and live progress indicators

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **Git** - [Download](https://git-scm.com/)

### Required API Keys

You'll need a **Groq API Key** for AI functionality:

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **"Create API Key"**
5. Copy your key (it starts with `gsk_...`)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Velan005/Smart_Hub.git
cd Smart_Hub
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy the example below and add your Groq API key
```

**Create `backend/.env` file:**
```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## Running the Application

### Start Backend Server

```bash
# In the backend directory (with virtual environment activated)
cd backend
python -m uvicorn app.main:app --reload
```

The backend will run on **http://127.0.0.1:8000**

### Start Frontend Development Server

```bash
# In a new terminal, navigate to frontend directory
cd frontend
npm run dev
```

The frontend will run on **http://localhost:3000**

### Access the Application

1. Open your browser and go to **http://localhost:3000**
2. Sign in with any email and password (demo mode)
3. Start creating notebooks and uploading documents!

---

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Zustand** - State management
- **Lucide Icons** - Modern icon set

### Backend
- **FastAPI** - High-performance Python web framework
- **LangChain** - LLM orchestration framework
- **ChromaDB** - Vector database for embeddings
- **Groq API** - Ultra-fast LLM inference (Llama 3.3 70B)
- **Sentence Transformers** - Document embeddings
- **BeautifulSoup4** - Web scraping
- **PyPDF2** - PDF text extraction
- **youtube-transcript-api** - YouTube caption extraction
- **Wikipedia API** - Wikipedia content fetching

---

## Project Structure

Smart_Hub/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/       # API route handlers
│   │   │       ├── health.py    # Health check endpoints
│   │   │       ├── qa.py        # Question answering endpoints
│   │   │       └── upload.py    # File upload handling
│   │   ├── core/
│   │   │   └── services.py      # Core business logic services
│   │   ├── models/              # Pydantic models & schemas
│   │   ├── services/
│   │   │   ├── content_scraper.py # Web & media scraping
│   │   │   └── pdf_processor.py   # PDF processing logic
│   │   ├── main.py              # FastAPI app entry point
│   │   └── rag_core.py          # RAG engine implementation
│   ├── static/                  # Static assets (uploaded files)
│   ├── vector_db/               # ChromaDB storage
│   ├── .env                     # Environment variables
│   ├── main.py                  # Server startup script
│   ├── requirements.txt         # Python dependencies
│   ├── test_upload_verify.py    # Upload verification test
│   └── test_youtube.py          # YouTube scraping test
│
├── frontend/
│   ├── app/
│   │   ├── dashboard/           # Dashboard page
│   │   ├── infographics/        # Analytics & stats page
│   │   ├── login/               # Authentication pages
│   │   ├── notebook/            # Notebook view
│   │   ├── quiz/                # Quiz interface
│   │   ├── settings/            # User settings
│   │   ├── signup/              # User registration
│   │   ├── status/              # System status page
│   │   └── study-plan/          # Study planning interface
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   ├── app-header.tsx       # Application header
│   │   ├── auth-guard.tsx       # Authentication wrapper
│   │   ├── chat-panel.tsx       # AI chat interface
│   │   ├── create-notebook-dialog.tsx # Notebook creation
│   │   ├── create-plan-dialog.tsx     # Study plan creation
│   │   ├── document-viewer.tsx  # Document renderer
│   │   ├── documents-panel.tsx  # Document management
│   │   ├── infographic-view.tsx # Visual analytics
│   │   ├── notebook-card.tsx    # Notebook display card
│   │   ├── quick-actions-sidebar.tsx # Sidebar actions
│   │   └── quiz-builder-dialog.tsx   # Quiz creation
│   ├── lib/
│   │   ├── api.ts               # API integration
│   │   ├── mock-data.ts         # Development data
│   │   ├── store.ts             # Global state management
│   │   ├── types.ts             # TypeScript definitions
│   │   └── utils.ts             # Helper functions
│   ├── public/                  # Public static assets
│   ├── hooks/                   # Custom React hooks
│   ├── styles/                  # Global styles (globals.css)
│   ├── next.config.mjs          # Next.js configuration
│   ├── package.json             # NPM dependencies
│   └── tsconfig.json            # TypeScript configuration
│
└── README.md                    # This file

---

## Environment Variables

### Backend (.env)

```env
# Required: Groq API Key for AI functionality
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### Frontend (Optional)

Create `frontend/.env.local` if you need to customize the API URL:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## Usage Guide

### Creating a Notebook
1. Click **"+ New Notebook"** on the dashboard
2. Enter a title and subject
3. Optionally set an exam date
4. Click **"Create"**

### Adding Documents
1. Open a notebook
2. Use the **Documents Panel** on the left
3. Choose from:
   - **Upload Files**: PDF, PPT, DOCX, TXT
   - **Website**: Paste any URL
   - **YouTube**: Paste video URL (auto-extracts transcript)
   - **Wikipedia**: Enter a topic or keyword

### Chatting with AI
1. Select a document from the panel
2. Type your question in the chat
3. AI will answer using content from your documents
4. Click on sources to see exact references

### Generating Quizzes
1. Click **"Generate Quiz"** in a notebook
2. Choose difficulty and number of questions
3. Optionally specify a topic (or leave blank for full notebook)
4. Take the quiz and get instant feedback
5. Review wrong answers and generate focused review quizzes

### Tracking Progress
- View your study streak on the dashboard
- Check the **Infographics** page for detailed analytics
- Monitor skill levels by subject
- Track monthly goals

---

## API Endpoints

### Health Check
```
GET /health_check
```
Returns status of all services (Groq API, ChromaDB, Web Scraper, etc.)

### Document Processing
```
POST /upload_pdf
POST /process_url
```

### AI Chat
```
POST /rag_query
```

### Quiz Generation
```
POST /generate_quiz
```
