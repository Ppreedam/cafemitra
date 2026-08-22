"use client";

import type React from "react";
import { useState } from "react";
import { Contrast, Crop, Minus, Palette, Plus, Printer, RotateCcw, Upload, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { WalletLimitBanner } from "../WalletLimitBanner";
import { CropEditor, cropImage, DEFAULT_CROP_RECT, type CropRect } from "../CropEditor";

type Side = "front" | "back";
type ColorMode = "color" | "bw";

type SideState = {
  file: File | null;
  url: string;
  cropRect: CropRect;
};

const EMPTY_SIDE: SideState = { file: null, url: "", cropRect: DEFAULT_CROP_RECT };
const MAX_ROWS = 6;

export default function IdCardPrintPage() {
  const [front, setFront] = useState<SideState>(EMPTY_SIDE);
  const [back, setBack] = useState<SideState>(EMPTY_SIDE);
  const [cropSide, setCropSide] = useState<Side | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>("color");
  const [rows, setRows] = useState(4);

  const sideState = (side: Side) => (side === "front" ? front : back);
  const setSideState = (side: Side, next: SideState) => (side === "front" ? setFront(next) : setBack(next));

  function handleFileChange(side: Side, selected?: File | null) {
    if (!selected) return;
    const current = sideState(side);
    if (current.url) URL.revokeObjectURL(current.url);
    setSideState(side, { file: selected, url: URL.createObjectURL(selected), cropRect: DEFAULT_CROP_RECT });
  }

  function handleDrop(side: Side, event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileChange(side, dropped);
  }

  function clearSide(side: Side) {
    const current = sideState(side);
    if (current.url) URL.revokeObjectURL(current.url);
    setSideState(side, EMPTY_SIDE);
  }

  function updateCropRect(side: Side, rect: CropRect) {
    setSideState(side, { ...sideState(side), cropRect: rect });
  }

  async function applyCrop() {
    if (!cropSide) return;
    const current = sideState(cropSide);
    if (!current.url) return;
    try {
      const croppedBlob = await cropImage(current.url, current.cropRect);
      const croppedFile = new File([croppedBlob], (current.file?.name || "photo").replace(/(\.[^.]+)?$/, "-cropped.png"), { type: "image/png" });
      URL.revokeObjectURL(current.url);
      setSideState(cropSide, { file: croppedFile, url: URL.createObjectURL(croppedFile), cropRect: DEFAULT_CROP_RECT });
      setCropSide(null);
    } catch {
      // Crop dialog stays open so the user can retry.
    }
  }

  function printSheet() {
    if (!front.url || !back.url) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(buildCardPrintSheetHtml(front.url, back.url, rows, colorMode));
    printWindow.document.close();
  }

  const bothUploaded = Boolean(front.url && back.url);
  const activeCropState = cropSide ? sideState(cropSide) : null;

  return (
    <DashboardShell activePath="/id-card-print">
      <div className="dashboard idcard-page">
        <WalletLimitBanner />
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">PrintPilot ID Card Print</span>
            <h1>ID Card Print (Photo Upload)</h1>
            <p>Upload the front and back photo of the ID card from your phone. We crop, resize, and arrange them on one A4 sheet for printing.</p>
          </div>
          <div className="auto-print-hero-actions">
            <span className="status-pill warning">Wireframe preview</span>
          </div>
        </div>

        <section className="passport-maker-grid">
          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 1</span>
              <h2>Upload Front &amp; Back</h2>
            </div>

            <div className="idcard-photo-pair">
              {(["front", "back"] as Side[]).map((side) => {
                const state = sideState(side);
                return (
                  <div key={side} className="idcard-side-slot">
                    <span className="idcard-side-label">{side === "front" ? "Front" : "Back"}</span>
                    {state.url ? (
                      <div className="customer-document-preview">
                        <div className="document-thumb">
                          <img src={state.url} alt="" />
                        </div>
                        <div>
                          <strong>{state.file?.name}</strong>
                          <div className="document-actions">
                            <button type="button" onClick={() => setCropSide(side)}>
                              <Crop size={16} /> Crop
                            </button>
                            <button type="button" onClick={() => clearSide(side)}>
                              <X size={16} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="customer-upload idcard-side-upload" onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(side, event)}>
                        <Upload size={22} />
                        <strong>Upload {side === "front" ? "Front" : "Back"} Photo</strong>
                        <span>Drag &amp; drop or choose a JPG/PNG file.</span>
                        <em>Tap to choose a file</em>
                        <input accept=".jpg,.jpeg,.png" type="file" onChange={(event) => handleFileChange(side, event.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </article>

          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 2</span>
              <h2>Arrange &amp; Print</h2>
            </div>

            {bothUploaded ? (
              <>
                <div className={`idcard-sheet-preview${colorMode === "bw" ? " bw" : ""}`}>
                  <div className="idcard-sheet-page">
                    {Array.from({ length: rows }).map((_, index) => (
                      <div className="idcard-sheet-row" key={index}>
                        <div className="idcard-sheet-card">
                          <img src={front.url} alt="" />
                        </div>
                        <div className="idcard-sheet-card">
                          <img src={back.url} alt="" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="idcard-print-controls">
                  <div className="idcard-copies-group">
                    <span>Copies on this A4 sheet</span>
                    <div className="idcard-stepper">
                      <button type="button" onClick={() => setRows((value) => Math.max(1, value - 1))} aria-label="Fewer copies">
                        <Minus size={14} />
                      </button>
                      <strong>{rows}</strong>
                      <button type="button" onClick={() => setRows((value) => Math.min(MAX_ROWS, value + 1))} aria-label="More copies">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="idcard-toggle-group">
                    <button type="button" className={colorMode === "color" ? "active" : ""} onClick={() => setColorMode("color")}>
                      <Palette size={16} /> Color
                    </button>
                    <button type="button" className={colorMode === "bw" ? "active" : ""} onClick={() => setColorMode("bw")}>
                      <Contrast size={16} /> B/W
                    </button>
                  </div>
                  <button className="passport-preview-button" type="button" onClick={printSheet}>
                    <Printer size={18} /> Print A4 Sheet
                  </button>
                </div>
              </>
            ) : (
              <p className="customer-inline-help">Upload both the front and back photo to see the print-ready A4 sheet here.</p>
            )}
          </article>
        </section>
      </div>

      {cropSide && activeCropState?.url ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Crop photo">
          <div className="crop-window">
            <div className="document-preview-head">
              <div>
                <strong>Crop {cropSide === "front" ? "Front" : "Back"} Photo</strong>
                <span>{activeCropState.file?.name}</span>
              </div>
              <button type="button" onClick={() => setCropSide(null)} aria-label="Close crop">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body">
              <CropEditor fileUrl={activeCropState.url} rect={activeCropState.cropRect} onRectChange={(rect) => updateCropRect(cropSide, rect)} />
              <div className="crop-controls">
                <p>Drag a corner or edge to resize the crop area. Drag inside the box to move it.</p>
                <button type="button" onClick={() => updateCropRect(cropSide, DEFAULT_CROP_RECT)}>
                  <RotateCcw size={16} /> Reset Crop
                </button>
                <button type="button" onClick={applyCrop}>
                  <Crop size={17} /> Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}

function buildCardPrintSheetHtml(frontUrl: string, backUrl: string, rows: number, colorMode: ColorMode) {
  const rowsHtml = Array.from({ length: rows })
    .map(() => `<div class="pair"><div class="card"><img src="${frontUrl}" /></div><div class="card"><img src="${backUrl}" /></div></div>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ID Card Print Sheet</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:#f2f2f2;font-family:Arial, Helvetica, sans-serif;${colorMode === "bw" ? "filter:grayscale(1);" : ""}}
.page{width:210mm;min-height:297mm;background:#fff;margin:20px auto;padding:10mm;}
.pair{display:flex;gap:6mm;margin-bottom:6mm;}
.card{width:85.6mm;height:53.98mm;border:1px solid #999;border-radius:3mm;overflow:hidden;background:#fff;}
.card img{width:100%;height:100%;object-fit:cover;}
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
