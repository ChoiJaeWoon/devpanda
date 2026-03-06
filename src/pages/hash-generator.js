/**
 * DevPanda — Hash Generator
 * MD5, SHA-1, SHA-256, SHA-384, SHA-512 for text and files.
 * Uses Web Crypto API (built-in, free) + inline MD5 implementation.
 */

/* ── MD5 (pure JS, no deps) ──────────────────── */
function md5(str) {
  function safeAdd(x, y) { const l = (x & 0xffff) + (y & 0xffff); return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff); }
  function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
  function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }

  const utf8 = unescape(encodeURIComponent(str));
  const bytes = Array.from(utf8, c => c.charCodeAt(0));
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bits = utf8.length * 8;
  bytes.push(bits & 0xff, (bits >>> 8) & 0xff, (bits >>> 16) & 0xff, (bits >>> 24) & 0xff, 0, 0, 0, 0);

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  for (let i = 0; i < bytes.length; i += 64) {
    const M = [];
    for (let j = 0; j < 16; j++) {
      M[j] = bytes[i + j * 4] | (bytes[i + j * 4 + 1] << 8) | (bytes[i + j * 4 + 2] << 16) | (bytes[i + j * 4 + 3] << 24);
    }
    let [aa, bb, cc, dd] = [a, b, c, d];
    a = md5ff(a, b, c, d, M[0], 7, -680876936); d = md5ff(d, a, b, c, M[1], 12, -389564586);
    c = md5ff(c, d, a, b, M[2], 17, 606105819); b = md5ff(b, c, d, a, M[3], 22, -1044525330);
    a = md5ff(a, b, c, d, M[4], 7, -176418897); d = md5ff(d, a, b, c, M[5], 12, 1200080426);
    c = md5ff(c, d, a, b, M[6], 17, -1473231341); b = md5ff(b, c, d, a, M[7], 22, -45705983);
    a = md5ff(a, b, c, d, M[8], 7, 1770035416); d = md5ff(d, a, b, c, M[9], 12, -1958414417);
    c = md5ff(c, d, a, b, M[10], 17, -42063); b = md5ff(b, c, d, a, M[11], 22, -1990404162);
    a = md5ff(a, b, c, d, M[12], 7, 1804603682); d = md5ff(d, a, b, c, M[13], 12, -40341101);
    c = md5ff(c, d, a, b, M[14], 17, -1502002290); b = md5ff(b, c, d, a, M[15], 22, 1236535329);
    a = md5gg(a, b, c, d, M[1], 5, -165796510); d = md5gg(d, a, b, c, M[6], 9, -1069501632);
    c = md5gg(c, d, a, b, M[11], 14, 643717713); b = md5gg(b, c, d, a, M[0], 20, -373897302);
    a = md5gg(a, b, c, d, M[5], 5, -701558691); d = md5gg(d, a, b, c, M[10], 9, 38016083);
    c = md5gg(c, d, a, b, M[15], 14, -660478335); b = md5gg(b, c, d, a, M[4], 20, -405537848);
    a = md5gg(a, b, c, d, M[9], 5, 568446438); d = md5gg(d, a, b, c, M[14], 9, -1019803690);
    c = md5gg(c, d, a, b, M[3], 14, -187363961); b = md5gg(b, c, d, a, M[8], 20, 1163531501);
    a = md5gg(a, b, c, d, M[13], 5, -1444681467); d = md5gg(d, a, b, c, M[2], 9, -51403784);
    c = md5gg(c, d, a, b, M[7], 14, 1735328473); b = md5gg(b, c, d, a, M[12], 20, -1926607734);
    a = md5hh(a, b, c, d, M[5], 4, -378558); d = md5hh(d, a, b, c, M[8], 11, -2022574463);
    c = md5hh(c, d, a, b, M[11], 16, 1839030562); b = md5hh(b, c, d, a, M[14], 23, -35309556);
    a = md5hh(a, b, c, d, M[1], 4, -1530992060); d = md5hh(d, a, b, c, M[4], 11, 1272893353);
    c = md5hh(c, d, a, b, M[7], 16, -155497632); b = md5hh(b, c, d, a, M[10], 23, -1094730640);
    a = md5hh(a, b, c, d, M[13], 4, 681279174); d = md5hh(d, a, b, c, M[0], 11, -358537222);
    c = md5hh(c, d, a, b, M[3], 16, -722521979); b = md5hh(b, c, d, a, M[6], 23, 76029189);
    a = md5hh(a, b, c, d, M[9], 4, -640364487); d = md5hh(d, a, b, c, M[12], 11, -421815835);
    c = md5hh(c, d, a, b, M[15], 16, 530742520); b = md5hh(b, c, d, a, M[2], 23, -995338651);
    a = md5ii(a, b, c, d, M[0], 6, -198630844); d = md5ii(d, a, b, c, M[7], 10, 1126891415);
    c = md5ii(c, d, a, b, M[14], 15, -1416354905); b = md5ii(b, c, d, a, M[5], 21, -57434055);
    a = md5ii(a, b, c, d, M[12], 6, 1700485571); d = md5ii(d, a, b, c, M[3], 10, -1894986606);
    c = md5ii(c, d, a, b, M[10], 15, -1051523); b = md5ii(b, c, d, a, M[1], 21, -2054922799);
    a = md5ii(a, b, c, d, M[8], 6, 1873313359); d = md5ii(d, a, b, c, M[15], 10, -30611744);
    c = md5ii(c, d, a, b, M[6], 15, -1560198380); b = md5ii(b, c, d, a, M[13], 21, 1309151649);
    a = md5ii(a, b, c, d, M[4], 6, -145523070); d = md5ii(d, a, b, c, M[11], 10, -1120210379);
    c = md5ii(c, d, a, b, M[2], 15, 718787259); b = md5ii(b, c, d, a, M[9], 21, -343485551);
    a = safeAdd(a, aa); b = safeAdd(b, bb); c = safeAdd(c, cc); d = safeAdd(d, dd);
  }

  return [a, b, c, d].map(n => {
    const hex = (((n & 0xff) << 24) | (((n >> 8) & 0xff) << 16) | (((n >> 16) & 0xff) << 8) | ((n >> 24) & 0xff)) >>> 0;
    return hex.toString(16).padStart(8, '0');
  }).join('');
}

