"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import {
  assignInfluencer,
  createInfluencerCoupon,
  fetchInfluencerDetail,
  fetchInfluencers,
  removeInfluencer,
  updateInfluencer,
  type AdminInfluencer,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Pill({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ok ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      {ok ? yes : no}
    </span>
  );
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<AdminInfluencer[]>([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminInfluencer | null>(null);
  const [couponAmount, setCouponAmount] = useState("50");
  const [couponCode, setCouponCode] = useState("");
  const [couponMax, setCouponMax] = useState("");
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  function load() {
    fetchInfluencers()
      .then((res) => setInfluencers(res.influencers))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load influencers."));
  }

  function loadDetail(id: number) {
    fetchInfluencerDetail(id)
      .then((res) => setDetail(res.influencer))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load influencer."));
  }

  useEffect(load, []);

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    setAssigning(true);
    setError("");
    try {
      const res = await assignInfluencer({ email: email.trim() });
      setEmail("");
      load();
      setOpenId(res.influencer.id);
      loadDetail(res.influencer.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not assign influencer.");
    } finally {
      setAssigning(false);
    }
  }

  function toggleOpen(id: number) {
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetail(null);
    loadDetail(id);
  }

  async function handleCreateCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!detail) return;
    setCreatingCoupon(true);
    setError("");
    try {
      await createInfluencerCoupon(detail.id, {
        code: couponCode.trim() || undefined,
        amount: Number(couponAmount),
        maxRedemptions: couponMax ? Number(couponMax) : null,
      });
      setCouponCode("");
      setCouponMax("");
      loadDetail(detail.id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon.");
    } finally {
      setCreatingCoupon(false);
    }
  }

  async function handleToggleActive(item: AdminInfluencer) {
    setError("");
    try {
      await updateInfluencer(item.id, { isActive: !item.isActive });
      load();
      if (openId === item.id) loadDetail(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update influencer.");
    }
  }

  async function handleRemove(item: AdminInfluencer) {
    if (!window.confirm(`Remove ${item.name} as an influencer? Their coupons stay, but are no longer reported against them.`)) return;
    setError("");
    try {
      await removeInfluencer(item.id);
      if (openId === item.id) {
        setOpenId(null);
        setDetail(null);
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove influencer.");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Influencers</h1>
      <p className="text-sm text-slate-500 mb-4">
        Assign a customer as an influencer, generate coupon codes for them, and track everyone who joins through their referral code or
        coupons - email verified and wallet top-up status included.
      </p>

      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <form onSubmit={handleAssign} className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm text-slate-700">
          <div className="mb-1 font-medium">Assign a customer by email</div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            className="w-72 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          disabled={assigning}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {assigning ? "Assigning..." : "Make influencer"}
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Influencer</th>
              <th className="px-4 py-2 font-medium">Referral code</th>
              <th className="px-4 py-2 font-medium">Coupons</th>
              <th className="px-4 py-2 font-medium">Users</th>
              <th className="px-4 py-2 font-medium">Email verified</th>
              <th className="px-4 py-2 font-medium">Topped up</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {influencers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                  No influencers yet.
                </td>
              </tr>
            )}
            {influencers.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2">
                    <div className="font-medium text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.email}</div>
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-700">{item.referralCode}</td>
                  <td className="px-4 py-2">{item.couponCount}</td>
                  <td className="px-4 py-2">{item.totals.users}</td>
                  <td className="px-4 py-2">{item.totals.emailVerified}</td>
                  <td className="px-4 py-2">
                    {item.totals.firstTopup} <span className="text-xs text-slate-500">({formatCurrency(item.totals.topupAmount)})</span>
                  </td>
                  <td className="px-4 py-2">
                    <Pill ok={item.isActive} yes="Active" no="Disabled" />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => toggleOpen(item.id)} className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline">
                        {openId === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Details
                      </button>
                      <button onClick={() => handleToggleActive(item)} className="text-xs font-medium text-slate-600 hover:underline">
                        {item.isActive ? "Disable" : "Enable"}
                      </button>
                      <button onClick={() => handleRemove(item)} className="text-red-600 hover:text-red-700" aria-label="Remove influencer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {openId === item.id && (
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <td colSpan={8} className="px-4 py-4">
                      {!detail ? (
                        <div className="text-slate-500">Loading...</div>
                      ) : (
                        <div className="space-y-5">
                          <div>
                            <div className="mb-2 text-sm font-medium text-slate-800">Coupon codes</div>
                            <form onSubmit={handleCreateCoupon} className="mb-3 flex flex-wrap items-end gap-2 text-sm">
                              <label>
                                <div className="mb-1 text-xs text-slate-500">Credit amount (Rs.)</div>
                                <input
                                  type="number"
                                  min="1"
                                  required
                                  value={couponAmount}
                                  onChange={(e) => setCouponAmount(e.target.value)}
                                  className="w-28 rounded-md border border-slate-300 px-2 py-1"
                                />
                              </label>
                              <label>
                                <div className="mb-1 text-xs text-slate-500">Code (blank = auto)</div>
                                <input
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                  className="w-36 rounded-md border border-slate-300 px-2 py-1 font-mono"
                                />
                              </label>
                              <label>
                                <div className="mb-1 text-xs text-slate-500">Max uses (blank = unlimited)</div>
                                <input
                                  type="number"
                                  min="1"
                                  value={couponMax}
                                  onChange={(e) => setCouponMax(e.target.value)}
                                  className="w-28 rounded-md border border-slate-300 px-2 py-1"
                                />
                              </label>
                              <button
                                disabled={creatingCoupon}
                                className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                              >
                                {creatingCoupon ? "Creating..." : "Generate coupon"}
                              </button>
                            </form>
                            {detail.coupons && detail.coupons.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {detail.coupons.map((coupon) => (
                                  <span key={coupon.id} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs">
                                    <span className="font-mono font-medium text-slate-800">{coupon.code}</span> - {formatCurrency(coupon.amount)} -{" "}
                                    {coupon.redeemedCount} used{coupon.isActive ? "" : " (disabled)"}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">No coupons yet.</div>
                            )}
                          </div>

                          <div>
                            <div className="mb-2 text-sm font-medium text-slate-800">
                              Users brought in ({detail.totals.users}) - {detail.totals.emailVerified} email verified, {detail.totals.firstTopup} topped up
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-200 text-left text-slate-500">
                                    <th className="px-3 py-2 font-medium">User</th>
                                    <th className="px-3 py-2 font-medium">Phone</th>
                                    <th className="px-3 py-2 font-medium">Via</th>
                                    <th className="px-3 py-2 font-medium">Joined</th>
                                    <th className="px-3 py-2 font-medium">Email</th>
                                    <th className="px-3 py-2 font-medium">Wallet top-up</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(detail.users || []).length === 0 && (
                                    <tr>
                                      <td colSpan={6} className="px-3 py-4 text-center text-slate-500">
                                        Nobody has joined through this influencer yet.
                                      </td>
                                    </tr>
                                  )}
                                  {(detail.users || []).map((user) => (
                                    <tr key={user.id} className="border-b border-slate-100 last:border-0">
                                      <td className="px-3 py-2">
                                        <div className="font-medium text-slate-800">{user.name}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                      </td>
                                      <td className="px-3 py-2">{user.phone || "-"}</td>
                                      <td className="px-3 py-2">{user.source}</td>
                                      <td className="px-3 py-2">{formatDate(user.joinedAt)}</td>
                                      <td className="px-3 py-2">
                                        <Pill ok={user.emailVerified} yes="Verified" no="Pending" />
                                      </td>
                                      <td className="px-3 py-2">
                                        {user.firstTopupDone ? (
                                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                            Done - {formatCurrency(user.topupTotal)}
                                          </span>
                                        ) : (
                                          <Pill ok={false} yes="" no="Not yet" />
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
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
