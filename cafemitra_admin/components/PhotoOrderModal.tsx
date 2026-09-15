"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchOrderDetail, type AdminOrder } from "@/lib/api";

export default function PhotoOrderModal({ orderId, onClose }: { orderId: number; onClose: () => void }) {
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrderDetail(orderId)
      .then((res) => setOrder(res.order))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load order."));
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-4xl rounded-xl bg-white p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">{order?.orderNumber || "Passport photo order"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">
            Close
          </button>
        </div>

        {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-xs px-3 py-2">{error}</div>}

        {!order && !error && <p className="text-sm text-slate-500">Loading...</p>}

        {order && (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-2">Input (uploaded photo)</p>
                {order.hasRawPhoto && order.fileUrl && !order.documentDeleted ? (
                  <img src={order.fileUrl} alt="Input" className="w-full rounded-md border border-slate-200" />
                ) : (
                  <p className="text-sm text-slate-500">{order.documentDeleted ? "The file was deleted." : "No input file."}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Output (generated photo)</p>
                {order.hasGeminiPhoto && order.geminiPhoto ? (
                  <img src={order.geminiPhoto} alt="Output" className="w-full rounded-md border border-slate-200" />
                ) : (
                  <p className="text-sm text-slate-500">{order.photoErrorMessage || "No output generated yet."}</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href={`/orders/${order.id}`} className="text-sm text-indigo-700 hover:underline">
                View full order details &rarr;
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
