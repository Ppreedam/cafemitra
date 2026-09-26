// e-PAN card for the ID Card Maker studio.
//
// Both e-PAN letters carry a ready-made card at the bottom of the page, but
// its artwork - headings, emblem, the "नाम / Name" labels, the whole back - is
// one raster image. Only the values (PAN, name, father's name, DOB), the photo
// and the QR are drawn on top of it.
//   NSDL (Protean): the two card faces are one strip image near the bottom.
//   UTI (UTIITSL):  the whole page, card included, is one full-page image.
// The variant is told apart by that image; the faces sit at fixed places on it.
//
// Original cut: the faces cut straight from the letter.
// Clean card: the artwork image alone is rendered, its light-blue pattern is
// whitened (ink is kept), and the vector values, photo and QR go back on top.
import type { PDFDocument, PDFPage } from "@cantoo/pdf-lib";
import { keepXObjects, mul, readContents, toBytes, type Op, type PdfBox, type Tokenize } from "./pdfContent";

export type PanVariant = "nsdl" | "uti";
export type PanLayout = { variant: PanVariant; front: PdfBox; back: PdfBox; photo: PdfBox | null; photoJpeg: Uint8Array | null };
export type PanOptions = { clean: boolean; bold: boolean; photoJpeg: Uint8Array | null };
// Top-left page units, like the studio's face boxes.
export type PanCut = { x0: number; x1: number; top: number; bottom: number };
// Renders `region` of page 1 of `bytes` onto a canvas at `scale` pixels per point.
export type RenderRegion = (bytes: Uint8Array, region: PanCut, scale: number) => Promise<HTMLCanvasElement>;

type Image = { op: Op; name: string; box: PdfBox; ctm: number[]; px: { w: number; h: number } | null };
// A BT..ET text object: where it sits in the content and where it starts on the page.
type Block = { start: number; end: number; btEnd: number; x: number; y: number };

// Faces as fractions of the artwork image they sit on (measured on the letters).
const FACES: Record<PanVariant, { size: [number, number]; front: number[]; back: number[] }> = {
  nsdl: { size: [489, 159.64], front: [3.75, 4.89, 241.75, 154.64], back: [247.5, 4.89, 485.75, 154.64] },
  uti: { size: [569.28, 816.96], front: [24.64, 17.98, 269.14, 171.48], back: [302.14, 17.23, 546.64, 170.73] },
};
// Clean card artwork is rendered at this resolution.
const RENDER_DPI = 300;
// Fake bold: text is filled and stroked with a thin black line.
const BOLD = " 2 Tr 0 G 0.25 w ";

async function scan(doc: PDFDocument, tokenize: Tokenize) {
  const { PDFName, PDFNumber, PDFRawStream } = await import("@cantoo/pdf-lib");
  const content = await readContents(doc);
  const xobjects = doc.getPage(0).node.Resources()?.lookup(PDFName.of("XObject"));
  const pixels = (name: string) => {
    const stream = xobjects && "lookup" in xobjects ? (xobjects as { lookup(n: unknown): unknown }).lookup(PDFName.of(name)) : null;
    if (!(stream instanceof PDFRawStream) || stream.dict.get(PDFName.of("Subtype"))?.toString() !== "/Image") return null;
    const w = stream.dict.get(PDFName.of("Width")), h = stream.dict.get(PDFName.of("Height"));
    return w instanceof PDFNumber && h instanceof PDFNumber ? { w: w.asNumber(), h: h.asNumber() } : null;
  };
  const images: Image[] = [];
  const blocks: Block[] = [];
  let ctm = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];
  let bt: { start: number; end: number; ctm: number[]; pos: number[] | null } | null = null;
  for (const o of tokenize(content)) {
    const nums = o.operands.map((t) => Number(t.value));
    if (o.op === "q") stack.push(ctm);
    else if (o.op === "Q") ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
    else if (o.op === "cm") ctm = mul(nums, ctm);
    else if (o.op === "BT") bt = { start: o.start, end: o.end, ctm, pos: null };
    else if (bt && !bt.pos && (o.op === "Td" || o.op === "TD")) bt.pos = [nums[0], nums[1]];
    else if (bt && !bt.pos && o.op === "Tm") bt.pos = [nums[4], nums[5]];
    else if (o.op === "ET" && bt) {
      if (bt.pos) blocks.push({ start: bt.start, end: o.end, btEnd: bt.end, x: bt.ctm[0] * bt.pos[0] + bt.ctm[2] * bt.pos[1] + bt.ctm[4], y: bt.ctm[1] * bt.pos[0] + bt.ctm[3] * bt.pos[1] + bt.ctm[5] });
      bt = null;
    } else if (o.op === "Do" && Math.abs(ctm[1]) < 0.01 && Math.abs(ctm[2]) < 0.01) {
      const name = typeof o.operands[0]?.value === "string" ? (o.operands[0].value as string) : "";
      const xs = [ctm[4], ctm[4] + ctm[0]], ys = [ctm[5], ctm[5] + ctm[3]];
      images.push({ op: o, name, ctm, box: { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }, px: name ? pixels(name) : null });
    }
  }
  return { content, images, blocks };
}

