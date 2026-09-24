'use strict';

// Runs before the shared deferred app scripts. The current document already
// contains its rendered content; only its initial router state is established.
// An explicit hash always wins, so links, reloads and browser history work.
(() => {
  const route = document.documentElement.getAttribute('data-page-route');
  if (!route || !route.startsWith('#/') || (location.hash && location.hash !== '#')) return;
  try {
    history.replaceState(null, '', location.pathname + location.search + route);
  } catch {
    // Some file:// environments restrict history changes. The local server is
    // recommended, but assigning a fragment also works without loading a page.
    location.hash = route;
  }
})();
