"use client";

import { ChangeEvent, DragEvent, MutableRefObject, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Upload, type LucideIcon } from "lucide-react";

type PdfToolUploadProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  inputRef: MutableRefObject<HTMLInputElement | null>;
  onFiles: (files: FileList) => void;
  headingLevel?: "h1" | "h2";
  buttonLabel?: string;
  dropLabel?: string;
  accept?: string;
  multiple?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function PdfToolUpload({ title, description, icon: Icon, inputRef, onFiles, headingLevel = "h1", buttonLabel = "Select PDF files", dropLabel = "or drop PDFs here", accept = "application/pdf,.pdf", multiple = true, backHref = "/pdf-tools", backLabel = "PDF Tools" }: PdfToolUploadProps) {
  const [dragging, setDragging] = useState(false);
  const Heading = headingLevel;

  function drop(event: DragEvent<HTMLElement>) {
    event.preventDefault(); setDragging(false);
    if (event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
  }

  return <section className={`pdf-upload-welcome ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
    <div className="pdf-upload-topline"><Link href={backHref}><ArrowLeft size={17} /> {backLabel}</Link><span><ShieldCheck size={16} /> Free, private browser processing</span></div>
    <div className="pdf-upload-content">
      <span className="pdf-upload-mark"><Icon size={32} /></span><span className="auto-print-kicker">Free PDF Tool</span>
      <Heading>{title}</Heading><p>{description}</p>
      <button type="button" onClick={() => inputRef.current?.click()}><Upload size={22} /> {buttonLabel}</button><small>{dropLabel}</small>
      <div className="pdf-upload-benefits"><span><Check size={14} /> No login</span><span><Check size={14} /> No upload to server</span><span><Check size={14} /> Completely free</span></div>
    </div>
    <input ref={inputRef} hidden type="file" accept={accept} multiple={multiple} onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files?.length) onFiles(event.target.files); event.target.value = ""; }} />
  </section>;
}
