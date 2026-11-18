/**
 * achievements.js - badges, level and streak calendar (GET /api/achievements)
 */
(async function () {
  const d = await UI.run(() => api.get('/achievements'));
  if (!d) return;

  /* ---- Level / XP ---- */
  const left = 100 - d.level.intoLevel;
  $('levelCard').innerHTML = `
    <div class="level-badge"><small>LEVEL</small><b>${d.level.level}</b></div>
    <div style="flex:1;min-width:220px">
      <h3 style="font-size:1.1rem">${d.level.xp} XP earned</h3>
      <p style="font-size:.84rem;margin-bottom:10px">${left} XP to reach Level ${d.level.level + 1}. Complete tasks, focus sessions and notes to earn XP.</p>
      <div class="progress-track" style="height:10px"><div class="progress-fill" style="width:0" id="xpFill"></div></div>
    </div>`;
  setTimeout(() => ($('xpFill').style.width = d.level.pct + '%'), 150);

  /* ---- Streak ---- */
  $('streakTitle').textContent = `🔥 Study streak: ${d.streak} day${d.streak === 1 ? '' : 's'}`;
  $('streakBig').textContent = `${d.streak} 🔥`;
  $('streakBar').innerHTML = d.days.map((day, i) => {
    const dt = new Date(day.date + 'T00:00:00');
    const cls = day.hours <= 0 ? 'miss' : day.hours < 2 ? 'partial' : 'done';
    return `<div class="streak-day ${cls} ${i === d.days.length - 1 ? 'today' : ''}" title="${dt.toDateString()} · ${day.hours}h studied">${dt.toLocaleDateString('en-US', { weekday: 'narrow' })}</div>`;
  }).join('');

  /* ---- Badges ---- */
  const colors = ['ab-blue', 'ab-gold', 'ab-green', 'ab-red'];
  $('badgeGrid').innerHTML = d.badges.map((b, i) => `
    <article class="achievement-card glass-card ${b.unlocked ? '' : 'is-locked'}">
      <div class="achievement-badge ${b.unlocked ? 'unlocked ' + colors[i % colors.length] : 'locked'}" aria-hidden="true">${b.icon}</div>
      <div class="achievement-name">${UI.esc(b.name)}</div>
      <div class="achievement-desc">${UI.esc(b.description)}</div>
      <div style="margin-top:10px">
        ${b.unlocked
          ? '<span class="badge-green">Unlocked ✓</span>'
          : `<div class="progress-track"><div class="progress-fill" style="width:${b.progress}%"></div></div><div style="font-size:.72rem;color:var(--text-muted);margin-top:4px">${b.current} / ${b.target}</div>`}
      </div>
    </article>`).join('');
})();
