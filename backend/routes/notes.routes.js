/** /api/notes - Notes Vault */
const { createCrudRouter } = require('../utils/crud');

module.exports = createCrudRouter('notes', {
  required: ['title'],
  allowed: ['title', 'content', 'subject', 'icon', 'favorite'],
  defaults: { content: '', subject: 'General', icon: '📝', favorite: false },
});
