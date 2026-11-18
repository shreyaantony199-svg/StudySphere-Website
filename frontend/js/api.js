/**
 * api.js - talks to the Express backend + keeps the login session.
 *
 * Works in two ways:
 *  1. Open http://localhost:3000   (served by Express)  -> same-origin calls
 *  2. Open with VS Code "Live Server" (port 5500)        -> calls http://localhost:3000/api
 */
const API_BASE = location.port === '3000' ? '/api' : 'http://localhost:3000/api';

/* ---------- Session (stored in the browser) ---------- */
const Auth = {
  get token() { return localStorage.getItem('ss-token'); },
  get user() {
    try { return JSON.parse(localStorage.getItem('ss-user')); } catch (e) { return null; }
  },
  save(token, user) {
    localStorage.setItem('ss-token', token);
    localStorage.setItem('ss-user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('ss-token');
    localStorage.removeItem('ss-user');
  },
  /** Call at the top of every protected page */
  requireUser() {
    if (!this.token || !this.user) {
      location.replace('login.html');
      return null;
    }
    return this.user;
  },
};

/* ---------- Generic request helper ---------- */
async function request(method, path, body) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(Auth.token ? { Authorization: 'Bearer ' + Auth.token } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach the server. Start it with "npm start" in the VS Code terminal.');
  }

  // Expired / invalid session -> back to login (but not for the login call itself)
  if (res.status === 401 && !path.startsWith('/auth/login')) {
    Auth.clear();
    location.replace('login.html');
    throw new Error('Session expired. Please log in again.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body || {}),
  put: (path, body) => request('PUT', path, body || {}),
  del: (path) => request('DELETE', path),
};
