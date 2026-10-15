// Where every ID card goes on the printed sheet, for any paper size. The
// preview and the real print (browser print window or PrintPilot agent PDF)
// are both drawn from the same plan, so what you see is what is printed.

export const CARD_W_MM = 85.6;
export const CARD_H_MM = 53.98;
const DEFAULT_GAP_MM = 6;

/** Spacing / copies the user can choose. null margin = automatic (centred on the paper). */
export type SheetOptions = { gapMm?: number; marginMm?: number | null; copies?: number };
export const GAP_CHOICES = [0, 2, 4, 6, 8, 10];
export const MARGIN_CHOICES = [0, 3, 5, 8, 10, 15];
export const MAX_COPIES = 10;

export type SheetLayout = "side" | "stack";
export type PaperChoice = { name: string; widthMm: number; heightMm: number };

export const PAPER_CHOICES: PaperChoice[] = [
  { name: "A4", widthMm: 210, heightMm: 297 },
  { name: "A5", widthMm: 148, heightMm: 210 },
  { name: "A3", widthMm: 297, heightMm: 420 },
  { name: "A6", widthMm: 105, heightMm: 148 },
  { name: "B5", widthMm: 176, heightMm: 250 },
  { name: "Letter", widthMm: 215.9, heightMm: 279.4 },
  { name: "Legal", widthMm: 215.9, heightMm: 355.6 },
  { name: "Executive", widthMm: 184.1, heightMm: 266.7 },
  { name: "4x6", widthMm: 101.6, heightMm: 152.4 },
];

export const DEFAULT_PAPER = PAPER_CHOICES[0];

/** A print profile's summary reads like "4x6 · Color · High quality" - the paper is the first part. */
export function paperFromSummary(summary?: string): PaperChoice | null {
  if (!summary) return null;
  const first = summary.split(/[·|,]/)[0].trim().toLowerCase().replace(/\s+/g, "");
  return PAPER_CHOICES.find((paper) => paper.name.toLowerCase() === first) ?? null;
}

export type SheetEntry = { id: string; frontUrl: string; backUrl: string };
export type PlacedCard = { key: string; url: string; xMm: number; yMm: number };
/** A card the user dragged to its own spot (mm from the page's top-left), keyed by PlacedCard.key. */
export type PositionOverrides = Record<string, { xMm: number; yMm: number }>;
export type SheetPlan = { paper: PaperChoice; pages: PlacedCard[][]; marginMm: number; fits: boolean };

/**
 * Lays the cards out left to right, row by row, starting a new page when the
 * next row does not fit. "side": front and back next to each other (stacked
 * automatically for one pair if the paper is too narrow for two cards).
 * "stack": back under the front, so each person is a column.
 */
