/** /api/exams - Exam Countdown Center */
const { createCrudRouter } = require('../utils/crud');

module.exports = createCrudRouter('exams', {
  required: ['subject', 'date'],
  allowed: ['subject', 'code', 'date', 'prep', 'room'],
  defaults: { code: '', prep: 0, room: '' },
});
