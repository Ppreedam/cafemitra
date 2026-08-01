"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, ExternalLink, ListChecks, Trash2 } from "lucide-react";
import StatCard from "@/components/StatCard";
import QueueFormModal from "@/components/QueueFormModal";
import ImportModal from "@/components/ImportModal";
import {
  QueueItem,
  addQueueItem,
  deleteQueueItem,
  fetchQueue,
  importQueueItems,
  markQueueItemExtracted,
} from "@/lib/api";

type StatusFilter = "all" | "true" | "false";

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<StatusFilter>("false");
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback((filter: StatusFilter) => {
    setLoading(true);
    setError("");
    fetchQueue(filter)
      .then((res) => setItems(res.places))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load queue."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => load(status), 0);
    return () => clearTimeout(handle);
  }, [status, load]);

  const pending = items.filter((i) => !i.extracted_status).length;
  const extracted = items.filter((i) => i.extracted_status).length;

  async function handleMarkExtracted(id: number) {
    setBusyId(id);
    try {
      await markQueueItemExtracted(id);
      if (status === "false") {
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, extracted_status: true } : i)));
      }
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
      setItems((prev) => prev.filter((i) => i.id !== id));
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
        <div className="flex gap-2">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Showing" value={items.length} icon={<ListChecks size={18} />} />
        <StatCard label="Pending" value={pending} icon={<Clock size={18} />} />
        <StatCard label="Extracted" value={extracted} icon={<CheckCircle2 size={18} />} />
      </div>

      <div className="flex gap-1">
        {(["false", "true", "all"] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
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
      </div>

      {showAdd && (
        <QueueFormModal
          onClose={() => setShowAdd(false)}
          onSubmit={async (values) => {
            const created = await addQueueItem(values);
            setItems((prev) => [created.place, ...prev]);
            setShowAdd(false);
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
            load(status);
            return res;
          }}
        />
      )}
    </div>
  );
}
