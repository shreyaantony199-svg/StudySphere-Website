/**
 * assignments.js - Assignment Tracker (GET/POST/PUT/DELETE /api/assignments)
 */
(function () {
  let items = [];
  let filter = 'all';
  const form = $('asgnModalForm');

  /** Real status: a not-submitted assignment past its due date is "overdue" */
  const effective = (a) => (a.status === 'submitted' ? 'submitted' : UI.daysUntil(a.due) < 0 ? 'overdue' : a.status);
  const LABELS = {
    pending: ['Pending', 'badge-primary'],
    'in-progress': ['In progress', 'badge-warm'],
    submitted: ['Submitted ✓', 'badge-green'],
    overdue: ['Overdue', 'badge-red'],
  };

  async function load() {
    items = (await UI.run(() => api.get('/assignments'))) || [];
    render();
  }

  function render() {
    const q = $('asgnSearch').value.trim().toLowerCase();
    const sort = $('asgnSort').value;

    const list = items
      .filter((a) => (filter === 'all' || effective(a) === filter) && (!q || (a.title + ' ' + a.subject).toLowerCase().includes(q)))
      .sort((a, b) =>
        sort === 'progress' ? b.progress - a.progress :
        sort === 'subject' ? a.subject.localeCompare(b.subject) :
        a.due.localeCompare(b.due));

    $('asgnGrid').innerHTML = list.length ? list.map(card).join('') : '<div class="empty-state">No assignments match your search</div>';
  }

  function card(a) {
    const st = effective(a);
    const color = subjectColor(a.subject);
    const [label, badge] = LABELS[st];
    const n = UI.daysUntil(a.due);
    const chipColor = st === 'submitted' ? '#00E676' : n <= 0 ? '#FF5252' : n === 1 ? '#FFD700' : 'var(--text)';
    return `
    <article class="assignment-card glass-card" data-id="${a.id}">
      <div class="assignment-top">
        <span class="subject-tag ${TAG_CLASS[color]}">${UI.esc(a.subject)}</span>
        <div class="card-actions">
          <button class="btn-icon" data-act="edit" aria-label="Edit assignment" style="width:32px;height:32px"><i class="ri-edit-line"></i></button>
          <button class="btn-icon" data-act="delete" aria-label="Delete assignment" style="width:32px;height:32px"><i class="ri-delete-bin-line"></i></button>
        </div>
      </div>
      <h3 style="font-size:1rem;margin-bottom:8px">${UI.esc(a.title)}</h3>
      <p class="description">${UI.esc(a.description || 'No description')}</p>
      <div style="margin-bottom:14px">
        <div class="d-flex justify-content-between" style="font-size:.78rem;color:var(--text-muted);margin-bottom:6px"><span>Progress</span><span>${a.progress}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${a.progress}%;background:${COLOR_HEX[color]}"></div></div>
      </div>
      <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div class="countdown-chip" style="color:${chipColor}"><i class="ri-time-line"></i> ${st === 'submitted' ? 'Submitted' : UI.dueLabel(a.due)} · ${UI.fmtDate(a.due)}</div>
        <span class="${badge}">${label}</span>
      </div>
      ${st !== 'submitted' ? '<button class="btn-ghost w-100 mt-3" data-act="submit" style="padding:8px;font-size:.82rem"><i class="ri-check-double-line"></i> Mark as submitted</button>' : ''}
    </article>`;
  }

  /* ---------- Card actions ---------- */
  $('asgnGrid').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const a = items.find((x) => x.id === Number(btn.closest('.assignment-card').dataset.id));
    if (btn.dataset.act === 'edit') openForm(a);
    if (btn.dataset.act === 'submit') {
      const saved = await UI.run(() => api.put(`/assignments/${a.id}`, { status: 'submitted', progress: 100 }));
      if (saved) { Object.assign(a, saved); UI.toast('success', 'Great work! Assignment submitted 🎉'); render(); }
    }
    if (btn.dataset.act === 'delete' && confirm(`Delete “${a.title}”?`)) {
      if (await UI.run(() => api.del(`/assignments/${a.id}`))) {
        items = items.filter((x) => x.id !== a.id);
        UI.toast('info', 'Assignment deleted');
        render();
      }
    }
  });

  /* ---------- Search / filter / sort ---------- */
  $('asgnSearch').addEventListener('input', render);
  $('asgnSort').addEventListener('change', render);
  document.querySelectorAll('#asgnPills .filter-pill').forEach((p) => p.addEventListener('click', () => {
    filter = p.dataset.filter;
    document.querySelectorAll('#asgnPills .filter-pill').forEach((x) => x.classList.toggle('active', x === p));
    render();
  }));

  /* ---------- Modal ---------- */
  const progress = form.elements.progress;
  progress.addEventListener('input', () => ($('asgnModal-progress-out').textContent = progress.value + '%'));

  function openForm(a) {
    form.reset();
    form.elements.id.value = a ? a.id : '';
    $('asgnModalTitle').textContent = a ? 'Edit Assignment' : 'New Assignment';
    form.querySelector('[data-delete]').style.display = a ? '' : 'none';
    if (a) {
      ['title', 'subject', 'description', 'due', 'status'].forEach((k) => (form.elements[k].value = a[k] || ''));
      progress.value = a.progress;
    }
    progress.dispatchEvent(new Event('input'));
    UI.openModal('asgnModal');
  }
  $('addAssignmentBtn').addEventListener('click', () => openForm(null));

  form.querySelector('[data-delete]').addEventListener('click', async () => {
    const id = form.elements.id.value;
    if (id && confirm('Delete this assignment?') && (await UI.run(() => api.del(`/assignments/${id}`)))) {
      UI.closeModal('asgnModal'); UI.toast('info', 'Assignment deleted'); load();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (!f.title.trim() || !f.subject.trim() || !f.due) return UI.toast('error', 'Title, subject and due date are required');
    const payload = { title: f.title, subject: f.subject.toUpperCase(), description: f.description, due: f.due, status: f.status, progress: Number(f.progress) };
    if (payload.status === 'submitted') payload.progress = 100;
    const saved = await UI.run(() => (f.id ? api.put(`/assignments/${f.id}`, payload) : api.post('/assignments', payload)));
    if (!saved) return;
    UI.closeModal('asgnModal');
    UI.toast('success', f.id ? 'Assignment updated' : 'Assignment added');
    load();
  });

  load();
})();
