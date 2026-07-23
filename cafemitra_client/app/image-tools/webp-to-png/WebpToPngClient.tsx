"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Archive, Check, Download, Eye, FileImage, Info, LoaderCircle, Plus, RotateCcw, ShieldCheck, Trash2, X } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../../pdf-tools/PdfToolUpload";

type ImageItem = {
  id: string; file: File; preview: string; width: number; height: number; loading: boolean;
  result?: { blob: Blob; url: string; size: number; width: number; height: number; name: string };
};

export default function WebpToPngClient({ children }: { children?: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultUrls = useRef(new Set<string>());
  const [items, setItems] = useState<ImageItem[]>([]);
  const [converting, setConverting] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);

  useEffect(() => () => resultUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    const invalid = selected.find((file) => !isSupported(file));
    if (invalid) return setError(`${invalid.name} is not a supported WebP image.`);
    setError("");
    const additions: ImageItem[] = selected.map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), width: 0, height: 0, loading: true }));
    setItems((current) => [...current, ...additions]);
    const ready = (await Promise.all(additions.map(async (item) => {
      try {
        const dimensions = await imageDimensions(item.preview);
        const complete = { ...item, ...dimensions, loading: false };
        setItems((current) => current.map((entry) => (entry.id === item.id ? complete : entry)));
        return complete;
      } catch {
        URL.revokeObjectURL(item.preview);
        setItems((current) => current.filter((entry) => entry.id !== item.id));
        setError(`${item.file.name} could not be opened.`);
        return null;
      }
    }))).filter((item): item is ImageItem => item !== null);
    if (ready.length) await convertFiles(ready);
  }

  function discard(item: ImageItem) { if (item.result) { URL.revokeObjectURL(item.result.url); resultUrls.current.delete(item.result.url); } }
  function removeItem(id: string) { setItems((current) => { const item = current.find((entry) => entry.id === id); if (item) { discard(item); URL.revokeObjectURL(item.preview); } return current.filter((entry) => entry.id !== id); }); }
  function clearAll() { items.forEach((item) => { discard(item); URL.revokeObjectURL(item.preview); }); setItems([]); setError(""); setPreviewItem(null); if (inputRef.current) inputRef.current.value = ""; }
  async function convertAll() { if (!items.length || items.some((item) => item.loading) || converting) return; await convertFiles(items); }

  async function convertFiles(targets: ImageItem[]) {
    setConverting(true); setError("");
    try {
      for (const item of targets) {
        discard(item);
        const output = await convertToPng(item.preview, item.width, item.height);
        const url = URL.createObjectURL(output.blob); resultUrls.current.add(url);
        const result = { ...output, url, size: output.blob.size, name: pngName(item.file.name) };
        setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, result } : entry)));
      }
    } catch { setError("Conversion could not be completed. Try a different image or remove the problematic file."); }
    finally { setConverting(false); }
  }

  async function downloadZip() {
    const completed = items.filter((item) => item.result); if (!completed.length || zipBusy) return; setZipBusy(true);
    try { const { default: JSZip } = await import("jszip"); const zip = new JSZip(); completed.forEach((item) => zip.file(item.result!.name, item.result!.blob)); const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }); triggerDownload(URL.createObjectURL(blob), "repetigo-converted-pngs.zip", true); }
    finally { setZipBusy(false); }
  }

  function drop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }
  const completed = items.filter((item) => item.result).length;

  return <DashboardShell activePath="/image-tools">
    <div className="dashboard compress-pdf-page">
      {items.length ? <><input ref={inputRef} hidden multiple type="file" accept="image/webp,.webp" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} /><div className="compress-heading"><div><span className="auto-print-kicker">Free Image Tool</span><h2>WebP to PNG</h2><p>Convert WebP images into transparent PNG files.</p></div><span><ShieldCheck size={16} /> Files stay in your browser</span></div></> : null}
      {!items.length ? <><PdfToolUpload title="WebP to PNG" description="Convert WebP images into PNG - transparency preserved, one at a time or in a batch." icon={FileImage} inputRef={inputRef} onFiles={(files) => void addFiles(files)} accept="image/webp,.webp" buttonLabel="Select WebP images" dropLabel="or drop WebP images here" headingLevel={children ? "h2" : "h1"} backHref="/image-tools" backLabel="Image Tools" />{children}</> : <div className="compress-studio">
        <section className={`compress-workspace ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
          <div className="compress-workspace-head"><div><h2>Your WebP files</h2><p>Files convert to PNG automatically after upload.</p></div><button type="button" disabled={converting} onClick={() => inputRef.current?.click()}><Plus size={18} /> Add images</button></div>
          <div className="compress-file-grid">{items.map((item) => <article className="compress-file-card" key={item.id}>
            <button className="compress-remove" type="button" disabled={converting} onClick={() => removeItem(item.id)} aria-label={`Remove ${item.file.name}`}><X size={17} /></button>
            <div className="compress-file-meta"><strong title={item.file.name}>{item.file.name}</strong><span>Original: {formatBytes(item.file.size)}</span></div>
            <div className="compress-thumbnail compress-thumbnail-transparent">{item.loading ? <LoaderCircle className="spin" size={27} /> : <img src={item.preview} alt={`Preview of ${item.file.name}`} />}</div>
            <small>{item.width ? `${item.width} × ${item.height}px` : "Reading image…"}</small>
            {item.result ? <><div className="compress-saving"><span>PNG: <strong>{formatBytes(item.result.size)}</strong></span></div><div className="compress-card-actions"><button type="button" onClick={() => setPreviewItem(item)}><Eye size={16} /> Preview</button><a href={item.result.url} download={item.result.name}><Download size={17} /> Download</a></div></> : <div className="compress-pending">{item.loading ? "Preparing preview…" : converting ? "Converting automatically…" : "Ready to convert"}</div>}
          </article>)}<button className="compress-add-card" type="button" disabled={converting} onClick={() => inputRef.current?.click()}><span><Plus size={29} /></span><strong>Add WebP files</strong><small>Click or drop more files</small></button></div>
        </section>
        <aside className="compress-side-panel"><div><span className="auto-print-kicker">RepetiGo Image Tools</span><h2>WebP to PNG</h2><p>{items.length} files · {completed} converted</p></div>
          <div className="compress-side-summary"><span><Info size={18} /></span><div><strong>Lossless PNG output</strong><small>PNG never loses quality - transparent areas are preserved exactly as in the source WebP.</small></div></div>
          <div className="compress-side-summary"><span><Check size={18} /></span><div><strong>{converting ? "Converting files…" : completed === items.length ? "All files ready" : "Preparing conversion"}</strong><small>{converting ? "Please keep this page open." : "Transparency is preserved automatically - nothing to configure."}</small></div></div>
          <div className="compress-side-actions"><button className="compress-run" type="button" disabled={converting || items.some((item) => item.loading)} onClick={convertAll}>{converting ? <LoaderCircle className="spin" size={19} /> : <Archive size={19} />} {converting ? "Converting…" : "Convert to PNG"}</button><button className="compress-zip-button" type="button" disabled={!completed || zipBusy || converting} onClick={downloadZip}>{zipBusy ? <LoaderCircle className="spin" size={19} /> : <Download size={19} />} Download ZIP</button><button className="compress-delete-all" type="button" disabled={converting} onClick={clearAll}><Trash2 size={18} /> Delete all</button><button className="compress-start-over" type="button" disabled={converting} onClick={clearAll}><RotateCcw size={17} /> Start over</button></div>
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
  return <div className="compress-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Preview for ${item.file.name}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="compress-preview-modal image-compress-preview"><header><div><h2>WebP to PNG preview</h2><p>{item.file.name} · {item.width} × {item.height}px</p></div><button type="button" onClick={onClose} aria-label="Close preview"><X size={21} /></button></header><div className="image-compress-compare"><article><div><strong>Original WebP</strong><span>{formatBytes(item.file.size)}</span></div><img className="compress-thumbnail-transparent" src={item.preview} alt="Original image" /></article><article><div><strong>Converted PNG</strong><span>{formatBytes(item.result.size)}</span></div><img className="compress-thumbnail-transparent" src={item.result.url} alt="Converted PNG" /></article></div><footer><div><span>Transparent areas are preserved exactly</span></div><a href={item.result.url} download={item.result.name}><Download size={18} /> Download PNG</a></footer></section></div>;
}

function isSupported(file: File) { return file.type === "image/webp" || /\.webp$/i.test(file.name); }
function imageDimensions(url: string) { return new Promise<{ width: number; height: number }>((resolve, reject) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = reject; image.src = url; }); }
async function convertToPng(url: string, width: number, height: number) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => { const value = new Image(); value.onload = () => resolve(value); value.onerror = reject; value.src = url; });
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const blob = await canvasBlob(canvas, "image/png");
  return { blob, width, height };
}
function canvasBlob(canvas: HTMLCanvasElement, mime: string) { return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Conversion failed"))), mime)); }
function pngName(name: string) { return `${name.replace(/\.[^.]+$/, "")}.png`; }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
function triggerDownload(url: string, name: string, revoke = false) { const link = document.createElement("a"); link.href = url; link.download = name; link.click(); if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000); }
