"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileWarning,
  LoaderCircle,
  Lock,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  ScanSearch,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { hasStoredSession } from "@/lib/api";
import { CropEditor, cropImage, type CropRect } from "../CropEditor";
import { DashboardShell } from "../DashboardShell";
import {
  CARD_TYPES,
  detectCardType,
  getCardTemplate,
  getDefaultCardTemplate,
  hasSavedCardTemplate,
  saveCardTemplate,
  type CardTemplate,
  type CardTypeInfo,
} from "@/lib/cardPrint";

type SourcePage = { index: number; image: string; width: number; height: number; text: string };
type Face = "front" | "back";

export default function CardPrintPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [pages, setPages] = useState<SourcePage[]>([]);
  const [cardType, setCardType] = useState<CardTypeInfo | null>(null);
  const [template, setTemplate] = useState<CardTemplate | null>(null);
  const [activeFace, setActiveFace] = useState<Face>("front");
  const [templateSaved, setTemplateSaved] = useState(false);

  const [frontImage, setFrontImage] = useState("");
  const [backImage, setBackImage] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    if (!hasStoredSession()) {
      router.push(`/login?next=${encodeURIComponent("/card-print")}`);
    }
  }, [router]);

  useEffect(() => {
    if (!pages.length || !template) return;
    const timer = setTimeout(() => {
      renderFaces(pages, template).catch(() => setLoadError("Could not crop the card preview."));
    }, 120);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, template]);

  async function renderFaces(sourcePages: SourcePage[], tmpl: CardTemplate) {
    setIsRendering(true);
    try {
      const frontSource = sourcePages.find((page) => page.index === tmpl.front.page) || sourcePages[0];
      const backSource = sourcePages.find((page) => page.index === tmpl.back.page) || sourcePages[sourcePages.length - 1];
      const [frontBlob, backBlob] = await Promise.all([
        cropImage(frontSource.image, tmpl.front.rect),
        cropImage(backSource.image, tmpl.back.rect),
      ]);
      const [frontUrl, backUrl] = await Promise.all([blobToDataUrl(frontBlob), blobToDataUrl(backBlob)]);
      setFrontImage(frontUrl);
      setBackImage(backUrl);
    } finally {
      setIsRendering(false);
    }
  }

  async function handleFiles(list: FileList) {
    const selected = list[0];
    if (!selected) return;
    reset();
    setFile(selected);
    await loadPdf(selected, "");
  }

  async function loadPdf(selected: File, pwd: string) {
    setIsLoading(true);
    setLoadError("");
    try {
      const rendered = await renderPdfPages(selected, pwd || undefined);
      setPages(rendered);
      setNeedsPassword(false);
      const fullText = rendered.map((page) => page.text).join(" ");
      const type = detectCardType(fullText);
      setCardType(type);
      const tmpl = getCardTemplate(type.key, rendered.length);
      setTemplate(tmpl);
      setActiveFace("front");
      setTemplateSaved(hasSavedCardTemplate(type.key, rendered.length));
    } catch (error) {
      setPages([]);
      setCardType(null);
      setTemplate(null);
      if (isPasswordException(error)) {
        setNeedsPassword(true);
        setLoadError(pwd ? "Incorrect password. Try again." : "This PDF is password protected. Enter the password to continue.");
      } else {
        setNeedsPassword(false);
        setLoadError("Could not open this PDF. It may be corrupted or unsupported.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setPassword("");
    setShowPassword(false);
    setNeedsPassword(false);
    setLoadError("");
    setPages([]);
    setCardType(null);
    setTemplate(null);
    setFrontImage("");
    setBackImage("");
    setTemplateSaved(false);
  }

  function updateFaceRect(rect: CropRect) {
    setTemplate((current) => (current ? { ...current, [activeFace]: { ...current[activeFace], rect } } : current));
    setTemplateSaved(false);
  }

  function updateFacePage(pageIndex: number) {
    setTemplate((current) => (current ? { ...current, [activeFace]: { ...current[activeFace], page: pageIndex } } : current));
    setTemplateSaved(false);
  }

  function resetFaceCrop() {
    if (!cardType) return;
    const defaults = getDefaultCardTemplate(cardType.key, pages.length);
    setTemplate((current) => (current ? { ...current, [activeFace]: defaults[activeFace] } : current));
    setTemplateSaved(false);
  }

  function saveTemplate() {
    if (!cardType || !template) return;
    saveCardTemplate(cardType.key, pages.length, template);
    setTemplateSaved(true);
  }

  function printCard() {
    if (!frontImage || !backImage) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(buildCardPrintHtml(frontImage, backImage));
    printWindow.document.close();
  }

  async function downloadCard() {
    if (!frontImage || !backImage || !cardType) return;
    const dataUrl = await buildCombinedPreview(frontImage, backImage);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${cardType.key}-card.png`;
    link.click();
  }

  const activeSourcePage = template ? pages.find((page) => page.index === template[activeFace].page) || pages[0] : undefined;

  return (
    <DashboardShell activePath="/card-print">
      <div className="dashboard card-print-dashboard">
        <div className="dashboard-hero">
          <div>
            <span className="auto-print-kicker">RepetiGo Card Print</span>
            <h1>Universal Card Print</h1>
            <p>Upload any government ID PDF - Aadhaar, PAN, Voter ID, Driving Licence and more. We detect the card, crop the front &amp; back, and get it print-ready.</p>
          </div>
          {cardType ? (
            <span className="status-pill card-type-pill" style={{ "--tag-color": cardType.color } as React.CSSProperties}>
              <CreditCard size={15} /> {cardType.label} detected
            </span>
          ) : null}
        </div>

        <section className="panel card-print-upload-bar">
          <div className="card-print-upload-file">
            <span className="icon-tile" style={{ "--tile-color": "#2563eb" } as React.CSSProperties}>
              <Upload size={19} />
            </span>
            <div>
              <strong>{file ? file.name : "No PDF selected"}</strong>
              <small>{file ? formatBytes(file.size) : "Select any card PDF to auto-detect its type"}</small>
            </div>
            <button className="btn" type="button" onClick={() => inputRef.current?.click()}>
              {file ? "Change File" : "Select PDF"}
            </button>
            <input
              ref={inputRef}
              hidden
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                if (event.target.files?.length) void handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>

          {needsPassword ? (
            <div className="card-print-password-row">
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="PDF password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && file) void loadPdf(file, password);
                  }}
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <button className="btn btn-primary" type="button" disabled={!password || isLoading} onClick={() => file && loadPdf(file, password)}>
                {isLoading ? <LoaderCircle className="spin" size={16} /> : <Lock size={16} />} Unlock
              </button>
            </div>
          ) : null}

          {isLoading ? (
            <div className="card-print-status">
              <ScanSearch size={16} className="spin" /> Reading document and detecting card type...
            </div>
          ) : null}
          {loadError ? (
            <div className="profile-alert error card-print-error">
              <FileWarning size={15} /> {loadError}
            </div>
          ) : null}
        </section>

        {pages.length > 0 && template && cardType ? (
          <section className="card-print-layout">
            <div className="panel card-print-stage">
              <div className="panel-title-row compact">
                <div>
                  <h2>Card Preview</h2>
                  <p>Detected from {pages.length} page{pages.length > 1 ? "s" : ""}. Fine-tune the crop on the right, print looks match this preview.</p>
                </div>
              </div>
              <div className="card-print-faces">
                <CardFaceView label="Front" image={frontImage} loading={isRendering} />
                <CardFaceView label="Back" image={backImage} loading={isRendering} />
              </div>
              <div className="card-print-actions">
                <button className="btn btn-primary" type="button" disabled={!frontImage || !backImage} onClick={printCard}>
                  <Printer size={16} /> Print Card
                </button>
                <button className="btn" type="button" disabled={!frontImage || !backImage} onClick={() => void downloadCard()}>
                  <Download size={16} /> Download
                </button>
              </div>
            </div>

            <aside className="panel card-print-adjust">
              <div className="panel-title-row compact">
                <div>
                  <h2>Adjust Card Area</h2>
                  <p>Drag the frame so it matches the {activeFace} of the card exactly.</p>
                </div>
              </div>

              <div className="card-print-face-tabs">
                <button className={activeFace === "front" ? "active" : ""} type="button" onClick={() => setActiveFace("front")}>
                  Front
                </button>
                <button className={activeFace === "back" ? "active" : ""} type="button" onClick={() => setActiveFace("back")}>
                  Back
                </button>
              </div>

              {pages.length > 1 ? (
                <div className="card-print-page-picker">
                  <span>Source page for {activeFace}</span>
                  <div>
                    {pages.map((page) => (
                      <button
                        className={template[activeFace].page === page.index ? "active" : ""}
                        key={page.index}
                        type="button"
                        onClick={() => updateFacePage(page.index)}
                      >
                        <img src={page.image} alt={`Page ${page.index}`} />
                        <small>Page {page.index}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {activeSourcePage ? (
                <div
                  className="card-print-crop-stage"
                  style={{ "--stage-ratio": `${activeSourcePage.width} / ${activeSourcePage.height}` } as React.CSSProperties}
                >
                  <CropEditor fileUrl={activeSourcePage.image} rect={template[activeFace].rect} onRectChange={updateFaceRect} />
                </div>
              ) : null}

              <div className="card-print-adjust-actions">
                <button className="btn" type="button" onClick={resetFaceCrop}>
                  <RotateCcw size={15} /> Reset
                </button>
                <button className="btn" type="button" onClick={saveTemplate} disabled={templateSaved}>
                  <Save size={15} /> {templateSaved ? "Saved as default" : "Save as default"}
                </button>
              </div>
              <p className="card-print-hint">
                <ShieldCheck size={13} /> Saved crops apply automatically the next time a {cardType.label} PDF with the same page layout is uploaded.
              </p>
            </aside>
          </section>
        ) : null}
      </div>
    </DashboardShell>
  );
}

function CardFaceView({ label, image, loading }: { label: string; image: string; loading: boolean }) {
  return (
    <div className="card-print-face-card">
      <span>{label}</span>
      <div className="card-print-face-frame">
        {image ? <img src={image} alt={`${label} of the card`} /> : loading ? <LoaderCircle className="spin" size={22} /> : <RefreshCw size={22} />}
      </div>
    </div>
  );
}

async function renderPdfPages(file: File, password?: string): Promise<SourcePage[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), password }).promise;
  const output: SourcePage[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const view = page.getViewport({ scale: Math.min(3, 1600 / base.width) });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(view.width);
    canvas.height = Math.ceil(view.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    await page.render({ canvas, canvasContext: context, viewport: view }).promise;
    const content = await page.getTextContent();
    output.push({
      index: n,
      image: canvas.toDataURL("image/jpeg", 0.95),
      width: base.width,
      height: base.height,
      text: (content.items as Array<{ str?: string }>).map((item) => item.str || "").join(" "),
    });
  }
  return output;
}

function isPasswordException(error: unknown) {
  return Boolean(error && typeof error === "object" && "name" in error && (error as { name?: string }).name === "PasswordException");
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read cropped image."));
    reader.readAsDataURL(blob);
  });
}

function buildCardPrintHtml(frontUrl: string, backUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Card Print</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;}
.card-page{display:flex;width:85.6mm;height:53.98mm;align-items:center;justify-content:center;overflow:hidden;background:#fff;page-break-after:always;}
.card-page:last-child{page-break-after:auto;}
.card-page img{width:100%;height:100%;object-fit:cover;}
@media print{
  body{background:#fff;}
  @page{size:85.6mm 53.98mm;margin:0;}
}
</style>
</head>
<body>
<div class="card-page"><img src="${frontUrl}" /></div>
<div class="card-page"><img src="${backUrl}" /></div>
<script>
  window.onload = function () {
    window.focus();
    window.print();
  };
</script>
</body>
</html>`;
}

async function buildCombinedPreview(frontUrl: string, backUrl: string) {
  const [front, back] = await Promise.all([loadImageElement(frontUrl), loadImageElement(backUrl)]);
  const cardWidth = 640;
  const cardHeight = Math.round(cardWidth * (53.98 / 85.6));
  const gap = 28;
  const canvas = document.createElement("canvas");
  canvas.width = cardWidth * 2 + gap;
  canvas.height = cardHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(front, 0, 0, cardWidth, cardHeight);
  context.drawImage(back, cardWidth + gap, 0, cardWidth, cardHeight);
  return canvas.toDataURL("image/png");
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load image."));
    image.src = src;
  });
}

function formatBytes(bytes: number) {
  return bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(2)} MB`;
}
