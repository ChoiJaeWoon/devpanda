/**
 * DevPanda — Confusion Matrix Generator
 * Paste predictions + ground truth → heatmap + Precision/Recall/F1
 */

/* ── Math ────────────────────────────────────── */
function buildMatrix(classes, trueLabels, predLabels) {
    const n = classes.length;
    const idx = Object.fromEntries(classes.map((c, i) => [c, i]));
    const matrix = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < trueLabels.length; i++) {
        const r = idx[trueLabels[i]];
        const c = idx[predLabels[i]];
        if (r !== undefined && c !== undefined) matrix[r][c]++;
    }
    return matrix;
}

function computeMetrics(matrix, classes) {
    const n = classes.length;
    const total = matrix.flat().reduce((a, b) => a + b, 0);
    const correct = matrix.reduce((s, row, i) => s + row[i], 0);
    const accuracy = total > 0 ? correct / total : 0;

    const perClass = classes.map((cls, i) => {
        const tp = matrix[i][i];
        const fp = matrix.reduce((s, row, r) => s + (r !== i ? row[i] : 0), 0);
        const fn = matrix[i].reduce((s, v, c) => s + (c !== i ? v : 0), 0);
        const tn = total - tp - fp - fn;
        const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;
        return { cls, tp, fp, fn, tn, precision, recall, f1, support: tp + fn };
    });

    // Macro avg
    const macro = {
        precision: perClass.reduce((s, m) => s + m.precision, 0) / n,
        recall: perClass.reduce((s, m) => s + m.recall, 0) / n,
        f1: perClass.reduce((s, m) => s + m.f1, 0) / n,
    };

    // Weighted avg
    const ws = perClass.reduce((s, m) => s + m.support, 0);
    const weighted = {
        precision: ws > 0 ? perClass.reduce((s, m) => s + m.precision * m.support, 0) / ws : 0,
        recall: ws > 0 ? perClass.reduce((s, m) => s + m.recall * m.support, 0) / ws : 0,
        f1: ws > 0 ? perClass.reduce((s, m) => s + m.f1 * m.support, 0) / ws : 0,
    };

    return { accuracy, perClass, macro, weighted, total };
}

