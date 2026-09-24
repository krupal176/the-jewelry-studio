/* A progressive enhancement for the native category rail. Images follow vertical
   scrolling gently; cards enter once, with no timer or automatic rail movement. */
(() => {
  'use strict';
  let dispose = () => {};

  function mount() {
    dispose();
    const section = document.querySelector('.home-categories');
    if (!section) { dispose = () => {}; return; }
    const cards = [...section.querySelectorAll('[data-category-reveal]')];
    const rail = section.querySelector('.home-category-rail');
    if (!cards.length) { dispose = () => {}; return; }
    const controller = new AbortController(), {signal} = controller;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const revealed = new Set();
    let disposed = false, enabled = false, visible = false, frame = 0;
    let revealObserver, visibilityObserver;

    function inView(rect) {
      return rect.bottom > 0 && rect.top < innerHeight &&
        rect.right > 0 && rect.left < innerWidth;
    }
    function cancelFrame() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
    function reveal(card) {
      card.classList.remove('is-category-pending');
      revealed.add(card);
      revealObserver?.unobserve(card);
    }
    function draw() {
      frame = 0;
      if (disposed || !enabled || !visible || document.hidden) return;
      const amplitude = fine.matches ? 5 : 8;
      // Read every card before writing styles, avoiding repeated layout work.
      const positions = cards.map(card => [card, card.getBoundingClientRect()]);
      for (const [card, rect] of positions) {
        if (!inView(rect)) continue;
        const progress = (innerHeight / 2 - (rect.top + rect.height / 2)) /
          Math.max(1, (innerHeight + rect.height) / 2);
        const shift = Math.max(-amplitude, Math.min(amplitude, progress * amplitude));
        card.style.setProperty('--category-shift', shift.toFixed(2) + 'px');
      }
    }
    function schedule() {
      if (!frame && !disposed && enabled && visible && !document.hidden) {
        frame = requestAnimationFrame(draw);
      }
    }
    function clearMotion() {
      cancelFrame();
      revealObserver?.disconnect();
      visibilityObserver?.disconnect();
      section.classList.remove('category-motion-ready');
      cards.forEach(card => {
        card.classList.remove('is-category-pending');
        card.style.removeProperty('--category-shift');
      });
    }
    function configure() {
      clearMotion();
      enabled = !reduced.matches && typeof IntersectionObserver !== 'undefined';
      if (!enabled) {
        cards.forEach(card => revealed.add(card));
        return;
      }
      visible = inView(section.getBoundingClientRect());
      revealObserver = new IntersectionObserver(entries => {
        if (disposed || !enabled) return;
        for (const entry of entries) if (entry.isIntersecting) reveal(entry.target);
      }, {threshold: .08});
      visibilityObserver = new IntersectionObserver(entries => {
        if (disposed || !enabled) return;
        visible = entries.some(entry => entry.target === section && entry.isIntersecting);
        if (visible) schedule(); else cancelFrame();
      });
      for (const card of cards) {
        if (revealed.has(card) || inView(card.getBoundingClientRect()) ||
          card.contains(document.activeElement)) {
          reveal(card);
        } else {
          card.classList.add('is-category-pending');
          revealObserver.observe(card);
        }
      }
      section.classList.add('category-motion-ready');
      visibilityObserver.observe(section);
      schedule();
    }

    window.addEventListener('scroll', schedule, {passive: true, signal});
    window.addEventListener('resize', schedule, {passive: true, signal});
    rail?.addEventListener('scroll', schedule, {passive: true, signal});
    section.addEventListener('focusin', event => {
      const card = event.target.closest('[data-category-reveal]');
      if (cards.includes(card)) reveal(card);
    }, {signal});
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelFrame(); else schedule();
    }, {signal});
    reduced.addEventListener('change', configure, {signal});
    fine.addEventListener('change', schedule, {signal});
    configure();
    dispose = () => {
      disposed = true;
      enabled = false;
      controller.abort();
      clearMotion();
    };
  }

  // app.js renders synchronously before these navigation handlers run.
  window.addEventListener('hashchange', mount);
  window.addEventListener('pagehide', () => dispose());
  window.addEventListener('pageshow', event => { if (event.persisted) mount(); });
  mount();
})();
