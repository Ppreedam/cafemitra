"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Contrast,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileWarning,
  Image as ImageIcon,
  Layers,
  LoaderCircle,
  Lock,
  LogIn,
  RotateCcw,
  ScanSearch,
  X,
} from "lucide-react";
import { hasStoredSession } from "@/lib/api";
import { CropEditor, cropImage, type CropRect } from "../../CropEditor";
import { DashboardShell } from "../../DashboardShell";
import { PdfToolUpload } from "../../pdf-tools/PdfToolUpload";
import { getCardTemplate, getDefaultCardTemplate, type CardTemplate } from "@/lib/cardPrint";
import { DOC_TYPES } from "../docTypes";

// Position/size in PDF points, page coordinate space (origin bottom-left,
// matching page.getViewport({ scale: 1 })) - same convention pdf-lib expects.
type PdfTextItem = { str: string; x: number; y: number; width: number; height: number };
type SourcePage = { index: number; image: string; width: number; height: number; textItems: PdfTextItem[] };
type Face = "front" | "back";
type Phase = "upload" | "loading" | "ready";

const CARD_W_IN = 3.38;
const CARD_H_IN = 2.13;
const CARD_ASPECT = `${CARD_W_IN}/${CARD_H_IN}`;
const COPY_OPTIONS = [1, 2, 4, 6, 8];

const panMeta = DOC_TYPES.find((doc) => doc.key === "pan")!;

