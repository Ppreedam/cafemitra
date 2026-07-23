"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Crop, Eye, IdCard, Printer, Trash2, Upload, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { SkeletonBlock } from "../UiState";
import { apiFetch, apiUrl } from "@/lib/api";
import { fetchPricingServiceByKey, savePricingService } from "@/lib/pricing";
import { fallbackPrinters, fetchAgentHealth, saveAgentPrinter } from "@/lib/printpilot-agent";
import { passportAttireOptions } from "@/lib/passport-attire";
import { CropEditor, cropImage, DEFAULT_CROP_RECT, type CropRect } from "../CropEditor";

type Gender = "male" | "female";

type JobState = "idle" | "submitting" | "processing" | "done" | "not_found" | "failed";

const CHECK_INTERVAL_MS = 5_000;
const MAX_CHECK_ATTEMPTS = 7;

const VARIATION_ATTIRE: Record<string, string> = {
  same: "the same outfit visible in the uploaded photo",
  men_blazer_tie: "a formal blazer with a tie",
  women_blazer_tie: "a formal blazer with a tie",
  burqa: "a black burqa with hijab",
};

function buildPrompt(gender: Gender, attire: string) {
  const genderWord = gender === "male" ? "male" : "female";
  return `Generate a professional ${genderWord} passport photo. Requirements: Plain white or very light gray background, face centered and looking straight at camera with neutral expression, both ears visible, proper even lighting with no shadows on face, shoulders and upper chest visible, wearing ${attire.toLowerCase()}, high resolution output. Aspect ratio 4:5. The photo must meet official government passport photo standards.`;
}

