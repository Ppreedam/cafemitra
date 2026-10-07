import { runAgentPrintFile, type PrintFileResult } from "./printpilot-agent";

// Turns a tool's print-ready HTML (the same document its browser print
// window used) or PDF into a PDF and sends it to the PrintPilot desktop agent,
// which prints it with the chosen print profile - no new tab, no browser
// print dialog.

const MM_PER_INCH = 25.4;
const CSS_PX_PER_INCH = 96;
const TARGET_DPI = 300;
const MAX_CANVAS_SIDE = 7000;

const NAMED_PAGE_SIZES_MM: Record<string, [number, number]> = {
  a3: [297, 420],
  a4: [210, 297],
  a5: [148, 210],
  a6: [105, 148],
  b5: [176, 250],
  letter: [215.9, 279.4],
  legal: [215.9, 355.6],
};

function lengthToMm(value: string): number | null {
  const match = value.trim().match(/^([\d.]+)\s*(mm|cm|in|px)$/i);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "mm") return amount;
  if (unit === "cm") return amount * 10;
  if (unit === "in") return amount * MM_PER_INCH;
  return (amount * MM_PER_INCH) / CSS_PX_PER_INCH;
}

/** Page size from the document's `@page { size: ... }` rule, in mm. */
function pageSizeFromCss(html: string): [number, number] | null {
  const rule = html.match(/@page\s*\{[^}]*?size\s*:\s*([^;}]+)/i);
  if (!rule) return null;
  const parts = rule[1].trim().toLowerCase().split(/\s+/);
  const named = NAMED_PAGE_SIZES_MM[parts[0]];
  if (named) return parts.includes("landscape") ? [named[1], named[0]] : named;
  if (parts.length >= 2) {
    const width = lengthToMm(parts[0]);
    const height = lengthToMm(parts[1]);
    if (width && height) return [width, height];
  }
  return null;
}

async function waitForAssets(doc: Document) {
  const images = Array.from(doc.images);
  await Promise.all(
    images.map((image) =>
      image.complete && image.naturalWidth
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  );
  await doc.fonts?.ready.catch(() => undefined);
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Images from another origin (e.g. the API server's media URLs) would taint
// the canvas and block export, so they are inlined as data URLs first.
async function inlineRemoteImages(html: string) {
  const urls = Array.from(new Set(Array.from(html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+|\/[^"]+)"/gi), (match) => match[1])));
  let result = html;
  for (const url of urls) {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) continue;
      const dataUrl = await blobToDataUrl(await response.blob());
      result = result.split(`"${url}"`).join(`"${dataUrl}"`);
    } catch {
      // Left as-is; html2canvas still tries it with CORS.
    }
  }
  return result;
}

/** Renders print HTML (one `.page` / `.card-page` element per sheet) to PDF bytes. */
export async function htmlToPdfBytes(html: string): Promise<Uint8Array> {
  const [{ default: html2canvas }, { PDFDocument }] = await Promise.all([import("html2canvas"), import("pdf-lib")]);
  // The documents auto-run window.print() on load - not wanted here.
  const cleanHtml = await inlineRemoteImages(html.replace(/<script[\s\S]*?<\/script>/gi, ""));
  const cssPageSize = pageSizeFromCss(html);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, { position: "fixed", left: "-20000px", top: "0", width: "1600px", height: "1200px", border: "0" });
  document.body.appendChild(iframe);
  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = cleanHtml;
    });
    const doc = iframe.contentDocument;
    if (!doc) throw new Error("Could not prepare the page for printing.");
    await waitForAssets(doc);

    const pageElements = Array.from(doc.querySelectorAll<HTMLElement>(".page, .card-page"));
    const targets = pageElements.length ? pageElements : [doc.body];

    const pdf = await PDFDocument.create();
    for (const element of targets) {
      const rect = element.getBoundingClientRect();
      const widthPx = Math.max(rect.width, 1);
      const heightPx = Math.max(rect.height, 1);
      const scale = Math.min(TARGET_DPI / CSS_PX_PER_INCH, MAX_CANVAS_SIDE / Math.max(widthPx, heightPx));
      const canvas = await html2canvas(element, { scale, backgroundColor: "#ffffff", useCORS: true, logging: false });
      const jpeg = await pdf.embedJpg(canvas.toDataURL("image/jpeg", 0.95));

      const [widthMm, heightMm] = cssPageSize ?? [(widthPx * MM_PER_INCH) / CSS_PX_PER_INCH, (heightPx * MM_PER_INCH) / CSS_PX_PER_INCH];
      const page = pdf.addPage([(widthMm / MM_PER_INCH) * 72, (heightMm / MM_PER_INCH) * 72]);
      page.drawImage(jpeg, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
    }
    return await pdf.save();
  } finally {
    iframe.remove();
  }
}

/** Already-rendered page canvases (e.g. a tool's own 300 DPI export) to PDF bytes. */
export async function canvasesToPdfBytes(pages: { canvas: HTMLCanvasElement; widthMm: number; heightMm: number }[]): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  for (const { canvas, widthMm, heightMm } of pages) {
    const image = await pdf.embedPng(canvas.toDataURL("image/png"));
    const page = pdf.addPage([(widthMm / MM_PER_INCH) * 72, (heightMm / MM_PER_INCH) * 72]);
    page.drawImage(image, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
  }
  return pdf.save();
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(index, index + chunk)));
  }
  return btoa(binary);
}

export type AgentPdfSource = Uint8Array | ArrayBuffer | Blob;

/** Prints with `profile`, or - without one - on `printer` with its driver defaults. */
export async function sendPdfToAgent(
  source: AgentPdfSource,
  options: { profile?: string; printer?: string; fileName: string; copies?: number },
): Promise<PrintFileResult> {
  const bytes = source instanceof Uint8Array ? source : new Uint8Array(source instanceof Blob ? await source.arrayBuffer() : source);
  return runAgentPrintFile({
    profile: options.profile,
    printer: options.printer,
    fileName: options.fileName,
    pdfBase64: bytesToBase64(bytes),
    copies: options.copies ?? 1,
  });
}
