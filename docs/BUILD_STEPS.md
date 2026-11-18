# Building StudySphere step by step

Follow this order when you explain or rebuild the project.

## Step 1 - Project setup
- Create the `StudySphere` folder, open it in VS Code, run `npm init -y`, then `npm install express cors`.
- Files: `package.json`, `.gitignore`. Create the folders `backend/`, `frontend/`, `docs/`.

## Step 2 - Backend foundation (utilities)
- `backend/utils/dates.js` - date helpers (dates are "YYYY-MM-DD" strings)
- `backend/utils/password.js` - hashes passwords with scrypt (no plain-text passwords)
- `backend/utils/stats.js` - average and study-streak calculation
- `backend/utils/store.js` - loads/saves `db.json` (our simple database)
- `backend/data/seed.js` - realistic demo data created the first time the server starts

## Step 3 - Reusable CRUD + authentication
- `backend/utils/crud.js` - one function that builds GET / POST / PUT / DELETE routes for any collection (validates required fields)
- `backend/middleware/auth.js` - rejects requests without a valid token (HTTP 401)
- `backend/routes/auth.routes.js` - signup, login, logout, me

## Step 4 - Feature routes
- CRUD modules (a few lines of config each): `tasks`, `timetable`, `assignments`, `exams`, `notes` `.routes.js`
- Calculated endpoints: `dashboard`, `focus`, `achievements`, `analytics` `.routes.js`

## Step 5 - Server
- `server.js` connects everything: JSON parsing, CORS, public auth routes, protected `/api` routes, static frontend, error handler.
- Run `npm start` and test the API (VS Code REST Client or Postman) before building the UI.

## Step 6 - Frontend design system
- `frontend/css/style.css` - CSS variables for the blue/purple/white palette, dark and light themes, glass cards, buttons, badges, progress bars, sidebar, modals, toasts, animations
- `frontend/css/pages.css` - page-specific styles, accessibility, responsive fixes
- `frontend/js/theme.js` - dark/light switch saved in the browser

## Step 7 - Frontend core scripts
- `js/api.js` - talks to the backend with fetch(), stores the login token
- `js/ui.js` - toasts, modals, date formatting, subject colours
- `js/layout.js` - builds the collapsible sidebar, top bar, profile dropdown and notifications once for every app page

## Step 8 - Public pages
- `index.html` + `js/landing.js` - hero, features, how it works, testimonials, call to action, footer
- `login.html`, `signup.html` + `js/auth.js` - glassmorphism forms, validation, social-login placeholders

## Step 9 - App pages (HTML + one JS file each)
Every page follows the same pattern: load data from the API, render cards, handle add/edit/delete.
1. `dashboard.html` + `pages/dashboard.js`
2. `todos.html` + `pages/todos.js` (filters, progress, completion animation)
3. `timetable.html` + `pages/timetable.js` (drag and drop, reminders)
4. `assignments.html` + `pages/assignments.js` (search, sort, countdown)
5. `exams.html` + `pages/exams.js` (live countdown, progress rings)
6. `notes.html` + `pages/notes.js` (search, favourites, categories)
7. `focus.html` + `pages/focus.js` (Pomodoro, session tracker, ambient sounds)
8. `achievements.html` + `pages/achievements.js` (badges, level, streak)
9. `analytics.html` + `pages/analytics.js` (Chart.js charts)

## Step 10 - Polish and test
- Test dark/light mode, mobile layout (browser DevTools device mode), keyboard navigation, and error cases (stop the server and watch the friendly error message).

## Demo flow for presenting
1. Landing page, then Log in (demo account) to open the Dashboard.
2. Add a task and tick it (completion animation), then show the filters.
3. Timetable: drag a class to a new slot (saved by the backend).
4. Exams: the live ticking countdown. Focus Mode: start the timer, play the rain sound.
5. Analytics charts, then toggle Dark/Light mode and collapse the sidebar.
6. Open `backend/routes/tasks.routes.js` and `backend/utils/crud.js` to show how the API works.
