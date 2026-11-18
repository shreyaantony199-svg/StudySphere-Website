/** /api/timetable - Weekly Timetable Planner */
const { createCrudRouter } = require('../utils/crud');

module.exports = createCrudRouter('timetable', {
  required: ['day', 'start', 'subject'],
  allowed: ['day', 'start', 'code', 'subject', 'room'],
  defaults: { code: '', room: '' },
});
