/**
 * DevPanda — Navbar Component
 */
export function renderNavbar() {
  const nav = document.getElementById('navbar');
  nav.innerHTML = `
    <div class="navbar">
      <button class="navbar__menu-btn" id="sidebar-toggle" aria-label="메뉴 열기">
        ☰
      </button>
      <a class="navbar__logo" href="#/">
        <div class="navbar__logo-icon">🐼</div>
        DevPanda
      </a>
      <div class="navbar__search">
        <span class="navbar__search-icon">🔍</span>
        <input type="text" id="tool-search" placeholder="Search tools..." autocomplete="off" />
      </div>
      <div class="navbar__actions">
        <a class="navbar__link" href="https://github.com/ChoiJaeWoon/devpanda" target="_blank" rel="noopener">
          <span>GitHub</span> ↗
        </a>
      </div>
    </div>
  `;

  // Sidebar overlay (create once)
  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  function getSidebar() {
    return document.querySelector('.sidebar');
  }

  function openSidebar() {
    const sb = getSidebar();
    if (sb) sb.classList.add('sidebar--open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    const sb = getSidebar();
    if (sb) sb.classList.remove('sidebar--open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Hamburger toggle
  const menuBtn = nav.querySelector('#sidebar-toggle');
  menuBtn.addEventListener('click', () => {
    const sb = getSidebar();
    if (sb && sb.classList.contains('sidebar--open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Close on overlay click
  overlay.addEventListener('click', closeSidebar);

  // Close sidebar on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });

  // Search functionality
  const searchInput = nav.querySelector('#tool-search');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.tool-card').forEach(card => {
      const title = card.querySelector('.tool-card__title')?.textContent.toLowerCase() || '';
      const desc = card.querySelector('.tool-card__desc')?.textContent.toLowerCase() || '';
      card.style.display = (title.includes(query) || desc.includes(query)) ? '' : 'none';
    });
  });
}
