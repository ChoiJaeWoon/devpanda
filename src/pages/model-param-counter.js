/**
 * DevPanda — Model Parameter Counter
 * Add layers, compute total parameters, trainable vs non-trainable, memory usage.
 */

/* ── Layer Definitions ───────────────────────── */
const LAYER_TYPES = {
    Conv2d: {
        label: 'Conv2d',
        fields: [
            { id: 'in_channels', label: 'In Channels', default: 3 },
            { id: 'out_channels', label: 'Out Channels', default: 64 },
            { id: 'kernel_size', label: 'Kernel Size', default: 3 },
            { id: 'bias', label: 'Bias', default: 1, type: 'bool' },
        ],
        calc: ({ in_channels, out_channels, kernel_size, bias }) => {
            const w = kernel_size * kernel_size * in_channels * out_channels;
            const b = bias ? out_channels : 0;
            return { trainable: w + b, non_trainable: 0 };
        },
        desc: (f) => `Conv(${f.in_channels}→${f.out_channels}, k=${f.kernel_size})`,
    },
    ConvTranspose2d: {
        label: 'ConvTranspose2d',
        fields: [
            { id: 'in_channels', label: 'In Channels', default: 64 },
            { id: 'out_channels', label: 'Out Channels', default: 32 },
            { id: 'kernel_size', label: 'Kernel Size', default: 2 },
            { id: 'bias', label: 'Bias', default: 1, type: 'bool' },
        ],
        calc: ({ in_channels, out_channels, kernel_size, bias }) => {
            const w = kernel_size * kernel_size * in_channels * out_channels;
            const b = bias ? out_channels : 0;
            return { trainable: w + b, non_trainable: 0 };
        },
        desc: (f) => `ConvT(${f.in_channels}→${f.out_channels}, k=${f.kernel_size})`,
    },
    Linear: {
        label: 'Linear (FC)',
        fields: [
            { id: 'in_features', label: 'In Features', default: 512 },
            { id: 'out_features', label: 'Out Features', default: 256 },
            { id: 'bias', label: 'Bias', default: 1, type: 'bool' },
        ],
        calc: ({ in_features, out_features, bias }) => {
            const w = in_features * out_features;
            const b = bias ? out_features : 0;
            return { trainable: w + b, non_trainable: 0 };
        },
        desc: (f) => `Linear(${f.in_features}→${f.out_features})`,
    },
    BatchNorm2d: {
        label: 'BatchNorm2d',
        fields: [
            { id: 'num_features', label: 'Num Features', default: 64 },
            { id: 'affine', label: 'Affine', default: 1, type: 'bool' },
        ],
        calc: ({ num_features, affine }) => ({
            trainable: affine ? 2 * num_features : 0,
            non_trainable: 2 * num_features, // running_mean + running_var
        }),
        desc: (f) => `BatchNorm(${f.num_features})`,
    },
    LayerNorm: {
        label: 'LayerNorm',
        fields: [
            { id: 'normalized_shape', label: 'Normalized Shape', default: 512 },
        ],
        calc: ({ normalized_shape }) => ({ trainable: 2 * normalized_shape, non_trainable: 0 }),
        desc: (f) => `LayerNorm(${f.normalized_shape})`,
    },
    Embedding: {
        label: 'Embedding',
        fields: [
            { id: 'num_embeddings', label: 'Vocab Size', default: 30000 },
            { id: 'embedding_dim', label: 'Embed Dim', default: 512 },
        ],
        calc: ({ num_embeddings, embedding_dim }) => ({
            trainable: num_embeddings * embedding_dim, non_trainable: 0,
        }),
        desc: (f) => `Embedding(${f.num_embeddings}×${f.embedding_dim})`,
    },
    LSTM: {
        label: 'LSTM',
        fields: [
            { id: 'input_size', label: 'Input Size', default: 256 },
            { id: 'hidden_size', label: 'Hidden Size', default: 512 },
            { id: 'num_layers', label: 'Num Layers', default: 1 },
            { id: 'bidirectional', label: 'Bidirectional', default: 0, type: 'bool' },
            { id: 'bias', label: 'Bias', default: 1, type: 'bool' },
        ],
        calc: ({ input_size, hidden_size, num_layers, bidirectional, bias }) => {
            const dirs = bidirectional ? 2 : 1;
            // 4 gates; first layer uses input_size, subsequent use hidden_size*dirs
            let total = 0;
            for (let l = 0; l < num_layers; l++) {
                const inp = l === 0 ? input_size : hidden_size * dirs;
                total += 4 * ((inp * hidden_size) + (hidden_size * hidden_size) + (bias ? 2 * hidden_size : 0));
            }
            return { trainable: total * dirs, non_trainable: 0 };
        },
        desc: (f) => `LSTM(${f.input_size}→${f.hidden_size}, L=${f.num_layers}${f.bidirectional ? ', bi' : ''})`,
    },
    MultiheadAttention: {
        label: 'MultiheadAttention',
        fields: [
            { id: 'embed_dim', label: 'Embed Dim', default: 512 },
            { id: 'num_heads', label: 'Num Heads', default: 8 },
            { id: 'bias', label: 'Bias', default: 1, type: 'bool' },
        ],
        calc: ({ embed_dim, num_heads: _h, bias }) => {
            // Q, K, V projections + output projection
            const qkv = 3 * embed_dim * embed_dim + (bias ? 3 * embed_dim : 0);
            const out = embed_dim * embed_dim + (bias ? embed_dim : 0);
            return { trainable: qkv + out, non_trainable: 0 };
        },
        desc: (f) => `MHA(dim=${f.embed_dim}, heads=${f.num_heads})`,
    },
};

