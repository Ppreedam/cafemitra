// Where every ID card goes on the printed sheet, for any paper size. The
// preview and the real print (browser print window or PrintPilot agent PDF)
// are both drawn from the same plan, so what you see is what is printed.

export const CARD_W_MM = 85.6;
export const CARD_H_MM = 53.98;
const DEFAULT_GAP_MM = 6;

/** Spacing / copies the user can choose. null margin = automatic (centred on the paper). */
export type SheetOptions = { gapMm?: number; marginMm?: number | null; copies?: number; sizePercent?: number; landscape?: boolean };
/** Card size as a percent of the real card (85.6 x 53.98 mm); 100 is the default. Same shape at any size. */
export const SIZE_MIN_PERCENT = 20;
export const SIZE_MAX_PERCENT = 300;
export const MARGIN_MAX_MM = 50;

/** The biggest size (percent) a card can have on this paper with this margin (null = Auto margin) - more would not fit. */
export function maxSizePercent(paper: { widthMm: number; heightMm: number }, marginMm: number | null | undefined): number {
  const margin = marginMm != null ? Math.max(0, Math.min(MARGIN_MAX_MM, marginMm, Math.min(paper.widthMm, paper.heightMm) / 2 - 5)) : 2;
  const fit = Math.min((paper.widthMm - margin * 2) / CARD_W_MM, (paper.heightMm - margin * 2) / CARD_H_MM);
  return Math.max(SIZE_MIN_PERCENT, Math.min(SIZE_MAX_PERCENT, Math.floor(fit * 100)));
}
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

export type CardBox = { x: number; y: number; w: number; h: number };

/**
 * While a card is dragged: lines up its edges / centre with the other cards on the page and with the middle of
 * the paper. Within `threshold` mm it snaps onto the line, and the lines it now sits on are returned so the
 * preview can draw them (guidesX = vertical lines at those x, guidesY = horizontal lines at those y).
 */
export function alignCard(moving: CardBox, others: CardBox[], paper: { widthMm: number; heightMm: number }, threshold = 1.5) {
  const targetsX = [paper.widthMm / 2, ...others.flatMap((box) => [box.x, box.x + box.w / 2, box.x + box.w])];
  const targetsY = [paper.heightMm / 2, ...others.flatMap((box) => [box.y, box.y + box.h / 2, box.y + box.h])];

  function snap(start: number, size: number, targets: number[]) {
    let best = 0;
    let bestAbs = Infinity;
    for (const edge of [start, start + size / 2, start + size]) {
      for (const target of targets) {
        const diff = target - edge;
        if (Math.abs(diff) < bestAbs) {
          bestAbs = Math.abs(diff);
          best = diff;
        }
      }
    }
    return bestAbs <= threshold ? best : 0;
  }

  const x = moving.x + snap(moving.x, moving.w, targetsX);
  const y = moving.y + snap(moving.y, moving.h, targetsY);

  function lines(start: number, size: number, targets: number[]) {
    const found: number[] = [];
    for (const edge of [start, start + size / 2, start + size]) {
      for (const target of targets) {
        if (Math.abs(target - edge) < 0.05 && !found.some((value) => Math.abs(value - target) < 0.05)) found.push(target);
      }
    }
    return found;
  }

  return { x, y, guidesX: lines(x, moving.w, targetsX), guidesY: lines(y, moving.h, targetsY) };
}

/** The paper the sheet is drawn on: portrait = the long side up, landscape = the long side across. */
export function orientedPaper(paper: PaperChoice, landscape?: boolean): PaperChoice {
  const short = Math.min(paper.widthMm, paper.heightMm);
  const long = Math.max(paper.widthMm, paper.heightMm);
  return landscape ? { ...paper, widthMm: long, heightMm: short } : { ...paper, widthMm: short, heightMm: long };
}

/** A print profile's summary reads like "4x6 · Color · High quality" - the paper is the first part. */
export function paperFromSummary(summary?: string): PaperChoice | null {
  if (!summary) return null;
  const tokens = summary.split(/[·|,]/).map((part) => part.trim().toLowerCase().replace(/\s+/g, ""));
  // The paper is normally the first part ("4x6 · Color"), but any part that is a paper name counts.
  for (const token of tokens) {
    const found = PAPER_CHOICES.find((paper) => paper.name.toLowerCase() === token);
    if (found) return found;
  }
  return null;
}

