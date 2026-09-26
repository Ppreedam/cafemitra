// Engine behind the ID Card Maker studio (/id-card-maker).
//
// Every upload goes through the same pipeline:
//   1. pdf.js opens the PDF (it handles the password) and reads its text so
//      the document type can be detected.
//   2. A decrypted copy is made so pdf-lib can re-use the original vector
//      content - text on the printed card stays sharp, real text.
//   3. Standard UIDAI e-Aadhaar letters go through the Aadhaar cutter core
//      (text resize/bold/spacing, mobile number, photo swap). Every other
//      document is cut with a per-type crop template.
//   4. If pdf-lib cannot parse the file at all, the pages are rendered to
//      images and the card is cut from those instead.
import makeAadhaarCore, { type AadhaarCore, type AadhaarEditOptions, type AadhaarMeta } from "./aadhaarCore";
import { detectCardType, getCardTemplate, type CardTypeInfo } from "./cardPrint";
import type { PDFDocument, PDFPage } from "@cantoo/pdf-lib";
import { buildVoterCard, inspectVoter, type TextItem, type VoterLayout } from "./voterCard";
import { buildPanCard, inspectPan, type PanCut, type PanLayout } from "./panCard";

export type Face = "front" | "back";
// PDF points measured from the top-left of the page; `page` is 0-based.
export type FaceBox = { page: number; x0: number; x1: number; top: number; bottom: number };
// Nudges in PDF points: x/y move the cut, zx/zy shrink it (zoom in) or grow it (zoom out).
export type FaceAdjust = { x: number; y: number; zx: number; zy: number };
export type CardAdjust = Record<Face, FaceAdjust>;
export type OutputKind = "card" | "a4" | "4x6";

export type LoadedCard = {
  fileName: string;
  type: CardTypeInfo;
  mode: "aadhaar" | "voter" | "pan" | "crop" | "raster";
  pageSizes: { w: number; h: number }[];
  plain: Uint8Array | null;
  meta: AadhaarMeta | null;
  base: Record<Face, FaceBox>;
  pageImages: string[];
  notice: string;
  // Printed numbers read from the text layer (used by the clean Aadhaar design).
  numbers: { aadhaar: string; vid: string };
  // Rotated text boxes on page 1 (PDF units, origin bottom-left) - the
  // "Aadhaar no. issued" and "Details as on" dates on an e-Aadhaar.
  rotated: { x0: number; x1: number; y0: number; y1: number }[];
  // Standard e-EPIC letters only: card faces and photo found on page 1.
  voter?: VoterLayout;
  // Standard NSDL / UTI e-PAN letters only: variant, card faces and photo.
  pan?: PanLayout;
};

// "clean" redraws an e-Aadhaar on a fresh card: new header/footer, bigger
// photo; "original" is a straight cut of the letter.
export type AadhaarDesign = "clean" | "original";
// Which parts of the clean card are drawn (mirrors the desktop tool's "Card Elements").
export type CardElements = {
  frontHeader: boolean;
  frontFooterLine: boolean;
  frontFooterText: boolean;
  backHeader: boolean;
  backFooterLine: boolean;
  backFooter: boolean;
  backUid: boolean;
  autoAlign: boolean;
  photoFrame: boolean;
  issueDate: boolean;
  detailsDate: boolean;
  coloredFooter: boolean;
  frontVid: boolean;
  backVid: boolean;
};
// Vertical nudges in points (positive = down).
export type CardOffsets = { frontHeader: number; backHeader: number; frontFooter: number; backFooter: number; photo: number };
// Footer text sizes are in points; lineColor is a #rrggbb hex for the footer rules.
export type FooterOptions = { frontSize: number; frontBold: boolean; backSize: number; backBold: boolean; lineColor: string };
// Font sizes in points for the Aadhaar number and VID on each side.
export type NumberSizes = { frontNumber: number; frontVid: number; backNumber: number; backVid: number };
export const DEFAULT_NUMBER_SIZES: NumberSizes = { frontNumber: 13.5, frontVid: 7.8, backNumber: 13.5, backVid: 7.8 };
export type CleanOptions = {
  sizes: NumberSizes;
  photoScale: number;
  photoBorder: number;
  qrScale: number;
  elements: CardElements;
  offsets: CardOffsets;
  footer: FooterOptions;
};

export type CardSettings = {
  adjust: CardAdjust;
  design: AadhaarDesign;
  clean: CleanOptions;
  aadhaar: AadhaarEditOptions;
  outline: boolean;
  a4Copies: number;
  // Card printers feed some cards upside down; these turn a face 180 degrees.
  rotateFront: boolean;
  rotateBack: boolean;
  // Small text such as "PDF PRINTOUT" on the front; "" for none.
  stamp: string;
  // e-EPIC card (clean and original): text scales and line gaps (1 = as
  // printed on the letter), bold, cleaned photo.
  voter?: { frontScale: number; backScale: number; frontGap: number; backGap: number; boldFront: boolean; boldBack: boolean; photoJpeg: Uint8Array | null };
  // e-PAN card (clean and original): bold values, cleaned photo.
  pan?: { bold: boolean; photoJpeg: Uint8Array | null };
};

export class PdfPasswordError extends Error {
  constructor(public wrong: boolean) {
    super(wrong ? "Incorrect password." : "This PDF is password protected.");
    this.name = "PdfPasswordError";
  }
}

const MM = 72 / 25.4;
export const CARD_W = 85.6 * MM;
export const CARD_H = 54 * MM;
export const ZERO_ADJUST: CardAdjust = { front: { x: 0, y: 0, zx: 0, zy: 0 }, back: { x: 0, y: 0, zx: 0, zy: 0 } };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfJs = any;
let pdfjsPromise: Promise<PdfJs> | null = null;
function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

let corePromise: Promise<AadhaarCore> | null = null;
function loadCore(): Promise<AadhaarCore> {
  if (!corePromise) corePromise = Promise.all([import("@cantoo/pdf-lib"), loadPdfJs()]).then(([PDFLib, pdfjs]) => makeAadhaarCore(PDFLib, pdfjs));
  return corePromise;
}