const PRESET_MODELS = [
    {
        name: 'Simple CNN (e.g. LeNet-style)',
        layers: [
            { type: 'Conv2d', fields: { in_channels: 1, out_channels: 6, kernel_size: 5, bias: 1 } },
            { type: 'Conv2d', fields: { in_channels: 6, out_channels: 16, kernel_size: 5, bias: 1 } },
            { type: 'Linear', fields: { in_features: 400, out_features: 120, bias: 1 } },
            { type: 'Linear', fields: { in_features: 120, out_features: 84, bias: 1 } },
            { type: 'Linear', fields: { in_features: 84, out_features: 10, bias: 1 } },
        ],
    },
    {
        name: 'ResNet Block',
        layers: [
            { type: 'Conv2d', fields: { in_channels: 64, out_channels: 64, kernel_size: 3, bias: 0 } },
            { type: 'BatchNorm2d', fields: { num_features: 64, affine: 1 } },
            { type: 'Conv2d', fields: { in_channels: 64, out_channels: 64, kernel_size: 3, bias: 0 } },
            { type: 'BatchNorm2d', fields: { num_features: 64, affine: 1 } },
        ],
    },
    {
        name: 'Transformer Encoder Layer',
        layers: [
            { type: 'MultiheadAttention', fields: { embed_dim: 512, num_heads: 8, bias: 1 } },
            { type: 'LayerNorm', fields: { normalized_shape: 512 } },
            { type: 'Linear', fields: { in_features: 512, out_features: 2048, bias: 1 } },
            { type: 'Linear', fields: { in_features: 2048, out_features: 512, bias: 1 } },
            { type: 'LayerNorm', fields: { normalized_shape: 512 } },
        ],
    },
];

function formatNum(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toString();
}

function calcParams(type, fields) {
    return LAYER_TYPES[type].calc(fields);
}

