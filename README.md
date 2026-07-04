# AI Resume Copilot & Placement Companion

An advanced AI-powered placement preparation and resume optimization platform designed for entry-level and junior Software Development Engineers (SDEs). The platform parses candidate resumes, runs comprehensive ATS analysis with Gemini, allows bullet point optimization, manages saved versions, and generates standard ATS-compliant PDF and Word documents.

---

## Features

- **ATS Resume Analyzer**: Automatically parses PDF/DOCX resumes and computes real-time scores across experience, projects, education, and technical categories.
- **AI-Powered Bullet Optimizer**: Highlights placement-critical verbs and metrics, suggesting context-specific Gemini rewrites that the user can accept or reject.
- **SDE ATS Layout Generator**: Automatically compiles a clean, professional, single-column, recruiter-friendly PDF or Word (.docx) document from structured profile data.
- **Local Version Control**: Logs saved revisions, keeps an interactive undo/redo stack, and supports rolling back to or re-scanning any previous version.
- **Production Auth System**: Protects private workspace panels with JWT cookies, silent-token refreshes, and secure registration.

---

## Technical Stack

### Backend
- **Node.js & Express**: Extensible API routing and middleware pipelines in TypeScript.
- **Prisma ORM & PostgreSQL**: Structured data persistence and user storage.
- **PDFKit & docx**: High-fidelity native builders generating true binary PDF and DOCX attachments.
- **Google Generative AI**: Gemini models powering resume audits and SDE re-writes.

### Frontend
- **React & TypeScript**: Interactive state-driven user interfaces.
- **Zustand & localStorage**: Persisted client-side state engines.
- **Tailwind CSS & Framer Motion**: Sleek glassmorphism style rules and micro-animations.

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
GEMINI_API_KEY="your-google-gemini-api-key"
JWT_SECRET="your-jwt-auth-session-key"
NODE_ENV="development"
```

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_URL="http://localhost:5000/api"
```

---

## Installation & Setup

### 1. Install Dependencies
Run the install command from the monorepo root folder:
```bash
npm install
```

### 2. Boot Local Infrastructure
Ensure Docker is running and spin up database containers:
```bash
docker-compose up -d
```

### 3. Run Database Migrations
Initialize Prisma schema mappings inside the PostgreSQL container:
```bash
cd backend
npx prisma migrate dev
```

---

## Running the Application

### Running Backend API
Start the backend development environment (runs on `http://localhost:5000`):
```bash
cd backend
npm run dev
```

### Running Frontend SPA
Start the client server (runs on `http://localhost:3000`):
```bash
cd frontend
npm run dev
```

---

## Future Improvements

- **Interactive DSA Preparation Module**: Tailored code practice challenges synchronized with resume skills gaps.
- **Mock Technical Interviews**: AI-driven audio/video mock sessions with real-time feedback loops.
- **Multi-template Layout Engine**: Additional recruiter-approved styling layouts for PDF and Word exports.
