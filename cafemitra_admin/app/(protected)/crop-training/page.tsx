"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import Pagination from "@/components/Pagination";
import {
  clearCropSamples,
  exportCropTraining,
  fetchCropSamples,
  fetchCropTraining,
  setCropCollect,
  type CropSampleRow,
  type CropTrainingStats,
} from "@/lib/api";

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return bytes ? `${bytes} B` : "0";
}

const OUTCOMES: { key: "accepted" | "adjusted" | "manual" | "notfound"; label: string; hint: string }[] = [
  { key: "accepted", label: "Used as detected", hint: "Auto crop applied without moving a corner" },
  { key: "adjusted", label: "Corners adjusted", hint: "User fixed the auto crop" },
  { key: "manual", label: "Placed by hand", hint: "Nothing detected, user placed the corners" },
  { key: "notfound", label: "Gave up", hint: "Nothing detected, user left" },
];

function pct(part: number, total: number) {
  return total ? `${Math.round((part / total) * 100)}%` : "-";
}

export default function CropTrainingPage() {
  const [stats, setStats] = useState<CropTrainingStats | null>(null);
  const [samples, setSamples] = useState<CropSampleRow[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);
  const [outcome, setOutcome] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    fetchCropTraining()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."));
    fetchCropSamples({ outcome, page })
      .then((res) => {
        setSamples(res.samples);
        setCount(res.count);
        setPageSize(res.pageSize);
      })
      .catch(() => {});
  }, [outcome, page]);

  useEffect(load, [load]);

  async function toggleCollect(next: boolean) {
    if (next && !window.confirm("Start keeping customers' ID card photos (the upload and the cropped result) for training? Customers see a notice on the ID Card Print page while this is on.")) return;
    setBusy(true);
    setError("");
    try {
      setStats(await setCropCollect(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the setting.");
    } finally {
      setBusy(false);
    }
  }

  async function clear(body: { ids?: number[]; all?: boolean; scope?: "images" | "everything" }, label: string) {
    if (!window.confirm(`${label} This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await clearCropSamples(body);
      setMessage(result.deleted ? `${result.deleted} sample(s) deleted.` : `Photos removed from ${result.photosCleared} sample(s).`);
      setSelected(new Set());
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const total = stats ? Object.values(stats.counts).reduce((sum, n) => sum + n, 0) : 0;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Auto-crop Training Data</h1>
      <p className="text-sm text-slate-500 mb-4 max-w-3xl">
        ID Card Print detects the card and shows the four corners to the customer, who confirms or fixes them. How each crop ended is always counted
        (no photo needed). Turn collection on to also keep the uploaded photo and the cropped result, so they can be used to train the auto-crop model.
        Delete them from here once you have exported what you need.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4 max-w-3xl flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Keep customers&apos; ID card photos for training</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Off by default. While on, the ID Card Print page tells customers their photo may be kept. These are personal documents (Aadhaar, PAN...) - keep
            them only as long as you need them.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(stats?.collectImages)}
          disabled={busy || !stats}
          onClick={() => stats && toggleCollect(!stats.collectImages)}
          className="inline-flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${stats?.collectImages ? "bg-green-500" : "bg-slate-300"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${stats?.collectImages ? "translate-x-4" : "translate-x-0.5"}`} />
          </span>
          <span className={`text-xs font-medium ${stats?.collectImages ? "text-green-700" : "text-slate-500"}`}>{stats?.collectImages ? "On" : "Off"}</span>
        </button>
      </div>

      {message && <div className="mb-4 rounded-md bg-green-50 text-green-700 text-sm px-3 py-2">{message}</div>}
      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 max-w-4xl">
            {OUTCOMES.map((o) => (
              <div key={o.key} className="rounded-xl border border-slate-200 bg-white p-3" title={o.hint}>
                <p className="text-xs text-slate-500">{o.label}</p>
                <p className="text-lg font-semibold text-slate-900">
                  {stats.counts[o.key]} <span className="text-xs font-normal text-slate-400">{pct(stats.counts[o.key], total)}</span>
                </p>
                <p className="text-xs text-slate-400">last 7 days: {stats.countsLast7Days[o.key]}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto mb-6 max-w-4xl">
            <p className="px-4 py-2 border-b border-slate-200 text-sm font-medium text-slate-900">By shop (who used the auto crop as it was, and who fixed it)</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">Shop</th>
                  <th className="px-4 py-2 font-medium">Crops</th>
                  <th className="px-4 py-2 font-medium">Used as detected</th>
                  <th className="px-4 py-2 font-medium">Adjusted</th>
                  <th className="px-4 py-2 font-medium">By hand</th>
                  <th className="px-4 py-2 font-medium">Gave up</th>
                </tr>
              </thead>
              <tbody>
                {stats.perShop.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-5 text-center text-slate-500">
                      No crops recorded yet.
                    </td>
                  </tr>
                )}
                {stats.perShop.map((row) => (
                  <tr key={`${row.shopId}-${row.email}`} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 text-slate-800">{row.email}</td>
                    <td className="px-4 py-2 text-slate-700">{row.total}</td>
                    <td className="px-4 py-2 text-slate-700">
                      {row.accepted} <span className="text-xs text-slate-400">{pct(row.accepted, row.total)}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-700">{row.adjusted}</td>
                    <td className="px-4 py-2 text-slate-700">{row.manual}</td>
                    <td className="px-4 py-2 text-slate-700">{row.notfound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-base font-semibold text-slate-900 mb-1">Stored photos</h2>
          <p className="text-sm text-slate-500 mb-3">
            {stats.samplesWithImages} sample(s) hold photos ({formatBytes(stats.imageBytes)}).
            {" "}Filter &amp; Light was changed from the default look in {stats.filterChanged} crop(s).
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select
              value={outcome}
              onChange={(e) => {
                setOutcome(e.target.value);
                setPage(1);
                setSelected(new Set());
              }}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All outcomes</option>
              {OUTCOMES.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || !stats.samplesWithImages}
              onClick={() => exportCropTraining(outcome).catch((err) => setError(err instanceof Error ? err.message : "Export failed."))}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Download training data (ZIP){outcome ? " - this outcome" : ""}
            </button>
            <button
              type="button"
              disabled={busy || !selected.size}
              onClick={() => clear({ ids: Array.from(selected) }, `Remove the photos of ${selected.size} selected sample(s)?`)}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
            >
              <Trash2 size={14} /> Delete selected photos ({selected.size})
            </button>
            <button
              type="button"
              disabled={busy || !stats.samplesWithImages}
              onClick={() => clear({ all: true, scope: "images" }, `Remove ALL ${stats.samplesWithImages} stored photo set(s)? The counts above stay.`)}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"
            >
              Delete all stored photos
            </button>
            <button
              type="button"
              disabled={busy || !total}
              onClick={() => clear({ all: true, scope: "everything" }, `Delete EVERYTHING - all ${total} sample(s), photos and counts?`)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Reset all counts too
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
            {samples.length === 0 && <p className="text-sm text-slate-500">No stored photos.</p>}
            {samples.map((sample) => (
              <div key={sample.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" checked={selected.has(sample.id)} onChange={() => toggle(sample.id)} />#{sample.id} · {sample.side} ·{" "}
                    <b>{OUTCOMES.find((o) => o.key === sample.outcome)?.label || sample.outcome}</b>
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => clear({ ids: [sample.id] }, `Remove the photos of sample #${sample.id}?`)}
                    title="Delete this sample's photos"
                    className="text-slate-400 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {sample.outcome === "accepted" ? (
                  <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    <Check size={13} /> Auto-crop was correct
                  </p>
                ) : (
                  <p className="mb-2 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                    <X size={13} /> {sample.outcome === "adjusted" ? "Auto-crop was wrong - fixed by the user" : sample.outcome === "manual" ? "Auto-crop found nothing - placed by hand" : "Auto-crop found nothing"}
                  </p>
                )}
                <p className="mb-2 text-xs text-slate-600">
                  {sample.filterValues
                    ? "Filter & Light changed by the user: " +
                      Object.entries(sample.filterValues)
                        .filter(([key]) => key !== "source")
                        .map(([key, value]) => `${key} ${value}`)
                        .join(", ")
                    : "Filter & Light: default look kept"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[11px] text-slate-500 mb-1">Input (uploaded)</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sample.originalImage} alt="Input" className="w-full rounded border border-slate-200" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 mb-1">Output (cropped)</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sample.resultImage} alt="Output" className="w-full rounded border border-slate-200" />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-slate-400 truncate">
                  {sample.email || "not logged in"} · {new Date(sample.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
          <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
