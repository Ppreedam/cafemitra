"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Download, FileArchive, FileText, Grid2X2, Layers3, LoaderCircle, Plus, RotateCcw, Scissors, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../PdfToolUpload";

type PagePreview = { index: number; image: string };
type PageRange = { id: string; from: number; to: number };
type SplitResult = { name: string; blob: Blob; url: string; pages: number };
type SplitMode = "range" | "pages" | "size";
type RangeMode = "custom" | "fixed" | "smart";

type SplitPdfToolProps = { initialMode?: SplitMode; toolTitle?: string; uploadTitle?: string; uploadDescription?: string };

export function SplitPdfTool({ initialMode = "range", toolTitle = "Split PDF", uploadTitle = "Split PDF", uploadDescription = "Separate pages, page ranges or file-size groups into independent PDF documents." }: SplitPdfToolProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const urls = useRef(new Set<string>());
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<SplitMode>(initialMode);
  const [rangeMode, setRangeMode] = useState<RangeMode>("custom");
  const [ranges, setRanges] = useState<PageRange[]>([]);
  const [fixedPages, setFixedPages] = useState(2);
  const [smartParts, setSmartParts] = useState(2);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [maxSizeMb, setMaxSizeMb] = useState(1);
  const [sizeUnit, setSizeUnit] = useState<"KB" | "MB">("MB");
  const [mergeRanges, setMergeRanges] = useState(false);
  const [results, setResults] = useState<SplitResult[]>([]);

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function chooseFile(files: FileList) {
    const selected = files[0]; if (!selected) return;
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) return setError("Please select a PDF file.");
    resetResults(); setLoading(true); setError(""); setFile(selected);
    try {
      const previews = await renderPagePreviews(selected);
      setPages(previews); setRanges([{ id: crypto.randomUUID(), from: 1, to: previews.length }]); setSelectedPages(new Set(previews.map((page) => page.index)));
    } catch (reason) { console.error(reason); setFile(null); setError("This PDF could not be opened. It may be protected or damaged."); }
    finally { setLoading(false); }
  }

  function resetResults() { results.forEach((result) => { URL.revokeObjectURL(result.url); urls.current.delete(result.url); }); setResults([]); setProgress(0); }
  function reset() { resetResults(); setFile(null); setPages([]); setRanges([]); setSelectedPages(new Set()); setError(""); if (inputRef.current) inputRef.current.value = ""; }
  function addRange() { setRanges((current) => [...current, { id: crypto.randomUUID(), from: 1, to: pages.length }]); resetResults(); }
  function updateRange(id: string, key: "from" | "to", value: number) { setRanges((current) => current.map((range) => range.id === id ? { ...range, [key]: clamp(value, 1, pages.length) } : range)); resetResults(); }
  function togglePage(index: number) { setSelectedPages((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; }); resetResults(); }

  async function splitPdf() {
    if (!file || processing) return; setProcessing(true); setProgress(2); setError(""); resetResults();
    try {
      const source = await PDFDocument.load(await file.arrayBuffer()); const groups = getGroups(source.getPageCount());
      if (!groups.length || groups.some((group) => !group.length)) throw new Error("Select at least one valid page or range.");
      const outputGroups = mode === "range" && mergeRanges ? [Array.from(new Set(groups.flat()))] : groups;
      const nextResults: SplitResult[] = [];
      for (let index = 0; index < outputGroups.length; index += 1) {
        const group = outputGroups[index]; const output = await PDFDocument.create(); const copied = await output.copyPages(source, group); copied.forEach((page) => output.addPage(page));
        const bytes = await output.save({ useObjectStreams: true }); const blob = new Blob([bytes], { type: "application/pdf" }); const url = URL.createObjectURL(blob); urls.current.add(url);
        nextResults.push({ name: `${baseName(file.name)}-${toolTitle === "Extract pages" ? "extracted" : mode}-${index + 1}.pdf`, blob, url, pages: group.length }); setProgress(Math.round(((index + 1) / outputGroups.length) * 100));
      }
      setResults(nextResults);
    } catch (reason) { console.error(reason); setError(reason instanceof Error ? reason.message : "PDF could not be split."); }
    finally { setProcessing(false); }
  }

  function getGroups(pageCount: number): number[][] {
    if (mode === "pages") return Array.from(selectedPages).sort((a, b) => a - b).map((page) => [page]);
    if (mode === "size") { const targetBytes = maxSizeMb * (sizeUnit === "MB" ? 1024 * 1024 : 1024); const approximatePages = Math.max(1, Math.floor(targetBytes / Math.max(1, (file?.size || 1) / pageCount))); return chunk(pageCount, approximatePages); }
    if (rangeMode === "fixed") return chunk(pageCount, clamp(fixedPages, 1, pageCount));
    if (rangeMode === "smart") { const parts = clamp(smartParts, 2, pageCount); const perPart = Math.ceil(pageCount / parts); return chunk(pageCount, perPart); }
    return ranges.map((range) => pageIndices(Math.min(range.from, range.to), Math.max(range.from, range.to)));
  }

  async function downloadZip() {
    const zip = new JSZip(); results.forEach((result) => zip.file(result.name, result.blob)); const blob = await zip.generateAsync({ type: "blob" }); const url = URL.createObjectURL(blob); triggerDownload(url, `${baseName(file?.name || "split")}-split.zip`); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!file) return <DashboardShell activePath="/pdf-tools"><div className="dashboard split-pdf-page"><PdfToolUpload title={uploadTitle} description={uploadDescription} icon={Scissors} inputRef={inputRef} onFiles={(files) => void chooseFile(files)} multiple={false} buttonLabel="Select PDF file" /></div></DashboardShell>;

  return <DashboardShell activePath="/pdf-tools"><div className="dashboard split-pdf-page">
    <input ref={inputRef} hidden type="file" accept="application/pdf,.pdf" onChange={(event) => { if (event.target.files?.length) void chooseFile(event.target.files); event.target.value = ""; }} />
    <div className="split-topline"><span><ShieldCheck size={16} /> Free · No premium limits · Browser processing</span><button type="button" disabled={processing} onClick={reset}><RotateCcw size={16} /> Start over</button></div>
    <div className="split-studio">
      <section className="split-canvas"><header><div><h1>{toolTitle}</h1><p>{file.name} · {pages.length} pages · {formatBytes(file.size)}</p></div><button type="button" disabled={processing} onClick={() => inputRef.current?.click()}>Replace PDF</button></header>
        {loading ? <div className="split-loading"><LoaderCircle className="spin" size={30} /> Preparing all pages…</div> : results.length ? <SplitResults results={results} onZip={() => void downloadZip()} onBack={resetResults} actionName={toolTitle} /> : <SplitPageCanvas mode={mode} rangeMode={rangeMode} pages={pages} ranges={ranges} selectedPages={selectedPages} fixedPages={fixedPages} smartParts={smartParts} maxSizeMb={maxSizeMb} sizeUnit={sizeUnit} onTogglePage={togglePage} />}
      </section>
      <aside className="split-side-panel">
        <div className="split-mode-tabs"><button className={mode === "range" ? "active" : ""} type="button" onClick={() => { setMode("range"); resetResults(); }}><Layers3 size={20} /><span>Range</span></button><button className={mode === "pages" ? "active" : ""} type="button" onClick={() => { setMode("pages"); resetResults(); }}><Grid2X2 size={20} /><span>Pages</span></button><button className={mode === "size" ? "active" : ""} type="button" onClick={() => { setMode("size"); resetResults(); }}><FileArchive size={20} /><span>Size</span></button></div>
        <div className="split-config-scroll">
          {mode === "range" ? <><h2>Range mode</h2><div className="split-range-modes"><button className={rangeMode === "custom" ? "active" : ""} onClick={() => setRangeMode("custom")} type="button">Custom</button><button className={rangeMode === "fixed" ? "active" : ""} onClick={() => setRangeMode("fixed")} type="button">Fixed</button><button className={rangeMode === "smart" ? "active" : ""} onClick={() => setRangeMode("smart")} type="button"><Sparkles size={14} /> Smart</button></div>
            {rangeMode === "custom" ? <div className="split-ranges">{ranges.map((range, index) => <div key={range.id}><header><strong>Range {index + 1}</strong>{ranges.length > 1 ? <button type="button" onClick={() => setRanges((current) => current.filter((entry) => entry.id !== range.id))}><X size={15} /></button> : null}</header><label>From page<input type="number" min="1" max={pages.length} value={range.from} onChange={(event) => updateRange(range.id, "from", Number(event.target.value))} /></label><label>To page<input type="number" min="1" max={pages.length} value={range.to} onChange={(event) => updateRange(range.id, "to", Number(event.target.value))} /></label></div>)}<button type="button" onClick={addRange}><Plus size={16} /> Add range</button></div> : null}
            {rangeMode === "fixed" ? <label className="split-number-setting">Pages per PDF<input type="number" min="1" max={pages.length} value={fixedPages} onChange={(event) => { setFixedPages(Number(event.target.value)); resetResults(); }} /></label> : null}
            {rangeMode === "smart" ? <label className="split-number-setting">Number of balanced PDFs<input type="number" min="2" max={pages.length} value={smartParts} onChange={(event) => { setSmartParts(Number(event.target.value)); resetResults(); }} /><small>Pages are balanced automatically across output files.</small></label> : null}
            <label className="split-checkbox"><input type="checkbox" checked={mergeRanges} onChange={(event) => setMergeRanges(event.target.checked)} /> Merge all ranges into one PDF file</label></> : null}
          {mode === "pages" ? <><h2>Select pages</h2><p>Click page thumbnails to include or exclude them. Every selected page becomes a separate PDF.</p><div className="split-selection-actions"><button type="button" onClick={() => setSelectedPages(new Set(pages.map((page) => page.index)))}>Select all</button><button type="button" onClick={() => setSelectedPages(new Set())}>Clear</button></div><strong className="split-count">{selectedPages.size} of {pages.length} selected</strong></> : null}
          {mode === "size" ? <><h2>Split by size</h2><p>Create PDFs close to your preferred maximum size. Final size can vary based on page content.</p><label className="split-number-setting">Maximum size per PDF<div><input type="number" min={sizeUnit === "MB" ? .1 : 100} step={sizeUnit === "MB" ? .1 : 10} value={maxSizeMb} onChange={(event) => setMaxSizeMb(Math.max(sizeUnit === "MB" ? .1 : 100, Number(event.target.value)))} /><select value={sizeUnit} aria-label="File size unit" onChange={(event) => { const next = event.target.value as "KB" | "MB"; setMaxSizeMb((value) => next === "KB" ? Math.max(100, Math.round(value * 1024)) : Number((value / 1024).toFixed(2))); setSizeUnit(next); resetResults(); }}><option value="KB">KB</option><option value="MB">MB</option></select></div><small>{sizeUnit === "MB" ? `${Math.round(maxSizeMb * 1024)} KB` : `${(maxSizeMb / 1024).toFixed(2)} MB`} equivalent</small></label></> : null}
        </div>
        <div className="split-side-actions">{processing ? <div className="split-progress"><span>Creating PDFs… {progress}%</span><progress value={progress} max="100" /></div> : null}<button className="split-submit" type="button" disabled={processing || loading || (mode === "pages" && !selectedPages.size)} onClick={splitPdf}>{processing ? <LoaderCircle className="spin" size={20} /> : <Scissors size={20} />} {processing ? "Creating PDFs…" : toolTitle}<ArrowRight size={18} /></button></div>
      </aside>
    </div>{error ? <div className="profile-alert error split-error">{error}</div> : null}
  </div></DashboardShell>;
}

