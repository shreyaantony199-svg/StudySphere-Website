/**
 * analytics.js - Chart.js dashboards (GET /api/analytics)
 * Charts are re-drawn when the user switches between dark and light mode.
 */
(function () {
  let data = null;
  const charts = [];
  const cssVar = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  async function init() {
    data = await UI.run(() => api.get('/analytics'));
    if (!data) return;

    // Summary numbers
    UI.countUp($('aHours'), data.totals.hoursLast30, { suffix: 'h', decimals: 0 });
    UI.countUp($('aTasks'), data.totals.tasksCompleted);
    UI.countUp($('aScore'), data.totals.averageScore, { suffix: '%' });
    UI.countUp($('aPomo'), data.totals.pomodoros);

    // Subject-wise performance rows
    $('subjectRows').innerHTML = data.subjects.map((s) => {
      const color = COLOR_HEX[subjectColor(s.code)];
      const diff = s.score - s.target;
      return `
      <div class="subject-row">
        <div class="top"><span><strong>${UI.esc(s.name)}</strong> <small style="color:var(--text-muted)">${UI.esc(s.code)}</small></span>
          <span>${s.score}% <small style="color:${diff >= 0 ? '#00E676' : '#FF6B9D'}">${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff)} vs target ${s.target}%</small></span></div>
        <div style="position:relative"><div class="progress-track" style="height:8px"><div class="progress-fill" style="width:${s.score}%;background:${color}"></div></div>
          <span class="target" style="left:${s.target}%" title="Target ${s.target}%"></span></div>
      </div>`;
    }).join('');

    draw();
  }

  function draw() {
    charts.splice(0).forEach((c) => c.destroy());
    const text = cssVar('--text-secondary');
    const grid = Theme.get() === 'dark' ? 'rgba(255,255,255,.07)' : 'rgba(13,15,30,.09)';
    Chart.defaults.color = text;
    Chart.defaults.font.family = "'DM Sans', sans-serif";
    const axes = { x: { grid: { color: grid } }, y: { grid: { color: grid }, beginAtZero: true } };
    const base = { responsive: true, maintainAspectRatio: false };

    // 1. Weekly productivity (bar)
    charts.push(new Chart($('weeklyChart'), {
      type: 'bar',
      data: {
        labels: data.weekly.labels,
        datasets: [
          { label: 'Study hours', data: data.weekly.studyHours, backgroundColor: 'rgba(108,99,255,.7)', borderColor: '#6C63FF', borderWidth: 2, borderRadius: 8, borderSkipped: false },
          { label: 'Tasks done', data: data.weekly.tasksDone, backgroundColor: 'rgba(0,217,255,.5)', borderColor: '#00D9FF', borderWidth: 2, borderRadius: 8, borderSkipped: false },
        ],
      },
      options: { ...base, plugins: { legend: { position: 'top' } }, scales: axes },
    }));

    // 2. Assignment completion (doughnut)
    charts.push(new Chart($('assignmentChart'), {
      type: 'doughnut',
      data: {
        labels: Object.keys(data.status),
        datasets: [{ data: Object.values(data.status), backgroundColor: ['#00E676', '#6C63FF', '#FFD700', '#FF5252'], borderWidth: 0, hoverOffset: 8 }],
      },
      options: { ...base, cutout: '68%', plugins: { legend: { position: 'bottom' } } },
    }));

    // 3. Study hours trend (line)
    charts.push(new Chart($('studyHoursChart'), {
      type: 'line',
      data: {
        labels: data.weeks.labels,
        datasets: [{ label: 'Hours per week', data: data.weeks.hours, borderColor: '#6C63FF', backgroundColor: 'rgba(108,99,255,.15)', borderWidth: 3, tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: '#6C63FF', pointBorderColor: '#fff', pointBorderWidth: 2 }],
      },
      options: { ...base, plugins: { legend: { position: 'top' } }, scales: axes },
    }));

    // 4. Subject performance (radar)
    charts.push(new Chart($('subjectChart'), {
      type: 'radar',
      data: {
        labels: data.subjects.map((s) => s.code),
        datasets: [
          { label: 'Score', data: data.subjects.map((s) => s.score), backgroundColor: 'rgba(108,99,255,.25)', borderColor: '#6C63FF', borderWidth: 2, pointBackgroundColor: '#6C63FF' },
          { label: 'Target', data: data.subjects.map((s) => s.target), backgroundColor: 'rgba(0,217,255,.08)', borderColor: '#00D9FF', borderWidth: 2, borderDash: [5, 5], pointBackgroundColor: '#00D9FF' },
        ],
      },
      options: { ...base, plugins: { legend: { position: 'bottom' } },
        scales: { r: { suggestedMin: 40, suggestedMax: 100, grid: { color: grid }, angleLines: { color: grid }, pointLabels: { color: text }, ticks: { backdropColor: 'transparent', color: text } } } },
    }));
  }

  window.addEventListener('themechange', () => data && draw());
  init();
})();
