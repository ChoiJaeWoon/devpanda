/**
 * DevPanda — CSV ↔ JSON Converter
 * Bidirectional: CSV→JSON and JSON→CSV
 * Features: table preview, delimiter choice, pretty/minified JSON, download
 */

/* ── CSV parser ─────────────────────────── */
function parseCsv(text, delimiter = ',') {
    const rows = [];
    const lines = text.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0);
    if (!lines.length) return { headers: [], rows: [] };

    function splitRow(line) {
        const cells = [];
        let cur = '', inQuote = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
                else inQuote = !inQuote;
            } else if (ch === delimiter && !inQuote) {
                cells.push(cur); cur = '';
            } else {
                cur += ch;
            }
        }
        cells.push(cur);
        return cells.map(c => c.trim());
    }

    const headers = splitRow(lines[0]);
    for (let i = 1; i < lines.length; i++) {
        const vals = splitRow(lines[i]);
        const obj = {};
        headers.forEach((h, j) => { obj[h] = vals[j] ?? ''; });
        rows.push(obj);
    }
    return { headers, rows };
}

/* ── JSON → CSV ─────────────────────────── */
function jsonToCsv(arr, delimiter = ',') {
    if (!Array.isArray(arr) || arr.length === 0) return '';
    const headers = Object.keys(arr[0]);
    const esc = v => {
        const s = String(v ?? '');
        return s.includes(delimiter) || s.includes('"') || s.includes('\n')
            ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [headers.join(delimiter)];
    for (const row of arr) lines.push(headers.map(h => esc(row[h])).join(delimiter));
    return lines.join('\n');
}

function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const DEFAULT_CSV = `name,age,city,email
Alice,28,Seoul,alice@example.com
Bob,34,Busan,bob@example.com
Charlie,22,Incheon,charlie@example.com`;

const DEFAULT_JSON = JSON.stringify([
    { name: 'Alice', age: 28, city: 'Seoul', email: 'alice@example.com' },
    { name: 'Bob', age: 34, city: 'Busan', email: 'bob@example.com' },
    { name: 'Charlie', age: 22, city: 'Incheon', email: 'charlie@example.com' },
], null, 2);

export function renderCsvJson(container) {
    let mode = 'csv2json'; // 'csv2json' | 'json2csv'
    let csvInput = DEFAULT_CSV;
    let jsonInput = DEFAULT_JSON;
    let delimiter = ',';
    let pretty = true;
    let indent = 2;

    /* ─── compute outputs ─── */
    function computeCsvToJson() {
        try {
            const { rows } = parseCsv(csvInput, delimiter);
            return { ok: true, value: pretty ? JSON.stringify(rows, null, indent) : JSON.stringify(rows) };
        } catch (e) { return { ok: false, error: e.message }; }
    }

    function computeJsonToCsv() {
        try {
            const arr = JSON.parse(jsonInput);
            if (!Array.isArray(arr)) return { ok: false, error: 'Input must be a JSON array of objects.' };
            return { ok: true, value: jsonToCsv(arr, delimiter) };
        } catch (e) { return { ok: false, error: e.message }; }
    }

    /* ─── preview table ─── */
    function buildTable(headers, rows, maxRows = 50) {
        if (!headers.length) return '<div style="color:var(--text-muted);font-size:var(--text-sm);">No data</div>';
        const shown = rows.slice(0, maxRows);
        const more = rows.length - shown.length;
        return `
      <div class="cj-table-wrap">
        <table class="cj-table">
          <thead>
            <tr>${headers.map(h => `<th>${escHtml(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${shown.map(row => `<tr>${headers.map(h => `<td>${escHtml(row[h] ?? '')}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        ${more > 0 ? `<div class="cj-table-more">… ${more} more rows not shown</div>` : ''}
      </div>
    `;
    }

    /* ─── render ─── */
    function render() {
        const isCsv = mode === 'csv2json';
        const result = isCsv ? computeCsvToJson() : computeJsonToCsv();

        let previewHtml = '';
        if (isCsv) {
            const { headers, rows } = parseCsv(csvInput, delimiter);
            previewHtml = buildTable(headers, rows);
        } else {
            try {
                const arr = JSON.parse(jsonInput);
                if (Array.isArray(arr) && arr.length) {
                    previewHtml = buildTable(Object.keys(arr[0]), arr);
                }
            } catch { }
        }

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>CSV ↔ JSON</span></div>
          <h1 class="tool-header__title">📊 CSV ↔ JSON Converter</h1>
          <p class="tool-header__desc">Convert between CSV and JSON formats instantly. Preview your data in a table before downloading.</p>
        </div>

        <!-- Mode toggle + options -->
        <div class="cj-toolbar">
          <div class="cj-mode-group">
            <button class="btn btn--sm ${isCsv ? 'btn--primary' : 'btn--secondary'}" data-m="csv2json">CSV → JSON</button>
            <button class="btn btn--sm ${!isCsv ? 'btn--primary' : 'btn--secondary'}" data-m="json2csv">JSON → CSV</button>
          </div>
          <div class="cj-options">
            <label class="form-label" style="margin:0;white-space:nowrap;">Delimiter:</label>
            <select class="form-input cj-select" id="cj-delim">
              <option value="," ${delimiter === ',' ? 'selected' : ''}>Comma ( , )</option>
              <option value=";" ${delimiter === ';' ? 'selected' : ''}>Semicolon ( ; )</option>
              <option value="	" ${delimiter === '\t' ? 'selected' : ''}>Tab</option>
              <option value="|" ${delimiter === '|' ? 'selected' : ''}>Pipe ( | )</option>
            </select>
            ${isCsv ? `
              <label class="form-label" style="margin:0;white-space:nowrap;">Indent:</label>
              <select class="form-input cj-select" id="cj-indent">
                <option value="0" ${!pretty ? 'selected' : ''}>Minified</option>
                <option value="2" ${pretty && indent === 2 ? 'selected' : ''}>2 spaces</option>
                <option value="4" ${pretty && indent === 4 ? 'selected' : ''}>4 spaces</option>
              </select>
            ` : ''}
          </div>
        </div>

        <div class="cj-layout">
          <!-- Input -->
          <div class="panel">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>${isCsv ? '📋 CSV Input' : '{ } JSON Input'}</span>
              <div style="display:flex;gap:6px;">
                <button class="btn btn--secondary btn--sm" id="cj-paste">Paste</button>
                <button class="btn btn--secondary btn--sm" id="cj-clear">Clear</button>
                <label class="btn btn--secondary btn--sm" style="cursor:pointer;">
                  Upload
                  <input type="file" id="cj-upload" accept="${isCsv ? '.csv,.txt' : '.json'}" style="display:none" />
                </label>
              </div>
            </div>
            <textarea class="form-input cj-textarea" id="cj-in" spellcheck="false">${escHtml(isCsv ? csvInput : jsonInput)}</textarea>
            <div class="cj-meta">
              ${isCsv ? (() => { const { headers, rows } = parseCsv(csvInput, delimiter); return `${rows.length} rows · ${headers.length} columns`; })()
                : (() => { try { const a = JSON.parse(jsonInput); return Array.isArray(a) ? `${a.length} objects` : '(not an array)'; } catch { return 'Invalid JSON'; } })()}
            </div>
          </div>

          <!-- Output -->
          <div class="panel">
            <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
              <span>${isCsv ? '{ } JSON Output' : '📋 CSV Output'}</span>
              <div style="display:flex;gap:6px;">
                <button class="btn btn--secondary btn--sm" id="cj-copy" ${!result.ok ? 'disabled' : ''}>Copy</button>
                <button class="btn btn--primary btn--sm" id="cj-download" ${!result.ok ? 'disabled' : ''}>
                  ⬇️ Download .${isCsv ? 'json' : 'csv'}
                </button>
              </div>
            </div>
            ${result.ok
                ? `<pre class="cj-output" id="cj-out">${escHtml(result.value)}</pre>`
                : `<div class="cj-error">⚠️ ${escHtml(result.error)}</div>`
            }
          </div>
        </div>

        <!-- Table Preview -->
        <div class="panel" style="margin-top:var(--space-md);">
          <div class="panel__title">👁️ Table Preview</div>
          <div style="margin-top:var(--space-sm);">${previewHtml || '<div style="color:var(--text-muted);font-size:var(--text-sm);">No valid data to preview.</div>'}</div>
        </div>
      </div>
    `;
        setupEvents(result, isCsv);
    }

    /* ─── partial update (preserve textarea focus) ─── */
    function updateOutput() {
        const isCsv = mode === 'csv2json';
        const result = isCsv ? computeCsvToJson() : computeJsonToCsv();
        const out = container.querySelector('#cj-out');
        const err = container.querySelector('.cj-error');
        const meta = container.querySelector('.cj-meta');
        if (result.ok) {
            if (out) { out.textContent = result.value; }
            else { render(); return; }
            if (err) err.remove();
        } else {
            if (out) out.textContent = '';
            if (!err) { const d = document.createElement('div'); d.className = 'cj-error'; d.textContent = '⚠️ ' + result.error; out?.after(d); }
            else err.textContent = '⚠️ ' + result.error;
        }
        // update meta
        if (meta) {
            if (isCsv) { const { headers, rows } = parseCsv(csvInput, delimiter); meta.textContent = `${rows.length} rows · ${headers.length} columns`; }
            else { try { const a = JSON.parse(jsonInput); meta.textContent = Array.isArray(a) ? `${a.length} objects` : '(not an array)'; } catch { meta.textContent = 'Invalid JSON'; } }
        }
        // update table preview
        let previewHtml = '';
        if (isCsv) { const { headers, rows } = parseCsv(csvInput, delimiter); previewHtml = buildTable(headers, rows); }
        else { try { const arr = JSON.parse(jsonInput); if (Array.isArray(arr) && arr.length) previewHtml = buildTable(Object.keys(arr[0]), arr); } catch { } }
        const tp = container.querySelector('.panel:last-child > div:last-child');
        if (tp) tp.innerHTML = previewHtml || '<div style="color:var(--text-muted);font-size:var(--text-sm);">No valid data to preview.</div>';
    }

    function setupEvents(result, isCsv) {
        // Mode
        container.querySelectorAll('[data-m]').forEach(btn => {
            btn.addEventListener('click', () => { mode = btn.dataset.m; render(); });
        });

        // Delimiter
        container.querySelector('#cj-delim')?.addEventListener('change', e => {
            delimiter = e.target.value;
            updateOutput();
        });

        // Indent (csv→json only)
        container.querySelector('#cj-indent')?.addEventListener('change', e => {
            const v = parseInt(e.target.value);
            pretty = v > 0; indent = v || 2;
            updateOutput();
        });

        // Input textarea
        const inp = container.querySelector('#cj-in');
        if (inp) {
            inp.addEventListener('input', e => {
                if (isCsv) csvInput = e.target.value;
                else jsonInput = e.target.value;
                updateOutput();
            });
        }

        // Paste
        container.querySelector('#cj-paste')?.addEventListener('click', async () => {
            const text = await navigator.clipboard.readText().catch(() => '');
            if (isCsv) csvInput = text; else jsonInput = text;
            if (inp) inp.value = text;
            updateOutput();
        });

        // Clear
        container.querySelector('#cj-clear')?.addEventListener('click', () => {
            if (isCsv) csvInput = ''; else jsonInput = '';
            if (inp) inp.value = '';
            updateOutput();
        });

        // File upload
        container.querySelector('#cj-upload')?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ev => {
                const text = ev.target.result;
                if (isCsv) csvInput = text; else jsonInput = text;
                if (inp) inp.value = text;
                updateOutput();
            };
            reader.readAsText(file);
        });

        // Copy
        container.querySelector('#cj-copy')?.addEventListener('click', () => {
            if (!result.ok) return;
            navigator.clipboard.writeText(result.value).then(() => {
                const btn = container.querySelector('#cj-copy');
                if (btn) { btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1500); }
            });
        });

        // Download
        container.querySelector('#cj-download')?.addEventListener('click', () => {
            if (!result.ok) return;
            const ext = isCsv ? 'json' : 'csv';
            const mime = isCsv ? 'application/json' : 'text/csv';
            const blob = new Blob([result.value], { type: mime });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    render();
}
