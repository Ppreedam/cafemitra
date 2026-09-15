// Main-thread orchestration for the "Clean Scan" filter. All the actual pixel
// work happens inside cleanScanWorker.ts (a Web Worker running OpenCV.js), so
// nothing in this file ever touches raw pixels on the UI thread - that is
// what keeps button clicks / scrolling responsive even on a 200+ page PDF.

export type CleanScanProgress = { processed: number; total: number; loadingEngine?: boolean };

type PendingTask = {
  id: number;
  resolve: (canvas: HTMLCanvasElement) => void;
  reject: (error: unknown) => void;
};

type QueuedTask = PendingTask & { canvas: HTMLCanvasElement };

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return isIosDevice() || /Android|Mobi/i.test(navigator.userAgent || "");
}

// Every worker loads its own ~10MB OpenCV.js WASM heap, so pool size is a
// memory/parallelism trade-off, not just a CPU-core one - keep it small on
// phones (iOS Safari's WASM memory limits are the tightest of all).
function getPoolSize() {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 2 : 2;
  if (isIosDevice()) return 1;
  if (isMobileDevice()) return Math.min(2, cores);
  return Math.min(4, Math.max(2, cores - 1));
}

class CleanScanPool {
  private workers: Worker[] = [];
  private idleWorkers: Worker[] = [];
  private queue: QueuedTask[] = [];
  private pending = new Map<number, PendingTask>();
  private nextId = 0;
  private cancelled = false;

  onLoadingEngine: (() => void) | null = null;

  constructor(size: number = getPoolSize()) {
    for (let i = 0; i < size; i += 1) {
      // Classic (not "module") worker: OpenCV.js is loaded inside it via the
      // browser's native importScripts(), which module workers don't have.
      const worker = new Worker(new URL("./cleanScanWorker.ts", import.meta.url));
      worker.onmessage = (event) => this.handleMessage(worker, event);
      worker.onerror = (event) => this.handleWorkerError(worker, event);
      this.workers.push(worker);
      this.idleWorkers.push(worker);
    }
  }

  processCanvas(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> {
    if (this.cancelled) return Promise.reject(new DOMException("Cancelled", "AbortError"));
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.queue.push({ id, canvas, resolve, reject });
      this.dispatch();
    });
  }

  cancel() {
    this.cancelled = true;
    const queued = this.queue.splice(0, this.queue.length);
    queued.forEach((task) => task.reject(new DOMException("Cancelled", "AbortError")));
    const pending = Array.from(this.pending.values());
    this.pending.clear();
    pending.forEach((task) => task.reject(new DOMException("Cancelled", "AbortError")));
  }

  destroy() {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.idleWorkers = [];
  }

  private dispatch() {
    if (this.cancelled) return;
    while (this.idleWorkers.length && this.queue.length) {
      const worker = this.idleWorkers.shift();
      const task = this.queue.shift();
      if (!worker || !task) break;

      const { canvas, id, resolve, reject } = task;
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas not supported"));
        this.idleWorkers.push(worker);
        continue;
      }

      this.pending.set(id, { id, resolve, reject });
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const buffer = imageData.data.buffer;
      worker.postMessage({ type: "process", id, width: canvas.width, height: canvas.height, buffer }, [buffer]);
    }
  }

  private handleMessage(worker: Worker, event: MessageEvent) {
    const { id, type } = event.data || {};
    if (type === "status") {
      if (event.data?.phase === "loading") this.onLoadingEngine?.();
      return;
    }
    const task = this.pending.get(id);
    this.pending.delete(id);
    this.idleWorkers.push(worker);

    if (task) {
      if (type === "result") {
        const { width, height, buffer } = event.data;
        const outCanvas = document.createElement("canvas");
        outCanvas.width = width;
        outCanvas.height = height;
        const outContext = outCanvas.getContext("2d");
        if (!outContext) {
          task.reject(new Error("Canvas not supported"));
        } else {
          outContext.putImageData(new ImageData(new Uint8ClampedArray(buffer), width, height), 0, 0);
          task.resolve(outCanvas);
        }
      } else {
        task.reject(new Error(event.data?.message || "Clean scan failed"));
      }
    }
    this.dispatch();
  }

  private handleWorkerError(worker: Worker, event: ErrorEvent) {
    // A worker crashing (e.g. WASM OOM on a low-end phone) shouldn't take the
    // whole batch down silently - fail whatever task it was holding and keep
    // the remaining workers going.
    this.pending.forEach((task) => {
      task.reject(new Error(event.message || "Clean scan worker crashed"));
    });
    this.pending.clear();
    this.workers = this.workers.filter((w) => w !== worker);
  }
}

