/**
 * theme.js - Dark / Light mode.
 * Loaded in <head> so the saved theme is applied BEFORE the page paints (no flash).
 */
(function () {
  const KEY = 'ss-theme';

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme); // keeps Bootstrap components in sync
  }

  window.Theme = {
    get: () => localStorage.getItem(KEY) || 'dark',
    set(theme) {
      localStorage.setItem(KEY, theme);
      apply(theme);
      window.dispatchEvent(new CustomEvent('themechange', { detail: theme })); // charts listen to this
    },
    toggle() {
      this.set(this.get() === 'dark' ? 'light' : 'dark');
    },
  };

  apply(Theme.get());
})();
