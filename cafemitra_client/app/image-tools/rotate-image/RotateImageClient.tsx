"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Archive, Check, Download, Eye, FlipHorizontal2, FlipVertical2, Image as ImageIcon, LoaderCircle, Plus, RotateCcw, RotateCw, ShieldCheck, Trash2, X } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../../pdf-tools/PdfToolUpload";

type ImageItem = {
  id: string; file: File; preview: string; width: number; height: number; loading: boolean;
  result?: { blob: Blob; url: string; size: number; width: number; height: number; name: string };
};

export default function RotateImageClient({ children }: { children?: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultUrls = useRef(new Set<string>());
  const [items, setItems] = useState<ImageItem[]>([]);
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);

  useEffect(() => () => resultUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    const invalid = selected.find((file) => !isSupported(file));
    if (invalid) return setError(`${invalid.name} is not a supported JPG, PNG, or WebP image.`);
    setError("");
    const additions: ImageItem[] = selected.map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), width: 0, height: 0, loading: true }));
    setItems((current) => [...current, ...additions]);
    const ready = (await Promise.all(additions.map(async (item) => {
      try {
        const dimensions = await imageDimensions(item.preview);
        const complete = { ...item, ...dimensions, loading: false };
        setItems((current) => current.map((entry) => entry.id === item.id ? complete : entry));
        return complete;
      } catch {
        URL.revokeObjectURL(item.preview);
        setItems((current) => current.filter((entry) => entry.id !== item.id));
        setError(`${item.file.name} could not be opened.`);
        return null;
      }
    }))).filter((item): item is ImageItem => item !== null);
    if (ready.length) await rotateFiles(ready, angle, flipH, flipV);
  }

  function discard(item: ImageItem) { if (item.result) { URL.revokeObjectURL(item.result.url); resultUrls.current.delete(item.result.url); } }
  function removeItem(id: string) { setItems((current) => { const item = current.find((entry) => entry.id === id); if (item) { discard(item); URL.revokeObjectURL(item.preview); } return current.filter((entry) => entry.id !== id); }); }
  function clearAll() { items.forEach((item) => { discard(item); URL.revokeObjectURL(item.preview); }); setItems([]); setError(""); setPreviewItem(null); if (inputRef.current) inputRef.current.value = ""; }
  function resetSettings() { setAngle(0); setFlipH(false); setFlipV(false); }
  function nudge(delta: number) { setAngle((current) => normalizeAngle(current + delta)); }
  async function rotateAll() { if (!items.length || items.some((item) => item.loading) || rotating) return; await rotateFiles(items, angle, flipH, flipV); }

  async function rotateFiles(targets: ImageItem[], rotationAngle: number, mirrorH: boolean, mirrorV: boolean) {
    setRotating(true); setError("");
    try {
      for (const item of targets) {
        discard(item);
        const output = await rotateImage(item.file, item.preview, item.width, item.height, rotationAngle, mirrorH, mirrorV);
        const url = URL.createObjectURL(output.blob); resultUrls.current.add(url);
        const result = { ...output, url, size: output.blob.size, name: rotatedName(item.file.name) };
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, result } : entry));
      }
    } catch { setError("Image rotation could not be completed. Try a different angle or remove the problematic image."); }
    finally { setRotating(false); }
  }

  async function downloadZip() {
    const completed = items.filter((item) => item.result); if (!completed.length || zipBusy) return; setZipBusy(true);
    try { const { default: JSZip } = await import("jszip"); const zip = new JSZip(); completed.forEach((item) => zip.file(item.result!.name, item.result!.blob)); const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }); triggerDownload(URL.createObjectURL(blob), "repetigo-rotated-images.zip", true); }
    finally { setZipBusy(false); }
  }

  function drop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }
  const completed = items.filter((item) => item.result).length;

  return <DashboardShell activePath="/image-tools">
    <div className="dashboard compress-pdf-page">
      {items.length ? <><input ref={inputRef} hidden multiple type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} /><div className="compress-heading"><div><span className="auto-print-kicker">Free Image Tool</span><h2>Rotate Image</h2><p>Rotate, straighten, and flip JPG, PNG, and WebP images.</p></div><span><ShieldCheck size={16} /> Files stay in your browser</span></div></> : null}
      {!items.length ? <><PdfToolUpload title="Rotate Image" description="Rotate to any angle, or flip JPG, PNG, and WebP images - one at a time or in a batch." icon={RotateCw} inputRef={inputRef} onFiles={(files) => void addFiles(files)} accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" buttonLabel="Select images" dropLabel="or drop JPG, PNG, and WebP images here" headingLevel={children ? "h2" : "h1"} />{children}</> : <div className="compress-studio">
        <section className={`compress-workspace ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
          <div className="compress-workspace-head"><div><h2>Your image files</h2><p>Files rotate automatically with the current settings after upload.</p></div><button type="button" disabled={rotating} onClick={() => inputRef.current?.click()}><Plus size={18} /> Add images</button></div>
          <div className="compress-file-grid">{items.map((item) => <article className="compress-file-card" key={item.id}>
            <button className="compress-remove" type="button" disabled={rotating} onClick={() => removeItem(item.id)} aria-label={`Remove ${item.file.name}`}><X size={17} /></button>
            <div className="compress-file-meta"><strong title={item.file.name}>{item.file.name}</strong><span>{item.width ? `${item.width} × ${item.height}px` : "Reading image…"}</span></div>
            <div className="compress-thumbnail">{item.loading ? <LoaderCircle className="spin" size={27} /> : <img src={item.result?.url || item.preview} alt={`Preview of ${item.file.name}`} />}</div>
            {item.result ? <div className="compress-card-actions"><button type="button" onClick={() => setPreviewItem(item)}><Eye size={16} /> Preview</button><a href={item.result.url} download={item.result.name}><Download size={17} /> Download</a></div> : <div className="compress-pending">{item.loading ? "Preparing preview…" : rotating ? "Rotating automatically…" : "Ready to rotate"}</div>}
          </article>)}<button className="compress-add-card" type="button" disabled={rotating} onClick={() => inputRef.current?.click()}><span><Plus size={29} /></span><strong>Add image files</strong><small>Click or drop more files</small></button></div>
        </section>
        <aside className="compress-side-panel"><div><span className="auto-print-kicker">RepetiGo Image Tools</span><h2>Rotate Image</h2><p>{items.length} files · {completed} rotated</p></div>
          <div className="compress-side-config">
            <div className="crop-field-grid rotate-quick-grid">
              <button type="button" disabled={rotating} onClick={() => nudge(-90)}><RotateCcw size={17} /> Left 90°</button>
              <button type="button" disabled={rotating} onClick={() => nudge(90)}><RotateCw size={17} /> Right 90°</button>
              <button type="button" disabled={rotating} onClick={() => nudge(180)}>180°</button>
              <button type="button" disabled={rotating} onClick={resetSettings}>Reset</button>
            </div>
            <label><span>Custom angle</span><div className="resize-target-input"><input type="number" min="0" max="360" value={angle} disabled={rotating} onChange={(event) => setAngle(normalizeAngle(Number(event.target.value)))} /><b>°</b></div></label>
            <div className="crop-field-grid">
              <button type="button" className={flipH ? "active" : ""} disabled={rotating} onClick={() => setFlipH((value) => !value)}><FlipHorizontal2 size={17} /> Flip Horizontal</button>
              <button type="button" className={flipV ? "active" : ""} disabled={rotating} onClick={() => setFlipV((value) => !value)}><FlipVertical2 size={17} /> Flip Vertical</button>
            </div>
          </div>
          <div className="compress-side-summary"><span><Check size={18} /></span><div><strong>{rotating ? "Rotating files…" : completed === items.length ? "All files ready" : "Preparing rotation"}</strong><small>{rotating ? "Please keep this page open." : "Adjust the angle or flip, then apply to all files."}</small></div></div>
          <div className="compress-side-actions"><button className="compress-run" type="button" disabled={rotating || items.some((item) => item.loading)} onClick={rotateAll}>{rotating ? <LoaderCircle className="spin" size={19} /> : <RotateCw size={19} />} {rotating ? "Rotating…" : "Rotate All"}</button><button className="compress-zip-button" type="button" disabled={!completed || zipBusy || rotating} onClick={downloadZip}>{zipBusy ? <LoaderCircle className="spin" size={19} /> : <Download size={19} />} Download ZIP</button><button className="compress-delete-all" type="button" disabled={rotating} onClick={clearAll}><Trash2 size={18} /> Delete all</button><button className="compress-start-over" type="button" disabled={rotating} onClick={clearAll}><RotateCcw size={17} /> Start over</button></div>
        </aside>
      </div>}
      {error ? <div className="profile-alert error compress-error" role="alert">{error}</div> : null}
      {items.length ? children : null}
      {previewItem?.result ? <ImagePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} /> : null}
    </div>
  </DashboardShell>;
}

function ImagePreviewModal({ item, onClose }: { item: ImageItem; onClose: () => void }) {
  if (!item.result) return null;
  return <div className="compress-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Preview for ${item.file.name}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="compress-preview-modal image-compress-preview"><header><div><h2>Rotated image preview</h2><p>{item.file.name} · {item.result.width} × {item.result.height}px</p></div><button type="button" onClick={onClose} aria-label="Close preview"><X size={21} /></button></header><div className="image-compress-compare"><article><div><strong>Original</strong><span>{item.width} × {item.height}px</span></div><img src={item.preview} alt="Original image" /></article><article><div><strong>Rotated</strong><span>{item.result.width} × {item.result.height}px</span></div><img src={item.result.url} alt="Rotated image" /></article></div><footer><div><span>Compare original and rotated orientation</span></div><a href={item.result.url} download={item.result.name}><Download size={18} /> Download rotated image</a></footer></section></div>;
}

function isSupported(file: File) { return ["image/jpeg", "image/png", "image/webp"].includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name); }
function imageDimensions(url: string) { return new Promise<{ width: number; height: number }>((resolve, reject) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = reject; image.src = url; }); }
function normalizeAngle(value: number) { return ((Math.round(value) % 360) + 360) % 360; }

async function rotateImage(file: File, url: string, width: number, height: number, angle: number, flipH: boolean, flipV: boolean) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => { const value = new Image(); value.onload = () => resolve(value); value.onerror = reject; value.src = url; });
  const radians = angle * Math.PI / 180;
  const outWidth = Math.max(1, Math.ceil(Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians))));
  const outHeight = Math.max(1, Math.ceil(Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians))));
  const canvas = document.createElement("canvas"); canvas.width = outWidth; canvas.height = outHeight;
  const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
  context.translate(outWidth / 2, outHeight / 2);
  context.rotate(radians);
  context.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  context.drawImage(image, -width / 2, -height / 2);
  const mime = file.type || "image/png";
  const blob = await canvasBlob(canvas, mime, 0.92);
  return { blob, width: outWidth, height: outHeight };
}
function canvasBlob(canvas: HTMLCanvasElement, mime: string, quality: number) { return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Rotation failed")), mime, quality)); }
function rotatedName(name: string) { return `${name.replace(/\.[^.]+$/, "")}-rotated${name.match(/\.[^.]+$/)?.[0] || ".png"}`; }
function triggerDownload(url: string, name: string, revoke = false) { const link = document.createElement("a"); link.href = url; link.download = name; link.click(); if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000); }
