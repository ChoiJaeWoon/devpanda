/**
 * DevPanda — Cron Parser
 * Parse cron expressions → human-readable description + next run times
 * Pure JS, no external dependencies.
 */

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every 5 minutes', expr: '*/5 * * * *' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Every day at midnight', expr: '0 0 * * *' },
  { label: 'Every day at noon', expr: '0 12 * * *' },
  { label: 'Weekdays at 9 AM', expr: '0 9 * * 1-5' },
  { label: 'Every Monday 8 AM', expr: '0 8 * * 1' },
  { label: 'Every Sunday midnight', expr: '0 0 * * 0' },
  { label: '1st of each month', expr: '0 0 1 * *' },
  { label: 'Every 6 hours', expr: '0 */6 * * *' },
  { label: 'Twice daily', expr: '0 9,18 * * *' },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ORDINAL = n => { const s = ['th', 'st', 'nd', 'rd']; const v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

const FIELD_DEFS = [
  { id: 'cron-min', label: 'Minute', placeholder: '*', hint: '0–59' },
  { id: 'cron-hr', label: 'Hour', placeholder: '*', hint: '0–23' },
  { id: 'cron-dom', label: 'Day (month)', placeholder: '*', hint: '1–31' },
  { id: 'cron-mon', label: 'Month', placeholder: '*', hint: '1–12' },
  { id: 'cron-dow', label: 'Day (week)', placeholder: '*', hint: '0–7' },
];

/* ── Field parser ──────────────────────────── */
function parseField(str, min, max) {
  if (str === '*') return { type: 'any' };
  if (str.startsWith('*/')) return { type: 'step', step: parseInt(str.slice(2)) };
  if (str.includes('/')) {
    const [range, step] = str.split('/');
    const [lo, hi] = range === '*' ? [min, max] : range.split('-').map(Number);
    return { type: 'range-step', lo, hi, step: parseInt(step) };
  }
  if (str.includes('-')) {
    const [lo, hi] = str.split('-').map(Number);
    return { type: 'range', lo, hi };
  }
  if (str.includes(',')) return { type: 'list', vals: str.split(',').map(Number) };
  const n = parseInt(str);
  if (!isNaN(n)) return { type: 'exact', val: n };
  return { type: 'invalid' };
}

/* ── Human-readable ────────────────────────── */
function describeField(field, unit, names) {
  switch (field.type) {
    case 'any': return `every ${unit}`;
    case 'step': return `every ${field.step} ${unit}s`;
    case 'range': return names ? `${names[field.lo]} through ${names[field.hi]}` : `${unit} ${field.lo} to ${field.hi}`;
    case 'range-step': return `every ${field.step} ${unit}s from ${names ? names[field.lo] : field.lo} to ${names ? names[field.hi] : field.hi}`;
    case 'list': return (names ? field.vals.map(v => names[v]) : field.vals).join(', ');
    case 'exact': return names ? names[field.val] : `${unit} ${field.val}`;
    default: return '?';
  }
}

function buildDescription(min, hr, dom, mon, dow) {
  const parts = [];
  if (min.type === 'any' && hr.type === 'any') parts.push('every minute');
  else if (min.type === 'step' && hr.type === 'any') parts.push(`every ${min.step} minute${min.step !== 1 ? 's' : ''}`);
  else if (min.type === 'exact' && hr.type === 'exact') parts.push(`at ${String(hr.val).padStart(2, '0')}:${String(min.val).padStart(2, '0')}`);
  else if (hr.type === 'exact' && min.type === 'any') parts.push(`every minute of ${hr.val}:00`);
  else if (min.type === 'exact' && hr.type === 'any') parts.push(`at minute ${min.val} of every hour`);
  else if (min.type === 'exact' && hr.type !== 'any') parts.push(`at minute ${min.val} of ${describeField(hr, 'hour', null)}`);
  else parts.push(`${describeField(min, 'minute', null)} of ${describeField(hr, 'hour', null)}`);
  if (dow.type !== 'any') parts.push(`on ${describeField(dow, 'day', DAYS)}`);
  if (dom.type !== 'any') parts.push(`on the ${dom.type === 'exact' ? ORDINAL(dom.val) : describeField(dom, 'day', null)} of the month`);
  if (mon.type !== 'any') parts.push(`in ${describeField(mon, 'month', MONTHS_LONG)}`);
  return parts.join(', ');
}

/* ── Next run times ────────────────────────── */
function matchField(field, val) {
  switch (field.type) {
    case 'any': return true;
    case 'step': return val % field.step === 0;
    case 'range-step': return val >= field.lo && val <= field.hi && (val - field.lo) % field.step === 0;
    case 'range': return val >= field.lo && val <= field.hi;
    case 'list': return field.vals.includes(val);
    case 'exact': return val === field.val;
    default: return false;
  }
}

function getNextRuns(expr, count = 8) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const ranges = [{ min: 0, max: 59 }, { min: 0, max: 23 }, { min: 1, max: 31 }, { min: 1, max: 12 }, { min: 0, max: 7 }];
  const [fMin, fHr, fDom, fMon, fDow] = parts.map((p, i) => parseField(p, ranges[i].min, ranges[i].max));
  const runs = [];
  const now = new Date(); now.setSeconds(0, 0); now.setMinutes(now.getMinutes() + 1);
  const limit = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 366);
  const cur = new Date(now);
  while (runs.length < count && cur < limit) {
    const month = cur.getMonth() + 1, day = cur.getDate(), hour = cur.getHours(), minute = cur.getMinutes(), weekday = cur.getDay();
    const dowMatch = fDow.type === 'any' || matchField(fDow, weekday) || matchField(fDow, weekday === 0 ? 7 : weekday);
    if (matchField(fMon, month) && matchField(fDom, day) && dowMatch && matchField(fHr, hour) && matchField(fMin, minute)) runs.push(new Date(cur));
    cur.setMinutes(cur.getMinutes() + 1);
  }
  return runs;
}