/** The paper named at the start of a profile's name ("A4color", "4x6 photo", "A5-bw"), when its summary does not tell. */
export function paperFromProfileName(name?: string): PaperChoice | null {
  if (!name) return null;
  const text = name.trim().toLowerCase().replace(/\s+/g, "");
  // Longest names first so "a4" is not taken for a longer name that merely starts with it.
  return [...PAPER_CHOICES].sort((a, b) => b.name.length - a.name.length).find((paper) => text.startsWith(paper.name.toLowerCase())) ?? null;
}

/** copies: how many times this ID card is printed (default 1); each card has its own. */
export type SheetEntry = { id: string; frontUrl: string; backUrl: string; copies?: number };
export type PlacedCard = { key: string; url: string; xMm: number; yMm: number };
/** A card the user dragged to its own spot (mm from the page's top-left), keyed by PlacedCard.key. */
export type PositionOverrides = Record<string, { xMm: number; yMm: number }>;
/** cardWMm / cardHMm: the size every card is drawn at (the chosen size, shrunk only if it would not fit the paper). */
export type SheetPlan = { paper: PaperChoice; pages: PlacedCard[][]; marginMm: number; fits: boolean; cardWMm: number; cardHMm: number; sizeLimited: boolean };

/**
 * Lays the cards out left to right, row by row, starting a new page when the
 * next row does not fit. "side": front and back next to each other (stacked
 * automatically for one pair if the paper is too narrow for two cards).
 * "stack": back under the front, so each person is a column.
 */
export function planSheet(entries: SheetEntry[], paper: PaperChoice, layout: SheetLayout, overrides: PositionOverrides = {}, separatePages = false, options: SheetOptions = {}): SheetPlan {
  const GAP_MM = options.gapMm ?? DEFAULT_GAP_MM;
  // Every ID card is repeated by its own copies (the options' copies is only the fallback for a card without one).
  entries = entries.flatMap((entry) => {
    const copies = Math.max(1, Math.min(MAX_COPIES, Math.round(entry.copies ?? options.copies ?? 1)));
    return Array.from({ length: copies }, (_, i) => (i === 0 ? entry : { ...entry, id: `${entry.id}~${i + 1}` }));
  });
  const wantedScale = Math.max(SIZE_MIN_PERCENT, Math.min(SIZE_MAX_PERCENT, options.sizePercent ?? 100)) / 100;
  const marginMm =
    options.marginMm != null
      ? Math.max(0, Math.min(MARGIN_MAX_MM, options.marginMm, Math.min(paper.widthMm, paper.heightMm) / 2 - 5))
      : Math.max(2, Math.min(10, (paper.widthMm - CARD_W_MM * wantedScale) / 2));
  const usableW = paper.widthMm - marginMm * 2;
  const usableH = paper.heightMm - marginMm * 2;
  // A card bigger than the paper's usable area is brought down to fit (same shape), never cut off.
  const fitScale = Math.min(usableW / CARD_W_MM, usableH / CARD_H_MM);
  const scale = Math.min(wantedScale, fitScale);
  const sizeLimited = scale < wantedScale - 0.0001;
  const CARD_W = CARD_W_MM * scale;
  const CARD_H = CARD_H_MM * scale;
  const fits = CARD_W <= usableW + 0.01 && CARD_H <= usableH + 0.01;

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
    const sideW = hasBack ? CARD_W * 2 + GAP_MM : CARD_W;
    const stacked = layout === "stack" || sideW > usableW + 0.01;
    const unitW = stacked ? CARD_W : sideW;
    const unitH = stacked && hasBack ? CARD_H * 2 + GAP_MM : CARD_H;

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
          ? { key: `${entry.id}:back`, url: entry.backUrl, xMm: left, yMm: top + CARD_H + GAP_MM }
          : { key: `${entry.id}:back`, url: entry.backUrl, xMm: left + CARD_W + GAP_MM, yMm: top },
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
      card.xMm = Math.max(0, Math.min(paper.widthMm - CARD_W, moved.xMm));
      card.yMm = Math.max(0, Math.min(paper.heightMm - CARD_H, moved.yMm));
    }
  }
  return { paper, pages, marginMm, fits, cardWMm: CARD_W, cardHMm: CARD_H, sizeLimited };
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
.card{position:absolute;width:${plan.cardWMm}mm;height:${plan.cardHMm}mm;border:1px solid #999;border-radius:3mm;overflow:hidden;background:#fff;}
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
