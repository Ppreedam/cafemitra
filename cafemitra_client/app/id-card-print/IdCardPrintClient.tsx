"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CircleAlert, CircleCheck, Contrast, Crop, LoaderCircle, LogIn, Palette, Plus, Printer, RefreshCw, RotateCcw, RotateCw, ScanLine, SlidersHorizontal, Trash2, Upload, Wallet, Wand2, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { WalletLimitBanner } from "../WalletLimitBanner";
import { CropEditor, cropImage, DEFAULT_CROP_QUAD, DEFAULT_CROP_RECT, PerspectiveCropEditor, warpPerspectiveCrop, type CropQuad, type CropRect } from "../CropEditor";
import { apiFetch, hasStoredSession } from "@/lib/api";
import { useToolPrice } from "@/lib/useToolPrice";
import { trackToolEvent } from "@/lib/analytics";
import IdCardPrintSeoContent from "./IdCardPrintSeoContent";
import { onScannerEngineLoading, scanCard, type ScanMode } from "./cardScan";
import { bakeTone, isNeutralTone, NEUTRAL_TONE, TonedImage, ToneControl, type Tone } from "./ToneControl";

async function chargeIdCardPrint() {
  const response = await apiFetch("/api/tools/id-card-print-charge/", { method: "POST" });
  if (response.ok) return;
  const data = await response.json().catch(() => ({}));
  throw new Error(data.message || "Could not verify your wallet balance. Please try again.");
}

type Side = "front" | "back";
type ColorMode = "color" | "bw";

type ScanStatus = "idle" | "scanning" | "done" | "notfound" | "error";

type SideState = {
  file: File | null;
  url: string;
  cropRect: CropRect;
  cropQuad: CropQuad;
  // The photo as uploaded, kept so the card can be re-straightened from it
  // (Auto Fix, or dragging the detected corners in Perspective crop).
  original?: { file: File; url: string };
  scan?: ScanStatus;
  // Manual brightness / contrast, shown live and applied when printing.
  tone?: Tone;
};

type CropMode = "straight" | "perspective";

type CardEntry = {
  id: string;
  front: SideState;
  back: SideState;
};

type SlotRef = { cardId: string; side: Side };

type FilterValues = { saturation: number };

const EMPTY_SIDE: SideState = { file: null, url: "", cropRect: DEFAULT_CROP_RECT, cropQuad: DEFAULT_CROP_QUAD };
const SCAN_MODES: Array<{ value: ScanMode | "off"; label: string }> = [
  { value: "clean", label: "Auto: straighten + clean" },
  { value: "photocopy", label: "Auto: straighten + photocopy B/W" },
  { value: "original", label: "Auto: straighten only" },
  { value: "off", label: "Auto off" },
];
const SCAN_MODE_KEY = "cafemitra_idcard_print_scan_mode";
const CARD_ASPECT_RATIO = "85.6/53.98";
const CARD_ASPECT_RATIO_NUMBER = 85.6 / 53.98;
const DEFAULT_FILTER: FilterValues = { saturation: 100 };

function newCard(): CardEntry {
  return { id: crypto.randomUUID(), front: EMPTY_SIDE, back: EMPTY_SIDE };
}

function sameSlot(a: SlotRef | null, b: SlotRef) {
  return !!a && a.cardId === b.cardId && a.side === b.side;
}

