"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SignupBarChart from "@/components/SignupBarChart";
import { fetchSignupAnalytics, fetchOrderAnalytics, fetchOrders, type SignupAnalytics, type OrderAnalytics, type AdminOrder } from "@/lib/api";
import { formatCurrency, orderResultMessage } from "@/lib/format";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const TABS = ["Signups", "Orders"] as const;
type Tab = (typeof TABS)[number];

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("Signups");
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));
  const [granularity, setGranularity] = useState("day");
  const [topLimit, setTopLimit] = useState(10);
  const [signupData, setSignupData] = useState<SignupAnalytics | null>(null);
  const [orderData, setOrderData] = useState<OrderAnalytics | null>(null);
  const [failedOrders, setFailedOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tab === "Signups") {
      fetchSignupAnalytics({ from, to, granularity })
        .then(setSignupData)
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load analytics."));
    } else {
      fetchOrderAnalytics({ from, to, granularity, limit: topLimit })
        .then(setOrderData)
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load analytics."));
      fetchOrders({ status: "failed", from, to, page: 1 })
        .then((res) => setFailedOrders(res.orders))
        .catch((err) => setError(err instanceof Error ? err.message : "Failed to load failed orders."));
    }
  }, [tab, from, to, granularity, topLimit]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Analytics</h1>
      <p className="text-sm text-slate-500 mb-4">
        {tab === "Signups" ? "How many new shops signed up, and who referred them." : "Order volume over time, and the shops generating the most orders."}
      </p>

      <div className="flex gap-2 mb-4 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

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

      {tab === "Signups" && signupData && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Signups over time</h2>
              <span className="text-2xl font-semibold text-slate-900">{signupData.totalSignups}</span>
            </div>
            <SignupBarChart series={signupData.series} />
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
                {signupData.byReferralAgent.map((row) => (
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

      {tab === "Orders" && orderData && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Orders over time</h2>
              <div className="flex items-baseline gap-4">
                <span className="text-2xl font-semibold text-slate-900">{orderData.totalOrders}</span>
                <span className="text-sm text-red-600 font-medium">{orderData.failedOrders} failed</span>
              </div>
            </div>
            <SignupBarChart series={orderData.series} />
          </div>

          {orderData.failedOrders > 0 && (
            <div className="rounded-xl border border-red-200 bg-white overflow-x-auto mb-4">
              <h2 className="px-4 py-3 text-sm font-semibold text-red-700 border-b border-red-100">
                Failed orders ({orderData.failedOrders})
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-4 py-2 font-medium">Order</th>
                    <th className="px-4 py-2 font-medium">Shop</th>
                    <th className="px-4 py-2 font-medium">Service</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Reason</th>
                    <th className="px-4 py-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {failedOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-2">
                        <Link href={`/orders/${order.id}`} className="text-indigo-700 hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        <Link href={`/shops/${order.shopId}`} className="hover:underline">
                          {order.shopName || order.shopEmail}
                        </Link>
                        {order.shopName && <span className="text-xs text-slate-400"> ({order.shopEmail})</span>}
                      </td>
                      <td className="px-4 py-2 text-slate-700">{order.serviceName}</td>
                      <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-2 max-w-xs truncate text-slate-600" title={orderResultMessage({ order })}>
                        {orderResultMessage({ order })}
                      </td>
                      <td className="px-4 py-2 text-slate-500">{new Date(order.createdAt).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orderData.failedOrders > failedOrders.length && (
                <p className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100">
                  Showing {failedOrders.length} of {orderData.failedOrders} - see the{" "}
                  <Link href="/orders" className="text-indigo-700 hover:underline">
                    Orders page
                  </Link>{" "}
                  and filter by status "failed" for the rest.
                </p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Top {topLimit} shops by orders</h2>
              <div className="flex gap-2">
                {[10, 20, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTopLimit(n)}
                    className={`rounded-md border px-3 py-1 text-xs font-medium transition ${
                      topLimit === n ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Top {n}
                  </button>
                ))}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">#</th>
                  <th className="px-4 py-2 font-medium">Shop</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Phone</th>
                  <th className="px-4 py-2 font-medium">Orders</th>
                  <th className="px-4 py-2 font-medium">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {orderData.topShops.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      No orders in this range.
                    </td>
                  </tr>
                )}
                {orderData.topShops.map((row, i) => (
                  <tr key={row.shopId} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-2 text-slate-900 font-medium">{row.shopName}</td>
                    <td className="px-4 py-2 text-slate-700">{row.shopEmail}</td>
                    <td className="px-4 py-2 text-slate-700">{row.shopPhone || "-"}</td>
                    <td className="px-4 py-2 text-slate-700">{row.orderCount}</td>
                    <td className="px-4 py-2 text-slate-700">{formatCurrency(row.totalAmount)}</td>
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
