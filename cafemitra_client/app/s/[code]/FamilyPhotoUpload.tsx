"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Crop, Eye, Plus, RotateCw, Upload, X } from "lucide-react";
import {
  CropEditor,
  cropImage,
  DEFAULT_CROP_QUAD,
  DEFAULT_CROP_RECT,
  PerspectiveCropEditor,
  warpPerspectiveCrop,
  type CropQuad,
  type CropRect,
} from "../../CropEditor";

// A phone photo is often 4000+ px / several MB. Showing four of those at once
// (and later sending them all base64-encoded to the server) makes the page
// sluggish, and a family photo does not need that much detail - shrink every
// photo to a sensible size as soon as it is added, as a JPEG.
const MAX_PHOTO_SIDE = 1600;

// willReadFrequently keeps these canvases on the CPU: a GPU-backed canvas makes
// toBlob wait on a slow readback (over a second per photo on some machines).
async function normalizePhoto(source: Blob, name: string, quarterTurns = 0): Promise<File> {
  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height));
    const drawWidth = Math.max(1, Math.round(bitmap.width * scale));
    const drawHeight = Math.max(1, Math.round(bitmap.height * scale));
    const sideways = quarterTurns % 2 === 1;
    const width = sideways ? drawHeight : drawWidth;
    const height = sideways ? drawWidth : drawHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas unavailable");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    if (quarterTurns) {
      context.translate(width / 2, height / 2);
      context.rotate((quarterTurns * Math.PI) / 2);
      context.drawImage(bitmap, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    } else {
      context.drawImage(bitmap, 0, 0, drawWidth, drawHeight);
    }
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Encode failed"))), "image/jpeg", 0.92));
    return new File([blob], name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}

