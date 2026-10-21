"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CircleAlert, CircleCheck, Contrast, Crop, FlipVertical2, LoaderCircle, LogIn, MessageSquareWarning, Palette, Plus, Printer, RotateCcw, RotateCw, ScanLine, SlidersHorizontal, Trash2, Undo2, Upload, Wallet, Wand2, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import { WalletLimitBanner } from "../WalletLimitBanner";
import { CropEditor, cropImage, DEFAULT_CROP_QUAD, DEFAULT_CROP_RECT, PerspectiveCropEditor, rotateQuad, warpPerspectiveCrop, type CropQuad, type CropRect } from "../CropEditor";
import { apiFetch, apiUrl, hasStoredSession } from "@/lib/api";
import { useToolPrice } from "@/lib/useToolPrice";
import { trackToolEvent } from "@/lib/analytics";
import { BUSINESS } from "@/lib/businessInfo";
import IdCardPrintSeoContent from "./IdCardPrintSeoContent";
import { ACCEPT_TOLERANCE_PCT, quadDistance, reportCrop, reportFilter, type CropOutcome, type CropSampleRef, type CropTrack } from "./cropTraining";
import SheetOptionsControl from "./SheetOptionsControl";
import { loadSheetPrefs, saveSheetPrefs } from "./sheetPrefs";
import { alignCard, buildSheetHtml, DEFAULT_PAPER, MAX_COPIES, orientedPaper, PAPER_CHOICES, paperFromProfileName, paperFromSummary, planSheet, type SheetOptions, type PaperChoice, type PositionOverrides, type SheetLayout } from "./sheetLayout";
import { onScannerEngineLoading, scanCard, type ScanMode } from "./cardScan";
import { bakeTone, isNeutralTone, NEUTRAL_TONE, TonedImage, ToneControl, type Tone } from "./ToneControl";
import { PrintProfileSelect, useAgentPrint } from "@/app/PrintProfileSelect";

async function chargeIdCardPrint(cardCount: number) {
  const response = await apiFetch("/api/tools/id-card-print-charge/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cardCount }),
  });
  if (response.ok) return;
  const data = await response.json().catch(() => ({}));
  throw new Error(data.message || "Could not verify your wallet balance. Please try again.");
}

type Side = "front" | "back";
type ColorMode = "color" | "bw";
// Cropped / auto-straightened cards start with this contrast so the print is
// crisp; a tone the user already set (even back to neutral) is never overridden.
const CROPPED_CARD_TONE: Tone = { ...NEUTRAL_TONE, contrast: 40 };

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
  // Saturation is baked into the photo; this is the photo before that (so the slider can be reopened
  // and changed again without stacking effects) and the saturation that was applied.
  filterBase?: { file: File; url: string };
  saturation?: number;
};

type CropMode = "straight" | "perspective";

