import type { CropQuad } from "../CropEditor";
import { apiUrl } from "@/lib/api";

type Side = "front" | "back";

export type CropOutcome = "accepted" | "adjusted" | "manual" | "notfound";
export type CropTrack = { autoQuad: CropQuad | null; undetected: boolean };

// A corner that moved by less than this (percent of the photo) still counts as "accepted as is".
export const ACCEPT_TOLERANCE_PCT = 1.2;

export function quadDistance(a: CropQuad, b: CropQuad) {
  return Math.max(...a.map((point, index) => Math.hypot(point.x - b[index].x, point.y - b[index].y)));
}

// Training photos are kept small: 900 px on the long side, JPEG.
async function shrinkForTraining(source: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas unavailable");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode"))), "image/jpeg", 0.85));
  } finally {
    bitmap.close();
  }
}

// Reports how an auto-crop ended. The outcome and corners are always sent (no photo needed); the two
// photos only while the admin has switched collection on. Never blocks or breaks the page.
export type CropSampleRef = { id: number; token: string };

export async function reportCrop(outcome: CropOutcome, side: Side, autoQuad: CropQuad | null, finalQuad: CropQuad | null, photos: { original: Blob; result: Blob } | null): Promise<CropSampleRef | null> {
  try {
    // Ask the server right now whether photos are being kept - this page may have been open since before the admin switched collection on.
    if (photos) {
      const config = await fetch(apiUrl("/api/crop-training/config/")).then((response) => (response.ok ? response.json() : null)).catch(() => null);
      if (!config?.collectImages) photos = null;
    }
    const form = new FormData();
    form.append("outcome", outcome);
    form.append("side", side);
    if (autoQuad) form.append("autoQuad", JSON.stringify(autoQuad));
    if (finalQuad) form.append("finalQuad", JSON.stringify(finalQuad));
    if (photos) {
      form.append("original", await shrinkForTraining(photos.original), "original.jpg");
      form.append("result", await shrinkForTraining(photos.result), "result.jpg");
    }
    const response = await fetch(apiUrl("/api/crop-training/sample/"), { method: "POST", body: form });
    if (!response.ok) return null;
    const data = await response.json().catch(() => null);
    return data?.id && data?.token ? { id: data.id, token: data.token } : null;
  } catch {
    // Statistics only - ignore any failure.
    return null;
  }
}

/** What the customer chose in Filter & Light for a crop (null = they are back at the default look). Never throws. */
export async function reportFilter(sample: CropSampleRef | null | undefined, values: Record<string, number | string> | null) {
  if (!sample) return;
  try {
    await fetch(apiUrl(`/api/crop-training/sample/${sample.id}/filter/`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: sample.token, values }),
    });
  } catch {
    // Statistics only - ignore any failure.
  }
}
