"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bookmark, Check, Download, LogIn, Plus, Printer, QrCode, Share2, Trash2 } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { apiFetch, hasStoredSession } from "@/lib/api";

type UpiPayee = { id: number; label: string; vpa: string; isDefault: boolean };
type UpiQrRecord = { id: number; label: string; vpa: string; amount: number | null; note: string; orderRef: string; createdAt: string };
type AmountMode = "fixed" | "open";

// Mirrors UPI_ID_PATTERN in cafemitra_server/api/views.py - keep in sync.
const UPI_ID_PATTERN = /^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9]{2,64}$/;
const QUICK_AMOUNTS = [10, 50, 100, 500];

function buildUpiUri({ vpa, name, amount, note, tr }: { vpa: string; name: string; amount?: string; note?: string; tr?: string }) {
  // Built by hand with encodeURIComponent (spaces -> %20) rather than
  // URLSearchParams (spaces -> +) - some UPI apps' strict deep-link parsers
  // only accept %20, and %20 is what every real-world UPI QR generator
  // (and the reference URI this was matched against) actually emits.
  const parts: string[] = [`pa=${encodeURIComponent(vpa.trim())}`, `pn=${encodeURIComponent(name.trim() || "RepetiGo Shop")}`];
  if (tr) parts.push(`tr=${encodeURIComponent(tr.trim())}`);
  if (note) parts.push(`tn=${encodeURIComponent(note.trim().slice(0, 50))}`);
  if (amount) parts.push(`am=${encodeURIComponent(Number(amount).toFixed(2))}`);
  parts.push("cu=INR");
  return `upi://pay?${parts.join("&")}`;
}

function generateOrderRef() {
  return `RG-${Date.now().toString(36).toUpperCase()}`;
}

async function createQrImage(value: string) {
  const { default: QRCode } = await import("qrcode");
  return QRCode.toDataURL(value, { width: 512, margin: 2, errorCorrectionLevel: "H", color: { dark: "#111a44", light: "#ffffff" } });
}

function loadImageEl(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = src;
  });
}

