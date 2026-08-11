"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, ListChecks, Trash2 } from "lucide-react";
import StatCard from "@/components/leads/StatCard";
import QueueFormModal from "@/components/leads/QueueFormModal";
import ImportModal from "@/components/leads/ImportModal";
import Pagination from "@/components/Pagination";
import {
  type QueueItem,
  type ScrapeRun,
  addQueueItem,
  deleteQueueItem,
  fetchQueue,
  fetchScrapeStatus,
  importQueueItems,
  markQueueItemExtracted,
  startScrapeRun,
} from "@/lib/leads";

type StatusFilter = "all" | "true" | "false";
const PAGE_SIZE = 20;
const POLL_MS = 3000;

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(0);
  const [extracted, setExtracted] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<StatusFilter>("false");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [scrapeRun, setScrapeRun] = useState<ScrapeRun | null>(null);
  const [scrapeError, setScrapeError] = useState("");
  const [showLog, setShowLog] = useState(false);
  const [maxPlacesInput, setMaxPlacesInput] = useState("5");
  const wasRunning = useRef(false);

  const load = useCallback((filter: StatusFilter, pageNum: number) => {
    setLoading(true);
    setError("");
    fetchQueue(filter, pageNum, PAGE_SIZE)
      .then((res) => {
        setItems(res.places);
        setCount(res.count);
        setPending(res.pendingCount);
        setExtracted(res.extractedCount);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load queue."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => load(status, page), 0);
    return () => clearTimeout(handle);
  }, [status, page, load]);

  // Check once on mount for an already-in-progress run (e.g. someone else
  // started it, or this page was reloaded mid-run), then poll only while a
  // run is actually running - not on a fixed interval regardless of state.
  useEffect(() => {
    fetchScrapeStatus()
      .then((res) => setScrapeRun(res.run))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (scrapeRun?.status !== "running") {
      if (wasRunning.current) {
        wasRunning.current = false;
        load(status, page);
      }
      return;
    }
    wasRunning.current = true;
    const interval = setInterval(() => {
      fetchScrapeStatus()
        .then((res) => setScrapeRun(res.run))
        .catch(() => {});
    }, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrapeRun?.status]);

  async function handleRunExtractor() {
    setScrapeError("");
    const maxPlaces = Math.max(1, Math.min(15, Number(maxPlacesInput) || 5));
    try {
      const res = await startScrapeRun(maxPlaces);
      setScrapeRun(res.run);
      setShowLog(true);
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : "Could not start the extractor.");
    }
  }

  function handleStatusChange(next: StatusFilter) {
    setStatus(next);
    setPage(1);
  }

  async function handleMarkExtracted(id: number) {
    setBusyId(id);
    try {
      await markQueueItemExtracted(id);
      load(status, page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this place from the queue?")) return;
    setBusyId(id);
    try {
      await deleteQueueItem(id);
      load(status, page);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Scrape queue</h1>
          <p className="text-sm text-slate-500">Google Maps links waiting to be extracted into full leads.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            Extract
            <input
              type="number"
              min={1}
              max={15}
              value={maxPlacesInput}
              onChange={(e) => setMaxPlacesInput(e.target.value)}
              disabled={scrapeRun?.status === "running"}
              className="w-14 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-center disabled:opacity-50"
            />
            at a time
          </label>
          <button
            onClick={handleRunExtractor}
            disabled={scrapeRun?.status === "running"}
            className="inline-flex items-center gap-1.5 rounded-md border border-indigo-300 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
          >
            <Bot size={14} />
            {scrapeRun?.status === "running" ? "Extracting..." : "Run extractor"}
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Bulk import
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Add place
          </button>
        </div>
      </div>

      {scrapeError && <p className="text-sm text-red-600">{scrapeError}</p>}

      {scrapeRun && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-indigo-600" />
              <span className="text-sm font-medium text-slate-900">
                {scrapeRun.status === "running"
                  ? `Extracting via Selenium - ${scrapeRun.processedCount}/${scrapeRun.maxPlaces} processed`
                  : scrapeRun.status === "completed"
                    ? `Last run completed - ${scrapeRun.successCount} saved, ${scrapeRun.failedCount} failed`
                    : `Last run failed`}
              </span>
              {scrapeRun.status === "running" && (
                <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
            </div>
            <button
              onClick={() => setShowLog((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
            >
              {showLog ? "Hide log" : "Show log"}
              {showLog ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
          {scrapeRun.status === "running" && (
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min(100, (scrapeRun.processedCount / Math.max(1, scrapeRun.maxPlaces)) * 100)}%` }}
              />
            </div>
          )}
          {scrapeRun.errorMessage && <p className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{scrapeRun.errorMessage}</p>}
          {showLog && (
            <pre className="mt-3 max-h-48 overflow-y-auto rounded-md bg-slate-50 p-3 text-xs text-slate-600 whitespace-pre-wrap">
              {scrapeRun.log || "No log yet."}
            </pre>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Showing" value={count} icon={<ListChecks size={18} />} />
        <StatCard label="Pending" value={pending} icon={<Clock size={18} />} />
        <StatCard label="Extracted" value={extracted} icon={<CheckCircle2 size={18} />} />
      </div>

      <div className="flex gap-1">
        {(["false", "true", "all"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => handleStatusChange(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              status === f ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {f === "false" ? "Pending" : f === "true" ? "Extracted" : "All"}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Link</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Extracted by</th>
              <th className="px-4 py-2.5">Added</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading queue...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Nothing here.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 text-indigo-600 hover:underline"
                    >
                      <span className="truncate">{item.link}</span>
                      <ExternalLink size={11} className="shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.extracted_status ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {item.extracted_status ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {item.extracted_status ? "Extracted" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.extractedby || <span className="text-slate-300">-</span>}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {!item.extracted_status && (
                        <button
                          onClick={() => handleMarkExtracted(item.id)}
                          disabled={busyId === item.id}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} /> Mark extracted
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={busyId === item.id}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} count={count} onPageChange={setPage} />
      </div>

      {showAdd && (
        <QueueFormModal
          onClose={() => setShowAdd(false)}
          onSubmit={async (values) => {
            await addQueueItem(values);
            setShowAdd(false);
            load(status, page);
          }}
        />
      )}

      {showImport && (
        <ImportModal
          title="Bulk import queue"
          placeholder={`[\n  { "name": "Cafe Mitra", "link": "https://maps.google.com/..." }\n]`}
          onClose={() => setShowImport(false)}
          onImport={async (items) => {
            const res = await importQueueItems(items as { name: string; link: string; extractedby?: string }[]);
            load(status, page);
            return res;
          }}
        />
      )}
    </div>
  );
}
