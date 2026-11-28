"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, RotateCcw, RotateCw, Trash2, Undo2, Wand2, X } from "lucide-react";
import {
  buildPlaygroundPdf,
  isWatermarkTextSupported,
  normalizeTurn,
  sheetCount,
  type LayoutMode,
  type PageNumberFormat,
  type PageNumberPosition,
  type PlaygroundPlan,
  type WatermarkColor,
} from "@/lib/pdfPlayground";
import { compressPdfByRaster } from "@/lib/pdfCompress";

type Item = { id: number; source: number; rotate: number };
type CompressLevel = "off" | "medium" | "strong";

const LAYOUTS: { key: LayoutMode; label: string; note: string }[] = [
  { key: "single", label: "1 per sheet", note: "Pages as they are" },
  { key: "two-side", label: "2 per sheet", note: "Side by side (landscape A4)" },
  { key: "two-stack", label: "2 per sheet", note: "One above the other (portrait A4)" },
  { key: "four", label: "4 per sheet", note: "2 x 2 on portrait A4" },
  { key: "id-card", label: "ID card size", note: "True 85.6 x 54 mm, front + back on one A4" },
];

const WATERMARK_SWATCHES: { key: WatermarkColor; color: string }[] = [
  { key: "gray", color: "#737373" },
  { key: "red", color: "#d92626" },
  { key: "blue", color: "#2659d9" },
];

