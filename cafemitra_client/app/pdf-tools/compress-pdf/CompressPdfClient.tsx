"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Archive, Check, Download, Eye, FilePlus2, Gauge, Info, LoaderCircle, Plus, RotateCcw, ShieldCheck, Trash2, X } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../PdfToolUpload";

type CompressItem = {
  id: string;
  file: File;
  thumbnail: string;
  pages: number;
  loading: boolean;
  progress: number;
  result?: { blob: Blob; url: string; size: number };
};

type QualityPreview = { itemId: string; pages: number; original: string[]; compressed: string[]; loading: boolean };

export default function CompressPdfClient({ children }: { children?: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultUrls = useRef(new Set<string>());
  const [items, setItems] = useState<CompressItem[]>([]);
  const [level, setLevel] = useState(60);
  const [dragging, setDragging] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<QualityPreview | null>(null);

  useEffect(() => () => resultUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    const invalid = selected.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));
    if (invalid) return setError(`${invalid.name} is not a PDF file.`);
    setError("");
    const additions: CompressItem[] = selected.map((file) => ({ id: crypto.randomUUID(), file, thumbnail: "", pages: 0, loading: true, progress: 0 }));
    setItems((current) => [...current, ...additions]);
    const readyItems = (await Promise.all(additions.map(async (item) => {
      try {
        const details = await readPdfPreview(item.file);
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, ...details, loading: false } : entry));
        return { ...item, ...details, loading: false };
      } catch (reason) {
        console.error(reason);
        setItems((current) => current.filter((entry) => entry.id !== item.id));
        setError(`${item.file.name} could not be opened. It may be protected or damaged.`);
        return null;
      }
    }))).filter((item): item is CompressItem => item !== null);
    if (readyItems.length) await compressFiles(readyItems, 60);
  }

  function discardResult(item: CompressItem) { if (item.result) { URL.revokeObjectURL(item.result.url); resultUrls.current.delete(item.result.url); } }
  function removeItem(id: string) { setItems((current) => { const removed = current.find((item) => item.id === id); if (removed) discardResult(removed); return current.filter((item) => item.id !== id); }); }
  function clearAll() { items.forEach(discardResult); setItems([]); setError(""); if (inputRef.current) inputRef.current.value = ""; }
  function updateLevel(value: number) { setLevel(value); setItems((current) => current.map((item) => { discardResult(item); return { ...item, result: undefined, progress: 0 }; })); }

  async function compressAll() {
    if (!items.length || items.some((item) => item.loading) || compressing) return;
    await compressFiles(items, level);
  }

  async function compressFiles(targets: CompressItem[], compressionLevel: number) {
    setCompressing(true); setError("");
    try {
      for (const item of targets) {
        discardResult(item);
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress: 1 } : entry));
        const blob = await compressPdf(item.file, compressionLevel, (progress) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress } : entry)));
        const result = { blob, url: URL.createObjectURL(blob), size: blob.size }; resultUrls.current.add(result.url);
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, result, progress: 100 } : entry));
      }
    } catch (reason) {
      console.error(reason); setError("Compression could not be completed. Try a lower compression level or remove the problematic PDF.");
    } finally { setCompressing(false); }
  }

  async function downloadZip() {
    const completed = items.filter((item) => item.result);
    if (!completed.length || zipBusy) return;
    setZipBusy(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      completed.forEach((item) => zip.file(compressedName(item.file.name), item.result!.blob));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      triggerDownload(URL.createObjectURL(blob), "repetigo-compressed-pdfs.zip", true);
    } finally { setZipBusy(false); }
  }

  async function openQualityPreview(item: CompressItem) {
    if (!item.result) return;
    setPreview({ itemId: item.id, pages: item.pages, original: [], compressed: [], loading: true });
    try {
      const [original, compressed] = await Promise.all([renderAllPdfPages(item.file), renderAllPdfPages(item.result.blob)]);
      setPreview((current) => current?.itemId === item.id ? { ...current, original, compressed, loading: false } : current);
    } catch (reason) {
      console.error(reason); setPreview(null); setError("Quality preview could not be generated for this page.");
    }
  }

  function drop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }
  const completed = items.filter((item) => item.result).length;

  return <DashboardShell activePath="/pdf-tools">
    <div className="dashboard compress-pdf-page">
      {items.length ? <><input ref={inputRef} hidden multiple type="file" accept="application/pdf,.pdf" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} /><div className="compress-heading"><div><span className="auto-print-kicker">Free PDF Tool</span><h2>Compress PDF</h2><p>Reduce PDF file size while balancing document quality.</p></div><span><ShieldCheck size={16} /> Files stay in your browser</span></div></> : null}

      {!items.length ? <><PdfToolUpload title="Compress PDF" description="Reduce PDF file size while balancing document quality." icon={Archive} inputRef={inputRef} onFiles={(files) => void addFiles(files)} headingLevel={children ? "h2" : "h1"} />{children}</> : <div className="compress-studio">
        <section className={`compress-workspace ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
          <div className="compress-workspace-head"><div><h2>Your PDF files</h2><p>Files are automatically compressed at 60% after upload.</p></div><button type="button" disabled={compressing} onClick={() => inputRef.current?.click()}><Plus size={18} /> Add PDFs</button></div>
          <div className="compress-file-grid">{items.map((item) => <article className="compress-file-card" key={item.id}>
            <button className="compress-remove" type="button" disabled={compressing} onClick={() => removeItem(item.id)} aria-label={`Remove ${item.file.name}`}><X size={17} /></button>
            <div className="compress-file-meta"><strong title={item.file.name}>{item.file.name}</strong><span>Original: {formatBytes(item.file.size)}</span></div>
            <div className="compress-thumbnail">{item.loading ? <LoaderCircle className="spin" size={27} /> : <img src={item.thumbnail} alt={`Preview of ${item.file.name}`} />}{item.progress > 0 && item.progress < 100 ? <div><LoaderCircle className="spin" size={21} /><strong>{item.progress}%</strong></div> : null}</div>
            <small>{item.pages ? `${item.pages} ${item.pages === 1 ? "page" : "pages"}` : "Reading PDF…"}</small>
            {item.result ? <><div className="compress-saving"><span>Compressed: <strong>{formatBytes(item.result.size)}</strong></span><em>{savingText(item.file.size, item.result.size)}</em></div><div className="compress-card-actions"><button type="button" onClick={() => void openQualityPreview(item)}><Eye size={16} /> Preview</button><a href={item.result.url} download={compressedName(item.file.name)}><Download size={17} /> Download</a></div></> : <div className="compress-pending">{item.loading ? "Preparing preview…" : item.progress ? "Compressing automatically…" : "Starting compression…"}</div>}
          </article>)}
            <button className="compress-add-card" type="button" disabled={compressing} onClick={() => inputRef.current?.click()}><span><Plus size={29} /></span><strong>Add PDF files</strong><small>Click or drop more files</small></button>
          </div>
        </section>
        <aside className="compress-side-panel">
          <div><span className="auto-print-kicker">RepetiGo PDF Tools</span><h2>Compress PDF</h2><p>{items.length} files · {completed} compressed</p></div>
          <div className="compress-side-config"><div className="compress-level-label"><Gauge size={20} /><div><strong>Compression level</strong><small>Higher means smaller files and lower image quality.</small></div><span title="PDF pages are optimized locally in your browser."><Info size={17} /></span></div><input type="range" min="10" max="90" step="5" value={level} disabled={compressing} onChange={(event) => updateLevel(Number(event.target.value))} aria-label="Compression level" /><output>{level}<small>%</small></output></div>
          <div className="compress-side-summary"><span><Check size={18} /></span><div><strong>{compressing ? "Compressing files…" : completed === items.length ? "All files ready" : "Preparing compression"}</strong><small>{compressing ? "Please keep this page open." : "Original and compressed sizes are shown on each card."}</small></div></div>
          <div className="compress-side-actions"><button className="compress-run" type="button" disabled={compressing || items.some((item) => item.loading)} onClick={compressAll}>{compressing ? <LoaderCircle className="spin" size={19} /> : <Archive size={19} />} {compressing ? "Compressing…" : `Compress at ${level}%`}</button><button className="compress-zip-button" type="button" disabled={!completed || zipBusy || compressing} onClick={downloadZip}>{zipBusy ? <LoaderCircle className="spin" size={19} /> : <Download size={19} />} Download ZIP</button><button className="compress-delete-all" type="button" disabled={compressing} onClick={clearAll}><Trash2 size={18} /> Delete all</button><button className="compress-start-over" type="button" disabled={compressing} onClick={clearAll}><RotateCcw size={17} /> Start over</button></div>
        </aside>
      </div>}
      {error ? <div className="profile-alert error compress-error" role="alert">{error}</div> : null}
      {items.length ? children : null}
      {preview ? <QualityPreviewModal preview={preview} item={items.find((item) => item.id === preview.itemId)} onClose={() => setPreview(null)} /> : null}
    </div>
  </DashboardShell>;
}

function QualityPreviewModal({ preview, item, onClose }: { preview: QualityPreview; item?: CompressItem; onClose: () => void }) {
  const originalRef = useRef<HTMLDivElement>(null);
  const compressedRef = useRef<HTMLDivElement>(null);
  const syncingScroll = useRef(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  useEffect(() => { setScrollPosition(0); if (originalRef.current) originalRef.current.scrollTop = 0; if (compressedRef.current) compressedRef.current.scrollTop = 0; }, [preview.itemId]);
  if (!item?.result) return null;

  function setBothScroll(percent: number) {
    const normalized = Math.max(0, Math.min(100, percent)); setScrollPosition(normalized); syncingScroll.current = true;
    for (const pane of [originalRef.current, compressedRef.current]) if (pane) pane.scrollTop = (pane.scrollHeight - pane.clientHeight) * (normalized / 100);
    requestAnimationFrame(() => { syncingScroll.current = false; });
  }

  function syncFrom(source: HTMLDivElement, target: HTMLDivElement | null) {
    if (syncingScroll.current) return;
    const available = source.scrollHeight - source.clientHeight; const percent = available > 0 ? (source.scrollTop / available) * 100 : 0;
    setScrollPosition(percent); if (!target) return; syncingScroll.current = true;
    target.scrollTop = (target.scrollHeight - target.clientHeight) * (percent / 100);
    requestAnimationFrame(() => { syncingScroll.current = false; });
  }

  return <div className="compress-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Quality preview for ${item.file.name}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="compress-preview-modal">
      <header><div><h2>Compression quality preview</h2><p>{item.file.name} · All {preview.pages} pages · Scroll from first to last page</p></div><button type="button" onClick={onClose} aria-label="Close quality preview"><X size={21} /></button></header>
      <div className="compress-compare-grid">
        <article><div><strong>Original</strong><span>{formatBytes(item.file.size)}</span></div><div ref={originalRef} className="compress-compare-page" onScroll={(event) => syncFrom(event.currentTarget, compressedRef.current)}>{preview.loading ? <LoaderCircle className="spin" size={28} /> : <div className="compress-preview-document">{preview.original.map((image, index) => <figure key={index}><figcaption>Page {index + 1}</figcaption><img src={image} alt={`Original page ${index + 1}`} /></figure>)}</div>}</div></article>
        <div className="compress-sync-scroll"><span>Synced</span><input aria-label="Scroll both PDF previews" type="range" min="0" max="100" step="0.5" value={scrollPosition} disabled={preview.loading} onChange={(event) => setBothScroll(Number(event.target.value))} /><output>{Math.round(scrollPosition)}%</output></div>
        <article><div><strong>Compressed</strong><span>{formatBytes(item.result.size)} · {savingText(item.file.size, item.result.size)}</span></div><div ref={compressedRef} className="compress-compare-page" onScroll={(event) => syncFrom(event.currentTarget, originalRef.current)}>{preview.loading ? <LoaderCircle className="spin" size={28} /> : <div className="compress-preview-document">{preview.compressed.map((image, index) => <figure key={index}><figcaption>Page {index + 1}</figcaption><img src={image} alt={`Compressed page ${index + 1}`} /></figure>)}</div>}</div></article>
      </div>
      <footer><div><span>{preview.loading ? "Preparing all pages…" : `${preview.pages} pages ready for synchronized comparison`}</span></div><a href={item.result.url} download={compressedName(item.file.name)}><Download size={18} /> Download compressed PDF</a></footer>
    </section>
  </div>;
}

async function loadPdf(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
}

async function readPdfPreview(file: File) {
  const document = await loadPdf(file); const page = await document.getPage(1); const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(1, 210 / base.width) }); const canvas = window.document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
  await page.render({ canvas, canvasContext: context, viewport }).promise;
  return { thumbnail: canvas.toDataURL("image/jpeg", .82), pages: document.numPages };
}

async function renderAllPdfPages(source: Blob) {
  const document = await loadPdf(new File([source], "preview.pdf", { type: "application/pdf" }));
  const images: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber); const base = page.getViewport({ scale: 1 }); const viewport = page.getViewport({ scale: Math.min(1.35, 680 / base.width) });
    const canvas = window.document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable");
    await page.render({ canvas, canvasContext: context, viewport, background: "white" }).promise; images.push(canvas.toDataURL("image/jpeg", .88)); await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return images;
}

async function compressPdf(file: File, level: number, onProgress: (progress: number) => void) {
  const { PDFDocument } = await import("pdf-lib");
  const source = await loadPdf(file); const output = await PDFDocument.create();
  const quality = Math.max(.34, .92 - level * .0065); const targetDpi = Math.max(78, 180 - level * 1.05);
  for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
    const page = await source.getPage(pageNumber); const base = page.getViewport({ scale: 1 }); const scale = targetDpi / 72; const viewport = page.getViewport({ scale });
    const canvas = window.document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d", { alpha: false }); if (!context) throw new Error("Canvas unavailable"); context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, canvasContext: context, viewport, background: "white" }).promise;
    const image = await output.embedJpg(canvas.toDataURL("image/jpeg", quality)); const outPage = output.addPage([base.width, base.height]); outPage.drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });
    onProgress(Math.round((pageNumber / source.numPages) * 95)); await new Promise((resolve) => setTimeout(resolve, 0));
  }
  const rasterBytes = await output.save({ useObjectStreams: true });
  const originalBytes = new Uint8Array(await file.arrayBuffer());
  const structuralDocument = await PDFDocument.load(originalBytes);
  const structuralBytes = await structuralDocument.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
  const smallest = [rasterBytes, structuralBytes, originalBytes].reduce((best, candidate) => candidate.byteLength < best.byteLength ? candidate : best);
  onProgress(100); return new Blob([smallest], { type: "application/pdf" });
}

function compressedName(name: string) { return `${name.replace(/\.pdf$/i, "")}-compressed.pdf`; }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
function savingText(before: number, after: number) { const percent = Math.round((1 - after / before) * 100); return percent > 0 ? `${percent}% smaller` : "Quality optimized"; }
function triggerDownload(url: string, name: string, revoke = false) { const link = document.createElement("a"); link.href = url; link.download = name; link.click(); if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000); }
