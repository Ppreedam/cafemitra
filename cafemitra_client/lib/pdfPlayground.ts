// Page-level PDF edits for the Photo Copy "PDF Playground": rotate, reorder, drop pages,
// several pages per sheet (N-up), a watermark and page numbers. Pure pdf-lib (no DOM), so
// it can also be run and checked under Node.
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { PDFFont, PDFPage } from "pdf-lib";

export type PlaygroundPage = {
  /** 0-based index of the page in the PDF being edited. */
  source: number;
  /** Extra clockwise turn on top of the page's own rotation: 0, 90, 180 or 270. */
  rotate: number;
};

export type LayoutMode = "single" | "two-side" | "two-stack" | "four" | "id-card";
export type WatermarkColor = "gray" | "red" | "blue";
export type PageNumberPosition = "bottom-center" | "bottom-right" | "bottom-left" | "top-right";
export type PageNumberFormat = "n" | "page-n" | "n-of-total";

export type PlaygroundPlan = {
  pages: PlaygroundPage[];
  layout: LayoutMode;
  /** N-up only: a thin line around every page on the sheet (handy for cutting). */
  cellBorder: boolean;
  watermark: { text: string; opacity: number; color: WatermarkColor } | null;
  pageNumbers: { position: PageNumberPosition; format: PageNumberFormat; startAt: number } | null;
};

const A4_W = 595.28;
const A4_H = 841.89;
const SHEET_MARGIN = 18;
const SHEET_GAP = 8;

const WATERMARK_COLORS: Record<WatermarkColor, [number, number, number]> = {
  gray: [0.45, 0.45, 0.45],
  red: [0.85, 0.15, 0.15],
  blue: [0.15, 0.35, 0.85],
};

export function normalizeTurn(angle: number) {
  return ((Math.round(angle / 90) * 90) % 360 + 360) % 360;
}

/** How many sheets the pages will take for a layout. */
export function sheetCount(pageCount: number, layout: LayoutMode) {
  return Math.ceil(pageCount / sheetSpec(layout).cells.length);
}

type SheetCell = { x: number; y: number; w: number; h: number };

// Sheet size and the boxes (x, y = bottom-left corner, in points) one sheet holds, in reading order.
function sheetSpec(layout: LayoutMode): { w: number; h: number; cells: SheetCell[] } {
  if (layout === "single") return { w: A4_W, h: A4_H, cells: [{ x: 0, y: 0, w: A4_W, h: A4_H }] };
  if (layout === "id-card") {
    // True ID-card size (85.6 x 54 mm), centred in a column at the top - front, back, next card...
    const cardW = (85.6 / 25.4) * 72;
    const cardH = (54 / 25.4) * 72;
    const gap = 22;
    const top = A4_H - 40;
    return { w: A4_W, h: A4_H, cells: Array.from({ length: 4 }, (_, row) => ({ x: (A4_W - cardW) / 2, y: top - cardH - row * (cardH + gap), w: cardW, h: cardH })) };
  }
  const grid = layout === "two-side" ? { w: A4_H, h: A4_W, cols: 2, rows: 1 } : layout === "two-stack" ? { w: A4_W, h: A4_H, cols: 1, rows: 2 } : { w: A4_W, h: A4_H, cols: 2, rows: 2 };
  const cellW = (grid.w - SHEET_MARGIN * 2 - SHEET_GAP * (grid.cols - 1)) / grid.cols;
  const cellH = (grid.h - SHEET_MARGIN * 2 - SHEET_GAP * (grid.rows - 1)) / grid.rows;
  const cells: SheetCell[] = [];
  for (let row = 0; row < grid.rows; row += 1) {
    for (let col = 0; col < grid.cols; col += 1) {
      cells.push({ x: SHEET_MARGIN + col * (cellW + SHEET_GAP), y: grid.h - SHEET_MARGIN - row * (cellH + SHEET_GAP) - cellH, w: cellW, h: cellH });
    }
  }
  return { w: grid.w, h: grid.h, cells };
}

/** English letters, numbers and common symbols only (the built-in PDF fonts). */
export function isWatermarkTextSupported(text: string) {
  return /^[\x20-\x7E -ÿ]*$/.test(text);
}

export async function buildPlaygroundPdf(source: ArrayBuffer | Uint8Array, plan: PlaygroundPlan): Promise<Uint8Array> {
  const src = await PDFDocument.load(source, { updateMetadata: false });
  const total = src.getPageCount();
  const pages = plan.pages.filter((page) => page.source >= 0 && page.source < total);
  if (!pages.length) throw new Error("There are no pages left to build.");
  if (plan.watermark && !isWatermarkTextSupported(plan.watermark.text)) {
    throw new Error("The watermark can use English letters, numbers and common symbols only.");
  }

  const out = await PDFDocument.create();
  if (plan.layout === "single") {
    const copied = await out.copyPages(src, pages.map((page) => page.source));
    copied.forEach((page, index) => {
      page.setRotation(degrees(normalizeTurn(page.getRotation().angle + pages[index].rotate)));
      out.addPage(page);
    });
  } else {
    await layoutSheets(out, src, pages, plan.layout, plan.cellBorder);
  }

  if (plan.watermark?.text.trim() || plan.pageNumbers) {
    const font = await out.embedFont(StandardFonts.HelveticaBold);
    const outPages = out.getPages();
    outPages.forEach((page, index) => {
      if (plan.watermark?.text.trim()) drawWatermark(page, font, plan.watermark.text.trim(), plan.watermark.opacity, plan.watermark.color);
      if (plan.pageNumbers) {
        const number = plan.pageNumbers.startAt + index;
        const label =
          plan.pageNumbers.format === "n" ? `${number}` : plan.pageNumbers.format === "page-n" ? `Page ${number}` : `${number} / ${plan.pageNumbers.startAt + outPages.length - 1}`;
        drawPageNumber(page, font, label, plan.pageNumbers.position);
      }
    });
  }

  return out.save();
}

