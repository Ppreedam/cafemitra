"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Download, Eye, ImagePlus, Loader2, LogIn, Minus, Plus, Printer, RefreshCw, RotateCw, Trash2, Upload, Wallet, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { apiFetch, apiUrl, dataUriToBlob, hasStoredSession } from "@/lib/api";
import { useToolPrice } from "@/lib/useToolPrice";
import PhotoPrintSheetSeoContent from "./PhotoPrintSheetSeoContent";
import { takePendingPrintSheetPhoto } from "@/lib/printSheetHandoff";

async function chargePhotoPrintSheet() {
  const response = await apiFetch("/api/tools/photo-print-sheet-charge/", { method: "POST" });
  if (response.ok) return;
  const data = await response.json().catch(() => ({}));
  throw new Error(data.message || "Could not verify your wallet balance. Please try again.");
}
import {
  DEFAULT_GAP_MM,
  DEFAULT_MARGIN_MM,
  PAPER_SIZES,
  PHOTO_SIZE_PRESETS,
  downloadCanvas,
  openPrintWindow,
  packQueue,
  renderPageCanvas,
  renderSingleTileCanvas,
  resolvePaperDims,
  rotateImageFile,
  type MarginGapMm,
  type PaperSize,
  type QueuePhoto,
} from "./printLayout";

const MAX_COUNT = 200;

const PAPER_SIZE_ORDER: PaperSize[] = ["a4", "4x6", "5x7", "a5", "letter", "custom"];

