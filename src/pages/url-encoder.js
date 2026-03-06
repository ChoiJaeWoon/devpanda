/**
 * DevPanda — URL Encoder / Decoder
 * encodeURI / encodeURIComponent modes, full URL parser, query string table
 */

function escHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function safeEncode(str, mode) {
    try {
        return mode === 'component' ? encodeURIComponent(str) : encodeURI(str);
    } catch {
        return str;
    }
}

function safeDecode(str) {
    try { return decodeURIComponent(str); } catch {
        try { return decodeURI(str); } catch { return str; }
    }
}

function parseUrl(raw) {
    try {
        const u = new URL(raw.trim());
        return {
            ok: true,
            protocol: u.protocol,
            host: u.host,
            pathname: u.pathname,
            search: u.search,
            hash: u.hash,
            params: [...u.searchParams.entries()],
        };
    } catch {
        return { ok: false };
    }
}

export function renderUrlEncoder(container) {
    let mode = 'component'; // 'component' | 'uri'
    let encIn = 'https://example.com/search?q=hello world&lang=한국어';
    let decIn = 'https://example.com/search?q=hello%20world&lang=%ED%95%9C%EA%B5%AD%EC%96%B4';
    let tab = 'encode'; // 'encode' | 'decode' | 'parse'

    function render() {
        const parsed = parseUrl(tab === 'parse' ? encIn : encIn);

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>URL Encoder / Decoder</span></div>
          <h1 class="tool-header__title">🌐 URL Encoder / Decoder</h1>
          <p class="tool-header__desc">Encode and decode URLs and query strings. Parse full URLs into their components.</p>
        </div>

        <!-- Tabs -->
        <div class="rx-mode-tabs" style="margin-bottom:var(--space-md);">
          <button class="rx-mode-btn ${tab === 'encode' ? 'rx-mode-btn--active' : ''}" data-tab="encode">Encode</button>
          <button class="rx-mode-btn ${tab === 'decode' ? 'rx-mode-btn--active' : ''}" data-tab="decode">Decode</button>
          <button class="rx-mode-btn ${tab === 'parse' ? 'rx-mode-btn--active' : ''}" data-tab="parse">Parse URL</button>
        </div>

        ${tab === 'encode' ? renderEncodeTab() :
                tab === 'decode' ? renderDecodeTab() :
                    renderParseTab(parsed)}
      </div>
    `;

        setupEvents();
    }

    /* ── Encode tab ──────────────────────── */
    function renderEncodeTab() {
        const encoded = safeEncode(encIn, mode);
        return `
      <div class="ue-layout">
        <div>
          <div class="panel">
            <div class="panel__title">📝 Input</div>
            <div style="display:flex;gap:8px;margin-top:var(--space-sm);margin-bottom:var(--space-sm);">
              <button class="btn btn--sm ${mode === 'component' ? 'btn--primary' : 'btn--secondary'}" data-mode="component">encodeURIComponent</button>
              <button class="btn btn--sm ${mode === 'uri' ? 'btn--primary' : 'btn--secondary'}" data-mode="uri">encodeURI</button>
            </div>
            <textarea class="form-input ue-textarea" id="ue-enc-in" rows="7" spellcheck="false">${escHtml(encIn)}</textarea>
            <div style="display:flex;gap:8px;margin-top:var(--space-sm);justify-content:flex-end;">
              <button class="btn btn--secondary btn--sm" id="ue-enc-clear">Clear</button>
              <button class="btn btn--secondary btn--sm" id="ue-enc-paste">Paste</button>
            </div>
          </div>

          <div class="panel" style="margin-top:var(--space-md);">
            <div class="panel__title">💡 When to use which?</div>
            <div class="ue-hint-table">
              <div class="ue-hint-row">
                <code class="ue-hint-fn">encodeURIComponent</code>
                <span>Encode a single value in a query param. Encodes <code>&amp;</code>, <code>=</code>, <code>?</code>, <code>/</code></span>
              </div>
              <div class="ue-hint-row">
                <code class="ue-hint-fn">encodeURI</code>
                <span>Encode a full URL. Preserves <code>:</code>, <code>/</code>, <code>?</code>, <code>&amp;</code>, <code>=</code></span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="panel">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>✨ Encoded Output</span>
              <button class="btn btn--secondary btn--sm" id="ue-enc-copy">Copy</button>
            </div>
            <div class="ue-output" id="ue-enc-out">${escHtml(encoded)}</div>
            <div class="ue-char-count">
              <span>${encIn.length} chars input → ${encoded.length} chars encoded</span>
            </div>
          </div>

          <div class="panel" style="margin-top:var(--space-md);">
            <div class="panel__title">🔬 Difference highlighted</div>
            <div class="ue-diff" id="ue-diff">${buildDiff(encIn, encoded)}</div>
          </div>
        </div>
      </div>
    `;
    }

    /* ── Decode tab ──────────────────────── */
    function renderDecodeTab() {
        const decoded = safeDecode(decIn);
        return `
      <div class="ue-layout">
        <div>
          <div class="panel">
            <div class="panel__title">📝 Encoded Input</div>
            <textarea class="form-input ue-textarea" id="ue-dec-in" rows="7" spellcheck="false">${escHtml(decIn)}</textarea>
            <div style="display:flex;gap:8px;margin-top:var(--space-sm);justify-content:flex-end;">
              <button class="btn btn--secondary btn--sm" id="ue-dec-clear">Clear</button>
              <button class="btn btn--secondary btn--sm" id="ue-dec-paste">Paste</button>
            </div>
          </div>
        </div>

        <div>
          <div class="panel">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>✨ Decoded Output</span>
              <button class="btn btn--secondary btn--sm" id="ue-dec-copy">Copy</button>
            </div>
            <div class="ue-output" id="ue-dec-out">${escHtml(decoded)}</div>
            <div class="ue-char-count">
              <span>${decIn.length} chars input → ${decoded.length} chars decoded</span>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    /* ── Parse tab ───────────────────────── */
    function renderParseTab(parsed) {
        return `
      <div>
        <div class="panel">
          <div class="panel__title">🔗 URL to Parse</div>
          <textarea class="form-input ue-textarea" id="ue-parse-in" rows="3" spellcheck="false">${escHtml(encIn)}</textarea>
          <div style="display:flex;gap:8px;margin-top:var(--space-sm);justify-content:flex-end;">
            <button class="btn btn--secondary btn--sm" id="ue-parse-paste">Paste</button>
          </div>
        </div>

        ${parsed.ok ? `
          <div class="ue-parse-grid" style="margin-top:var(--space-md);">
            <!-- URL components -->
            <div class="panel">
              <div class="panel__title">🧩 URL Components</div>
              <div class="ue-parts">
                ${[
                    ['Protocol', parsed.protocol],
                    ['Host', parsed.host],
                    ['Path', parsed.pathname],
                    ['Query', parsed.search || '(none)'],
                    ['Hash', parsed.hash || '(none)'],
                ].map(([label, val]) => `
                  <div class="ue-part-row">
                    <span class="ue-part-label">${label}</span>
                    <code class="ue-part-val">${escHtml(val)}</code>
                    <button class="btn btn--secondary btn--sm ue-part-copy" data-val="${escHtml(val)}" style="margin-left:auto;">Copy</button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Query params table -->
            <div class="panel">
              <div class="panel__title">📋 Query Parameters</div>
              ${parsed.params.length === 0
                    ? `<div style="color:var(--text-muted);font-size:var(--text-sm);margin-top:var(--space-sm);">No query parameters found.</div>`
                    : `
                  <div class="ue-params-table">
                    <div class="ue-params-header">
                      <span>Key</span>
                      <span>Value (raw)</span>
                      <span>Value (decoded)</span>
                    </div>
                    ${parsed.params.map(([k, v]) => `
                      <div class="ue-params-row">
                        <code class="ue-param-key">${escHtml(k)}</code>
                        <code class="ue-param-raw">${escHtml(v)}</code>
                        <code class="ue-param-dec">${escHtml(safeDecode(v))}</code>
                      </div>
                    `).join('')}
                  </div>
                `}
            </div>
          </div>
        ` : `
          <div class="panel" style="margin-top:var(--space-md);">
            <div class="ue-invalid">⚠️ Invalid URL — make sure it starts with <code>http://</code> or <code>https://</code></div>
          </div>
        `}
      </div>
    `;
    }

    /* ── Diff builder ─────────────────────── */
    function buildDiff(original, encoded) {
        // Highlight characters that changed (got encoded)
        let result = '';
        let i = 0, j = 0;
        while (i < original.length && j < encoded.length) {
            if (encoded[j] === '%' && j + 2 < encoded.length) {
                // This is an encoded sequence
                const seq = encoded.slice(j, j + 3);
                result += `<mark class="ue-diff-mark" title="encoded from: ${escHtml(original[i])}">${escHtml(seq)}</mark>`;
                i++; j += 3;
            } else {
                result += escHtml(encoded[j]);
                i++; j++;
            }
        }
        result += escHtml(encoded.slice(j));
        return result || '<span style="color:var(--text-muted)">Nothing to show</span>';
    }

    /* ── Live update (partial DOM) ───────── */
    function updateEncode() {
        encIn = container.querySelector('#ue-enc-in')?.value || '';
        const encoded = safeEncode(encIn, mode);
        const out = container.querySelector('#ue-enc-out');
        const cnt = container.querySelector('.ue-char-count span');
        const diff = container.querySelector('#ue-diff');
        if (out) out.textContent = encoded;
        if (cnt) cnt.textContent = `${encIn.length} chars input → ${encoded.length} chars encoded`;
        if (diff) diff.innerHTML = buildDiff(encIn, encoded);
    }

    function updateDecode() {
        decIn = container.querySelector('#ue-dec-in')?.value || '';
        const decoded = safeDecode(decIn);
        const out = container.querySelector('#ue-dec-out');
        const cnt = container.querySelector('.ue-char-count span');
        if (out) out.textContent = decoded;
        if (cnt) cnt.textContent = `${decIn.length} chars input → ${decoded.length} chars decoded`;
    }

    function setupEvents() {
        // Tabs
        container.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => { tab = btn.dataset.tab; render(); });
        });

        // Encode mode toggle
        container.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => { mode = btn.dataset.mode; updateEncode(); });
        });

        // Encode input
        container.querySelector('#ue-enc-in')?.addEventListener('input', updateEncode);
        container.querySelector('#ue-enc-clear')?.addEventListener('click', () => {
            encIn = '';
            const el = container.querySelector('#ue-enc-in');
            if (el) el.value = '';
            updateEncode();
        });
        container.querySelector('#ue-enc-paste')?.addEventListener('click', async () => {
            encIn = await navigator.clipboard.readText().catch(() => '');
            const el = container.querySelector('#ue-enc-in');
            if (el) el.value = encIn;
            updateEncode();
        });
        container.querySelector('#ue-enc-copy')?.addEventListener('click', () => {
            const out = container.querySelector('#ue-enc-out');
            if (out) navigator.clipboard.writeText(out.textContent).then(() => {
                const btn = container.querySelector('#ue-enc-copy');
                if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1500); }
            });
        });

        // Decode input
        container.querySelector('#ue-dec-in')?.addEventListener('input', updateDecode);
        container.querySelector('#ue-dec-clear')?.addEventListener('click', () => {
            decIn = '';
            const el = container.querySelector('#ue-dec-in');
            if (el) el.value = '';
            updateDecode();
        });
        container.querySelector('#ue-dec-paste')?.addEventListener('click', async () => {
            decIn = await navigator.clipboard.readText().catch(() => '');
            const el = container.querySelector('#ue-dec-in');
            if (el) el.value = decIn;
            updateDecode();
        });
        container.querySelector('#ue-dec-copy')?.addEventListener('click', () => {
            const out = container.querySelector('#ue-dec-out');
            if (out) navigator.clipboard.writeText(out.textContent).then(() => {
                const btn = container.querySelector('#ue-dec-copy');
                if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1500); }
            });
        });

        // Parse input — live re-render
        container.querySelector('#ue-parse-in')?.addEventListener('input', e => {
            encIn = e.target.value;
            const parsed = parseUrl(encIn);
            const grid = container.querySelector('.ue-parse-grid') || container.querySelector('.panel + .panel');
            // Full re-render of parse content below textarea
            const wrapper = container.querySelector('#ue-parse-in')?.closest('.panel')?.parentElement;
            if (wrapper) {
                // Re-render just the results below
                const existing = wrapper.querySelector('.ue-parse-grid') || wrapper.querySelector('.panel:nth-child(2)');
                if (existing) existing.remove();
                const div = document.createElement('div');
                div.style.marginTop = 'var(--space-md)';
                div.innerHTML = parsed.ok ? buildParseResults(parsed) : `<div class="panel"><div class="ue-invalid">⚠️ Invalid URL — make sure it starts with <code>http://</code> or <code>https://</code></div></div>`;
                wrapper.appendChild(div);
                // Re-attach part copy
                wrapper.querySelectorAll('.ue-part-copy').forEach(btn => {
                    btn.addEventListener('click', () => {
                        navigator.clipboard.writeText(btn.dataset.val).then(() => {
                            btn.textContent = 'Copied!';
                            setTimeout(() => btn.textContent = 'Copy', 1500);
                        });
                    });
                });
            }
        });

        container.querySelector('#ue-parse-paste')?.addEventListener('click', async () => {
            encIn = await navigator.clipboard.readText().catch(() => '');
            const el = container.querySelector('#ue-parse-in');
            if (el) { el.value = encIn; el.dispatchEvent(new Event('input')); }
        });

        // Part copy buttons
        container.querySelectorAll('.ue-part-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.val).then(() => {
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = 'Copy', 1500);
                });
            });
        });
    }

    function buildParseResults(parsed) {
        return `
      <div class="ue-parse-grid">
        <div class="panel">
          <div class="panel__title">🧩 URL Components</div>
          <div class="ue-parts">
            ${[
                ['Protocol', parsed.protocol],
                ['Host', parsed.host],
                ['Path', parsed.pathname],
                ['Query', parsed.search || '(none)'],
                ['Hash', parsed.hash || '(none)'],
            ].map(([label, val]) => `
              <div class="ue-part-row">
                <span class="ue-part-label">${label}</span>
                <code class="ue-part-val">${escHtml(val)}</code>
                <button class="btn btn--secondary btn--sm ue-part-copy" data-val="${escHtml(val)}" style="margin-left:auto;">Copy</button>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="panel">
          <div class="panel__title">📋 Query Parameters</div>
          ${parsed.params.length === 0
                ? `<div style="color:var(--text-muted);font-size:var(--text-sm);margin-top:var(--space-sm);">No query parameters found.</div>`
                : `<div class="ue-params-table">
                <div class="ue-params-header"><span>Key</span><span>Value (raw)</span><span>Value (decoded)</span></div>
                ${parsed.params.map(([k, v]) => `
                  <div class="ue-params-row">
                    <code class="ue-param-key">${escHtml(k)}</code>
                    <code class="ue-param-raw">${escHtml(v)}</code>
                    <code class="ue-param-dec">${escHtml(safeDecode(v))}</code>
                  </div>`).join('')}
              </div>`}
        </div>
      </div>
    `;
    }

    render();
}
