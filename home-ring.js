/* Landing enhancements: no catalog, builder or cart state. Motion is scroll-linked,
   respects reduced motion, stops offscreen, and is cleaned up on navigation. */
(() => {
  'use strict';
  let dispose = () => {};
  const clamp = value => Math.max(0, Math.min(1, value));
  function mount() {
    dispose();
    const story = document.querySelector('[data-ring-story]');
    const rail = document.querySelector('.home-category-rail');
    const footer = document.querySelector('.site-footer');
    if (!story && !rail && !footer) { dispose = () => {}; return; }
    const controller = new AbortController(), {signal} = controller;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const finish = story?.querySelector('[data-ring-finish]');
    const prev = document.querySelector('[data-category-prev]');
    const next = document.querySelector('[data-category-next]');
    let disposed = false, frame = 0, forced = false, animated = false;
    let storyVisible = true, footerVisible = true;
    function updateRail() {
      if (!rail || !prev || !next) return;
      const end = Math.max(0, rail.scrollWidth - rail.clientWidth);
      prev.disabled = rail.scrollLeft <= 2;
      next.disabled = rail.scrollLeft >= end - 2;
      prev.parentElement.hidden = end <= 2;
    }
    function draw() {
      frame = 0;
      if (disposed || document.hidden) return;
      if (story && (storyVisible || !animated || forced)) {
        let progress = 1;
        if (animated && !forced) {
          const top = Number(story.dataset.header) || 0;
          const rect = story.getBoundingClientRect();
          progress = clamp((top - rect.top) / Math.max(1, rect.height - (innerHeight - top)));
        }
        const t = clamp((progress - .06) / .76);
        const eased = t * t * (3 - 2 * t);
        story.style.setProperty('--ring-drop', (20.5 * eased).toFixed(3) + '%');
        story.style.setProperty('--ring-lift', (-7 * eased).toFixed(3) + '%');
        story.style.setProperty('--ring-progress', eased.toFixed(3));
        // Move the whole setting too: a small lift, turn and approach to camera.
        story.style.setProperty('--ring-turn', (-12 * (1 - eased)).toFixed(3) + 'deg');
        story.style.setProperty('--ring-drift', (18 * (1 - eased)).toFixed(3) + 'px');
        story.style.setProperty('--ring-scale', (.9 + .1 * eased).toFixed(3));
        // A restrained flash as the diamond seats; no perpetual sparkle loop.
        story.style.setProperty('--ring-sheen', reduced.matches ? '0' : (Math.pow(Math.sin(eased * Math.PI), 6) * .8).toFixed(3));
      }
      if (footer && footerVisible) {
        const rect = footer.getBoundingClientRect();
        const progress = reduced.matches ? 1 : clamp((innerHeight - rect.top) / Math.min(innerHeight, rect.height));
        footer.style.setProperty('--skyline-rise', (18 * (1 - progress)).toFixed(2) + 'px');
        footer.style.setProperty('--skyline-glow', (.06 + progress * .14).toFixed(3));
        footer.style.setProperty('--skyline-light', (15 + progress * 70).toFixed(2) + '%');
      }
    }
    function schedule() { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw); }
    function configure() {
      if (story) {
        const top = Math.ceil(document.querySelector('.header')?.getBoundingClientRect().height || 100);
        animated = !reduced.matches && innerHeight - top >= (innerWidth <= 650 ? 575 : 480);
        story.dataset.header = String(top);
        story.style.setProperty('--ring-header', top + 'px');
        story.classList.toggle('is-scroll-ready', animated);
        finish.hidden = !animated;
      }
      updateRail();
      schedule();
    }
    finish?.addEventListener('click', () => {
      forced = !forced;
      const label = forced ? 'Follow scrolling again' : 'Show finished ring without animation';
      finish.setAttribute('aria-pressed', String(forced));
      finish.setAttribute('aria-label', label);
      finish.setAttribute('title', label);
      finish.innerHTML = '<span aria-hidden="true">' + (forced ? '▷' : 'Ⅱ') + '</span>';
      schedule();
    }, {signal});
    if (rail) {
      rail.addEventListener('scroll', updateRail, {passive:true,signal});
      for (const [button, direction] of [[prev,-1],[next,1]]) button?.addEventListener('click', () => {
        rail.scrollBy({left:direction * rail.clientWidth * .8,behavior:reduced.matches ? 'instant' : 'smooth'});
      }, {signal});
    }
    window.addEventListener('scroll', schedule, {passive:true,signal});
    window.addEventListener('resize', configure, {passive:true,signal});
    reduced.addEventListener('change', configure, {signal});
    document.addEventListener('visibilitychange', schedule, {signal});
    let observer, resizeObserver;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.target === story) storyVisible = entry.isIntersecting;
          if (entry.target === footer) footerVisible = entry.isIntersecting;
        }
        schedule();
      });
      if (story) observer.observe(story);
      if (footer) observer.observe(footer);
    }
    if (rail && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(updateRail);
      resizeObserver.observe(rail);
    }
    configure();
    dispose = () => { disposed = true; controller.abort(); observer?.disconnect(); resizeObserver?.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }
  window.addEventListener('hashchange', mount);
  window.addEventListener('pagehide', () => dispose());
  window.addEventListener('pageshow', event => { if (event.persisted) mount(); });
  mount();
})();
