/* Registered after app.js: each hash navigation renders first, then resets this
   small homepage-only enhancement. The unenhanced page remains fully usable. */
(() => {
  'use strict';
  let dispose = () => {};
  function mount() {
    dispose();
    const home = document.querySelector('.home-experience');
    if (!home) { dispose = () => {}; return; }
    const signalController = new AbortController(), {signal} = signalController;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const touch = matchMedia('(hover: none), (pointer: coarse), (max-width: 650px)');
    const ribbon = home.querySelector('[data-shape-ribbon]');
    const track = ribbon.querySelector('.home-shape-window');
    const button = ribbon.querySelector('.shape-motion-toggle');
    let paused = false, keyboard = false, revealObserver, visibilityObserver;
    const originals = [...ribbon.querySelectorAll('.home-shape-set:not([aria-hidden]) .home-shape')];
    function update() {
      const still = reduced.matches || touch.matches || keyboard;
      ribbon.classList.toggle('is-static', still);
      ribbon.classList.toggle('is-paused', paused);
      ribbon.classList.toggle('is-background', document.hidden);
      button.hidden = reduced.matches || touch.matches;
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? 'Resume shape motion' : 'Pause shape motion');
      button.setAttribute('title', paused ? 'Resume shape motion' : 'Pause shape motion');
      button.innerHTML = paused ? '<span aria-hidden="true">▷</span>' : '<span aria-hidden="true">Ⅱ</span>';
    }
    function resetReveals() {
      revealObserver?.disconnect();
      const sections = [...home.querySelectorAll('[data-home-reveal]')];
      home.classList.remove('home-reveal-ready');
      sections.forEach(section => section.classList.remove('is-pending'));
      if (reduced.matches || typeof IntersectionObserver === 'undefined') return;
      revealObserver = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          entry.target.classList.remove('is-pending');
          revealObserver.unobserve(entry.target);
        }
      }, {threshold: .05, rootMargin: '0px 0px -20px 0px'});
      sections.forEach(section => {
        if (section.getBoundingClientRect().top > innerHeight * .9) {
          section.classList.add('is-pending');
          revealObserver.observe(section);
        }
      });
      home.classList.add('home-reveal-ready');
    }
    ribbon.classList.add('home-motion-ready');
    update(); resetReveals();
    if (typeof IntersectionObserver !== 'undefined') {
      visibilityObserver = new IntersectionObserver(entries => {
        ribbon.classList.toggle('is-outside', !entries[0].isIntersecting);
      });
      visibilityObserver.observe(ribbon);
    }
    button.addEventListener('click', () => { paused = !paused; update(); }, {signal});
    ribbon.addEventListener('focusin', event => {
      if (!originals.includes(event.target)) return;
      keyboard = true; update();
      event.target.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'instant'});
    }, {signal});
    ribbon.addEventListener('focusout', event => {
      if (ribbon.contains(event.relatedTarget)) return;
      keyboard = false; track.scrollLeft = 0; update();
    }, {signal});
    document.addEventListener('visibilitychange', update, {signal});
    reduced.addEventListener('change', () => { update(); resetReveals(); }, {signal});
    touch.addEventListener('change', update, {signal});
    dispose = () => {
      signalController.abort(); revealObserver?.disconnect(); visibilityObserver?.disconnect();
      home.classList.remove('home-reveal-ready');
      home.querySelectorAll('.is-pending').forEach(section => section.classList.remove('is-pending'));
      ribbon.classList.remove('home-motion-ready', 'is-static', 'is-paused', 'is-background', 'is-outside');
    };
  }
  window.addEventListener('hashchange', mount);
  window.addEventListener('pagehide', () => dispose());
  window.addEventListener('pageshow', event => { if (event.persisted) mount(); });
  mount();
})();