export default function PassportPhotoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [attire, setAttire] = useState(VARIATION_ATTIRE.same);
  const [photoVariation, setPhotoVariation] = useState(passportAttireOptions[0].key);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP_RECT);
  const [jobState, setJobState] = useState<JobState>("idle");
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printers, setPrinters] = useState<string[]>(fallbackPrinters);
  const [selectedPrinter, setSelectedPrinter] = useState(fallbackPrinters[0]);
  const [printerMessage, setPrinterMessage] = useState("");
  const [printerError, setPrinterError] = useState("");
  const dropRef = useRef<HTMLLabelElement | null>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadPrinterSetup();
    window.addEventListener("cafemitra:printers-updated", loadPrinterSetup);
    return () => {
      window.removeEventListener("cafemitra:printers-updated", loadPrinterSetup);
    };
  }, []);

  async function loadPrinterSetup() {
    try {
      const [health, service] = await Promise.all([fetchAgentHealth(), fetchPricingServiceByKey("passport_photo")]);
      const scannedPrinters = Array.isArray(health.printers) && health.printers.length ? health.printers : fallbackPrinters;
      const savedPrinter = String(service?.settings.selectedPrinter || "").trim();
      setPrinters(scannedPrinters);
      setSelectedPrinter(
        savedPrinter && scannedPrinters.includes(savedPrinter)
          ? savedPrinter
          : health.printer && scannedPrinters.includes(health.printer)
            ? health.printer
            : scannedPrinters[0] || "",
      );
    } catch {
      setPrinters(fallbackPrinters);
      setSelectedPrinter(fallbackPrinters[0]);
    }
  }

  async function choosePassportPrinter(printerName: string) {
    setSelectedPrinter(printerName);
    setPrinterMessage("");
    setPrinterError("");
    try {
      const result = await saveAgentPrinter(printerName);
      const savedPrinter = result.printer || printerName;
      // Saved under its own "passport_photo" service key, kept independent
      // from PrintPilot's "auto_document_print" printer selection.
      await savePricingService("passport_photo", { selectedPrinter: savedPrinter });
      setSelectedPrinter(savedPrinter);
      setPrinterMessage(`Passport photo printer set to ${savedPrinter}.`);
      window.dispatchEvent(new Event("cafemitra:printers-updated"));
    } catch (err) {
      setPrinterError(err instanceof Error ? err.message : "Could not save printer. Is the PrintPilot Agent running?");
    }
  }

  function printFinalPhoto() {
    if (!finalImageUrl) return;
    const printWindow = window.open("", "_blank", "width=480,height=640");
    if (!printWindow) return;
    const doc = printWindow.document;
    doc.title = "Print Passport Photo";
    doc.body.style.margin = "0";
    doc.body.style.display = "flex";
    doc.body.style.alignItems = "center";
    doc.body.style.justifyContent = "center";
    const img = doc.createElement("img");
    img.style.maxWidth = "100%";
    img.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
    img.src = apiUrl(finalImageUrl);
    doc.body.appendChild(img);
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
    setAttire(VARIATION_ATTIRE.same);
    setCropRect(DEFAULT_CROP_RECT);
    resetJob();
  }

  function resetJob() {
    stopChecking();
    attemptsRef.current = 0;
    setJobState("idle");
    setFinalImageUrl("");
    setError("");
  }

  function clearUpload() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setPhotoVariation(passportAttireOptions[0].key);
    setAttire(VARIATION_ATTIRE.same);
    setIsPreviewOpen(false);
    setIsCropOpen(false);
    setCropRect(DEFAULT_CROP_RECT);
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
    const variationAttire = VARIATION_ATTIRE[variation];
    if (variation === "men_blazer_tie") setGender("male");
    if (variation === "women_blazer_tie" || variation === "burqa") setGender("female");
    if (variationAttire) setAttire(variationAttire);
    resetJob();
  }

  async function generatePreview() {
    if (!file) return;

    setIsSubmitting(true);
    setJobState("submitting");
    setError("");
    try {
      const prompt = buildPrompt(gender, attire);
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("prompt", prompt);

      const response = await apiFetch("/api/save-raw-passport-photo/", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not start the photo request.");

      setJobState("processing");
      attemptsRef.current = 0;
      timeoutRef.current = setTimeout(() => checkStatus(result.id), CHECK_INTERVAL_MS);
    } catch (submitError) {
      setJobState("failed");
      setError(submitError instanceof Error ? submitError.message : "Could not start the photo request.");
    } finally {
      setIsSubmitting(false);
    }
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
        setJobState("done");
        setFinalImageUrl(result.imageUrl);
        return;
      }

      if (attemptsRef.current >= MAX_CHECK_ATTEMPTS) {
        setJobState("not_found");
        setError("We could not find your processed image yet. Please try again.");
        return;
      }

      timeoutRef.current = setTimeout(() => checkStatus(id), CHECK_INTERVAL_MS);
    } catch {
      if (attemptsRef.current >= MAX_CHECK_ATTEMPTS) {
        setJobState("not_found");
        setError("We could not find your processed image yet. Please try again.");
        return;
      }
      timeoutRef.current = setTimeout(() => checkStatus(id), CHECK_INTERVAL_MS);
    }
  }

  const isBusy = jobState === "submitting" || jobState === "processing";

  return (
    <DashboardShell activePath="/passport-photo">
      <div className="dashboard passport-photo-page">
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
                <SkeletonBlock lines={4} />
                <p>We are processing the AI image as per your requirement. Please wait...</p>
              </div>
            ) : null}

            {jobState === "done" && finalImageUrl ? (
              <div className="passport-final-preview">
                <img src={apiUrl(finalImageUrl)} alt="Final passport photo" />
              </div>
            ) : null}

            {jobState === "done" && finalImageUrl ? (
              <div className="passport-print-picker">
                <p className="customer-inline-help">
                  Choose the printer for this passport photo. This is separate from the PrintPilot printer selected in PrintPilot setup.
                </p>
                <div className="printer-radio-list">
                  {printers.map((printer) => (
                    <label className="printer-radio" key={printer}>
                      <input
                        checked={selectedPrinter === printer}
                        name="passport-printer"
                        type="radio"
                        onChange={() => choosePassportPrinter(printer)}
                      />
                      <span>{printer}</span>
                    </label>
                  ))}
                </div>
                {printerMessage ? <div className="profile-alert success">{printerMessage}</div> : null}
                {printerError ? <div className="profile-alert error">{printerError}</div> : null}
                <button className="passport-preview-button" type="button" onClick={printFinalPhoto} disabled={!selectedPrinter}>
                  <Printer size={18} /> Print on {selectedPrinter || "printer"}
                </button>
              </div>
            ) : null}

            {jobState === "idle" || jobState === "not_found" || jobState === "failed" ? (
              <p className="customer-inline-help">
                {jobState === "idle"
                  ? "Upload a photo, choose an attire, and tap Generate Photo to begin."
                  : "Something went wrong. Upload the photo again to retry."}
              </p>
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
