"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { CircleAlert, CircleCheck, Contrast, Crop, LoaderCircle, Palette, Plus, Printer, RotateCcw, RotateCw, SlidersHorizontal, Trash2, Undo2, Upload, Wand2, X } from "lucide-react";
import { CropEditor, cropImage, loadImage, DEFAULT_CROP_QUAD, DEFAULT_CROP_RECT, PerspectiveCropEditor, warpPerspectiveCrop, type CropQuad, type CropRect } from "../../CropEditor";
import { onScannerEngineLoading, scanCard } from "../../id-card-print/cardScan";
import { ACCEPT_TOLERANCE_PCT, quadDistance, reportCrop, reportFilter, type CropOutcome, type CropSampleRef, type CropTrack } from "../../id-card-print/cropTraining";
import { bakeTone, isNeutralTone, TonedImage, type Tone } from "../../id-card-print/ToneControl";
import { apiUrl } from "@/lib/api";
import SheetOptionsControl from "../../id-card-print/SheetOptionsControl";
import { CARD_H_MM, CARD_W_MM, PAPER_CHOICES, planSheet, type SheetEntry, type SheetOptions, type SheetLayout } from "../../id-card-print/sheetLayout";

type Side = "front" | "back";
type ColorMode = "color" | "bw";
type ScanStatus = "idle" | "scanning" | "done" | "notfound" | "error";
// original = the photo as uploaded, kept so the card can be found again
// (Auto Fix) or its corners re-placed on it (Perspective crop).
type SideState = { file: File | null; url: string; cropRect: CropRect; cropQuad: CropQuad; original?: { file: File; url: string }; scan?: ScanStatus; tone?: Tone; filterBase?: { file: File; url: string }; filter?: FilterValues };
type CardEntry = { id: string; front: SideState; back: SideState };
type SlotRef = { cardId: string; side: Side };
type FilterValues = { brightness: number; contrast: number; saturation: number };

const EMPTY_SIDE: SideState = { file: null, url: "", cropRect: DEFAULT_CROP_RECT, cropQuad: DEFAULT_CROP_QUAD };
const CARD_ASPECT_RATIO = "85.6/53.98";
const CARD_ASPECT_RATIO_NUMBER = 85.6 / 53.98;
const DEFAULT_FILTER: FilterValues = { brightness: 100, contrast: 100, saturation: 100 };
// The customer's sheet is always A4.
const A4 = PAPER_CHOICES[0];

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

// Composes every card onto a multi-page A4 PDF using the same layout as the preview (Left / Right or
// Top / Bottom, centred) since PrintOrder only supports one uploaded document per order. `pages` on
// the resulting order is priced per PDF page (pages x copies x the shop's Color / B&W rate), so
// `pageCount` is what the order's `pages` is set to - see IdCardPrintUpload's onComposed contract.
async function composeIdCardsToPdf(entries: SheetEntry[], colorMode: ColorMode, layout: SheetLayout, separatePages: boolean, options: SheetOptions): Promise<{ file: File; pageCount: number }> {
  if (!entries.length) throw new Error("No cards to print");

  const { PDFDocument } = await import("pdf-lib");
  const pdfDoc = await PDFDocument.create();

  const mmPt = (mm: number) => mm * 2.834645669;
  const dpi = 150;
  const mmPx = (mm: number) => Math.round((mm / 25.4) * dpi);
  const plan = planSheet(entries, A4, layout, {}, separatePages, options);
  const cardWidthPx = mmPx(CARD_W_MM);
  const cardHeightPx = mmPx(CARD_H_MM);

  for (const placed of plan.pages) {
    const page = pdfDoc.addPage([mmPt(A4.widthMm), mmPt(A4.heightMm)]);
    for (const card of placed) {
      const bytes = await renderCardCell(card.url, colorMode, cardWidthPx, cardHeightPx);
      const image = await pdfDoc.embedPng(bytes);
      page.drawImage(image, { x: mmPt(card.xMm), y: mmPt(A4.heightMm - card.yMm - CARD_H_MM), width: mmPt(CARD_W_MM), height: mmPt(CARD_H_MM) });
    }
  }

  const pdfBytes = await pdfDoc.save();
  return { file: new File([pdfBytes], "id-card-print.pdf", { type: "application/pdf" }), pageCount: plan.pages.length };
}

