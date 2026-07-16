"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Archive, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Download, Eye, FilePlus2, GripVertical, ListOrdered, LoaderCircle, LockKeyhole, Merge, Plus, RotateCcw, Scissors, ShieldCheck, Stamp, Trash2, X } from "lucide-react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../PdfToolUpload";

type PdfPage = { index: number; thumbnail: string; removed: boolean };
type PdfItem = { id: string; file: File; pages: PdfPage[]; loading: boolean };

export default function MergePdfPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PdfItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState(0);

  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    const invalid = selected.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));
    if (invalid) return setError(`${invalid.name} is not a PDF file.`);
    clearResult(); setError("");
    const additions = selected.map((file) => ({ id: crypto.randomUUID(), file, pages: [], loading: true }));
    setItems((current) => [...current, ...additions]);
    await Promise.all(additions.map(async (item) => {
      try {
        const pages = await renderPdfPages(item.file);
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, pages, loading: false } : entry));
      } catch (reason) {
        console.error(reason);
        setItems((current) => current.filter((entry) => entry.id !== item.id));
        setError(`${item.file.name} could not be opened. It may be password-protected or damaged.`);
      }
    }));
  }

  function clearResult() { if (resultUrl) URL.revokeObjectURL(resultUrl); setResultUrl(""); }
  function move(index: number, offset: number) { clearResult(); setItems((current) => { const target = index + offset; if (target < 0 || target >= current.length) return current; const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; }); }
  function removeFile(id: string) { clearResult(); setItems((current) => current.filter((item) => item.id !== id)); if (previewId === id) setPreviewId(null); }
  function reset() { clearResult(); setItems([]); setError(""); setPreviewId(null); if (inputRef.current) inputRef.current.value = ""; }
  function openPreview(id: string, page = 0) { setPreviewId(id); setPreviewPage(page); }
  function togglePage(itemId: string, pageIndex: number) { clearResult(); setItems((current) => current.map((item) => item.id === itemId ? { ...item, pages: item.pages.map((page) => page.index === pageIndex ? { ...page, removed: !page.removed } : page) } : item)); }

  async function mergePdfs() {
    if (!canMerge || merging) return;
    setMerging(true); setError(""); clearResult();
    try {
      const merged = await PDFDocument.create();
      for (const item of items) {
        const source = await PDFDocument.load(await item.file.arrayBuffer());
        const kept = item.pages.filter((page) => !page.removed).map((page) => page.index);
        const pages = await merged.copyPages(source, kept);
        pages.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save();
      setResultUrl(URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })));
    } catch (reason) {
      console.error(reason); setError("PDFs could not be merged. Please remove any protected or damaged file and try again.");
    } finally { setMerging(false); }
  }

  function drop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }
  const readyItems = items.filter((item) => !item.loading && item.pages.some((page) => !page.removed));
  const canMerge = readyItems.length >= 2 && readyItems.length === items.length;
  const totalPages = items.reduce((total, item) => total + item.pages.filter((page) => !page.removed).length, 0);
  const preview = items.find((item) => item.id === previewId);
  const selectedPreviewPage = preview?.pages[previewPage];

  return (
    <DashboardShell activePath="/pdf-tools">
      <div className={`dashboard merge-studio ${items.length ? "has-files" : "empty"}`}>
        {items.length ? <input ref={inputRef} hidden multiple type="file" accept="application/pdf,.pdf" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} /> : null}
        {items.length ? <div className="merge-studio-top"><Link href="/pdf-tools"><ArrowLeft size={17} /> PDF Tools</Link><span><ShieldCheck size={16} /> Free, private browser processing</span></div> : null}

        {resultUrl ? (
          <MergeSuccess resultUrl={resultUrl} onMergeMore={reset} />
        ) : !items.length ? (
          <PdfToolUpload title="Merge PDF files" description="Combine PDFs in the order you want with a fast and easy PDF merger." icon={Merge} inputRef={inputRef} onFiles={(files) => void addFiles(files)} />
        ) : (
          <div className="merge-workbench">
            <section className={`merge-canvas ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
              <div className="merge-canvas-head"><div><h1>Arrange your PDFs</h1><p>Preview any file and remove pages you do not want.</p></div><button type="button" onClick={() => inputRef.current?.click()}><Plus size={20} /> Add PDFs</button></div>
              <div className="merge-card-grid">
                {items.map((item, index) => {
                  const kept = item.pages.filter((page) => !page.removed).length;
                  return <article className="merge-document-card" key={item.id}>
                    <div className="merge-order"><GripVertical size={16} /><span>{index + 1}</span></div>
                    <button className="merge-card-remove" type="button" aria-label={`Remove ${item.file.name}`} onClick={() => removeFile(item.id)}><X size={16} /></button>
                    <button className="merge-document-preview" type="button" disabled={item.loading} onClick={() => openPreview(item.id)}>
                      {item.loading ? <span className="merge-thumb-loading"><LoaderCircle size={28} /> Reading PDF…</span> : <img src={item.pages[0]?.thumbnail} alt={`First page of ${item.file.name}`} />}
                      {!item.loading ? <span><Eye size={16} /> Preview pages</span> : null}
                    </button>
                    <strong title={item.file.name}>{item.file.name}</strong>
                    <small>{formatBytes(item.file.size)} · {item.loading ? "Loading…" : `${kept}/${item.pages.length} pages selected`}</small>
                    <div className="merge-card-controls"><button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move PDF left"><ArrowUp size={16} /></button><button type="button" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move PDF right"><ArrowDown size={16} /></button><button type="button" onClick={() => removeFile(item.id)}><Trash2 size={16} /> Remove</button></div>
                  </article>;
                })}
                <button className="merge-add-card" type="button" onClick={() => inputRef.current?.click()}><span><Plus size={30} /></span><strong>Add another PDF</strong><small>Click or drop files here</small></button>
              </div>
            </section>

            <aside className="merge-side-panel">
              <div><span className="auto-print-kicker">RepetiGo PDF Tools</span><h2>Merge PDF</h2><p>{items.length} files · {totalPages} selected pages</p></div>
              {!canMerge ? <div className="merge-hint">Add at least 2 readable PDFs with one selected page each to start merging.</div> : <div className="merge-ready"><span><Check size={18} /></span><div><strong>Ready to merge!</strong><small>Your files and page selection look good.</small></div></div>}
              <div className="merge-side-actions">
                <button className={`merge-main-button ${canMerge ? "ready" : ""}`} type="button" disabled={!canMerge || merging} onClick={mergePdfs}>{merging ? <><LoaderCircle className="spin" size={22} /> Merging PDFs…</> : <><Merge size={20} /> Merge PDF <ArrowRight size={19} /></>}</button>
                <button className="merge-reset-button" type="button" disabled={merging} onClick={reset}><RotateCcw size={17} /> Start over</button>
              </div>
            </aside>
          </div>
        )}
        {error ? <div className="profile-alert error merge-error" role="alert">{error}</div> : null}

        {preview && selectedPreviewPage ? <div className="pdf-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Preview ${preview.file.name}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewId(null); }}>
          <section className="pdf-preview-modal">
            <header><div><h2>{preview.file.name}</h2><p>Select pages to include in the merged PDF.</p></div><button type="button" aria-label="Close preview" onClick={() => setPreviewId(null)}><X size={21} /></button></header>
            <div className="pdf-preview-body">
              <div className={`pdf-large-page ${selectedPreviewPage.removed ? "removed" : ""}`}><img src={selectedPreviewPage.thumbnail} alt={`Page ${previewPage + 1}`} />{selectedPreviewPage.removed ? <span>Page removed</span> : null}</div>
              <div className="pdf-page-strip">{preview.pages.map((page, index) => <button className={`${index === previewPage ? "active" : ""} ${page.removed ? "removed" : ""}`} type="button" key={page.index} onClick={() => setPreviewPage(index)}><img src={page.thumbnail} alt={`Page ${index + 1}`} /><span>{page.removed ? <X size={13} /> : <Check size={13} />} Page {index + 1}</span></button>)}</div>
            </div>
            <footer><span>{preview.pages.filter((page) => !page.removed).length} of {preview.pages.length} pages selected</span><button className={selectedPreviewPage.removed ? "restore" : "remove"} type="button" onClick={() => togglePage(preview.id, selectedPreviewPage.index)}>{selectedPreviewPage.removed ? <><Check size={17} /> Restore this page</> : <><Trash2 size={17} /> Remove this page</>}</button><button type="button" onClick={() => setPreviewId(null)}>Done</button></footer>
          </section>
        </div> : null}
      </div>
    </DashboardShell>
  );
}

async function renderPdfPages(file: File): Promise<PdfPage[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: PdfPage[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: Math.min(1.2, 220 / base.width) });
    const canvas = window.document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");
    await page.render({ canvas, canvasContext: context, viewport }).promise;
    pages.push({ index: pageNumber - 1, thumbnail: canvas.toDataURL("image/jpeg", 0.82), removed: false });
  }
  return pages;
}

function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }

const nextTools = [
  { name: "Compress PDF", icon: Archive, color: "#0d9488" },
  { name: "Split PDF", icon: Scissors, color: "#2563eb" },
  { name: "Add page numbers", icon: ListOrdered, color: "#1688f5" },
  { name: "Add watermark", icon: Stamp, color: "#16a1bd" },
  { name: "Rotate PDF", icon: RotateCcw, color: "#2563eb" },
  { name: "Protect PDF", icon: LockKeyhole, color: "#0d1748" },
];

function MergeSuccess({ resultUrl, onMergeMore }: { resultUrl: string; onMergeMore: () => void }) {
  return <section className="merge-success-screen">
    <div className="merge-success-check"><Check size={34} /></div>
    <span className="auto-print-kicker">Merge completed</span>
    <h1>PDFs have been merged!</h1>
    <p>Your merged document is ready. Download it now or continue with another PDF tool.</p>
    <div className="merge-success-primary">
      <button type="button" onClick={onMergeMore} aria-label="Merge more PDFs"><ArrowLeft size={21} /></button>
      <a href={resultUrl} download="repetigo-merged.pdf"><Download size={25} /> Download merged PDF</a>
    </div>
    <button className="merge-again-link" type="button" onClick={onMergeMore}><RotateCcw size={16} /> Merge more PDFs</button>

    <div className="merge-continue-card">
      <div className="merge-continue-head"><div><h2>Continue with another tool</h2><p>Choose what you want to do with your documents next.</p></div><Link href="/pdf-tools">See all PDF tools <ArrowRight size={16} /></Link></div>
      <div className="merge-next-tools">
        {nextTools.map((tool) => {
          const Icon = tool.icon;
          return <Link href="/pdf-tools" key={tool.name}><span style={{ "--next-tool-color": tool.color } as CSSProperties}><Icon size={19} /></span><strong>{tool.name}</strong><ArrowRight size={17} /></Link>;
        })}
      </div>
    </div>
    <div className="merge-success-note"><ShieldCheck size={17} /><span><strong>Your privacy is protected.</strong> The merged file was created inside your browser and was never uploaded to our server.</span></div>
  </section>;
}
