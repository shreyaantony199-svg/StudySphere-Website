/** Small calculation helpers shared by several routes. */
const { ymd, addDays } = require('./dates');

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

/**
 * Study streak = consecutive days (ending today) with study hours > 0.
 * If today has no study yet, the streak is counted from yesterday
 * so it is not "lost" until the day actually ends.
 */
function computeStreak(studyLog) {
  const byDate = new Map(studyLog.map((l) => [l.date, l.hours]));
  let offset = (byDate.get(ymd()) || 0) > 0 ? 0 : 1;
  let streak = 0;
  while ((byDate.get(addDays(-offset)) || 0) > 0) {
    streak++;
    offset++;
  }
  return streak;
}

module.exports = { avg, computeStreak };