export default function PanCardMakerClient({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [phase, setPhase] = useState<Phase>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [loadError, setLoadError] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const [pages, setPages] = useState<SourcePage[]>([]);
  const [template, setTemplate] = useState<CardTemplate | null>(null);
  // Same shape as `template`, but each rect additionally trimmed to the
  // detected visible-content bounds (see trimWhitespace) - what actually
  // gets exported/printed. `template` itself stays exactly what the user
  // dragged/typed, so the crop editor doesn't fight their input.
  const [effectiveTemplate, setEffectiveTemplate] = useState<CardTemplate | null>(null);
  const [activeFace, setActiveFace] = useState<Face>("front");
  const [panelMode, setPanelMode] = useState<"preview" | "crop" | "photo">("preview");

  const [rawFront, setRawFront] = useState("");
  const [rawBack, setRawBack] = useState("");
  const [outFront, setOutFront] = useState("");
  const [outBack, setOutBack] = useState("");
  const [isRendering, setIsRendering] = useState(false);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [copies, setCopies] = useState(1);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [busyAction, setBusyAction] = useState<"" | "thermal-pdf" | "thermal-print" | "a4" | "4x6">("");
  const [outputError, setOutputError] = useState("");
  const [downloadNotice, setDownloadNotice] = useState("");

  useEffect(() => {
    if (!pages.length || !template) return;
    const timer = setTimeout(() => {
      renderFaces(pages, template).catch(() => setLoadError("Could not crop the card preview."));
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, template]);

  useEffect(() => {
    if (!rawFront || !rawBack) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      (async () => {
        // Brightness/contrast (if touched) applies to the color card first,
        // then Remove Background's B&W clean-up runs on top of that - doing
        // it the other way round would just be re-adjusting an already
        // near-binary image.
        const needsAdjust = brightness !== 100 || contrast !== 100;
        const [adjFront, adjBack] = needsAdjust
          ? await Promise.all([applyBrightnessContrast(rawFront, brightness, contrast), applyBrightnessContrast(rawBack, brightness, contrast)])
          : [rawFront, rawBack];
        if (cancelled) return;
        if (!removeBackground) {
          setOutFront(adjFront);
          setOutBack(adjBack);
          return;
        }
        const [cleanFront, cleanBack] = await Promise.all([cleanBackground(adjFront), cleanBackground(adjBack)]);
        if (!cancelled) {
          setOutFront(cleanFront);
          setOutBack(cleanBack);
        }
      })();
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [rawFront, rawBack, removeBackground, brightness, contrast]);

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
      // The typed/dragged rect is often a little loose - trim any solid
      // blank margin caught inside it (e.g. dead page space below the
      // card graphic) so both the preview and every export are full-bleed.
      const [frontTrim, backTrim] = await Promise.all([trimWhitespace(frontUrl), trimWhitespace(backUrl)]);
      setRawFront(frontTrim.url);
      setRawBack(backTrim.url);
      setEffectiveTemplate({
        ...tmpl,
        front: { ...tmpl.front, rect: intersectRect(tmpl.front.rect, frontTrim.bounds) },
        back: { ...tmpl.back, rect: intersectRect(tmpl.back.rect, backTrim.bounds) },
      });
    } finally {
      setIsRendering(false);
    }
  }

async function handleFiles(files: FileList) {
    const selected = files[0];
    if (!selected) return;
    reset();
    setFile(selected);
    setFileName(selected.name);
    await loadPdf(selected, "");
  }

  // First attempt (no password yet) shows the full-page "loading" state;
  // a retry after the password prompt appears keeps that prompt on screen
  // (with its own busy indicator) instead of flashing back to "loading".
  async function loadPdf(selected: File, pwd: string) {
    setNeedsPassword(false);
    setUnlocking(Boolean(pwd));
    if (!pwd) setPhase("loading");
    setLoadError("");
    try {
      const rendered = await renderPdfPages(selected, pwd || undefined);
      // Once the password is confirmed correct, swap in a fully decrypted
      // copy of the file - pdf-lib (used later for the vector/text-preserving
      // PDF export) cannot open an encrypted PDF on its own.
      if (pwd) {
        try {
          const { decryptPDF } = await import("@pdfsmaller/pdf-decrypt");
          const decrypted = await decryptPDF(new Uint8Array(await selected.arrayBuffer()), pwd);
          setFile(new File([decrypted], selected.name, { type: "application/pdf" }));
        } catch (decryptError) {
          console.error("Could not produce a decrypted copy for vector PDF export", decryptError);
          // Vector export will fall back to a raster-only download below if this failed.
        }
      }
      setPages(rendered);
      const tmpl = getCardTemplate("pan", rendered.length);
      setTemplate(tmpl);
      setActiveFace("front");
      setPhase("ready");
    } catch (error) {
      if (isPasswordException(error)) {
        setNeedsPassword(true);
        setPhase("upload");
        setLoadError(pwd ? "Incorrect password. Try again." : "This PDF is password protected. Enter the password to continue.");
      } else {
        setPhase("upload");
        setLoadError("Could not read this PDF. It may be corrupted or an unsupported format.");
      }
    } finally {
      setUnlocking(false);
    }
  }

  function reset() {
    setLoadError("");
    setNeedsPassword(false);
    setPassword("");
    setShowPassword(false);
    setFile(null);
    setPages([]);
    setTemplate(null);
    setEffectiveTemplate(null);
    setRawFront("");
    setRawBack("");
    setOutFront("");
    setOutBack("");
    setPanelMode("preview");
    setBrightness(100);
    setContrast(100);
    setOutputError("");
    setDownloadNotice("");
  }

  function updateFaceRect(rect: CropRect) {
    setTemplate((current) => (current ? { ...current, [activeFace]: { ...current[activeFace], rect } } : current));
  }

  function updateFaceRectField(field: keyof CropRect, value: number) {
    if (!Number.isFinite(value)) return;
    const clamped = Math.max(0, Math.min(100, value));
    setTemplate((current) => {
      if (!current) return current;
      const rect = { ...current[activeFace].rect, [field]: clamped };
      rect.width = Math.min(rect.width, 100 - rect.x);
      rect.height = Math.min(rect.height, 100 - rect.y);
      return { ...current, [activeFace]: { ...current[activeFace], rect } };
    });
  }

  function updateFacePage(pageIndex: number) {
    setTemplate((current) => (current ? { ...current, [activeFace]: { ...current[activeFace], page: pageIndex } } : current));
  }

  function resetFaceCrop() {
    const defaults = getDefaultCardTemplate("pan", pages.length);
    setTemplate((current) => (current ? { ...current, [activeFace]: defaults[activeFace] } : current));
  }

  function requireLogin() {
    if (hasStoredSession()) return true;
    setLoginPrompt(true);
    return false;
  }

  async function downloadThermalPdf() {
    if (!outFront || !outBack || !template || !requireLogin()) return;
    const exportTemplate = effectiveTemplate || template;
    setBusyAction("thermal-pdf");
    setOutputError("");
    setDownloadNotice("");
    try {
      // Three-tier export, best fidelity first. Remove Background always
      // uses the plain raster path since that clean-up is itself a pixel
      // filter, so there's no vector content left to preserve.
      let bytes: Uint8Array;
      if (!removeBackground && file) {
        try {
          // 1) Best: lift the crop straight out of the original PDF's
          // vector content - text stays real, selectable text.
          bytes = await buildVectorThermalPdf(file, exportTemplate);
        } catch (vectorError) {
          console.error("Vector PDF export failed, trying hybrid export", vectorError);
          try {
            // 2) Some government e-card PDFs (digitally signed, unusual
            // xref/object-stream layout) block pdf-lib from parsing the
            // source file at all. This path never re-parses it - it rebuilds
            // from pdf.js's already-successful render + text positions, so
            // English/ASCII fields (name, DOB, PAN number...) still come out
            // as real vector text; only the Hindi labels stay part of the
            // background image.
            bytes = await buildHybridThermalPdf(pages, exportTemplate, rawFront, rawBack);
            setDownloadNotice("This PDF's structure didn't allow a fully text-based export, so English fields (name, DOB, PAN number) were redrawn as real text over the card image - Hindi labels stay part of the image.");
          } catch (hybridError) {
            console.error("Hybrid PDF export failed, falling back to plain image export", hybridError);
            bytes = await buildRasterThermalPdf(outFront, outBack);
            const reason = hybridError instanceof Error ? hybridError.message : String(hybridError);
            setDownloadNotice(`This PDF's structure didn't allow a text-preserving export, so a high-resolution image version was downloaded instead. (Details: ${reason})`);
          }
        }
      } else {
        bytes = await buildRasterThermalPdf(outFront, outBack);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pan-card-thermal.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Thermal PDF export failed", error);
      setOutputError("Could not build the thermal card PDF. Please try again.");
    } finally {
      setBusyAction("");
    }
  }

  function printA4() {
    if (!outFront || !outBack || !requireLogin()) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(buildA4PrintHtml(outFront, outBack, copies));
    printWindow.document.close();
  }

  function print4x6() {
    if (!outFront || !outBack || !requireLogin()) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(build4x6PrintHtml(outFront, outBack));
    printWindow.document.close();
  }

  const activeSourcePage = template ? pages.find((page) => page.index === template[activeFace].page) || pages[0] : undefined;

  return (
    <DashboardShell activePath="/id-card-maker">
      <div className="dashboard idcard-page">
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">Free PDF Tool</span>
            <h1>PAN Card Maker from PDF</h1>
            <p>Upload your password-protected e-PAN PDF - we unlock it, crop the front &amp; back, and get it print-ready for a thermal card printer, A4 sheet, or 4x6 photo paper.</p>
          </div>
          <span className="status-pill card-type-pill" style={{ "--tag-color": panMeta.color } as React.CSSProperties}>
            <CreditCard size={15} /> PAN Card
          </span>
        </div>

        {phase === "upload" ? (
          <>
            <PdfToolUpload
              title="PAN Card Maker from PDF"
              description="Upload the downloaded e-PAN PDF - we'll unlock it (if password-protected) and recreate a clean, print-ready card."
              icon={panMeta.icon}
              inputRef={inputRef}
              onFiles={(files) => void handleFiles(files)}
              buttonLabel="Select PAN Card PDF"
              dropLabel="or drop the PDF here"
              accept="application/pdf,.pdf"
              multiple={false}
              backHref="/id-card-maker"
              backLabel="ID Card Maker"
            />

            {loadError && !needsPassword ? (
              <div className="profile-alert error">
                <FileWarning size={15} /> {loadError}
              </div>
            ) : null}
          </>
        ) : phase === "loading" ? (
          <article className="customer-panel idcard-extracting-panel">
            <ScanSearch size={26} className="passport-step-spin spin" />
            <strong>Reading {fileName}...</strong>
            <p className="customer-inline-help">Unlocking and rendering the PDF pages.</p>
          </article>
        ) : (
          <section className="passport-maker-grid">
            <article className="customer-panel">
              <div className="customer-panel-head">
                <span>Step 1</span>
                <h2>Card Preview</h2>
              </div>
              <p className="customer-inline-help">From {fileName}. Fine-tune the crop below if the front/back don&apos;t line up.</p>

              <div className="idcard-photo-pair">
                <div className="idcard-side-slot">
                  <span className="idcard-side-label">Front</span>
                  <div className="idcard-card-slot filled">
                    {outFront ? <img src={outFront} alt="Front of PAN card" /> : <LoaderCircle className="spin" size={22} />}
                  </div>
                </div>
                <div className="idcard-side-slot">
                  <span className="idcard-side-label">Back</span>
                  <div className="idcard-card-slot filled">
                    {outBack ? <img src={outBack} alt="Back of PAN card" /> : <LoaderCircle className="spin" size={22} />}
                  </div>
                </div>
              </div>

              <div className="idcard-toggle-group" style={{ marginTop: 14 }}>
                <button type="button" className={panelMode === "preview" ? "active" : ""} onClick={() => setPanelMode("preview")}>
                  Preview
                </button>
                <button type="button" className={panelMode === "crop" ? "active" : ""} onClick={() => setPanelMode("crop")}>
                  Adjust Crop
                </button>
                <button type="button" className={panelMode === "photo" ? "active" : ""} onClick={() => setPanelMode("photo")}>
                  Adjust Photo
                </button>
              </div>

              {panelMode === "crop" ? (
                <div style={{ marginTop: 14 }}>
                  <div className="idcard-toggle-group">
                    <button type="button" className={activeFace === "front" ? "active" : ""} onClick={() => setActiveFace("front")}>
                      Front
                    </button>
                    <button type="button" className={activeFace === "back" ? "active" : ""} onClick={() => setActiveFace("back")}>
                      Back
                    </button>
                  </div>

                  {pages.length > 1 ? (
                    <div className="idcard-toggle-group" style={{ marginTop: 8 }}>
                      {pages.map((page) => (
                        <button
                          key={page.index}
                          type="button"
                          className={template?.[activeFace].page === page.index ? "active" : ""}
                          onClick={() => updateFacePage(page.index)}
                        >
                          Page {page.index}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {activeSourcePage && template ? (
                    <div style={{ marginTop: 10 }}>
                      <CropEditor fileUrl={activeSourcePage.image} rect={template[activeFace].rect} onRectChange={updateFaceRect} aspectRatio={CARD_ASPECT} />
                    </div>
                  ) : null}

                  {template ? (
                    <section className="pdf-edit-controls" style={{ marginTop: 10 }}>
                      <h3>{activeFace === "front" ? "Front" : "Back"} crop area (% of page)</h3>
                      <div className="edit-margin-grid">
                        {(["x", "y", "width", "height"] as const).map((field) => (
                          <label key={field}>
                            {field === "x" ? "X" : field === "y" ? "Y" : field === "width" ? "Width" : "Height"}
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={0.1}
                              value={Math.round(template[activeFace].rect[field] * 10) / 10}
                              onChange={(event) => updateFaceRectField(field, Number(event.target.value))}
                            />
                          </label>
                        ))}
                      </div>
                      <p>0-100, measured from the page&apos;s top-left corner. Matches the box above - type exact numbers or drag it.</p>
                    </section>
                  ) : null}

                  <button className="btn" type="button" onClick={resetFaceCrop} style={{ marginTop: 10 }}>
                    <RotateCcw size={15} /> Reset {activeFace} crop
                  </button>
                </div>
              ) : null}

              {panelMode === "photo" ? (
                <section className="pdf-edit-controls" style={{ marginTop: 14 }}>
                  <h3>Brightness &amp; contrast</h3>
                  <p>Applies to both front and back - use this to lift a dull/dark scan so the printed photo looks fresh.</p>
                  <label>
                    Brightness <span>{brightness}%</span>
                    <input type="range" min={50} max={150} value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} />
                  </label>
                  <label>
                    Contrast <span>{contrast}%</span>
                    <input type="range" min={50} max={150} value={contrast} onChange={(event) => setContrast(Number(event.target.value))} />
                  </label>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                    }}
                  >
                    <RotateCcw size={15} /> Reset
                  </button>
                </section>
              ) : null}
            </article>

            <article className="customer-panel">
              <div className="customer-panel-head">
                <span>Step 2</span>
                <h2>Print &amp; Download</h2>
              </div>

              <label className="idcard-remove-bg-toggle">
                <input type="checkbox" checked={removeBackground} onChange={(event) => setRemoveBackground(event.target.checked)} />
                <span>
                  <Contrast size={16} /> Remove background
                </span>
                <small>Strips the colored background pattern and converts the card to clean black &amp; white for cheap thermal/inkjet printing.</small>
              </label>

              <div className="idcard-print-controls">
                <button className="passport-preview-button" type="button" disabled={!outFront || !outBack || busyAction === "thermal-pdf"} onClick={() => void downloadThermalPdf()}>
                  <Download size={18} /> {busyAction === "thermal-pdf" ? "Preparing…" : "Download Thermal PDF (2-page, high quality, 3.38×2.13in)"}
                </button>
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
                <button className="passport-preview-button" type="button" disabled={!outFront || !outBack} onClick={printA4}>
                  <Layers size={18} /> Print A4 Sheet
                </button>

                <button className="passport-preview-button" type="button" disabled={!outFront || !outBack} onClick={print4x6}>
                  <ImageIcon size={18} /> Print on 4x6 Photo Paper
                </button>
              </div>

              {outputError ? <div className="profile-alert error">{outputError}</div> : null}
              {downloadNotice ? <p className="customer-inline-help">{downloadNotice}</p> : null}
              {isRendering ? (
                <p className="customer-inline-help">
                  <LoaderCircle className="spin" size={14} /> Re-rendering card preview...
                </p>
              ) : null}
            </article>
          </section>
        )}

        {children}
      </div>

      {needsPassword ? (
        <div
          className="pdf-password-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Enter password for ${fileName}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) reset();
          }}
        >
          <section className="pdf-password-modal">
            <header>
              <div>
                <span className="pdf-password-icon">
                  <Lock size={18} />
                </span>
                <div>
                  <strong>Password required</strong>
                  <span>{fileName}</span>
                </div>
              </div>
              <button type="button" onClick={reset} aria-label="Cancel">
                <X size={18} />
              </button>
            </header>
            <form
              className="pdf-password-body"
              onSubmit={(event) => {
                event.preventDefault();
                if (file) void loadPdf(file, password);
              }}
            >
              <p>This PDF is password protected. Enter the password to unlock it and continue.</p>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  autoFocus
                  placeholder="PDF password"
                  value={password}
                  disabled={unlocking}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {loadError ? <span className="pdf-password-error">{loadError}</span> : null}
              <div className="pdf-password-actions">
                <button type="button" className="pdf-password-cancel" onClick={reset} disabled={unlocking}>
                  Cancel
                </button>
                <button type="submit" className="pdf-password-submit" disabled={!password || unlocking}>
                  {unlocking ? "Unlocking…" : "Unlock"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {loginPrompt ? (
        <div className="resbuild-confirm-overlay" onClick={() => setLoginPrompt(false)}>
          <div className="resbuild-confirm-modal" onClick={(event) => event.stopPropagation()}>
            <span className="resbuild-confirm-icon">
              <LogIn size={20} />
            </span>
            <h3>Login to continue</h3>
            <p>Your card stays exactly as you left it. Log in (or create a free account) to print or download it.</p>
            <div className="resbuild-confirm-actions">
              <button type="button" className="resbuild-btn-secondary" onClick={() => setLoginPrompt(false)}>
                Keep editing
              </button>
              <Link className="resbuild-btn-primary" href={`/login?next=${encodeURIComponent(pathname)}`}>
                Login
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
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
    const view = page.getViewport({ scale: Math.min(4, 2400 / base.width) });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(view.width);
    canvas.height = Math.ceil(view.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    await page.render({ canvas, canvasContext: context, viewport: view }).promise;

    // Captured for the hybrid PDF export path (see buildHybridThermalPdf):
    // only ASCII runs are kept, since those are the fields we can redraw as
    // real vector text with a standard Latin font - Devanagari labels stay
    // part of the rendered background image instead.
    const textContent = await page.getTextContent();
    const textItems: PdfTextItem[] = [];
    for (const raw of textContent.items as Array<{ str?: string; transform?: number[]; width?: number; height?: number }>) {
      const str = (raw.str || "").trim();
      if (!str || !/^[\x00-\x7F]+$/.test(str) || !/[A-Za-z0-9]/.test(str)) continue;
      const transform = raw.transform || [1, 0, 0, 1, 0, 0];
      textItems.push({
        str,
        x: transform[4],
        y: transform[5],
        width: raw.width || 0,
        height: raw.height || Math.hypot(transform[0], transform[1]) || 10,
      });
    }

    output.push({ index: n, image: canvas.toDataURL("image/jpeg", 0.95), width: base.width, height: base.height, textItems });
  }
  return output;
}

// Embeds the exact cropped region of the *original* PDF page as a vector
// XObject (via pdf-lib's embedPage) instead of a rasterised picture, so text
// stays real text (selectable, sharp at any zoom/print DPI) rather than a
// bitmap of text. `rect` is a percentage of the page, top-left origin
// (matching the on-screen crop editor); pdf-lib's boundingBox is in PDF
// points measured bottom-left, so y needs flipping.
async function buildVectorThermalPdf(sourceFile: File, template: CardTemplate): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = await sourceFile.arrayBuffer();
  let srcDoc;
  try {
    srcDoc = await PDFDocument.load(bytes);
  } catch (firstError) {
    // Some government e-card PDFs (digitally signed, or built with
    // compressed cross-reference/object streams) trip up pdf-lib's default
    // load path even on already-decrypted bytes. Retry once, explicitly
    // maximally tolerant, before giving up - and keep the real error so the
    // caller can report exactly why (not just "it failed").
    try {
      srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false, updateMetadata: false });
    } catch {
      throw firstError;
    }
  }
  const outDoc = await PDFDocument.create();
  const widthPt = CARD_W_IN * 72;
  const heightPt = CARD_H_IN * 72;

  for (const face of ["front", "back"] as const) {
    const faceTemplate = template[face];
    const srcPage = srcDoc.getPage(faceTemplate.page - 1);
    const pageWidth = srcPage.getWidth();
    const pageHeight = srcPage.getHeight();
    const { x, y, width, height } = faceTemplate.rect;

    const left = (x / 100) * pageWidth;
    const right = left + (width / 100) * pageWidth;
    const top = pageHeight - (y / 100) * pageHeight;
    const bottom = pageHeight - ((y + height) / 100) * pageHeight;

    const embedded = await outDoc.embedPage(srcPage, { left, right, bottom, top });
    const outPage = outDoc.addPage([widthPt, heightPt]);
    outPage.drawPage(embedded, { x: 0, y: 0, width: widthPt, height: heightPt });
  }

  return outDoc.save();
}

// Second-choice export, used when buildVectorThermalPdf's pdf-lib parse of
// the *source* PDF fails (some digitally-signed/encrypted government PDFs
// use a structure pdf-lib can't walk). This path never re-parses the source
// file - it only builds a brand-new PDF via pdf.js's already-successful
// render + getTextContent() output, so it isn't affected by that failure.
// The rendered card image stays the background (so the Hindi labels, photo,
// QR, and hologram graphic look exactly as designed), but every English/
// ASCII text run (name, father's name, DOB, PAN number...) is masked out of
// that image and redrawn as real vector PDF text on top - the fields that
// matter most for scanning/verification become sharp, true text instead of
// part of a flattened photo.
async function buildHybridThermalPdf(pages: SourcePage[], template: CardTemplate, rawFront: string, rawBack: string): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const outDoc = await PDFDocument.create();
  const font = await outDoc.embedFont(StandardFonts.HelveticaBold);
  const widthPt = CARD_W_IN * 72;
  const heightPt = CARD_H_IN * 72;

  for (const face of ["front", "back"] as const) {
    const faceTemplate = template[face];
    const sourcePage = pages.find((page) => page.index === faceTemplate.page) || pages[0];
    const pageWidth = sourcePage.width;
    const pageHeight = sourcePage.height;
    const { x, y, width, height } = faceTemplate.rect;

    const left = (x / 100) * pageWidth;
    const right = left + (width / 100) * pageWidth;
    const top = pageHeight - (y / 100) * pageHeight;
    const bottom = pageHeight - ((y + height) / 100) * pageHeight;
    const cropWidthPt = Math.max(1, right - left);
    const cropHeightPt = Math.max(1, top - bottom);

    const matched = sourcePage.textItems.filter((item) => item.x >= left - 1 && item.x <= right + 1 && item.y >= bottom - 1 && item.y <= top + 1);

    const rawUrl = face === "front" ? rawFront : rawBack;
    const maskedUrl = await maskTextRegions(rawUrl, matched, left, top, cropWidthPt, cropHeightPt);
    const bgBytes = await (await fetch(maskedUrl)).arrayBuffer();
    const bgImage = await outDoc.embedPng(new Uint8Array(bgBytes));

    const outPage = outDoc.addPage([widthPt, heightPt]);
    outPage.drawImage(bgImage, { x: 0, y: 0, width: widthPt, height: heightPt });

    const scaleX = widthPt / cropWidthPt;
    const scaleY = heightPt / cropHeightPt;
    for (const item of matched) {
      const relX = item.x - left;
      const relY = item.y - bottom;
      const fontSize = Math.max(6, item.height * scaleY * 0.92);
      outPage.drawText(item.str, { x: relX * scaleX, y: relY * scaleY, size: fontSize, font, color: rgb(0.05, 0.05, 0.08) });
    }
  }

  return outDoc.save();
}

// Paints over each matched text item's bounding box with a color sampled
// from just above it in the same image, so the vector text redrawn on top
// doesn't sit on top of (and double up with) the original rendered pixels.
async function maskTextRegions(imageUrl: string, items: PdfTextItem[], cropLeftPt: number, cropTopPt: number, cropWidthPt: number, cropHeightPt: number): Promise<string> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not load crop image"));
    image.src = imageUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return imageUrl;
  context.drawImage(image, 0, 0);

  const pxPerPtX = canvas.width / cropWidthPt;
  const pxPerPtY = canvas.height / cropHeightPt;

  for (const item of items) {
    const relX = item.x - cropLeftPt;
    const relTop = cropTopPt - (item.y + item.height);
    const boxX = Math.max(0, relX * pxPerPtX - 2);
    const boxY = Math.max(0, relTop * pxPerPtY - 2);
    const boxW = Math.min(canvas.width - boxX, item.width * pxPerPtX + 4);
    const boxH = Math.min(canvas.height - boxY, item.height * pxPerPtY + 4);
    if (boxW <= 0 || boxH <= 0) continue;

    let fill = "#ffffff";
    try {
      const sampleY = Math.max(0, Math.round(boxY - 3));
      const sample = context.getImageData(Math.round(boxX + boxW / 2), sampleY, 1, 1).data;
      fill = `rgb(${sample[0]}, ${sample[1]}, ${sample[2]})`;
    } catch {
      // Canvas may be tainted or the sample point out of bounds - keep the white fallback.
    }
    context.fillStyle = fill;
    context.fillRect(boxX, boxY, boxW, boxH);
  }

  return canvas.toDataURL("image/png", 0.95);
}

// Fallback used only when Remove Background is on (that clean-up is a pixel
// filter, so the result can no longer be the original vector content) -
// embeds the already-rendered, background-cleaned preview images instead.
async function buildRasterThermalPdf(frontUrl: string, backUrl: string): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();
  const widthPt = CARD_W_IN * 72;
  const heightPt = CARD_H_IN * 72;
  for (const image of [frontUrl, backUrl]) {
    const bytes = await (await fetch(image)).arrayBuffer();
    const embedded = await pdfDoc.embedPng(new Uint8Array(bytes));
    const page = pdfDoc.addPage([widthPt, heightPt]);
    page.drawImage(embedded, { x: 0, y: 0, width: widthPt, height: heightPt });
  }
  return pdfDoc.save();
}

function isPasswordException(error: unknown) {
  return Boolean(error && typeof error === "object" && "name" in error && (error as { name?: string }).name === "PasswordException");
}

// Detects a solid near-white border around the actual card content (common
// when the typed/dragged crop rect runs a little past the card graphic into
// true blank page space) and returns the image with that border trimmed off,
// plus the trim expressed as 0-1 fractions of the original crop so the exact
// same tighter region can also be applied to the *original* PDF page for the
// vector export path (which works from PDF points, not these pixels).
async function trimWhitespace(dataUrl: string): Promise<{ url: string; bounds: { left: number; top: number; right: number; bottom: number } }> {
  const FULL = { left: 0, top: 0, right: 1, bottom: 1 };
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not load crop image"));
    image.src = dataUrl;
  });
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context || width < 4 || height < 4) return { url: dataUrl, bounds: FULL };
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, width, height);

  const isBlank = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    return data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238;
  };
  const rowBlank = (y: number) => {
    for (let x = 0; x < width; x += 3) if (!isBlank(x, y)) return false;
    return true;
  };
  const colBlank = (x: number) => {
    for (let y = 0; y < height; y += 3) if (!isBlank(x, y)) return false;
    return true;
  };

  let top = 0;
  while (top < height - 1 && rowBlank(top)) top++;
  let bottom = height - 1;
  while (bottom > top && rowBlank(bottom)) bottom--;
  let left = 0;
  while (left < width - 1 && colBlank(left)) left++;
  let right = width - 1;
  while (right > left && colBlank(right)) right--;

  // Defensive cap: never trim more than 30% off any single edge, so a
  // genuinely mostly-white card design can't be mistaken for margin.
  const maxTrimX = width * 0.3;
  const maxTrimY = height * 0.3;
  left = Math.min(left, maxTrimX);
  right = Math.max(right, width - 1 - maxTrimX);
  top = Math.min(top, maxTrimY);
  bottom = Math.max(bottom, height - 1 - maxTrimY);

  if (right - left < width * 0.5 || bottom - top < height * 0.5) {
    left = 0;
    top = 0;
    right = width - 1;
    bottom = height - 1;
  }

  // A row/column doesn't count as blank once it has anything non-white on
  // it, but a thin decorative cut-guide (a dashed line, a hairline rule)
  // right at the edge still leaves a sliver of dead space just inside it
  // that the scan above can't see as "blank". Zoom in a little further so
  // the card fully fills the frame instead of showing that sliver - this
  // step runs even when no blank margin was found at all.
  const overscan = 0.02;
  const trimmedWidth = right - left;
  const trimmedHeight = bottom - top;
  left = Math.round(left + trimmedWidth * overscan);
  right = Math.round(right - trimmedWidth * overscan);
  top = Math.round(top + trimmedHeight * overscan);
  bottom = Math.round(bottom - trimmedHeight * overscan);

  const trimWidth = right - left + 1;
  const trimHeight = bottom - top + 1;
  const trimCanvas = document.createElement("canvas");
  trimCanvas.width = trimWidth;
  trimCanvas.height = trimHeight;
  const trimContext = trimCanvas.getContext("2d");
  if (!trimContext) return { url: dataUrl, bounds: FULL };
  trimContext.drawImage(canvas, left, top, trimWidth, trimHeight, 0, 0, trimWidth, trimHeight);

  return {
    url: trimCanvas.toDataURL("image/png", 0.95),
    bounds: { left: left / width, top: top / height, right: (right + 1) / width, bottom: (bottom + 1) / height },
  };
}

