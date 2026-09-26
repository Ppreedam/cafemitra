import type { PDFDocument } from "@cantoo/pdf-lib";

// Boxes are in PDF points, measured from the top of the page.
export type AadhaarBox = { x0: number; x1: number; top: number; bottom: number };

export type AadhaarMeta = {
  W: number;
  H: number;
  front: AadhaarBox;
  back: AadhaarBox;
  mobile: string;
  photo: { name: string; jpeg: Uint8Array } | null;
  info: { frontLines: number; backLines: number; hasInfoBox: boolean; hasQR: boolean };
  layoutOK: boolean;
  // Positions found by inspect(), in PDF page units (origin bottom-left).
  _: {
    frontLines: AadhaarLine[];
    backLines: AadhaarLine[];
    qrImg?: AadhaarImage;
    // The QR's black modules inside qrImg (null when the image could not be read).
    qrInk?: AadhaarImage | null;
    photoImg?: AadhaarImage;
  };
};

// One text line: x/y is the baseline origin, eff the font size, w the width.
export type AadhaarLine = { x: number; y: number; eff: number; w: number };
export type AadhaarImage = { x0: number; x1: number; y0: number; y1: number };

export type AadhaarEditOptions = {
  frontScale?: number;
  backScale?: number;
  frontSpacing?: number;
  backSpacing?: number;
  boldFront?: boolean;
  boldBack?: boolean;
  removeInfo?: boolean;
  mobile?: string;
  photoJpeg?: Uint8Array | null;
};

export type AadhaarCore = {
  inspect(plainBytes: Uint8Array): Promise<AadhaarMeta>;
  applyEdits(doc: PDFDocument, meta: AadhaarMeta, opts: AadhaarEditOptions): Promise<string[]>;
  stripText(doc: PDFDocument): void;
  tokenize(content: string): Array<{ op: string; operands: Array<{ value?: unknown; start: number; end: number }>; start: number; end: number }>;
  CARD_W: number;
  CARD_H: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function makeAadhaarCore(PDFLib: any, pdfjsLib: any): AadhaarCore;
