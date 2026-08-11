"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import { exportOrdersCsv, fetchOrders, type AdminOrder } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const SERVICES = [
  { value: "", label: "All services" },
  { value: "auto_document_print", label: "Document Print" },
  { value: "passport_photo", label: "Passport Photo" },
];

const STATUSES = ["", "awaiting_payment", "awaiting_approval", "queued", "printing", "printed", "failed"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [service, setService] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders({ service, status, paymentMode, page })
      .then((res) => {
        setOrders(res.orders);
        setCount(res.count);
        setPageSize(res.pageSize);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders."));
  }, [service, status, paymentMode, page]);

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Orders Monitoring</h1>
      <p className="text-sm text-slate-500 mb-4">{count} orders match these filters.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={service} onChange={(e) => updateFilter(setService)(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          {SERVICES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => updateFilter(setStatus)(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || "All status"}
            </option>
          ))}
        </select>
        <select
          value={paymentMode}
          onChange={(e) => updateFilter(setPaymentMode)(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">All payment modes</option>
          <option value="Online Payment">Online Payment</option>
          <option value="Cash Counter">Cash Counter</option>
        </select>
        <Link
          href="/orders/stuck"
          className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          View stuck orders
        </Link>
        <button
          onClick={() => exportOrdersCsv().catch((err) => setError(err instanceof Error ? err.message : "Export failed."))}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </button>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Order</th>
              <th className="px-4 py-2 font-medium">Shop</th>
              <th className="px-4 py-2 font-medium">Service</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Payment</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No orders match these filters.
                </td>
              </tr>
            )}
            {orders.map((order) => (
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
                </td>
                <td className="px-4 py-2 text-slate-700">{order.serviceName}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(order.totalAmount)}</td>
                <td className="px-4 py-2 text-slate-700">
                  {order.paymentMode} <span className="text-xs text-slate-400">({order.paymentStatus})</span>
                </td>
                <td className="px-4 py-2 text-slate-700">{order.status}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(order.createdAt).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}
