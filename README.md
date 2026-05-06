# EcoSphere 🌱

A gamified environmental learning platform built with React + Express + PostgreSQL.

## Project Structure

```
major-project/
├── backend/          # Express.js API
│   ├── routes/       # API route handlers
│   ├── middleware/   # Auth middleware
│   ├── db.js         # PostgreSQL connection
│   ├── schema.sql    # Database schema
│   └── index.js      # App entry point
└── frontend/         # React + Vite app
    └── src/
        ├── pages/    # All pages
        ├── components/
        ├── context/
        └── services/
```

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database named `ecosphere`:
```sql
CREATE DATABASE ecosphere;
```

Then run the schema:
```bash
psql -U postgres -d ecosphere -f backend/schema.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
# Edit .env with your DATABASE_URL
npm run dev
```

`.env` file:
```
PORT=5000
DATABASE_URL=postgres://postgres:PASSWORD@localhost:5432/ecosphere
JWT_SECRET=your_secret_key_here
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Features
- 🔐 JWT Auth with student/teacher roles
- 📚 Course + Lesson management
- 📝 MCQ Quiz system
- 🏅 Auto-unlocking Badge system
- 📊 Progress tracking
- 🎨 Glassmorphism UI with animations
