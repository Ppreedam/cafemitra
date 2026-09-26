// Main-thread side of the card scanner (see cardScanWorker.ts): turns an ID
// card photo into a straight, card-sized, cleaned image.
import type { CropQuad } from "../CropEditor";
import type { ScanMode } from "./cardScanWorker";

export type { ScanMode };
export type ScanResult = { found: false } | { found: true; detected: boolean; quad: CropQuad; blob: Blob };

// CR80 card at ~530 dpi - sharp on any printer, still light enough to preview.
const OUT_WIDTH = 1800;
const OUT_HEIGHT = Math.round(OUT_WIDTH / (85.6 / 53.98));
// Phone photos are downsized before the warp; 3200px keeps plenty of detail.
const MAX_SOURCE_SIDE = 3200;

type Pending = { resolve: (value: ScanResult) => void; reject: (reason: unknown) => void };

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, Pending>();
let engineListener: (() => void) | null = null;

// Called once when the ~10MB OpenCV engine starts downloading.
export function onScannerEngineLoading(listener: (() => void) | null) {
  engineListener = listener;
}

function getWorker() {
  if (!worker) {
    // Classic (not "module") worker so it can importScripts() OpenCV.js.
    worker = new Worker(new URL("./cardScanWorker.ts", import.meta.url));
    worker.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === "status") {
        if (data.phase === "loading") engineListener?.();
        return;
      }
      const task = pending.get(data.id);
      if (!task) return;
      pending.delete(data.id);
      if (data.type === "error") {
        task.reject(new Error(data.message || "Card scan failed"));
        return;
      }
      if (!data.found) {
        task.resolve({ found: false });
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = data.width;
      canvas.height = data.height;
      canvas.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(data.buffer), data.width, data.height), 0, 0);
      const q: number[] = data.quad;
      const quad = [0, 1, 2, 3].map((i) => ({ x: q[i * 2], y: q[i * 2 + 1] })) as CropQuad;
      canvas.toBlob(
        (blob) => (blob ? task.resolve({ found: true, detected: data.detected, quad, blob }) : task.reject(new Error("Could not encode the card image"))),
        "image/jpeg",
        0.95,
      );
    };
    worker.onerror = (event) => {
      const error = new Error(event.message || "Card scanner crashed");
      pending.forEach((task) => task.reject(error));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  }
  return worker;
}

async function loadPixels(source: Blob) {
  // from-image applies the EXIF rotation phones store in their JPEGs.
  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  const k = Math.min(1, MAX_SOURCE_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

// quad = null finds the card automatically; a quad (percent of the image,
// TL/TR/BR/BL) uses those corners instead, e.g. after a manual adjustment.
export function scanCard(source: Blob, mode: ScanMode, quad: CropQuad | null = null): Promise<ScanResult> {
  return runScan(source, mode, quad, "card");
}

// A photo of a document page, cleaned for printing (the whole photo - no
// automatic crop). Always resolves found: true. A quad (percent of the
// image) straightens that area first.
// darkness (black & white only): 0 light .. 100 dark, default 25.
export function scanDocument(source: Blob, mode: ScanMode = "clean", quad: CropQuad | null = null, darkness?: number): Promise<ScanResult> {
  return runScan(source, mode, quad, "document", darkness);
}

async function runScan(source: Blob, mode: ScanMode, quad: CropQuad | null, kind: "card" | "document", darkness?: number): Promise<ScanResult> {
  const pixels = await loadPixels(source);
  const w = getWorker();
  const id = nextId++;
  return new Promise<ScanResult>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    const buffer = pixels.data.buffer;
    w.postMessage(
      {
        type: "scan",
        id,
        width: pixels.width,
        height: pixels.height,
        buffer,
        quad: quad ? quad.flatMap((p) => [p.x, p.y]) : null,
        mode,
        kind,
        darkness,
        outWidth: OUT_WIDTH,
        outHeight: OUT_HEIGHT,
      },
      [buffer],
    );
  });
}
