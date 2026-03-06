/**
 * DevPanda — Image Resizer
 * Upload image → set target dimensions → preview → download
 * All processing done client-side via Canvas API.
 */

const FORMATS = [
  { label: 'JPEG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'WebP', mime: 'image/webp', ext: 'webp' },
];

export function renderImageResizer(container) {
  let sourceImg = null;
  let origW = 0, origH = 0;
  let targetW = 0, targetH = 0;
  let lockAspect = true;
  let format = 'image/jpeg';
  let quality = 0.92;
  let filename = 'image';

  function render() {
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Image Resizer</span></div>
          <h1 class="tool-header__title">🖼️ Image Resizer</h1>
          <p class="tool-header__desc">Upload an image, set target dimensions, and download the resized version — all client-side, no upload to server.</p>
        </div>

        <div class="ir-layout">
          <!-- Left: Controls -->
          <div>
            <!-- Upload -->
            <div class="panel">
              <div class="panel__title">📂 Source Image</div>
              ${!sourceImg ? `
                <div class="drop-zone" id="ir-drop" style="margin-top:var(--space-sm);">
                  <div class="drop-zone__icon">🖼️</div>
                  <div class="drop-zone__text">Drag &amp; drop an image here</div>
                  <div class="drop-zone__hint">JPEG, PNG, WebP, GIF, BMP</div>
                  <input type="file" id="ir-file" accept="image/*" style="display:none" />
                </div>
              ` : `
                <div class="ir-source-info">
                  <img class="ir-thumb" src="${sourceImg.src}" alt="source" />
                  <div class="ir-source-meta">
                    <div class="ir-source-name">${filename}</div>
                    <div class="ir-source-dims">${origW} × ${origH} px</div>
                  </div>
                  <button class="btn btn--secondary btn--sm" id="ir-change">Change</button>
                </div>
              `}
            </div>

            ${sourceImg ? `
            <!-- Resize Controls -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">📐 Target Dimensions</div>
              <div class="ir-dims">
                <div class="cp-input-group">
                  <label class="form-label">Width (px)</label>
                  <input class="form-input" type="number" id="ir-w" min="1" value="${targetW}" />
                </div>
                <button class="ir-lock-btn ${lockAspect ? 'ir-lock-btn--active' : ''}" id="ir-lock"
                  title="${lockAspect ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}">
                  ${lockAspect ? '🔒' : '🔓'}
                </button>
                <div class="cp-input-group">
                  <label class="form-label">Height (px)</label>
                  <input class="form-input" type="number" id="ir-h" min="1" value="${targetH}" />
                </div>
              </div>

              <!-- Quick presets -->
              <div style="margin-top:var(--space-sm);">
                <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Quick Presets</div>
                <div class="ir-presets">
                  ${[
          ['HD 720p', 1280, 720],
          ['Full HD', 1920, 1080],
          ['Square 512', 512, 512],
          ['Square 256', 256, 256],
          ['Thumbnail', 150, 150],
          ['OG Image', 1200, 630],
          ['Twitter', 1200, 675],
          ['Instagram', 1080, 1080],
        ].map(([label, w, h]) => `
                    <button class="btn btn--secondary btn--sm ir-preset" data-w="${w}" data-h="${h}">
                      ${label}<span style="font-size:9px;opacity:0.6;display:block;margin-top:1px;">${w}×${h}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <!-- Scale % -->
              <div style="margin-top:var(--space-sm);">
                <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Scale by %</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${[25, 50, 75, 150, 200].map(p => `
                    <button class="btn btn--secondary btn--sm ir-scale" data-pct="${p}">${p}%</button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Output Options -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">💾 Output Options</div>
              <div class="ir-output-opts">
                <div class="cp-input-group">
                  <label class="form-label">Format</label>
                  <div class="ir-format-btns">
                    ${FORMATS.map(f => `
                      <button class="btn btn--sm ir-fmt-btn ${format === f.mime ? 'btn--primary' : 'btn--secondary'}" data-mime="${f.mime}">${f.label}</button>
                    `).join('')}
                  </div>
                </div>
                ${format !== 'image/png' ? `
                  <div class="cp-input-group">
                    <label class="form-label">Quality: <strong id="ir-q-val">${Math.round(quality * 100)}%</strong></label>
                    <input class="aug-slider" type="range" id="ir-quality" min="10" max="100" value="${Math.round(quality * 100)}" />
                  </div>
                ` : ''}
              </div>
            </div>
            ` : ''}
          </div>

          <!-- Right: Preview -->
          <div>
            ${sourceImg ? `
              <div class="panel">
                <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
                  <span>👁️ Preview</span>
                  ${targetW && targetH ? `<span style="font-size:var(--text-xs);color:var(--text-muted);">${targetW} × ${targetH} px</span>` : ''}
                </div>
                <div class="ir-preview-wrap">
                  <canvas id="ir-canvas" class="ir-preview-canvas"></canvas>
                  ${!targetW || !targetH ? `<div class="ir-preview-hint">Set dimensions to preview</div>` : ''}
                </div>

                <!-- Before/After comparison -->
                ${targetW && targetH ? `
                  <div class="ir-compare">
                    <div class="ir-compare-item">
                      <div class="ir-compare-label">Original</div>
                      <div class="ir-compare-val">${origW} × ${origH}</div>
                      <div class="ir-compare-sub">~${approxSize(origW, origH, format, quality)} KB</div>
                    </div>
                    <div class="ir-compare-arrow">→</div>
                    <div class="ir-compare-item ir-compare-item--accent">
                      <div class="ir-compare-label">Resized</div>
                      <div class="ir-compare-val">${targetW} × ${targetH}</div>
                      <div class="ir-compare-sub" id="ir-exact-size">calculating…</div>
                    </div>
                    <div class="ir-compare-item">
                      <div class="ir-compare-label">Change</div>
                      <div class="ir-compare-val" style="color:${scaleColor(origW * origH, targetW * targetH)};">
                        ${scalePercent(origW * origH, targetW * targetH)}
                      </div>
                      <div class="ir-compare-sub">pixel area</div>
                    </div>
                  </div>

                  <!-- Download button — under the preview -->
                  <button class="btn btn--primary" id="ir-download"
                    style="width:100%;margin-top:var(--space-md);font-size:var(--text-md);padding:14px;">
                    ⬇️ Download (${targetW}×${targetH})
                  </button>
                ` : ''}
              </div>
            ` : `
              <div class="mpc-empty" style="height:400px;justify-content:center;">
                <div style="font-size:64px;">🖼️</div>
                <div>Upload an image to get started</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    setupEvents();
    if (sourceImg && targetW && targetH) {
      requestAnimationFrame(() => {
        drawPreview();
        updateExactSize();
      });
    }
  }

  function approxSize(w, h, fmt, q) {
    const bpp = fmt === 'image/png' ? 3 : (q * 1.2);
    return Math.round(w * h * bpp / 1024);
  }

  function scalePercent(orig, next) {
    const pct = ((next - orig) / orig * 100).toFixed(1);
    return (pct > 0 ? '+' : '') + pct + '%';
  }

  function scaleColor(orig, next) {
    return next < orig ? '#16a34a' : next === orig ? '#64748b' : '#ef4444';
  }

  function drawPreview() {
    const canvas = document.getElementById('ir-canvas');
    if (!canvas || !sourceImg) return;
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceImg, 0, 0, targetW, targetH);
  }

  function updateExactSize() {
    const canvas = document.getElementById('ir-canvas');
    const el = document.getElementById('ir-exact-size');
    if (!canvas || !el) return;
    canvas.toBlob(blob => {
      if (blob && el) el.textContent = `~${Math.round(blob.size / 1024)} KB`;
    }, format, quality);
  }

  // Partial update: only canvas + compare stats (no full re-render — preserves input focus)
  function updatePreviewOnly() {
    if (!sourceImg || !targetW || !targetH) return;

    drawPreview();

    // Update preview title px label
    const titlePx = container.querySelector('.ir-panel-title-px');
    if (titlePx) titlePx.textContent = `${targetW} × ${targetH} px`;

    // Update compare panel in-place
    const comparePanel = container.querySelector('.ir-compare');
    if (comparePanel) {
      comparePanel.innerHTML = `
        <div class="ir-compare-item">
          <div class="ir-compare-label">Original</div>
          <div class="ir-compare-val">${origW} × ${origH}</div>
          <div class="ir-compare-sub">~${approxSize(origW, origH, format, quality)} KB</div>
        </div>
        <div class="ir-compare-arrow">→</div>
        <div class="ir-compare-item ir-compare-item--accent">
          <div class="ir-compare-label">Resized</div>
          <div class="ir-compare-val">${targetW} × ${targetH}</div>
          <div class="ir-compare-sub" id="ir-exact-size">calculating…</div>
        </div>
        <div class="ir-compare-item">
          <div class="ir-compare-label">Change</div>
          <div class="ir-compare-val" style="color:${scaleColor(origW * origH, targetW * targetH)};">
            ${scalePercent(origW * origH, targetW * targetH)}
          </div>
          <div class="ir-compare-sub">pixel area</div>
        </div>
      `;
      updateExactSize();

      // Update download button label
      const dlBtn = container.querySelector('#ir-download');
      if (dlBtn) dlBtn.textContent = `⬇️ Download (${targetW}×${targetH})`;
    } else {
      render(); // first time comparison appears
    }
  }

  function setupEvents() {
    // Drop zone
    const drop = container.querySelector('#ir-drop');
    const fi = container.querySelector('#ir-file');
    if (drop && fi) {
      drop.addEventListener('click', () => fi.click());
      drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drop-zone--active'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('drop-zone--active'));
      drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('drop-zone--active'); loadFile(e.dataTransfer.files[0]); });
      fi.addEventListener('change', e => loadFile(e.target.files[0]));
    }
    container.querySelector('#ir-change')?.addEventListener('click', () => { sourceImg = null; render(); });

    // W/H inputs — partial update to preserve focus
    container.querySelector('#ir-w')?.addEventListener('input', e => {
      const w = parseInt(e.target.value) || 0;
      targetW = w;
      if (lockAspect && origW) {
        targetH = Math.round(w * origH / origW);
        const hEl = container.querySelector('#ir-h');
        if (hEl) hEl.value = targetH;
      }
      updatePreviewOnly();
    });
    container.querySelector('#ir-h')?.addEventListener('input', e => {
      const h = parseInt(e.target.value) || 0;
      targetH = h;
      if (lockAspect && origH) {
        targetW = Math.round(h * origW / origH);
        const wEl = container.querySelector('#ir-w');
        if (wEl) wEl.value = targetW;
      }
      updatePreviewOnly();
    });

    // Lock
    container.querySelector('#ir-lock')?.addEventListener('click', () => { lockAspect = !lockAspect; render(); });

    // Presets
    container.querySelectorAll('.ir-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        targetW = parseInt(btn.dataset.w);
        targetH = parseInt(btn.dataset.h);
        render();
      });
    });

    // Scale %
    container.querySelectorAll('.ir-scale').forEach(btn => {
      btn.addEventListener('click', () => {
        const pct = parseInt(btn.dataset.pct) / 100;
        targetW = Math.round(origW * pct);
        targetH = Math.round(origH * pct);
        render();
      });
    });

    // Format
    container.querySelectorAll('.ir-fmt-btn').forEach(btn => {
      btn.addEventListener('click', () => { format = btn.dataset.mime; render(); });
    });

    // Quality
    container.querySelector('#ir-quality')?.addEventListener('input', e => {
      quality = parseInt(e.target.value) / 100;
      const val = container.querySelector('#ir-q-val');
      if (val) val.textContent = e.target.value + '%';
      updateExactSize();
    });

    // Download
    container.querySelector('#ir-download')?.addEventListener('click', () => {
      const canvas = document.getElementById('ir-canvas');
      if (!canvas || !sourceImg) return;
      drawPreview();
      const ext = FORMATS.find(f => f.mime === format)?.ext || 'jpg';
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename.replace(/\.[^.]+$/, '')}_${targetW}x${targetH}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      }, format, quality);
    });
  }

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    filename = file.name;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      sourceImg = img;
      origW = img.naturalWidth;
      origH = img.naturalHeight;
      targetW = origW;
      targetH = origH;
      render();
    };
    img.src = url;
  }

  render();
}