export function planSheet(entries: SheetEntry[], paper: PaperChoice, layout: SheetLayout, overrides: PositionOverrides = {}, separatePages = false, options: SheetOptions = {}): SheetPlan {
  const GAP_MM = options.gapMm ?? DEFAULT_GAP_MM;
  const copies = Math.max(1, Math.min(MAX_COPIES, Math.round(options.copies ?? 1)));
  if (copies > 1) entries = entries.flatMap((entry) => Array.from({ length: copies }, (_, i) => (i === 0 ? entry : { ...entry, id: `${entry.id}~${i + 1}` })));
  const marginMm = options.marginMm != null ? Math.max(0, options.marginMm) : Math.max(2, Math.min(10, (paper.widthMm - CARD_W_MM) / 2));
  const usableW = paper.widthMm - marginMm * 2;
  const usableH = paper.heightMm - marginMm * 2;
  const fits = CARD_W_MM <= usableW + 0.01 && CARD_H_MM <= usableH + 0.01;

  const pages: PlacedCard[][] = [[]];
  let x = 0;
  let y = 0;
  let rowH = 0;
  let rowStart = 0;

  // Every row of cards is centred across the page (equal space left and right), in both layouts.
  function centreRow() {
    if (x <= 0) return;
    const shift = (usableW - (x - GAP_MM)) / 2;
    if (shift <= 0) return;
    const page = pages[pages.length - 1];
    for (let i = rowStart; i < page.length; i += 1) page[i].xMm += shift;
  }

  for (const entry of entries) {
    const hasBack = Boolean(entry.backUrl);
    const sideW = hasBack ? CARD_W_MM * 2 + GAP_MM : CARD_W_MM;
    const stacked = layout === "stack" || sideW > usableW + 0.01;
    const unitW = stacked ? CARD_W_MM : sideW;
    const unitH = stacked && hasBack ? CARD_H_MM * 2 + GAP_MM : CARD_H_MM;

    // Top / Bottom: every ID card is its own front-over-back pair, one under the other
    // (never two pairs side by side, which would read as Left / Right).
    if (x > 0 && (layout === "stack" || x + unitW > usableW + 0.01)) {
      centreRow();
      rowStart = pages[pages.length - 1].length;
      x = 0;
      y += rowH + GAP_MM;
      rowH = 0;
    }
    // "One ID per page": every ID card (front + back) starts its own page.
    const pageIsEmpty = pages[pages.length - 1].length === 0;
    if (separatePages && !pageIsEmpty) {
      centreRow();
      pages.push([]);
      rowStart = 0;
      x = 0;
      y = 0;
      rowH = 0;
    }
    if (y > 0 && y + unitH > usableH + 0.01) {
      centreRow();
      pages.push([]);
      rowStart = 0;
      x = 0;
      y = 0;
      rowH = 0;
    }
    const page = pages[pages.length - 1];
    const left = marginMm + x;
    const top = marginMm + y;
    page.push({ key: `${entry.id}:front`, url: entry.frontUrl, xMm: left, yMm: top });
    if (hasBack) {
      page.push(
        stacked
          ? { key: `${entry.id}:back`, url: entry.backUrl, xMm: left, yMm: top + CARD_H_MM + GAP_MM }
          : { key: `${entry.id}:back`, url: entry.backUrl, xMm: left + CARD_W_MM + GAP_MM, yMm: top },
      );
    }
    x += unitW + GAP_MM;
    rowH = Math.max(rowH, unitH);
  }
  centreRow();
  // Cards the user moved by hand keep their own spot (on the page they were placed on).
  for (const placedCards of pages) {
    for (const card of placedCards) {
      const moved = overrides[card.key];
      if (!moved) continue;
      card.xMm = Math.max(0, Math.min(paper.widthMm - CARD_W_MM, moved.xMm));
      card.yMm = Math.max(0, Math.min(paper.heightMm - CARD_H_MM, moved.yMm));
    }
  }
  return { paper, pages, marginMm, fits };
}

/** The print-ready HTML: one exact-size .page per sheet, cards placed in mm (no script - printing is triggered by the caller or the browser window). */
export function buildSheetHtml(plan: SheetPlan, colorMode: "color" | "bw", autoPrint: boolean) {
  const { paper } = plan;
  const pagesHtml = plan.pages
    .map(
      (cards) =>
        `<div class="page">${cards
          .map((card) => `<div class="card" style="left:${card.xMm}mm;top:${card.yMm}mm;"><img src="${card.url}" /></div>`)
          .join("")}</div>`,
    )
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ID Card Print Sheet</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;font-family:Arial, Helvetica, sans-serif;${colorMode === "bw" ? "filter:grayscale(1);" : ""}}
.page{position:relative;width:${paper.widthMm}mm;height:${paper.heightMm}mm;background:#fff;margin:20px auto;overflow:hidden;}
.card{position:absolute;width:85.6mm;height:53.98mm;border:1px solid #999;border-radius:3mm;overflow:hidden;background:#fff;}
.card img{width:100%;height:100%;object-fit:cover;}
@page{size:${paper.widthMm}mm ${paper.heightMm}mm;margin:0;}
@media print{
  body{background:white;}
  .page{margin:0;box-shadow:none;page-break-after:always;break-after:page;}
  .page:last-of-type{page-break-after:auto;break-after:auto;}
  /* Browser extensions often inject their own floating button straight onto <body>;
     hide anything that is not our own .page content from the PRINTED output. */
  body > :not(.page){display:none !important;}
}
</style>
</head>
<body>
${pagesHtml}${
    autoPrint
      ? `
<script>
  window.onload = function () {
    window.focus();
    window.print();
  };
</script>`
      : ""
  }
</body>
</html>`;
}
