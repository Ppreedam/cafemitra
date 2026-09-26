// Small helpers for reading and rewriting a PDF page's content stream,
// shared by the per-document card builders (voterCard, panCard).
import type { PDFDocument, PDFPage } from "@cantoo/pdf-lib";

export type Token = { value?: unknown; start: number; end: number };
export type Op = { op: string; operands: Token[]; start: number; end: number };
export type Tokenize = (content: string) => Op[];

// PDF units, origin bottom-left.
export type PdfBox = { x0: number; y0: number; x1: number; y1: number };

// Product of two PDF matrices [a b c d e f].
export function mul(a: number[], b: number[]) {
  return [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3], a[4] * b[0] + a[5] * b[2] + b[4], a[4] * b[1] + a[5] * b[3] + b[5]];
}

// Latin-1 string -> bytes (content streams are handled as binary strings).
export function toBytes(text: string) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 0xff;
  return bytes;
}

// Page 1's content streams, decoded and joined, as a binary string.
export async function readContents(doc: PDFDocument) {
  const { PDFName, PDFArray, PDFRawStream, decodePDFRawStream } = await import("@cantoo/pdf-lib");
  const page = doc.getPage(0);
  const ctx = doc.context;
  const contents = ctx.lookup(page.node.get(PDFName.of("Contents")));
  const streams = contents instanceof PDFArray ? contents.asArray().map((ref) => ctx.lookup(ref)) : [contents];
  let text = "";
  for (const stream of streams) {
    const bytes = stream instanceof PDFRawStream ? decodePDFRawStream(stream).decode() : (stream as unknown as { getContents(): Uint8Array }).getContents();
    for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 0x8000)));
    text += "\n";
  }
  return text;
}

// Removes XObjects from page 1's resources (on a private copy of the dict),
// so embedding the page no longer copies images it does not draw.
export async function dropXObjects(doc: PDFDocument, page: PDFPage, names: string[]) {
  const { PDFDict, PDFName } = await import("@cantoo/pdf-lib");
  const resources = page.node.Resources();
  const xobjects = resources?.lookup(PDFName.of("XObject"));
  if (!resources || !(xobjects instanceof PDFDict) || !names.length) return;
  const kept = xobjects.clone(doc.context);
  for (const name of names) kept.delete(PDFName.of(name));
  const copy = resources.clone(doc.context);
  copy.set(PDFName.of("XObject"), kept);
  page.node.set(PDFName.of("Resources"), copy);
}

// Keeps only the named XObjects in `page`'s resources (private copy of the dict).
export async function keepXObjects(doc: PDFDocument, page: PDFPage, names: string[]) {
  const { PDFDict, PDFName } = await import("@cantoo/pdf-lib");
  const resources = page.node.Resources();
  const xobjects = resources?.lookup(PDFName.of("XObject"));
  if (!resources || !(xobjects instanceof PDFDict)) return;
  const wanted = new Set(names);
  await dropXObjects(doc, page, xobjects.keys().map((key) => key.decodeText()).filter((name) => !wanted.has(name)));
}
