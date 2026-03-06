/**
 * DevPanda — GPU Memory Calculator
 * Estimates VRAM usage & training time with full system bottleneck analysis.
 */

const MODEL_PRESETS = [
  { name: 'Custom', params: 0, activationFactor: 0 },
  { name: 'ResNet-50', params: 25.6e6, activationFactor: 100 },
  { name: 'ResNet-101', params: 44.5e6, activationFactor: 150 },
  { name: 'YOLOv8n', params: 3.2e6, activationFactor: 80 },
  { name: 'YOLOv8s', params: 11.2e6, activationFactor: 120 },
  { name: 'YOLOv8m', params: 25.9e6, activationFactor: 200 },
  { name: 'YOLOv8l', params: 43.7e6, activationFactor: 300 },
  { name: 'BERT-base', params: 110e6, activationFactor: 60 },
  { name: 'BERT-large', params: 340e6, activationFactor: 120 },
  { name: 'GPT-2 (117M)', params: 117e6, activationFactor: 80 },
  { name: 'GPT-2 (774M)', params: 774e6, activationFactor: 200 },
  { name: 'ViT-B/16', params: 86e6, activationFactor: 90 },
  { name: 'ViT-L/16', params: 307e6, activationFactor: 200 },
  { name: 'Llama-2 7B', params: 7e9, activationFactor: 400 },
  { name: 'Llama-2 13B', params: 13e9, activationFactor: 600 },
];

/* ═══════════════════════════════════════════
   GPU / NPU Database
   ═══════════════════════════════════════════ */