export default function IdCardPrintClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const price = useToolPrice("id_card_print");
  const [cards, setCards] = useState<CardEntry[]>(() => [newCard()]);
  const [active, setActive] = useState<SlotRef | null>(null);
  const [cropTarget, setCropTarget] = useState<SlotRef | null>(null);
  const [cropMode, setCropMode] = useState<CropMode>("perspective");
  const [filterTarget, setFilterTarget] = useState<SlotRef | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>(DEFAULT_FILTER);
  // Brightness / Contrast / Black / Red / Yellow / Blue being set in the
  // Filter & Light window; stored on the side(s) on Apply.
  const [filterTone, setFilterTone] = useState<Tone>(NEUTRAL_TONE);
  const [applyFilterToBothSides, setApplyFilterToBothSides] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>("color");
  const [printBusy, setPrintBusy] = useState(false);
  const [error, setError] = useState("");
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [chargeConfirm, setChargeConfirm] = useState<{ resolve: (ok: boolean) => void } | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode | "off">("clean");
  const [engineLoading, setEngineLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCAN_MODE_KEY);
      if (saved && SCAN_MODES.some((m) => m.value === saved)) setScanMode(saved as ScanMode | "off");
    } catch {
      // Private mode etc. - keep the default.
    }
    onScannerEngineLoading(() => setEngineLoading(true));
    return () => onScannerEngineLoading(null);
  }, []);

  function changeScanMode(mode: ScanMode | "off") {
    setScanMode(mode);
    try {
      localStorage.setItem(SCAN_MODE_KEY, mode);
    } catch {
      // Not persisted - fine.
    }
  }
  const loginNextUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  // Uploading, cropping, and previewing cards is free for anyone. Login (and
  // the wallet charge) is only required for the action that actually
  // produces output - clicking Print.
  function requireLogin() {
    if (hasStoredSession()) return true;
    setLoginPrompt(true);
    return false;
  }

  // No price loaded yet, or the tool is still free - skip the modal
  // entirely and go straight to the charge call (which is itself a no-op
  // while free).
  function requestChargeConfirm() {
    if (!price) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => setChargeConfirm({ resolve }));
  }

  function answerChargeConfirm(ok: boolean) {
    chargeConfirm?.resolve(ok);
    setChargeConfirm(null);
  }

  function getSide(cardId: string, side: Side): SideState {
    return cards.find((card) => card.id === cardId)?.[side] || EMPTY_SIDE;
  }

  function setSide(cardId: string, side: Side, next: SideState) {
    setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, [side]: next } : card)));
  }

  function releaseSide(state: SideState) {
    if (state.url) URL.revokeObjectURL(state.url);
    if (state.original && state.original.url !== state.url) URL.revokeObjectURL(state.original.url);
  }

  // Updates one side only if it still shows the same uploaded photo - a scan
  // that finishes after the user replaced/removed the photo is dropped.
  function updateIfSame(cardId: string, side: Side, originalUrl: string, update: (state: SideState) => SideState) {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId || card[side].original?.url !== originalUrl) return card;
        return { ...card, [side]: update(card[side]) };
      }),
    );
  }

  // Finds the card in the photo, straightens it to card size and cleans it.
  // quad = null detects the corners; a quad re-uses corners the user set.
  async function runScan(cardId: string, side: Side, original: { file: File; url: string }, quad: CropQuad | null, mode: ScanMode) {
    updateIfSame(cardId, side, original.url, (state) => ({ ...state, scan: "scanning" }));
    try {
      const result = await scanCard(original.file, mode, quad);
      setEngineLoading(false);
      if (!result.found) {
        updateIfSame(cardId, side, original.url, (state) => ({ ...state, scan: "notfound" }));
        return;
      }
      const file = new File([result.blob], original.file.name.replace(/(\.[^.]+)?$/, "-card.jpg"), { type: "image/jpeg" });
      updateIfSame(cardId, side, original.url, (state) => {
        if (state.url && state.url !== original.url) URL.revokeObjectURL(state.url);
        return { ...state, file, url: URL.createObjectURL(file), cropQuad: result.quad, cropRect: DEFAULT_CROP_RECT, scan: "done" };
      });
      trackToolEvent("id_card_print", quad ? "manual_perspective_scan" : "auto_scan", { mode });
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
    const auto = scanMode !== "off";
    setSide(cardId, side, { file: selected, url, cropRect: DEFAULT_CROP_RECT, cropQuad: DEFAULT_CROP_QUAD, original, scan: auto ? "scanning" : "idle" });
    if (auto) void runScan(cardId, side, original, null, scanMode as ScanMode);
  }

  function autoFix(target: SlotRef) {
    const current = getSide(target.cardId, target.side);
    const original = current.original || (current.file ? { file: current.file, url: current.url } : null);
    if (!original) return;
    if (!current.original) setSide(target.cardId, target.side, { ...current, original });
    void runScan(target.cardId, target.side, original, null, scanMode === "off" ? "clean" : scanMode);
  }

  function handleDrop(cardId: string, side: Side, event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFileChange(cardId, side, dropped);
  }

  function clearSide(cardId: string, side: Side) {
    releaseSide(getSide(cardId, side));
    setSide(cardId, side, EMPTY_SIDE);
    setActive((current) => (sameSlot(current, { cardId, side }) ? null : current));
  }

  async function rotateSide(cardId: string, side: Side, quarterTurns = 1) {
    const current = getSide(cardId, side);
    if (!current.url || !current.file) return;
    try {
      const rotatedBlob = await rotateImage(current.url, quarterTurns);
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

  async function applyCrop() {
    if (!cropTarget) return;
    const current = getSide(cropTarget.cardId, cropTarget.side);
    if (!current.url) return;
    // Perspective crop on an uploaded photo: re-straighten from the original
    // with the corners as placed, and clean it the same way as Auto.
    if (cropMode === "perspective" && current.original && scanMode !== "off") {
      const target = cropTarget;
      setCropTarget(null);
      await runScan(target.cardId, target.side, current.original, current.cropQuad, scanMode);
      return;
    }
    try {
      const croppedBlob = cropMode === "perspective" ? await warpPerspectiveCrop(current.url, current.cropQuad, CARD_ASPECT_RATIO_NUMBER) : await cropImage(current.url, current.cropRect);
      const croppedFile = new File([croppedBlob], (current.file?.name || "photo").replace(/(\.[^.]+)?$/, "-cropped.png"), { type: "image/png" });
      URL.revokeObjectURL(current.url);
      setSide(cropTarget.cardId, cropTarget.side, { file: croppedFile, url: URL.createObjectURL(croppedFile), cropRect: DEFAULT_CROP_RECT, cropQuad: DEFAULT_CROP_QUAD, tone: current.tone });
      setCropTarget(null);
    } catch {
      // Crop dialog stays open so the user can retry.
    }
  }

  function openFilter(target: SlotRef) {
    setFilterValues(DEFAULT_FILTER);
    setFilterTone({ ...NEUTRAL_TONE, ...getSide(target.cardId, target.side).tone });
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
        // The tone stays a setting (shown live, applied at print); only
        // saturation is baked into the photo.
        if (filterValues.saturation === DEFAULT_FILTER.saturation) {
          setSide(filterTarget.cardId, side, { ...current, tone: filterTone });
          continue;
        }
        const adjustedBlob = await applyFilterAdjustments(current.url, filterValues);
        const adjustedFile = new File([adjustedBlob], (current.file?.name || "photo").replace(/(\.[^.]+)?$/, "-adjusted.png"), { type: "image/png" });
        URL.revokeObjectURL(current.url);
        setSide(filterTarget.cardId, side, { file: adjustedFile, url: URL.createObjectURL(adjustedFile), cropRect: current.cropRect, cropQuad: current.cropQuad, tone: filterTone });
      }
      setFilterTarget(null);
    } catch {
      // Panel stays open so the user can retry.
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

  async function printSheet() {
    const withFront = cards.filter((card) => card.front.url);
    if (!withFront.length || printBusy) return;
    if (!requireLogin()) return;
    if (!(await requestChargeConfirm())) return;
    setPrintBusy(true);
    setError("");
    try {
      await chargeIdCardPrint();
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      const baked: string[] = [];
      const printUrl = async (state: SideState) => {
        if (!state.url || isNeutralTone(state.tone)) return state.url;
        const url = await bakeTone(state.url, state.tone as Tone);
        baked.push(url);
        return url;
      };
      const printable = await Promise.all(withFront.map(async (card) => ({ frontUrl: await printUrl(card.front), backUrl: await printUrl(card.back) })));
      // The print window has loaded them by then.
      if (baked.length) window.setTimeout(() => baked.forEach((url) => URL.revokeObjectURL(url)), 120000);
      printWindow.document.open();
      printWindow.document.write(buildCardPrintSheetHtml(printable, colorMode));
      printWindow.document.close();
      trackToolEvent("id_card_print", "print_sheet", { card_count: printable.length });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not prepare the print job. Please try again.");
    } finally {
      setPrintBusy(false);
    }
  }

  const readyCount = cards.filter((card) => card.front.url).length;
  const activeState = active ? getSide(active.cardId, active.side) : null;
  const cropState = cropTarget ? getSide(cropTarget.cardId, cropTarget.side) : null;
  // Perspective crop works on the uploaded photo, so the detected corners line up.
  const cropImageUrl = cropState ? (cropMode === "perspective" && cropState.original && scanMode !== "off" ? cropState.original.url : cropState.url) : "";
  const scanning = cards.some((card) => card.front.scan === "scanning" || card.back.scan === "scanning");
  const filterState = filterTarget ? getSide(filterTarget.cardId, filterTarget.side) : null;

  return (
    <DashboardShell activePath="/id-card-print">
      <div className="dashboard idcard-page">
        <WalletLimitBanner />
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">PrintPilot ID Card Print</span>
            <h2>ID Card Print (Photo Upload)</h2>
            <p>Upload one or more ID cards - each photo fills its slot at true print size, so what you see here is what comes out of the printer.</p>
          </div>
          <div className="auto-print-hero-actions">
            <span className="status-pill">Print via Browser</span>
          </div>
        </div>

        <article className="customer-panel">
          <div className="customer-panel-head">
            <span>Step 1</span>
            <h2>Upload Front &amp; Back</h2>
          </div>

          <div className="idcard-toolbar-bar">
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
              <button type="button" disabled={!active} onClick={() => active && void rotateSide(active.cardId, active.side, 2)} title="Turn an upside-down card the right way up">
                <RefreshCw size={17} />
                <span>Turn 180°</span>
              </button>
              <button type="button" disabled={!active} onClick={() => active && clearSide(active.cardId, active.side)}>
                <X size={17} />
                <span>Remove</span>
              </button>
            </div>
            <div className="idcard-toolbar-actions">
              <label className="idcard-scan-mode" title="What happens to a photo right after upload">
                <ScanLine size={15} />
                <select value={scanMode} onChange={(event) => changeScanMode(event.target.value as ScanMode | "off")}>
                  {SCAN_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="idcard-toolbar-divider" />
              <div className="idcard-toggle-group">
                <button type="button" className={colorMode === "color" ? "active" : ""} onClick={() => setColorMode("color")}>
                  <Palette size={14} /> Color
                </button>
                <button type="button" className={colorMode === "bw" ? "active" : ""} onClick={() => setColorMode("bw")}>
                  <Contrast size={14} /> B/W
                </button>
              </div>
              <div className="idcard-toolbar-divider" />
              <button className="idcard-print-cta" type="button" disabled={!readyCount || printBusy || scanning} onClick={() => void printSheet()}>
                <Printer size={16} /> {printBusy ? "Preparing…" : "Print A4 Sheet"}
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
                      <div key={side} className={`idcard-side-group ${side}`}>
                        <div className="idcard-side-slot">
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
                              <span>{side === "back" ? "Skip this if the card has nothing worth printing on the back." : "Drag & drop or choose a JPG/PNG file."}</span>
                              <input accept=".jpg,.jpeg,.png" type="file" onChange={(event) => handleFileChange(card.id, side, event.target.files?.[0])} />
                            </label>
                          )}
                        </div>
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

          <p className="customer-inline-help">
            {readyCount
              ? "Photos are straightened and cleaned automatically. Click a card to select it, then use Auto Fix / Crop / Rotate / Remove above. Back is optional - upload only a front for cards like PAN."
              : "Each card slot above is the upload target itself - upload a front photo, even one taken at an angle: the card is found, straightened and cleaned for printing."}
          </p>
          {error ? <div className="profile-alert error">{error}</div> : null}
        </article>
      </div>

      {cropTarget && cropState?.url && cropImageUrl ? (
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
                <strong>Filter &amp; Light - {bothSelected ? "Front & Back" : filterTarget.side === "front" ? "Front" : "Back"} Photo</strong>
                <span>{filterState.file?.name}</span>
              </div>
              <button type="button" onClick={() => setFilterTarget(null)} aria-label="Close filter panel">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body">
              <div className={bothSelected ? "idcard-filter-preview idcard-filter-preview-pair" : "idcard-filter-preview"}>
                <span className="idcard-filter-preview-img" style={{ filter: `saturate(${filterValues.saturation}%)` }}>
                  <TonedImage url={filterState.url} tone={filterTone} alt="Preview with adjustments" />
                </span>
                {bothSelected ? (
                  <span className="idcard-filter-preview-img" style={{ filter: `saturate(${filterValues.saturation}%)` }}>
                    <TonedImage url={otherSideState.url} tone={filterTone} alt="Preview with adjustments (other side)" />
                  </span>
                ) : null}
              </div>
              <div className="idcard-filter-controls">
                <ToneControl label="Light & Colour" tone={filterTone} disabled={false} onChange={setFilterTone} />
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
                <button
                  type="button"
                  onClick={() => {
                    setFilterValues(DEFAULT_FILTER);
                    setFilterTone(NEUTRAL_TONE);
                  }}
                >
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

      {chargeConfirm ? (
        <div className="resbuild-confirm-overlay" onClick={() => answerChargeConfirm(false)}>
          <div className="resbuild-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="resbuild-confirm-icon"><Wallet size={20} /></span>
            <h3>Confirm wallet charge</h3>
            <p>
              This will deduct <strong>₹{price}</strong> from your RepetiGo wallet for this print job.
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
              Your cards stay exactly as you left them. Log in (or create a free account) to print.
            </p>
            <div className="resbuild-confirm-actions">
              <button type="button" className="resbuild-btn-secondary" onClick={() => setLoginPrompt(false)}>Keep editing</button>
              <Link className="resbuild-btn-primary" href={`/login?next=${encodeURIComponent(loginNextUrl)}`}>Login</Link>
            </div>
          </div>
        </div>
      ) : null}

      <IdCardPrintSeoContent />
    </DashboardShell>
  );
}

async function rotateImage(url: string, quarterTurns: number): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = url;
  });
  const turns = ((quarterTurns % 4) + 4) % 4;
  const canvas = document.createElement("canvas");
  canvas.width = turns % 2 ? image.naturalHeight : image.naturalWidth;
  canvas.height = turns % 2 ? image.naturalWidth : image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((Math.PI / 2) * turns);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Rotation failed"))), "image/png", 0.95));
}

