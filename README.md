<h1 align="center">DevPanda</h1>

<p align="center">
  <strong>Browser-based developer toolkit for AI/ML engineers and general developers.</strong><br/>
  No installation. No sign-up. 100% client-side. Your data never leaves the browser.
</p>

<p align="center">
  <a href="https://devpanda.cloud">Live Demo</a> &middot;
  <a href="#tools">Tools</a> &middot;
  <a href="#getting-started">Getting Started</a> &middot;
  <a href="LICENSE">MIT License</a>
</p>

---

## Why DevPanda?

Most developer utilities require installation, accounts, or send your data to remote servers. DevPanda takes a different approach:

- **Zero Installation** - Open the browser and start working. No CLI, no Docker, no setup.
- **Fully Offline-Capable** - Every tool runs 100% in the browser. Nothing is uploaded. Nothing is tracked.
- **Privacy First** - Your files, your data, your models stay on your machine. Period.
- **25+ Tools in One Place** - AI/ML-specific tools you won't find elsewhere, plus everyday dev essentials.

---

## Tools

### AI / ML Tools

| Tool | Description |
|------|-------------|
| **Tensor Shape Calculator** | Add layers sequentially (Conv2d, Pool, Linear, BatchNorm, etc.) and calculate output shapes in real-time. |
| **Label Format Converter** | Convert between YOLO, COCO JSON, and Pascal VOC (XML). Supports drag & drop and batch conversion. |
| **GPU Memory Calculator** | Estimate VRAM usage based on model parameters, batch size, optimizer, and precision. 100+ GPU specs built-in. |
| **Training Analyzer** | Upload YOLO `results.csv` to visualize loss/mAP curves and detect overfitting/underfitting patterns. |
| **LR Scheduler Visualizer** | Compare and visualize learning rate schedules interactively - cosine, warmup, step decay, OneCycleLR, and more. |
| **Model Parameter Counter** | Calculate total/trainable/non-trainable parameters and estimate memory footprint across different precisions. |
| **Augmentation Previewer** | Preview augmentation effects (flip, blur, noise, crop, cutout, color jitter) on your own images in a live grid. |
| **Detection Metrics** | Calculate IoU between bounding boxes and simulate NMS with adjustable thresholds and visual feedback. |
| **Confusion Matrix** | Generate and visualize confusion matrices from predicted vs. ground truth labels with detailed class-level metrics. |

### General Dev Tools

| Tool | Description |
|------|-------------|
| **JSON Formatter** | Format, minify, and validate JSON with syntax highlighting, key sorting, and structure statistics. |
| **Base64 Converter** | Encode/decode text and files to Base64. Supports image preview and one-click file download. |
| **Color Picker** | Convert between HEX, RGB, and HSL. Generate harmony palettes, shades, tints, and complementary colors. |
| **Image Resizer** | Resize images in the browser with exact dimensions, aspect ratio lock, and export as JPG/PNG/WebP. |
| **Image Compressor** | Reduce image file size without changing resolution. Quality slider for WebP, JPEG, and PNG output. |
| **Background Remover** | Remove image backgrounds automatically using AI-powered segmentation, entirely in the browser. |
| **CSV to JSON** | Convert between CSV and JSON with custom delimiters, table preview, and direct file download. |
| **Regex Tester** | Build and test regular expressions with live match highlighting, replace mode, and preset pattern library. |
| **Hash Generator** | Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes from text or any file. |
| **Unit Converter** | Convert CSS units (px, rem, em, vw), data storage, length, temperature, time, and angle values. |
| **URL Encoder/Decoder** | Encode, decode, and parse URLs with `encodeURI` / `encodeURIComponent` and query string parsing. |
| **Cron Parser** | Parse cron expressions into human-readable descriptions and preview next scheduled run times. |
| **OCR / PDF Text Extractor** | Extract text from PDF files page-by-page, instantly, all in the browser. |
| **Image to HEX** | Convert image files to hex byte strings, or reconstruct images from hex data. |
| **HTML Live Preview** | Type or paste HTML/CSS/JS and see it rendered in real-time in a sandboxed iframe. |

---

## Project Structure

