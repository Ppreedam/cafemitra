"use client";

import { DragEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, Check, Copy, Download, FilePlus2, FileText, GripVertical, LoaderCircle, Plus, RotateCw, ShieldCheck, Sparkles, Trash2, Undo2, X } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../PdfToolUpload";
import { RelatedToolSuggestions, ToolPromotionRail } from "../ToolDiscovery";
import OrganizeSeoContent from "./OrganizeSeoContent";

type SourceFile = { id: string; file: File };
type OrganizePage = { id: string; sourceId?: string; sourceIndex?: number; image: string; rotation: number; blank: boolean; width: number; height: number };
type OrganizeResult = { blob: Blob; url: string; size: number };

export default function OrganizePdfPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sources, setSources] = useState<SourceFile[]>([]);
  const [pages, setPages] = useState<OrganizePage[]>([]);
  const [initialPages, setInitialPages] = useState<OrganizePage[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<OrganizeResult | null>(null);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  async function addFiles(files: FileList) {
    const selected = Array.from(files); const invalid = selected.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));
    if (invalid) return setError(`${invalid.name} is not a PDF file.`); clearResult(); setLoading(true); setError("");
    try {
      for (const file of selected) {
        const sourceId = crypto.randomUUID(); const previews = await renderPdfPages(file, sourceId); const source = { id: sourceId, file };
        setSources((current) => [...current, source]); setPages((current) => [...current, ...previews]); setInitialPages((current) => [...current, ...previews]);
      }
    } catch (reason) { console.error(reason); setError("One of the PDFs could not be opened. It may be protected or damaged."); }
    finally { setLoading(false); }
  }

  function clearResult() { if (result) URL.revokeObjectURL(result.url); setResult(null); setProgress(0); }
  function updatePages(updater: (current: OrganizePage[]) => OrganizePage[]) { clearResult(); setPages(updater); }
  function move(index: number, offset: number) { updatePages((current) => { const target = index + offset; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; }); }
  function rotate(id: string) { updatePages((current) => current.map((page) => page.id === id ? { ...page, rotation: (page.rotation + 90) % 360 } : page)); }
  function remove(id: string) { if (pages.length === 1) return setError("At least one page must remain."); updatePages((current) => current.filter((page) => page.id !== id)); }
  function duplicate(index: number) { updatePages((current) => { const next = [...current]; next.splice(index + 1, 0, { ...current[index], id: crypto.randomUUID() }); return next; }); }
  function addBlank(afterIndex = pages.length - 1) { const reference = pages[Math.max(0, afterIndex)] || { width: 595.28, height: 841.89 }; const blank: OrganizePage = { id: crypto.randomUUID(), image: "", rotation: 0, blank: true, width: reference.width, height: reference.height }; updatePages((current) => { const next = [...current]; next.splice(afterIndex + 1, 0, blank); return next; }); }
  function resetOrder() { clearResult(); setPages(initialPages.map((page) => ({ ...page, id: crypto.randomUUID(), rotation: 0 }))); }
  function resetAll() { clearResult(); setSources([]); setPages([]); setInitialPages([]); setError(""); if (inputRef.current) inputRef.current.value = ""; }
  function dropOn(targetId: string) { if (!dragId || dragId === targetId) return setDragId(null); updatePages((current) => { const from = current.findIndex((page) => page.id === dragId); const to = current.findIndex((page) => page.id === targetId); if (from < 0 || to < 0) return current; const next = [...current]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); return next; }); setDragId(null); }

  async function organize() {
    if (!pages.length || processing) return; setProcessing(true); setProgress(3); setError(""); clearResult();
    try {
      const { degrees, PDFDocument } = await import("pdf-lib");
      const loaded = new Map<string, Awaited<ReturnType<typeof PDFDocument.load>>>(); for (const source of sources) loaded.set(source.id, await PDFDocument.load(await source.file.arrayBuffer()));
      const output = await PDFDocument.create();
      for (let index = 0; index < pages.length; index += 1) {
        const page = pages[index];
        if (page.blank) output.addPage(page.rotation % 180 ? [page.height, page.width] : [page.width, page.height]);
        else { const source = loaded.get(page.sourceId!); if (!source) throw new Error("A source PDF is missing."); const [copied] = await output.copyPages(source, [page.sourceIndex!]); const existing = copied.getRotation().angle; copied.setRotation(degrees((existing + page.rotation) % 360)); output.addPage(copied); }
        setProgress(Math.round(((index + 1) / pages.length) * 92));
      }
      const bytes = await output.save({ useObjectStreams: true }); const blob = new Blob([bytes], { type: "application/pdf" }); setResult({ blob, url: URL.createObjectURL(blob), size: blob.size }); setProgress(100);
    } catch (reason) { console.error(reason); setError("The organized PDF could not be created."); }
    finally { setProcessing(false); }
  }

  if (!sources.length) return <DashboardShell activePath="/pdf-tools"><div className="dashboard organize-pdf-page"><PdfToolUpload title="Organize PDF" description="Reorder, rotate, duplicate, delete or add blank pages to your PDF." icon={GripVertical} inputRef={inputRef} onFiles={(files) => void addFiles(files)} buttonLabel="Select PDF files" headingLevel="h2" /><OrganizeSeoContent /></div></DashboardShell>;

  return <DashboardShell activePath="/pdf-tools"><div className="dashboard organize-pdf-page">
    <input ref={inputRef} hidden multiple type="file" accept="application/pdf,.pdf" onChange={(event) => { if (event.target.files?.length) void addFiles(event.target.files); event.target.value = ""; }} />
    <div className="organize-topline"><Link href="/pdf-tools"><ArrowLeft size={16} /> PDF Tools</Link><span><ShieldCheck size={16} /> Free · Private browser processing</span></div>
    <div className="organize-studio">
      <section className="organize-canvas"><header><div><h2>Organize PDF</h2><p>Drag pages to rearrange. Use page actions to rotate, duplicate or delete.</p></div><button type="button" disabled={processing} onClick={() => inputRef.current?.click()}><FilePlus2 size={17} /> Add PDF</button></header>
        {loading ? <div className="organize-loading"><LoaderCircle className="spin" size={29} /> Reading PDF pages…</div> : result ? <OrganizeSuccess result={result} pageCount={pages.length} onBack={clearResult} onReset={resetAll} /> : <div className="organize-page-grid">{pages.map((page, index) => <article className={`${dragId === page.id ? "dragging" : ""} ${page.blank ? "blank" : ""}`} draggable={!processing} key={page.id} onDragStart={() => setDragId(page.id)} onDragOver={(event: DragEvent<HTMLElement>) => event.preventDefault()} onDrop={() => dropOn(page.id)}>
          <div className="organize-card-head"><span><GripVertical size={15} /> {index + 1}</span><button type="button" onClick={() => remove(page.id)} aria-label={`Delete page ${index + 1}`}><X size={15} /></button></div>
          <div className="organize-page-preview" style={{ transform: `rotate(${page.rotation}deg)` }}>{page.blank ? <span>Blank page</span> : <img src={page.image} alt={`Page ${index + 1}`} />}</div>
          <div className="organize-page-actions"><button type="button" onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp size={15} /></button><button type="button" onClick={() => move(index, 1)} disabled={index === pages.length - 1}><ArrowDown size={15} /></button><button type="button" onClick={() => rotate(page.id)} title="Rotate page"><RotateCw size={15} /></button><button type="button" onClick={() => duplicate(index)} title="Duplicate page"><Copy size={15} /></button></div>
          <button className="organize-insert-blank" type="button" onClick={() => addBlank(index)} title="Insert blank page after this page"><Plus size={14} /> Blank</button>
        </article>)}<button className="organize-add-blank-card" type="button" onClick={() => addBlank()}><span><Plus size={28} /></span><strong>Add blank page</strong><small>Insert at the end</small></button></div>}
      </section>
      {!result ? <aside className="organize-side-panel"><div><span className="auto-print-kicker">RepetiGo PDF Tools</span><h2>Organize PDF</h2><p>{pages.length} pages from {sources.length} PDF{sources.length > 1 ? "s" : ""}</p></div>
        <div className="organize-files"><header><strong>Source files</strong><button type="button" onClick={resetAll}>Reset all</button></header>{sources.map((source, index) => <div key={source.id}><FileText size={17} /><span>{String.fromCharCode(65 + index)}: {source.file.name}</span></div>)}</div>
        <div className="organize-tools"><h3>Quick actions</h3><button type="button" onClick={() => addBlank()}><Plus size={16} /> Add blank page</button><button type="button" onClick={() => updatePages((current) => [...current].reverse())}><Undo2 size={16} /> Reverse order</button><button type="button" onClick={resetOrder}><RotateCw size={16} /> Restore original order</button></div>
        <div className="organize-hint"><Sparkles size={18} /><span><strong>Tip</strong> Drag any page card and drop it at the desired position.</span></div>
        <div className="organize-side-actions">{processing ? <div><span>Creating PDF… {progress}%</span><progress value={progress} max="100" /></div> : null}<button className="organize-submit" type="button" disabled={processing || loading || !pages.length} onClick={organize}>{processing ? <LoaderCircle className="spin" size={19} /> : <GripVertical size={19} />} {processing ? "Organizing…" : "Organize PDF"}</button></div>
      </aside> : <ToolPromotionRail context="organize-result" />}
    </div>{error ? <div className="profile-alert error organize-error">{error}</div> : null}<OrganizeSeoContent />
  </div></DashboardShell>;
}

