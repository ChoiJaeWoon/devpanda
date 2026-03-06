/**
 * DevPanda — Sidebar Component
 */

const tools = [
  {
    category: 'General Dev Tools', items: [
      { icon: '📊', name: 'CSV ↔ JSON', path: '/csv-json', desc: 'Bidirectional converter between CSV and JSON. Supports custom delimiters, file upload, and formatted output.' },
      { icon: '📋', name: 'JSON Formatter', path: '/json-formatter', desc: 'Format, minify, and validate JSON. Highlights syntax errors and supports tree view.' },
      { icon: '🔑', name: 'Base64 Converter', path: '/base64-converter', desc: 'Encode and decode Base64 strings. Supports text and file encoding.' },
      { icon: '🔷', name: 'Image ↔ HEX', path: '/hex-image', desc: 'Convert image files to hexadecimal byte strings, or reconstruct images from hex data. Fully client-side.' },
      { icon: '🖊️', name: 'HTML Preview', path: '/html-preview', desc: 'Type or paste HTML code and instantly see it rendered live in a preview panel. Supports CSS and JS.' },
      { icon: '🎨', name: 'Color Picker', path: '/color-picker', desc: 'Pick colors and convert between HEX, RGB, HSL, and HSV formats. Generate color palettes.' },
      { icon: '🖼️', name: 'Image Resizer', path: '/image-resizer', desc: 'Resize and compress images in-browser. Supports JPG, PNG, WebP output with quality control.' },
      { icon: '📦', name: 'Image Compressor', path: '/image-compressor', desc: 'Reduce image file size without changing resolution. Quality slider + WebP/JPEG/PNG output.' },
      { icon: '✂️', name: 'BG Remover', path: '/bg-remover', desc: 'Remove image backgrounds instantly using AI — all in your browser, no upload to any server.' },
      { icon: '🔍', name: 'Regex Tester', path: '/regex-tester', desc: 'Test regular expressions with live match highlighting, group capture display, and flags support.' },
      { icon: '🔐', name: 'Hash Generator', path: '/hash-generator', desc: 'Generate MD5, SHA-1, SHA-256, SHA-512 hashes from text or files. All computed client-side.' },
      { icon: '📐', name: 'Unit Converter', path: '/unit-converter', desc: 'Convert CSS units (px, rem, em, vw), length, storage, temperature, time, angle, and more.' },
      { icon: '🌐', name: 'URL Encoder/Decoder', path: '/url-encoder', desc: 'Encode and decode URLs. Supports encodeURI, encodeURIComponent modes and query string parsing.' },
      { icon: '⏱️', name: 'Cron Parser', path: '/cron-parser', desc: 'Parse cron expressions into human-readable descriptions and preview the next scheduled run times.' },
      { icon: '📄', name: 'PDF Text Extractor', path: '/ocr-extractor', desc: 'Extract embedded text from PDF files page-by-page. All processing happens locally in your browser.' },
    ]
  },
  {
    category: 'AI / ML Tools', items: [
      { icon: '🧮', name: 'Tensor Shape Calculator', path: '/tensor-shape', desc: 'Calculate tensor shapes through neural network layers. Visualize how dimensions change with Conv, Pool, RNN, and more.' },
      { icon: '🏷️', name: 'Label Format Converter', path: '/label-converter', desc: 'Convert annotation labels between YOLO, COCO, Pascal VOC, and CSV formats. Supports batch conversion.' },
      { icon: '🎮', name: 'GPU Memory Calculator', path: '/gpu-memory', desc: 'Estimate VRAM usage for model training. Input parameters, batch size, and precision to check GPU compatibility.' },
      { icon: '📈', name: 'Training Analyzer', path: '/training-analyzer', desc: 'Paste training logs to visualize loss/accuracy curves and detect overfitting, underfitting, or convergence issues.' },
      { icon: '📉', name: 'LR Scheduler Visualizer', path: '/lr-scheduler', desc: 'Preview learning rate schedules (StepLR, CosineAnnealing, OneCycleLR, etc.) before training.' },
      { icon: '🔢', name: 'Model Parameter Counter', path: '/model-param-counter', desc: 'Count total and trainable parameters in a model. Paste your architecture to get instant size estimates.' },
      { icon: '🖼️', name: 'Augmentation Previewer', path: '/augmentation-previewer', desc: 'Preview image augmentation effects in real-time. Adjust brightness, contrast, flip, rotation, and more.' },
      { icon: '📐', name: 'Detection Metrics', path: '/detection-metrics', desc: 'Calculate AP, mAP, precision, recall, and F1 for object detection models from prediction/ground-truth data.' },
    ]
  },
];


