"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import Pagination from "@/components/Pagination";
import PhotoOrderModal from "@/components/PhotoOrderModal";
import { deletePhotoData, fetchPhotoData, type PhotoDataRow } from "@/lib/api";

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return bytes ? `${bytes} B` : "-";
}

type Scope = "uploads" | "generated" | "all";

const SCOPE_TEXT: Record<Scope, string> = {
  uploads: "the customers' uploaded photos",
  generated: "the generated photos (only for printed or failed orders)",
  all: "the uploaded AND generated photos (generated only for printed or failed orders)",
};

export default function PhotoStoragePage() {
  const [rows, setRows] = useState<PhotoDataRow[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [totals, setTotals] = useState({ orders: 0, uploadBytes: 0, outputBytes: 0 });
  const [service, setService] = useState("");
  const [has, setHas] = useState("uploads");
  const [olderThanDays, setOlderThanDays] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchPhotoData({ service, has, olderThanDays, page })
      .then((res) => {
        setRows(res.orders);
        setCount(res.count);
        setPageSize(res.pageSize);
        setTotals(res.totals);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load stored photo data."));
  }, [service, has, olderThanDays, page]);

  useEffect(load, [load]);

  function changeFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
      setSelected(new Set());
    };
  }

  function toggle(id: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allOnPageSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));

  function togglePage() {
    setSelected((current) => {
      const next = new Set(current);
      rows.forEach((row) => (allOnPageSelected ? next.delete(row.id) : next.add(row.id)));
      return next;
    });
  }

  async function run(scope: Scope, target: { ids: number[] } | { all: true }, label: string) {
    if (!window.confirm(`Delete ${SCOPE_TEXT[scope]} for ${label}? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await deletePhotoData({ scope, ...target, service, has, olderThanDays });
      const parts = [`${result.uploadsCleared} upload(s) deleted`, `${result.generatedCleared} generated photo(s) deleted`];
      if (result.generatedSkipped) parts.push(`${result.generatedSkipped} generated photo(s) skipped (still waiting to be printed)`);
      setMessage(parts.join(", ") + ".");
      setSelected(new Set());
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  }

  const selectedIds = Array.from(selected);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Photo Storage</h1>
      <p className="text-sm text-slate-500 mb-4 max-w-3xl">
        Passport and Family Passport photos are stored in the database as base64 text. The customer&apos;s own uploads are deleted
        automatically once the AI photo is generated; older orders and failed or stuck ones can still hold them. Delete them here - one
        order, a selection, or everything that matches the filters.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 max-w-3xl">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Orders matching</p>
          <p className="text-lg font-semibold text-slate-900">{totals.orders}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Stored customer uploads</p>
          <p className="text-lg font-semibold text-slate-900">{formatBytes(totals.uploadBytes)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Stored generated photos</p>
          <p className="text-lg font-semibold text-slate-900">{formatBytes(totals.outputBytes)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select value={service} onChange={(e) => changeFilter(setService)(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          <option value="">Passport + Family</option>
          <option value="passport_photo">Passport Photo</option>
          <option value="family_passport_photo">Family Passport Photo</option>
        </select>
        <select value={has} onChange={(e) => changeFilter(setHas)(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          <option value="uploads">Still storing customer uploads</option>
          <option value="generated">Storing generated photo</option>
          <option value="any">Any stored photo data</option>
        </select>
        <label className="flex items-center gap-1 text-xs text-slate-500">
          Older than
          <input
            type="number"
            min="0"
            value={olderThanDays}
            onChange={(e) => changeFilter(setOlderThanDays)(e.target.value)}
            placeholder="0"
            className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700"
          />
          days
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          disabled={busy || !selectedIds.length}
          onClick={() => run("uploads", { ids: selectedIds }, `${selectedIds.length} selected order(s)`)}
          className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 size={14} /> Delete uploads of selected ({selectedIds.length})
        </button>
        <button
          type="button"
          disabled={busy || !selectedIds.length}
          onClick={() => run("generated", { ids: selectedIds }, `${selectedIds.length} selected order(s)`)}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Delete generated photos of selected
        </button>
        <button
          type="button"
          disabled={busy || !count}
          onClick={() => run("uploads", { all: true }, `ALL ${count} matching order(s)`)}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Delete uploads of all {count} matching
        </button>
      </div>

      {message && <div className="mb-4 rounded-md bg-green-50 text-green-700 text-sm px-3 py-2">{message}</div>}
      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 w-8">
                <input type="checkbox" checked={allOnPageSelected} onChange={togglePage} aria-label="Select all on this page" />
              </th>
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">Shop</th>
              <th className="px-4 py-2 font-medium">Service</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Uploads</th>
              <th className="px-4 py-2 font-medium">Generated</th>
              <th className="px-4 py-2 font-medium">Created</th>
              <th className="px-4 py-2 font-medium">Delete</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                  No stored photo data matches these filters.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggle(row.id)} aria-label={`Select ${row.orderNumber}`} />
                </td>
                <td className="px-4 py-2">
                  <button type="button" onClick={() => setOpenOrderId(row.id)} className="text-indigo-700 hover:underline">
                    {row.orderNumber}
                  </button>
                </td>
                <td className="px-4 py-2 text-slate-700">{row.shopName || row.shopEmail}</td>
                <td className="px-4 py-2 text-slate-700">{row.serviceName}</td>
                <td className="px-4 py-2 text-slate-700">
                  {row.status}
                  {row.photoStatus ? <span className="text-xs text-slate-400"> ({row.photoStatus})</span> : null}
                </td>
                <td className="px-4 py-2 text-slate-700">{formatBytes(row.uploadBytes)}</td>
                <td className="px-4 py-2 text-slate-700">{formatBytes(row.outputBytes)}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(row.createdAt).toLocaleString("en-IN")}</td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    disabled={busy || !row.uploadBytes}
                    onClick={() => run("uploads", { ids: [row.id] }, row.orderNumber)}
                    title={row.uploadBytes ? "Delete this order's uploaded photos" : "No uploads stored"}
                    className="text-slate-400 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>

      {openOrderId !== null && <PhotoOrderModal orderId={openOrderId} onClose={() => setOpenOrderId(null)} />}
    </div>
  );
}
