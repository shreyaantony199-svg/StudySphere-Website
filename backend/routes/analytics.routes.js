/** /api/analytics - numbers for the Chart.js charts. */
const express = require('express');
const { getDb } = require('../utils/store');
const { ymd } = require('../utils/dates');
const { avg } = require('../utils/stats');

const router = express.Router();
const round1 = (n) => Math.round(n * 10) / 10;

router.get('/', (req, res) => {
  const db = getDb();
  const log = db.studyLog;

  // Last 7 days -> weekly productivity chart
  const last7 = log.slice(-7);
  const weekly = {
    labels: last7.map((l) => new Date(l.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })),
    studyHours: last7.map((l) => l.hours),
    tasksDone: last7.map((l) => l.tasksDone),
  };

  // 56 days -> 8 weekly totals for the trend line
  const weeks = { labels: [], hours: [] };
  for (let w = 0; w < 8; w++) {
    const chunk = log.slice(w * 7, w * 7 + 7);
    weeks.labels.push(`Week ${w + 1}`);
    weeks.hours.push(round1(chunk.reduce((s, l) => s + l.hours, 0)));
  }

  // Assignment status doughnut
  const today = ymd();
  const status = { Completed: 0, 'In Progress': 0, Pending: 0, Overdue: 0 };
  db.assignments.forEach((a) => {
    if (a.status === 'submitted') status.Completed++;
    else if (a.due < today) status.Overdue++;
    else if (a.status === 'in-progress') status['In Progress']++;
    else status.Pending++;
  });

  res.json({
    totals: {
      hoursLast30: round1(log.slice(-30).reduce((s, l) => s + l.hours, 0)),
      tasksCompleted: db.tasks.filter((t) => t.done).length,
      averageScore: Math.round(avg(db.subjects.map((s) => s.score))),
      pomodoros: db.focusSessions.length,
    },
    weekly,
    weeks,
    status,
    subjects: db.subjects,
  });
});

module.exports = router;
