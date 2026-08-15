"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { CropEditor, cropImage, DEFAULT_CROP_RECT, loadImage, type CropRect } from "../../CropEditor";

export default function PhotoUploadField({ photo, onChange }: { photo: string; onChange: (dataUrl: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [rect, setRect] = useState<CropRect>(DEFAULT_CROP_RECT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      setPendingUrl(String(reader.result));
      setRect(DEFAULT_CROP_RECT);
    };
    reader.onerror = () => setError("Could not read that image. Please try another file.");
    reader.readAsDataURL(file);
  }

  async function confirmCrop() {
    if (!pendingUrl) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await cropAndSquarePhoto(pendingUrl, rect);
      onChange(dataUrl);
      setPendingUrl(null);
    } catch {
      setError("Could not process that photo. Please try another file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="resbuild-photo-field">
      {pendingUrl ? (
        <div className="resbuild-photo-crop">
          <CropEditor fileUrl={pendingUrl} rect={rect} onRectChange={setRect} />
          <p className="resbuild-photo-hint">Drag to reposition, resize the box to frame your face. It will be saved as a square photo.</p>
          <div className="resbuild-photo-crop-actions">
            <button type="button" className="resbuild-btn-secondary" onClick={() => setPendingUrl(null)}>Cancel</button>
            <button type="button" className="resbuild-btn-primary" onClick={confirmCrop} disabled={busy}>{busy ? "Saving..." : "Save photo"}</button>
          </div>
        </div>
      ) : (
        <div className="resbuild-photo-row">
          {photo ? <img className="resbuild-photo-thumb" src={photo} alt="" /> : <span className="resbuild-photo-thumb resbuild-photo-thumb-empty" />}
          <div className="resbuild-photo-buttons">
            <button type="button" className="resbuild-btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> {photo ? "Change photo" : "Upload photo"}
            </button>
            {photo ? (
              <button type="button" className="resbuild-icon-btn" onClick={() => onChange("")} aria-label="Remove photo"><X size={14} /></button>
            ) : null}
          </div>
        </div>
      )}
      {error ? <p className="resbuild-error">{error}</p> : null}
      <input ref={fileInputRef} type="file" accept="image/*" className="resbuild-photo-input" onChange={handleFileSelect} />
    </div>
  );
}

// Crops to exactly the user's selection, then places that (uncropped, at its
// own aspect ratio) onto a square canvas - scaled to fit and centered, with
// the surrounding area padded rather than trimmed. An earlier version
// center-cropped the selection down to a square, which silently discarded
// whichever edge (top/bottom or left/right) didn't fit - if someone dragged
// a non-square box, part of what they'd deliberately framed just vanished.
// Padding never loses any of the user's selection, only a plain square crop
// (the common case - the default box is already square) needs no padding.
async function cropAndSquarePhoto(fileUrl: string, rect: CropRect, size = 420) {
  const croppedBlob = await cropImage(fileUrl, rect);
  const croppedUrl = URL.createObjectURL(croppedBlob);
  try {
    const image = await loadImage(croppedUrl);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, size, size);
    const scale = Math.min(size / image.naturalWidth, size / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    ctx.drawImage(image, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
    return canvas.toDataURL("image/jpeg", 0.9);
  } finally {
    URL.revokeObjectURL(croppedUrl);
  }
}
