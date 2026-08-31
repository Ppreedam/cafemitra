"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Download, ListChecks, RotateCcw } from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/leads/StatCard";
import Pagination from "@/components/Pagination";
import { exportOrderIssuesCsv, fetchOrderIssues, setOrderIssueReviewed, type OrderIssueGroup } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

type ReviewedFilter = "false" | "true" | "all";
const PAGE_SIZE = 20;

export default function OrderIssuesPage() {
  const [groups, setGroups] = useState<OrderIssueGroup[]>([]);
  const [count, setCount] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [reviewed, setReviewed] = useState<ReviewedFilter>("false");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [expandedShopId, setExpandedShopId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchOrderIssues({ from: dateFrom, to: dateTo, reviewed, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setGroups(res.groups);
        setCount(res.count);
        setOpenCount(res.openCount);
        setReviewedCount(res.reviewedCount);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load order issues."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo, reviewed, page]);

  useEffect(() => {
    const handle = setTimeout(load, 0);
    return () => clearTimeout(handle);
  }, [load]);

  function handleReviewedChange(next: ReviewedFilter) {
    setReviewed(next);
    setPage(1);
  }

  function updateDate(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  function toggleExpanded(shopId: number) {
    setExpandedShopId((current) => (current === shopId ? null : shopId));
  }

  async function handleToggleReviewed(issueId: number, nextReviewed: boolean) {
    setBusyId(issueId);
    try {
      await setOrderIssueReviewed(issueId, nextReviewed);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      await exportOrderIssuesCsv({ from: dateFrom, to: dateTo, reviewed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Order issues</h1>
          <p className="text-sm text-slate-500">Shops whose orders haven&apos;t gone through (failed, queued, or stuck) - grouped one row per shop, work through them one by one.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          <Download size={14} />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Shops" value={count} icon={<ListChecks size={18} />} />
        <StatCard label="Open orders" value={openCount} icon={<AlertTriangle size={18} />} />
        <StatCard label="Resolved orders" value={reviewedCount} icon={<CheckCircle2 size={18} />} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {(["false", "true", "all"] as ReviewedFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => handleReviewedChange(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                reviewed === f ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
              }`}
            >
              {f === "false" ? "Open" : f === "true" ? "Resolved" : "All"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <span>From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => updateDate(setDateFrom)(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <span>To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => updateDate(setDateTo)(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5 w-6" />
              <th className="px-4 py-2.5">Shop</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5">Address</th>
              <th className="px-4 py-2.5">Issues</th>
              <th className="px-4 py-2.5">Most recent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Nothing here.
                </td>
              </tr>
            ) : (
              groups.map((group) => {
                const expanded = expandedShopId === group.shopId;
                const mostRecent = group.issues[0];
                return (
                  <React.Fragment key={group.shopId}>
                    <tr className="cursor-pointer hover:bg-slate-50" onClick={() => toggleExpanded(group.shopId)}>
                      <td className="px-4 py-3 text-slate-400">
                        {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/shops/${group.shopId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-indigo-700 hover:underline"
                        >
                          {group.shopName || "(unnamed)"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{group.email}</div>
                        <div className="text-xs text-slate-500">{group.phone || "-"}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-500" title={group.address}>
                        {group.address || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                          {group.issueCount} order{group.issueCount === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {mostRecent ? new Date(mostRecent.createdAt).toLocaleDateString("en-IN") : "-"}
                      </td>
                    </tr>
                    {expanded && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 px-4 py-3">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="text-left font-medium uppercase tracking-wide text-slate-500">
                                <th className="pb-1.5 pr-4">Order</th>
                                <th className="pb-1.5 pr-4">Status</th>
                                <th className="pb-1.5 pr-4">Amount</th>
                                <th className="pb-1.5 pr-4">Date</th>
                                <th className="pb-1.5 pr-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {group.issues.map((issue) => (
                                <tr key={issue.id}>
                                  <td className="py-2 pr-4">
                                    <div className="font-mono text-slate-700">{issue.orderNumber}</div>
                                    <div className="text-slate-500">{issue.serviceName}</div>
                                  </td>
                                  <td className="py-2 pr-4">
                                    <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700">
                                      {issue.status}
                                    </span>
                                    {issue.agentMessage && (
                                      <div className="mt-1 max-w-[16rem] truncate text-slate-400" title={issue.agentMessage}>
                                        {issue.agentMessage}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2 pr-4 font-medium text-slate-900">{formatCurrency(issue.totalAmount)}</td>
                                  <td className="py-2 pr-4 text-slate-500">{new Date(issue.createdAt).toLocaleString("en-IN")}</td>
                                  <td className="py-2 pr-4 text-right">
                                    {issue.adminReviewed ? (
                                      <button
                                        onClick={() => handleToggleReviewed(issue.id, false)}
                                        disabled={busyId === issue.id}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                                      >
                                        <RotateCcw size={12} /> Reopen
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleToggleReviewed(issue.id, true)}
                                        disabled={busyId === issue.id}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                      >
                                        <CheckCircle2 size={12} /> Mark resolved
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}
