/**
 * layout.js - builds the app shell shared by every dashboard page:
 *   collapsible sidebar + top bar (search, theme switcher,
 *   notifications, profile dropdown) and wraps the page content.
 *
 * Each page only contains its own content inside <main id="page-content">.
 * This file adds everything around it, so navigation lives in ONE place.
 */
(function () {
  const user = Auth.requireUser();
  if (!user) return;

  const pageId = document.body.dataset.page;

  const NAV = [
    { section: 'Main' },
    { id: 'dashboard', href: 'dashboard.html', icon: 'ri-dashboard-3-line', label: 'Dashboard' },
    { id: 'todos', href: 'todos.html', icon: 'ri-checkbox-multiple-line', label: 'To-Do Manager' },
    { id: 'timetable', href: 'timetable.html', icon: 'ri-calendar-schedule-line', label: 'Timetable' },
    { id: 'assignments', href: 'assignments.html', icon: 'ri-file-text-line', label: 'Assignments' },
    { section: 'Study' },
    { id: 'exams', href: 'exams.html', icon: 'ri-timer-2-line', label: 'Exam Countdown' },
    { id: 'notes', href: 'notes.html', icon: 'ri-sticky-note-2-line', label: 'Notes Vault' },
    { id: 'focus', href: 'focus.html', icon: 'ri-focus-3-line', label: 'Focus Mode' },
    { section: 'Insights' },
    { id: 'achievements', href: 'achievements.html', icon: 'ri-trophy-line', label: 'Achievements' },
    { id: 'analytics', href: 'analytics.html', icon: 'ri-bar-chart-2-line', label: 'Analytics' },
  ];

  const navHtml = NAV.map((n) =>
    n.section
      ? `<div class="nav-section-label">${n.section}</div>`
      : `<a class="nav-item ${n.id === pageId ? 'active' : ''}" href="${n.href}" ${n.id === pageId ? 'aria-current="page"' : ''}>
           <i class="${n.icon}" aria-hidden="true"></i><span>${n.label}</span>
         </a>`
  ).join('');

  const shell = document.createElement('div');
  shell.className = 'app-wrapper';
  shell.innerHTML = `
    <aside class="sidebar" id="sidebar" aria-label="Main navigation">
      <div class="sidebar-header">
        <a class="sidebar-logo" href="dashboard.html" aria-label="StudySphere home">
          <div class="sidebar-logo-icon">🎓</div><span class="sidebar-logo-text">StudySphere</span>
        </a>
        <button class="sidebar-toggle" id="sidebarToggle" aria-label="Collapse sidebar" aria-expanded="true">
          <i class="ri-arrow-left-s-line"></i>
        </button>
      </div>
      <div class="sidebar-user">
        <div class="user-avatar">${UI.initials(user.name)}</div>
        <div class="user-info">
          <div class="user-name">${UI.esc(user.name)}</div>
          <div class="user-role">${UI.esc(user.course || 'Student')}</div>
        </div>
      </div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-bottom">
        <a class="nav-item" href="index.html"><i class="ri-home-4-line" aria-hidden="true"></i><span>Home page</span></a>
        <button class="nav-item" id="logoutBtn"><i class="ri-logout-box-line" aria-hidden="true"></i><span>Log out</span></button>
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <div class="main-content" id="mainContent">
      <header class="topbar">
        <button id="mobileMenuBtn" aria-label="Open navigation menu"><i class="ri-menu-line"></i></button>

        <form class="topbar-search" id="globalSearch" role="search">
          <i class="ri-search-line" aria-hidden="true"></i>
          <input type="search" id="globalSearchInput" placeholder="Search your notes…" aria-label="Search notes" />
        </form>

        <div class="topbar-actions">
          <!-- Theme switcher -->
          <button class="btn-icon" id="themeBtn" aria-label="Switch between dark and light mode" title="Toggle theme"></button>

          <!-- Notifications (Bootstrap dropdown) -->
          <div class="dropdown">
            <button class="btn-icon notification-dot" id="notifBtn" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Notifications">
              <i class="ri-notification-3-line"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end ss-menu" id="notifMenu">
              <h6 class="dropdown-header">Notifications</h6>
              <div id="notifList"><div class="notif-item">Loading…</div></div>
            </div>
          </div>

          <a class="btn-icon" href="todos.html?new=1" aria-label="Quick add task" title="Quick add task"><i class="ri-add-line"></i></a>

          <!-- Profile dropdown -->
          <div class="dropdown">
            <button class="topbar-avatar" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Open profile menu">${UI.initials(user.name)}</button>
            <div class="dropdown-menu dropdown-menu-end ss-menu">
              <h6 class="dropdown-header">
                <strong style="color:var(--text)">${UI.esc(user.name)}</strong><br>
                <small>${UI.esc(user.email)}</small>
              </h6>
              <a class="dropdown-item" href="achievements.html"><i class="ri-trophy-line"></i> My achievements</a>
              <a class="dropdown-item" href="analytics.html"><i class="ri-bar-chart-2-line"></i> My analytics</a>
              <hr class="dropdown-divider">
              <button class="dropdown-item" id="logoutBtn2"><i class="ri-logout-box-line"></i> Log out</button>
            </div>
          </div>
        </div>
      </header>
      <div class="page-content" id="slot"></div>
    </div>`;

  // Decorative background glows + the shell, then move this page's content inside it
  document.body.insertAdjacentHTML('afterbegin', '<div class="orb orb-1"></div><div class="orb orb-2"></div>');
  document.body.insertBefore(shell, document.getElementById('page-content'));
  document.getElementById('slot').appendChild(document.getElementById('page-content'));

  /* ---------- Sidebar collapse (remembered) ---------- */
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainContent');
  const toggle = document.getElementById('sidebarToggle');
  function setCollapsed(c) {
    sidebar.classList.toggle('collapsed', c);
    main.classList.toggle('expanded', c);
    toggle.innerHTML = `<i class="ri-arrow-${c ? 'right' : 'left'}-s-line"></i>`;
    toggle.setAttribute('aria-expanded', String(!c));
    localStorage.setItem('ss-sidebar', c ? '1' : '0');
  }
  setCollapsed(localStorage.getItem('ss-sidebar') === '1');
  toggle.addEventListener('click', () => setCollapsed(!sidebar.classList.contains('collapsed')));

  /* ---------- Mobile sidebar ---------- */
  const overlay = document.getElementById('sidebarOverlay');
  const closeMobile = () => { sidebar.classList.remove('mobile-open'); overlay.classList.remove('active'); };
  document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
  });
  overlay.addEventListener('click', closeMobile);
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMobile());

  /* ---------- Theme switcher ---------- */
  const themeBtn = document.getElementById('themeBtn');
  const paintThemeBtn = () => { themeBtn.innerHTML = `<i class="ri-${Theme.get() === 'dark' ? 'sun' : 'moon'}-line"></i>`; };
  paintThemeBtn();
  themeBtn.addEventListener('click', () => { Theme.toggle(); paintThemeBtn(); });

  /* ---------- Logout ---------- */
  async function logout() {
    try { await api.post('/auth/logout'); } catch (e) { /* ignore - we are leaving anyway */ }
    Auth.clear();
    location.href = 'login.html';
  }
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('logoutBtn2').addEventListener('click', logout);

  /* ---------- Global search -> Notes page ---------- */
  document.getElementById('globalSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('globalSearchInput').value.trim();
    location.href = 'notes.html' + (q ? '?q=' + encodeURIComponent(q) : '');
  });

  /* ---------- Notifications (built from upcoming deadlines) ---------- */
  document.getElementById('notifBtn').addEventListener('show.bs.dropdown', async () => {
    const list = document.getElementById('notifList');
    try {
      const d = await UI.dashboard();
      list.innerHTML = d.upcoming.length
        ? d.upcoming.map((a) => `
            <div class="notif-item">
              <i class="ri-alarm-warning-line" style="color:${UI.dueColor(a.due)}"></i>
              <div><strong>${UI.esc(a.title)}</strong><br><small>${UI.esc(a.subject)} · ${UI.dueLabel(a.due)}</small></div>
            </div>`).join('')
        : '<div class="notif-item">You are all caught up 🎉</div>';
    } catch (e) {
      list.innerHTML = `<div class="notif-item">${UI.esc(e.message)}</div>`;
    }
  });

  /* ---------- Smooth page transition when clicking sidebar links ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href$=".html"], a[href*=".html?"]');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey || a.target === '_blank') return;
    e.preventDefault();
    document.getElementById('page-content').classList.add('page-leaving');
    setTimeout(() => { location.href = a.getAttribute('href'); }, 180);
  });
})();