function intersectRect(rect: CropRect, bounds: { left: number; top: number; right: number; bottom: number }): CropRect {
  return {
    x: rect.x + bounds.left * rect.width,
    y: rect.y + bounds.top * rect.height,
    width: rect.width * (bounds.right - bounds.left),
    height: rect.height * (bounds.bottom - bounds.top),
  };
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read cropped image."));
    reader.readAsDataURL(blob);
  });
}

// Simple Photoshop-style brightness/contrast adjustment (100% = untouched)
// applied to the whole card image, via the canvas's built-in CSS filter -
// lifts a dull/dark scan so the printed photo looks fresh.
async function applyBrightnessContrast(dataUrl: string, brightness: number, contrast: number): Promise<string> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
  context.drawImage(image, 0, 0);
  return canvas.toDataURL("image/png", 0.95);
}

// Converts to grayscale and pushes light/mid tones to pure white so a
// colored, textured government-card background disappears while dark ink,
// the photo, and the QR code stay visible - a document-scanner "clean B/W"
// look that's cheap to print on thermal/inkjet printers.
async function cleanBackground(dataUrl: string): Promise<string> {
  const image = new Image();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not load image"));
    image.src = dataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const boosted = gray > 200 ? 255 : Math.max(0, Math.min(255, (gray - 90) * 1.9));
    data[i] = boosted;
    data[i + 1] = boosted;
    data[i + 2] = boosted;
  }
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png", 0.95);
}

