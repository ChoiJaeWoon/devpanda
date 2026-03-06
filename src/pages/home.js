/**
 * DevPanda — Home Page
 * Tool cards + AI/Dev news feed (HN + Dev.to)
 */

const toolCards = [
  {
    icon: '🧮', type: 'ai',
    title: 'Tensor Shape Calculator',
    desc: 'Add layers sequentially and calculate output shapes in real-time. Supports Conv2d, Pool, Linear, and more.',
    path: '/tensor-shape',
  },
  {
    icon: '🏷️', type: 'ai',
    title: 'Label Format Converter',
    desc: 'Convert between YOLO ↔ COCO JSON ↔ Pascal VOC (XML). Drag & drop support with batch conversion.',
    path: '/label-converter',
  },
  {
    icon: '🎮', type: 'ai',
    title: 'GPU Memory Calculator',
    desc: 'Estimate VRAM usage from model parameters and batch size. Check GPU compatibility across 100+ GPUs.',
    path: '/gpu-memory',
  },
  { icon: '📈', type: 'ai', title: 'Training Analyzer', desc: 'Upload YOLO results.csv to visualize loss/mAP curves and auto-detect overfitting or underfitting.', path: '/training-analyzer' },
  { icon: '📉', type: 'ai', title: 'LR Scheduler Visualizer', desc: 'Compare and visualize learning rate schedules (cosine, warmup, step, OneCycle) interactively.', path: '/lr-scheduler' },
  { icon: '🔢', type: 'ai', title: 'Model Parameter Counter', desc: 'Add layers to calculate total parameters, trainable vs non-trainable, and memory footprint.', path: '/model-param-counter' },
  { icon: '🖼️', type: 'ai', title: 'Augmentation Previewer', desc: 'Upload an image and preview augmentations (flip, blur, noise, crop, cutout) in a live grid.', path: '/augmentation-previewer' },
  { icon: '📐', type: 'ai', title: 'Detection Metrics', desc: 'Calculate IoU between bounding boxes and simulate NMS with adjustable thresholds.', path: '/detection-metrics' },
  {
    icon: '📋', type: 'dev', title: 'JSON Formatter',
    desc: 'Format, minify, and validate JSON. Syntax highlighting, sort keys, and stats.',
    path: '/json-formatter',
  },
  {
    icon: '🔑', type: 'dev', title: 'Base64 Converter',
    desc: 'Encode and decode text or files to Base64. Supports image preview and file download.',
    path: '/base64-converter',
  },
  {
    icon: '🎨', type: 'dev', title: 'Color Picker',
    desc: 'Convert HEX, RGB, HSL. Generate harmony colors, shades, and palettes.',
    path: '/color-picker',
  },
  { icon: '🖼️', type: 'dev', title: 'Image Resizer', desc: 'Resize images in the browser. Set exact dimensions, maintain aspect ratio, and export as JPG/PNG/WebP.', path: '/image-resizer' },
  { icon: '🗜️', type: 'dev', title: 'Image Compressor', desc: '해상도 유지하며 이미지 용량 줄이기. 품질 슬라이더로 WebP/JPEG/PNG 최적화.', path: '/image-compressor' },
  { icon: '📊', type: 'dev', title: 'CSV ↔ JSON', desc: 'Convert between CSV and JSON formats. Supports custom delimiters, table preview, and file download.', path: '/csv-json' },
  { icon: '🔢', type: 'dev', title: 'Regex Tester', desc: 'Build and test regular expressions with live match highlighting, replace mode, and preset patterns.', path: '/regex-tester' },
  { icon: '🔐', type: 'dev', title: 'Hash Generator', desc: 'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or any file. Includes hash comparison.', path: '/hash-generator' },
  { icon: '📐', type: 'dev', title: 'Unit Converter', desc: 'Convert CSS units (px, rem, em, vw), length, storage, temperature, time, and angle.', path: '/unit-converter' },
  { icon: '🌐', type: 'dev', title: 'URL Encoder/Decoder', desc: 'Encode, decode, and parse URLs. Supports encodeURI, encodeURIComponent, and query string parsing.', path: '/url-encoder' },
  { icon: '⏱️', type: 'dev', title: 'Cron Parser', desc: 'Parse cron expressions into human-readable descriptions. Preview the next scheduled run times.', path: '/cron-parser' },
  { icon: '📄', type: 'dev', title: 'PDF Text Extractor', desc: 'Extract text from PDF files instantly. Reads embedded text page-by-page, all in your browser.', path: '/ocr-extractor' },
  { icon: '🔷', type: 'dev', title: 'Image ↔ HEX', desc: 'Convert image files to hex byte strings, or reconstruct images from hex data. All client-side.', path: '/hex-image' },
  { icon: '🌐', type: 'dev', title: 'HTML Preview', desc: 'Type or paste HTML code and see it rendered live instantly. Supports CSS and JavaScript.', path: '/html-preview' },
];

