/**
 * ui.js - small reusable UI helpers used by every page:
 *   toasts, modals, date helpers, subject colours, count-up numbers.
 */

/* ---------- Subject colours (matches the .cb-* / .tag-* classes) ---------- */
const SUBJECT_COLORS = { CS301: 'purple', CS401: 'purple', CHEM201: 'cyan', ENG401: 'pink', PHY201: 'green', MATH301: 'gold' };
const COLOR_HEX = { purple: '#6C63FF', cyan: '#00D9FF', pink: '#FF6B9D', green: '#00E676', gold: '#FFD700' };
const COLOR_KEYS = Object.keys(COLOR_HEX);
const TAG_CLASS = { purple: 'tag-cs', cyan: 'tag-chem', pink: 'tag-eng', green: 'tag-phy', gold: 'tag-math' };

/** Colour name for a subject code (unknown codes get a stable colour from a hash) */
function subjectColor(code = '') {
  const key = String(code).toUpperCase().replace(/\s/g, '');
  if (SUBJECT_COLORS[key]) return SUBJECT_COLORS[key];
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COLOR_KEYS[h % COLOR_KEYS.length];
}

const PRIORITY_BADGE = { high: 'badge-red', medium: 'badge-warm', low: 'badge-green' };

const UI = {
  /** Escape user text before putting it in innerHTML (prevents XSS) */
  esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },

  /* ---------- Toasts ---------- */
  toast(type, message, ms = 3500) {
    let box = document.querySelector('.ss-toast-container');
    if (!box) {
      box = document.createElement('div');
      box.className = 'ss-toast-container';
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    const icons = { success: 'ri-checkbox-circle-line', error: 'ri-error-warning-line', info: 'ri-information-line' };
    const el = document.createElement('div');
    el.className = `ss-toast ${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${UI.esc(message)}</span>`;
    box.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'all .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(30px)';
      setTimeout(() => el.remove(), 300);
    }, ms);
  },

  /* ---------- Modals ---------- */
  _lastFocus: null,
  openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    UI._lastFocus = document.activeElement;
    m.classList.add('open');
    setTimeout(() => m.querySelector('input:not([type=hidden]), textarea, select')?.focus(), 50);
  },
  closeModal(id) {
    const m = typeof id === 'string' ? document.getElementById(id) : id;
    if (!m) return;
    m.classList.remove('open');
    UI._lastFocus?.focus?.();
  },

  /** Run an async function; show a toast instead of crashing if it fails */
  async run(fn) {
    try { return await fn(); } catch (e) { UI.toast('error', e.message); return undefined; }
  },

  /* ---------- Dates ---------- */
  /** Whole days from today to a YYYY-MM-DD date (negative = overdue) */
  daysUntil(dateStr) {
    const t = new Date();
    const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    return Math.round((new Date(dateStr + 'T00:00:00') - today) / 86400000);
  },
  dueLabel(dateStr) {
    if (!dateStr) return 'No due date';
    const n = UI.daysUntil(dateStr);
    if (n < 0) return `${-n} day${n === -1 ? '' : 's'} overdue`;
    if (n === 0) return 'Due today';
    if (n === 1) return 'Due tomorrow';
    return `Due in ${n} days`;
  },
  /** Colour for urgency */
  dueColor(dateStr) {
    const n = UI.daysUntil(dateStr);
    return n <= 0 ? '#FF5252' : n === 1 ? '#FFD700' : n <= 4 ? '#6C63FF' : '#00D9FF';
  },
  fmtDate(dateStr, opts = { day: 'numeric', month: 'short' }) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', opts);
  },
  hourLabel(h) {
    return `${h % 12 === 0 ? 12 : h % 12}:00 ${h >= 12 ? 'PM' : 'AM'}`;
  },
  initials(name = '') {
    return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || 'S';
  },

  /* ---------- Animated number ---------- */
  countUp(el, target, { suffix = '', decimals = 0, duration = 900 } = {}) {
    if (!el) return;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  },

  /** Cached dashboard request - used by the layout (notifications) AND the dashboard page */
  _dash: null,
  dashboard() {
    if (!UI._dash) UI._dash = api.get('/dashboard');
    return UI._dash;
  },
};

/* ---------- Global modal behaviour (works for every modal on every page) ---------- */
document.addEventListener('click', (e) => {
  const overlay = e.target.closest('.modal-overlay');
  if (e.target.closest('[data-close]') && overlay) UI.closeModal(overlay);
  else if (e.target.classList?.contains('modal-overlay')) UI.closeModal(e.target); // click on dark backdrop
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach((m) => UI.closeModal(m));
});

const $ = (id) => document.getElementById(id);
