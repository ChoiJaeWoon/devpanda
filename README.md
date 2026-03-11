<h1 align="center">DevPanda</h1>

<p align="center">
  <strong>Browser-based developer toolkit for AI/ML engineers and general developers.</strong><br/>
  No installation. No sign-up. 100% client-side. Your data never leaves the browser.
</p>

<p align="center">
  <a href="https://devpanda.cloud"><img src="https://img.shields.io/badge/Live-devpanda.cloud-00C896?style=for-the-badge" alt="Live Demo" /></a>
  <img src="https://img.shields.io/badge/Tools-25+-7C3AED?style=for-the-badge" alt="25+ Tools" />
  <img src="https://img.shields.io/badge/Client--Side-100%25-0EA5E9?style=for-the-badge" alt="100% Client-Side" />
  <img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <a href="#-why-devpanda">Why DevPanda</a> &nbsp;&bull;&nbsp;
  <a href="#-tools">Tools</a> &nbsp;&bull;&nbsp;
  <a href="#-tech-stack">Tech Stack</a> &nbsp;&bull;&nbsp;
  <a href="#-getting-started">Getting Started</a> &nbsp;&bull;&nbsp;
  <a href="#-contributing">Contributing</a>
</p>

<br/>

---

<br/>

## # Why DevPanda?

Most developer utilities require installation, accounts, or send your data to remote servers.
DevPanda takes a different approach.

<table>
  <tr>
    <td width="50%">
      <h4>Zero Installation</h4>
      <p>Open the browser and start working.<br/>No CLI, no Docker, no setup wizard.</p>
    </td>
    <td width="50%">
      <h4>Fully Offline-Capable</h4>
      <p>Every tool runs 100% in the browser.<br/>Nothing is uploaded. Nothing is tracked.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h4>Privacy First</h4>
      <p>Your files, your data, your models<br/>stay on your machine. Period.</p>
    </td>
    <td width="50%">
      <h4>25+ Tools in One Place</h4>
      <p>AI/ML-specific tools you won't find elsewhere,<br/>plus everyday dev essentials.</p>
    </td>
  </tr>
</table>

<br/>

---

<br/>

## # Tools

### AI / ML Tools

<table>
  <tr>
    <th width="240">Tool</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><strong>Tensor Shape Calculator</strong></td>
    <td>Add layers sequentially (Conv2d, Pool, Linear, BatchNorm, etc.) and calculate output shapes in real-time.</td>
  </tr>
  <tr>
    <td><strong>Label Format Converter</strong></td>
    <td>Convert between YOLO, COCO JSON, and Pascal VOC (XML). Drag &amp; drop with batch conversion.</td>
  </tr>
  <tr>
    <td><strong>GPU Memory Calculator</strong></td>
    <td>Estimate VRAM usage from model parameters, batch size, optimizer, and precision. 100+ GPU specs built-in.</td>
  </tr>
  <tr>
    <td><strong>Training Analyzer</strong></td>
    <td>Upload YOLO <code>results.csv</code> to visualize loss/mAP curves and detect overfitting/underfitting.</td>
  </tr>
  <tr>
    <td><strong>LR Scheduler Visualizer</strong></td>
    <td>Compare and visualize learning rate schedules interactively &mdash; cosine, warmup, step decay, OneCycleLR.</td>
  </tr>
  <tr>
    <td><strong>Model Parameter Counter</strong></td>
    <td>Calculate total/trainable/non-trainable parameters and estimate memory footprint across precisions.</td>
  </tr>
  <tr>
    <td><strong>Augmentation Previewer</strong></td>
    <td>Preview augmentation effects (flip, blur, noise, crop, cutout, color jitter) on your images in a live grid.</td>
  </tr>
  <tr>
    <td><strong>Detection Metrics</strong></td>
    <td>Calculate IoU between bounding boxes and simulate NMS with adjustable thresholds and visual feedback.</td>
  </tr>
  <tr>
    <td><strong>Confusion Matrix</strong></td>
    <td>Visualize confusion matrices from predicted vs. ground truth labels with class-level metrics.</td>
  </tr>
