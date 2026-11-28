"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck, CircleAlert, CircleCheck, Crop, LoaderCircle, Pencil, CaseSensitive, ChevronLeft, ChevronRight, Download, Eye, ImagePlus, Loader2, Minus, Paintbrush, Plus, Printer, RefreshCw, RotateCw, Trash2, Upload, Wallet, X } from "lucide-react";
import { DashboardShell } from "../DashboardShell";
import TutorialVideo from "../TutorialVideo";
import { CropEditor, cropImage, loadImage, type CropRect } from "../CropEditor";
import { PrintProfileSelect, useAgentPrint } from "../PrintProfileSelect";
import { canvasesToPdfBytes } from "@/lib/agent-print";
import { apiFetch, apiUrl, dataUriToBlob, hasStoredSession } from "@/lib/api";
import { useToolPrice } from "@/lib/useToolPrice";
import { stashPhotoForEditor, takePendingPrintSheetPhoto, type EditorHandoffTool } from "@/lib/printSheetHandoff";
import { trackToolEvent } from "@/lib/analytics";
import { clearSavedPhotos, deleteSavedPhoto, loadSavedPhotos, putSavedPhoto } from "@/lib/savedPrintSheetPhotos";

async function chargePhotoPrintSheet() {
  const response = await apiFetch("/api/tools/photo-print-sheet-charge/", { method: "POST" });
  if (response.ok) return;
  const data = await response.json().catch(() => ({}));
  throw new Error(data.message || "Could not verify your wallet balance. Please try again.");
}
import {
  DEFAULT_GAP_MM,
  DEFAULT_MARGIN_MM,
  PAPER_SIZES,
  PHOTO_SIZE_PRESETS,
  downloadCanvas,
  MARK_DASH_MM,
  MARK_WIDTH_MM,
  cutMarkSegments,
  openPrintWindow,
  orientPaper,
  packQueue,
  renderPageCanvas,
  renderSingleTileCanvas,
  resolvePaperDims,
  rotateImageFile,
  type MarginGapMm,
  exportPxPerMm,
  type ExportQuality,
  type PaperOrientation,
  type PaperSize,
  type QueuePhoto,
  type TileBorder,
} from "./printLayout";

const MAX_COUNT = 200;
const DEFAULT_COUNT = 6;
const CM_PER_INCH = 2.54;

const PAPER_SIZE_ORDER: PaperSize[] = ["a4", "4x6", "5x7", "6x8", "8x10", "3.5x5", "a3", "a5", "a6", "letter", "custom"];

function sheetTurnsOf(photo: QueuePhoto) {
  return (((photo.sheetTurns ?? 0) % 4) + 4) % 4;
}

// The sheet shows a turned copy of this photo that has not been built yet.
function sheetCopyPending(photo: QueuePhoto) {
  const turns = sheetTurnsOf(photo);
  return turns !== 0 && photo.printKey !== `${photo.url}|${turns}`;
}

function revokePhotoUrls(photo: QueuePhoto) {
  URL.revokeObjectURL(photo.url);
  if (photo.printUrl) URL.revokeObjectURL(photo.printUrl);
}

type CropJob = { id: string; file: File; url: string };
type CropPhase = "detecting" | "found" | "notfound";

// Largest centred crop of the given width/height ratio - the starting frame when no face is found.
function centeredCropRect(imgW: number, imgH: number, ratio: number): CropRect {
  const widthPx = imgW / imgH > ratio ? imgH * ratio : imgW;
  const heightPx = widthPx / ratio;
  return { x: ((imgW - widthPx) / 2 / imgW) * 100, y: ((imgH - heightPx) / 2 / imgH) * 100, width: (widthPx / imgW) * 100, height: (heightPx / imgH) * 100 };
}

// A passport-style frame around a detected face (face box in percent of the image).
// The detector's box runs roughly brow-to-chin, so the frame is ~1.75x its height with
// the face a little above centre, leaving room for hair on top and shoulders below.
function faceCropRect(face: CropRect, imgW: number, imgH: number, ratio: number): CropRect {
  const faceH = (face.height / 100) * imgH;
  const centerX = ((face.x + face.width / 2) / 100) * imgW;
  const centerY = ((face.y + face.height / 2) / 100) * imgH;
  let heightPx = faceH * 1.75;
  let widthPx = heightPx * ratio;
  const fit = Math.min(1, imgW / widthPx, imgH / heightPx);
  widthPx *= fit;
  heightPx *= fit;
  const left = Math.min(Math.max(centerX - widthPx / 2, 0), imgW - widthPx);
  const top = Math.min(Math.max(centerY - heightPx * 0.46, 0), imgH - heightPx);
  return { x: (left / imgW) * 100, y: (top / imgH) * 100, width: (widthPx / imgW) * 100, height: (heightPx / imgH) * 100 };
}

// Asks the server's face detector for the biggest face (percent box), or null. The photo is
// shrunk first so a 10MB phone photo isn't uploaded just to find a face.
async function detectLargestFace(image: HTMLImageElement): Promise<CropRect | null> {
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) return null;
  const body = new FormData();
  body.append("image", blob, "photo.jpg");
  body.append("sensitivity", "recommended");
  const response = await fetch(apiUrl("/api/tools/detect-faces/"), { method: "POST", body });
  if (!response.ok) return null;
  const data = await response.json().catch(() => ({}));
  const faces: CropRect[] = Array.isArray(data.faces) ? data.faces : [];
  return faces.length ? faces.reduce((best, face) => (face.width * face.height > best.width * best.height ? face : best)) : null;
}

