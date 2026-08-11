"use client";

import { useState } from "react";
import { adjustShopBalance } from "@/lib/api";

export default function AdjustBalanceModal({
  shopId,
  onClose,
  onDone,
}: {
  shopId: number;
  onClose: () => void;
  onDone: (balance: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = Number(amount);
    if (!parsed) {
      setError("Enter a non-zero amount (positive to credit, negative to debit).");
      return;
    }
    if (reason.trim().length < 5) {
      setError("Enter a reason (at least 5 characters) - it's recorded on the wallet ledger.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adjustShopBalance(shopId, parsed, reason.trim());
      onDone(res.balance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adjustment failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Manual wallet adjustment</h2>
        <p className="text-xs text-slate-500 mb-4">
          Positive amount credits the wallet, negative debits it. This is logged on the shop&apos;s ledger with your email.
        </p>

        {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-xs px-3 py-2">{error}</div>}

        <label className="block text-xs font-medium text-slate-700 mb-1">Amount (Rs.)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 50 or -20"
          className="w-full mb-3 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <label className="block text-xs font-medium text-slate-700 mb-1">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Refund for failed print job #1234"
          className="w-full mb-4 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Apply adjustment"}
          </button>
        </div>
      </form>
    </div>
  );
}