function OrganizeSuccess({ result, pageCount, onBack, onReset }: { result: OrganizeResult; pageCount: number; onBack: () => void; onReset: () => void }) { return <section className="organize-success"><span><Check size={30} /></span><h2>PDF organized successfully!</h2><p>{pageCount} pages are ready in the new order.</p><div><FileText size={24} /><div><strong>repetigo-organized.pdf</strong><small>{formatBytes(result.size)}</small></div></div><a href={result.url} download="repetigo-organized.pdf"><Download size={19} /> Download organized PDF</a><footer><button type="button" onClick={onBack}>Continue editing</button><button type="button" onClick={onReset}>Organize another PDF</button></footer><RelatedToolSuggestions context="organize-result" /></section>; }

async function renderPdfPages(file: File, sourceId: string) { const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString(); const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; const pages: OrganizePage[] = []; for (let number = 1; number <= document.numPages; number += 1) { const page = await document.getPage(number); const base = page.getViewport({ scale: 1 }); const viewport = page.getViewport({ scale: Math.min(.72, 165 / base.width) }); const canvas = window.document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("Canvas unavailable"); await page.render({ canvas, canvasContext: context, viewport }).promise; pages.push({ id: crypto.randomUUID(), sourceId, sourceIndex: number - 1, image: canvas.toDataURL("image/jpeg", .82), rotation: 0, blank: false, width: base.width, height: base.height }); } return pages; }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`; }
