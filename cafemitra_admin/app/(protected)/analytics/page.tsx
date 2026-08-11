"use client";

import { useEffect, useState } from "react";
import SignupBarChart from "@/components/SignupBarChart";
import { fetchSignupAnalytics, type SignupAnalytics } from "@/lib/api";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function AnalyticsPage() {
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));
  const [granularity, setGranularity] = useState("day");
  const [data, setData] = useState<SignupAnalytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSignupAnalytics({ from, to, granularity })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load analytics."));
  }, [from, to, granularity]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Signup Analytics</h1>
      <p className="text-sm text-slate-500 mb-4">How many new shops signed up, and who referred them.</p>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Granularity</label>
          <select value={granularity} onChange={(e) => setGranularity(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => {
                setFrom(isoDaysAgo(days));
                setTo(isoDaysAgo(0));
              }}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Last {days}d
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      {data && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Signups over time</h2>
              <span className="text-2xl font-semibold text-slate-900">{data.totalSignups}</span>
            </div>
            <SignupBarChart series={data.series} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <h2 className="px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">By referral source</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">Source</th>
                  <th className="px-4 py-2 font-medium">Signups</th>
                </tr>
              </thead>
              <tbody>
                {data.byReferralAgent.map((row) => (
                  <tr key={row.referralCode} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 text-slate-700">{row.referralCode}</td>
                    <td className="px-4 py-2 text-slate-900 font-medium">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
