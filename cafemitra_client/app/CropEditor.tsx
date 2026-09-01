"use client";

import type React from "react";
import { useRef, useState } from "react";

export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropDrag = {
  mode: "move" | "resize";
  handle?: string;
  startX: number;
  startY: number;
  rect: CropRect;
};

export const DEFAULT_CROP_RECT: CropRect = { x: 10, y: 10, width: 80, height: 80 };

export function CropEditor({ fileUrl, rect, onRectChange, aspectRatio }: { fileUrl: string; rect: CropRect; onRectChange: (rect: CropRect) => void; aspectRatio?: string }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<CropDrag | null>(null);

  function updateFromPointer(event: PointerEvent | { clientX: number; clientY: number }) {
    const stage = stageRef.current;
    const drag = dragRef.current;
    if (!stage || !drag) return;

    const bounds = stage.getBoundingClientRect();
    const deltaX = ((event.clientX - drag.startX) / bounds.width) * 100;
    const deltaY = ((event.clientY - drag.startY) / bounds.height) * 100;
    const next = drag.mode === "move" ? moveCropRect(drag.rect, deltaX, deltaY) : resizeCropRect(drag.rect, drag.handle || "", deltaX, deltaY);
    onRectChange(next);
  }

  function startDrag(event: React.PointerEvent<HTMLElement>, mode: CropDrag["mode"], handle?: string) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      rect,
    };
  }

  function stopDrag() {
    dragRef.current = null;
  }

  return (
    <div className="crop-stage" ref={stageRef} style={aspectRatio ? { aspectRatio } : undefined} onPointerMove={updateFromPointer} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
      <img src={fileUrl} alt="" draggable={false} />
      <div
        className="crop-selection"
        style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
        onPointerDown={(event) => startDrag(event, "move")}
      >
        {/* Full-length grab strips along each edge - so resizing a side
            doesn't require precisely hitting the small handle dot, matching
            how the corners already work. The visible round handles stay for
            corner (two-axis) resizing and as a visual cue. */}
        {(["n", "e", "s", "w"] as const).map((handle) => (
          <span
            className={`crop-edge crop-edge-${handle}`}
            key={handle}
            onPointerDown={(event) => {
              event.stopPropagation();
              startDrag(event, "resize", handle);
            }}
          />
        ))}
        {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((handle) => (
          <span
            className={`crop-handle crop-handle-${handle}`}
            key={handle}
            onPointerDown={(event) => {
              event.stopPropagation();
              startDrag(event, "resize", handle);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function moveCropRect(rect: CropRect, deltaX: number, deltaY: number) {
  return {
    ...rect,
    x: clamp(rect.x + deltaX, 0, 100 - rect.width),
    y: clamp(rect.y + deltaY, 0, 100 - rect.height),
  };
}

function resizeCropRect(rect: CropRect, handle: string, deltaX: number, deltaY: number) {
  const minSize = 8;
  let { x, y, width, height } = rect;

  if (handle.includes("w")) {
    const nextX = clamp(x + deltaX, 0, x + width - minSize);
    width += x - nextX;
    x = nextX;
  }

  if (handle.includes("e")) {
    width = clamp(width + deltaX, minSize, 100 - x);
  }

  if (handle.includes("n")) {
    const nextY = clamp(y + deltaY, 0, y + height - minSize);
    height += y - nextY;
    y = nextY;
  }

  if (handle.includes("s")) {
    height = clamp(height + deltaY, minSize, 100 - y);
  }

  return { x, y, width, height };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function cropImage(fileUrl: string, rect: CropRect) {
  const image = await loadImage(fileUrl);
  const sourceX = (rect.x / 100) * image.naturalWidth;
  const sourceY = (rect.y / 100) * image.naturalHeight;
  const sourceWidth = (rect.width / 100) * image.naturalWidth;
  const sourceHeight = (rect.height / 100) * image.naturalHeight;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = Math.max(1, Math.round(sourceWidth));
  canvas.height = Math.max(1, Math.round(sourceHeight));
  if (!context) throw new Error("Canvas not supported");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))), "image/png", 0.95);
  });
}

// --- Perspective (4-corner) crop -------------------------------------------
//
// A straight rectangle crop can only ever select an axis-aligned box. A
// photo of a physical card/document taken at an angle - tilted, or with
// keystone distortion because the camera wasn't held dead-on - has edges
// that aren't axis-aligned at all, so no rectangle crop can hug it without
// either cutting into the card or leaving background in. This lets the user
// drag each of the 4 corners onto the document's actual (skewed) corners,
// then warps that quadrilateral back into a clean rectangle - the same
// "scan a document" technique used by CamScanner/Adobe Scan/Office Lens.

export type CropPoint = { x: number; y: number };
/** Corners in order: top-left, top-right, bottom-right, bottom-left. Percent (0-100) of the image, same convention as CropRect. */
export type CropQuad = [CropPoint, CropPoint, CropPoint, CropPoint];

export const DEFAULT_CROP_QUAD: CropQuad = [
  { x: 12, y: 12 },
  { x: 88, y: 12 },
  { x: 88, y: 88 },
  { x: 12, y: 88 },
];

type QuadDrag = { corner: number; rect: DOMRect };

function distance(a: CropPoint, b: CropPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clampPoint(point: CropPoint): CropPoint {
  return { x: clamp(point.x, 0, 100), y: clamp(point.y, 0, 100) };
}

export function PerspectiveCropEditor({ fileUrl, quad, onQuadChange }: { fileUrl: string; quad: CropQuad; onQuadChange: (quad: CropQuad) => void }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<QuadDrag | null>(null);
  // Unlike the straight-crop stage (which is locked to the target output
  // ratio), this one must show the photo at its own true aspect ratio,
  // undistorted - the user is matching corners against how the document
  // actually looks in the photo, and any stretching would throw that off.
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null);

  function pointFromEvent(event: { clientX: number; clientY: number }, bounds: DOMRect): CropPoint {
    return clampPoint({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  }

  function updateFromPointer(event: React.PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const point = pointFromEvent(event, drag.rect);
    const next = quad.map((corner, index) => (index === drag.corner ? point : corner)) as CropQuad;
    onQuadChange(next);
  }

  function startCornerDrag(event: React.PointerEvent<HTMLElement>, corner: number) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { corner, rect: stageRef.current!.getBoundingClientRect() };
  }

  // Clicking anywhere along an edge - not just the corner dot - grabs
  // whichever endpoint of that edge is nearest the click and starts
  // dragging it from there, so there's no need to precisely hit a tiny handle.
  function startEdgeDrag(event: React.PointerEvent<SVGLineElement>, cornerA: number, cornerB: number) {
    event.preventDefault();
    event.stopPropagation();
    const bounds = stageRef.current!.getBoundingClientRect();
    const point = pointFromEvent(event, bounds);
    const corner = distance(point, quad[cornerA]) <= distance(point, quad[cornerB]) ? cornerA : cornerB;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { corner, rect: bounds };
    const next = quad.map((c, index) => (index === corner ? point : c)) as CropQuad;
    onQuadChange(next);
  }

  function stopDrag() {
    dragRef.current = null;
  }

  const polygonPoints = quad.map((point) => `${point.x},${point.y}`).join(" ");
  const dimPath = `M0,0 H100 V100 H0 Z M${quad.map((p) => `${p.x},${p.y}`).join(" L")} Z`;
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 0]];

  return (
    // The straight-crop stage always uses a fixed, landscape-ish target
    // ratio (e.g. a card), so it never grows taller than the modal. This
    // stage instead matches the SOURCE photo's own ratio, which can be tall
    // (a portrait phone photo) - without this frame containing it by both
    // width and height, a tall photo pushed the bottom corners out of the
    // modal with no way to reach them.
    <div className="crop-stage-perspective-frame">
      <div
        className="crop-stage crop-stage-perspective"
        ref={stageRef}
        style={naturalRatio ? { aspectRatio: String(naturalRatio) } : undefined}
        onPointerMove={updateFromPointer}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
      <img src={fileUrl} alt="" draggable={false} onLoad={(event) => setNaturalRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} />
      <svg className="crop-perspective-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={dimPath} fillRule="evenodd" fill="rgba(10, 14, 30, 0.5)" />
        <polygon points={polygonPoints} fill="none" stroke="#2563eb" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
        {edges.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={quad[a].x}
            y1={quad[a].y}
            x2={quad[b].x}
            y2={quad[b].y}
            stroke="transparent"
            strokeWidth={22}
            vectorEffect="non-scaling-stroke"
            pointerEvents="stroke"
            onPointerDown={(event) => startEdgeDrag(event, a, b)}
          />
        ))}
      </svg>
      {quad.map((point, index) => (
        <span
          className="crop-quad-handle"
          key={index}
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
          onPointerDown={(event) => startCornerDrag(event, index)}
        />
      ))}
      </div>
    </div>
  );
}

