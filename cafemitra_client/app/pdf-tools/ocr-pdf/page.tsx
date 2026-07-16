"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Download, Eye, FileSearch, FileText, Languages, LoaderCircle, Printer, RotateCcw, Search, ShieldCheck, Sparkles, Wrench, X } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../PdfToolUpload";
import { RelatedToolSuggestions, ToolPromotionRail } from "../ToolDiscovery";

type OcrPage = { index: number; image: string };
type OcrResult = { pdf: Blob; pdfUrl: string; text: string; size: number };

export default function OcrPdfPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null); const [pages, setPages] = useState<OcrPage[]>([]); const [selected, setSelected] = useState<Set<number>>(new Set());
  const [language, setLanguage] = useState("eng"); const [quality, setQuality] = useState(2); const [loading, setLoading] = useState(false); const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0); const [status, setStatus] = useState(""); const [error, setError] = useState(""); const [result, setResult] = useState<OcrResult | null>(null); const [showText, setShowText] = useState(false);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.pdfUrl); }, [result]);

  async function chooseFile(files: FileList) { const next = files[0]; if (!next) return; if (next.type !== "application/pdf" && !next.name.toLowerCase().endsWith(".pdf")) return setError("Please select a PDF file."); clearResult(); setFile(next); setLoading(true); setError(""); try { const previews = await renderPreviews(next); setPages(previews); setSelected(new Set(previews.map((page) => page.index))); } catch (reason) { console.error(reason); setFile(null); setError("This PDF could not be opened. It may be protected or damaged."); } finally { setLoading(false); } }
  function clearResult() { if (result) URL.revokeObjectURL(result.pdfUrl); setResult(null); setProgress(0); setStatus(""); }
  function reset() { clearResult(); setFile(null); setPages([]); setSelected(new Set()); setError(""); if (inputRef.current) inputRef.current.value = ""; }
  function togglePage(index: number) { clearResult(); setSelected((current) => { const next = new Set(current); next.has(index) ? next.delete(index) : next.add(index); return next; }); }

  async function runOcr() {
    if (!file || !selected.size || processing) return; setProcessing(true); setProgress(1); setError(""); clearResult();
    let worker: Awaited<ReturnType<typeof import("tesseract.js")["createWorker"]>> | null = null;
    try {
      setStatus("Loading OCR language model…"); const { createWorker } = await import("tesseract.js");
      worker = await createWorker(language, 1, { logger: (message) => { if (message.status) setStatus(formatStatus(message.status)); } });
      const pdfjs = await loadPdf(file); const source = await PDFDocument.load(await file.arrayBuffer()); const output = await PDFDocument.create(); const font = await output.embedFont(StandardFonts.Helvetica); const texts: string[] = []; const selectedIndices = Array.from(selected).sort((a, b) => a - b);
      for (let position = 0; position < selectedIndices.length; position += 1) {
        const pageNumber = selectedIndices[position]; setStatus(`Recognizing page ${pageNumber} of ${pdfjs.numPages}…`); const pdfPage = await pdfjs.getPage(pageNumber); const canvas = await renderPageCanvas(pdfPage, quality); const recognition = await worker.recognize(canvas); const text = recognition.data.text.trim(); texts.push(`--- Page ${pageNumber} ---\n${text}`);
        const [copied] = await output.copyPages(source, [pageNumber - 1]); output.addPage(copied); const searchable = latinSearchText(text); if (searchable) copied.drawText(searchable, { x: 2, y: 2, size: 1, font, color: rgb(1, 1, 1), opacity: 0, maxWidth: Math.max(10, copied.getWidth() - 4), lineHeight: 1.2 });
        setProgress(Math.round(((position + 1) / selectedIndices.length) * 95));
      }
      setStatus("Creating searchable PDF…"); const bytes = await output.save({ useObjectStreams: true }); const blob = new Blob([bytes], { type: "application/pdf" }); setResult({ pdf: blob, pdfUrl: URL.createObjectURL(blob), text: texts.join("\n\n"), size: blob.size }); setProgress(100); setStatus("OCR completed");
    } catch (reason) { console.error(reason); setError("OCR could not be completed. Check your internet connection for the first language-model download and try again."); }
    finally { if (worker) await worker.terminate(); setProcessing(false); }
  }

  function downloadText() { if (!result) return; const url = URL.createObjectURL(new Blob([result.text], { type: "text/plain;charset=utf-8" })); triggerDownload(url, `${baseName(file?.name || "ocr")}-ocr.txt`); setTimeout(() => URL.revokeObjectURL(url), 1000); }

  if (!file) return <DashboardShell activePath="/pdf-tools"><div className="dashboard ocr-pdf-page"><PdfToolUpload title="OCR PDF" description="Convert scanned PDF pages into searchable documents and extract their text." icon={FileSearch} inputRef={inputRef} onFiles={(files) => void chooseFile(files)} multiple={false} buttonLabel="Select PDF file" /></div></DashboardShell>;
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard ocr-pdf-page">
    <input ref={inputRef} hidden type="file" accept="application/pdf,.pdf" onChange={(event) => { if (event.target.files?.length) void chooseFile(event.target.files); event.target.value = ""; }} />
    <div className="ocr-topline"><Link href="/pdf-tools"><ArrowLeft size={16} /> PDF Tools</Link><span><ShieldCheck size={16} /> OCR runs privately in your browser</span></div>
    <div className="ocr-studio"><section className="ocr-canvas"><header><div><h1>OCR PDF</h1><p>{file.name} · {pages.length} pages · {formatBytes(file.size)}</p></div><button type="button" disabled={processing} onClick={() => inputRef.current?.click()}>Replace PDF</button></header>
      {loading ? <div className="ocr-loading"><LoaderCircle className="spin" size={30} /> Preparing page thumbnails…</div> : result ? <OcrSuccess result={result} file={file} selected={selected.size} onText={() => setShowText(true)} onDownloadText={downloadText} onBack={clearResult} onReset={reset} /> : <div className="ocr-page-grid">{pages.map((page) => <button type="button" className={selected.has(page.index) ? "selected" : ""} key={page.index} onClick={() => togglePage(page.index)}><img src={page.image} alt={`Page ${page.index}`} /><span>{selected.has(page.index) ? <Check size={14} /> : null} Page {page.index}</span></button>)}</div>}
    </section>{!result ? <aside className="ocr-side-panel"><div><span className="auto-print-kicker">RepetiGo AI Tools</span><h2>OCR settings</h2><p>{selected.size} of {pages.length} pages selected</p></div>
      <div className="ocr-language"><label><Languages size={17} /> Document language</label><select value={language} disabled={processing} onChange={(event) => setLanguage(event.target.value)}><option value="eng">English</option><option value="hin">Hindi</option><option value="eng+hin">English + Hindi</option></select><small>The first use downloads the selected language model.</small></div>
      <div className="ocr-quality"><label><Sparkles size={17} /> Recognition quality</label><button className={quality === 1.5 ? "active" : ""} type="button" onClick={() => setQuality(1.5)}>Fast</button><button className={quality === 2 ? "active" : ""} type="button" onClick={() => setQuality(2)}>Accurate</button><button className={quality === 2.5 ? "active" : ""} type="button" onClick={() => setQuality(2.5)}>Best</button></div>
      <div className="ocr-selection"><strong>Page selection</strong><div><button type="button" onClick={() => setSelected(new Set(pages.map((page) => page.index)))}>Select all</button><button type="button" onClick={() => setSelected(new Set())}>Clear</button></div></div>
      <div className="ocr-info"><Search size={18} /><span>The output keeps selected PDF pages and adds an invisible searchable English text layer. Full recognized Hindi text remains available in TXT output.</span></div>
      <div className="ocr-side-actions">{processing ? <div><span>{status} · {progress}%</span><progress value={progress} max="100" /></div> : null}<button className="ocr-submit" type="button" disabled={processing || loading || !selected.size} onClick={runOcr}>{processing ? <LoaderCircle className="spin" size={19} /> : <FileSearch size={19} />} {processing ? "Running OCR…" : "Run OCR"}</button><button type="button" disabled={processing} onClick={reset}><RotateCcw size={16} /> Start over</button></div>
    </aside> : <ToolPromotionRail context="ocr-result" />}</div>{error ? <div className="profile-alert error ocr-error">{error}</div> : null}
    {showText && result ? <div className="ocr-text-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowText(false); }}><section><header><div><h2>Recognized text</h2><p>{file.name}</p></div><button type="button" onClick={() => setShowText(false)}><X size={20} /></button></header><pre>{result.text || "No readable text was detected."}</pre><footer><button type="button" onClick={downloadText}><Download size={17} /> Download TXT</button></footer></section></div> : null}
  </div></DashboardShell>;
}

