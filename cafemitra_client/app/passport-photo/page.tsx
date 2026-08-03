"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Check, Circle, Crop, Eye, IdCard, Loader2, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { WalletLimitBanner } from "../WalletLimitBanner";
import { apiFetch, apiUrl, dataUriToBlob } from "@/lib/api";
import { fetchPricingServiceByKey, type PriceItem } from "@/lib/pricing";
import { buildPassportPrompt, passportAttireOptions } from "@/lib/passport-attire";
import { CropEditor, cropImage, DEFAULT_CROP_RECT, type CropRect } from "../CropEditor";

type JobState = "idle" | "submitting" | "processing" | "done" | "not_found" | "failed";
type PaperSize = "a4" | "4x6";

type ProcessingStepItem = {
  title: string;
  desc: string;
  duration: number;
};

type ProcessingGroup = {
  id: string;
  title: string;
  items: ProcessingStepItem[];
};

const PROCESSING_GROUPS: ProcessingGroup[] = [
  {
    id: "preparing",
    title: "Preparing",
    items: [
      { title: "Preparing image...", desc: "Analyzing upload for AI processing", duration: 1300 },
      { title: "Optimizing for AI processing...", desc: "Creating an efficient working copy", duration: 1600 },
    ],
  },
  {
    id: "cropping",
    title: "Cropping",
    items: [
      { title: "Face detection", desc: "Locating eyes, chin, and head position", duration: 1700 },
      { title: "ICAO auto-framing", desc: "Computing eye line, chin, and top spacing", duration: 2000 },
      { title: "Tilt correction", desc: "Straightening head angle automatically", duration: 1700 },
    ],
  },
  {
    id: "background",
    title: "Background removing",
    items: [{ title: "Background processed", desc: "Removing the original backdrop", duration: 2200 }],
  },
  {
    id: "resizing",
    title: "Resizing",
    items: [{ title: "Finalizing", desc: "Generating print-ready passport preview", duration: 1800 }],
  },
  {
    id: "analyzing",
    title: "Analyzing",
    items: [{ title: "Compliance check", desc: "Validating against country standards", duration: 2600 }],
  },
];

const PROCESSING_ITEMS = PROCESSING_GROUPS.flatMap((group) => group.items.map((item) => ({ ...item, groupId: group.id })));

const PROCESSING_GROUP_RANGES = (() => {
  let cursor = 0;
  return PROCESSING_GROUPS.map((group) => {
    const start = cursor;
    cursor += group.items.length;
    return { ...group, start, end: cursor - 1 };
  });
})();

type ExistingPassportOrder = {
  id: number;
  fileUrl: string;
  fileName: string;
  attireCategory: string;
  geminiPhoto: string;
  photoStatus: string;
  photoErrorMessage: string;
  passportPrompt: string;
  priceLabel: string;
  rate: number;
};

const CHECK_INTERVAL_MS = 5_000;
const MAX_CHECK_ATTEMPTS = 7;

