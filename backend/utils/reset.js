/** `npm run reset` - deletes db.json so fresh demo data is created on next start. */
const fs = require('fs');
const { DB_PATH } = require('./store');

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Database reset. Fresh demo data will be created on next start.');
} else {
  console.log('Nothing to reset.');
}
