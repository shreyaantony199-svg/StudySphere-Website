/**
 * landing.js - behaviour for the public landing page:
 * theme switcher, scroll-reveal animation, footer year.
 */
(function () {
  // Theme switcher
  const btn = document.getElementById('themeBtn');
  const paint = () => { btn.innerHTML = `<i class="ri-${Theme.get() === 'dark' ? 'sun' : 'moon'}-line"></i>`; };
  paint();
  btn.addEventListener('click', () => { Theme.toggle(); paint(); });

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Fade-in on scroll (cards with class "reveal")
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    items.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });
  } else {
    items.forEach((el) => el.classList.add('visible'));
  }
})();
