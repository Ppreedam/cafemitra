"use client";

import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";

// Generic "open a PDF preview in a new tab" button, shared by every document
// builder's template gallery. `buildPdf` supplies the actual PDF bytes.
export default function TemplatePreviewButton({ label, buildPdf }: { label: string; buildPdf: () => Promise<Blob> }) {
  const [busy, setBusy] = useState(false);

  async function handlePreview() {
    if (busy) return;
    setBusy(true);
    // Open the tab synchronously, inside the click's user-gesture window - opening it after
    // the PDF finishes building (an async gap) gets treated as a popup and silently blocked.
    const previewTab = window.open("", "_blank");
    try {
      const blob = await buildPdf();
      const url = URL.createObjectURL(blob);
      if (previewTab) previewTab.location.href = url;
    } catch {
      previewTab?.close();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="resbuild-gallery-preview-btn"
      onClick={handlePreview}
      disabled={busy}
      aria-label={`Preview ${label} template as PDF`}
      title={`Preview ${label} template as PDF`}
    >
      {busy ? <Loader2 size={15} className="resbuild-spin" /> : <Eye size={15} />}
    </button>
  );
}
