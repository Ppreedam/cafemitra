"use client";

import type React from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "../DashboardShell";
import { PdfToolUpload } from "../pdf-tools/PdfToolUpload";
import { DOC_LAYOUT, DOC_TYPES, ocrStorageKey, type DocType } from "./docTypes";

export default function IdCardUploadClient({ docType, children }: { docType: DocType; children?: React.ReactNode }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const layout = DOC_LAYOUT[docType];
  const meta = DOC_TYPES.find((doc) => doc.key === docType);

  function handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;
    sessionStorage.setItem(ocrStorageKey(docType), JSON.stringify({ fileName: file.name }));
    router.push(`/id-card-maker/${docType}/design`);
  }

  return (
    <DashboardShell activePath="/id-card-maker">
      <div className="dashboard merge-studio empty">
        {children}
        <PdfToolUpload
          title={`${layout.title} Maker from PDF`}
          description={`Upload the downloaded ${layout.title} PDF - we'll pull out the details and recreate a clean, print-ready card.`}
          icon={meta?.icon || DOC_TYPES[0].icon}
          inputRef={inputRef}
          onFiles={handleFiles}
          headingLevel={children ? "h2" : "h1"}
          buttonLabel={`Select ${layout.title} PDF`}
          dropLabel="or drop the PDF here"
          accept="application/pdf,.pdf"
          multiple={false}
          backHref="/id-card-maker"
          backLabel="ID Card Maker"
        />
      </div>
    </DashboardShell>
  );
}
