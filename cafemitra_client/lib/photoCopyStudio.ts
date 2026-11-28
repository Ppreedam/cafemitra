// Engine of the Photo Copy studio: pages from PDFs and images, per-page rotate / look edits,
// drawing a page to a canvas (for the preview and for raster output) and building the PDF
// that gets printed. Browser only (pdf.js + canvas).
import { PDFDocument, degrees } from "pdf-lib";
import type { PDFImage } from "pdf-lib";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { buildPlaygroundPdf, normalizeTurn } from "./pdfPlayground";
import type { LayoutMode, PageNumberFormat, PageNumberPosition, WatermarkColor } from "./pdfPlayground";

// ---------------------------------------------------------------- model

export type LookMode = "original" | "gray" | "bw" | "enhance";

export type Look = {
  mode: LookMode;
  /** -100 (darker) .. 100 (lighter) */
  brightness: number;
  /** -100 .. 100 */
  contrast: number;
  /** Black & white only: 0 (light, little black) .. 100 (dark, a lot of black). */
  darkness: number;
};

export const DEFAULT_LOOK: Look = { mode: "original", brightness: 0, contrast: 0, darkness: 50 };

export function isDefaultLook(look: Look) {
  return look.mode === "original" && look.brightness === 0 && look.contrast === 0;
}

export type PageBase = { kind: "pdf"; fileId: number; index: number } | { kind: "image"; blob: Blob };

export type StudioPage = {
  id: number;
  base: PageBase;
  /** The page as it was imported, for Reset. */
  original: PageBase;
  /** Turns (0/90/180/270, clockwise) on top of the page's own rotation. */
  rotate: number;
  look: Look;
  /** How many times this page goes into the output (1 = once, 3 = three copies one after another). */
  copies: number;
};

export const MAX_PAGE_COPIES = 99;

/** The pages as they will be printed: every page repeated for its own copies. */
export function expandPages(pages: StudioPage[]): StudioPage[] {
  return pages.flatMap((page) => Array.from({ length: Math.min(MAX_PAGE_COPIES, Math.max(1, page.copies)) }, () => page));
}

export type StudioFile = { id: number; name: string; bytes: Uint8Array; pdf: PDFDocumentProxy; destroy: () => void };

export type OutputSettings = {
  layout: LayoutMode;
  cellBorder: boolean;
  watermark: { text: string; opacity: number; color: WatermarkColor } | null;
  pageNumbers: { position: PageNumberPosition; format: PageNumberFormat; startAt: number } | null;
};

export const DEFAULT_OUTPUT: OutputSettings = { layout: "single", cellBorder: false, watermark: null, pageNumbers: null };

// ---------------------------------------------------------------- pdf.js

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

export function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((module) => {
      module.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
      return module;
    });
  }
  return pdfjsPromise;
}

export function isPdfFile(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function isImageFile(file: File) {
  return /^image\/(jpeg|png|webp)$/.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
}

/** Opens a PDF for rendering. Throws a readable error for locked or broken files. */
export async function openStudioPdf(file: File, id: number): Promise<{ studioFile: StudioFile; pageCount: number }> {
  const pdfjs = await loadPdfjs();
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    const task = pdfjs.getDocument({ data: bytes.slice() });
    const pdf = await task.promise;
    return { studioFile: { id, name: file.name, bytes, pdf, destroy: () => void task.destroy() }, pageCount: pdf.numPages };
  } catch (error) {
    if (error && typeof error === "object" && (error as { name?: string }).name === "PasswordException") {
      throw new Error(`${file.name} is password protected - unlock it in PDF Tools first.`);
    }
    throw new Error(`${file.name} could not be opened - it may be damaged.`);
  }
}

// ---------------------------------------------------------------- drawing a page

function newCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

