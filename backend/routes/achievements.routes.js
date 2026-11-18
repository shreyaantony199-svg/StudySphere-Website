/** /api/achievements - badges, streak calendar and level (all calculated from real data). */
const express = require('express');
const { getDb } = require('../utils/store');
const { computeStreak } = require('../utils/stats');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const streak = computeStreak(db.studyLog);
  const tasksDone = db.tasks.filter((t) => t.done).length;
  const sessions = db.focusSessions.length;
  const notes = db.notes.length;
  const submitted = db.assignments.filter((a) => a.status === 'submitted').length;
  const examsReady = db.exams.filter((e) => e.prep >= 80).length;

  // [icon, name, description, current value, target value]
  const defs = [
    ['🚀', 'First Launch', 'Created your StudySphere account', 1, 1],
    ['🔥', 'Week Warrior', 'Keep a 7-day study streak', streak, 7],
    ['✅', 'Task Master', 'Complete 10 tasks', tasksDone, 10],
    ['🍅', 'Pomodoro Pro', 'Finish 10 focus sessions', sessions, 10],
    ['📚', 'Bookworm', 'Save 8 notes in the vault', notes, 8],
    ['🏅', 'Fortnight Focus', 'Reach a 14-day study streak', streak, 14],
    ['🎓', 'Exam Ready', 'Reach 80% prep for all 4 exams', examsReady, 4],
    ['💯', 'Submission Star', 'Submit 5 assignments', submitted, 5],
  ];
  const badges = defs.map(([icon, name, description, current, target], i) => ({
    id: i + 1,
    icon,
    name,
    description,
    current: Math.min(current, target),
    target,
    progress: Math.round((Math.min(current, target) / target) * 100),
    unlocked: current >= target,
  }));

  // Level system: 100 XP per level
  const xp = tasksDone * 10 + sessions * 5 + notes * 5 + streak * 10;
  const level = { xp, level: Math.floor(xp / 100) + 1, intoLevel: xp % 100, pct: xp % 100 };

  res.json({ streak, days: db.studyLog.slice(-14), badges, level });
});

module.exports = router;
