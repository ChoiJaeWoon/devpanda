/**
 * DevPanda — Detection Metrics
 * IoU Calculator + NMS Simulator with canvas visualization
 */

/* ── Math ────────────────────────────────────── */
function computeIoU(a, b) {
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.w, b.x + b.w);
    const y2 = Math.min(a.y + a.h, b.y + b.h);
    const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const aArea = a.w * a.h;
    const bArea = b.w * b.h;
    const union = aArea + bArea - inter;
    return { iou: union > 0 ? inter / union : 0, inter, union, aArea, bArea };
}

function nms(boxes, iouThresh, confThresh) {
    // Filter by confidence
    let kept = boxes.filter(b => b.conf >= confThresh);
    // Sort by confidence descending
    kept = [...kept].sort((a, b) => b.conf - a.conf);

    const result = [];
    const suppressed = new Set();

    for (let i = 0; i < kept.length; i++) {
        if (suppressed.has(i)) continue;
        result.push({ ...kept[i], kept: true });
        for (let j = i + 1; j < kept.length; j++) {
            if (suppressed.has(j)) continue;
            const { iou } = computeIoU(kept[i], kept[j]);
            if (iou >= iouThresh) suppressed.add(j);
        }
    }

    // Mark suppressed
    const removedBoxes = kept.filter((_, i) => suppressed.has(i)).map(b => ({ ...b, kept: false }));
    return [...result, ...removedBoxes];
}

/* ── Canvas Drawing ──────────────────────────── */
const COLORS = ['#4f46e5', '#ef4444', '#16a34a', '#d97706', '#0891b2', '#9333ea', '#ec4899'];

function drawIoUCanvas(canvas, boxA, boxB) {
    const SIZE = canvas.width;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, SIZE, SIZE);

    // Background grid
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i < SIZE; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(SIZE, i); ctx.stroke();
    }

    function toCanvas(box) {
        return {
            x: box.x / 100 * SIZE,
            y: box.y / 100 * SIZE,
            w: box.w / 100 * SIZE,
            h: box.h / 100 * SIZE,
        };
    }

    const cA = toCanvas(boxA);
    const cB = toCanvas(boxB);

    // Draw boxes (semi-transparent fill)
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#4f46e5'; ctx.fillRect(cA.x, cA.y, cA.w, cA.h);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(cB.x, cB.y, cB.w, cB.h);
    ctx.globalAlpha = 1;

    // Intersection
    const ix = Math.max(cA.x, cB.x);
    const iy = Math.max(cA.y, cB.y);
    const ix2 = Math.min(cA.x + cA.w, cB.x + cB.w);
    const iy2 = Math.min(cA.y + cA.h, cB.y + cB.h);
    if (ix2 > ix && iy2 > iy) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#8b5cf6';
        ctx.fillRect(ix, iy, ix2 - ix, iy2 - iy);
        ctx.globalAlpha = 1;
    }

    // Box borders
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4f46e5'; ctx.strokeRect(cA.x, cA.y, cA.w, cA.h);
    ctx.strokeStyle = '#ef4444'; ctx.strokeRect(cB.x, cB.y, cB.w, cB.h);

    // Labels
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#4f46e5';
    ctx.fillText('Box A (GT)', cA.x + 4, cA.y + 16);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Box B (Pred)', cB.x + 4, cB.y + 16);
}

function drawNMSCanvas(canvas, boxes, iouThresh, confThresh, showResult) {
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke();
    }

    const processed = showResult ? nms(boxes, iouThresh, confThresh) : boxes.map(b => ({ ...b, kept: true }));

    processed.forEach((box, i) => {
        const x = box.x / 100 * W;
        const y = box.y / 100 * H;
        const w = box.w / 100 * W;
        const h = box.h / 100 * H;
        const color = COLORS[i % COLORS.length];

        if (!showResult || box.kept) {
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, h);
            ctx.globalAlpha = 1;
            ctx.strokeStyle = color;
            ctx.lineWidth = showResult && box.kept ? 3 : 1.5;
            ctx.strokeRect(x, y, w, h);
            ctx.font = 'bold 11px sans-serif';
            ctx.fillStyle = color;
            ctx.fillText(`${(box.conf * 100).toFixed(0)}%`, x + 4, y + 14);
        } else {
            // Suppressed
            ctx.globalAlpha = 0.25;
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 3]);
            ctx.strokeRect(x, y, w, h);
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.fillText('✕', x + 4, y + 14);
        }
    });
}

