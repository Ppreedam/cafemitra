"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, IdCard, Loader2, Plus, RefreshCw, Settings, Trash2, Upload, Users, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { WalletLimitBanner } from "../WalletLimitBanner";
import Link from "next/link";
import { apiFetch, apiUrl } from "@/lib/api";
import { fetchPricingServiceByKey, type PriceItem } from "@/lib/pricing";
import { buildFamilyPhotoPrompt } from "@/lib/family-photo-prompt";
import { stashPhotoForPrintSheet } from "@/lib/printSheetHandoff";

type JobState = "idle" | "submitting" | "processing" | "done" | "not_found" | "failed";

const goodPhotoExamples = [
  { src: "/Good_bad_image/GoodImage1.jpg", caption: "Face clearly visible, straight look" },
  { src: "/Good_bad_image/GoodImage3.jpg", caption: "Plain, light background" },
  { src: "/Good_bad_image/GoodImage2.jpg", caption: "Both ears visible" },
  { src: "/Good_bad_image/GoodImage4.jpg", caption: "Neutral expression, mouth closed" },
];

const avoidPhotoExamples = [
  { src: "/Good_bad_image/avoid1.jpg", caption: "Sunglasses or cap" },
  { src: "/Good_bad_image/avoid2.jpg", caption: "Blurry or low-resolution photo" },
  { src: "/Good_bad_image/avoid3.jpg", caption: "Shadows across the face" },
  { src: "/Good_bad_image/avoid4.jpg", caption: "Angled or side pose" },
];

const MIN_PHOTOS = 2;
const MAX_PHOTOS = 6;
const CHECK_INTERVAL_MS = 5_000;
// ~4 min: covers the GPT Pooler's group-photo generation plus the server's
// AI fallback if the pooler goes silent (FAMILY_PHOTO_STALE_JOB_SECONDS).
const MAX_CHECK_ATTEMPTS = 48;

type FamilySlot = { id: string; file: File | null; previewUrl: string };

function makeSlot(): FamilySlot {
  return { id: Math.random().toString(36).slice(2), file: null, previewUrl: "" };
}

