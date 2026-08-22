"use client";

import { useState } from "react";
import { deleteShop } from "@/lib/api";

export default function DeleteShopModal({
  shopId,
  shopName,
  shopEmail,
  onClose,
  onDeleted,
}: {
  shopId: number;
  shopName: string;
  shopEmail: string;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (confirmEmail.trim().toLowerCase() !== shopEmail.trim().toLowerCase()) {
      setError("Email does not match. Type the shop's email exactly to confirm.");
      return;
    }
    setSubmitting(true);
    try {
      await deleteShop(shopId, confirmEmail.trim());
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
        <h2 className="text-sm font-semibold text-red-700 mb-1">Permanently delete {shopName || "this shop"}?</h2>
        <p className="text-xs text-slate-500 mb-4">
          This cannot be undone. It deletes the account, profile, pricing, orders, wallet transactions, withdrawal
          requests, and top-up history for this shop.
        </p>

        {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-xs px-3 py-2">{error}</div>}

        <label className="block text-xs font-medium text-slate-700 mb-1">
          Type the shop&apos;s email (<span className="font-mono">{shopEmail}</span>) to confirm
        </label>
        <input
          type="text"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder={shopEmail}
          className="w-full mb-4 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
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
            disabled={submitting || confirmEmail.trim().toLowerCase() !== shopEmail.trim().toLowerCase()}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </form>
    </div>
  );
}
