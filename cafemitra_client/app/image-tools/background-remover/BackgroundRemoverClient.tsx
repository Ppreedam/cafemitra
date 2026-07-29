"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Download, ImageIcon, RotateCcw, Sparkles, Upload, WandSparkles } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";
import { apiUrl } from "../../../lib/api";

const BG_COLOR_SWATCHES = [
  { label: "White", value: "#ffffff" },
  { label: "Light Grey", value: "#e5e7eb" },
  { label: "Sky Blue", value: "#4a90d9" },
  { label: "Red", value: "#b91c1c" },
  { label: "Black", value: "#000000" },
];

export default function BackgroundRemoverClient({ children }: { children?: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawResultUrl, setRawResultUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [enhanceEdges, setEnhanceEdges] = useState(true);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState("#2563eb");

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (rawResultUrl) URL.revokeObjectURL(rawResultUrl);
  }, [sourceUrl, rawResultUrl]);

  // Recolor the transparent result on a <canvas> whenever the chosen
  // background colour changes - instant, no server round-trip needed.
  useEffect(() => {
    if (!rawResultUrl) { setPreviewUrl(""); return; }
    if (!bgColor) { setPreviewUrl(rawResultUrl); return; }

    let cancelled = false;
    let composedUrl = "";
    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (cancelled || !blob) return;
        composedUrl = URL.createObjectURL(blob);
        setPreviewUrl(composedUrl);
      }, "image/png");
    };
    img.src = rawResultUrl;

    return () => {
      cancelled = true;
      if (composedUrl) URL.revokeObjectURL(composedUrl);
    };
  }, [rawResultUrl, bgColor]);

  function chooseFile(next?: File) {
    if (!next) return;
    if (!next.type.startsWith("image/")) return setError("Please choose a JPG, PNG or WEBP image.");
    if (next.size > 15 * 1024 * 1024) return setError("Image must be smaller than 15 MB.");
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (rawResultUrl) URL.revokeObjectURL(rawResultUrl);
    setFile(next);
    setSourceUrl(URL.createObjectURL(next));
    setRawResultUrl("");
    setBgColor(null);
    setProgress(0);
    setError("");
  }

  async function removeImageBackground() {
    if (!file || processing) return;
    setProcessing(true);
    setError("");
    setProgress(1);
    try {
      const body = new FormData();
      body.append("image", file);
      body.append("enhance", String(enhanceEdges));
      const response = await fetch(apiUrl("/api/tools/remove-image-background/"), {
        method: "POST",
        body,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Background could not be removed.");
      }
      const blob = await response.blob();
      if (rawResultUrl) URL.revokeObjectURL(rawResultUrl);
      setRawResultUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch (reason) {
      console.error(reason);
      setError(reason instanceof Error ? reason.message : "Background could not be removed. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  function reset() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (rawResultUrl) URL.revokeObjectURL(rawResultUrl);
    setFile(null); setSourceUrl(""); setRawResultUrl(""); setPreviewUrl(""); setBgColor(null); setProgress(0); setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]);
  }

  const resultUrl = previewUrl;
  const downloadName = `${file?.name.replace(/\.[^.]+$/, "") || "image"}-${bgColor ? "bg" : "no-bg"}.png`;

  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard bg-remover-page">
        <div className="dashboard-hero pdf-tools-hero">
          <div><span className="auto-print-kicker">AI Image Tool</span><h2>Background Remover</h2><p>Remove any photo background and download a clean transparent PNG.</p></div>
          <span className="status-pill"><Sparkles size={16} /> Server processing</span>
        </div>

        {!file ? (
          <section className={`bg-upload-card ${dragging ? "dragging" : ""}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
            <span className="bg-upload-icon"><Upload size={34} /></span>
            <h2>Upload an image</h2><p>Drag and drop your image here, or choose a file from your device.</p>
            <button type="button" onClick={() => inputRef.current?.click()}><ImageIcon size={19} /> Choose Image</button>
            <small>JPG, PNG or WEBP · Maximum 15 MB</small>
            <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(e: ChangeEvent<HTMLInputElement>) => chooseFile(e.target.files?.[0])} />
          </section>
        ) : (
          <section className="bg-workspace">
            <div className="bg-preview-grid">
              <article><div className="bg-preview-title"><span>Original</span><small>{file.name}</small></div><div className="bg-preview-canvas"><img src={sourceUrl} alt="Original upload" /></div></article>
              <article><div className="bg-preview-title"><span>Background removed</span><small>{resultUrl ? (bgColor ? "Solid background" : "Transparent PNG") : "Ready to process"}</small></div><div className={`bg-preview-canvas ${bgColor ? "" : "checkerboard"}`}>{resultUrl ? <img src={resultUrl} alt="Background removed result" /> : <WandSparkles size={52} />}</div></article>
            </div>
            {!rawResultUrl ? (
              <label className="bg-enhance-toggle">
                <input type="checkbox" checked={enhanceEdges} onChange={(e) => setEnhanceEdges(e.target.checked)} disabled={processing} />
                <span>Enhance edges (remove colour halo around hair/edges)</span>
              </label>
            ) : null}
            {rawResultUrl ? (
              <div className="bg-color-picker">
                <span className="bg-color-picker-label">Background colour</span>
                <div className="bg-color-swatches">
                  <button type="button" className={`bg-color-swatch bg-color-swatch-transparent ${!bgColor ? "active" : ""}`} onClick={() => setBgColor(null)} title="Transparent" aria-label="Transparent background" />
                  {BG_COLOR_SWATCHES.map((swatch) => (
                    <button key={swatch.value} type="button" className={`bg-color-swatch ${bgColor === swatch.value ? "active" : ""}`} style={{ background: swatch.value }} onClick={() => setBgColor(swatch.value)} title={swatch.label} aria-label={swatch.label} />
                  ))}
                  <label className="bg-color-swatch bg-color-swatch-custom" style={{ background: customColor }} title="Custom colour">
                    <input type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setBgColor(e.target.value); }} />
                  </label>
                </div>
              </div>
            ) : null}
            {processing ? <div className="bg-progress"><div><span>Processing image…</span><strong>{progress}%</strong></div><progress value={progress} max="100" /><small>Removing the background on the server{enhanceEdges ? " and cleaning up edges" : ""}…</small></div> : null}
            {error ? <div className="profile-alert error">{error}</div> : null}
            <div className="bg-actions"><button className="secondary-action" type="button" onClick={reset} disabled={processing}><RotateCcw size={18} /> Start Over</button>{resultUrl ? <a className="bg-download" href={resultUrl} download={downloadName}><Download size={18} /> Download PNG</a> : <button type="button" onClick={removeImageBackground} disabled={processing}><WandSparkles size={18} /> {processing ? "Removing…" : "Remove Background"}</button>}</div>
          </section>
        )}
        {!file && error ? <div className="profile-alert error">{error}</div> : null}
        {children}
      </div>
    </DashboardShell>
  );
}

