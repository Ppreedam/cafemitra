"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchOrderDetail, type AdminOrder } from "@/lib/api";
import { formatCurrency, orderResultMessage, orderEffectiveStatus } from "@/lib/format";

function isImageFile(name: string) {
  return /\.(jpe?g|png|gif|webp|bmp)$/i.test(name);
}

function isImageUrl(name: string, url: string) {
  return isImageFile(name) || url.startsWith("data:image");
}

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

  const isPhotoJob = order.serviceKey === "passport_photo" || order.hasGeminiPhoto || Boolean(order.photoStatus);

  const rows: [string, string][] = [
    ["Order number", order.orderNumber],
    ["Shop", order.shopName || order.shopEmail],
    ["Service", order.serviceName],
    ["Amount", formatCurrency(order.totalAmount)],
    ["Payment mode", order.paymentMode],
    ["Payment status", order.paymentStatus],
    ["Status", orderEffectiveStatus({ order })],
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

      {isPhotoJob ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 mt-4 max-w-3xl">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-2">Input (uploaded photo)</p>
              {order.hasRawPhoto && order.fileUrl && !order.documentDeleted ? (
                <img src={order.fileUrl} alt="Input" className="max-w-xs rounded-md border border-slate-200" />
              ) : (
                <p className="text-sm text-slate-500">{order.documentDeleted ? "The file was deleted." : "No input file."}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">Output (generated photo)</p>
              {order.hasGeminiPhoto && order.geminiPhoto ? (
                <img src={order.geminiPhoto} alt="Output" className="max-w-xs rounded-md border border-slate-200" />
              ) : (
                <p className="text-sm text-slate-500">{order.photoErrorMessage || "No output generated yet."}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4 mt-4 max-w-xl">
          <p className="text-sm text-slate-500 mb-2">Generated output</p>
          {order.fileUrl && !order.documentDeleted ? (
            isImageUrl(order.fileName || "", order.fileUrl) ? (
              <img src={order.fileUrl} alt="Generated output" className="max-w-xs rounded-md border border-slate-200" />
            ) : (
              <a
                href={order.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-700 hover:underline"
              >
                Download {order.fileName || "file"} &rarr;
              </a>
            )
          ) : (
            <p className="text-sm text-slate-500">{order.documentDeleted ? "The file was deleted." : "No output generated yet."}</p>
          )}
        </div>
      )}
    </div>
  );
}