export default function FamilyPassportPhotoClient() {
  const router = useRouter();
  const [slots, setSlots] = useState<FamilySlot[]>(() => [makeSlot(), makeSlot()]);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [selectedPriceItemId, setSelectedPriceItemId] = useState("");
  const [jobState, setJobState] = useState<JobState>("idle");
  const [jobId, setJobId] = useState<number | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSlotId, setPreviewSlotId] = useState<string | null>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadPricingSetup();
    return () => {
      stopChecking();
      slots.forEach((slot) => {
        if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPricingSetup() {
    try {
      const service = await fetchPricingServiceByKey("family_passport_photo");
      const items = Array.isArray(service?.settings.priceItems) ? (service.settings.priceItems as PriceItem[]) : [];
      setPriceItems(items);
      setSelectedPriceItemId((current) => (items.some((item) => item.id === current) ? current : items[0]?.id || ""));
    } catch {
      // Package list is a convenience; leave whatever was already loaded.
    }
  }

  function stopChecking() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function resetJob() {
    stopChecking();
    attemptsRef.current = 0;
    setJobState("idle");
    setJobId(null);
    setFinalImageUrl("");
    setError("");
  }

  // Lets one file-picker selection (multiple files at once) fill several
  // slots in one go: existing empty slots first, then new slots are created
  // for whatever's left, up to MAX_PHOTOS. Works the same whether triggered
  // from a specific empty slot's input or the "Add person" tile - only
  // empty slots ever get filled, so it doesn't matter which one was clicked.
  function distributeFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const emptySlotCount = slots.filter((slot) => !slot.file).length;
    const roomForNewSlots = Math.max(0, MAX_PHOTOS - slots.length);
    const usable = files.slice(0, emptySlotCount + roomForNewSlots);

    setSlots((current) => {
      const next = [...current];
      let fileIndex = 0;
      for (let i = 0; i < next.length && fileIndex < usable.length; i += 1) {
        if (!next[i].file) {
          next[i] = { ...next[i], file: usable[fileIndex], previewUrl: URL.createObjectURL(usable[fileIndex]) };
          fileIndex += 1;
        }
      }
      while (fileIndex < usable.length && next.length < MAX_PHOTOS) {
        next.push({ id: Math.random().toString(36).slice(2), file: usable[fileIndex], previewUrl: URL.createObjectURL(usable[fileIndex]) });
        fileIndex += 1;
      }
      return next;
    });

    resetJob();
    if (files.length > usable.length) setError(`Only ${MAX_PHOTOS} photos are allowed at a time - the rest were skipped.`);
  }

  function removeSlot(slotId: string) {
    setSlots((current) => {
      const target = current.find((slot) => slot.id === slotId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      const next = current.filter((slot) => slot.id !== slotId);
      return next.length >= MIN_PHOTOS ? next : [...next, makeSlot()];
    });
    resetJob();
  }

  const filledSlots = slots.filter((slot) => slot.file);
  const canGenerate = filledSlots.length >= MIN_PHOTOS;
  const isBusy = jobState === "submitting" || jobState === "processing";
  const selectedPackage = priceItems.find((item) => item.id === selectedPriceItemId) || priceItems[0];
  const previewSlot = slots.find((slot) => slot.id === previewSlotId && slot.file) || null;

  async function generateFamilyPhoto() {
    if (!canGenerate) return;

    setIsSubmitting(true);
    setJobState("submitting");
    setError("");
    try {
      const formData = new FormData();
      filledSlots.forEach((slot) => {
        if (slot.file) formData.append("photos", slot.file);
      });
      formData.append("prompt", buildFamilyPhotoPrompt(filledSlots.length));
      if (selectedPackage) {
        formData.append("priceItemId", selectedPackage.id);
        formData.append("priceLabel", selectedPackage.label);
        formData.append("rate", String(selectedPackage.rate));
      }

      const response = await apiFetch("/api/save-raw-family-photo/", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not start the family photo request.");

      setJobState("processing");
      setJobId(result.id);
      attemptsRef.current = 0;
      timeoutRef.current = setTimeout(() => checkStatus(result.id), CHECK_INTERVAL_MS);
    } catch (submitError) {
      setJobState("failed");
      setError(submitError instanceof Error ? submitError.message : "Could not start the family photo request.");
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
    checkStatus(jobId);
  }

  async function checkStatus(id: number) {
    attemptsRef.current += 1;
    try {
      const response = await apiFetch("/api/api-family-photo-check/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.found && result.imageUrl) {
        stopChecking();
        setJobState("done");
        setFinalImageUrl(result.imageUrl);
        stashPhotoForPrintSheet(result.imageUrl, "family-passport-photo.jpg");
        return;
      }

      if (response.ok && !result.found) {
        stopChecking();
        setJobState("failed");
        setError(result.message || "Photo generation failed. Please try again.");
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

  return (
    <DashboardShell activePath="/family-passport-photo">
      <div className="dashboard passport-photo-page">
        <WalletLimitBanner />
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">PrintPilot Family Photo Maker</span>
            <h1>Family Passport Photo Maker</h1>
            <p>Upload one photo per family member (2 to {MAX_PHOTOS} people) and get a single AI-merged family group photo.</p>
          </div>
          <div className="auto-print-hero-actions">
            <Link className="icon-action-btn" href="/pricing-settings" aria-label="Pricing settings" title="Pricing settings">
              <Settings size={18} />
            </Link>
            <span className="status-pill">AI Powered</span>
          </div>
        </div>

        <section className="passport-maker-grid">
          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 1</span>
              <h2>Upload Everyone&apos;s Photo</h2>
            </div>
            <p className="customer-inline-help">Each photo should be a clear, front-facing headshot of one person - same guidance as a single passport photo.</p>

            <div className="family-photo-slots">
              {slots.map((slot, index) => (
                <div className="family-photo-slot" key={slot.id}>
                  {slot.file ? (
                    <div className="customer-document-preview">
                      <div className="document-thumb">
                        <img src={slot.previewUrl} alt="" />
                        <button className="document-thumb-preview" type="button" onClick={() => setPreviewSlotId(slot.id)} aria-label="Preview photo">
                          <Eye size={17} />
                        </button>
                      </div>
                      <div>
                        <strong>Person {index + 1}</strong>
                        <div className="document-actions">
                          <button type="button" onClick={() => removeSlot(slot.id)} disabled={isBusy}>
                            <X size={16} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="customer-upload">
                      <Upload size={22} />
                      <strong>Person {index + 1}</strong>
                      <span>Upload JPG/PNG photo - pick multiple at once to fill several people</span>
                      <input
                        accept=".jpg,.jpeg,.png"
                        type="file"
                        multiple
                        onChange={(event) => {
                          distributeFiles(event.target.files);
                          event.target.value = "";
                        }}
                        disabled={isBusy}
                      />
                    </label>
                  )}
                </div>
              ))}

              {slots.length < MAX_PHOTOS ? (
                <label className="family-photo-add-slot">
                  <Plus size={20} />
                  <span>Add person</span>
                  <input
                    accept=".jpg,.jpeg,.png"
                    type="file"
                    multiple
                    onChange={(event) => {
                      distributeFiles(event.target.files);
                      event.target.value = "";
                    }}
                    disabled={isBusy}
                  />
                </label>
              ) : null}
            </div>

            {priceItems.length ? (
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

            {jobState === "idle" ? (
              <button className="passport-preview-button" type="button" onClick={generateFamilyPhoto} disabled={!canGenerate || isSubmitting}>
                <Users size={18} /> {isSubmitting ? "Starting..." : `Generate Family Photo (${filledSlots.length})`}
              </button>
            ) : null}
            {jobState === "idle" && !canGenerate ? (
              <small className="customer-inline-help">Upload at least {MIN_PHOTOS} photos to continue.</small>
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
                <Loader2 size={28} className="passport-step-spin" />
                <p>Merging {filledSlots.length} photos into one family portrait - this can take up to a minute.</p>
              </div>
            ) : null}

            {jobState === "done" && finalImageUrl ? (
              <>
                <div className="passport-final-preview">
                  <div className="passport-final-preview-frame">
                    <img src={apiUrl(finalImageUrl)} alt="Final family passport photo" />
                    <span className="passport-final-preview-badge">
                      <Check size={12} /> Ready
                    </span>
                  </div>
                </div>
                <button className="passport-preview-button" type="button" onClick={() => router.push("/photo-print-sheet")}>
                  <IdCard size={18} /> Print / Download
                </button>
              </>
            ) : null}

            {jobState === "idle" || jobState === "not_found" || jobState === "failed" ? (
              <p className="customer-inline-help">
                {jobState === "idle"
                  ? `Upload ${MIN_PHOTOS}-${MAX_PHOTOS} photos and tap Generate Family Photo to begin.`
                  : "Something went wrong. Try generating again."}
              </p>
            ) : null}

            {jobState === "idle" ? (
              <div className="passport-photo-guide">
                <div className="passport-photo-guide-group">
                  <span className="passport-photo-guide-label good">Good examples</span>
                  <div className="passport-photo-guide-row">
                    {goodPhotoExamples.map((example) => (
                      <figure key={example.caption}>
                        <span className="passport-photo-guide-thumb">
                          <img src={example.src} alt={example.caption} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                        </span>
                        <figcaption>{example.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
                <div className="passport-photo-guide-group">
                  <span className="passport-photo-guide-label avoid">Avoid</span>
                  <div className="passport-photo-guide-row">
                    {avoidPhotoExamples.map((example) => (
                      <figure key={example.caption}>
                        <span className="passport-photo-guide-thumb">
                          <img src={example.src} alt={example.caption} onError={(event) => { event.currentTarget.style.display = "none"; }} />
                        </span>
                        <figcaption>{example.caption}</figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {jobState === "not_found" && jobId !== null ? (
              <button className="passport-preview-button" type="button" onClick={retryCheck}>
                <RefreshCw size={18} /> Retry
              </button>
            ) : null}
          </article>
        </section>
      </div>

      {previewSlot ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Photo preview">
          <div className="document-preview-window">
            <div className="document-preview-head">
              <div>
                <strong>{previewSlot.file?.name}</strong>
                <span>Preview</span>
              </div>
              <button type="button" onClick={() => setPreviewSlotId(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="document-preview-body">
              <img src={previewSlot.previewUrl} alt="" />
            </div>
            <div className="document-preview-actions">
              <button type="button" onClick={() => setPreviewSlotId(null)}>
                <X size={16} /> Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  removeSlot(previewSlot.id);
                  setPreviewSlotId(null);
                }}
              >
                <Trash2 size={16} /> Remove File
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