async function renderBase(base: PageBase, files: Map<number, StudioFile>, maxSide: number): Promise<HTMLCanvasElement> {
  if (base.kind === "image") {
    // from-image applies the EXIF turn phones store in their JPEGs.
    const bitmap = await createImageBitmap(base.blob, { imageOrientation: "from-image" });
    const k = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = newCanvas(bitmap.width * k, bitmap.height * k);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas;
  }
  const file = files.get(base.fileId);
  if (!file) throw new Error("The file for this page is no longer loaded.");
  const page = await file.pdf.getPage(base.index + 1);
  const natural = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: maxSide / Math.max(natural.width, natural.height) });
  const canvas = newCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  page.cleanup();
  return canvas;
}

function turnCanvas(source: HTMLCanvasElement, turns: number) {
  const turn = normalizeTurn(turns);
  if (turn === 0) return source;
  const sideways = turn % 180 !== 0;
  const canvas = newCanvas(sideways ? source.height : source.width, sideways ? source.width : source.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((turn * Math.PI) / 180);
  context.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
}

function luminance(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// 1st and 99th percentile of the brightness, so a few specks cannot pin the stretch.
function levels(data: Uint8ClampedArray) {
  const histogram = new Uint32Array(256);
  const stride = 4 * 3;
  let count = 0;
  for (let i = 0; i < data.length; i += stride) {
    histogram[Math.round(luminance(data[i], data[i + 1], data[i + 2]))] += 1;
    count += 1;
  }
  let low = 0;
  let high = 255;
  for (let sum = 0; low < 255; low += 1) {
    sum += histogram[low];
    if (sum >= count * 0.01) break;
  }
  for (let sum = 0; high > 0; high -= 1) {
    sum += histogram[high];
    if (sum >= count * 0.01) break;
  }
  return { low, high: Math.max(high, low + 24) };
}

function applyLook(canvas: HTMLCanvasElement, look: Look) {
  if (isDefaultLook(look)) return;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

  const shift = look.brightness * 2.55;
  const c = look.contrast * 2.55;
  const factor = (259 * (c + 255)) / (255 * (259 - c));
  const adjust = look.brightness !== 0 || look.contrast !== 0;
  if (adjust) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] + shift - 128) + 128;
      data[i + 1] = factor * (data[i + 1] + shift - 128) + 128;
      data[i + 2] = factor * (data[i + 2] + shift - 128) + 128;
    }
  }

  if (look.mode === "gray") {
    for (let i = 0; i < data.length; i += 4) {
      const value = luminance(data[i], data[i + 1], data[i + 2]);
      data[i] = data[i + 1] = data[i + 2] = value;
    }
  } else if (look.mode === "enhance") {
    const { low, high } = levels(data);
    const gain = 255 / (high - low);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = (data[i] - low) * gain;
      data[i + 1] = (data[i + 1] - low) * gain;
      data[i + 2] = (data[i + 2] - low) * gain;
    }
  } else if (look.mode === "bw") {
    const { low, high } = levels(data);
    const gain = 255 / (high - low);
    const threshold = 60 + look.darkness * 1.4;
    for (let i = 0; i < data.length; i += 4) {
      const value = (luminance(data[i], data[i + 1], data[i + 2]) - low) * gain;
      data[i] = data[i + 1] = data[i + 2] = value < threshold ? 0 : 255;
    }
  }
  context.putImageData(image, 0, 0);
}

/** Draws a page the way it will print: rotated, and (when `look`) with its look applied. */
export async function renderStudioPage(page: StudioPage, files: Map<number, StudioFile>, options: { maxSide: number; look: boolean }) {
  const base = await renderBase(page.base, files, options.maxSide);
  const turned = turnCanvas(base, page.rotate);
  if (options.look) applyLook(turned, page.look);
  return turned;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: "image/jpeg" | "image/png", quality = 0.92) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not save the page image."))), type, quality));
}

// ---------------------------------------------------------------- building the PDF

const A4_W = 595.28;
const A4_H = 841.89;
const FIT_MARGIN = 18;

/**
 * The PDF for printing / saving. Untouched PDF pages are copied as they are (text stays sharp);
 * images, and pages with a look, are drawn to a picture first. Then the sheet layout, watermark
 * and page numbers are applied. `preview` draws the pictures small, for the on-screen sheet view.
 */