async function loadPdfLibDoc(bytes: Uint8Array) {
  const { PDFDocument } = await import("@cantoo/pdf-lib");
  try {
    return await PDFDocument.load(bytes);
  } catch (firstError) {
    // Signed government PDFs sometimes trip pdf-lib's strict parser.
    try {
      return await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
    } catch {
      throw firstError;
    }
  }
}

// @cantoo/pdf-lib decrypts RC4, AES-128 (e-PAN) and AES-256 (e-Aadhaar);
// saving the unlocked document writes it back without encryption.
async function decryptedCopy(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  const { PDFDocument } = await import("@cantoo/pdf-lib");
  try {
    await PDFDocument.load(bytes);
    return bytes;
  } catch (error) {
    if (!/encrypt/i.test(`${(error as Error)?.name} ${(error as Error)?.message}`)) throw error;
  }
  const doc = await PDFDocument.load(bytes, { password });
  return doc.save();
}

export async function loadCardPdf(file: File, password: string): Promise<LoadedCard> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfjs = await loadPdfJs();

  const task = pdfjs.getDocument({ data: bytes.slice(0), password: password || undefined, isEvalSupported: false });
  let pdf;
  try {
    pdf = await task.promise;
  } catch (error) {
    if (error && typeof error === "object" && (error as { name?: string }).name === "PasswordException") {
      throw new PdfPasswordError(Boolean(password));
    }
    throw error;
  }

  const pageSizes: { w: number; h: number }[] = [];
  const texts: string[] = [];
  const rotated: LoadedCard["rotated"] = [];
  const firstPageText: TextItem[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const view = page.getViewport({ scale: 1 });
    pageSizes.push({ w: view.width, h: view.height });
    const content = await page.getTextContent();
    const items = content.items as Array<{ str?: string; transform?: number[]; width?: number }>;
    texts.push(items.map((item) => item.str || "").join(" "));
    if (n === 1) {
      for (const item of items) {
        if (!item.str?.trim() || !item.transform) continue;
        const box = rotatedBox(item.transform, item.width || 0);
        if (box) rotated.push(box);
        else firstPageText.push({ x: item.transform[4], y: item.transform[5], w: item.width || 0, size: Math.abs(item.transform[3]) });
      }
    }
  }
  const allText = texts.join(" ");
  const type = detectCardType(allText);
  const numbers = readNumbers(allText);

  // pdf-lib needs an unencrypted copy. Owner-only encrypted files open in
  // pdf.js without a password but still need decrypting here.
  let plain: Uint8Array | null = null;
  let doc = null;
  try {
    plain = await decryptedCopy(bytes, password);
    doc = await loadPdfLibDoc(plain);
  } catch (error) {
    console.error("pdf-lib could not open this PDF, cutting from rendered pages", error);
    plain = null;
  }

  const templateBoxes = (): Record<Face, FaceBox> => {
    const template = getCardTemplate(type.key, pageSizes.length);
    const toBox = (face: Face): FaceBox => {
      const { page, rect } = template[face];
      const index = Math.min(Math.max(page - 1, 0), pageSizes.length - 1);
      const { w, h } = pageSizes[index];
      return { page: index, x0: (rect.x / 100) * w, x1: ((rect.x + rect.width) / 100) * w, top: (rect.y / 100) * h, bottom: ((rect.y + rect.height) / 100) * h };
    };
    return { front: toBox("front"), back: toBox("back") };
  };

  if (!doc || !plain) {
    const pageImages: string[] = [];
    for (let n = 1; n <= pdf.numPages; n++) pageImages.push(await renderPageImage(await pdf.getPage(n)));
    await task.destroy();
    return {
      fileName: file.name,
      type,
      mode: "raster",
      pageSizes,
      plain: null,
      meta: null,
      base: templateBoxes(),
      pageImages,
      numbers,
      rotated,
      notice: "This PDF's structure only allowed an image-based cut, so text is not selectable on the printed card.",
    };
  }
  await task.destroy();

  if (type.key === "aadhaar") {
    try {
      const core = await loadCore();
      const meta = await core.inspect(plain);
      if (meta.layoutOK) {
        return {
          fileName: file.name,
          type,
          mode: "aadhaar",
          pageSizes,
          plain,
          meta,
          base: { front: { page: 0, ...meta.front }, back: { page: 0, ...meta.back } },
          pageImages: [],
          numbers,
          rotated,
          notice: "",
        };
      }
    } catch (error) {
      console.error("Aadhaar layout inspection failed, using crop template", error);
    }
    return {
      fileName: file.name,
      type,
      mode: "crop",
      pageSizes,
      plain,
      meta: null,
      base: templateBoxes(),
      pageImages: [],
      numbers,
      rotated,
      notice: "This Aadhaar PDF differs from the standard e-Aadhaar letter, so text options are off. Use Adjust Card to line up the cut.",
    };
  }

  if (type.key === "voter_id") {
    try {
      const voter = await inspectVoter(doc, (await loadCore()).tokenize, firstPageText);
      if (voter) {
        const h = pageSizes[0].h;
        const toBox = (b: VoterLayout["front"]): FaceBox => ({ page: 0, x0: b.x0, x1: b.x1, top: h - b.y1, bottom: h - b.y0 });
        return { fileName: file.name, type, mode: "voter", pageSizes, plain, meta: null, base: { front: toBox(voter.front), back: toBox(voter.back) }, pageImages: [], numbers, rotated, voter, notice: "" };
      }
    } catch (error) {
      console.error("e-EPIC layout inspection failed, using crop template", error);
    }
  }

  if (type.key === "pan") {
    try {
      const pan = await inspectPan(doc, (await loadCore()).tokenize);
      if (pan) {
        const h = pageSizes[0].h;
        const toBox = (b: PanLayout["front"]): FaceBox => ({ page: 0, x0: b.x0, x1: b.x1, top: h - b.y1, bottom: h - b.y0 });
        return { fileName: file.name, type, mode: "pan", pageSizes, plain, meta: null, base: { front: toBox(pan.front), back: toBox(pan.back) }, pageImages: [], numbers, rotated, pan, notice: "" };
      }
    } catch (error) {
      console.error("e-PAN layout inspection failed, using crop template", error);
    }
  }

  return { fileName: file.name, type, mode: "crop", pageSizes, plain, meta: null, base: templateBoxes(), pageImages: [], numbers, rotated, notice: "" };
}

