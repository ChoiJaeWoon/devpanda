/**
 * DevPanda — Navbar Component
 */
export function renderNavbar() {
  const nav = document.getElementById('navbar');
  nav.innerHTML = `
    <div class="navbar">
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