/* ── Main ────────────────────────────────────── */
export function renderDetectionMetrics(container) {
    // IoU state
    let boxA = { x: 10, y: 20, w: 45, h: 45 };
    let boxB = { x: 25, y: 30, w: 45, h: 45 };

    // NMS state
    let nmsBoxes = [
        { x: 10, y: 20, w: 50, h: 50, conf: 0.92 },
        { x: 15, y: 25, w: 50, h: 50, conf: 0.78 },
        { x: 18, y: 22, w: 48, h: 48, conf: 0.65 },
        { x: 55, y: 15, w: 35, h: 40, conf: 0.88 },
        { x: 60, y: 18, w: 35, h: 40, conf: 0.55 },
        { x: 20, y: 55, w: 30, h: 35, conf: 0.42 },
    ];
    let iouThresh = 0.5;
    let confThresh = 0.3;

    function getIoUResult() { return computeIoU(boxA, boxB); }

    function iouStatus(iou) {
        if (iou >= 0.75) return { label: 'Great match', color: '#16a34a' };
        if (iou >= 0.5) return { label: 'Good (TP at IoU≥0.5)', color: '#4f46e5' };
        if (iou >= 0.25) return { label: 'Partial overlap', color: '#d97706' };
        return { label: 'Poor / False Positive', color: '#ef4444' };
    }

    function render() {
        const { iou, inter, aArea, bArea } = getIoUResult();
        const status = iouStatus(iou);

        const nmsResult = nms(nmsBoxes, iouThresh, confThresh);
        const keptCount = nmsResult.filter(b => b.kept).length;

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Detection Metrics</span></div>
          <h1 class="tool-header__title">📐 Detection Metrics</h1>
          <p class="tool-header__desc">Calculate IoU between bounding boxes and simulate Non-Maximum Suppression (NMS) with adjustable thresholds.</p>
        </div>

        <!-- ═══ IoU SECTION ═══ -->
        <div class="panel dm-section">
          <div class="panel__title" style="font-size:var(--text-lg);">🎯 IoU Calculator</div>
          <p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:4px;">Enter box coordinates as % of image size (0–100). Drag values to adjust.</p>

          <div class="dm-iou-layout">
            <!-- Controls -->
            <div>
              <div class="dm-box-grid">
                <!-- Box A -->
                <div class="dm-box-panel dm-box-panel--a">
                  <div class="dm-box-title">📦 Box A — Ground Truth</div>
                  ${['x', 'y', 'w', 'h'].map(f => `
                    <div class="dm-field">
                      <label class="dm-field__label">${f.toUpperCase()}</label>
                      <input class="form-input dm-input" type="number" id="a-${f}" min="0" max="100" value="${boxA[f]}" />
                    </div>
                  `).join('')}
                </div>
                <!-- Box B -->
                <div class="dm-box-panel dm-box-panel--b">
                  <div class="dm-box-title">📦 Box B — Prediction</div>
                  ${['x', 'y', 'w', 'h'].map(f => `
                    <div class="dm-field">
                      <label class="dm-field__label">${f.toUpperCase()}</label>
                      <input class="form-input dm-input" type="number" id="b-${f}" min="0" max="100" value="${boxB[f]}" />
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- IoU Result -->
              <div class="dm-iou-result">
                <div class="dm-iou-value" style="color:${status.color};">${iou.toFixed(4)}</div>
                <div class="dm-iou-label">IoU</div>
                <div class="dm-iou-status" style="color:${status.color};">${status.label}</div>
              </div>
              <div class="dm-iou-bar">
                <div class="dm-iou-bar__fill" style="width:${(iou * 100).toFixed(1)}%;background:${status.color};"></div>
              </div>
              <div class="dm-iou-stats">
                <div class="dm-iou-stat"><span>Box A Area</span><strong>${aArea.toFixed(1)}%²</strong></div>
                <div class="dm-iou-stat"><span>Box B Area</span><strong>${bArea.toFixed(1)}%²</strong></div>
                <div class="dm-iou-stat"><span>Intersection</span><strong>${inter.toFixed(1)}%²</strong></div>
                <div class="dm-iou-stat"><span>IoU %</span><strong>${(iou * 100).toFixed(2)}%</strong></div>
              </div>
              <div class="dm-iou-thresholds">
                <span class="${iou >= 0.5 ? 'dm-badge dm-badge--green' : 'dm-badge dm-badge--gray'}">IoU≥0.5: ${iou >= 0.5 ? 'TP ✓' : 'FP ✗'}</span>
                <span class="${iou >= 0.75 ? 'dm-badge dm-badge--green' : 'dm-badge dm-badge--gray'}">IoU≥0.75: ${iou >= 0.75 ? 'TP ✓' : 'FP ✗'}</span>
              </div>
            </div>

            <!-- Canvas -->
            <div>
              <canvas id="iou-canvas" width="360" height="360" class="dm-canvas"></canvas>
            </div>
          </div>
        </div>

        <!-- ═══ NMS SECTION ═══ -->
        <div class="panel dm-section" style="margin-top:var(--space-md);">
          <div class="panel__title" style="font-size:var(--text-lg);">🗜️ NMS Simulator</div>
          <p style="font-size:var(--text-sm);color:var(--text-muted);margin-top:4px;">Adjust thresholds to see how NMS filters overlapping boxes. Boxes below confidence threshold are removed first, then overlapping boxes above IoU threshold are suppressed.</p>

          <div class="dm-nms-controls">
            <div class="dm-nms-ctrl">
              <label class="form-label">IoU Threshold: <strong>${iouThresh}</strong></label>
              <input class="aug-slider" type="range" id="iou-thresh" min="0.1" max="0.9" step="0.05" value="${iouThresh}" />
            </div>
            <div class="dm-nms-ctrl">
              <label class="form-label">Confidence Threshold: <strong>${confThresh}</strong></label>
              <input class="aug-slider" type="range" id="conf-thresh" min="0" max="0.9" step="0.05" value="${confThresh}" />
            </div>
            <div class="dm-nms-ctrl" style="align-self:flex-end;">
              <div class="dm-nms-stat">
                <span>${nmsBoxes.length} total → </span>
                <span style="color:#16a34a;font-weight:700;">${keptCount} kept</span>
                <span> / </span>
                <span style="color:#ef4444;font-weight:700;">${nmsResult.length - keptCount} removed</span>
              </div>
            </div>
          </div>

          <div class="dm-nms-canvases">
            <div>
              <div class="dm-canvas-label">Before NMS (${nmsBoxes.filter(b => b.conf >= confThresh).length} boxes above conf threshold)</div>
              <canvas id="nms-before" width="360" height="300" class="dm-canvas"></canvas>
            </div>
            <div>
              <div class="dm-canvas-label">After NMS (<span style="color:#16a34a;font-weight:700;">${keptCount} kept</span> — solid borders)</div>
              <canvas id="nms-after" width="360" height="300" class="dm-canvas"></canvas>
            </div>
          </div>

          <!-- NMS Boxes Table -->
          <div style="margin-top:var(--space-md);">
            <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Box Details</div>
            <div class="dm-table-wrap">
              <table class="dm-table">
                <thead><tr><th>#</th><th>X</th><th>Y</th><th>W</th><th>H</th><th>Conf</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  ${nmsBoxes.map((box, i) => {
            const processed = nms(nmsBoxes, iouThresh, confThresh);
            const match = processed.find((_, pi) => nms(nmsBoxes, iouThresh, confThresh).indexOf(processed[pi]) === pi);
            const allProcessed = nms(nmsBoxes, iouThresh, confThresh);
            // Find if this box is in result
            const keptBox = allProcessed.find(p => p.x === box.x && p.y === box.y && p.conf === box.conf && p.kept);
            const belowConf = box.conf < confThresh;
            return `
                    <tr>
                      <td><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${COLORS[i % COLORS.length]};"></span></td>
                      <td>${box.x}</td><td>${box.y}</td><td>${box.w}</td><td>${box.h}</td>
                      <td><strong>${(box.conf * 100).toFixed(0)}%</strong></td>
                      <td>
                        ${belowConf
                    ? '<span class="dm-badge dm-badge--gray">Below conf</span>'
                    : keptBox
                        ? '<span class="dm-badge dm-badge--green">✓ Kept</span>'
                        : '<span class="dm-badge dm-badge--red">✗ Suppressed</span>'
                }
                      </td>
                      <td><button class="dm-del-btn" data-nms-del="${i}">✕</button></td>
                    </tr>`;
        }).join('')}
                </tbody>
              </table>
            </div>
            <button class="btn btn--secondary btn--sm" id="nms-add" style="margin-top:var(--space-sm);">+ Add Box</button>
          </div>
        </div>
      </div>
    `;

        setupEvents();
        requestAnimationFrame(drawAll);
    }

    function drawAll() {
        const iouC = document.getElementById('iou-canvas');
        if (iouC) drawIoUCanvas(iouC, boxA, boxB);
        const before = document.getElementById('nms-before');
        const after = document.getElementById('nms-after');
        if (before) drawNMSCanvas(before, nmsBoxes, iouThresh, confThresh, false);
        if (after) drawNMSCanvas(after, nmsBoxes, iouThresh, confThresh, true);
    }

    function setupEvents() {
        // IoU inputs
        ['a', 'b'].forEach(box => {
            ['x', 'y', 'w', 'h'].forEach(f => {
                const el = document.getElementById(`${box}-${f}`);
                el?.addEventListener('input', e => {
                    const target = box === 'a' ? boxA : boxB;
                    target[f] = parseFloat(e.target.value) || 0;
                    render();
                });
            });
        });

        // NMS sliders
        document.getElementById('iou-thresh')?.addEventListener('input', e => {
            iouThresh = parseFloat(e.target.value);
            render();
        });
        document.getElementById('conf-thresh')?.addEventListener('input', e => {
            confThresh = parseFloat(e.target.value);
            render();
        });

        // Delete NMS box
        container.querySelectorAll('[data-nms-del]').forEach(btn => {
            btn.addEventListener('click', () => {
                nmsBoxes.splice(parseInt(btn.dataset.nmsDel), 1);
                render();
            });
        });

        // Add NMS box
        document.getElementById('nms-add')?.addEventListener('click', () => {
            nmsBoxes.push({
                x: Math.floor(Math.random() * 60),
                y: Math.floor(Math.random() * 60),
                w: 20 + Math.floor(Math.random() * 30),
                h: 20 + Math.floor(Math.random() * 30),
                conf: parseFloat((0.3 + Math.random() * 0.6).toFixed(2)),
            });
            render();
        });
    }

    render();
}
