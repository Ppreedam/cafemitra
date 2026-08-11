"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPrintAgentStats, type PrintAgentFailedJob, type PrintAgentShopStatus } from "@/lib/api";
import { formatRelativeTime } from "@/lib/format";

export default function PrintAgentPage() {
  const [shops, setShops] = useState<PrintAgentShopStatus[]>([]);
  const [failedJobs, setFailedJobs] = useState<PrintAgentFailedJob[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPrintAgentStats()
      .then((res) => {
        setShops(res.shops);
        setFailedJobs(res.recentFailedJobs);
        setOnlineCount(res.onlineCount);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load agent stats."));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Desktop Print Agent Monitoring</h1>
      <p className="text-sm text-slate-500 mb-4">
        {onlineCount} shop{onlineCount === 1 ? "" : "s"} with an agent seen in the last 5 minutes. Version-per-shop
        isn&apos;t available yet - the desktop agent doesn&apos;t report its version anywhere today.
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
                  <td className="px-4 py-2 text-slate-700">{job.shopName}</td>
                  <td className="px-4 py-2 text-slate-500 max-w-xs truncate">{job.agentMessage || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
