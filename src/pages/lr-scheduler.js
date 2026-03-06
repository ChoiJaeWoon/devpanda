/**
 * DevPanda — LR Scheduler Visualizer
 * Visualize and compare learning rate schedules in real-time.
 */
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

let chartInstance = null;

const SCHEDULERS = {
    cosine_warmup: {
        label: 'Cosine + Warmup',
        color: '#4f46e5',
        desc: 'Warmup for N epochs then cosine annealing. Most popular choice for YOLO/transformers.',
    },
    cosine: {
        label: 'Cosine Annealing',
        color: '#0891b2',
        desc: 'Smoothly decreases LR following a cosine curve. Great default choice.',
    },
    step: {
        label: 'Step Decay',
        color: '#d97706',
        desc: 'Drops LR by a fixed factor every N epochs. Simple and predictable.',
    },
    linear: {
        label: 'Linear Decay',
        color: '#16a34a',
        desc: 'Linearly decreases LR from initial to min. Simple baseline.',
    },
    exponential: {
        label: 'Exponential',
        color: '#9333ea',
        desc: 'Exponentially decays LR each epoch. Fast decay early, slow later.',
    },
    onecycle: {
        label: 'OneCycleLR',
        color: '#ef4444',
        desc: 'Increases LR then decreases. PyTorch OneCycleLR — effective for fast training.',
    },
};

/* ── Math ────────────────────────────────────── */
function computeLR(scheduler, epoch, opts) {
    const { initLR, minLR, totalEpochs, warmupEpochs, stepSize, stepGamma, gamma } = opts;
    const progress = (epoch - warmupEpochs) / Math.max(totalEpochs - warmupEpochs, 1);
    const inWarmup = epoch < warmupEpochs;

    switch (scheduler) {
        case 'cosine_warmup':
            if (inWarmup) return minLR + (initLR - minLR) * (epoch / Math.max(warmupEpochs, 1));
            return minLR + 0.5 * (initLR - minLR) * (1 + Math.cos(Math.PI * progress));

        case 'cosine': {
            const p = epoch / totalEpochs;
            return minLR + 0.5 * (initLR - minLR) * (1 + Math.cos(Math.PI * p));
        }

        case 'step': {
            const drops = Math.floor(epoch / Math.max(stepSize, 1));
            return Math.max(minLR, initLR * Math.pow(stepGamma, drops));
        }

        case 'linear': {
            const p = epoch / totalEpochs;
            return Math.max(minLR, initLR - (initLR - minLR) * p);
        }

        case 'exponential':
            return Math.max(minLR, initLR * Math.pow(gamma, epoch));

        case 'onecycle': {
            const half = totalEpochs / 2;
            if (epoch < half) {
                // Rising phase
                return minLR + (initLR - minLR) * (epoch / half);
            } else {
                // Falling phase — down to minLR/10
                const p = (epoch - half) / half;
                return Math.max(minLR / 10, initLR - (initLR - minLR / 10) * p);
            }
        }

        default: return initLR;
    }
}

function buildDataset(scheduler, opts) {
    const lrs = [];
    for (let e = 0; e <= opts.totalEpochs; e++) {
        lrs.push(computeLR(scheduler, e, opts));
    }
    return lrs;
}