/* ── Web Crypto hashes ───────────────────────── */
async function cryptoHash(algo, data) {
  const buf = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : data;
  const hashBuf = await crypto.subtle.digest(algo, buf);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const ALGOS = [
  { id: 'md5', label: 'MD5', bits: 128 },
  { id: 'sha1', label: 'SHA-1', bits: 160, algo: 'SHA-1' },
  { id: 'sha256', label: 'SHA-256', bits: 256, algo: 'SHA-256' },
  { id: 'sha384', label: 'SHA-384', bits: 384, algo: 'SHA-384' },
  { id: 'sha512', label: 'SHA-512', bits: 512, algo: 'SHA-512' },
];

/* ── Security notice HTML (no template literal nesting issues) ── */
const SECURITY_NOTICES = `
  <div class="hg-notice hg-notice--info" style="margin-top:12px;">
    <div class="hg-notice__title">&#8505;&#65039; Hashes are deterministic</div>
    <p style="font-size:13px;margin-top:4px;line-height:1.6;">
      The same input always produces the same hash. Anyone who runs <code>Hello</code> through SHA-256
      will get exactly the same result. This is great for file integrity checks and API signatures,
      but <strong>makes raw hashes unsuitable for storing passwords.</strong>
    </p>
  </div>
  <div class="hg-notice hg-notice--warn" style="margin-top:8px;">
    <div class="hg-notice__title">&#128683; Do not use SHA directly for password storage</div>
    <p style="font-size:13px;margin-top:4px;line-height:1.6;">
      Same password &rarr; same hash, every time. This makes it trivial to crack with rainbow tables.
      Use a dedicated library that automatically handles salting:
    </p>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center;">
      <span class="hg-notice__lib hg-notice__lib--good">bcrypt</span>
      <span class="hg-notice__lib hg-notice__lib--good">argon2</span>
      <span class="hg-notice__lib hg-notice__lib--good">scrypt</span>
      <span style="font-size:11px;color:#94a3b8;">&#8592; recommended for passwords</span>
    </div>
  </div>
`;

/* ── Main ────────────────────────────────────── */
export function renderHashGenerator(container) {
  let inputText = 'Hello, DevPanda!';
  let hashes = {};
  let uppercase = false;
  let compareHash = '';
  let fileInfo = null;
  let mode = 'text';

  function fmt(h) { return h ? (uppercase ? h.toUpperCase() : h.toLowerCase()) : ''; }

  async function computeHashes(data) {
    const results = {};
    results.md5 = typeof data === 'string' ? md5(data) : await (async () => {
      const bytes = new Uint8Array(data);
      const str = Array.from(bytes, b => String.fromCharCode(b)).join('');
      return md5(str);
    })();
    for (const a of ALGOS.filter(x => x.algo)) {
      results[a.id] = await cryptoHash(a.algo, data);
    }
    return results;
  }

  async function recompute(data) {
    hashes = await computeHashes(data);
    renderResults();
  }

  function renderResults() {
    const panel = container.querySelector('#hg-results');
    if (!panel) return;

    panel.innerHTML = ALGOS.map(a => {
      const h = fmt(hashes[a.id] || '');
      const matchComp = compareHash.trim() && h && h.toLowerCase() === compareHash.trim().toLowerCase();
      const mismatch = compareHash.trim() && h && h.toLowerCase() !== compareHash.trim().toLowerCase();
      return `
        <div class="hg-result ${matchComp ? 'hg-result--match' : mismatch ? 'hg-result--mismatch' : ''}">
          <div class="hg-result__header">
            <span class="hg-algo-badge">${a.label}</span>
            <span class="hg-bits">${a.bits}-bit</span>
            ${matchComp ? '<span class="hg-verify hg-verify--ok">&#10003; Match</span>' : ''}
            ${mismatch ? '<span class="hg-verify hg-verify--fail">&#10007; Mismatch</span>' : ''}
            <button class="btn btn--secondary btn--sm hg-copy" data-hash="${h}" style="margin-left:auto;">Copy</button>
          </div>
          <div class="hg-hash-val" id="hg-${a.id}">${h || '<span style="color:var(--text-muted)">Computing\u2026</span>'}</div>
        </div>
      `;
    }).join('');

    panel.querySelectorAll('.hg-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(btn.dataset.hash).then(() => {
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
        });
      });
    });
  }

  function render() {
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>&#8250;</span> <span>Hash Generator</span></div>
          <h1 class="tool-header__title">&#128272; Hash Generator</h1>
          <p class="tool-header__desc">Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text or files. All processing is done locally in your browser.</p>
        </div>

        <div class="hg-layout">
          <!-- Input column -->
          <div>
            <!-- Mode tabs -->
            <div class="panel">
              <div class="rx-mode-tabs" style="margin-bottom:var(--space-sm);">
                <button class="rx-mode-btn ${mode === 'text' ? 'rx-mode-btn--active' : ''}" data-mode="text">Text</button>
                <button class="rx-mode-btn ${mode === 'file' ? 'rx-mode-btn--active' : ''}" data-mode="file">File</button>
              </div>

              ${mode === 'text' ? `
                <div class="cp-input-group">
                  <label class="form-label">Input Text</label>
                  <textarea class="form-input" id="hg-text" rows="6" style="font-family:var(--font-mono);font-size:var(--text-sm);">${inputText}</textarea>
                </div>
                <div style="display:flex;justify-content:flex-end;gap:var(--space-sm);margin-top:var(--space-sm);">
                  <button class="btn btn--secondary btn--sm" id="hg-clear">Clear</button>
                  <button class="btn btn--secondary btn--sm" id="hg-paste">Paste</button>
                </div>
              ` : `
                ${!fileInfo ? `
                  <div class="drop-zone" id="hg-drop">
                    <div class="drop-zone__icon">&#128196;</div>
                    <div class="drop-zone__text">Drag &amp; drop a file here</div>
                    <div class="drop-zone__hint">Any file type supported</div>
                    <input type="file" id="hg-file" style="display:none" />
                  </div>
                ` : `
                  <div class="ir-source-info">
                    <div style="font-size:32px;">&#128196;</div>
                    <div class="ir-source-meta">
                      <div class="ir-source-name">${fileInfo.name}</div>
                      <div class="ir-source-dims">${(fileInfo.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button class="btn btn--secondary btn--sm" id="hg-clear-file">Change</button>
                  </div>
                `}
              `}
            </div>

            <!-- Options -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">&#9881;&#65039; Options</div>
              <div style="display:flex;align-items:center;gap:var(--space-sm);margin-top:var(--space-sm);">
                <label class="aug-toggle">
                  <input type="checkbox" id="hg-upper" ${uppercase ? 'checked' : ''} />
                  <span class="aug-toggle__track"></span>
                </label>
                <span class="form-label" style="margin:0;">Uppercase output</span>
              </div>
            </div>

            <!-- Verify / Compare -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">&#128269; Verify Hash</div>
              <p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:4px;">Paste a known hash to compare with generated results.</p>
              <input class="form-input" id="hg-compare" style="font-family:var(--font-mono);font-size:var(--text-sm);margin-top:var(--space-sm);"
                type="text" placeholder="Paste hash to compare..." value="${compareHash}" />
            </div>

            <!-- About -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">&#128218; About Hashing</div>
              <div class="hg-about">
                ${[
        ['MD5', '128-bit', '&#9888;&#65039; Weak', 'hg-weak', 'Broken &mdash; avoid for security'],
        ['SHA-1', '160-bit', '&#9888;&#65039; Weak', 'hg-weak', 'Deprecated &mdash; avoid for security'],
        ['SHA-256', '256-bit', '&#10003; Strong', 'hg-strong', 'Widely used, recommended'],
        ['SHA-384', '384-bit', '&#10003; Strong', 'hg-strong', 'Higher security margin'],
        ['SHA-512', '512-bit', '&#10003; Strong', 'hg-strong', 'Maximum security, larger output'],
      ].map(([algo, bits, status, cls, note]) => `
                  <div class="hg-about-row">
                    <span class="hg-algo-badge">${algo}</span>
                    <span style="font-size:var(--text-xs);color:var(--text-muted);">${bits}</span>
                    <span class="hg-status ${cls}">${status}</span>
                    <span style="font-size:var(--text-xs);color:var(--text-muted);flex:1;">${note}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Results column -->
          <div>
            <div class="panel">
              <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
                <span>&#128273; Generated Hashes</span>
                <button class="btn btn--secondary btn--sm" id="hg-copy-all">Copy All</button>
              </div>
              <div id="hg-results" style="margin-top:var(--space-sm);">
                <div style="color:var(--text-muted);font-size:var(--text-sm);">Computing hashes...</div>
              </div>
              ${SECURITY_NOTICES}
            </div>
          </div>
        </div>
      </div>
    `;

    setupEvents();
    if (mode === 'text') recompute(inputText);
  }

  function setupEvents() {
    container.querySelectorAll('.rx-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => { mode = btn.dataset.mode; render(); });
    });

    let debounce;
    container.querySelector('#hg-text')?.addEventListener('input', e => {
      inputText = e.target.value;
      clearTimeout(debounce);
      debounce = setTimeout(() => recompute(inputText), 250);
    });

    container.querySelector('#hg-clear')?.addEventListener('click', () => {
      inputText = '';
      const el = container.querySelector('#hg-text');
      if (el) el.value = '';
      recompute('');
    });
    container.querySelector('#hg-paste')?.addEventListener('click', async () => {
      const text = await navigator.clipboard.readText().catch(() => '');
      inputText = text;
      const el = container.querySelector('#hg-text');
      if (el) el.value = text;
      recompute(text);
    });

    const drop = container.querySelector('#hg-drop');
    const fi = container.querySelector('#hg-file');
    if (drop && fi) {
      drop.addEventListener('click', () => fi.click());
      drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drop-zone--active'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('drop-zone--active'));
      drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('drop-zone--active'); loadFile(e.dataTransfer.files[0]); });
      fi.addEventListener('change', e => loadFile(e.target.files[0]));
    }
    container.querySelector('#hg-clear-file')?.addEventListener('click', () => { fileInfo = null; hashes = {}; render(); });

    container.querySelector('#hg-upper')?.addEventListener('change', e => {
      uppercase = e.target.checked;
      renderResults();
    });

    container.querySelector('#hg-compare')?.addEventListener('input', e => {
      compareHash = e.target.value;
      renderResults();
    });

    container.querySelector('#hg-copy-all')?.addEventListener('click', () => {
      const text = ALGOS.map(a => `${a.label}: ${fmt(hashes[a.id] || '')}`).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        const btn = container.querySelector('#hg-copy-all');
        if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy All'; }, 1500); }
      });
    });
  }

  async function loadFile(file) {
    if (!file) return;
    fileInfo = { name: file.name, size: file.size };
    render();
    const arrayBuffer = await file.arrayBuffer();
    hashes = await computeHashes(arrayBuffer);
    renderResults();
  }

  render();
}
