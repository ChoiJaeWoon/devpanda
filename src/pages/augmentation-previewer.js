/**
 * DevPanda — Augmentation Previewer
 * Upload an image, apply augmentations via Canvas API, preview grid.
 */

const AUGMENTATIONS = [
    { id: 'flip_h', label: 'Flip Horizontal', type: 'toggle', default: true },
    { id: 'flip_v', label: 'Flip Vertical', type: 'toggle', default: false },
    { id: 'rotation', label: 'Rotation', type: 'range', min: -45, max: 45, step: 1, default: 15, unit: '°' },
    { id: 'brightness', label: 'Brightness', type: 'range', min: -100, max: 100, step: 1, default: 30, unit: '' },
    { id: 'contrast', label: 'Contrast', type: 'range', min: -100, max: 100, step: 1, default: 20, unit: '' },
    { id: 'blur', label: 'Blur', type: 'range', min: 0, max: 10, step: 0.5, default: 2, unit: 'px' },
    { id: 'sharpen', label: 'Sharpen', type: 'toggle', default: false },
    { id: 'grayscale', label: 'Grayscale', type: 'toggle', default: false },
    { id: 'noise', label: 'Noise', type: 'range', min: 0, max: 80, step: 1, default: 20, unit: '' },
    { id: 'hue', label: 'Hue Shift', type: 'range', min: -180, max: 180, step: 1, default: 30, unit: '°' },
    { id: 'saturation', label: 'Saturation', type: 'range', min: -100, max: 100, step: 1, default: 40, unit: '' },
    { id: 'crop', label: 'Random Crop', type: 'range', min: 10, max: 50, step: 5, default: 20, unit: '%' },
    { id: 'cutout', label: 'Cutout / Erase', type: 'range', min: 5, max: 40, step: 5, default: 15, unit: '%' },
];

/* ── Canvas Helpers ──────────────────────────── */
function createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
}

function imageToCanvas(img) {
    const c = createCanvas(img.naturalWidth || img.width, img.naturalHeight || img.height);
    c.getContext('2d').drawImage(img, 0, 0);
    return c;
}

function applyPixelOps(canvas, { brightness = 0, contrast = 0, noise = 0, grayscale = false, sharpen = false }) {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // Sharpen kernel convolve (3x3)
    if (sharpen) {
        const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
        const w = canvas.width, h = canvas.height;
        const src = new Uint8ClampedArray(d);
        for (let y = 1; y < h - 1; y++) {
            for (let x = 1; x < w - 1; x++) {
                for (let c = 0; c < 3; c++) {
                    let val = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            val += src[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)];
                        }
                    }
                    d[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, val));
                }
            }
        }
    }

    for (let i = 0; i < d.length; i += 4) {
        let r = d[i], g = d[i + 1], b = d[i + 2];

        // Brightness
        r += brightness; g += brightness; b += brightness;

        // Contrast
        const f = (259 * (contrast + 255)) / (255 * (259 - contrast));
        r = f * (r - 128) + 128;
        g = f * (g - 128) + 128;
        b = f * (b - 128) + 128;

        // Grayscale
        if (grayscale) {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            r = g = b = gray;
        }

        // Noise
        if (noise > 0) {
            const n = (Math.random() - 0.5) * noise * 2;
            r += n; g += n; b += n;
        }

        d[i] = Math.max(0, Math.min(255, r));
        d[i + 1] = Math.max(0, Math.min(255, g));
        d[i + 2] = Math.max(0, Math.min(255, b));
    }

    ctx.putImageData(imgData, 0, 0);
}

function applyCSSFilters(canvas, { blur = 0, hue = 0, saturation = 0 }) {
    if (blur === 0 && hue === 0 && saturation === 0) return canvas;
    const out = createCanvas(canvas.width, canvas.height);
    const ctx = out.getContext('2d');
    const saturatePct = 100 + saturation;
    ctx.filter = [
        blur > 0 ? `blur(${blur}px)` : '',
        hue !== 0 ? `hue-rotate(${hue}deg)` : '',
        saturation !== 0 ? `saturate(${saturatePct}%)` : '',
    ].filter(Boolean).join(' ') || 'none';
    ctx.drawImage(canvas, 0, 0);
    return out;
}

