"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, FileText, LoaderCircle, RotateCcw, ShieldCheck, Trash2, Undo2, X } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../PdfToolUpload";
import { RelatedToolSuggestions, ToolPromotionRail } from "../ToolDiscovery";

type PagePreview = { index: number; image: string };
type RemoveResult = { blob: Blob; url: string; size: number };
type RemovePagesClientProps = {
  children?: ReactNode;
  uploadTitle?: string;
  uploadDescription?: string;
  uploadHeadingLevel?: "h1" | "h2";
};

export default function RemovePagesClient({
  children,
  uploadTitle = "Remove PDF pages",
  uploadDescription = "Select and permanently remove unwanted pages from your PDF document.",
  uploadHeadingLevel = children ? "h2" : "h1",
}: RemovePagesClientProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RemoveResult | null>(null);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  async function chooseFile(files: FileList) {
    const selected = files[0]; if (!selected) return;
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) return setError("Please select a PDF file.");
    clearResult(); setFile(selected); setPages([]); setRemoved(new Set()); setLoading(true); setError("");
    try { const previews = await renderPagePreviews(selected); setPages(previews); setRangeFrom(1); setRangeTo(previews.length); }
    catch (reason) { console.error(reason); setFile(null); setError("This PDF could not be opened. It may be protected or damaged."); }
    finally { setLoading(false); }
  }

  function clearResult() { if (result) URL.revokeObjectURL(result.url); setResult(null); setProgress(0); }
  function reset() { clearResult(); setFile(null); setPages([]); setRemoved(new Set()); setError(""); if (inputRef.current) inputRef.current.value = ""; }
  function setSelection(next: Set<number>) { clearResult(); if (next.size >= pages.length) { setError("At least one page must remain in the PDF."); return; } setError(""); setRemoved(next); }
  function togglePage(index: number) { const next = new Set(removed); next.has(index) ? next.delete(index) : next.add(index); setSelection(next); }
  function selectRange() { const next = new Set(removed); const from = Math.min(rangeFrom, rangeTo); const to = Math.max(rangeFrom, rangeTo); for (let page = from; page <= to; page += 1) next.add(page); setSelection(next); }
  function selectPattern(pattern: "odd" | "even") { const next = new Set<number>(); pages.forEach((page) => { if ((pattern === "odd" && page.index % 2 === 1) || (pattern === "even" && page.index % 2 === 0)) next.add(page.index); }); setSelection(next); }

  async function removePages() {
    if (!file || !removed.size || processing || removed.size >= pages.length) return;
    setProcessing(true); setProgress(5); setError(""); clearResult();
    try {
      const source = await PDFDocument.load(await file.arrayBuffer()); const kept = source.getPageIndices().filter((index) => !removed.has(index + 1));
      const output = await PDFDocument.create(); const copied = await output.copyPages(source, kept); copied.forEach((page, index) => { output.addPage(page); setProgress(Math.round(((index + 1) / copied.length) * 90)); });
      const bytes = await output.save({ useObjectStreams: true }); const blob = new Blob([bytes], { type: "application/pdf" }); setResult({ blob, url: URL.createObjectURL(blob), size: blob.size }); setProgress(100);
    } catch (reason) { console.error(reason); setError("Pages could not be removed from this PDF."); }
    finally { setProcessing(false); }
  }

  if (!file) return <DashboardShell activePath="/pdf-tools"><div className="dashboard remove-pages-page"><PdfToolUpload title={uploadTitle} description={uploadDescription} icon={Trash2} inputRef={inputRef} onFiles={(files) => void chooseFile(files)} multiple={false} buttonLabel="Select PDF file" headingLevel={uploadHeadingLevel} />{children}</div></DashboardShell>;

  return <DashboardShell activePath="/pdf-tools"><div className="dashboard remove-pages-page">
    <input ref={inputRef} hidden type="file" accept="application/pdf,.pdf" onChange={(event) => { if (event.target.files?.length) void chooseFile(event.target.files); event.target.value = ""; }} />
    <div className="remove-topline"><Link href="/pdf-tools"><ArrowLeft size={16} /> PDF Tools</Link><span><ShieldCheck size={16} /> Free · Private browser processing</span></div>
    <div className="remove-studio">
      <section className="remove-canvas"><header><div><h1>Remove pages</h1><p>{file.name} · {pages.length} pages · {formatBytes(file.size)}</p></div><button type="button" disabled={processing} onClick={() => inputRef.current?.click()}>Replace PDF</button></header>
        {loading ? <div className="remove-loading"><LoaderCircle className="spin" size={30} /> Preparing page thumbnails…</div> : result ? <RemoveSuccess file={file} result={result} kept={pages.length - removed.size} removed={removed.size} onBack={clearResult} onReset={reset} /> : <div className="remove-page-grid">{pages.map((page) => <button type="button" className={removed.has(page.index) ? "removed" : ""} key={page.index} onClick={() => togglePage(page.index)}><span className="remove-page-number">Page {page.index}</span><img src={page.image} alt={`Page ${page.index}`} />{removed.has(page.index) ? <span className="remove-page-overlay"><Trash2 size={22} /> Will be removed</span> : <span className="remove-page-keep"><Check size={14} /> Keep</span>}</button>)}</div>}
      </section>
      {!result ? <aside className="remove-side-panel">
        <div><span className="auto-print-kicker">RepetiGo PDF Tools</span><h2>Remove pages</h2><p>Click thumbnails or use selection controls.</p></div>
        <div className="remove-summary"><span><Trash2 size={18} /></span><div><strong>{removed.size} pages selected</strong><small>{pages.length - removed.size} of {pages.length} pages will remain</small></div></div>
        <div className="remove-config"><h3>Select page range</h3><div><label>From<input type="number" min="1" max={pages.length} value={rangeFrom} onChange={(event) => setRangeFrom(clamp(Number(event.target.value), 1, pages.length))} /></label><label>To<input type="number" min="1" max={pages.length} value={rangeTo} onChange={(event) => setRangeTo(clamp(Number(event.target.value), 1, pages.length))} /></label></div><button type="button" onClick={selectRange}>Mark range for removal</button></div>
        <div className="remove-quick"><h3>Quick selection</h3><div><button type="button" onClick={() => selectPattern("odd")}>Odd pages</button><button type="button" onClick={() => selectPattern("even")}>Even pages</button><button type="button" onClick={() => setSelection(new Set())}><Undo2 size={15} /> Clear</button></div></div>
        <div className="remove-side-actions">{processing ? <div><span>Creating PDF… {progress}%</span><progress value={progress} max="100" /></div> : null}<button className="remove-submit" type="button" disabled={!removed.size || processing || loading} onClick={removePages}>{processing ? <LoaderCircle className="spin" size={19} /> : <Trash2 size={19} />} {processing ? "Removing pages…" : `Remove ${removed.size || "selected"} pages`}</button><button type="button" disabled={processing} onClick={reset}><RotateCcw size={16} /> Start over</button></div>
      </aside> : <ToolPromotionRail context="remove-pages-result" />}
    </div>{error ? <div className="profile-alert error remove-error" role="alert">{error}</div> : null}{children}
  </div></DashboardShell>;
}

