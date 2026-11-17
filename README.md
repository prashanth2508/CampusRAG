# CampusRAG – AI-Powered Academic Knowledge Assistant 🎓

CampusRAG is a centralized, Retrieval-Augmented Generation (RAG) academic assistant tailored for colleges and universities.

The college admin uploads academic PDFs once (containing notes, syllabus, question papers, module material across departments and semesters). Students can then ask academic questions and receive accurate, grounded AI answers powered by Gemini LLM with exact source document titles and page citations.

---

## 🌟 Key Features

### For Students
- **Context Filtering**: Select Department, Semester, Subject, and Module to restrict search scope.
- **ChatGPT-Style Chat UI**: Sidebar with conversation history, + New Chat, clear chat, copy answer, regenerate answer.
- **5 Special Answer Modes**:
  - 🌟 **Simple**: Beginner-friendly explanation in plain language.
  - 📝 **Exam Answer**: Structured university exam layout (*Definition, Explanation, Key Points, Example, Advantages/Disadvantages, Conclusion*).
  - ⚡ **Short Answer**: Concise 2-3 sentence summary.
  - 📚 **Detailed Answer**: Comprehensive in-depth breakdown.
  - ❓ **Viva Mode**: Viva voce preparation with key definitions & top Q&As.
- **Source Citations & PDF Preview**: Shows exact document name, page number, module tag, match percentage, and a **"View PDF"** button for inline PDF preview.

### For Admins
- **Admin Analytics Dashboard**: Metrics cards (*Total Documents, Departments, Subjects, Students, Processed, Errors*) and visual charts powered by Recharts (*Docs by Department, Docs by Semester*).
- **PDF Upload System**: Upload PDFs with metadata tags (*Department, Semester, Subject, Module, Document Type, Academic Year, Description*). Includes SHA-256 duplicate detection.
- **Document Repository Table**: Track status (*Uploaded, Processing, Processed, Failed*), view PDF, trigger re-processing of vector chunks, replace, or delete with confirmation modal.
- **Dynamic Academic Structure**: Manage Departments and Subjects stored dynamically in database without hardcoding.
- **Academic Search Engine**: Semantic & metadata search over the entire college PDF repository.

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React.js 18 + Vite
- **Styling**: Tailwind CSS v4 + Dark/Light Theme mode
- **Routing**: React Router v6
- **HTTP Client**: Axios with JWT Interceptors
- **Icons**: Lucide React
- **Charts**: Recharts
- **Markdown**: `react-markdown` + `remark-gfm`

### Backend
- **Framework**: Python 3.13 + FastAPI + Pydantic v2
- **Server**: Uvicorn
- **Auth**: JWT Tokens + bcrypt password hashing
- **Database**: MongoDB (with automatic local JSON persistence fallback if offline)
- **Vector DB**: ChromaDB (`chromadb.PersistentClient`)
- **PDF Processor**: PyMuPDF (`fitz`) page-by-page text extraction
- **Embeddings**: HuggingFace `sentence-transformers/all-MiniLM-L6-v2` / Gemini Embeddings
- **LLM**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash` / `gemini-pro`) with modular provider architecture for OpenAI swap.

---

## 📁 Project Structure

```text
rag project/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (auth, departments, subjects, documents, chat, rag, stats, users)
│   │   ├── auth/         # JWT dependencies & admin protection
│   │   ├── core/         # Config & security utilities (bcrypt, JWT)
│   │   ├── database/     # Dual MongoDB & local JSON storage manager
│   │   ├── schemas/      # Pydantic data schemas
│   │   ├── services/     # RAG pipeline services (pdf, embedding, vector_store, retrieval, llm, rag_service)
│   │   ├── seed.py       # Seed script (populates demo admin, student, depts, subjects & sample PDF in ChromaDB)
│   │   └── main.py       # FastAPI application entry point
│   ├── uploads/          # Stored PDF files
│   ├── chroma_db/        # ChromaDB persistent vector database
│   ├── data/             # Local JSON persistent database fallback
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Sidebar, AcademicSelector, AnswerModeSelector, SourceCard, PDFViewerModal, ConfirmModal
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── pages/        # Login, Register, StudentHome, ChatPage, SavedAnswersPage, AdminDashboard, DocumentManagement, UploadDocument, AcademicManagement, DocumentSearchPage, ProfilePage
│   │   ├── services/     # Axios API service module
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## ⚙️ Quick Start & Local Setup

### Prerequisites
- Python 3.10+
- Node.js v18+ and npm

---

### 1. Backend Setup

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```

2. Activate Python virtual environment:
   ```powershell
   # Windows PowerShell
   backend/venv/Scripts/Activate.ps1
   ```

3. Install backend dependencies (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `backend/.env`:
   ```env
   PROJECT_NAME=CampusRAG
   API_V1_STR=/api
   JWT_SECRET=super-secret-campusrag-jwt-key-change-in-prod-2026
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=campusrag_db
   GEMINI_API_KEY=your_gemini_api_key_here
   LLM_PROVIDER=gemini
   ADMIN_REGISTRATION_SECRET=campusrag-admin-key-9988
   ```

5. Run the database seed script:
   ```bash
   python app/seed.py
   ```

6. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will be available at `http://localhost:8000/api` and Swagger docs at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

1. Open a second terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install Node packages (if not already installed):
   ```bash
   npm install
   ```

3. Configure environment variables in `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🔑 Default Seed Demo Credentials

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **College Admin** | `admin@campusrag.edu` | `admin123` | Dashboard, Upload PDFs, Delete/Reprocess, Manage Structure |
| **Student** | `student@campusrag.edu` | `student123` | Academic Context Selection, AI Chat, Source Citations, PDF View |

---

## 🚀 Deployment Guide

- **Frontend**: Ready for deployment on **Vercel** (`npm run build`).
- **Backend**: Ready for deployment on **Render / Railway** (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
- **Database**: Works out of the box with **MongoDB Atlas** by updating `MONGODB_URI` in `backend/.env`.
