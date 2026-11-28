"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import type React from "react";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crop,
  Download,
  LayoutGrid,
  Layers,
  LoaderCircle,
  Plus,
  Printer,
  Redo2,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Stamp,
  Trash2,
  Undo2,
  Upload,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { CropEditor, cropImage, DEFAULT_CROP_QUAD, DEFAULT_CROP_RECT, PerspectiveCropEditor, warpPerspectiveCrop, type CropQuad, type CropRect } from "../CropEditor";
import { PrintProfileSelect, useAgentPrint } from "../PrintProfileSelect";
import { scanDocument } from "../id-card-print/cardScan";
import { compressPdfByRaster } from "@/lib/pdfCompress";
import { isWatermarkTextSupported, normalizeTurn, sheetCount, type LayoutMode, type PageNumberFormat, type PageNumberPosition, type WatermarkColor } from "@/lib/pdfPlayground";
import {
  DEFAULT_LOOK,
  MAX_PAGE_COPIES,
  buildStudioPdf,
  canvasToBlob,
  expandPages,
  isImageFile,
  isPdfFile,
  loadPdfjs,
  openStudioPdf,
  parsePageList,
  renderStudioPage,
  type Look,
  type LookMode,
  type OutputSettings,
  type PageBase,
  type StudioFile,
  type StudioPage,
} from "@/lib/photoCopyStudio";

type Tool = "pages" | "crop" | "clean" | "layout" | "marks" | "compress";
type CompressLevel = "off" | "medium" | "strong";

const TOOLS: { key: Tool; label: string; icon: LucideIcon }[] = [
  { key: "pages", label: "Pages", icon: Layers },
  { key: "crop", label: "Crop", icon: Crop },
  { key: "clean", label: "Clean & Light", icon: SlidersHorizontal },
  { key: "layout", label: "Sheet Layout", icon: LayoutGrid },
  { key: "marks", label: "Watermark & Numbers", icon: Stamp },
  { key: "compress", label: "Smaller File", icon: Archive },
];

const LOOKS: { key: LookMode; label: string; note: string }[] = [
  { key: "original", label: "Original", note: "As scanned" },
  { key: "enhance", label: "Enhance", note: "Brighter, clearer" },
  { key: "gray", label: "Grayscale", note: "No colour" },
  { key: "bw", label: "Black & White", note: "Photocopy look" },
];

const LAYOUTS: { key: LayoutMode; label: string; note: string }[] = [
  { key: "single", label: "1 per sheet", note: "Pages as they are" },
  { key: "two-side", label: "2 per sheet", note: "Side by side (landscape A4)" },
  { key: "two-stack", label: "2 per sheet", note: "One above the other" },
  { key: "four", label: "4 per sheet", note: "2 x 2 on portrait A4" },
  { key: "id-card", label: "ID card size", note: "True 85.6 x 54 mm, front + back on one A4" },
];

const SWATCHES: { key: WatermarkColor; color: string }[] = [
  { key: "gray", color: "#737373" },
  { key: "red", color: "#d92626" },
  { key: "blue", color: "#2659d9" },
];

// ---------------------------------------------------------------- drawing helpers

const blobIds = new WeakMap<Blob, number>();
let nextBlobId = 1;

function baseKey(base: PageBase) {
  if (base.kind === "pdf") return `p${base.fileId}:${base.index}`;
  let id = blobIds.get(base.blob);
  if (!id) {
    id = nextBlobId++;
    blobIds.set(base.blob, id);
  }
  return `i${id}`;
}

function pageKey(page: StudioPage) {
  return `${baseKey(page.base)}|${page.rotate}|${page.look.mode}|${page.look.brightness}|${page.look.contrast}|${page.look.darkness}`;
}

// Page drawing runs one at a time so a long page list cannot freeze the screen.
let drawQueue: Promise<unknown> = Promise.resolve();
function enqueueDraw<T>(task: () => Promise<T>) {
  const run = drawQueue.then(task, task);
  drawQueue = run.catch(() => undefined);
  return run;
}

function PageCanvas({ page, files, maxSide, className }: { page: StudioPage; files: React.MutableRefObject<Map<number, StudioFile>>; maxSide: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const key = pageKey(page);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void enqueueDraw(async () => {
        if (cancelled) return;
        try {
          const canvas = await renderStudioPage(page, files.current, { maxSide, look: true });
          const target = ref.current;
          if (cancelled || !target) return;
          target.width = canvas.width;
          target.height = canvas.height;
          target.getContext("2d")?.drawImage(canvas, 0, 0);
        } catch {
          // The page stays blank; printing will report the real problem.
        }
      });
    }, 60);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // The key stands for everything about the page that changes how it looks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, maxSide]);

  return <canvas ref={ref} className={className} />;
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// ---------------------------------------------------------------- the studio