/* ── Main Export ─────────────────────────────── */
export function renderModelParamCounter(container) {
    let layers = [];
    let uid = 0;

    function addLayer(type, presetFields = null) {
        const def = LAYER_TYPES[type];
        const fields = {};
        def.fields.forEach(f => { fields[f.id] = presetFields ? presetFields[f.id] : f.default; });
        layers.push({ id: uid++, type, fields });
        render();
    }

    function removeLayer(id) {
        layers = layers.filter(l => l.id !== id);
        render();
    }

    function updateField(id, fieldId, value) {
        const layer = layers.find(l => l.id === id);
        if (layer) { layer.fields[fieldId] = parseFloat(value) || 0; render(); }
    }

    function loadPreset(presetIdx) {
        layers = [];
        uid = 0;
        PRESET_MODELS[presetIdx].layers.forEach(l => addLayer(l.type, l.fields));
    }

    function render() {
        // Compute totals
        let totalTrainable = 0, totalNonTrainable = 0;
        const layerStats = layers.map(l => {
            const { trainable, non_trainable } = calcParams(l.type, l.fields);
            totalTrainable += trainable;
            totalNonTrainable += non_trainable;
            return { ...l, trainable, non_trainable };
        });
        const totalParams = totalTrainable + totalNonTrainable;
        const memFP32 = (totalParams * 4) / (1024 * 1024); // MB
        const memFP16 = memFP32 / 2;

        container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>Model Parameter Counter</span></div>
          <h1 class="tool-header__title">🔢 Model Parameter Counter</h1>
          <p class="tool-header__desc">Add layers to calculate total parameters, trainable vs non-trainable, and memory footprint.</p>
        </div>

        <div class="mpc-layout">
          <!-- Left: Add Layers -->
          <div>
            <!-- Presets -->
            <div class="panel">
              <div class="panel__title">⚡ Presets</div>
              <div style="display:flex;gap:var(--space-sm);flex-wrap:wrap;margin-top:var(--space-sm);">
                ${PRESET_MODELS.map((p, i) => `
                  <button class="btn btn--secondary btn--sm" data-preset="${i}">${p.name}</button>
                `).join('')}
                <button class="btn btn--secondary btn--sm" id="clear-btn" style="color:var(--error,#ef4444);">✕ Clear All</button>
              </div>
            </div>

            <!-- Add Layer -->
            <div class="panel" style="margin-top:var(--space-md);">
              <div class="panel__title">➕ Add Layer</div>
              <div class="mpc-layer-btns">
                ${Object.entries(LAYER_TYPES).map(([key, l]) => `
                  <button class="btn btn--secondary btn--sm mpc-add-btn" data-type="${key}">${l.label}</button>
                `).join('')}
              </div>
            </div>

            <!-- Layer List -->
            ${layers.length > 0 ? `
              <div class="panel" style="margin-top:var(--space-md);">
                <div class="panel__title">📐 Layers</div>
                <div class="mpc-layers">
                  ${layerStats.map((l, idx) => `
                    <div class="mpc-layer">
                      <div class="mpc-layer__header">
                        <span class="mpc-layer__num">${idx + 1}</span>
                        <span class="mpc-layer__name">${LAYER_TYPES[l.type].desc(l.fields)}</span>
                        <span class="mpc-layer__params">${formatNum(l.trainable + l.non_trainable)} params</span>
                        <button class="mpc-layer__del" data-del="${l.id}">✕</button>
                      </div>
                      <div class="mpc-layer__fields">
                        ${LAYER_TYPES[l.type].fields.map(f => `
                          <div class="mpc-field">
                            <label class="mpc-field__label">${f.label}</label>
                            ${f.type === 'bool'
                ? `<select class="form-input mpc-field__input" data-layer="${l.id}" data-field="${f.id}">
                                  <option value="1" ${l.fields[f.id] ? 'selected' : ''}>Yes</option>
                                  <option value="0" ${!l.fields[f.id] ? 'selected' : ''}>No</option>
                                 </select>`
                : `<input class="form-input mpc-field__input" type="number" min="1"
                                   data-layer="${l.id}" data-field="${f.id}" value="${l.fields[f.id]}" />`
            }
                          </div>
                        `).join('')}
                      </div>
                      <div class="mpc-layer__stats">
                        <span style="color:var(--accent);">✅ Trainable: ${formatNum(l.trainable)}</span>
                        ${l.non_trainable > 0 ? `<span style="color:var(--text-muted);">🔒 Non-trainable: ${formatNum(l.non_trainable)}</span>` : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : `
              <div class="mpc-empty">
                <div style="font-size:48px;">🔢</div>
                <div>Add layers above or pick a preset to get started.</div>
              </div>
            `}
          </div>

          <!-- Right: Summary -->
          <div class="mpc-summary-col">
            <div class="panel mpc-summary">
              <div class="panel__title">📊 Summary</div>

              <div class="mpc-total">
                <div class="mpc-total__val">${formatNum(totalParams)}</div>
                <div class="mpc-total__label">Total Parameters</div>
                <div class="mpc-total__raw">${totalParams.toLocaleString()} parameters</div>
              </div>

              <div class="mpc-stat-rows">
                <div class="mpc-stat-row">
                  <span>✅ Trainable</span>
                  <span style="font-weight:700;color:var(--accent);">${formatNum(totalTrainable)}</span>
                </div>
                <div class="mpc-stat-row">
                  <span>🔒 Non-trainable</span>
                  <span style="font-weight:700;color:var(--text-muted);">${formatNum(totalNonTrainable)}</span>
                </div>
                <div class="mpc-stat-row" style="margin-top:var(--space-sm);border-top:1px solid var(--border);padding-top:var(--space-sm);">
                  <span>💾 Memory (FP32)</span>
                  <span style="font-weight:700;">${memFP32.toFixed(1)} MB</span>
                </div>
                <div class="mpc-stat-row">
                  <span>💾 Memory (FP16)</span>
                  <span style="font-weight:700;">${memFP16.toFixed(1)} MB</span>
                </div>
                <div class="mpc-stat-row">
                  <span>🗂️ Total Layers</span>
                  <span style="font-weight:700;">${layers.length}</span>
                </div>
              </div>

              ${totalParams > 0 ? `
                <!-- Param bar -->
                <div style="margin-top:var(--space-md);">
                  <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:6px;">Trainable ratio</div>
                  <div class="mpc-bar">
                    <div class="mpc-bar__fill" style="width:${totalParams > 0 ? (totalTrainable / totalParams * 100).toFixed(1) : 0}%"></div>
                  </div>
                  <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px;">${totalParams > 0 ? (totalTrainable / totalParams * 100).toFixed(1) : 0}% trainable</div>
                </div>

                <!-- Size classification -->
                <div class="mpc-size-badge ${totalParams > 1e9 ? 'mpc-size--xl' : totalParams > 100e6 ? 'mpc-size--lg' : totalParams > 10e6 ? 'mpc-size--md' : 'mpc-size--sm'}">
                  ${totalParams > 1e9 ? '🐋 Large Model (>1B)' : totalParams > 100e6 ? '🦁 Medium-Large (>100M)' : totalParams > 10e6 ? '🐕 Medium (>10M)' : '🐭 Small (<10M)'}
                </div>

                <!-- Per-layer bars -->
                ${layerStats.length > 1 ? `
                <div style="margin-top:var(--space-md);">
                  <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em;">Per-Layer Distribution</div>
                  ${layerStats.map((l, i) => {
                const pct = totalParams > 0 ? ((l.trainable + l.non_trainable) / totalParams * 100).toFixed(1) : 0;
                return `<div style="margin-bottom:6px;">
                      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-secondary);margin-bottom:2px;">
                        <span>${i + 1}. ${LAYER_TYPES[l.type].desc(l.fields)}</span>
                        <span>${pct}%</span>
                      </div>
                      <div class="mpc-bar" style="height:6px;">
                        <div class="mpc-bar__fill" style="width:${pct}%;"></div>
                      </div>
                    </div>`;
            }).join('')}
                </div>
                ` : ''}
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

        // Events
        container.querySelectorAll('.mpc-add-btn').forEach(btn => {
            btn.addEventListener('click', () => addLayer(btn.dataset.type));
        });
        container.querySelectorAll('[data-preset]').forEach(btn => {
            btn.addEventListener('click', () => loadPreset(parseInt(btn.dataset.preset)));
        });
        container.querySelector('#clear-btn')?.addEventListener('click', () => { layers = []; render(); });
        container.querySelectorAll('[data-del]').forEach(btn => {
            btn.addEventListener('click', () => removeLayer(parseInt(btn.dataset.del)));
        });
        container.querySelectorAll('[data-layer][data-field]').forEach(inp => {
            inp.addEventListener('input', e => updateField(parseInt(inp.dataset.layer), inp.dataset.field, e.target.value));
        });
    }

    render();
}
