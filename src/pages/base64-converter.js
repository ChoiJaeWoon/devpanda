/**
 * DevPanda — Base64 Converter
 * Encode/decode text and files to/from Base64.
 */

export function renderBase64Converter(container) {
  let mode = 'encode';      // 'encode' | 'decode'
  let inputType = 'text';   // 'text' | 'file' | 'hex'
  let outputFormat = 'text'; // 'text' | 'hex' (for decode mode)
  let inputText = '';
  let outputText = '';
  let fileInfo = null;      // { name, size, type, dataUrl }
  let error = '';

  /* ── Core Logic ───────────────────────────── */
  function process() {
    error = '';
    outputText = '';
    if (!inputText.trim() && !fileInfo) return;

    try {
      if (mode === 'encode') {
        if (fileInfo) {
          outputText = fileInfo.dataUrl.split(',')[1];
        } else if (inputType === 'hex') {
          // HEX → Base64
          const hex = inputText.replace(/\s/g, '');
          if (!/^[0-9a-fA-F]*$/.test(hex)) throw new Error('Invalid hex string. Use characters 0-9 and a-f only.');
          if (hex.length % 2 !== 0) throw new Error('Hex string must have an even number of characters.');
          const bytes = new Uint8Array(hex.length / 2);
          for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
          outputText = btoa(String.fromCharCode(...bytes));
        } else {
          outputText = btoa(unescape(encodeURIComponent(inputText)));
        }
      } else {
        // Decode Base64
        const clean = inputText.replace(/\s/g, '');
        const decoded = atob(clean);
        if (outputFormat === 'hex') {
          // Base64 → HEX
          outputText = Array.from(decoded).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
        } else {
          try {
            outputText = decodeURIComponent(escape(decoded));
          } catch {
            outputText = decoded;
          }
        }
      }
    } catch (e) {
      error = e.message.includes('Invalid character')
        ? 'Invalid Base64 string. Make sure the input is valid Base64-encoded data.'
        : e.message;
    }
  }

  function isImageDataUrl() {
    return fileInfo?.dataUrl?.startsWith('data:image/');
  }

  function isDecodedImage() {
    // Check if decoded base64 starts with image magic bytes via output
    if (mode !== 'decode' || !outputText) return false;
    try {
      const clean = inputText.replace(/\s/g, '');
      // Peek at first bytes to check for common image headers
      const first = atob(clean.slice(0, 12));
      return first.startsWith('\x89PNG') || first.startsWith('\xff\xd8') || first.startsWith('GIF') || first.startsWith('RIFF');
    } catch { return false; }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  /* ── Render ───────────────────────────────── */
  function render() {
    process();

    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Base64 Converter</span></div>
          <h1 class="tool-header__title">🔑 Base64 Converter</h1>
          <p class="tool-header__desc">Encode text or files to Base64, or decode Base64 back to text or image.</p>
        </div>

        <!-- Mode + Type Controls -->
        <div class="panel">
          <div class="jf-controls">
            <div class="jf-mode-tabs">
              <button class="jf-mode-btn ${mode === 'encode' ? 'active' : ''}" data-mode="encode">🔒 Encode</button>
              <button class="jf-mode-btn ${mode === 'decode' ? 'active' : ''}" data-mode="decode">🔓 Decode</button>
            </div>
            ${mode === 'encode' ? `
              <div class="jf-mode-tabs">
                <button class="jf-mode-btn ${inputType === 'text' ? 'active' : ''}" data-type="text">📝 Text</button>
                <button class="jf-mode-btn ${inputType === 'file' ? 'active' : ''}" data-type="file">📁 File</button>
                <button class="jf-mode-btn ${inputType === 'hex' ? 'active' : ''}" data-type="hex">🔢 HEX</button>
              </div>
            ` : `
              <div class="jf-mode-tabs">
                <button class="jf-mode-btn ${outputFormat === 'text' ? 'active' : ''}" data-outfmt="text">📝 Text out</button>
                <button class="jf-mode-btn ${outputFormat === 'hex' ? 'active' : ''}" data-outfmt="hex">🔢 HEX out</button>
              </div>
            `}
          </div>
        </div>

        <!-- Layout -->
        <div class="jf-layout">
          <!-- Input -->
          <div class="panel" style="display:flex;flex-direction:column;">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>${mode === 'encode' ? (inputType === 'file' ? '📁 File Input' : '📝 Text Input') : '🔑 Base64 Input'}</span>
              <div style="display:flex;gap:6px;">
                ${inputType === 'text' ? `<button class="btn btn--secondary btn--sm" id="paste-btn">📋 Paste</button>` : ''}
                <button class="btn btn--secondary btn--sm" id="clear-btn">✕ Clear</button>
                ${mode === 'encode' && inputType === 'text' ? `<button class="btn btn--secondary btn--sm" id="sample-btn">📄 Sample</button>` : ''}
              </div>
            </div>

            ${mode === 'encode' && inputType === 'file' ? `
              <div class="drop-zone" id="drop-zone" style="margin-top:var(--space-sm);">
                <div class="drop-zone__icon">📁</div>
                <div class="drop-zone__text">Drag & drop a file or click to upload</div>
                <div class="drop-zone__hint">Any file type supported</div>
                <input type="file" id="file-input" style="display:none;" />
              </div>
              ${fileInfo ? `
                <div class="b64-file-info">
                  <span>📄 ${fileInfo.name}</span>
                  <span style="color:var(--text-muted);">${fileInfo.type || 'unknown'} · ${formatSize(fileInfo.size)}</span>
                  ${isImageDataUrl() ? `<img src="${fileInfo.dataUrl}" alt="preview" class="b64-img-preview" />` : ''}
                </div>
              ` : ''}
            ` : `
              <textarea class="form-input jf-textarea" id="b64-input" spellcheck="false"
                placeholder="${mode === 'encode' && inputType === 'hex'
        ? 'Enter hex string (e.g. 48 65 6c 6c 6f)...'
        : mode === 'encode' ? 'Enter text to encode...'
          : 'Paste Base64 string to decode...'}"
                style="font-family:${inputType === 'hex' ? 'monospace' : 'inherit'};"
              >${escapeHtml(inputText)}</textarea>
            `}

            <div style="margin-top:8px;">
              <button class="btn btn--primary" id="process-btn">${mode === 'encode' ? '🔒 Encode' : '🔓 Decode'}</button>
            </div>
          </div>

          <!-- Output -->
          <div class="panel" style="display:flex;flex-direction:column;">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>${mode === 'encode' ? '🔑 Base64 Output' : '📝 Decoded Output'}</span>
              ${outputText ? `
                <div style="display:flex;gap:6px;">
                  <button class="btn btn--secondary btn--sm" id="copy-btn">📋 Copy</button>
                  <button class="btn btn--secondary btn--sm" id="download-btn">💾 Download</button>
                </div>
              ` : ''}
            </div>

            ${error ? `
              <div class="jf-error" style="margin-top:var(--space-sm);">
                <div style="font-weight:700;margin-bottom:4px;">❌ Error</div>
                <div style="font-size:var(--text-sm);font-family:monospace;">${escapeHtml(error)}</div>
              </div>
            ` : outputText ? `
              <textarea class="form-input jf-textarea" id="b64-output" readonly spellcheck="false"
                style="background:var(--bg-secondary);"
              >${escapeHtml(outputText)}</textarea>
              ${isDecodedImage() ? `
                <div class="b64-file-info" style="margin-top:8px;">
                  <span style="color:var(--text-muted);font-size:var(--text-xs);">🖼 Image detected — click Download to save</span>
                </div>
              ` : ''}
              <div class="b64-meta">
                <span>📏 ${formatSize(outputText.length)}</span>
                ${mode === 'encode' ? `<span>📦 ${Math.ceil(outputText.length / 4 * 3)} bytes decoded</span>` : ''}
              </div>
            ` : `
              <div class="jf-empty">Output will appear here.</div>
            `}
          </div>
        </div>

        <!-- Info Panel -->
        <div class="panel" style="background:var(--accent-light);border-color:var(--accent);">
          <div class="panel__title">💡 About Base64</div>
          <ul style="font-size:var(--text-sm);color:var(--text-secondary);list-style:disc;padding-left:20px;line-height:2;">
            <li>Base64 encodes binary data as ASCII text — useful for embedding images in HTML/CSS.</li>
            <li>Encoded output is ~33% larger than the original data.</li>
            <li>Common uses: email attachments (MIME), data URIs, JWT tokens, API auth headers.</li>
            <li>Use <strong>File</strong> mode to encode images or binary files directly.</li>
          </ul>
        </div>
      </div>
    `;

    /* ── Event Handlers ─────────────────────── */
    const input = container.querySelector('#b64-input');

    // Mode buttons
    container.querySelectorAll('[data-mode]').forEach(btn =>
      btn.addEventListener('click', () => {
        mode = btn.dataset.mode;
        inputText = ''; outputText = ''; fileInfo = null; error = '';
        if (mode === 'decode') inputType = 'text';
        render();
      })
    );

    // Type buttons
    container.querySelectorAll('[data-type]').forEach(btn =>
      btn.addEventListener('click', () => {
        inputType = btn.dataset.type;
        inputText = ''; fileInfo = null; error = '';
        render();
      })
    );

    // Output format buttons (decode mode)
    container.querySelectorAll('[data-outfmt]').forEach(btn =>
      btn.addEventListener('click', () => {
        outputFormat = btn.dataset.outfmt;
        render();
      })
    );

    // Live input
    input?.addEventListener('input', e => { inputText = e.target.value; });

    // Paste
    container.querySelector('#paste-btn')?.addEventListener('click', async () => {
      try { inputText = await navigator.clipboard.readText(); render(); } catch { }
    });

    // Clear
    container.querySelector('#clear-btn')?.addEventListener('click', () => {
      inputText = ''; outputText = ''; fileInfo = null; error = ''; render();
    });

    // Sample
    container.querySelector('#sample-btn')?.addEventListener('click', () => {
      inputText = 'Hello, DevPanda! This is a Base64 encoding demo 🚀';
      render();
    });

    // Process
    container.querySelector('#process-btn')?.addEventListener('click', () => {
      inputText = input?.value ?? inputText;
      render();
    });

    // Ctrl+Enter
    input?.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        inputText = input.value; render();
      }
    });

    // File drop zone
    const dropZone = container.querySelector('#drop-zone');
    const fileInput = container.querySelector('#file-input');
    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drop-zone--active'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--active'));
      dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drop-zone--active'); handleFile(e.dataTransfer.files[0]); });
      fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
    }

    // Copy
    const copyBtn = container.querySelector('#copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputText);
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
      });
    }

    // Download
    container.querySelector('#download-btn')?.addEventListener('click', () => {
      let blob, filename;
      if (mode === 'encode') {
        blob = new Blob([outputText], { type: 'text/plain' });
        filename = (fileInfo?.name ?? 'output') + '.b64';
      } else {
        // Try to reconstruct binary
        try {
          const binary = atob(inputText.replace(/\s/g, ''));
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          blob = new Blob([bytes]);
          filename = 'decoded_file';
        } catch {
          blob = new Blob([outputText], { type: 'text/plain' });
          filename = 'decoded.txt';
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    });
  }

  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      fileInfo = { name: file.name, size: file.size, type: file.type, dataUrl: e.target.result };
      render();
    };
    reader.readAsDataURL(file);
  }

  render();
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