export default function PhotoCopyStudio() {
  const agentPrint = useAgentPrint("print-desk", true);
  const filesRef = useRef(new Map<number, StudioFile>());
  const nextId = useRef(1);

  // Page list with undo / redo. Kept in a ref so async work (importing, cropping) always edits the latest list.
  const histRef = useRef<{ stack: StudioPage[][]; i: number }>({ stack: [[]], i: 0 });
  const lastKey = useRef<string | null>(null);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const pages = histRef.current.stack[histRef.current.i];

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [tool, setTool] = useState<Tool>("pages");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [applyAll, setApplyAll] = useState(false);
  const [keepInput, setKeepInput] = useState("");
  const [copies, setCopies] = useState(1);

  // crop
  const [cropUrl, setCropUrl] = useState("");
  const [cropRect, setCropRect] = useState<CropRect>(DEFAULT_CROP_RECT);
  const [cropQuad, setCropQuad] = useState<CropQuad>(DEFAULT_CROP_QUAD);
  const [cropMode, setCropMode] = useState<"straight" | "perspective">("perspective");

  // output
  const [layout, setLayout] = useState<LayoutMode>("single");
  const [cellBorder, setCellBorder] = useState(false);
  const [wmText, setWmText] = useState("");
  const [wmOpacity, setWmOpacity] = useState(0.25);
  const [wmColor, setWmColor] = useState<WatermarkColor>("gray");
  const [pnOn, setPnOn] = useState(false);
  const [pnPosition, setPnPosition] = useState<PageNumberPosition>("bottom-center");
  const [pnFormat, setPnFormat] = useState<PageNumberFormat>("n");
  const [pnStart, setPnStart] = useState(1);
  const [compress, setCompress] = useState<CompressLevel>("off");

  // sheet preview
  const sheetDocRef = useRef<{ destroy: () => unknown; numPages: number; getPage: (n: number) => Promise<unknown> } | null>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sheetStatus, setSheetStatus] = useState<"idle" | "building" | "ready" | "error">("idle");
  const [sheetError, setSheetError] = useState("");
  const [sheetTotal, setSheetTotal] = useState(0);
  const [sheetNo, setSheetNo] = useState(1);
  const [sheetVersion, setSheetVersion] = useState(0);

  const selected = pages.find((page) => page.id === selectedId) ?? pages[0] ?? null;
  const selectedIndex = selected ? pages.indexOf(selected) : -1;
  const wmTextOk = isWatermarkTextSupported(wmText);
  const output = useMemo<OutputSettings>(
    () => ({
      layout,
      cellBorder,
      watermark: wmText.trim() && wmTextOk ? { text: wmText.trim(), opacity: wmOpacity, color: wmColor } : null,
      pageNumbers: pnOn ? { position: pnPosition, format: pnFormat, startAt: Math.max(1, Math.floor(pnStart) || 1) } : null,
    }),
    [layout, cellBorder, wmText, wmTextOk, wmOpacity, wmColor, pnOn, pnPosition, pnFormat, pnStart],
  );
  const showSheet = tool === "layout" || tool === "marks" || tool === "compress";

  // ------------------------------------------------------------ page list + history

  function commit(update: (current: StudioPage[]) => StudioPage[], key?: string) {
    const h = histRef.current;
    const current = h.stack[h.i];
    const next = update(current);
    if (next === current) return;
    if (key && lastKey.current === key) {
      h.stack[h.i] = next;
    } else {
      lastKey.current = key ?? null;
      const stack = [...h.stack.slice(0, h.i + 1), next].slice(-40);
      h.stack = stack;
      h.i = stack.length - 1;
    }
    rerender();
  }

  function undo() {
    const h = histRef.current;
    if (h.i === 0) return;
    h.i -= 1;
    lastKey.current = null;
    rerender();
  }

  function redo() {
    const h = histRef.current;
    if (h.i >= h.stack.length - 1) return;
    h.i += 1;
    lastKey.current = null;
    rerender();
  }

  function newPage(base: PageBase, from?: StudioPage): StudioPage {
    return { id: nextId.current++, base, original: from?.original ?? base, rotate: from?.rotate ?? 0, look: from ? { ...from.look } : { ...DEFAULT_LOOK }, copies: from?.copies ?? 1 };
  }

  // The pages an edit applies to: the chosen one, or all of them.
  function targets(current: StudioPage[]) {
    return new Set(applyAll ? current.map((page) => page.id) : selected ? [selected.id] : []);
  }

  // ------------------------------------------------------------ importing

  async function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list).filter((file) => isPdfFile(file) || isImageFile(file));
    if (!incoming.length) {
      setNotice({ ok: false, text: "Choose PDF, JPG, PNG or WebP files." });
      return;
    }
    setNotice(null);
    setBusy("Reading your files...");
    const added: StudioPage[] = [];
    const problems: string[] = [];
    for (const file of incoming) {
      try {
        if (isPdfFile(file)) {
          const id = nextId.current++;
          const { studioFile, pageCount } = await openStudioPdf(file, id);
          filesRef.current.set(id, studioFile);
          for (let index = 0; index < pageCount; index += 1) added.push(newPage({ kind: "pdf", fileId: id, index }));
        } else {
          added.push(newPage({ kind: "image", blob: file }));
        }
      } catch (error) {
        problems.push(error instanceof Error ? error.message : `${file.name} could not be read.`);
      }
    }
    if (added.length) {
      commit((current) => [...current, ...added]);
      setSelectedId((current) => current ?? added[0].id);
    }
    setBusy("");
    if (problems.length) setNotice({ ok: false, text: problems.join(" ") });
    else if (added.length) setNotice({ ok: true, text: `Added ${added.length} page${added.length === 1 ? "" : "s"}.` });
  }

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const files = Array.from(event.clipboardData?.files ?? []).filter(isImageFile);
      if (files.length) void addFiles(files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      filesRef.current.forEach((file) => file.destroy());
      void sheetDocRef.current?.destroy();
    },
    [],
  );

  // ------------------------------------------------------------ page actions

  function rotate(by: number) {
    commit((current) => {
      const ids = targets(current);
      return current.map((page) => (ids.has(page.id) ? { ...page, rotate: normalizeTurn(page.rotate + by) } : page));
    });
  }

  function move(by: -1 | 1) {
    if (!selected) return;
    commit((current) => {
      const index = current.findIndex((page) => page.id === selected.id);
      const target = index + by;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = current.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function duplicate() {
    if (!selected) return;
    const copy = newPage(selected.base, selected);
    commit((current) => {
      const index = current.findIndex((page) => page.id === selected.id);
      const next = current.slice();
      next.splice(index + 1, 0, copy);
      return next;
    });
    setSelectedId(copy.id);
  }

  function removeSelected() {
    if (!selected) return;
    const neighbour = pages[selectedIndex + 1] ?? pages[selectedIndex - 1] ?? null;
    commit((current) => current.filter((page) => page.id !== selected.id));
    setSelectedId(neighbour?.id ?? null);
  }

  function reverse() {
    commit((current) => current.slice().reverse());
  }

  function keepOnly() {
    const picked = parsePageList(keepInput, pages.length);
    if (!picked) {
      setNotice({ ok: false, text: `Type page numbers like 1,3,5-7 (1 to ${pages.length}).` });
      return;
    }
    const next = picked.map((index) => newPage(pages[index].base, pages[index]));
    commit(() => next);
    setSelectedId(next[0].id);
    setKeepInput("");
    setNotice({ ok: true, text: `Kept ${next.length} page${next.length === 1 ? "" : "s"}.` });
  }

  function resetPage() {
    commit((current) => {
      const ids = targets(current);
      return current.map((page) => (ids.has(page.id) ? { ...page, base: page.original, rotate: 0, look: { ...DEFAULT_LOOK }, copies: 1 } : page));
    });
  }

  // How many times each chosen page goes into the printout (1 = once).
  function setCopiesOf(count: number) {
    const value = Math.min(MAX_PAGE_COPIES, Math.max(1, Math.floor(count) || 1));
    commit((current) => {
      const ids = targets(current);
      return current.map((page) => (ids.has(page.id) && page.copies !== value ? { ...page, copies: value } : page));
    }, `copies:${applyAll ? "all" : selected?.id}`);
  }

  function clearAll() {
    commit(() => []);
    setSelectedId(null);
    setNotice(null);
  }

  // ------------------------------------------------------------ look

  function setLook(patch: Partial<Look>, key: string) {
    commit((current) => {
      const ids = targets(current);
      return current.map((page) => (ids.has(page.id) ? { ...page, look: { ...page.look, ...patch } } : page));
    }, `look:${applyAll ? "all" : selected?.id}:${key}`);
  }

  async function autoClean(mode: "photocopy" | "clean") {
    if (!selected || busy) return;
    const page = selected;
    setBusy("Cleaning the page (the first time the scan engine has to load)...");
    setNotice(null);
    try {
      const canvas = await renderStudioPage({ ...page, look: { ...DEFAULT_LOOK } }, filesRef.current, { maxSide: 2400, look: false });
      const result = await scanDocument(await canvasToBlob(canvas, "image/jpeg", 0.95), mode, null, 25);
      if (!result.found) throw new Error("The page could not be cleaned.");
      commit((current) => current.map((item) => (item.id === page.id ? { ...item, base: { kind: "image", blob: result.blob }, rotate: 0, look: { ...DEFAULT_LOOK } } : item)));
      setNotice({ ok: true, text: "Page cleaned. Use Reset page to get the original back." });
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Could not clean the page." });
    } finally {
      setBusy("");
    }
  }

  // ------------------------------------------------------------ scrolling changes the page

  const stageRef = useRef<HTMLElement>(null);
  const stripRef = useRef<HTMLElement>(null);
  const ignoreStripScrollUntil = useRef(0);
  // Latest values for the wheel listener, which is attached once.
  const navRef = useRef({ tool, ids: [] as number[], index: -1, sheetNo: 1, sheetTotal: 0 });
  navRef.current = { tool, ids: pages.map((page) => page.id), index: selectedIndex, sheetNo, sheetTotal };

  // Mouse wheel / trackpad over the preview moves to the next or previous page (or sheet). At the first or
  // last page the wheel scrolls the screen as usual, so the guide below stays reachable.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let acc = 0;
    let coolUntil = 0;
    function onWheel(event: WheelEvent) {
      const nav = navRef.current;
      if (nav.tool === "crop" || !nav.ids.length) return;
      const onSheets = nav.tool === "layout" || nav.tool === "marks" || nav.tool === "compress";
      const position = onSheets ? nav.sheetNo - 1 : nav.index;
      const last = onSheets ? nav.sheetTotal - 1 : nav.ids.length - 1;
      const step = event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0;
      if (!step || position + step < 0 || position + step > last) {
        acc = 0;
        return;
      }
      event.preventDefault();
      const now = Date.now();
      if (now < coolUntil) return;
      acc += event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      if (Math.abs(acc) < 50) return;
      acc = 0;
      coolUntil = now + 300;
      if (onSheets) setSheetNo(position + step + 1);
      else setSelectedId(nav.ids[position + step]);
    }
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  // Scrolling the page strip moves to the page at its top (or the last page once it hits the bottom).
  function onStripScroll() {
    const strip = stripRef.current;
    if (!strip || Date.now() < ignoreStripScrollUntil.current) return;
    const thumbs = Array.from(strip.querySelectorAll<HTMLElement>("[data-page-id]"));
    if (!thumbs.length) return;
    const vertical = strip.scrollHeight > strip.clientHeight + 2;
    const position = vertical ? strip.scrollTop : strip.scrollLeft;
    const size = vertical ? strip.clientHeight : strip.clientWidth;
    const total = vertical ? strip.scrollHeight : strip.scrollWidth;
    const box = strip.getBoundingClientRect();
    const target =
      position + size >= total - 4
        ? thumbs[thumbs.length - 1]
        : thumbs.find((thumb) => {
            const rect = thumb.getBoundingClientRect();
            return vertical ? rect.top + rect.height / 2 >= box.top : rect.left + rect.width / 2 >= box.left;
          });
    const id = target ? Number(target.dataset.pageId) : null;
    if (id !== null && id !== selected?.id) setSelectedId(id);
  }

  // Keep the chosen page's thumbnail in view when the page changes some other way (wheel, buttons, undo).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !selected) return;
    const thumb = strip.querySelector<HTMLElement>(`[data-page-id="${selected.id}"]`);
    if (!thumb) return;
    const box = strip.getBoundingClientRect();
    const rect = thumb.getBoundingClientRect();
    const vertical = strip.scrollHeight > strip.clientHeight + 2;
    ignoreStripScrollUntil.current = Date.now() + 200;
    if (vertical) {
      if (rect.top < box.top) strip.scrollTop -= box.top - rect.top;
      else if (rect.bottom > box.bottom) strip.scrollTop += rect.bottom - box.bottom;
    } else if (rect.left < box.left) strip.scrollLeft -= box.left - rect.left;
    else if (rect.right > box.right) strip.scrollLeft += rect.right - box.right;
  }, [selected?.id]);

  // ------------------------------------------------------------ crop

  const selectedKey = selected ? pageKey(selected) : "";
  useEffect(() => {
    if (tool !== "crop" || !selected) return;
    let cancelled = false;
    let url = "";
    setCropUrl("");
    (async () => {
      try {
        const canvas = await renderStudioPage(selected, filesRef.current, { maxSide: 2400, look: false });
        const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setCropUrl(url);
        setCropRect(DEFAULT_CROP_RECT);
        setCropQuad(DEFAULT_CROP_QUAD);
      } catch {
        if (!cancelled) setNotice({ ok: false, text: "Could not open this page for cropping." });
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // Redraw the crop image when the tool opens or the selected page's pixels change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool, selected?.id, selectedKey]);

  async function applyCrop() {
    if (!selected || !cropUrl || busy) return;
    const page = selected;
    setBusy("Cropping...");
    try {
      const blob = cropMode === "straight" ? await cropImage(cropUrl, cropRect, "image/jpeg") : await warpPerspectiveCrop(cropUrl, cropQuad);
      commit((current) => current.map((item) => (item.id === page.id ? { ...item, base: { kind: "image", blob }, rotate: 0 } : item)));
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Could not crop the page." });
    } finally {
      setBusy("");
    }
  }

  // ------------------------------------------------------------ sheet preview (what will print)

  const sheetKey = useMemo(() => JSON.stringify([pages.map((page) => `${pageKey(page)}x${page.copies}`), output]), [pages, output]);

  useEffect(() => {
    if (!showSheet || !pages.length) return;
    let cancelled = false;
    setSheetStatus("building");
    const timer = window.setTimeout(async () => {
      try {
        const bytes = await buildStudioPdf(pages, filesRef.current, output, { preview: true });
        const pdfjs = await loadPdfjs();
        const task = pdfjs.getDocument({ data: bytes });
        const doc = await task.promise;
        if (cancelled) {
          void task.destroy();
          return;
        }
        void sheetDocRef.current?.destroy();
        sheetDocRef.current = { numPages: doc.numPages, getPage: (n) => doc.getPage(n), destroy: () => task.destroy() };
        setSheetTotal(doc.numPages);
        setSheetNo((current) => Math.min(current, doc.numPages));
        setSheetError("");
        setSheetStatus("ready");
        setSheetVersion((version) => version + 1);
      } catch (error) {
        if (cancelled) return;
        setSheetError(error instanceof Error ? error.message : "Could not build the preview.");
        setSheetStatus("error");
      }
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // sheetKey stands for the pages and output settings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSheet, sheetKey]);

  useEffect(() => {
    const doc = sheetDocRef.current;
    const canvas = sheetCanvasRef.current;
    if (!showSheet || !doc || !canvas || sheetStatus !== "ready") return;
    let cancelled = false;
    (async () => {
      try {
        const page = (await doc.getPage(sheetNo)) as {
          getViewport: (o: { scale: number }) => { width: number; height: number };
          render: (o: unknown) => { promise: Promise<void> };
          cleanup: () => void;
        };
        const natural = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: 1000 / Math.max(natural.width, natural.height) });
        if (cancelled) return;
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) return;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
        page.cleanup();
      } catch {
        // A newer preview replaced this document; the next draw handles it.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showSheet, sheetNo, sheetVersion, sheetStatus]);

  // ------------------------------------------------------------ print / save

  async function buildFinal(): Promise<Blob> {
    let bytes = await buildStudioPdf(pages, filesRef.current, output);
    if (compress !== "off") {
      const squeezed = await compressPdfByRaster(bytes, { dpi: compress === "medium" ? 150 : 110, quality: compress === "medium" ? 0.72 : 0.55 });
      if (squeezed.byteLength < bytes.byteLength * 0.9) bytes = squeezed;
    }
    return new Blob([bytes as BlobPart], { type: "application/pdf" });
  }

  async function printNow() {
    if (!pages.length || busy) return;
    setNotice(null);
    const outcome = await agentPrint.printPdf(buildFinal, {
      fileName: "photo-copy.pdf",
      copies: Math.max(1, copies),
      // Agent not running / "Browser print": open the PDF so the browser's print dialog can be used.
      fallback: () => {
        buildFinal()
          .then((blob) => window.open(URL.createObjectURL(blob), "_blank", "noopener"))
          .catch(() => setNotice({ ok: false, text: "Could not prepare the document for printing." }));
      },
    });
    if (outcome.ok) setNotice({ ok: true, text: "Sent to the printer." });
  }

  async function savePdf() {
    if (!pages.length || busy) return;
    setBusy("Building your PDF...");
    setNotice(null);
    try {
      const blob = await buildFinal();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "photo-copy.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      setNotice({ ok: true, text: `Saved - ${formatBytes(blob.size)}.` });
    } catch (error) {
      setNotice({ ok: false, text: error instanceof Error ? error.message : "Could not build the PDF." });
    } finally {
      setBusy("");
    }
  }

  // ------------------------------------------------------------ render

  const fileInput = (
    <input
      id="pcs-file-input"
      hidden
      type="file"
      multiple
      accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
      onChange={(event) => {
        if (event.target.files) void addFiles(event.target.files);
        event.target.value = "";
      }}
    />
  );

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files?.length) void addFiles(event.dataTransfer.files);
  }

  const dropProps = {
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(true);
    },
    onDragLeave: (event: React.DragEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragOver(false);
    },
    onDrop,
  };

  const canUndo = histRef.current.i > 0;
  const canRedo = histRef.current.i < histRef.current.stack.length - 1;
  const printedPages = expandPages(pages).length;
  const sheets = sheetCount(printedPages, layout);

  return (
    <div className={`pcs${isDragOver ? " is-dragover" : ""}`} {...dropProps}>
      {fileInput}

      <div className="pcs-ribbon" role="tablist" aria-label="Photo copy tools">
        {TOOLS.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.key} type="button" role="tab" aria-selected={tool === item.key} className={tool === item.key ? "active" : ""} onClick={() => setTool(item.key)}>
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pcs-bar">
        <label htmlFor="pcs-file-input" className="pcs-add">
          <Plus size={15} /> Add files
        </label>
        <button type="button" onClick={undo} disabled={!canUndo} title="Undo" aria-label="Undo">
          <Undo2 size={16} />
        </button>
        <button type="button" onClick={redo} disabled={!canRedo} title="Redo" aria-label="Redo">
          <Redo2 size={16} />
        </button>
        <span className="pcs-count">
          {pages.length} page{pages.length === 1 ? "" : "s"}
          {printedPages !== pages.length ? ` - ${printedPages} with copies` : ""}
          {layout !== "single" ? ` - ${sheets} sheet${sheets === 1 ? "" : "s"}` : ""}
        </span>
        <span className="pcs-spacer" />
        {busy ? (
          <span className="pcs-busy">
            <LoaderCircle size={15} className="spin" /> {busy}
          </span>
        ) : null}
        <button type="button" className="pcs-danger" onClick={clearAll} disabled={!!busy || !pages.length}>
          <Trash2 size={15} /> Clear all
        </button>
      </div>

      {notice ? <div className={`pcs-notice ${notice.ok ? "ok" : "bad"}`}>{notice.text}</div> : null}

      <div className="pcs-main">
        <aside className="pcs-strip" aria-label="Pages" ref={stripRef} onScroll={onStripScroll}>
          {!pages.length ? <p className="pcs-strip-empty">Pages show up here</p> : null}
          {pages.map((page, index) => (
            <button key={page.id} type="button" data-page-id={page.id} className={`pcs-thumb${selected?.id === page.id ? " selected" : ""}`} onClick={() => setSelectedId(page.id)} aria-label={`Page ${index + 1}`}>
              <span className="pcs-thumb-art">
                <PageCanvas page={page} files={filesRef} maxSide={240} />
                {page.copies > 1 ? <b className="pcs-thumb-copies">x{page.copies}</b> : null}
              </span>
              <small>{index + 1}</small>
            </button>
          ))}
        </aside>

        <section className="pcs-stage" aria-label="Preview" ref={stageRef}>
          {!pages.length ? (
            <label htmlFor="pcs-file-input" className={`customer-upload pcs-empty${isDragOver ? " is-dragover" : ""}`}>
              {busy ? <LoaderCircle size={26} className="spin" /> : <Upload size={26} />}
              <strong>{busy || "Add PDF or photos"}</strong>
              <span>Drag &amp; drop, paste (Ctrl+V), or choose PDF, JPG, PNG files - several at once. They open here, ready to crop, clean, rearrange and print.</span>
              <em>Tap to choose files</em>
            </label>
          ) : tool === "crop" ? (
            cropUrl ? (
              <div className="pcs-crop">
                {cropMode === "straight" ? (
                  <CropEditor fileUrl={cropUrl} rect={cropRect} onRectChange={setCropRect} />
                ) : (
                  <PerspectiveCropEditor fileUrl={cropUrl} quad={cropQuad} onQuadChange={setCropQuad} />
                )}
              </div>
            ) : (
              <div className="pcs-wait">
                <LoaderCircle size={24} className="spin" /> Opening the page...
              </div>
            )
          ) : showSheet ? (
            <div className="pcs-sheet">
              <div className="pcs-sheet-head">
                <strong>This is how it will print</strong>
                {sheetStatus === "ready" && sheetTotal > 1 ? (
                  <div className="pcs-sheet-nav">
                    <button type="button" onClick={() => setSheetNo((n) => Math.max(1, n - 1))} disabled={sheetNo <= 1} aria-label="Previous sheet">
                      <ChevronLeft size={16} />
                    </button>
                    <span>
                      Sheet {sheetNo} of {sheetTotal}
                    </span>
                    <button type="button" onClick={() => setSheetNo((n) => Math.min(sheetTotal, n + 1))} disabled={sheetNo >= sheetTotal} aria-label="Next sheet">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ) : null}
              </div>
              {sheetStatus === "error" ? <div className="pcs-notice bad">{sheetError}</div> : null}
              <div className="pcs-sheet-paper">
                <canvas ref={sheetCanvasRef} />
                {sheetStatus === "building" ? (
                  <span className="pcs-sheet-wait">
                    <LoaderCircle size={18} className="spin" /> Updating...
                  </span>
                ) : null}
              </div>
            </div>
          ) : selected ? (
            <div className="pcs-page-view">
              <PageCanvas page={selected} files={filesRef} maxSide={1200} className="pcs-page-canvas" />
              <span className="pcs-page-label">
                Page {selectedIndex + 1} of {pages.length}
              </span>
            </div>
          ) : null}
        </section>

        <aside className="pcs-panel" aria-label="Tool options">
          {!pages.length && (tool === "pages" || tool === "crop" || tool === "clean") ? (
            <section className="pcs-section">
              <h3>Start here</h3>
              <p className="pcs-hint">Add a PDF or photo in the middle (or with Add files above). Then Pages, Crop and Clean &amp; Light work on the page you pick, and Sheet Layout puts several pages on one sheet.</p>
            </section>
          ) : null}
          {tool === "pages" && selected ? (
            <section className="pcs-section">
              <h3>Pages</h3>
              <div className="pcs-button-grid">
                <button type="button" onClick={() => rotate(-90)}>
                  <RotateCcw size={15} /> Rotate left
                </button>
                <button type="button" onClick={() => rotate(90)}>
                  <RotateCw size={15} /> Rotate right
                </button>
                <button type="button" onClick={() => move(-1)} disabled={selectedIndex <= 0}>
                  <ChevronLeft size={15} /> Move earlier
                </button>
                <button type="button" onClick={() => move(1)} disabled={selectedIndex >= pages.length - 1}>
                  Move later <ChevronRight size={15} />
                </button>
                <button type="button" onClick={duplicate}>
                  <Copy size={15} /> Duplicate
                </button>
                <button type="button" className="danger" onClick={removeSelected}>
                  <Trash2 size={15} /> Delete page
                </button>
              </div>
              <div className="pcs-subsection pcs-copies-of">
                <h4>Copies of {applyAll ? "every page" : `page ${selectedIndex + 1}`}</h4>
                <div className="pcs-chips" role="group" aria-label="Copies of this page">
                  {[1, 2, 3, 4].map((count) => (
                    <button key={count} type="button" className={selected.copies === count ? "active" : ""} aria-pressed={selected.copies === count} onClick={() => setCopiesOf(count)}>
                      x{count}
                    </button>
                  ))}
                  <div className="pcs-stepper">
                    <button type="button" onClick={() => setCopiesOf(selected.copies - 1)} aria-label="One copy less">
                      -
                    </button>
                    <input type="text" inputMode="numeric" value={selected.copies} onChange={(event) => setCopiesOf(Number(event.target.value.replace(/\D/g, "")))} aria-label="Copies of this page" />
                    <button type="button" onClick={() => setCopiesOf(selected.copies + 1)} aria-label="One copy more">
                      +
                    </button>
                  </div>
                </div>
                <p className="pcs-hint">Each copy is a separate page in the printout (and fills a slot in a 2 or 4 per sheet layout). The Copies box under Print repeats the whole job.</p>
              </div>
              <label className="pcs-check">
                <input type="checkbox" checked={applyAll} onChange={(event) => setApplyAll(event.target.checked)} />
                <span>Rotate / reset / copies / clean - all pages together</span>
              </label>
              <div className="pcs-subsection">
                <h4>Keep only these pages</h4>
                <div className="pcs-inline">
                  <input type="text" value={keepInput} placeholder={`e.g. 1,3,5-7 (1-${pages.length})`} onChange={(event) => setKeepInput(event.target.value)} aria-label="Pages to keep" />
                  <button type="button" onClick={keepOnly} disabled={!keepInput.trim()}>
                    Keep
                  </button>
                </div>
                <p className="pcs-hint">Pages can repeat too: 1,1,2 gives page 1 twice.</p>
              </div>
              <div className="pcs-button-grid">
                <button type="button" onClick={reverse}>
                  Reverse order
                </button>
                <button type="button" onClick={resetPage}>
                  <Undo2 size={15} /> Reset {applyAll ? "all" : "page"}
                </button>
              </div>
            </section>
          ) : null}

          {tool === "crop" && selected ? (
            <section className="pcs-section">
              <h3>Crop page {selectedIndex + 1}</h3>
              <div className="pcs-segment">
                <button type="button" className={cropMode === "straight" ? "active" : ""} onClick={() => setCropMode("straight")}>
                  Straight crop
                </button>
                <button type="button" className={cropMode === "perspective" ? "active" : ""} onClick={() => setCropMode("perspective")}>
                  Straighten (4 corners)
                </button>
              </div>
              <p className="pcs-hint">
                {cropMode === "straight"
                  ? "Drag a corner or edge to resize the crop area. Drag inside the box to move it."
                  : "Move each corner onto the real corner of the paper or card - a photo taken at an angle comes out straight."}
              </p>
              <div className="pcs-button-grid">
                <button type="button" onClick={() => (cropMode === "straight" ? setCropRect(DEFAULT_CROP_RECT) : setCropQuad(DEFAULT_CROP_QUAD))}>
                  <Undo2 size={15} /> Reset crop
                </button>
                <button type="button" className="primary" onClick={() => void applyCrop()} disabled={!cropUrl || !!busy}>
                  <Crop size={15} /> Apply crop
                </button>
              </div>
              <p className="pcs-hint">Applying turns the page into a picture. &quot;Reset page&quot; in Pages brings the original back.</p>
            </section>
          ) : null}

          {tool === "clean" && selected ? (
            <section className="pcs-section">
              <h3>Clean &amp; Light</h3>
              <div className="pcs-look-options">
                {LOOKS.map((option) => (
                  <button key={option.key} type="button" className={selected.look.mode === option.key ? "active" : ""} aria-pressed={selected.look.mode === option.key} onClick={() => setLook({ mode: option.key }, "mode")}>
                    <strong>{option.label}</strong>
                    <small>{option.note}</small>
                  </button>
                ))}
              </div>
              <label className="pcs-slider">
                <span>
                  Brightness <b>{selected.look.brightness}</b>
                </span>
                <input type="range" min={-100} max={100} step={1} value={selected.look.brightness} onChange={(event) => setLook({ brightness: Number(event.target.value) }, "brightness")} />
              </label>
              <label className="pcs-slider">
                <span>
                  Contrast <b>{selected.look.contrast}</b>
                </span>
                <input type="range" min={-100} max={100} step={1} value={selected.look.contrast} onChange={(event) => setLook({ contrast: Number(event.target.value) }, "contrast")} />
              </label>
              {selected.look.mode === "bw" ? (
                <label className="pcs-slider">
                  <span>
                    Darkness <b>{selected.look.darkness}</b>
                  </span>
                  <input type="range" min={0} max={100} step={1} value={selected.look.darkness} onChange={(event) => setLook({ darkness: Number(event.target.value) }, "darkness")} />
                </label>
              ) : null}
              <label className="pcs-check">
                <input type="checkbox" checked={applyAll} onChange={(event) => setApplyAll(event.target.checked)} />
                <span>Apply to all pages</span>
              </label>
              <div className="pcs-subsection">
                <h4>Auto clean (scanner)</h4>
                <div className="pcs-button-grid">
                  <button type="button" onClick={() => void autoClean("photocopy")} disabled={!!busy}>
                    <Wand2 size={15} /> B&amp;W copy
                  </button>
                  <button type="button" onClick={() => void autoClean("clean")} disabled={!!busy}>
                    <Wand2 size={15} /> Colour clean
                  </button>
                </div>
                <p className="pcs-hint">Evens out lighting and whitens the paper on the selected page. The page becomes a picture; Reset page undoes it.</p>
              </div>
              <button type="button" className="pcs-wide" onClick={resetPage}>
                <Undo2 size={15} /> Reset {applyAll ? "all pages" : "this page"}
              </button>
            </section>
          ) : null}

          {tool === "layout" ? (
            <section className="pcs-section">
              <h3>Pages per sheet</h3>
              <div className="pcs-look-options">
                {LAYOUTS.map((option) => (
                  <button key={option.key} type="button" className={layout === option.key ? "active" : ""} aria-pressed={layout === option.key} onClick={() => setLayout(option.key)}>
                    <strong>{option.label}</strong>
                    <small>{option.note}</small>
                  </button>
                ))}
              </div>
              {layout !== "single" ? (
                <label className="pcs-check">
                  <input type="checkbox" checked={cellBorder} onChange={(event) => setCellBorder(event.target.checked)} />
                  <span>Thin line around each page (to cut along)</span>
                </label>
              ) : null}
              {layout === "id-card" ? <p className="pcs-hint">Crop each card side first (Crop tool), then pick this: every page prints at real card size, front then back, down the sheet.</p> : null}
              {layout === "two-side" ? <p className="pcs-hint">Makes landscape sheets - pick a landscape or auto-rotate print profile, or the page may print small.</p> : null}
            </section>
          ) : null}

          {tool === "marks" ? (
            <>
              <section className="pcs-section">
                <h3>Watermark</h3>
                <input type="text" value={wmText} maxLength={40} placeholder="e.g. COPY, NOT FOR SALE" onChange={(event) => setWmText(event.target.value)} aria-label="Watermark text" />
                {!wmTextOk ? <p className="pcs-error">Only English letters, numbers and common symbols work in a watermark.</p> : null}
                {wmText.trim() ? (
                  <>
                    <div className="pcs-swatches" role="group" aria-label="Watermark colour">
                      {SWATCHES.map((swatch) => (
                        <button key={swatch.key} type="button" className={wmColor === swatch.key ? "active" : ""} style={{ background: swatch.color }} onClick={() => setWmColor(swatch.key)} aria-label={`${swatch.key} watermark`} />
                      ))}
                    </div>
                    <label className="pcs-slider">
                      <span>
                        Strength <b>{Math.round(wmOpacity * 100)}%</b>
                      </span>
                      <input type="range" min={0.1} max={0.7} step={0.05} value={wmOpacity} onChange={(event) => setWmOpacity(Number(event.target.value))} />
                    </label>
                  </>
                ) : null}
              </section>
              <section className="pcs-section">
                <h3>Page numbers</h3>
                <label className="pcs-check">
                  <input type="checkbox" checked={pnOn} onChange={(event) => setPnOn(event.target.checked)} />
                  <span>Add page numbers</span>
                </label>
                {pnOn ? (
                  <>
                    <select value={pnPosition} onChange={(event) => setPnPosition(event.target.value as PageNumberPosition)} aria-label="Page number position">
                      <option value="bottom-center">Bottom centre</option>
                      <option value="bottom-right">Bottom right</option>
                      <option value="bottom-left">Bottom left</option>
                      <option value="top-right">Top right</option>
                    </select>
                    <select value={pnFormat} onChange={(event) => setPnFormat(event.target.value as PageNumberFormat)} aria-label="Page number style">
                      <option value="n">1, 2, 3</option>
                      <option value="page-n">Page 1, Page 2</option>
                      <option value="n-of-total">1 / 5, 2 / 5</option>
                    </select>
                    <label className="pcs-start">
                      <span>Start at</span>
                      <input type="number" min={1} max={999} value={pnStart} onChange={(event) => setPnStart(Number(event.target.value))} />
                    </label>
                  </>
                ) : null}
              </section>
            </>
          ) : null}

          {tool === "compress" ? (
            <section className="pcs-section">
              <h3>Make the file smaller</h3>
              <select value={compress} onChange={(event) => setCompress(event.target.value as CompressLevel)} aria-label="Compression">
                <option value="off">Off</option>
                <option value="medium">Medium (150 DPI)</option>
                <option value="strong">Small (110 DPI)</option>
              </select>
              <p className="pcs-hint">Used when saving or printing. Best for scanned or photo pages - text becomes a picture, so it can no longer be selected. If it would not get smaller, the file is left as it is.</p>
            </section>
          ) : null}

          <section className="pcs-section pcs-print">
            <h3>Print</h3>
            <div className="pcs-copies">
              <span>Copies</span>
              <div className="pcs-stepper">
                <button type="button" onClick={() => setCopies((n) => Math.max(1, n - 1))} aria-label="Fewer copies">
                  -
                </button>
                <input type="text" inputMode="numeric" value={copies} onChange={(event) => setCopies(Math.min(99, Math.max(1, Number(event.target.value.replace(/\D/g, "")) || 1)))} aria-label="Number of copies" />
                <button type="button" onClick={() => setCopies((n) => Math.min(99, n + 1))} aria-label="More copies">
                  +
                </button>
              </div>
            </div>
            <PrintProfileSelect print={agentPrint} className="pps-print-profile" />
            <div className="pcs-print-actions">
              <button type="button" className="pcs-save" onClick={() => void savePdf()} disabled={!!busy || agentPrint.busy || !pages.length}>
                <Download size={16} /> Save PDF
              </button>
              <button type="button" className="pcs-go" onClick={() => void printNow()} disabled={!!busy || agentPrint.busy || !pages.length}>
                {agentPrint.busy ? <LoaderCircle size={16} className="spin" /> : <Printer size={16} />} {agentPrint.busy ? "Printing..." : "Print"}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
