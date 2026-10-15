"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import Pagination from "@/components/Pagination";
import {
  deleteCardMakerRuns,
  downloadCardMakerFile,
  exportCardMakerData,
  fetchCardMakerData,
  fetchCardMakerRuns,
  setCardMakerCollect,
  type CardMakerOverview,
  type CardMakerRun,
} from "@/lib/api";

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export default function CardMakerDataPage() {
  const [overview, setOverview] = useState<CardMakerOverview | null>(null);
  const [runs, setRuns] = useState<CardMakerRun[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [docType, setDocType] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    fetchCardMakerData()
      .then(setOverview)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."));
    fetchCardMakerRuns({ docType, page })
      .then((res) => {
        setRuns(res.samples);
        setCount(res.count);
        setPageSize(res.pageSize);
      })
      .catch(() => {});
  }, [docType, page]);

  useEffect(load, [load]);

  async function toggleCollect(next: boolean) {
    if (
      next &&
      !window.confirm(
        "Start keeping the PDF customers open in the ID Card Maker and the card made from it? These contain full Aadhaar / PAN / voter / DL details. Customers see a notice in the tool's help while this is on."
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      setOverview(await setCardMakerCollect(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the setting.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(body: { ids?: number[]; all?: boolean }, label: string) {
    if (!window.confirm(`${label} This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await deleteCardMakerRuns(body);
      setMessage(`${result.deleted} stored run(s) deleted.`);
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

  const allOnPage = runs.length > 0 && runs.every((run) => selected.has(run.id));

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">ID Card Maker Training Data</h1>
      <p className="text-sm text-slate-500 mb-4 max-w-3xl">
        When switched on, each time a customer prints or downloads a card in the ID Card Maker, the PDF they opened (unlocked, if it had a password) and the
        card PDF the tool built from it are kept here as an input / output pair. Download them as a ZIP, then delete them.
      </p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4 max-w-3xl flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Keep ID Card Maker PDFs for training</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Off by default. These PDFs contain full personal details (name, address, Aadhaar / PAN number, photo, QR). While on, the tool&apos;s help tells customers their PDF may be
            kept. Update your privacy policy first, and delete the data once you have exported it.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(overview?.collect)}
          disabled={busy || !overview}
          onClick={() => overview && toggleCollect(!overview.collect)}
          className="inline-flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${overview?.collect ? "bg-green-500" : "bg-slate-300"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${overview?.collect ? "translate-x-4" : "translate-x-0.5"}`} />
          </span>
          <span className={`text-xs font-medium ${overview?.collect ? "text-green-700" : "text-slate-500"}`}>{overview?.collect ? "On" : "Off"}</span>
        </button>
      </div>

      {message && <div className="mb-4 rounded-md bg-green-50 text-green-700 text-sm px-3 py-2">{message}</div>}
      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      {overview && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 max-w-4xl">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Stored runs</p>
              <p className="text-lg font-semibold text-slate-900">{overview.total}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Size</p>
              <p className="text-lg font-semibold text-slate-900">{formatBytes(overview.bytes)}</p>
            </div>
            {overview.byType.map((row) => (
              <div key={row.docType} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500 capitalize">{row.docType}</p>
                <p className="text-lg font-semibold text-slate-900">{row.count}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value);
                setPage(1);
                setSelected(new Set());
              }}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              <option value="">All document types</option>
              {overview.byType.map((row) => (
                <option key={row.docType} value={row.docType}>
                  {row.docType} ({row.count})
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || !overview.total}
              onClick={() => exportCardMakerData(docType).catch((err) => setError(err instanceof Error ? err.message : "Export failed."))}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Download training data (ZIP){docType ? ` - ${docType}` : ""}
            </button>
            <button
              type="button"
              disabled={busy || !selected.size}
              onClick={() => remove({ ids: Array.from(selected) }, `Delete ${selected.size} selected run(s)?`)}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
            >
              <Trash2 size={14} /> Delete selected ({selected.size})
            </button>
            <button
              type="button"
              disabled={busy || !overview.total}
              onClick={() => remove({ all: true }, `Delete ALL ${overview.total} stored run(s)?`)}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"
            >
              Delete all
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2 w-8">
                    <input
                      type="checkbox"
                      checked={allOnPage}
                      onChange={() =>
                        setSelected((current) => {
                          const next = new Set(current);
                          runs.forEach((run) => (allOnPage ? next.delete(run.id) : next.add(run.id)));
                          return next;
                        })
                      }
                      aria-label="Select all on this page"
                    />
                  </th>
                  <th className="px-4 py-2 font-medium">#</th>
                  <th className="px-4 py-2 font-medium">Document</th>
                  <th className="px-4 py-2 font-medium">Output</th>
                  <th className="px-4 py-2 font-medium">Input PDF</th>
                  <th className="px-4 py-2 font-medium">Output PDF</th>
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">When</th>
                  <th className="px-4 py-2 font-medium">Delete</th>
                </tr>
              </thead>
              <tbody>
                {runs.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                      Nothing stored.
                    </td>
                  </tr>
                )}
                {runs.map((run) => (
                  <tr key={run.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <input type="checkbox" checked={selected.has(run.id)} onChange={() => toggle(run.id)} aria-label={`Select run ${run.id}`} />
                    </td>
                    <td className="px-4 py-2 text-slate-700">{run.id}</td>
                    <td className="px-4 py-2 text-slate-800 capitalize">
                      {run.docType || "-"} <span className="text-xs text-slate-400">{run.mode}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-700">{run.kind}</td>
                    <td className="px-4 py-2">
                      <button type="button" onClick={() => downloadCardMakerFile(run.id, "input").catch((err) => setError(err instanceof Error ? err.message : "Download failed."))} className="inline-flex items-center gap-1 text-indigo-700 hover:underline">
                        <Download size={13} /> {formatBytes(run.inputBytes)}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <button type="button" onClick={() => downloadCardMakerFile(run.id, "output").catch((err) => setError(err instanceof Error ? err.message : "Download failed."))} className="inline-flex items-center gap-1 text-indigo-700 hover:underline">
                        <Download size={13} /> {formatBytes(run.outputBytes)}
                      </button>
                    </td>
                    <td className="px-4 py-2 text-slate-600">{run.email || "not logged in"}</td>
                    <td className="px-4 py-2 text-slate-500">{new Date(run.createdAt).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2">
                      <button type="button" disabled={busy} onClick={() => remove({ ids: [run.id] }, `Delete run #${run.id}?`)} title="Delete this run" className="text-slate-400 hover:text-red-600 disabled:opacity-30">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
