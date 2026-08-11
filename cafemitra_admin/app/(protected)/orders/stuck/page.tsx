"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchStuckOrders, type StuckOrder } from "@/lib/api";

function StuckTable({ title, rows }: { title: string; rows: StuckOrder[] }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto mb-6">
      <h2 className="px-4 py-3 text-sm font-semibold text-slate-900 border-b border-slate-200">
        {title} ({rows.length})
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="px-4 py-2 font-medium">Order</th>
            <th className="px-4 py-2 font-medium">Shop</th>
            <th className="px-4 py-2 font-medium">Service</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                Nothing stuck here.
              </td>
            </tr>
          )}
          {rows.map((order) => (
            <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-4 py-2">
                <Link href={`/orders/${order.id}`} className="text-indigo-700 hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-700">
                <Link href={`/shops/${order.shopId}`} className="hover:underline">
                  {order.shopName}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-700">{order.serviceName}</td>
              <td className="px-4 py-2 text-slate-700">{order.status || order.photoStatus}</td>
              <td className="px-4 py-2 text-slate-500">{new Date(order.createdAt).toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StuckOrdersPage() {
  const [data, setData] = useState<{ awaitingApproval: StuckOrder[]; stuckPhotoJobs: StuckOrder[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStuckOrders()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load stuck orders."));
  }, []);

  return (
    <div>
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-3">
        <ArrowLeft size={14} /> Back to orders
      </Link>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Stuck Orders</h1>
      <p className="text-sm text-slate-500 mb-4">
        Cash-counter orders awaiting approval for 30+ minutes, and passport-photo AI jobs stuck pending/claimed for 60+ seconds.
      </p>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      {data && (
        <>
          <StuckTable title="Awaiting approval" rows={data.awaitingApproval} />
          <StuckTable title="Stuck photo jobs" rows={data.stuckPhotoJobs} />
        </>
      )}
    </div>
  );
}