/* ── Render ──────────────────────────────────── */
export function renderLRScheduler(container) {
    let enabled = new Set(['cosine_warmup', 'cosine', 'step']);
    let opts = {
        initLR: 0.01,
        minLR: 0.0001,
        totalEpochs: 100,
        warmupEpochs: 5,
        stepSize: 20,
        stepGamma: 0.5,
        gamma: 0.97,
    };

    function render() {
        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>LR Scheduler Visualizer</span></div>
          <h1 class="tool-header__title">📉 LR Scheduler Visualizer</h1>
          <p class="tool-header__desc">Compare learning rate schedules and understand how LR changes across training epochs.</p>
        </div>

        <div class="lr-layout">
          <!-- Left: Controls -->
          <div class="lr-controls panel">
            <div class="panel__title">⚙️ Parameters</div>

            <div class="lr-param-grid">
              <div class="cp-input-group">
                <label class="form-label">Initial LR</label>
                <input class="form-input" id="initLR" type="number" step="0.001" min="0.0001" value="${opts.initLR}" />
              </div>
              <div class="cp-input-group">
                <label class="form-label">Min LR</label>
                <input class="form-input" id="minLR" type="number" step="0.0001" min="0" value="${opts.minLR}" />
              </div>
              <div class="cp-input-group">
                <label class="form-label">Total Epochs</label>
                <input class="form-input" id="totalEpochs" type="number" min="1" max="1000" value="${opts.totalEpochs}" />
              </div>
              <div class="cp-input-group">
                <label class="form-label">Warmup Epochs</label>
                <input class="form-input" id="warmupEpochs" type="number" min="0" value="${opts.warmupEpochs}" />
              </div>
              <div class="cp-input-group">
                <label class="form-label">Step Size</label>
                <input class="form-input" id="stepSize" type="number" min="1" value="${opts.stepSize}" />
              </div>
              <div class="cp-input-group">
                <label class="form-label">Step Gamma</label>
                <input class="form-input" id="stepGamma" type="number" step="0.05" min="0.01" max="1" value="${opts.stepGamma}" />
              </div>
              <div class="cp-input-group">
                <label class="form-label">Exp Gamma</label>
                <input class="form-input" id="gamma" type="number" step="0.005" min="0.5" max="0.999" value="${opts.gamma}" />
              </div>
            </div>

            <div class="panel__title" style="margin-top:var(--space-md);">📋 Schedulers</div>
            <div class="lr-sched-list">
              ${Object.entries(SCHEDULERS).map(([key, s]) => `
                <label class="lr-sched-item ${enabled.has(key) ? 'lr-sched-item--on' : ''}">
                  <input type="checkbox" data-sched="${key}" ${enabled.has(key) ? 'checked' : ''} style="display:none;" />
                  <span class="lr-swatch" style="background:${s.color};"></span>
                  <div>
                    <div class="lr-sched-name">${s.label}</div>
                    <div class="lr-sched-desc">${s.desc}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Right: Chart -->
          <div class="lr-chart-col">
            <div class="panel" style="height:100%;">
              <div class="panel__title">📈 Learning Rate Curve</div>
              <div class="lr-chart-wrap">
                <canvas id="lr-chart"></canvas>
              </div>

              <!-- Value at epoch lookup -->
              <div class="lr-lookup">
                <label class="form-label">Check LR at epoch:</label>
                <div style="display:flex;gap:var(--space-sm);align-items:center;flex-wrap:wrap;">
                  <input class="form-input" id="lookup-epoch" type="number" min="0" value="50" style="width:100px;" />
                  <div id="lookup-results" class="lr-lookup-results"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

        // events
        ['initLR', 'minLR', 'totalEpochs', 'warmupEpochs', 'stepSize', 'stepGamma', 'gamma'].forEach(id => {
            container.querySelector(`#${id}`)?.addEventListener('input', e => {
                opts[id] = parseFloat(e.target.value) || 0;
                updateChart();
                updateLookup();
            });
        });

        container.querySelectorAll('[data-sched]').forEach(cb => {
            cb.closest('label').addEventListener('click', () => {
                cb.checked ? enabled.delete(cb.dataset.sched) : enabled.add(cb.dataset.sched);
                cb.checked = !cb.checked;
                cb.closest('label').classList.toggle('lr-sched-item--on', cb.checked);
                updateChart();
            });
        });

        container.querySelector('#lookup-epoch')?.addEventListener('input', updateLookup);

        requestAnimationFrame(() => { updateChart(); updateLookup(); });
    }

    function updateChart() {
        const labels = Array.from({ length: opts.totalEpochs + 1 }, (_, i) => i);
        const datasets = [...enabled].map(key => ({
            label: SCHEDULERS[key].label,
            data: buildDataset(key, opts),
            borderColor: SCHEDULERS[key].color,
            backgroundColor: SCHEDULERS[key].color + '10',
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
        }));

        const canvas = document.getElementById('lr-chart');
        if (!canvas) return;

        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

        chartInstance = new Chart(canvas, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { color: '#64748b', font: { size: 12 }, usePointStyle: true } },
                    tooltip: { mode: 'index', intersect: false },
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Epoch', color: '#94a3b8' },
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#94a3b8', maxTicksLimit: 11 },
                    },
                    y: {
                        title: { display: true, text: 'Learning Rate', color: '#94a3b8' },
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#94a3b8' },
                    },
                },
                interaction: { mode: 'index', intersect: false },
            },
        });
    }

    function updateLookup() {
        const epochEl = document.getElementById('lookup-epoch');
        const resultsEl = document.getElementById('lookup-results');
        if (!epochEl || !resultsEl) return;
        const epoch = Math.max(0, Math.min(opts.totalEpochs, parseInt(epochEl.value) || 0));

        resultsEl.innerHTML = [...enabled].map(key => {
            const lr = computeLR(key, epoch, opts);
            return `<span class="lr-lookup-chip" style="border-color:${SCHEDULERS[key].color};color:${SCHEDULERS[key].color};">${SCHEDULERS[key].label}: <strong>${lr.toExponential(3)}</strong></span>`;
        }).join('');
    }

    render();
    return () => { if (chartInstance) { chartInstance.destroy(); chartInstance = null; } };
}
