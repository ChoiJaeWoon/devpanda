/**
 * DevPanda — Background Remover
 * Remove image backgrounds using AI, entirely in the browser.
 */

export async function renderBgRemover(container) {
    let originalFile = null;
    let resultBlob = null;

    function render(state = 'upload') {
        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>BG Remover</span></div>
          <h1 class="tool-header__title">✂️ Background Remover</h1>
          <p class="tool-header__desc">Remove image backgrounds instantly using AI — all in your browser. No server, no uploads, no limits.</p>
        </div>

        ${state === 'upload' ? `
          <div class="panel">
            <div class="bgr-drop-zone" id="bgr-drop-zone">
              <div class="bgr-drop-icon">🖼️</div>
              <div class="bgr-drop-text">Drag & drop or click to upload an image</div>
              <div class="bgr-drop-hint">Supports JPG, PNG, WebP — best results with clear subjects</div>
              <input type="file" id="bgr-file-input" accept="image/*" style="display:none;" />
            </div>
          </div>
        ` : ''}

        ${state === 'loading' ? `
          <div class="panel bgr-loading-panel">
            <div class="bgr-spinner"></div>
            <div class="bgr-loading-title" id="bgr-loading-title">Loading AI model...</div>
            <div class="bgr-progress-wrap">
              <div class="bgr-progress-bar" id="bgr-progress-bar" style="width:0%"></div>
            </div>
            <div class="bgr-loading-hint" id="bgr-loading-hint">Downloading model (~40 MB). This only happens once — it will be cached for future use.</div>
          </div>
        ` : ''}

        ${state === 'result' ? `
          <div class="panel" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn--secondary btn--sm" id="bgr-reset-btn">📁 New Image</button>
            <a class="btn btn--primary btn--sm" id="bgr-download-btn">💾 Download PNG</a>
          </div>

          <div class="jf-layout">
            <div class="panel" style="display:flex;flex-direction:column;gap:8px;">
              <div class="panel__title">📷 Original</div>
              <img id="bgr-orig-img" class="bgr-preview" alt="original" />
            </div>
            <div class="panel" style="display:flex;flex-direction:column;gap:8px;">
              <div class="panel__title">✨ Background Removed</div>
              <img id="bgr-result-img" class="bgr-preview bgr-preview--transparent" alt="result" />
            </div>
          </div>
        ` : ''}

        <!-- Info -->
        <div class="panel" style="background:var(--accent-light);border-color:var(--accent);">
          <div class="panel__title">💡 How it works</div>
          <ul style="font-size:var(--text-sm);color:var(--text-secondary);list-style:disc;padding-left:20px;line-height:2;">
            <li>Uses <strong>@imgly/background-removal</strong> — an ONNX-powered AI model running fully in your browser.</li>
            <li>The AI model (~40 MB) is downloaded from a CDN on first use, then <strong>cached automatically</strong>.</li>
            <li>Your image is <strong>never sent to any server</strong> — all processing happens locally.</li>
            <li>Works best on photos with a <strong>clear subject</strong> (people, objects, products, pets).</li>
            <li>Result is exported as <strong>PNG with transparent background</strong>.</li>
          </ul>
        </div>
      </div>
    `;

        // Events
        const dropZone = container.querySelector('#bgr-drop-zone');
        const fileInput = container.querySelector('#bgr-file-input');

        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('bgr-drop-zone--active'); });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('bgr-drop-zone--active'));
            dropZone.addEventListener('drop', e => {
                e.preventDefault();
                dropZone.classList.remove('bgr-drop-zone--active');
                handleFile(e.dataTransfer.files[0]);
            });
            fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
        }

        container.querySelector('#bgr-reset-btn')?.addEventListener('click', () => {
            originalFile = null;
            resultBlob = null;
            render('upload');
        });

        if (state === 'result' && resultBlob && originalFile) {
            // Set original preview
            const origUrl = URL.createObjectURL(originalFile);
            container.querySelector('#bgr-orig-img').src = origUrl;

            // Set result preview
            const resultUrl = URL.createObjectURL(resultBlob);
            container.querySelector('#bgr-result-img').src = resultUrl;

            // Set download link
            const base = originalFile.name.replace(/\.[^.]+$/, '');
            const dlBtn = container.querySelector('#bgr-download-btn');
            dlBtn.href = resultUrl;
            dlBtn.download = `${base}_no_bg.png`;
        }
    }

    async function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        originalFile = file;

        render('loading');

        try {
            const { removeBackground } = await import('@imgly/background-removal');

            // Progress callback
            const progressTitle = container.querySelector('#bgr-loading-title');
            const progressBar = container.querySelector('#bgr-progress-bar');
            const progressHint = container.querySelector('#bgr-loading-hint');

            const blob = await removeBackground(file, {
                progress: (key, current, total) => {
                    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                    if (progressBar) progressBar.style.width = pct + '%';
                    if (progressTitle) {
                        if (key.includes('fetch') || key.includes('load')) {
                            progressTitle.textContent = `Downloading AI model... ${pct}%`;
                            if (progressHint) progressHint.textContent = 'Downloading model (~40 MB). This only happens once — it will be cached for future use.';
                        } else {
                            progressTitle.textContent = `Processing image... ${pct}%`;
                            if (progressHint) progressHint.textContent = 'The AI is removing the background. This may take a few seconds.';
                        }
                    }
                },
            });

            resultBlob = blob;
            render('result');

        } catch (err) {
            console.error('Background removal failed:', err);
            container.querySelector('.bgr-loading-panel') && (container.querySelector('.bgr-loading-panel').innerHTML = `
        <div style="color:var(--error,#ef4444);text-align:center;padding:24px;">
          ❌ Failed to process image. Please try again with a different image.<br/>
          <small style="color:var(--text-muted)">${err.message}</small><br/><br/>
          <button class="btn btn--secondary btn--sm" id="bgr-err-reset">Try Again</button>
        </div>
      `);
            container.querySelector('#bgr-err-reset')?.addEventListener('click', () => render('upload'));
        }
    }

    render('upload');
}
