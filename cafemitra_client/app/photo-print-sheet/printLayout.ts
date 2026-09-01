export type PaperSize = "a4" | "4x6" | "5x7" | "a5" | "letter" | "custom";

export type PaperDims = { label: string; badge: string; widthMm: number; heightMm: number };

export const PAPER_SIZES: Record<Exclude<PaperSize, "custom">, PaperDims> = {
  a4: { label: "A4 (210 x 297mm)", badge: "A4", widthMm: 210, heightMm: 297 },
  "4x6": { label: "4x6 Inch (10 x 15cm)", badge: "4x6", widthMm: 101.6, heightMm: 152.4 },
  "5x7": { label: "5x7 Inch (13 x 18cm)", badge: "5x7", widthMm: 127, heightMm: 177.8 },
  a5: { label: "A5 (148 x 210mm)", badge: "A5", widthMm: 148, heightMm: 210 },
  letter: { label: "Letter (215.9 x 279.4mm)", badge: "Letter", widthMm: 215.9, heightMm: 279.4 },
};

// Custom paper has no fixed entry in PAPER_SIZES since its dimensions come
// from the user's own W/H inputs - falls back to A4 until both are filled in
// so the preview never divides by a zero/empty size.
export function resolvePaperDims(paperSize: PaperSize, customWidthCm: number | null, customHeightCm: number | null): PaperDims {
  if (paperSize !== "custom") return PAPER_SIZES[paperSize];
  const widthMm = customWidthCm && customWidthCm > 0 ? customWidthCm * 10 : PAPER_SIZES.a4.widthMm;
  const heightMm = customHeightCm && customHeightCm > 0 ? customHeightCm * 10 : PAPER_SIZES.a4.heightMm;
  return { label: "Custom Size", badge: "Custom", widthMm, heightMm };
}

export type SizePreset = { key: string; label: string; widthCm: number; heightCm: number };

export const PHOTO_SIZE_PRESETS: SizePreset[] = [
  // "5-Pic" and "6-Pic" are the trade names Indian photo studios use for
  // these two tile sizes - named for how many land on one standard sheet,
  // not a fixed count on every paper/gap combination here.
  { key: "passport5", label: "5-Pic Passport", widthCm: 3.5, heightCm: 4.5 },
  { key: "passport6", label: "6-Pic Passport", widthCm: 3.048, heightCm: 4.064 },
  { key: "stamp", label: "Stamp", widthCm: 2, heightCm: 2.5 },
  { key: "voter", label: "Voter / PAN", widthCm: 2.5, heightCm: 3.5 },
  { key: "visa", label: "US Visa", widthCm: 5.1, heightCm: 5.1 },
  { key: "custom", label: "Custom", widthCm: 3.2, heightCm: 4.1 },
];

export const DEFAULT_GAP_MM = 2;
export const DEFAULT_MARGIN_MM = 4;
export const EXPORT_DPI = 300;

export type QueuePhoto = {
  id: string;
  file: File;
  url: string;
  widthCm: number;
  heightCm: number;
  count: number;
  sizeKey: string;
};

export type PackedTile = {
  photoId: string;
  url: string;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
};

export type MarginGapMm = { gapX: number; gapY: number; marginTop: number; marginLeft: number };

