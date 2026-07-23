"use client";

import type React from "react";
import { useRef } from "react";

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

export function CropEditor({ fileUrl, rect, onRectChange }: { fileUrl: string; rect: CropRect; onRectChange: (rect: CropRect) => void }) {
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
    <div className="crop-stage" ref={stageRef} onPointerMove={updateFromPointer} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
      <img src={fileUrl} alt="" draggable={false} />
      <div
        className="crop-selection"
        style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
        onPointerDown={(event) => startDrag(event, "move")}
      >
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
