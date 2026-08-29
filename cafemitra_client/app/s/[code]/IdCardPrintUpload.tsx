"use client";

import { useState } from "react";
import type React from "react";
import { Crop, RotateCcw, Upload, X } from "lucide-react";
import { CropEditor, cropImage, loadImage, DEFAULT_CROP_RECT, type CropRect } from "../../CropEditor";

type Side = "front" | "back";
type SideState = { file: File | null; url: string; cropRect: CropRect };

const EMPTY_SIDE: SideState = { file: null, url: "", cropRect: DEFAULT_CROP_RECT };
const CARD_ASPECT_RATIO = "85.6/53.98";

// Composes front + back onto one A4-sized sheet, at true 85.6x53.98mm card
// scale, near the top edge - the exact same layout the shop-owner dashboard's
// ID Card Print tool prints. This is what actually gets uploaded as the
// order's single document (PrintOrder only supports one file per order), so
// what the shop's regular printer produces from it is already the finished,
// correctly-scaled sheet - no server-side or agent-side composition needed.
async function composeIdCardSheet(frontUrl: string, backUrl: string): Promise<Blob> {
  const dpi = 150;
  const mm = (value: number) => Math.round((value / 25.4) * dpi);
  const pageWidth = mm(210);
  const pageHeight = mm(297);
  const cardWidth = mm(85.6);
  const cardHeight = mm(53.98);
  const margin = mm(10);
  const gap = mm(6);

  const canvas = document.createElement("canvas");
  canvas.width = pageWidth;
  canvas.height = pageHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, pageWidth, pageHeight);

  const frontImage = await loadImage(frontUrl);
  drawCover(context, frontImage, margin, margin, cardWidth, cardHeight);

  if (backUrl) {
    const backImage = await loadImage(backUrl);
    drawCover(context, backImage, margin + cardWidth + gap, margin, cardWidth, cardHeight);
  }

  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not prepare the ID card sheet."))), "image/png", 0.92));
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

export default function IdCardPrintUpload({ onComposed, busy }: { onComposed: (file: File) => void; busy?: boolean }) {
  const [front, setFront] = useState<SideState>(EMPTY_SIDE);
  const [back, setBack] = useState<SideState>(EMPTY_SIDE);
  const [cropSide, setCropSide] = useState<Side | null>(null);
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState("");

  const sideState = (side: Side) => (side === "front" ? front : back);
  const setSideState = (side: Side, next: SideState) => (side === "front" ? setFront(next) : setBack(next));

  function handleFileChange(side: Side, selected?: File | null) {
    if (!selected) return;
    const current = sideState(side);
    if (current.url) URL.revokeObjectURL(current.url);
    setSideState(side, { file: selected, url: URL.createObjectURL(selected), cropRect: DEFAULT_CROP_RECT });
    setError("");
  }

  function handleDrop(side: Side, event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileChange(side, dropped);
  }

  function clearSide(side: Side) {
    const current = sideState(side);
    if (current.url) URL.revokeObjectURL(current.url);
    setSideState(side, EMPTY_SIDE);
  }

  function updateCropRect(side: Side, rect: CropRect) {
    setSideState(side, { ...sideState(side), cropRect: rect });
  }

  async function applyCrop() {
    if (!cropSide) return;
    const current = sideState(cropSide);
    if (!current.url) return;
    try {
      const croppedBlob = await cropImage(current.url, current.cropRect);
      const croppedFile = new File([croppedBlob], (current.file?.name || "photo").replace(/(\.[^.]+)?$/, "-cropped.png"), { type: "image/png" });
      URL.revokeObjectURL(current.url);
      setSideState(cropSide, { file: croppedFile, url: URL.createObjectURL(croppedFile), cropRect: DEFAULT_CROP_RECT });
      setCropSide(null);
    } catch {
      // Crop dialog stays open so the customer can retry.
    }
  }

  async function composeAndContinue() {
    if (!front.url || composing || busy) return;
    setComposing(true);
    setError("");
    try {
      const composedBlob = await composeIdCardSheet(front.url, back.url);
      onComposed(new File([composedBlob], "id-card-print.png", { type: "image/png" }));
    } catch {
      setError("Could not prepare your ID card for upload. Please try again.");
    } finally {
      setComposing(false);
    }
  }

  const activeCropState = cropSide ? sideState(cropSide) : null;

  return (
    <>
      <div className="idcard-photo-pair">
        {(["front", "back"] as Side[]).map((side) => {
          const state = sideState(side);
          return (
            <div key={side} className="idcard-side-slot">
              <span className="idcard-side-label">
                {side === "front" ? "Front" : "Back"}
                {side === "back" ? <em> (optional)</em> : null}
              </span>
              {state.url ? (
                <div className="idcard-card-slot filled">
                  <div className="idcard-card-slot-actions">
                    <button type="button" onClick={() => setCropSide(side)}>
                      <Crop size={12} /> Crop
                    </button>
                    <button type="button" onClick={() => clearSide(side)}>
                      <X size={12} /> Remove
                    </button>
                  </div>
                  <img src={state.url} alt={`${side === "front" ? "Front" : "Back"} of your ID card`} />
                </div>
              ) : (
                <label className="idcard-card-slot empty" onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(side, event)}>
                  <Upload size={22} />
                  <strong>Upload {side === "front" ? "Front" : "Back"} Photo</strong>
                  <span>{side === "back" ? "Skip this if your card has nothing worth printing on the back." : "Drag & drop or choose a JPG/PNG file."}</span>
                  <input accept=".jpg,.jpeg,.png" type="file" onChange={(event) => handleFileChange(side, event.target.files?.[0])} />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {error ? <p className="customer-inline-help" style={{ color: "#c7354d" }}>{error}</p> : null}

      <button className="passport-preview-button" type="button" disabled={!front.url || composing || busy} onClick={composeAndContinue}>
        {composing ? "Preparing…" : "Continue"}
      </button>

      {cropSide && activeCropState?.url ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Crop photo">
          <div className="crop-window">
            <div className="document-preview-head">
              <div>
                <strong>Crop {cropSide === "front" ? "Front" : "Back"} Photo</strong>
                <span>{activeCropState.file?.name}</span>
              </div>
              <button type="button" onClick={() => setCropSide(null)} aria-label="Close crop">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body">
              <CropEditor
                fileUrl={activeCropState.url}
                rect={activeCropState.cropRect}
                onRectChange={(rect) => updateCropRect(cropSide, rect)}
                aspectRatio={CARD_ASPECT_RATIO}
              />
              <div className="crop-controls">
                <p>Drag a corner or edge to resize the crop area. Drag inside the box to move it.</p>
                <button type="button" onClick={() => updateCropRect(cropSide, DEFAULT_CROP_RECT)}>
                  <RotateCcw size={16} /> Reset Crop
                </button>
                <button type="button" onClick={applyCrop}>
                  <Crop size={17} /> Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