function solveLinear8(rows: number[][], values: number[]) {
  const n = 8;
  const matrix = rows.map((row, index) => [...row, values[index]]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) {
      if (Math.abs(matrix[row][col]) > Math.abs(matrix[pivot][col])) pivot = row;
    }
    [matrix[col], matrix[pivot]] = [matrix[pivot], matrix[col]];
    const pivotValue = matrix[col][col];
    if (Math.abs(pivotValue) < 1e-10) continue;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = matrix[row][col] / pivotValue;
      if (!factor) continue;
      for (let k = col; k <= n; k += 1) matrix[row][k] -= factor * matrix[col][k];
    }
  }
  return matrix.map((row, index) => (Math.abs(row[index]) < 1e-10 ? 0 : row[n] / row[index]));
}

/** 3x3 projective matrix (row-major, h[8] normalized to 1) mapping each srcPts[i] -> dstPts[i]. */
function computeHomography(srcPts: CropPoint[], dstPts: CropPoint[]): number[] {
  const rows: number[][] = [];
  const values: number[] = [];
  for (let i = 0; i < 4; i += 1) {
    const { x: sx, y: sy } = srcPts[i];
    const { x: dx, y: dy } = dstPts[i];
    rows.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx]);
    values.push(dx);
    rows.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy]);
    values.push(dy);
  }
  const h = solveLinear8(rows, values);
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

