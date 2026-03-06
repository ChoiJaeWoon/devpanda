/**
 * DevPanda — Hash-based SPA Router
 */

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigateTo(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return window.location.hash.slice(1) || '/';
}

async function handleRoute() {
  const path = getCurrentRoute();
  const content = document.getElementById('content');
  if (!content) return;

  // Run cleanup from previous page
  if (typeof currentCleanup === 'function') {
    currentCleanup();
    currentCleanup = null;
  }

  const handler = routes[path] || routes['/'];
  if (handler) {
    const result = await handler(content);
    if (typeof result === 'function') {
      currentCleanup = result;
    }
  }

  // Scroll to top on every navigation
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Update active sidebar item
  document.querySelectorAll('.sidebar__item').forEach(item => {
    const href = item.getAttribute('href');
    if (href === `#${path}`) {
      item.classList.add('sidebar__item--active');
    } else {
      item.classList.remove('sidebar__item--active');
    }
  });
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  // Initial route
  handleRoute();
}
