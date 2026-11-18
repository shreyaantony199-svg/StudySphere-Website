/**
 * StudySphere - Express server
 *  - serves the frontend (HTML/CSS/JS) from /frontend
 *  - exposes the REST API under /api
 * Run:  npm install  then  npm start   ->  http://localhost:3000
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initStore } = require('./backend/utils/store');
const { requireAuth } = require('./backend/middleware/auth');

const PORT = process.env.PORT || 3000;
const app = express();

initStore(); // load (or create) the JSON database

app.use(cors());
app.use(express.json());

// ---- API routes ----
app.use('/api/auth', require('./backend/routes/auth.routes')); // public
app.use('/api', requireAuth);                                  // everything below needs login
app.use('/api/dashboard', require('./backend/routes/dashboard.routes'));
app.use('/api/tasks', require('./backend/routes/tasks.routes'));
app.use('/api/timetable', require('./backend/routes/timetable.routes'));
app.use('/api/assignments', require('./backend/routes/assignments.routes'));
app.use('/api/exams', require('./backend/routes/exams.routes'));
app.use('/api/notes', require('./backend/routes/notes.routes'));
app.use('/api/focus', require('./backend/routes/focus.routes'));
app.use('/api/achievements', require('./backend/routes/achievements.routes'));
app.use('/api/analytics', require('./backend/routes/analytics.routes'));
app.use('/api', (req, res) => res.status(404).json({ error: 'API route not found' }));

// ---- Frontend ----
app.use(express.static(path.join(__dirname, 'frontend')));

// ---- Error handler (e.g. invalid JSON body) ----
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.status === 400 ? 'Invalid request body' : 'Server error' });
});

app.listen(PORT, () => {
  console.log(`\n  StudySphere is running  ->  http://localhost:${PORT}`);
  console.log('  Demo login: alex@studysphere.io / password123\n');
});
