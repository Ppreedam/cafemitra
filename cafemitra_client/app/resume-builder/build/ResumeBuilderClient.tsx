"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Download, Eye, FolderOpen, LogIn, Printer, RotateCcw, Save, Sparkles, Wallet } from "lucide-react";
import { apiFetch, hasStoredSession } from "@/lib/api";
import { TEMPLATES, type TemplateId } from "../templates";
import { useTemplatePrices } from "../useTemplatePrices";
import { useListOps } from "../useListOps";
import { resumeFileSlug, triggerPdfDownload } from "../downloadPdf";
import TemplatePicker from "../TemplatePicker";
import ResumeFormFields from "../ResumeFormFields";
import { ResumePreviewPage } from "../ResumePreview";
import { ResumeScaleStage } from "../ResumeScaleStage";
import CustomerOrderPanel from "./CustomerOrderPanel";
import {
  blankResume,
  resumeHasContent,
  sampleResume,
  STORAGE_KEY,
  type CertItem,
  type EducationItem,
  type ExperienceItem,
  type ProjectItem,
  type ResumeCustomField,
  type ResumeCustomSection,
  type ResumeData,
  type SavedOrderSummary,
} from "../resumeModel";
import { buildPreviewPdf, buildResumePdf } from "../pdfBuilder";

async function chargeResumeDownload(template: TemplateId) {
  const response = await apiFetch("/api/tools/resume-builder-charge/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template }),
  });
  if (response.ok) return;
  const data = await response.json().catch(() => ({}));
  throw new Error(data.message || "Could not verify your wallet balance. Please try again.");
}

// Prints a generated PDF straight from the browser - a hidden iframe loads the
// blob so the browser's own PDF viewer (and its print dialog) handles it,
// without depending on the separate PrintPilot desktop agent being connected.
function printPdfBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  };
  document.body.appendChild(iframe);
  setTimeout(() => {
    iframe.remove();
    URL.revokeObjectURL(url);
  }, 60_000);
}