export default function IdCardPrintUpload({
  onComposed,
  busy,
  prices,
  colorMode: controlledMode,
  onColorModeChange,
  hasFile,
}: {
  onComposed: (file: File, pageCount: number, colorMode: ColorMode) => void;
  busy?: boolean;
  /** Shop's per-card price for each mode, shown on the Color / B/W toggle. */
  prices?: { color?: number; bw?: number };
  /** Color / B&W can be driven from the order's Print Options; the toolbar toggle then stays in sync with it. */
  colorMode?: ColorMode;
  onColorModeChange?: (mode: ColorMode) => void;
  /** A PDF has already been handed over - changing Color / B&W then builds it again. */
  hasFile?: boolean;
}) {
  const [cards, setCards] = useState<CardEntry[]>(() => [newCard()]);
  const [active, setActive] = useState<SlotRef | null>(null);
  const [cropTarget, setCropTarget] = useState<SlotRef | null>(null);
  const [cropMode, setCropMode] = useState<"straight" | "perspective">("perspective");
  const [filterTarget, setFilterTarget] = useState<SlotRef | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>(DEFAULT_FILTER);
  const [applyFilterToBothSides, setApplyFilterToBothSides] = useState(false);
  const [ownColorMode, setOwnColorMode] = useState<ColorMode>("color");
  const colorMode = controlledMode ?? ownColorMode;
  function setColorMode(mode: ColorMode) {
    setOwnColorMode(mode);
    onColorModeChange?.(mode);
  }
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState("");
  const [engineLoading, setEngineLoading] = useState(false);
  const [sheetLayout, setSheetLayout] = useState<SheetLayout>("side");
  const [separatePages, setSeparatePages] = useState(false);
  const [sheetOptions, setSheetOptions] = useState<SheetOptions>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [previewEntries, setPreviewEntries] = useState<SheetEntry[]>([]);
  // A fresh upload whose detected crop is waiting for the customer to confirm it in the crop window.
  const [reviewKey, setReviewKey] = useState("");
  const cropTrackRef = useRef<Record<string, CropTrack>>({});
  // The training sample of each card side, so the customer's Filter & Light choice can be attached to it.
  const sampleRef = useRef<Record<string, CropSampleRef>>({});
  const [keepsPhotos, setKeepsPhotos] = useState(false);

  useEffect(() => {
    onScannerEngineLoading(() => setEngineLoading(true));
    return () => onScannerEngineLoading(null);
  }, []);

  useEffect(() => {
    fetch(apiUrl("/api/crop-training/config/"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setKeepsPhotos(Boolean(data?.collectImages)))
      .catch(() => {});
  }, []);

  function getSide(cardId: string, side: Side): SideState {
    return cards.find((card) => card.id === cardId)?.[side] || EMPTY_SIDE;
  }

  function setSide(cardId: string, side: Side, next: SideState) {
    setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, [side]: next } : card)));
  }

  function releaseSide(state: SideState) {
    if (state.url) URL.revokeObjectURL(state.url);
    if (state.original && state.original.url !== state.url) URL.revokeObjectURL(state.original.url);
    if (state.filterBase && state.filterBase.url !== state.url) URL.revokeObjectURL(state.filterBase.url);
  }

  // Updates one side only if it still shows the same uploaded photo - a scan
  // that finishes after the photo was replaced or removed is dropped.
  function updateIfSame(cardId: string, side: Side, originalUrl: string, update: (state: SideState) => SideState) {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId || card[side].original?.url !== originalUrl) return card;
        return { ...card, [side]: update(card[side]) };
      }),
    );
  }

  // Same as the dashboard ID Card Print: finds the card in the photo,
  // straightens it to card size and cleans it. quad = null detects the
  // corners; a quad uses the corners the customer placed.
  async function runScan(cardId: string, side: Side, original: { file: File; url: string }, quad: CropQuad | null, review = false, track?: CropTrack) {
    updateIfSame(cardId, side, original.url, (state) => ({ ...state, scan: "scanning" }));
    try {
      const result = await scanCard(original.file, "clean", quad);
      setEngineLoading(false);
      if (!result.found) {
        updateIfSame(cardId, side, original.url, (state) => ({ ...state, scan: "notfound" }));
        // No card found on a fresh upload: let the customer place the corners by hand right away.
        if (review) {
          cropTrackRef.current[`${cardId}:${side}`] = { autoQuad: null, undetected: true };
          setCropTarget({ cardId, side });
        }
        return;
      }
      if (review) {
        // Show the detected corners first; the card is only cut out once the customer confirms them.
        updateIfSame(cardId, side, original.url, (state) => ({ ...state, cropQuad: result.quad, scan: "idle" }));
        setCropMode("perspective");
        cropTrackRef.current[`${cardId}:${side}`] = { autoQuad: result.quad, undetected: false };
        setReviewKey(`${cardId}:${side}`);
        setCropTarget({ cardId, side });
        return;
      }
      const file = new File([result.blob], original.file.name.replace(/(\.[^.]+)?$/, "-card.jpg"), { type: "image/jpeg" });
      updateIfSame(cardId, side, original.url, (state) => {
        if (state.url && state.url !== original.url) URL.revokeObjectURL(state.url);
        if (state.filterBase && state.filterBase.url !== state.url && state.filterBase.url !== original.url) URL.revokeObjectURL(state.filterBase.url);
        return { ...state, file, url: URL.createObjectURL(file), cropQuad: result.quad, cropRect: DEFAULT_CROP_RECT, scan: "done", tone: state.tone, filterBase: undefined, filter: undefined };
      });
      if (track) {
        const outcome: CropOutcome = track.undetected ? "manual" : track.autoQuad && quadDistance(track.autoQuad, result.quad) <= ACCEPT_TOLERANCE_PCT ? "accepted" : "adjusted";
        void reportCrop(outcome, side, track.autoQuad, result.quad, { original: original.file, result: result.blob }).then((sample) => {
          if (sample) sampleRef.current[`${cardId}:${side}`] = sample;
        });
        // A freshly cropped card goes straight to Filter & Light so brightness / contrast / saturation can be set.
        openFilter({ cardId, side });
      }
    } catch (reason) {
      console.error(reason);
      setEngineLoading(false);
      updateIfSame(cardId, side, original.url, (state) => ({ ...state, scan: "error" }));
    }
  }

  function handleFileChange(cardId: string, side: Side, selected?: File | null) {
    if (!selected) return;
    releaseSide(getSide(cardId, side));
    const url = URL.createObjectURL(selected);
    const original = { file: selected, url };
    setSide(cardId, side, { file: selected, url, cropRect: DEFAULT_CROP_RECT, cropQuad: DEFAULT_CROP_QUAD, original, scan: "scanning" });
    setError("");
    void runScan(cardId, side, original, null, true);
  }

  function autoFix(target: SlotRef) {
    const current = getSide(target.cardId, target.side);
    const original = current.original || (current.file ? { file: current.file, url: current.url } : null);
    if (!original) return;
    if (!current.original) setSide(target.cardId, target.side, { ...current, original });
    void runScan(target.cardId, target.side, original, null);
  }

  function handleDrop(cardId: string, side: Side, event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileChange(cardId, side, dropped);
  }

  function clearSide(cardId: string, side: Side) {
    releaseSide(getSide(cardId, side));
    setSide(cardId, side, EMPTY_SIDE);
    setActive((currentActive) => (sameSlot(currentActive, { cardId, side }) ? null : currentActive));
  }

  async function rotateSide(cardId: string, side: Side) {
    const current = getSide(cardId, side);
    if (!current.url || !current.file) return;
    try {
      const rotatedBlob = await rotateImage90(current.url);
      const rotatedFile = new File([rotatedBlob], current.file.name.replace(/\.[^.]+$/, ".png"), { type: "image/png" });
      releaseSide(current);
      const url = URL.createObjectURL(rotatedFile);
      setSide(cardId, side, { file: rotatedFile, url, cropRect: DEFAULT_CROP_RECT, cropQuad: DEFAULT_CROP_QUAD, original: { file: rotatedFile, url }, scan: "idle", tone: current.tone });
    } catch {
      // Leave the photo as-is if rotation fails.
    }
  }

  function updateCropRect(cardId: string, side: Side, rect: CropRect) {
    setSide(cardId, side, { ...getSide(cardId, side), cropRect: rect });
  }

  function updateCropQuad(cardId: string, side: Side, quad: CropQuad) {
    setSide(cardId, side, { ...getSide(cardId, side), cropQuad: quad });
  }

  // Closing the crop window on a fresh upload keeps the detected crop; otherwise it just closes.
  function closeCrop() {
    const target = cropTarget;
    const key = target ? `${target.cardId}:${target.side}` : "";
    const waiting = target && reviewKey === key;
    const track = cropTrackRef.current[key];
    delete cropTrackRef.current[key];
    setReviewKey("");
    setCropTarget(null);
    if (waiting && target) {
      const current = getSide(target.cardId, target.side);
      if (current.original) void runScan(target.cardId, target.side, current.original, current.cropQuad, false, track);
    } else if (track?.undetected && target) {
      void reportCrop("notfound", target.side, null, null, null);
    }
  }

  async function applyCrop() {
    if (!cropTarget) return;
    const current = getSide(cropTarget.cardId, cropTarget.side);
    if (!current.url) return;
    // Perspective crop on an uploaded photo: straighten again from the
    // original with the corners as placed, and clean it like the auto scan.
    if (cropMode === "perspective" && current.original) {
      const target = cropTarget;
      const key = `${target.cardId}:${target.side}`;
      const track = cropTrackRef.current[key];
      delete cropTrackRef.current[key];
      setReviewKey("");
      setCropTarget(null);
      await runScan(target.cardId, target.side, current.original, current.cropQuad, false, track);
      return;
    }
    try {
      const croppedBlob = cropMode === "perspective" ? await warpPerspectiveCrop(current.url, current.cropQuad, CARD_ASPECT_RATIO_NUMBER) : await cropImage(current.url, current.cropRect);
      const croppedFile = new File([croppedBlob], (current.file?.name || "photo").replace(/(\.[^.]+)?$/, "-cropped.png"), { type: "image/png" });
      URL.revokeObjectURL(current.url);
      setSide(cropTarget.cardId, cropTarget.side, { file: croppedFile, url: URL.createObjectURL(croppedFile), cropRect: DEFAULT_CROP_RECT, cropQuad: DEFAULT_CROP_QUAD, tone: current.tone });
      setCropTarget(null);
    } catch {
      // Crop dialog stays open so the customer can retry.
    }
  }

  function openFilter(target: SlotRef) {
    // Reopen with the values that were applied last time, not back at 100%.
    setFilterValues(getSide(target.cardId, target.side).filter ?? DEFAULT_FILTER);
    setApplyFilterToBothSides(false);
    setFilterTarget(target);
  }

  async function applyFilter() {
    if (!filterTarget) return;
    const otherSide: Side = filterTarget.side === "front" ? "back" : "front";
    const hasOtherSide = !!getSide(filterTarget.cardId, otherSide).url;
    const sides: Side[] = applyFilterToBothSides && hasOtherSide ? [filterTarget.side, otherSide] : [filterTarget.side];
    try {
      for (const side of sides) {
        const current = getSide(filterTarget.cardId, side);
        if (!current.url) continue;
        // Always adjust the photo from before any adjustment, so applying again never stacks effects.
        const base = current.filterBase ?? (current.file ? { file: current.file, url: current.url } : null);
        if (!base) continue;
        const untouched = filterValues.brightness === DEFAULT_FILTER.brightness && filterValues.contrast === DEFAULT_FILTER.contrast && filterValues.saturation === DEFAULT_FILTER.saturation;
        if (untouched) {
          if (current.filterBase) {
            if (current.url !== base.url) URL.revokeObjectURL(current.url);
            setSide(filterTarget.cardId, side, { ...current, file: base.file, url: base.url, filterBase: undefined, filter: undefined });
            void reportFilter(sampleRef.current[`${filterTarget.cardId}:${side}`], null);
          }
          continue;
        }
        const adjustedBlob = await applyFilterAdjustments(base.url, filterValues);
        const adjustedFile = new File([adjustedBlob], (base.file.name || "photo").replace(/(-adjusted)*(\.[^.]+)?$/, "-adjusted.png"), { type: "image/png" });
        if (current.filterBase && current.url !== base.url) URL.revokeObjectURL(current.url);
        setSide(filterTarget.cardId, side, { ...current, file: adjustedFile, url: URL.createObjectURL(adjustedFile), filterBase: base, filter: { ...filterValues } });
        void reportFilter(sampleRef.current[`${filterTarget.cardId}:${side}`], { source: "customer", ...filterValues });
      }
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
      if (card?.front.original && card.front.original.url !== card.front.url) URL.revokeObjectURL(card.front.original.url);
      if (card?.back.original && card.back.original.url !== card.back.url) URL.revokeObjectURL(card.back.original.url);
      const next = prev.filter((entry) => entry.id !== cardId);
      return next.length ? next : [newCard()];
    });
    setActive((current) => (current?.cardId === cardId ? null : current));
  }

  // The card images exactly as they will print (contrast / tone applied).
  async function printableEntries(baked: string[]): Promise<SheetEntry[]> {
    const urlFor = async (state: SideState) => {
      if (!state.url || isNeutralTone(state.tone)) return state.url;
      const url = await bakeTone(state.url, state.tone as Tone);
      baked.push(url);
      return url;
    };
    return Promise.all(cards.filter((card) => card.front.url).map(async (card) => ({ id: card.id, frontUrl: await urlFor(card.front), backUrl: await urlFor(card.back) })));
  }

  async function composeAndContinue() {
    if (!readyCount || composing || busy || scanning) return;
    setComposing(true);
    setError("");
    const baked: string[] = [];
    try {
      const { file, pageCount } = await composeIdCardsToPdf(await printableEntries(baked), colorMode, sheetLayout, separatePages, sheetOptions);
      onComposed(file, pageCount, colorMode);
    } catch {
      setError("Could not prepare your ID cards for upload. Please try again.");
    } finally {
      baked.forEach((url) => URL.revokeObjectURL(url));
      setComposing(false);
    }
  }

  // Color / B&W changed in Print Options after the PDF was already built: build it again in the new mode.
  const lastModeRef = useRef(colorMode);
  useEffect(() => {
    if (lastModeRef.current === colorMode) return;
    lastModeRef.current = colorMode;
    if (hasFile) void composeAndContinue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorMode]);

  // Preview = the A4 sheet as it will be printed, before the customer continues to payment.
  useEffect(() => {
    if (!previewMode) return;
    let cancelled = false;
    const baked: string[] = [];
    void printableEntries(baked).then((entries) => {
      if (!cancelled) setPreviewEntries(entries);
    });
    return () => {
      cancelled = true;
      baked.forEach((url) => URL.revokeObjectURL(url));
      setPreviewEntries([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewMode]);

  const readyCount = cards.filter((card) => card.front.url).length;
  const previewPlan = useMemo(() => planSheet(previewEntries, A4, sheetLayout, {}, separatePages, sheetOptions), [previewEntries, sheetLayout, separatePages, sheetOptions]);

  useEffect(() => {
    if (previewMode && !readyCount) setPreviewMode(false);
  }, [previewMode, readyCount]);
  const activeState = active ? getSide(active.cardId, active.side) : null;
  const cropState = cropTarget ? getSide(cropTarget.cardId, cropTarget.side) : null;
  const filterState = filterTarget ? getSide(filterTarget.cardId, filterTarget.side) : null;
  const scanning = cards.some((card) => card.front.scan === "scanning" || card.back.scan === "scanning");
  // Perspective crop works on the uploaded photo, so the detected corners line up.
  const cropImageUrl = cropState ? (cropMode === "perspective" && cropState.original ? cropState.original.url : cropState.url) : "";

  return (
    <>
      <div className="idcard-toolbar-bar">
        {!previewMode ? (
        <div className="idcard-toolbar">
          <button type="button" disabled={!active} onClick={() => active && openFilter(active)}>
            <SlidersHorizontal size={17} />
            <span>Filter &amp; Light</span>
          </button>
          <button type="button" disabled={!active || activeState?.scan === "scanning"} onClick={() => active && autoFix(active)} title="Find the card edges again, straighten and clean">
            <Wand2 size={17} />
            <span>Auto Fix</span>
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
        ) : null}
        <div className="idcard-toolbar-actions">
          <div className="idcard-toggle-group">
            <button type="button" className={colorMode === "color" ? "active" : ""} onClick={() => setColorMode("color")}>
              <Palette size={14} /> Color{prices?.color !== undefined ? ` · Rs. ${prices.color}/page` : ""}
            </button>
            <button type="button" className={colorMode === "bw" ? "active" : ""} onClick={() => setColorMode("bw")}>
              <Contrast size={14} /> B/W{prices?.bw !== undefined ? ` · Rs. ${prices.bw}/page` : ""}
            </button>
          </div>
          <div className="idcard-toolbar-divider" />
          <div className="idcard-toggle-group" title="How front and back are placed on the sheet">
            <button type="button" className={sheetLayout === "side" ? "active" : ""} onClick={() => setSheetLayout("side")}>
              Left / Right
            </button>
            <button type="button" className={sheetLayout === "stack" ? "active" : ""} onClick={() => setSheetLayout("stack")}>
              Top / Bottom
            </button>
          </div>
          <div className="idcard-toggle-group" title="Print every ID card on its own page instead of fitting several on one page">
            <button type="button" className={separatePages ? "active" : ""} onClick={() => setSeparatePages((current) => !current)}>
              One ID per page
            </button>
          </div>
          <SheetOptionsControl value={sheetOptions} onChange={setSheetOptions} />
          <div className="idcard-toolbar-divider" />
          {previewMode ? (
            <>
              <button className="idcard-edit-btn" type="button" onClick={() => setPreviewMode(false)}>
                <Undo2 size={16} /> Edit cards
              </button>
              <button className="idcard-print-cta" type="button" disabled={!readyCount || composing || busy || scanning || !previewEntries.length} onClick={composeAndContinue}>
                {composing ? "Preparing…" : "Continue"}
              </button>
            </>
          ) : (
            <button className="idcard-print-cta" type="button" disabled={!readyCount || composing || busy || scanning} onClick={() => setPreviewMode(true)}>
              <Printer size={16} /> Preview
            </button>
          )}
        </div>
      </div>

      {!previewMode ? (
      <>
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
                        <TonedImage url={state.url} tone={state.tone} alt={`${side === "front" ? "Front" : "Back"} of ID card ${index + 1}`} />
                        {state.scan === "scanning" ? (
                          <span className="idcard-scan-overlay">
                            <LoaderCircle size={22} className="spin" />
                            {engineLoading ? "Loading scanner…" : "Straightening & cleaning…"}
                          </span>
                        ) : state.scan === "done" ? (
                          <span className="idcard-scan-badge ok">
                            <CircleCheck size={13} /> Auto-straightened
                          </span>
                        ) : state.scan === "notfound" || state.scan === "error" ? (
                          <span className="idcard-scan-badge warn">
                            <CircleAlert size={13} /> {state.scan === "notfound" ? "Card edges not found - use Crop" : "Auto clean failed - use Crop"}
                          </span>
                        ) : null}
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

      </>
      ) : (
      <div className="idcard-preview-view">
        <div className="idcard-preview-info">
          <strong>
            {A4.name} ({A4.widthMm} × {A4.heightMm} mm)
          </strong>
          <span>
            {readyCount} card{readyCount === 1 ? "" : "s"} · {previewPlan.pages.length} page{previewPlan.pages.length === 1 ? "" : "s"} · {sheetLayout === "stack" ? "Top / Bottom" : "Left / Right"}{separatePages ? " · One ID per page" : ""}{(sheetOptions.copies ?? 1) > 1 ? ` · ${sheetOptions.copies} copies each` : ""} · {colorMode === "bw" ? "B/W" : "Color"}
          </span>
          <span className="idcard-preview-hint">This is how your cards will be printed. Press Continue to place the order.</span>
        </div>
        {!previewEntries.length ? (
          <p className="idcard-preview-loading">Preparing preview…</p>
        ) : (
          <div className="idcard-preview-pages">
            {previewPlan.pages.map((placed, pageIndex) => (
              <figure key={pageIndex}>
                <div className="idcard-preview-page" style={{ aspectRatio: `${A4.widthMm} / ${A4.heightMm}`, filter: colorMode === "bw" ? "grayscale(1)" : undefined }}>
                  {placed.map((card) => (
                    <div
                      className="idcard-preview-card"
                      key={card.key}
                      style={{ left: `${(card.xMm / A4.widthMm) * 100}%`, top: `${(card.yMm / A4.heightMm) * 100}%`, width: `${(CARD_W_MM / A4.widthMm) * 100}%`, height: `${(CARD_H_MM / A4.heightMm) * 100}%`, cursor: "default" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={card.url} alt="" />
                    </div>
                  ))}
                </div>
                <figcaption>
                  Page {pageIndex + 1} of {previewPlan.pages.length}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
      )}

      {keepsPhotos && !previewMode ? (
        <p className="customer-inline-help">
          To improve the automatic card detection, the photo you upload and its cropped result may be kept for training. Do not upload a card you do not want kept.
        </p>
      ) : null}
      {error ? <p className="customer-inline-help" style={{ color: "#c7354d" }}>{error}</p> : null}

      <p className="customer-inline-help">
        {readyCount
          ? "Photos are straightened and cleaned automatically. Click a card to select it, then use Auto Fix / Crop / Rotate / Remove above. Back is optional - upload only a front for cards like PAN."
          : "Each card slot above is the upload target itself - upload a front photo, even one taken at an angle: the card is found, straightened and cleaned for printing."}
      </p>

      {cropTarget && cropState?.url ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Crop photo">
          <div className="crop-window idcrop-window">
            <div className="document-preview-head">
              <div>
                <strong>Crop {cropTarget.side === "front" ? "Front" : "Back"} of the card</strong>
                <span>{cropState.original?.file.name || cropState.file?.name}</span>
              </div>
              <button type="button" onClick={closeCrop} aria-label="Close crop">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body idcrop-body">
              {reviewKey === `${cropTarget.cardId}:${cropTarget.side}` ? (
                <div className="idcrop-note ok">
                  <CircleCheck size={20} />
                  <div>
                    <strong>Card detected automatically</strong>
                    <span>
                      The four blue corners were placed on your card for you. If they sit on the card&apos;s corners, press <b>Apply Crop</b> and the card is added. If any corner is off, drag it onto the
                      correct corner first.
                    </span>
                  </div>
                </div>
              ) : cropState.scan === "notfound" ? (
                <div className="idcrop-note warn">
                  <CircleAlert size={20} />
                  <div>
                    <strong>We could not find the card automatically</strong>
                    <span>Drag each blue corner onto a corner of the card, then press Apply Crop.</span>
                  </div>
                </div>
              ) : null}
              <div className="crop-mode-toggle">
                <button type="button" className={cropMode === "perspective" ? "active" : ""} onClick={() => setCropMode("perspective")}>
                  Perspective crop
                </button>
                <button type="button" className={cropMode === "straight" ? "active" : ""} onClick={() => setCropMode("straight")}>
                  Straight crop
                </button>
              </div>
              {cropMode === "straight" ? (
                <CropEditor
                  fileUrl={cropImageUrl}
                  rect={cropState.cropRect}
                  onRectChange={(rect) => updateCropRect(cropTarget.cardId, cropTarget.side, rect)}
                  aspectRatio={CARD_ASPECT_RATIO}
                />
              ) : (
                <PerspectiveCropEditor
                  fileUrl={cropImageUrl}
                  quad={cropState.cropQuad}
                  onQuadChange={(quad) => updateCropQuad(cropTarget.cardId, cropTarget.side, quad)}
                />
              )}
              <div className="crop-controls">
                <p>
                  {cropMode === "straight"
                    ? "Drag a corner or edge to resize the crop area. Drag inside the box to move it."
                    : "Drag each corner onto the card's actual corner - useful when the photo was taken at an angle. Click anywhere on an edge to move its nearest corner there."}
                </p>
                <button
                  type="button"
                  onClick={() => (cropMode === "straight" ? updateCropRect(cropTarget.cardId, cropTarget.side, DEFAULT_CROP_RECT) : updateCropQuad(cropTarget.cardId, cropTarget.side, DEFAULT_CROP_QUAD))}
                >
                  <RotateCcw size={16} /> Reset Crop
                </button>
                <button type="button" onClick={applyCrop}>
                  <Crop size={17} /> Apply Crop
                </button>
                <small>Closing this window keeps the automatic crop.</small>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {filterTarget && filterState?.url ? (() => {
        const otherSide: Side = filterTarget.side === "front" ? "back" : "front";
        const otherSideState = getSide(filterTarget.cardId, otherSide);
        const bothSelected = applyFilterToBothSides && !!otherSideState.url;
        return (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Filter and light">
          <div className="crop-window">
            <div className="document-preview-head">
              <div>
                <strong>Filter &amp; Light - {bothSelected ? "Front & Back Photo" : filterTarget.side === "front" ? "Front" : "Back"} Photo</strong>
                <span>{filterState.file?.name}</span>
              </div>
              <button type="button" onClick={() => setFilterTarget(null)} aria-label="Close filter panel">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body">
              <div className={bothSelected ? "idcard-filter-preview idcard-filter-preview-pair" : "idcard-filter-preview"}>
                <img
                  src={filterState.filterBase?.url ?? filterState.url}
                  alt="Preview with adjustments"
                  style={{ filter: `brightness(${filterValues.brightness}%) contrast(${filterValues.contrast}%) saturate(${filterValues.saturation}%)` }}
                />
                {bothSelected ? (
                  <img
                    src={otherSideState.filterBase?.url ?? otherSideState.url}
                    alt="Preview with adjustments (other side)"
                    style={{ filter: `brightness(${filterValues.brightness}%) contrast(${filterValues.contrast}%) saturate(${filterValues.saturation}%)` }}
                  />
                ) : null}
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
                {otherSideState.url ? (
                  <label className="idcard-filter-both-toggle">
                    <input
                      type="checkbox"
                      checked={applyFilterToBothSides}
                      onChange={(event) => setApplyFilterToBothSides(event.target.checked)}
                    />
                    <span>Apply to both Front &amp; Back</span>
                  </label>
                ) : null}
                <button type="button" onClick={() => setFilterValues(DEFAULT_FILTER)}>
                  <RotateCcw size={16} /> Reset
                </button>
                <button type="button" onClick={applyFilter}>
                  <SlidersHorizontal size={17} /> Apply{bothSelected ? " to Both" : ""}
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })() : null}
    </>
  );
}