function buildA4PrintHtml(frontUrl: string, backUrl: string, copies: number) {
  const pairHtml = `<div class="pair"><div class="card"><img src="${frontUrl}" /></div><div class="card"><img src="${backUrl}" /></div></div>`;
  const rowsHtml = Array.from({ length: copies }).map(() => pairHtml).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PAN Card - A4 Sheet</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;}
.page{width:8.27in;min-height:11.69in;background:#fff;margin:20px auto;padding:0.4in;}
.pair{display:flex;gap:0.25in;margin-bottom:0.3in;}
.card{width:${CARD_W_IN}in;height:${CARD_H_IN}in;border:1px solid #999;overflow:hidden;}
.card img{width:100%;height:100%;object-fit:cover;}
@media print{
  body{background:#fff;}
  .page{margin:0;}
  @page{size:A4;margin:0;}
}
</style>
</head>
<body>
<div class="page">${rowsHtml}</div>
<script>
  window.onload = function () { window.focus(); window.print(); };
</script>
</body>
</html>`;
}

function build4x6PrintHtml(frontUrl: string, backUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PAN Card - 4x6 Photo Paper</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;}
.page{display:flex;width:4in;height:6in;flex-direction:column;align-items:center;justify-content:center;gap:0.2in;background:#fff;margin:20px auto;}
.card{width:${CARD_W_IN}in;height:${CARD_H_IN}in;border:1px solid #999;overflow:hidden;}
.card img{width:100%;height:100%;object-fit:cover;}
@media print{
  body{background:#fff;}
  .page{margin:0;}
  @page{size:4in 6in;margin:0;}
}
</style>
</head>
<body>
<div class="page"><div class="card"><img src="${frontUrl}" /></div><div class="card"><img src="${backUrl}" /></div></div>
<script>
  window.onload = function () { window.focus(); window.print(); };
</script>
</body>
</html>`;
}
