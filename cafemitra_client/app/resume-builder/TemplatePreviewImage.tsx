"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Reference width the document is captured at (desktop layout, no mobile
// reflow) - the resulting image then just scales like a picture on any
// screen, so multi-column templates never break on mobile.
const CAPTURE_WIDTH = 680;

// Once the customer has typed their own details, wait for typing to settle
// before spending a capture on it, instead of re-rendering on every
// keystroke while this card happens to be visible.
const CAPTURE_DEBOUNCE_MS = 400;

// Keyed by tool + template + a snapshot of the content shown, so switching
// between sample data and the customer's own filled-in details (or editing
// that data further) each get their own cached capture, and different tools
// reusing the same template ids (e.g. "classic") never collide.
const imageCache = new Map<string, string>();

// Generic template-card preview: captures whatever `renderPreview` renders
// for the given data into a raster image, so any document builder (resume,
// biodata, ...) gets the same "true layout at every screen size" preview
// without duplicating the html2canvas plumbing.
export function TemplatePreviewImage<TId extends string, TData extends { template: TId }>({
  template,
  data,
  sampleData,
  renderPreview,
  cacheNamespace,
}: {
  template: TId;
  data?: TData;
  sampleData: TData;
  renderPreview: (data: TData) => ReactNode;
  cacheNamespace: string;
}) {
  const previewData: TData = { ...(data ?? sampleData), template };
  const cacheKey = `${cacheNamespace}::${template}::${JSON.stringify(previewData)}`;
  const captureRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(() => imageCache.get(cacheKey) ?? null);

  useEffect(() => {
    const cached = imageCache.get(cacheKey);
    if (cached) {
      setSrc(cached);
      return;
    }
    setSrc(null);
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const { default: html2canvas } = await import("html2canvas");
      const node = captureRef.current;
      if (!node || cancelled) return;
      const canvas = await html2canvas(node, { width: CAPTURE_WIDTH, windowWidth: CAPTURE_WIDTH, scale: 2, backgroundColor: "#ffffff" });
      if (cancelled) return;
      const dataUrl = canvas.toDataURL("image/png");
      imageCache.set(cacheKey, dataUrl);
      setSrc(dataUrl);
    }, CAPTURE_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cacheKey]);

  return (
    <div className="resbuild-tpl-preview-image">
      {src ? <img src={src} alt={`${template} template preview`} /> : <div className="resbuild-tpl-preview-loading">Loading preview...</div>}
      <div className="resbuild-tpl-preview-capture" ref={captureRef} style={{ width: CAPTURE_WIDTH }}>
        {renderPreview(previewData)}
      </div>
    </div>
  );
}
