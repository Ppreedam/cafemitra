// e-EPIC (Voter ID) card for the ID Card Maker studio.
//
// The ECI e-EPIC letter paints each card face over one full-size background
// image (colour artwork, national emblem, ECI logo) and strokes a black
// outline around it. Everything else - text, photos, QR, signature, footer
// icons - is drawn on top. The clean card drops the backgrounds, leaving a
// black-on-white card whose text stays real vector text; the original cut
// keeps them. Both drop the outline (no border for thermal / PVC printers).
//
// The front details (name, father's name, gender, DOB) and the back address
// are lifted line by line onto text-only pages so their size, boldness and
// line gap can change; the photo can be swapped for a cleaned copy.
import type { PDFDocument, PDFPage } from "@cantoo/pdf-lib";
import { dropXObjects, mul, readContents, toBytes, type Op, type Tokenize } from "./pdfContent";

export type { Tokenize };

// PDF units, origin bottom-left.
export type VoterBox = { x0: number; y0: number; x1: number; y1: number };
// A block of text lines (baselines top to bottom). `x0` is the left edge,
// `top` the ink top, `floor` how low the ink may reach, `maxScale` the
// largest size whose widest line still fits across the card.
export type VoterLine = { y: number; size: number };
export type VoterText = { x0: number; top: number; floor: number; maxScale: number; lines: VoterLine[] };
// Horizontal text item from pdf.js (PDF units, origin bottom-left, y = baseline).
export type TextItem = { x: number; y: number; w: number; size: number };
export type VoterLayout = {
  front: VoterBox;
  back: VoterBox;
  photo: VoterBox | null;
  photoJpeg: Uint8Array | null;
  details: VoterText | null;
  address: VoterText | null;
};
export type VoterOptions = {
  // false keeps the letter's colour artwork (original cut).
  clean: boolean;
  photoBorder: number;
  frontScale: number;
  backScale: number;
  // Line pitch as a multiple of the letter's (1 = unchanged).
  frontGap: number;
  backGap: number;
  boldFront: boolean;
  boldBack: boolean;
  photoJpeg: Uint8Array | null;
};
export type VoterCut = { x0: number; x1: number; top: number; bottom: number };

type Block = { start: number; end: number; btEnd: number; x: number; y: number };
type Scan = {
  content: string;
  front: VoterBox;
  back: VoterBox;
  backgrounds: Op[];
  outlines: Array<{ start: number; end: number }>;
  blocks: Block[];
  photo: { box: VoterBox; op: Op; name: string } | null;
  smallPhoto: VoterBox | null;
};

// e-EPIC faces are 245 x 154 pt; a CR80 card is 1.585:1.
const CARD_RATIO = 85.6 / 54;
// Line above the "1950 | ceo website" footer on the back, measured up from the card's bottom edge.
const BACK_RULE_UP = 13.5;
const PHOTO_FRAME_GAP = 1.3;
// Devanagari matras reach ~1.05em above the baseline, descenders ~0.35em below.
const INK_UP = 1.1;
const INK_DOWN = 0.38;
// Fake bold: text is filled and stroked with a thin black line.
const BOLD = " 2 Tr 0 G 0.22 w ";
// The line gap is squeezed down to this before the text is shrunk to fit.
const MIN_GAP = 0.8;

