"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Braces, ChevronDown, ChevronUp, Contrast, Loader2, LogIn, Palette, Printer, QrCode, User } from "lucide-react";
import { hasStoredSession } from "@/lib/api";
import { DashboardShell } from "../DashboardShell";
import { WalletLimitBanner } from "../WalletLimitBanner";
import { DOC_FIELDS, DOC_LAYOUT, DOC_TYPES, ocrStorageKey, type DocLayout, type DocType, type FieldDef } from "./docTypes";

type ColorMode = "color" | "bw";
type Phase = "empty" | "extracting" | "ready";

const COPY_OPTIONS = [2, 4, 6, 8];

export default function IdCardDesignClient({ docType }: { docType: DocType }) {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("extracting");
  const [fileName, setFileName] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState("");
  const [colorMode, setColorMode] = useState<ColorMode>("color");
  const [copies, setCopies] = useState(4);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [jsonPanelOpen, setJsonPanelOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");

  const fields = DOC_FIELDS[docType];
  const layout = DOC_LAYOUT[docType];
  const docColor = DOC_TYPES.find((doc) => doc.key === docType)?.color || "";

  useEffect(() => {
    const stored = sessionStorage.getItem(ocrStorageKey(docType));
    if (!stored) {
      setPhase("empty");
      return;
    }
    const { fileName: storedName } = JSON.parse(stored) as { fileName: string };
    setFileName(storedName);
    setPhase("extracting");
    const timer = window.setTimeout(() => {
      const demoValues: Record<string, string> = {};
      fields.forEach((field) => {
        demoValues[field.key] = field.demo;
      });
      setValues(demoValues);
      setPhase("ready");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 1200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docType]);

  function requireLogin() {
    if (hasStoredSession()) return true;
    setLoginPrompt(true);
    return false;
  }

  // Temporary dev-only bypass: lets whoever is building the design/print
  // side work from a hand-pasted OCR JSON instead of waiting on the
  // upload/extraction side to be finished - remove once both are wired
  // together for real.
  function fillSampleJson() {
    const sample: Record<string, string> = {};
    fields.forEach((field) => {
      sample[field.key] = field.demo;
    });
    setJsonText(JSON.stringify(sample, null, 2));
    setJsonError("");
  }

  function loadFromJson() {
    try {
      const parsed = JSON.parse(jsonText);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("JSON must be an object of field values.");
      }
      setValues(parsed as Record<string, string>);
      setFileName(fileName || "(pasted JSON)");
      setJsonError("");
      setPhase("ready");
    } catch {
      setJsonError("That's not valid JSON. Check the format and try again.");
    }
  }

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoChange(selected?: File | null) {
    if (!selected) return;
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(URL.createObjectURL(selected));
  }

  function printCards() {
    if (!requireLogin()) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(buildIdCardSheetHtml({ layout, fields, values, photoUrl, colorMode, copies }));
    printWindow.document.close();
  }

  return (
    <DashboardShell activePath="/id-card-maker">
      <div className="dashboard idcard-page">
        <WalletLimitBanner />
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <Link className="idcard-back-link" href={`/id-card-maker/${docType}`}>
              <ArrowLeft size={15} /> Upload a different {layout.title} PDF
            </Link>
            <h1>{layout.title} - Design &amp; Print</h1>
            <p>Review the extracted details, add a photo, and print a clean, card-sized copy.</p>
          </div>
          <div className="auto-print-hero-actions">
            <span className="status-pill warning">Wireframe - OCR data below is demo data</span>
          </div>
        </div>

        <article className="customer-panel idcard-dev-json-panel">
          <button type="button" className="idcard-dev-json-toggle" onClick={() => setJsonPanelOpen((open) => !open)}>
            <Braces size={16} /> Developer: Load from JSON
            {jsonPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {jsonPanelOpen ? (
            <div className="idcard-dev-json-body">
              <p className="customer-inline-help">
                Temporary: paste an OCR JSON object (field key → value) here to jump straight to the design step, without needing the upload/extraction side to be ready.
              </p>
              <textarea
                className="idcard-dev-json-textarea"
                spellCheck={false}
                rows={8}
                placeholder={`{\n  "name": "Ravi Kumar",\n  ...\n}`}
                value={jsonText}
                onChange={(event) => setJsonText(event.target.value)}
              />
              {jsonError ? <p className="customer-inline-help" style={{ color: "#c7354d" }}>{jsonError}</p> : null}
              <div className="idcard-dev-json-actions">
                <button type="button" onClick={fillSampleJson}>Fill Sample JSON</button>
                <button type="button" className="idcard-dev-json-load" onClick={loadFromJson} disabled={!jsonText.trim()}>
                  Load JSON &amp; Open Design
                </button>
              </div>
            </div>
          ) : null}
        </article>

        {phase === "empty" ? (
          <article className="customer-panel">
            <p className="customer-inline-help">No uploaded {layout.title} PDF found for this session.</p>
            <Link className="passport-preview-button" href={`/id-card-maker/${docType}`}>
              <ArrowLeft size={18} /> Go Upload a PDF
            </Link>
          </article>
        ) : phase === "extracting" ? (
          <article className="customer-panel idcard-extracting-panel">
            <Loader2 size={26} className="passport-step-spin" />
            <strong>Extracting text from {fileName}...</strong>
            <p className="customer-inline-help">Pulling out the printed details so you can review them below.</p>
          </article>
        ) : (
          <section className="passport-maker-grid">
            <article className="customer-panel">
              <div className="customer-panel-head">
                <span>Step 1</span>
                <h2>Extracted OCR Data</h2>
              </div>
              <p className="customer-inline-help">From {fileName} - demo data shown here until real OCR is wired up.</p>
              <pre className="idcard-ocr-json">{JSON.stringify(values, null, 2)}</pre>

              <div className="idcard-field-form">
                <label className="idcard-photo-slot">
                  {photoUrl ? <img src={photoUrl} alt="" /> : <User size={26} />}
                  <span>{photoUrl ? "Change photo" : "Add photo"}</span>
                  <input accept=".jpg,.jpeg,.png" type="file" onChange={(event) => handlePhotoChange(event.target.files?.[0])} />
                </label>
                <div className="idcard-field-grid">
                  {fields.map((field) => (
                    <label key={field.key}>
                      <span>{field.label}</span>
                      <input value={values[field.key] || ""} onChange={(event) => updateValue(field.key, event.target.value)} />
                    </label>
                  ))}
                </div>
              </div>
            </article>

            <article className="customer-panel">
              <div className="customer-panel-head">
                <span>Step 2</span>
                <h2>Card Preview &amp; Print</h2>
              </div>

              <div className="idcard-preview" style={{ "--doc-color": docColor } as CSSProperties}>
                <IdCardFace side="front" title={layout.title} fieldKeys={layout.front} fields={fields} values={values} photoUrl={photoUrl} />
                <IdCardFace side="back" title={layout.title} fieldKeys={layout.back} fields={fields} values={values} photoUrl={photoUrl} />
              </div>

              <div className="idcard-print-controls">
                <div className="idcard-toggle-group">
                  <button type="button" className={colorMode === "color" ? "active" : ""} onClick={() => setColorMode("color")}>
                    <Palette size={16} /> Color
                  </button>
                  <button type="button" className={colorMode === "bw" ? "active" : ""} onClick={() => setColorMode("bw")}>
                    <Contrast size={16} /> B/W
                  </button>
                </div>
                <div className="idcard-copies-group">
                  <span>Cards per A4 sheet</span>
                  <div className="idcard-toggle-group">
                    {COPY_OPTIONS.map((count) => (
                      <button key={count} type="button" className={copies === count ? "active" : ""} onClick={() => setCopies(count)}>
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="passport-preview-button" type="button" onClick={printCards}>
                  <Printer size={18} /> Print A4 Sheet
                </button>
              </div>
            </article>
          </section>
        )}
      </div>

      {loginPrompt ? (
        <div className="resbuild-confirm-overlay" onClick={() => setLoginPrompt(false)}>
          <div className="resbuild-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="resbuild-confirm-icon"><LogIn size={20} /></span>
            <h3>Login to continue</h3>
            <p>Your card stays exactly as you left it. Log in (or create a free account) to print or download it.</p>
            <div className="resbuild-confirm-actions">
              <button type="button" className="resbuild-btn-secondary" onClick={() => setLoginPrompt(false)}>Keep editing</button>
              <Link className="resbuild-btn-primary" href={`/login?next=${encodeURIComponent(pathname)}`}>Login</Link>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}

function IdCardFace({
  side,
  title,
  fieldKeys,
  fields,
  values,
  photoUrl,
}: {
  side: "front" | "back";
  title: string;
  fieldKeys: string[];
  fields: FieldDef[];
  values: Record<string, string>;
  photoUrl: string;
}) {
  const idField = fields.find((field) => field.key === "idNumber");
  const labelFor = (key: string) => fields.find((field) => field.key === key)?.label || key;

  return (
    <div className={`idcard-card idcard-card-${side}`}>
      <div className="idcard-card-head">
        <span>{title}</span>
        <span className="idcard-card-badge">{side === "front" ? "FRONT" : "BACK"}</span>
      </div>
      <div className="idcard-card-body">
        {side === "front" ? (
          <div className="idcard-card-photo">{photoUrl ? <img src={photoUrl} alt="" /> : <User size={22} />}</div>
        ) : (
          <div className="idcard-card-qr">
            <QrCode size={26} />
          </div>
        )}
        <div className="idcard-card-fields">
          {fieldKeys.map((key) => (
            <div key={key} className="idcard-card-field">
              <span>{labelFor(key)}</span>
              <strong>{values[key] || "-"}</strong>
            </div>
          ))}
        </div>
      </div>
      {idField ? <div className="idcard-card-id">{values.idNumber || idField.demo}</div> : null}
    </div>
  );
}

function buildIdCardSheetHtml({
  layout,
  fields,
  values,
  photoUrl,
  colorMode,
  copies,
}: {
  layout: DocLayout;
  fields: FieldDef[];
  values: Record<string, string>;
  photoUrl: string;
  colorMode: ColorMode;
  copies: number;
}) {
  const labelFor = (key: string) => fields.find((field) => field.key === key)?.label || key;
  const idNumber = values.idNumber || "";

  const face = (side: "front" | "back") => {
    const fieldKeys = side === "front" ? layout.front : layout.back;
    const media =
      side === "front"
        ? `<div class="photo">${photoUrl ? `<img src="${photoUrl}" />` : ""}</div>`
        : `<div class="qr"></div>`;
    const rows = fieldKeys
      .map((key) => `<div class="field"><span>${labelFor(key)}</span><strong>${values[key] || ""}</strong></div>`)
      .join("");
    return `<div class="card"><div class="head"><span>${layout.title}</span><span class="badge">${side.toUpperCase()}</span></div><div class="body">${media}<div class="fields">${rows}</div></div><div class="idnum">${idNumber}</div></div>`;
  };

  const pairHtml = `<div class="pair">${face("front")}${face("back")}</div>`;
  const rowsHtml = Array.from({ length: copies }).map(() => pairHtml).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ID Card Sheet</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;font-family:Arial, Helvetica, sans-serif;${colorMode === "bw" ? "filter:grayscale(1);" : ""}}
.page{width:210mm;min-height:297mm;background:#fff;margin:20px auto;padding:10mm;}
.pair{display:flex;gap:6mm;margin-bottom:6mm;}
.card{width:85.6mm;height:53.98mm;border:1px solid #999;border-radius:3mm;overflow:hidden;display:flex;flex-direction:column;}
.head{display:flex;justify-content:space-between;align-items:center;padding:2mm 3mm;background:#5740ed;color:#fff;font-size:2.6mm;font-weight:700;}
.badge{opacity:.85;font-size:2.2mm;}
.body{flex:1;display:flex;gap:3mm;padding:2.5mm 3mm;}
.photo{width:16mm;height:20mm;border:1px solid #ccc;background:#f2f2f2;flex:0 0 auto;}
.photo img{width:100%;height:100%;object-fit:cover;}
.qr{width:16mm;height:16mm;border:1px dashed #999;background:#f8f8f8;flex:0 0 auto;}
.fields{flex:1;display:flex;flex-direction:column;justify-content:center;gap:1mm;}
.field span{display:block;font-size:2mm;color:#666;}
.field strong{display:block;font-size:2.6mm;color:#111;}
.idnum{padding:1.5mm 3mm;font-size:3mm;font-weight:700;letter-spacing:.4mm;border-top:1px solid #eee;}
@media print{
  body{background:white;}
  .page{margin:0;box-shadow:none;}
  @page{size:A4;margin:0;}
}
</style>
</head>
<body>
<div class="page">${rowsHtml}</div>
<script>
  window.onload = function () {
    window.focus();
    window.print();
  };
</script>
</body>
</html>`;
}
