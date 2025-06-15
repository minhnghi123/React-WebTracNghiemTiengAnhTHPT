## Overview

A professional, full-stack web application for high school English multiple-choice testing. The system supports students, teachers, and administrators with secure authentication, exam management, and real-time statistics.

- **Frontend:** ReactJS, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, ExpressJS, MongoDB, Redis, Socket.IO
- **Deployment:** Docker, Nginx, Vercel/Render

---

## Features

### For Students

- Register, login with OTP email verification
- Take many different types of English tests
- View results and suggestions by Gemini Google API
- Enroll in classes

### For Teachers

- Register (pending admin approval)
- Create and manage tests/questions
- Manage classes and students
- View student statistics in a class

### For Administrators

- Approve teacher accounts
- Manage users, tests, classes
- System-wide statistics and reports

### Security

- OTP authentication for login
- Trusted device verification
- hCaptcha protection
- User activity logging

---

## Project Structure

```
├── backend/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── utils/
│   └── ...
├── src/ (frontend)
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── stores/
│   └── ...
├── public/
├── Dockerfile.*
├── docker-compose.yml
├── nginx.conf
├── README.md
└── ...
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd 2024-11-14_WebTracNghiemTiengAnhTHPT_ReactJs
```

### 2. Environment Variables

- Create `.env` files for backend and frontend (see `.env.example` if available).
- Required variables: `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `HCAPTCHA_SECRET_KEY`, `ADMIN_EMAIL`, ...

### 3. Run with Docker (recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### 4. Manual Run

#### Backend

```bash
cd backend
npm install
npm run dev
```

#### Frontend

```bash
cd src
npm install
npm run dev
```

---

## Production Deployment

- Deploy backend to Render, frontend to Vercel, reverse proxy with Nginx.
- Ensure CORS, cookie, domain, and HTTPS are properly configured.

---

> © 2025 Team 6 - Web Trắc Nghiệm Tiếng Anh THPT. All rights reserved.