// Several source pages on one A4 sheet, each scaled to fit its cell and honouring its rotation.
async function layoutSheets(out: PDFDocument, src: PDFDocument, pages: PlaygroundPage[], layout: Exclude<LayoutMode, "single">, cellBorder: boolean) {
  const spec = sheetSpec(layout);
  const perSheet = spec.cells.length;

  const uniqueSources = Array.from(new Set(pages.map((page) => page.source)));
  const embeddedList = await out.embedPdf(src, uniqueSources);
  const embeddedBySource = new Map(uniqueSources.map((source, index) => [source, embeddedList[index]]));

  for (let start = 0; start < pages.length; start += perSheet) {
    const sheet = out.addPage([spec.w, spec.h]);
    pages.slice(start, start + perSheet).forEach((page, slot) => {
      const cell = spec.cells[slot];
      const embedded = embeddedBySource.get(page.source)!;
      const turn = normalizeTurn(src.getPage(page.source).getRotation().angle + page.rotate);
      const sideways = turn % 180 !== 0;
      const shownW = sideways ? embedded.height : embedded.width;
      const shownH = sideways ? embedded.width : embedded.height;
      const scale = Math.min(cell.w / shownW, cell.h / shownH);
      const boxW = shownW * scale;
      const boxH = shownH * scale;
      const boxX = cell.x + (cell.w - boxW) / 2;
      const boxY = cell.y + (cell.h - boxH) / 2;

      if (cellBorder) {
        sheet.drawRectangle({ x: cell.x, y: cell.y, width: cell.w, height: cell.h, borderColor: rgb(0.72, 0.72, 0.72), borderWidth: 0.5 });
      }
      // drawPage rotates (counter-clockwise, about x/y) the page that was scaled to width x height,
      // so each clockwise turn needs the anchor moved to the corner that ends up bottom-left.
      const drawW = embedded.width * scale;
      const drawH = embedded.height * scale;
      const anchor =
        turn === 90 ? { x: boxX, y: boxY + drawW } : turn === 180 ? { x: boxX + drawW, y: boxY + drawH } : turn === 270 ? { x: boxX + drawH, y: boxY } : { x: boxX, y: boxY };
      sheet.drawPage(embedded, { x: anchor.x, y: anchor.y, width: drawW, height: drawH, rotate: degrees(-turn) });
    });
  }
}

// Page size as the viewer shows it (after the page's own /Rotate) and a mapper from that
// display space (origin bottom-left) back to the page's drawing space.
function displayFrame(page: PDFPage) {
  const turn = normalizeTurn(page.getRotation().angle);
  const box = page.getMediaBox();
  const sideways = turn % 180 !== 0;
  const width = sideways ? box.height : box.width;
  const height = sideways ? box.width : box.height;
  const toUser = (dx: number, dy: number) => {
    if (turn === 90) return { x: box.x + (box.width - dy), y: box.y + dx };
    if (turn === 180) return { x: box.x + (box.width - dx), y: box.y + (box.height - dy) };
    if (turn === 270) return { x: box.x + dy, y: box.y + (box.height - dx) };
    return { x: box.x + dx, y: box.y + dy };
  };
  return { turn, width, height, toUser };
}

function drawWatermark(page: PDFPage, font: PDFFont, text: string, opacity: number, color: WatermarkColor) {
  const { turn, width, height, toUser } = displayFrame(page);
  const widthAtOne = font.widthOfTextAtSize(text, 1);
  const diagonal = Math.hypot(width, height);
  const size = Math.min(120, Math.max(14, (diagonal * 0.7) / widthAtOne));
  const textWidth = widthAtOne * size;
  const angle = 45;
  const rad = (angle * Math.PI) / 180;
  // Start point so the middle of the text lands on the middle of the page.
  const lift = size * 0.35;
  const startX = width / 2 - (Math.cos(rad) * (textWidth / 2) - Math.sin(rad) * lift);
  const startY = height / 2 - (Math.sin(rad) * (textWidth / 2) + Math.cos(rad) * lift);
  const origin = toUser(startX, startY);
  const [r, g, b] = WATERMARK_COLORS[color];
  page.drawText(text, { x: origin.x, y: origin.y, size, font, color: rgb(r, g, b), opacity: Math.min(1, Math.max(0.05, opacity)), rotate: degrees(angle + turn) });
}

function drawPageNumber(page: PDFPage, font: PDFFont, label: string, position: PageNumberPosition) {
  const { turn, width, height, toUser } = displayFrame(page);
  const size = 10;
  const textWidth = font.widthOfTextAtSize(label, size);
  const edge = 28;
  const x = position === "bottom-center" ? (width - textWidth) / 2 : position === "bottom-left" ? edge : width - edge - textWidth;
  const y = position === "top-right" ? height - 30 : 20;
  const origin = toUser(x, y);
  page.drawText(label, { x: origin.x, y: origin.y, size, font, color: rgb(0.2, 0.2, 0.2), rotate: degrees(turn) });
}
