"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Archive, Check, Download, Eye, FileImage, Gauge, Info, LoaderCircle, Plus, RotateCcw, ShieldCheck, Trash2, X } from "lucide-react";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../../pdf-tools/PdfToolUpload";

type ImageItem = {
  id: string;
  file: File;
  width: number;
  height: number;
  loading: boolean;
  result?: { blob: Blob; url: string; size: number; width: number; height: number; name: string };
};

export default function HeicToJpgClient({ children }: { children?: ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultUrls = useRef(new Set<string>());
  const [items, setItems] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(90);
  const [converting, setConverting] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);

  useEffect(() => () => resultUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  async function addFiles(files: FileList | File[]) {
    const selected = Array.from(files);
    const invalid = selected.find((file) => !isSupported(file));
    if (invalid) return setError(`${invalid.name} is not a supported HEIC or HEIF photo.`);
    setError("");
    const additions: ImageItem[] = selected.map((file) => ({ id: crypto.randomUUID(), file, width: 0, height: 0, loading: true }));
    setItems((current) => [...current, ...additions]);
    await convertFiles(additions, quality);
  }

  function discard(item: ImageItem) {
    if (item.result) {
      URL.revokeObjectURL(item.result.url);
      resultUrls.current.delete(item.result.url);
    }
  }
  function removeItem(id: string) {
    setItems((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) discard(item);
      return current.filter((entry) => entry.id !== id);
    });
  }
  function clearAll() {
    items.forEach((item) => discard(item));
    setItems([]);
    setError("");
    setPreviewItem(null);
    if (inputRef.current) inputRef.current.value = "";
  }
  function updateQuality(value: number) {
    setQuality(value);
    setItems((current) => current.map((item) => { discard(item); return { ...item, result: undefined, loading: true }; }));
    void convertFiles(items, value);
  }
  async function convertAll() {
    if (!items.length || items.some((item) => item.loading) || converting) return;
    await convertFiles(items, quality);
  }

  async function convertFiles(targets: ImageItem[], qualityValue: number) {
    setConverting(true);
    setError("");
    try {
      for (const item of targets) {
        discard(item);
        try {
          const output = await convertHeicToJpg(item.file, qualityValue);
          const url = URL.createObjectURL(output.blob);
          resultUrls.current.add(url);
          const result = { blob: output.blob, url, size: output.blob.size, width: output.width, height: output.height, name: jpgName(item.file.name) };
          setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, width: output.width, height: output.height, loading: false, result } : entry)));
        } catch {
          setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, loading: false } : entry)));
          setError(`${item.file.name} could not be converted. Make sure it is a valid HEIC or HEIF photo.`);
        }
      }
    } finally {
      setConverting(false);
    }
  }

  async function downloadZip() {
    const completed = items.filter((item) => item.result);
    if (!completed.length || zipBusy) return;
    setZipBusy(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      completed.forEach((item) => zip.file(item.result!.name, item.result!.blob));
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      triggerDownload(URL.createObjectURL(blob), "repetigo-converted-jpgs.zip", true);
    } finally {
      setZipBusy(false);
    }
  }

  function drop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    void addFiles(event.dataTransfer.files);
  }
  const completed = items.filter((item) => item.result).length;

  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard compress-pdf-page">
        {items.length ? (
          <>
            <input
              ref={inputRef}
              hidden
              multiple
              type="file"
              accept="image/heic,image/heif,image/heic-sequence,image/heif-sequence,.heic,.heif"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                if (event.target.files) void addFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <div className="compress-heading">
              <div>
                <span className="auto-print-kicker">Free Image Tool</span>
                <h2>HEIC to JPG</h2>
                <p>Convert iPhone HEIC photos into JPG.</p>
              </div>
              <span><ShieldCheck size={16} /> Files stay in your browser</span>
            </div>
          </>
        ) : null}
        {!items.length ? (
          <>
            <PdfToolUpload
              title="HEIC to JPG"
              description="Convert HEIC or HEIF iPhone photos into JPG - one at a time or in a batch."
              icon={FileImage}
              inputRef={inputRef}
              onFiles={(files) => void addFiles(files)}
              accept="image/heic,image/heif,image/heic-sequence,image/heif-sequence,.heic,.heif"
              buttonLabel="Select HEIC photos"
              dropLabel="or drop HEIC or HEIF photos here"
              headingLevel={children ? "h2" : "h1"}
              backHref="/image-tools"
              backLabel="Image Tools"
            />
            {children}
          </>
        ) : (
          <div className="compress-studio">
            <section className={`compress-workspace ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
              <div className="compress-workspace-head">
                <div>
                  <h2>Your HEIC files</h2>
                  <p>Files convert to JPG automatically after upload.</p>
                </div>
                <button type="button" disabled={converting} onClick={() => inputRef.current?.click()}>
                  <Plus size={18} /> Add photos
                </button>
              </div>
              <div className="compress-file-grid">
                {items.map((item) => (
                  <article className="compress-file-card" key={item.id}>
                    <button className="compress-remove" type="button" disabled={converting} onClick={() => removeItem(item.id)} aria-label={`Remove ${item.file.name}`}>
                      <X size={17} />
                    </button>
                    <div className="compress-file-meta">
                      <strong title={item.file.name}>{item.file.name}</strong>
                      <span>Original: {formatBytes(item.file.size)}</span>
                    </div>
                    <div className="compress-thumbnail">
                      {item.loading ? <LoaderCircle className="spin" size={27} /> : item.result ? <img src={item.result.url} alt={`Converted preview of ${item.file.name}`} /> : <FileImage size={28} />}
                    </div>
                    <small>{item.result ? `${item.width} × ${item.height}px` : item.loading ? "Converting…" : "Could not convert"}</small>
                    {item.result ? (
                      <>
                        <div className="compress-saving">
                          <span>JPG: <strong>{formatBytes(item.result.size)}</strong></span>
                        </div>
                        <div className="compress-card-actions">
                          <button type="button" onClick={() => setPreviewItem(item)}>
                            <Eye size={16} /> Preview
                          </button>
                          <a href={item.result.url} download={item.result.name}>
                            <Download size={17} /> Download
                          </a>
                        </div>
                      </>
                    ) : (
                      <div className="compress-pending">{item.loading ? "Decoding HEIC photo…" : converting ? "Converting automatically…" : "Could not convert this file"}</div>
                    )}
                  </article>
                ))}
                <button className="compress-add-card" type="button" disabled={converting} onClick={() => inputRef.current?.click()}>
                  <span><Plus size={29} /></span>
                  <strong>Add HEIC photos</strong>
                  <small>Click or drop more files</small>
                </button>
              </div>
            </section>
            <aside className="compress-side-panel">
              <div>
                <span className="auto-print-kicker">RepetiGo Image Tools</span>
                <h2>HEIC to JPG</h2>
                <p>{items.length} files · {completed} converted</p>
              </div>
              <div className="compress-side-config">
                <div className="compress-level-label">
                  <Gauge size={20} />
                  <div>
                    <strong>JPG quality</strong>
                    <small>Higher keeps more detail; lower makes a smaller file.</small>
                  </div>
                  <span title="Photos are decoded and converted locally in your browser."><Info size={17} /></span>
                </div>
                <input type="range" min="40" max="100" step="5" value={quality} disabled={converting} onChange={(event) => updateQuality(Number(event.target.value))} aria-label="JPG quality" />
                <output>{quality}<small>%</small></output>
              </div>
              <div className="compress-side-summary">
                <span><Check size={18} /></span>
                <div>
                  <strong>{converting ? "Converting files…" : completed === items.length ? "All files ready" : "Preparing conversion"}</strong>
                  <small>{converting ? "Please keep this page open." : "Each HEIC photo is decoded and re-encoded as JPG on your own device."}</small>
                </div>
              </div>
              <div className="compress-side-actions">
                <button className="compress-run" type="button" disabled={converting || items.some((item) => item.loading)} onClick={convertAll}>
                  {converting ? <LoaderCircle className="spin" size={19} /> : <Archive size={19} />} {converting ? "Converting…" : `Convert at ${quality}%`}
                </button>
                <button className="compress-zip-button" type="button" disabled={!completed || zipBusy || converting} onClick={downloadZip}>
                  {zipBusy ? <LoaderCircle className="spin" size={19} /> : <Download size={19} />} Download ZIP
                </button>
                <button className="compress-delete-all" type="button" disabled={converting} onClick={clearAll}>
                  <Trash2 size={18} /> Delete all
                </button>
                <button className="compress-start-over" type="button" disabled={converting} onClick={clearAll}>
                  <RotateCcw size={17} /> Start over
                </button>
              </div>
            </aside>
          </div>
        )}
        {error ? <div className="profile-alert error compress-error" role="alert">{error}</div> : null}
        {items.length ? children : null}
        {previewItem?.result ? <ImagePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} /> : null}
      </div>
    </DashboardShell>
  );
}

function ImagePreviewModal({ item, onClose }: { item: ImageItem; onClose: () => void }) {
  if (!item.result) return null;
  return (
    <div className="compress-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Preview for ${item.file.name}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="compress-preview-modal image-compress-preview">
        <header>
          <div>
            <h2>HEIC to JPG preview</h2>
            <p>{item.file.name} · {item.width} × {item.height}px</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close preview">
            <X size={21} />
          </button>
        </header>
        <div className="image-compress-compare">
          <article>
            <div>
              <strong>Original HEIC</strong>
              <span>{formatBytes(item.file.size)}</span>
            </div>
            <div className="heic-preview-unavailable">
              <FileImage size={36} />
              <small>Most browsers can't display a HEIC preview - only Safari can. Conversion still works correctly.</small>
            </div>
          </article>
          <article>
            <div>
              <strong>Converted JPG</strong>
              <span>{formatBytes(item.result.size)}</span>
            </div>
            <img src={item.result.url} alt="Converted JPG" />
          </article>
        </div>
        <footer>
          <div>
            <span>Original HEIC files never leave your device</span>
          </div>
          <a href={item.result.url} download={item.result.name}>
            <Download size={18} /> Download JPG
          </a>
        </footer>
      </section>
    </div>
  );
}

function isSupported(file: File) {
  return ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"].includes(file.type) || /\.(heic|heif)$/i.test(file.name);
}

async function convertHeicToJpg(file: File, quality: number) {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: quality / 100 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const dimensions = await imageDimensions(URL.createObjectURL(blob));
  return { blob, width: dimensions.width, height: dimensions.height };
}

function imageDimensions(url: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => { resolve({ width: image.naturalWidth, height: image.naturalHeight }); URL.revokeObjectURL(url); };
    image.onerror = reject;
    image.src = url;
  });
}

function jpgName(name: string) {
  return `${name.replace(/\.[^.]+$/, "")}.jpg`;
}
function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
function triggerDownload(url: string, name: string, revoke = false) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000);
}
