"use client";

import { useParams } from "next/navigation";
import { useRef, useState, type MutableRefObject } from "react";
import Link from "next/link";
import { Archive, ArrowLeft, ArrowRight, Bot, Check, Crop, FileImage, FileLock2, FileOutput, FilePenLine, FileScan, FileText, Files, Languages, ListOrdered, LockOpen, Plus, Presentation, RotateCw, Scissors, Shield, Sparkles, Stamp, Table2, TextSelect, Trash2, type LucideIcon } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../PdfToolUpload";
import ConversionTool, { isConversionSlug } from "../ConversionTool";
import PdfEditTool, { isPdfEditSlug } from "../PdfEditTool";
import PdfSecurityTool, { isSecuritySlug } from "../PdfSecurityTool";
import PdfToMarkdownTool from "../PdfToMarkdownTool";
import InPlacePdfEditor from "../InPlacePdfEditor";

type ToolConfig = { title: string; description: string; icon: LucideIcon; multiple?: boolean; required?: number };

const pdfInputTools: Record<string, ToolConfig> = {
  "split-pdf": { title: "Split PDF", description: "Separate PDF pages or extract selected page ranges into new files.", icon: Scissors },
  "remove-pages": { title: "Remove PDF pages", description: "Select a PDF and remove pages you no longer need.", icon: FileOutput },
  "extract-pages": { title: "Extract PDF pages", description: "Choose pages from your PDF and save them as a new document.", icon: FileOutput },
  "organize-pdf": { title: "Organize PDF", description: "Reorder, rotate, add or remove pages from your PDF.", icon: ListOrdered },
  "repair-pdf": { title: "Repair PDF", description: "Upload damaged or unreadable PDFs and recover usable content.", icon: Archive },
  "ocr-pdf": { title: "OCR PDF", description: "Turn scanned PDF pages into searchable, selectable documents.", icon: TextSelect },
  "pdf-to-jpg": { title: "PDF to JPG", description: "Convert every PDF page into a high-quality JPG image.", icon: FileImage },
  "pdf-to-word": { title: "PDF to Word", description: "Convert PDF documents into editable Word files.", icon: FileText },
  "pdf-to-powerpoint": { title: "PDF to PowerPoint", description: "Turn PDF pages into editable presentation slides.", icon: Presentation },
  "pdf-to-excel": { title: "PDF to Excel", description: "Extract PDF tables and data into Excel spreadsheets.", icon: Table2 },
  "pdf-to-pdfa": { title: "PDF to PDF/A", description: "Convert PDFs into a long-term archival PDF/A format.", icon: FileOutput },
  "rotate-pdf": { title: "Rotate PDF", description: "Rotate selected pages or the complete PDF document.", icon: RotateCw },
  "page-numbers": { title: "Add page numbers", description: "Upload PDFs and add customizable page numbers.", icon: ListOrdered },
  "watermark-pdf": { title: "Add watermark", description: "Stamp text or an image watermark over PDF pages.", icon: Stamp },
  "crop-pdf": { title: "Crop PDF", description: "Trim unwanted margins and crop selected PDF pages.", icon: Crop },
  "edit-pdf": { title: "Edit PDF", description: "Add text, drawings, images and annotations to PDF pages.", icon: FilePenLine },
  "pdf-forms": { title: "PDF Forms", description: "Upload a PDF to fill, detect or create form fields.", icon: FileText },
  "unlock-pdf": { title: "Unlock PDF", description: "Remove PDF password protection when you have permission.", icon: LockOpen, multiple: false },
  "protect-pdf": { title: "Protect PDF", description: "Secure PDF documents with password encryption.", icon: FileLock2 },
  "sign-pdf": { title: "Sign PDF", description: "Upload documents to add your electronic signature.", icon: FilePenLine },
  "redact-pdf": { title: "Redact PDF", description: "Permanently hide sensitive content from PDF pages.", icon: Shield },
  "compare-pdf": { title: "Compare PDF", description: "Upload two PDFs to identify differences between them.", icon: Files, required: 2 },
  "ai-summarizer": { title: "AI PDF Summarizer", description: "Upload a PDF and create a clear, concise summary.", icon: Sparkles, multiple: false },
  "translate-pdf": { title: "Translate PDF", description: "Translate a PDF while preserving its document structure.", icon: Languages, multiple: false },
  "pdf-to-markdown": { title: "PDF to Markdown", description: "Convert PDF content into clean Markdown text.", icon: Bot },
};

