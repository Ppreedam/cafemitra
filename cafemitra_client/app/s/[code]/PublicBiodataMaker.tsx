"use client";

import { useState } from "react";
import { ArrowLeft, Download, Eye, RefreshCw, Wallet } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { calculatePriceItemRate, type PricingService } from "@/lib/pricing";
import TemplatePicker from "../../resume-builder/TemplatePicker";
import { ResumeScaleStage } from "../../resume-builder/ResumeScaleStage";
import { resumeFileSlug, triggerPdfDownload } from "../../resume-builder/downloadPdf";
import { payResumeOrderWithRazorpay } from "../../resume-builder/razorpayCheckout";
import BiodataFormFields from "../../biodata-maker/BiodataFormFields";
import { BiodataPreviewPage } from "../../biodata-maker/BiodataPreview";
import { buildBiodataPdf, buildPreviewBiodataPdf } from "../../biodata-maker/pdfBuilder";
import {
  blankBiodata,
  biodataHasContent,
  sampleBiodata,
  type BiodataData,
  type SavedBiodataOrderSummary,
} from "../../biodata-maker/biodataModel";
import { BIODATA_TEMPLATES, type BiodataTemplateId } from "../../biodata-maker/templates";

function customerPriceForTemplate(service: PricingService | undefined, template: BiodataTemplateId) {
  if (!service) return 0;
  const items = Array.isArray(service.settings.priceItems) ? service.settings.priceItems : [];
  const item = items.find((entry) => entry.id === template);
  return calculatePriceItemRate(item, 1);
}