// Walks page 1's content stream: images, the card outlines and every
// horizontal text block with where it starts.
async function scan(doc: PDFDocument, tokenize: Tokenize): Promise<Scan | null> {
  const content = await readContents(doc);
  const ops = tokenize(content);
  const images: Array<{ op: Op; box: VoterBox }> = [];
  const texts: Block[] = [];
  // Simple stroked-line groups (q ... m l S ... Q) - candidates for the outline.
  const strokes: Array<{ start: number; end: number; pts: number[][] }> = [];
  type Group = { start: number; simple: boolean; stroked: boolean; pts: number[][] };
  const groups: Group[] = [];
  let ctm = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];
  let bt: { op: Op; ctm: number[]; pos: number[] | null } | null = null;
  const at = (m: number[], x: number, y: number) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

  for (const o of ops) {
    const nums = o.operands.map((t) => Number(t.value));
    const group = groups[groups.length - 1];
    if (o.op === "q") {
      if (group) group.simple = false;
      groups.push({ start: o.start, simple: true, stroked: false, pts: [] });
      stack.push(ctm);
      continue;
    }
    if (o.op === "Q") {
      ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
      const done = groups.pop();
      if (done && done.simple && done.stroked && done.pts.length) strokes.push({ start: done.start, end: o.end, pts: done.pts });
      continue;
    }
    if (group) {
      if (o.op === "m" || o.op === "l") group.pts.push(at(ctm, nums[0], nums[1]));
      else if (o.op === "S") group.stroked = true;
      else if (!["RG", "G", "K", "w", "d", "J", "j"].includes(o.op)) group.simple = false;
    }
    if (o.op === "cm") ctm = mul(nums, ctm);
    else if (o.op === "BT") bt = { op: o, ctm, pos: null };
    else if (bt && !bt.pos && (o.op === "Td" || o.op === "TD")) bt.pos = [nums[0], nums[1]];
    else if (bt && !bt.pos && o.op === "Tm") bt.pos = [nums[4], nums[5]];
    else if (o.op === "ET" && bt) {
      const rotated = Math.abs(bt.ctm[1]) > 0.01 || Math.abs(bt.ctm[2]) > 0.01;
      if (bt.pos && !rotated) {
        const [x, y] = at(bt.ctm, bt.pos[0], bt.pos[1]);
        texts.push({ start: bt.op.start, end: o.end, btEnd: bt.op.end, x, y });
      }
      bt = null;
    } else if (o.op === "Do" && Math.abs(ctm[1]) < 0.01 && Math.abs(ctm[2]) < 0.01) {
      const xs = [ctm[4], ctm[4] + ctm[0]], ys = [ctm[5], ctm[5] + ctm[3]];
      images.push({ op: o, box: { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) } });
    }
  }

  const backgrounds = images
    .filter(({ box }) => box.x1 - box.x0 > 150 && Math.abs((box.x1 - box.x0) / (box.y1 - box.y0) - CARD_RATIO) < 0.08)
    .sort((a, b) => a.box.x0 - b.box.x0);
  if (backgrounds.length !== 2) return null;
  const [front, back] = backgrounds.map((b) => b.box);

  // Outline strokes run along the edges of a face (within ~1 pt).
  const onEdge = ([x, y]: number[], f: VoterBox) =>
    x > f.x0 - 1.5 && x < f.x1 + 1.5 && y > f.y0 - 1.5 && y < f.y1 + 1.5 &&
    (Math.abs(x - f.x0) < 1 || Math.abs(x - f.x1) < 1 || Math.abs(y - f.y0) < 1 || Math.abs(y - f.y1) < 1);
  const outlines = strokes.filter((s) => [front, back].some((f) => s.pts.every((p) => onEdge(p, f))));

  const area = (b: VoterBox) => (b.x1 - b.x0) * (b.y1 - b.y0);
  const inside = (b: VoterBox, f: VoterBox) => b.x0 >= f.x0 - 1 && b.x1 <= f.x1 + 1 && b.y0 >= f.y0 - 1 && b.y1 <= f.y1 + 1;
  const frontImages = images.filter((image) => !backgrounds.includes(image) && inside(image.box, front)).sort((a, b) => area(b.box) - area(a.box));
  const main = frontImages[0];
  const name = main && typeof main.op.operands[0]?.value === "string" ? (main.op.operands[0].value as string) : "";
  return {
    content,
    front,
    back,
    backgrounds: backgrounds.map((b) => b.op),
    outlines,
    blocks: texts,
    photo: main && name ? { box: main.box, op: main.op, name } : null,
    smallPhoto: frontImages[1]?.box || null,
  };
}

// Which text belongs to the resizable groups.
function regions(s: Pick<Scan, "front" | "back" | "photo">) {
  const { front, back } = s;
  const photo = s.photo?.box;
  const backMid = (back.y0 + back.y1) / 2;
  const addressLeft = back.x0 + (back.x1 - back.x0) / 3;
  return {
    // Right of the photo, level with it: नाम / Name / पिता का नाम / Gender / DOB.
    details: (x: number, y: number) => Boolean(photo) && x > photo!.x1 && x < front.x1 && y > photo!.y0 - 2 && y < photo!.y1 + 2,
    // Top-right of the back: पता / Address.
    address: (x: number, y: number) => x > addressLeft && x < back.x1 && y > backMid && y < back.y1,
    // Registration officer lines and download date, under the address.
    underAddress: (x: number, y: number) => x > addressLeft && x < back.x1 && y > back.y0 && y <= backMid,
    // "e-Electors Photo Identity Card" footer, under the photo.
    frontFooter: (x: number, y: number) => Boolean(photo) && x > front.x0 && x < front.x1 && y > front.y0 && y < photo!.y0,
  };
}

