"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Archive, Check, Download, Eye, FileImage, Gauge, Info, LoaderCircle, Plus, RotateCcw, ShieldCheck, Trash2, X } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../../pdf-tools/PdfToolUpload";

type OutputFormat = "png" | "webp" | "gif" | "bmp" | "ico" | "pdf" | "svg";

type ImageItem = {
  id: string; file: File; preview: string; width: number; height: number; loading: boolean;
  result?: { blob: Blob; url: string; size: number; width: number; height: number; name: string };
};

const FORMAT_OPTIONS: { value: OutputFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
  { value: "gif", label: "GIF (256 colours)" },
  { value: "bmp", label: "BMP" },
  { value: "ico", label: "ICO (icon)" },
  { value: "pdf", label: "PDF" },
  { value: "svg", label: "SVG (vector trace)" },
];

const QUALITY_FORMATS: OutputFormat[] = ["webp"];
const MAX_TRACE_DIMENSION = 1000;

export default function JpgConverterClient({ children }: { children?: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultUrls = useRef(new Set<string>());
  const [items, setItems] = useState<ImageItem[]>([]);
  const [format, setFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(90);
  const [converting, setConverting] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);

  useEffect(() => () => resultUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    const invalid = selected.find((file) => !isSupported(file));
    if (invalid) return setError(`${invalid.name} is not a supported JPG image.`);
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
    if (ready.length) await convertFiles(ready, format, quality);
  }

  function discard(item: ImageItem) { if (item.result) { URL.revokeObjectURL(item.result.url); resultUrls.current.delete(item.result.url); } }
  function removeItem(id: string) { setItems((current) => { const item = current.find((entry) => entry.id === id); if (item) { discard(item); URL.revokeObjectURL(item.preview); } return current.filter((entry) => entry.id !== id); }); }
  function clearAll() { items.forEach((item) => { discard(item); URL.revokeObjectURL(item.preview); }); setItems([]); setError(""); setPreviewItem(null); if (inputRef.current) inputRef.current.value = ""; }
  function updateSettings(nextFormat: OutputFormat, nextQuality: number) {
    setFormat(nextFormat); setQuality(nextQuality);
    setItems((current) => current.map((item) => { discard(item); return { ...item, result: undefined }; }));
  }
  async function convertAll() { if (!items.length || items.some((item) => item.loading) || converting) return; await convertFiles(items, format, quality); }

  async function convertFiles(targets: ImageItem[], formatValue: OutputFormat, qualityValue: number) {
    setConverting(true); setError("");
    try {
      for (const item of targets) {
        discard(item);
        try {
          const output = await convertJpg(item.preview, item.width, item.height, formatValue, qualityValue);
          const url = URL.createObjectURL(output.blob); resultUrls.current.add(url);
          const result = { ...output, url, size: output.blob.size, name: outputName(item.file.name, formatValue) };
          setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, result } : entry)));
        } catch {
          setError(`${item.file.name} could not be converted to ${formatValue.toUpperCase()}.`);
        }
      }
    } finally { setConverting(false); }
  }

  async function downloadZip() {
    const completed = items.filter((item) => item.result); if (!completed.length || zipBusy) return; setZipBusy(true);
    try { const { default: JSZip } = await import("jszip"); const zip = new JSZip(); completed.forEach((item) => zip.file(item.result!.name, item.result!.blob)); const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } }); triggerDownload(URL.createObjectURL(blob), `repetigo-converted-${format}.zip`, true); }
    finally { setZipBusy(false); }
  }

  function drop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }
  const completed = items.filter((item) => item.result).length;
  const showQuality = QUALITY_FORMATS.includes(format);

  return <DashboardShell activePath="/image-tools">
    <div className="dashboard compress-pdf-page">
      {items.length ? <><input ref={inputRef} hidden multiple type="file" accept="image/jpeg,.jpg,.jpeg" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} /><div className="compress-heading"><div><span className="auto-print-kicker">Free Image Tool</span><h2>JPG Converter</h2><p>Convert JPG images into PNG, WebP, GIF, BMP, ICO, PDF, or SVG.</p></div><span><ShieldCheck size={16} /> Files stay in your browser</span></div></> : null}
      {!items.length ? <><PdfToolUpload title="JPG Converter" description="Convert JPG images into PNG, WebP, GIF, BMP, ICO, PDF, or SVG - one at a time or in a batch." icon={FileImage} inputRef={inputRef} onFiles={(files) => void addFiles(files)} accept="image/jpeg,.jpg,.jpeg" buttonLabel="Select JPG images" dropLabel="or drop JPG images here" headingLevel={children ? "h2" : "h1"} backHref="/image-tools" backLabel="Image Tools" />{children}</> : <div className="compress-studio">
        <section className={`compress-workspace ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
          <div className="compress-workspace-head"><div><h2>Your JPG files</h2><p>Files convert automatically after upload.</p></div><button type="button" disabled={converting} onClick={() => inputRef.current?.click()}><Plus size={18} /> Add images</button></div>
          <div className="compress-file-grid">{items.map((item) => <article className="compress-file-card" key={item.id}>
            <button className="compress-remove" type="button" disabled={converting} onClick={() => removeItem(item.id)} aria-label={`Remove ${item.file.name}`}><X size={17} /></button>
            <div className="compress-file-meta"><strong title={item.file.name}>{item.file.name}</strong><span>Original: {formatBytes(item.file.size)}</span></div>
            <div className="compress-thumbnail">{item.loading ? <LoaderCircle className="spin" size={27} /> : <img src={item.preview} alt={`Preview of ${item.file.name}`} />}</div>
            <small>{item.width ? `${item.width} × ${item.height}px` : "Reading image…"}</small>
            {item.result ? <><div className="compress-saving"><span>{format.toUpperCase()}: <strong>{formatBytes(item.result.size)}</strong></span></div><div className="compress-card-actions"><button type="button" onClick={() => setPreviewItem(item)}><Eye size={16} /> Preview</button><a href={item.result.url} download={item.result.name}><Download size={17} /> Download</a></div></> : <div className="compress-pending">{item.loading ? "Preparing preview…" : converting ? "Converting automatically…" : "Ready to convert"}</div>}
          </article>)}<button className="compress-add-card" type="button" disabled={converting} onClick={() => inputRef.current?.click()}><span><Plus size={29} /></span><strong>Add JPG files</strong><small>Click or drop more files</small></button></div>
        </section>
        <aside className="compress-side-panel"><div><span className="auto-print-kicker">RepetiGo Image Tools</span><h2>JPG Converter</h2><p>{items.length} files · {completed} converted</p></div>
          <div className="compress-side-config">
            <div className="compress-level-label"><Info size={20} /><div><strong>Output format</strong><small>Choose the file type you need JPG converted to.</small></div></div>
            <select value={format} disabled={converting} onChange={(event) => updateSettings(event.target.value as OutputFormat, quality)} aria-label="Output format">
              {FORMAT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          {showQuality ? <div className="compress-side-config"><div className="compress-level-label"><Gauge size={20} /><div><strong>{format.toUpperCase()} quality</strong><small>Higher keeps more detail; lower makes a smaller file.</small></div></div><input type="range" min="40" max="100" step="5" value={quality} disabled={converting} onChange={(event) => updateSettings(format, Number(event.target.value))} aria-label={`${format} quality`} /><output>{quality}<small>%</small></output></div> : null}
          <div className="compress-side-summary"><span><Check size={18} /></span><div><strong>{converting ? "Converting files…" : completed === items.length ? "All files ready" : "Preparing conversion"}</strong><small>{converting ? "Please keep this page open." : formatNote(format)}</small></div></div>
          <div className="compress-side-actions"><button className="compress-run" type="button" disabled={converting || items.some((item) => item.loading)} onClick={convertAll}>{converting ? <LoaderCircle className="spin" size={19} /> : <Archive size={19} />} {converting ? "Converting…" : `Convert to ${format.toUpperCase()}`}</button><button className="compress-zip-button" type="button" disabled={!completed || zipBusy || converting} onClick={downloadZip}>{zipBusy ? <LoaderCircle className="spin" size={19} /> : <Download size={19} />} Download ZIP</button><button className="compress-delete-all" type="button" disabled={converting} onClick={clearAll}><Trash2 size={18} /> Delete all</button><button className="compress-start-over" type="button" disabled={converting} onClick={clearAll}><RotateCcw size={17} /> Start over</button></div>
        </aside>
      </div>}
      {error ? <div className="profile-alert error compress-error" role="alert">{error}</div> : null}
      {items.length ? children : null}
      {previewItem?.result ? <ImagePreviewModal item={previewItem} format={format} onClose={() => setPreviewItem(null)} /> : null}
    </div>
  </DashboardShell>;
}

function ImagePreviewModal({ item, format, onClose }: { item: ImageItem; format: OutputFormat; onClose: () => void }) {
  if (!item.result) return null;
  const canPreviewOutput = format !== "pdf";
  return <div className="compress-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Preview for ${item.file.name}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="compress-preview-modal image-compress-preview"><header><div><h2>JPG Converter preview</h2><p>{item.file.name} · {item.width} × {item.height}px</p></div><button type="button" onClick={onClose} aria-label="Close preview"><X size={21} /></button></header><div className="image-compress-compare"><article><div><strong>Original JPG</strong><span>{formatBytes(item.file.size)}</span></div><img src={item.preview} alt="Original JPG" /></article><article><div><strong>Converted {format.toUpperCase()}</strong><span>{formatBytes(item.result.size)}</span></div>{canPreviewOutput ? <img className="compress-thumbnail-transparent" src={item.result.url} alt={`Converted ${format.toUpperCase()}`} /> : <div className="heic-preview-unavailable"><FileImage size={36} /><small>PDF output can't preview inline here - download it to view the file.</small></div>}</article></div><footer><div><span>Converted entirely in your browser</span></div><a href={item.result.url} download={item.result.name}><Download size={18} /> Download {format.toUpperCase()}</a></footer></section></div>;
}

function isSupported(file: File) { return file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name); }
function imageDimensions(url: string) { return new Promise<{ width: number; height: number }>((resolve, reject) => { const image = new Image(); image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight }); image.onerror = reject; image.src = url; }); }

function formatNote(format: OutputFormat) {
  if (format === "png") return "PNG is lossless, so the file is usually larger than the JPG source - use it when quality loss is not acceptable.";
  if (format === "gif") return "GIF is limited to 256 colours and 1-bit transparency - best for flat-colour graphics, not photos.";
  if (format === "ico") return "ICO output is best suited to small square icons and favicons, not full photos.";
  if (format === "pdf") return "The JPG is embedded as a single full-page image in the PDF.";
  if (format === "bmp") return "BMP is uncompressed - files are larger than JPG, PNG, or WebP.";
  if (format === "svg") return "Vector tracing works best on flat-colour logos and line art - a photo traces into a large, complex file.";
  return "At quality 80+, WebP output is visually identical to the JPG source.";
}

async function loadImageElement(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => { const value = new Image(); value.onload = () => resolve(value); value.onerror = reject; value.src = url; });
}

async function convertJpg(url: string, width: number, height: number, format: OutputFormat, quality: number) {
  if (format === "svg") {
    const scale = Math.min(1, MAX_TRACE_DIMENSION / Math.max(width, height, 1));
    const traceWidth = Math.max(1, Math.round(width * scale));
    const traceHeight = Math.max(1, Math.round(height * scale));
    const image = await loadImageElement(url);
    const canvas = document.createElement("canvas"); canvas.width = traceWidth; canvas.height = traceHeight;
    const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
    context.drawImage(image, 0, 0, traceWidth, traceHeight);
    const imageData = context.getImageData(0, 0, traceWidth, traceHeight);
    const { default: ImageTracer } = await import("imagetracerjs");
    const svgString = ImageTracer.imagedataToSVG(imageData, "default");
    return { blob: new Blob([svgString], { type: "image/svg+xml" }), width: traceWidth, height: traceHeight };
  }

  const image = await loadImageElement(url);
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
  const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  if (format === "png") { const blob = await canvasBlob(canvas, "image/png", 1); return { blob, width, height }; }
  if (format === "webp") { const blob = await canvasBlob(canvas, "image/webp", quality / 100); return { blob, width, height }; }
  if (format === "bmp") { const blob = bmpBlob(context, width, height); return { blob, width, height }; }
  if (format === "ico") { const pngBlob = await canvasBlob(canvas, "image/png", 1); const blob = icoBlob(new Uint8Array(await pngBlob.arrayBuffer()), width, height); return { blob, width, height }; }
  if (format === "pdf") { const blob = await pdfBlob(canvas, width, height); return { blob, width, height }; }
  if (format === "gif") { const blob = await gifBlob(context, width, height); return { blob, width, height }; }
  throw new Error("Unsupported format");
}

function canvasBlob(canvas: HTMLCanvasElement, mime: string, quality: number) { return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Conversion failed"))), mime, quality)); }

async function pdfBlob(canvas: HTMLCanvasElement, width: number, height: number) {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  const jpgBlob = await canvasBlob(canvas, "image/jpeg", 0.95);
  const embedded = await pdf.embedJpg(await jpgBlob.arrayBuffer());
  const page = pdf.addPage([width, height]);
  page.drawImage(embedded, { x: 0, y: 0, width, height });
  return new Blob([await pdf.save()], { type: "application/pdf" });
}

async function gifBlob(context: CanvasRenderingContext2D, width: number, height: number) {
  const { quantize, applyPalette, GIFEncoder } = await import("gifenc");
  const { data } = context.getImageData(0, 0, width, height);
  const palette = quantize(data, 256, { format: "rgb565" });
  const index = applyPalette(data, palette, "rgb565");
  const gif = GIFEncoder();
  gif.writeFrame(index, width, height, { palette });
  gif.finish();
  return new Blob([new Uint8Array(gif.bytes())], { type: "image/gif" });
}

function bmpBlob(context: CanvasRenderingContext2D, width: number, height: number) {
  const pixels = context.getImageData(0, 0, width, height).data;
  const row = Math.ceil((width * 3) / 4) * 4;
  const size = 54 + row * height;
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  view.setUint16(0, 0x424d, false);
  view.setUint32(2, size, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  let offset = 54;
  for (let y = height - 1; y >= 0; y -= 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      view.setUint8(offset, pixels[i + 2]); offset += 1;
      view.setUint8(offset, pixels[i + 1]); offset += 1;
      view.setUint8(offset, pixels[i]); offset += 1;
    }
    while ((offset - 54) % row) { view.setUint8(offset, 0); offset += 1; }
  }
  return new Blob([buffer], { type: "image/bmp" });
}

function icoBlob(png: Uint8Array, width: number, height: number) {
  const buffer = new Uint8Array(22 + png.length);
  const view = new DataView(buffer.buffer);
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  buffer[6] = width >= 256 ? 0 : width;
  buffer[7] = height >= 256 ? 0 : height;
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, png.length, true);
  view.setUint32(18, 22, true);
  buffer.set(png, 22);
  return new Blob([buffer], { type: "image/x-icon" });
}

function outputName(name: string, format: OutputFormat) { return `${name.replace(/\.[^.]+$/, "")}.${format}`; }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
function triggerDownload(url: string, name: string, revoke = false) { const link = document.createElement("a"); link.href = url; link.download = name; link.click(); if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000); }