/* ═══════════════════════════════
   News Feed APIs
   ═══════════════════════════════ */

const NEWS_SOURCES = {
  hn: {
    label: '🔥 Hacker News',
    color: '#ff6600',
    fetch: async () => {
      const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids = await res.json();
      const top15 = ids.slice(0, 15);
      const items = await Promise.all(
        top15.map(id =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
        )
      );
      const stories = items
        .filter(i => i && i.title)
        .map(i => ({
          title: i.title,
          url: i.url || `https://news.ycombinator.com/item?id=${i.id}`,
          points: i.score || 0,
          comments: i.descendants || 0,
          author: i.by || 'unknown',
          time: i.time ? timeAgo(i.time * 1000) : '',
          domain: i.url ? new URL(i.url).hostname.replace('www.', '') : 'news.ycombinator.com',
          hnLink: `https://news.ycombinator.com/item?id=${i.id}`,
          cover: null,
        }));
      // Fetch og:image for each article via Microlink (best-effort)
      const ogResults = await Promise.allSettled(
        stories.map(s =>
          fetch(`https://api.microlink.io/?url=${encodeURIComponent(s.url)}`)
            .then(r => r.json())
            .then(d => d?.data?.image?.url || d?.data?.logo?.url || null)
        )
      );
      ogResults.forEach((result, i) => {
        if (result.status === 'fulfilled' && result.value) {
          stories[i].cover = result.value;
        }
      });
      return stories;
    },
  },
  devto: {
    label: '💻 Dev.to',
    color: '#3b49df',
    fetch: async () => {
      const res = await fetch('https://dev.to/api/articles?per_page=15&top=7');
      const articles = await res.json();
      return articles.map(a => ({
        title: a.title,
        url: a.url,
        points: a.positive_reactions_count || 0,
        comments: a.comments_count || 0,
        author: a.user?.name || a.user?.username || 'unknown',
        time: timeAgo(new Date(a.published_at).getTime()),
        domain: 'dev.to',
        tags: (a.tag_list || []).slice(0, 3),
        cover: a.cover_image || null,
      }));
    },
  },
};

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/* ═══════════════════════════════
   Render
   ═══════════════════════════════ */

