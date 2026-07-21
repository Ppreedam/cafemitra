"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { IdCard, Upload, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { SkeletonBlock } from "../UiState";
import { apiFetch, apiUrl } from "@/lib/api";

type Gender = "male" | "female";

type JobState = "idle" | "submitting" | "processing" | "done" | "not_found" | "failed";

const MEN_ATTIRES = [
  "White dress shirt",
  "White shirt with navy blazer",
  "White shirt with black blazer",
  "Navy business suit",
  "Charcoal grey suit",
  "Black business suit",
  "Formal business attire",
  "Corporate office wear",
  "Professional executive suit",
];

const WOMEN_ATTIRES = [
  "White blouse with black blazer",
  "White blouse with navy blazer",
  "Navy business suit",
  "Black business suit",
  "Charcoal business suit",
  "Formal corporate attire",
  "Professional office wear",
  "Executive business attire",
];

const CHECK_INTERVAL_MS = 5_000;
const MAX_CHECK_ATTEMPTS = 7;

function buildPrompt(gender: Gender, attire: string) {
  const genderWord = gender === "male" ? "male" : "female";
  return `Generate a professional ${genderWord} passport photo. Requirements: Plain white or very light gray background, face centered and looking straight at camera with neutral expression, both ears visible, proper even lighting with no shadows on face, shoulders and upper chest visible, wearing ${attire.toLowerCase()}, high resolution output. Aspect ratio 4:5. The photo must meet official government passport photo standards.`;
}

export default function PassportPhotoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [attire, setAttire] = useState(MEN_ATTIRES[0]);
  const [jobState, setJobState] = useState<JobState>("idle");
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropRef = useRef<HTMLLabelElement | null>(null);
  const attemptsRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    resetJob();
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileChange(dropped);
  }

  function selectGender(nextGender: Gender) {
    setGender(nextGender);
    const defaultAttire = nextGender === "male" ? MEN_ATTIRES[0] : WOMEN_ATTIRES[0];
    setAttire(defaultAttire);
    resetJob();
  }

  function selectAttire(nextAttire: string) {
    setAttire(nextAttire);
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

  const attireOptions = gender === "male" ? MEN_ATTIRES : WOMEN_ATTIRES;
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
                </div>
                <div>
                  <strong>{file.name}</strong>
                  <div className="document-actions">
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
                <div className="attire-gender-tabs">
                  <button type="button" className={gender === "male" ? "active" : ""} onClick={() => selectGender("male")} disabled={isBusy}>
                    Men
                  </button>
                  <button type="button" className={gender === "female" ? "active" : ""} onClick={() => selectGender("female")} disabled={isBusy}>
                    Women
                  </button>
                </div>

                <div className="attire-options-grid">
                  {attireOptions.map((option) => (
                    <label key={option} className={`attire-option ${attire === option ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="passport-attire"
                        value={option}
                        checked={attire === option}
                        onChange={() => selectAttire(option)}
                        disabled={isBusy}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            {jobState === "idle" && file ? (
              <button className="passport-preview-button" type="button" onClick={generatePreview} disabled={isSubmitting}>
                <IdCard size={18} /> {isSubmitting ? "Starting..." : "Preview"}
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

            {jobState === "idle" || jobState === "not_found" || jobState === "failed" ? (
              <p className="customer-inline-help">
                {jobState === "idle"
                  ? "Upload a photo, choose an attire, and tap Preview to begin."
                  : "Something went wrong. Upload the photo again to retry."}
              </p>
            ) : null}
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
