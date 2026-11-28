"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { fetchPrintAgentStats, type PrintAgentFailedJob, type PrintAgentShopStatus } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";

export default function PrintAgentPage() {
  const [shops, setShops] = useState<PrintAgentShopStatus[]>([]);
  const [failedJobs, setFailedJobs] = useState<PrintAgentFailedJob[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [error, setError] = useState("");
  const [shopsPage, setShopsPage] = useState(1);
  const [jobsPage, setJobsPage] = useState(1);
  const [shopsCount, setShopsCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  // "Online" means seen in the last 5 minutes, so re-fetch every 30s to keep
  // the counts current without a manual reload.
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchPrintAgentStats({ shopsPage, jobsPage })
      .then((res) => {
        setUpdatedAt(new Date());
        setShops(res.shops);
        setFailedJobs(res.recentFailedJobs);
        setOnlineCount(res.onlineCount);
        setShopsCount(res.shopsCount);
        setFailedCount(res.failedCount);
        setPageSize(res.pageSize);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load agent stats."));
  }, [shopsPage, jobsPage, tick]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Desktop Print Agent Monitoring</h1>
      <p className="text-sm text-slate-500 mb-4">
        Online = agent seen in the last 5 minutes. Version-per-shop isn&apos;t available yet - the desktop agent doesn&apos;t
        report its version anywhere today.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-2 max-w-xl">
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <p className="text-xs text-green-700">Online now</p>
          <p className="text-2xl font-semibold text-green-800">{onlineCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Offline</p>
          <p className="text-2xl font-semibold text-slate-800">{Math.max(0, shopsCount - onlineCount)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Total shops with agent</p>
          <p className="text-2xl font-semibold text-slate-900">{shopsCount}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        {updatedAt ? `Updated ${updatedAt.toLocaleTimeString("en-IN")} · refreshes every 30s` : "Loading..."}
      </p>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
          <h2 className="px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">Last seen (by shop)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">Shop</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {shops.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    No agent activity recorded yet.
                  </td>
                </tr>
              )}
              {shops.map((shop) => (
                <tr key={shop.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2">
                    <Link href={`/shops/${shop.id}`} className="text-indigo-700 hover:underline">
                      {shop.shopName || shop.email}
                    </Link>
                    {shop.shopName && <span className="text-xs text-slate-400"> ({shop.email})</span>}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        shop.online ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {shop.online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-500">{shop.lastSeenAt ? formatRelativeTime(shop.lastSeenAt) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={shopsPage} pageSize={pageSize} count={shopsCount} onPageChange={setShopsPage} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
          <h2 className="px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">
            Recent failed print jobs (7 days)
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">Order</th>
                <th className="px-4 py-2 font-medium">Shop</th>
                <th className="px-4 py-2 font-medium">Message</th>
              </tr>
            </thead>
            <tbody>
              {failedJobs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                    No failed jobs in the last 7 days.
                  </td>
                </tr>
              )}
              {failedJobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-2">
                    <Link href={`/orders/${job.id}`} className="text-indigo-700 hover:underline">
                      {job.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {job.shopName || job.shopEmail}
                    {job.shopName && <span className="text-xs text-slate-400"> ({job.shopEmail})</span>}
                  </td>
                  <td className="px-4 py-2 text-slate-500 max-w-xs truncate">{job.agentMessage || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={jobsPage} pageSize={pageSize} count={failedCount} onPageChange={setJobsPage} />
        </div>
      </div>
    </div>
  );
}
