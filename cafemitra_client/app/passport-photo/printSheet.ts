export type PaperSize = "a4" | "4x6";

const MM_PER_IN = 25.4;
const GAP_MM = 2;
const DEFAULT_TILE_WIDTH_IN = 1.2;
const DEFAULT_TILE_HEIGHT_IN = 1.6;

export function parsePhotoCount(label?: string) {
  const match = /(\d+)/.exec(label || "");
  const value = match ? parseInt(match[1], 10) : NaN;
  return Number.isFinite(value) && value > 0 ? value : 6;
}

function printableAreaIn(size: PaperSize) {
  const widthMm = size === "a4" ? 210 : 4 * MM_PER_IN;
  const heightMm = size === "a4" ? 297 : 6 * MM_PER_IN;
  const padding = size === "a4" ? { top: 4, right: 12, bottom: 12, left: 6 } : { top: 2, right: 3, bottom: 3, left: 3 };
  return {
    widthIn: (widthMm - padding.left - padding.right) / MM_PER_IN,
    heightIn: (heightMm - padding.top - padding.bottom) / MM_PER_IN,
  };
}

// How many tiles of a given size fit on a sheet - lets a custom tile size
// "auto shift" onto whichever paper is selected instead of the fixed
// 6-per-row (A4) / 3-per-row (4x6) grid the default 1.2x1.6in tile used.
export function maxTilesForPaper(size: PaperSize, tileWidthIn: number, tileHeightIn: number) {
  const area = printableAreaIn(size);
  const gapIn = GAP_MM / MM_PER_IN;
  const perRow = Math.max(1, Math.floor((area.widthIn + gapIn) / (Math.max(0.1, tileWidthIn) + gapIn)));
  const rows = Math.max(1, Math.floor((area.heightIn + gapIn) / (Math.max(0.1, tileHeightIn) + gapIn)));
  return { perRow, rows, max: perRow * rows };
}

export function buildPrintSheetHtml(
  size: PaperSize,
  imageUrl: string,
  count: number,
  tileWidthIn: number = DEFAULT_TILE_WIDTH_IN,
  tileHeightIn: number = DEFAULT_TILE_HEIGHT_IN,
) {
  const { perRow, max } = maxTilesForPaper(size, tileWidthIn, tileHeightIn);
  const actualCount = Math.max(1, Math.min(count, max));
  const pageSizeCss = size === "a4" ? "width:210mm;height:297mm;" : "width:4in;height:6in;";
  const pageRuleCss = size === "a4" ? "size:A4;" : "size:4in 6in;";
  const pagePaddingCss = size === "a4" ? "4mm 12mm 12mm 6mm" : "2mm 3mm 3mm 3mm";

  const rowCounts: number[] = [];
  for (let remaining = actualCount; remaining > 0; remaining -= perRow) {
    rowCounts.push(Math.min(perRow, remaining));
  }

  const rowsHtml = rowCounts
    .map((rowCount) => {
      const photosHtml = Array.from({ length: rowCount })
        .map(() => `<div class="photo"><img src="${imageUrl}" /></div>`)
        .join("");
      return `<div class="photo-row">${photosHtml}</div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Passport Photo Sheet</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;font-family:Arial, Helvetica, sans-serif;}
.page{${pageSizeCss}background:#fff;margin:20px auto;padding:${pagePaddingCss};}
.photo-row{display:flex;justify-content:flex-start;gap:2mm;margin-bottom:2mm;}
.photo-row:last-child{margin-bottom:0;}
.photo{width:${tileWidthIn}in;height:${tileHeightIn}in;border:1px solid #999;overflow:hidden;background:#fff;flex:0 0 auto;}
.photo img{width:100%;height:100%;object-fit:cover;object-position:center;}
@media print{
  body{background:white;}
  .page{margin:0;${pageSizeCss}padding:${pagePaddingCss};box-shadow:none;}
  @page{${pageRuleCss}margin:0;}
}
</style>
</head>
<body>
<div class="page">
${rowsHtml}
</div>
<script>
  window.onload = function () {
    window.focus();
    window.print();
  };
</script>
</body>
</html>`;
}

export function openPrintSheet(
  size: PaperSize,
  imageUrl: string,
  count: number,
  tileWidthIn: number = DEFAULT_TILE_WIDTH_IN,
  tileHeightIn: number = DEFAULT_TILE_HEIGHT_IN,
) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  const html = buildPrintSheetHtml(size, imageUrl, count, tileWidthIn, tileHeightIn);
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
