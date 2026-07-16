"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { Download, ImageIcon, RotateCcw, Sparkles, Upload, WandSparkles } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";

export default function BackgroundRemoverPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [sourceUrl, resultUrl]);

  useEffect(() => {
    if (!file) return;
    // Start loading the model as soon as a photo is selected instead of
    // waiting for the Remove Background click.
    import("@imgly/background-removal").then(({ preload }) => preload(aiConfig())).catch(() => undefined);
  }, [file]);

  function chooseFile(next?: File) {
    if (!next) return;
    if (!next.type.startsWith("image/")) return setError("Please choose a JPG, PNG or WEBP image.");
    if (next.size > 15 * 1024 * 1024) return setError("Image must be smaller than 15 MB.");
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(next);
    setSourceUrl(URL.createObjectURL(next));
    setResultUrl("");
    setProgress(0);
    setError("");
  }

  async function removeImageBackground() {
    if (!file || processing) return;
    setProcessing(true);
    setError("");
    setProgress(1);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      // Canvas re-encoding applies phone-camera EXIF orientation before the AI
      // reads dimensions, preventing portrait photos from becoming half-cropped.
      const normalizedFile = await normalizeImage(file);
      const rawBlob = await removeBackground(normalizedFile, {
        ...aiConfig(),
        output: { format: "image/png", quality: 1 },
        progress: (_key: string, current: number, total: number) => setProgress(total ? Math.round((current / total) * 100) : 0),
      });
      const blob = await refineEdges(rawBlob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch (reason) {
      console.error(reason);
      setError("Background could not be removed. Check your internet connection and try again.");
    } finally {
      setProcessing(false);
    }
  }

  function reset() {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setSourceUrl(""); setResultUrl(""); setProgress(0); setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]);
  }

  const downloadName = `${file?.name.replace(/\.[^.]+$/, "") || "image"}-no-bg.png`;

  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard bg-remover-page">
        <div className="dashboard-hero pdf-tools-hero">
          <div><span className="auto-print-kicker">AI Image Tool</span><h1>Background Remover</h1><p>Remove any photo background and download a clean transparent PNG.</p></div>
          <span className="status-pill"><Sparkles size={16} /> Private browser processing</span>
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
              <article><div className="bg-preview-title"><span>Background removed</span><small>{resultUrl ? "Transparent PNG" : "Ready to process"}</small></div><div className="bg-preview-canvas checkerboard">{resultUrl ? <img src={resultUrl} alt="Background removed result" /> : <WandSparkles size={52} />}</div></article>
            </div>
            {processing ? <div className="bg-progress"><div><span>AI is removing the background…</span><strong>{progress}%</strong></div><progress value={progress} max="100" /><small>First use may take longer while the AI model downloads.</small></div> : null}
            {error ? <div className="profile-alert error">{error}</div> : null}
            <div className="bg-actions"><button className="secondary-action" type="button" onClick={reset} disabled={processing}><RotateCcw size={18} /> Start Over</button>{resultUrl ? <a className="bg-download" href={resultUrl} download={downloadName}><Download size={18} /> Download PNG</a> : <button type="button" onClick={removeImageBackground} disabled={processing}><WandSparkles size={18} /> {processing ? "Removing…" : "Remove Background"}</button>}</div>
          </section>
        )}
        {!file && error ? <div className="profile-alert error">{error}</div> : null}
      </div>
    </DashboardShell>
  );
}

async function normalizeImage(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image conversion failed.")), "image/png", 1),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

function aiConfig() {
  const hasWebGpu = typeof navigator !== "undefined" && "gpu" in navigator;
  return {
    model: "isnet" as const,
    device: (hasWebGpu ? "gpu" : "cpu") as "gpu" | "cpu",
    proxyToWorker: !hasWebGpu,
  };
}

async function refineEdges(blob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return blob;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    const sourceAlpha = new Uint8ClampedArray(canvas.width * canvas.height);
    for (let index = 0; index < sourceAlpha.length; index += 1) sourceAlpha[index] = pixels.data[index * 4 + 3];

    // A small feather plus smoothstep removes blocky mask pixels and colored
    // halos without shrinking solid hair, face or clothing regions.
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const index = y * canvas.width + x;
        const alpha = sourceAlpha[index];
        if (alpha === 0 || alpha === 255) continue;
        let sum = 0; let count = 0;
        for (let oy = -1; oy <= 1; oy += 1) for (let ox = -1; ox <= 1; ox += 1) {
          const nx = x + ox; const ny = y + oy;
          if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) { sum += sourceAlpha[ny * canvas.width + nx]; count += 1; }
        }
        const normalized = Math.max(0, Math.min(1, ((sum / count) - 18) / 219));
        pixels.data[index * 4 + 3] = Math.round((normalized * normalized * (3 - 2 * normalized)) * 255);
      }
    }
    context.putImageData(pixels, 0, 0);
    return await new Promise<Blob>((resolve) => canvas.toBlob((result) => resolve(result || blob), "image/png", 1));
  } finally {
    URL.revokeObjectURL(url);
  }
}
