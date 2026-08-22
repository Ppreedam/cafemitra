"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { bulkSetShopsActive, fetchShops, type Shop } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const PAGE_SIZE = 10;

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [balanceFilter, setBalanceFilter] = useState("");
  const [cashCounter, setCashCounter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);

  function load() {
    setLoading(true);
    fetchShops({ search, status, balanceFilter, cashCounter, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setShops(res.shops);
        setCount(res.count);
        setPageSize(res.pageSize);
        setError("");
        setSelectedIds(new Set());
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load shops."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, balanceFilter, cashCounter, page]);

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.size === shops.length ? new Set() : new Set(shops.map((s) => s.id))));
  }

  async function handleBulkAction(active: boolean) {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`${active ? "Reactivate" : "Suspend"} ${selectedIds.size} shop(s)?`)) return;
    setBulkBusy(true);
    try {
      await bulkSetShopsActive(Array.from(selectedIds), active);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk action failed.");
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Shops / Cafe Owners</h1>
      <p className="text-sm text-slate-500 mb-4">{count} shops on the platform.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => updateFilter(setSearch)(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={status}
          onChange={(e) => updateFilter(setStatus)(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Suspended</option>
        </select>
        <select
          value={balanceFilter}
          onChange={(e) => updateFilter(setBalanceFilter)(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">All balances</option>
          <option value="negative">Negative balance</option>
        </select>
        <select
          value={cashCounter}
          onChange={(e) => updateFilter(setCashCounter)(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Cash counter: any</option>
          <option value="true">Cash counter: on</option>
          <option value="false">Cash counter: off</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800">
          <span>{selectedIds.size} selected</span>
          <button
            disabled={bulkBusy}
            onClick={() => handleBulkAction(false)}
            className="rounded-md bg-white border border-indigo-200 px-2 py-1 text-xs font-medium hover:bg-indigo-100 disabled:opacity-60"
          >
            Suspend selected
          </button>
          <button
            disabled={bulkBusy}
            onClick={() => handleBulkAction(true)}
            className="rounded-md bg-white border border-indigo-200 px-2 py-1 text-xs font-medium hover:bg-indigo-100 disabled:opacity-60"
          >
            Reactivate selected
          </button>
        </div>
      )}

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium w-8">
                <input
                  type="checkbox"
                  checked={shops.length > 0 && selectedIds.size === shops.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-2 font-medium">Shop</th>
              <th className="px-4 py-2 font-medium">Owner</th>
              <th className="px-4 py-2 font-medium">Balance</th>
              <th className="px-4 py-2 font-medium">Credit limit</th>
              <th className="px-4 py-2 font-medium">Cash counter</th>
              <th className="px-4 py-2 font-medium">Referred by</th>
              <th className="px-4 py-2 font-medium">Signed up</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && shops.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                  No shops match these filters.
                </td>
              </tr>
            )}
            {shops.map((shop) => (
              <tr key={shop.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <input type="checkbox" checked={selectedIds.has(shop.id)} onChange={() => toggleSelected(shop.id)} />
                </td>
                <td className="px-4 py-2">
                  <Link href={`/shops/${shop.id}`} className="font-medium text-indigo-700 hover:underline">
                    {shop.shopName || "(unnamed)"}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  <div>{shop.fullName || "-"}</div>
                  <div className="text-xs text-slate-500">{shop.email}</div>
                </td>
                <td className={`px-4 py-2 font-medium ${shop.balance < 0 ? "text-red-600" : "text-slate-900"}`}>
                  {formatCurrency(shop.balance)}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {shop.creditLimitOverride !== null ? formatCurrency(shop.creditLimitOverride) : "-"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      shop.cashCounterPermitted ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {shop.cashCounterPermitted ? "On" : "Off"}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-700">{shop.referredByAgent?.referralCode ?? "-"}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(shop.dateJoined).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      shop.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {shop.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}
