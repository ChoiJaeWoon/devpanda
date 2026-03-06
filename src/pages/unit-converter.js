/**
 * DevPanda — Unit Converter
 * CSS units, Length, Digital Storage, Temperature, Time, Angle
 */

const CATEGORIES = [
    {
        id: 'css',
        label: '🎨 CSS Units',
        desc: 'px, rem, em, vw, vh — with configurable base font size and viewport',
        units: ['px', 'rem', 'em', 'vw', 'vh', 'pt', '%'],
        isCss: true,
    },
    {
        id: 'length',
        label: '📏 Length',
        desc: 'Metric and imperial length units',
        units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
        // base: metre
        toBase: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
    },
    {
        id: 'storage',
        label: '💾 Digital Storage',
        desc: 'Bytes, KB, MB, GB, TB (powers of 1024)',
        units: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
        toBase: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4, PB: 1024 ** 5 },
    },
    {
        id: 'temperature',
        label: '🌡️ Temperature',
        desc: 'Celsius, Fahrenheit, Kelvin',
        units: ['°C', '°F', 'K'],
        isTemp: true,
    },
    {
        id: 'time',
        label: '⏱️ Time',
        desc: 'Milliseconds to weeks',
        units: ['ms', 's', 'min', 'hr', 'day', 'wk'],
        toBase: { ms: 0.001, s: 1, min: 60, hr: 3600, day: 86400, wk: 604800 },
    },
    {
        id: 'angle',
        label: '📐 Angle',
        desc: 'Degrees, radians, gradians, turns',
        units: ['°', 'rad', 'grad', 'turn'],
        // base: degree
        toBase: { '°': 1, rad: 180 / Math.PI, grad: 0.9, turn: 360 },
    },
];

/* ── Temperature helpers ─────────────────── */
function toC(val, from) {
    if (from === '°C') return val;
    if (from === '°F') return (val - 32) * 5 / 9;
    if (from === 'K') return val - 273.15;
}
function fromC(val, to) {
    if (to === '°C') return val;
    if (to === '°F') return val * 9 / 5 + 32;
    if (to === 'K') return val + 273.15;
}

/* ── CSS conversion ──────────────────────── */
function convertCss(val, from, to, base, vw, vh, parentPx) {
    // Convert to px first
    let px;
    switch (from) {
        case 'px': px = val; break;
        case 'rem': px = val * base; break;
        case 'em': px = val * parentPx; break;
        case 'vw': px = val * vw / 100; break;
        case 'vh': px = val * vh / 100; break;
        case 'pt': px = val * 1.3333; break;
        case '%': px = val * parentPx / 100; break;
        default: px = val;
    }
    // Convert px to target
    switch (to) {
        case 'px': return px;
        case 'rem': return px / base;
        case 'em': return px / parentPx;
        case 'vw': return px / vw * 100;
        case 'vh': return px / vh * 100;
        case 'pt': return px / 1.3333;
        case '%': return px / parentPx * 100;
        default: return px;
    }
}

function fmt(n) {
    if (n === null || isNaN(n)) return '—';
    if (Math.abs(n) === 0) return '0';
    if (Math.abs(n) >= 1e9 || (Math.abs(n) < 0.0001 && n !== 0)) return n.toExponential(4);
    const d = Math.abs(n) < 1 ? 6 : Math.abs(n) < 100 ? 4 : 2;
    const s = parseFloat(n.toFixed(d)).toString();
    return s;
}

