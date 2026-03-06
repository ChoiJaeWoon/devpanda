/**
 * DevPanda — JSON Formatter
 * Format, minify, validate, and analyze JSON data.
 */

export function renderJsonFormatter(container) {
    let inputText = '';
    let indentSize = 2;
    let sortKeys = false;
    let outputMode = 'format'; // 'format' | 'minify' | 'validate'
    let result = null; // { ok, output, error, stats }

    /* ── Core Logic ─────────────────────────────── */
    function process() {
        if (!inputText.trim()) { result = null; return; }

        try {
            const parsed = JSON.parse(inputText);
            const stats = computeStats(parsed);

            if (outputMode === 'validate') {
                result = { ok: true, output: null, stats, message: '✅ Valid JSON!' };
                return;
            }

            let sorted = sortKeys ? deepSortKeys(parsed) : parsed;
            const output = outputMode === 'minify'
                ? JSON.stringify(sorted)
                : JSON.stringify(sorted, null, indentSize);

            result = { ok: true, output, stats };
        } catch (e) {
            // Try to extract line/col from error message
            const match = e.message.match(/position (\d+)/i);
            let hint = '';
            if (match) {
                const pos = parseInt(match[1]);
                const before = inputText.slice(0, pos);
                const line = before.split('\n').length;
                hint = ` (line ${line}, pos ${pos})`;
            }
            result = { ok: false, error: e.message + hint };
        }
    }

    function deepSortKeys(val) {
        if (Array.isArray(val)) return val.map(deepSortKeys);
        if (val !== null && typeof val === 'object') {
            return Object.keys(val).sort().reduce((acc, k) => {
                acc[k] = deepSortKeys(val[k]);
                return acc;
            }, {});
        }
        return val;
    }

    function computeStats(parsed) {
        let keys = 0, arrays = 0, strings = 0, numbers = 0, nulls = 0, booleans = 0;
        function walk(v) {
            if (v === null) { nulls++; return; }
            if (typeof v === 'string') { strings++; return; }
            if (typeof v === 'number') { numbers++; return; }
            if (typeof v === 'boolean') { booleans++; return; }
            if (Array.isArray(v)) { arrays++; v.forEach(walk); return; }
            if (typeof v === 'object') {
                keys += Object.keys(v).length;
                Object.values(v).forEach(walk);
            }
        }
        walk(parsed);
        return { keys, arrays, strings, numbers, nulls, booleans };
    }

    function syntaxHighlight(json) {
        return json
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
                let cls = 'json-num';
                if (/^"/.test(match)) cls = /:$/.test(match) ? 'json-key' : 'json-str';
                else if (/true|false/.test(match)) cls = 'json-bool';
                else if (/null/.test(match)) cls = 'json-null';
                return `<span class="${cls}">${match}</span>`;
            });
    }

    /* ── Render ──────────────────────────────────── */
    function render() {
        process();

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>JSON Formatter</span></div>
          <h1 class="tool-header__title">📋 JSON Formatter</h1>
          <p class="tool-header__desc">Format, minify, validate, and analyze JSON data instantly.</p>
        </div>

        <!-- Controls -->
        <div class="panel">
          <div class="jf-controls">
            <div class="jf-mode-tabs">
              <button class="jf-mode-btn ${outputMode === 'format' ? 'active' : ''}" data-mode="format">✨ Format</button>
              <button class="jf-mode-btn ${outputMode === 'minify' ? 'active' : ''}" data-mode="minify">⚡ Minify</button>
              <button class="jf-mode-btn ${outputMode === 'validate' ? 'active' : ''}" data-mode="validate">✅ Validate</button>
            </div>
            <div class="jf-options">
              ${outputMode === 'format' ? `
                <label class="form-label" style="margin:0;display:flex;align-items:center;gap:8px;">
                  Indent
                  <select class="form-select" id="indent-select" style="width:80px;padding:4px 8px;font-size:13px;">
                    <option value="2" ${indentSize === 2 ? 'selected' : ''}>2</option>
                    <option value="4" ${indentSize === 4 ? 'selected' : ''}>4</option>
                    <option value="tab" ${indentSize === 'tab' ? 'selected' : ''}>\t Tab</option>
                  </select>
                </label>
                <label class="form-label" style="margin:0;display:flex;align-items:center;gap:6px;cursor:pointer;">
                  <input type="checkbox" id="sort-keys" ${sortKeys ? 'checked' : ''} style="accent-color:var(--accent);" />
                  Sort Keys
                </label>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Editor area -->
        <div class="jf-layout">
          <!-- Input -->
          <div class="panel" style="flex:1;display:flex;flex-direction:column;min-width:0;">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>📥 Input</span>
              <div style="display:flex;gap:6px;">
                <button class="btn btn--secondary btn--sm" id="paste-btn">📋 Paste</button>
                <button class="btn btn--secondary btn--sm" id="clear-btn">✕ Clear</button>
                <button class="btn btn--secondary btn--sm" id="sample-btn">📄 Sample</button>
              </div>
            </div>
            <textarea class="form-input jf-textarea" id="json-input"
              placeholder='Paste your JSON here...&#10;&#10;{"name": "DevPanda", "version": 1}'
              spellcheck="false"
            >${escapeHtml(inputText)}</textarea>
            <div style="margin-top:8px;display:flex;gap:8px;">
              <button class="btn btn--primary" id="process-btn">
                ${outputMode === 'format' ? '✨ Format' : outputMode === 'minify' ? '⚡ Minify' : '✅ Validate'}
              </button>
            </div>
          </div>

          <!-- Output -->
          <div class="panel" style="flex:1;display:flex;flex-direction:column;min-width:0;">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>📤 Output</span>
              ${result?.ok && result.output !== null ? `
                <div style="display:flex;gap:6px;">
                  <button class="btn btn--secondary btn--sm" id="copy-btn">📋 Copy</button>
                  <button class="btn btn--secondary btn--sm" id="download-btn">💾 Download</button>
                </div>
              ` : ''}
            </div>
            ${!result ? `
              <div class="jf-empty">Output will appear here after formatting.</div>
            ` : result.ok ? (
                outputMode === 'validate'
                    ? `<div class="jf-valid">✅ Valid JSON!</div>`
                    : `<pre class="jf-output" id="json-output">${syntaxHighlight(result.output)}</pre>`
            ) : `
              <div class="jf-error">
                <div style="font-weight:700;margin-bottom:4px;">❌ Invalid JSON</div>
                <div style="font-family:monospace;font-size:var(--text-sm);">${escapeHtml(result.error)}</div>
              </div>
            `}
          </div>
        </div>

        <!-- Stats -->
        ${result?.ok && result.stats ? `
          <div class="panel">
            <div class="panel__title">📊 Statistics</div>
            <div class="jf-stats">
              <div class="jf-stat"><span class="jf-stat__val">${result.stats.keys}</span><span class="jf-stat__label">Keys</span></div>
              <div class="jf-stat"><span class="jf-stat__val">${result.stats.arrays}</span><span class="jf-stat__label">Arrays</span></div>
              <div class="jf-stat"><span class="jf-stat__val">${result.stats.strings}</span><span class="jf-stat__label">Strings</span></div>
              <div class="jf-stat"><span class="jf-stat__val">${result.stats.numbers}</span><span class="jf-stat__label">Numbers</span></div>
              <div class="jf-stat"><span class="jf-stat__val">${result.stats.booleans}</span><span class="jf-stat__label">Booleans</span></div>
              <div class="jf-stat"><span class="jf-stat__val">${result.stats.nulls}</span><span class="jf-stat__label">Nulls</span></div>
              ${result.output ? `<div class="jf-stat"><span class="jf-stat__val">${(result.output.length / 1024).toFixed(1)}KB</span><span class="jf-stat__label">Size</span></div>` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;

        /* ── Event Handlers ──────────────────── */
        const input = container.querySelector('#json-input');

        // Mode switch
        container.querySelectorAll('.jf-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                outputMode = btn.dataset.mode;
                inputText = input?.value || inputText;
                render();
            });
        });

        // Indent / sort
        container.querySelector('#indent-select')?.addEventListener('change', e => {
            indentSize = e.target.value === 'tab' ? '\t' : parseInt(e.target.value);
        });
        container.querySelector('#sort-keys')?.addEventListener('change', e => {
            sortKeys = e.target.checked;
        });

        // Input live update
        input?.addEventListener('input', e => { inputText = e.target.value; });

        // Paste from clipboard
        container.querySelector('#paste-btn')?.addEventListener('click', async () => {
            try {
                inputText = await navigator.clipboard.readText();
                render();
            } catch { }
        });

        // Clear
        container.querySelector('#clear-btn')?.addEventListener('click', () => {
            inputText = ''; result = null; render();
        });

        // Sample JSON
        container.querySelector('#sample-btn')?.addEventListener('click', () => {
            inputText = JSON.stringify({
                name: "DevPanda",
                version: "1.0.0",
                tools: ["JSON Formatter", "Base64 Converter", "Color Picker"],
                meta: { author: "tronix", open_source: true, stars: 42 },
                config: { theme: "dark", indent: 2, sort: false }
            }, null, 2);
            render();
        });

        // Process button
        container.querySelector('#process-btn')?.addEventListener('click', () => {
            inputText = input?.value || inputText;
            render();
        });

        // Ctrl+Enter to process
        input?.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                inputText = input.value;
                render();
            }
        });

        // Copy output
        const copyBtn = container.querySelector('#copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(result.output);
                copyBtn.textContent = '✅ Copied!';
                setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
            });
        }

        // Download
        container.querySelector('#download-btn')?.addEventListener('click', () => {
            const blob = new Blob([result.output], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'formatted.json'; a.click();
            URL.revokeObjectURL(url);
        });
    }

    render();
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
