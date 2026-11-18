/**
 * dashboard.js - fills the dashboard from GET /api/dashboard
 */
(async function () {
  const user = Auth.user;
  const now = new Date();

  // Personalised greeting + date
  const hour = now.getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  $('greeting').textContent = `👋 ${greet}, ${user.name.split(' ')[0]}!`;
  $('todayDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const d = await UI.run(() => UI.dashboard());
  if (!d) return;

  /* ---- Stat cards (animated numbers) ---- */
  UI.countUp($('statScore'), d.score);
  UI.countUp($('statHours'), d.studyHoursToday, { suffix: 'h', decimals: 1 });
  UI.countUp($('statDue'), d.dueThisWeek);
  UI.countUp($('statStreak'), d.streak);
  $('statOpen').textContent = `${d.openTaskCount} open tasks`;

  /* ---- Success score ring + breakdown ---- */
  $('scoreNum').textContent = d.score;
  $('scoreNum').style.cssText = 'background:var(--grad-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text';
  setTimeout(() => { $('scoreRing').style.strokeDashoffset = 283 * (1 - d.score / 100); }, 150);

  const bars = [['Assignments', d.breakdown.assignments, '#6C63FF'], ['Exam preparation', d.breakdown.examPrep, '#00D9FF'], ['Task completion', d.breakdown.tasks, '#FF6B9D']];
  $('scoreBars').innerHTML = bars.map(([label, pct, color]) => `
    <div style="margin-bottom:10px">
      <div class="d-flex justify-content-between" style="font-size:.78rem;margin-bottom:4px"><span>${label}</span><span>${pct}%</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:0;background:${color}" data-w="${pct}"></div></div>
    </div>`).join('');
  setTimeout(() => document.querySelectorAll('#scoreBars .progress-fill').forEach((b) => (b.style.width = b.dataset.w + '%')), 150);

  /* ---- Upcoming deadlines ---- */
  $('deadlineList').innerHTML = d.upcoming.length
    ? d.upcoming.map((a) => `
      <a class="deadline-item" href="assignments.html">
        <div class="deadline-dot" style="background:${UI.dueColor(a.due)}"></div>
        <div class="deadline-info"><div class="deadline-title">${UI.esc(a.title)}</div><div class="deadline-sub">${UI.esc(a.subject)} · ${a.progress}% done</div></div>
        <div class="deadline-due" style="color:${UI.dueColor(a.due)}">${UI.dueLabel(a.due).replace('Due ', '')}</div>
      </a>`).join('')
    : '<div class="empty-state">No pending deadlines 🎉</div>';

  /* ---- Today's timetable ---- */
  const colors = (c) => COLOR_HEX[subjectColor(c)];
  $('scheduleList').innerHTML = d.schedule.length
    ? d.schedule.map((s) => {
        const live = hour >= s.start && hour < s.start + 1;
        return `
        <div class="schedule-item" style="border-color:${colors(s.code)}">
          <div class="schedule-time">${UI.hourLabel(s.start)}</div>
          <div><div class="schedule-name">${UI.esc(s.subject)}</div><div class="schedule-room">${UI.esc(s.room)} · ${UI.esc(s.code)}</div></div>
          ${live ? '<span class="badge-primary ms-auto">Now</span>' : ''}
        </div>`;
      }).join('')
    : '<div class="empty-state">No classes today 🎉</div>';

  /* ---- Open tasks ---- */
  $('taskList').innerHTML = d.openTasks.length
    ? d.openTasks.map((t) => `
      <a class="deadline-item" href="todos.html">
        <div class="deadline-dot" style="background:${t.priority === 'high' ? '#FF5252' : t.priority === 'medium' ? '#FFD700' : '#00E676'}"></div>
        <div class="deadline-info"><div class="deadline-title">${UI.esc(t.title)}</div><div class="deadline-sub">${UI.esc(t.category)} · ${t.progress}% done</div></div>
        <div class="deadline-due" style="color:${t.due ? UI.dueColor(t.due) : 'var(--text-muted)'}">${t.due ? UI.dueLabel(t.due).replace('Due ', '') : '-'}</div>
      </a>`).join('')
    : '<div class="empty-state">All tasks done 🎉</div>';

  /* ---- Quote ---- */
  $('quoteText').textContent = `"${d.quote.text}"`;
  $('quoteAuthor').textContent = '- ' + d.quote.author;
})();
