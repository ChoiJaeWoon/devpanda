/**
 * DevPanda — Tensor Shape Calculator
 * Calculates output shapes for neural network layers in real-time.
 */

const LAYER_TYPES = {
  Conv2d: { params: ['out_channels', 'kernel_size', 'stride', 'padding'], defaults: [64, 3, 1, 1] },
  MaxPool2d: { params: ['kernel_size', 'stride', 'padding'], defaults: [2, 2, 0] },
  AvgPool2d: { params: ['kernel_size', 'stride', 'padding'], defaults: [2, 2, 0] },
  BatchNorm2d: { params: [], defaults: [] },
  Linear: { params: ['out_features'], defaults: [512] },
  Flatten: { params: [], defaults: [] },
};

function computeConvLike(inH, inW, kernel, stride, padding) {
  const outH = Math.floor((inH + 2 * padding - kernel) / stride) + 1;
  const outW = Math.floor((inW + 2 * padding - kernel) / stride) + 1;
  return [outH, outW];
}

function computeShape(inputShape, layers) {
  let shape = [...inputShape]; // [B, C, H, W] or [B, features]
  const results = [];
  let error = false;

  for (const layer of layers) {
    const prev = [...shape];
    let err = null;

    try {
      switch (layer.type) {
        case 'Conv2d': {
          if (shape.length !== 4) { err = 'Conv2d requires 4D input [B,C,H,W]'; break; }
          const [outH, outW] = computeConvLike(shape[2], shape[3], layer.kernel_size, layer.stride, layer.padding);
          if (outH <= 0 || outW <= 0) { err = `Output size ≤ 0: [${outH}, ${outW}]`; break; }
          shape = [shape[0], layer.out_channels, outH, outW];
          break;
        }
        case 'MaxPool2d':
        case 'AvgPool2d': {
          if (shape.length !== 4) { err = 'Pool requires 4D input [B,C,H,W]'; break; }
          const [pH, pW] = computeConvLike(shape[2], shape[3], layer.kernel_size, layer.stride, layer.padding);
          if (pH <= 0 || pW <= 0) { err = `Output size ≤ 0: [${pH}, ${pW}]`; break; }
          shape = [shape[0], shape[1], pH, pW];
          break;
        }
        case 'BatchNorm2d': {
          // shape stays the same
          break;
        }
        case 'Flatten': {
          if (shape.length <= 2) { err = 'Already flattened'; break; }
          const flat = shape.slice(1).reduce((a, b) => a * b, 1);
          shape = [shape[0], flat];
          break;
        }
        case 'Linear': {
          if (shape.length !== 2) { err = 'Linear requires 2D input [B,features]. Add Flatten first'; break; }
          shape = [shape[0], layer.out_features];
          break;
        }
      }
    } catch (e) {
      err = e.message;
    }

    if (err) error = true;
    results.push({ layer, inputShape: prev, outputShape: err ? null : [...shape], error: err });
  }

  return { results, finalShape: error ? null : shape };
}