export async function buildStudioPdf(pages: StudioPage[], files: Map<number, StudioFile>, settings: OutputSettings, options: { preview?: boolean } = {}): Promise<Uint8Array> {
  if (!pages.length) throw new Error("Add a PDF or a photo first.");
  const list = expandPages(pages);
  const out = await PDFDocument.create();
  const loaded = new Map<number, PDFDocument>();
  // A picture page that is repeated is drawn and embedded once, then placed again for each copy.
  const drawn = new Map<number, { image: PDFImage; pageW: number; pageH: number; x: number; y: number; width: number; height: number }>();
  const rasterSide = options.preview ? 900 : 2800;

  for (const page of list) {
    if (page.base.kind === "pdf" && isDefaultLook(page.look)) {
      const file = files.get(page.base.fileId);
      if (!file) throw new Error("The file for a page is no longer loaded.");
      let source = loaded.get(file.id);
      if (!source) {
        source = await PDFDocument.load(file.bytes, { updateMetadata: false });
        loaded.set(file.id, source);
      }
      const [copied] = await out.copyPages(source, [page.base.index]);
      copied.setRotation(degrees(normalizeTurn(copied.getRotation().angle + page.rotate)));
      out.addPage(copied);
      continue;
    }

    let placed = drawn.get(page.id);
    if (!placed) {
      const canvas = await renderStudioPage(page, files, { maxSide: rasterSide, look: true });
      const image = await out.embedJpg(new Uint8Array(await (await canvasToBlob(canvas, "image/jpeg", 0.9)).arrayBuffer()));
      if (page.base.kind === "pdf") {
        // Keep the page's own size, so a scanned A5 stays A5.
        const file = files.get(page.base.fileId)!;
        const natural = (await file.pdf.getPage(page.base.index + 1)).getViewport({ scale: 1 });
        const sideways = normalizeTurn(page.rotate) % 180 !== 0;
        const width = sideways ? natural.height : natural.width;
        const height = sideways ? natural.width : natural.height;
        placed = { image, pageW: width, pageH: height, x: 0, y: 0, width, height };
      } else {
        // A photo goes on an A4 page (portrait or landscape to suit it), as large as fits.
        const landscape = canvas.width > canvas.height * 1.15;
        const pageW = landscape ? A4_H : A4_W;
        const pageH = landscape ? A4_W : A4_H;
        const scale = Math.min((pageW - FIT_MARGIN * 2) / canvas.width, (pageH - FIT_MARGIN * 2) / canvas.height);
        const width = canvas.width * scale;
        const height = canvas.height * scale;
        placed = { image, pageW, pageH, x: (pageW - width) / 2, y: (pageH - height) / 2, width, height };
      }
      drawn.set(page.id, placed);
    }
    out.addPage([placed.pageW, placed.pageH]).drawImage(placed.image, { x: placed.x, y: placed.y, width: placed.width, height: placed.height });
  }

  const base = await out.save();
  const plain = settings.layout === "single" && !settings.watermark?.text.trim() && !settings.pageNumbers;
  if (plain) return base;
  return buildPlaygroundPdf(base, {
    pages: list.map((_, index) => ({ source: index, rotate: 0 })),
    layout: settings.layout,
    cellBorder: settings.cellBorder,
    watermark: settings.watermark,
    pageNumbers: settings.pageNumbers,
  });
}

/** "1,3,5-7" -> [0, 2, 4, 5, 6] (0-based, in the order typed, repeats allowed). null when it makes no sense. */
export function parsePageList(input: string, pageCount: number): number[] | null {
  const parts = input.split(",").map((part) => part.trim()).filter(Boolean);
  if (!parts.length) return null;
  const result: number[] = [];
  for (const part of parts) {
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(part);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      if (from < 1 || to > pageCount || from > to) return null;
      for (let n = from; n <= to; n += 1) result.push(n - 1);
    } else if (/^\d+$/.test(part)) {
      const n = Number(part);
      if (n < 1 || n > pageCount) return null;
      result.push(n - 1);
    } else {
      return null;
    }
  }
  return result;
}
