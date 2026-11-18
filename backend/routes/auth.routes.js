/**
 * /api/auth - signup, login, logout, current user.
 * On success the server returns a random session token which the
 * frontend stores and sends with every later request.
 */
const express = require('express');
const crypto = require('crypto');
const { getDb, save, nextId } = require('../utils/store');
const { hashPassword, verifyPassword } = require('../utils/password');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, course: u.course });

function startSession(db, user) {
  const token = crypto.randomBytes(24).toString('hex');
  db.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  save();
  return token;
}

router.post('/signup', (req, res) => {
  const { name = '', email = '', password = '', college = '' } = req.body || {};
  if (name.trim().length < 2) return res.status(400).json({ error: 'Please enter your full name' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const db = getDb();
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }
  const user = {
    id: nextId(db.users),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    course: college.trim() || 'Student',
    passwordHash: hashPassword(password),
  };
  db.users.push(user);
  res.status(201).json({ token: startSession(db, user), user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const db = getDb();
  const user = db.users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  res.json({ token: startSession(db, user), user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => res.json(publicUser(req.user)));

router.post('/logout', requireAuth, (req, res) => {
  const db = getDb();
  db.sessions = db.sessions.filter((s) => s.token !== req.token);
  save();
  res.json({ ok: true });
});

module.exports = router;
