/**
 * DevPanda — Regex Tester
 * Real-time regex matching with highlight, groups, replace, and presets.
 */

const PRESETS = [
    { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: 'gi' },
    { label: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z]{2,6}\\b([-a-zA-Z0-9@:%_+.~#?&/=]*)', flags: 'gi' },
    { label: 'IP Address', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
    { label: 'Phone (KR)', pattern: '0\\d{1,2}-\\d{3,4}-\\d{4}', flags: 'g' },
    { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags: 'g' },
    { label: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'gi' },
    { label: 'Whitespace+', pattern: '\\s+', flags: 'g' },
    { label: 'Number', pattern: '-?\\d+(?:\\.\\d+)?', flags: 'g' },
    { label: 'HTML Tag', pattern: '<[^>]+>', flags: 'gi' },
    { label: 'UUID', pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', flags: 'gi' },
];

const MATCH_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#ef4444', '#06b6d4', '#f97316',
];

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildRegex(pattern, flags) {
    try {
        return { re: new RegExp(pattern, flags), error: null };
    } catch (e) {
        return { re: null, error: e.message };
    }
}

function getMatches(re, text) {
    const matches = [];
    if (!re || !text) return matches;
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = r.exec(text)) !== null) {
        matches.push({ start: m.index, end: m.index + m[0].length, value: m[0], groups: Array.from(m).slice(1) });
        if (!re.flags.includes('g')) break;
    }
    return matches;
}

function highlightText(text, matches) {
    if (!matches.length) return `<span>${escapeHtml(text)}</span>`;
    let result = '';
    let cursor = 0;
    matches.forEach((m, i) => {
        if (m.start > cursor) result += escapeHtml(text.slice(cursor, m.start));
        const color = MATCH_COLORS[i % MATCH_COLORS.length];
        result += `<mark style="background:${color}22;border-bottom:2px solid ${color};border-radius:2px;" title="Match ${i + 1}">${escapeHtml(m.value)}</mark>`;
        cursor = m.end;
    });
    if (cursor < text.length) result += escapeHtml(text.slice(cursor));
    return result;
}

export function renderRegexTester(container) {
    let pattern = '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}';
    let flags = { g: true, i: true, m: false, s: false };
    let testText = 'Contact us at hello@DevPanda.dev or support@example.com\nVisit https://DevPanda.dev for more info.\nPhone: 010-1234-5678';
    let replacePat = '';
    let mode = 'match'; // 'match' | 'replace'

    function getFlagsStr() {
        return Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');
    }

    // ── Render shell (full render, only on state changes that affect layout) ──
    function render() {
        const flagsStr = getFlagsStr();
        const { re, error } = buildRegex(pattern, flagsStr);
        const matches = re ? getMatches(re, testText) : [];
        const highlighted = re ? highlightText(testText, matches) : escapeHtml(testText);
        const replaceResult = (mode === 'replace' && re && replacePat !== undefined)
            ? testText.replace(re, replacePat) : '';

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Regex Tester</span></div>
          <h1 class="tool-header__title">🔢 Regex Tester</h1>
          <p class="tool-header__desc">Build and test regular expressions with live matching, group capture, and replace preview.</p>
        </div>

        <div class="rx-layout">
          <!-- Left column -->
          <div>
            <!-- Pattern input -->
            <div class="panel">
              <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
                <span>🔍 Pattern</span>
                <div class="rx-flags">
                  ${['g', 'i', 'm', 's'].map(f => `
                    <button class="rx-flag-btn ${flags[f] ? 'rx-flag-btn--on' : ''}" data-flag="${f}" title="${flagTitle(f)}">${f}</button>
                  `).join('')}
                </div>
              </div>
              <div class="rx-pattern-wrap">
                <span class="rx-slash">/</span>
                <input class="form-input rx-pattern-input" id="rx-pattern" type="text"
                  value="${escapeHtml(pattern)}"
                  placeholder="Enter regex pattern…"
                  spellcheck="false" autocomplete="off" />
                <span class="rx-slash">/${getFlagsStr()}</span>
              </div>
              ${error ? `<div class="rx-error">⚠️ ${escapeHtml(error)}</div>` : ''}

              <!-- Mode tabs -->
              <div class="rx-mode-tabs" style="margin-top:var(--space-sm);">
                <button class="rx-mode-btn ${mode === 'match' ? 'rx-mode-btn--active' : ''}" data-mode="match">Match</button>
                <button class="rx-mode-btn ${mode === 'replace' ? 'rx-mode-btn--active' : ''}" data-mode="replace">Replace</button>
              </div>

              ${mode === 'replace' ? `
                <div style="margin-top:var(--space-sm);">
                  <label class="form-label">Replace with</label>
                  <input class="form-input" id="rx-replace" type="text"
                    value="${escapeHtml(replacePat)}"
                    placeholder="Replacement string (use $1, $2 for groups)…"
                    spellcheck="false" />
                </div>
              ` : ''}
            </div>

            <!-- Presets -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">⚡ Common Patterns</div>
              <div class="rx-presets">
                ${PRESETS.map(p => `
                  <button class="btn btn--secondary btn--sm rx-preset"
                    data-pattern="${escapeHtml(p.pattern)}" data-flags="${p.flags}">
                    ${p.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Match stats -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">📊 Match Info</div>
              ${!re ? `<div style="color:var(--text-muted);font-size:var(--text-sm);">Fix the pattern to see matches.</div>`
                : matches.length === 0 ? `<div class="rx-no-match">No matches found</div>`
                    : `
                <div class="rx-match-count">${matches.length} match${matches.length !== 1 ? 'es' : ''} found</div>
                <div class="rx-match-list">
                  ${matches.map((m, i) => `
                    <div class="rx-match-item">
                      <span class="rx-match-idx" style="background:${MATCH_COLORS[i % MATCH_COLORS.length]}22;color:${MATCH_COLORS[i % MATCH_COLORS.length]};">#${i + 1}</span>
                      <span class="rx-match-val">${escapeHtml(m.value)}</span>
                      <span class="rx-match-pos">[${m.start}–${m.end}]</span>
                      ${m.groups.length && m.groups.some(g => g !== undefined) ? `
                        <div class="rx-groups">
                          ${m.groups.map((g, gi) => g !== undefined ? `<span class="rx-group">$${gi + 1}: <code>${escapeHtml(g)}</code></span>` : '').join('')}
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>

          <!-- Right column -->
          <div>
            <!-- Test string -->
            <div class="panel">
              <div class="panel__title">📝 Test String</div>
              <div class="rx-editor">
                <!-- Highlighted overlay -->
                <div class="rx-highlight" id="rx-highlight" aria-hidden="true">${highlighted}<br/></div>
                <!-- Actual textarea (transparent, on top) -->
                <textarea class="rx-textarea" id="rx-text" spellcheck="false" rows="10">${escapeHtml(testText)}</textarea>
              </div>
            </div>

            <!-- Replace result -->
            ${mode === 'replace' && re ? `
              <div class="panel" style="margin-top:var(--space-md);">
                <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
                  <span>✨ Result</span>
                  <button class="btn btn--secondary btn--sm" id="rx-copy-result">Copy</button>
                </div>
                <pre class="rx-result-pre">${escapeHtml(replaceResult)}</pre>
              </div>
            ` : ''}

            <!-- Cheatsheet -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">📖 Quick Reference</div>
              <div class="rx-cheatsheet">
                ${[
                ['.', 'Any character (except newline)'],
                ['\\d', 'Digit [0-9]'],
                ['\\w', 'Word char [a-zA-Z0-9_]'],
                ['\\s', 'Whitespace'],
                ['\\b', 'Word boundary'],
                ['^', 'Start of string/line'],
                ['$', 'End of string/line'],
                ['*', '0 or more'],
                ['+', '1 or more'],
                ['?', '0 or 1 (optional)'],
                ['{n,m}', 'Between n and m times'],
                ['(abc)', 'Capture group'],
                ['(?:abc)', 'Non-capture group'],
                ['[abc]', 'Character class'],
                ['[^abc]', 'Negated class'],
                ['a|b', 'a or b'],
            ].map(([sym, desc]) => `
                  <div class="rx-cheat-row">
                    <code class="rx-cheat-sym">${escapeHtml(sym)}</code>
                    <span class="rx-cheat-desc">${desc}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

        setupEvents();
    }

    function flagTitle(f) {
        return { g: 'Global — find all matches', i: 'Case insensitive', m: 'Multiline (^ and $ per line)', s: 'Dotall (. matches newline)' }[f];
    }

    // ── Partial update: only redo highlight + matches (no full re-render) ──
    function updateResults() {
        const flagsStr = getFlagsStr();
        const { re, error } = buildRegex(pattern, flagsStr);
        const matches = re ? getMatches(re, testText) : [];
        const highlighted = re ? highlightText(testText, matches) : escapeHtml(testText);

        // Update highlight overlay
        const hl = container.querySelector('#rx-highlight');
        if (hl) hl.innerHTML = highlighted + '<br/>';

        // Update error
        const errEl = container.querySelector('.rx-error');
        if (error) {
            if (errEl) errEl.textContent = '⚠️ ' + error;
            else {
                const wrap = container.querySelector('.rx-pattern-wrap');
                if (wrap) {
                    const d = document.createElement('div');
                    d.className = 'rx-error';
                    d.textContent = '⚠️ ' + error;
                    wrap.after(d);
                }
            }
        } else if (errEl) errEl.remove();

        // Update match info panel
        const infoPanel = container.querySelector('.rx-match-list')?.parentElement
            || container.querySelector('.rx-no-match')?.parentElement
            || container.querySelector('.rx-match-count')?.parentElement;
        if (infoPanel) {
            const content = !re
                ? `<div style="color:var(--text-muted);font-size:var(--text-sm);">Fix the pattern to see matches.</div>`
                : matches.length === 0 ? `<div class="rx-no-match">No matches found</div>`
                    : `<div class="rx-match-count">${matches.length} match${matches.length !== 1 ? 'es' : ''} found</div>
           <div class="rx-match-list">
             ${matches.map((m, i) => `
               <div class="rx-match-item">
                 <span class="rx-match-idx" style="background:${MATCH_COLORS[i % MATCH_COLORS.length]}22;color:${MATCH_COLORS[i % MATCH_COLORS.length]};">#${i + 1}</span>
                 <span class="rx-match-val">${escapeHtml(m.value)}</span>
                 <span class="rx-match-pos">[${m.start}–${m.end}]</span>
                 ${m.groups.length && m.groups.some(g => g !== undefined) ? `
                   <div class="rx-groups">
                     ${m.groups.map((g, gi) => g !== undefined ? `<span class="rx-group">$${gi + 1}: <code>${escapeHtml(g)}</code></span>` : '').join('')}
                   </div>
                 ` : ''}
               </div>
             `).join('')}
           </div>`;
            // Replace content after the title
            const title = infoPanel.querySelector('.panel__title');
            if (title) title.nextSibling && (title.outerHTML = title.outerHTML);
            // Simpler: just update innerHTML minus the title
            const titleHTML = infoPanel.querySelector('.panel__title')?.outerHTML || '';
            infoPanel.innerHTML = titleHTML + content;
        }

        // Update replace result if visible
        const resultPre = container.querySelector('.rx-result-pre');
        if (resultPre && re) {
            try {
                resultPre.textContent = testText.replace(re, replacePat);
            } catch (_) { }
        }

        // Update flags display in slash label
        const slashLabels = container.querySelectorAll('.rx-slash');
        if (slashLabels.length >= 2) slashLabels[1].textContent = '/' + flagsStr;
    }

    function setupEvents() {
        // Pattern input — partial update, preserve focus
        container.querySelector('#rx-pattern')?.addEventListener('input', e => {
            pattern = e.target.value;
            updateResults();
        });

        // Test text — partial update, sync overlay scroll
        const textarea = container.querySelector('#rx-text');
        const highlight = container.querySelector('#rx-highlight');
        if (textarea && highlight) {
            textarea.addEventListener('input', e => {
                testText = e.target.value;
                updateResults();
            });
            textarea.addEventListener('scroll', () => {
                highlight.scrollTop = textarea.scrollTop;
                highlight.scrollLeft = textarea.scrollLeft;
            });
        }

        // Replace input
        container.querySelector('#rx-replace')?.addEventListener('input', e => {
            replacePat = e.target.value;
            updateResults();
        });

        // Flag buttons
        container.querySelectorAll('.rx-flag-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                flags[btn.dataset.flag] = !flags[btn.dataset.flag];
                btn.classList.toggle('rx-flag-btn--on', flags[btn.dataset.flag]);
                updateResults();
                // Update slash label
                const slashLabels = container.querySelectorAll('.rx-slash');
                if (slashLabels.length >= 2) slashLabels[1].textContent = '/' + getFlagsStr();
            });
        });

        // Mode tabs
        container.querySelectorAll('.rx-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => { mode = btn.dataset.mode; render(); });
        });

        // Presets
        container.querySelectorAll('.rx-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                pattern = btn.dataset.pattern;
                const f = btn.dataset.flags;
                flags = { g: f.includes('g'), i: f.includes('i'), m: f.includes('m'), s: f.includes('s') };
                const inp = container.querySelector('#rx-pattern');
                if (inp) inp.value = pattern;
                updateResults();
                // Update flag buttons
                container.querySelectorAll('.rx-flag-btn').forEach(fb => {
                    fb.classList.toggle('rx-flag-btn--on', flags[fb.dataset.flag]);
                });
                const slashLabels = container.querySelectorAll('.rx-slash');
                if (slashLabels.length >= 2) slashLabels[1].textContent = '/' + getFlagsStr();
            });
        });

        // Copy result
        container.querySelector('#rx-copy-result')?.addEventListener('click', () => {
            const pre = container.querySelector('.rx-result-pre');
            if (pre) navigator.clipboard.writeText(pre.textContent).then(() => {
                const btn = container.querySelector('#rx-copy-result');
                if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 1500); }
            });
        });
    }

    render();
}