type Scan = Awaited<ReturnType<typeof scan>>;

const within = (x: number, y: number, b: PdfBox) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1;
const overlap = (a: PdfBox, b: PdfBox) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const area = (b: PdfBox) => (b.x1 - b.x0) * (b.y1 - b.y0);

// Which letter this is and where its faces are, or null for an unknown layout.
function locate(s: Scan, pageW: number, pageH: number) {
  const w = (b: PdfBox) => b.x1 - b.x0, h = (b: PdfBox) => b.y1 - b.y0;
  const strip = s.images.find(({ box }) => w(box) > 400 && w(box) / h(box) > 2.7 && w(box) / h(box) < 3.4 && box.y0 < pageH * 0.35);
  const page = s.images.find(({ box }) => w(box) > pageW * 0.9 && h(box) > pageH * 0.85);
  const anchor = strip ? { variant: "nsdl" as const, image: strip } : page ? { variant: "uti" as const, image: page } : null;
  if (!anchor) return null;
  const spec = FACES[anchor.variant], a = anchor.image.box;
  const kx = w(a) / spec.size[0], ky = h(a) / spec.size[1];
  const face = ([x0, y0, x1, y1]: number[]): PdfBox => ({ x0: a.x0 + x0 * kx, y0: a.y0 + y0 * ky, x1: a.x0 + x1 * kx, y1: a.y0 + y1 * ky });
  const front = face(spec.front), back = face(spec.back);
  // Artwork: images covering most of a face (not the photo or QR on top).
  const backgrounds = s.images.filter((image) => [front, back].some((f) => overlap(image.box, f) > area(f) * 0.5));
  // The card photo is the portrait image on the front; the QR is square.
  const photo = s.images
    .filter((image) => !backgrounds.includes(image) && image.px && image.px.w / image.px.h < 0.9 && within((image.box.x0 + image.box.x1) / 2, (image.box.y0 + image.box.y1) / 2, front))
    .sort((p, q) => area(q.box) - area(p.box))[0] || null;
  return { variant: anchor.variant, front, back, backgrounds, photo };
}

// Faces, variant and photo for a standard e-PAN letter, or null when the page differs.
export async function inspectPan(doc: PDFDocument, tokenize: Tokenize): Promise<PanLayout | null> {
  const { PDFName, PDFRawStream } = await import("@cantoo/pdf-lib");
  const page = doc.getPage(0);
  const found = locate(await scan(doc, tokenize), page.getWidth(), page.getHeight());
  if (!found) return null;
  let photoJpeg: Uint8Array | null = null;
  if (found.photo) {
    const xobjects = page.node.Resources()?.lookup(PDFName.of("XObject"));
    const image = xobjects && "lookup" in xobjects ? (xobjects as { lookup(n: unknown): unknown }).lookup(PDFName.of(found.photo.name)) : null;
    if (image instanceof PDFRawStream && image.dict.get(PDFName.of("Filter"))?.toString() === "/DCTDecode") photoJpeg = image.contents;
  }
  return { variant: found.variant, front: found.front, back: found.back, photo: found.photo?.box || null, photoJpeg };
}

// Whitens the e-PAN artwork in place: the light-blue background and the
// cyan guilloche swirls go white, darker ink (headings, emblem, blue labels,
// back text) stays. Green separates them: the background is green-heavy,
// the ink is not. Cyan pixels (green well above red) that are also very blue
// are swirls, so they are pushed towards white.
export function whitenArtwork(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const v = g + 1.5 * Math.max(0, g - r - 10) * Math.max(0, Math.min(1, (b - 175) / 20));
    const ink = Math.max(0, Math.min(1, (145 - v) / 50));
    data[i] = 255 * (1 - ink) + r * 0.85 * ink;
    data[i + 1] = 255 * (1 - ink) + g * 0.85 * ink;
    data[i + 2] = 255 * (1 - ink) + b * 0.85 * ink;
  }
}

// Whitened artwork per letter and cut, so live previews do not re-render it.
const artworkCache = new WeakMap<Uint8Array, Map<string, Promise<Uint8Array>>>();

