"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Crop, FileText, LoaderCircle, RotateCw, Trash2, X } from "lucide-react";
import { CropEditor, cropImage, DEFAULT_CROP_QUAD, DEFAULT_CROP_RECT, PerspectiveCropEditor, rotateImageBlob, warpPerspectiveCrop, type CropQuad, type CropRect } from "../../CropEditor";

type Item = { id: string; file: File; url: string; isImage: boolean };

function isImageName(file: File) {
  return file.type.startsWith("image/") || /\.(jpg|jpeg|png)$/i.test(file.name);
}

// Shown when several files are picked and at least one is a photo: every photo can be cropped / rotated (or the
// file removed / moved) before everything is merged into one PDF. The edited files are handed back in order.
export default function MergePrepareModal({ files, onCancel, onConfirm }: { files: File[]; onCancel: () => void; onConfirm: (files: File[]) => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [cropId, setCropId] = useState("");
  const [cropMode, setCropMode] = useState<"straight" | "perspective">("straight");
  const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP_RECT);
  const [cropQuad, setCropQuad] = useState<CropQuad>(DEFAULT_CROP_QUAD);
  const [error, setError] = useState("");
  const itemsRef = useRef<Item[]>(items);
  itemsRef.current = items;

  // The preview URLs are made here (not while rendering) and freed when the window goes away, so they stay valid
  // even when React mounts the window twice in development.
  useEffect(() => {
    const created = files.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), isImage: isImageName(file) }));
    setItems(created);
    setReady(true);
    return () => {
      created.forEach((item) => URL.revokeObjectURL(item.url));
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [files]);

  function replaceFile(id: string, blob: Blob, name: string) {
    const file = new File([blob], name, { type: blob.type || "image/png" });
    const url = URL.createObjectURL(file);
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        URL.revokeObjectURL(item.url);
        return { ...item, file, url };
      }),
    );
  }

  async function rotate(item: Item) {
    if (busyId) return;
    setBusyId(item.id);
    setError("");
    try {
      replaceFile(item.id, await rotateImageBlob(item.file, 90), item.file.name.replace(/(\.[^.]+)?$/, "-rotated.png"));
    } catch {
      setError("Could not rotate this photo.");
    } finally {
      setBusyId("");
    }
  }

  function openCrop(item: Item) {
    setCropRect(DEFAULT_CROP_RECT);
    setCropQuad(DEFAULT_CROP_QUAD);
    setCropId(item.id);
  }

  async function applyCrop() {
    const item = items.find((entry) => entry.id === cropId);
    if (!item) return;
    setBusyId(item.id);
    setError("");
    try {
      const blob = cropMode === "perspective" ? await warpPerspectiveCrop(item.url, cropQuad) : await cropImage(item.url, cropRect);
      replaceFile(item.id, blob, item.file.name.replace(/(\.[^.]+)?$/, "-cropped.png"));
      setCropId("");
    } catch {
      setError("Could not crop this photo.");
    } finally {
      setBusyId("");
    }
  }

  function remove(id: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  }

  function move(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = current.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const cropItem = items.find((item) => item.id === cropId) ?? null;

  return (
    <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Prepare files">
      <div className="merge-prepare-window">
        <div className="document-preview-head">
          <div>
            <strong>Prepare your files</strong>
            <span>Crop or rotate each photo before everything is combined into one PDF.</span>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="merge-prepare-list">
          {items.map((item, index) => (
            <div className="merge-prepare-item" key={item.id}>
              <div className="merge-prepare-thumb">
                {item.isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.file.name} />
                ) : (
                  <FileText size={34} />
                )}
                {busyId === item.id ? (
                  <span className="merge-prepare-busy">
                    <LoaderCircle size={22} className="spin" />
                  </span>
                ) : null}
              </div>
              <div className="merge-prepare-name">
                <strong title={item.file.name}>{item.file.name}</strong>
                <small>{item.isImage ? "Photo" : "PDF - added as it is"}</small>
              </div>
              <div className="merge-prepare-actions">
                {item.isImage ? (
                  <>
                    <button type="button" onClick={() => openCrop(item)} disabled={Boolean(busyId)}>
                      <Crop size={15} /> Crop
                    </button>
                    <button type="button" onClick={() => void rotate(item)} disabled={Boolean(busyId)}>
                      <RotateCw size={15} /> Rotate
                    </button>
                  </>
                ) : null}
                <button type="button" className="icon" onClick={() => move(item.id, -1)} disabled={index === 0} aria-label="Move up" title="Move up">
                  <ChevronUp size={16} />
                </button>
                <button type="button" className="icon" onClick={() => move(item.id, 1)} disabled={index === items.length - 1} aria-label="Move down" title="Move down">
                  <ChevronDown size={16} />
                </button>
                <button type="button" className="icon danger" onClick={() => remove(item.id)} aria-label="Remove file" title="Remove file">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
          {ready && !items.length ? <p className="merge-prepare-empty">No files left.</p> : null}
        </div>
        {error ? <p className="merge-prepare-error">{error}</p> : null}
        <div className="merge-prepare-footer">
          <button type="button" className="merge-prepare-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="merge-prepare-go" disabled={!items.length || Boolean(busyId)} onClick={() => onConfirm(items.map((item) => item.file))}>
            Create PDF ({items.length} file{items.length === 1 ? "" : "s"})
          </button>
        </div>
      </div>

      {cropItem ? (
        <div className="document-preview-modal merge-prepare-crop" role="dialog" aria-modal="true" aria-label="Crop image">
          <div className="crop-window idcrop-window">
            <div className="document-preview-head">
              <div>
                <strong>Crop Image</strong>
                <span>{cropItem.file.name}</span>
              </div>
              <button type="button" onClick={() => setCropId("")} aria-label="Close crop">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body idcrop-body">
              <div className="crop-mode-toggle">
                <button type="button" className={cropMode === "straight" ? "active" : ""} onClick={() => setCropMode("straight")}>
                  Straight crop
                </button>
                <button type="button" className={cropMode === "perspective" ? "active" : ""} onClick={() => setCropMode("perspective")}>
                  Perspective crop
                </button>
              </div>
              {cropMode === "straight" ? (
                <CropEditor fileUrl={cropItem.url} rect={cropRect} onRectChange={setCropRect} />
              ) : (
                <PerspectiveCropEditor fileUrl={cropItem.url} quad={cropQuad} onQuadChange={setCropQuad} />
              )}
              <div className="crop-controls">
                <p>
                  {cropMode === "straight"
                    ? "Drag a corner or edge to resize the print area. Drag inside the box to move the crop area."
                    : "Drag each corner onto the document's actual edge - useful when the photo was taken at an angle."}
                </p>
                <button type="button" onClick={() => (cropMode === "straight" ? setCropRect(DEFAULT_CROP_RECT) : setCropQuad(DEFAULT_CROP_QUAD))}>
                  Reset Crop
                </button>
                <button type="button" onClick={() => void applyCrop()} disabled={Boolean(busyId)}>
                  <Crop size={17} /> Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
