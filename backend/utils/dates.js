/**
 * Date helpers (all LOCAL time, so "today" matches the student's day).
 * Dates are stored as plain "YYYY-MM-DD" strings.
 */
const pad = (n) => String(n).padStart(2, '0');

/** Format a Date as YYYY-MM-DD */
function ymd(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Date string n days from today (negative = past) */
function addDays(n, from = new Date()) {
  return ymd(new Date(from.getFullYear(), from.getMonth(), from.getDate() + n));
}

/** Monday = 0 ... Sunday = 6 */
function weekdayIndex(d = new Date()) {
  return (d.getDay() + 6) % 7;
}

module.exports = { ymd, addDays, weekdayIndex };
