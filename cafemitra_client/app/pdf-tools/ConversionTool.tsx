"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Archive, ArrowLeft, ArrowRight, Check, Download, FileImage, FileText, Image as ImageIcon, LoaderCircle, Plus, Presentation, RotateCw, ShieldCheck, Table2, Trash2, Upload, type LucideIcon } from "lucide-react";
import { PdfToolUpload } from "./PdfToolUpload";
import { RelatedToolSuggestions, ToolPromotionRail } from "./ToolDiscovery";

export type ConversionSlug = "jpg-to-pdf" | "word-to-pdf" | "powerpoint-to-pdf" | "excel-to-pdf" | "html-to-pdf" | "markdown-to-pdf" | "pdf-to-jpg" | "pdf-to-word" | "pdf-to-powerpoint" | "pdf-to-excel" | "pdf-to-pdfa";
type Config = { title: string; description: string; icon: LucideIcon; accept: string; button: string; drop: string; multiple: boolean; action: string; output: string; note: string };
type Result = { name: string; blob: Blob; url: string; detail: string; preview?: string };

const configs: Record<ConversionSlug, Config> = {
  "jpg-to-pdf": { title: "JPG to PDF", description: "Combine JPG, PNG, HEIC, WEBP, BMP, and GIF images into a clean, shareable PDF.", icon: FileImage, accept: "image/jpeg,image/png,image/heic,image/webp,image/bmp,image/gif,.jpg,.jpeg,.png,.heic,.webp,.bmp,.gif", button: "Select images", drop: "or drop JPG, PNG, HEIC, WEBP, BMP, and GIF images here", multiple: true, action: "Create PDF", output: "PDF", note: "Images remain private and are processed in your browser." },
  "word-to-pdf": { title: "Word to PDF", description: "Turn Word documents into browser-generated PDF files.", icon: FileText, accept: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document", button: "Select Word files", drop: "or drop DOCX files here", multiple: true, action: "Convert to PDF", output: "PDF", note: "Text and paragraphs are preserved; advanced Word layouts may be simplified." },
  "powerpoint-to-pdf": { title: "PowerPoint to PDF", description: "Convert presentation text into a clear PDF document.", icon: Presentation, accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation", button: "Select presentations", drop: "or drop PPT and PPTX files here", multiple: true, action: "Convert to PDF", output: "PDF", note: "Slide text is preserved. Complex animations and master layouts are simplified." },
  "excel-to-pdf": { title: "Excel to PDF", description: "Convert spreadsheet sheets into readable PDF pages.", icon: Table2, accept: ".xls,.xlsx,.csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", button: "Select spreadsheets", drop: "or drop Excel and CSV files here", multiple: true, action: "Convert to PDF", output: "PDF", note: "Cell values are preserved; very wide sheets wrap across the PDF." },
  "html-to-pdf": { title: "HTML to PDF", description: "Convert saved HTML documents into clean PDF files.", icon: FileText, accept: ".html,.htm,text/html", button: "Select HTML files", drop: "or drop HTML files here", multiple: true, action: "Convert to PDF", output: "PDF", note: "Readable page text is converted. Remote scripts and tracking are not executed." },
  "markdown-to-pdf": { title: "Markdown to PDF", description: "Convert Markdown documents into clean PDF files.", icon: FileText, accept: ".md,.markdown,text/markdown,text/plain", button: "Select Markdown files", drop: "or drop MD files here", multiple: true, action: "Convert to PDF", output: "PDF", note: "Markdown content is converted privately in your browser." },
  "pdf-to-jpg": { title: "PDF to JPG", description: "Render every PDF page as a high-quality JPG image.", icon: ImageIcon, accept: "application/pdf,.pdf", button: "Select PDF files", drop: "or drop PDFs here", multiple: true, action: "Convert to JPG", output: "JPG", note: "Choose image quality and scale before converting." },
  "pdf-to-word": { title: "PDF to Word", description: "Extract PDF text into editable DOCX documents.", icon: FileText, accept: "application/pdf,.pdf", button: "Select PDF files", drop: "or drop PDFs here", multiple: true, action: "Convert to Word", output: "DOCX", note: "Best for text PDFs. Scanned PDFs should use OCR first." },
  "pdf-to-powerpoint": { title: "PDF to PowerPoint", description: "Turn every PDF page into a presentation slide.", icon: Presentation, accept: "application/pdf,.pdf", button: "Select PDF files", drop: "or drop PDFs here", multiple: true, action: "Convert to PowerPoint", output: "PPTX", note: "Each page becomes a high-quality, layout-preserving slide image." },
  "pdf-to-excel": { title: "PDF to Excel", description: "Extract readable PDF text into an Excel workbook.", icon: Table2, accept: "application/pdf,.pdf", button: "Select PDF files", drop: "or drop PDFs here", multiple: true, action: "Convert to Excel", output: "XLSX", note: "Text rows are extracted per page. Use OCR first for scanned tables." },
  "pdf-to-pdfa": { title: "PDF to PDF/A", description: "Normalize PDFs for stable long-term document storage.", icon: Archive, accept: "application/pdf,.pdf", button: "Select PDF files", drop: "or drop PDFs here", multiple: true, action: "Create archival PDF", output: "PDF", note: "Creates a normalized archival PDF. Formal PDF/A certification requires a dedicated validator." },
};

export function isConversionSlug(value: string): value is ConversionSlug { return value in configs; }

type ConversionToolProps = {
  slug: ConversionSlug;
  children?: ReactNode;
  uploadTitle?: string;
  uploadDescription?: string;
  uploadHeadingLevel?: "h1" | "h2";
};

export default function ConversionTool({ slug, children, uploadTitle, uploadDescription, uploadHeadingLevel }: ConversionToolProps) {
  const config = configs[slug]; const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]); const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false); const [progress, setProgress] = useState(0); const [error, setError] = useState("");
  const [quality, setQuality] = useState(88); const [orientation, setOrientation] = useState<"auto" | "portrait" | "landscape">("auto");
  const isImageOutput = slug === "pdf-to-jpg"; const isImageInput = slug === "jpg-to-pdf";
  const totalSize = useMemo(() => files.reduce((sum, file) => sum + file.size, 0), [files]);

  function add(selected: FileList) {
    // FileList is live and becomes empty as soon as the file input is reset.
    // Snapshot it before scheduling React's asynchronous state update.
    const additions = Array.from(selected);
    if (!additions.length) return;
    clearResults();
    setFiles((current) => config.multiple ? [...current, ...additions] : [additions[0]]);
  }
  function clearResults() { results.forEach((result) => URL.revokeObjectURL(result.url)); setResults([]); setError(""); }
  function reset() { clearResults(); setFiles([]); setProgress(0); }
  async function convert() {
    if (!files.length || busy) return; clearResults(); setBusy(true); setProgress(4);
    try {
      const made: Omit<Result, "url">[] = [];
      if (slug === "jpg-to-pdf") { made.push(await imagesToPdf(files, orientation)); setProgress(100); }
      else for (let index = 0; index < files.length; index += 1) { const outputs = await convertFile(slug, files[index], { quality: quality / 100, orientation }); made.push(...outputs); setProgress(Math.round(((index + 1) / files.length) * 100)); }
      setResults(made.map((item) => ({ ...item, url: URL.createObjectURL(item.blob) })));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "This file could not be converted."); }
    finally { setBusy(false); }
  }

  if (!files.length) return <><PdfToolUpload title={uploadTitle || config.title} description={uploadDescription || config.description} icon={config.icon} inputRef={inputRef} onFiles={add} accept={config.accept} multiple={config.multiple} buttonLabel={config.button} dropLabel={config.drop} headingLevel={uploadHeadingLevel || (children ? "h2" : "h1")} />{children}</>;
  const Icon = config.icon;
  return <div className="conversion-page">
    <input ref={inputRef} hidden type="file" accept={config.accept} multiple={config.multiple} onChange={(event) => { if (event.target.files?.length) add(event.target.files); event.target.value = ""; }} />
    <div className="conversion-topline"><Link href="/pdf-tools"><ArrowLeft size={17} /> PDF Tools</Link><span><ShieldCheck size={16} /> Files stay in your browser</span></div>
    <div className="conversion-layout">
      <main className="conversion-main">
        <header><div><span><Icon size={24} /></span><div><small>RepetiGo PDF Tools</small><h2>{config.title}</h2><p>{files.length} file{files.length > 1 ? "s" : ""} · {formatBytes(totalSize)}</p></div></div><button type="button" onClick={() => inputRef.current?.click()}><Plus size={17} /> Add files</button></header>
        {!results.length ? <section className="conversion-file-area">
          <div className="conversion-files">{files.map((file, index) => <article key={`${file.name}-${file.lastModified}-${index}`}><div className="conversion-file-icon"><Icon size={26} /></div><div><strong>{file.name}</strong><small>{formatBytes(file.size)} · Ready to convert</small></div><button type="button" onClick={() => { clearResults(); setFiles((current) => current.filter((_, i) => i !== index)); }} aria-label={`Remove ${file.name}`}><Trash2 size={17} /></button></article>)}</div>
          <button className="conversion-drop-more" type="button" onClick={() => inputRef.current?.click()}><Upload size={23} /><strong>Add more files</strong><small>Choose more compatible files</small></button>
        </section> : <ConversionResults config={config} results={results} onDownloadAll={() => downloadAll(results, `${slug}-repetigo.zip`)} />}
        {error ? <p className="conversion-error">{error}</p> : null}
        {results.length ? <RelatedToolSuggestions context={`${slug}-result`} /> : null}
      </main>
      <aside className="conversion-sidebar">
        <div className="conversion-side-title"><span><Icon size={20} /></span><div><small>RepetiGo converter</small><h2>{config.title}</h2></div></div>
        {(isImageInput || isImageOutput) ? <label className="conversion-control"><span>Image quality <strong>{quality}%</strong></span><input type="range" min="55" max="100" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label> : null}
        {isImageInput ? <div className="conversion-control"><span>Page orientation</span><div className="conversion-segmented">{(["auto", "portrait", "landscape"] as const).map((value) => <button className={orientation === value ? "active" : ""} type="button" key={value} onClick={() => setOrientation(value)}>{capitalize(value)}</button>)}</div></div> : null}
        <div className="conversion-note"><Check size={18} /><div><strong>{results.length ? "Conversion complete" : "Ready to convert"}</strong><p>{config.note}</p></div></div>
        {busy ? <div className="conversion-progress"><span><i style={{ width: `${progress}%` }} /></span><strong><LoaderCircle size={16} /> Converting… {progress}%</strong></div> : null}
        {!results.length ? <button className="conversion-primary" type="button" disabled={busy} onClick={convert}>{busy ? <LoaderCircle className="spin" size={20} /> : <RotateCw size={20} />} {config.action} <ArrowRight size={18} /></button> : <><button className="conversion-primary" type="button" onClick={() => downloadAll(results, `${slug}-repetigo.zip`)}><Download size={20} /> {results.length === 1 ? `Download ${config.output}` : "Download ZIP"}</button><button className="conversion-reset" type="button" onClick={() => { clearResults(); setProgress(0); }}>Change settings</button></>}
        <button className="conversion-reset" type="button" onClick={reset}>Start over</button>
      </aside>
    </div>
    {results.length ? <ToolPromotionRail context={`${slug}-conversion`} /> : null}
    {children}
  </div>;
}

