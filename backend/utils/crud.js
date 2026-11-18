/**
 * Generic CRUD router factory.
 * One small config object gives us:
 *   GET    /        list all
 *   POST   /        create  (validates required fields)
 *   PUT    /:id     update
 *   DELETE /:id     delete
 * Used by tasks, assignments, exams, notes and timetable.
 */
const express = require('express');
const { getDb, save, nextId } = require('./store');

function pick(source, keys) {
  const out = {};
  keys.forEach((k) => {
    if (source[k] !== undefined) out[k] = typeof source[k] === 'string' ? source[k].trim() : source[k];
  });
  return out;
}

function createCrudRouter(collection, { required = [], defaults = {}, allowed = [] }) {
  const router = express.Router();

  router.get('/', (req, res) => res.json(getDb()[collection]));

  router.post('/', (req, res) => {
    const data = pick(req.body || {}, allowed);
    const missing = required.filter((f) => data[f] === undefined || data[f] === '');
    if (missing.length) return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });

    const db = getDb();
    const item = { id: nextId(db[collection]), ...defaults, ...data, createdAt: new Date().toISOString() };
    db[collection].unshift(item);
    save();
    res.status(201).json(item);
  });

  router.put('/:id', (req, res) => {
    const item = getDb()[collection].find((i) => i.id === Number(req.params.id));
    if (!item) return res.status(404).json({ error: 'Item not found' });
    Object.assign(item, pick(req.body || {}, allowed), { updatedAt: new Date().toISOString() });
    save();
    res.json(item);
  });

  router.delete('/:id', (req, res) => {
    const db = getDb();
    const before = db[collection].length;
    db[collection] = db[collection].filter((i) => i.id !== Number(req.params.id));
    if (db[collection].length === before) return res.status(404).json({ error: 'Item not found' });
    save();
    res.json({ ok: true });
  });

  return router;
}

module.exports = { createCrudRouter };