export function renderTensorShape(container) {
  let inputShape = [1, 3, 224, 224];
  let layers = [];
  let nextId = 0;

  function addLayer(type) {
    const def = LAYER_TYPES[type];
    const layer = { id: nextId++, type };
    def.params.forEach((p, i) => { layer[p] = def.defaults[i]; });
    layers.push(layer);
    render();
  }

  function removeLayer(id) {
    layers = layers.filter(l => l.id !== id);
    render();
  }

  function updateLayer(id, param, value) {
    const layer = layers.find(l => l.id === id);
    if (layer) { layer[param] = parseInt(value) || 0; render(); }
  }

  function updateInputShape(index, value) {
    inputShape[index] = parseInt(value) || 0;
    render();
  }

  function render() {
    const { results, finalShape } = computeShape(inputShape, layers);

    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb">
            <a href="#/">Home</a> <span>›</span> <span>Tensor Shape Calculator</span>
          </div>
          <h1 class="tool-header__title">🧮 Tensor Shape Calculator</h1>
          <p class="tool-header__desc">Add layers sequentially and calculate output shapes in real-time.</p>
        </div>

        <!-- Input Shape -->
        <div class="panel">
          <div class="panel__title">📥 Input Shape</div>
          <div class="form-row">
            ${['Batch', 'Channels', 'Height', 'Width'].map((label, i) => `
              <div class="form-group">
                <label class="form-label">${label}</label>
                <input class="form-input" type="number" min="1" value="${inputShape[i]}" data-idx="${i}" />
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Add Layer -->
        <div class="panel">
          <div class="panel__title">➕ Add Layer</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${Object.keys(LAYER_TYPES).map(t =>
      `<button class="btn btn--secondary btn--sm" data-add="${t}">${t}</button>`
    ).join('')}
          </div>
        </div>

        <!-- Layers -->
        ${layers.length > 0 ? `
          <div class="panel">
            <div class="panel__title">📐 Layer Configuration (${layers.length})</div>
            ${layers.map((layer, i) => {
      const r = results[i];
      const params = LAYER_TYPES[layer.type].params;
      return `
                <div style="padding:12px;border:1px solid var(--border-light);border-radius:var(--radius-md);margin-bottom:8px;background:${r?.error ? 'var(--error-light)' : 'var(--bg)'}">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:${params.length ? '8px' : '0'}">
                    <strong style="font-size:var(--text-sm);">${i + 1}. ${layer.type}</strong>
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-size:var(--text-xs);color:var(--text-muted);">
                        [${r?.inputShape?.join(', ')}] → 
                        ${r?.error
          ? `<span class="shape-err">❌ ${r.error}</span>`
          : `<span class="shape-ok">[${r?.outputShape?.join(', ')}]</span>`}
                      </span>
                      <button class="btn btn--danger btn--sm" data-remove="${layer.id}">✕</button>
                    </div>
                  </div>
                  ${params.length ? `
                    <div class="form-row" style="margin-bottom:0;">
                      ${params.map(p => `
                        <div class="form-group" style="min-width:80px;">
                          <label class="form-label">${p}</label>
                          <input class="form-input" type="number" value="${layer[p]}" data-layer="${layer.id}" data-param="${p}" style="font-size:12px;padding:4px 8px;" />
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
    }).join('')}
          </div>
        ` : ''}

        <!-- Result Summary -->
        ${layers.length > 0 ? `
          <div class="panel" style="border: 2px solid ${finalShape ? 'var(--success)' : 'var(--error)'};">
            <div class="panel__title">${finalShape ? '✅' : '❌'} Final Output Shape</div>
            <div style="font-size:var(--text-2xl);font-weight:800;font-family:monospace;color:${finalShape ? 'var(--success)' : 'var(--error)'};">
              ${finalShape ? `[${finalShape.join(', ')}]` : 'Error — check the layers above'}
            </div>
          </div>
        ` : ''}

        <!-- Shape Table -->
        ${results.length > 0 ? `
          <div class="panel">
            <div class="panel__title">📊 Shape Transformation Table</div>
            <table class="data-table">
              <thead>
                <tr><th>#</th><th>Layer</th><th>Input Shape</th><th>Output Shape</th></tr>
              </thead>
              <tbody>
                <tr><td>0</td><td>Input</td><td>—</td><td class="shape-ok">[${inputShape.join(', ')}]</td></tr>
                ${results.map((r, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${r.layer.type}</td>
                    <td>[${r.inputShape.join(', ')}]</td>
                    <td class="${r.error ? 'shape-err' : 'shape-ok'}">
                      ${r.error ? `❌ ${r.error}` : `[${r.outputShape.join(', ')}]`}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      </div>
    `;

    // Event handlers
    container.querySelectorAll('[data-idx]').forEach(el => {
      el.addEventListener('input', e => updateInputShape(parseInt(e.target.dataset.idx), e.target.value));
    });
    container.querySelectorAll('[data-add]').forEach(el => {
      el.addEventListener('click', () => addLayer(el.dataset.add));
    });
    container.querySelectorAll('[data-remove]').forEach(el => {
      el.addEventListener('click', () => removeLayer(parseInt(el.dataset.remove)));
    });
    container.querySelectorAll('[data-layer]').forEach(el => {
      el.addEventListener('input', e => updateLayer(parseInt(e.target.dataset.layer), e.target.dataset.param, e.target.value));
    });
  }

  render();
}
