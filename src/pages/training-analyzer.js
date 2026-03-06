/**
 * DevPanda — Training Results Analyzer
 * Upload YOLO results.csv → Charts + auto-diagnosis of training state.
 */
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const CHART_IDS = ['chart-loss', 'chart-map', 'chart-pr'];
const chartInstances = {};

export function renderTrainingAnalyzer(container) {
    let csvData = null;  // parsed rows [{epoch, ...}]
    let fileName = '';

    /* ── CSV Parser ─────────────────────────────── */
    function parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        return lines.slice(1).map(line => {
            const vals = line.split(',');
            const row = {};
            headers.forEach((h, i) => { row[h] = parseFloat(vals[i]) || 0; });
            return row;
        });
    }

    /* ── Column Resolver (handles YOLO v8/v5/v11 variations) ── */
    function col(rows, ...names) {
        for (const name of names) {
            if (rows[0] && name in rows[0]) return rows.map(r => r[name]);
        }
        return null;
    }

    function epochs(rows) { return rows.map((_, i) => i + 1); }

    /* ── Diagnosis Engine ───────────────────────── */
    function diagnose(rows) {
        const n = rows.length;
        const half = Math.floor(n / 2);

        const trainLoss = col(rows, 'train/box_loss', 'train/box loss', 'Box_loss');
        const valLoss = col(rows, 'val/box_loss', 'val/box loss', 'val/Box_loss');
        const mAP50 = col(rows, 'metrics/mAP50', 'mAP_0.5', 'metrics/mAP50(B)');
        const mAP5095 = col(rows, 'metrics/mAP50-95', 'mAP_0.5:0.95', 'metrics/mAP50-95(B)');

        const insights = [];
        let status = 'good'; // 'good' | 'warn' | 'danger'

        if (trainLoss && valLoss) {
            // Overfitting: train loss decreasing but val loss increasing in second half
            const trainTrend = trainLoss[n - 1] - trainLoss[half];
            const valTrend = valLoss[n - 1] - valLoss[half];
            if (trainTrend < -0.01 && valTrend > 0.005) {
                insights.push({ type: 'danger', icon: '⚠️', title: 'Overfitting Detected', msg: `Training loss continues to drop (${trainTrend.toFixed(3)}) while validation loss is increasing (${valTrend.toFixed(3)}). Consider early stopping, adding regularization, or reducing model complexity.` });
                status = 'danger';
            } else if (valTrend < -0.005 && trainTrend < -0.005) {
                // Both still decreasing — more training could help
                insights.push({ type: 'warn', icon: '📈', title: 'Training Still Progressing', msg: `Both train and val loss are still decreasing. Adding more epochs may improve results further.` });
                if (status === 'good') status = 'warn';
            }

            // Large gap between train and val loss
            const gap = valLoss[n - 1] - trainLoss[n - 1];
            if (gap > 0.05) {
                insights.push({ type: 'warn', icon: '🔀', title: `Train/Val Loss Gap: ${gap.toFixed(3)}`, msg: 'A large gap between train and val loss suggests the model may not generalize well. Try data augmentation or dropout.' });
                if (status === 'good') status = 'warn';
            }

            // Underfitting: both losses still high (> 0.1 at end)
            if (trainLoss[n - 1] > 0.1 && valLoss[n - 1] > 0.1) {
                insights.push({ type: 'warn', icon: '📉', title: 'High Loss at End', msg: `Both train (${trainLoss[n - 1].toFixed(3)}) and val (${valLoss[n - 1].toFixed(3)}) losses are still high. Model may be undertrained — try more epochs or tuning the learning rate.` });
                if (status === 'good') status = 'warn';
            }
        }

        // mAP analysis
        if (mAP50) {
            const bestEpoch = mAP50.indexOf(Math.max(...mAP50)) + 1;
            const bestVal = Math.max(...mAP50);
            const finalVal = mAP50[n - 1];
            insights.push({ type: 'info', icon: '🏆', title: `Best mAP@0.5: ${(bestVal * 100).toFixed(1)}% at Epoch ${bestEpoch}`, msg: finalVal < bestVal - 0.01 ? `Model peaked at epoch ${bestEpoch}. Consider using the checkpoint saved at that epoch.` : `Model is at or near its best performance.` });

            // Plateau detection
            const last10 = mAP50.slice(-Math.min(10, n));
            const mAPRange = Math.max(...last10) - Math.min(...last10);
            if (mAPRange < 0.005 && n > 20) {
                insights.push({ type: 'info', icon: '⏸️', title: 'mAP Plateau Detected', msg: `mAP has been nearly flat for the last ${Math.min(10, n)} epochs (range: ${(mAPRange * 100).toFixed(2)}%). Training may be complete.` });
            }
        }

        if (mAP50 && Math.max(...mAP50) < 0.5) {
            insights.push({ type: 'warn', icon: '🎯', title: 'Low mAP@0.5', msg: 'mAP@0.5 is below 50%. Check dataset quality, class balance, and annotation accuracy.' });
            if (status === 'good') status = 'warn';
        }

        if (insights.length === 0) {
            insights.push({ type: 'good', icon: '✅', title: 'Training looks healthy!', msg: 'Loss curves are converging normally and no major issues were detected.' });
        }

        return { insights, status };
    }

    /* ── Chart Rendering ────────────────────────── */
    function destroyCharts() {
        CHART_IDS.forEach(id => {
            if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
        });
    }

    function renderCharts(rows) {
        destroyCharts();
        const eps = epochs(rows);
        const colors = { train: '#4f46e5', val: '#ef4444', map50: '#16a34a', map95: '#0891b2', precision: '#8b5cf6', recall: '#f97316' };

        // Loss chart
        const trainLoss = col(rows, 'train/box_loss', 'train/box loss', 'Box_loss');
        const valLoss = col(rows, 'val/box_loss', 'val/box loss', 'val/Box_loss');
        if (trainLoss && valLoss) {
            chartInstances['chart-loss'] = new Chart(document.getElementById('chart-loss'), {
                type: 'line',
                data: {
                    labels: eps, datasets: [
                        { label: 'Train Loss', data: trainLoss, borderColor: colors.train, backgroundColor: colors.train + '18', tension: 0.3, fill: true, pointRadius: 0 },
                        { label: 'Val Loss', data: valLoss, borderColor: colors.val, backgroundColor: colors.val + '18', tension: 0.3, fill: true, pointRadius: 0 },
                    ]
                },
                options: chartOptions('Box Loss per Epoch'),
            });
        }

        // mAP chart
        const mAP50 = col(rows, 'metrics/mAP50', 'mAP_0.5', 'metrics/mAP50(B)');
        const mAP5095 = col(rows, 'metrics/mAP50-95', 'mAP_0.5:0.95', 'metrics/mAP50-95(B)');
        if (mAP50) {
            const datasets = [{ label: 'mAP@0.5', data: mAP50, borderColor: colors.map50, tension: 0.3, pointRadius: 0 }];
            if (mAP5095) datasets.push({ label: 'mAP@0.5:0.95', data: mAP5095, borderColor: colors.map95, tension: 0.3, pointRadius: 0 });
            chartInstances['chart-map'] = new Chart(document.getElementById('chart-map'), {
                type: 'line',
                data: { labels: eps, datasets },
                options: chartOptions('mAP per Epoch'),
            });
        }

        // Precision & Recall chart
        const precision = col(rows, 'metrics/precision', 'precision', 'metrics/precision(B)');
        const recall = col(rows, 'metrics/recall', 'recall', 'metrics/recall(B)');
        if (precision && recall) {
            chartInstances['chart-pr'] = new Chart(document.getElementById('chart-pr'), {
                type: 'line',
                data: {
                    labels: eps, datasets: [
                        { label: 'Precision', data: precision, borderColor: colors.precision, tension: 0.3, pointRadius: 0 },
                        { label: 'Recall', data: recall, borderColor: colors.recall, tension: 0.3, pointRadius: 0 },
                    ]
                },
                options: chartOptions('Precision & Recall per Epoch'),
            });
        }
    }

    function chartOptions(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#64748b', font: { size: 12 } } },
                title: { display: true, text: title, color: '#1e293b', font: { size: 14, weight: '700' } },
            },
            scales: {
                x: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', maxTicksLimit: 10 } },
                y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } },
            },
            interaction: { mode: 'index', intersect: false },
        };
    }

    /* ── Summary Stats ──────────────────────────── */
    function buildStats(rows) {
        const n = rows.length;
        const mAP50 = col(rows, 'metrics/mAP50', 'mAP_0.5', 'metrics/mAP50(B)');
        const mAP95 = col(rows, 'metrics/mAP50-95', 'mAP_0.5:0.95', 'metrics/mAP50-95(B)');
        const vLoss = col(rows, 'val/box_loss', 'val/box loss', 'val/Box_loss');
        const tLoss = col(rows, 'train/box_loss', 'train/box loss', 'Box_loss');
        return [
            { label: 'Total Epochs', value: n },
            { label: 'Best mAP@0.5', value: mAP50 ? (Math.max(...mAP50) * 100).toFixed(1) + '%' : 'N/A' },
            { label: 'Best mAP@0.5:0.95', value: mAP95 ? (Math.max(...mAP95) * 100).toFixed(1) + '%' : 'N/A' },
            { label: 'Best Epoch', value: mAP50 ? mAP50.indexOf(Math.max(...mAP50)) + 1 : 'N/A' },
            { label: 'Final Train Loss', value: tLoss ? tLoss[n - 1].toFixed(4) : 'N/A' },
            { label: 'Final Val Loss', value: vLoss ? vLoss[n - 1].toFixed(4) : 'N/A' },
        ];
    }

    /* ── Render ─────────────────────────────────── */
    function render() {
        const { insights, status } = csvData ? diagnose(csvData) : { insights: [], status: 'good' };
        const stats = csvData ? buildStats(csvData) : [];
        const statusColor = { good: '#16a34a', warn: '#d97706', danger: '#ef4444' }[status];
        const statusLabel = { good: '✅ Healthy', warn: '⚠️ Needs Attention', danger: '🔴 Issues Detected' }[status];

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Training Analyzer</span></div>
          <h1 class="tool-header__title">📈 Training Results Analyzer</h1>
          <p class="tool-header__desc">Upload your YOLO <code>results.csv</code> to visualize training curves and detect overfitting, underfitting, or convergence issues.</p>
        </div>

        <!-- Upload -->
        <div class="panel">
          <div class="panel__title" style="display:flex;justify-content:space-between;align-items:center;">
            <span>📂 Upload results.csv</span>
            ${csvData ? `<button class="btn btn--secondary btn--sm" id="reset-btn">✕ Reset</button>` : ''}
          </div>

          ${!csvData ? `
            <div class="drop-zone" id="drop-zone" style="margin-top:var(--space-sm);">
              <div class="drop-zone__icon">📈</div>
              <div class="drop-zone__text">Drag & drop your <strong>results.csv</strong> here</div>
              <div class="drop-zone__hint">YOLO v5 / v8 / v11 format supported</div>
              <input type="file" id="file-input" accept=".csv" style="display:none;" />
            </div>
            <div style="margin-top:var(--space-sm);padding:12px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);font-size:var(--text-sm);color:var(--text-secondary);">
              <strong>Where to find results.csv?</strong> After training completes, it's in your <code>runs/detect/train/</code> or <code>runs/segment/train/</code> folder alongside <code>results.png</code>.
            </div>
          ` : `
            <div class="ta-file-badge">
              <span>📄 ${fileName}</span>
              <span style="color:var(--text-muted);">${csvData.length} epochs</span>
              <span style="margin-left:auto;font-weight:700;color:${statusColor};">${statusLabel}</span>
            </div>
          `}
        </div>

        ${csvData ? `
          <!-- Summary Stats -->
          <div class="panel">
            <div class="panel__title">📊 Summary</div>
            <div class="ta-stats">
              ${stats.map(s => `
                <div class="ta-stat">
                  <div class="ta-stat__val">${s.value}</div>
                  <div class="ta-stat__label">${s.label}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Diagnosis -->
          <div class="panel">
            <div class="panel__title">🔍 Diagnosis</div>
            <div class="ta-insights">
              ${insights.map(ins => `
                <div class="ta-insight ta-insight--${ins.type}">
                  <div class="ta-insight__header">${ins.icon} ${ins.title}</div>
                  <div class="ta-insight__msg">${ins.msg}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Charts -->
          <div class="panel">
            <div class="panel__title">📉 Loss Curves</div>
            <div class="ta-chart-wrap"><canvas id="chart-loss"></canvas></div>
          </div>
          <div class="panel">
            <div class="panel__title">🏆 mAP Curves</div>
            <div class="ta-chart-wrap"><canvas id="chart-map"></canvas></div>
          </div>
          <div class="panel">
            <div class="panel__title">📐 Precision & Recall</div>
            <div class="ta-chart-wrap"><canvas id="chart-pr"></canvas></div>
          </div>
        ` : ''}
      </div>
    `;

        /* ── Events ─────────────────────────────── */
        container.querySelector('#reset-btn')?.addEventListener('click', () => {
            destroyCharts(); csvData = null; fileName = ''; render();
        });

        const dz = container.querySelector('#drop-zone');
        const fi = container.querySelector('#file-input');
        if (dz && fi) {
            dz.addEventListener('click', () => fi.click());
            dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drop-zone--active'); });
            dz.addEventListener('dragleave', () => dz.classList.remove('drop-zone--active'));
            dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('drop-zone--active'); handleFile(e.dataTransfer.files[0]); });
            fi.addEventListener('change', e => handleFile(e.target.files[0]));
        }

        if (csvData) {
            // Defer chart rendering until DOM is ready
            requestAnimationFrame(() => renderCharts(csvData));
        }
    }

    function handleFile(file) {
        if (!file) return;
        fileName = file.name;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                csvData = parseCSV(e.target.result);
                render();
            } catch (err) {
                alert('Failed to parse CSV. Make sure it is a valid YOLO results.csv file.');
            }
        };
        reader.readAsText(file);
    }

    render();

    // Cleanup charts on route change
    return () => destroyCharts();
}