function formatDate(d) {
  const pad = n => String(n).padStart(2, '0');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[d.getDay()]} ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}  ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function timeFromNow(d) {
  const mins = Math.round((d - Date.now()) / 60000);
  if (mins < 60) return `in ${mins} min`;
  const hrs = Math.floor(mins / 60), rm = mins % 60;
  if (hrs < 24) return `in ${hrs}h ${rm}m`;
  return `in ${Math.floor(hrs / 24)}d`;
}

/* ── Main ──────────────────────────────────── */
export function renderCronParser(container) {
  let expr = '0 9 * * 1-5';

  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function parse(e) {
    const parts = e.trim().split(/\s+/);
    if (parts.length !== 5) return null;
    const specs = [
      { name: 'Minute', min: 0, max: 59, names: null },
      { name: 'Hour', min: 0, max: 23, names: null },
      { name: 'Day (month)', min: 1, max: 31, names: null },
      { name: 'Month', min: 1, max: 12, names: MONTHS_LONG },
      { name: 'Day (week)', min: 0, max: 7, names: DAYS },
    ];
    return parts.map((p, i) => ({ raw: p, field: parseField(p, specs[i].min, specs[i].max), ...specs[i] }));
  }

  function getExprFromInputs() {
    return FIELD_DEFS.map(f => container.querySelector(`#${f.id}`)?.value.trim() || '*').join(' ');
  }

  function renderFieldBreakdown(fields) {
    if (!fields) return '<div style="color:var(--text-muted);font-size:var(--text-sm);">Enter a valid expression to see breakdown.</div>';
    return fields.map(f => `
          <div class="cron-field ${f.field.type === 'invalid' ? 'cron-field--err' : ''}">
            <div class="cron-field__name">${f.name}</div>
            <div class="cron-field__raw"><code>${escHtml(f.raw)}</code></div>
            <div class="cron-field__range">${f.min}–${f.max}</div>
            <div class="cron-field__desc">${f.field.type === 'invalid' ? '⚠️ invalid' : escHtml(describeField(f.field, f.name.toLowerCase(), f.names))}</div>
          </div>
        `).join('');
  }

  function renderRuns(nextRuns) {
    return nextRuns.map((d, i) => `
          <div class="cron-run ${i === 0 ? 'cron-run--next' : ''}">
            <span class="cron-run__n">${i + 1}</span>
            <span class="cron-run__date">${formatDate(d)}</span>
            <span class="cron-run__rel">${timeFromNow(d)}</span>
          </div>
        `).join('');
  }

  function render() {
    const fields = parse(expr);
    const isValid = fields && fields.every(f => f.field.type !== 'invalid');
    const description = isValid ? buildDescription(...fields.map(f => f.field)) : null;
    const nextRuns = isValid ? getNextRuns(expr) : [];
    const parts = expr.trim().split(/\s+/);

    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>&#8250;</span> <span>Cron Parser</span></div>
          <h1 class="tool-header__title">&#9201;&#65039; Cron Parser</h1>
          <p class="tool-header__desc">Parse and understand cron expressions. See the next scheduled run times and a human-readable explanation.</p>
        </div>

        <div class="panel">
          <div class="panel__title">Cron Expression</div>
          <div class="cron-fields-input">
            ${FIELD_DEFS.map((f, i) => `
              <div class="cron-field-slot">
                <label class="cron-slot-label" for="${f.id}">${f.label}</label>
                <input class="form-input cron-slot-input" id="${f.id}"
                  type="text" value="${escHtml(parts[i] || '*')}"
                  placeholder="${f.placeholder}" spellcheck="false" autocomplete="off" />
                <span class="cron-slot-hint">${f.hint}</span>
              </div>
            `).join('')}
          </div>
          ${isValid
        ? `<div class="cron-desc">&#128197; ${escHtml(description)}</div>`
        : `<div class="cron-error">&#9888;&#65039; Invalid expression — check each field value.</div>`}
        </div>

        <div class="cron-layout">
          <div>
            <div class="panel">
              <div class="panel__title">&#128269; Field Breakdown</div>
              <div class="cron-fields" id="cron-breakdown">
                ${renderFieldBreakdown(fields)}
              </div>
            </div>
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">&#9889; Common Presets</div>
              <div class="cron-presets">
                ${PRESETS.map(p => `
                  <button class="cron-preset ${p.expr === expr ? 'cron-preset--active' : ''}" data-expr="${escHtml(p.expr)}">
                    <span class="cron-preset__label">${p.label}</span>
                    <code class="cron-preset__expr">${escHtml(p.expr)}</code>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <div>
            <div class="panel">
              <div class="panel__title">&#128336; Next ${nextRuns.length} Scheduled Runs</div>
              <div class="cron-runs" id="cron-runs">
                ${nextRuns.length === 0
        ? `<div style="color:var(--text-muted);font-size:var(--text-sm);margin-top:var(--space-sm);">No upcoming runs found in the next year.</div>`
        : renderRuns(nextRuns)}
              </div>
            </div>
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">&#128218; Quick Reference</div>
              <div class="cron-ref">
                ${[
        ['*', 'Any value'],
        ['*/n', 'Every n units'],
        ['n', 'Exact value'],
        ['n-m', 'Range from n to m'],
        ['n,m', 'List of values'],
        ['n-m/s', 'Range with step s'],
        ['0 9 * * 1-5', 'Weekdays 9 AM'],
        ['*/15 * * * *', 'Every 15 min'],
        ['0 0 1 * *', '1st of month midnight'],
        ['0 0 * * 0', 'Every Sunday midnight'],
      ].map(([sym, desc]) => `
                  <div class="cron-ref-row">
                    <code class="cron-ref-sym">${escHtml(sym)}</code>
                    <span class="cron-ref-desc">${desc}</span>
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

  function updateLive() {
    const fields = parse(expr);
    const isValid = fields && fields.every(f => f.field.type !== 'invalid');

    const descEl = container.querySelector('.cron-desc');
    const errEl = container.querySelector('.cron-error');
    if (isValid) {
      const desc = buildDescription(...fields.map(f => f.field));
      if (descEl) descEl.textContent = '📅 ' + desc;
      else { render(); return; }
      if (errEl) errEl.remove();
    } else {
      if (!errEl) { render(); return; }
      if (descEl) descEl.remove();
    }

    const breakdownEl = container.querySelector('#cron-breakdown');
    if (breakdownEl) breakdownEl.innerHTML = renderFieldBreakdown(fields);

    const runsEl = container.querySelector('#cron-runs');
    const nextRuns = isValid ? getNextRuns(expr) : [];
    if (runsEl) {
      runsEl.innerHTML = nextRuns.length === 0
        ? '<div style="color:var(--text-muted);font-size:var(--text-sm);">No upcoming runs found.</div>'
        : renderRuns(nextRuns);
    }

    container.querySelectorAll('.cron-preset').forEach(btn => {
      btn.classList.toggle('cron-preset--active', btn.dataset.expr === expr);
    });
  }

  function setupEvents() {
    FIELD_DEFS.forEach(f => {
      container.querySelector(`#${f.id}`)?.addEventListener('input', () => {
        expr = getExprFromInputs();
        updateLive();
      });
    });

    container.querySelectorAll('.cron-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        expr = btn.dataset.expr;
        const parts = expr.trim().split(/\s+/);
        FIELD_DEFS.forEach((f, i) => {
          const el = container.querySelector(`#${f.id}`);
          if (el) el.value = parts[i] || '*';
        });
        updateLive();
      });
    });
  }

  render();
}
