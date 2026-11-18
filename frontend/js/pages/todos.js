/**
 * todos.js - To-Do Manager (GET/POST/PUT/DELETE /api/tasks)
 */
(function () {
  let tasks = [];
  let status = 'all';
  let category = 'all';

  const form = $('taskModalForm');

  /* ---------- Load ---------- */
  async function load() {
    tasks = (await UI.run(() => api.get('/tasks'))) || [];
    render();
  }

  /* ---------- Rendering ---------- */
  function visible() {
    return tasks
      .filter((t) => {
        if (status === 'active' && t.done) return false;
        if (status === 'done' && !t.done) return false;
        if (status === 'high' && (t.priority !== 'high' || t.done)) return false;
        if (category !== 'all' && t.category !== category) return false;
        return true;
      })
      .sort((a, b) => a.done - b.done || (a.due || '9999').localeCompare(b.due || '9999'));
  }

  function render() {
    // Summary cards
    const done = tasks.filter((t) => t.done).length;
    $('sTotal').textContent = tasks.length;
    $('sDone').textContent = done;
    $('sHigh').textContent = tasks.filter((t) => t.priority === 'high' && !t.done).length;
    $('sPct').textContent = (tasks.length ? Math.round((done / tasks.length) * 100) : 0) + '%';

    // Category chips (built from the data)
    const cats = [...new Set(tasks.map((t) => t.category))].sort();
    $('categoryPills').innerHTML = ['all', ...cats].map((c) =>
      `<button class="filter-pill ${c === category ? 'active' : ''}" data-cat="${UI.esc(c)}">${c === 'all' ? 'All subjects' : UI.esc(c)}</button>`).join('');
    $('catList').innerHTML = cats.map((c) => `<option value="${UI.esc(c)}">`).join('');

    // Task cards
    const list = visible();
    $('todoList').innerHTML = list.length ? list.map(card).join('') : '<div class="empty-state">No tasks here. Add one to get started ✨</div>';
  }

  function card(t) {
    return `
    <article class="todo-item glass-card ${t.done ? 'done' : ''}" data-id="${t.id}">
      <button class="todo-checkbox ${t.done ? 'checked' : ''}" data-act="toggle" role="checkbox" aria-checked="${t.done}" aria-label="Mark “${UI.esc(t.title)}” as ${t.done ? 'not done' : 'done'}">
        ${t.done ? '<i class="ri-check-line"></i>' : ''}
      </button>
      <div class="todo-info">
        <div class="todo-title">${UI.esc(t.title)}</div>
        <div class="todo-meta">
          <span class="${PRIORITY_BADGE[t.priority]}">${t.priority}</span>
          <span class="todo-category">${UI.esc(t.category)}</span>
          ${t.due ? `<span class="todo-category" style="color:${t.done ? 'var(--text-muted)' : UI.dueColor(t.due)}">⏰ ${UI.dueLabel(t.due)}</span>` : ''}
        </div>
        <div class="todo-progress-wrap">
          <div class="progress-track"><div class="progress-fill" style="width:${t.progress}%"></div></div>
          <span class="todo-progress-pct">${t.progress}%</span>
        </div>
      </div>
      <div class="todo-actions">
        <button class="btn-icon" data-act="edit" aria-label="Edit task"><i class="ri-edit-line"></i></button>
        <button class="btn-icon" data-act="delete" aria-label="Delete task"><i class="ri-delete-bin-line"></i></button>
      </div>
    </article>`;
  }

  /* ---------- Actions (event delegation) ---------- */
  $('todoList').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const el = btn.closest('.todo-item');
    const task = tasks.find((t) => t.id === Number(el.dataset.id));
    if (!task) return;

    if (btn.dataset.act === 'toggle') {
      const nowDone = !task.done;
      if (nowDone) el.classList.add('just-done'); // completion animation
      const updated = await UI.run(() => api.put(`/tasks/${task.id}`, { done: nowDone, progress: nowDone ? 100 : Math.min(task.progress, 90) }));
      if (updated) {
        Object.assign(task, updated);
        UI.toast('success', nowDone ? 'Task completed! 🎉' : 'Task reopened');
        setTimeout(render, nowDone ? 450 : 0);
      } else el.classList.remove('just-done');
    }
    if (btn.dataset.act === 'edit') openForm(task);
    if (btn.dataset.act === 'delete') {
      if (!confirm(`Delete “${task.title}”?`)) return;
      if (await UI.run(() => api.del(`/tasks/${task.id}`))) {
        tasks = tasks.filter((t) => t.id !== task.id);
        UI.toast('info', 'Task deleted');
        render();
      }
    }
  });

  document.querySelectorAll('#statusPills .filter-pill').forEach((p) => p.addEventListener('click', () => {
    status = p.dataset.filter;
    document.querySelectorAll('#statusPills .filter-pill').forEach((x) => x.classList.toggle('active', x === p));
    render();
  }));
  $('categoryPills').addEventListener('click', (e) => {
    const p = e.target.closest('[data-cat]');
    if (p) { category = p.dataset.cat; render(); }
  });

  /* ---------- Add / Edit modal ---------- */
  const progress = form.elements.progress;
  progress.addEventListener('input', () => ($('taskModal-progress-out').textContent = progress.value + '%'));

  function openForm(task) {
    form.reset();
    form.elements.id.value = task ? task.id : '';
    $('taskModalTitle').textContent = task ? 'Edit Task' : 'Add Task';
    if (task) {
      form.elements.title.value = task.title;
      form.elements.category.value = task.category;
      form.elements.priority.value = task.priority;
      form.elements.due.value = task.due || '';
      progress.value = task.progress;
    }
    progress.dispatchEvent(new Event('input'));
    UI.openModal('taskModal');
  }
  $('addTaskBtn').addEventListener('click', () => openForm(null));
  if (new URLSearchParams(location.search).get('new')) openForm(null); // from dashboard "Add Task"

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (!f.title.trim()) return UI.toast('error', 'Please enter a task title');
    const payload = { title: f.title, category: f.category || 'General', priority: f.priority, due: f.due || null, progress: Number(f.progress) };
    if (payload.progress === 100) payload.done = true;
    const saved = await UI.run(() => (f.id ? api.put(`/tasks/${f.id}`, payload) : api.post('/tasks', payload)));
    if (!saved) return;
    UI.closeModal('taskModal');
    UI.toast('success', f.id ? 'Task updated' : 'Task added');
    load();
  });

  load();
})();