</table>

<br/>

### General Dev Tools

<table>
  <tr>
    <th width="240">Tool</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><strong>JSON Formatter</strong></td>
    <td>Format, minify, and validate JSON with syntax highlighting, key sorting, and structure stats.</td>
  </tr>
  <tr>
    <td><strong>Base64 Converter</strong></td>
    <td>Encode/decode text and files to Base64. Supports image preview and one-click file download.</td>
  </tr>
  <tr>
    <td><strong>Color Picker</strong></td>
    <td>Convert between HEX, RGB, HSL. Generate harmony palettes, shades, tints, and complementary colors.</td>
  </tr>
  <tr>
    <td><strong>Image Resizer</strong></td>
    <td>Resize images with exact dimensions, aspect ratio lock, and export as JPG / PNG / WebP.</td>
  </tr>
  <tr>
    <td><strong>Image Compressor</strong></td>
    <td>Reduce image file size without changing resolution. Quality slider for WebP, JPEG, PNG.</td>
  </tr>
  <tr>
    <td><strong>Background Remover</strong></td>
    <td>Remove image backgrounds using AI-powered segmentation, entirely in the browser.</td>
  </tr>
  <tr>
    <td><strong>CSV to JSON</strong></td>
    <td>Convert between CSV and JSON with custom delimiters, table preview, and file download.</td>
  </tr>
  <tr>
    <td><strong>Regex Tester</strong></td>
    <td>Build and test regex with live match highlighting, replace mode, and preset pattern library.</td>
  </tr>
  <tr>
    <td><strong>Hash Generator</strong></td>
    <td>Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or any file.</td>
  </tr>
  <tr>
    <td><strong>Unit Converter</strong></td>
    <td>Convert CSS units (px/rem/em/vw), data storage, length, temperature, time, and angles.</td>
  </tr>
  <tr>
    <td><strong>URL Encoder / Decoder</strong></td>
    <td>Encode, decode, and parse URLs with <code>encodeURI</code> / <code>encodeURIComponent</code> support.</td>
  </tr>
  <tr>
    <td><strong>Cron Parser</strong></td>
    <td>Parse cron expressions into human-readable descriptions. Preview next scheduled run times.</td>
  </tr>
  <tr>
    <td><strong>OCR / PDF Extractor</strong></td>
    <td>Extract text from PDF files page-by-page, instantly, all in the browser.</td>
  </tr>
  <tr>
    <td><strong>Image to HEX</strong></td>
    <td>Convert image files to hex byte strings, or reconstruct images from hex data.</td>
  </tr>
  <tr>
    <td><strong>HTML Live Preview</strong></td>
    <td>Type or paste HTML/CSS/JS and see it rendered in real-time in a sandboxed iframe.</td>
  </tr>
</table>

<br/>

---

<br/>

## # Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Build** | [Vite](https://vitejs.dev/) |
| **Language** | Vanilla JavaScript (ES Modules, no framework) |
| **Styling** | Vanilla CSS with custom properties |
| **Charts** | [Chart.js](https://www.chartjs.org/) |
| **BG Removal** | [@imgly/background-removal](https://img.ly) |
| **Analytics** | [Firebase](https://firebase.google.com/) |
| **Hosting** | [Firebase Hosting](https://firebase.google.com/products/hosting) |
| **Fonts** | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |

<br/>

---

<br/>

## # Architecture

DevPanda is a **single-page application** built with vanilla JavaScript &mdash; no framework overhead.

```
Browser Request
      |
  index.html (Vite entry)
      |
  main.js
      |
  +----------+
  |          |
Shell     Router (hash-based)
  |          |
  |    +-----+-----+-----+--- ...
  |    |     |     |     |
  |   home tool1 tool2 toolN
  |
  +-- navbar.js
  +-- sidebar.js
  +-- footer.js
```

> **Hash-based Routing** &mdash; `/#/route-name` pattern for client-side navigation, no server config needed.
>
> **Lazy Page Rendering** &mdash; Each tool is a self-contained JS module, rendered only when navigated to.
>
> **CSS Isolation** &mdash; Per-tool CSS files prevent style leakage between tools.
>
> **No External API Calls** &mdash; All computation in-browser. Even the BG remover runs an ML model client-side.

<br/>

---

<br/>

## # Project Structure

<details>
<summary><strong>Click to expand full tree</strong></summary>

<br/>

```
devpanda/
+-- index.html                  # App entry point (Vite root)
+-- vite.config.js              # Vite build configuration
+-- firebase.json               # Firebase Hosting config
+-- package.json
|
+-- src/
|   +-- main.js                 # App bootstrap, route registration
|   +-- style.css               # Global styles & design tokens
|   |
|   +-- pages/                  # One JS module per tool (25 files)
|   |   +-- home.js             #   Landing page
|   |   +-- tensor-shape.js     #   AI/ML tools ...
|   |   +-- label-converter.js
|   |   +-- gpu-memory.js
|   |   +-- training-analyzer.js
|   |   +-- lr-scheduler.js
|   |   +-- model-param-counter.js
|   |   +-- augmentation-previewer.js
|   |   +-- detection-metrics.js
|   |   +-- confusion-matrix.js
|   |   +-- json-formatter.js   #   General dev tools ...
|   |   +-- base64-converter.js
|   |   +-- color-picker.js
|   |   +-- image-resizer.js
|   |   +-- image-compressor.js
|   |   +-- bg-remover.js
|   |   +-- csv-json.js
|   |   +-- regex-tester.js
|   |   +-- hash-generator.js
|   |   +-- unit-converter.js
|   |   +-- url-encoder.js
|   |   +-- cron-parser.js
|   |   +-- ocr-extractor.js
|   |   +-- hex-image.js
|   |   +-- html-preview.js
|   |
|   +-- components/             # Shared UI shell
|   |   +-- navbar.js
|   |   +-- sidebar.js
|   |   +-- footer.js
|   |
|   +-- styles/pages/           # Per-tool CSS (22 files)
|   |
|   +-- utils/
|       +-- router.js           # Hash-based SPA router
|       +-- helpers.js          # Shared utility functions
|
+-- public/
    +-- favicon.svg
    +-- logo.png
    +-- og-image.png            # Open Graph social preview
    +-- sitemap.xml
    +-- robots.txt
    +-- ads.txt
```

</details>

<br/>

---

<br/>

## # Getting Started

#### Prerequisites

- [Node.js](https://nodejs.org/) v18+  &nbsp;/&nbsp;  npm (included)

#### Install & Run

```bash
git clone https://github.com/ChoiJaeWoon/devpanda.git
cd devpanda
npm install
npm run dev          # http://localhost:5173
```

#### Production Build & Deploy

```bash
npm run build        # Build for production
npm run preview      # Preview locally
firebase deploy      # Deploy to Firebase Hosting
```

<br/>

---

<br/>

## # Contributing

Contributions are welcome &mdash; new tools, bug fixes, or design improvements.

```
1. Fork the repository
2. git checkout -b feature/new-tool
3. Add your tool in src/pages/ + CSS in src/styles/pages/
4. Register the route in src/main.js
5. Commit, push, and open a Pull Request
```

<details>
<summary><strong>How to add a new tool</strong></summary>

<br/>

Each tool follows a consistent pattern:

1. Create `src/pages/your-tool.js` &mdash; export a `renderYourTool()` function
2. Create `src/styles/pages/your-tool.css` &mdash; tool-specific styles
3. Import both in `src/main.js`
4. Register the route:

```js
registerRoute('/your-tool', renderYourTool);
```

</details>

<br/>

---

<br/>

## # Security

See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting.

<br/>

---

<br/>

## # Contact

Bug reports, feature requests, and general questions are always welcome.

> **devpanda@devpanda.cloud**

Feel free to reach out anytime &mdash; we'd love to hear from you.

<br/>

---

<br/>

<p align="center">
  <strong>MIT License</strong> &copy; <a href="https://github.com/ChoiJaeWoon">ChoiJaeWoon</a>
</p>