const GPU_LIST = [
  // ── NVIDIA GeForce (Consumer) ──
  { name: 'GTX 1050 Ti', vendor: 'nvidia', vram: 4, fp32: 2.1, fp16: 2.1, int8: 4.2 },
  { name: 'GTX 1060 6GB', vendor: 'nvidia', vram: 6, fp32: 4.4, fp16: 4.4, int8: 8.8 },
  { name: 'GTX 1070', vendor: 'nvidia', vram: 8, fp32: 6.5, fp16: 6.5, int8: 13.0 },
  { name: 'GTX 1080', vendor: 'nvidia', vram: 8, fp32: 8.9, fp16: 8.9, int8: 17.8 },
  { name: 'GTX 1080 Ti', vendor: 'nvidia', vram: 11, fp32: 11.3, fp16: 11.3, int8: 22.6 },
  { name: 'GTX 1650', vendor: 'nvidia', vram: 4, fp32: 2.9, fp16: 2.9, int8: 5.8 },
  { name: 'GTX 1660 Super', vendor: 'nvidia', vram: 6, fp32: 5.0, fp16: 5.0, int8: 10.0 },
  { name: 'RTX 2060', vendor: 'nvidia', vram: 6, fp32: 6.5, fp16: 13.0, int8: 26.0 },
  { name: 'RTX 2070', vendor: 'nvidia', vram: 8, fp32: 7.5, fp16: 14.9, int8: 29.8 },
  { name: 'RTX 2070 Super', vendor: 'nvidia', vram: 8, fp32: 9.1, fp16: 18.1, int8: 36.2 },
  { name: 'RTX 2080', vendor: 'nvidia', vram: 8, fp32: 10.1, fp16: 20.1, int8: 40.2 },
  { name: 'RTX 2080 Ti', vendor: 'nvidia', vram: 11, fp32: 13.4, fp16: 26.9, int8: 53.8 },
  { name: 'RTX 3060', vendor: 'nvidia', vram: 12, fp32: 12.7, fp16: 12.7, int8: 25.4 },
  { name: 'RTX 3060 Ti', vendor: 'nvidia', vram: 8, fp32: 16.2, fp16: 16.2, int8: 32.4 },
  { name: 'RTX 3070', vendor: 'nvidia', vram: 8, fp32: 20.3, fp16: 20.3, int8: 40.6 },
  { name: 'RTX 3070 Ti', vendor: 'nvidia', vram: 8, fp32: 21.7, fp16: 21.7, int8: 43.4 },
  { name: 'RTX 3080', vendor: 'nvidia', vram: 10, fp32: 29.8, fp16: 29.8, int8: 59.6 },
  { name: 'RTX 3080 Ti', vendor: 'nvidia', vram: 12, fp32: 34.1, fp16: 34.1, int8: 68.2 },
  { name: 'RTX 3090', vendor: 'nvidia', vram: 24, fp32: 35.6, fp16: 35.6, int8: 71.2 },
  { name: 'RTX 3090 Ti', vendor: 'nvidia', vram: 24, fp32: 40.0, fp16: 40.0, int8: 80.0 },
  { name: 'RTX 4060', vendor: 'nvidia', vram: 8, fp32: 15.1, fp16: 15.1, int8: 30.2 },
  { name: 'RTX 4060 Ti 8GB', vendor: 'nvidia', vram: 8, fp32: 22.1, fp16: 22.1, int8: 44.2 },
  { name: 'RTX 4060 Ti 16GB', vendor: 'nvidia', vram: 16, fp32: 22.1, fp16: 22.1, int8: 44.2 },
  { name: 'RTX 4070', vendor: 'nvidia', vram: 12, fp32: 29.1, fp16: 29.1, int8: 58.2 },
  { name: 'RTX 4070 Super', vendor: 'nvidia', vram: 12, fp32: 35.5, fp16: 35.5, int8: 71.0 },
  { name: 'RTX 4070 Ti', vendor: 'nvidia', vram: 12, fp32: 40.1, fp16: 40.1, int8: 80.2 },
  { name: 'RTX 4070 Ti Super', vendor: 'nvidia', vram: 16, fp32: 44.1, fp16: 44.1, int8: 88.2 },
  { name: 'RTX 4080', vendor: 'nvidia', vram: 16, fp32: 48.7, fp16: 48.7, int8: 97.4 },
  { name: 'RTX 4080 Super', vendor: 'nvidia', vram: 16, fp32: 52.0, fp16: 52.0, int8: 104.0 },
  { name: 'RTX 4090', vendor: 'nvidia', vram: 24, fp32: 82.6, fp16: 82.6, int8: 165.2 },
  { name: 'RTX 5070', vendor: 'nvidia', vram: 12, fp32: 48.0, fp16: 48.0, int8: 96.0 },
  { name: 'RTX 5070 Ti', vendor: 'nvidia', vram: 16, fp32: 69.0, fp16: 69.0, int8: 138.0 },
  { name: 'RTX 5080', vendor: 'nvidia', vram: 16, fp32: 90.0, fp16: 90.0, int8: 180.0 },
  { name: 'RTX 5090', vendor: 'nvidia', vram: 32, fp32: 105.0, fp16: 105.0, int8: 210.0 },

  // ── NVIDIA Workstation ──
  { name: 'Quadro RTX 5000', vendor: 'nvidia', vram: 16, fp32: 11.2, fp16: 22.3, int8: 44.6 },
  { name: 'Quadro RTX 6000', vendor: 'nvidia', vram: 24, fp32: 16.3, fp16: 32.6, int8: 65.2 },
  { name: 'RTX A4000', vendor: 'nvidia', vram: 16, fp32: 19.2, fp16: 19.2, int8: 38.4 },
  { name: 'RTX A5000', vendor: 'nvidia', vram: 24, fp32: 27.8, fp16: 27.8, int8: 55.6 },
  { name: 'RTX A6000', vendor: 'nvidia', vram: 48, fp32: 38.7, fp16: 38.7, int8: 77.4 },

  // ── NVIDIA Datacenter ──
  { name: 'Tesla T4', vendor: 'nvidia', vram: 16, fp32: 8.1, fp16: 65.0, int8: 130.0 },
  { name: 'Tesla V100 16GB', vendor: 'nvidia', vram: 16, fp32: 14.0, fp16: 112.0, int8: 112.0 },
  { name: 'Tesla V100 32GB', vendor: 'nvidia', vram: 32, fp32: 14.0, fp16: 112.0, int8: 112.0 },
  { name: 'A10', vendor: 'nvidia', vram: 24, fp32: 31.2, fp16: 62.5, int8: 125.0 },
  { name: 'A30', vendor: 'nvidia', vram: 24, fp32: 10.3, fp16: 165.0, int8: 330.0 },
  { name: 'A40', vendor: 'nvidia', vram: 48, fp32: 37.4, fp16: 37.4, int8: 74.8 },
  { name: 'A100 40GB', vendor: 'nvidia', vram: 40, fp32: 19.5, fp16: 312.0, int8: 624.0 },
  { name: 'A100 80GB', vendor: 'nvidia', vram: 80, fp32: 19.5, fp16: 312.0, int8: 624.0 },
  { name: 'L4', vendor: 'nvidia', vram: 24, fp32: 30.3, fp16: 121.0, int8: 242.0 },
  { name: 'L40', vendor: 'nvidia', vram: 48, fp32: 90.5, fp16: 90.5, int8: 181.0 },
  { name: 'L40S', vendor: 'nvidia', vram: 48, fp32: 91.6, fp16: 183.0, int8: 366.0 },
  { name: 'H100 SXM', vendor: 'nvidia', vram: 80, fp32: 67.0, fp16: 989.0, int8: 1979.0 },
  { name: 'H100 PCIe', vendor: 'nvidia', vram: 80, fp32: 51.0, fp16: 756.0, int8: 1513.0 },
  { name: 'H200', vendor: 'nvidia', vram: 141, fp32: 67.0, fp16: 989.0, int8: 1979.0 },
  { name: 'B100', vendor: 'nvidia', vram: 192, fp32: 70.0, fp16: 1800.0, int8: 3600.0 },
  { name: 'B200', vendor: 'nvidia', vram: 192, fp32: 90.0, fp16: 2250.0, int8: 4500.0 },
  { name: 'GB200', vendor: 'nvidia', vram: 384, fp32: 90.0, fp16: 4500.0, int8: 9000.0 },

  // ── AMD Radeon (Consumer) ──
  { name: 'RX 6600 XT', vendor: 'amd', vram: 8, fp32: 10.6, fp16: 10.6, int8: 21.2 },
  { name: 'RX 6700 XT', vendor: 'amd', vram: 12, fp32: 13.2, fp16: 13.2, int8: 26.4 },
  { name: 'RX 6800', vendor: 'amd', vram: 16, fp32: 16.2, fp16: 16.2, int8: 32.4 },
  { name: 'RX 6800 XT', vendor: 'amd', vram: 16, fp32: 20.7, fp16: 20.7, int8: 41.4 },
  { name: 'RX 6900 XT', vendor: 'amd', vram: 16, fp32: 23.0, fp16: 23.0, int8: 46.1 },
  { name: 'RX 6950 XT', vendor: 'amd', vram: 16, fp32: 23.6, fp16: 23.6, int8: 47.3 },
  { name: 'RX 7600', vendor: 'amd', vram: 8, fp32: 21.8, fp16: 21.8, int8: 43.5 },
  { name: 'RX 7700 XT', vendor: 'amd', vram: 12, fp32: 35.2, fp16: 35.2, int8: 70.4 },
  { name: 'RX 7800 XT', vendor: 'amd', vram: 16, fp32: 37.3, fp16: 37.3, int8: 74.7 },
  { name: 'RX 7900 GRE', vendor: 'amd', vram: 16, fp32: 46.1, fp16: 46.1, int8: 92.2 },
  { name: 'RX 7900 XT', vendor: 'amd', vram: 20, fp32: 51.6, fp16: 51.6, int8: 103.2 },
  { name: 'RX 7900 XTX', vendor: 'amd', vram: 24, fp32: 61.4, fp16: 61.4, int8: 122.8 },
  { name: 'RX 9070 XT', vendor: 'amd', vram: 16, fp32: 56.0, fp16: 56.0, int8: 112.0 },

  // ── AMD Instinct (Datacenter) ──
  { name: 'MI210', vendor: 'amd', vram: 64, fp32: 22.6, fp16: 181.0, int8: 181.0 },
  { name: 'MI250', vendor: 'amd', vram: 128, fp32: 45.3, fp16: 362.0, int8: 362.0 },
  { name: 'MI250X', vendor: 'amd', vram: 128, fp32: 47.9, fp16: 383.0, int8: 383.0 },
  { name: 'MI300X', vendor: 'amd', vram: 192, fp32: 81.7, fp16: 1307.0, int8: 2614.0 },
  { name: 'MI325X', vendor: 'amd', vram: 256, fp32: 81.7, fp16: 1307.0, int8: 2614.0 },

  // ── Intel ──
  { name: 'Arc A380', vendor: 'intel', vram: 6, fp32: 4.5, fp16: 9.0, int8: 18.0 },
  { name: 'Arc A580', vendor: 'intel', vram: 8, fp32: 12.7, fp16: 25.4, int8: 50.8 },
  { name: 'Arc A750', vendor: 'intel', vram: 8, fp32: 17.2, fp16: 34.4, int8: 68.8 },
  { name: 'Arc A770 16GB', vendor: 'intel', vram: 16, fp32: 19.7, fp16: 39.3, int8: 78.6 },
  { name: 'Arc B580', vendor: 'intel', vram: 12, fp32: 18.0, fp16: 36.0, int8: 72.0 },
  { name: 'Gaudi 2', vendor: 'intel', vram: 96, fp32: 22.0, fp16: 420.0, int8: 840.0 },
  { name: 'Gaudi 3', vendor: 'intel', vram: 128, fp32: 64.0, fp16: 1835.0, int8: 3670.0 },

  // ── Apple Silicon (Unified Memory) ──
  { name: 'M1 (8GB)', vendor: 'apple', vram: 8, fp32: 2.6, fp16: 5.2, int8: 10.4 },
  { name: 'M1 Pro (16GB)', vendor: 'apple', vram: 16, fp32: 5.3, fp16: 10.6, int8: 21.2 },
  { name: 'M1 Max (32GB)', vendor: 'apple', vram: 32, fp32: 10.7, fp16: 21.4, int8: 42.8 },
  { name: 'M1 Ultra (64GB)', vendor: 'apple', vram: 64, fp32: 21.2, fp16: 42.4, int8: 84.8 },
  { name: 'M2 (8GB)', vendor: 'apple', vram: 8, fp32: 3.6, fp16: 7.1, int8: 14.2 },
  { name: 'M2 Pro (16GB)', vendor: 'apple', vram: 16, fp32: 6.8, fp16: 13.6, int8: 27.2 },
  { name: 'M2 Max (32GB)', vendor: 'apple', vram: 32, fp32: 13.6, fp16: 27.2, int8: 54.4 },
  { name: 'M2 Ultra (64GB)', vendor: 'apple', vram: 64, fp32: 27.2, fp16: 54.4, int8: 108.8 },
  { name: 'M3 (8GB)', vendor: 'apple', vram: 8, fp32: 3.5, fp16: 7.0, int8: 14.0 },
  { name: 'M3 Pro (18GB)', vendor: 'apple', vram: 18, fp32: 7.4, fp16: 14.7, int8: 29.4 },
  { name: 'M3 Max (36GB)', vendor: 'apple', vram: 36, fp32: 14.2, fp16: 28.4, int8: 56.8 },
  { name: 'M3 Ultra (64GB)', vendor: 'apple', vram: 64, fp32: 28.0, fp16: 56.0, int8: 112.0 },
  { name: 'M4 (16GB)', vendor: 'apple', vram: 16, fp32: 4.3, fp16: 8.6, int8: 17.2 },
  { name: 'M4 Pro (24GB)', vendor: 'apple', vram: 24, fp32: 8.7, fp16: 17.4, int8: 34.8 },
  { name: 'M4 Max (36GB)', vendor: 'apple', vram: 36, fp32: 18.0, fp16: 36.0, int8: 72.0 },
  { name: 'M4 Ultra (128GB)', vendor: 'apple', vram: 128, fp32: 36.0, fp16: 72.0, int8: 144.0 },

  // ── NPU / AI Accelerators ──
  { name: 'Google TPU v4', vendor: 'npu', vram: 32, fp32: 60.0, fp16: 275.0, int8: 550.0 },
  { name: 'Google TPU v5e', vendor: 'npu', vram: 16, fp32: 49.0, fp16: 197.0, int8: 394.0 },
  { name: 'Google TPU v5p', vendor: 'npu', vram: 95, fp32: 90.0, fp16: 459.0, int8: 918.0 },
  { name: 'AWS Trainium', vendor: 'npu', vram: 32, fp32: 26.8, fp16: 210.0, int8: 420.0 },
  { name: 'AWS Inferentia2', vendor: 'npu', vram: 32, fp32: 12.0, fp16: 190.0, int8: 380.0 },
  { name: 'Huawei Ascend 910B', vendor: 'npu', vram: 64, fp32: 30.0, fp16: 320.0, int8: 640.0 },
  { name: 'Graphcore Bow IPU', vendor: 'npu', vram: 1, fp32: 44.0, fp16: 350.0, int8: 350.0 },
  { name: 'Cerebras CS-2 (WSE-2)', vendor: 'npu', vram: 40, fp32: 75.0, fp16: 500.0, int8: 1000.0 },
  { name: 'Qualcomm Cloud AI 100', vendor: 'npu', vram: 32, fp32: 12.0, fp16: 200.0, int8: 400.0 },
  { name: 'FuriosaAI RNGD', vendor: 'npu', vram: 36, fp32: 8.0, fp16: 128.0, int8: 512.0 },
  { name: 'Rebellions ATOM', vendor: 'npu', vram: 32, fp32: 6.0, fp16: 96.0, int8: 384.0 },
];