export default function PhotoPrintSheetClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const price = useToolPrice("photo_print_sheet");
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [chargeConfirm, setChargeConfirm] = useState<{ resolve: (ok: boolean) => void } | null>(null);
  const loginNextUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  // Uploading, arranging, and previewing the sheet is free for anyone.
  // Login (and the wallet charge) is only required for the actions that
  // actually produce output - Print and Download HD.
  function requireLogin() {
    if (hasStoredSession()) return true;
    setLoginPrompt(true);
    return false;
  }

  // No price loaded yet, or the tool is still free - skip the modal
  // entirely and go straight to the charge call (which is itself a no-op
  // while free).
  function requestChargeConfirm() {
    if (!price) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => setChargeConfirm({ resolve }));
  }

  function answerChargeConfirm(ok: boolean) {
    chargeConfirm?.resolve(ok);
    setChargeConfirm(null);
  }

  const [photos, setPhotos] = useState<QueuePhoto[]>([]);
  const [paperSize, setPaperSize] = useState<PaperSize>("a4");
  const [customWidthCm, setCustomWidthCm] = useState<number | null>(null);
  const [customHeightCm, setCustomHeightCm] = useState<number | null>(null);
  const [gaps, setGaps] = useState<MarginGapMm>({ gapX: DEFAULT_GAP_MM, gapY: DEFAULT_GAP_MM, marginTop: DEFAULT_MARGIN_MM, marginLeft: DEFAULT_MARGIN_MM });
  const [pendingGaps, setPendingGaps] = useState<MarginGapMm>(gaps);
  const [liveView, setLiveView] = useState(true);
  const [sizeEditorId, setSizeEditorId] = useState<string | null>(null);
  const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);
  const [error, setError] = useState("");
  const [rotatingIds, setRotatingIds] = useState<Set<string>>(new Set());
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, []);

  useEffect(() => {
    const pending = takePendingPrintSheetPhoto();
    if (!pending) return;
    (async () => {
      try {
        const blob = pending.url.startsWith("data:") ? dataUriToBlob(pending.url) : await fetch(apiUrl(pending.url)).then((res) => res.blob());
        addFiles([new File([blob], pending.name, { type: blob.type || "image/jpeg" })]);
      } catch {
        setError("Could not load the generated photo into the queue. Please upload it manually.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const pasted = item.getAsFile();
          if (pasted) addFiles([pasted]);
          break;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeGaps = liveView ? gaps : pendingGaps;
  const isCustomPaperReady = paperSize !== "custom" || !!(customWidthCm && customWidthCm > 0 && customHeightCm && customHeightCm > 0);
  const paperMeta = useMemo(() => resolvePaperDims(paperSize, customWidthCm, customHeightCm), [paperSize, customWidthCm, customHeightCm]);
  const { pages, skipped } = useMemo(
    () => (isCustomPaperReady ? packQueue(photos, paperMeta, gaps) : { pages: [[]], skipped: 0 }),
    [photos, paperMeta, gaps, isCustomPaperReady],
  );
  const totalTiles = pages.reduce((sum, page) => sum + page.length, 0);

  useEffect(() => {
    setActivePage((current) => Math.min(current, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    const preset = PHOTO_SIZE_PRESETS[0];
    setPhotos((prev) => [
      ...prev,
      ...files.map(
        (file): QueuePhoto => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          widthCm: preset.widthCm,
          heightCm: preset.heightCm,
          count: 1,
          sizeKey: preset.key,
        }),
      ),
    ]);
    setError("");
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (event.dataTransfer.files?.length) addFiles(event.dataTransfer.files);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((photo) => photo.id !== id);
    });
    if (sizeEditorId === id) setSizeEditorId(null);
    if (previewPhotoId === id) setPreviewPhotoId(null);
  }

  function updateCount(id: string, next: number) {
    const clamped = Math.max(1, Math.min(MAX_COUNT, next));
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, count: clamped } : photo)));
  }

  function applyPreset(id: string, presetKey: string) {
    const preset = PHOTO_SIZE_PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, widthCm: preset.widthCm, heightCm: preset.heightCm, sizeKey: preset.key } : photo)));
  }

  function updateCustomSize(id: string, dimension: "widthCm" | "heightCm", value: number) {
    const clamped = Math.max(0.5, Math.min(30, value || 0.5));
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, [dimension]: clamped, sizeKey: "custom" } : photo)));
  }

  async function rotatePhoto(id: string) {
    const photo = photos.find((item) => item.id === id);
    if (!photo || rotatingIds.has(id)) return;
    setRotatingIds((prev) => new Set(prev).add(id));
    try {
      const rotated = await rotateImageFile(photo.url, photo.file);
      URL.revokeObjectURL(photo.url);
      setPhotos((prev) => prev.map((item) => (item.id === id ? { ...item, file: rotated.file, url: rotated.url } : item)));
    } catch {
      setError("Could not rotate this photo. Please try again.");
    } finally {
      setRotatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function downloadSingleTile(photo: QueuePhoto) {
    try {
      const canvas = await renderSingleTileCanvas(photo.url, photo.widthCm, photo.heightCm);
      downloadCanvas(canvas, `${photo.file.name.replace(/\.[^.]+$/, "")}-${photo.widthCm}x${photo.heightCm}cm.png`);
    } catch {
      setError("Could not download this photo. Please try again.");
    }
  }

  function clearQueue() {
    photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    setPhotos([]);
    setSizeEditorId(null);
    setPreviewPhotoId(null);
  }

  function resetGaps() {
    const defaults: MarginGapMm = { gapX: DEFAULT_GAP_MM, gapY: DEFAULT_GAP_MM, marginTop: DEFAULT_MARGIN_MM, marginLeft: DEFAULT_MARGIN_MM };
    setGaps(defaults);
    setPendingGaps(defaults);
  }

  function setGapValue(key: keyof MarginGapMm, value: number) {
    if (liveView) {
      setGaps((prev) => ({ ...prev, [key]: value }));
    } else {
      setPendingGaps((prev) => ({ ...prev, [key]: value }));
    }
  }

  function toggleLiveView() {
    setLiveView((current) => {
      const next = !current;
      if (next) setGaps(pendingGaps);
      else setPendingGaps(gaps);
      return next;
    });
  }

  async function downloadHD() {
    if (!totalTiles) {
      setError("Add at least one photo to the queue first.");
      return;
    }
    if (!requireLogin()) return;
    if (!(await requestChargeConfirm())) return;
    setIsExporting(true);
    setError("");
    try {
      await chargePhotoPrintSheet();
      const imageCache = new Map<string, HTMLImageElement>();
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        if (!pages[pageIndex].length) continue;
        const canvas = await renderPageCanvas(paperMeta, pages[pageIndex], imageCache);
        downloadCanvas(canvas, `print-sheet-${paperMeta.badge.toLowerCase()}-page-${pageIndex + 1}.png`);
        if (pageIndex < pages.length - 1) await new Promise((resolve) => setTimeout(resolve, 350));
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate the print sheet. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  async function printSheet() {
    if (!totalTiles) {
      setError("Add at least one photo to the queue first.");
      return;
    }
    if (printBusy) return;
    if (!requireLogin()) return;
    if (!(await requestChargeConfirm())) return;
    setPrintBusy(true);
    setError("");
    try {
      await chargePhotoPrintSheet();
      openPrintWindow(paperMeta, pages);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not prepare the print job. Please try again.");
    } finally {
      setPrintBusy(false);
    }
  }

  const previewPhoto = photos.find((photo) => photo.id === previewPhotoId) || null;

  return (
    <DashboardShell activePath="/photo-print-sheet">
      <div className="dashboard pps-page">
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">PrintPilot Photo Print Sheet</span>
            <h2>Photo Print Sheet Maker</h2>
            <p>Upload passport-size photos, queue as many different ones as you need, and arrange them into one print-ready sheet.</p>
          </div>
          <div className="auto-print-hero-actions">
            <span className="status-pill">{totalTiles} tile{totalTiles === 1 ? "" : "s"} on {pages.length || 1} page{pages.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        <section className="passport-maker-grid">
          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 1</span>
              <h2>Print Queue</h2>
            </div>

            {photos.length ? (
              <div className="pps-queue-list">
                {photos.map((photo) => (
                  <div className="pps-queue-item" key={photo.id}>
                    <div className="pps-queue-thumb">
                      <img src={photo.url} alt="" />
                      <button type="button" className="pps-queue-thumb-preview" onClick={() => setPreviewPhotoId(photo.id)} aria-label="Preview original photo" title="Preview">
                        <Eye size={12} />
                      </button>
                    </div>
                    <div className="pps-queue-info">
                      <button type="button" className="pps-size-chip" onClick={() => setSizeEditorId((current) => (current === photo.id ? null : photo.id))}>
                        {photo.widthCm.toFixed(1)} &times; {photo.heightCm.toFixed(1)} cm
                      </button>
                      <div className="pps-count-stepper">
                        <button type="button" onClick={() => updateCount(photo.id, photo.count - 1)} disabled={photo.count <= 1} aria-label="Decrease quantity">
                          <Minus size={14} />
                        </button>
                        <span>{photo.count}</span>
                        <button type="button" onClick={() => updateCount(photo.id, photo.count + 1)} disabled={photo.count >= MAX_COUNT} aria-label="Increase quantity">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="pps-queue-actions">
                        <button type="button" onClick={() => rotatePhoto(photo.id)} disabled={rotatingIds.has(photo.id)} aria-label="Rotate photo" title="Rotate">
                          {rotatingIds.has(photo.id) ? <Loader2 size={15} className="passport-step-spin" /> : <RotateCw size={15} />}
                        </button>
                        <button type="button" onClick={() => downloadSingleTile(photo)} aria-label="Download this photo" title="Download">
                          <Download size={15} />
                        </button>
                        <button type="button" className="danger" onClick={() => removePhoto(photo.id)} aria-label="Remove photo" title="Remove">
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {sizeEditorId === photo.id ? (
                        <div className="pps-size-editor">
                          <div className="pps-size-presets">
                            {PHOTO_SIZE_PRESETS.map((preset) => (
                              <button
                                type="button"
                                key={preset.key}
                                className={photo.sizeKey === preset.key ? "active" : ""}
                                onClick={() => applyPreset(photo.id, preset.key)}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                          <div className="pps-size-custom">
                            <label>
                              <span>Width (cm)</span>
                              <input
                                type="number"
                                min="0.5"
                                max="30"
                                step="0.1"
                                value={photo.widthCm}
                                onChange={(event) => updateCustomSize(photo.id, "widthCm", Number(event.target.value))}
                              />
                            </label>
                            <label>
                              <span>Height (cm)</span>
                              <input
                                type="number"
                                min="0.5"
                                max="30"
                                step="0.1"
                                value={photo.heightCm}
                                onChange={(event) => updateCustomSize(photo.id, "heightCm", Number(event.target.value))}
                              />
                            </label>
                          </div>
                          <button type="button" className="pps-size-done" onClick={() => setSizeEditorId(null)}>
                            Done
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <label className={`customer-upload pps-add-upload${photos.length ? " pps-add-upload-compact" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              {photos.length ? <ImagePlus size={20} /> : <Upload size={24} />}
              <strong>{photos.length ? "Add More Photos" : "Upload Passport Photos"}</strong>
              <span>Drag &amp; drop, paste from clipboard, or choose JPG/PNG files. Select multiple at once.</span>
              <input accept=".jpg,.jpeg,.png" type="file" multiple onChange={(event) => event.target.files && addFiles(event.target.files)} />
            </label>

            {photos.length ? (
              <button type="button" className="pps-clear-queue" onClick={clearQueue}>
                <Trash2 size={14} /> Clear Queue
              </button>
            ) : null}

            {error ? <div className="profile-alert error">{error}</div> : null}
          </article>

          <article className="customer-panel">
            <div className="customer-panel-head pps-preview-head">
              <span>Print Preview</span>
              <button type="button" className={`pps-live-toggle${liveView ? " active" : ""}`} onClick={toggleLiveView}>
                {liveView ? "Live View" : "Preview Paused"}
              </button>
            </div>

            <div className="pps-preview-stage">
              {totalTiles ? (
                <div className="pps-paper" style={{ aspectRatio: `${paperMeta.widthMm} / ${paperMeta.heightMm}` }}>
                  {(pages[activePage] || []).map((tile, index) => (
                    <div
                      className="pps-tile"
                      key={`${tile.photoId}-${index}`}
                      style={{
                        left: `${(tile.xMm / paperMeta.widthMm) * 100}%`,
                        top: `${(tile.yMm / paperMeta.heightMm) * 100}%`,
                        width: `${(tile.wMm / paperMeta.widthMm) * 100}%`,
                        height: `${(tile.hMm / paperMeta.heightMm) * 100}%`,
                      }}
                    >
                      <img src={tile.url} alt="" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pps-paper pps-paper-empty" style={{ aspectRatio: `${paperMeta.widthMm} / ${paperMeta.heightMm}` }}>
                  <span>{isCustomPaperReady ? "Upload a photo to see the print layout" : "Enter a custom paper width & height to see the print layout"}</span>
                </div>
              )}
              <span className="pps-paper-badge">{paperMeta.badge}</span>
            </div>

            {pages.length > 1 ? (
              <div className="pps-page-nav">
                <button type="button" onClick={() => setActivePage((page) => Math.max(0, page - 1))} disabled={activePage === 0}>
                  <ChevronLeft size={15} />
                </button>
                <span>Page {activePage + 1} / {pages.length}</span>
                <button type="button" onClick={() => setActivePage((page) => Math.min(pages.length - 1, page + 1))} disabled={activePage === pages.length - 1}>
                  <ChevronRight size={15} />
                </button>
              </div>
            ) : null}

            {skipped > 0 ? (
              <div className="profile-alert warning">
                {skipped} tile{skipped === 1 ? "" : "s"} didn&apos;t fit on {paperMeta.label} and were left out - pick a smaller size or a bigger paper.
              </div>
            ) : null}

            <div className="pps-controls">
              <div className="pps-controls-row">
                <label className="pps-field">
                  <span>Paper Size</span>
                  <select value={paperSize} onChange={(event) => setPaperSize(event.target.value as PaperSize)}>
                    {PAPER_SIZE_ORDER.map((key) => (
                      <option key={key} value={key}>
                        {key === "custom" ? "Custom Size" : PAPER_SIZES[key].label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="pps-field">
                  <span>Margin / Gap Control</span>
                  <button type="button" className="pps-reset-default" onClick={resetGaps}>
                    <RefreshCw size={13} /> Reset Default
                  </button>
                </div>
              </div>

              {paperSize === "custom" ? (
                <div className="pps-custom-paper">
                  <span>Size (cm):</span>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    step="0.1"
                    placeholder="W (cm)"
                    value={customWidthCm ?? ""}
                    onChange={(event) => setCustomWidthCm(event.target.value ? Number(event.target.value) : null)}
                  />
                  <span className="pps-custom-paper-x">X</span>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    step="0.1"
                    placeholder="H (cm)"
                    value={customHeightCm ?? ""}
                    onChange={(event) => setCustomHeightCm(event.target.value ? Number(event.target.value) : null)}
                  />
                </div>
              ) : null}

              <div className="pps-gap-grid">
                <label className="pps-slider">
                  <span>Gap X <b>{activeGaps.gapX}mm</b></span>
                  <input type="range" min={0} max={10} step={0.5} value={activeGaps.gapX} onChange={(event) => setGapValue("gapX", Number(event.target.value))} />
                </label>
                <label className="pps-slider">
                  <span>Gap Y <b>{activeGaps.gapY}mm</b></span>
                  <input type="range" min={0} max={10} step={0.5} value={activeGaps.gapY} onChange={(event) => setGapValue("gapY", Number(event.target.value))} />
                </label>
                <label className="pps-slider">
                  <span>Margin Top <b>{activeGaps.marginTop}mm</b></span>
                  <input type="range" min={0} max={20} step={0.5} value={activeGaps.marginTop} onChange={(event) => setGapValue("marginTop", Number(event.target.value))} />
                </label>
                <label className="pps-slider">
                  <span>Margin Left <b>{activeGaps.marginLeft}mm</b></span>
                  <input type="range" min={0} max={20} step={0.5} value={activeGaps.marginLeft} onChange={(event) => setGapValue("marginLeft", Number(event.target.value))} />
                </label>
              </div>

              {!liveView ? (
                <button type="button" className="pps-refresh-preview" onClick={() => setGaps(pendingGaps)}>
                  <RefreshCw size={14} /> Refresh Preview
                </button>
              ) : null}

              <div className="pps-final-actions">
                <button type="button" className="pps-print-btn" disabled={!totalTiles || printBusy} onClick={() => void printSheet()}>
                  <Printer size={18} /> {printBusy ? "Preparing…" : "Print"}
                </button>
                <button type="button" className="passport-preview-button pps-download-hd" disabled={isExporting || !totalTiles} onClick={() => void downloadHD()}>
                  {isExporting ? <Loader2 size={18} className="passport-step-spin" /> : <Download size={18} />}
                  {isExporting ? "Rendering..." : "Download HD"}
                </button>
                <button type="button" className="icon-action-btn danger" disabled={!photos.length} onClick={clearQueue} aria-label="Clear queue" title="Clear queue">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </article>
        </section>
      </div>

      {previewPhoto ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Photo preview">
          <div className="document-preview-window">
            <div className="document-preview-head">
              <div>
                <strong>{previewPhoto.file.name}</strong>
                <span>{previewPhoto.widthCm.toFixed(1)} &times; {previewPhoto.heightCm.toFixed(1)} cm</span>
              </div>
              <button type="button" onClick={() => setPreviewPhotoId(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="document-preview-body">
              <img src={previewPhoto.url} alt="" />
            </div>
          </div>
        </div>
      ) : null}

      {chargeConfirm ? (
        <div className="resbuild-confirm-overlay" onClick={() => answerChargeConfirm(false)}>
          <div className="resbuild-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="resbuild-confirm-icon"><Wallet size={20} /></span>
            <h3>Confirm wallet charge</h3>
            <p>
              This will deduct <strong>₹{price}</strong> from your RepetiGo wallet for this print sheet.
            </p>
            <div className="resbuild-confirm-actions">
              <button type="button" className="resbuild-btn-secondary" onClick={() => answerChargeConfirm(false)}>Cancel</button>
              <button type="button" className="resbuild-btn-primary" onClick={() => answerChargeConfirm(true)}>OK, Continue</button>
            </div>
          </div>
        </div>
      ) : null}

      {loginPrompt ? (
        <div className="resbuild-confirm-overlay" onClick={() => setLoginPrompt(false)}>
          <div className="resbuild-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="resbuild-confirm-icon"><LogIn size={20} /></span>
            <h3>Login to continue</h3>
            <p>
              Your photo queue stays exactly as you left it. Log in (or create a free account) to print or download.
            </p>
            <div className="resbuild-confirm-actions">
              <button type="button" className="resbuild-btn-secondary" onClick={() => setLoginPrompt(false)}>Keep editing</button>
              <Link className="resbuild-btn-primary" href={`/login?next=${encodeURIComponent(loginNextUrl)}`}>Login</Link>
            </div>
          </div>
        </div>
      ) : null}

      <PhotoPrintSheetSeoContent />
    </DashboardShell>
  );
}