function RemoveSuccess({ file, result, kept, removed, onBack, onReset }: { file: File; result: RemoveResult; kept: number; removed: number; onBack: () => void; onReset: () => void }) { return <section className="remove-success"><span><Check size={30} /></span><h2>Pages removed successfully!</h2><p>{removed} pages removed · {kept} pages remain</p><div><FileText size={25} /><div><strong>{baseName(file.name)}-pages-removed.pdf</strong><small>{formatBytes(file.size)} → {formatBytes(result.size)}</small></div></div><a href={result.url} download={`${baseName(file.name)}-pages-removed.pdf`}><Download size={20} /> Download PDF</a><footer><button type="button" onClick={onBack}>Change page selection</button><button type="button" onClick={onReset}>Remove pages from another PDF</button></footer><RelatedToolSuggestions context="remove-pages-result" /></section>; }

async function renderPagePreviews(file: File) { const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString(); const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; const previews: PagePreview[] = []; for (let number = 1; number <= document.numPages; number += 1) { const page = await document.getPage(number); const base = page.getViewport({ scale: 1 }); const viewport = page.getViewport({ scale: Math.min(.75, 170 / base.width) }); const canvas = window.document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable"); await page.render({ canvas, canvasContext: context, viewport }).promise; previews.push({ index: number, image: canvas.toDataURL("image/jpeg", .82) }); } return previews; }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)); }
function baseName(name: string) { return name.replace(/\.pdf$/i, ""); }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`; }
