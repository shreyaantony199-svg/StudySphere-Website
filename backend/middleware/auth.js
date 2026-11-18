/**
 * Auth middleware - every /api route (except /api/auth) needs
 * the header:  Authorization: Bearer <token>
 */
const { getDb } = require('../utils/store');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const db = getDb();
  const session = token && db.sessions.find((s) => s.token === token);
  if (!session) return res.status(401).json({ error: 'Please log in to continue' });

  req.token = token;
  req.user = db.users.find((u) => u.id === session.userId);
  next();
}

module.exports = { requireAuth };