function SplitPageCanvas({ mode, rangeMode, pages, ranges, selectedPages, fixedPages, smartParts, maxSizeMb, sizeUnit, onTogglePage }: { mode: SplitMode; rangeMode: RangeMode; pages: PagePreview[]; ranges: PageRange[]; selectedPages: Set<number>; fixedPages: number; smartParts: number; maxSizeMb: number; sizeUnit: "KB" | "MB"; onTogglePage: (index: number) => void }) {
  if (mode === "pages") return <div className="split-page-grid">{pages.map((page) => <button type="button" className={selectedPages.has(page.index) ? "selected" : ""} key={page.index} onClick={() => onTogglePage(page.index)}><img src={page.image} alt={`Page ${page.index}`} /><span>{selectedPages.has(page.index) ? <Check size={14} /> : null} Page {page.index}</span></button>)}</div>;
  const groups = rangeMode === "custom" ? ranges.map((range) => ({ from: range.from, to: range.to })) : rangeMode === "fixed" ? chunk(pages.length, fixedPages).map((group) => ({ from: group[0] + 1, to: group[group.length - 1] + 1 })) : chunk(pages.length, Math.ceil(pages.length / smartParts)).map((group) => ({ from: group[0] + 1, to: group[group.length - 1] + 1 }));
  if (mode === "size") return <div className="split-range-preview"><h2>Target size: {maxSizeMb} {sizeUnit}</h2><p>{sizeUnit === "MB" ? `${Math.round(maxSizeMb * 1024)} KB` : `${(maxSizeMb / 1024).toFixed(2)} MB`} · The PDF will be divided into the closest possible size groups.</p><FileArchive size={70} /></div>;
  return <div className="split-range-groups">{groups.map((group, index) => <article key={index}><h3>Range {index + 1}</h3><div><figure><img src={pages[Math.max(0, group.from - 1)]?.image} alt={`Page ${group.from}`} /><figcaption>{group.from}</figcaption></figure><strong>•••</strong><figure><img src={pages[Math.max(0, group.to - 1)]?.image} alt={`Page ${group.to}`} /><figcaption>{group.to}</figcaption></figure></div></article>)}</div>;
}

