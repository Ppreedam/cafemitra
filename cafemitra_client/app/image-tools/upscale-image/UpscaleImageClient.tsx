"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Download, ImagePlus, LoaderCircle, Plus, ShieldCheck, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../../pdf-tools/PdfToolUpload";
import { apiUrl } from "../../../lib/api";

type ImageItem = { id: string; file: File; sourceUrl: string; width: number; height: number; result?: { blob: Blob; url: string; width: number; height: number; name: string } };
type OutputFormat = "image/webp" | "image/png" | "image/jpeg";

export default function UpscaleImageClient({ children }: { children?: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ImageItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const [scale, setScale] = useState<2 | 4>(2);
  const [format, setFormat] = useState<OutputFormat>("image/webp");
  const [aiMode, setAiMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const active = items.find((item) => item.id === activeId) || items[0];

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files); const invalid = selected.find((file) => !file.type.startsWith("image/"));
    if (invalid) return setError(`${invalid.name} is not an image file.`); setError("");
    setBusy(true);
    const additions = (await Promise.all(selected.map(async (file) => { const sourceUrl = URL.createObjectURL(file); try { const dimensions = await readDimensions(sourceUrl); const item: ImageItem = { id: crypto.randomUUID(), file, sourceUrl, ...dimensions }; const generated = await upscaleImage(item, 2, "image/webp"); return { ...item, result: { ...generated, url: URL.createObjectURL(generated.blob) } }; } catch { URL.revokeObjectURL(sourceUrl); return null; } }))).filter((item) => item !== null) as ImageItem[];
    setItems((current) => [...current, ...additions]); if (!activeId && additions[0]) setActiveId(additions[0].id);
    setBusy(false); if (!additions.length) setError("The selected image could not be upscaled.");
  }

  function removeItem(item: ImageItem) { revokeItem(item); setItems((current) => current.filter((entry) => entry.id !== item.id)); if (activeId === item.id) setActiveId(items.find((entry) => entry.id !== item.id)?.id || ""); }
  async function upscale() {
    if (!active || busy) return; setBusy(true); setError("");
    try {
      if (active.result) URL.revokeObjectURL(active.result.url);
      const result = aiMode ? await aiUpscaleImage(active, scale, format) : await upscaleImage(active, scale, format); const url = URL.createObjectURL(result.blob);
      setItems((current) => current.map((item) => item.id === active.id ? { ...item, result: { ...result, url } } : item));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "This image could not be upscaled. Try a smaller image or 2× mode."); }
    finally { setBusy(false); }
  }
  function drop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files); }

  return <DashboardShell activePath="/image-tools"><div className="dashboard upscale-page">
    <input ref={inputRef} hidden multiple type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={(event: ChangeEvent<HTMLInputElement>) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} />
    {items.length ? <div className="compress-heading upscale-heading"><div><span className="auto-print-kicker">Free Image Tool</span><h2>Upscale Image</h2><p>Enhance and enlarge JPG, PNG, and WebP images.</p></div><span><ShieldCheck size={16} /> Files stay in your browser</span></div> : null}
    {!items.length ? <><PdfToolUpload title="Upscale Image" description="Enhance and enlarge JPG, PNG, and WebP images in your browser." icon={ImagePlus} inputRef={inputRef} onFiles={(files) => void addFiles(files)} accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" buttonLabel="Select images" dropLabel="or drop JPG, PNG, and WebP images here" headingLevel={children ? "h2" : "h1"} />{children}</> : <section className={`upscale-studio ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
      <button className={`upscale-ai-suggestion ${aiMode ? "active" : ""}`} type="button" aria-pressed={aiMode} onClick={() => setAiMode((current) => !current)}><Sparkles size={15} /><div><strong>{aiMode ? "AI enhancement enabled" : "Need smarter enhancement?"}</strong><span>{aiMode ? "Switch to standard upscaler" : "Use My AI Image Upscaler"}</span></div></button>
      <div className="upscale-thumbs">{items.map((item) => <button className={item.id === active?.id ? "active" : ""} type="button" onClick={() => setActiveId(item.id)} key={item.id}><img src={item.sourceUrl} alt={item.file.name} /></button>)}<button className="upscale-upload-tile" type="button" onClick={() => inputRef.current?.click()}><Plus size={22} /><small>Upload image</small></button></div>
      <div className="upscale-controls"><div><span>Upscale size</span><button className={scale === 2 ? "active" : ""} type="button" onClick={() => setScale(2)}>2×</button><button className={scale === 4 ? "active" : ""} type="button" onClick={() => setScale(4)}>4×</button></div><label><span>Output</span><select value={format} onChange={(event) => setFormat(event.target.value as OutputFormat)}><option value="image/webp">WebP</option><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></label><button className="upscale-run" type="button" disabled={busy} onClick={upscale}>{busy ? <LoaderCircle className="spin" size={18} /> : <WandSparkles size={18} />} {busy ? "Enhancing…" : `${aiMode ? "AI Upscale" : "Upscale"} ${scale}×`}</button></div>
      {active ? <div className="upscale-comparison"><ImagePane label="Original" src={active.sourceUrl} name={active.file.name} size={active.file.size} dimensions={`${active.width} × ${active.height}`} /><ImagePane label="Transformed" src={active.result?.url} name={active.result?.name || `Ready for ${scale}× enhancement`} size={active.result?.blob.size} dimensions={active.result ? `${active.result.width} × ${active.result.height}` : `${active.width * scale} × ${active.height * scale}`} empty={!active.result} /></div> : null}
      {active ? <div className="upscale-bottom"><button type="button" onClick={() => removeItem(active)}><Trash2 size={16} /> Remove image</button>{active.result ? <a href={active.result.url} download={active.result.name}><Download size={18} /> Download upscaled image</a> : <span><Sparkles size={16} /> Choose settings and upscale</span>}</div> : null}
    </section>}
    {error ? <p className="upscale-error" role="alert">{error}</p> : null}
    {items.length ? children : null}
  </div></DashboardShell>;
}

