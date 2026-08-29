"use client";

import { useState } from "react";
import type React from "react";
import { Contrast, Crop, Palette, Plus, RotateCcw, RotateCw, SlidersHorizontal, Trash2, Upload, X } from "lucide-react";
import { CropEditor, cropImage, loadImage, DEFAULT_CROP_RECT, type CropRect } from "../../CropEditor";

type Side = "front" | "back";
type ColorMode = "color" | "bw";
type SideState = { file: File | null; url: string; cropRect: CropRect };
type CardEntry = { id: string; front: SideState; back: SideState };
type SlotRef = { cardId: string; side: Side };
type FilterValues = { brightness: number; contrast: number; saturation: number };

const EMPTY_SIDE: SideState = { file: null, url: "", cropRect: DEFAULT_CROP_RECT };
const CARD_ASPECT_RATIO = "85.6/53.98";
const DEFAULT_FILTER: FilterValues = { brightness: 100, contrast: 100, saturation: 100 };
const CARDS_PER_PAGE = 4;

function newCard(): CardEntry {
  return { id: crypto.randomUUID(), front: EMPTY_SIDE, back: EMPTY_SIDE };
}

function sameSlot(a: SlotRef | null, b: SlotRef) {
  return !!a && a.cardId === b.cardId && a.side === b.side;
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

async function rotateImage90(url: string): Promise<Blob> {
  const image = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalHeight;
  canvas.height = image.naturalWidth;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(Math.PI / 2);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Rotation failed"))), "image/png", 0.95));
}

async function applyFilterAdjustments(url: string, values: FilterValues): Promise<Blob> {
  const image = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.filter = `brightness(${values.brightness}%) contrast(${values.contrast}%) saturate(${values.saturation}%)`;
  context.drawImage(image, 0, 0);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Filter apply failed"))), "image/png", 0.95));
}

// Renders one card side into an exact 85.6x53.98mm-ratio cell at 150 DPI
// (matching the b2b dashboard tool's print scale), center-cropping to fill
// the box, and baking in grayscale for B&W orders - there is no live print
// window here to apply a CSS filter at print time like b2b does.
async function renderCardCell(url: string, colorMode: ColorMode, cellWidthPx: number, cellHeightPx: number): Promise<Uint8Array> {
  const image = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = cellWidthPx;
  canvas.height = cellHeightPx;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  if (colorMode === "bw") context.filter = "grayscale(1)";
  drawCover(context, image, 0, 0, cellWidthPx, cellHeightPx);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((result) => (result ? resolve(result) : reject(new Error("Could not prepare a card image."))), "image/png", 0.92),
  );
  return new Uint8Array(await blob.arrayBuffer());
}

