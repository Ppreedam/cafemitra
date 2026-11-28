// "Make the file smaller" for scanned / photo PDFs: every page is drawn at a lower resolution and
// saved again as a JPEG page. Text stops being selectable, so callers should only keep the result
// when it is clearly smaller (a text PDF usually gets bigger this way). Browser only.
import { PDFDocument } from "pdf-lib";

export type CompressOptions = {
  /** Resolution the pages are redrawn at (150 is fine for print, 110 is small but softer). */
  dpi: number;
  /** JPEG quality, 0 to 1. */
  quality: number;
  onProgress?: (done: number, total: number) => void;
};

export async function compressPdfByRaster(bytes: Uint8Array, options: CompressOptions): Promise<Uint8Array> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();
  // pdf.js hands the buffer to its worker, so give it a copy and keep the original usable.
  const task = pdfjs.getDocument({ data: bytes.slice() });
  const pdf = await task.promise;
  const out = await PDFDocument.create();

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(options.dpi / 72, 3200 / Math.max(base.width, base.height));
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not available in this browser.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: context, viewport }).promise;

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", options.quality));
      if (!blob) throw new Error("Could not compress a page.");
      const image = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
      out.addPage([base.width, base.height]).drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });

      page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
      options.onProgress?.(pageNumber, pdf.numPages);
    }
  } finally {
    await task.destroy();
  }

  return out.save();
}
