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

const DETAIL_PRESETS: { key: string; label: string; preset: string }[] = [
  { key: "simple", label: "Simple - Logos & Icons", preset: "posterized1" },
  { key: "balanced", label: "Balanced (Recommended)", preset: "default" },
  { key: "detailed", label: "Detailed", preset: "detailed" },
  { key: "lineart", label: "Black & White - Line Art", preset: "grayscale" },
];

const MAX_TRACE_DIMENSION = 1000;

export default function PngToSvgClient({ children }: { children?: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultUrls = useRef(new Set<string>());
  const [items, setItems] = useState<ImageItem[]>([]);
  const [detail, setDetail] = useState(DETAIL_PRESETS[1].key);
  const [converting, setConverting] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);

  useEffect(() => () => resultUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    const invalid = selected.find((file) => !isSupported(file));
    if (invalid) return setError(`${invalid.name} is not a supported PNG image.`);
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
    if (ready.length) await convertFiles(ready, detail);
  }

  function discard(item: ImageItem) { if (item.result) { URL.revokeObjectURL(item.result.url); resultUrls.current.delete(item.result.url); } }
  function removeItem(id: string) { setItems((current) => { const item = current.find((entry) => entry.id === id); if (item) { discard(item); URL.revokeObjectURL(item.preview); } return current.filter((entry) => entry.id !== id); }); }
  function clearAll() { items.forEach((item) => { discard(item); URL.revokeObjectURL(item.preview); }); setItems([]); setError(""); setPreviewItem(null); if (inputRef.current) inputRef.current.value = ""; }
  function updateDetail(value: string) { setDetail(value); setItems((current) => current.map((item) => { discard(item); return { ...item, result: undefined }; })); }
  async function convertAll() { if (!items.length || items.some((item) => item.loading) || converting) return; await convertFiles(items, detail); }

  async function convertFiles(targets: ImageItem[], detailKey: string) {
    setConverting(true); setError("");
    const preset = DETAIL_PRESETS.find((option) => option.key === detailKey)?.preset || "default";
    try {
      for (const item of targets) {
        discard(item);
        const output = await convertToSvg(item.preview, item.width, item.height, preset);
        const url = URL.createObjectURL(output.blob); resultUrls.current.add(url);
        const result = { ...output, url, size: output.blob.size, name: svgName(item.file.name) };
        setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, result } : entry)));
      }
    } catch { setError("Conversion could not be completed. Try a different image or remove the problematic file."); }
    finally { setConverting(false); }
  }

  async function downloadZip() {
    const completed = items.filter((item) => item.result); if (!completed.length || zipBusy) return; setZipBusy(true);
    try { const { default: JSZip } = await import("jszip"); const zip = new JSZip(); completed.forEach((item) => zip.file(item.result!.name, item.result!.blob)); const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }); triggerDownload(URL.createObjectURL(blob), "repetigo-converted-svgs.zip", true); }
    finally { setZipBusy(false); }
  }

  function drop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }
  const completed = items.filter((item) => item.result).length;

  return <DashboardShell activePath="/image-tools">
    <div className="dashboard compress-pdf-page">
      {items.length ? <><input ref={inputRef} hidden multiple type="file" accept="image/png,.png" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} /><div className="compress-heading"><div><span className="auto-print-kicker">Free Image Tool</span><h2>PNG to SVG</h2><p>Vectorize PNG images into scalable SVG files.</p></div><span><ShieldCheck size={16} /> Files stay in your browser</span></div></> : null}
      {!items.length ? <><PdfToolUpload title="PNG to SVG" description="Vectorize PNG logos, icons, and graphics into scalable SVG - one at a time or in a batch." icon={FileImage} inputRef={inputRef} onFiles={(files) => void addFiles(files)} accept="image/png,.png" buttonLabel="Select PNG images" dropLabel="or drop PNG images here" headingLevel={children ? "h2" : "h1"} backHref="/image-tools" backLabel="Image Tools" />{children}</> : <div className="compress-studio">
        <section className={`compress-workspace ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
          <div className="compress-workspace-head"><div><h2>Your PNG files</h2><p>Files trace to SVG automatically after upload.</p></div><button type="button" disabled={converting} onClick={() => inputRef.current?.click()}><Plus size={18} /> Add images</button></div>
          <div className="compress-file-grid">{items.map((item) => <article className="compress-file-card" key={item.id}>
            <button className="compress-remove" type="button" disabled={converting} onClick={() => removeItem(item.id)} aria-label={`Remove ${item.file.name}`}><X size={17} /></button>
            <div className="compress-file-meta"><strong title={item.file.name}>{item.file.name}</strong><span>Original: {formatBytes(item.file.size)}</span></div>
            <div className="compress-thumbnail compress-thumbnail-transparent">{item.loading ? <LoaderCircle className="spin" size={27} /> : <img src={item.result?.url || item.preview} alt={`Preview of ${item.file.name}`} />}</div>
            <small>{item.width ? `${item.width} × ${item.height}px` : "Reading image…"}</small>
            {item.result ? <><div className="compress-saving"><span>SVG: <strong>{formatBytes(item.result.size)}</strong></span><em>{sizeCompareText(item.file.size, item.result.size)}</em></div><div className="compress-card-actions"><button type="button" onClick={() => setPreviewItem(item)}><Eye size={16} /> Preview</button><a href={item.result.url} download={item.result.name}><Download size={17} /> Download</a></div></> : <div className="compress-pending">{item.loading ? "Preparing preview…" : converting ? "Tracing automatically…" : "Ready to convert"}</div>}
          </article>)}<button className="compress-add-card" type="button" disabled={converting} onClick={() => inputRef.current?.click()}><span><Plus size={29} /></span><strong>Add PNG files</strong><small>Click or drop more files</small></button></div>
        </section>
        <aside className="compress-side-panel"><div><span className="auto-print-kicker">RepetiGo Image Tools</span><h2>PNG to SVG</h2><p>{items.length} files · {completed} converted</p></div>
          <div className="compress-side-config"><div className="compress-level-label"><Info size={20} /><div><strong>Detail level</strong><small>Simple works best for logos and icons; Detailed keeps more shapes.</small></div></div><select value={detail} disabled={converting} onChange={(event) => updateDetail(event.target.value)} aria-label="Vectorization detail level">{DETAIL_PRESETS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select></div>
          <div className="compress-side-summary"><span><Check size={18} /></span><div><strong>{converting ? "Tracing files…" : completed === items.length ? "All files ready" : "Preparing conversion"}</strong><small>{converting ? "Please keep this page open." : "Best results come from flat-colour logos, icons, and line art - not photos."}</small></div></div>
          <div className="compress-side-actions"><button className="compress-run" type="button" disabled={converting || items.some((item) => item.loading)} onClick={convertAll}>{converting ? <LoaderCircle className="spin" size={19} /> : <Archive size={19} />} {converting ? "Converting…" : "Convert to SVG"}</button><button className="compress-zip-button" type="button" disabled={!completed || zipBusy || converting} onClick={downloadZip}>{zipBusy ? <LoaderCircle className="spin" size={19} /> : <Download size={19} />} Download ZIP</button><button className="compress-delete-all" type="button" disabled={converting} onClick={clearAll}><Trash2 size={18} /> Delete all</button><button className="compress-start-over" type="button" disabled={converting} onClick={clearAll}><RotateCcw size={17} /> Start over</button></div>
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
  return <div className="compress-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Preview for ${item.file.name}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="compress-preview-modal image-compress-preview"><header><div><h2>PNG to SVG preview</h2><p>{item.file.name} · {item.width} × {item.height}px</p></div><button type="button" onClick={onClose} aria-label="Close preview"><X size={21} /></button></header><div className="image-compress-compare"><article><div><strong>Original PNG</strong><span>{formatBytes(item.file.size)}</span></div><img className="compress-thumbnail-transparent" src={item.preview} alt="Original image" /></article><article><div><strong>Traced SVG</strong><span>{formatBytes(item.result.size)} · {sizeCompareText(item.file.size, item.result.size)}</span></div><img className="compress-thumbnail-transparent" src={item.result.url} alt="Traced SVG" /></article></div><footer><div><span>SVG scales to any size without pixelating</span></div><a href={item.result.url} download={item.result.name}><Download size={18} /> Download SVG</a></footer></section></div>;
}

function isSupported(file: File) { return file.type === "image/png" || /\.png$/i.test(file.name); }
function imageDimensions(url: string) { return new Promise<{ width: number; height: number }>((resolve, reject) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = reject; image.src = url; }); }

async function convertToSvg(url: string, width: number, height: number, preset: string) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => { const value = new Image(); value.onload = () => resolve(value); value.onerror = reject; value.src = url; });
  const scale = Math.min(1, MAX_TRACE_DIMENSION / Math.max(width, height, 1));
  const traceWidth = Math.max(1, Math.round(width * scale));
  const traceHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas"); canvas.width = traceWidth; canvas.height = traceHeight;
  const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
  context.drawImage(image, 0, 0, traceWidth, traceHeight);
  const imageData = context.getImageData(0, 0, traceWidth, traceHeight);
  const { default: ImageTracer } = await import("imagetracerjs");
  const svgString = ImageTracer.imagedataToSVG(imageData, preset);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  return { blob, width: traceWidth, height: traceHeight };
}

function svgName(name: string) { return `${name.replace(/\.[^.]+$/, "")}.svg`; }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
function sizeCompareText(before: number, after: number) {
  const percent = Math.round((1 - after / before) * 100);
  if (percent > 5) return `${percent}% smaller`;
  if (percent < -5) return `${Math.abs(percent)}% larger`;
  return "Similar size";
}
function triggerDownload(url: string, name: string, revoke = false) { const link = document.createElement("a"); link.href = url; link.download = name; link.click(); if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000); }
