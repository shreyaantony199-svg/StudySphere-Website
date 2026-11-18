/**
 * notes.js - Notes Vault (GET/POST/PUT/DELETE /api/notes)
 */
(function () {
  let notes = [];
  let subject = 'all'; // 'all' | 'fav' | a subject code
  const form = $('noteModalForm');
  const ICONS = { CS: '💻', CHEM: '⚗️', ENG: '📖', PHY: '⚡', MATH: '∑' };
  const iconFor = (code = '') => ICONS[Object.keys(ICONS).find((p) => code.toUpperCase().startsWith(p))] || '📝';
  const noteDate = (n) => (n.updatedAt || n.createdAt || '').slice(0, 10);

  async function load() {
    notes = (await UI.run(() => api.get('/notes'))) || [];
    render();
  }

  function render() {
    // Subject pills
    const subjects = [...new Set(notes.map((n) => n.subject))].sort();
    $('notePills').innerHTML = [['all', 'All'], ['fav', '⭐ Favourites'], ...subjects.map((s) => [s, s])]
      .map(([k, label]) => `<button class="filter-pill ${k === subject ? 'active' : ''}" data-s="${UI.esc(k)}">${UI.esc(label)}</button>`).join('');
    $('noteSubjects').innerHTML = subjects.map((s) => `<option value="${UI.esc(s)}">`).join('');

    // Filter + search
    const q = $('noteSearch').value.trim().toLowerCase();
    const filtered = notes
      .filter((n) => (subject === 'all' || (subject === 'fav' ? n.favorite : n.subject === subject)) && (!q || (n.title + ' ' + n.content).toLowerCase().includes(q)))
      .sort((a, b) => noteDate(b).localeCompare(noteDate(a)));

    const favs = filtered.filter((n) => n.favorite);
    const rest = subject === 'fav' ? [] : filtered.filter((n) => !n.favorite);

    $('noteFavSection').style.display = favs.length ? '' : 'none';
    $('noteFavGrid').innerHTML = favs.map(card).join('');
    $('noteAllLabel').style.display = rest.length || !favs.length ? '' : 'none';
    $('noteAllLabel').textContent = favs.length ? 'Other notes' : 'All notes';
    $('noteGrid').innerHTML = rest.length ? rest.map(card).join('') : (!favs.length ? '<div class="empty-state">No notes found</div>' : '');
  }

  function card(n) {
    const tag = TAG_CLASS[subjectColor(n.subject)];
    return `
    <article class="note-card glass-card" data-id="${n.id}" tabindex="0" role="button" aria-label="Open note ${UI.esc(n.title)}" ${n.favorite ? 'style="border-color:rgba(255,215,0,.3)"' : ''}>
      <div class="note-card-header">
        <div class="note-icon">${UI.esc(n.icon || '📝')}</div>
        <button class="note-fav-btn ${n.favorite ? 'on' : ''}" data-fav aria-pressed="${n.favorite}" aria-label="${n.favorite ? 'Remove from' : 'Add to'} favourites"><i class="ri-star-${n.favorite ? 'fill' : 'line'}"></i></button>
      </div>
      <div class="note-title">${UI.esc(n.title)}</div>
      <p class="note-preview">${UI.esc(n.content || 'Empty note')}</p>
      <div class="note-footer">
        <div class="note-date">${noteDate(n) ? UI.fmtDate(noteDate(n)) : ''}</div>
        <span class="${tag}" style="font-size:.7rem;padding:2px 10px;border-radius:50px;font-weight:600">${UI.esc(n.subject)}</span>
      </div>
    </article>`;
  }

  /* ---------- Interactions ---------- */
  function onGridClick(e) {
    const el = e.target.closest('.note-card');
    if (!el) return;
    const n = notes.find((x) => x.id === Number(el.dataset.id));
    if (e.target.closest('[data-fav]')) return toggleFav(n);
    openForm(n);
  }
  async function toggleFav(n) {
    const saved = await UI.run(() => api.put(`/notes/${n.id}`, { favorite: !n.favorite }));
    if (saved) { Object.assign(n, saved); UI.toast('info', n.favorite ? 'Added to favourites ⭐' : 'Removed from favourites'); render(); }
  }
  ['noteGrid', 'noteFavGrid'].forEach((id) => {
    $(id).addEventListener('click', onGridClick);
    $(id).addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.classList.contains('note-card')) openForm(notes.find((x) => x.id === Number(e.target.dataset.id))); });
  });
  $('notePills').addEventListener('click', (e) => {
    const p = e.target.closest('[data-s]');
    if (p) { subject = p.dataset.s; render(); }
  });
  $('noteSearch').addEventListener('input', render);

  /* ---------- Modal ---------- */
  function openForm(n) {
    form.reset();
    form.elements.id.value = n ? n.id : '';
    $('noteModalTitle').textContent = n ? 'Edit Note' : 'New Note';
    form.querySelector('[data-delete]').style.display = n ? '' : 'none';
    if (n) ['title', 'subject', 'content'].forEach((k) => (form.elements[k].value = n[k] || ''));
    UI.openModal('noteModal');
  }
  $('addNoteBtn').addEventListener('click', () => openForm(null));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (!f.title.trim()) return UI.toast('error', 'Please give your note a title');
    const code = (f.subject || 'General').trim() || 'General';
    const payload = { title: f.title, subject: code.toUpperCase() === 'GENERAL' ? 'General' : code.toUpperCase(), content: f.content };
    if (!f.id) payload.icon = iconFor(code);
    const saved = await UI.run(() => (f.id ? api.put(`/notes/${f.id}`, payload) : api.post('/notes', payload)));
    if (!saved) return;
    UI.closeModal('noteModal');
    UI.toast('success', f.id ? 'Note updated' : 'Note saved');
    load();
  });

  form.querySelector('[data-delete]').addEventListener('click', async () => {
    const id = form.elements.id.value;
    if (id && confirm('Delete this note?') && (await UI.run(() => api.del(`/notes/${id}`)))) {
      UI.closeModal('noteModal'); UI.toast('info', 'Note deleted'); load();
    }
  });

  // ?q=search (from the top bar search) and ?new=1 (from the dashboard)
  const params = new URLSearchParams(location.search);
  if (params.get('q')) $('noteSearch').value = params.get('q');
  load().then(() => { if (params.get('new')) openForm(null); });
})();