function truncateText(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

// Composites the raw QR into a branded, shareable card - RepetiGo badge,
// shop name, QR, amount, UPI ID - so the downloaded/shared image is self
// contained (a bare QR with no context is useless once it leaves this page).
// Rendered as a rounded white card floating on a transparent PNG background
// with a soft drop shadow, styled after popular UPI QR cards (badge on top,
// QR centered, info stacked below) - but using RepetiGo's own mark, not any
// third-party UPI app's logo.
async function buildBrandedCard({ qrDataUrl, label, vpa, amount, note }: { qrDataUrl: string; label: string; vpa: string; amount?: string; note?: string }) {
  const qrImage = await loadImageEl(qrDataUrl);
  const margin = 30; // room for the drop shadow outside the card
  const cardWidth = 560;
  const qrSize = 340;
  const badgeRadius = 34;

  let y = 40 + badgeRadius * 2 + 16 + 30; // top padding + badge + gap + "RepetiGo" label
  y += 32; // shop name
  y += 26 + qrSize + 26; // gap + qr + gap
  if (amount) y += 48;
  y += 26; // caption
  y += 24; // vpa
  if (note) y += 22;
  const footerHeight = 40;
  const cardHeight = y + 18 + footerHeight;

  const width = cardWidth + margin * 2;
  const height = cardHeight + margin * 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const cardX = margin;
  const cardY = margin;
  const cornerRadius = 24;

  ctx.save();
  ctx.shadowColor = "rgba(20, 35, 75, 0.28)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
  ctx.clip();

  const centerX = cardX + cardWidth / 2;
  let cursorY = cardY + 40 + badgeRadius;

  const badgeGradient = ctx.createLinearGradient(centerX - badgeRadius, cursorY - badgeRadius, centerX + badgeRadius, cursorY + badgeRadius);
  badgeGradient.addColorStop(0, "#2563eb");
  badgeGradient.addColorStop(0.5, "#1d9bf0");
  badgeGradient.addColorStop(1, "#14b8a6");
  ctx.fillStyle = badgeGradient;
  ctx.beginPath();
  ctx.arc(centerX, cursorY, badgeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "800 30px Arial";
  ctx.fillText("R", centerX, cursorY + 2);

  cursorY += badgeRadius + 30;
  ctx.fillStyle = "#0d1748";
  ctx.font = "800 22px Arial";
  ctx.fillText("RepetiGo", centerX, cursorY);

  cursorY += 32;
  ctx.fillStyle = "#3d4657";
  ctx.font = "700 24px Arial";
  ctx.fillText(truncateText(label || "RepetiGo Shop", 28), centerX, cursorY);

  cursorY += 26;
  const qrX = centerX - qrSize / 2;
  ctx.drawImage(qrImage, qrX, cursorY, qrSize, qrSize);
  cursorY += qrSize + 26;

  if (amount) {
    ctx.fillStyle = "#2563eb";
    ctx.font = "850 32px Arial";
    ctx.fillText(`Rs. ${amount}`, centerX, cursorY);
    cursorY += 48;
  }

  ctx.fillStyle = "#059669";
  ctx.font = "700 16px Arial";
  ctx.fillText("Scan & Pay via any UPI app", centerX, cursorY);
  cursorY += 26;

  ctx.fillStyle = "#5c6a86";
  ctx.font = "600 14px Arial";
  ctx.fillText(vpa, centerX, cursorY);
  cursorY += 24;

  if (note) {
    ctx.fillStyle = "#8a93a8";
    ctx.font = "italic 12px Arial";
    ctx.fillText(truncateText(note, 44), centerX, cursorY);
  }

  ctx.fillStyle = "#f3f5f8";
  ctx.fillRect(cardX, cardY + cardHeight - footerHeight, cardWidth, footerHeight);
  ctx.fillStyle = "#8a93a8";
  ctx.font = "600 11px Arial";
  ctx.fillText("Generated free with RepetiGo  ·  repetigo.com", centerX, cardY + cardHeight - footerHeight / 2);

  ctx.restore();

  return canvas.toDataURL("image/png");
}

export default function UpiQrGeneratorClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loginNextUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const [payees, setPayees] = useState<UpiPayee[]>([]);
  const [activePayeeId, setActivePayeeId] = useState<number | null>(null);
  const [adHocLabel, setAdHocLabel] = useState("");
  const [adHocVpa, setAdHocVpa] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newVpa, setNewVpa] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [amountMode, setAmountMode] = useState<AmountMode>("fixed");
  const [amount, setAmount] = useState("50");
  const [note, setNote] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [cardDataUrl, setCardDataUrl] = useState("");
  const [vpaError, setVpaError] = useState("");
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<UpiQrRecord[]>([]);
  const [recordSaveBusy, setRecordSaveBusy] = useState(false);
  const [recordSaved, setRecordSaved] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Browsing, typing a UPI ID, and generating/downloading a one-off QR is
  // free for anyone. Login is only required for the action that has lasting
  // value - saving an account for reuse next time.
  function requireLogin() {
    if (hasStoredSession()) return true;
    setLoginPrompt(true);
    return false;
  }

  useEffect(() => {
    if (!hasStoredSession()) return;
    apiFetch("/api/tools/upi-qr/payees/")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { payees?: UpiPayee[] } | null) => {
        const list = data?.payees || [];
        setPayees(list);
        const preferred = list.find((payee) => payee.isDefault) || list[0];
        if (preferred) setActivePayeeId(preferred.id);
      })
      .catch(() => {});
    loadRecords();
  }, []);

  function loadRecords() {
    if (!hasStoredSession()) return;
    apiFetch("/api/tools/upi-qr/history/")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { records?: UpiQrRecord[] } | null) => setRecords(data?.records || []))
      .catch(() => {});
  }

  const activePayee = payees.find((payee) => payee.id === activePayeeId) || null;
  const resolvedLabel = activePayee?.label || adHocLabel;
  const resolvedVpa = activePayee?.vpa || adHocVpa;

  useEffect(() => {
    setVpaError("");
    const vpa = resolvedVpa.trim();
    if (!vpa) {
      setQrDataUrl("");
      setCardDataUrl("");
      return;
    }
    if (!UPI_ID_PATTERN.test(vpa)) {
      setQrDataUrl("");
      setCardDataUrl("");
      setVpaError("Enter a valid UPI ID like name@bank.");
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const uri = buildUpiUri({
        vpa,
        name: resolvedLabel,
        amount: amountMode === "fixed" ? amount : undefined,
        note,
        tr: orderRef || generateOrderRef(),
      });
      createQrImage(uri)
        .then(async (rawQr) => {
          setQrDataUrl(rawQr);
          const branded = await buildBrandedCard({
            qrDataUrl: rawQr,
            label: resolvedLabel || "RepetiGo Shop",
            vpa,
            amount: amountMode === "fixed" ? amount : undefined,
            note,
          });
          setCardDataUrl(branded);
        })
        .catch(() => {
          setError("Could not generate the QR code. Please try again.");
        });
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [resolvedVpa, resolvedLabel, amountMode, amount, note, orderRef]);

  async function savePayeeAccount() {
    if (!requireLogin()) return;
    if (!newLabel.trim() || !UPI_ID_PATTERN.test(newVpa.trim())) {
      setError("Enter a valid shop name and UPI ID before saving.");
      return;
    }
    setSaveBusy(true);
    setError("");
    try {
      const response = await apiFetch("/api/tools/upi-qr/payees/save/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim(), vpa: newVpa.trim(), isDefault: payees.length === 0 }),
      });
      const result = (await response.json().catch(() => ({}))) as UpiPayee & { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not save this account. Please try again.");
      setPayees((prev) => [result, ...prev]);
      setActivePayeeId(result.id);
      setNewLabel("");
      setNewVpa("");
      setShowAddForm(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this account. Please try again.");
    } finally {
      setSaveBusy(false);
    }
  }

  async function deletePayeeAccount(id: number) {
    try {
      await apiFetch(`/api/tools/upi-qr/payees/${id}/delete/`, { method: "POST" });
      setPayees((prev) => prev.filter((payee) => payee.id !== id));
      if (activePayeeId === id) setActivePayeeId(null);
    } catch {
      setError("Could not delete this account. Please try again.");
    }
  }

  function addQuickAmount(value: number) {
    const current = Number(amount) || 0;
    setAmount(String(current + value));
  }

  async function saveQrRecord() {
    if (!requireLogin()) return;
    if (!cardDataUrl || !resolvedVpa) return;
    setRecordSaveBusy(true);
    setError("");
    try {
      const response = await apiFetch("/api/tools/upi-qr/history/save/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: resolvedLabel || "RepetiGo Shop",
          vpa: resolvedVpa,
          amount: amountMode === "fixed" ? amount : null,
          note,
          orderRef,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as UpiQrRecord & { message?: string };
      if (!response.ok) throw new Error(result.message || "Could not save this QR. Please try again.");
      setRecords((prev) => [result, ...prev]);
      setRecordSaved(true);
      setTimeout(() => setRecordSaved(false), 2000);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this QR. Please try again.");
    } finally {
      setRecordSaveBusy(false);
    }
  }

  async function deleteQrRecord(id: number) {
    try {
      await apiFetch(`/api/tools/upi-qr/history/${id}/delete/`, { method: "POST" });
      setRecords((prev) => prev.filter((record) => record.id !== id));
    } catch {
      setError("Could not delete this saved QR. Please try again.");
    }
  }

  function loadQrRecord(record: UpiQrRecord) {
    setActivePayeeId(null);
    setAdHocLabel(record.label);
    setAdHocVpa(record.vpa);
    setAmountMode(record.amount != null ? "fixed" : "open");
    if (record.amount != null) setAmount(String(record.amount));
    setNote(record.note || "");
    setOrderRef(record.orderRef || "");
  }

  async function shareQr() {
    if (!cardDataUrl) return;
    try {
      const blob = await (await fetch(cardDataUrl)).blob();
      const file = new File([blob], "upi-qr.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Scan to pay", text: `Pay ${resolvedLabel || "us"} via UPI` });
        return;
      }
    } catch {
      // Fall through to the clipboard fallback below.
    }
    try {
      await navigator.clipboard.writeText(
        buildUpiUri({ vpa: resolvedVpa, name: resolvedLabel, amount: amountMode === "fixed" ? amount : undefined, note, tr: orderRef })
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not share. Try downloading the QR instead.");
    }
  }

  function printQr() {
    if (!cardDataUrl) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(buildQrStandeeHtml(cardDataUrl));
    printWindow.document.close();
  }

  return (
    <DashboardShell activePath="/upi-qr-generator">
      <div className="dashboard upiqr-page">
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">RepetiGo UPI QR</span>
            <h2>UPI QR Code Generator</h2>
            <p>Save your shop&apos;s UPI ID, generate a fixed or any-amount payment QR, then download, share, or print it for your counter.</p>
          </div>
        </div>

        <div className="upiqr-layout">
          <div className="upiqr-form-col">
            <article className="customer-panel">
              <div className="customer-panel-head">
                <span>Step 1</span>
                <h2>Choose UPI Account</h2>
              </div>

              {payees.length ? (
                <div className="upiqr-payee-list">
                  {payees.map((payee) => (
                    <button
                      type="button"
                      key={payee.id}
                      className={`upiqr-payee-chip ${activePayeeId === payee.id ? "upiqr-payee-chip-active" : ""}`}
                      onClick={() => setActivePayeeId(payee.id)}
                    >
                      <span className="upiqr-payee-chip-text">
                        <span className="upiqr-payee-chip-label">{payee.label}</span>
                        <span className="upiqr-payee-chip-vpa">{payee.vpa}</span>
                      </span>
                      <Trash2
                        size={14}
                        className="upiqr-payee-chip-remove"
                        onClick={(event) => {
                          event.stopPropagation();
                          void deletePayeeAccount(payee.id);
                        }}
                      />
                    </button>
                  ))}
                </div>
              ) : null}

              {showAddForm ? (
                <div className="upiqr-add-form">
                  <label className="resbuild-field">
                    <span>Shop Name / Your Name</span>
                    <input type="text" value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="Sharma Cyber Cafe" />
                  </label>
                  <label className="resbuild-field">
                    <span>UPI ID</span>
                    <input type="text" value={newVpa} onChange={(event) => setNewVpa(event.target.value)} placeholder="9876543210@ybl" />
                  </label>
                  <div className="upiqr-add-form-actions">
                    <button type="button" className="resbuild-btn-secondary" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </button>
                    <button type="button" className="resbuild-btn-primary" disabled={saveBusy} onClick={() => void savePayeeAccount()}>
                      {saveBusy ? "Saving…" : "Save Account"}
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" className="resbuild-btn-secondary upiqr-add-trigger" onClick={() => setShowAddForm(true)}>
                  <Plus size={16} /> Save a new UPI account
                </button>
              )}

              {!activePayee ? (
                <div className="upiqr-adhoc">
                  <p className="upiqr-adhoc-hint">Or just type a UPI ID below to generate one QR without saving it.</p>
                  <label className="resbuild-field">
                    <span>Shop Name / Your Name</span>
                    <input type="text" value={adHocLabel} onChange={(event) => setAdHocLabel(event.target.value)} placeholder="Sharma Cyber Cafe" />
                  </label>
                  <label className="resbuild-field">
                    <span>UPI ID</span>
                    <input type="text" value={adHocVpa} onChange={(event) => setAdHocVpa(event.target.value)} placeholder="9876543210@ybl" />
                  </label>
                  {vpaError ? <p className="upiqr-error">{vpaError}</p> : null}
                </div>
              ) : null}
            </article>

            <article className="customer-panel">
              <div className="customer-panel-head">
                <span>Step 2</span>
                <h2>Amount &amp; Note</h2>
              </div>

              <div className="upiqr-mode-toggle">
                <button type="button" className={amountMode === "fixed" ? "active" : ""} onClick={() => setAmountMode("fixed")}>
                  Fixed amount
                </button>
                <button type="button" className={amountMode === "open" ? "active" : ""} onClick={() => setAmountMode("open")}>
                  Any amount
                </button>
              </div>

              {amountMode === "fixed" ? (
                <>
                  <label className="resbuild-field">
                    <span>Amount (Rs.)</span>
                    <input type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} />
                  </label>
                  <div className="upiqr-quick-amounts">
                    {QUICK_AMOUNTS.map((value) => (
                      <button type="button" key={value} onClick={() => addQuickAmount(value)}>
                        +{value}
                      </button>
                    ))}
                  </div>
                  <p className="upiqr-hint">Amount locked in QR</p>
                </>
              ) : (
                <p className="upiqr-hint">The payer will be asked to enter any amount when they scan.</p>
              )}

              <label className="resbuild-field">
                <span>Note (optional)</span>
                <input type="text" value={note} onChange={(event) => setNote(event.target.value.slice(0, 50))} placeholder="e.g. Print job, Photocopy" />
              </label>
              <label className="resbuild-field">
                <span>Order / Reference ID (optional)</span>
                <input type="text" value={orderRef} onChange={(event) => setOrderRef(event.target.value)} placeholder="Auto-generated if left blank" />
              </label>
            </article>
          </div>

          <aside className="upiqr-preview-col">
            <div className="upiqr-qr-card">
              {cardDataUrl ? (
                <img src={cardDataUrl} alt={`UPI payment QR code for ${resolvedLabel || "RepetiGo Shop"}`} className="upiqr-branded-preview" />
              ) : (
                <div className="upiqr-qr-placeholder">
                  <QrCode size={48} />
                  <span>Enter a UPI ID to generate</span>
                </div>
              )}
            </div>
            <div className="upiqr-qr-actions">
              <a
                className={`resbuild-btn-primary ${!cardDataUrl ? "upiqr-disabled-link" : ""}`}
                href={cardDataUrl || undefined}
                download={`upi-qr-${(resolvedLabel || "repetigo").replace(/\s+/g, "-").toLowerCase()}.png`}
              >
                <Download size={16} /> Download
              </a>
              <button type="button" className="resbuild-btn-secondary" disabled={!cardDataUrl} onClick={() => void shareQr()}>
                {copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? "Copied" : "Share"}
              </button>
              <button type="button" className="resbuild-btn-secondary" disabled={!cardDataUrl} onClick={printQr}>
                <Printer size={16} /> Print
              </button>
              <button type="button" className="resbuild-btn-secondary" disabled={!cardDataUrl || recordSaveBusy} onClick={() => void saveQrRecord()}>
                {recordSaved ? <Check size={16} /> : <Bookmark size={16} />} {recordSaveBusy ? "Saving…" : recordSaved ? "Saved" : "Save this QR"}
              </button>
            </div>

            {records.length ? (
              <div className="upiqr-history">
                <h3>Saved QR Codes</h3>
                <div className="upiqr-history-list">
                  {records.map((record) => (
                    <div key={record.id} className="upiqr-history-item">
                      <button type="button" className="upiqr-history-item-main" onClick={() => loadQrRecord(record)}>
                        <span className="upiqr-history-item-label">{record.label}</span>
                        <span className="upiqr-history-item-meta">
                          {record.amount != null ? `Rs. ${record.amount}` : "Any amount"} · {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </button>
                      <Trash2 size={14} className="upiqr-history-item-remove" onClick={() => void deleteQrRecord(record.id)} />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {error ? <p className="image-transform-error">{error}</p> : null}

        {loginPrompt ? (
          <div className="resbuild-confirm-overlay" onClick={() => setLoginPrompt(false)}>
            <div className="resbuild-confirm-modal" onClick={(event) => event.stopPropagation()}>
              <span className="resbuild-confirm-icon">
                <LogIn size={20} />
              </span>
              <h3>Login to save this account</h3>
              <p>You can still generate and download a QR right now without logging in. Log in (or create a free account) to save this UPI account for next time.</p>
              <div className="resbuild-confirm-actions">
                <button type="button" className="resbuild-btn-secondary" onClick={() => setLoginPrompt(false)}>
                  Keep editing
                </button>
                <Link className="resbuild-btn-primary" href={`/login?next=${encodeURIComponent(loginNextUrl)}`}>
                  Login
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}

// The branded card (buildBrandedCard) already bakes in the shop name, QR,
// amount, and RepetiGo branding as one image - this just wraps it at a good
// physical size for a counter standee printout.
function buildQrStandeeHtml(cardImageUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>UPI Payment QR</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;display:flex;justify-content:center;align-items:center;min-height:100vh;}
.card{width:105mm;border-radius:6mm;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.12);}
.card img{width:100%;display:block;}
@media print{
  body{background:white;min-height:0;}
  .card{box-shadow:none;margin:0 auto;}
  @page{size:A5;margin:0;}
}
</style>
</head>
<body>
<div class="card"><img src="${cardImageUrl}" alt="UPI payment QR code" /></div>
<script>
  window.onload = function () {
    window.focus();
    window.print();
  };
</script>
</body>
</html>`;
}