async function cleanArtwork(plain: Uint8Array, backgrounds: Image[], region: PanCut, render: RenderRegion) {
  let perLetter = artworkCache.get(plain);
  if (!perLetter) artworkCache.set(plain, (perLetter = new Map()));
  const key = [region.x0, region.x1, region.top, region.bottom].map((v) => v.toFixed(2)).join(",");
  let job = perLetter.get(key);
  if (!job) {
    job = (async () => {
      // A copy of the letter whose page shows only the artwork images.
      const { PDFDocument, PDFName } = await import("@cantoo/pdf-lib");
      const doc = await PDFDocument.load(plain, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
      const page = doc.getPage(0);
      const only = backgrounds.map((image) => `q ${image.ctm.map((v) => +v.toFixed(5)).join(" ")} cm /${image.name} Do Q\n`).join("");
      page.node.set(PDFName.of("Contents"), doc.context.register(doc.context.flateStream(toBytes(only))));
      page.node.delete(PDFName.of("Annots"));
      // The unlocked copy can keep a stale /Encrypt entry (UTI letters); its
      // streams are already plain, so pdf.js must not try to decrypt them.
      delete (doc.context.trailerInfo as { Encrypt?: unknown }).Encrypt;
      const canvas = await render(await doc.save(), region, RENDER_DPI / 72);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      whitenArtwork(pixels.data);
      context.putImageData(pixels, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not encode the clean PAN artwork");
      return new Uint8Array(await blob.arrayBuffer());
    })();
    job.catch(() => perLetter!.delete(key));
    perLetter.set(key, job);
  }
  return job;
}

// Draws each face (already adjusted, top-left page units) onto a card at (x, y).
export async function buildPanCard(
  out: PDFDocument,
  src: PDFDocument,
  plain: Uint8Array,
  layout: PanLayout,
  faces: PanCut[],
  opts: PanOptions,
  tokenize: Tokenize,
  render: RenderRegion,
  cardW: number,
  cardH: number,
) {
  const { PDFName } = await import("@cantoo/pdf-lib");
  const page = src.getPage(0);
  const pageH = page.getHeight();
  const found = await scan(src, tokenize);
  const where = locate(found, page.getWidth(), pageH);
  const photoJpeg = opts.photoJpeg && layout.photo ? opts.photoJpeg : null;

  const onCard = (x: number, y: number) => within(x, y, layout.front) || within(x, y, layout.back);
  const replaced = photoJpeg && where?.photo ? where.photo : null;
  const boldText = (b: Block) => (opts.bold ? found.content.slice(b.start, b.btEnd) + BOLD + found.content.slice(b.btEnd, b.end) : found.content.slice(b.start, b.end));
  // What goes on top of the artwork. The clean card takes only the values,
  // photo and QR onto a page of their own: the letters also paint opaque
  // white frame boxes (NSDL) that would hide the whitened artwork. The
  // original cut keeps the whole letter, with bold values / no photo as asked.
  let source = page;
  if (opts.clean && where) {
    const images = found.images.filter((image) => !where.backgrounds.includes(image) && image !== replaced && onCard((image.box.x0 + image.box.x1) / 2, (image.box.y0 + image.box.y1) / 2));
    const overlay =
      images.map((image) => `q ${image.ctm.map((v) => +v.toFixed(5)).join(" ")} cm /${image.name} Do Q\n`).join("") +
      found.blocks.filter((b) => onCard(b.x, b.y)).map((b) => `q\n${boldText(b)}\nQ\n`).join("");
    source = src.addPage([page.getWidth(), pageH]);
    const resources = page.node.Resources();
    if (resources) source.node.set(PDFName.of("Resources"), resources);
    source.node.set(PDFName.of("Contents"), src.context.register(src.context.flateStream(toBytes(overlay))));
    // Only the photo and QR travel with it, not the letter's big artwork images.
    await keepXObjects(src, source, images.map((image) => image.name));
  } else {
    const edits: Array<{ at: number; end: number; text: string }> = [];
    if (replaced) edits.push({ at: replaced.op.start, end: replaced.op.end, text: " ".repeat(replaced.op.end - replaced.op.start) });
    if (opts.bold) for (const b of found.blocks) if (onCard(b.x, b.y)) edits.push({ at: b.btEnd, end: b.btEnd, text: BOLD });
    let content = found.content;
    for (const e of edits.sort((p, q) => q.at - p.at)) content = content.slice(0, e.at) + e.text + content.slice(e.end);
    page.node.set(PDFName.of("Contents"), src.context.register(src.context.flateStream(toBytes(content))));
  }

  const artwork = opts.clean && where ? await Promise.all(faces.map((face) => cleanArtwork(plain, where.backgrounds, face, render).then((png) => out.embedPng(png)))) : null;
  const photoImage = photoJpeg ? await out.embedJpg(photoJpeg) : null;

  return Promise.all(
    faces.map(async (face, i) => {
      const embedded = await out.embedPage(source, { left: face.x0, right: face.x1, top: pageH - face.top, bottom: pageH - face.bottom });
      const sx = cardW / (face.x1 - face.x0), sy = cardH / (face.bottom - face.top);
      const px = (x: number, v: number) => x + (v - face.x0) * sx;
      const py = (y: number, v: number) => y + (v - (pageH - face.bottom)) * sy;
      const draw = (target: PDFPage, x: number, y: number) => {
        if (artwork) target.drawImage(artwork[i], { x, y, width: cardW, height: cardH });
        target.drawPage(embedded, { x, y, width: cardW, height: cardH });
        const photo = layout.photo;
        if (i === 0 && photo && photoImage) target.drawImage(photoImage, { x: px(x, photo.x0), y: py(y, photo.y0), width: (photo.x1 - photo.x0) * sx, height: (photo.y1 - photo.y0) * sy });
      };
      return { draw };
    }),
  );
}
