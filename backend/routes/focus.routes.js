/** /api/focus - Pomodoro session tracking. */
const express = require('express');
const { getDb, save, nextId } = require('../utils/store');
const { ymd } = require('../utils/dates');

const router = express.Router();

function todaySummary(db) {
  const today = db.focusSessions.filter((s) => s.date === ymd());
  return {
    sessions: today,
    todayCount: today.length,
    todayMinutes: today.reduce((sum, s) => sum + s.minutes, 0),
    totalCount: db.focusSessions.length,
  };
}

router.get('/sessions', (req, res) => res.json(todaySummary(getDb())));

router.post('/sessions', (req, res) => {
  const minutes = Number(req.body && req.body.minutes);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
    return res.status(400).json({ error: 'minutes must be between 1 and 180' });
  }
  const db = getDb();
  const now = new Date();
  db.focusSessions.push({
    id: nextId(db.focusSessions),
    minutes,
    date: ymd(now),
    time: now.toTimeString().slice(0, 5),
  });

  // Add the time to today's study log so streak + analytics update too
  let log = db.studyLog.find((l) => l.date === ymd());
  if (!log) {
    log = { date: ymd(), hours: 0, tasksDone: 0 };
    db.studyLog.push(log);
  }
  log.hours = Math.round((log.hours + minutes / 60) * 100) / 100;

  save();
  res.status(201).json(todaySummary(db));
});

module.exports = router;