export function renderUnitConverter(container) {
    let activeCategory = CATEGORIES[0].id;
    let inputValue = 16;
    let inputUnit = 'px';
    // CSS settings
    let baseFontPx = 16;
    let viewportW = 1440;
    let viewportH = 900;
    let parentPx = 16;

    function getCategory() { return CATEGORIES.find(c => c.id === activeCategory); }

    function convertAll(val, fromUnit) {
        const cat = getCategory();
        if (!isFinite(val)) return {};
        const results = {};

        if (cat.isCss) {
            for (const u of cat.units) {
                results[u] = convertCss(val, fromUnit, u, baseFontPx, viewportW, viewportH, parentPx);
            }
        } else if (cat.isTemp) {
            const c = toC(val, fromUnit);
            for (const u of cat.units) results[u] = fromC(c, u);
        } else {
            const base = val * cat.toBase[fromUnit];
            for (const u of cat.units) results[u] = base / cat.toBase[u];
        }
        return results;
    }

    function render() {
        const cat = getCategory();
        const results = convertAll(parseFloat(inputValue) || 0, inputUnit);

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Unit Converter</span></div>
          <h1 class="tool-header__title">📐 Unit Converter</h1>
          <p class="tool-header__desc">Convert between units of CSS, length, storage, temperature, time, and more.</p>
        </div>

        <!-- Category tabs -->
        <div class="uc-tabs">
          ${CATEGORIES.map(c => `
            <button class="uc-tab ${c.id === activeCategory ? 'uc-tab--active' : ''}" data-cat="${c.id}">
              ${c.label}
            </button>
          `).join('')}
        </div>

        <div class="uc-layout">
          <!-- Left: input + settings -->
          <div>
            <div class="panel">
              <div class="panel__title">Input</div>
              <p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:4px;">${cat.desc}</p>

              <div class="uc-input-row">
                <input class="form-input uc-val-input" id="uc-val" type="number" value="${inputValue}" placeholder="Enter value…" />
                <select class="form-input uc-unit-select" id="uc-from">
                  ${cat.units.map(u => `<option value="${u}" ${u === inputUnit ? 'selected' : ''}>${u}</option>`).join('')}
                </select>
              </div>
            </div>

            ${cat.isCss ? `
              <div class="panel" style="margin-top:var(--space-md);">
                <div class="panel__title">⚙️ CSS Settings</div>
                <div class="uc-settings">
                  <div class="cp-input-group">
                    <label class="form-label">Base font size (rem root)</label>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <input class="form-input" id="uc-base" type="number" value="${baseFontPx}" min="1" style="max-width:100px;" />
                      <span style="font-size:var(--text-sm);color:var(--text-muted);">px</span>
                    </div>
                  </div>
                  <div class="cp-input-group">
                    <label class="form-label">Parent element (em reference)</label>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <input class="form-input" id="uc-parent" type="number" value="${parentPx}" min="1" style="max-width:100px;" />
                      <span style="font-size:var(--text-sm);color:var(--text-muted);">px</span>
                    </div>
                  </div>
                  <div class="cp-input-group">
                    <label class="form-label">Viewport width (vw)</label>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <input class="form-input" id="uc-vw" type="number" value="${viewportW}" min="1" style="max-width:100px;" />
                      <span style="font-size:var(--text-sm);color:var(--text-muted);">px</span>
                    </div>
                  </div>
                  <div class="cp-input-group">
                    <label class="form-label">Viewport height (vh)</label>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <input class="form-input" id="uc-vh" type="number" value="${viewportH}" min="1" style="max-width:100px;" />
                      <span style="font-size:var(--text-sm);color:var(--text-muted);">px</span>
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            <!-- Quick reference -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">📖 Common Values</div>
              <div class="uc-quick">
                ${getQuickRef(cat.id).map(([label, val, unit]) => `
                  <button class="btn btn--secondary btn--sm uc-quick-btn" data-val="${val}" data-unit="${unit}">
                    ${label}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right: results grid -->
          <div>
            <div class="panel">
              <div class="panel__title">🔄 Results</div>
              <div class="uc-results" id="uc-results">
                ${cat.units.map(u => `
                  <div class="uc-result-card ${u === inputUnit ? 'uc-result-card--active' : ''}">
                    <div class="uc-result-unit">${u}</div>
                    <div class="uc-result-val" id="ucr-${u.replace(/[^a-z0-9]/gi, '_')}">${u === inputUnit ? fmt(parseFloat(inputValue) || 0) : fmt(results[u])}</div>
                    <button class="uc-result-copy" data-val="${results[u]}" title="Copy value">⧉</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Formula panel -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">📝 Formula</div>
              <div class="uc-formula" id="uc-formula">
                ${getFormula(cat.id, inputUnit, baseFontPx)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

        setupEvents();
    }

    function updateResults() {
        const val = parseFloat(container.querySelector('#uc-val')?.value) || 0;
        inputValue = val;
        const cat = getCategory();
        const results = convertAll(val, inputUnit);

        cat.units.forEach(u => {
            const el = container.querySelector(`#ucr-${u.replace(/[^a-z0-9]/gi, '_')}`);
            if (el) el.textContent = u === inputUnit ? fmt(val) : fmt(results[u]);
        });
        // Update copy buttons
        container.querySelectorAll('.uc-result-copy').forEach((btn, i) => {
            btn.dataset.val = results[cat.units[i]];
        });
        // Update formula
        const fEl = container.querySelector('#uc-formula');
        if (fEl) fEl.innerHTML = getFormula(cat.id, inputUnit, baseFontPx);
    }

    function getQuickRef(catId) {
        const refs = {
            css: [['1rem', 1, 'rem'], ['Base font', 16, 'px'], ['Half rem', 0.5, 'rem'], ['1vw at 1440', 14.4, 'px'], ['Heading H1', 2, 'rem'], ['Body text', 1, 'rem']],
            length: [['1 inch', 1, 'in'], ['1 foot', 1, 'ft'], ['1 mile', 1, 'mi'], ['1 km', 1, 'km'], ['Marathon', 42195, 'm'], ['Screen 27"', 68.58, 'cm']],
            storage: [['1 KB', 1, 'KB'], ['1 MB', 1, 'MB'], ['1 GB', 1, 'GB'], ['4K video/min', 375, 'MB'], ['CD', 700, 'MB'], ['DVD', 4.7, 'GB']],
            temperature: [['Freezing', 0, '°C'], ['Body temp', 37, '°C'], ['Boiling', 100, '°C'], ['Absolute 0', 0, 'K'], ['Room temp', 72, '°F']],
            time: [['1 second', 1, 's'], ['1 minute', 1, 'min'], ['1 hour', 1, 'hr'], ['1 day', 1, 'day'], ['1 week', 1, 'wk'], ['API timeout', 30, 's']],
            angle: [['Quarter turn', 90, '°'], ['Half turn', 180, '°'], ['Full turn', 360, '°'], ['π rad', Math.PI, 'rad'], ['45°', 45, '°'], ['1 turn', 1, 'turn']],
        };
        return refs[catId] || [];
    }

    function getFormula(catId, fromUnit, base) {
        const f = {
            css: `<code>1 rem = ${base}px</code> &nbsp;|&nbsp; <code>1 em = parent px</code> &nbsp;|&nbsp; <code>1 pt ≈ 1.333px</code>`,
            length: `<code>1 m</code> is the base unit. All values scale proportionally.`,
            storage: `<code>1 KB = 1,024 B</code> &nbsp;|&nbsp; <code>1 MB = 1,024 KB</code> &nbsp;|&nbsp; <code>1 GB = 1,024 MB</code>`,
            temperature: `<code>°F = °C × 9/5 + 32</code> &nbsp;|&nbsp; <code>K = °C + 273.15</code>`,
            time: `<code>1 min = 60s</code> &nbsp;|&nbsp; <code>1 hr = 3,600s</code> &nbsp;|&nbsp; <code>1 day = 86,400s</code>`,
            angle: `<code>1 rad = 180/π °</code> &nbsp;|&nbsp; <code>1 turn = 360°</code> &nbsp;|&nbsp; <code>1 grad = 0.9°</code>`,
        };
        return f[catId] || '';
    }

    function setupEvents() {
        // Category tabs
        container.querySelectorAll('.uc-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                activeCategory = btn.dataset.cat;
                const cat = getCategory();
                inputUnit = cat.units[0];
                render();
            });
        });

        // Value input
        container.querySelector('#uc-val')?.addEventListener('input', updateResults);

        // Unit select
        container.querySelector('#uc-from')?.addEventListener('change', e => {
            inputUnit = e.target.value;
            // Highlight active card
            container.querySelectorAll('.uc-result-card').forEach(card => card.classList.remove('uc-result-card--active'));
            const cat = getCategory();
            const idx = cat.units.indexOf(inputUnit);
            container.querySelectorAll('.uc-result-card')[idx]?.classList.add('uc-result-card--active');
            updateResults();
        });

        // CSS settings
        container.querySelector('#uc-base')?.addEventListener('input', e => { baseFontPx = parseFloat(e.target.value) || 16; updateResults(); });
        container.querySelector('#uc-parent')?.addEventListener('input', e => { parentPx = parseFloat(e.target.value) || 16; updateResults(); });
        container.querySelector('#uc-vw')?.addEventListener('input', e => { viewportW = parseFloat(e.target.value) || 1440; updateResults(); });
        container.querySelector('#uc-vh')?.addEventListener('input', e => { viewportH = parseFloat(e.target.value) || 900; updateResults(); });

        // Quick presets
        container.querySelectorAll('.uc-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = parseFloat(btn.dataset.val);
                const unit = btn.dataset.unit;
                inputValue = val;
                inputUnit = unit;
                const inp = container.querySelector('#uc-val');
                const sel = container.querySelector('#uc-from');
                if (inp) inp.value = val;
                if (sel) sel.value = unit;
                container.querySelectorAll('.uc-result-card').forEach(c => c.classList.remove('uc-result-card--active'));
                const cat = getCategory();
                const idx = cat.units.indexOf(unit);
                container.querySelectorAll('.uc-result-card')[idx]?.classList.add('uc-result-card--active');
                updateResults();
            });
        });

        // Copy buttons
        container.querySelectorAll('.uc-result-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.val).then(() => {
                    btn.textContent = '✓';
                    setTimeout(() => { btn.textContent = '⧉'; }, 1200);
                });
            });
        });

        // Click on result card to set it as input
        container.querySelectorAll('.uc-result-card').forEach((card, i) => {
            card.addEventListener('click', e => {
                if (e.target.classList.contains('uc-result-copy')) return;
                const cat = getCategory();
                const unit = cat.units[i];
                const valEl = card.querySelector('.uc-result-val');
                if (!valEl) return;
                const val = parseFloat(valEl.textContent);
                if (!isFinite(val)) return;
                inputValue = val;
                inputUnit = unit;
                const inp = container.querySelector('#uc-val');
                const sel = container.querySelector('#uc-from');
                if (inp) inp.value = fmt(val);
                if (sel) sel.value = unit;
                container.querySelectorAll('.uc-result-card').forEach(c => c.classList.remove('uc-result-card--active'));
                card.classList.add('uc-result-card--active');
                updateResults();
            });
        });
    }

    render();
}
