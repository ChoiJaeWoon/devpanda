/**
 * DevPanda — Labeling Format Converter
 * Converts between YOLO, COCO JSON, and Pascal VOC (XML)
 */

/**
 * Parse YOLO format: "class x_center y_center width height" (normalized 0~1)
 */
function parseYOLO(text) {
  return text.trim().split('\n').filter(l => l.trim()).map(line => {
    const [cls, xc, yc, w, h] = line.trim().split(/\s+/).map(Number);
    return { class: cls, x_center: xc, y_center: yc, width: w, height: h };
  });
}

/**
 * Parse COCO JSON
 */
function parseCOCO(jsonText) {
  const data = JSON.parse(jsonText);
  const annotations = data.annotations || data;
  return (Array.isArray(annotations) ? annotations : [annotations]).map(a => ({
    class: a.category_id ?? a.class ?? 0,
    x_min: a.bbox[0],
    y_min: a.bbox[1],
    width: a.bbox[2],
    height: a.bbox[3],
  }));
}

/**
 * Parse Pascal VOC (XML)
 */
function parseVOC(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const objects = doc.querySelectorAll('object');
  return Array.from(objects).map(obj => {
    const name = obj.querySelector('name')?.textContent || '0';
    const bndbox = obj.querySelector('bndbox');
    return {
      class: name,
      xmin: parseInt(bndbox.querySelector('xmin')?.textContent) || 0,
      ymin: parseInt(bndbox.querySelector('ymin')?.textContent) || 0,
      xmax: parseInt(bndbox.querySelector('xmax')?.textContent) || 0,
      ymax: parseInt(bndbox.querySelector('ymax')?.textContent) || 0,
    };
  });
}

/* ========================
   Conversions
   ======================== */

function yoloToCoco(yoloData, imgW, imgH) {
  return yoloData.map(d => ({
    category_id: d.class,
    bbox: [
      (d.x_center - d.width / 2) * imgW,
      (d.y_center - d.height / 2) * imgH,
      d.width * imgW,
      d.height * imgH,
    ].map(v => Math.round(v * 100) / 100),
  }));
}

function yoloToVoc(yoloData, imgW, imgH) {
  return yoloData.map(d => ({
    class: d.class,
    xmin: Math.round((d.x_center - d.width / 2) * imgW),
    ymin: Math.round((d.y_center - d.height / 2) * imgH),
    xmax: Math.round((d.x_center + d.width / 2) * imgW),
    ymax: Math.round((d.y_center + d.height / 2) * imgH),
  }));
}

function cocoToYolo(cocoData, imgW, imgH) {
  return cocoData.map(d => ({
    class: d.class ?? d.category_id ?? 0,
    x_center: ((d.x_min ?? d.bbox?.[0] ?? 0) + (d.width ?? d.bbox?.[2] ?? 0) / 2) / imgW,
    y_center: ((d.y_min ?? d.bbox?.[1] ?? 0) + (d.height ?? d.bbox?.[3] ?? 0) / 2) / imgH,
    width: (d.width ?? d.bbox?.[2] ?? 0) / imgW,
    height: (d.height ?? d.bbox?.[3] ?? 0) / imgH,
  }));
}

function cocoToVoc(cocoData) {
  return cocoData.map(d => ({
    class: d.class ?? d.category_id ?? 0,
    xmin: Math.round(d.x_min),
    ymin: Math.round(d.y_min),
    xmax: Math.round(d.x_min + d.width),
    ymax: Math.round(d.y_min + d.height),
  }));
}

function vocToYolo(vocData, imgW, imgH) {
  return vocData.map(d => ({
    class: d.class,
    x_center: ((d.xmin + d.xmax) / 2) / imgW,
    y_center: ((d.ymin + d.ymax) / 2) / imgH,
    width: (d.xmax - d.xmin) / imgW,
    height: (d.ymax - d.ymin) / imgH,
  }));
}

function vocToCoco(vocData) {
  return vocData.map(d => ({
    category_id: typeof d.class === 'string' ? d.class : d.class,
    bbox: [d.xmin, d.ymin, d.xmax - d.xmin, d.ymax - d.ymin],
  }));
}

/* ========================
   Formatters
   ======================== */