const externalLinks = [
  {
    category: 'AI Resources', items: [
      { icon: '<img src="https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32" width="16" height="16" style="border-radius:3px;vertical-align:middle;" />', name: 'ChatGPT', url: 'https://chatgpt.com' },
      { icon: '<img src="https://www.google.com/s2/favicons?domain=gemini.google.com&sz=32" width="16" height="16" style="border-radius:3px;vertical-align:middle;" />', name: 'Gemini', url: 'https://gemini.google.com' },
      { icon: '<img src="https://www.google.com/s2/favicons?domain=claude.ai&sz=32" width="16" height="16" style="border-radius:3px;vertical-align:middle;" />', name: 'Claude', url: 'https://claude.ai' },
      { icon: '<img src="https://www.google.com/s2/favicons?domain=colab.research.google.com&sz=32" width="16" height="16" style="border-radius:3px;vertical-align:middle;" />', name: 'Google Colab', url: 'https://colab.research.google.com' },
      { icon: '<img src="https://www.google.com/s2/favicons?domain=kaggle.com&sz=32" width="16" height="16" style="border-radius:3px;vertical-align:middle;" />', name: 'Kaggle', url: 'https://www.kaggle.com' },
      { icon: '<img src="https://www.google.com/s2/favicons?domain=huggingface.co&sz=32" width="16" height="16" style="border-radius:3px;vertical-align:middle;" />', name: 'Hugging Face', url: 'https://huggingface.co' },
      { icon: '<img src="https://www.google.com/s2/favicons?domain=roboflow.com&sz=32" width="16" height="16" style="border-radius:3px;vertical-align:middle;" />', name: 'Roboflow', url: 'https://roboflow.com' },
      { icon: '<img src="https://www.google.com/s2/favicons?domain=paperswithcode.com&sz=32" width="16" height="16" style="border-radius:3px;vertical-align:middle;" />', name: 'Papers with Code', url: 'https://paperswithcode.com' },
      { icon: '<img src="https://www.google.com/s2/favicons?domain=wandb.ai&sz=32" width="16" height="16" style="border-radius:3px;vertical-align:middle;" />', name: 'Weights & Biases', url: 'https://wandb.ai' },
    ]
  },
];

export function renderSidebar() {
  const aside = document.getElementById('sidebar');
  aside.innerHTML = `<div class="sidebar">
    ${tools.map(cat => `
      <div class="sidebar__section">
        <div class="sidebar__title">${cat.category}</div>
        ${cat.items.map(item => `
          <a class="sidebar__item"
             href="${item.disabled ? 'javascript:void(0)' : '#' + item.path}"
             ${item.disabled ? 'style="opacity:0.4;pointer-events:none;"' : ''}>
            <span class="sidebar__icon">${item.icon}</span>
            ${item.name}
            ${item.disabled ? '<span class="sidebar__badge">Soon</span>' : ''}
            ${item.desc ? `<span class="sidebar__info-wrap"><span class="sidebar__info-icon" data-tip="${item.desc.replace(/"/g, '&quot;')}">ⓘ</span></span>` : ''}
          </a>
        `).join('')}
      </div>
    `).join('')}

    ${externalLinks.map(cat => `
      <div class="sidebar__section">
        <div class="sidebar__title">${cat.category} <span style="font-size:10px;font-weight:400;color:var(--text-muted);">↗</span></div>
        ${cat.items.map(item => `
          <a class="sidebar__item sidebar__item--external" href="${item.url}" target="_blank" rel="noopener">
            <span class="sidebar__icon">${item.icon}</span>
            ${item.name}
            <span style="margin-left:auto;font-size:10px;color:var(--text-muted);">↗</span>
            ${item.desc ? `<span class="sidebar__info-wrap"><span class="sidebar__info-icon" data-tip="${item.desc.replace(/"/g, '&quot;')}">ⓘ</span></span>` : ''}
          </a>
        `).join('')}
      </div>
    `).join('')}
  </div>`;

  // Global floating tooltip
  let tip = document.getElementById('sidebar-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'sidebar-tooltip';
    document.body.appendChild(tip);
  }

  aside.querySelectorAll('.sidebar__info-icon[data-tip]').forEach(icon => {
    icon.addEventListener('mouseenter', e => {
      const rect = icon.getBoundingClientRect();
      tip.textContent = icon.dataset.tip;
      tip.style.display = 'block';
      tip.style.top = (rect.top - 4) + 'px';
      tip.style.left = (rect.right + 12) + 'px';
    });
    icon.addEventListener('mouseleave', () => {
      tip.style.display = 'none';
    });
  });
  // Auto-close sidebar on mobile when a nav item is clicked
  aside.querySelectorAll('.sidebar__item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        const sb = aside.querySelector('.sidebar');
        if (sb) sb.classList.remove('sidebar--open');
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });
}

export { tools };

