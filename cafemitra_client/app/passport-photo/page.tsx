"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, IdCard, Printer, Upload, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { SkeletonBlock } from "../UiState";
import { apiFetch, apiUrl } from "@/lib/api";

type Gender = "male" | "female";

type JobStatus = "idle" | "uploading" | "processing" | "done" | "failed";

type PassportJob = {
  id: number;
  status: "pending" | "processing" | "done" | "failed";
  finalImageUrl?: string;
  errorMessage?: string;
};

type PrintOrderSummary = {
  orderNumber: string;
  tokenId: string;
};

const POLL_INTERVAL_MS = 10_000;

export default function PassportPhotoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printOrder, setPrintOrder] = useState<PrintOrderSummary | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function handleFileChange(selected?: File) {
    if (!selected) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    resetJob();
  }

  function resetJob() {
    stopPolling();
    setJobId(null);
    setJobStatus("idle");
    setFinalImageUrl("");
    setError("");
    setPrintOrder(null);
  }

  function clearUpload() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    resetJob();
  }

  async function generatePreview() {
    if (!file) return;

    setIsSubmitting(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("gender", gender);

      const response = await apiFetch("/api/passport-photos/", { method: "POST", body: formData });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not start the photo request.");

      setJobId(result.id);
      setJobStatus("processing");
      startPolling(result.id);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not start the photo request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startPolling(id: number) {
    stopPolling();
    pollRef.current = setInterval(() => checkStatus(id), POLL_INTERVAL_MS);
  }

  async function checkStatus(id: number) {
    try {
      const response = await apiFetch(`/api/passport-photos/${id}/status/`);
      const result: PassportJob = await response.json().catch(() => ({}) as PassportJob);
      if (!response.ok) return;

      if (result.status === "done" && result.finalImageUrl) {
        stopPolling();
        setJobStatus("done");
        setFinalImageUrl(result.finalImageUrl);
        return;
      }

      if (result.status === "failed") {
        stopPolling();
        setJobStatus("failed");
        setError(result.errorMessage || "Photo generation failed. Please try again.");
      }
    } catch {
      // Keep polling; a transient network error should not stop the flow.
    }
  }

  async function sendToPrint() {
    if (!jobId) return;

    setIsPrinting(true);
    setError("");
    try {
      const response = await apiFetch(`/api/passport-photos/${jobId}/print/`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not send the photo to print.");
      setPrintOrder(result.order);
    } catch (printError) {
      setError(printError instanceof Error ? printError.message : "Could not send the photo to print.");
    } finally {
      setIsPrinting(false);
    }
  }

  return (
    <DashboardShell activePath="/passport-photo">
      <div className="dashboard passport-photo-page">
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">PrintPilot Passport Photo Maker</span>
            <h1>Passport Size Photo Maker</h1>
            <p>Upload a photo, pick male or female, and get an AI-touched-up passport photo ready for a 6-up A4 print sheet.</p>
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
                  <div className="passport-gender-control">
                    <span>Gender</span>
                    <div className="print-type-options">
                      <label className={gender === "male" ? "active" : ""}>
                        <input
                          checked={gender === "male"}
                          name="passport-gender"
                          type="radio"
                          value="male"
                          onChange={() => {
                            setGender("male");
                            resetJob();
                          }}
                        />
                        <span>
                          <strong>Male</strong>
                        </span>
                      </label>
                      <label className={gender === "female" ? "active" : ""}>
                        <input
                          checked={gender === "female"}
                          name="passport-gender"
                          type="radio"
                          value="female"
                          onChange={() => {
                            setGender("female");
                            resetJob();
                          }}
                        />
                        <span>
                          <strong>Female</strong>
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="document-actions">
                    <button type="button" onClick={clearUpload} disabled={jobStatus === "processing"}>
                      <X size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label className="customer-upload">
                <Upload size={24} />
                <strong>Upload Passport Photo</strong>
                <span>Upload a JPG, PNG, or JPEG image. We will pick the pose and background for a passport-ready result.</span>
                <em>Tap to choose a file</em>
                <input accept=".jpg,.jpeg,.png" type="file" onChange={(event) => handleFileChange(event.target.files?.[0])} />
              </label>
            )}

            {jobStatus === "idle" && file ? (
              <button className="passport-preview-button" type="button" onClick={generatePreview} disabled={isSubmitting}>
                <IdCard size={18} /> {isSubmitting ? "Starting..." : "Show Preview"}
              </button>
            ) : null}

            {error ? <div className="profile-alert error">{error}</div> : null}
          </article>

          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 2</span>
              <h2>Preview</h2>
            </div>

            {jobStatus === "processing" ? (
              <div className="passport-processing-state">
                <SkeletonBlock lines={4} />
                <p>Processing your photo. This can take a minute — we will keep checking automatically.</p>
              </div>
            ) : null}

            {jobStatus === "done" && finalImageUrl ? (
              <div className="passport-final-preview">
                <img src={apiUrl(finalImageUrl)} alt="Final passport photo" />
                {printOrder ? (
                  <div className="order-created-box">
                    <small>Sent to Print Queue</small>
                    <strong>{printOrder.orderNumber}</strong>
                    <div className="customer-token-card">
                      <div className="customer-token-head">
                        <small>Your Token ID</small>
                      </div>
                      <strong>{printOrder.tokenId}</strong>
                    </div>
                    <span>
                      <CheckCircle2 size={15} /> 6 copies queued on an A4 sheet for print.
                    </span>
                  </div>
                ) : (
                  <button className="passport-preview-button" type="button" onClick={sendToPrint} disabled={isPrinting}>
                    <Printer size={18} /> {isPrinting ? "Sending..." : "Print (6 on A4)"}
                  </button>
                )}
              </div>
            ) : null}

            {jobStatus === "idle" || jobStatus === "failed" ? (
              <p className="customer-inline-help">
                {jobStatus === "failed" ? "Something went wrong. Upload the photo again to retry." : "Upload a photo and tap Show Preview to begin."}
              </p>
            ) : null}
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