export function renderHome(container) {
  // Read initial filter from URL: #/?filter=dev or #/?filter=ai
  const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  let filter = hashParams.get('filter') || 'all';
  let newsSource = 'hn';
  let newsItems = [];
  let newsLoading = true;
  let newsError = null;

  async function loadNews() {
    newsLoading = true;
    newsError = null;
    renderNews();
    try {
      newsItems = await NEWS_SOURCES[newsSource].fetch();
    } catch (e) {
      newsError = 'Failed to load news. Please try again later.';
      newsItems = [];
    }
    newsLoading = false;
    renderNews();
  }

  function render() {
    const filtered = filter === 'all'
      ? toolCards
      : toolCards.filter(t => t.type === filter);

    container.innerHTML = `
      <section class="hero">
        <div class="hero__badge">⚡ Open Source Dev Tools</div>
        <h1 class="hero__title">
          Build Faster with<br/><span class="hero__title-gradient">DevPanda</span>
        </h1>
        <p class="hero__subtitle">
          A browser-based utility toolkit for AI/ML and general developers.<br/>
          No installation required — use it right away.
        </p>
      </section>

      <div class="category-tabs">
        <button class="category-tab ${filter === 'all' ? 'category-tab--active' : ''}" data-filter="all">All</button>
        <button class="category-tab ${filter === 'ai' ? 'category-tab--active' : ''}" data-filter="ai">AI / ML Tools</button>
        <button class="category-tab ${filter === 'dev' ? 'category-tab--active' : ''}" data-filter="dev">General Dev Tools</button>
        <button class="category-tab category-tab--news" id="scroll-news-btn">📰 News</button>
      </div>

      <div class="tools-grid">
        ${filtered.filter(t => !t.disabled).map(tool => `
          <a class="tool-card" href="#${tool.path}">
            <div class="tool-card__icon tool-card__icon--${tool.type}">${tool.icon}</div>
            <div class="tool-card__title">${tool.title}</div>
            <div class="tool-card__desc">${tool.desc}</div>
            <span class="tool-card__tag tool-card__tag--${tool.type}">
              ${tool.type === 'ai' ? '🤖 AI/ML' : '🛠️ Dev'}
            </span>
          </a>
        `).join('')}
      </div>

      ${filtered.some(t => t.disabled) ? `
        <div class="coming-soon-row">
          <span class="coming-soon-row__label">🔒 Coming Soon</span>
          ${filtered.filter(t => t.disabled).map(tool => `
            <span class="coming-soon-chip">${tool.icon} ${tool.title}</span>
          `).join('')}
        </div>
      ` : ''}

      <!-- News Section -->
      <section class="news-section" id="news-section">
        <div class="news-section__header">
          <h2 class="news-section__title">📰 Developer News</h2>
          <div class="news-tabs">
            ${Object.entries(NEWS_SOURCES).map(([key, src]) => `
              <button class="news-tab ${newsSource === key ? 'news-tab--active' : ''}" data-source="${key}" style="${newsSource === key ? `border-color:${src.color};color:${src.color};` : ''}">
                ${src.label}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="news-list" id="news-list"></div>
      </section>
    `;

    // Tab click handlers
    container.querySelectorAll('.category-tab[data-filter]').forEach(tab => {
      tab.addEventListener('click', () => { filter = tab.dataset.filter; render(); loadNews(); });
    });

    // News scroll button
    container.querySelector('#scroll-news-btn')?.addEventListener('click', () => {
      const newsEl = document.getElementById('news-section');
      if (!newsEl) return;
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 64;
      const targetY = newsEl.getBoundingClientRect().top + window.scrollY - navH;
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = 700; // ms — adjust for slower/faster
      let startTime = null;

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeInOutCubic(progress));
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });

    // News source tabs
    container.querySelectorAll('.news-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        newsSource = tab.dataset.source;
        render();
        loadNews();
      });
    });

    renderNews();
  }

  function renderNews() {
    const list = container.querySelector('#news-list');
    if (!list) return;

    if (newsLoading) {
      list.innerHTML = `
        <div class="news-loading">
          <div class="news-spinner"></div>
          <span>Loading news...</span>
        </div>
      `;
      return;
    }

    if (newsError) {
      list.innerHTML = `<div class="news-empty">${newsError}</div>`;
      return;
    }

    if (newsItems.length === 0) {
      list.innerHTML = `<div class="news-empty">No news to display.</div>`;
      return;
    }

    const gradients = [
      'linear-gradient(135deg,#667eea,#764ba2)', 'linear-gradient(135deg,#f093fb,#f5576c)',
      'linear-gradient(135deg,#4facfe,#00f2fe)', 'linear-gradient(135deg,#43e97b,#38f9d7)',
      'linear-gradient(135deg,#fa709a,#fee140)', 'linear-gradient(135deg,#a18cd1,#fbc2eb)',
      'linear-gradient(135deg,#fccb90,#d57eeb)', 'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
    ];
    list.innerHTML = `<div class="news-grid">${newsItems.map((item, idx) => {
      const hasCover = !!item.cover;
      const favicon = `https://www.google.com/s2/favicons?domain=${item.domain}&sz=128`;
      return `
        <a class="news-card-v2" href="${item.url}" target="_blank" rel="noopener noreferrer">
          <div class="news-card-v2__thumb" style="${hasCover ? `background-image:url('${item.cover}')` : `background:${gradients[idx % 8]}`}">
            ${!hasCover ? `<img class="news-card-v2__favicon" src="${favicon}" alt="" />` : ''}
            <span class="news-card-v2__source">${item.domain}</span>
          </div>
          <div class="news-card-v2__body">
            <div class="news-card-v2__title">${item.title}</div>
            <div class="news-card-v2__meta">
              <span>👤 ${item.author}</span>
              <span>⬆ ${item.points}</span>
              <span>💬 ${item.comments}</span>
              <span>🕐 ${item.time}</span>
            </div>
            ${item.tags ? `<div class="news-card-v2__tags">${item.tags.map(t => `<span class="news-card-v2__tag">#${t}</span>`).join('')}</div>` : ''}
          </div>
        </a>`;
    }).join('')}</div>`;
  }

  render();
  loadNews();
}
