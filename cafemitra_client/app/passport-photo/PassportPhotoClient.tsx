"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Circle, Crop, Eye, IdCard, Laugh, Loader2, Printer, RefreshCw, Settings, Sparkles, Trash2, Upload, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { WalletLimitBanner } from "../WalletLimitBanner";
import { apiFetch, apiUrl, dataUriToBlob } from "@/lib/api";
import { fetchPricingServiceByKey, type PriceItem } from "@/lib/pricing";
import { buildPassportPrompt, passportAttireOptions } from "@/lib/passport-attire";
import { stashPhotoForPrintSheet } from "@/lib/printSheetHandoff";
import { CropEditor, cropImage, DEFAULT_CROP_QUAD, DEFAULT_CROP_RECT, PerspectiveCropEditor, warpPerspectiveCrop, type CropQuad, type CropRect } from "../CropEditor";
import { buildPrintSheetHtml, maxTilesForPaper, openPrintSheet as openManualPrintSheet, parsePhotoCount, type PaperSize } from "./printSheet";

type JobState = "idle" | "submitting" | "processing" | "done" | "not_found" | "failed";
type ToolMode = "ai" | "manual";

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

// Shown once the fake progress animation reaches "Analyzing" and the real
// server response is still taking a while - gives the customer something to
// read at the counter instead of staring at a spinner.
const WAITING_JOKES = [
  "Teacher: Tumhara homework kahan hai? Student: Sir, wo bhi AI processing me hai, thoda wait kariye.",
  "Ek printer doosre printer se bola - bhai, kaam se break chahiye. Doosra bola - tu to already jam pe hai.",
  "Pappu interview me bola: Sir mujhe multitasking aati hai. Interviewer: Example do. Pappu: Main khana khate waqt sochta hun ki kal kya khaunga.",
  "Wife: Aap mujhe kitna pyaar karte ho? Husband: Utna jitna ye passport photo load hone me time le raha hai. Wife: Ye kya jawab hua? Husband: Bas thoda aur wait karo, samajh jaogi.",
  "Ek aadmi bank me bola: Mera balance check karo. Cashier: Sir aapka balance to aapki personality jaisa hai - kam hai. Aadmi: Matlab? Cashier: Zero ke aas paas.",
  "Boss: Kaam kahan tak pahucha? Employee: Sir, AI process kar raha hai. Boss: Aur tum? Employee: Main uska result wait kar raha hun, jaise aap abhi kar rahe ho.",
  "Ek chai wala apne dost se bola: Aaj kal sabko instant chahiye. Dost: Kyun? Chai wala: Chai bhi, aur passport photo bhi.",
  "Student ne teacher se pucha: Sir AI kitna smart hai? Teacher: Itna ki tumhari copy check karne se pehle soch leta hai ki galtiyan kitni honi chahiye.",
  "Pati: Tumhe pata hai patience kya hoti hai? Patni: Haan, jaise main tumhara jawab sunne se pehle ye photo process hone ka wait kar rahi hun.",
  "Ek naya customer shop pe aaya aur bola: Jaldi karo bhai, time nahi hai. Dukaandaar: Bhaisahab, AI bhi insaan jaisa hai - jaldi karoge to result kharab aayega.",
  "Do dost baat kar rahe the: Yaar tumhara passport photo kab tak banega? Dusra: Bas thoda sabr rakh, main bhi tere jaise AI ka wait kar raha hun.",
  "Interviewer: Apni sabse badi khoobi batao. Candidate: Sir, main wait karna jaanta hun - jaise abhi is photo ka process hone ka kar raha hoon.",
  "Ek aadmi doctor ke paas gaya: Doctor sahab, mujhe patience kam hai. Doctor: Thoda ruko, report aane do, phir dawai bataunga.",
  "Beta: Papa, AI kaise kaam karta hai? Papa: Beta, jaise tum result ka wait karte ho na exam ke baad, waise hi ye bhi wait karwata hai.",
  "Teacher ne class me pucha: Fast kaam karne ka raaz kya hai? Student: Sir, jaldi karne se kabhi kabhi photo kharab ban jaati hai, isliye AI thoda time leta hai.",
  "Ek grahak ne dukaandaar se pucha: Photo itna time kyun le raha hai? Dukaandaar: Bhaisahab, achhi cheez me thoda time to lagta hi hai - jaise achhi chai banane me.",
];

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

