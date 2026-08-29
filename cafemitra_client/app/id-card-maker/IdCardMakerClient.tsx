"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  Car,
  Contrast,
  CreditCard,
  FileScan,
  IdCard,
  Loader2,
  LogIn,
  Palette,
  Printer,
  QrCode,
  User,
  Upload,
  X,
} from "lucide-react";
import { hasStoredSession } from "@/lib/api";
import { DashboardShell } from "../DashboardShell";
import { WalletLimitBanner } from "../WalletLimitBanner";

type DocType = "aadhaar" | "pan" | "rc" | "dl";
type Step = "upload" | "extracting" | "review";
type ColorMode = "color" | "bw";

type FieldDef = { key: string; label: string; demo: string };

type DocLayout = { title: string; front: string[]; back: string[] };

const DOC_TYPES: { key: DocType; label: string; icon: typeof IdCard }[] = [
  { key: "aadhaar", label: "Aadhaar Card", icon: IdCard },
  { key: "pan", label: "PAN Card", icon: CreditCard },
  { key: "rc", label: "RC (Vehicle)", icon: Car },
  { key: "dl", label: "Driving Licence", icon: BadgeCheck },
];

const DOC_FIELDS: Record<DocType, FieldDef[]> = {
  aadhaar: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "guardian", label: "S/O, D/O, W/O", demo: "Guardian Name" },
    { key: "dob", label: "Date of Birth", demo: "01/01/1990" },
    { key: "gender", label: "Gender", demo: "Male" },
    { key: "idNumber", label: "Aadhaar Number", demo: "XXXX XXXX XXXX" },
    { key: "address", label: "Address", demo: "House No, Street, City, State - PIN" },
  ],
  pan: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "guardian", label: "Father's Name", demo: "Father's Name" },
    { key: "dob", label: "Date of Birth", demo: "01/01/1990" },
    { key: "idNumber", label: "PAN Number", demo: "ABCDE1234F" },
  ],
  rc: [
    { key: "name", label: "Owner Name", demo: "Ravi Kumar" },
    { key: "idNumber", label: "Registration Number", demo: "BR01 AB 1234" },
    { key: "vehicleClass", label: "Vehicle Class", demo: "Motor Car" },
    { key: "chassis", label: "Chassis Number", demo: "Chassis No." },
    { key: "engine", label: "Engine Number", demo: "Engine No." },
    { key: "address", label: "Registered Address", demo: "House No, Street, City, State - PIN" },
  ],
  dl: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "dob", label: "Date of Birth", demo: "01/01/1990" },
    { key: "idNumber", label: "DL Number", demo: "BR01 2023 0012345" },
    { key: "validity", label: "Valid Till", demo: "01/01/2040" },
    { key: "bloodGroup", label: "Blood Group", demo: "O+" },
    { key: "address", label: "Address", demo: "House No, Street, City, State - PIN" },
  ],
};

const DOC_LAYOUT: Record<DocType, DocLayout> = {
  aadhaar: { title: "Aadhaar Card", front: ["name", "dob", "gender"], back: ["guardian", "address"] },
  pan: { title: "PAN Card", front: ["name", "guardian", "dob"], back: [] },
  rc: { title: "Registration Certificate", front: ["name", "vehicleClass"], back: ["chassis", "engine", "address"] },
  dl: { title: "Driving Licence", front: ["name", "dob", "bloodGroup"], back: ["validity", "address"] },
};

const COPY_OPTIONS = [2, 4, 6, 8];

export default function IdCardMakerClient() {
  const pathname = usePathname();
  const [docType, setDocType] = useState<DocType>("aadhaar");
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("upload");
  const [values, setValues] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState("");
  const [colorMode, setColorMode] = useState<ColorMode>("color");
  const [copies, setCopies] = useState(4);
  const [loginPrompt, setLoginPrompt] = useState(false);

  // Building and previewing a card is free for anyone. Login is only
  // required for the actual print/download output, since generating that
  // file needs an identity to store it against.
  function requireLogin() {
    if (hasStoredSession()) return true;
    setLoginPrompt(true);
    return false;
  }

  const fields = DOC_FIELDS[docType];
  const layout = DOC_LAYOUT[docType];

  function selectDocType(next: DocType) {
    setDocType(next);
    setFile(null);
    setStep("upload");
    setValues({});
  }

  function handleFileChange(selected?: File | null) {
    if (!selected) return;
    setFile(selected);
    setStep("upload");
    setValues({});
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileChange(dropped);
  }

  function clearUpload() {
    setFile(null);
    setStep("upload");
    setValues({});
  }

  function extractText() {
    if (!file) return;
    setStep("extracting");
    window.setTimeout(() => {
      const demoValues: Record<string, string> = {};
      fields.forEach((field) => {
        demoValues[field.key] = field.demo;
      });
      setValues(demoValues);
      setStep("review");
    }, 1200);
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

  const isReady = step === "review";

  return (
    <DashboardShell activePath="/id-card-maker">
      <div className="dashboard idcard-page">
        <WalletLimitBanner />
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">PrintPilot ID Card Maker</span>
            <h1>ID Card Maker from PDF</h1>
            <p>Upload the downloaded Aadhaar, PAN, RC or DL PDF, pull out the text, and recreate a clean, print-ready ID card.</p>
          </div>
          <div className="auto-print-hero-actions">
            <span className="status-pill warning">Wireframe - text below is demo data</span>
          </div>
        </div>

        <div className="idcard-doctype-tabs">
          {DOC_TYPES.map((doc) => {
            const DocIcon = doc.icon;
            return (
              <button key={doc.key} type="button" className={docType === doc.key ? "active" : ""} onClick={() => selectDocType(doc.key)}>
                <DocIcon size={18} />
                <span>{doc.label}</span>
              </button>
            );
          })}
        </div>

        <section className="passport-maker-grid">
          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 1</span>
              <h2>Upload {layout.title} PDF</h2>
            </div>

            {file ? (
              <div className="customer-document-preview">
                <div className="document-thumb">
                  <div className="pdf-thumb">
                    <FileScan size={30} />
                  </div>
                </div>
                <div>
                  <strong>{file.name}</strong>
                  <div className="document-actions">
                    <button type="button" onClick={clearUpload}>
                      <X size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label className="customer-upload" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
                <Upload size={24} />
                <strong>Upload {layout.title} PDF</strong>
                <span>Drag &amp; drop the downloaded PDF, or choose a file.</span>
                <em>Tap to choose a file</em>
                <input accept=".pdf,application/pdf" type="file" onChange={(event) => handleFileChange(event.target.files?.[0])} />
              </label>
            )}

            {file && step !== "review" ? (
              <button className="passport-preview-button" type="button" onClick={extractText} disabled={step === "extracting"}>
                {step === "extracting" ? <Loader2 size={18} className="passport-step-spin" /> : <FileScan size={18} />}
                {step === "extracting" ? "Extracting text..." : "Extract Text"}
              </button>
            ) : null}

            {step === "review" ? (
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
            ) : null}
          </article>

          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 2</span>
              <h2>Card Preview &amp; Print</h2>
            </div>

            {isReady ? (
              <>
                <div className="idcard-preview">
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
              </>
            ) : (
              <p className="customer-inline-help">Upload the PDF and tap Extract Text to preview the recreated card here.</p>
            )}
          </article>
        </section>
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