// Customer upload for the Family Passport Photo service: several photos at
// once (one per person), shown as numbered thumbnails with the same Crop /
// Rotate / Remove tools as the single passport photo upload.
export default function FamilyPhotoUpload({
  files,
  onChange,
  min,
  max,
  disabled,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  min: number;
  max: number;
  disabled?: boolean;
}) {
  const [urls, setUrls] = useState<string[]>([]);
  const urlByFileRef = useRef(new Map<File, string>());
  const filesRef = useRef(files);
  filesRef.current = files;
  const [preparing, setPreparing] = useState(false);
  const [note, setNote] = useState("");
  const [rotatingIndex, setRotatingIndex] = useState<number | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  // The photo the shared Crop / Rotate / Remove toolbar works on (click a photo to select it).
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [cropMode, setCropMode] = useState<"straight" | "perspective">("perspective");
  const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP_RECT);
  const [cropQuad, setCropQuad] = useState<CropQuad>(DEFAULT_CROP_QUAD);
  const [cropBusy, setCropBusy] = useState(false);

  // One object url per file, created once - changing one photo no longer
  // reloads every thumbnail.
  useEffect(() => {
    const map = urlByFileRef.current;
    files.forEach((file) => {
      if (!map.has(file)) map.set(file, URL.createObjectURL(file));
    });
    Array.from(map.keys()).forEach((file) => {
      if (!files.includes(file)) {
        URL.revokeObjectURL(map.get(file)!);
        map.delete(file);
      }
    });
    setUrls(files.map((file) => map.get(file) as string));
  }, [files]);

  useEffect(() => {
    const map = urlByFileRef.current;
    return () => {
      map.forEach((url) => URL.revokeObjectURL(url));
      map.clear();
    };
  }, []);

  async function addFiles(list: FileList | null) {
    if (!list || preparing) return;
    const picked = Array.from(list).filter((file) => file.type.startsWith("image/") || /\.(jpe?g|png)$/i.test(file.name));
    const skippedType = list.length - picked.length;
    const accepted = picked.slice(0, Math.max(0, max - filesRef.current.length));
    const skippedExtra = picked.length - accepted.length;
    setNote(
      skippedExtra > 0
        ? `Only ${max} photos are allowed - the extra ${skippedExtra} were skipped.`
        : skippedType > 0
          ? "Only JPG, PNG or JPEG photos can be used - the other files were skipped."
          : "",
    );
    if (!accepted.length) return;
    setPreparing(true);
    try {
      const prepared: File[] = [];
      for (const file of accepted) {
        // One at a time keeps memory low; a photo that cannot be resized is used as it is.
        prepared.push(await normalizePhoto(file, file.name).catch(() => file));
      }
      onChange([...filesRef.current, ...prepared].slice(0, max));
    } finally {
      setPreparing(false);
    }
  }

  function removeAt(index: number) {
    setNote("");
    setPreviewIndex(null);
    setSelectedIndex(null);
    onChange(files.filter((_, position) => position !== index));
  }

  // shrink=false for a rotate: the photo was already shrunk to a JPEG when added, and
  // rotateImageBlob keeps it a JPEG - re-encoding it a second time only costs time.
  async function replaceAt(index: number, blob: Blob, original: File) {
    const next = [...filesRef.current];
    next[index] = await normalizePhoto(blob, original.name).catch(() => new File([blob], original.name, { type: blob.type || original.type }));
    onChange(next);
  }

  async function rotateAt(index: number) {
    if (rotatingIndex !== null) return;
    setRotatingIndex(index);
    setNote("");
    try {
      const next = [...filesRef.current];
      next[index] = await normalizePhoto(files[index], files[index].name, 1);
      onChange(next);
    } catch {
      setNote("Could not rotate this photo. Please try again.");
    } finally {
      setRotatingIndex(null);
    }
  }

  function openCrop(index: number) {
    setCropRect(DEFAULT_CROP_RECT);
    setCropQuad(DEFAULT_CROP_QUAD);
    setCropIndex(index);
  }

  async function applyCrop() {
    if (cropIndex === null || !urls[cropIndex] || cropBusy) return;
    setCropBusy(true);
    try {
      const blob = cropMode === "perspective" ? await warpPerspectiveCrop(urls[cropIndex], cropQuad) : await cropImage(urls[cropIndex], cropRect);
      await replaceAt(cropIndex, blob, files[cropIndex]);
      setCropIndex(null);
    } catch {
      setNote("Could not crop this photo. Please try again.");
    } finally {
      setCropBusy(false);
    }
  }

  const busy = Boolean(disabled) || preparing;
  const active = selectedIndex !== null && selectedIndex < files.length ? selectedIndex : files.length ? files.length - 1 : null;

  return (
    <div className="family-public-upload">
      <p className="customer-inline-help">
        Upload one clear, front-facing photo of each person ({min} to {max} people) - you can pick several photos at once. We merge them into one family passport photo.
      </p>
      {files.length ? (
        <div className="family-photo-toolbar" role="toolbar" aria-label="Edit the selected photo">
          <span>{active !== null ? `Selected: Person ${active + 1}` : "Select a photo"}</span>
          <button type="button" onClick={() => active !== null && openCrop(active)} disabled={busy || active === null || rotatingIndex !== null}>
            <Crop size={16} /> Crop
          </button>
          <button type="button" onClick={() => active !== null && void rotateAt(active)} disabled={busy || active === null || rotatingIndex !== null}>
            <RotateCw size={16} /> {rotatingIndex !== null ? "Rotating…" : "Rotate"}
          </button>
          <button type="button" onClick={() => active !== null && removeAt(active)} disabled={busy || active === null}>
            <X size={16} /> Remove
          </button>
        </div>
      ) : null}
      {files.length === 0 ? (
        // Same full-width upload box as the single Passport Photo upload.
        <label className="customer-upload">
          <Upload size={24} />
          <strong>Upload Family Photos</strong>
          <span>
            Select {min} to {max} JPG, PNG or JPEG photos - one per person. You can choose several photos at once.
          </span>
          <em>{preparing ? "Please wait…" : "Tap to choose photos"}</em>
          <input
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            type="file"
            multiple
            disabled={busy}
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      ) : (
      <div className="family-photo-slots">
        {files.map((file, index) => (
          <div
            className={`family-photo-slot${active === index ? " selected" : ""}`}
            key={`${file.name}-${file.size}-${index}`}
            onClick={() => setSelectedIndex(index)}
          >
            <div className="customer-document-preview">
              <div className="document-thumb">
                {urls[index] ? <img src={urls[index]} alt="" /> : null}
                <button className="document-thumb-preview" type="button" onClick={() => setPreviewIndex(index)} aria-label={`Preview person ${index + 1}`} title="Preview">
                  <Eye size={17} />
                </button>
              </div>
              <div>
                <strong>Person {index + 1}</strong>
              </div>
            </div>
          </div>
        ))}
        {files.length < max ? (
          <label className="family-photo-add-slot">
            <Plus size={20} />
            <span>Add person</span>
            <input
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              type="file"
              multiple
              disabled={busy}
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
        ) : null}
      </div>
      )}
      {preparing ? <small className="customer-inline-help">Preparing your photos…</small> : null}
      <small className="customer-inline-help">
        {files.length} of {max} photos added{files.length < min ? ` - add at least ${min} to continue.` : "."}
      </small>
      {note ? <div className="profile-alert error">{note}</div> : null}

      {/* The popups are rendered on <body>: inside the step card they were clipped by it and the next step showed through. */}
      {previewIndex !== null && urls[previewIndex] ? createPortal(
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Photo preview" onClick={() => setPreviewIndex(null)}>
          <div className="document-preview-window" onClick={(event) => event.stopPropagation()}>
            <div className="document-preview-head">
              <div>
                <strong>Person {previewIndex + 1}</strong>
                <span>{files[previewIndex]?.name}</span>
              </div>
              <button type="button" onClick={() => setPreviewIndex(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="document-preview-body">
              <img src={urls[previewIndex]} alt="" />
            </div>
            <div className="document-preview-actions">
              <button type="button" onClick={() => setPreviewIndex(null)}>
                <X size={16} /> Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}

      {cropIndex !== null && urls[cropIndex] ? createPortal(
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Crop photo">
          <div className="crop-window">
            <div className="document-preview-head">
              <div>
                <strong>Crop Person {cropIndex + 1}</strong>
                <span>{files[cropIndex]?.name}</span>
              </div>
              <button type="button" onClick={() => setCropIndex(null)} aria-label="Close crop">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body">
              <div className="crop-mode-toggle">
                <button type="button" className={cropMode === "perspective" ? "active" : ""} onClick={() => setCropMode("perspective")}>
                  Perspective crop
                </button>
                <button type="button" className={cropMode === "straight" ? "active" : ""} onClick={() => setCropMode("straight")}>
                  Straight crop
                </button>
              </div>
              {cropMode === "straight" ? (
                <CropEditor fileUrl={urls[cropIndex]} rect={cropRect} onRectChange={setCropRect} />
              ) : (
                <PerspectiveCropEditor fileUrl={urls[cropIndex]} quad={cropQuad} onQuadChange={setCropQuad} />
              )}
              <div className="crop-controls">
                <p>
                  {cropMode === "straight"
                    ? "Drag a corner or edge to resize the area. Drag inside the box to move it."
                    : "Drag each corner onto the photo's edges - useful when the photo was taken at an angle."}
                </p>
                <button type="button" onClick={() => (cropMode === "straight" ? setCropRect(DEFAULT_CROP_RECT) : setCropQuad(DEFAULT_CROP_QUAD))}>
                  Reset Crop
                </button>
                <button type="button" onClick={() => void applyCrop()} disabled={cropBusy}>
                  <Crop size={17} /> {cropBusy ? "Cropping…" : "Apply Crop"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