function textBlock(items: TextItem[], floor: number, limitRight: (item: TextItem) => number): VoterText | null {
  if (!items.length) return null;
  const x0 = Math.min(...items.map((i) => i.x)) - 0.5;
  const top = Math.max(...items.map((i) => i.y + i.size * INK_UP));
  let maxScale = 2;
  for (const item of items) maxScale = Math.min(maxScale, (limitRight(item) - x0) / (item.x + item.w - x0 || 1));
  // Items on one baseline (Hindi words, labels and values) form a line.
  const lines: VoterLine[] = [];
  for (const item of [...items].sort((a, b) => b.y - a.y)) {
    const line = lines.find((l) => Math.abs(l.y - item.y) < item.size * 0.3);
    if (line) line.size = Math.max(line.size, item.size);
    else lines.push({ y: item.y, size: item.size });
  }
  return { x0, top, floor, maxScale: Math.max(0.5, maxScale), lines };
}

// Baselines for `t` at `scale` and `gap`, anchored at the block's top. When
// the block would run into the text below, the gap closes first (down to
// MIN_GAP), then the size comes down.
function placeLines(t: VoterText, scale: number, gap: number) {
  const first = t.lines[0], last = t.lines[t.lines.length - 1];
  const head = t.top - first.y, span = first.y - last.y, tail = last.size * INK_DOWN;
  const room = t.top - t.floor;
  const wantS = Math.max(0.6, Math.min(scale || 1, t.maxScale));
  const wantG = Math.max(MIN_GAP, gap || 1);
  let s = wantS, g = wantG;
  if (s * (head + g * span + tail) > room) {
    if (span) g = Math.max(MIN_GAP, (room / s - head - tail) / span);
    if (s * (head + g * span + tail) > room) s = room / (head + g * span + tail);
  }
  const fitted = s < wantS - 0.005 || g < wantG - 0.005;
  return { s, fitted, baselines: t.lines.map((l) => t.top - s * head - s * g * (first.y - l.y)) };
}

// Card faces, photo and text groups for a standard e-EPIC letter, or null
// when the page differs. `items` are page 1's horizontal pdf.js text items.
export async function inspectVoter(doc: PDFDocument, tokenize: Tokenize, items: TextItem[]): Promise<VoterLayout | null> {
  const { PDFName, PDFRawStream } = await import("@cantoo/pdf-lib");
  const found = await scan(doc, tokenize);
  if (!found) return null;
  const { front, back, photo, smallPhoto } = found;
  const r = regions(found);

  let photoJpeg: Uint8Array | null = null;
  if (photo) {
    const xobjects = doc.getPage(0).node.Resources()?.lookup(PDFName.of("XObject"));
    const image = xobjects && "lookup" in xobjects ? (xobjects as { lookup(n: unknown): unknown }).lookup(PDFName.of(photo.name)) : null;
    if (image instanceof PDFRawStream && image.dict.get(PDFName.of("Filter"))?.toString() === "/DCTDecode") photoJpeg = image.contents;
  }

  const frontFloor = Math.max(front.y0 + 2, ...items.filter((i) => r.frontFooter(i.x, i.y)).map((i) => i.y + i.size * INK_UP)) + 2.5;
  const details = textBlock(items.filter((i) => r.details(i.x, i.y)), frontFloor, (i) =>
    smallPhoto && i.y + i.size * INK_UP > smallPhoto.y0 && i.y - i.size * INK_DOWN < smallPhoto.y1 ? smallPhoto.x0 - 2 : front.x1 - 3,
  );
  const backFloor = Math.max(back.y0 + 2, ...items.filter((i) => r.underAddress(i.x, i.y)).map((i) => i.y + i.size * INK_UP)) + 2;
  const address = textBlock(items.filter((i) => r.address(i.x, i.y)), backFloor, () => back.x1 - 3);

  return { front, back, photo: photo?.box || null, photoJpeg, details, address };
}