const VENDOR_INFO = {
  nvidia: { label: 'NVIDIA', color: '#76b900' },
  amd: { label: 'AMD', color: '#ed1c24' },
  intel: { label: 'Intel', color: '#0071c5' },
  apple: { label: 'Apple', color: '#a2aaad' },
  npu: { label: 'NPU/TPU', color: '#8b5cf6' },
};

/* ═══════════════════════════════════════════
   System Environment Presets
   ═══════════════════════════════════════════ */
const STORAGE_TYPES = {
  'nvme': { label: 'NVMe SSD', readMBs: 3500 },
  'sata_ssd': { label: 'SATA SSD', readMBs: 550 },
  'hdd': { label: 'HDD (7200rpm)', readMBs: 120 },
};

const PCIE_VERSIONS = {
  '3.0': { label: 'PCIe 3.0 x16', bandwidthGBs: 16 },
  '4.0': { label: 'PCIe 4.0 x16', bandwidthGBs: 32 },
  '5.0': { label: 'PCIe 5.0 x16', bandwidthGBs: 64 },
};

const PRECISION_BYTES = { FP32: 4, FP16: 2, BF16: 2, INT8: 1 };

/* ═══════════════════════════════════════════
   Calculation Functions
   ═══════════════════════════════════════════ */

function calculateMemory(params, precision, batchSize, isTraining, activationFactor) {
  const bytesPerParam = PRECISION_BYTES[precision] || 4;
  const modelMem = params * bytesPerParam;
  let gradientMem = 0, optimizerMem = 0;
  if (isTraining) {
    gradientMem = params * bytesPerParam;
    optimizerMem = params * 4 * 2;
  }
  const activationMem = activationFactor * batchSize * 1024 * 1024 * (bytesPerParam / 4);
  const totalBytes = modelMem + gradientMem + optimizerMem + activationMem;
  return {
    model: modelMem / (1024 ** 3),
    gradient: gradientMem / (1024 ** 3),
    optimizer: optimizerMem / (1024 ** 3),
    activation: activationMem / (1024 ** 3),
    total: totalBytes / (1024 ** 3),
  };
}