export default function ResumeBuilderClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const templatePrices = useTemplatePrices<TemplateId>("resume_builder_");
  const [resume, setResume] = useState<ResumeData>(sampleResume);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const busy = downloadBusy || printBusy || previewBusy;
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [savedOrder, setSavedOrder] = useState<SavedOrderSummary | null>(null);
  const [forCustomer, setForCustomer] = useState(false);
  const [customerPaymentMode, setCustomerPaymentMode] = useState<"cash" | "online">("cash");
  const [saveBusy, setSaveBusy] = useState(false);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [chargeConfirm, setChargeConfirm] = useState<{ price: number; label: string; resolve: (ok: boolean) => void } | null>(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [templatesExpanded, setTemplatesExpanded] = useState(false);
  const loginNextUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  // Building and previewing a resume is free for anyone. Login is only
  // required for the actions that actually produce/save an output, so the
  // gate shows up as a clear prompt here instead of a confusing "session
  // expired" error surfacing later from a failed API call.
  function requireLogin() {
    if (hasStoredSession()) return true;
    setLoginPrompt(true);
    return false;
  }
  const skipNextSaveRef = useRef(false);
  // Downloading/printing is blocked once a resume is marked as for-customer
  // until that customer's payment actually clears - the watermarked Preview
  // stays available throughout so the cafe can still show them the result.
  const locked = forCustomer && savedOrder?.paymentStatus !== "paid";
  const templateLabel = TEMPLATES.find((tpl) => tpl.id === resume.template)?.label || resume.template;

  // Free templates (or prices not loaded yet) skip the modal entirely - only
  // an actual wallet deduction needs confirming.
  function requestChargeConfirm(price: number | undefined, label: string) {
    if (!price) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => setChargeConfirm({ price, label, resolve }));
  }

  function answerChargeConfirm(ok: boolean) {
    chargeConfirm?.resolve(ok);
    setChargeConfirm(null);
  }

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setResume((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch {
      // Ignore a corrupted or unavailable draft - the sample resume stays as the fallback.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    // Arriving from the template gallery ("?template=modern") should apply that
    // choice on top of whatever draft was just loaded, without discarding its content.
    const requested = searchParams.get("template");
    if (requested && TEMPLATES.some((tpl) => tpl.id === requested)) {
      setResume((prev) => ({ ...prev, template: requested as TemplateId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    // Arriving from "My Resumes" ("?savedId=42") replaces the whole draft with
    // that saved resume, rather than merging on top like the template param does -
    // opening a specific saved resume is a deliberate "switch to this one" action.
    const savedId = searchParams.get("savedId");
    if (!savedId) return;
    let cancelled = false;
    apiFetch("/api/tools/resume-builder/saved/")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { resumes?: SavedOrderSummary[] } | null) => {
        if (cancelled || !data?.resumes) return;
        const match = data.resumes.find((entry) => String(entry.id) === savedId);
        if (match) {
          setResume((prev) => ({ ...prev, ...match.data }));
          setSavedOrder(match);
          setForCustomer(match.forCustomer);
          if (match.paymentMode === "Online") setCustomerPaymentMode("online");
          else if (match.paymentMode === "Cash") setCustomerPaymentMode("cash");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!loaded) return;
    if (skipNextSaveRef.current) {
      // Clearing the form is a soft delete - it blanks the view without touching the saved draft, so a refresh brings the data back.
      skipNextSaveRef.current = false;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  }, [resume, loaded]);

  const experienceOps = useListOps<ExperienceItem>("experience", setResume);
  const educationOps = useListOps<EducationItem>("education", setResume);
  const projectOps = useListOps<ProjectItem>("projects", setResume);
  const certOps = useListOps<CertItem>("certifications", setResume);
  const customFieldOps = useListOps<ResumeCustomField>("customFields", setResume);
  const customSectionOps = useMemo(
    () => ({
      add: (blank: ResumeCustomSection) => setResume((r) => ({ ...r, customSections: [...(r.customSections || []), blank] })),
      update: (id: string, patch: Partial<Pick<ResumeCustomSection, "title">>) =>
        setResume((r) => ({ ...r, customSections: (r.customSections || []).map((section) => (section.id === id ? { ...section, ...patch } : section)) })),
      // Dropping a section also drops the fields filed under it, so removed
      // sections don't leave orphaned fields lingering invisibly in the data.
      remove: (id: string) =>
        setResume((r) => ({
          ...r,
          customSections: (r.customSections || []).filter((section) => section.id !== id),
          customFields: (r.customFields || []).filter((field) => field.section !== id),
        })),
    }),
    [],
  );

  function setField<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setResume((r) => ({ ...r, [key]: value }));
  }

  function clearForm() {
    if (!window.confirm("Clear the form? Your saved draft stays safe in this browser - refresh the page to bring it back.")) return;
    skipNextSaveRef.current = true;
    setResume(blankResume);
  }

  function loadSample() {
    if (!window.confirm("Replace the current form with example resume data?")) return;
    setResume(sampleResume);
  }

  async function saveResume() {
    if (saveBusy) return;
    if (!requireLogin()) return;
    setSaveBusy(true);
    setError("");
    setSavedMessage("");
    try {
      const response = await apiFetch("/api/tools/resume-builder/save/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: savedOrder?.id ?? null, data: resume, forCustomer, paymentMode: customerPaymentMode }),
      });
      const result = (await response.json().catch(() => ({}))) as SavedOrderSummary & { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not save your resume. Please try again.");
      setSavedOrder(result);
      setSavedMessage(forCustomer ? `Saved and charged ₹${result.totalAmount} to the customer.` : "Saved to My Resumes.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save your resume. Please try again.");
    } finally {
      setSaveBusy(false);
    }
  }

  async function refreshOrderStatus() {
    if (!savedOrder || refreshBusy) return;
    setRefreshBusy(true);
    try {
      const response = await apiFetch("/api/tools/resume-builder/saved/");
      const data = (await response.json().catch(() => ({}))) as { resumes?: SavedOrderSummary[] };
      const match = data.resumes?.find((entry) => entry.id === savedOrder.id);
      if (match) setSavedOrder(match);
    } catch {
      // Silent - the "Refresh status" button just stays available to retry.
    } finally {
      setRefreshBusy(false);
    }
  }

  async function downloadPdf() {
    if (busy || locked) return;
    if (!requireLogin()) return;
    if (!(await requestChargeConfirm(templatePrices?.[resume.template], templateLabel))) return;
    setDownloadBusy(true);
    setError("");
    try {
      await chargeResumeDownload(resume.template);
      const blob = await buildResumePdf(resume);
      triggerPdfDownload(blob, `${resumeFileSlug(resume.fullName)}-resume.pdf`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate the PDF. Please try again.");
    } finally {
      setDownloadBusy(false);
    }
  }

  async function printResume() {
    if (busy || locked) return;
    if (!requireLogin()) return;
    if (!(await requestChargeConfirm(templatePrices?.[resume.template], templateLabel))) return;
    setPrintBusy(true);
    setError("");
    try {
      await chargeResumeDownload(resume.template);
      const blob = await buildResumePdf(resume);
      printPdfBlob(blob);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not prepare the resume for printing. Please try again.");
    } finally {
      setPrintBusy(false);
    }
  }

  async function previewPdf() {
    if (busy) return;
    setPreviewBusy(true);
    setError("");
    // Opened synchronously - otherwise the browser treats the tab as an
    // unrequested popup and blocks it.
    const previewTab = window.open("", "_blank");
    try {
      const blob = await buildPreviewPdf(resume);
      const url = URL.createObjectURL(blob);
      if (previewTab) previewTab.location.href = url;
    } catch (reason) {
      previewTab?.close();
      setError(reason instanceof Error ? reason.message : "Could not build the preview. Please try again.");
    } finally {
      setPreviewBusy(false);
    }
  }

  return (
    <div className="resbuild-tool">
      <header className="resbuild-actionbar">
        <div>
          <div className="resbuild-back-links">
            <Link href="/resume-builder" className="resbuild-back-link"><ArrowLeft size={13} /> All templates</Link>
            <Link href="/resume-builder/saved" className="resbuild-back-link"><FolderOpen size={13} /> My Resumes</Link>
          </div>
          <h1>Resume Builder</h1>
          <p>Fill in your details, preview live, download a clean PDF. Nothing leaves your browser until you download.</p>
        </div>
        <div className="resbuild-actionbar-buttons">
          <button type="button" className="resbuild-btn-secondary" onClick={loadSample}>
            <Sparkles size={16} /> Load sample
          </button>
          <button type="button" className="resbuild-btn-secondary" onClick={clearForm}>
            <RotateCcw size={16} /> Clear form
          </button>
          <button type="button" className="resbuild-btn-secondary" onClick={saveResume} disabled={saveBusy}>
            <Save size={16} /> {saveBusy ? "Saving..." : savedOrder ? "Update save" : "Save"}
          </button>
          <button type="button" className="resbuild-btn-secondary" onClick={previewPdf} disabled={busy}>
            <Eye size={16} /> {previewBusy ? "Preparing..." : "Preview PDF"}
          </button>
          <button type="button" className="resbuild-btn-secondary" onClick={printResume} disabled={busy || locked} title={locked ? "Customer payment is pending" : undefined}>
            <Printer size={16} /> {printBusy ? "Printing..." : "Print"}
          </button>
          <button type="button" className="resbuild-btn-primary" onClick={downloadPdf} disabled={busy || locked} title={locked ? "Customer payment is pending" : undefined}>
            <Download size={16} /> {downloadBusy ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </header>
      {error ? <p className="resbuild-error">{error}</p> : null}
      {savedMessage ? <p className="resbuild-saved-toast">{savedMessage}</p> : null}
      {locked ? (
        <p className="resbuild-locked-note">
          Download and Print are locked until the customer pays - use Preview PDF (watermarked) to show them the result first.
        </p>
      ) : null}

      <section className="resbuild-workbench">
        <div className="resbuild-form-panel">
          <fieldset className="resbuild-section">
            <div className="resbuild-section-head">
              <h2>Template</h2>
              <button type="button" className="resbuild-template-toggle" onClick={() => setTemplatesExpanded((v) => !v)}>
                {templatesExpanded ? (
                  <>
                    Hide <ChevronUp size={15} />
                  </>
                ) : (
                  <>
                    {TEMPLATES.find((t) => t.id === resume.template)?.label ?? "Change"} <ChevronDown size={15} />
                  </>
                )}
              </button>
            </div>
            {templatesExpanded ? (
              <TemplatePicker
                template={resume.template}
                onSelect={(id) => setField("template", id)}
                priceLabelFor={(id) => (templatePrices ? { text: templatePrices[id] ? `₹${templatePrices[id]}` : "Free", free: !templatePrices[id] } : null)}
                data={resume}
                templates={TEMPLATES}
                sampleData={sampleResume}
                hasContent={resumeHasContent}
                renderPreview={(d) => <ResumePreviewPage resume={d} />}
                cacheNamespace="resume"
              />
            ) : null}
          </fieldset>

          <CustomerOrderPanel
            template={resume.template}
            serviceKey="resume_builder"
            itemLabel="resume"
            savedOrder={savedOrder}
            forCustomer={forCustomer}
            onForCustomerChange={setForCustomer}
            paymentMode={customerPaymentMode}
            onPaymentModeChange={setCustomerPaymentMode}
            onSave={saveResume}
            saveBusy={saveBusy}
            onOrderUpdate={setSavedOrder}
            onRefresh={refreshOrderStatus}
            refreshBusy={refreshBusy}
          />

          <ResumeFormFields
            resume={resume}
            setField={setField}
            experienceOps={experienceOps}
            educationOps={educationOps}
            projectOps={projectOps}
            certOps={certOps}
            customFieldOps={customFieldOps}
            customSectionOps={customSectionOps}
          />
        </div>

        <div className="resbuild-preview-panel">
          <ResumeScaleStage>
            <ResumePreviewPage resume={resume} />
          </ResumeScaleStage>
        </div>
      </section>

      {chargeConfirm ? (
        <div className="resbuild-confirm-overlay" onClick={() => answerChargeConfirm(false)}>
          <div className="resbuild-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="resbuild-confirm-icon"><Wallet size={20} /></span>
            <h3>Confirm wallet charge</h3>
            <p>
              This will deduct <strong>₹{chargeConfirm.price}</strong> from your RepetiGo wallet for the <strong>{chargeConfirm.label}</strong> template.
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
              Your resume stays exactly as you left it. Log in (or create a free account) to save, download, or print it.
            </p>
            <div className="resbuild-confirm-actions">
              <button type="button" className="resbuild-btn-secondary" onClick={() => setLoginPrompt(false)}>Keep editing</button>
              <Link className="resbuild-btn-primary" href={`/login?next=${encodeURIComponent(loginNextUrl)}`}>Login</Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

