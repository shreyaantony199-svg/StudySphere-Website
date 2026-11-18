# StudySphere - Student Productivity Web App

An all-in-one academic productivity platform for college students.
**Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js  |  **Backend:** Node.js + Express (REST API, JSON-file database)

## How to run (VS Code)
1. Install Node.js (LTS) from https://nodejs.org if you do not have it.
2. Unzip, then in VS Code: **File > Open Folder...** and choose the `StudySphere` folder.
3. Open the terminal (**Ctrl + `**) and run:
   ```
   npm install
   npm start
   ```
4. Open **http://localhost:3000** in your browser.
5. Log in with the demo account (pre-filled): `alex@studysphere.io` / `password123`, or create your own on the Sign up page.

Useful commands: `npm run dev` (auto-restart while editing) and `npm run reset` (restore the demo data).

> Optional: you can also open the `frontend` folder with the VS Code *Live Server* extension. The backend must still be running (`npm start`); the frontend detects this automatically.

## Project structure
```
StudySphere/
├── server.js                  Express server: API + serves the frontend
├── package.json               Project info and dependencies (express, cors)
├── backend/
│   ├── data/
│   │   ├── seed.js            Demo data (dates are relative to today)
│   │   └── db.json            Created on first run (the "database")
│   ├── middleware/
│   │   └── auth.js            Checks the login token on every /api request
│   ├── routes/
│   │   ├── auth.routes.js         signup, login, logout, current user
│   │   ├── dashboard.routes.js    success score, deadlines, today's classes, quote
│   │   ├── tasks.routes.js        To-do CRUD
│   │   ├── timetable.routes.js    Timetable CRUD
│   │   ├── assignments.routes.js  Assignment CRUD
│   │   ├── exams.routes.js        Exam CRUD
│   │   ├── notes.routes.js        Notes CRUD
│   │   ├── focus.routes.js        Pomodoro sessions
│   │   ├── achievements.routes.js Badges, level and streak
│   │   └── analytics.routes.js    Data for the Chart.js charts
│   └── utils/
│       ├── store.js           Reads/writes db.json
│       ├── crud.js            Reusable CRUD router factory
│       ├── password.js        Password hashing (scrypt)
│       ├── stats.js           Streak and average helpers
│       ├── dates.js           Date helpers
│       └── reset.js           `npm run reset`
├── frontend/
│   ├── index.html             Landing page
│   ├── login.html / signup.html
│   ├── dashboard.html  todos.html  timetable.html  assignments.html
│   ├── exams.html  notes.html  focus.html  achievements.html  analytics.html
│   ├── css/
│   │   ├── style.css          Design system (glassmorphism, themes, components)
│   │   └── pages.css          Page-level styles and responsive fixes
│   └── js/
│       ├── theme.js           Dark/light mode
│       ├── api.js             fetch() wrapper + login session
│       ├── ui.js              Toasts, modals, date helpers, colours
│       ├── layout.js          Sidebar + top bar shared by all app pages
│       ├── landing.js  auth.js
│       └── pages/             One script per page (dashboard.js, todos.js, ...)
└── docs/
    └── BUILD_STEPS.md         Step-by-step build order (for explaining the project)
```

## REST API
All routes except `/api/auth/*` need the header `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/signup, /api/auth/login | Create account / sign in (returns token) |
| POST | /api/auth/logout, GET /api/auth/me | Sign out / current user |
| GET | /api/dashboard | Dashboard summary |
| GET POST PUT DELETE | /api/tasks, /api/timetable, /api/assignments, /api/exams, /api/notes | CRUD for each module (`PUT/DELETE` use `/:id`) |
| GET POST | /api/focus/sessions | Today's Pomodoro sessions / save a session |
| GET | /api/achievements | Badges, level, streak |
| GET | /api/analytics | Chart data |

## Features
Landing page, login/signup, dashboard (success score, deadlines, timetable, quote), to-do manager (filters, progress, completion animation), timetable with drag and drop, assignment tracker (search, sort, countdown), exam countdown with a live ticking timer and progress rings, notes vault (search, favourites, subjects), Pomodoro focus mode with ambient sounds, achievements (badges, levels, streak), analytics (4 Chart.js charts), dark/light mode, collapsible sidebar, toasts, modals and a profile dropdown. Fully responsive and keyboard accessible.

## Notes
- Data is stored in `backend/data/db.json` (no database server needed). It is easy to swap for MySQL or MongoDB later because all data access goes through `utils/store.js` and `utils/crud.js`.
- All users share one demo dataset; the login system demonstrates authentication, not per-user data.
