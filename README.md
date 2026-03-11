# DevPanda

Browser-based utility toolkit for AI/ML and general developers.

Live: https://devpanda.cloud | License: MIT

---

## About

DevPanda is an open-source, browser-based toolkit with no installation required.
All tools run 100%% client-side - your data never leaves your browser.

## Tools

### AI / ML Tools

| Tool | Description |
|------|-------------|
| Tensor Shape Calculator | Add layers sequentially and calculate output shapes in real-time. Supports Conv2d, Pool, Linear, and more. |
| Label Format Converter | Convert between YOLO, COCO JSON, Pascal VOC (XML). Drag & drop with batch conversion. |
| GPU Memory Calculator | Estimate VRAM usage from model parameters and batch size. 100+ GPUs supported. |
| Training Analyzer | Upload YOLO results.csv to visualize loss/mAP curves and detect overfitting/underfitting. |
| LR Scheduler Visualizer | Compare and visualize learning rate schedules (cosine, warmup, step, OneCycle) interactively. |
| Model Parameter Counter | Calculate total parameters, trainable vs non-trainable, and memory footprint. |
| Augmentation Previewer | Preview augmentations (flip, blur, noise, crop, cutout) in a live grid. |
| Detection Metrics | Calculate IoU between bounding boxes and simulate NMS with adjustable thresholds. |
| Confusion Matrix | Visualize confusion matrix from predicted vs ground truth labels. |

### General Dev Tools

| Tool | Description |
|------|-------------|
| JSON Formatter | Format, minify, and validate JSON. Syntax highlighting, sort keys, and stats. |
| Base64 Converter | Encode and decode text or files to Base64. Supports image preview and file download. |
| Color Picker | Convert HEX, RGB, HSL. Generate harmony colors, shades, and palettes. |
| Image Resizer | Resize images in the browser. Set exact dimensions, maintain aspect ratio, export as JPG/PNG/WebP. |
| Image Compressor | Reduce image file size without changing resolution. Quality slider for WebP/JPEG/PNG optimization. |
| CSV to JSON | Convert between CSV and JSON formats with custom delimiters, table preview, and file download. |
| Regex Tester | Build and test regular expressions with live match highlighting, replace mode, and preset patterns. |
| Hash Generator | Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes from text or any file. |
| Unit Converter | Convert CSS units (px, rem, em, vw), length, storage, temperature, time, and angle. |
| URL Encoder/Decoder | Encode, decode, and parse URLs with encodeURI, encodeURIComponent, and query string parsing. |
| Cron Parser | Parse cron expressions into human-readable descriptions. Preview next scheduled run times. |
| PDF Text Extractor | Extract text from PDF files instantly, page-by-page, all in your browser. |
| Image to HEX | Convert image files to hex byte strings, or reconstruct images from hex data. |
| HTML Preview | Type or paste HTML/CSS/JS and see it rendered live. |

## Project Structure

`
devpanda/
+-- index.html            # App entry point
+-- vite.config.js        # Vite config
+-- src/
|   +-- main.js           # Router + app bootstrap
|   +-- style.css         # Global styles
|   +-- pages/            # One file per tool
|   +-- components/       # Navbar, Sidebar, Footer
|   +-- styles/           # Per-page CSS
|   +-- utils/            # Shared utilities
+-- public/
    +-- sitemap.xml
`

## Getting Started

`ash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
`

## Tech Stack

- **Build Tool**: [Vite](https://vitejs.dev/)
- **Rendering**: Vanilla JS (no framework)
- **Charts**: [Chart.js](https://www.chartjs.org/)
- **Background Removal**: [@imgly/background-removal](https://img.ly)
- **Hosting**: Firebase
- **Fonts**: [Google Fonts](https://fonts.google.com/) - Inter

## License

MIT (c) [ChoiJaeWoon](https://github.com/ChoiJaeWoon)