function SplitResults({ results, onZip, onBack, actionName }: { results: SplitResult[]; onZip: () => void; onBack: () => void; actionName: string }) { return <div className="split-results"><span><Check size={28} /></span><h2>{actionName === "Extract pages" ? "Pages extracted successfully!" : "PDF split successfully!"}</h2><p>{results.length} PDF file{results.length > 1 ? "s" : ""} created.</p><div>{results.map((result) => <article key={result.name}><FileText size={22} /><div><strong>{result.name}</strong><small>{result.pages} pages · {formatBytes(result.blob.size)}</small></div><a href={result.url} download={result.name}><Download size={17} /> Download</a></article>)}</div><footer><button type="button" onClick={onBack}>Change settings</button>{results.length > 1 ? <button type="button" onClick={onZip}><Download size={18} /> Download ZIP</button> : null}</footer></div>; }

async function renderPagePreviews(file: File) { const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString(); const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; const previews: PagePreview[] = []; for (let number = 1; number <= document.numPages; number += 1) { const page = await document.getPage(number); const base = page.getViewport({ scale: 1 }); const viewport = page.getViewport({ scale: Math.min(.7, 160 / base.width) }); const canvas = window.document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable"); await page.render({ canvas, canvasContext: context, viewport }).promise; previews.push({ index: number, image: canvas.toDataURL("image/jpeg", .8) }); } return previews; }
function chunk(count: number, size: number) { const groups: number[][] = []; for (let start = 0; start < count; start += Math.max(1, size)) groups.push(Array.from({ length: Math.min(size, count - start) }, (_, offset) => start + offset)); return groups; }
function pageIndices(from: number, to: number) { return Array.from({ length: to - from + 1 }, (_, index) => from - 1 + index); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min)); }
function baseName(name: string) { return name.replace(/\.pdf$/i, ""); }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`; }
function triggerDownload(url: string, name: string) { const link = document.createElement("a"); link.href = url; link.download = name; link.click(); }

export default function SplitPdfPage() { return <SplitPdfTool />; }