async function applyFilterAdjustments(url: string, values: FilterValues): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.filter = `saturate(${values.saturation}%)`;
  context.drawImage(image, 0, 0);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Filter apply failed"))), "image/png", 0.95));
}

function buildCardPrintSheetHtml(entries: { frontUrl: string; backUrl: string }[], colorMode: ColorMode) {
  const cardHtml = (url: string) => `<div class="card"><img src="${url}" /></div>`;
  const rowsHtml = entries.map((entry) => `<div class="pair">${cardHtml(entry.frontUrl)}${entry.backUrl ? cardHtml(entry.backUrl) : ""}</div>`).join("");

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
  /* min-height:297mm (set above, for the on-screen preview to look like a
     full A4 sheet) sized the printable box to EXACTLY one page's height
     with zero slack - any sub-millimeter rounding in the browser's mm-to-
     print-unit conversion then overflowed it, forcing a near-blank 2nd
     page for even a single card. Sizing to content here removes that risk
     entirely; it only ever mattered for the screen preview anyway. */
  .page{margin:0;min-height:0;box-shadow:none;}
  @page{size:A4;margin:0;}
  /* Browser extensions (ad blockers, "analyze this page" tools, etc.) often
     inject their own floating button straight onto <body> via a content
     script, completely outside this page's own markup - nothing here can
     prevent that injection, but this hides anything that isn't our own
     .page content specifically from the PRINTED output, regardless of what
     it is or which extension added it. */
  body > :not(.page){display:none !important;}
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
