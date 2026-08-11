"use client";

import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";
import { fetchActivityLog, type AdminActivityLogEntry } from "@/lib/api";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<AdminActivityLogEntry[]>([]);
  const [targetType, setTargetType] = useState("");
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActivityLog({ targetType: targetType || undefined, page })
      .then((res) => {
        setLogs(res.logs);
        setCount(res.count);
        setPageSize(res.pageSize);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load activity log."));
  }, [targetType, page]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Admin Activity Log</h1>
      <p className="text-sm text-slate-500 mb-4">{count} actions recorded. Every mutating admin action is logged here for accountability.</p>

      <div className="mb-3">
        <select
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">All targets</option>
          <option value="shop">Shop</option>
          <option value="withdrawal">Withdrawal</option>
          <option value="agent">Agent</option>
          <option value="wallet_setting">Wallet Setting</option>
          <option value="tool_pricing">Tool Pricing</option>
          <option value="contact_message">Contact Message</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Admin</th>
              <th className="px-4 py-2 font-medium">Action</th>
              <th className="px-4 py-2 font-medium">Target</th>
              <th className="px-4 py-2 font-medium">Detail</th>
              <th className="px-4 py-2 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No activity recorded yet.
                </td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-700">{log.adminEmail}</td>
                <td className="px-4 py-2 text-slate-700">{log.action}</td>
                <td className="px-4 py-2 text-slate-500">
                  {log.targetType}
                  {log.targetId ? `#${log.targetId}` : ""}
                </td>
                <td className="px-4 py-2 text-slate-500 max-w-md truncate">{log.detail}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(log.createdAt).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}