```
devpanda/
├── index.html                  # App entry point (Vite root)
├── vite.config.js              # Vite build configuration
├── firebase.json               # Firebase Hosting config
├── package.json
│
├── src/
│   ├── main.js                 # App bootstrap, route registration
│   ├── style.css               # Global styles & design tokens
│   │
│   ├── pages/                  # One JS module per tool (25 files)
│   │   ├── home.js             # Landing page
│   │   ├── tensor-shape.js     # AI/ML tools
│   │   ├── label-converter.js
│   │   ├── gpu-memory.js
│   │   ├── training-analyzer.js
│   │   ├── lr-scheduler.js
│   │   ├── model-param-counter.js
│   │   ├── augmentation-previewer.js
│   │   ├── detection-metrics.js
│   │   ├── confusion-matrix.js
│   │   ├── json-formatter.js   # General dev tools
│   │   ├── base64-converter.js
│   │   ├── color-picker.js
│   │   ├── image-resizer.js
│   │   ├── image-compressor.js
│   │   ├── bg-remover.js
│   │   ├── csv-json.js
│   │   ├── regex-tester.js
│   │   ├── hash-generator.js
│   │   ├── unit-converter.js
│   │   ├── url-encoder.js
│   │   ├── cron-parser.js
│   │   ├── ocr-extractor.js
│   │   ├── hex-image.js
│   │   └── html-preview.js
│   │
│   ├── components/             # Shared UI shell
│   │   ├── navbar.js
│   │   ├── sidebar.js
│   │   └── footer.js
│   │
│   ├── styles/pages/           # Per-tool CSS (22 files)
│   │
│   └── utils/
│       ├── router.js           # Hash-based SPA router
│       └── helpers.js          # Shared utility functions
│
└── public/
    ├── favicon.svg
    ├── logo.png
    ├── og-image.png            # Open Graph social preview image
    ├── sitemap.xml
    ├── robots.txt
    └── ads.txt
```

---

## Architecture

DevPanda is a **single-page application** built with vanilla JavaScript - no framework overhead.

```
Browser Request
      |
  index.html (Vite entry)
      |
  main.js
      |
  ┌───┴───┐
  |       |
Shell   Router (hash-based)
  |       |
  |   ┌───┴───────────────┐
  |   |    |    |    ...   |
  | home  tool1 tool2   toolN
  |
  ├── navbar.js
  ├── sidebar.js
  └── footer.js
```

**Key Design Decisions:**

- **Hash-based Routing** - Uses `/#/route-name` pattern for client-side navigation without server configuration.
- **Lazy Page Rendering** - Each tool page is a self-contained JS module that renders only when navigated to.
- **CSS Isolation** - Per-tool CSS files prevent style leakage between tools.
- **No External API Calls** - All computation happens in-browser. Even the background remover runs an ML model client-side.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | [Vite](https://vitejs.dev/) |
| Language | Vanilla JavaScript (ES Modules, no framework) |
| Styling | Vanilla CSS with custom properties |
| Charts | [Chart.js](https://www.chartjs.org/) |
| Background Removal | [@imgly/background-removal](https://img.ly) |
| Analytics | [Firebase](https://firebase.google.com/) |
| Hosting | [Firebase Hosting](https://firebase.google.com/products/hosting) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- npm (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/ChoiJaeWoon/devpanda.git
cd devpanda

# Install dependencies
npm install

# Start the development server
npm run dev
```

The dev server will start at `http://localhost:5173` by default.

### Production Build

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

### Deployment

DevPanda is deployed via Firebase Hosting:

```bash
# Deploy to Firebase (requires Firebase CLI)
firebase deploy
```

---

## Contributing

Contributions are welcome! Whether it's a new tool, bug fix, or design improvement:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-tool`)
3. Add your tool as a new file in `src/pages/` with corresponding CSS in `src/styles/pages/`
4. Register the route in `src/main.js`
5. Commit and push your changes
6. Open a Pull Request

### Adding a New Tool

Each tool follows a consistent pattern:

1. Create `src/pages/your-tool.js` - export a `renderYourTool()` function
2. Create `src/styles/pages/your-tool.css` - tool-specific styles
3. Import both in `src/main.js`
4. Register the route: `registerRoute('/your-tool', renderYourTool)`

---

## Security

See [SECURITY.md](SECURITY.md) for security policy and vulnerability reporting guidelines.

---

## License

MIT License (c) [ChoiJaeWoon](https://github.com/ChoiJaeWoon)

See [LICENSE](LICENSE) for details.
