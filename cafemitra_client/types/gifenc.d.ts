declare module "gifenc" {
  export type RGB = [number, number, number];
  export type RGBA = [number, number, number, number];

  export interface QuantizeOptions {
    format?: "rgb565" | "rgb444" | "rgba4444";
    oneBitAlpha?: boolean | number;
    clearAlpha?: boolean;
    clearAlphaThreshold?: number;
    clearAlphaColor?: number;
  }

  export function quantize(rgba: Uint8Array | Uint8ClampedArray, maxColors: number, options?: QuantizeOptions): (RGB | RGBA)[];
  export function applyPalette(rgba: Uint8Array | Uint8ClampedArray, palette: (RGB | RGBA)[], format?: string): Uint8Array;

  export interface WriteFrameOptions {
    palette?: (RGB | RGBA)[];
    first?: boolean;
    transparent?: boolean;
    transparentIndex?: number;
    delay?: number;
    repeat?: number;
    dispose?: number;
  }

  export interface GIFEncoderInstance {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: WriteFrameOptions): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    writeHeader(): void;
    reset(): void;
    buffer: ArrayBuffer;
  }

  export function GIFEncoder(opts?: { auto?: boolean; initialCapacity?: number }): GIFEncoderInstance;
}