function applyHomography(h: number[], x: number, y: number): CropPoint {
  const w = h[6] * x + h[7] * y + h[8];
  return { x: (h[0] * x + h[1] * y + h[2]) / w, y: (h[3] * x + h[4] * y + h[5]) / w };
}

function samplePixel(source: Uint8ClampedArray, width: number, height: number, x: number, y: number, out: [number, number, number, number]) {
  if (x < 0 || y < 0 || x > width - 1 || y > height - 1) {
    out[0] = 255; out[1] = 255; out[2] = 255; out[3] = 0;
    return;
  }
  const x0 = Math.floor(x); const y0 = Math.floor(y);
  const x1 = Math.min(width - 1, x0 + 1); const y1 = Math.min(height - 1, y0 + 1);
  const fx = x - x0; const fy = y - y0;
  const i00 = (y0 * width + x0) * 4; const i10 = (y0 * width + x1) * 4;
  const i01 = (y1 * width + x0) * 4; const i11 = (y1 * width + x1) * 4;
  for (let c = 0; c < 4; c += 1) {
    const top = source[i00 + c] * (1 - fx) + source[i10 + c] * fx;
    const bottom = source[i01 + c] * (1 - fx) + source[i11 + c] * fx;
    out[c] = top * (1 - fy) + bottom * fy;
  }
}

