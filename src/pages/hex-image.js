/**
 * DevPanda — Image ↔ HEX Converter
 * Convert image files to hex strings and vice versa.
 */

export function renderHexImage(container) {
    let mode = 'img2hex';   // 'img2hex' | 'hex2img'
    let imgSrc = null;      // data URL of loaded image
    let imgName = 'image';
    let hexOutput = '';
    let hexInput = '';
    let hexError = '';
    let previewSrc = null;

    /* ── Core Logic ─────────────────────────────── */
    function imgToHex(dataUrl) {
        const base64 = dataUrl.split(',')[1];
        const binary = atob(base64);
        let hex = '';
        for (let i = 0; i < binary.length; i++) {
            hex += binary.charCodeAt(i).toString(16).padStart(2, '0');
            if ((i + 1) % 16 === 0) hex += '\n';
            else if ((i + 1) % 4 === 0) hex += '  ';
            else hex += ' ';
        }
        return hex.trim();
    }

    function hexToDataUrl(hex) {
        const clean = hex.replace(/\s/g, '');
        if (!/^[0-9a-fA-F]+$/.test(clean)) throw new Error('Invalid hex string. Use characters 0-9 and a-f only.');
        if (clean.length % 2 !== 0) throw new Error('Hex string must have an even number of characters.');
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < clean.length; i += 2) bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
        const blob = new Blob([bytes]);
        return URL.createObjectURL(blob);
    }

    function detectMime(hex) {
        const h = hex.replace(/\s/g, '').toLowerCase();
        if (h.startsWith('89504e47')) return 'image/png';
        if (h.startsWith('ffd8ff')) return 'image/jpeg';
        if (h.startsWith('47494638')) return 'image/gif';
        if (h.startsWith('52494646')) return 'image/webp';
        if (h.startsWith('424d')) return 'image/bmp';
        return 'application/octet-stream';
    }

    function formatSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    }

    /* ── Render ─────────────────────────────────── */
    function render() {
        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Image ↔ HEX</span></div>
          <h1 class="tool-header__title">🔷 Image ↔ HEX Converter</h1>
          <p class="tool-header__desc">Convert image files to hexadecimal byte strings, or reconstruct images from hex data.</p>
        </div>

        <!-- Mode Tabs -->
        <div class="panel">
          <div class="jf-controls">
            <div class="jf-mode-tabs">
              <button class="jf-mode-btn ${mode === 'img2hex' ? 'active' : ''}" data-mode="img2hex">🖼️ Image → HEX</button>
              <button class="jf-mode-btn ${mode === 'hex2img' ? 'active' : ''}" data-mode="hex2img">🔷 HEX → Image</button>
            </div>
          </div>
        </div>

        ${mode === 'img2hex' ? `
        <!-- Image to HEX -->
        <div class="jf-layout">
          <!-- Input -->
          <div class="panel" style="display:flex;flex-direction:column;">
            <div class="panel__title">🖼️ Image Input</div>
            <div class="drop-zone" id="drop-zone" style="margin-top:var(--space-sm);">
              <div class="drop-zone__icon">🖼️</div>
              <div class="drop-zone__text">Drag & drop an image or click to upload</div>
              <div class="drop-zone__hint">PNG, JPEG, GIF, WebP, BMP supported</div>
              <input type="file" id="file-input" accept="image/*" style="display:none;" />
            </div>
            ${imgSrc ? `
              <div class="hx-preview-wrap">
                <img src="${imgSrc}" class="hx-img-preview" alt="preview" />
                <div class="hx-meta">
                  <span>📄 ${imgName}</span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Output -->
          <div class="panel" style="display:flex;flex-direction:column;">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>🔷 HEX Output</span>
              ${hexOutput ? `
                <div style="display:flex;gap:6px;">
                  <button class="btn btn--secondary btn--sm" id="copy-hex-btn">📋 Copy</button>
                  <button class="btn btn--secondary btn--sm" id="download-hex-btn">💾 Save .txt</button>
                </div>
              ` : ''}
            </div>
            ${hexOutput ? `
              <textarea class="form-input jf-textarea" readonly spellcheck="false"
                style="font-family:monospace;font-size:12px;background:var(--bg-secondary);"
              >${hexOutput}</textarea>
              <div class="hx-meta">
                <span>📏 ${formatSize(hexOutput.replace(/\s/g, '').length / 2)} original</span>
                <span>🔢 ${hexOutput.replace(/\s/g, '').length} hex chars</span>
              </div>
            ` : `<div class="jf-empty">Upload an image to generate hex output.</div>`}
          </div>
        </div>
        ` : `
        <!-- HEX to Image -->
        <div class="jf-layout">
          <!-- Input -->
          <div class="panel" style="display:flex;flex-direction:column;">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>🔷 HEX Input</span>
              <div style="display:flex;gap:6px;">
                <button class="btn btn--secondary btn--sm" id="paste-btn">📋 Paste</button>
                <button class="btn btn--secondary btn--sm" id="clear-btn">✕ Clear</button>
              </div>
            </div>
            <textarea class="form-input jf-textarea" id="hex-input" spellcheck="false"
              placeholder="Paste hex string here (e.g. 89 50 4e 47 0d 0a 1a 0a ...)&#10;Spaces and newlines are ignored."
              style="font-family:monospace;font-size:12px;"
            >${escapeHtml(hexInput)}</textarea>
            <div style="margin-top:8px;">
              <button class="btn btn--primary" id="convert-btn">🔷 Convert to Image</button>
            </div>
            ${hexError ? `<div class="jf-error" style="margin-top:8px;"><div style="font-weight:700;">❌ Error</div><div style="font-size:var(--text-sm);font-family:monospace;">${escapeHtml(hexError)}</div></div>` : ''}
          </div>

          <!-- Output -->
          <div class="panel" style="display:flex;flex-direction:column;">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>🖼️ Image Output</span>
              ${previewSrc ? `<button class="btn btn--secondary btn--sm" id="download-img-btn">💾 Download</button>` : ''}
            </div>
            ${previewSrc ? `
              <div class="hx-preview-wrap">
                <img src="${previewSrc}" class="hx-img-preview" alt="converted" />
                <div class="hx-meta">
                  <span>✅ Image reconstructed</span>
                  <span>🗂️ ${detectMime(hexInput)}</span>
                </div>
              </div>
            ` : `<div class="jf-empty">Converted image will appear here.</div>`}
          </div>
        </div>
        `}

        <!-- Info Panel -->
        <div class="panel" style="background:var(--accent-light);border-color:var(--accent);">
          <div class="panel__title">💡 About HEX Image Encoding</div>
          <ul style="font-size:var(--text-sm);color:var(--text-secondary);list-style:disc;padding-left:20px;line-height:2;">
            <li>Every byte of an image file is represented as two hex characters (e.g. <code>FF</code> = 255).</li>
            <li>PNG files start with <code>89 50 4E 47</code>, JPEG with <code>FF D8 FF</code>.</li>
            <li>Useful for firmware analysis, binary inspection, and embedding raw byte data.</li>
            <li>All processing happens locally — no data is uploaded to any server.</li>
          </ul>
        </div>
      </div>
    `;

        /* ── Event Handlers ─────────────────────── */
        // Mode buttons
        container.querySelectorAll('[data-mode]').forEach(btn =>
            btn.addEventListener('click', () => {
                mode = btn.dataset.mode;
                hexInput = ''; hexError = ''; previewSrc = null;
                imgSrc = null; hexOutput = '';
                render();
            })
        );

        if (mode === 'img2hex') {
            const dropZone = container.querySelector('#drop-zone');
            const fileInput = container.querySelector('#file-input');

            dropZone?.addEventListener('click', () => fileInput.click());
            dropZone?.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drop-zone--active'); });
            dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--active'));
            dropZone?.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drop-zone--active'); loadFile(e.dataTransfer.files[0]); });
            fileInput?.addEventListener('change', e => loadFile(e.target.files[0]));

            container.querySelector('#copy-hex-btn')?.addEventListener('click', () => {
                navigator.clipboard.writeText(hexOutput);
                const btn = container.querySelector('#copy-hex-btn');
                btn.textContent = '✅ Copied!';
                setTimeout(() => btn.textContent = '📋 Copy', 1500);
            });

            container.querySelector('#download-hex-btn')?.addEventListener('click', () => {
                const blob = new Blob([hexOutput], { type: 'text/plain' });
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                a.download = imgName + '.hex.txt'; a.click();
            });

        } else {
            const hexArea = container.querySelector('#hex-input');
            hexArea?.addEventListener('input', e => { hexInput = e.target.value; });

            container.querySelector('#paste-btn')?.addEventListener('click', async () => {
                try { hexInput = await navigator.clipboard.readText(); render(); } catch { }
            });

            container.querySelector('#clear-btn')?.addEventListener('click', () => {
                hexInput = ''; hexError = ''; previewSrc = null; render();
            });

            container.querySelector('#convert-btn')?.addEventListener('click', () => {
                hexInput = hexArea?.value ?? hexInput;
                hexError = '';
                try {
                    if (previewSrc) URL.revokeObjectURL(previewSrc);
                    previewSrc = hexToDataUrl(hexInput);
                } catch (e) {
                    hexError = e.message;
                    previewSrc = null;
                }
                render();
            });

            container.querySelector('#download-img-btn')?.addEventListener('click', () => {
                const mime = detectMime(hexInput);
                const ext = mime.split('/')[1] || 'bin';
                const a = document.createElement('a'); a.href = previewSrc;
                a.download = `converted.${ext}`; a.click();
            });
        }
    }

    function loadFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            imgSrc = e.target.result;
            imgName = file.name;
            hexOutput = imgToHex(imgSrc);
            render();
        };
        reader.readAsDataURL(file);
    }

    render();
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