function ConversionResults({ config, results, onDownloadAll }: { config: Config; results: Result[]; onDownloadAll: () => void }) {
  return <section className="conversion-results"><div className="conversion-complete"><span><Check size={28} /></span><div><h2>Your {config.output} files are ready</h2><p>Converted privately in your browser.</p></div>{results.length > 1 ? <button type="button" onClick={onDownloadAll}><Download size={17} /> Download all</button> : null}</div><div className="conversion-result-grid">{results.map((result) => <article key={result.name}>{result.preview ? <img src={result.preview} alt="Converted page preview" /> : <div className="conversion-output-icon"><config.icon size={31} /></div>}<div><strong>{result.name}</strong><small>{result.detail} · {formatBytes(result.blob.size)}</small></div><a href={result.url} download={result.name}><Download size={17} /> Download</a></article>)}</div></section>;
}

async function convertFile(slug: ConversionSlug, file: File, options: { quality: number; orientation: "auto" | "portrait" | "landscape" }): Promise<Omit<Result, "url">[]> {
  if (slug === "jpg-to-pdf") return [await imagesToPdf([file], options.orientation)];
  if (slug === "pdf-to-jpg") return pdfToJpg(file, options.quality);
  if (slug === "word-to-pdf") return [await textSourceToPdf(file, await wordText(file))];
  if (slug === "powerpoint-to-pdf") return [await textSourceToPdf(file, await powerpointText(file), true)];
  if (slug === "excel-to-pdf") return [await textSourceToPdf(file, await excelText(file))];
  if (slug === "html-to-pdf") return [await textSourceToPdf(file, htmlText(await file.text()))];
  if (slug === "markdown-to-pdf") return [await textSourceToPdf(file, await file.text())];
  if (slug === "pdf-to-word") return [await pdfToWord(file)];
  if (slug === "pdf-to-powerpoint") return [await pdfToPowerPoint(file)];
  if (slug === "pdf-to-excel") return [await pdfToExcel(file)];
  return [await pdfToArchive(file)];
}

