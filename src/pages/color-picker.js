/**
 * DevPanda — Color Picker
 * HEX / RGB / HSL conversion, harmony colors, and palette generation.
 */

export function renderColorPicker(container) {
  let hex = '#4f46e5';
  let copiedKey = null;

  /* ── Color Math ───────────────────────────── */
  function hexToRgb(h) {
    const c = h.replace('#', '');
    const n = parseInt(c.length === 3
      ? c.split('').map(x => x + x).join('')
      : c, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function rgbToHex({ r, g, b }) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function rgbToHsl({ r, g, b }) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return rgbToHex({ r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) });
  }

  function getLuminance({ r, g, b }) {
    const toLinear = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  }

  function textColor(hexVal) {
    return getLuminance(hexToRgb(hexVal)) > 0.35 ? '#1a1a2e' : '#ffffff';
  }

  /* ── Harmony Colors ───────────────────────── */
  function buildHarmonies(h, s, l) {
    return [
      { label: 'Complementary', colors: [hex, hslToHex((h + 180) % 360, s, l)] },
      { label: 'Triadic', colors: [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)] },
      { label: 'Analogous', colors: [hslToHex((h - 30 + 360) % 360, s, l), hex, hslToHex((h + 30) % 360, s, l)] },
      { label: 'Split-Comp.', colors: [hex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)] },
    ];
  }

  /* ── Shades & Tints ───────────────────────── */
  function buildShades(h, s) {
    return [95, 85, 75, 60, 45, 35, 25, 15].map(l => ({ l, hex: hslToHex(h, s, l) }));
  }

  function buildTints(h, s) {
    return [90, 80, 70, 60, 50, 40, 30, 20].map(l => ({ l, hex: hslToHex(h, Math.min(s, 60), l) }));
  }

  /* ── Render ───────────────────────────────── */
  function render() {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    const fg = textColor(hex);
    const harmonies = buildHarmonies(hsl.h, hsl.s, hsl.l);
    const shades = buildShades(hsl.h, hsl.s);

    const formats = [
      { key: 'hex', label: 'HEX', value: hex.toUpperCase() },
      { key: 'rgb', label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
      { key: 'hsl', label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
      { key: 'rgba', label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    ];

    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Color Picker</span></div>
          <h1 class="tool-header__title">🎨 Color Picker</h1>
          <p class="tool-header__desc">Convert between HEX, RGB, and HSL. Generate harmonies, shades, and palettes.</p>
        </div>

        <!-- Main Picker + Preview -->
        <div class="cp-top">
          <!-- Native color input -->
          <div class="cp-picker-wrap">
            <input type="color" id="color-native" value="${hex}" class="cp-native" />
            ${'EyeDropper' in window ? `
              <button class="btn btn--secondary btn--sm" id="eyedropper-btn"
                style="width:80px;display:flex;align-items:center;justify-content:center;gap:4px;">
                🗒️ Pick
              </button>
            ` : '<span style="font-size:10px;color:var(--text-muted);text-align:center;">EyeDropper not<br>supported</span>'}
          </div>

          <!-- Manual inputs -->
          <div class="cp-inputs">
            <div class="cp-input-group">
              <label class="form-label">HEX</label>
              <input class="form-input cp-hex-input" id="hex-input" value="${hex.toUpperCase()}" maxlength="7" spellcheck="false" />
            </div>
            <div class="cp-input-group">
              <label class="form-label">R</label>
              <input class="form-input cp-channel" id="r-input" type="number" min="0" max="255" value="${rgb.r}" />
            </div>
            <div class="cp-input-group">
              <label class="form-label">G</label>
              <input class="form-input cp-channel" id="g-input" type="number" min="0" max="255" value="${rgb.g}" />
            </div>
            <div class="cp-input-group">
              <label class="form-label">B</label>
              <input class="form-input cp-channel" id="b-input" type="number" min="0" max="255" value="${rgb.b}" />
            </div>
            <div class="cp-input-group">
              <label class="form-label">H</label>
              <input class="form-input cp-channel" id="h-input" type="number" min="0" max="360" value="${hsl.h}" />
            </div>
            <div class="cp-input-group">
              <label class="form-label">S%</label>
              <input class="form-input cp-channel" id="s-input" type="number" min="0" max="100" value="${hsl.s}" />
            </div>
            <div class="cp-input-group">
              <label class="form-label">L%</label>
              <input class="form-input cp-channel" id="l-input" type="number" min="0" max="100" value="${hsl.l}" />
            </div>
          </div>
        </div>

        <!-- Copy Formats -->
        <div class="panel">
          <div class="panel__title">📋 Copy Format</div>
          <div class="cp-formats">
            ${formats.map(f => `
              <button class="cp-format-btn ${copiedKey === f.key ? 'copied' : ''}" data-copy="${f.value}" data-key="${f.key}">
                <span class="cp-format-label">${f.label}</span>
                <span class="cp-format-value">${f.value}</span>
                <span class="cp-format-action">${copiedKey === f.key ? '✅' : '📋'}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Shades & Tints -->
        <div class="panel">
          <div class="panel__title">🎨 Shades</div>
          <div class="cp-swatch-row">
            ${shades.map(s => `
              <button class="cp-swatch" data-pick="${s.hex}"
                style="background:${s.hex};color:${textColor(s.hex)};"
                title="${s.hex.toUpperCase()} · L:${s.l}%">
                <span class="cp-swatch-hex">${s.hex.toUpperCase()}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Harmony Colors -->
        <div class="panel">
          <div class="panel__title">🔮 Color Harmonies</div>
          <div class="cp-harmonies">
            ${harmonies.map(h => `
              <div class="cp-harmony">
                <div class="cp-harmony-label">${h.label}</div>
                <div class="cp-harmony-swatches">
                  ${h.colors.map(c => `
                    <button class="cp-harmony-swatch" data-pick="${c}"
                      style="background:${c};" title="${c.toUpperCase()}">
                    </button>
                  `).join('')}
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${h.colors.map(c => c.toUpperCase()).join(' · ')}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Preset Palettes -->
        <div class="panel">
          <div class="panel__title">🌈 Quick Presets</div>
          <div class="cp-swatch-row" style="flex-wrap:wrap;gap:8px;">
            ${PRESETS.map(c => `
              <button class="cp-swatch cp-swatch--sm" data-pick="${c}"
                style="background:${c};" title="${c.toUpperCase()}">
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    /* ── Event Handlers ─────────────────────── */
    // Native color wheel
    container.querySelector('#color-native').addEventListener('input', e => {
      hex = e.target.value; render();
    });

    // EyeDropper
    const eyeBtn = container.querySelector('#eyedropper-btn');
    if (eyeBtn && 'EyeDropper' in window) {
      eyeBtn.addEventListener('click', async () => {
        try {
          const dropper = new EyeDropper();
          const result = await dropper.open();
          hex = result.sRGBHex;
          render();
        } catch { }
      });
    }

    // HEX text input
    container.querySelector('#hex-input').addEventListener('input', e => {
      let v = e.target.value.trim();
      if (!v.startsWith('#')) v = '#' + v;
      if (/^#[0-9a-fA-F]{6}$/.test(v) || /^#[0-9a-fA-F]{3}$/.test(v)) {
        hex = v.length === 4 ? '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3] : v;
        render();
      }
    });

    // RGB channels
    ['r', 'g', 'b'].forEach(ch => {
      container.querySelector(`#${ch}-input`)?.addEventListener('input', e => {
        const vals = {
          r: parseInt(container.querySelector('#r-input').value) || 0,
          g: parseInt(container.querySelector('#g-input').value) || 0,
          b: parseInt(container.querySelector('#b-input').value) || 0,
        };
        hex = rgbToHex({ r: clamp(vals.r, 0, 255), g: clamp(vals.g, 0, 255), b: clamp(vals.b, 0, 255) });
        render();
      });
    });

    // HSL channels
    ['h', 's', 'l'].forEach(ch => {
      container.querySelector(`#${ch}-input`)?.addEventListener('input', () => {
        const h2 = clamp(parseInt(container.querySelector('#h-input').value) || 0, 0, 360);
        const s2 = clamp(parseInt(container.querySelector('#s-input').value) || 0, 0, 100);
        const l2 = clamp(parseInt(container.querySelector('#l-input').value) || 0, 0, 100);
        hex = hslToHex(h2, s2, l2);
        render();
      });
    });

    // Copy format buttons
    container.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.copy);
        copiedKey = btn.dataset.key;
        render();
        setTimeout(() => { copiedKey = null; render(); }, 1500);
      });
    });

    // Pick color from swatch
    container.querySelectorAll('[data-pick]').forEach(btn => {
      btn.addEventListener('click', () => { hex = btn.dataset.pick; render(); });
    });
  }

  render();
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

const PRESETS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#1e293b', '#334155', '#64748b', '#94a3b8', '#e2e8f0',
  '#ffffff', '#000000', '#4f46e5', '#0891b2', '#16a34a',
];
