/**
 * auth.js - login & signup forms (talks to POST /api/auth/login | /signup).
 * On success the token is saved and the user goes to the dashboard.
 */
(function () {
  const isSignup = document.body.dataset.page === 'signup';
  const form = document.getElementById('authForm');
  const errorBox = document.getElementById('formError');
  const btn = document.getElementById('authBtn');
  const btnHtml = btn.innerHTML;

  // Show / hide password
  document.querySelectorAll('[data-toggle-pw]').forEach((t) => {
    t.addEventListener('click', () => {
      const input = t.parentElement.querySelector('input');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      t.innerHTML = `<i class="ri-eye${show ? '-off' : ''}-line"></i>`;
    });
  });

  // Social buttons are UI placeholders
  document.querySelectorAll('[data-social]').forEach((b) => {
    b.addEventListener('click', () => UI.toast('info', `${b.dataset.social} sign-in is a UI placeholder in this demo`));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.textContent = '';
    const data = Object.fromEntries(new FormData(form));

    // Simple client-side checks (the server validates again)
    if (isSignup && (data.name || '').trim().length < 2) return (errorBox.textContent = 'Please enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) return (errorBox.textContent = 'Please enter a valid email address.');
    if (!data.password || (isSignup && data.password.length < 6)) return (errorBox.textContent = 'Password must be at least 6 characters.');

    btn.disabled = true;
    btn.innerHTML = '<i class="ri-loader-4-line"></i> Please wait…';
    try {
      const res = await api.post(isSignup ? '/auth/signup' : '/auth/login', data);
      Auth.save(res.token, res.user);
      location.href = 'dashboard.html';
    } catch (err) {
      errorBox.textContent = err.message;
      btn.disabled = false;
      btn.innerHTML = btnHtml;
    }
  });
})();