/** Natural pixel size the quad's own edges suggest, snapped to an exact ratio when one is given (e.g. a physical card). Capped to keep the pixel loop below bounded. */
export function quadOutputSize(quad: CropQuad, naturalWidth: number, naturalHeight: number, aspectRatio?: number) {
  const sourcePts = quad.map((point) => ({ x: (point.x / 100) * naturalWidth, y: (point.y / 100) * naturalHeight }));
  const topWidth = distance(sourcePts[0], sourcePts[1]);
  const bottomWidth = distance(sourcePts[3], sourcePts[2]);
  const leftHeight = distance(sourcePts[0], sourcePts[3]);
  const rightHeight = distance(sourcePts[1], sourcePts[2]);
  let outWidth = Math.round(Math.max(topWidth, bottomWidth));
  let outHeight = Math.round(Math.max(leftHeight, rightHeight));
  if (aspectRatio && aspectRatio > 0) {
    // Keep roughly the resolution the user framed, just snapped to the exact ratio.
    const area = outWidth * outHeight;
    outWidth = Math.max(1, Math.round(Math.sqrt(area * aspectRatio)));
    outHeight = Math.max(1, Math.round(outWidth / aspectRatio));
  }
  return { width: Math.max(1, Math.min(4000, outWidth)), height: Math.max(1, Math.min(4000, outHeight)) };
}

/** Core perspective warp on an already-loaded image - synchronous, no network/file loading, so callers that already hold the HTMLImageElement (e.g. a live editor re-rendering on every change) can control exactly when this (comparatively expensive, per-pixel) work runs. */
export function warpQuadToCanvas(image: HTMLImageElement, quad: CropQuad, outWidth: number, outHeight: number): HTMLCanvasElement {
  const sourcePts = quad.map((point) => ({ x: (point.x / 100) * image.naturalWidth, y: (point.y / 100) * image.naturalHeight }));

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = image.naturalWidth;
  sourceCanvas.height = image.naturalHeight;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("Canvas not supported");
  sourceContext.drawImage(image, 0, 0);
  const sourceData = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;

  // Homography FROM the clean output rectangle TO the source quad - inverse
  // mapping, so every destination pixel has exactly one source sample
  // (mapping the other direction would leave gaps between source pixels).
  const rectCorners: CropPoint[] = [{ x: 0, y: 0 }, { x: outWidth, y: 0 }, { x: outWidth, y: outHeight }, { x: 0, y: outHeight }];
  const homography = computeHomography(rectCorners, sourcePts);

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outWidth;
  outCanvas.height = outHeight;
  const outContext = outCanvas.getContext("2d");
  if (!outContext) throw new Error("Canvas not supported");
  const outImage = outContext.createImageData(outWidth, outHeight);
  const pixel: [number, number, number, number] = [255, 255, 255, 255];
  for (let y = 0; y < outHeight; y += 1) {
    for (let x = 0; x < outWidth; x += 1) {
      const source = applyHomography(homography, x + 0.5, y + 0.5);
      samplePixel(sourceData, sourceCanvas.width, sourceCanvas.height, source.x, source.y, pixel);
      const index = (y * outWidth + x) * 4;
      outImage.data[index] = pixel[0];
      outImage.data[index + 1] = pixel[1];
      outImage.data[index + 2] = pixel[2];
      outImage.data[index + 3] = pixel[3];
    }
  }
  outContext.putImageData(outImage, 0, 0);
  return outCanvas;
}

/** Crops+flattens a skewed quadrilateral region of an image into a clean rectangle via a perspective (projective) warp. `aspectRatio` (width/height), when given, forces the exact output ratio - e.g. a physical card size. */
export async function warpPerspectiveCrop(fileUrl: string, quad: CropQuad, aspectRatio?: number) {
  const image = await loadImage(fileUrl);
  const { width: outWidth, height: outHeight } = quadOutputSize(quad, image.naturalWidth, image.naturalHeight, aspectRatio);
  const outCanvas = warpQuadToCanvas(image, quad, outWidth, outHeight);
  return new Promise<Blob>((resolve, reject) => {
    outCanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))), "image/png", 0.95);
  });
}