async function imageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = objectUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not supported");
    context.drawImage(image, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not encode image"))), type, quality);
  });
}

// pdf.js viewport scale=1 is 72 DPI (points); render a bit above typical
// print DPI for the filter's adaptive-threshold step without going so high
// that a 500-page PDF blows past a phone's memory budget.
const RENDER_DPI = 180;

export async function applyCleanScanToFile(
  file: File,
  options: { onProgress?: (progress: CleanScanProgress) => void; signal?: AbortSignal } = {}
): Promise<File> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  const pool = new CleanScanPool();
  // OpenCV.js's script load + WASM init is a one-time (well under a second in
  // practice, but device-dependent) cost per worker - surface it as its own
  // progress state so the UI says "loading" instead of showing zero progress
  // for a moment on a slower device.
  pool.onLoadingEngine = () => options.onProgress?.({ processed: 0, total: isPdf ? 0 : 1, loadingEngine: true });
  const throwIfCancelled = () => {
    if (options.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
  };
  // Without this, clicking Cancel only stopped the *next* batch (PDFs) and
  // did nothing at all for a single image - the in-flight worker task had no
  // way to be told to give up.
  const onAbort = () => pool.cancel();
  options.signal?.addEventListener("abort", onAbort);

  try {
    if (!isPdf) {
      options.onProgress?.({ processed: 0, total: 1 });
      const canvas = await imageFileToCanvas(file);
      const outCanvas = await withStallTimeout(pool.processCanvas(canvas), 30000);
      options.onProgress?.({ processed: 1, total: 1 });
      const blob = await canvasToBlob(outCanvas, "image/jpeg", 0.92);
      const cleanName = file.name.replace(/\.[^.]+$/, "") + "-clean.jpg";
      return new File([blob], cleanName, { type: "image/jpeg" });
    }

    const [pdfjs, { PDFDocument }] = await Promise.all([import("pdfjs-dist"), import("pdf-lib")]);
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

    const sourceBytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data: sourceBytes }).promise;
    const totalPages = pdf.numPages;
    const outDoc = await PDFDocument.create();

    // Process a small, bounded batch of pages at a time (matching the worker
    // pool size) instead of rendering all pages up front - this is what
    // keeps peak memory flat whether the PDF is 5 pages or 500.
    const batchSize = getPoolSize();
    let processed = 0;
    options.onProgress?.({ processed: 0, total: totalPages });

    for (let start = 1; start <= totalPages; start += batchSize) {
      throwIfCancelled();
      const pageNumbers: number[] = [];
      for (let n = start; n < start + batchSize && n <= totalPages; n += 1) pageNumbers.push(n);

      const renderedCanvases = await Promise.all(
        pageNumbers.map(async (pageNumber) => {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: RENDER_DPI / 72 });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas not supported");
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          return canvas;
        })
      );

      for (const renderedCanvas of renderedCanvases) {
        throwIfCancelled();
        const outCanvas = await withStallTimeout(pool.processCanvas(renderedCanvas), 30000);
        const pngBytes = await canvasToBlob(outCanvas, "image/png").then((blob) => blob.arrayBuffer());
        const image = await outDoc.embedPng(new Uint8Array(pngBytes));
        const pdfPage = outDoc.addPage([image.width, image.height]);
        pdfPage.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        processed += 1;
        options.onProgress?.({ processed, total: totalPages });
      }

      // Yield back to the event loop between batches so the progress bar /
      // cancel button stay clickable even during a very long run.
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const outBytes = await outDoc.save();
    const blob = new Blob([outBytes], { type: "application/pdf" });
    const cleanName = file.name.replace(/\.pdf$/i, "") + "-clean.pdf";
    return new File([blob], cleanName, { type: "application/pdf" });
  } finally {
    options.signal?.removeEventListener("abort", onAbort);
    pool.cancel();
    pool.destroy();
  }
}

// In practice OpenCV.js's WASM init (~10MB, embedded as a data: URI so it
// can't use WebAssembly.compileStreaming) finishes in well under a second,
// but this is a safety net: if a worker crashes silently or something else
// genuinely breaks, this turns what would be an infinite hang into a clear,
// catchable error instead.
function withStallTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Clean scan timed out - please try again.")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