// Draws each face (already adjusted, top-left page units) onto a card at (x, y).
// Returns the drawables plus notes when text had to be squeezed to fit.
export async function buildVoterCard(out: PDFDocument, src: PDFDocument, layout: VoterLayout, faces: VoterCut[], opts: VoterOptions, tokenize: Tokenize, cardW: number, cardH: number) {
  const { PDFName, rgb } = await import("@cantoo/pdf-lib");
  const found = await scan(src, tokenize);
  const page = src.getPage(0);
  const pageH = page.getHeight();
  const black = rgb(0, 0, 0);
  const photoJpeg = opts.photoJpeg && layout.photo ? opts.photoJpeg : null;
  const notes: string[] = [];

  // The details and address are lifted out of the letter and written back at
  // the end of the page, each line wrapped in its own scale + move, so the
  // size and gap change without leaving real text behind.
  if (found) {
    const r = regions(found);
    const c = found.content;
    const lifted: Block[] = [];
    let moved = "";
    const lift = (t: VoterText | null, inRegion: (x: number, y: number) => boolean, scale: number, gap: number, bold: boolean, note: string) => {
      if (!t) return;
      const blocks = found.blocks.filter((b) => inRegion(b.x, b.y));
      lifted.push(...blocks);
      const { s, fitted, baselines } = placeLines(t, scale, gap);
      if (fitted) notes.push(note);
      const nearest = (b: Block) => t.lines.reduce((best, l) => (Math.abs(l.y - b.y) < Math.abs(best.y - b.y) ? l : best));
      t.lines.forEach((line, i) => {
        // Maps the line's left edge and baseline onto their new place.
        const cm = [s, 0, 0, s, t.x0 * (1 - s), baselines[i] - s * line.y].map((v) => +v.toFixed(4)).join(" ");
        const text = blocks
          .filter((b) => nearest(b) === line)
          .map((b) => (bold ? c.slice(b.start, b.btEnd) + BOLD + c.slice(b.btEnd, b.end) : c.slice(b.start, b.end)))
          .join("\n");
        if (text) moved += `q ${cm} cm\n${text}\nQ\n`;
      });
    };
    lift(layout.details, r.details, opts.frontScale, opts.frontGap, opts.boldFront, "Front text is at the largest size / gap that fits.");
    lift(layout.address, r.address, opts.backScale, opts.backGap, opts.boldBack, "Address is at the largest size / gap that fits.");

    // The card loses the outlines, the lifted text, the photo when it is
    // replaced and, for the clean card, the colour backgrounds.
    const cut = [...(opts.clean ? found.backgrounds : []), ...found.outlines, ...lifted, ...(photoJpeg && found.photo ? [found.photo.op] : [])].sort((a, b) => b.start - a.start);
    let content = c;
    for (const range of cut) content = content.slice(0, range.start) + " ".repeat(range.end - range.start) + content.slice(range.end);
    page.node.set(PDFName.of("Contents"), src.context.register(src.context.flateStream(toBytes(content + "\n" + moved))));
    // Unused artwork would otherwise be copied into the card with the page.
    if (opts.clean) await dropXObjects(src, page, found.backgrounds.map((op) => String(op.operands[0]?.value ?? "")));
  }

  const photoImage = photoJpeg ? await out.embedJpg(photoJpeg) : null;

  const drawables = await Promise.all(
    faces.map(async (face, i) => {
      const embedded = await out.embedPage(page, { left: face.x0, right: face.x1, top: pageH - face.top, bottom: pageH - face.bottom });
      const sx = cardW / (face.x1 - face.x0), sy = cardH / (face.bottom - face.top);
      // Page point -> card point for a card drawn at (x, y).
      const px = (x: number, v: number) => x + (v - face.x0) * sx;
      const py = (y: number, v: number) => y + (v - (pageH - face.bottom)) * sy;
      const draw = (target: PDFPage, x: number, y: number) => {
        target.drawPage(embedded, { x, y, width: cardW, height: cardH });
        const photo = layout.photo;
        if (i === 0 && photo) {
          if (photoImage) target.drawImage(photoImage, { x: px(x, photo.x0), y: py(y, photo.y0), width: (photo.x1 - photo.x0) * sx, height: (photo.y1 - photo.y0) * sy });
          if (opts.photoBorder > 0) {
            const g = PHOTO_FRAME_GAP;
            target.drawRectangle({
              x: px(x, photo.x0 - g),
              y: py(y, photo.y0 - g),
              width: (photo.x1 - photo.x0 + 2 * g) * sx,
              height: (photo.y1 - photo.y0 + 2 * g) * sy,
              borderColor: black,
              borderWidth: opts.photoBorder,
            });
          }
        }
        // The colour artwork has its own footer line; the clean card gets a black one.
        if (i === 1 && opts.clean) {
          const ruleY = py(y, layout.back.y0 + BACK_RULE_UP);
          target.drawLine({ start: { x: px(x, layout.back.x0), y: ruleY }, end: { x: px(x, layout.back.x1), y: ruleY }, thickness: 0.6, color: black });
        }
      };
      return { draw };
    }),
  );
  return { drawables, notes };
}