async function imagesToPdf(files: File[], orientation: "auto" | "portrait" | "landscape") {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  for (const file of files) { const bytes = new Uint8Array(await file.arrayBuffer()); const image = file.type === "image/png" || file.name.toLowerCase().endsWith(".png") ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes); const naturalLandscape = image.width > image.height; const landscape = orientation === "landscape" || (orientation === "auto" && naturalLandscape); const size: [number, number] = landscape ? [841.89, 595.28] : [595.28, 841.89]; const page = pdf.addPage(size); const margin = 28; const scale = Math.min((size[0] - margin * 2) / image.width, (size[1] - margin * 2) / image.height); const width = image.width * scale; const height = image.height * scale; page.drawImage(image, { x: (size[0] - width) / 2, y: (size[1] - height) / 2, width, height }); }
  const output = await pdf.save(); return makeResult(`${baseName(files[0].name)}${files.length > 1 ? "-combined" : ""}.pdf`, new Blob([output], { type: "application/pdf" }), `${files.length} PDF page${files.length > 1 ? "s" : ""}`);
}

async function pdfToJpg(file: File, quality: number) {
  const pdf = await loadPdf(file); const outputs: Omit<Result, "url">[] = [];
  for (let number = 1; number <= pdf.numPages; number += 1) { const page = await pdf.getPage(number); const viewport = page.getViewport({ scale: 1.65 }); const canvas = document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("Image renderer is unavailable."); await page.render({ canvas, canvasContext: context, viewport }).promise; const blob = await canvasBlob(canvas, "image/jpeg", quality); const preview = canvas.toDataURL("image/jpeg", .55); outputs.push(makeResult(`${baseName(file.name)}-page-${number}.jpg`, blob, `Page ${number} of ${pdf.numPages}`, preview)); }
  return outputs;
}

