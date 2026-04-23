---
description: how to run the pet daycare management system from scratch
---

# Run Pet Daycare Management System

Follow these steps to set up and run the application.

## 1. Prerequisites
- Node.js 18+ installed on your system.
- NPM (comes with Node.js).

## 2. Setup Backend
// turbo
1. Install backend dependencies:
   `npm install --prefix d:\Desktop\Git\Ai\pet-daycare-boarding\backend`

2. Verify `.env` file exists:
   Ensure `d:\Desktop\Git\Ai\pet-daycare-boarding\backend\.env` contains `PORT=5000` and `DATABASE_URL=pet_daycare.db`.

// turbo
3. Start the backend server:
   `node d:\Desktop\Git\Ai\pet-daycare-boarding\backend\server.js`

## 3. Setup Frontend
// turbo
1. Install frontend dependencies:
   `npm install --prefix d:\Desktop\Git\Ai\pet-daycare-boarding\frontend`

// turbo
2. Start the frontend development server:
   `npm run dev --prefix d:\Desktop\Git\Ai\pet-daycare-boarding\frontend`

## 4. Access the Application
- Backend API: `http://localhost:5000`
- Frontend UI: `http://localhost:5173` (Check the terminal for the exact URL if different)
