/** /api/assignments - Assignment Tracker */
const { createCrudRouter } = require('../utils/crud');

module.exports = createCrudRouter('assignments', {
  required: ['title', 'subject', 'due'],
  allowed: ['title', 'subject', 'description', 'progress', 'status', 'due'],
  defaults: { description: '', progress: 0, status: 'pending' },
});
