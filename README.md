# AI Placement Companion

An AI-powered placement preparation platform featuring resume scoring, RAG chat, DSA analytics, mock interviews, and mentoring.

## Project Structure
- `backend/`: Node.js, Express, TypeScript, and Prisma Client.
- `frontend/`: React, TypeScript, Vite, Tailwind CSS, Zustand, and React Query.

## Quick Start (Milestone 1)

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
```

### 2. Start Infrastructure Services
Make sure Docker is running, then boot the PostgreSQL, Redis, and Qdrant containers:
```bash
docker-compose up -d
```

### 3. Run Prisma Migrations
```bash
cd backend
npx prisma migrate dev --name init
```

### 4. Start Development Servers
- Backend API (Runs on port 5000):
  ```bash
  npm run backend:dev
  ```
- Frontend SPA Client (Runs on port 3000):
  ```bash
  npm run frontend:dev
  ```