function applyGeometric(canvas, { flip_h, flip_v, rotation, crop, cutout }) {
    let w = canvas.width, h = canvas.height;

    // Random crop
    let srcX = 0, srcY = 0, srcW = w, srcH = h;
    if (crop > 0) {
        const px = Math.floor(w * crop / 100 * Math.random());
        const py = Math.floor(h * crop / 100 * Math.random());
        srcX = px; srcY = py;
        srcW = w - px * 2; srcH = h - py * 2;
    }

    const out = createCanvas(w, h);
    const ctx = out.getContext('2d');
    ctx.save();
    ctx.translate(w / 2, h / 2);
    if (flip_h) ctx.scale(-1, 1);
    if (flip_v) ctx.scale(1, -1);
    if (rotation) ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(canvas, srcX, srcY, srcW, srcH, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Cutout (random erasing)
    if (cutout > 0) {
        const cw = Math.floor(w * cutout / 100);
        const ch = Math.floor(h * cutout / 100);
        const cx = Math.floor(Math.random() * (w - cw));
        const cy = Math.floor(Math.random() * (h - cw));
        ctx.fillStyle = '#000';
        ctx.fillRect(cx, cy, cw, ch);
    }

    return out;
}

function applyAugmentation(sourceImg, params) {
    let canvas = imageToCanvas(sourceImg);
    canvas = applyGeometric(canvas, params);
    applyPixelOps(canvas, params);
    canvas = applyCSSFilters(canvas, params);
    return canvas;
}

/* ── Preset Combos ───────────────────────────── */
const COMBOS = [
    { label: 'Original', params: {} },
    { label: 'Flip H', params: { flip_h: true } },
    { label: 'Rotated', params: { rotation: 15 } },
    { label: 'Bright', params: { brightness: 50 } },
    { label: 'Dark', params: { brightness: -50, contrast: 20 } },
    { label: 'Grayscale', params: { grayscale: true } },
    { label: 'Blur', params: { blur: 3 } },
    { label: 'Noisy', params: { noise: 30 } },
    { label: 'Hue Shift', params: { hue: 90 } },
    { label: 'Crop', params: { crop: 20 } },
    { label: 'Cutout', params: { cutout: 20 } },
    { label: 'Heavy Aug', params: { flip_h: true, rotation: 10, brightness: 20, noise: 15, hue: 45, blur: 1 } },
];

/* ── Main ────────────────────────────────────── */
export function renderAugmentationPreviewer(container) {
    let sourceImg = null;
    let params = {};

    // Init params from defaults
    AUGMENTATIONS.forEach(a => { params[a.id] = a.default; });

    function render() {
        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Augmentation Previewer</span></div>
          <h1 class="tool-header__title">🖼️ Augmentation Previewer</h1>
          <p class="tool-header__desc">Upload an image and preview how data augmentations look in real-time. Use sliders and toggles to control each transform.</p>
        </div>

        <div class="aug-layout">
          <!-- Controls -->
          <div>
            <div class="panel">
              <div class="panel__title">📂 Upload Image</div>
              ${!sourceImg ? `
                <div class="drop-zone" id="aug-drop" style="margin-top:var(--space-sm);">
                  <div class="drop-zone__icon">🖼️</div>
                  <div class="drop-zone__text">Drag & drop an image here</div>
                  <div class="drop-zone__hint">JPEG, PNG, WebP supported</div>
                  <input type="file" id="aug-file" accept="image/*" style="display:none;" />
                </div>
              ` : `
                <div style="margin-top:var(--space-sm);display:flex;align-items:center;gap:var(--space-sm);">
                  <img id="aug-thumb" src="${sourceImg.src}" style="height:48px;width:48px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--border);" />
                  <div style="flex:1;font-size:var(--text-sm);color:var(--text-secondary);">${sourceImg.naturalWidth}×${sourceImg.naturalHeight}px</div>
                  <button class="btn btn--secondary btn--sm" id="aug-reset-img">Change</button>
                </div>
              `}
            </div>

            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title" style="display:flex;justify-content:space-between;">
                <span>⚙️ Augmentations</span>
                <button class="btn btn--secondary btn--sm" id="aug-randomize">🎲 Randomize</button>
              </div>
              <div class="aug-controls">
                ${AUGMENTATIONS.map(a => `
                  <div class="aug-ctrl">
                    <div class="aug-ctrl__header">
                      <label class="aug-ctrl__label">${a.label}</label>
                      ${a.type === 'toggle'
                ? `<label class="aug-toggle">
                             <input type="checkbox" data-id="${a.id}" ${params[a.id] ? 'checked' : ''} />
                             <span class="aug-toggle__track"></span>
                           </label>`
                : `<span class="aug-ctrl__val" id="val-${a.id}">${params[a.id]}${a.unit}</span>`
            }
                    </div>
                    ${a.type === 'range' ? `
                      <input class="aug-slider" type="range"
                        data-id="${a.id}" min="${a.min}" max="${a.max}" step="${a.step}"
                        value="${params[a.id]}" />
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Preview Grid -->
          <div>
            ${!sourceImg ? `
              <div class="mpc-empty" style="height:400px;justify-content:center;">
                <div style="font-size:64px;">🖼️</div>
                <div>Upload an image to see augmentation previews</div>
              </div>
            ` : `
              <div class="panel">
                <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
                  <span>👁️ Preview Grid</span>
                  <button class="btn btn--secondary btn--sm" id="aug-refresh">🔄 Re-randomize</button>
                </div>
                <div class="aug-grid" id="aug-grid">
                  ${COMBOS.map(c => `
                    <div class="aug-card">
                      <canvas class="aug-canvas" data-combo='${JSON.stringify(c.params)}'></canvas>
                      <div class="aug-card__label">${c.label}</div>
                    </div>
                  `).join('')}
                </div>
                <!-- Custom preview -->
                <div style="margin-top:var(--space-md);padding-top:var(--space-md);border-top:1px solid var(--border);">
                  <div class="panel__title" style="margin-bottom:var(--space-sm);">🎛️ Your Custom Augmentation</div>
                  <div style="display:flex;gap:var(--space-md);align-items:flex-start;flex-wrap:wrap;">
                    <canvas id="aug-custom" class="aug-canvas aug-canvas--lg"></canvas>
                    <div style="font-size:var(--text-xs);color:var(--text-muted);line-height:2;">
                      ${AUGMENTATIONS.filter(a => {
                if (a.type === 'toggle') return params[a.id];
                if (a.type === 'range') return params[a.id] !== 0;
                return false;
            }).map(a => `<span class="aug-tag">${a.label}: <strong>${params[a.id]}${a.unit || ''}</strong></span>`).join(' ')}
                    </div>
                  </div>
                </div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

        setupEvents();
        if (sourceImg) requestAnimationFrame(renderPreviews);
    }

    function renderPreviews() {
        // Preset grid
        container.querySelectorAll('.aug-canvas[data-combo]').forEach(canvas => {
            const combo = JSON.parse(canvas.dataset.combo);
            const merged = { ...params, ...combo };
            const result = applyAugmentation(sourceImg, merged);
            canvas.width = result.width;
            canvas.height = result.height;
            canvas.getContext('2d').drawImage(result, 0, 0);
        });

        // Custom preview
        const custom = container.querySelector('#aug-custom');
        if (custom) {
            const result = applyAugmentation(sourceImg, params);
            custom.width = result.width;
            custom.height = result.height;
            custom.getContext('2d').drawImage(result, 0, 0);
        }
    }

    function setupEvents() {
        // File upload
        const drop = container.querySelector('#aug-drop');
        const fi = container.querySelector('#aug-file');
        if (drop && fi) {
            drop.addEventListener('click', () => fi.click());
            drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drop-zone--active'); });
            drop.addEventListener('dragleave', () => drop.classList.remove('drop-zone--active'));
            drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('drop-zone--active'); loadFile(e.dataTransfer.files[0]); });
            fi.addEventListener('change', e => loadFile(e.target.files[0]));
        }

        container.querySelector('#aug-reset-img')?.addEventListener('click', () => { sourceImg = null; render(); });
        container.querySelector('#aug-refresh')?.addEventListener('click', renderPreviews);

        // Sliders
        container.querySelectorAll('.aug-slider').forEach(slider => {
            slider.addEventListener('input', e => {
                params[e.target.dataset.id] = parseFloat(e.target.value);
                const valEl = container.querySelector(`#val-${e.target.dataset.id}`);
                const aug = AUGMENTATIONS.find(a => a.id === e.target.dataset.id);
                if (valEl && aug) valEl.textContent = `${e.target.value}${aug.unit}`;
                if (sourceImg) renderPreviews();
            });
        });

        // Toggles
        container.querySelectorAll('[data-id]').forEach(cb => {
            if (cb.type === 'checkbox') {
                cb.addEventListener('change', e => {
                    params[e.target.dataset.id] = e.target.checked;
                    if (sourceImg) renderPreviews();
                });
            }
        });

        // Randomize
        container.querySelector('#aug-randomize')?.addEventListener('click', () => {
            AUGMENTATIONS.forEach(a => {
                if (a.type === 'toggle') params[a.id] = Math.random() > 0.5;
                else params[a.id] = parseFloat((Math.random() * (a.max - a.min) + a.min).toFixed(1));
            });
            render();
        });
    }

    function loadFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { sourceImg = img; render(); };
        img.src = url;
    }

    render();
}
