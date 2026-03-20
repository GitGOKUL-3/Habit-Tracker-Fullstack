# Habit Tracker Full Stack Project

A complete full-stack web application for tracking personal habits.

## Tech Stack
- **Frontend:** Angular
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Security:** JWT (JSON Web Tokens)

## Features
- **Authentication:** Secure user registration and login
- **Habit Tracking:** Daily, weekly, and hourly habit management
- **Charts:** Visual progress tracking and completion analytics
- **Gamification:** Earn XP, build streaks, and level up
- **Admin Panel:** Separate dashboard for managing users 

## How to Run

### 1. Database & Backend
1. Start your local MySQL server.
2. Navigate to the backend folder:
   ```bash
   cd backend
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your database credentials.
4. Start the server (runs schema migrations automatically):
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:3000`*

### 2. Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Angular development server:
   ```bash
   npm start
   ```
3. Open your browser to `http://localhost:4200`