function OcrSuccess({ result, file, selected, onText, onDownloadText, onBack, onReset }: { result: OcrResult; file: File; selected: number; onText: () => void; onDownloadText: () => void; onBack: () => void; onReset: () => void }) { return <section className="ocr-success"><span><Check size={30} /></span><h2>OCR completed!</h2><p>{selected} pages processed · Your searchable PDF is ready.</p><div><FileText size={24} /><div><strong>{baseName(file.name)}-searchable.pdf</strong><small>{formatBytes(result.size)}</small></div></div><a href={result.pdfUrl} download={`${baseName(file.name)}-searchable.pdf`}><Download size={19} /> Download searchable PDF</a><div className="ocr-result-tools"><button type="button" onClick={onText}><Eye size={16} /> Preview text</button><button type="button" onClick={onDownloadText}><Download size={16} /> Download TXT</button></div><footer><button type="button" onClick={onBack}>Change settings</button><button type="button" onClick={onReset}>OCR another PDF</button></footer><RelatedToolSuggestions context="ocr-result" /></section>; }

function RelatedOcrTools() { const tools = [{ name: "Repair & enhance", detail: "Improve scan clarity", href: "/pdf-tools/repair-pdf", icon: Wrench },{ name: "Compress PDF", detail: "Reduce output size", href: "/pdf-tools/compress-pdf", icon: FileText },{ name: "PDF to Word", detail: "Create editable document", href: "/pdf-tools/pdf-to-word", icon: FileText },{ name: "Translate PDF", detail: "Translate document text", href: "/pdf-tools/translate-pdf", icon: Languages }]; return <div className="ocr-related"><header><div><strong>Continue with another tool</strong><small>Useful next steps for your searchable PDF</small></div><Link href="/pdf-tools">View all <ArrowRight size={14} /></Link></header><div>{tools.map((tool) => { const Icon = tool.icon; return <Link href={tool.href} key={tool.name}><span><Icon size={17} /></span><div><strong>{tool.name}</strong><small>{tool.detail}</small></div><ArrowRight size={15} /></Link>; })}</div></div>; }

