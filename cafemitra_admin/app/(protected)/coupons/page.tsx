"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { createCoupon, deleteCoupon, fetchCoupons, fetchCouponDetail, updateCoupon, type AdminCoupon, type CouponRedemptionEntry } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

function toDatetimeLocal(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [expandedCouponId, setExpandedCouponId] = useState<number | null>(null);
  const [redemptionsByCoupon, setRedemptionsByCoupon] = useState<Record<number, CouponRedemptionEntry[]>>({});
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("50");
  const [message, setMessage] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function load() {
    fetchCoupons()
      .then((res) => setCoupons(res.coupons))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load coupons."));
  }

  useEffect(load, []);

  function resetForm() {
    setCode("");
    setAmount("50");
    setMessage("");
    setMaxRedemptions("");
    setExpiresAt("");
    setEditingCoupon(null);
    setShowForm(false);
  }

  function startEdit(coupon: AdminCoupon) {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setAmount(String(coupon.amount));
    setMessage(coupon.message);
    setMaxRedemptions(coupon.maxRedemptions ? String(coupon.maxRedemptions) : "");
    setExpiresAt(toDatetimeLocal(coupon.expiresAt));
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, {
          code: code.trim(),
          amount: Number(amount),
          message,
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
          expiresAt: expiresAt || null,
        });
      } else {
        await createCoupon({
          code: code.trim() || undefined,
          amount: Number(amount),
          message,
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
          expiresAt: expiresAt || null,
        });
      }
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Could not ${editingCoupon ? "update" : "create"} coupon.`);
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

  async function handleDelete(coupon: AdminCoupon) {
    if (!window.confirm(`Delete coupon ${coupon.code}? This cannot be undone.`)) return;
    setDeletingId(coupon.id);
    setError("");
    try {
      await deleteCoupon(coupon.id);
      if (editingCoupon?.id === coupon.id) resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete coupon.");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleRedemptions(coupon: AdminCoupon) {
    if (expandedCouponId === coupon.id) {
      setExpandedCouponId(null);
      return;
    }
    setExpandedCouponId(coupon.id);
    if (redemptionsByCoupon[coupon.id]) return;
    setLoadingRedemptions(true);
    setError("");
    try {
      const res = await fetchCouponDetail(coupon.id);
      setRedemptionsByCoupon((prev) => ({ ...prev, [coupon.id]: res.redemptions }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load who redeemed this coupon.");
    } finally {
      setLoadingRedemptions(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-slate-900">Coupon Codes</h1>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setEditingCoupon(null);
              setShowForm(true);
            }
          }}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "Create coupon"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Redeeming a coupon credits a shop&apos;s wallet immediately - spendable on paid tools, but never withdrawable as cash (same
        as the signup bonus).
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 rounded-xl border border-slate-200 bg-white p-4 max-w-md flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-900">{editingCoupon ? `Edit coupon ${editingCoupon.code}` : "New coupon"}</h2>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {editingCoupon ? "Code" : "Code (optional - auto-generated if left blank)"}
            </label>
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
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="self-start rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? (editingCoupon ? "Saving..." : "Creating...") : editingCoupon ? "Save changes" : "Create coupon"}
            </button>
            {editingCoupon && (
              <button
                type="button"
                onClick={resetForm}
                className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
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
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No coupons yet.
                </td>
              </tr>
            )}
            {coupons.map((coupon) => (
              <React.Fragment key={coupon.id}>
              <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2 font-mono font-medium text-slate-900">{coupon.code}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(coupon.amount)}</td>
                <td className="px-4 py-2 text-slate-700 max-w-xs truncate" title={coupon.message}>
                  {coupon.message}
                </td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center gap-1.5 text-slate-700">
                    {coupon.redeemedCount}
                    {coupon.maxRedemptions ? ` / ${coupon.maxRedemptions}` : ""}
                    {coupon.redeemedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleRedemptions(coupon)}
                        title={expandedCouponId === coupon.id ? "Hide who redeemed this" : "See who redeemed this"}
                        className="text-slate-400 hover:text-indigo-600"
                      >
                        {expandedCouponId === coupon.id ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-700">{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={coupon.isActive}
                    onClick={() => toggleActive(coupon)}
                    className="inline-flex items-center gap-2"
                  >
                    <span
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        coupon.isActive ? "bg-green-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          coupon.isActive ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </span>
                    <span className={`text-xs font-medium ${coupon.isActive ? "text-green-700" : "text-slate-500"}`}>
                      {coupon.isActive ? "Active" : "Disabled"}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(coupon)}
                      title="Edit coupon"
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(coupon)}
                      disabled={deletingId === coupon.id}
                      title="Delete coupon"
                      className="text-slate-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedCouponId === coupon.id && (
                <tr className="border-b border-slate-100 last:border-0 bg-slate-50">
                  <td colSpan={7} className="px-4 py-3">
                    {loadingRedemptions && !redemptionsByCoupon[coupon.id] ? (
                      <p className="text-xs text-slate-500">Loading...</p>
                    ) : (redemptionsByCoupon[coupon.id] || []).length === 0 ? (
                      <p className="text-xs text-slate-500">No redemptions yet.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-slate-500">
                            <th className="pb-1 pr-4 font-medium">Shop</th>
                            <th className="pb-1 pr-4 font-medium">Shop code</th>
                            <th className="pb-1 pr-4 font-medium">Email</th>
                            <th className="pb-1 pr-4 font-medium">Phone</th>
                            <th className="pb-1 font-medium">Redeemed at</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(redemptionsByCoupon[coupon.id] || []).map((redemption) => (
                            <tr key={redemption.id} className="border-t border-slate-200">
                              <td className="py-1 pr-4 text-slate-900">{redemption.shopName || "-"}</td>
                              <td className="py-1 pr-4 font-mono text-slate-700">{redemption.shopCode}</td>
                              <td className="py-1 pr-4 text-slate-700">{redemption.email}</td>
                              <td className="py-1 pr-4 text-slate-700">{redemption.phone || "-"}</td>
                              <td className="py-1 text-slate-700">{new Date(redemption.redeemedAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                </tr>
              )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
