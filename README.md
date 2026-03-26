✨ Habit Tracker Full Stack ✨

A modern, comprehensive full-stack habit tracking application designed to help users build and maintain life-altering habits through gamification and data-driven insights.

---

## Live Demo

**Frontend:** <a href="https://haabit-traacker.netlify.app/login" target="_blank" rel="noopener noreferrer">Live Application (Netlify)</a>  
**Backend API:** <a href="https://habit-tracker-fullstack-kdoe.onrender.com" target="_blank">API Endpoint (Render)</a>


> [!TIP]
> Use the demo account `testuser` / `password123` or create your own to start tracking!

---

## Tech Stack

### Frontend
**Framework:** [Angular 19]
**Visualizations:** [Chart.js] & [ng2-charts]
**Styling:** CSS3 & Angular Material / CDK
**Architecture:** Component-based UI with RXJS for state management

### Backend
**Core:** [Node.js] & [Express.js]
**Database:** [MySQL]
**Authentication:** [JWT (JSON Web Tokens)]
**Security:** Bcrypt for password hashing

---

## Features

- **Secure Authentication:** Full user registration, login, and protected routes using JWT.
- **Smart Tracking:** Manage daily, weekly, and even hourly habits with an intuitive interface.
- **Interactive Analytics:** High-performance charts powered by Chart.js to visualize your completion rates over time.
- **Gamified Experience:** Stay motivated with XP rewards, level progression, and habit streak tracking.
- **Admin Dashboard:** Comprehensive management panel for users and global habit settings.
- **Responsive Design:** Seamless experience across desktop and mobile devices.

---

## Getting Started

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


## Project Structure

```text
Habit-Tracker/
├── backend/            # Express.js Server & APIs
│   ├── config/         # DB Connections
│   ├── controllers/    # Business Logic
│   ├── routes/         # API Route Handlers
│   └── utils/          # Helper functions
├── frontend/           # Angular Application
│   ├── src/app/        # Core Components & Services
│   └── environments/   # App Configuration
└── netlify.toml        # Deployment Config
```

---

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

<!-- ## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

---
