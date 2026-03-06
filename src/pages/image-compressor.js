/**
 * DevPanda — Image Compressor
 * Reduce image file size without changing resolution.
 */

export function renderImageCompressor(container) {
    let originalFile = null;
    let originalDataUrl = null;
    let compressedBlob = null;
    let quality = 0.8;
    let outputFormat = 'webp'; // 'webp' | 'jpeg' | 'png'

    function formatSize(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(2)} MB`;
    }

    function savings(orig, compressed) {
        const pct = ((1 - compressed / orig) * 100).toFixed(1);
        return pct > 0 ? `▼ ${pct}% 감소` : `▲ ${Math.abs(pct)}% 증가`;
    }

    function savingsColor(orig, compressed) {
        return compressed < orig ? '#22c55e' : '#ef4444';
    }

    async function compress(dataUrl, format, q) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                const ctx = canvas.getContext('2d');
                // White background for JPEG (no alpha)
                if (format === 'jpeg') {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                const mimeType = `image/${format}`;
                // PNG ignores quality (lossless)
                canvas.toBlob(blob => resolve(blob), mimeType, format === 'png' ? undefined : q);
            };
            img.src = dataUrl;
        });
    }

    async function runCompress() {
        if (!originalDataUrl) return;
        compressedBlob = await compress(originalDataUrl, outputFormat, quality);
        render();
    }

    function loadFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        originalFile = file;
        const reader = new FileReader();
        reader.onload = e => {
            originalDataUrl = e.target.result;
            runCompress();
        };
        reader.readAsDataURL(file);
    }

    function render() {
        const compressedUrl = compressedBlob ? URL.createObjectURL(compressedBlob) : null;
        const origSize = originalFile?.size ?? 0;
        const compSize = compressedBlob?.size ?? 0;

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Image Compressor</span></div>
          <h1 class="tool-header__title">🗜️ Image Compressor</h1>
          <p class="tool-header__desc">Reduce image file size without changing resolution. Supports JPEG, PNG, WebP output.</p>
        </div>

        <!-- Upload -->
        ${!originalFile ? `
          <div class="panel">
            <div class="drop-zone" id="drop-zone">
              <div class="drop-zone__icon">🖼️</div>
              <div class="drop-zone__text">이미지를 드래그하거나 클릭해서 업로드</div>
              <div class="drop-zone__hint">JPG, PNG, WebP, GIF 지원</div>
              <input type="file" id="file-input" accept="image/*" style="display:none;" />
            </div>
          </div>
        ` : `
          <!-- Settings -->
          <div class="panel" style="display:flex;flex-wrap:wrap;gap:var(--space-md);align-items:flex-end;">
            <!-- Format -->
            <div>
              <div style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:6px;">출력 포맷</div>
              <div class="jf-mode-tabs">
                <button class="jf-mode-btn ${outputFormat === 'webp' ? 'active' : ''}" data-fmt="webp">WebP 추천</button>
                <button class="jf-mode-btn ${outputFormat === 'jpeg' ? 'active' : ''}" data-fmt="jpeg">JPEG</button>
                <button class="jf-mode-btn ${outputFormat === 'png' ? 'active' : ''}" data-fmt="png">PNG</button>
              </div>
            </div>

            <!-- Quality slider -->
            ${outputFormat !== 'png' ? `
              <div style="flex:1;min-width:200px;">
                <div style="font-size:var(--text-sm);color:var(--text-muted);margin-bottom:6px;">
                  품질: <strong>${Math.round(quality * 100)}%</strong>
                  <span style="color:var(--text-muted);font-size:11px;"> (높을수록 화질 좋고 용량 큼)</span>
                </div>
                <input type="range" id="quality-slider" min="1" max="100" value="${Math.round(quality * 100)}"
                  style="width:100%;accent-color:var(--accent);" />
              </div>
            ` : `
              <div style="font-size:var(--text-sm);color:var(--text-muted);padding:8px 12px;background:var(--bg-secondary);border-radius:var(--radius-md);">
                💡 PNG는 무손실 포맷이라 품질 슬라이더가 없어요. WebP나 JPEG로 변환하면 용량을 크게 줄일 수 있어요.
              </div>
            `}

            <button class="btn btn--secondary btn--sm" id="change-file-btn">📁 다른 이미지</button>
          </div>

          <!-- Before / After -->
          <div class="jf-layout">
            <!-- Original -->
            <div class="panel" style="display:flex;flex-direction:column;gap:8px;">
              <div class="panel__title">📷 원본</div>
              <img src="${originalDataUrl}" class="ic-preview" alt="original" />
              <div class="ic-meta">
                <span>📁 ${originalFile.name}</span>
                <span>📏 ${originalFile.width ?? ''}  ${img_dimensions(originalDataUrl)}</span>
                <span style="font-weight:600;">💾 ${formatSize(origSize)}</span>
              </div>
            </div>

            <!-- Compressed -->
            <div class="panel" style="display:flex;flex-direction:column;gap:8px;">
              <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
                <span>✨ 압축 결과</span>
                ${compressedUrl ? `<button class="btn btn--primary btn--sm" id="download-btn">💾 다운로드</button>` : ''}
              </div>
              ${compressedUrl ? `
                <img src="${compressedUrl}" class="ic-preview" alt="compressed" />
                <div class="ic-meta">
                  <span>🗂️ ${outputFormat.toUpperCase()}</span>
                  <span style="font-weight:600;color:${savingsColor(origSize, compSize)};">
                    💾 ${formatSize(compSize)} &nbsp;${savings(origSize, compSize)}
                  </span>
                </div>
                <div class="ic-savings-bar">
                  <div class="ic-savings-fill" style="width:${Math.min(100, (compSize / origSize) * 100).toFixed(1)}%;background:${savingsColor(origSize, compSize)};"></div>
                </div>
              ` : `<div class="jf-empty">압축 중...</div>`}
            </div>
          </div>
        `}

        <!-- Info -->
        <div class="panel" style="background:var(--accent-light);border-color:var(--accent);">
          <div class="panel__title">💡 압축 방식 안내</div>
          <ul style="font-size:var(--text-sm);color:var(--text-secondary);list-style:disc;padding-left:20px;line-height:2;">
            <li><strong>WebP</strong>: 최신 포맷, 같은 화질에서 JPEG보다 25~35% 더 작게. 대부분 브라우저 지원.</li>
            <li><strong>JPEG</strong>: 사진에 최적. 품질 70~85%면 육안으로 차이 거의 없음.</li>
            <li><strong>PNG</strong>: 무손실이라 압축 효과 없음. WebP로 전환 권장.</li>
            <li>해상도(픽셀 수)는 전혀 변경되지 않아요 — 오직 인코딩 방식만 바뀝니다.</li>
          </ul>
        </div>
      </div>
    `;

        /* ── Events ─── */
        const dropZone = container.querySelector('#drop-zone');
        const fileInput = container.querySelector('#file-input');
        if (dropZone && fileInput) {
            dropZone.addEventListener('click', () => fileInput.click());
            dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drop-zone--active'); });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--active'));
            dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drop-zone--active'); loadFile(e.dataTransfer.files[0]); });
            fileInput.addEventListener('change', e => loadFile(e.target.files[0]));
        }

        container.querySelector('#change-file-btn')?.addEventListener('click', () => {
            originalFile = null; originalDataUrl = null; compressedBlob = null; render();
        });

        container.querySelectorAll('[data-fmt]').forEach(btn =>
            btn.addEventListener('click', () => { outputFormat = btn.dataset.fmt; runCompress(); })
        );

        container.querySelector('#quality-slider')?.addEventListener('input', e => {
            quality = e.target.value / 100;
            container.querySelector('strong') && (container.querySelector('strong').textContent = e.target.value + '%');
            clearTimeout(window._icTimer);
            window._icTimer = setTimeout(() => runCompress(), 300);
        });

        container.querySelector('#download-btn')?.addEventListener('click', () => {
            const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
            const base = originalFile.name.replace(/\.[^.]+$/, '');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(compressedBlob);
            a.download = `${base}_compressed.${ext}`;
            a.click();
        });
    }

    // Helper: async dimensions (not blocking)
    function img_dimensions() { return ''; }

    render();
}