function ImagePane({ label, src, name, size, dimensions, empty }: { label: string; src?: string; name: string; size?: number; dimensions: string; empty?: boolean }) {
  return <article><h2>{label}</h2><div aria-label={src ? `${label} image preview` : undefined} className={empty ? "empty" : "has-image"} style={src ? { backgroundImage: `url(${JSON.stringify(src)})` } : undefined}>{src ? null : <><WandSparkles size={42} /><strong>Your enhanced image will appear here</strong></>}</div><footer><strong title={name}>{name}</strong><span>{dimensions}{size !== undefined ? ` · ${formatBytes(size)}` : ""}</span></footer></article>;
}

async function aiUpscaleImage(item: ImageItem, scale: 2 | 4, format: OutputFormat) {
  const payload = new FormData(); payload.append("image", item.file, item.file.name); payload.append("scale", String(scale)); payload.append("output_format", format.replace("image/", ""));
  const response = await fetch(apiUrl("/api/tools/ai-upscale-image/"), { method: "POST", body: payload });
  if (!response.ok) { let message = "AI upscaling could not be completed."; try { const data = await response.json(); message = data.message || data.error || message; } catch { /* binary or empty error response */ } throw new Error(message); }
  const blob = await response.blob(); if (!blob.type.startsWith("image/")) throw new Error("The AI service returned an invalid image.");
  const dimensions = await readBlobDimensions(blob); const extension = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "webp";
  return { blob, ...dimensions, name: `${item.file.name.replace(/\.[^.]+$/, "")}-${scale}x-ai-upscaled.${extension}` };
}
async function upscaleImage(item: ImageItem, scale: 2 | 4, format: OutputFormat) {
  const image = await loadImage(item.sourceUrl); const width = item.width * scale; const height = item.height * scale;
  if (width * height > 48_000_000) throw new Error("Image too large");
  let stage = document.createElement("canvas"); stage.width = item.width; stage.height = item.height; const initialContext = stage.getContext("2d"); if (!initialContext) throw new Error("Canvas unavailable"); initialContext.drawImage(image, 0, 0);
  for (let factor = 2; factor <= scale; factor *= 2) { const next = document.createElement("canvas"); next.width = item.width * factor; next.height = item.height * factor; const nextContext = next.getContext("2d"); if (!nextContext) throw new Error("Canvas unavailable"); nextContext.imageSmoothingEnabled = true; nextContext.imageSmoothingQuality = "high"; nextContext.drawImage(stage, 0, 0, next.width, next.height); stage = next; }
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; const context = canvas.getContext("2d", { alpha: format !== "image/jpeg" }); if (!context) throw new Error("Canvas unavailable");
  if (format === "image/jpeg") { context.fillStyle = "#fff"; context.fillRect(0, 0, width, height); }
  context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high"; context.drawImage(stage, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Export failed")), format, .92)); const extension = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
  return { blob, width, height, name: `${item.file.name.replace(/\.[^.]+$/, "")}-${scale}x-upscaled.${extension}` };
}
async function readBlobDimensions(blob: Blob) { const url = URL.createObjectURL(blob); try { return await readDimensions(url); } finally { URL.revokeObjectURL(url); } }
function readDimensions(url: string) { return loadImage(url).then((image) => ({ width: image.naturalWidth, height: image.naturalHeight })); }
function loadImage(url: string) { return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url; }); }
function revokeItem(item: ImageItem) { URL.revokeObjectURL(item.sourceUrl); if (item.result) URL.revokeObjectURL(item.result.url); }
function formatBytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`; }