// Composes every card onto a multi-page A4 PDF (up to 4 front/back pairs per
// page, same 10mm margin / 6mm gap as the b2b print sheet) since PrintOrder
// only supports one uploaded document per order. `pages` on the resulting
// order is set to the card count (not the PDF's physical page count) so
// pricing scales per card - see IdCardPrintUpload's onComposed contract.
async function composeIdCardsToPdf(cards: CardEntry[], colorMode: ColorMode): Promise<{ file: File; cardCount: number }> {
  const printable = cards.filter((card) => card.front.url);
  if (!printable.length) throw new Error("No cards to print");

  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();

  const mmPt = (mm: number) => mm * 2.834645669;
  const dpi = 150;
  const mmPx = (mm: number) => Math.round((mm / 25.4) * dpi);

  const pageWidthPt = mmPt(210);
  const pageHeightPt = mmPt(297);
  const cardWidthPt = mmPt(85.6);
  const cardHeightPt = mmPt(53.98);
  const marginPt = mmPt(10);
  const gapPt = mmPt(6);

  const cardWidthPx = mmPx(85.6);
  const cardHeightPx = mmPx(53.98);

  for (let start = 0; start < printable.length; start += CARDS_PER_PAGE) {
    const pageCards = printable.slice(start, start + CARDS_PER_PAGE);
    const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);

    for (let row = 0; row < pageCards.length; row++) {
      const card = pageCards[row];
      const yTopPt = marginPt + row * (cardHeightPt + gapPt);
      const yFromBottomPt = pageHeightPt - yTopPt - cardHeightPt;

      const frontBytes = await renderCardCell(card.front.url, colorMode, cardWidthPx, cardHeightPx);
      const frontImage = await pdfDoc.embedPng(frontBytes);
      page.drawImage(frontImage, { x: marginPt, y: yFromBottomPt, width: cardWidthPt, height: cardHeightPt });

      if (card.back.url) {
        const backBytes = await renderCardCell(card.back.url, colorMode, cardWidthPx, cardHeightPx);
        const backImage = await pdfDoc.embedPng(backBytes);
        page.drawImage(backImage, { x: marginPt + cardWidthPt + gapPt, y: yFromBottomPt, width: cardWidthPt, height: cardHeightPt });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return { file: new File([pdfBytes], "id-card-print.pdf", { type: "application/pdf" }), cardCount: printable.length };
}

export default function IdCardPrintUpload({ onComposed, busy }: { onComposed: (file: File, cardCount: number) => void; busy?: boolean }) {
  const [cards, setCards] = useState<CardEntry[]>(() => [newCard()]);
  const [active, setActive] = useState<SlotRef | null>(null);
  const [cropTarget, setCropTarget] = useState<SlotRef | null>(null);
  const [filterTarget, setFilterTarget] = useState<SlotRef | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>(DEFAULT_FILTER);
  const [colorMode, setColorMode] = useState<ColorMode>("color");
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState("");

  function getSide(cardId: string, side: Side): SideState {
    return cards.find((card) => card.id === cardId)?.[side] || EMPTY_SIDE;
  }

  function setSide(cardId: string, side: Side, next: SideState) {
    setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, [side]: next } : card)));
  }

  function handleFileChange(cardId: string, side: Side, selected?: File | null) {
    if (!selected) return;
    const current = getSide(cardId, side);
    if (current.url) URL.revokeObjectURL(current.url);
    setSide(cardId, side, { file: selected, url: URL.createObjectURL(selected), cropRect: DEFAULT_CROP_RECT });
    setError("");
  }

  function handleDrop(cardId: string, side: Side, event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileChange(cardId, side, dropped);
  }

  function clearSide(cardId: string, side: Side) {
    const current = getSide(cardId, side);
    if (current.url) URL.revokeObjectURL(current.url);
    setSide(cardId, side, EMPTY_SIDE);
    setActive((currentActive) => (sameSlot(currentActive, { cardId, side }) ? null : currentActive));
  }

  async function rotateSide(cardId: string, side: Side) {
    const current = getSide(cardId, side);
    if (!current.url || !current.file) return;
    try {
      const rotatedBlob = await rotateImage90(current.url);
      const rotatedFile = new File([rotatedBlob], current.file.name.replace(/\.[^.]+$/, ".png"), { type: "image/png" });
      URL.revokeObjectURL(current.url);
      setSide(cardId, side, { file: rotatedFile, url: URL.createObjectURL(rotatedFile), cropRect: DEFAULT_CROP_RECT });
    } catch {
      // Leave the photo as-is if rotation fails.
    }
  }

  function updateCropRect(cardId: string, side: Side, rect: CropRect) {
    setSide(cardId, side, { ...getSide(cardId, side), cropRect: rect });
  }

  async function applyCrop() {
    if (!cropTarget) return;
    const current = getSide(cropTarget.cardId, cropTarget.side);
    if (!current.url) return;
    try {
      const croppedBlob = await cropImage(current.url, current.cropRect);
      const croppedFile = new File([croppedBlob], (current.file?.name || "photo").replace(/(\.[^.]+)?$/, "-cropped.png"), { type: "image/png" });
      URL.revokeObjectURL(current.url);
      setSide(cropTarget.cardId, cropTarget.side, { file: croppedFile, url: URL.createObjectURL(croppedFile), cropRect: DEFAULT_CROP_RECT });
      setCropTarget(null);
    } catch {
      // Crop dialog stays open so the customer can retry.
    }
  }

  function openFilter(target: SlotRef) {
    setFilterValues(DEFAULT_FILTER);
    setFilterTarget(target);
  }

  async function applyFilter() {
    if (!filterTarget) return;
    const current = getSide(filterTarget.cardId, filterTarget.side);
    if (!current.url) return;
    try {
      const adjustedBlob = await applyFilterAdjustments(current.url, filterValues);
      const adjustedFile = new File([adjustedBlob], (current.file?.name || "photo").replace(/(\.[^.]+)?$/, "-adjusted.png"), { type: "image/png" });
      URL.revokeObjectURL(current.url);
      setSide(filterTarget.cardId, filterTarget.side, { file: adjustedFile, url: URL.createObjectURL(adjustedFile), cropRect: current.cropRect });
      setFilterTarget(null);
    } catch {
      // Panel stays open so the customer can retry.
    }
  }

  function addCard() {
    setCards((prev) => [...prev, newCard()]);
  }

  function removeCard(cardId: string) {
    setCards((prev) => {
      const card = prev.find((entry) => entry.id === cardId);
      if (card?.front.url) URL.revokeObjectURL(card.front.url);
      if (card?.back.url) URL.revokeObjectURL(card.back.url);
      const next = prev.filter((entry) => entry.id !== cardId);
      return next.length ? next : [newCard()];
    });
    setActive((current) => (current?.cardId === cardId ? null : current));
  }

  async function composeAndContinue() {
    if (!readyCount || composing || busy) return;
    setComposing(true);
    setError("");
    try {
      const { file, cardCount } = await composeIdCardsToPdf(cards, colorMode);
      onComposed(file, cardCount);
    } catch {
      setError("Could not prepare your ID cards for upload. Please try again.");
    } finally {
      setComposing(false);
    }
  }

  const readyCount = cards.filter((card) => card.front.url).length;
  const activeState = active ? getSide(active.cardId, active.side) : null;
  const cropState = cropTarget ? getSide(cropTarget.cardId, cropTarget.side) : null;
  const filterState = filterTarget ? getSide(filterTarget.cardId, filterTarget.side) : null;

  return (
    <>
      <div className="idcard-toolbar-bar">
        <div className="idcard-toolbar">
          <button type="button" disabled={!active} onClick={() => active && openFilter(active)}>
            <SlidersHorizontal size={17} />
            <span>Filter &amp; Light</span>
          </button>
          <button type="button" disabled={!active} onClick={() => active && setCropTarget(active)}>
            <Crop size={17} />
            <span>Crop</span>
          </button>
          <button type="button" disabled={!active} onClick={() => active && void rotateSide(active.cardId, active.side)}>
            <RotateCw size={17} />
            <span>Rotate</span>
          </button>
          <button type="button" disabled={!active} onClick={() => active && clearSide(active.cardId, active.side)}>
            <X size={17} />
            <span>Remove</span>
          </button>
        </div>
        <div className="idcard-toolbar-actions">
          <div className="idcard-toggle-group">
            <button type="button" className={colorMode === "color" ? "active" : ""} onClick={() => setColorMode("color")}>
              <Palette size={14} /> Color
            </button>
            <button type="button" className={colorMode === "bw" ? "active" : ""} onClick={() => setColorMode("bw")}>
              <Contrast size={14} /> B/W
            </button>
          </div>
          <div className="idcard-toolbar-divider" />
          <button className="idcard-print-cta" type="button" disabled={!readyCount || composing || busy} onClick={composeAndContinue}>
            {composing ? "Preparing…" : "Continue"}
          </button>
        </div>
      </div>

      <div className="idcard-card-rows">
        {cards.map((card, index) => (
          <div key={card.id} className="idcard-card-row">
            <div className="idcard-card-row-head">
              <span>ID Card {index + 1}</span>
              {cards.length > 1 ? (
                <button type="button" className="idcard-card-row-remove" onClick={() => removeCard(card.id)}>
                  <Trash2 size={13} /> Remove card
                </button>
              ) : null}
            </div>
            <div className="idcard-photo-pair">
              {(["front", "back"] as Side[]).map((side) => {
                const state = side === "front" ? card.front : card.back;
                const isActive = sameSlot(active, { cardId: card.id, side });
                return (
                  <div key={side} className="idcard-side-slot">
                    <span className="idcard-side-label">
                      {side === "front" ? "Front" : "Back"}
                      {side === "back" ? <em> (optional)</em> : null}
                    </span>
                    {state.url ? (
                      <div
                        className={`idcard-card-slot filled${isActive ? " active" : ""}`}
                        onClick={() => setActive((current) => (sameSlot(current, { cardId: card.id, side }) ? null : { cardId: card.id, side }))}
                      >
                        <img src={state.url} alt={`${side === "front" ? "Front" : "Back"} of ID card ${index + 1}`} />
                      </div>
                    ) : (
                      <label className="idcard-card-slot empty" onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(card.id, side, event)}>
                        <Upload size={22} />
                        <strong>Upload {side === "front" ? "Front" : "Back"} Photo</strong>
                        <span>{side === "back" ? "Skip this if your card has nothing worth printing on the back." : "Drag & drop or choose a JPG/PNG file."}</span>
                        <input accept=".jpg,.jpeg,.png" type="file" onChange={(event) => handleFileChange(card.id, side, event.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="idcard-add-card" onClick={addCard}>
        <Plus size={16} /> Add Another ID Card
      </button>

      {error ? <p className="customer-inline-help" style={{ color: "#c7354d" }}>{error}</p> : null}

      <p className="customer-inline-help">
        {readyCount ? "Click a card to select it, then use Filter & Light / Crop / Rotate / Remove above. Back is optional - upload only a front for cards like PAN." : "Each card slot above is the upload target itself - upload a front photo to continue."}
      </p>

      {cropTarget && cropState?.url ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Crop photo">
          <div className="crop-window">
            <div className="document-preview-head">
              <div>
                <strong>Crop {cropTarget.side === "front" ? "Front" : "Back"} Photo</strong>
                <span>{cropState.file?.name}</span>
              </div>
              <button type="button" onClick={() => setCropTarget(null)} aria-label="Close crop">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body">
              <CropEditor
                fileUrl={cropState.url}
                rect={cropState.cropRect}
                onRectChange={(rect) => updateCropRect(cropTarget.cardId, cropTarget.side, rect)}
                aspectRatio={CARD_ASPECT_RATIO}
              />
              <div className="crop-controls">
                <p>Drag a corner or edge to resize the crop area. Drag inside the box to move it.</p>
                <button type="button" onClick={() => updateCropRect(cropTarget.cardId, cropTarget.side, DEFAULT_CROP_RECT)}>
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

      {filterTarget && filterState?.url ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Filter and light">
          <div className="crop-window">
            <div className="document-preview-head">
              <div>
                <strong>Filter &amp; Light - {filterTarget.side === "front" ? "Front" : "Back"} Photo</strong>
                <span>{filterState.file?.name}</span>
              </div>
              <button type="button" onClick={() => setFilterTarget(null)} aria-label="Close filter panel">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body">
              <div className="idcard-filter-preview">
                <img
                  src={filterState.url}
                  alt="Preview with adjustments"
                  style={{ filter: `brightness(${filterValues.brightness}%) contrast(${filterValues.contrast}%) saturate(${filterValues.saturation}%)` }}
                />
              </div>
              <div className="idcard-filter-controls">
                <label>
                  <span>Brightness <b>{filterValues.brightness}%</b></span>
                  <input type="range" min={0} max={200} value={filterValues.brightness} onChange={(event) => setFilterValues((prev) => ({ ...prev, brightness: Number(event.target.value) }))} />
                </label>
                <label>
                  <span>Contrast <b>{filterValues.contrast}%</b></span>
                  <input type="range" min={0} max={200} value={filterValues.contrast} onChange={(event) => setFilterValues((prev) => ({ ...prev, contrast: Number(event.target.value) }))} />
                </label>
                <label>
                  <span>Saturation <b>{filterValues.saturation}%</b></span>
                  <input type="range" min={0} max={200} value={filterValues.saturation} onChange={(event) => setFilterValues((prev) => ({ ...prev, saturation: Number(event.target.value) }))} />
                </label>
                <button type="button" onClick={() => setFilterValues(DEFAULT_FILTER)}>
                  <RotateCcw size={16} /> Reset
                </button>
                <button type="button" onClick={applyFilter}>
                  <SlidersHorizontal size={17} /> Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
