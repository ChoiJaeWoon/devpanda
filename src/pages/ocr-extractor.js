/**
 * DevPanda — PDF Text Extractor
 * Extract text from PDF files using pdf.js (Mozilla, loaded from CDN).
 * Reads embedded text — no OCR. 100% client-side.
 */

/* ── Load pdf.js from CDN ──────────────── */
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

let pdfjsLib = null;

async function loadPdfJs() {
  if (pdfjsLib) return;
  pdfjsLib = await import(PDFJS_CDN);
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderOcrExtractor(container) {
  let fileInfo = null;   // { name, size, arrayBuffer }
  let status = 'idle'; // idle | loading | extracting | done | error
  let progress = 0;
  let totalPages = 0;
  let currentPage = 0;
  let resultText = '';
  let pageTexts = [];
  let errorMsg = '';

  function render() {
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>PDF Text Extractor</span></div>
          <h1 class="tool-header__title">📄 PDF Text Extractor</h1>
          <p class="tool-header__desc">Extract text from PDF files. Uses Mozilla's pdf.js — all processing runs locally in your browser.</p>
        </div>

        <div class="ocr-layout">
          <!-- Left: File input + info -->
          <div>
            <div class="panel">
              <div class="panel__title">📁 PDF File</div>
              ${!fileInfo ? `
                <div class="drop-zone" id="pdf-drop" style="margin-top:var(--space-sm);">
                  <div class="drop-zone__icon">📄</div>
                  <div class="drop-zone__text">Drag & drop a PDF here</div>
                  <div class="drop-zone__hint">or click to browse</div>
                  <input type="file" id="pdf-file" accept=".pdf,application/pdf" style="display:none" />
                </div>
              ` : `
                <div class="ir-source-info" style="margin-top:var(--space-sm);">
                  <div style="font-size:32px;">📄</div>
                  <div class="ir-source-meta">
                    <div class="ir-source-name">${escHtml(fileInfo.name)}</div>
                    <div class="ir-source-dims">${(fileInfo.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button class="btn btn--secondary btn--sm" id="pdf-clear">Change</button>
                </div>
              `}
            </div>

            ${fileInfo && status === 'idle' ? `
              <div class="panel" style="margin-top:var(--space-md);">
                <button class="btn btn--primary" id="pdf-run" style="width:100%;">
                  📝 Extract Text
                </button>
              </div>
            ` : ''}

            ${status === 'loading' || status === 'extracting' ? `
              <div class="panel" style="margin-top:var(--space-md);">
                <div class="panel__title">⏳ Progress</div>
                <div class="ocr-progress-wrap">
                  <div class="ocr-progress-bar">
                    <div class="ocr-progress-fill" id="pdf-fill" style="width:${Math.round(progress * 100)}%"></div>
                  </div>
                  <span class="ocr-progress-pct" id="pdf-pct">${Math.round(progress * 100)}%</span>
                </div>
                <div class="ocr-progress-status" id="pdf-status-text">
                  ${status === 'loading' ? 'Loading pdf.js engine…' : `Extracting page ${currentPage} / ${totalPages}…`}
                </div>
              </div>
            ` : ''}

            ${status === 'done' ? `
              <div class="panel" style="margin-top:var(--space-md);">
                <div class="panel__title">📊 Summary</div>
                <div class="ocr-stats" style="flex-direction:column;gap:4px;">
                  <span>📄 ${totalPages} page${totalPages !== 1 ? 's' : ''}</span>
                  <span>🔤 ${resultText.split(/\s+/).filter(Boolean).length.toLocaleString()} words</span>
                  <span>📏 ${resultText.length.toLocaleString()} characters</span>
                </div>
              </div>
            ` : ''}

            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">ℹ️ How it works</div>
              <ul class="ocr-tips">
                <li>Reads <strong>embedded text</strong> in PDFs — not OCR.</li>
                <li>Works best with digital PDFs (documents, articles, ebooks).</li>
                <li>Scanned image-only PDFs may yield no text.</li>
                <li>Your file never leaves your browser.</li>
              </ul>
            </div>
          </div>

          <!-- Right: Results -->
          <div>
            <div class="panel">
              <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
                <span>📝 Extracted Text</span>
                <div style="display:flex;gap:6px;">
                  <button class="btn btn--secondary btn--sm" id="pdf-copy" ${!resultText ? 'disabled' : ''}>Copy</button>
                  <button class="btn btn--secondary btn--sm" id="pdf-download" ${!resultText ? 'disabled' : ''}>Download .txt</button>
                </div>
              </div>

              ${status === 'done' && totalPages > 1 ? `
                <div class="pdf-page-tabs" style="margin-top:var(--space-sm);">
                  <button class="btn btn--sm btn--primary pdf-page-tab" data-page="all">All Pages</button>
                  ${pageTexts.map((_, i) => `
                    <button class="btn btn--sm btn--secondary pdf-page-tab" data-page="${i}">Page ${i + 1}</button>
                  `).join('')}
                </div>
              ` : ''}

              ${status === 'done' && resultText ? `
                <textarea class="form-input ocr-result" id="pdf-result" readonly>${escHtml(resultText)}</textarea>
              ` : status === 'error' ? `
                <div class="cj-error" style="margin-top:var(--space-sm);">⚠️ ${escHtml(errorMsg)}</div>
              ` : `
                <div style="color:var(--text-muted);font-size:var(--text-sm);margin-top:var(--space-md);text-align:center;padding:60px 0;">
                  ${status === 'idle' ? 'Upload a PDF file and click "Extract Text".' :
        'Processing…'}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
    setupEvents();
  }

  function setupEvents() {
    // Drop zone
    const drop = container.querySelector('#pdf-drop');
    const fi = container.querySelector('#pdf-file');
    if (drop && fi) {
      drop.addEventListener('click', () => fi.click());
      drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drop-zone--active'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('drop-zone--active'));
      drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('drop-zone--active'); loadFile(e.dataTransfer.files[0]); });
      fi.addEventListener('change', e => loadFile(e.target.files[0]));
    }

    container.querySelector('#pdf-clear')?.addEventListener('click', () => {
      fileInfo = null; resultText = ''; pageTexts = []; status = 'idle'; progress = 0;
      render();
    });

    container.querySelector('#pdf-run')?.addEventListener('click', runExtract);

    container.querySelector('#pdf-copy')?.addEventListener('click', () => {
      const ta = container.querySelector('#pdf-result');
      const text = ta ? ta.value : resultText;
      navigator.clipboard.writeText(text).then(() => {
        const btn = container.querySelector('#pdf-copy');
        if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1500); }
      });
    });

    container.querySelector('#pdf-download')?.addEventListener('click', () => {
      const ta = container.querySelector('#pdf-result');
      const text = ta ? ta.value : resultText;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (fileInfo?.name || 'extracted').replace(/\.pdf$/i, '') + '.txt';
      a.click();
      URL.revokeObjectURL(url);
    });

    // Page tabs
    container.querySelectorAll('.pdf-page-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.pdf-page-tab').forEach(b => b.classList.replace('btn--primary', 'btn--secondary'));
        btn.classList.replace('btn--secondary', 'btn--primary');
        const page = btn.dataset.page;
        const ta = container.querySelector('#pdf-result');
        if (ta) {
          ta.value = page === 'all'
            ? pageTexts.map((t, i) => `--- Page ${i + 1} ---\n${t}`).join('\n\n')
            : pageTexts[parseInt(page)] || '';
        }
      });
    });
  }

  async function loadFile(file) {
    if (!file) return;
    fileInfo = { name: file.name, size: file.size, arrayBuffer: await file.arrayBuffer() };
    resultText = ''; pageTexts = []; status = 'idle';
    render();
  }

  function updateProgress(p, text) {
    progress = p;
    const fill = container.querySelector('#pdf-fill');
    const pct = container.querySelector('#pdf-pct');
    const st = container.querySelector('#pdf-status-text');
    if (fill) fill.style.width = Math.round(p * 100) + '%';
    if (pct) pct.textContent = Math.round(p * 100) + '%';
    if (st && text) st.textContent = text;
  }

  async function runExtract() {
    if (!fileInfo) return;

    status = 'loading'; progress = 0;
    render();

    try {
      await loadPdfJs();
    } catch (e) {
      status = 'error'; errorMsg = 'Failed to load pdf.js: ' + e.message;
      render(); return;
    }

    status = 'extracting'; progress = 0;
    render();

    try {
      const pdf = await pdfjsLib.getDocument({ data: fileInfo.arrayBuffer }).promise;
      totalPages = pdf.numPages;
      pageTexts = [];

      for (let i = 1; i <= totalPages; i++) {
        currentPage = i;
        updateProgress(i / totalPages, `Extracting page ${i} / ${totalPages}…`);

        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Build text preserving line breaks using Y-position and hasEOL
        let lines = [];
        let currentLine = '';
        let lastY = null;
        let lastHeight = 12; // default line height estimate

        for (const item of content.items) {
          // item.str = text, item.transform[5] = Y position, item.hasEOL = end-of-line
          if (item.str === undefined) continue;

          const y = item.transform ? item.transform[5] : null;
          const h = item.height || lastHeight;

          if (lastY !== null && y !== null) {
            const yDiff = Math.abs(lastY - y);
            if (yDiff > h * 0.3) {
              // Y changed → new line
              lines.push(currentLine.trimEnd());
              // Extra blank line if Y gap is large (paragraph break)
              if (yDiff > h * 1.8) lines.push('');
              currentLine = item.str;
              lastY = y;
              lastHeight = h;
              continue;
            }
          }

          // Same line — add space if needed
          if (currentLine && item.str && !currentLine.endsWith(' ') && !item.str.startsWith(' ')) {
            currentLine += ' ';
          }
          currentLine += item.str;
          if (y !== null) lastY = y;
          lastHeight = h;

          // hasEOL → flush line
          if (item.hasEOL) {
            lines.push(currentLine.trimEnd());
            currentLine = '';
          }
        }
        if (currentLine.trim()) lines.push(currentLine.trimEnd());

        pageTexts.push(lines.join('\n').trim());
      }

      resultText = pageTexts.map((t, i) => `--- Page ${i + 1} ---\n${t}`).join('\n\n');
      status = 'done';
    } catch (e) {
      status = 'error';
      errorMsg = e.message || 'Failed to extract text from PDF.';
    }

    render();
  }

  render();
}
