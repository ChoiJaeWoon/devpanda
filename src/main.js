/**
 * DevPanda — Main Entry Point
 */
import './style.css';

// Page-specific CSS (split from style.css)
import './styles/pages/json-formatter.css';
import './styles/pages/base64-converter.css';
import './styles/pages/color-picker.css';
import './styles/pages/news-section.css';
import './styles/pages/lr-scheduler.css';
import './styles/pages/model-param-counter.css';
import './styles/pages/augmentation-previewer.css';
import './styles/pages/detection-metrics.css';
import './styles/pages/training-analyzer.css';
import './styles/pages/confusion-matrix.css';
import './styles/pages/image-resizer.css';
import './styles/pages/regex-tester.css';
import './styles/pages/hash-generator.css';
import './styles/pages/unit-converter.css';
import './styles/pages/url-encoder.css';
import './styles/pages/csv-json.css';
import './styles/pages/cron-parser.css';
import './styles/pages/ocr-extractor.css';
import './styles/pages/hex-image.css';
import './styles/pages/html-preview.css';
import './styles/pages/image-compressor.css';
import './styles/pages/bg-remover.css';
import { registerRoute, initRouter } from './utils/router.js';
import { renderNavbar } from './components/navbar.js';
import { renderSidebar } from './components/sidebar.js';
import { renderFooter } from './components/footer.js';
import { renderHome } from './pages/home.js';
import { renderTensorShape } from './pages/tensor-shape.js';
import { renderLabelConverter } from './pages/label-converter.js';
import { renderGpuMemory } from './pages/gpu-memory.js';
import { renderJsonFormatter } from './pages/json-formatter.js';
import { renderBase64Converter } from './pages/base64-converter.js';
import { renderColorPicker } from './pages/color-picker.js';
import { renderTrainingAnalyzer } from './pages/training-analyzer.js';
import { renderLRScheduler } from './pages/lr-scheduler.js';
import { renderModelParamCounter } from './pages/model-param-counter.js';
import { renderAugmentationPreviewer } from './pages/augmentation-previewer.js';
import { renderDetectionMetrics } from './pages/detection-metrics.js';
import { renderConfusionMatrix } from './pages/confusion-matrix.js';
import { renderImageResizer } from './pages/image-resizer.js';
import { renderRegexTester } from './pages/regex-tester.js';
import { renderHashGenerator } from './pages/hash-generator.js';
import { renderUnitConverter } from './pages/unit-converter.js';
import { renderUrlEncoder } from './pages/url-encoder.js';
import { renderCsvJson } from './pages/csv-json.js';
import { renderCronParser } from './pages/cron-parser.js';
import { renderOcrExtractor } from './pages/ocr-extractor.js';
import { renderHexImage } from './pages/hex-image.js';
import { renderHtmlPreview } from './pages/html-preview.js';
import { renderImageCompressor } from './pages/image-compressor.js';
import { renderBgRemover } from './pages/bg-remover.js';

// Render shell
renderNavbar();
renderSidebar();
renderFooter();

// Register routes
registerRoute('/', renderHome);
registerRoute('/tensor-shape', renderTensorShape);
registerRoute('/label-converter', renderLabelConverter);
registerRoute('/gpu-memory', renderGpuMemory);
registerRoute('/json-formatter', renderJsonFormatter);
registerRoute('/base64-converter', renderBase64Converter);
registerRoute('/color-picker', renderColorPicker);
registerRoute('/training-analyzer', renderTrainingAnalyzer);
registerRoute('/lr-scheduler', renderLRScheduler);
registerRoute('/model-param-counter', renderModelParamCounter);
registerRoute('/augmentation-previewer', renderAugmentationPreviewer);
registerRoute('/detection-metrics', renderDetectionMetrics);
registerRoute('/confusion-matrix', renderConfusionMatrix);
registerRoute('/image-resizer', renderImageResizer);
registerRoute('/regex-tester', renderRegexTester);
registerRoute('/hash-generator', renderHashGenerator);
registerRoute('/unit-converter', renderUnitConverter);
registerRoute('/url-encoder', renderUrlEncoder);
registerRoute('/csv-json', renderCsvJson);
registerRoute('/cron-parser', renderCronParser);
registerRoute('/ocr-extractor', renderOcrExtractor);
registerRoute('/hex-image', renderHexImage);
registerRoute('/html-preview', renderHtmlPreview);
registerRoute('/image-compressor', renderImageCompressor);
registerRoute('/bg-remover', renderBgRemover);

// Start router
initRouter();
