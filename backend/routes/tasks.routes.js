/** /api/tasks - To-Do Manager */
const { createCrudRouter } = require('../utils/crud');

module.exports = createCrudRouter('tasks', {
  required: ['title'],
  allowed: ['title', 'category', 'priority', 'progress', 'done', 'due'],
  defaults: { category: 'General', priority: 'medium', progress: 0, done: false, due: null },
});
