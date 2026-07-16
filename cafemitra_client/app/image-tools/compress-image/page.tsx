"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { Archive, Check, Download, Eye, Gauge, Image as ImageIcon, Info, LoaderCircle, Plus, RotateCcw, ShieldCheck, Trash2, X } from "lucide-react";
import JSZip from "jszip";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../../pdf-tools/PdfToolUpload";

type ImageItem = {
  id: string; file: File; preview: string; width: number; height: number; loading: boolean; progress: number;
  result?: { blob: Blob; url: string; size: number; width: number; height: number; name: string };
};

export default function CompressImagePage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultUrls = useRef(new Set<string>());
  const [items, setItems] = useState<ImageItem[]>([]);
  const [level, setLevel] = useState(60);
  const [dragging, setDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState("");
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);

  useEffect(() => () => resultUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    const invalid = selected.find((file) => !isSupported(file));
    if (invalid) return setError(`${invalid.name} is not a supported JPG, PNG, or WebP image.`);
    setError("");
    const additions: ImageItem[] = selected.map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), width: 0, height: 0, loading: true, progress: 0 }));
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
    if (ready.length) await compressFiles(ready, 60);
  }

  function discard(item: ImageItem) { if (item.result) { URL.revokeObjectURL(item.result.url); resultUrls.current.delete(item.result.url); } }
  function removeItem(id: string) { setItems((current) => { const item = current.find((entry) => entry.id === id); if (item) { discard(item); URL.revokeObjectURL(item.preview); } return current.filter((entry) => entry.id !== id); }); }
  function clearAll() { items.forEach((item) => { discard(item); URL.revokeObjectURL(item.preview); }); setItems([]); setError(""); setPreviewItem(null); if (inputRef.current) inputRef.current.value = ""; }
  function updateLevel(value: number) { setLevel(value); setItems((current) => current.map((item) => { discard(item); return { ...item, result: undefined, progress: 0 }; })); }
  async function compressAll() { if (!items.length || items.some((item) => item.loading) || compressing) return; await compressFiles(items, level); }

  async function compressFiles(targets: ImageItem[], compressionLevel: number) {
    setCompressing(true); setError("");
    try {
      for (const item of targets) {
        discard(item); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress: 10 } : entry));
        const output = await compressImage(item.file, item.preview, item.width, item.height, compressionLevel);
        const url = URL.createObjectURL(output.blob); resultUrls.current.add(url);
        const result = { ...output, url, size: output.blob.size, name: compressedName(item.file.name, output.blob.type) };
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, result, progress: 100 } : entry));
      }
    } catch { setError("Image compression could not be completed. Try a lower level or remove the problematic image."); }
    finally { setCompressing(false); }
  }

  async function downloadZip() {
    const completed = items.filter((item) => item.result); if (!completed.length || zipBusy) return; setZipBusy(true);
    try { const zip = new JSZip(); completed.forEach((item) => zip.file(item.result!.name, item.result!.blob)); const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }); triggerDownload(URL.createObjectURL(blob), "repetigo-compressed-images.zip", true); }
    finally { setZipBusy(false); }
  }

  function drop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }
  const completed = items.filter((item) => item.result).length;

  return <DashboardShell activePath="/image-tools">
    <div className="dashboard compress-pdf-page">
      {items.length ? <><input ref={inputRef} hidden multiple type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} /><div className="compress-heading"><div><span className="auto-print-kicker">Free Image Tool</span><h1>Compress Image</h1><p>Reduce image file size while balancing visual quality.</p></div><span><ShieldCheck size={16} /> Files stay in your browser</span></div></> : null}
      {!items.length ? <PdfToolUpload title="Compress Image" description="Reduce JPG, PNG, and WebP file size while balancing visual quality." icon={ImageIcon} inputRef={inputRef} onFiles={(files) => void addFiles(files)} accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" buttonLabel="Select images" dropLabel="or drop JPG, PNG, and WebP images here" /> : <div className="compress-studio">
        <section className={`compress-workspace ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
          <div className="compress-workspace-head"><div><h2>Your image files</h2><p>Files are automatically compressed at 60% after upload.</p></div><button type="button" disabled={compressing} onClick={() => inputRef.current?.click()}><Plus size={18} /> Add images</button></div>
          <div className="compress-file-grid">{items.map((item) => <article className="compress-file-card" key={item.id}>
            <button className="compress-remove" type="button" disabled={compressing} onClick={() => removeItem(item.id)} aria-label={`Remove ${item.file.name}`}><X size={17} /></button>
            <div className="compress-file-meta"><strong title={item.file.name}>{item.file.name}</strong><span>Original: {formatBytes(item.file.size)}</span></div>
            <div className="compress-thumbnail">{item.loading ? <LoaderCircle className="spin" size={27} /> : <img src={item.preview} alt={`Preview of ${item.file.name}`} />}{item.progress > 0 && item.progress < 100 ? <div><LoaderCircle className="spin" size={21} /><strong>{item.progress}%</strong></div> : null}</div>
            <small>{item.width ? `${item.width} × ${item.height}px` : "Reading image…"}</small>
            {item.result ? <><div className="compress-saving"><span>Compressed: <strong>{formatBytes(item.result.size)}</strong></span><em>{savingText(item.file.size, item.result.size)}</em></div><div className="compress-card-actions"><button type="button" onClick={() => setPreviewItem(item)}><Eye size={16} /> Preview</button><a href={item.result.url} download={item.result.name}><Download size={17} /> Download</a></div></> : <div className="compress-pending">{item.loading ? "Preparing preview…" : item.progress ? "Compressing automatically…" : "Ready to compress"}</div>}
          </article>)}<button className="compress-add-card" type="button" disabled={compressing} onClick={() => inputRef.current?.click()}><span><Plus size={29} /></span><strong>Add image files</strong><small>Click or drop more files</small></button></div>
        </section>
        <aside className="compress-side-panel"><div><span className="auto-print-kicker">RepetiGo Image Tools</span><h2>Compress Image</h2><p>{items.length} files · {completed} compressed</p></div>
          <div className="compress-side-config"><div className="compress-level-label"><Gauge size={20} /><div><strong>Compression level</strong><small>Higher means smaller files and lower image quality.</small></div><span title="Images are optimized locally in your browser."><Info size={17} /></span></div><input type="range" min="10" max="90" step="5" value={level} disabled={compressing} onChange={(event) => updateLevel(Number(event.target.value))} aria-label="Compression level" /><output>{level}<small>%</small></output></div>
          <div className="compress-side-summary"><span><Check size={18} /></span><div><strong>{compressing ? "Compressing files…" : completed === items.length ? "All files ready" : "Preparing compression"}</strong><small>{compressing ? "Please keep this page open." : "Original and compressed sizes are shown on each card."}</small></div></div>
          <div className="compress-side-actions"><button className="compress-run" type="button" disabled={compressing || items.some((item) => item.loading)} onClick={compressAll}>{compressing ? <LoaderCircle className="spin" size={19} /> : <Archive size={19} />} {compressing ? "Compressing…" : `Compress at ${level}%`}</button><button className="compress-zip-button" type="button" disabled={!completed || zipBusy || compressing} onClick={downloadZip}>{zipBusy ? <LoaderCircle className="spin" size={19} /> : <Download size={19} />} Download ZIP</button><button className="compress-delete-all" type="button" disabled={compressing} onClick={clearAll}><Trash2 size={18} /> Delete all</button><button className="compress-start-over" type="button" disabled={compressing} onClick={clearAll}><RotateCcw size={17} /> Start over</button></div>
        </aside>
      </div>}
      {error ? <div className="profile-alert error compress-error" role="alert">{error}</div> : null}
      {previewItem?.result ? <ImagePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} /> : null}
    </div>
  </DashboardShell>;
}

function ImagePreviewModal({ item, onClose }: { item: ImageItem; onClose: () => void }) {
  if (!item.result) return null;
  return <div className="compress-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Quality preview for ${item.file.name}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="compress-preview-modal image-compress-preview"><header><div><h2>Compression quality preview</h2><p>{item.file.name} · {item.width} × {item.height}px</p></div><button type="button" onClick={onClose} aria-label="Close preview"><X size={21} /></button></header><div className="image-compress-compare"><article><div><strong>Original</strong><span>{formatBytes(item.file.size)}</span></div><img src={item.preview} alt="Original image" /></article><article><div><strong>Compressed</strong><span>{formatBytes(item.result.size)} · {savingText(item.file.size, item.result.size)}</span></div><img src={item.result.url} alt="Compressed image" /></article></div><footer><div><span>Compare original and compressed quality</span></div><a href={item.result.url} download={item.result.name}><Download size={18} /> Download compressed image</a></footer></section></div>;
}

function isSupported(file: File) { return ["image/jpeg", "image/png", "image/webp"].includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name); }
function imageDimensions(url: string) { return new Promise<{ width: number; height: number }>((resolve, reject) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = reject; image.src = url; }); }
async function compressImage(file: File, url: string, width: number, height: number, level: number) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => { const value = new Image(); value.onload = () => resolve(value); value.onerror = reject; value.src = url; });
  const probe = document.createElement("canvas"); probe.width = Math.min(width, 320); probe.height = Math.max(1, Math.round(height * probe.width / width)); const probeContext = probe.getContext("2d"); if (!probeContext) throw new Error("Canvas unavailable"); probeContext.drawImage(image, 0, 0, probe.width, probe.height);
  const pixels = probeContext.getImageData(0, 0, probe.width, probe.height).data; let transparent = false; for (let index = 3; index < pixels.length; index += 4) if (pixels[index] < 250) { transparent = true; break; }
  const mime = transparent ? "image/webp" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
  const targetBytes = Math.max(18 * 1024, Math.round(file.size * (1 - level / 100))); const qualities = [.9, .78, .66, .54, .44, .35, .27];
  let scale = 1; let smallest: { blob: Blob; width: number; height: number } | null = null;
  for (let pass = 0; pass < 7; pass += 1) {
    const outWidth = Math.max(1, Math.round(width * scale)); const outHeight = Math.max(1, Math.round(height * scale)); const canvas = document.createElement("canvas"); canvas.width = outWidth; canvas.height = outHeight;
    const context = canvas.getContext("2d", { alpha: transparent }); if (!context) throw new Error("Canvas unavailable"); if (!transparent) { context.fillStyle = "#fff"; context.fillRect(0, 0, outWidth, outHeight); } context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high"; context.drawImage(image, 0, 0, outWidth, outHeight);
    for (const quality of qualities) { const blob = await canvasBlob(canvas, mime, quality); if (!smallest || blob.size < smallest.blob.size) smallest = { blob, width: outWidth, height: outHeight }; if (blob.size <= targetBytes) return { blob, width: outWidth, height: outHeight }; }
    scale *= .88;
  }
  if (smallest && smallest.blob.size < file.size) return smallest;
  return { blob: file.slice(0, file.size, file.type), width, height };
}
function canvasBlob(canvas: HTMLCanvasElement, mime: string, quality: number) { return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Compression failed")), mime, quality)); }
function compressedName(name: string, mime: string) { const extension = mime === "image/webp" ? ".webp" : mime === "image/png" ? ".png" : ".jpg"; return `${name.replace(/\.[^.]+$/, "")}-compressed${extension}`; }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
function savingText(before: number, after: number) { const percent = Math.round((1 - after / before) * 100); return percent > 0 ? `${percent}% smaller` : "Already optimized"; }
function triggerDownload(url: string, name: string, revoke = false) { const link = document.createElement("a"); link.href = url; link.download = name; link.click(); if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000); }
