/**
 * Tiny JSON-file "database".
 * - Data lives in backend/data/db.json (created from the seed on first run).
 * - The whole file is kept in memory and written back after every change.
 * This keeps the project easy to run (no database server to install).
 */
const fs = require('fs');
const path = require('path');
const { buildSeed } = require('../data/seed');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
let cache = null;

function initStore() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(buildSeed(), null, 2));
    console.log('  Created fresh demo database (backend/data/db.json)');
  }
  cache = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

const getDb = () => cache;
const save = () => fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2));
const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id), 0) + 1;

module.exports = { initStore, getDb, save, nextId, DB_PATH };