function freshItems(count: number): Item[] {
  return Array.from({ length: count }, (_, index) => ({ id: index, source: index, rotate: 0 }));
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// The "PDF Playground": rotate / reorder / remove pages, put several pages on a sheet, add a
// watermark or page numbers, and shrink the file - all on the PDF that is currently loaded.
// Apply replaces that PDF (Manage Pages > Reset to original still brings the upload back).
export default function PdfPlayground({
  fileUrl,
  fileName,
  pages,
  Thumb,
  onApply,
  onClose,
}: {
  fileUrl: string;
  fileName: string;
  pages: number;
  Thumb: React.ComponentType<{ fileUrl: string; pageNumber: number }>;
  onApply: (blob: Blob, pageCount: number) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Item[]>(() => freshItems(pages));
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
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // A new document (after Apply, or Reset to original) starts the page list again.
  useEffect(() => {
    setItems(freshItems(pages));
  }, [fileUrl, pages]);

  const wmTextOk = isWatermarkTextSupported(wmText);
  const sheets = sheetCount(items.length, layout);
  const changed = useMemo(
    () =>
      layout !== "single" ||
      wmText.trim() !== "" ||
      pnOn ||
      compress !== "off" ||
      items.length !== pages ||
      items.some((item, index) => item.source !== index || item.rotate !== 0),
    [layout, wmText, pnOn, compress, items, pages],
  );

  function update(id: number, change: (item: Item) => Item) {
    setItems((current) => current.map((item) => (item.id === id ? change(item) : item)));
  }

  function turn(id: number, by: number) {
    update(id, (item) => ({ ...item, rotate: normalizeTurn(item.rotate + by) }));
  }

  function move(id: number, by: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + by;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = current.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(id: number) {
    setItems((current) => (current.length <= 1 ? current : current.filter((item) => item.id !== id)));
  }

  async function apply() {
    if (busy || !changed) return;
    if (!wmTextOk) {
      setMessage({ ok: false, text: "The watermark can use English letters, numbers and common symbols only." });
      return;
    }
    setMessage(null);
    setBusy("Building your PDF...");
    try {
      const response = await fetch(fileUrl);
      const sourceBytes = new Uint8Array(await response.arrayBuffer());
      const plan: PlaygroundPlan = {
        pages: items.map((item) => ({ source: item.source, rotate: item.rotate })),
        layout,
        cellBorder,
        watermark: wmText.trim() ? { text: wmText.trim(), opacity: wmOpacity, color: wmColor } : null,
        pageNumbers: pnOn ? { position: pnPosition, format: pnFormat, startAt: Math.max(1, Math.floor(pnStart) || 1) } : null,
      };
      const built = await buildPlaygroundPdf(sourceBytes, plan);
      let result = built;
      let note = "";
      if (compress !== "off") {
        const squeezed = await compressPdfByRaster(built, {
          dpi: compress === "medium" ? 150 : 110,
          quality: compress === "medium" ? 0.72 : 0.55,
          onProgress: (done, total) => setBusy(`Compressing page ${done} of ${total}...`),
        });
        if (squeezed.byteLength < built.byteLength * 0.9) result = squeezed;
        else note = " Compression would not have made it smaller, so the file was left as it is.";
      }
      onApply(new Blob([result as BlobPart], { type: "application/pdf" }), sheetCount(items.length, layout));
      setMessage({
        ok: true,
        text: `Applied - ${sheetCount(items.length, layout)} page${sheetCount(items.length, layout) === 1 ? "" : "s"}, ${formatBytes(sourceBytes.byteLength)} to ${formatBytes(result.byteLength)}.${note}`,
      });
      setWmText("");
      setPnOn(false);
      setLayout("single");
      setCompress("off");
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Could not build the PDF." });
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="PDF Playground">
      <div className="pgx-window">
        <div className="document-preview-head">
          <div>
            <strong>PDF Playground</strong>
            <span>{fileName}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close PDF Playground">
            <X size={18} />
          </button>
        </div>

        <div className="pgx-body">
          <section className="pgx-pages-panel" aria-label="Pages">
            <div className="pgx-toolbar">
              <strong>
                {items.length} page{items.length === 1 ? "" : "s"}
                {layout !== "single" ? ` - ${sheets} sheet${sheets === 1 ? "" : "s"}` : ""}
              </strong>
              <div className="pgx-toolbar-actions">
                <button type="button" onClick={() => setItems((current) => current.map((item) => ({ ...item, rotate: normalizeTurn(item.rotate - 90) })))} title="Turn every page to the left">
                  <RotateCcw size={14} /> All left
                </button>
                <button type="button" onClick={() => setItems((current) => current.map((item) => ({ ...item, rotate: normalizeTurn(item.rotate + 90) })))} title="Turn every page to the right">
                  <RotateCw size={14} /> All right
                </button>
                <button type="button" onClick={() => setItems((current) => current.slice().reverse())} title="Last page first">
                  Reverse order
                </button>
                <button type="button" onClick={() => setItems(freshItems(pages))} title="Undo the changes made here">
                  <Undo2 size={14} /> Reset
                </button>
              </div>
            </div>

            <div className="pgx-grid">
              {items.map((item, index) => (
                <div className="pgx-card" key={item.id}>
                  <div className="pgx-thumb-box">
                    <div className="pgx-thumb" style={{ transform: `rotate(${item.rotate}deg)${item.rotate % 180 ? " scale(0.72)" : ""}` }}>
                      <Thumb fileUrl={fileUrl} pageNumber={item.source + 1} />
                    </div>
                  </div>
                  <span className="pgx-card-label">
                    Page {index + 1}
                    {item.source !== index ? <small> (was {item.source + 1})</small> : null}
                  </span>
                  <div className="pgx-card-actions">
                    <button type="button" onClick={() => turn(item.id, -90)} aria-label={`Turn page ${index + 1} left`} title="Turn left">
                      <RotateCcw size={14} />
                    </button>
                    <button type="button" onClick={() => turn(item.id, 90)} aria-label={`Turn page ${index + 1} right`} title="Turn right">
                      <RotateCw size={14} />
                    </button>
                    <button type="button" onClick={() => move(item.id, -1)} disabled={index === 0} aria-label={`Move page ${index + 1} earlier`} title="Move earlier">
                      <ChevronLeft size={15} />
                    </button>
                    <button type="button" onClick={() => move(item.id, 1)} disabled={index === items.length - 1} aria-label={`Move page ${index + 1} later`} title="Move later">
                      <ChevronRight size={15} />
                    </button>
                    <button type="button" className="danger" onClick={() => remove(item.id)} disabled={items.length <= 1} aria-label={`Remove page ${index + 1}`} title="Remove page">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="pgx-tools" aria-label="PDF tools">
            <section className="pgx-tool">
              <h3>Pages per sheet</h3>
              <div className="pgx-layout-options">
                {LAYOUTS.map((option) => (
                  <button key={option.key} type="button" className={layout === option.key ? "active" : ""} aria-pressed={layout === option.key} onClick={() => setLayout(option.key)}>
                    <strong>{option.label}</strong>
                    <small>{option.note}</small>
                  </button>
                ))}
              </div>
              {layout !== "single" ? (
                <label className="pgx-check">
                  <input type="checkbox" checked={cellBorder} onChange={(event) => setCellBorder(event.target.checked)} />
                  <span>Thin line around each page (to cut along)</span>
                </label>
              ) : null}
              {layout === "two-side" ? <p className="pgx-hint">This makes landscape sheets - pick a landscape or auto-rotate print profile, or the page may print small.</p> : null}
            </section>

            <section className="pgx-tool">
              <h3>Watermark</h3>
              <input type="text" value={wmText} maxLength={40} placeholder="e.g. COPY, NOT FOR SALE" onChange={(event) => setWmText(event.target.value)} aria-label="Watermark text" />
              {!wmTextOk ? <p className="pgx-error">Only English letters, numbers and common symbols work in a watermark.</p> : null}
              {wmText.trim() ? (
                <div className="pgx-wm-options">
                  <div className="pgx-swatches" role="group" aria-label="Watermark colour">
                    {WATERMARK_SWATCHES.map((swatch) => (
                      <button
                        key={swatch.key}
                        type="button"
                        className={wmColor === swatch.key ? "active" : ""}
                        style={{ background: swatch.color }}
                        onClick={() => setWmColor(swatch.key)}
                        aria-label={`${swatch.key} watermark`}
                      />
                    ))}
                  </div>
                  <label className="pgx-slider">
                    <span>
                      Strength <b>{Math.round(wmOpacity * 100)}%</b>
                    </span>
                    <input type="range" min={0.1} max={0.7} step={0.05} value={wmOpacity} onChange={(event) => setWmOpacity(Number(event.target.value))} />
                  </label>
                </div>
              ) : null}
            </section>

            <section className="pgx-tool">
              <h3>Page numbers</h3>
              <label className="pgx-check">
                <input type="checkbox" checked={pnOn} onChange={(event) => setPnOn(event.target.checked)} />
                <span>Add page numbers</span>
              </label>
              {pnOn ? (
                <div className="pgx-pn-options">
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
                  <label className="pgx-start">
                    <span>Start at</span>
                    <input type="number" min={1} max={999} value={pnStart} onChange={(event) => setPnStart(Number(event.target.value))} />
                  </label>
                </div>
              ) : null}
            </section>

            <section className="pgx-tool">
              <h3>Make file smaller</h3>
              <select value={compress} onChange={(event) => setCompress(event.target.value as CompressLevel)} aria-label="Compression">
                <option value="off">Off</option>
                <option value="medium">Medium (150 DPI)</option>
                <option value="strong">Small (110 DPI)</option>
              </select>
              {compress !== "off" ? <p className="pgx-hint">Best for scanned or photo PDFs. Text becomes a picture, so it can no longer be selected. If it would not get smaller, the file is left as it is.</p> : null}
            </section>

            {message ? <div className={`pgx-message ${message.ok ? "ok" : "bad"}`}>{message.text}</div> : null}

            <button type="button" className="pgx-apply" onClick={() => void apply()} disabled={!!busy || !changed || !wmTextOk}>
              {busy ? <LoaderCircle size={17} className="spin" /> : <Wand2 size={17} />}
              {busy || "Apply to document"}
            </button>
            <p className="pgx-hint">Applies to the PDF you are printing. Manage Pages has Reset to original if you change your mind.</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