const sourceFileTools: Record<string, ToolConfig & { accept: string; button: string; drop: string }> = {
  "jpg-to-pdf": { title: "JPG to PDF", description: "Combine JPG and PNG images into a PDF document.", icon: FileImage, accept: "image/jpeg,image/png,.jpg,.jpeg,.png", button: "Select images", drop: "or drop JPG and PNG images here" },
  "word-to-pdf": { title: "Word to PDF", description: "Convert Word documents into shareable PDF files.", icon: FileText, accept: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document", button: "Select Word files", drop: "or drop Word documents here" },
  "powerpoint-to-pdf": { title: "PowerPoint to PDF", description: "Convert PowerPoint presentations into PDF documents.", icon: Presentation, accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation", button: "Select presentations", drop: "or drop PowerPoint files here" },
  "excel-to-pdf": { title: "Excel to PDF", description: "Convert Excel spreadsheets into clear PDF documents.", icon: Table2, accept: ".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", button: "Select spreadsheets", drop: "or drop Excel files here" },
  "html-to-pdf": { title: "HTML to PDF", description: "Convert saved HTML pages into PDF documents.", icon: FileText, accept: ".html,.htm,text/html", button: "Select HTML files", drop: "or drop HTML files here" },
  "scan-to-pdf": { title: "Scan to PDF", description: "Select captured document images and combine them into a PDF.", icon: FileScan, accept: "image/*", button: "Select scans", drop: "or drop scanned images here" },
};

export default function PdfToolPage() {
  const params = useParams<{ tool: string }>();
  const slug = String(params.tool || "");
  const pdfConfig = pdfInputTools[slug];
  const sourceConfig = sourceFileTools[slug];
  const config = pdfConfig || sourceConfig;
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  if (isConversionSlug(slug)) return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><ConversionTool slug={slug} /></div></DashboardShell>;
  if (slug === "edit-pdf") return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><InPlacePdfEditor /></div></DashboardShell>;
  if (isPdfEditSlug(slug)) return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><PdfEditTool slug={slug} /></div></DashboardShell>;
  if (isSecuritySlug(slug)) return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><PdfSecurityTool slug={slug} /></div></DashboardShell>;
  if (slug === "pdf-to-markdown") return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><PdfToMarkdownTool /></div></DashboardShell>;

  if (!config) return <DashboardShell activePath="/pdf-tools"><UnknownTool slug={slug} /></DashboardShell>;
  const isPdfInput = Boolean(pdfConfig);
  const accept = sourceConfig?.accept || "application/pdf,.pdf";
  const buttonLabel = sourceConfig?.button || (config.multiple === false ? "Select PDF file" : "Select PDF files");
  const dropLabel = sourceConfig?.drop || "or drop PDFs here";

  function addFiles(selected: FileList) {
    const additions = Array.from(selected);
    setFiles((current) => config.multiple === false ? additions.slice(0, 1) : [...current, ...additions]);
  }

  return <DashboardShell activePath="/pdf-tools">
    <div className="dashboard generic-pdf-tool-page">
      {!files.length ? <PdfToolUpload title={config.title} description={config.description} icon={config.icon} inputRef={inputRef} onFiles={addFiles} accept={accept} multiple={config.multiple !== false} buttonLabel={buttonLabel} dropLabel={dropLabel} /> : <GenericToolWorkspace config={config} files={files} inputRef={inputRef} accept={accept} onAdd={addFiles} onRemove={(index) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} onReset={() => setFiles([])} isPdfInput={isPdfInput} />}
    </div>
  </DashboardShell>;
}

function GenericToolWorkspace({ config, files, inputRef, accept, onAdd, onRemove, onReset, isPdfInput }: { config: ToolConfig; files: File[]; inputRef: MutableRefObject<HTMLInputElement | null>; accept: string; onAdd: (files: FileList) => void; onRemove: (index: number) => void; onReset: () => void; isPdfInput: boolean }) {
  const Icon = config.icon; const ready = files.length >= (config.required || 1);
  return <>
    <input ref={inputRef} hidden type="file" accept={accept} multiple={config.multiple !== false} onChange={(event) => { if (event.target.files?.length) onAdd(event.target.files); event.target.value = ""; }} />
    <div className="generic-tool-head"><Link href="/pdf-tools"><ArrowLeft size={17} /> PDF Tools</Link><span><Icon size={18} /> {config.title}</span></div>
    <section className="generic-tool-workspace">
      <header><div><span><Icon size={24} /></span><div><h1>{config.title}</h1><p>{config.description}</p></div></div><button type="button" onClick={() => inputRef.current?.click()}><Plus size={18} /> Add files</button></header>
      <div className="generic-selected-files">{files.map((file, index) => <article key={`${file.name}-${file.lastModified}-${index}`}><span>{isPdfInput ? "PDF" : file.name.split(".").pop()?.toUpperCase()}</span><div><strong>{file.name}</strong><small>{formatBytes(file.size)}</small></div><button type="button" onClick={() => onRemove(index)} aria-label={`Remove ${file.name}`}><Trash2 size={17} /></button></article>)}</div>
      <div className="generic-tool-status"><span><Check size={18} /></span><div><strong>{ready ? "Files ready" : `Select ${config.required} files`}</strong><p>{ready ? `${files.length} file${files.length > 1 ? "s" : ""} selected. The ${config.title} processing workspace will use these files.` : `${config.title} requires ${config.required} PDF files.`}</p></div></div>
      <footer><button type="button" onClick={onReset}>Start over</button><button className="primary" type="button" disabled={!ready}>{config.title} <ArrowRight size={18} /></button></footer>
    </section>
  </>;
}

function UnknownTool({ slug }: { slug: string }) { return <section className="pdf-tool-placeholder"><span><FileText size={31} /></span><h1>{slug.split("-").join(" ")}</h1><p>This PDF tool route is being prepared.</p><div><Link className="btn btn-primary" href="/pdf-tools">All PDF Tools</Link></div></section>; }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