/* ── Canvas Heatmap ──────────────────────────── */
function drawMatrix(canvas, matrix, classes) {
    const n = classes.length;
    const CELL = Math.max(40, Math.min(80, Math.floor(600 / (n + 1))));
    const PAD_LEFT = CELL * 1.6;
    const PAD_TOP = CELL * 1.2;
    const W = PAD_LEFT + CELL * n;
    const H = PAD_TOP + CELL * n + CELL * 0.5;

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    const maxVal = Math.max(...matrix.flat(), 1);

    // Draw cells
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const val = matrix[r][c];
            const intensity = val / maxVal;
            const isCorrect = r === c;

            // Background
            if (isCorrect) {
                // Diagonal: indigo shades
                const alpha = 0.15 + intensity * 0.75;
                ctx.fillStyle = `rgba(79,70,229,${alpha})`;
            } else {
                // Off-diagonal: red shades
                const alpha = intensity * 0.55;
                ctx.fillStyle = intensity > 0
                    ? `rgba(239,68,68,${alpha})`
                    : '#ffffff';
            }
            ctx.fillRect(PAD_LEFT + c * CELL, PAD_TOP + r * CELL, CELL, CELL);

            // Cell border
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.strokeRect(PAD_LEFT + c * CELL, PAD_TOP + r * CELL, CELL, CELL);

            // Value text
            const textColor = intensity > 0.55 ? '#ffffff' : (isCorrect ? '#3730a3' : '#991b1b');
            ctx.fillStyle = val > 0 ? textColor : '#94a3b8';
            ctx.font = `bold ${Math.max(10, CELL * 0.28)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(val, PAD_LEFT + c * CELL + CELL / 2, PAD_TOP + r * CELL + CELL / 2);
        }
    }

    // Row labels (True)
    ctx.font = `bold ${Math.max(9, CELL * 0.22)}px sans-serif`;
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'right';
    for (let r = 0; r < n; r++) {
        ctx.fillText(
            classes[r].length > 10 ? classes[r].slice(0, 9) + '…' : classes[r],
            PAD_LEFT - 8,
            PAD_TOP + r * CELL + CELL / 2,
        );
    }

    // Col labels (Predicted)
    ctx.textAlign = 'center';
    for (let c = 0; c < n; c++) {
        ctx.save();
        ctx.translate(PAD_LEFT + c * CELL + CELL / 2, PAD_TOP - 8);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText(
            classes[c].length > 10 ? classes[c].slice(0, 9) + '…' : classes[c],
            0, 0,
        );
        ctx.restore();
    }

    // Axis titles
    ctx.font = `600 ${Math.max(10, CELL * 0.2)}px sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('Predicted →', PAD_LEFT + (CELL * n) / 2, PAD_TOP - CELL * 0.8);
    ctx.save();
    ctx.translate(PAD_LEFT * 0.22, PAD_TOP + (CELL * n) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('True →', 0, 0);
    ctx.restore();
}

/* ── Parsers ─────────────────────────────────── */
function parseLines(text) {
    return text.trim().split('\n').map(l => l.trim()).filter(Boolean);
}

const EXAMPLES = {
    binary: {
        classes: 'Cat\nDog',
        true: 'Cat\nCat\nCat\nDog\nDog\nDog\nCat\nDog\nCat\nDog',
        pred: 'Cat\nCat\nDog\nDog\nDog\nCat\nCat\nDog\nDog\nDog',
    },
    multi: {
        classes: 'Cat\nDog\nBird',
        true: 'Cat\nCat\nCat\nCat\nCat\nDog\nDog\nDog\nDog\nDog\nBird\nBird\nBird\nBird\nBird',
        pred: 'Cat\nCat\nCat\nDog\nBird\nDog\nDog\nDog\nCat\nBird\nBird\nBird\nDog\nCat\nBird',
    },
    yolo: {
        classes: 'Person\nCar\nTruck\nBicycle',
        true: 'Person\nPerson\nPerson\nPerson\nPerson\nCar\nCar\nCar\nCar\nCar\nTruck\nTruck\nTruck\nBicycle\nBicycle',
        pred: 'Person\nPerson\nPerson\nCar\nPerson\nCar\nCar\nCar\nPerson\nCar\nTruck\nTruck\nCar\nBicycle\nPerson',
    },
};

function pct(v) { return (v * 100).toFixed(1) + '%'; }
function fmtF1(v) { return v.toFixed(3); }

/* ── Main ────────────────────────────────────── */
export function renderConfusionMatrix(container) {
    let classesText = EXAMPLES.binary.classes;
    let trueText = EXAMPLES.binary.true;
    let predText = EXAMPLES.binary.pred;

    function compute() {
        const classes = parseLines(classesText);
        const trueLabels = parseLines(trueText);
        const predLabels = parseLines(predText);
        if (classes.length < 2 || trueLabels.length !== predLabels.length) return null;
        const matrix = buildMatrix(classes, trueLabels, predLabels);
        const metrics = computeMetrics(matrix, classes);
        return { classes, matrix, metrics };
    }

    function render() {
        const result = compute();
        const hasResult = !!result;

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Confusion Matrix</span></div>
          <h1 class="tool-header__title">🎯 Confusion Matrix</h1>
          <p class="tool-header__desc">Enter class names, true labels, and predicted labels to generate a confusion matrix with precision, recall, and F1-score.</p>
        </div>

        <div class="cm-layout">
          <!-- Input Panel -->
          <div>
            <div class="panel">
              <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
                <span>📥 Input Data</span>
                <div style="display:flex;gap:6px;">
                  ${Object.keys(EXAMPLES).map(k => `
                    <button class="btn btn--secondary btn--sm" data-example="${k}">${k.charAt(0).toUpperCase() + k.slice(1)}</button>
                  `).join('')}
                </div>
              </div>

              <div class="cm-inputs">
                <div class="cp-input-group">
                  <label class="form-label">Classes (one per line)</label>
                  <textarea class="form-input cm-textarea" id="cm-classes" rows="4" placeholder="Cat&#10;Dog&#10;Bird">${classesText}</textarea>
                </div>
                <div class="cp-input-group">
                  <label class="form-label">True Labels (one per line)</label>
                  <textarea class="form-input cm-textarea" id="cm-true" rows="8" placeholder="Cat&#10;Dog&#10;Cat&#10;...">${trueText}</textarea>
                </div>
                <div class="cp-input-group">
                  <label class="form-label">Predicted Labels (one per line)</label>
                  <textarea class="form-input cm-textarea" id="cm-pred" rows="8" placeholder="Cat&#10;Cat&#10;Dog&#10;...">${predText}</textarea>
                </div>
              </div>

              ${!hasResult ? `
                <div class="cm-error">
                  ⚠️ Make sure true and predicted labels have the same number of entries, and at least 2 classes are defined.
                </div>
              ` : `
                <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-sm);">
                  ${result.metrics.total} samples · ${result.classes.length} classes
                </div>
              `}
            </div>
          </div>

          <!-- Results Panel -->
          <div>
            ${hasResult ? `
              <!-- Summary stats -->
              <div class="panel">
                <div class="panel__title">📊 Overall Metrics</div>
                <div class="cm-summary-stats">
                  <div class="cm-stat">
                    <div class="cm-stat__val">${pct(result.metrics.accuracy)}</div>
                    <div class="cm-stat__label">Accuracy</div>
                  </div>
                  <div class="cm-stat">
                    <div class="cm-stat__val">${fmtF1(result.metrics.macro.f1)}</div>
                    <div class="cm-stat__label">Macro F1</div>
                  </div>
                  <div class="cm-stat">
                    <div class="cm-stat__val">${fmtF1(result.metrics.weighted.f1)}</div>
                    <div class="cm-stat__label">Weighted F1</div>
                  </div>
                  <div class="cm-stat">
                    <div class="cm-stat__val">${result.metrics.total}</div>
                    <div class="cm-stat__label">Total Samples</div>
                  </div>
                </div>
              </div>

              <!-- Heatmap -->
              <div class="panel" style="margin-top:var(--space-md);">
                <div class="panel__title">🗺️ Confusion Matrix Heatmap</div>
                <div class="cm-canvas-wrap">
                  <canvas id="cm-canvas"></canvas>
                </div>
                <div class="cm-legend">
                  <span class="cm-legend-chip" style="background:rgba(79,70,229,0.7);color:#fff;">■ Correct (diagonal)</span>
                  <span class="cm-legend-chip" style="background:rgba(239,68,68,0.5);color:#fff;">■ Incorrect</span>
                </div>
              </div>

              <!-- Per-class table -->
              <div class="panel" style="margin-top:var(--space-md);">
                <div class="panel__title">📋 Per-Class Report</div>
                <div class="dm-table-wrap">
                  <table class="dm-table">
                    <thead>
                      <tr>
                        <th>Class</th>
                        <th>Precision</th>
                        <th>Recall</th>
                        <th>F1</th>
                        <th>TP</th>
                        <th>FP</th>
                        <th>FN</th>
                        <th>Support</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${result.metrics.perClass.map(m => `
                        <tr>
                          <td><strong>${m.cls}</strong></td>
                          <td>${pct(m.precision)}</td>
                          <td>${pct(m.recall)}</td>
                          <td>
                            <span class="cm-f1-bar-wrap">
                              <span class="cm-f1-bar" style="width:${(m.f1 * 100).toFixed(0)}%;"></span>
                            </span>
                            ${fmtF1(m.f1)}
                          </td>
                          <td style="color:#16a34a;font-weight:700;">${m.tp}</td>
                          <td style="color:#ef4444;">${m.fp}</td>
                          <td style="color:#d97706;">${m.fn}</td>
                          <td>${m.support}</td>
                        </tr>
                      `).join('')}
                      <tr style="border-top:2px solid var(--border);font-weight:700;background:var(--bg-secondary);">
                        <td>Macro avg</td>
                        <td>${pct(result.metrics.macro.precision)}</td>
                        <td>${pct(result.metrics.macro.recall)}</td>
                        <td>${fmtF1(result.metrics.macro.f1)}</td>
                        <td colspan="3"></td>
                        <td>${result.metrics.total}</td>
                      </tr>
                      <tr style="font-weight:700;background:var(--bg-secondary);">
                        <td>Weighted avg</td>
                        <td>${pct(result.metrics.weighted.precision)}</td>
                        <td>${pct(result.metrics.weighted.recall)}</td>
                        <td>${fmtF1(result.metrics.weighted.f1)}</td>
                        <td colspan="3"></td>
                        <td>${result.metrics.total}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ` : `
              <div class="mpc-empty" style="height:300px;justify-content:center;">
                <div style="font-size:48px;">🎯</div>
                <div>Enter valid data to generate the confusion matrix.</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

        // Draw canvas
        if (hasResult) {
            requestAnimationFrame(() => {
                const canvas = document.getElementById('cm-canvas');
                if (canvas) drawMatrix(canvas, result.matrix, result.classes);
            });
        }

        setupEvents();
    }

    function setupEvents() {
        // Textarea inputs
        container.querySelector('#cm-classes')?.addEventListener('input', e => { classesText = e.target.value; render(); });
        container.querySelector('#cm-true')?.addEventListener('input', e => { trueText = e.target.value; render(); });
        container.querySelector('#cm-pred')?.addEventListener('input', e => { predText = e.target.value; render(); });

        // Example presets
        container.querySelectorAll('[data-example]').forEach(btn => {
            btn.addEventListener('click', () => {
                const ex = EXAMPLES[btn.dataset.example];
                classesText = ex.classes;
                trueText = ex.true;
                predText = ex.pred;
                render();
            });
        });
    }

    render();
}