function formatYOLOOutput(data) {
  return data.map(d =>
    `${d.class} ${d.x_center.toFixed(6)} ${d.y_center.toFixed(6)} ${d.width.toFixed(6)} ${d.height.toFixed(6)}`
  ).join('\n');
}

function formatCOCOOutput(data) {
  return JSON.stringify({ annotations: data }, null, 2);
}

function formatVOCOutput(data) {
  return data.map(d => `<annotation>
  <object>
    <name>${d.class}</name>
    <bndbox>
      <xmin>${d.xmin}</xmin>
      <ymin>${d.ymin}</ymin>
      <xmax>${d.xmax}</xmax>
      <ymax>${d.ymax}</ymax>
    </bndbox>
  </object>
</annotation>`).join('\n\n');
}

/* ========================
   Page
   ======================== */
export function renderLabelConverter(container) {
  let sourceFormat = 'yolo';
  let targetFormat = 'coco';
  let imgWidth = 640;
  let imgHeight = 640;
  let inputText = '';
  let outputText = '';
  let errorMsg = '';

  function convert() {
    errorMsg = '';
    outputText = '';
    if (!inputText.trim()) return;

    try {
      let parsed;
      switch (sourceFormat) {
        case 'yolo': parsed = parseYOLO(inputText); break;
        case 'coco': parsed = parseCOCO(inputText); break;
        case 'voc': parsed = parseVOC(inputText); break;
      }

      if (sourceFormat === targetFormat) {
        outputText = inputText;
        return;
      }

      let converted;
      const convKey = `${sourceFormat}_${targetFormat}`;
      switch (convKey) {
        case 'yolo_coco': converted = yoloToCoco(parsed, imgWidth, imgHeight); outputText = formatCOCOOutput(converted); break;
        case 'yolo_voc': converted = yoloToVoc(parsed, imgWidth, imgHeight); outputText = formatVOCOutput(converted); break;
        case 'coco_yolo': converted = cocoToYolo(parsed, imgWidth, imgHeight); outputText = formatYOLOOutput(converted); break;
        case 'coco_voc': converted = cocoToVoc(parsed); outputText = formatVOCOutput(converted); break;
        case 'voc_yolo': converted = vocToYolo(parsed, imgWidth, imgHeight); outputText = formatYOLOOutput(converted); break;
        case 'voc_coco': converted = vocToCoco(parsed); outputText = formatCOCOOutput(converted); break;
      }
    } catch (e) {
      errorMsg = `Conversion error: ${e.message}`;
    }
  }

  function render() {
    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb">
            <a href="#/">Home</a> <span>›</span> <span>Label Format Converter</span>
          </div>
          <h1 class="tool-header__title">🏷️ Label Format Converter</h1>
          <p class="tool-header__desc">Convert between YOLO ↔ COCO JSON ↔ Pascal VOC (XML)</p>
        </div>

        <!-- Settings -->
        <div class="panel">
          <div class="panel__title">⚙️ Conversion Settings</div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Source Format</label>
              <select class="form-select" id="src-fmt">
                <option value="yolo" ${sourceFormat === 'yolo' ? 'selected' : ''}>YOLO (txt)</option>
                <option value="coco" ${sourceFormat === 'coco' ? 'selected' : ''}>COCO (JSON)</option>
                <option value="voc" ${sourceFormat === 'voc' ? 'selected' : ''}>Pascal VOC (XML)</option>
              </select>
            </div>
            <div class="form-group" style="flex:0;display:flex;align-items:flex-end;padding-bottom:4px;">
              <button class="btn btn--secondary btn--sm" id="swap-btn" style="font-size:18px;">⇄</button>
            </div>
            <div class="form-group">
              <label class="form-label">Target Format</label>
              <select class="form-select" id="tgt-fmt">
                <option value="yolo" ${targetFormat === 'yolo' ? 'selected' : ''}>YOLO (txt)</option>
                <option value="coco" ${targetFormat === 'coco' ? 'selected' : ''}>COCO (JSON)</option>
                <option value="voc" ${targetFormat === 'voc' ? 'selected' : ''}>Pascal VOC (XML)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Image Width (px)</label>
              <input class="form-input" type="number" id="img-w" value="${imgWidth}" min="1" />
            </div>
            <div class="form-group">
              <label class="form-label">Image Height (px)</label>
              <input class="form-input" type="number" id="img-h" value="${imgHeight}" min="1" />
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="panel">
          <div class="panel__title">📄 Input Data</div>
          <div class="drop-zone" id="drop-zone">
            <div class="drop-zone__icon">📁</div>
            <div class="drop-zone__text">Drag & drop a file or click to upload</div>
            <div class="drop-zone__hint">Supports .txt, .json, .xml files</div>
            <input type="file" id="file-input" accept=".txt,.json,.xml" style="display:none" multiple />
          </div>
          <textarea class="form-input" id="input-text" rows="8" 
            style="width:100%;margin-top:12px;font-family:monospace;resize:vertical;"
            placeholder="Or paste data directly here...\n\nYOLO example:\n0 0.5 0.5 0.3 0.4\n1 0.2 0.8 0.1 0.2"
          >${inputText}</textarea>
          <div style="margin-top:12px;display:flex;gap:8px;">
            <button class="btn btn--primary" id="convert-btn">🔄 Convert</button>
            <button class="btn btn--secondary" id="clear-btn">Clear</button>
          </div>
        </div>

        <!-- Output -->
        ${outputText || errorMsg ? `
          <div class="panel">
            <div class="panel__title">${errorMsg ? '❌ Error' : '📤 Conversion Result'}</div>
            ${errorMsg
          ? `<div style="color:var(--error);font-weight:600;">${errorMsg}</div>`
          : `
                <div class="convert-result">${escapeHtml(outputText)}</div>
                <div style="margin-top:12px;display:flex;gap:8px;">
                  <button class="btn btn--primary btn--sm" id="copy-btn">📋 Copy</button>
                  <button class="btn btn--secondary btn--sm" id="download-btn">💾 Download</button>
                </div>
              `}
          </div>
        ` : ''}

        <!-- Format Reference -->
        <div class="panel">
          <div class="panel__title">📖 Format Reference</div>
          <table class="data-table">
            <thead>
              <tr><th>Format</th><th>Coordinate Format</th><th>File Type</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>YOLO</strong></td>
                <td><code>class x_center y_center width height</code> (normalized 0~1)</td>
                <td>.txt</td>
              </tr>
              <tr>
                <td><strong>COCO</strong></td>
                <td><code>[x_min, y_min, width, height]</code> (pixels)</td>
                <td>.json</td>
              </tr>
              <tr>
                <td><strong>VOC</strong></td>
                <td><code>&lt;xmin&gt; &lt;ymin&gt; &lt;xmax&gt; &lt;ymax&gt;</code> (pixels)</td>
                <td>.xml</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // ----- Event Handlers -----
    const dropZone = container.querySelector('#drop-zone');
    const fileInput = container.querySelector('#file-input');
    const textArea = container.querySelector('#input-text');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drop-zone--active'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-zone--active'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('drop-zone--active');
      handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', e => handleFiles(e.target.files));

    function handleFiles(files) {
      if (files.length === 0) return;
      const reader = new FileReader();
      reader.onload = e => {
        inputText = e.target.result;
        textArea.value = inputText;
      };
      reader.readAsText(files[0]);
    }

    container.querySelector('#src-fmt').addEventListener('change', e => { sourceFormat = e.target.value; });
    container.querySelector('#tgt-fmt').addEventListener('change', e => { targetFormat = e.target.value; });
    container.querySelector('#img-w').addEventListener('input', e => { imgWidth = parseInt(e.target.value) || 640; });
    container.querySelector('#img-h').addEventListener('input', e => { imgHeight = parseInt(e.target.value) || 640; });
    container.querySelector('#swap-btn').addEventListener('click', () => {
      [sourceFormat, targetFormat] = [targetFormat, sourceFormat];
      render();
    });
    container.querySelector('#convert-btn').addEventListener('click', () => {
      inputText = textArea.value;
      convert();
      render();
    });
    container.querySelector('#clear-btn').addEventListener('click', () => {
      inputText = ''; outputText = ''; errorMsg = '';
      render();
    });

    const copyBtn = container.querySelector('#copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(outputText);
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
      });
    }

    const dlBtn = container.querySelector('#download-btn');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        const ext = { yolo: 'txt', coco: 'json', voc: 'xml' }[targetFormat];
        const blob = new Blob([outputText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `converted.${ext}`; a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  render();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