export default function PublicBiodataMaker({
  code,
  pricingService,
  stepNumber,
}: {
  code: string;
  pricingService: PricingService | undefined;
  stepNumber: number;
}) {
  const [data, setData] = useState<BiodataData>(blankBiodata);
  // "template": browsing templates with sample content so the customer can
  // see what each one looks like before typing anything. "form": their own
  // details, using the template picked in the first stage.
  const [stage, setStage] = useState<"template" | "form">("template");
  const [paymentMode, setPaymentMode] = useState<"cash" | "online">("online");
  const [savedOrder, setSavedOrder] = useState<SavedBiodataOrderSummary | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [payBusy, setPayBusy] = useState(false);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof BiodataData>(key: K, value: BiodataData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  const price = customerPriceForTemplate(pricingService, data.template);
  const isPaid = savedOrder?.paymentStatus === "paid";
  const isAwaitingOnline = savedOrder && savedOrder.paymentMode === "Online" && savedOrder.paymentStatus === "pending";
  const isAwaitingCash = savedOrder && savedOrder.paymentMode === "Cash" && savedOrder.paymentStatus !== "paid";

  async function saveAndContinue() {
    if (saveBusy) return;
    if (!data.fullName.trim()) {
      setError("Please enter your name before continuing.");
      return;
    }
    setSaveBusy(true);
    setError("");
    try {
      const response = await fetch(apiUrl(`/api/public-shop/${code}/biodata-maker/save/`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: savedOrder?.id ?? null, data, paymentMode }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not save your biodata. Please try again.");
      setSavedOrder(result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save your biodata. Please try again.");
    } finally {
      setSaveBusy(false);
    }
  }

  async function payNow() {
    if (!savedOrder || payBusy) return;
    setPayBusy(true);
    setError("");
    try {
      await payResumeOrderWithRazorpay({
        orderId: savedOrder.id,
        onPaid: (paymentStatus) => setSavedOrder((current) => (current ? { ...current, paymentStatus } : current)),
        onError: setError,
        onDismiss: () => setPayBusy(false),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start payment.");
    } finally {
      setPayBusy(false);
    }
  }

  async function refreshStatus() {
    if (!savedOrder || refreshBusy) return;
    setRefreshBusy(true);
    try {
      const response = await fetch(apiUrl(`/api/public-orders/${savedOrder.id}/`));
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.order) {
        setSavedOrder((current) => (current ? { ...current, paymentStatus: result.order.paymentStatus } : current));
      }
    } catch {
      // Silent - the "Refresh status" button just stays available to retry.
    } finally {
      setRefreshBusy(false);
    }
  }

  async function previewPdf() {
    if (previewBusy) return;
    setPreviewBusy(true);
    setError("");
    // Opened synchronously (before the async build below), otherwise the
    // browser treats the tab as an unrequested popup and blocks it.
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

  async function downloadPdf() {
    if (downloadBusy || !isPaid) return;
    setDownloadBusy(true);
    setError("");
    try {
      const blob = await buildBiodataPdf(data);
      triggerPdfDownload(blob, `${resumeFileSlug(data.fullName, "biodata")}-biodata.pdf`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate the PDF. Please try again.");
    } finally {
      setDownloadBusy(false);
    }
  }

  return (
    <article className="customer-panel pub-resume-panel is-guided">
      <div className="customer-panel-head">
        <span>Step {stepNumber}</span>
        <h2>Build Your Biodata</h2>
      </div>

      {error ? <p className="resbuild-error">{error}</p> : null}

      {isPaid ? (
        <div className="pub-resume-done">
          <p className="resbuild-customer-paid">Paid - ₹{savedOrder!.totalAmount}. Your biodata is ready to download.</p>
          <ResumeScaleStage>
            <BiodataPreviewPage data={data} />
          </ResumeScaleStage>
          <button type="button" className="resbuild-btn-primary" onClick={downloadPdf} disabled={downloadBusy}>
            <Download size={16} /> {downloadBusy ? "Generating..." : "Download PDF"}
          </button>
        </div>
      ) : stage === "template" ? (
        <div className="pub-resume-body">
          <fieldset className="resbuild-section">
            <h2>Template</h2>
            <TemplatePicker
              template={data.template}
              onSelect={(id) => {
                setField("template", id);
                setStage("form");
              }}
              priceLabelFor={(id) => (pricingService ? { text: `₹${customerPriceForTemplate(pricingService, id)}`, free: false } : null)}
              ctaLabel="Fill your details"
              data={data}
              templates={BIODATA_TEMPLATES}
              sampleData={sampleBiodata}
              hasContent={biodataHasContent}
              renderPreview={(d) => <BiodataPreviewPage data={d} />}
              cacheNamespace="biodata"
            />
            <p className="pub-resume-sample-note">Sample content shown so you can compare templates - your own details come next.</p>
          </fieldset>
        </div>
      ) : (
        <div className="pub-resume-body">
          <button type="button" className="pub-resume-back-link" onClick={() => setStage("template")}>
            <ArrowLeft size={14} /> Change template
          </button>

          <BiodataFormFields data={data} setField={setField} />

          <fieldset className="resbuild-section">
            <h2>Preview</h2>
            <ResumeScaleStage>
              <BiodataPreviewPage data={data} />
            </ResumeScaleStage>
            <button type="button" className="resbuild-btn-secondary pub-resume-preview-btn" onClick={previewPdf} disabled={previewBusy}>
              <Eye size={16} /> {previewBusy ? "Preparing..." : "Preview PDF (watermarked)"}
            </button>
          </fieldset>

          <fieldset className="resbuild-section resbuild-customer-panel">
            <h2>Payment</h2>
            <div className="resbuild-customer-details">
              <div className="resbuild-customer-price">
                <span>Price for this template</span>
                <strong>{pricingService ? `₹${price}` : "Loading..."}</strong>
              </div>

              <div className="resbuild-customer-payment-modes">
                <button type="button" className={paymentMode === "online" ? "active" : ""} onClick={() => setPaymentMode("online")}>Online</button>
                <button type="button" className={paymentMode === "cash" ? "active" : ""} onClick={() => setPaymentMode("cash")}>Cash</button>
              </div>

              {!isAwaitingOnline ? (
                <button type="button" className="resbuild-btn-primary" onClick={saveAndContinue} disabled={saveBusy}>
                  <Wallet size={16} /> {saveBusy ? "Saving..." : savedOrder ? "Update details" : `Continue - Pay ₹${price}`}
                </button>
              ) : null}

              {isAwaitingOnline ? (
                <div className="resbuild-customer-pay-block">
                  <button type="button" className="resbuild-btn-primary" onClick={payNow} disabled={payBusy}>
                    <Wallet size={16} /> {payBusy ? "Opening..." : `Pay ₹${savedOrder!.totalAmount} now`}
                  </button>
                </div>
              ) : null}

              {isAwaitingCash ? (
                <div className="resbuild-customer-cash-wait">
                  <p>Please pay ₹{savedOrder!.totalAmount} in cash at the counter. Your download unlocks here as soon as the cafe confirms your payment.</p>
                  <button type="button" className="resbuild-btn-secondary" onClick={refreshStatus} disabled={refreshBusy}>
                    <RefreshCw size={14} /> {refreshBusy ? "Checking..." : "Refresh status"}
                  </button>
                </div>
              ) : null}
            </div>
          </fieldset>
        </div>
      )}
    </article>
  );
}
