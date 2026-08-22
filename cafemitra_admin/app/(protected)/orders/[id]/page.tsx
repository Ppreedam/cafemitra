"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchOrderDetail, type AdminOrder } from "@/lib/api";
import { formatCurrency, orderResultMessage } from "@/lib/format";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDetail(Number(id))
      .then((res) => setOrder(res.order))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load order."));
  }, [id]);

  if (error) {
    return <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>;
  }
  if (!order) {
    return <p className="text-sm text-slate-500">Loading order...</p>;
  }

  const rows: [string, string][] = [
    ["Order number", order.orderNumber],
    ["Shop", order.shopName || order.shopEmail],
    ["Service", order.serviceName],
    ["Amount", formatCurrency(order.totalAmount)],
    ["Payment mode", order.paymentMode],
    ["Payment status", order.paymentStatus],
    ["Status", order.status],
    ["Result / Message", orderResultMessage({ order })],
    ["Created", new Date(order.createdAt).toLocaleString("en-IN")],
  ];

  return (
    <div>
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-3">
        <ArrowLeft size={14} /> Back to orders
      </Link>
      <h1 className="text-xl font-semibold text-slate-900 mb-4">{order.orderNumber}</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-4 max-w-xl">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <Link href={`/shops/${order.shopId}`} className="text-sm text-indigo-700 hover:underline">
            View shop &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
