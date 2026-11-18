/**
 * timetable.js - weekly planner with drag & drop (GET/POST/PUT/DELETE /api/timetable)
 */
(function () {
  const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

  let classes = [];
  let dragId = null;
  const form = $('classModalForm');

  async function load() {
    classes = (await UI.run(() => api.get('/timetable'))) || [];
    render();
  }

  /* ---------- Grid ---------- */
  function render() {
    // Dates of this week (Mon..Sun)
    const monday = new Date();
    monday.setDate(monday.getDate() - todayIdx);

    let html = '<div class="week-header" role="columnheader"></div>';
    DAYS.forEach((d, i) => {
      const date = new Date(monday); date.setDate(monday.getDate() + i);
      html += `<div class="week-header ${i === todayIdx ? 'today' : ''}" role="columnheader">${d}<br><span style="font-size:.85rem;font-weight:400">${date.getDate()}</span></div>`;
    });

    HOURS.forEach((h) => {
      html += `<div class="time-slot">${UI.hourLabel(h).replace(':00', '')}</div>`;
      DAYS.forEach((_, day) => {
        const c = classes.find((x) => x.day === day && x.start === h);
        const color = c ? subjectColor(c.code) : '';
        html += `<div class="tt-cell" data-day="${day}" data-hour="${h}" role="gridcell">` + (c ? `
          <div class="class-block cb-${color}" draggable="true" data-id="${c.id}" tabindex="0" role="button"
               aria-label="${UI.esc(c.subject)}, ${UI.esc(c.room)}. Press Enter to edit.">
            <div class="class-name">${UI.esc(c.subject)}</div>
            <div class="class-room">${UI.esc(c.code)} · ${UI.esc(c.room)}</div>
          </div>` : '') + '</div>';
      });
    });
    $('weekGrid').innerHTML = html;

    // Legend of subjects in use
    const seen = new Map(classes.map((c) => [c.code, c.subject]));
    $('legend').innerHTML = [...seen].map(([code, name]) => `<span><i style="background:${COLOR_HEX[subjectColor(code)]}"></i>${UI.esc(code)} ${UI.esc(name)}</span>`).join('');
    renderReminders();
  }

  /* ---------- Reminder cards (today's classes) ---------- */
  function renderReminders() {
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const today = classes.filter((c) => c.day === todayIdx).sort((a, b) => a.start - b.start);
    if (!today.length) { $('reminders').innerHTML = '<div class="empty-state" style="padding:20px">No classes today 🎉</div>'; return; }
    $('reminders').innerHTML = today.map((c) => {
      const diff = c.start * 60 - mins;
      const when = mins >= c.start * 60 + 60 ? 'Finished' : diff <= 0 ? 'In progress now' : diff < 60 ? `Starts in ${diff} min` : `Starts in ${Math.floor(diff / 60)}h ${diff % 60}m`;
      return `<div class="reminder-card glass-card" style="border-left-color:${COLOR_HEX[subjectColor(c.code)]}">
        <i class="ri-alarm-line" style="font-size:1.4rem;color:${COLOR_HEX[subjectColor(c.code)]}"></i>
        <div><div class="rt">${UI.esc(c.subject)}</div><small>${UI.hourLabel(c.start)} · ${UI.esc(c.room)}</small><br><small style="color:var(--primary-light)">${when}</small></div>
      </div>`;
    }).join('');
  }
  setInterval(renderReminders, 60000); // keep "starts in…" fresh

  /* ---------- Drag & drop ---------- */
  const grid = $('weekGrid');
  grid.addEventListener('dragstart', (e) => {
    const b = e.target.closest('.class-block');
    if (!b) return;
    dragId = Number(b.dataset.id);
    b.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(dragId));
  });
  grid.addEventListener('dragend', () => {
    dragId = null;
    grid.querySelectorAll('.dragging,.over').forEach((x) => x.classList.remove('dragging', 'over'));
  });
  grid.addEventListener('dragover', (e) => {
    const cell = e.target.closest('.tt-cell');
    if (!cell || dragId === null) return;
    e.preventDefault();
    grid.querySelectorAll('.over').forEach((x) => x !== cell && x.classList.remove('over'));
    cell.classList.add('over');
  });
  grid.addEventListener('drop', async (e) => {
    const cell = e.target.closest('.tt-cell');
    if (!cell || dragId === null) return;
    e.preventDefault();
    const day = Number(cell.dataset.day), start = Number(cell.dataset.hour);
    const moving = classes.find((c) => c.id === dragId);
    if (classes.some((c) => c.id !== dragId && c.day === day && c.start === start)) {
      UI.toast('error', 'That slot already has a class');
    } else if (moving && (moving.day !== day || moving.start !== start)) {
      const saved = await UI.run(() => api.put(`/timetable/${dragId}`, { day, start }));
      if (saved) { Object.assign(moving, saved); UI.toast('success', `Moved to ${DAYS[day]} ${UI.hourLabel(start)}`); }
    }
    dragId = null;
    render();
  });

  /* ---------- Click / keyboard: add or edit ---------- */
  grid.addEventListener('click', (e) => {
    const block = e.target.closest('.class-block');
    if (block) return openForm(classes.find((c) => c.id === Number(block.dataset.id)));
    const cell = e.target.closest('.tt-cell');
    if (cell) openForm(null, Number(cell.dataset.day), Number(cell.dataset.hour));
  });
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('class-block')) e.target.click();
  });

  function openForm(c, day = todayIdx, start = 9) {
    form.reset();
    form.elements.id.value = c ? c.id : '';
    $('classModalTitle').textContent = c ? 'Edit Class' : 'Add Class';
    form.querySelector('[data-delete]').style.display = c ? '' : 'none';
    form.elements.code.value = c ? c.code : '';
    form.elements.subject.value = c ? c.subject : '';
    form.elements.room.value = c ? c.room : '';
    form.elements.day.value = c ? c.day : day;
    form.elements.start.value = c ? c.start : start;
    UI.openModal('classModal');
  }
  $('addClassBtn').addEventListener('click', () => openForm(null));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (!f.code.trim() || !f.subject.trim()) return UI.toast('error', 'Course code and subject are required');
    const payload = { code: f.code.toUpperCase(), subject: f.subject, room: f.room, day: Number(f.day), start: Number(f.start) };
    if (classes.some((c) => String(c.id) !== f.id && c.day === payload.day && c.start === payload.start)) {
      return UI.toast('error', 'That slot already has a class');
    }
    const saved = await UI.run(() => (f.id ? api.put(`/timetable/${f.id}`, payload) : api.post('/timetable', payload)));
    if (!saved) return;
    UI.closeModal('classModal');
    UI.toast('success', f.id ? 'Class updated' : 'Class added');
    load();
  });

  form.querySelector('[data-delete]').addEventListener('click', async () => {
    const id = form.elements.id.value;
    if (!id || !confirm('Remove this class from your timetable?')) return;
    if (await UI.run(() => api.del(`/timetable/${id}`))) {
      UI.closeModal('classModal');
      UI.toast('info', 'Class removed');
      load();
    }
  });

  load();
})();