type CardEntry = {
  id: string;
  front: SideState;
  back: SideState;
  /** Times this ID card is printed (default 1). */
  copies?: number;
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
  // A fresh upload whose auto-detected crop is waiting for the user to confirm it in the crop window.
  const [reviewKey, setReviewKey] = useState("");
  const cropTrackRef = useRef<Record<string, CropTrack>>({});
  const sampleRef = useRef<Record<string, CropSampleRef>>({});
  // True while the admin has turned on keeping photos for auto-crop training (a notice is shown then).
  const [collectCropPhotos, setCollectCropPhotos] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/crop-training/config/"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setCollectCropPhotos(Boolean(data?.collectImages)))
      .catch(() => {});
  }, []);
  const [cropMode, setCropMode] = useState<CropMode>("perspective");
  const [filterTarget, setFilterTarget] = useState<SlotRef | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>(DEFAULT_FILTER);
  // Brightness / Contrast / Black / Red / Yellow / Blue being set in the
  // Filter & Light window; stored on the side(s) on Apply.
  const [filterTone, setFilterTone] = useState<Tone>(NEUTRAL_TONE);
  const [applyFilterToBothSides, setApplyFilterToBothSides] = useState(false);
  const [colorMode, setColorMode] = useState<ColorMode>("color");
  const [sheetLayout, setSheetLayout] = useState<SheetLayout>("side");
  const [previewMode, setPreviewMode] = useState(false);
  const [separatePages, setSeparatePages] = useState(false);
  const [sheetOptions, setSheetOptions] = useState<SheetOptions>({});
  // The margin and size last printed with for this layout are applied again when it is used.
  useEffect(() => {
    const saved = loadSheetPrefs(sheetLayout);
    if (saved) setSheetOptions((current) => ({ ...current, marginMm: saved.marginMm, sizePercent: saved.sizePercent, landscape: saved.landscape }));
  }, [sheetLayout]);
  const [previewEntries, setPreviewEntries] = useState<{ id: string; frontUrl: string; backUrl: string; copies?: number }[]>([]);
  const [positionOverrides, setPositionOverrides] = useState<PositionOverrides>({});
  // Alignment lines drawn on the page while a card is dragged (mm), and which page they belong to.
  const [dragGuides, setDragGuides] = useState<{ page: number; x: number[]; y: number[] } | null>(null);
  const [paperOverride, setPaperOverride] = useState<PaperChoice | null>(null);
  const [printBusy, setPrintBusy] = useState(false);
  const agentPrint = useAgentPrint("id-card-print");
  const [error, setError] = useState("");
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [chargeConfirm, setChargeConfirm] = useState<{ resolve: (ok: boolean) => void } | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode | "off">("original");
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
    if (state.filterBase && state.filterBase.url !== state.url) URL.revokeObjectURL(state.filterBase.url);
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
  async function runScan(cardId: string, side: Side, original: { file: File; url: string }, quad: CropQuad | null, mode: ScanMode, review = false, track?: CropTrack) {
    updateIfSame(cardId, side, original.url, (state) => ({ ...state, scan: "scanning" }));
    try {
      const result = await scanCard(original.file, mode, quad);
      setEngineLoading(false);
      if (!result.found) {
        updateIfSame(cardId, side, original.url, (state) => ({ ...state, scan: "notfound" }));
        // No card found on a fresh upload: let the user place the corners by hand right away.
        if (review) {
          cropTrackRef.current[`${cardId}:${side}`] = { autoQuad: null, undetected: true };
          setCropTarget({ cardId, side });
        }
        return;
      }
      if (review) {
        // Show the detected corners in the crop window first; the card is only cut out once the
        // user confirms (Apply Crop) - or closes the window to accept the detected crop.
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
        return { ...state, file, url: URL.createObjectURL(file), cropQuad: result.quad, cropRect: DEFAULT_CROP_RECT, scan: "done", tone: state.tone ?? CROPPED_CARD_TONE, filterBase: undefined, saturation: undefined };
      });
      trackToolEvent("id_card_print", quad ? "manual_perspective_scan" : "auto_scan", { mode });
      if (track) {
        const outcome: CropOutcome = track.undetected ? "manual" : track.autoQuad && quadDistance(track.autoQuad, result.quad) <= ACCEPT_TOLERANCE_PCT ? "accepted" : "adjusted";
        void reportCrop(outcome, side, track.autoQuad, result.quad, { original: original.file, result: result.blob }).then((sample) => {
          if (sample) sampleRef.current[`${cardId}:${side}`] = sample;
        });
        // A freshly cropped card goes straight to Filter & Light so brightness / contrast can be set.
        openFilter({ cardId, side }, CROPPED_CARD_TONE);
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
    const auto = scanMode !== "off";
    setSide(cardId, side, { file: selected, url, cropRect: DEFAULT_CROP_RECT, cropQuad: DEFAULT_CROP_QUAD, original, scan: auto ? "scanning" : "idle" });
    setActive({ cardId, side });
    if (auto) void runScan(cardId, side, original, null, scanMode as ScanMode, true);
  }

  function autoFix(target: SlotRef) {
    const current = getSide(target.cardId, target.side);
    const original = current.original || (current.file ? { file: current.file, url: current.url } : null);
    if (!original) return;
    if (!current.original) setSide(target.cardId, target.side, { ...current, original });
    void runScan(target.cardId, target.side, original, null, scanMode === "off" ? "original" : scanMode);
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

  // Undoes Auto Fix (or any manual crop/filter) and shows the photo exactly
  // as uploaded again, so the user can crop or adjust it by hand when the
  // automatic straighten/clean gets it wrong.
  function resetToOriginal(target: SlotRef) {
    const current = getSide(target.cardId, target.side);
    if (!current.original) return;
    if (current.url && current.url !== current.original.url) URL.revokeObjectURL(current.url);
    setSide(target.cardId, target.side, {
      file: current.original.file,
      url: current.original.url,
      cropRect: DEFAULT_CROP_RECT,
      cropQuad: DEFAULT_CROP_QUAD,
      original: current.original,
      scan: "idle",
    });
  }

  function updateCropRect(cardId: string, side: Side, rect: CropRect) {
    setSide(cardId, side, { ...getSide(cardId, side), cropRect: rect });
  }

  function updateCropQuad(cardId: string, side: Side, quad: CropQuad) {
    setSide(cardId, side, { ...getSide(cardId, side), cropQuad: quad });
  }

  // Turns the photo being cropped (the uploaded original while placing corners, else the shown photo) and
  // turns the corners with it. A rotated photo no longer matches what auto-crop saw, so it is not recorded for training.
  async function rotateCropSource(turns: 1 | -1) {
    if (!cropTarget) return;
    const { cardId, side } = cropTarget;
    const current = getSide(cardId, side);
    const useOriginal = cropMode === "perspective" && !!current.original && scanMode !== "off";
    const source = useOriginal ? current.original : current.file ? { file: current.file, url: current.url } : null;
    if (!source) return;
    try {
      const rotatedBlob = await rotateImage(source.url, turns);
      const rotatedFile = new File([rotatedBlob], source.file.name.replace(/\.[^.]+$/, ".png"), { type: "image/png" });
      const rotated = { file: rotatedFile, url: URL.createObjectURL(rotatedFile) };
      delete cropTrackRef.current[`${cardId}:${side}`];
      const cropQuad = rotateQuad(current.cropQuad, turns);
      const wasShown = current.url === source.url;
      if (wasShown) URL.revokeObjectURL(source.url);
      else if (useOriginal) URL.revokeObjectURL(source.url);
      if (useOriginal) {
        setSide(cardId, side, { ...current, original: rotated, ...(wasShown ? rotated : {}), cropQuad });
      } else {
        const originalIsShown = current.original?.url === current.url;
        setSide(cardId, side, { ...current, ...rotated, ...(originalIsShown ? { original: rotated } : {}), cropRect: DEFAULT_CROP_RECT, cropQuad });
      }
    } catch {
      // Leave the photo as it is if rotating fails.
    }
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
      if (current.original && scanMode !== "off") void runScan(target.cardId, target.side, current.original, current.cropQuad, scanMode as ScanMode, false, track);
    } else if (track?.undetected && target) {
      // Nothing was detected and the user left without placing the corners.
      void reportCrop("notfound", target.side, null, null, null);
    }
  }

  async function applyCrop() {
    if (!cropTarget) return;
    const current = getSide(cropTarget.cardId, cropTarget.side);
    if (!current.url) return;
    // Perspective crop on an uploaded photo: re-straighten from the original
    // with the corners as placed, and clean it the same way as Auto.
    if (cropMode === "perspective" && current.original && scanMode !== "off") {
      const target = cropTarget;
      const key = `${target.cardId}:${target.side}`;
      const track = cropTrackRef.current[key];
      delete cropTrackRef.current[key];
      setReviewKey("");
      setCropTarget(null);
      await runScan(target.cardId, target.side, current.original, current.cropQuad, scanMode, false, track);
      return;
    }
    try {
      const croppedBlob = cropMode === "perspective" ? await warpPerspectiveCrop(current.url, current.cropQuad, CARD_ASPECT_RATIO_NUMBER) : await cropImage(current.url, current.cropRect);
      const croppedFile = new File([croppedBlob], (current.file?.name || "photo").replace(/(\.[^.]+)?$/, "-cropped.png"), { type: "image/png" });
      URL.revokeObjectURL(current.url);
      setSide(cropTarget.cardId, cropTarget.side, { file: croppedFile, url: URL.createObjectURL(croppedFile), cropRect: DEFAULT_CROP_RECT, cropQuad: DEFAULT_CROP_QUAD, tone: current.tone ?? CROPPED_CARD_TONE });
      setCropTarget(null);
    } catch {
      // Crop dialog stays open so the user can retry.
    }
  }

  function openFilter(target: SlotRef, initialTone?: Tone) {
    // Reopen with the values that were applied last time, not back at 100%.
    setFilterValues({ saturation: getSide(target.cardId, target.side).saturation ?? DEFAULT_FILTER.saturation });
    setFilterTone({ ...NEUTRAL_TONE, ...(initialTone ?? getSide(target.cardId, target.side).tone) });
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
        // Tell training what was changed from the starting look (contrast 40, saturation 100) - or that it was put back.
        const changed = filterValues.saturation !== DEFAULT_FILTER.saturation || (Object.keys(CROPPED_CARD_TONE) as (keyof Tone)[]).some((key) => Number(filterTone[key] ?? 0) !== CROPPED_CARD_TONE[key]);
        void reportFilter(sampleRef.current[`${filterTarget.cardId}:${side}`], changed ? { source: "dashboard", saturation: filterValues.saturation, ...filterTone } : null);
        // The tone stays a setting (shown live, applied at print); only saturation is baked into the
        // photo - always from the photo before any saturation, so changing it again never stacks.
        const base = current.filterBase ?? (current.file ? { file: current.file, url: current.url } : null);
        if (!base) continue;
        if (filterValues.saturation === DEFAULT_FILTER.saturation) {
          if (current.filterBase) {
            if (current.url !== base.url) URL.revokeObjectURL(current.url);
            setSide(filterTarget.cardId, side, { ...current, file: base.file, url: base.url, filterBase: undefined, saturation: undefined, tone: filterTone });
          } else {
            setSide(filterTarget.cardId, side, { ...current, tone: filterTone });
          }
          continue;
        }
        const adjustedBlob = await applyFilterAdjustments(base.url, filterValues);
        const adjustedFile = new File([adjustedBlob], (base.file.name || "photo").replace(/(-adjusted)*(\.[^.]+)?$/, "-adjusted.png"), { type: "image/png" });
        if (current.filterBase && current.url !== base.url) URL.revokeObjectURL(current.url);
        setSide(filterTarget.cardId, side, {
          ...current,
          file: adjustedFile,
          url: URL.createObjectURL(adjustedFile),
          filterBase: base,
          saturation: filterValues.saturation,
          tone: filterTone,
        });
      }
      setFilterTarget(null);
    } catch {
      // Panel stays open so the user can retry.
    }
  }

  function addCard() {
    setCards((prev) => [...prev, newCard()]);
  }

  // Ctrl+V with an image on the clipboard (a screenshot or a copied photo) fills the first empty card slot.
  function handlePasteImage(event: ClipboardEvent) {
    if (previewMode || cropTarget || filterTarget) return;
    const item = Array.from(event.clipboardData?.items ?? []).find((entry) => entry.kind === "file" && entry.type.startsWith("image/"));
    const blob = item?.getAsFile();
    if (!blob) return;
    event.preventDefault();
    const file = new File([blob], `pasted-${Date.now()}.${blob.type.split("/")[1]?.replace("jpeg", "jpg") || "png"}`, { type: blob.type });
    for (const card of cards) {
      const side: Side | null = !card.front.url ? "front" : !card.back.url ? "back" : null;
      if (side) {
        handleFileChange(card.id, side, file);
        return;
      }
    }
    const extra = newCard();
    setCards((prev) => [...prev, extra]);
    setTimeout(() => handleFileChange(extra.id, "front", file), 0);
  }
  const pasteHandlerRef = useRef(handlePasteImage);
  pasteHandlerRef.current = handlePasteImage;
  useEffect(() => {
    const listener = (event: ClipboardEvent) => pasteHandlerRef.current(event);
    window.addEventListener("paste", listener);
    return () => window.removeEventListener("paste", listener);
  }, []);

  function setCardCopies(cardId: string, copies: number) {
    setCards((prev) => prev.map((card) => (card.id === cardId ? { ...card, copies } : card)));
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
    saveSheetPrefs(sheetLayout, sheetOptions);
    setPrintBusy(true);
    setError("");
    try {
      await chargeIdCardPrint(withFront.length);
      const baked: string[] = [];
      const printUrl = async (state: SideState) => {
        if (!state.url || isNeutralTone(state.tone)) return state.url;
        const url = await bakeTone(state.url, state.tone as Tone);
        baked.push(url);
        return url;
      };
      const printable = await Promise.all(withFront.map(async (card) => ({ id: card.id, copies: card.copies, frontUrl: await printUrl(card.front), backUrl: await printUrl(card.back) })));
      // The print window / agent render has loaded them by then.
      if (baked.length) window.setTimeout(() => baked.forEach((url) => URL.revokeObjectURL(url)), 120000);
      const printHtml = buildSheetHtml(planSheet(printable, paper, sheetLayout, positionOverrides, separatePages, sheetOptions), colorMode, true);
      await agentPrint.printHtml(() => printHtml, {
        fileName: `id-card-${paper.name.toLowerCase()}-sheet.pdf`,
        fallback: () => {
          const printWindow = window.open("", "_blank");
          if (!printWindow) return;
          printWindow.document.open();
          printWindow.document.write(printHtml);
          printWindow.document.close();
        },
      });
      trackToolEvent("id_card_print", "print_sheet", { card_count: printable.length });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not prepare the print job. Please try again.");
    } finally {
      setPrintBusy(false);
    }
  }

  // The sheet is laid out for the paper of the selected print profile ("4x6 · Color · ..."); with no
  // profile (browser print) the paper can be chosen in the preview, A4 by default.
  const selectedProfile = agentPrint.profiles.find((item) => item.name === agentPrint.profile);
  const profilePaper = selectedProfile ? paperFromSummary(selectedProfile.summary) ?? paperFromProfileName(selectedProfile.name) : null;
  // Portrait / Landscape turns the chosen paper; everything below (plan, preview, print) uses the turned one.
  const basePaper = profilePaper ?? paperOverride ?? DEFAULT_PAPER;
  const paper = useMemo(() => orientedPaper(basePaper, sheetOptions.landscape), [basePaper, sheetOptions.landscape]);
  // A live line for the edit view: what the sheet will be (pages, layout, ...) - Layout, One ID per page, Copies, Size and
  // Margin only show on the printed sheet, so this tells the effect of each click right here.
  const liveSheetPlan = useMemo(
    () =>
      planSheet(
        cards.filter((card) => card.front.url).map((card) => ({ id: card.id, copies: card.copies, frontUrl: "x", backUrl: card.back.url ? "x" : "" })),
        paper,
        sheetLayout,
        {},
        separatePages,
        sheetOptions,
      ),
    [cards, sheetLayout, separatePages, sheetOptions],
  );
  const printCount = cards.filter((card) => card.front.url).reduce((sum, card) => sum + (card.copies ?? 1), 0);
  const previewPlan = useMemo(() => planSheet(previewEntries, paper, sheetLayout, positionOverrides, separatePages, sheetOptions), [previewEntries, paper, sheetLayout, positionOverrides, separatePages, sheetOptions]);

  // Hand-placed cards belong to one layout; a new layout or paper starts from the automatic one again.
  useEffect(() => {
    setPositionOverrides({});
  }, [sheetLayout, paper, previewMode, separatePages, sheetOptions]);

  // Drag a card on the preview page to wherever it should print.
  function startCardDrag(event: React.PointerEvent<HTMLDivElement>, key: string, startX: number, startY: number) {
    const pageEl = event.currentTarget.parentElement;
    if (!pageEl) return;
    event.preventDefault();
    const rect = pageEl.getBoundingClientRect();
    const mmPerPx = paper.widthMm / rect.width;
    const originX = event.clientX;
    const originY = event.clientY;
    const pageIndex = Math.max(0, previewPlan.pages.findIndex((page) => page.some((card) => card.key === key)));
    const others = (previewPlan.pages[pageIndex] ?? []).filter((card) => card.key !== key).map((card) => ({ x: card.xMm, y: card.yMm, w: previewPlan.cardWMm, h: previewPlan.cardHMm }));
    function onMove(move: PointerEvent) {
      const rawX = Math.max(0, Math.min(paper.widthMm - previewPlan.cardWMm, startX + (move.clientX - originX) * mmPerPx));
      const rawY = Math.max(0, Math.min(paper.heightMm - previewPlan.cardHMm, startY + (move.clientY - originY) * mmPerPx));
      const aligned = alignCard({ x: rawX, y: rawY, w: previewPlan.cardWMm, h: previewPlan.cardHMm }, others, paper);
      const xMm = Math.max(0, Math.min(paper.widthMm - previewPlan.cardWMm, aligned.x));
      const yMm = Math.max(0, Math.min(paper.heightMm - previewPlan.cardHMm, aligned.y));
      setPositionOverrides((current) => ({ ...current, [key]: { xMm, yMm } }));
      setDragGuides({ page: pageIndex, x: aligned.guidesX, y: aligned.guidesY });
    }
    function onUp() {
      setDragGuides(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // Opening the preview prepares the cards the same way printing does (colour/tone applied).
  useEffect(() => {
    if (!previewMode) return;
    let cancelled = false;
    const baked: string[] = [];
    (async () => {
      const withFront = cards.filter((card) => card.front.url);
      const urlFor = async (state: SideState) => {
        if (!state.url || isNeutralTone(state.tone)) return state.url;
        const url = await bakeTone(state.url, state.tone as Tone);
        baked.push(url);
        return url;
      };
      const entries = await Promise.all(withFront.map(async (card) => ({ id: card.id, copies: card.copies, frontUrl: await urlFor(card.front), backUrl: await urlFor(card.back) })));
      if (!cancelled) setPreviewEntries(entries);
    })();
    return () => {
      cancelled = true;
      baked.forEach((url) => URL.revokeObjectURL(url));
      setPreviewEntries([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewMode]);

  const readyCount = cards.filter((card) => card.front.url).length;

  useEffect(() => {
    if (previewMode && !readyCount) setPreviewMode(false);
  }, [previewMode, readyCount]);
  const activeState = active ? getSide(active.cardId, active.side) : null;
  // Auto Fix (or a manual crop/filter) has changed the photo from what was
  // uploaded - flag the way back to it so a bad auto-straighten isn't a
  // dead end.
  const resetAvailable = !!active && !!activeState?.original && activeState.url !== activeState.original.url;
  const cropState = cropTarget ? getSide(cropTarget.cardId, cropTarget.side) : null;
  // Perspective crop works on the uploaded photo, so the detected corners line up.
  const cropImageUrl = cropState ? (cropMode === "perspective" && cropState.original && scanMode !== "off" ? cropState.original.url : cropState.url) : "";
  const scanning = cards.some((card) => card.front.scan === "scanning" || card.back.scan === "scanning");
  const filterState = filterTarget ? getSide(filterTarget.cardId, filterTarget.side) : null;
  const reportHref = `https://wa.me/${BUSINESS.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
    `Hi RepetiGo, ID Card Print issue.${active ? ` Side: ${active.side === "front" ? "Front" : "Back"}, mode: ${scanMode}.` : ""} Problem: `,
  )}`;

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
            <span className="status-pill">Print via PrintPilot</span>
          </div>
        </div>

        <article className="customer-panel">
          <div className="customer-panel-head">
            <span>{previewMode ? "Preview" : "Step 1"}</span>
            <h2>{previewMode ? "Print Preview" : "Upload Front & Back"}</h2>
          </div>

          <div className="idcard-toolbar-bar">
            {!previewMode ? (
            <div className="idcard-toolbar">
              <button type="button" disabled={!active} onClick={() => active && openFilter(active)} title="Adjust brightness, colour and saturation by hand">
                <SlidersHorizontal size={17} />
                <span>Filter &amp; Light</span>
              </button>
              <button type="button" disabled={!active || activeState?.scan === "scanning"} onClick={() => active && autoFix(active)} title="Find the card edges again, straighten and clean automatically">
                <Wand2 size={17} />
                <span>Auto Fix</span>
              </button>
              <button
                type="button"
                className={resetAvailable ? "highlight" : undefined}
                disabled={!resetAvailable}
                onClick={() => active && resetToOriginal(active)}
                title="Auto Fix not quite right? Go back to the photo you uploaded and crop or adjust it yourself"
              >
                <Undo2 size={17} />
                <span>Reset to Original</span>
              </button>
              <button type="button" disabled={!active} onClick={() => active && setCropTarget(active)} title="Drag the corners or edges to crop by hand">
                <Crop size={17} />
                <span>Crop</span>
              </button>
              <button type="button" disabled={!active} onClick={() => active && void rotateSide(active.cardId, active.side)} title="Turn the photo 90° clockwise">
                <RotateCw size={17} />
                <span>Rotate</span>
              </button>
              <button type="button" disabled={!active} onClick={() => active && void rotateSide(active.cardId, active.side, 2)} title="Turn an upside-down card the right way up">
                <FlipVertical2 size={17} />
                <span>Turn 180°</span>
              </button>
              <button type="button" disabled={!active} onClick={() => active && clearSide(active.cardId, active.side)} title="Delete this photo and start over">
                <Trash2 size={17} />
                <span>Remove</span>
              </button>
              <a className="idcard-toolbar-report" href={reportHref} target="_blank" rel="noopener noreferrer" title="Something not working right? Message us on WhatsApp">
                <MessageSquareWarning size={17} />
                <span>Report Issue</span>
              </a>
            </div>
            ) : null}
            <div className="idcard-toolbar-actions">
              {!previewMode ? (
                <>
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
                </>
              ) : null}
              <div className="idcard-toggle-group">
                <button type="button" className={colorMode === "color" ? "active" : ""} onClick={() => setColorMode("color")}>
                  <Palette size={14} /> Color
                </button>
                <button type="button" className={colorMode === "bw" ? "active" : ""} onClick={() => setColorMode("bw")}>
                  <Contrast size={14} /> B/W
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
              {/* One ID per page is a print-sheet choice: it is shown only on the preview page. */}
              {previewMode ? (
                <div className="idcard-toggle-group" title="Print every ID card on its own page instead of fitting several on one page">
                  <button type="button" className={separatePages ? "active" : ""} onClick={() => setSeparatePages((current) => !current)}>
                    One ID per page
                  </button>
                </div>
              ) : null}
              {previewMode ? (
                <>
                  <div className="idcard-toggle-group" title="Paper direction">
                    <button type="button" className={!sheetOptions.landscape ? "active" : ""} onClick={() => setSheetOptions((current) => ({ ...current, landscape: false }))}>
                      Portrait
                    </button>
                    <button type="button" className={sheetOptions.landscape ? "active" : ""} onClick={() => setSheetOptions((current) => ({ ...current, landscape: true }))}>
                      Landscape
                    </button>
                  </div>
                </>
              ) : null}
              {previewMode ? <SheetOptionsControl value={sheetOptions} onChange={setSheetOptions} paper={paper} /> : null}
              {readyCount && !previewMode ? (
                <span className="idcard-sheet-summary" title="This is how the sheet will be printed">
                  {paper.name} · {printCount} card{printCount === 1 ? "" : "s"} on {liveSheetPlan.pages.length} page{liveSheetPlan.pages.length === 1 ? "" : "s"} · {sheetLayout === "stack" ? "Top / Bottom" : "Left / Right"}{separatePages ? " · One ID per page" : ""} · {colorMode === "bw" ? "B/W" : "Color"}
                </span>
              ) : null}
              {/* The print profile is only chosen on the preview, right before the final print. */}
              {previewMode ? (
                <>
                  <div className="idcard-toolbar-divider" />
                  <PrintProfileSelect print={agentPrint} />
                </>
              ) : null}
              {previewMode ? (
                <button className="idcard-edit-btn" type="button" onClick={() => setPreviewMode(false)}>
                  <Undo2 size={16} /> Edit cards
                </button>
              ) : null}
              <button
                className="idcard-print-cta"
                type="button"
                disabled={!readyCount || printBusy || scanning || (previewMode && !previewEntries.length)}
                onClick={() => (previewMode ? void printSheet() : setPreviewMode(true))}
              >
                <Printer size={16} /> {printBusy ? "Preparing…" : previewMode ? "Print" : "Continue"}
              </button>
            </div>
          </div>

          {!previewMode ? (
            <>
          <div className={`idcard-card-rows${colorMode === "bw" ? " is-bw" : ""}`}>
            {cards.map((card, index) => (
              <div key={card.id} className="idcard-card-row">
                <div className="idcard-card-row-head">
                  <span>ID Card {index + 1}</span>
                  <label className="idcard-row-copies" title="How many times this ID card is printed">
                    <span>Copies</span>
                    <select value={card.copies ?? 1} onChange={(event) => setCardCopies(card.id, Number(event.target.value))}>
                      {Array.from({ length: MAX_COPIES }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  {cards.length > 1 ? (
                    <button type="button" className="idcard-card-row-remove" onClick={() => removeCard(card.id)}>
                      <Trash2 size={13} /> Remove card
                    </button>
                  ) : null}
                </div>
                <div className={`idcard-photo-pair${sheetLayout === "stack" ? " is-stack" : ""}`}>
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
            </>
          ) : (
            <div className="idcard-preview-view">
              <div className="idcard-preview-info">
                <strong>
                  {paper.name} ({paper.widthMm} × {paper.heightMm} mm)
                </strong>
                <span>
                  {readyCount} card{readyCount === 1 ? "" : "s"} · {previewPlan.pages.length} page{previewPlan.pages.length === 1 ? "" : "s"} · {sheetLayout === "stack" ? "Top / Bottom" : "Left / Right"}{separatePages ? " · One ID per page" : ""}{printCount !== readyCount ? ` · ${printCount} prints` : ""} ·{" "}
                  {colorMode === "bw" ? "B/W" : "Color"}
                </span>
                {profilePaper ? (
                  <span>
                    Paper {profilePaper.name} - from print profile &quot;{selectedProfile?.name}&quot;
                  </span>
                ) : (
                  <label>
                    <span>Paper</span>
                    <select value={paper.name} onChange={(event) => setPaperOverride(PAPER_CHOICES.find((choice) => choice.name === event.target.value) ?? null)}>
                      {PAPER_CHOICES.map((choice) => (
                        <option key={choice.name} value={choice.name}>
                          {choice.name} ({choice.widthMm} × {choice.heightMm} mm)
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {!previewPlan.fits ? <em>These cards are larger than this paper - pick a bigger paper.</em> : null}
                <span className="idcard-preview-hint">Drag any card on the sheet to place it where you want it printed.</span>
                {Object.keys(positionOverrides).length ? (
                  <button type="button" className="idcard-reset-positions" onClick={() => setPositionOverrides({})}>
                    <RotateCcw size={14} /> Reset positions
                  </button>
                ) : null}
              </div>
              {!previewEntries.length ? (
                <p className="idcard-preview-loading">Preparing preview…</p>
              ) : (
                <div className="idcard-preview-pages">
                  {previewPlan.pages.map((placed, pageIndex) => (
                    <figure key={pageIndex}>
                      <div className="idcard-preview-page" style={{ aspectRatio: `${paper.widthMm} / ${paper.heightMm}`, filter: colorMode === "bw" ? "grayscale(1)" : undefined }}>
                        {placed.map((card, cardIndex) => (
                          <div
                            className="idcard-preview-card"
                            key={card.key}
                            title="Drag to move this card"
                            onPointerDown={(event) => startCardDrag(event, card.key, card.xMm, card.yMm)}
                            style={{
                              left: `${(card.xMm / paper.widthMm) * 100}%`,
                              top: `${(card.yMm / paper.heightMm) * 100}%`,
                              width: `${(previewPlan.cardWMm / paper.widthMm) * 100}%`,
                              height: `${(previewPlan.cardHMm / paper.heightMm) * 100}%`,
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={card.url} alt="" />
                          </div>
                        ))}
                        {dragGuides && dragGuides.page === pageIndex ? (
                          <>
                            {dragGuides.x.map((value) => (
                              <span key={`gx-${value}`} className="idcard-guide idcard-guide-v" style={{ left: `${(value / paper.widthMm) * 100}%` }} />
                            ))}
                            {dragGuides.y.map((value) => (
                              <span key={`gy-${value}`} className="idcard-guide idcard-guide-h" style={{ top: `${(value / paper.heightMm) * 100}%` }} />
                            ))}
                          </>
                        ) : null}
                      </div>
                      <figcaption>
                        Page {pageIndex + 1} of {previewPlan.pages.length} - {paper.name}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}

          {collectCropPhotos ? (
            <p className="customer-inline-help">
              To improve the automatic card detection, the photo you upload and its cropped result may be kept for training. Do not upload a card you do not want kept.
            </p>
          ) : null}
          {error ? <div className="profile-alert error">{error}</div> : null}
        </article>
      </div>

      {cropTarget && cropState?.url && cropImageUrl ? (
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
                <div className="idcrop-rotate" role="group" aria-label="Rotate photo">
                  <span className="idcrop-rotate-label">Rotate photo</span>
                  <button type="button" onClick={() => void rotateCropSource(-1)} title="Turn the photo a quarter turn to the left">
                    <RotateCcw size={16} /> Left
                  </button>
                  <button type="button" onClick={() => void rotateCropSource(1)} title="Turn the photo a quarter turn to the right">
                    <RotateCw size={16} /> Right
                  </button>
                </div>
                <p>
                  {cropMode === "straight"
                    ? "Drag a corner or edge to resize the crop area. Drag inside the box to move it."
                    : "Tip: move each corner onto the card's real corner - this also straightens a card photographed at an angle. Clicking on an edge moves its nearest corner there."}
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
          <div className="crop-window idfilter-window">
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
                  <TonedImage url={filterState.filterBase?.url ?? filterState.url} tone={filterTone} alt="Preview with adjustments" />
                </span>
                {bothSelected ? (
                  <span className="idcard-filter-preview-img" style={{ filter: `saturate(${filterValues.saturation}%)` }}>
                    <TonedImage url={otherSideState.filterBase?.url ?? otherSideState.url} tone={filterTone} alt="Preview with adjustments (other side)" />
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