// Shelf-packs every queued photo's copies onto as many pages as needed, in
// queue order, so a shop can hand a customer their full set together instead
// of it being scattered by a size-optimizing bin packer.
export function packQueue(photos: QueuePhoto[], paper: PaperDims, gaps: MarginGapMm): { pages: PackedTile[][]; skipped: number } {
  const { widthMm, heightMm } = paper;
  const usableW = widthMm - gaps.marginLeft * 2;
  const usableH = heightMm - gaps.marginTop * 2;

  const pages: PackedTile[][] = [[]];
  let pageIndex = 0;
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  let skipped = 0;

  for (const photo of photos) {
    const wMm = photo.widthCm * 10;
    const hMm = photo.heightCm * 10;
    if (wMm > usableW || hMm > usableH) {
      skipped += photo.count;
      continue;
    }
    for (let i = 0; i < photo.count; i += 1) {
      if (x > 0 && x + wMm > usableW + 0.01) {
        x = 0;
        y += rowHeight + gaps.gapY;
        rowHeight = 0;
      }
      if (y + hMm > usableH + 0.01) {
        pageIndex += 1;
        pages.push([]);
        x = 0;
        y = 0;
        rowHeight = 0;
      }
      pages[pageIndex].push({
        photoId: photo.id,
        url: photo.url,
        xMm: gaps.marginLeft + x,
        yMm: gaps.marginTop + y,
        wMm,
        hMm,
      });
      x += wMm + gaps.gapX;
      rowHeight = Math.max(rowHeight, hMm);
    }
  }

  return { pages, skipped };
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, dx: number, dy: number, dw: number, dh: number) {
  const scale = Math.max(dw / image.naturalWidth, dh / image.naturalHeight);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (image.naturalWidth - sw) / 2;
  const sy = (image.naturalHeight - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

const MM_PER_IN = 25.4;

export async function renderPageCanvas(paper: PaperDims, tiles: PackedTile[], imageCache: Map<string, HTMLImageElement>): Promise<HTMLCanvasElement> {
  const { widthMm, heightMm } = paper;
  const pxPerMm = EXPORT_DPI / MM_PER_IN;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(widthMm * pxPerMm);
  canvas.height = Math.round(heightMm * pxPerMm);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const tile of tiles) {
    let image = imageCache.get(tile.url);
    if (!image) {
      image = await loadImage(tile.url);
      imageCache.set(tile.url, image);
    }
    const dx = tile.xMm * pxPerMm;
    const dy = tile.yMm * pxPerMm;
    const dw = tile.wMm * pxPerMm;
    const dh = tile.hMm * pxPerMm;
    drawCover(ctx, image, dx, dy, dw, dh);
    ctx.strokeStyle = "#c7cbe0";
    ctx.lineWidth = 1;
    ctx.strokeRect(dx, dy, dw, dh);
  }

  return canvas;
}

export async function renderSingleTileCanvas(url: string, widthCm: number, heightCm: number): Promise<HTMLCanvasElement> {
  const pxPerMm = EXPORT_DPI / MM_PER_IN;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(widthCm * 10 * pxPerMm);
  canvas.height = Math.round(heightCm * 10 * pxPerMm);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const image = await loadImage(url);
  drawCover(ctx, image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }, "image/png");
}

// Browser print (window.print) as a free alternative to the HD canvas
// export - no rendering wait, and the shop's own printer driver handles
// paper feed/scaling, at the cost of DPI being whatever that driver picks.
export function buildPrintHtml(paper: PaperDims, pages: PackedTile[][]): string {
  const pageSizeCss = `width:${paper.widthMm}mm;height:${paper.heightMm}mm;`;
  const pageRuleCss = `size:${paper.widthMm}mm ${paper.heightMm}mm;`;

  const pagesHtml = pages
    .filter((tiles) => tiles.length)
    .map((tiles) => {
      const tilesHtml = tiles
        .map(
          (tile) =>
            `<div class="tile" style="left:${tile.xMm}mm;top:${tile.yMm}mm;width:${tile.wMm}mm;height:${tile.hMm}mm;"><img src="${tile.url}" /></div>`,
        )
        .join("");
      return `<div class="page">${tilesHtml}</div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Print Sheet</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;font-family:Arial, Helvetica, sans-serif;}
.page{position:relative;${pageSizeCss}background:#fff;margin:20px auto;}
.tile{position:absolute;overflow:hidden;border:1px solid #c7cbe0;background:#fff;}
.tile img{width:100%;height:100%;object-fit:cover;object-position:center;}
@media print{
  body{background:white;}
  .page{margin:0;page-break-after:always;}
  .page:last-child{page-break-after:auto;}
  @page{${pageRuleCss}margin:0;}
}
</style>
</head>
<body>
${pagesHtml}
<script>
  window.onload = function () {
    window.focus();
    window.print();
  };
</script>
</body>
</html>`;
}

export function openPrintWindow(paper: PaperDims, pages: PackedTile[][]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(buildPrintHtml(paper, pages));
  printWindow.document.close();
}

export async function rotateImageFile(url: string, file: File): Promise<{ file: File; url: string }> {
  const image = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalHeight;
  canvas.height = image.naturalWidth;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Rotation failed"))), "image/png", 0.95));
  const rotatedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".png"), { type: "image/png" });
  return { file: rotatedFile, url: URL.createObjectURL(rotatedFile) };
}
