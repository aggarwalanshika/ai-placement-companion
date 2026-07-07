# 🚀 AI Resume Copilot

AI Resume Copilot is a full-stack web application that helps students and job seekers improve their resumes using Google's Gemini AI. It analyzes resumes for ATS compatibility, provides AI-powered rewrite suggestions, tracks multiple resume versions, and generates ATS-friendly PDF and DOCX resumes.

---

## ✨ Features

### 📄 Resume Analysis
- Upload resumes in PDF format
- Extract and parse resume content
- AI-powered ATS score generation
- Section-wise feedback (Skills, Projects, Experience, Education)
- Resume summary and improvement suggestions

### 🤖 AI Resume Rewriter
- Rewrite individual resume bullet points using Gemini AI
- Accept or reject AI suggestions
- Live preview of rewritten content
- Version history with Undo/Redo support

### 📑 Resume Generation
- Generate professional ATS-friendly resumes
- Export as PDF and DOCX
- Preserve accepted AI improvements
- Resume preview before download

### 💼 Job Description Matching
- Compare resume against a job description
- Match score generation
- Missing skills detection
- Keyword gap analysis
- Personalized improvement suggestions

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Protected dashboard routes

---

# 🛠 Tech Stack

## Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Framer Motion
- Axios

## Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite (Development)
- Google Gemini API
- PDFKit
- docx

---

# 📂 Project Structure

```
AI-Resume-Copilot
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── services
│   ├── middleware
│   ├── prisma
│   └── utils
│
├── frontend
│   ├── components
│   ├── pages
│   ├── store
│   ├── hooks
│   └── assets
│
└── README.md
```

---

# ⚙️ Environment Variables

## Backend (.env)
```env
PORT=5000
DATABASE_URL=...
JWT_SECRET=...
GEMINI_API_KEY=...
```

## Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

# 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-placement-companion
```

### 2. Install dependencies
Run from the root directory:
```bash
npm install
```

### 3. Run Database Migrations
Initialize database tables with Prisma:
```bash
cd backend
npx prisma migrate dev
```

---

# 💻 Running the Application

### Option A: Double-Click Launcher (Windows)
Simply double-click the **`start.bat`** file in the root folder of the project. It will automatically verify dependencies and spin up both the backend API and frontend client concurrently.

### Option B: Terminal Command
Run the dev task from the monorepo root folder:
```bash
npm run dev
```

The services will boot at:
- **Frontend Client**: `http://localhost:3000/`
- **Backend API**: `http://localhost:5000/`

---

# 🧠 How It Works

1. User uploads a resume.
2. Resume text is extracted and parsed.
3. Gemini analyzes the resume and generates:
   - ATS score
   - Missing skills
   - Strengths
   - Weaknesses
   - Resume summary
4. User rewrites selected bullet points using AI.
5. Accepted changes are stored in version history.
6. A new ATS-friendly resume is generated and exported as PDF or DOCX.

---

# 🎯 Future Improvements

- Resume templates with multiple layouts
- LinkedIn profile import
- Cover letter generation
- Mock interview assistant
- Company-specific ATS optimization
- Resume sharing with public links

---

# 👨‍💻 Author

**Anshika Aggarwal**

B.Tech Computer Science | Jaypee Institute of Information Technology

---

# ⭐ If you found this project useful, consider giving it a star!