export type ExistingPassportOrder = {
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

export default function PassportPhotoClient() {
  const router = useRouter();
  const [mode, setMode] = useState<ToolMode>("ai");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [photoVariation, setPhotoVariation] = useState(passportAttireOptions[0].key);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [selectedPriceItemId, setSelectedPriceItemId] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP_RECT);
  const [cropQuad, setCropQuad] = useState<CropQuad>(DEFAULT_CROP_QUAD);
  const [cropMode, setCropMode] = useState<"straight" | "perspective">("perspective");
  const [jobState, setJobState] = useState<JobState>("idle");
  const [jobId, setJobId] = useState<number | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewOrder, setViewOrder] = useState<ExistingPassportOrder | null>(null);
  const [manualInitialOrder, setManualInitialOrder] = useState<ExistingPassportOrder | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [paperSize, setPaperSize] = useState<PaperSize | null>(null);
  const [manualPaperSize, setManualPaperSize] = useState<PaperSize | null>(null);
  const [useCustomTiles, setUseCustomTiles] = useState(false);
  const [customTileWidth, setCustomTileWidth] = useState(1.2);
  const [customTileHeight, setCustomTileHeight] = useState(1.6);
  const [customTileCount, setCustomTileCount] = useState<number | null>(null);
  const [stepCursor, setStepCursor] = useState(0);
  const [showJokes, setShowJokes] = useState(false);
  const [jokeIndex, setJokeIndex] = useState(0);
  const dropRef = useRef<HTMLLabelElement | null>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jokeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jokeTriggeredRef = useRef(false);

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

  // The step animation is a fixed-duration cosmetic sequence, independent of
  // the real checkStatus polling below. Once it reaches step 2 (Cropping),
  // arm a single 2-second timer for a joke - a ref guard keeps it from being
  // re-armed (and its delay reset) on every later stepCursor tick, since
  // most step durations are themselves under 2s. Fixed-positioned so it
  // stays in view no matter where the customer has scrolled.
  useEffect(() => {
    if (jobState !== "processing") {
      jokeTriggeredRef.current = false;
      setShowJokes(false);
      if (jokeTimeoutRef.current) {
        clearTimeout(jokeTimeoutRef.current);
        jokeTimeoutRef.current = null;
      }
      return;
    }
    const reachedStepTwo = stepCursor >= PROCESSING_GROUP_RANGES[1].start;
    if (reachedStepTwo && !jokeTriggeredRef.current) {
      jokeTriggeredRef.current = true;
      jokeTimeoutRef.current = setTimeout(() => {
        setJokeIndex(Math.floor(Math.random() * WAITING_JOKES.length));
        setShowJokes(true);
      }, 2000);
    }
  }, [stepCursor, jobState]);

  useEffect(() => {
    return () => {
      if (jokeTimeoutRef.current) clearTimeout(jokeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    loadPricingSetup();
  }, []);

  useEffect(() => {
    const orderId = new URLSearchParams(window.location.search).get("orderId");
    if (orderId) loadExistingOrder(Number(orderId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadExistingOrder(orderId: number) {
    setIsLoadingOrder(true);
    try {
      const response = await apiFetch(`/api/orders/${orderId}/`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.order) throw new Error(result.message || "Could not load this order.");

      const order: ExistingPassportOrder = result.order;
      if (order.attireCategory === "manual") {
        setMode("manual");
        setManualInitialOrder(order);
        return;
      }

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
    } finally {
      setIsLoadingOrder(false);
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

  function printManualSheet(size: PaperSize) {
    if (!manualInitialOrder?.geminiPhoto) return;
    setManualPaperSize(size);
    if (useCustomTiles) {
      const maxFit = maxTilesForPaper(size, customTileWidth, customTileHeight).max;
      const count = Math.min(customTileCount ?? maxFit, maxFit);
      openManualPrintSheet(size, apiUrl(manualInitialOrder.geminiPhoto), count, customTileWidth, customTileHeight);
    } else {
      const count = parsePhotoCount(manualInitialOrder.priceLabel);
      openManualPrintSheet(size, apiUrl(manualInitialOrder.geminiPhoto), count);
    }
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
    setCropQuad(DEFAULT_CROP_QUAD);
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
    setCropQuad(DEFAULT_CROP_QUAD);
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
      const croppedBlob = cropMode === "perspective" ? await warpPerspectiveCrop(previewUrl, cropQuad) : await cropImage(previewUrl, cropRect);
      const croppedFile = new File([croppedBlob], (file?.name || "photo").replace(/(\.[^.]+)?$/, "-cropped.png"), { type: "image/png" });
      URL.revokeObjectURL(previewUrl);
      setFile(croppedFile);
      setPreviewUrl(URL.createObjectURL(croppedFile));
      setIsCropOpen(false);
      setCropRect(DEFAULT_CROP_RECT);
      setCropQuad(DEFAULT_CROP_QUAD);
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
        stashPhotoForPrintSheet(result.imageUrl, file?.name || "passport-photo.jpg");
        router.push("/photo-print-sheet");
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
            <p>
              {mode === "ai"
                ? "Upload a photo, choose a professional attire, and get an AI-generated passport photo that meets official standards."
                : "Upload a photo and manually remove the background, crop it to size, and adjust it yourself - no AI wait, no AI cost."}
            </p>
          </div>
          <div className="auto-print-hero-actions">
            <Link className="icon-action-btn" href="/pricing-settings" aria-label="Pricing settings" title="Pricing settings">
              <Settings size={18} />
            </Link>
            <span className="status-pill">{mode === "ai" ? "AI Powered" : "Manual Edit"}</span>
          </div>
        </div>

        <div className="passport-mode-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "ai"} className={mode === "ai" ? "active" : ""} onClick={() => setMode("ai")}>
            AI Generate
          </button>
          <button type="button" role="tab" aria-selected={mode === "manual"} className={mode === "manual" ? "active" : ""} onClick={() => setMode("manual")}>
            Manual Edit
          </button>
        </div>

        {mode === "manual" ? (
          <section className="passport-maker-grid">
            <article className="customer-panel">
              <div className="customer-panel-head">
                <span>Step 1</span>
                <h2>Edit With Photo Editor</h2>
              </div>
              <p className="customer-inline-help">
                Edit your photo with the full toolset - background removal, ratio-locked passport/ID crop presets, brightness/contrast/filters,
                and a Name &amp; DOB caption for exam forms - then save it as your passport photo directly from there.
              </p>
              <Link className="passport-preview-button" href="/image-tools/photo-editor?for=passport">
                <Sparkles size={18} /> Open Photo Editor
              </Link>
            </article>

            <article className="customer-panel">
              <div className="customer-panel-head">
                <span>Step 2</span>
                <h2>Preview</h2>
              </div>

              {manualInitialOrder?.geminiPhoto ? (
                <>
                  <div className="passport-final-preview">
                    <div className="passport-final-preview-frame">
                      <img src={apiUrl(manualInitialOrder.geminiPhoto)} alt="Final passport photo" />
                      <span className="passport-final-preview-badge">
                        <Check size={12} /> Ready
                      </span>
                    </div>
                  </div>
                  <div className="passport-attire-picker">
                    <span>Paper Size</span>
                    <div className="passport-papersize-options">
                      <label className={`passport-papersize-radio${manualPaperSize === "4x6" ? " active" : ""}`}>
                        <input
                          type="radio"
                          name="manual-passport-paper-size"
                          checked={manualPaperSize === "4x6"}
                          onChange={() => setManualPaperSize("4x6")}
                          onClick={() => (useCustomTiles ? setManualPaperSize("4x6") : printManualSheet("4x6"))}
                        />
                        <span>4x6 Photo Paper</span>
                      </label>
                      <label className={`passport-papersize-radio${manualPaperSize === "a4" ? " active" : ""}`}>
                        <input
                          type="radio"
                          name="manual-passport-paper-size"
                          checked={manualPaperSize === "a4"}
                          onChange={() => setManualPaperSize("a4")}
                          onClick={() => (useCustomTiles ? setManualPaperSize("a4") : printManualSheet("a4"))}
                        />
                        <span>A4 Sheet</span>
                      </label>
                    </div>
                  </div>

                  <div className="passport-attire-picker">
                    <label className="manual-inline-toggle">
                      <input type="checkbox" checked={useCustomTiles} onChange={(event) => setUseCustomTiles(event.target.checked)} />
                      <span>Custom Tile Size</span>
                    </label>
                    {useCustomTiles ? (() => {
                      const max4x6 = maxTilesForPaper("4x6", customTileWidth, customTileHeight).max;
                      const maxA4 = maxTilesForPaper("a4", customTileWidth, customTileHeight).max;
                      const maxForSelected = manualPaperSize === "a4" ? maxA4 : manualPaperSize === "4x6" ? max4x6 : Math.max(max4x6, maxA4);
                      return (
                        <>
                          <div className="manual-field-grid manual-field-grid-3">
                            <label>
                              <span>Width (in)</span>
                              <input type="number" min="0.5" step="0.1" value={customTileWidth} onChange={(event) => setCustomTileWidth(Math.max(0.5, Number(event.target.value) || 0.5))} />
                            </label>
                            <label>
                              <span>Height (in)</span>
                              <input type="number" min="0.5" step="0.1" value={customTileHeight} onChange={(event) => setCustomTileHeight(Math.max(0.5, Number(event.target.value) || 0.5))} />
                            </label>
                            <label>
                              <span>Number of Tiles</span>
                              <input
                                type="number"
                                min="1"
                                max={maxForSelected}
                                placeholder={`Auto (${maxForSelected})`}
                                value={customTileCount ?? ""}
                                onChange={(event) => setCustomTileCount(event.target.value ? Math.max(1, Number(event.target.value)) : null)}
                              />
                            </label>
                          </div>
                          <small className="customer-inline-help">
                            Fits up to {max4x6} on 4x6 Photo Paper, {maxA4} on A4 Sheet - leave Number of Tiles blank to auto-fill the sheet, or set a smaller count.
                          </small>
                          <button
                            type="button"
                            className="passport-preview-button"
                            disabled={!manualPaperSize}
                            onClick={() => manualPaperSize && printManualSheet(manualPaperSize)}
                          >
                            <Printer size={18} /> Generate Print Sheet
                          </button>
                          {!manualPaperSize ? <small className="customer-inline-help">Pick a paper size above first.</small> : null}
                        </>
                      );
                    })() : null}
                  </div>
                </>
              ) : (
                <p className="customer-inline-help">Once you save a photo from Photo Editor, it will appear here ready to print.</p>
              )}
            </article>
          </section>
        ) : isLoadingOrder ? (
          <div className="passport-order-loading">
            <Loader2 size={28} className="passport-step-spin" />
            <strong>Loading your order...</strong>
            <span>Fetching your photo, this can take a moment.</span>
          </div>
        ) : (
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
                <div className="passport-final-preview-frame">
                  <img src={apiUrl(finalImageUrl)} alt="Final passport photo" />
                  <span className="passport-final-preview-badge">
                    <Check size={12} /> Ready
                  </span>
                </div>
              </div>
            ) : null}

            {jobState === "idle" || jobState === "not_found" || jobState === "failed" ? (
              <p className="customer-inline-help">
                {jobState === "idle"
                  ? "Upload a photo, choose an attire, and tap Generate Photo to begin."
                  : "Something went wrong. Upload the photo again to retry."}
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
        )}
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
              <button type="button" onClick={() => { setIsPreviewOpen(false); setIsCropOpen(true); }}>
                <Crop size={16} /> Crop Photo
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
              <div className="crop-mode-toggle">
                <button type="button" className={cropMode === "perspective" ? "active" : ""} onClick={() => setCropMode("perspective")}>
                  Perspective crop
                </button>
                <button type="button" className={cropMode === "straight" ? "active" : ""} onClick={() => setCropMode("straight")}>
                  Straight crop
                </button>
              </div>
              {cropMode === "straight" ? (
                <CropEditor fileUrl={previewUrl} rect={cropRect} onRectChange={setCropRect} />
              ) : (
                <PerspectiveCropEditor fileUrl={previewUrl} quad={cropQuad} onQuadChange={setCropQuad} />
              )}
              <div className="crop-controls">
                <p>
                  {cropMode === "straight"
                    ? "Drag a corner or edge to resize the crop area. Drag inside the box to move it."
                    : "Drag each corner onto the photo's actual edge - useful when it was taken at an angle. Click anywhere on an edge to move its nearest corner there."}
                </p>
                <button type="button" onClick={() => (cropMode === "straight" ? setCropRect(DEFAULT_CROP_RECT) : setCropQuad(DEFAULT_CROP_QUAD))}>
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

      {showJokes ? (
        <div className="passport-joke-widget" role="status" aria-live="polite">
          <button type="button" className="passport-joke-close" aria-label="Dismiss" onClick={() => setShowJokes(false)}>
            <X size={14} />
          </button>
          <div className="passport-joke-head">
            <span className="passport-joke-badge">
              <Laugh size={20} aria-hidden />
            </span>
            <span>Bas thodi der aur - ek joke sun lijiye</span>
          </div>
          <p className="passport-joke-text">
            <span className="passport-joke-quote" aria-hidden>&ldquo;</span>
            {WAITING_JOKES[jokeIndex]}
          </p>
          <div className="passport-joke-nav">
            <button type="button" onClick={() => setJokeIndex((i) => (i - 1 + WAITING_JOKES.length) % WAITING_JOKES.length)}>
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="passport-joke-count">{jokeIndex + 1}/{WAITING_JOKES.length}</span>
            <button type="button" onClick={() => setJokeIndex((i) => (i + 1) % WAITING_JOKES.length)}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