// Bounding box of a rotated pdf.js text item; null for horizontal text.
function rotatedBox(t: number[], width: number) {
  const [a, b, c, d, e, f] = t;
  if (Math.abs(b) < 0.01 && Math.abs(c) < 0.01) return null;
  const len = Math.hypot(a, b) || 1;
  const size = Math.hypot(c, d) || len;
  const dir = [a / len, b / len], up = [c / size, d / size];
  const pts = [-0.28, 1.02].flatMap((u) => [0, width].map((w) => [e + dir[0] * w + up[0] * u * size, f + dir[1] * w + up[1] * u * size]));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

function readNumbers(text: string) {
  const vidMatch = text.match(/VID\s*:?\s*(\d{4}\s?\d{4}\s?\d{4}\s?\d{4})/i);
  const vid = vidMatch ? vidMatch[1].replace(/\s+/g, "").replace(/(\d{4})(?=\d)/g, "$1 ") : "";
  // Drop the VID first: its first 12 digits would also look like an Aadhaar number.
  const rest = vidMatch ? text.replace(vidMatch[0], " ") : text;
  const aadhaarMatch = rest.match(/(?:^|[^\dX])([\dX]{4}\s[\dX]{4}\s\d{4})(?![\d])/);
  return { aadhaar: aadhaarMatch ? aadhaarMatch[1] : "", vid };
}

// Renders `region` (top-left page units) of page 1 of `bytes` onto a canvas.
async function renderRegion(bytes: Uint8Array, region: PanCut, scale: number): Promise<HTMLCanvasElement> {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({ data: bytes.slice(0), isEvalSupported: false });
  try {
    const page = await (await task.promise).getPage(1);
    const viewport = page.getViewport({ scale, offsetX: -region.x0 * scale, offsetY: -region.top * scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil((region.x1 - region.x0) * scale);
    canvas.height = Math.ceil((region.bottom - region.top) * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    return canvas;
  } finally {
    await task.destroy();
  }
}

async function renderPageImage(page: { getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: object) => { promise: Promise<void> } }) {
  const base = page.getViewport({ scale: 1 });
  const view = page.getViewport({ scale: Math.min(4, 2400 / base.width) });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(view.width);
  canvas.height = Math.ceil(view.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  await page.render({ canvas, canvasContext: context, viewport: view }).promise;
  return canvas.toDataURL("image/jpeg", 0.95);
}

export function adjustedBox(box: FaceBox, adjust: FaceAdjust, pageSize: { w: number; h: number }): FaceBox {
  const x0 = box.x0 + adjust.x + adjust.zx / 2;
  const x1 = box.x1 + adjust.x - adjust.zx / 2;
  const top = box.top + adjust.y + adjust.zy / 2;
  const bottom = box.bottom + adjust.y - adjust.zy / 2;
  return {
    page: box.page,
    x0: Math.max(0, Math.min(x0, x1 - 20)),
    x1: Math.min(pageSize.w, Math.max(x1, x0 + 20)),
    top: Math.max(0, Math.min(top, bottom - 12)),
    bottom: Math.min(pageSize.h, Math.max(bottom, top + 12)),
  };
}

// Builds the requested output. Returns the PDF bytes plus any layout notes
// from the Aadhaar core (e.g. "text is at the largest size that fits").
export async function buildCardPdf(card: LoadedCard, settings: CardSettings, kind: OutputKind): Promise<{ bytes: Uint8Array; notes: string[] }> {
  const { PDFDocument, rgb, StandardFonts, pushGraphicsState, popGraphicsState, concatTransformationMatrix } = await import("@cantoo/pdf-lib");
  const out = await PDFDocument.create();
  const faces = (["front", "back"] as const).map((face) => adjustedBox(card.base[face], settings.adjust[face], card.pageSizes[card.base[face].page]));
  let notes: string[] = [];

  // One drawable per face: an embedded vector page, or a cropped image in raster mode.
  type Drawable = { draw: (page: ReturnType<typeof out.addPage>, x: number, y: number) => void };
  const drawables: Drawable[] = [];

  if (card.mode === "raster" || !card.plain) {
    for (const face of faces) {
      const jpeg = await cropPageImage(card.pageImages[face.page], face, card.pageSizes[face.page]);
      const image = await out.embedJpg(jpeg);
      drawables.push({ draw: (page, x, y) => page.drawImage(image, { x, y, width: CARD_W, height: CARD_H }) });
    }
  } else {
    const src = await loadPdfLibDoc(card.plain);
    if (card.mode === "aadhaar" && card.meta && settings.design === "clean") {
      drawables.push(...(await buildCleanAadhaar(out, src, card, card.meta, settings)));
    } else if (card.mode === "aadhaar" && card.meta) {
      const core = await loadCore();
      notes = await core.applyEdits(src, card.meta, settings.aadhaar);
    } else if (card.mode === "voter" && card.voter) {
      const clean = settings.design === "clean";
      const photoBorder = clean && settings.clean.elements.photoFrame ? settings.clean.photoBorder : 0;
      const voter = { frontScale: 1, backScale: 1, frontGap: 1, backGap: 1, boldFront: false, boldBack: false, photoJpeg: null, ...settings.voter };
      const built = await buildVoterCard(out, src, card.voter, faces, { clean, photoBorder, ...voter }, (await loadCore()).tokenize, CARD_W, CARD_H);
      drawables.push(...built.drawables);
      notes = built.notes;
    } else if (card.mode === "pan" && card.pan) {
      const pan = { bold: false, photoJpeg: null, ...settings.pan };
      drawables.push(...(await buildPanCard(out, src, card.plain, card.pan, faces, { clean: settings.design === "clean", ...pan }, (await loadCore()).tokenize, renderRegion, CARD_W, CARD_H)));
    }
    if (!drawables.length) for (const face of faces) {
      const srcPage = src.getPage(face.page);
      const h = srcPage.getHeight();
      const embedded = await out.embedPage(srcPage, { left: face.x0, right: face.x1, top: h - face.top, bottom: h - face.bottom });
      drawables.push({ draw: (page, x, y) => page.drawPage(embedded, { x, y, width: CARD_W, height: CARD_H }) });
    }
  }

  const outline = (page: ReturnType<typeof out.addPage>, x: number, y: number) => {
    if (settings.outline) page.drawRectangle({ x, y, width: CARD_W, height: CARD_H, borderColor: rgb(0.62, 0.62, 0.62), borderWidth: 0.4 });
  };

  const stampFont = settings.stamp ? await out.embedFont(StandardFonts.HelveticaBold) : null;
  const cleanLayout = card.mode === "aadhaar" && settings.design === "clean";
  const drawStamp = (page: ReturnType<typeof out.addPage>, x: number, y: number) => {
    if (!stampFont) return;
    const size = 4.8;
    const w = stampFont.widthOfTextAtSize(settings.stamp, size);
    // Clean card: just above the red line on the right; otherwise the bottom-right corner.
    const baseline = cleanLayout ? y + CARD_H - (CLEAN.frontRule + settings.clean.offsets.frontFooter - 2) : y + 2.6;
    page.drawText(settings.stamp, { x: x + CARD_W - 4 - w, y: baseline, size, font: stampFont, color: rgb(0.35, 0.35, 0.35) });
  };
  // Draws face i at (x, y), turned 180 degrees about the card centre when asked.
  const place = (page: ReturnType<typeof out.addPage>, i: number, x: number, y: number) => {
    const rotate = i === 0 ? settings.rotateFront : settings.rotateBack;
    if (rotate) page.pushOperators(pushGraphicsState(), concatTransformationMatrix(-1, 0, 0, -1, 2 * x + CARD_W, 2 * y + CARD_H));
    drawables[i].draw(page, x, y);
    if (i === 0) drawStamp(page, x, y);
    if (rotate) page.pushOperators(popGraphicsState());
  };

  if (kind === "card") {
    drawables.forEach((_, i) => place(out.addPage([CARD_W, CARD_H]), i, 0, 0));
  } else if (kind === "a4") {
    const pw = 595.28, ph = 841.89, gap = 6 * MM, rowGap = 6 * MM, top = 12 * MM;
    const x0 = (pw - (2 * CARD_W + gap)) / 2;
    const page = out.addPage([pw, ph]);
    const rows = Math.max(1, Math.min(5, settings.a4Copies));
    for (let row = 0; row < rows; row++) {
      const y = ph - top - CARD_H - row * (CARD_H + rowGap);
      drawables.forEach((_, i) => {
        const x = x0 + i * (CARD_W + gap);
        place(page, i, x, y);
        outline(page, x, y);
      });
    }
  } else {
    const pw = 4 * 72, ph = 6 * 72, gap = 8 * MM;
    const x = (pw - CARD_W) / 2, y1 = (ph + gap) / 2;
    const page = out.addPage([pw, ph]);
    drawables.forEach((_, i) => {
      const y = i === 0 ? y1 : y1 - gap - CARD_H;
      place(page, i, x, y);
      outline(page, x, y);
    });
  }

  out.setTitle(`${card.type.label} - ${kind === "card" ? "front and back" : kind === "a4" ? "A4 sheet" : "4x6 sheet"}`);
  out.setProducer("RepetiGo ID Card Maker");
  return { bytes: await out.save(), notes };
}

// ---------- clean e-Aadhaar design ----------
// Static artwork in /public/idcard: the UIDAI / Government of India header
// strips and Noto Sans Devanagari (OFL) for the "मेरा आधार, मेरी पहचान" footer.
const CLEAN_ASSETS = {
  headerFront: "/idcard/aadhaar-header-front.jpg",
  headerBack: "/idcard/aadhaar-header-back.jpg",
  devanagariBold: "/idcard/NotoSansDevanagari-Bold.woff",
  devanagariRegular: "/idcard/NotoSansDevanagari-Regular.woff",
};
let cleanAssetsPromise: Promise<Record<keyof typeof CLEAN_ASSETS, Uint8Array>> | null = null;
function loadCleanAssets() {
  if (!cleanAssetsPromise) {
    cleanAssetsPromise = Promise.all(
      Object.entries(CLEAN_ASSETS).map(async ([key, url]) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Could not load ${url}`);
        return [key, new Uint8Array(await response.arrayBuffer())] as const;
      }),
    ).then((entries) => Object.fromEntries(entries) as Record<keyof typeof CLEAN_ASSETS, Uint8Array>);
    cleanAssetsPromise.catch(() => {
      cleanAssetsPromise = null;
    });
  }
  return cleanAssetsPromise;
}

// Layout measured from the reference card (points, from the card's top-left).
const CLEAN = {
  header: { x: 3, top: 3, w: CARD_W - 6 },
  photo: { x: 15.4, top: 40, w: 60.7, h: 78.2, maxBottom: 130.5 },
  textGap: 5,
  textBottom: 103.5,
  // Number/VID sit on the footer line: gaps are measured up from it.
  frontVid: { aboveRule: 4.6, gap: 6.5 },
  frontNumberAlone: 5,
  frontRule: 132.5,
  frontFooter: { maxW: 228 },
  address: { x: 13.4, top: 36.5, bottom: 107 },
  // `size` is the reference QR box including the image's white quiet zone.
  qr: { x: 162, top: 39.6, size: 73, right: CARD_W - 5, trimMargin: 1 },
  backNumber: { center: 117.6 },
  backVid: { aboveRule: 2.5, gap: 1.65 },
  backNumberAlone: 4.5,
  backRule: 129.8,
  backFooter: { maxW: 228 },
  date: { x: 4.2, frontTop: 42, backTop: 38 },
};
const TEXT_SCALE = 1.3; // front details print ~1.3x the letter's size at 100%
const ADDRESS_SCALE = 1.1;
// Noto Sans Devanagari ink reaches 0.895em above and 0.17em below the baseline.
const DEVANAGARI_ASCENT = 0.895;
const DEVANAGARI_INK = 1.065;
// QR can shrink/grow between these (1 = the reference card's size).
export const QR_SCALE_RANGE = [0.8, 1.2] as const;

// Lucide-style icons (24-unit viewBox) for the back footer.
const ICONS = {
  phone:
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6",
  globe: "M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
};

type Box = { x0: number; x1: number; y0: number; y1: number };

// "#rrggbb" -> pdf-lib colour, falling back when the value is not a hex colour.
function hexColor<C>(hex: string, fallback: C, rgb: (r: number, g: number, b: number) => C): C {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

// Front text, the address, the dates and the QR are clipped straight out of
// the original letter (vector), so the Hindi keeps its exact shaping - pdf.js
// text for the letter's Devanagari is not reliable enough to retype it.
async function buildCleanAadhaar(out: PDFDocument, src: PDFDocument, card: LoadedCard, meta: AadhaarMeta, settings: CardSettings) {
  const { rgb, StandardFonts } = await import("@cantoo/pdf-lib");
  const opts = settings.aadhaar;
  const { elements: el, offsets: off } = settings.clean;
  const fit = el.autoAlign;
  if (opts.boldFront || opts.boldBack) {
    // Only the bold effect; positions stay where the letter has them.
    const core = await loadCore();
    await core.applyEdits(src, meta, { frontScale: 1, backScale: 1, frontSpacing: 1, backSpacing: 1, boldFront: opts.boldFront, boldBack: opts.boldBack });
  }
  const srcPage = src.getPage(0);
  const assets = await loadCleanAssets();
  const [headerFront, headerBack] = await Promise.all([out.embedJpg(assets.headerFront), out.embedJpg(assets.headerBack)]);
  const bold = await out.embedFont(StandardFonts.HelveticaBold);
  const regular = await out.embedFont(opts.boldFront ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
  const helvetica = await out.embedFont(StandardFonts.Helvetica);
  const foot = settings.clean.footer;
  let devanagari: Awaited<ReturnType<typeof out.embedFont>> | null = null;
  if (el.frontFooterText) {
    const fontkitModule = await import("@cantoo/fontkit");
    out.registerFontkit(((fontkitModule as { default?: unknown }).default || fontkitModule) as Parameters<typeof out.registerFontkit>[0]);
    devanagari = await out.embedFont(foot.frontBold ? assets.devanagariBold : assets.devanagariRegular, { subset: true });
  }
  const red = rgb(0.87, 0.13, 0.16);
  const black = rgb(0, 0, 0);
  const accent = el.coloredFooter ? red : black;
  const lineColor = hexColor(foot.lineColor, red, rgb);

  // ---- front layout ----
  const scalePhoto = Math.max(0.8, Math.min(1.25, settings.clean.photoScale || 1));
  const photoTop = CLEAN.photo.top + off.photo;
  let photoH = CLEAN.photo.h * scalePhoto;
  photoH = Math.min(photoH, CLEAN.photo.maxBottom - photoTop);
  const photoBox = { x: CLEAN.photo.x, top: photoTop, w: (photoH * CLEAN.photo.w) / CLEAN.photo.h, h: photoH };

  const photoJpeg = opts.photoJpeg || meta.photo?.jpeg;
  let drawPhoto: (page: PDFPage, x: number, top: (t: number) => number) => void = () => undefined;
  if (photoJpeg) {
    const image = await out.embedJpg(photoJpeg);
    const k = Math.min(photoBox.w / image.width, photoBox.h / image.height);
    photoBox.w = image.width * k;
    photoBox.h = image.height * k;
    drawPhoto = (page, x, top) => page.drawImage(image, { x: x + photoBox.x, y: top(photoBox.top + photoBox.h), width: photoBox.w, height: photoBox.h });
  } else if (meta._.photoImg) {
    const im = meta._.photoImg;
    const embedded = await out.embedPage(srcPage, { left: im.x0, right: im.x1, bottom: im.y0, top: im.y1 });
    const k = Math.min(photoBox.w / (im.x1 - im.x0), photoBox.h / (im.y1 - im.y0));
    photoBox.w = (im.x1 - im.x0) * k;
    photoBox.h = (im.y1 - im.y0) * k;
    drawPhoto = (page, x, top) => page.drawPage(embedded, { x: x + photoBox.x, y: top(photoBox.top + photoBox.h), width: photoBox.w, height: photoBox.h });
  }

  const textX = photoBox.x + photoBox.w + CLEAN.textGap;
  const lines = meta._.frontLines;
  const maxLineW = Math.max(...lines.map((L) => L.w || 1));
  const eff = lines[lines.length - 1].eff;
  let s = TEXT_SCALE * (opts.frontScale || 1);
  if (fit) s = Math.min(s, (CARD_W - 4 - textX) / (maxLineW + 1.5));
  const mobileText = opts.mobile ? `Mobile No: ${opts.mobile}` : "";
  const rows = lines.length + (mobileText ? 1 : 0);
  const firstBaseline = CLEAN.photo.top + eff * s * 1.3;
  let pitch = ((eff * s * 1.47) / 0.9) * (opts.frontSpacing || 0.9);
  if (fit && firstBaseline + (rows - 1) * pitch > CLEAN.textBottom) pitch = (CLEAN.textBottom - firstBaseline) / Math.max(1, rows - 1);
  const frontLines = await Promise.all(
    lines.map((L) => out.embedPage(srcPage, { left: L.x - 0.5, right: L.x + L.w + 1.5, bottom: L.y - L.eff * 0.42, top: L.y + L.eff * 1.05 })),
  );
  let mobileSize = eff * s;
  if (mobileText && fit) mobileSize = Math.min(mobileSize, (CARD_W - 4 - textX) / (regular.widthOfTextAtSize(mobileText, 1) || 1));

  const fitSize = (text: string, font: typeof bold, size: number, maxW: number) => (fit ? Math.min(size, maxW / (font.widthOfTextAtSize(text, 1) || 1)) : size);
  const sizes = settings.clean.sizes || DEFAULT_NUMBER_SIZES;
  const frontNumberSize = fitSize(card.numbers.aadhaar, bold, sizes.frontNumber, CARD_W - 4 - textX);
  const showFrontVid = el.frontVid && Boolean(card.numbers.vid);
  // With the VID hidden the number drops down to sit just above the footer line.
  const frontRuleLine = CLEAN.frontRule + off.frontFooter;
  const frontVidBaseline = frontRuleLine - CLEAN.frontVid.aboveRule;
  const frontNumberBaseline = showFrontVid ? frontVidBaseline - sizes.frontVid * 0.75 - CLEAN.frontVid.gap : frontRuleLine - CLEAN.frontNumberAlone;

  // Rotated "Aadhaar no. issued" (front) and "Details as on" (back) dates.
  const T = (y: number) => meta.H - y;
  const inRegion = (b: Box, r: { x0: number; x1: number; top: number; bottom: number }) => {
    const cx = (b.x0 + b.x1) / 2, ct = T((b.y0 + b.y1) / 2);
    return cx >= r.x0 && cx <= r.x1 && ct >= r.top && ct <= r.bottom;
  };
  const union = (boxes: Box[]): Box | null =>
    boxes.length ? { x0: Math.min(...boxes.map((b) => b.x0)), x1: Math.max(...boxes.map((b) => b.x1)), y0: Math.min(...boxes.map((b) => b.y0)), y1: Math.max(...boxes.map((b) => b.y1)) } : null;
  const embedBox = (b: Box | null) => (b ? out.embedPage(srcPage, { left: b.x0, right: b.x1, bottom: b.y0, top: b.y1 }) : null);
  const [issueDate, detailsDate] = await Promise.all([
    el.issueDate ? embedBox(union(card.rotated.filter((b) => inRegion(b, meta.front)))) : null,
    el.detailsDate ? embedBox(union(card.rotated.filter((b) => inRegion(b, meta.back)))) : null,
  ]);

  // ---- back layout ----
  const back = meta._.backLines;
  const qr = meta._.qrImg;
  const blockLeft = Math.min(...back.map((L) => L.x)) - 0.5;
  const blockRight = Math.min(Math.max(...back.map((L) => L.x + L.w)) + 1.5, qr ? qr.x0 - 0.5 : Infinity);
  const blockTop = Math.max(...back.map((L) => L.y + L.eff * 1.05));
  const blockBottom = Math.min(...back.map((L) => L.y - L.eff * 0.42));
  // Clip the QR to its black modules (plus a hair of white) so the image's
  // own quiet zone does not eat into the address; the modules print at the
  // same size as before, the box just loses its empty border.
  const ink = qr && meta._.qrInk;
  const qrClip = qr && ink
    ? { x0: Math.max(qr.x0, ink.x0 - CLEAN.qr.trimMargin), x1: Math.min(qr.x1, ink.x1 + CLEAN.qr.trimMargin), y0: Math.max(qr.y0, ink.y0 - CLEAN.qr.trimMargin), y1: Math.min(qr.y1, ink.y1 + CLEAN.qr.trimMargin) }
    : qr;
  const qrTrim = qr && qrClip ? (qrClip.x1 - qrClip.x0) / (qr.x1 - qr.x0) : 1;
  // QR keeps its top-right corner and grows left/down, never into the footer line.
  const qrRight = ink ? CLEAN.qr.right : CLEAN.qr.x + CLEAN.qr.size;
  const qrMaxSize = CLEAN.backRule + off.backFooter - 2 - CLEAN.qr.top;
  const qrSize = Math.min(CLEAN.qr.size * qrTrim * Math.max(QR_SCALE_RANGE[0], Math.min(QR_SCALE_RANGE[1], settings.clean.qrScale || 1)), qrMaxSize);
  const qrX = qrRight - qrSize;
  const qrBottom = CLEAN.qr.top + qrSize;
  const qrLeft = qr ? qrX : CARD_W - 4;
  const availW = qrLeft - 3 - CLEAN.address.x;
  const availH = CLEAN.address.bottom - CLEAN.address.top;
  let sb = ADDRESS_SCALE * (opts.backScale || 1);
  if (fit) sb = Math.min(sb, availW / (blockRight - blockLeft), availH / (blockTop - blockBottom));
  const address = back.length ? await out.embedPage(srcPage, { left: blockLeft, right: blockRight, bottom: blockBottom, top: blockTop }) : null;
  // The letter's Aadhaar number overlaps the QR's box, so clip the QR from a
  // text-free copy of the page.
  let qrEmbed = null;
  if (qr && card.plain) {
    const imagesOnly = await loadPdfLibDoc(card.plain);
    (await loadCore()).stripText(imagesOnly);
    const c = qrClip || qr;
    qrEmbed = await out.embedPage(imagesOnly.getPage(0), { left: c.x0, right: c.x1, bottom: c.y0, top: c.y1 });
  }
  // Number and VID share one centre. Where either would run into the QR,
  // the pair slides left just enough to clear it, shrinking only if needed.
  const showBackVid = el.backVid && Boolean(card.numbers.vid);
  const backRuleLine = CLEAN.backRule + off.backFooter;
  const backVidBaseline = backRuleLine - CLEAN.backVid.aboveRule;
  const backNumberBaseline = showBackVid ? backVidBaseline - sizes.backVid * 0.75 - CLEAN.backVid.gap : backRuleLine - CLEAN.backNumberAlone;
  const vidText = `VID : ${card.numbers.vid}`;
  let backNumberSize = fitSize(card.numbers.aadhaar, bold, sizes.backNumber, CARD_W - 8);
  let backVidSize = fitSize(vidText, regular, sizes.backVid, CARD_W - 8);
  const clearRight = qrX - 2;
  const hitsQr = (textTop: number) => Boolean(qrEmbed) && qrBottom > textTop + 0.5;
  const numberHits = hitsQr(backNumberBaseline - backNumberSize * 0.72);
  const vidHits = showBackVid && hitsQr(backVidBaseline - backVidSize * 0.72);
  let backCenter = CLEAN.backNumber.center;
  if (numberHits || vidHits) {
    const span = clearRight - 4;
    if (numberHits) backNumberSize = Math.min(backNumberSize, span / (bold.widthOfTextAtSize(card.numbers.aadhaar, 1) || 1));
    if (vidHits) backVidSize = Math.min(backVidSize, span / (regular.widthOfTextAtSize(vidText, 1) || 1));
    const widest = Math.max(
      numberHits ? bold.widthOfTextAtSize(card.numbers.aadhaar, backNumberSize) : 0,
      vidHits ? regular.widthOfTextAtSize(vidText, backVidSize) : 0,
    );
    backCenter = Math.max(4 + widest / 2, Math.min(backCenter, clearRight - widest / 2));
  }
  const numberCenter = backCenter;
  const vidCenter = backCenter;
  const frontVidSize = fitSize(vidText, regular, sizes.frontVid, CARD_W - 4 - textX);

  // ---- header / footer pieces ----
  const header = (page: PDFPage, image: typeof headerFront, shift: number, x: number, top: (t: number) => number) => {
    const h = (CLEAN.header.w * image.height) / image.width;
    page.drawImage(image, { x: x + CLEAN.header.x, y: top(CLEAN.header.top + shift + h), width: CLEAN.header.w, height: h });
  };
  const rule = (page: PDFPage, at: number, x: number, top: (t: number) => number) =>
    page.drawLine({ start: { x: x + 2.8, y: top(at) }, end: { x: x + CARD_W - 2.8, y: top(at) }, thickness: 0.9, color: lineColor });

  // "मेरा  आधार, मेरी  पहचान" as real text: Devanagari words in Noto Sans, the
  // comma in Helvetica (the Devanagari subset has no Latin punctuation).
  const frontWords = ["मेरा", "आधार", "मेरी", "पहचान"];
  const wordGap = 0.6;
  const commaFont = foot.frontBold ? bold : helvetica;
  const frontFooterUnit = devanagari ? frontWords.reduce((sum, word) => sum + devanagari!.widthOfTextAtSize(word, 1), 0) + commaFont.widthOfTextAtSize(",", 1) + wordGap * 3 : 0;
  const frontRuleAt = CLEAN.frontRule + off.frontFooter;
  // Largest size whose ink still fits between the red line and the card edge.
  const frontFooterFit = (CARD_H - frontRuleAt - 1.5) / DEVANAGARI_INK;
  const frontFooterSize = frontFooterUnit ? Math.max(4, Math.min(foot.frontSize, frontFooterFit, CLEAN.frontFooter.maxW / frontFooterUnit)) : 0;
  const drawFrontFooter = (page: PDFPage, x: number, top: (t: number) => number) => {
    if (!devanagari) return;
    const size = frontFooterSize;
    // Centre the ink in the band below the line.
    const inkTop = frontRuleAt + Math.max(1.2, (CARD_H - frontRuleAt - DEVANAGARI_INK * size) / 2);
    const baseline = top(inkTop + DEVANAGARI_ASCENT * size);
    let cx = x + (CARD_W - frontFooterUnit * size) / 2;
    frontWords.forEach((word, i) => {
      page.drawText(word, { x: cx, y: baseline, size, font: devanagari!, color: i === 1 ? accent : black });
      cx += devanagari!.widthOfTextAtSize(word, size);
      if (i === 1) {
        page.drawText(",", { x: cx, y: baseline, size, font: commaFont, color: black });
        cx += commaFont.widthOfTextAtSize(",", size);
      }
      cx += wordGap * size;
    });
  };

  // "☎ 1947 | ✉ help@uidai.gov.in | 🌐 www.uidai.gov.in" as real text with vector icons.
  const backItems: Array<{ icon: keyof typeof ICONS; text: string }> = [
    { icon: "phone", text: "1947" },
    { icon: "mail", text: "help@uidai.gov.in" },
    { icon: "globe", text: "www.uidai.gov.in" },
  ];
  const iconGap = 0.35, sepGap = 0.75; // in ems
  const backFont = foot.backBold ? bold : helvetica;
  const backUnit = backItems.reduce((sum, item) => sum + 1 + iconGap + backFont.widthOfTextAtSize(item.text, 1), 0) + sepGap * 2 * (backItems.length - 1);
  const backRuleAt = CLEAN.backRule + off.backFooter;
  const backFooterSize = Math.max(4, Math.min(foot.backSize, (CARD_H - backRuleAt - 2) / 1.05, CLEAN.backFooter.maxW / backUnit));
  const drawBackFooter = (page: PDFPage, x: number, top: (t: number) => number) => {
    const size = backFooterSize;
    // Icons/text span ~0.86em above to ~0.14em below the baseline; centre that band.
    const baselineTop = backRuleAt + Math.max(1.5, (CARD_H - backRuleAt - size) / 2) + size * 0.86;
    let cx = x + (CARD_W - backUnit * size) / 2;
    backItems.forEach((item, i) => {
      const iconSize = size * 1.0;
      const iconTopY = top(baselineTop - size * 0.86);
      page.drawSvgPath(ICONS[item.icon], {
        x: cx,
        y: iconTopY,
        scale: iconSize / 24,
        ...(item.icon === "phone" ? { color: accent } : { borderColor: accent, borderWidth: foot.backBold ? 2.4 : 1.7 }),
      });
      cx += iconSize + iconGap * size;
      page.drawText(item.text, { x: cx, y: top(baselineTop), size, font: backFont, color: black });
      cx += backFont.widthOfTextAtSize(item.text, size);
      if (i < backItems.length - 1) {
        cx += sepGap * size;
        page.drawLine({ start: { x: cx, y: top(baselineTop + size * 0.3) }, end: { x: cx, y: top(baselineTop - size * 1.0) }, thickness: foot.backBold ? 0.7 : 0.45, color: black });
        cx += sepGap * size;
      }
    });
  };

  const drawDate = (page: PDFPage, embedded: Awaited<ReturnType<typeof embedBox>>, topAt: number, x: number, top: (t: number) => number) => {
    if (!embedded) return;
    page.drawPage(embedded, { x: x + CLEAN.date.x, y: top(topAt + embedded.height), width: embedded.width, height: embedded.height });
  };

  const front = (page: PDFPage, x: number, y: number) => {
    const top = (t: number) => y + CARD_H - t;
    if (el.frontHeader) header(page, headerFront, off.frontHeader, x, top);
    drawDate(page, issueDate, CLEAN.date.frontTop, x, top);
    drawPhoto(page, x, top);
    if (el.photoFrame && settings.clean.photoBorder > 0) {
      const b = settings.clean.photoBorder;
      page.drawRectangle({ x: x + photoBox.x - b / 2, y: top(photoBox.top + photoBox.h) - b / 2, width: photoBox.w + b, height: photoBox.h + b, borderColor: black, borderWidth: b });
    }
    lines.forEach((L, i) => {
      const baseline = firstBaseline + i * pitch;
      const e = frontLines[i];
      page.drawPage(e, { x: x + textX - 0.5 * s, y: top(baseline) - L.eff * 0.42 * s, width: e.width * s, height: e.height * s });
    });
    if (mobileText) page.drawText(mobileText, { x: x + textX, y: top(firstBaseline + lines.length * pitch), size: mobileSize, font: regular, color: black });
    if (card.numbers.aadhaar) page.drawText(card.numbers.aadhaar, { x: x + textX, y: top(frontNumberBaseline), size: frontNumberSize, font: bold, color: black });
    if (showFrontVid) page.drawText(vidText, { x: x + textX + 1, y: top(frontVidBaseline), size: frontVidSize, font: regular, color: black });
    if (el.frontFooterLine) rule(page, CLEAN.frontRule + off.frontFooter, x, top);
    if (el.frontFooterText) drawFrontFooter(page, x, top);
  };

  const backFace = (page: PDFPage, x: number, y: number) => {
    const top = (t: number) => y + CARD_H - t;
    if (el.backHeader) header(page, headerBack, off.backHeader, x, top);
    drawDate(page, detailsDate, CLEAN.date.backTop, x, top);
    if (address) page.drawPage(address, { x: x + CLEAN.address.x, y: top(CLEAN.address.top) - address.height * sb, width: address.width * sb, height: address.height * sb });
    if (qrEmbed) page.drawPage(qrEmbed, { x: x + qrX, y: top(qrBottom), width: qrSize, height: qrSize });
    if (el.backUid && card.numbers.aadhaar) {
      const w = bold.widthOfTextAtSize(card.numbers.aadhaar, backNumberSize);
      page.drawText(card.numbers.aadhaar, { x: x + numberCenter - w / 2, y: top(backNumberBaseline), size: backNumberSize, font: bold, color: black });
    }
    if (showBackVid) {
      const w = regular.widthOfTextAtSize(vidText, backVidSize);
      page.drawText(vidText, { x: x + vidCenter - w / 2, y: top(backVidBaseline), size: backVidSize, font: regular, color: black });
    }
    if (el.backFooterLine) rule(page, CLEAN.backRule + off.backFooter, x, top);
    if (el.backFooter) drawBackFooter(page, x, top);
  };

  return [{ draw: front }, { draw: backFace }];
}

async function cropPageImage(src: string, box: FaceBox, size: { w: number; h: number }): Promise<Uint8Array> {
  const image = await loadImage(src);
  const kx = image.naturalWidth / size.w, ky = image.naturalHeight / size.h;
  const sw = (box.x1 - box.x0) * kx, sh = (box.bottom - box.top) * ky;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const context = canvas.getContext("2d")!;
  context.drawImage(image, box.x0 * kx, box.top * ky, sw, sh, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.95));
  if (!blob) throw new Error("Could not crop the card image");
  return new Uint8Array(await blob.arrayBuffer());
}

// Renders the 2-page card PDF to one image per face for the on-screen preview.
export async function renderCardPreview(bytes: Uint8Array): Promise<string[]> {
  const pdfjs = await loadPdfJs();
  const task = pdfjs.getDocument({ data: bytes.slice(0), isEvalSupported: false });
  const pdf = await task.promise;
  const images: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const view = page.getViewport({ scale: 3 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(view.width);
    canvas.height = Math.ceil(view.height);
    const context = canvas.getContext("2d")!;
    await page.render({ canvas, canvasContext: context, viewport: view }).promise;
    images.push(canvas.toDataURL("image/png"));
  }
  await task.destroy();
  return images;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = src;
  });
}

// ---------- photo clean-up (ported from the Aadhaar cutter) ----------
export type PhotoParams = { b: number; c: number; s: number; auto: boolean };
export const PHOTO_DEFAULTS: PhotoParams = { b: 0, c: 0, s: 0, auto: false };

// Processing happens at 2x the source size so the result prints a little cleaner.
export function processPhoto(image: HTMLImageElement, p: PhotoParams): HTMLCanvasElement {
  const k = 2, w = image.naturalWidth * k, h = image.naturalHeight * k;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const d = data.data;
  // auto levels (1% / 99% luminance)
  let lo = 0, hi = 255;
  if (p.auto) {
    const hist = new Uint32Array(256);
    const n = w * h;
    for (let i = 0; i < d.length; i += 4) hist[(d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) | 0]++;
    let acc = 0;
    for (lo = 0; lo < 255; lo++) { acc += hist[lo]; if (acc > n * 0.01) break; }
    acc = 0;
    for (hi = 255; hi > 0; hi--) { acc += hist[hi]; if (acc > n * 0.01) break; }
    if (hi - lo < 30) { lo = 0; hi = 255; }
  }
  const bright = p.b * 1.6;
  const cf = (259 * (p.c * 1.6 + 255)) / (255 * (259 - p.c * 1.6));
  const lut = new Uint8ClampedArray(256);
  for (let v = 0; v < 256; v++) lut[v] = cf * ((v - lo) * 255 / (hi - lo) + bright - 128) + 128;
  for (let i = 0; i < d.length; i += 4) { d[i] = lut[d[i]]; d[i + 1] = lut[d[i + 1]]; d[i + 2] = lut[d[i + 2]]; }
  if (p.s > 0) sharpen(d, w, h, (p.s / 100) * 1.5);
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function sharpen(d: Uint8ClampedArray, w: number, h: number, amt: number) {
  const src = new Uint8ClampedArray(d);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = (y * w + x) * 4;
    for (let ch = 0; ch < 3; ch++) {
      const c0 = src[i + ch];
      const blur = (src[i - 4 + ch] + src[i + 4 + ch] + src[i - w * 4 + ch] + src[i + w * 4 + ch]) / 4;
      d[i + ch] = c0 + (c0 - blur) * amt;
    }
  }
}

// ---------- remembered card adjustments, per document type ----------
const ADJUST_KEY = "cafemitra_idcard_adjust";
export function readSavedAdjust(typeKey: string): CardAdjust {
  try {
    const saved = JSON.parse(localStorage.getItem(ADJUST_KEY) || "{}")[typeKey];
    if (saved && saved.front && saved.back) return saved;
  } catch {
    undefined;
  }
  return ZERO_ADJUST;
}
export function saveAdjust(typeKey: string, adjust: CardAdjust) {
  try {
    const all = JSON.parse(localStorage.getItem(ADJUST_KEY) || "{}");
    all[typeKey] = adjust;
    localStorage.setItem(ADJUST_KEY, JSON.stringify(all));
  } catch {
    undefined;
  }
}