async function textSourceToPdf(file: File, content: string, pageBreaks = false) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  if (!content.trim()) throw new Error(`No readable content was found in ${file.name}.`); const pdf = await PDFDocument.create(); const font = await pdf.embedFont(StandardFonts.Helvetica); const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const chunks = pageBreaks ? content.split(/\n\s*--- slide \d+ ---\s*\n/i) : [content];
  for (const chunk of chunks.filter(Boolean)) { let page = pdf.addPage([595.28, 841.89]); let y = 790; page.drawText(file.name, { x: 42, y, size: 15, font: bold, color: rgb(.05, .13, .32) }); y -= 30; for (const paragraph of chunk.split(/\r?\n/)) { const lines = wrapText(paragraph || " ", 88); for (const line of lines) { if (y < 48) { page = pdf.addPage([595.28, 841.89]); y = 793; } page.drawText(safeLatin(line), { x: 42, y, size: 10, font, color: rgb(.13, .18, .3) }); y -= 14; } y -= 4; } }
  const bytes = await pdf.save(); return makeResult(`${baseName(file.name)}.pdf`, new Blob([bytes], { type: "application/pdf" }), `${pdf.getPageCount()} PDF page${pdf.getPageCount() > 1 ? "s" : ""}`);
}

async function wordText(file: File) { const mammoth = await import("mammoth"); const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() }); return result.value; }
async function excelText(file: File) { const XLSX = await import("xlsx"); const book = XLSX.read(await file.arrayBuffer()); return book.SheetNames.map((name) => `SHEET: ${name}\n${XLSX.utils.sheet_to_csv(book.Sheets[name])}`).join("\n\n"); }
async function powerpointText(file: File) { const { default: JSZip } = await import("jszip"); const zip = await JSZip.loadAsync(await file.arrayBuffer()); const names = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort(naturalSort); const slides: string[] = []; for (let i = 0; i < names.length; i += 1) { const xml = await zip.file(names[i])!.async("text"); const texts = Array.from(new DOMParser().parseFromString(xml, "text/xml").getElementsByTagName("a:t")).map((node) => node.textContent || ""); slides.push(`--- slide ${i + 1} ---\n${texts.join("\n")}`); } return slides.join("\n"); }
function htmlText(source: string) { const doc = new DOMParser().parseFromString(source, "text/html"); doc.querySelectorAll("script,style,noscript").forEach((node) => node.remove()); return doc.body.innerText || doc.body.textContent || ""; }

