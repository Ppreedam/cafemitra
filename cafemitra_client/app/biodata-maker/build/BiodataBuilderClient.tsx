"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Download, Eye, FolderOpen, LogIn, Printer, RotateCcw, Save, Sparkles, Wallet } from "lucide-react";
import { apiFetch, hasStoredSession } from "@/lib/api";
import { useTemplatePrices } from "../../resume-builder/useTemplatePrices";
import { resumeFileSlug, triggerPdfDownload } from "../../resume-builder/downloadPdf";
import TemplatePicker from "../../resume-builder/TemplatePicker";
import { ResumeScaleStage } from "../../resume-builder/ResumeScaleStage";
import CustomerOrderPanel from "../../resume-builder/build/CustomerOrderPanel";
import { BIODATA_TEMPLATES, type BiodataTemplateId } from "../templates";
import { BiodataPreviewPage } from "../BiodataPreview";
import BiodataFormFields from "../BiodataFormFields";
import { buildBiodataPdf, buildPreviewBiodataPdf } from "../pdfBuilder";
import { blankBiodata, biodataHasContent, sampleBiodata, STORAGE_KEY, type BiodataCustomField, type BiodataCustomSection, type BiodataData, type SavedBiodataOrderSummary } from "../biodataModel";

async function chargeBiodataDownload(template: BiodataTemplateId) {
  const response = await apiFetch("/api/tools/biodata-maker-charge/", {
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

export default function BiodataBuilderClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const templatePrices = useTemplatePrices<BiodataTemplateId>("biodata_maker_");
  const [data, setData] = useState<BiodataData>(sampleBiodata);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const busy = downloadBusy || printBusy || previewBusy;
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [savedOrder, setSavedOrder] = useState<SavedBiodataOrderSummary | null>(null);
  const [forCustomer, setForCustomer] = useState(false);
  const [customerPaymentMode, setCustomerPaymentMode] = useState<"cash" | "online">("cash");
  const [saveBusy, setSaveBusy] = useState(false);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [chargeConfirm, setChargeConfirm] = useState<{ price: number; label: string; resolve: (ok: boolean) => void } | null>(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [templatesExpanded, setTemplatesExpanded] = useState(false);
  const skipNextSaveRef = useRef(false);
  const loginNextUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  // Building and previewing a biodata is free for anyone. Login is only
  // required for the actions that actually produce/save an output.
  function requireLogin() {
    if (hasStoredSession()) return true;
    setLoginPrompt(true);
    return false;
  }
  // Same reasoning as Resume Builder: downloading/printing is blocked once a
  // biodata is marked as for-customer until that customer's payment clears.
  const locked = forCustomer && savedOrder?.paymentStatus !== "paid";
  const templateLabel = BIODATA_TEMPLATES.find((tpl) => tpl.id === data.template)?.label || data.template;

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
      if (saved) setData((prev) => ({ ...prev, ...JSON.parse(saved) }));
    } catch {
      // Ignore a corrupted or unavailable draft - the sample biodata stays as the fallback.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    const requested = searchParams.get("template");
    if (requested && BIODATA_TEMPLATES.some((tpl) => tpl.id === requested)) {
      setData((prev) => ({ ...prev, template: requested as BiodataTemplateId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const savedId = searchParams.get("savedId");
    if (!savedId) return;
    let cancelled = false;
    apiFetch("/api/tools/biodata-maker/saved/")
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { biodatas?: SavedBiodataOrderSummary[] } | null) => {
        if (cancelled || !result?.biodatas) return;
        const match = result.biodatas.find((entry) => String(entry.id) === savedId);
        if (match) {
          setData((prev) => ({ ...prev, ...match.data }));
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
      skipNextSaveRef.current = false;
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, loaded]);

  function setField<K extends keyof BiodataData>(key: K, value: BiodataData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  const customFieldOps = useMemo(
    () => ({
      add: (blank: BiodataCustomField) => setData((d) => ({ ...d, customFields: [...(d.customFields || []), blank] })),
      update: (id: string, patch: Partial<Pick<BiodataCustomField, "label" | "value">>) =>
        setData((d) => ({ ...d, customFields: (d.customFields || []).map((field) => (field.id === id ? { ...field, ...patch } : field)) })),
      remove: (id: string) => setData((d) => ({ ...d, customFields: (d.customFields || []).filter((field) => field.id !== id) })),
    }),
    [],
  );

  const customSectionOps = useMemo(
    () => ({
      add: (blank: BiodataCustomSection) => setData((d) => ({ ...d, customSections: [...(d.customSections || []), blank] })),
      update: (id: string, patch: Partial<Pick<BiodataCustomSection, "title">>) =>
        setData((d) => ({ ...d, customSections: (d.customSections || []).map((section) => (section.id === id ? { ...section, ...patch } : section)) })),
      // Dropping a section also drops the fields filed under it, so removed
      // sections don't leave orphaned fields lingering invisibly in the data.
      remove: (id: string) =>
        setData((d) => ({
          ...d,
          customSections: (d.customSections || []).filter((section) => section.id !== id),
          customFields: (d.customFields || []).filter((field) => field.section !== id),
        })),
    }),
    [],
  );

  function clearForm() {
    if (!window.confirm("Clear the form? Your saved draft stays safe in this browser - refresh the page to bring it back.")) return;
    skipNextSaveRef.current = true;
    setData(blankBiodata);
  }

  function loadSample() {
    if (!window.confirm("Replace the current form with example biodata?")) return;
    setData(sampleBiodata);
  }

  async function saveBiodata() {
    if (saveBusy) return;
    if (!requireLogin()) return;
    setSaveBusy(true);
    setError("");
    setSavedMessage("");
    try {
      const response = await apiFetch("/api/tools/biodata-maker/save/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: savedOrder?.id ?? null, data, forCustomer, paymentMode: customerPaymentMode }),
      });
      const result = (await response.json().catch(() => ({}))) as SavedBiodataOrderSummary & { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not save your biodata. Please try again.");
      setSavedOrder(result);
      setSavedMessage(forCustomer ? `Saved and charged ₹${result.totalAmount} to the customer.` : "Saved to My Biodatas.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save your biodata. Please try again.");
    } finally {
      setSaveBusy(false);
    }
  }

  async function refreshOrderStatus() {
    if (!savedOrder || refreshBusy) return;
    setRefreshBusy(true);
    try {
      const response = await apiFetch("/api/tools/biodata-maker/saved/");
      const result = (await response.json().catch(() => ({}))) as { biodatas?: SavedBiodataOrderSummary[] };
      const match = result.biodatas?.find((entry) => entry.id === savedOrder.id);
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
    if (!(await requestChargeConfirm(templatePrices?.[data.template], templateLabel))) return;
    setDownloadBusy(true);
    setError("");
    try {
      await chargeBiodataDownload(data.template);
      const blob = await buildBiodataPdf(data);
      triggerPdfDownload(blob, `${resumeFileSlug(data.fullName, "biodata")}-biodata.pdf`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate the PDF. Please try again.");
    } finally {
      setDownloadBusy(false);
    }
  }

  async function printBiodata() {
    if (busy || locked) return;
    if (!requireLogin()) return;
    if (!(await requestChargeConfirm(templatePrices?.[data.template], templateLabel))) return;
    setPrintBusy(true);
    setError("");
    try {
      await chargeBiodataDownload(data.template);
      const blob = await buildBiodataPdf(data);
      printPdfBlob(blob);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not prepare the biodata for printing. Please try again.");
    } finally {
      setPrintBusy(false);
    }
  }

  async function previewPdf() {
    if (busy) return;
    setPreviewBusy(true);
    setError("");
    const previewTab = window.open("", "_blank");
    try {
      const blob = await buildPreviewBiodataPdf(data);
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
            <Link href="/biodata-maker" className="resbuild-back-link"><ArrowLeft size={13} /> All templates</Link>
            <Link href="/biodata-maker/saved" className="resbuild-back-link"><FolderOpen size={13} /> My Biodatas</Link>
          </div>
          <h1>Biodata Maker</h1>
          <p>Fill in your details, preview live, download a clean PDF. Nothing leaves your browser until you download.</p>
        </div>
        <div className="resbuild-actionbar-buttons">
          <button type="button" className="resbuild-btn-secondary" onClick={loadSample}>
            <Sparkles size={16} /> Load sample
          </button>
          <button type="button" className="resbuild-btn-secondary" onClick={clearForm}>
            <RotateCcw size={16} /> Clear form
          </button>
          <button type="button" className="resbuild-btn-secondary" onClick={saveBiodata} disabled={saveBusy}>
            <Save size={16} /> {saveBusy ? "Saving..." : savedOrder ? "Update save" : "Save"}
          </button>
          <button type="button" className="resbuild-btn-secondary" onClick={previewPdf} disabled={busy}>
            <Eye size={16} /> {previewBusy ? "Preparing..." : "Preview PDF"}
          </button>
          <button type="button" className="resbuild-btn-secondary" onClick={printBiodata} disabled={busy || locked} title={locked ? "Customer payment is pending" : undefined}>
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
                    {BIODATA_TEMPLATES.find((t) => t.id === data.template)?.label ?? "Change"} <ChevronDown size={15} />
                  </>
                )}
              </button>
            </div>
            {templatesExpanded ? (
              <TemplatePicker
                template={data.template}
                onSelect={(id) => setField("template", id)}
                priceLabelFor={(id) => (templatePrices ? { text: templatePrices[id] ? `₹${templatePrices[id]}` : "Free", free: !templatePrices[id] } : null)}
                data={data}
                templates={BIODATA_TEMPLATES}
                sampleData={sampleBiodata}
                hasContent={biodataHasContent}
                renderPreview={(d) => <BiodataPreviewPage data={d} />}
                cacheNamespace="biodata"
              />
            ) : null}
          </fieldset>

          <CustomerOrderPanel
            template={data.template}
            serviceKey="biodata_maker"
            itemLabel="biodata"
            savedOrder={savedOrder}
            forCustomer={forCustomer}
            onForCustomerChange={setForCustomer}
            paymentMode={customerPaymentMode}
            onPaymentModeChange={setCustomerPaymentMode}
            onSave={saveBiodata}
            saveBusy={saveBusy}
            onOrderUpdate={setSavedOrder}
            onRefresh={refreshOrderStatus}
            refreshBusy={refreshBusy}
          />

          <BiodataFormFields data={data} setField={setField} customFieldOps={customFieldOps} customSectionOps={customSectionOps} />
        </div>

        <div className="resbuild-preview-panel">
          <ResumeScaleStage>
            <BiodataPreviewPage data={data} />
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
              Your biodata stays exactly as you left it. Log in (or create a free account) to save, download, or print it.
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
