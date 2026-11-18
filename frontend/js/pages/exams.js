/**
 * exams.js - Exam Countdown Center (GET/POST/PUT/DELETE /api/exams)
 * - Hero card: live ticking countdown to the next exam
 * - Cards: circular progress ring + preparation status
 */
(function () {
  const WINDOW_DAYS = 45; // the ring fills up during the last 45 days
  const CIRC = 314;       // circumference of the r=50 circle
  let exams = [];
  const form = $('examModalForm');

  async function load() {
    exams = (await UI.run(() => api.get('/exams'))) || [];
    render();
  }

  const prepStatus = (p) => (p >= 75 ? ['Well prepared', 'badge-green'] : p >= 50 ? ['On track', 'badge-accent'] : ['Needs focus', 'badge-red']);

  function render() {
    const sorted = [...exams].sort((a, b) => a.date.localeCompare(b.date));
    renderHero(sorted);
    $('examGrid').innerHTML = sorted.length ? sorted.map(card).join('') : '<div class="empty-state">No exams added yet</div>';
  }

  /* ---------- Hero countdown ---------- */
  let heroTarget = null;
  function renderHero(sorted) {
    const next = sorted.find((e) => UI.daysUntil(e.date) >= 0);
    if (!next) {
      heroTarget = null;
      $('examHero').innerHTML = '<h2 style="font-size:1.5rem">No upcoming exams 🎉</h2><p>Add an exam to start a countdown.</p>';
      return;
    }
    heroTarget = new Date(next.date + 'T09:00:00'); // exams assumed to start at 9 AM
    const [label, badge] = prepStatus(next.prep);
    $('examHero').innerHTML = `
      <div class="hero-eyebrow" style="margin:0 auto 14px;width:fit-content"><i class="ri-timer-flash-line"></i> Next exam</div>
      <h2 style="font-size:1.9rem">${UI.esc(next.subject)}</h2>
      <p>${UI.fmtDate(next.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${next.room ? ' · ' + UI.esc(next.room) : ''}</p>
      <div class="countdown-boxes" role="timer">
        <div class="cd-box"><div class="cd-num" id="cdD">0</div><div class="cd-lbl">Days</div></div>
        <div class="cd-box"><div class="cd-num" id="cdH">0</div><div class="cd-lbl">Hours</div></div>
        <div class="cd-box"><div class="cd-num" id="cdM">0</div><div class="cd-lbl">Minutes</div></div>
        <div class="cd-box"><div class="cd-num" id="cdS">0</div><div class="cd-lbl">Seconds</div></div>
      </div>
      <span class="${badge}">${label} · ${next.prep}% prepared</span>`;
    tick();
  }
  function tick() {
    if (!heroTarget || !$('cdD')) return;
    const diff = Math.max(0, heroTarget - Date.now());
    const s = Math.floor(diff / 1000);
    $('cdD').textContent = Math.floor(s / 86400);
    $('cdH').textContent = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
    $('cdM').textContent = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    $('cdS').textContent = String(s % 60).padStart(2, '0');
  }
  setInterval(tick, 1000);

  /* ---------- Exam cards ---------- */
  function card(e) {
    const days = UI.daysUntil(e.date);
    const color = COLOR_HEX[subjectColor(e.code || e.subject)];
    const pct = days < 0 ? 1 : Math.min(Math.max((WINDOW_DAYS - days) / WINDOW_DAYS, 0), 1);
    const [label, badge] = prepStatus(e.prep);
    return `
    <article class="exam-card glass-card" data-id="${e.id}">
      <div class="exam-icon">📚</div>
      <div class="exam-subject">${UI.esc(e.subject)}</div>
      <div class="exam-date">${UI.fmtDate(e.date, { weekday: 'short', day: 'numeric', month: 'short' })}${e.room ? ' · ' + UI.esc(e.room) : ''}</div>
      <div class="circular-progress" role="img" aria-label="${days < 0 ? 'Exam finished' : days + ' days left'}">
        <svg viewBox="0 0 110 110" width="120" height="120">
          <circle class="cp-track" cx="55" cy="55" r="50"/>
          <circle class="cp-fill" cx="55" cy="55" r="50" stroke="${color}" stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}" data-offset="${CIRC * (1 - pct)}"/>
        </svg>
        <div class="cp-label"><div class="cp-days" style="color:${color}">${days < 0 ? '✓' : days}</div><div class="cp-unit">${days < 0 ? 'finished' : days === 1 ? 'day left' : 'days left'}</div></div>
      </div>
      <div class="prep-bar">
        <div class="prep-label"><span>Preparation</span><span>${e.prep}%</span></div>
        <div class="progress-track"><div class="progress-fill" style="width:${e.prep}%;background:${color}"></div></div>
      </div>
      <div style="margin-top:12px"><span class="${badge}">${label}</span></div>
      <div class="exam-actions">
        <button class="btn-ghost" data-act="minus" aria-label="Decrease preparation by 10 percent">−10%</button>
        <button class="btn-ghost" data-act="plus" aria-label="Increase preparation by 10 percent">+10%</button>
        <button class="btn-icon" data-act="edit" aria-label="Edit exam" style="width:34px;height:34px"><i class="ri-edit-line"></i></button>
        <button class="btn-icon" data-act="delete" aria-label="Delete exam" style="width:34px;height:34px"><i class="ri-delete-bin-line"></i></button>
      </div>
    </article>`;
  }

  // Animate the rings after they are in the DOM
  new MutationObserver(() => {
    requestAnimationFrame(() => document.querySelectorAll('.cp-fill[data-offset]').forEach((c) => {
      c.style.strokeDashoffset = c.dataset.offset;
      c.removeAttribute('data-offset');
    }));
  }).observe($('examGrid'), { childList: true });

  $('examGrid').addEventListener('click', async (ev) => {
    const btn = ev.target.closest('[data-act]');
    if (!btn) return;
    const e = exams.find((x) => x.id === Number(btn.closest('.exam-card').dataset.id));
    if (btn.dataset.act === 'plus' || btn.dataset.act === 'minus') {
      const prep = Math.min(100, Math.max(0, e.prep + (btn.dataset.act === 'plus' ? 10 : -10)));
      const saved = await UI.run(() => api.put(`/exams/${e.id}`, { prep }));
      if (saved) { Object.assign(e, saved); render(); }
    }
    if (btn.dataset.act === 'edit') openForm(e);
    if (btn.dataset.act === 'delete' && confirm(`Delete the ${e.subject} exam?`)) {
      if (await UI.run(() => api.del(`/exams/${e.id}`))) { exams = exams.filter((x) => x.id !== e.id); UI.toast('info', 'Exam deleted'); render(); }
    }
  });

  /* ---------- Modal ---------- */
  const prep = form.elements.prep;
  prep.addEventListener('input', () => ($('examModal-prep-out').textContent = prep.value + '%'));
  function openForm(e) {
    form.reset();
    form.elements.id.value = e ? e.id : '';
    $('examModalTitle').textContent = e ? 'Edit Exam' : 'Add Exam';
    if (e) {
      ['subject', 'code', 'date', 'room'].forEach((k) => (form.elements[k].value = e[k] || ''));
      prep.value = e.prep;
    }
    prep.dispatchEvent(new Event('input'));
    UI.openModal('examModal');
  }
  $('addExamBtn').addEventListener('click', () => openForm(null));
  if (new URLSearchParams(location.search).get('new')) openForm(null);

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    if (!f.subject.trim() || !f.date) return UI.toast('error', 'Subject and exam date are required');
    const payload = { subject: f.subject, code: f.code.toUpperCase(), date: f.date, room: f.room, prep: Number(f.prep) };
    const saved = await UI.run(() => (f.id ? api.put(`/exams/${f.id}`, payload) : api.post('/exams', payload)));
    if (!saved) return;
    UI.closeModal('examModal');
    UI.toast('success', f.id ? 'Exam updated' : 'Exam added');
    load();
  });

  load();
})();
