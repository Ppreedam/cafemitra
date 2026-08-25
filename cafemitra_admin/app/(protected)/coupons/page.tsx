"use client";

import { useEffect, useState } from "react";
import { createCoupon, fetchCoupons, updateCoupon, type AdminCoupon } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("50");
  const [message, setMessage] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetchCoupons()
      .then((res) => setCoupons(res.coupons))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load coupons."));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createCoupon({
        code: code.trim() || undefined,
        amount: Number(amount),
        message,
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
        expiresAt: expiresAt || null,
      });
      setCode("");
      setAmount("50");
      setMessage("");
      setMaxRedemptions("");
      setExpiresAt("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(coupon: AdminCoupon) {
    setError("");
    try {
      await updateCoupon(coupon.id, { isActive: !coupon.isActive });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update coupon.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-slate-900">Coupon Codes</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Create coupon
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Redeeming a coupon credits a shop&apos;s wallet immediately - spendable on paid tools, but never withdrawable as cash (same
        as the signup bonus).
      </p>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-4 rounded-xl border border-slate-200 bg-white p-4 max-w-md flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Code (optional - auto-generated if left blank)</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. DIWALI50"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Credit amount (Rs.)</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Max redemptions (optional)</label>
              <input
                type="number"
                min="1"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                placeholder="Unlimited"
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Message shown to the shop on redemption</label>
            <textarea
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="e.g. Diwali offer! Rs. 50 credited to your wallet."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Expires at (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create coupon"}
          </button>
        </form>
      )}

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Code</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Message</th>
              <th className="px-4 py-2 font-medium">Redeemed</th>
              <th className="px-4 py-2 font-medium">Expires</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No coupons yet.
                </td>
              </tr>
            )}
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2 font-mono font-medium text-slate-900">{coupon.code}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(coupon.amount)}</td>
                <td className="px-4 py-2 text-slate-700 max-w-xs truncate" title={coupon.message}>
                  {coupon.message}
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {coupon.redeemedCount}
                  {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
                </td>
                <td className="px-4 py-2 text-slate-700">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      coupon.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}
                  >
                    {coupon.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