async function pdfToWord(file: File) { const { Document, Packer, Paragraph, HeadingLevel, PageBreak } = await import("docx"); const pages = await extractPdfPages(file); const children = pages.flatMap((text, index) => [new Paragraph({ text: `${file.name} · Page ${index + 1}`, heading: HeadingLevel.HEADING_2 }), ...text.split(/\n/).filter(Boolean).map((line) => new Paragraph(line)), ...(index < pages.length - 1 ? [new Paragraph({ children: [new PageBreak()] })] : [])]); const document = new Document({ sections: [{ children }] }); const blob = await Packer.toBlob(document); return makeResult(`${baseName(file.name)}.docx`, blob, `${pages.length} page${pages.length > 1 ? "s" : ""} extracted`); }
async function pdfToPowerPoint(file: File) { const pptxModule = await import("pptxgenjs"); const PptxGenJS = pptxModule.default; const pptx = new PptxGenJS(); pptx.layout = "LAYOUT_WIDE"; pptx.author = "RepetiGo"; const pdf = await loadPdf(file); for (let number = 1; number <= pdf.numPages; number += 1) { const page = await pdf.getPage(number); const viewport = page.getViewport({ scale: 1.45 }); const canvas = document.createElement("canvas"); canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height); const context = canvas.getContext("2d"); if (!context) throw new Error("Slide renderer unavailable."); await page.render({ canvas, canvasContext: context, viewport }).promise; const slide = pptx.addSlide(); slide.background = { color: "F4F7FC" }; slide.addImage({ data: canvas.toDataURL("image/jpeg", .9), x: .35, y: .2, w: 12.63, h: 7.1, sizing: "contain" as never }); } const blob = await pptx.write({ outputType: "blob" }) as Blob; return makeResult(`${baseName(file.name)}.pptx`, blob, `${pdf.numPages} slide${pdf.numPages > 1 ? "s" : ""}`); }
async function pdfToExcel(file: File) { const XLSX = await import("xlsx"); const pages = await extractPdfPages(file); const book = XLSX.utils.book_new(); pages.forEach((text, index) => { const rows = text.split(/\n/).filter(Boolean).map((line) => line.split(/\s{2,}|\t/)); XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows.length ? rows : [[""]]), `Page ${index + 1}`); }); const bytes = XLSX.write(book, { type: "array", bookType: "xlsx" }); return makeResult(`${baseName(file.name)}.xlsx`, new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${pages.length} worksheet${pages.length > 1 ? "s" : ""}`); }
async function pdfToArchive(file: File) { const { PDFDocument } = await import("pdf-lib"); const source = await PDFDocument.load(await file.arrayBuffer()); const pdf = await PDFDocument.create(); const pages = await pdf.copyPages(source, source.getPageIndices()); pages.forEach((page) => pdf.addPage(page)); pdf.setTitle(source.getTitle() || baseName(file.name)); pdf.setAuthor(source.getAuthor() || "RepetiGo archival conversion"); pdf.setProducer("RepetiGo browser PDF tools"); pdf.setCreator("RepetiGo"); pdf.setCreationDate(source.getCreationDate() || new Date()); pdf.setModificationDate(new Date()); const bytes = await pdf.save({ useObjectStreams: false, addDefaultPage: false }); return makeResult(`${baseName(file.name)}-archival.pdf`, new Blob([bytes], { type: "application/pdf" }), `${pages.length} normalized page${pages.length > 1 ? "s" : ""}`); }

async function extractPdfPages(file: File) { const pdf = await loadPdf(file); const pages: string[] = []; for (let number = 1; number <= pdf.numPages; number += 1) { const content = await (await pdf.getPage(number)).getTextContent(); const items = content.items as Array<{ str?: string; transform?: number[] }>; let previousY: number | undefined; let text = ""; for (const item of items) { const y = item.transform?.[5]; if (previousY !== undefined && y !== undefined && Math.abs(y - previousY) > 3) text += "\n"; else if (text && !text.endsWith("\n")) text += " "; text += item.str || ""; previousY = y; } pages.push(text); } return pages; }
async function loadPdf(file: File) { const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs"); pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString(); return pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise; }
async function downloadAll(results: Result[], name: string) { if (results.length === 1) { triggerDownload(results[0].url, results[0].name); return; } const { default: JSZip } = await import("jszip"); const zip = new JSZip(); results.forEach((result) => zip.file(result.name, result.blob)); const blob = await zip.generateAsync({ type: "blob" }); const url = URL.createObjectURL(blob); triggerDownload(url, name); setTimeout(() => URL.revokeObjectURL(url), 1500); }
function triggerDownload(url: string, name: string) { const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); }
function makeResult(name: string, blob: Blob, detail: string, preview?: string): Omit<Result, "url"> { return { name, blob, detail, preview }; }
function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number) { return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create the image.")), type, quality)); }
function wrapText(value: string, max: number) { const words = value.replace(/\s+/g, " ").trim().split(" "); const lines: string[] = []; let line = ""; words.forEach((word) => { if (`${line} ${word}`.trim().length > max && line) { lines.push(line); line = word; } else line = `${line} ${word}`.trim(); }); if (line || !lines.length) lines.push(line); return lines; }
function safeLatin(value: string) { return value.replace(/[^\x20-\x7E]/g, "?"); }
function naturalSort(a: string, b: string) { return a.localeCompare(b, undefined, { numeric: true }); }
function baseName(name: string) { return name.replace(/\.[^.]+$/, ""); }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
