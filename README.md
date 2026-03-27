# Business Expense Tracker

A full-stack MERN application to track business expenses with intelligent anomaly detection.

## Features
- JWT-based user authentication (register/login)
- Add, view, and delete transactions
- Intelligent anomaly detection using statistical mean + standard deviation
- Visual indicator for anomalous transactions
- Docker support for backend deployment

## Tech Stack
- **Frontend**: React.js + TailwindCSS (Vite)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Testing**: Jest

## Project Structure
```
Expense-Tracker/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── tests/
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   └── (React/Vite app)
└── .github/workflows/main.yml
```

## Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
See `backend/.env.example` for required variables.