function OcrPromotion() { return <aside className="ocr-promotion"><span className="ocr-promo-mark"><Printer size={25} /></span><span className="auto-print-kicker">Made for print shops</span><h2>Meet RepetiGo PrintPilot</h2><p>Turn customer document uploads into an organized print queue—without repeatedly checking WhatsApp or downloading files manually.</p><ul><li><Check size={15} /> QR-based customer uploads</li><li><Check size={15} /> Live print queue and status</li><li><Check size={15} /> Local printer automation</li><li><Check size={15} /> Built for cyber cafés</li></ul><div className="ocr-promo-stat"><strong>OCR + PrintPilot</strong><span>Clean scanned documents, then send them into your shop workflow.</span></div><Link href="/print-automation">Explore PrintPilot <ArrowRight size={16} /></Link><small>PDF tools stay free. Login is required only for shop automation.</small></aside>; }

async function loadPdf(file: File) { const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString(); return pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; }
async function renderPreviews(file: File) { const document = await loadPdf(file); const result: OcrPage[] = []; for (let number = 1; number <= document.numPages; number += 1) { const page = await document.getPage(number); const canvas = await renderPageCanvas(page, Math.min(.75, 170 / page.getViewport({ scale: 1 }).width)); result.push({ index: number, image: canvas.toDataURL("image/jpeg", .8) }); } return result; }
async function renderPageCanvas(page: Awaited<ReturnType<Awaited<ReturnType<typeof loadPdf>>["getPage"]>>, scale: number) { const viewport = page.getViewport({ scale }); const canvas = window.document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d", { alpha: false }); if (!context) throw new Error("Canvas unavailable"); context.fillStyle = "#fff"; context.fillRect(0, 0, canvas.width, canvas.height); await page.render({ canvas, canvasContext: context, viewport, background: "white" }).promise; return canvas; }
function latinSearchText(text: string) { return text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, 30000); }
function formatStatus(status: string) { return status.replace(/_/g, " ").replace(/^./, (character) => character.toUpperCase()); }
function baseName(name: string) { return name.replace(/\.pdf$/i, ""); }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`; }
function triggerDownload(url: string, name: string) { const link = document.createElement("a"); link.href = url; link.download = name; link.click(); }
