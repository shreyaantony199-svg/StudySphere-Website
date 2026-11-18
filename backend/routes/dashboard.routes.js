/** /api/dashboard - one call that returns everything the dashboard needs. */
const express = require('express');
const { getDb } = require('../utils/store');
const { ymd, addDays, weekdayIndex } = require('../utils/dates');
const { avg, computeStreak } = require('../utils/stats');

const router = express.Router();

const QUOTES = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: "Don't watch the clock; do what it does. Keep going.", author: 'Sam Levenson' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The expert in anything was once a beginner.', author: 'Helen Hayes' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
];

router.get('/', (req, res) => {
  const db = getDb();
  const today = ymd();
  const todayLog = db.studyLog.find((l) => l.date === today);

  // Success score = 40% assignments, 30% exam prep, 30% task completion
  const assignmentScore = avg(db.assignments.map((a) => a.progress));
  const examPrep = avg(db.exams.map((e) => e.prep));
  const taskScore = db.tasks.length ? (db.tasks.filter((t) => t.done).length / db.tasks.length) * 100 : 0;
  const score = Math.round(0.4 * assignmentScore + 0.3 * examPrep + 0.3 * taskScore);

  const upcoming = db.assignments
    .filter((a) => a.status !== 'submitted')
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 4);

  const dueThisWeek = db.assignments.filter((a) => a.status !== 'submitted' && a.due <= addDays(7)).length;
  const openTasks = db.tasks
    .filter((t) => !t.done)
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));

  res.json({
    score,
    breakdown: {
      assignments: Math.round(assignmentScore),
      examPrep: Math.round(examPrep),
      tasks: Math.round(taskScore),
    },
    studyHoursToday: todayLog ? todayLog.hours : 0,
    streak: computeStreak(db.studyLog),
    dueThisWeek,
    openTaskCount: openTasks.length,
    upcoming,
    openTasks: openTasks.slice(0, 4),
    schedule: db.timetable.filter((t) => t.day === weekdayIndex()).sort((a, b) => a.start - b.start),
    quote: QUOTES[new Date().getDate() % QUOTES.length],
  });
});

module.exports = router;
