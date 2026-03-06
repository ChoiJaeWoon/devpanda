/**
 * DevPanda — HTML Live Preview
 * Paste or type HTML (+ optional CSS/JS) and see it rendered instantly.
 */

const SAMPLE_HTML = `<div class="card">
  <h1>🐼 Hello, DevPanda!</h1>
  <p>Edit the HTML on the left to see changes here.</p>
  <button onclick="this.textContent = '🎉 Clicked!'">Click me!</button>
</div>`;

const SAMPLE_CSS = `* { box-sizing: border-box; }
body {
  font-family: sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
h1 { color: #764ba2; margin: 0 0 8px; }
p  { color: #888; margin: 0 0 20px; }
button {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #764ba2;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.1s;
}
button:hover { transform: scale(1.05); }`;

const SAMPLE_JS = `console.log('DevPanda HTML Preview loaded!');`;

export function renderHtmlPreview(container) {
  let htmlCode = SAMPLE_HTML;
  let cssCode = SAMPLE_CSS;
  let jsCode = SAMPLE_JS;
  let autoRefresh = true;
  let viewMode = 'split';   // 'split' | 'editor' | 'preview'
  let showExtras = true;    // show CSS/JS panels

  /* ── Build full document for iframe ─────────── */
  function buildDoc() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>${cssCode}</style>
</head>
<body>
${htmlCode}
<script>${jsCode}<\/script>
</body>
</html>`;
  }

  function updatePreview() {
    const iframe = container.querySelector('#html-iframe');
    if (!iframe) return;
    iframe.srcdoc = buildDoc();
  }

  function addTabSupport(textarea, onInput) {
    textarea?.addEventListener('input', e => { onInput(e.target.value); });
    textarea?.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const s = textarea.selectionStart, en = textarea.selectionEnd;
        textarea.value = textarea.value.slice(0, s) + '  ' + textarea.value.slice(en);
        textarea.selectionStart = textarea.selectionEnd = s + 2;
        onInput(textarea.value);
      }
    });
  }

  function render() {
    container.innerHTML = `
      <div class="tool-page hp-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>HTML Preview</span></div>
          <h1 class="tool-header__title">🖊️ HTML Live Preview</h1>
          <p class="tool-header__desc">Type or paste HTML, CSS, and JS code and see it rendered instantly.</p>
        </div>

        <!-- Toolbar -->
        <div class="panel hp-toolbar">
          <div class="jf-mode-tabs">
            <button class="jf-mode-btn ${viewMode === 'split' ? 'active' : ''}" data-view="split">⬛ Split</button>
            <button class="jf-mode-btn ${viewMode === 'editor' ? 'active' : ''}" data-view="editor">📝 Editor</button>
            <button class="jf-mode-btn ${viewMode === 'preview' ? 'active' : ''}" data-view="preview">🌐 Preview</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;margin-left:auto;">
            <label class="hp-toggle">
              <input type="checkbox" id="auto-refresh" ${autoRefresh ? 'checked' : ''} />
              <span>Auto refresh</span>
            </label>
            <button class="btn btn--secondary btn--sm" id="run-btn">▶ Run</button>
            <button class="btn btn--secondary btn--sm" id="sample-btn">📄 Sample</button>
            <button class="btn btn--secondary btn--sm" id="clear-btn">✕ Clear</button>
            <button class="btn btn--secondary btn--sm" id="copy-btn">📋 Copy HTML</button>
          </div>
        </div>

        <!-- Editor + Preview -->
        <div class="hp-layout hp-layout--${viewMode}">

          <!-- Editor column -->
          <div class="hp-editor-col ${viewMode === 'preview' ? 'hp-hidden' : ''}">

            <!-- HTML editor -->
            <div class="panel hp-editor-panel">
              <div class="panel__title">📝 HTML</div>
              <textarea id="html-editor" class="form-input hp-editor" spellcheck="false"
                placeholder="Type your HTML here..."
              >${escapeHtml(htmlCode)}</textarea>
            </div>

            <!-- Toggle button for CSS/JS -->
            <button class="btn hp-extras-toggle" id="toggle-extras-btn">
              ${showExtras ? '▲ Hide CSS / JS' : '▼ Add CSS / JS'}
            </button>

            <!-- CSS + JS panels -->
            ${showExtras ? `
              <div class="panel hp-editor-panel">
                <div class="panel__title" style="color:#38bdf8;">🎨 CSS</div>
                <textarea id="css-editor" class="form-input hp-editor hp-editor--sm" spellcheck="false"
                  placeholder="body { margin: 0; }"
                >${escapeHtml(cssCode)}</textarea>
              </div>
              <div class="panel hp-editor-panel">
                <div class="panel__title" style="color:#4ade80;">⚡ JavaScript</div>
                <textarea id="js-editor" class="form-input hp-editor hp-editor--sm" spellcheck="false"
                  placeholder="console.log('hello');"
                >${escapeHtml(jsCode)}</textarea>
              </div>
            ` : ''}
          </div>

          <!-- Preview -->
          <div class="panel hp-preview-panel ${viewMode === 'editor' ? 'hp-hidden' : ''}">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>🌐 Preview</span>
              <button class="btn btn--secondary btn--sm" id="open-new-tab-btn">↗ Open in tab</button>
            </div>
            <iframe id="html-iframe" class="hp-iframe"
              sandbox="allow-scripts allow-modals"
              title="HTML Preview"
            ></iframe>
          </div>
        </div>
      </div>
    `;

    updatePreview();

    /* ── Events ─────────────────────── */
    const htmlEditor = container.querySelector('#html-editor');
    const cssEditor = container.querySelector('#css-editor');
    const jsEditor = container.querySelector('#js-editor');

    addTabSupport(htmlEditor, v => { htmlCode = v; if (autoRefresh) updatePreview(); });
    addTabSupport(cssEditor, v => { cssCode = v; if (autoRefresh) updatePreview(); });
    addTabSupport(jsEditor, v => { jsCode = v; if (autoRefresh) updatePreview(); });

    // View mode
    container.querySelectorAll('[data-view]').forEach(btn =>
      btn.addEventListener('click', () => { viewMode = btn.dataset.view; render(); })
    );

    // Auto refresh
    container.querySelector('#auto-refresh')?.addEventListener('change', e => {
      autoRefresh = e.target.checked;
    });

    // Toggle CSS/JS
    container.querySelector('#toggle-extras-btn')?.addEventListener('click', () => {
      // Capture current values before re-render
      htmlCode = htmlEditor?.value ?? htmlCode;
      showExtras = !showExtras;
      render();
    });

    // Run
    container.querySelector('#run-btn')?.addEventListener('click', () => {
      htmlCode = htmlEditor?.value ?? htmlCode;
      cssCode = cssEditor?.value ?? cssCode;
      jsCode = jsEditor?.value ?? jsCode;
      updatePreview();
    });

    // Sample
    container.querySelector('#sample-btn')?.addEventListener('click', () => {
      htmlCode = SAMPLE_HTML; cssCode = SAMPLE_CSS; jsCode = SAMPLE_JS;
      render();
    });

    // Clear
    container.querySelector('#clear-btn')?.addEventListener('click', () => {
      htmlCode = ''; cssCode = ''; jsCode = '';
      render();
    });

    // Copy
    container.querySelector('#copy-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(buildDoc());
      const btn = container.querySelector('#copy-btn');
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy HTML', 1500);
    });

    // Open in new tab
    container.querySelector('#open-new-tab-btn')?.addEventListener('click', () => {
      const blob = new Blob([buildDoc()], { type: 'text/html' });
      window.open(URL.createObjectURL(blob), '_blank');
    });
  }

  render();
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