function getGpuComputeTime(params, batchSize, isTraining, gpu, precision) {
  const flopsMultiplier = isTraining ? 6 : 2;
  const flopsPerStep = flopsMultiplier * params * batchSize;
  let tflops;
  if (precision === 'INT8') tflops = gpu.int8;
  else if (precision === 'FP16' || precision === 'BF16') tflops = gpu.fp16;
  else tflops = gpu.fp32;
  const isDatacenter = ['A100', 'A10', 'A30', 'A40', 'L4', 'L40', 'H100', 'H200', 'B100', 'B200', 'GB200', 'MI2', 'MI3', 'Gaudi', 'TPU', 'Trainium', 'Inferentia', 'Ascend', 'Cerebras', 'CS-2'].some(k => gpu.name.includes(k));
  const utilization = isDatacenter ? 0.45 : 0.35;
  return flopsPerStep / (tflops * utilization * 1e12);
}

/**
 * Full system bottleneck analysis.
 * Returns time per step broken down by bottleneck source.
 */
function analyzeBottlenecks(params, batchSize, isTraining, gpu, precision, sys) {
  // 1. GPU Compute time per step
  const gpuTime = getGpuComputeTime(params, batchSize, isTraining, gpu, precision);

  // 2. Data loading time per step
  //    Assume average sample size (image ~100KB for vision, ~1KB for NLP)
  //    Use per-worker throughput: ~200 samples/sec per CPU core (with augmentation)
  const sampleSizeKB = 100; // ~100KB average (compressed image)
  const dataPerStep = batchSize * sampleSizeKB / 1024; // MB per step
  const storageTime = dataPerStep / sys.storageReadMBs;
  const cpuWorkers = Math.max(1, Math.min(sys.cpuCores, 8)); // DataLoader workers capped at 8
  const cpuProcessingTime = batchSize / (cpuWorkers * 200); // ~200 samples/sec/worker
  const dataLoadTime = Math.max(storageTime, cpuProcessingTime);

  // 3. Host-to-GPU transfer time (PCIe)
  const bytesPerParam = PRECISION_BYTES[precision] || 4;
  const batchDataGB = (batchSize * sampleSizeKB * 1024) / (1024 ** 3);
  const pcieTime = batchDataGB / sys.pcieBandwidthGBs;

  // 4. RAM bottleneck (swap penalty)
  //    If RAM < model size + working set, there's significant overhead
  const modelSizeGB = (params * bytesPerParam) / (1024 ** 3);
  const workingSetGB = modelSizeGB * (isTraining ? 4 : 1.5) + 2; // model + gradients + overhead + OS
  const ramOk = sys.ramGB >= workingSetGB;
  const ramPenalty = ramOk ? 1.0 : Math.min(5.0, workingSetGB / Math.max(sys.ramGB, 1)); // up to 5x slower

  // The actual step time is max(GPU compute, data loading) * ram penalty
  // because GPU compute and data loading can overlap (prefetching)
  // but if either is slow, it becomes the bottleneck
  const effectiveStepTime = Math.max(gpuTime, dataLoadTime + pcieTime) * ramPenalty;

  // Determine the primary bottleneck
  let bottleneck = 'gpu';
  if (dataLoadTime > gpuTime && dataLoadTime > pcieTime) bottleneck = 'data';
  else if (pcieTime > gpuTime) bottleneck = 'pcie';
  if (!ramOk) bottleneck = 'ram';

  return {
    gpuTime,
    dataLoadTime,
    pcieTime,
    ramPenalty,
    ramOk,
    workingSetGB,
    effectiveStepTime,
    bottleneck,
  };
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}hr`;
  return `${(seconds / 86400).toFixed(1)}d`;
}

function formatGB(gb) {
  if (gb < 0.01) return `${(gb * 1024).toFixed(1)} MB`;
  return `${gb.toFixed(2)} GB`;
}

function formatParams(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

const BOTTLENECK_LABELS = {
  gpu: { icon: '🎮', label: 'GPU Compute', color: 'var(--accent)' },
  data: { icon: '💾', label: 'Data Loading', color: 'var(--warning)' },
  pcie: { icon: '🔌', label: 'PCIe Transfer', color: '#e879f9' },
  ram: { icon: '🧠', label: 'RAM Shortage', color: 'var(--error)' },
};

/* ═══════════════════════════════════════════
   Render
   ═══════════════════════════════════════════ */
export function renderGpuMemory(container) {
  let selectedPreset = 1;
  let customParams = 25600000;
  let precision = 'FP32';
  let batchSize = 32;
  let isTraining = true;
  let datasetSize = 50000;
  let epochs = 10;

  // System environment
  let cpuCores = 8;
  let ramGB = 32;
  let storageType = 'nvme';
  let pcieVersion = '4.0';

  // Filter state
  let searchQuery = '';
  let vendorFilter = 'all';
  let showAll = false;

  function getParams() { return selectedPreset === 0 ? customParams : MODEL_PRESETS[selectedPreset].params; }
  function getActivation() { return selectedPreset === 0 ? 100 : MODEL_PRESETS[selectedPreset].activationFactor; }

  function getSysConfig() {
    return {
      cpuCores,
      ramGB,
      storageReadMBs: STORAGE_TYPES[storageType].readMBs,
      pcieBandwidthGBs: PCIE_VERSIONS[pcieVersion].bandwidthGBs,
    };
  }

  function render() {
    const params = getParams();
    const mem = calculateMemory(params, precision, batchSize, isTraining, getActivation());
    const sys = getSysConfig();

    // Compute GPU results with full bottleneck analysis
    const gpuResults = GPU_LIST.map(gpu => {
      const usage = mem.total / gpu.vram;
      const canRun = usage <= 1.0;
      const analysis = analyzeBottlenecks(params, batchSize, isTraining, gpu, precision, sys);
      const stepsPerEpoch = Math.ceil(datasetSize / batchSize);
      const secPerEpoch = analysis.effectiveStepTime * stepsPerEpoch;
      const totalSec = secPerEpoch * epochs;
      return { gpu, usage, canRun, analysis, secPerEpoch, totalSec };
    });

    gpuResults.sort((a, b) => {
      if (a.canRun !== b.canRun) return a.canRun ? -1 : 1;
      const timeDiff = a.totalSec - b.totalSec;
      if (Math.abs(timeDiff) > 0.01) return timeDiff;
      return a.analysis.gpuTime - b.analysis.gpuTime;
    });

    let filtered = gpuResults;
    if (vendorFilter !== 'all') filtered = filtered.filter(r => r.gpu.vendor === vendorFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => r.gpu.name.toLowerCase().includes(q));
    }

    const displayResults = showAll ? filtered : filtered.slice(0, 10);
    const hiddenCount = filtered.length - displayResults.length;

    container.innerHTML = `
      <div class="tool-page">
        <div class="tool-header">
          <div class="tool-header__breadcrumb"><a href="#/">Home</a> <span>›</span> <span>GPU Memory Calculator</span></div>
          <h1 class="tool-header__title">🎮 GPU Memory Calculator</h1>
          <p class="tool-header__desc">Estimate VRAM usage and training time based on model parameters and system environment.</p>
        </div>

        <!-- Model Settings -->
        <div class="panel">
          <div class="panel__title">🤖 Model Settings</div>
          <div class="form-row">
            <div class="form-group" style="flex:2;">
              <label class="form-label">Model Preset</label>
              <select class="form-select" id="preset-select">
                ${MODEL_PRESETS.map((p, i) => `<option value="${i}" ${i === selectedPreset ? 'selected' : ''}>${p.name}${p.params ? ` (${formatParams(p.params)})` : ''}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label class="form-label">Parameters</label><input class="form-input" type="number" id="param-input" value="${params}" min="1" ${selectedPreset !== 0 ? 'disabled style="opacity:0.5"' : ''} /></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Precision</label>
              <select class="form-select" id="precision-select">${Object.keys(PRECISION_BYTES).map(p => `<option value="${p}" ${p === precision ? 'selected' : ''}>${p} (${PRECISION_BYTES[p]}B)</option>`).join('')}</select>
            </div>
            <div class="form-group"><label class="form-label">Batch Size</label><input class="form-input" type="number" id="batch-input" value="${batchSize}" min="1" /></div>
            <div class="form-group"><label class="form-label">Mode</label>
              <select class="form-select" id="mode-select">
                <option value="train" ${isTraining ? 'selected' : ''}>Training</option>
                <option value="infer" ${!isTraining ? 'selected' : ''}>Inference</option>
              </select>
            </div>
            ${isTraining ? `
              <div class="form-group"><label class="form-label">Dataset Size</label><input class="form-input" type="number" id="dataset-input" value="${datasetSize}" min="1" /></div>
              <div class="form-group"><label class="form-label">Epochs</label><input class="form-input" type="number" id="epoch-input" value="${epochs}" min="1" /></div>
            ` : ''}
          </div>
        </div>

        <!-- System Environment -->
        <div class="panel" style="border:1px solid var(--accent);background:linear-gradient(135deg, rgba(79,70,229,0.03), rgba(8,145,178,0.03));">
          <div class="panel__title">🖥️ System Environment</div>
          <p style="font-size:var(--text-xs);color:var(--text-muted);margin:-8px 0 12px;">Enter your system specs to analyze bottlenecks from CPU, RAM, storage, and PCIe bandwidth.</p>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">CPU Cores</label>
              <input class="form-input" type="number" id="cpu-cores" value="${cpuCores}" min="1" max="256" />
            </div>
            <div class="form-group">
              <label class="form-label">System RAM (GB)</label>
              <input class="form-input" type="number" id="ram-gb" value="${ramGB}" min="1" />
            </div>
            <div class="form-group">
              <label class="form-label">Storage</label>
              <select class="form-select" id="storage-type">
                ${Object.entries(STORAGE_TYPES).map(([k, v]) => `<option value="${k}" ${k === storageType ? 'selected' : ''}>${v.label} (~${v.readMBs}MB/s)</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">PCIe Version</label>
              <select class="form-select" id="pcie-version">
                ${Object.entries(PCIE_VERSIONS).map(([k, v]) => `<option value="${k}" ${k === pcieVersion ? 'selected' : ''}>${v.label} (~${v.bandwidthGBs}GB/s)</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <!-- Memory Breakdown -->
        <div class="panel">
          <div class="panel__title">📊 Memory Breakdown</div>
          <table class="data-table">
            <thead><tr><th>Component</th><th>Memory</th><th>Ratio</th></tr></thead>
            <tbody>
              <tr><td>🔷 Model Parameters</td><td><strong>${formatGB(mem.model)}</strong></td><td>${mem.total > 0 ? (mem.model / mem.total * 100).toFixed(1) : 0}%</td></tr>
              ${isTraining ? `
                <tr><td>🔶 Gradient</td><td><strong>${formatGB(mem.gradient)}</strong></td><td>${(mem.gradient / mem.total * 100).toFixed(1)}%</td></tr>
                <tr><td>🟢 Optimizer (Adam)</td><td><strong>${formatGB(mem.optimizer)}</strong></td><td>${(mem.optimizer / mem.total * 100).toFixed(1)}%</td></tr>
              ` : ''}
              <tr><td>🟣 Activations (est.)</td><td><strong>${formatGB(mem.activation)}</strong></td><td>${mem.total > 0 ? (mem.activation / mem.total * 100).toFixed(1) : 0}%</td></tr>
              <tr style="background:var(--bg-secondary);font-weight:700;">
                <td>📦 Total Required VRAM</td>
                <td><strong style="font-size:var(--text-lg);color:var(--accent);">${formatGB(mem.total)}</strong></td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- GPU Comparison -->
        <div class="panel">
          <div class="panel__title" style="margin-bottom:var(--space-md);">
            ⚡ GPU Compatibility ${isTraining ? '& Est. Training Time' : ''}
            <span style="margin-left:auto;font-size:var(--text-xs);font-weight:400;color:var(--text-muted);">${GPU_LIST.length} GPUs | Showing ${displayResults.length}</span>
          </div>

          <!-- Search & Filter -->
          <div style="display:flex;gap:8px;margin-bottom:var(--space-md);flex-wrap:wrap;align-items:center;">
            <div style="flex:1;min-width:180px;">
              <input class="form-input" type="text" id="gpu-search" placeholder="🔍 Search GPUs (e.g. 4090, MI300, M4...)" value="${searchQuery}" style="width:100%;" />
            </div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              <button class="category-tab ${vendorFilter === 'all' ? 'category-tab--active' : ''}" data-vendor="all" style="padding:4px 14px;font-size:12px;">All</button>
              ${Object.entries(VENDOR_INFO).map(([k, v]) => `
                <button class="category-tab ${vendorFilter === k ? 'category-tab--active' : ''}" data-vendor="${k}" style="padding:4px 14px;font-size:12px;">
                  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${v.color};margin-right:4px;"></span>${v.label}
                </button>
              `).join('')}
            </div>
          </div>

          ${displayResults.length === 0 ? `<div style="text-align:center;padding:var(--space-xl);color:var(--text-muted);">No results found.</div>` : ''}

          ${displayResults.map((r, idx) => {
      const { gpu, usage, canRun, analysis, secPerEpoch, totalSec } = r;
      const percent = Math.min(usage * 100, 100);
      const status = usage <= 0.7 ? 'ok' : usage <= 1.0 ? 'warn' : 'danger';
      const label = canRun ? '✅ OK' : '❌ Insufficient';
      const vi = VENDOR_INFO[gpu.vendor];
      const rank = idx + 1;
      const bn = BOTTLENECK_LABELS[analysis.bottleneck];

      return `
              <div class="gpu-bar-container" style="padding:10px;border-radius:var(--radius-md);margin-bottom:6px;background:${idx < 3 && !searchQuery && vendorFilter === 'all' && !showAll ? 'var(--accent-light)' : 'transparent'};">
                <div class="gpu-bar-label">
                  <span>
                    ${!showAll && !searchQuery && vendorFilter === 'all' ? `<span style="font-size:var(--text-xs);font-weight:700;color:${idx < 3 ? 'var(--accent)' : 'var(--text-muted)'};margin-right:6px;">#${rank}</span>` : ''}
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${vi.color};margin-right:4px;"></span>
                    <strong>${gpu.name}</strong>
                    <span style="color:var(--text-muted);font-size:var(--text-xs);margin-left:4px;">${gpu.vram}GB · ${vi.label}</span>
                  </span>
                  <span style="font-weight:600;color:var(--${status === 'ok' ? 'success' : status === 'warn' ? 'warning' : 'error'});">
                    ${label} — ${formatGB(mem.total)} / ${gpu.vram}GB
                  </span>
                </div>
                <div class="gpu-bar-track">
                  <div class="gpu-bar-fill gpu-bar-fill--${status}" style="width:${percent}%">${percent >= 15 ? `${percent.toFixed(0)}%` : ''}</div>
                </div>
                ${isTraining && canRun ? `
                  <div style="display:flex;gap:12px;margin-top:6px;font-size:var(--text-xs);color:var(--text-muted);flex-wrap:wrap;align-items:center;">
                    <span>⏱ Step: <strong style="color:var(--text-secondary);">${formatTime(analysis.effectiveStepTime)}</strong></span>
                    <span>📦 Epoch: <strong style="color:var(--text-secondary);">${formatTime(secPerEpoch)}</strong></span>
                    <span>🏁 Total ${epochs} epochs: <strong style="color:var(--accent);">${formatTime(totalSec)}</strong></span>
                    <span style="margin-left:auto;padding:2px 8px;border-radius:var(--radius-full);font-size:10px;font-weight:600;background:${bn.color}15;color:${bn.color};border:1px solid ${bn.color}30;">
                      ${bn.icon} Bottleneck: ${bn.label}${!analysis.ramOk ? ` (${analysis.ramPenalty.toFixed(1)}x slower)` : ''}
                    </span>
                  </div>
                ` : isTraining && !canRun ? `
                  <div style="margin-top:4px;font-size:var(--text-xs);color:var(--error);">⚠ Insufficient VRAM for training</div>
                ` : ''}
              </div>
            `;
    }).join('')}

          ${hiddenCount > 0 ? `<div style="text-align:center;padding:var(--space-md);"><button class="btn btn--secondary" id="show-all-btn">Show ${hiddenCount} more GPUs ↓</button></div>` : ''}
          ${showAll && filtered.length > 10 ? `<div style="text-align:center;padding:var(--space-md);"><button class="btn btn--secondary" id="show-less-btn">Collapse ↑</button></div>` : ''}
        </div>

        <!-- Info -->
        <div class="panel" style="background:var(--accent-light);border-color:var(--accent);">
          <div class="panel__title">💡 Notes</div>
          <ul style="font-size:var(--text-sm);color:var(--text-secondary);list-style:disc;padding-left:20px;line-height:2;">
            <li>Training time = max(GPU compute, Data loading + PCIe transfer) × RAM penalty. The slowest factor becomes the bottleneck.</li>
            <li>If RAM is smaller than the model working set, swapping occurs and can slow down up to 5x.</li>
            <li>Data loading depends on CPU workers (up to 8) and storage speed.</li>
            <li>Apple Silicon uses Unified Memory, so there's no CPU↔GPU transfer bottleneck.</li>
            <li>Actual performance varies depending on framework, data augmentation complexity, network communication, etc.</li>
          </ul>
        </div>
      </div>
    `;

    // ── Event Handlers ──
    let debounceTimer = null;
    const debouncedRender = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(render, 400); };
    const bind = (id, evt, fn) => { const el = container.querySelector(id); if (el) el.addEventListener(evt, fn); };
    const bindNum = (id, setter) => {
      bind(id, 'input', e => { setter(e.target.value); debouncedRender(); });
      bind(id, 'change', e => { setter(e.target.value); clearTimeout(debounceTimer); render(); });
    };

    bind('#preset-select', 'change', e => { selectedPreset = parseInt(e.target.value); render(); });
    bindNum('#param-input', v => { customParams = parseInt(v) || 0; });
    bind('#precision-select', 'change', e => { precision = e.target.value; render(); });
    bindNum('#batch-input', v => { batchSize = parseInt(v) || 1; });
    bind('#mode-select', 'change', e => { isTraining = e.target.value === 'train'; render(); });
    bindNum('#dataset-input', v => { datasetSize = parseInt(v) || 1; });
    bindNum('#epoch-input', v => { epochs = parseInt(v) || 1; });

    // System env
    bindNum('#cpu-cores', v => { cpuCores = parseInt(v) || 1; });
    bindNum('#ram-gb', v => { ramGB = parseInt(v) || 1; });
    bind('#storage-type', 'change', e => { storageType = e.target.value; render(); });
    bind('#pcie-version', 'change', e => { pcieVersion = e.target.value; render(); });

    // GPU search (restore focus after render)
    bind('#gpu-search', 'input', e => {
      searchQuery = e.target.value; showAll = false;
      clearTimeout(debounceTimer); debounceTimer = setTimeout(() => {
        render();
        const inp = container.querySelector('#gpu-search');
        if (inp) { inp.focus(); inp.setSelectionRange(searchQuery.length, searchQuery.length); }
      }, 300);
    });

    container.querySelectorAll('[data-vendor]').forEach(btn => {
      btn.addEventListener('click', () => { vendorFilter = btn.dataset.vendor; showAll = false; render(); });
    });

    bind('#show-all-btn', 'click', () => { showAll = true; render(); });
    bind('#show-less-btn', 'click', () => { showAll = false; render(); });
  }

  render();
}