// seo: server-rendered guide from page.tsx, shown below the tool.
export default function PhotoPrintSheetClient({ seo }: { seo?: React.ReactNode }) {
  const router = useRouter();
  const price = useToolPrice("photo_print_sheet");
  const [chargeConfirm, setChargeConfirm] = useState<{ resolve: (ok: boolean) => void } | null>(null);

  // The sheet maker needs no login at all - a customer sent here from their order
  // (or anyone else) can print or download straight away. Only a signed-in shop
  // owner is charged from their wallet, as before; a visitor without an account
  // is never charged and never asked to log in.
  function isSignedIn() {
    return hasStoredSession();
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

  const [photos, setPhotos] = useState<QueuePhoto[]>([]);
  // Uploaded photos wait here and are cropped one at a time (face detected -> passport frame) before joining the queue.
  const [cropJobs, setCropJobs] = useState<CropJob[]>([]);
  const [cropRect, setCropRect] = useState<CropRect>({ x: 10, y: 10, width: 80, height: 80 });
  const [autoCropRect, setAutoCropRect] = useState<CropRect | null>(null);
  const [cropPhase, setCropPhase] = useState<CropPhase>("detecting");
  const [cropBusy, setCropBusy] = useState(false);
  const currentCrop = cropJobs[0] ?? null;
  const [paperSize, setPaperSize] = useState<PaperSize>("a4");
  // null = the paper as it is (portrait for the standard sizes, whatever was typed for Custom).
  const [orientation, setOrientation] = useState<PaperOrientation | null>(null);
  const [customWidthCm, setCustomWidthCm] = useState<number | null>(null);
  const [customHeightCm, setCustomHeightCm] = useState<number | null>(null);
  const [gaps, setGaps] = useState<MarginGapMm>({ gapX: DEFAULT_GAP_MM, gapY: DEFAULT_GAP_MM, marginTop: DEFAULT_MARGIN_MM, marginLeft: DEFAULT_MARGIN_MM });
  const [pendingGaps, setPendingGaps] = useState<MarginGapMm>(gaps);
  const [liveView, setLiveView] = useState(true);
  const [sizeEditorId, setSizeEditorId] = useState<string | null>(null);
  // Sizes are always stored in cm; the unit only changes how they are shown and typed.
  const [sizeUnit, setSizeUnit] = useState<"cm" | "in">("cm");
  const fromCm = (cm: number) => (sizeUnit === "in" ? Number((cm / CM_PER_INCH).toFixed(2)) : cm);
  const toCm = (value: number) => (sizeUnit === "in" ? value * CM_PER_INCH : value);
  const sizeLabel = (photo: QueuePhoto) =>
    sizeUnit === "in"
      ? `${(photo.widthCm / CM_PER_INCH).toFixed(2)} × ${(photo.heightCm / CM_PER_INCH).toFixed(2)} in`
      : `${photo.widthCm.toFixed(1)} × ${photo.heightCm.toFixed(1)} cm`;
  const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [printBusy, setPrintBusy] = useState(false);
  const agentPrint = useAgentPrint("photo-print-sheet");
  const [error, setError] = useState("");
  const [printTick, setPrintTick] = useState(0);
  // Photos the user pressed Save on - kept in this browser (IndexedDB) and
  // put back in the queue on every visit, before any newly arrived photo.
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const photosRef = useRef(photos);
  photosRef.current = photos;
  const rotatingPrintRef = useRef<Set<string>>(new Set());

  // The sheet shows each photo turned by its own sheetTurns (Rotate button; family
  // photos start at one turn). Build that turned copy whenever the photo or its
  // turns change - the queue thumbnail keeps showing the photo as it is.
  useEffect(() => {
    photos.forEach((photo) => {
      const turns = sheetTurnsOf(photo);
      if (turns === 0) {
        if (photo.printUrl) {
          URL.revokeObjectURL(photo.printUrl);
          setPhotos((prev) => prev.map((item) => (item.id === photo.id && sheetTurnsOf(item) === 0 ? { ...item, printUrl: undefined, printKey: undefined } : item)));
        }
        return;
      }
      const key = `${photo.url}|${turns}`;
      if (photo.printKey === key || rotatingPrintRef.current.has(photo.id)) return;
      rotatingPrintRef.current.add(photo.id);
      (async () => {
        let url = photo.url;
        let file = photo.file;
        try {
          for (let step = 0; step < turns; step += 1) {
            const rotated = await rotateImageFile(url, file);
            if (url !== photo.url) URL.revokeObjectURL(url);
            url = rotated.url;
            file = rotated.file;
          }
          // Decide here, not inside the state updater (React may run that later
          // or twice) - and never revoke the url that is about to be shown.
          const current = photosRef.current.find((item) => item.id === photo.id);
          if (!current || current.url !== photo.url || sheetTurnsOf(current) !== turns) {
            URL.revokeObjectURL(url);
            return;
          }
          if (current.printUrl) URL.revokeObjectURL(current.printUrl);
          setPhotos((prev) => prev.map((item) => (item.id === photo.id && item.url === photo.url ? { ...item, printUrl: url, printKey: key } : item)));
        } catch {
          // Leave it as is; Rotate can be tried again.
          if (url !== photo.url) URL.revokeObjectURL(url);
        } finally {
          rotatingPrintRef.current.delete(photo.id);
          // The photo may have changed while this was running - look again.
          setPrintTick((tick) => tick + 1);
        }
      })();
    });
  }, [photos, printTick]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach(revokePhotoUrls);
    };
  }, []);

  // Runs once per page visit. React dev (StrictMode) runs mount effects twice,
  // which used to restore every saved photo twice under the SAME id - so
  // deleting one copy also deleted its saved record (and the other copy), and a
  // photo sent from Orders seemed to wipe the one before it.
  const initDoneRef = useRef(false);
  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;
    (async () => {
      const saved = await loadSavedPhotos();
      if (saved.length) {
        const restored = saved.map(
          (item): QueuePhoto => ({
            id: item.id,
            file: new File([item.file], item.name, { type: item.type || "image/jpeg" }),
            url: URL.createObjectURL(item.file),
            widthCm: item.widthCm,
            heightCm: item.heightCm,
            count: item.count,
            sizeKey: item.sizeKey,
            sheetTurns: item.sheetTurns ?? (item.rotateOnPrint ? 1 : 0),
          }),
        );
        // Never add a photo whose id is already in the queue.
        setPhotos((prev) => {
          const have = new Set(prev.map((photo) => photo.id));
          return [...restored.filter((photo) => !have.has(photo.id)), ...prev];
        });
        setSavedIds((prev) => {
          const next = new Set(prev);
          restored.forEach((photo) => next.add(photo.id));
          return next;
        });
      }
      const pending = takePendingPrintSheetPhoto();
      if (!pending) return;
      try {
        const blob = pending.url.startsWith("data:") ? dataUriToBlob(pending.url) : await fetch(apiUrl(pending.url)).then((res) => res.blob());
        addFiles([new File([blob], pending.name, { type: blob.type || "image/jpeg" })], { sheetTurns: pending.rotateOnPrint ? 1 : 0, count: pending.count });
      } catch {
        setError("Could not load the generated photo into the queue. Please upload it manually.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps each saved photo's stored copy in step with its size, quantity and
  // rotation (debounced - the quantity buttons fire quickly).
  useEffect(() => {
    if (!savedIds.size) return;
    const timer = window.setTimeout(() => {
      photos.filter((photo) => savedIds.has(photo.id)).forEach((photo) => void putSavedPhoto(toSavedRecord(photo)));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [photos, savedIds]);

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const pasted = item.getAsFile();
          if (pasted) queueForCrop([pasted]);
          break;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeGaps = liveView ? gaps : pendingGaps;
  const isCustomPaperReady = paperSize !== "custom" || !!(customWidthCm && customWidthCm > 0 && customHeightCm && customHeightCm > 0);
  const basePaper = useMemo(() => resolvePaperDims(paperSize, customWidthCm, customHeightCm), [paperSize, customWidthCm, customHeightCm]);
  const paperMeta = useMemo(() => (orientation ? orientPaper(basePaper, orientation) : basePaper), [basePaper, orientation]);
  const currentOrientation: PaperOrientation = paperMeta.widthMm > paperMeta.heightMm ? "landscape" : "portrait";
  const { pages, skipped } = useMemo(
    () => (isCustomPaperReady ? packQueue(photos, paperMeta, gaps) : { pages: [[]], skipped: 0 }),
    [photos, paperMeta, gaps, isCustomPaperReady],
  );
  // Cut marks are on by default; the choice is remembered on this device.
  const [cutMarks, setCutMarks] = useState(true);
  useEffect(() => {
    try {
      if (localStorage.getItem("pps:cutMarks") === "0") setCutMarks(false);
    } catch {
      // Storage unavailable - keep the default.
    }
  }, []);
  function toggleCutMarks(next: boolean) {
    setCutMarks(next);
    try {
      localStorage.setItem("pps:cutMarks", next ? "1" : "0");
    } catch {
      // Not remembered - the choice still applies to this sheet.
    }
  }
  // Optional frame around every photo (off by default); colour, width and on/off are remembered on this device.
  const [borderOn, setBorderOn] = useState(false);
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidthMm, setBorderWidthMm] = useState(0.4);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pps:border") || "null");
      if (saved && typeof saved === "object") {
        if (typeof saved.on === "boolean") setBorderOn(saved.on);
        if (typeof saved.color === "string" && /^#[0-9a-fA-F]{6}$/.test(saved.color)) setBorderColor(saved.color);
        if (typeof saved.widthMm === "number" && saved.widthMm > 0 && saved.widthMm <= 5) setBorderWidthMm(saved.widthMm);
      }
    } catch {
      // Storage unavailable or unreadable - keep the defaults.
    }
  }, []);
  function updateBorder(next: { on?: boolean; color?: string; widthMm?: number }) {
    const merged = { on: next.on ?? borderOn, color: next.color ?? borderColor, widthMm: next.widthMm ?? borderWidthMm };
    setBorderOn(merged.on);
    setBorderColor(merged.color);
    setBorderWidthMm(merged.widthMm);
    try {
      localStorage.setItem("pps:border", JSON.stringify(merged));
    } catch {
      // Not remembered - the choice still applies to this sheet.
    }
  }
  const tileBorder: TileBorder | null = borderOn ? { color: borderColor, widthMm: borderWidthMm } : null;

  // Export resolution for Download HD and Print: 4K (long side 3840px) or standard 300 DPI; remembered on this device.
  const [exportQuality, setExportQuality] = useState<ExportQuality>("standard");
  useEffect(() => {
    try {
      if (localStorage.getItem("pps:quality") === "uhd") setExportQuality("uhd");
    } catch {
      // Storage unavailable - keep the default.
    }
  }, []);
  function chooseExportQuality(next: ExportQuality) {
    setExportQuality(next);
    try {
      localStorage.setItem("pps:quality", next);
    } catch {
      // Not remembered - the choice still applies to this sheet.
    }
  }

  // Sheets the whole queue needs on the paper turned each way, so the shop can see which fits more.
  const orientationSheets = useMemo(() => {
    if (!isCustomPaperReady || !photos.length) return null;
    const sheetsFor = (turned: PaperOrientation) => packQueue(photos, orientPaper(basePaper, turned), gaps).pages.length;
    return { portrait: sheetsFor("portrait"), landscape: sheetsFor("landscape") };
  }, [photos, basePaper, gaps, isCustomPaperReady]);

  const previewMarks = useMemo(() => (cutMarks ? cutMarkSegments(paperMeta, pages[activePage] || []) : []), [cutMarks, paperMeta, pages, activePage]);
  const totalTiles = pages.reduce((sum, page) => sum + page.length, 0);

  useEffect(() => {
    setActivePage((current) => Math.min(current, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  function addFiles(fileList: FileList | File[], options?: { sheetTurns?: number; count?: number }) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    // New photos default to the Custom size with 6 copies, and the size
    // editor opens so all the config is visible straight away.
    const preset = PHOTO_SIZE_PRESETS.find((item) => item.key === "custom") || PHOTO_SIZE_PRESETS[0];
    const added = files.map(
      (file): QueuePhoto => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        widthCm: preset.widthCm,
        heightCm: preset.heightCm,
        count: Math.min(MAX_COUNT, options?.count ?? DEFAULT_COUNT),
        sizeKey: preset.key,
        sheetTurns: options?.sheetTurns,
      }),
    );
    setPhotos((prev) => [...prev, ...added]);
    setSizeEditorId(added[0].id);
    setError("");
  }

  // Photos the user uploads (choose, drag-drop, paste) go through the crop popup first.
  // Photos handed over from other tools were already cropped there, so they use addFiles directly.
  function queueForCrop(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    setCropJobs((prev) => [...prev, ...files.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }))]);
  }

  // Detect the face for whichever photo is at the front of the crop queue.
  useEffect(() => {
    if (!currentCrop) return;
    let cancelled = false;
    const tile = PHOTO_SIZE_PRESETS.find((item) => item.key === "custom") || PHOTO_SIZE_PRESETS[0];
    const ratio = tile.widthCm / tile.heightCm;
    setCropPhase("detecting");
    setAutoCropRect(null);
    (async () => {
      let rect: CropRect | null = null;
      let found = false;
      try {
        const image = await loadImage(currentCrop.url);
        rect = centeredCropRect(image.naturalWidth, image.naturalHeight, ratio);
        const face = await detectLargestFace(image).catch(() => null);
        if (face) {
          rect = faceCropRect(face, image.naturalWidth, image.naturalHeight, ratio);
          found = true;
        }
      } catch {
        // unreadable image: keep the default frame, the user can still use the full photo
      }
      if (cancelled) return;
      if (rect) setCropRect(rect);
      setAutoCropRect(found ? rect : null);
      setCropPhase(found ? "found" : "notfound");
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCrop?.id]);

  // Adds the photo at the front of the crop queue to the sheet (cropped, or as uploaded) and moves on.
  async function finishCrop(useCrop: boolean) {
    const job = currentCrop;
    if (!job || cropBusy) return;
    setCropBusy(true);
    try {
      let file = job.file;
      if (useCrop) {
        const blob = await cropImage(job.url, cropRect, "image/jpeg");
        file = new File([blob], `${job.file.name.replace(/\.[^.]+$/, "")}.jpg`, { type: "image/jpeg" });
      }
      addFiles([file]);
    } catch {
      addFiles([job.file]);
    } finally {
      URL.revokeObjectURL(job.url);
      setCropJobs((prev) => prev.filter((item) => item.id !== job.id));
      setCropBusy(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (event.dataTransfer.files?.length) queueForCrop(event.dataTransfer.files);
  }

  function toSavedRecord(photo: QueuePhoto) {
    return {
      id: photo.id,
      file: photo.file as Blob,
      name: photo.file.name,
      type: photo.file.type,
      widthCm: photo.widthCm,
      heightCm: photo.heightCm,
      count: photo.count,
      sizeKey: photo.sizeKey,
      sheetTurns: photo.sheetTurns,
      savedAt: Date.now(),
    };
  }

  async function toggleSaved(photo: QueuePhoto) {
    if (savedIds.has(photo.id)) {
      await deleteSavedPhoto(photo.id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(photo.id);
        return next;
      });
      return;
    }
    if (!(await putSavedPhoto(toSavedRecord(photo)))) {
      setError("Could not save this photo in your browser. Please check that storage is allowed.");
      return;
    }
    setSavedIds((prev) => new Set(prev).add(photo.id));
  }

  function removePhoto(id: string) {
    void deleteSavedPhoto(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setPhotos((prev) => {
      const target = prev.find((photo) => photo.id === id);
      if (target) revokePhotoUrls(target);
      return prev.filter((photo) => photo.id !== id);
    });
    if (sizeEditorId === id) setSizeEditorId(null);
    if (previewPhotoId === id) setPreviewPhotoId(null);
  }

  function updateCount(id: string, next: number) {
    const clamped = Math.max(1, Math.min(MAX_COUNT, next));
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, count: clamped } : photo)));
  }

  function applyPreset(id: string, presetKey: string) {
    const preset = PHOTO_SIZE_PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, widthCm: preset.widthCm, heightCm: preset.heightCm, sizeKey: preset.key } : photo)));
  }

  function updateCustomSize(id: string, dimension: "widthCm" | "heightCm", value: number) {
    const clamped = Math.max(0.5, Math.min(30, value || 0.5));
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, [dimension]: clamped, sizeKey: "custom" } : photo)));
  }

  // Turns the photo 90deg clockwise on the SHEET only; the queue thumbnail stays as it is.
  function rotatePhoto(id: string) {
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, sheetTurns: (sheetTurnsOf(photo) + 1) % 4 } : photo)));
  }

  async function downloadSingleTile(photo: QueuePhoto) {
    try {
      const canvas = await renderSingleTileCanvas(photo.url, photo.widthCm, photo.heightCm);
      downloadCanvas(canvas, `${photo.file.name.replace(/\.[^.]+$/, "")}-${photo.widthCm}x${photo.heightCm}cm.png`);
    } catch {
      setError("Could not download this photo. Please try again.");
    }
  }

  // Hands this queue photo to the Photo Editor with the chosen tool open
  // (background colour, or name & DOB caption).
  async function editInPhotoEditor(photo: QueuePhoto, tool: EditorHandoffTool) {
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(photo.file);
      });
      if (!stashPhotoForEditor(dataUrl, photo.file.name, tool)) throw new Error("storage");
      router.push("/image-tools/photo-editor");
    } catch {
      setError("Could not open this photo in the editor. Please try again.");
    }
  }

  function clearQueue() {
    void clearSavedPhotos();
    setSavedIds(new Set());
    photos.forEach(revokePhotoUrls);
    setPhotos([]);
    setSizeEditorId(null);
    setPreviewPhotoId(null);
  }

  function resetGaps() {
    const defaults: MarginGapMm = { gapX: DEFAULT_GAP_MM, gapY: DEFAULT_GAP_MM, marginTop: DEFAULT_MARGIN_MM, marginLeft: DEFAULT_MARGIN_MM };
    setGaps(defaults);
    setPendingGaps(defaults);
  }

  function setGapValue(key: keyof MarginGapMm, value: number) {
    if (liveView) {
      setGaps((prev) => ({ ...prev, [key]: value }));
    } else {
      setPendingGaps((prev) => ({ ...prev, [key]: value }));
    }
  }

  function toggleLiveView() {
    setLiveView((current) => {
      const next = !current;
      if (next) setGaps(pendingGaps);
      else setPendingGaps(gaps);
      return next;
    });
  }

  async function downloadHD() {
    if (!totalTiles) {
      setError("Add at least one photo to the queue first.");
      return;
    }
    if (photos.some(sheetCopyPending)) {
      setError("Still preparing the rotated photo for the sheet - please try again in a moment.");
      return;
    }
    const charged = isSignedIn();
    if (charged && !(await requestChargeConfirm())) return;
    setIsExporting(true);
    setError("");
    try {
      if (charged) await chargePhotoPrintSheet();
      const imageCache = new Map<string, HTMLImageElement>();
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
        if (!pages[pageIndex].length) continue;
        const canvas = await renderPageCanvas(paperMeta, pages[pageIndex], imageCache, cutMarks, tileBorder, exportQuality);
        downloadCanvas(canvas, `print-sheet-${paperMeta.badge.toLowerCase()}-page-${pageIndex + 1}.png`);
        if (pageIndex < pages.length - 1) await new Promise((resolve) => setTimeout(resolve, 350));
      }
      trackToolEvent("photo_print_sheet", "download_hd", { total_tiles: totalTiles });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not generate the print sheet. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  async function printSheet() {
    if (!totalTiles) {
      setError("Add at least one photo to the queue first.");
      return;
    }
    if (photos.some(sheetCopyPending)) {
      setError("Still preparing the rotated photo for the sheet - please try again in a moment.");
      return;
    }
    if (printBusy) return;
    const charged = isSignedIn();
    if (charged && !(await requestChargeConfirm())) return;
    setPrintBusy(true);
    setError("");
    try {
      if (charged) await chargePhotoPrintSheet();
      // Sent to the PrintPilot agent with the chosen print profile, using
      // the same 300 DPI render as Download HD (browser print only when
      // that is picked or the agent is not running).
      await agentPrint.printPdf(
        async () => {
          const imageCache = new Map<string, HTMLImageElement>();
          const rendered = [];
          for (const tiles of pages) {
            if (!tiles.length) continue;
            rendered.push({ canvas: await renderPageCanvas(paperMeta, tiles, imageCache, cutMarks, tileBorder, exportQuality), widthMm: paperMeta.widthMm, heightMm: paperMeta.heightMm });
          }
          return canvasesToPdfBytes(rendered);
        },
        { fileName: `print-sheet-${paperMeta.badge.toLowerCase()}.pdf`, fallback: () => openPrintWindow(paperMeta, pages, cutMarks, tileBorder) },
      );
      trackToolEvent("photo_print_sheet", "print_sheet", { total_tiles: totalTiles });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not prepare the print job. Please try again.");
    } finally {
      setPrintBusy(false);
    }
  }

  const previewPhoto = photos.find((photo) => photo.id === previewPhotoId) || null;

  return (
    <DashboardShell activePath="/photo-print-sheet">
      <div className="dashboard pps-page">
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">PrintPilot Photo Print Sheet</span>
            <h2>Photo Print Sheet Maker</h2>
            <p>Upload passport-size photos, queue as many different ones as you need, and arrange them into one print-ready sheet.</p>
          </div>
          <div className="auto-print-hero-actions">
            <span className="status-pill">{totalTiles} tile{totalTiles === 1 ? "" : "s"} on {pages.length || 1} page{pages.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        <section className="passport-maker-grid">
          <article className="customer-panel">
            <div className="customer-panel-head">
              <span>Step 1</span>
              <h2>Print Queue</h2>
            </div>

            {photos.length ? (
              <div className="pps-queue-list">
                {photos.map((photo) => (
                  <div
                    className={`pps-queue-item${sizeEditorId === photo.id ? " editing" : ""}`}
                    key={photo.id}
                    // Clicking a photo's row (not one of its buttons/fields) opens the
                    // size editor for THAT photo - it used to stay on the last one added.
                    onClick={(event) => {
                      if ((event.target as HTMLElement).closest("button, input, select, textarea, a, label")) return;
                      setSizeEditorId(photo.id);
                    }}
                  >
                    <div className="pps-queue-thumb">
                      <img src={photo.url} alt="" />
                      <button type="button" className="pps-queue-thumb-preview" onClick={() => setPreviewPhotoId(photo.id)} aria-label="Preview original photo" title="Preview">
                        <Eye size={12} />
                      </button>
                    </div>
                    <div className="pps-queue-info">
                      <button
                        type="button"
                        className="pps-size-chip"
                        title="Edit this photo's size"
                        onClick={() => setSizeEditorId((current) => (current === photo.id ? null : photo.id))}
                      >
                        {sizeLabel(photo)} <Pencil size={11} aria-hidden />
                      </button>
                      <div className="pps-count-stepper">
                        <button type="button" onClick={() => updateCount(photo.id, photo.count - 1)} disabled={photo.count <= 1} aria-label="Decrease quantity">
                          <Minus size={14} />
                        </button>
                        <span>{photo.count}</span>
                        <button type="button" onClick={() => updateCount(photo.id, photo.count + 1)} disabled={photo.count >= MAX_COUNT} aria-label="Increase quantity">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="pps-queue-actions">
                        <button type="button" onClick={() => rotatePhoto(photo.id)} aria-label="Rotate this photo on the sheet" title="Rotate on the sheet (90°) - the queue photo stays as it is">
                          <RotateCw size={15} />
                        </button>
                        <button
                          type="button"
                          className={savedIds.has(photo.id) ? "saved" : ""}
                          onClick={() => void toggleSaved(photo)}
                          aria-label={savedIds.has(photo.id) ? "Remove from saved photos" : "Save this photo"}
                          title={savedIds.has(photo.id) ? "Saved - shows up again next time (click to unsave)" : "Save - keep this photo for next time"}
                        >
                          {savedIds.has(photo.id) ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                        </button>
                        <button type="button" onClick={() => downloadSingleTile(photo)} aria-label="Download this photo" title="Download">
                          <Download size={15} />
                        </button>
                        <button type="button" className="danger" onClick={() => removePhoto(photo.id)} aria-label="Remove photo" title="Remove">
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="pps-edit-actions">
                        <button type="button" onClick={() => void editInPhotoEditor(photo, "background")}>
                          <Paintbrush size={14} /> Background Color
                        </button>
                        <button type="button" onClick={() => void editInPhotoEditor(photo, "caption")}>
                          <CaseSensitive size={14} /> Name &amp; DOB
                        </button>
                      </div>

                      {sizeEditorId === photo.id ? (
                        <div className="pps-size-editor">
                          <div className="pps-size-presets">
                            {PHOTO_SIZE_PRESETS.map((preset) => (
                              <button
                                type="button"
                                key={preset.key}
                                className={photo.sizeKey === preset.key ? "active" : ""}
                                onClick={() => applyPreset(photo.id, preset.key)}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                          <div className="pps-size-presets pps-unit-toggle" role="group" aria-label="Size unit">
                            <button type="button" className={sizeUnit === "cm" ? "active" : ""} onClick={() => setSizeUnit("cm")}>
                              cm
                            </button>
                            <button type="button" className={sizeUnit === "in" ? "active" : ""} onClick={() => setSizeUnit("in")}>
                              inch
                            </button>
                          </div>
                          <div className="pps-size-custom">
                            <label>
                              <span>Width ({sizeUnit === "in" ? "inch" : "cm"})</span>
                              <input
                                type="number"
                                min={sizeUnit === "in" ? 0.2 : 0.5}
                                max={sizeUnit === "in" ? 11.8 : 30}
                                step={sizeUnit === "in" ? 0.01 : 0.1}
                                value={fromCm(photo.widthCm)}
                                onChange={(event) => updateCustomSize(photo.id, "widthCm", toCm(Number(event.target.value)))}
                              />
                            </label>
                            <label>
                              <span>Height ({sizeUnit === "in" ? "inch" : "cm"})</span>
                              <input
                                type="number"
                                min={sizeUnit === "in" ? 0.2 : 0.5}
                                max={sizeUnit === "in" ? 11.8 : 30}
                                step={sizeUnit === "in" ? 0.01 : 0.1}
                                value={fromCm(photo.heightCm)}
                                onChange={(event) => updateCustomSize(photo.id, "heightCm", toCm(Number(event.target.value)))}
                              />
                            </label>
                          </div>
                          <button type="button" className="pps-size-done" onClick={() => setSizeEditorId(null)}>
                            Done
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <label className={`customer-upload pps-add-upload${photos.length ? " pps-add-upload-compact" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              {photos.length ? <ImagePlus size={20} /> : <Upload size={24} />}
              <strong>{photos.length ? "Add More Photos" : "Upload Passport Photos"}</strong>
              <span>Drag &amp; drop, paste from clipboard, or choose JPG/PNG files. Select multiple at once.</span>
              <input accept=".jpg,.jpeg,.png" type="file" multiple onChange={(event) => {
                if (event.target.files) queueForCrop(event.target.files);
                event.target.value = "";
              }} />
            </label>

            {photos.length ? (
              <button type="button" className="pps-clear-queue" onClick={clearQueue}>
                <Trash2 size={14} /> Clear Queue
              </button>
            ) : null}

            {error ? <div className="profile-alert error">{error}</div> : null}

            <TutorialVideo youtubeId="M_jNabH4reE" heading="How to use the Photo Print Sheet Maker" title="Photo Print Sheet Maker tutorial" />
          </article>

          <article className="customer-panel">
            <div className="customer-panel-head pps-preview-head">
              <span>Print Preview</span>
              <button type="button" className={`pps-live-toggle${liveView ? " active" : ""}`} onClick={toggleLiveView}>
                {liveView ? "Live View" : "Preview Paused"}
              </button>
            </div>

            <div className="pps-preview-stage">
              {totalTiles ? (
                <div className="pps-paper" style={{ aspectRatio: `${paperMeta.widthMm} / ${paperMeta.heightMm}` }}>
                  {(pages[activePage] || []).map((tile, index) => (
                    <div
                      className="pps-tile"
                      key={`${tile.photoId}-${index}`}
                      style={{
                        left: `${(tile.xMm / paperMeta.widthMm) * 100}%`,
                        top: `${(tile.yMm / paperMeta.heightMm) * 100}%`,
                        width: `${(tile.wMm / paperMeta.widthMm) * 100}%`,
                        height: `${(tile.hMm / paperMeta.heightMm) * 100}%`,
                      }}
                    >
                      <img src={tile.url} alt="" />
                    </div>
                  ))}
                  {tileBorder ? (
                    <svg className="pps-marks" viewBox={`0 0 ${paperMeta.widthMm} ${paperMeta.heightMm}`} preserveAspectRatio="none" aria-hidden="true">
                      {(pages[activePage] || []).map((tile, index) => (
                        <rect
                          key={index}
                          x={tile.xMm + tileBorder.widthMm / 2}
                          y={tile.yMm + tileBorder.widthMm / 2}
                          width={Math.max(0, tile.wMm - tileBorder.widthMm)}
                          height={Math.max(0, tile.hMm - tileBorder.widthMm)}
                          fill="none"
                          stroke={tileBorder.color}
                          strokeWidth={tileBorder.widthMm}
                        />
                      ))}
                    </svg>
                  ) : null}
                  {previewMarks.length ? (
                    <svg className="pps-marks" viewBox={`0 0 ${paperMeta.widthMm} ${paperMeta.heightMm}`} preserveAspectRatio="none" aria-hidden="true">
                      {previewMarks.map((mark, index) => (
                        <line key={index} x1={mark.x1} y1={mark.y1} x2={mark.x2} y2={mark.y2} stroke="#222" strokeWidth={Math.max(MARK_WIDTH_MM, 0.3)} strokeDasharray={MARK_DASH_MM.join(" ")} />
                      ))}
                    </svg>
                  ) : null}
                </div>
              ) : (
                <div className="pps-paper pps-paper-empty" style={{ aspectRatio: `${paperMeta.widthMm} / ${paperMeta.heightMm}` }}>
                  <span>{isCustomPaperReady ? "Upload a photo to see the print layout" : "Enter a custom paper width & height to see the print layout"}</span>
                </div>
              )}
              <span className="pps-paper-badge">{paperMeta.badge}</span>
            </div>

            {pages.length > 1 ? (
              <div className="pps-page-nav">
                <button type="button" onClick={() => setActivePage((page) => Math.max(0, page - 1))} disabled={activePage === 0}>
                  <ChevronLeft size={15} />
                </button>
                <span>Page {activePage + 1} / {pages.length}</span>
                <button type="button" onClick={() => setActivePage((page) => Math.min(pages.length - 1, page + 1))} disabled={activePage === pages.length - 1}>
                  <ChevronRight size={15} />
                </button>
              </div>
            ) : null}

            {skipped > 0 ? (
              <div className="profile-alert warning">
                {skipped} tile{skipped === 1 ? "" : "s"} didn&apos;t fit on {paperMeta.label} and were left out - pick a smaller size or a bigger paper.
              </div>
            ) : null}

            <div className="pps-controls">
              <section className="pps-section">
                <h3 className="pps-section-title">Paper</h3>
                <div className="pps-controls-row">
                  <label className="pps-field">
                    <span>Paper Size</span>
                    <select value={paperSize} onChange={(event) => setPaperSize(event.target.value as PaperSize)}>
                      {PAPER_SIZE_ORDER.map((key) => (
                        <option key={key} value={key}>
                          {key === "custom" ? "Custom Size" : PAPER_SIZES[key].label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="pps-field">
                    <span>Orientation</span>
                    <div className="pps-orient" role="group" aria-label="Paper orientation">
                      {(["portrait", "landscape"] as const).map((turned) => (
                        <button
                          key={turned}
                          type="button"
                          className={currentOrientation === turned ? "active" : ""}
                          aria-pressed={currentOrientation === turned}
                          onClick={() => setOrientation(turned)}
                        >
                          {turned === "portrait" ? "Portrait" : "Landscape"}
                          {orientationSheets ? <small>{orientationSheets[turned]} sheet{orientationSheets[turned] === 1 ? "" : "s"}</small> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {paperSize === "custom" ? (
                  <div className="pps-custom-paper">
                    <span>Size (cm):</span>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      step="0.1"
                      placeholder="W (cm)"
                      value={customWidthCm ?? ""}
                      onChange={(event) => setCustomWidthCm(event.target.value ? Number(event.target.value) : null)}
                    />
                    <span className="pps-custom-paper-x">X</span>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      step="0.1"
                      placeholder="H (cm)"
                      value={customHeightCm ?? ""}
                      onChange={(event) => setCustomHeightCm(event.target.value ? Number(event.target.value) : null)}
                    />
                  </div>
                ) : null}
              </section>

              <section className="pps-section">
                <div className="pps-section-head">
                  <h3 className="pps-section-title">Margin &amp; Gap</h3>
                  <button type="button" className="pps-reset-default" onClick={resetGaps}>
                    <RefreshCw size={13} /> Reset Default
                  </button>
                </div>
                <div className="pps-gap-grid">
                  <label className="pps-slider">
                    <span>Gap X <b>{activeGaps.gapX}mm</b></span>
                    <input type="range" min={0} max={10} step={0.5} value={activeGaps.gapX} onChange={(event) => setGapValue("gapX", Number(event.target.value))} />
                  </label>
                  <label className="pps-slider">
                    <span>Gap Y <b>{activeGaps.gapY}mm</b></span>
                    <input type="range" min={0} max={10} step={0.5} value={activeGaps.gapY} onChange={(event) => setGapValue("gapY", Number(event.target.value))} />
                  </label>
                  <label className="pps-slider">
                    <span>Margin Top <b>{activeGaps.marginTop}mm</b></span>
                    <input type="range" min={0} max={20} step={0.5} value={activeGaps.marginTop} onChange={(event) => setGapValue("marginTop", Number(event.target.value))} />
                  </label>
                  <label className="pps-slider">
                    <span>Margin Left <b>{activeGaps.marginLeft}mm</b></span>
                    <input type="range" min={0} max={20} step={0.5} value={activeGaps.marginLeft} onChange={(event) => setGapValue("marginLeft", Number(event.target.value))} />
                  </label>
                </div>

                {!liveView ? (
                  <button type="button" className="pps-refresh-preview" onClick={() => setGaps(pendingGaps)}>
                    <RefreshCw size={14} /> Refresh Preview
                  </button>
                ) : null}
              </section>

              <section className="pps-section">
                <h3 className="pps-section-title">Cut Lines &amp; Border</h3>
                <label className="pps-cutmarks" title="A dashed line between the photos to cut along.">
                  <input type="checkbox" checked={cutMarks} onChange={(event) => toggleCutMarks(event.target.checked)} />
                  <span>Cut lines (dashed line between photos)</span>
                </label>

                <div className="pps-border-control">
                  <label className="pps-cutmarks" title="A coloured frame on the edge of every photo.">
                    <input type="checkbox" checked={borderOn} onChange={(event) => updateBorder({ on: event.target.checked })} />
                    <span>Border around each photo</span>
                  </label>
                  {borderOn ? (
                    <div className="pps-border-options">
                      <div className="pps-border-color-row">
                        <label className="pps-border-color">
                          <span>Color</span>
                          <input type="color" value={borderColor} onChange={(event) => updateBorder({ color: event.target.value })} aria-label="Border color" />
                        </label>
                        <div className="pps-border-swatches" role="group" aria-label="Quick border colors">
                          {["#000000", "#ffffff", "#2563eb", "#dc2626", "#16a34a", "#6b7280"].map((swatch) => (
                            <button
                              key={swatch}
                              type="button"
                              className={borderColor.toLowerCase() === swatch ? "active" : ""}
                              style={{ background: swatch }}
                              onClick={() => updateBorder({ color: swatch })}
                              aria-label={`Border color ${swatch}`}
                            />
                          ))}
                        </div>
                      </div>
                      <label className="pps-slider pps-border-width">
                        <span>Width <b>{borderWidthMm}mm</b></span>
                        <input type="range" min={0.1} max={3} step={0.1} value={borderWidthMm} onChange={(event) => updateBorder({ widthMm: Math.round(Number(event.target.value) * 10) / 10 })} />
                      </label>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="pps-section" role="group" aria-label="Export resolution">
                <h3 className="pps-section-title">Export Resolution</h3>
                <div className="pps-quality-options">
                  {([
                    { key: "uhd", title: "4K Ultra HD", note: "3840px long side" },
                    { key: "standard", title: "300 DPI", note: "Standard print" },
                  ] as const).map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={exportQuality === option.key ? "active" : ""}
                      aria-pressed={exportQuality === option.key}
                      onClick={() => chooseExportQuality(option.key)}
                    >
                      <strong>{option.title}</strong>
                      <small>{option.note}</small>
                    </button>
                  ))}
                </div>
                <small className="pps-quality-info">
                  {(() => {
                    const pxPerMm = exportPxPerMm(paperMeta, exportQuality);
                    return `This sheet: ${Math.round(paperMeta.widthMm * pxPerMm)} x ${Math.round(paperMeta.heightMm * pxPerMm)} px (about ${Math.round(pxPerMm * 25.4)} DPI)`;
                  })()}
                </small>
              </section>

              <PrintProfileSelect print={agentPrint} className="pps-print-profile" />
              <div className="pps-final-actions">
                <button type="button" className="pps-print-btn" disabled={!totalTiles || printBusy} onClick={() => void printSheet()}>
                  <Printer size={18} /> {printBusy ? (agentPrint.busy ? "Printing…" : "Preparing…") : "Print"}
                </button>
                <button type="button" className="passport-preview-button pps-download-hd" disabled={isExporting || !totalTiles} onClick={() => void downloadHD()}>
                  {isExporting ? <Loader2 size={18} className="passport-step-spin" /> : <Download size={18} />}
                  {isExporting ? "Rendering..." : "Download HD"}
                </button>
                <button type="button" className="icon-action-btn danger" disabled={!photos.length} onClick={clearQueue} aria-label="Clear queue" title="Clear queue">
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </article>
        </section>
      </div>

      {currentCrop ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Crop photo">
          <div className="crop-window idcrop-window">
            <div className="document-preview-head">
              <div>
                <strong>Crop Photo{cropJobs.length > 1 ? ` (1 of ${cropJobs.length})` : ""}</strong>
                <span>{currentCrop.file.name}</span>
              </div>
              <button type="button" onClick={() => void finishCrop(cropPhase === "found")} disabled={cropBusy} aria-label="Close crop">
                <X size={18} />
              </button>
            </div>
            <div className="crop-body idcrop-body">
              {cropPhase === "detecting" ? (
                <div className="idcrop-note">
                  <LoaderCircle size={20} className="spin" />
                  <div>
                    <strong>Finding the face...</strong>
                    <span>The crop frame will be placed on the face in passport-photo size.</span>
                  </div>
                </div>
              ) : cropPhase === "found" ? (
                <div className="idcrop-note ok">
                  <CircleCheck size={20} />
                  <div>
                    <strong>Face detected automatically</strong>
                    <span>
                      The crop frame was placed on the face for you in passport-photo size. If it looks right, press <b>Apply Crop</b> and the photo is added. If not, drag the frame or its corners first.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="idcrop-note warn">
                  <CircleAlert size={20} />
                  <div>
                    <strong>We could not find a face automatically</strong>
                    <span>Move and resize the frame by hand, then press Apply Crop - or use the full photo.</span>
                  </div>
                </div>
              )}
              <CropEditor fileUrl={currentCrop.url} rect={cropRect} onRectChange={setCropRect} />
              <div className="crop-controls">
                <p>Drag a corner or edge to resize the crop area. Drag inside the box to move it.</p>
                <button type="button" disabled={cropBusy} onClick={() => setCropRect(autoCropRect ?? { x: 10, y: 10, width: 80, height: 80 })}>
                  Reset Crop
                </button>
                <button type="button" disabled={cropBusy || cropPhase === "detecting"} onClick={() => void finishCrop(true)}>
                  <Crop size={17} /> {cropBusy ? "Adding..." : "Apply Crop"}
                </button>
                <button type="button" disabled={cropBusy} onClick={() => void finishCrop(false)}>
                  Use full photo
                </button>
                {cropPhase === "found" ? <small>Closing this window keeps the automatic crop.</small> : <small>Closing this window adds the full photo.</small>}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {previewPhoto ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Photo preview">
          <div className="document-preview-window">
            <div className="document-preview-head">
              <div>
                <strong>{previewPhoto.file.name}</strong>
                <span>{sizeLabel(previewPhoto)}</span>
              </div>
              <button type="button" onClick={() => setPreviewPhotoId(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="document-preview-body">
              <img src={previewPhoto.url} alt="" />
            </div>
          </div>
        </div>
      ) : null}

      {chargeConfirm ? (
        <div className="resbuild-confirm-overlay" onClick={() => answerChargeConfirm(false)}>
          <div className="resbuild-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <span className="resbuild-confirm-icon"><Wallet size={20} /></span>
            <h3>Confirm wallet charge</h3>
            <p>
              This will deduct <strong>₹{price}</strong> from your RepetiGo wallet for this print sheet.
            </p>
            <div className="resbuild-confirm-actions">
              <button type="button" className="resbuild-btn-secondary" onClick={() => answerChargeConfirm(false)}>Cancel</button>
              <button type="button" className="resbuild-btn-primary" onClick={() => answerChargeConfirm(true)}>OK, Continue</button>
            </div>
          </div>
        </div>
      ) : null}

      {seo}
    </DashboardShell>
  );
}