export default function PassportPhotoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoVariation, setPhotoVariation] = useState(passportAttireOptions[0].key);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [selectedPriceItemId, setSelectedPriceItemId] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP_RECT);
  const [jobState, setJobState] = useState<JobState>("idle");
  const [jobId, setJobId] = useState<number | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewOrder, setViewOrder] = useState<ExistingPassportOrder | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize | null>(null);
  const [stepCursor, setStepCursor] = useState(0);
  const dropRef = useRef<HTMLLabelElement | null>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function stopStepAnimation() {
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
      stepTimeoutRef.current = null;
    }
  }

  function startStepAnimation() {
    stopStepAnimation();
    setStepCursor(0);
    const scheduleNext = (doneCount: number) => {
      if (doneCount >= PROCESSING_ITEMS.length - 1) return;
      stepTimeoutRef.current = setTimeout(() => {
        setStepCursor(doneCount + 1);
        scheduleNext(doneCount + 1);
      }, PROCESSING_ITEMS[doneCount].duration);
    };
    scheduleNext(0);
  }

  useEffect(() => {
    loadPricingSetup();
  }, []);

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("orderId");
    if (orderId) loadExistingOrder(Number(orderId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadExistingOrder(orderId: number) {
    try {
      const response = await apiFetch(`/api/orders/${orderId}/`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.order) throw new Error(result.message || "Could not load this order.");

      const order: ExistingPassportOrder = result.order;
      setViewOrder(order);
      setJobId(order.id);
      if (order.attireCategory) setPhotoVariation(order.attireCategory);

      if (order.fileUrl) {
        const blob = order.fileUrl.startsWith("data:") ? dataUriToBlob(order.fileUrl) : await fetch(apiUrl(order.fileUrl)).then((res) => res.blob());
        setFile(new File([blob], order.fileName || "passport-photo.jpg", { type: blob.type || "image/jpeg" }));
        setPreviewUrl(URL.createObjectURL(blob));
      }

      if (order.geminiPhoto) {
        setFinalImageUrl(order.geminiPhoto);
        setJobState("done");
      } else if (order.photoStatus === "failed") {
        setJobState("failed");
        setError(order.photoErrorMessage || "Photo generation failed.");
      } else if (order.photoStatus === "pending" || order.photoStatus === "claimed") {
        setJobState("processing");
        startStepAnimation();
        attemptsRef.current = 0;
        timeoutRef.current = setTimeout(() => checkStatus(order.id), CHECK_INTERVAL_MS);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this order.");
    }
  }

  async function loadPricingSetup() {
    try {
      const service = await fetchPricingServiceByKey("passport_photo");
      const items = Array.isArray(service?.settings.priceItems) ? (service.settings.priceItems as PriceItem[]) : [];
      setPriceItems(items);
      setSelectedPriceItemId((current) => (items.some((item) => item.id === current) ? current : items[0]?.id || ""));
    } catch {
      // Package list is a convenience; leave whatever was already loaded.
    }
  }

  function parsePhotoCount(label?: string) {
    const match = /(\d+)/.exec(label || "");
    const value = match ? parseInt(match[1], 10) : NaN;
    return Number.isFinite(value) && value > 0 ? value : 6;
  }

  function buildPrintSheetHtml(size: PaperSize, imageUrl: string, count: number) {
    const itemsPerRow = size === "a4" ? 6 : 3;
    const pageSizeCss = size === "a4" ? "width:210mm;height:297mm;" : "width:4in;height:6in;";
    const pageRuleCss = size === "a4" ? "size:A4;" : "size:4in 6in;";
    const pagePaddingCss = size === "a4" ? "4mm 12mm 12mm 6mm" : "2mm 3mm 3mm 3mm";

    const rowCounts: number[] = [];
    for (let remaining = count; remaining > 0; remaining -= itemsPerRow) {
      rowCounts.push(Math.min(itemsPerRow, remaining));
    }

    const rowsHtml = rowCounts
      .map((rowCount) => {
        const photosHtml = Array.from({ length: rowCount })
          .map(() => `<div class="photo"><img src="${imageUrl}" /></div>`)
          .join("");
        return `<div class="photo-row">${photosHtml}</div>`;
      })
      .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Passport Photo Sheet</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;font-family:Arial, Helvetica, sans-serif;}
.page{${pageSizeCss}background:#fff;margin:20px auto;padding:${pagePaddingCss};}
.photo-row{display:flex;justify-content:flex-start;gap:2mm;margin-bottom:2mm;}
.photo-row:last-child{margin-bottom:0;}
.photo{width:1.2in;height:1.6in;border:1px solid #999;overflow:hidden;background:#fff;flex:0 0 auto;}
.photo img{width:100%;height:100%;object-fit:cover;object-position:center;}
@media print{
  body{background:white;}
  .page{margin:0;${pageSizeCss}padding:${pagePaddingCss};box-shadow:none;}
  @page{${pageRuleCss}margin:0;}
}
</style>
</head>
<body>
<div class="page">
${rowsHtml}
</div>
<script>
  window.onload = function () {
    window.focus();
    window.print();
  };
</script>
</body>
</html>`;
  }

  function openPrintSheet(size: PaperSize) {
    setPaperSize(size);
    if (!finalImageUrl) {
      setError("Generate the photo first, then choose a paper size to print.");
      return;
    }

    setError("");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const count = parsePhotoCount(viewOrder?.priceLabel || selectedPackage?.label);
    const html = buildPrintSheetHtml(size, apiUrl(finalImageUrl), count);
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const pasted = item.getAsFile();
          if (pasted) handleFileChange(pasted);
          break;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      stopChecking();
      stopStepAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopChecking() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function handleFileChange(selected?: File | null) {
    if (!selected) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setPhotoVariation(passportAttireOptions[0].key);
    setCropRect(DEFAULT_CROP_RECT);
    setViewOrder(null);
    resetJob();
  }

  function resetJob() {
    stopChecking();
    stopStepAnimation();
    attemptsRef.current = 0;
    setStepCursor(0);
    setJobState("idle");
    setJobId(null);
    setFinalImageUrl("");
    setError("");
  }

  function clearUpload() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setPhotoVariation(passportAttireOptions[0].key);
    setIsPreviewOpen(false);
    setIsCropOpen(false);
    setCropRect(DEFAULT_CROP_RECT);
    setViewOrder(null);
    resetJob();
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileChange(dropped);
  }

  async function applyImageCrop() {
    if (!previewUrl) return;
    try {
      const croppedBlob = await cropImage(previewUrl, cropRect);
      const croppedFile = new File([croppedBlob], (file?.name || "photo").replace(/(\.[^.]+)?$/, "-cropped.png"), { type: "image/png" });
      URL.revokeObjectURL(previewUrl);
      setFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(croppedFile));
      setIsCropOpen(false);
      setCropRect(DEFAULT_CROP_RECT);
      resetJob();
    } catch {
      setError("Could not crop the photo. Please upload it again and try.");
    }
  }

  function selectPhotoVariation(variation: string) {
    setPhotoVariation(variation);
    resetJob();
  }

  async function generatePreview() {
    if (!file) return;

    setIsSubmitting(true);
    setJobState("submitting");
    setError("");
    startStepAnimation();
    try {
      const prompt = buildPassportPrompt(photoVariation);
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("prompt", prompt);
      formData.append("attireCategory", photoVariation);
      if (selectedPackage) {
        formData.append("priceItemId", selectedPackage.id);
        formData.append("priceLabel", selectedPackage.label);
        formData.append("rate", String(selectedPackage.rate));
      }

      const response = await apiFetch("/api/save-raw-passport-photo/", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not start the photo request.");

      setJobState("processing");
      setJobId(result.id);
      attemptsRef.current = 0;
      timeoutRef.current = setTimeout(() => checkStatus(result.id), CHECK_INTERVAL_MS);
    } catch (submitError) {
      stopStepAnimation();
      setJobState("failed");
      setError(submitError instanceof Error ? submitError.message : "Could not start the photo request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function retryCheck() {
    if (jobId === null) return;
    stopChecking();
    attemptsRef.current = 0;
    setError("");
    setJobState("processing");
    startStepAnimation();
    checkStatus(jobId);
  }

  async function checkStatus(id: number) {
    attemptsRef.current += 1;
    try {
      const response = await apiFetch("/api/api-passport-photo-check/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.found && result.imageUrl) {
        stopChecking();
        stopStepAnimation();
        setStepCursor(PROCESSING_ITEMS.length);
        setJobState("done");
        setFinalImageUrl(result.imageUrl);
        return;
      }

      if (response.ok && !result.found) {
        stopChecking();
        stopStepAnimation();
        setJobState("failed");
        setError(result.message || "Photo generation failed. Please try again.");
        return;
      }

      if (attemptsRef.current >= MAX_CHECK_ATTEMPTS) {
        stopStepAnimation();
        setJobState("not_found");
        setError("We could not find your processed image yet. Please try again.");
        return;
      }

      timeoutRef.current = setTimeout(() => checkStatus(id), CHECK_INTERVAL_MS);
    } catch {
      if (attemptsRef.current >= MAX_CHECK_ATTEMPTS) {
        stopStepAnimation();
        setJobState("not_found");
        setError("We could not find your processed image yet. Please try again.");
        return;
      }
      timeoutRef.current = setTimeout(() => checkStatus(id), CHECK_INTERVAL_MS);
    }
  }

  const isBusy = jobState === "submitting" || jobState === "processing";
  const overallProgress = Math.min(92, Math.round(((stepCursor + 0.5) / PROCESSING_ITEMS.length) * 100));
  const selectedPackage = priceItems.find((item) => item.id === selectedPriceItemId) || priceItems[0];

  return (
    <DashboardShell activePath="/passport-photo">
      <div className="dashboard passport-photo-page">
        <WalletLimitBanner />
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">PrintPilot Passport Photo Maker</span>
            <h1>Passport Size Photo Maker</h1>
            <p>Upload a photo, choose a professional attire, and get an AI-generated passport photo that meets official standards.</p>
          </div>
          <span className="status-pill">AI Powered</span>
        </div>

        <section className="passport-maker-grid">
          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 1</span>
              <h2>Upload Photo</h2>
            </div>

            {file ? (
              <div className="customer-document-preview">
                <div className="document-thumb">
                  <img src={previewUrl} alt="" />
                  <button className="document-thumb-preview" type="button" onClick={() => setIsPreviewOpen(true)} aria-label="Preview photo">
                    <Eye size={17} />
                  </button>
                </div>
                <div>
                  <strong>{file.name}</strong>
                  <div className="document-actions">
                    <button type="button" onClick={() => setIsCropOpen(true)} disabled={isBusy}>
                      <Crop size={16} /> Crop
                    </button>
                    <button type="button" onClick={clearUpload} disabled={isBusy}>
                      <X size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label
                className="customer-upload"
                ref={dropRef}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                <Upload size={24} />
                <strong>Upload Passport Photo</strong>
                <span>Drag &amp; drop, paste from clipboard, or choose a JPG/PNG file.</span>
                <em>Tap to choose a file</em>
                <input accept=".jpg,.jpeg,.png" type="file" onChange={(event) => handleFileChange(event.target.files?.[0])} />
              </label>
            )}

            {file ? (
              <div className="attire-picker">
                <div className="passport-attire-picker">
                  <span>Photo Variation</span>
                  <div className="passport-attire-options">
                    {passportAttireOptions.map((option) => {
                      const OptionIcon = option.icon;
                      return (
                        <button
                          className={photoVariation === option.key ? "active" : ""}
                          key={option.key}
                          type="button"
                          onClick={() => selectPhotoVariation(option.key)}
                          disabled={isBusy}
                          aria-label={option.label}
                          title={option.label}
                        >
                          <OptionIcon size={18} />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {viewOrder ? (
                  <div className="passport-attire-picker">
                    <span>Package</span>
                    <div className="passport-package-options">
                      <button className="active" type="button" disabled>
                        <strong>{viewOrder.priceLabel}</strong>
                        <span>Rs. {viewOrder.rate}</span>
                      </button>
                    </div>
                  </div>
                ) : priceItems.length ? (
                  <div className="passport-attire-picker">
                    <span>Package</span>
                    <div className="passport-package-options">
                      {priceItems.map((item) => (
                        <button
                          className={selectedPriceItemId === item.id ? "active" : ""}
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedPriceItemId(item.id)}
                          disabled={isBusy}
                        >
                          <strong>{item.label}</strong>
                          <span>Rs. {item.rate}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                {jobState === "done" && finalImageUrl ? (
                  <div className="passport-attire-picker">
                    <span>Paper Size</span>
                    <div className="passport-papersize-options">
                      <label className={`passport-papersize-radio${paperSize === "4x6" ? " active" : ""}`}>
                        <input
                          type="radio"
                          name="passport-paper-size"
                          checked={paperSize === "4x6"}
                          onChange={() => setPaperSize("4x6")}
                          onClick={() => openPrintSheet("4x6")}
                        />
                        <span>4x6 Photo Paper</span>
                      </label>
                      <label className={`passport-papersize-radio${paperSize === "a4" ? " active" : ""}`}>
                        <input
                          type="radio"
                          name="passport-paper-size"
                          checked={paperSize === "a4"}
                          onChange={() => setPaperSize("a4")}
                          onClick={() => openPrintSheet("a4")}
                        />
                        <span>A4 Sheet</span>
                      </label>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {jobState === "idle" && file ? (
              <button className="passport-preview-button" type="button" onClick={generatePreview} disabled={isSubmitting}>
                <IdCard size={18} /> {isSubmitting ? "Starting..." : "Generate Photo"}
              </button>
            ) : null}

            {error ? <div className="profile-alert error">{error}</div> : null}
          </article>

          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 2</span>
              <h2>Preview</h2>
            </div>

            {isBusy ? (
              <div className="passport-processing-state">
                <p>Analyzing face position and applying ICAO-compliant framing for your passport photo.</p>
                <div className="passport-step-timeline">
                  {PROCESSING_GROUP_RANGES.map((group, groupIndex) => {
                    const groupStatus = stepCursor > group.end ? "done" : stepCursor >= group.start ? "active" : "pending";
                    return (
                      <div className={`passport-step-group ${groupStatus}`} key={group.id}>
                        <div className="passport-step-group-head">
                          <span className="passport-step-group-icon">
                            {groupStatus === "done" ? <Check size={14} /> : groupIndex + 1}
                          </span>
                          <strong>{group.title}</strong>
                        </div>
                        {groupStatus !== "pending" ? (
                          <div className="passport-step-items">
                            {group.items.map((item, itemOffset) => {
                              const itemIndex = group.start + itemOffset;
                              const itemStatus = itemIndex < stepCursor ? "done" : itemIndex === stepCursor ? "active" : "pending";
                              return (
                                <div className={`passport-step-item ${itemStatus}`} key={item.title}>
                                  <span className="passport-step-item-icon">
                                    {itemStatus === "done" ? (
                                      <Check size={14} />
                                    ) : itemStatus === "active" ? (
                                      <Loader2 size={14} className="passport-step-spin" />
                                    ) : (
                                      <Circle size={14} />
                                    )}
                                  </span>
                                  <div>
                                    <strong>{item.title}</strong>
                                    <span>{item.desc}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className="passport-overall-progress">
                  <div className="passport-overall-progress-label">
                    <span>Overall progress</span>
                    <strong>{overallProgress}%</strong>
                  </div>
                  <div className="passport-overall-progress-track">
                    <div className="passport-overall-progress-fill" style={{ width: `${overallProgress}%` }} />
                  </div>
                </div>
              </div>
            ) : null}

            {jobState === "done" && finalImageUrl ? (
              <div className="passport-final-preview">
                <img src={apiUrl(finalImageUrl)} alt="Final passport photo" />
              </div>
            ) : null}

            {jobState === "idle" || jobState === "not_found" || jobState === "failed" ? (
              <p className="customer-inline-help">
                {jobState === "idle"
                  ? "Upload a photo, choose an attire, and tap Generate Photo to begin."
                  : "Something went wrong. Upload the photo again to retry."}
              </p>
            ) : null}

            {jobState === "not_found" && jobId !== null ? (
              <button className="passport-preview-button" type="button" onClick={retryCheck}>
                <RefreshCw size={18} /> Retry
              </button>
            ) : null}
          </article>
        </section>
      </div>

      {isPreviewOpen && file ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Photo preview">
          <div className="document-preview-window">
            <div className="document-preview-head">
              <div>
                <strong>{file.name}</strong>
                <span>Preview</span>
              </div>
              <button type="button" onClick={() => setIsPreviewOpen(false)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="document-preview-body">
              <img src={previewUrl} alt="" />
            </div>
            <div className="document-preview-actions">
              <button type="button" onClick={() => setIsPreviewOpen(false)}>
                <X size={16} /> Close Preview
              </button>
              <button type="button" onClick={clearUpload}>
                <Trash2 size={16} /> Remove File
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isCropOpen && file ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Crop photo">
          <div className="crop-window">
            <div className="document-preview-head">
              <div>
                <strong>Crop Photo</strong>
                <span>{file.name}</span>
              </div>
              <button type="button" onClick={() => setIsCropOpen(false)} aria-label="Close crop">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body">
              <CropEditor fileUrl={previewUrl} rect={cropRect} onRectChange={setCropRect} />
              <div className="crop-controls">
                <p>Drag a corner or edge to resize the crop area. Drag inside the box to move it.</p>
                <button type="button" onClick={() => setCropRect(DEFAULT_CROP_RECT)}>
                  Reset Crop
                </button>
                <button type="button" onClick={applyImageCrop}>
                  <Crop size={17} /> Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
