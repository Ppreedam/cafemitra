"use client";

import { useEffect, useState } from "react";
import { Check, CircleCheck, Clock3, Copy, Gift, Megaphone, Ticket, Users, Wallet } from "lucide-react";
import { apiFetch, hasStoredSession } from "@/lib/api";
import { DashboardShell } from "../DashboardShell";
import { SkeletonBlock, UiState } from "../UiState";

type InfluencerUser = {
  id: number;
  name: string;
  email: string;
  source: string;
  joinedAt: string;
  emailVerified: boolean;
  firstTopupDone: boolean;
  topupTotal: number;
};

type InfluencerCoupon = {
  id: number;
  code: string;
  amount: number;
  isActive: boolean;
  redeemedCount: number;
  maxRedemptions: number | null;
  expiresAt: string | null;
};

type InfluencerData = {
  referralCode: string;
  coupons: InfluencerCoupon[];
  totals: { users: number; emailVerified: number; firstTopup: number; topupAmount: number };
  users: InfluencerUser[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function InfluencerClient() {
  const [data, setData] = useState<InfluencerData | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    async function load() {
      if (!hasStoredSession()) {
        setMessage("Please login to view your influencer dashboard.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiFetch("/api/influencer/");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not load your dashboard.");
        setData(result);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load your dashboard.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setMessage("Could not copy - please copy it manually.");
    }
  }

  const referralLink = data && typeof window !== "undefined" ? `${window.location.origin}/register?ref=${data.referralCode}` : "";

  return (
    <DashboardShell activePath="/influencer">
      <div className="referral-page">
        <header className="referral-head">
          <h1>Influencer Dashboard</h1>
          <p>Everyone who joined RepetiGo with your referral code or coupon codes, and where each of them stands.</p>
        </header>

        {message ? <p className="referral-message">{message}</p> : null}
        {isLoading ? <SkeletonBlock lines={4} /> : null}

        {data ? (
          <>
            <section className="referral-card">
              <div className="referral-code-block">
                <span>Your referral code</span>
                <strong>{data.referralCode}</strong>
              </div>
              <div className="referral-actions">
                <button type="button" onClick={() => copy("code", data.referralCode)}>
                  {copied === "code" ? <Check size={16} /> : <Copy size={16} />} {copied === "code" ? "Copied" : "Copy code"}
                </button>
                <button type="button" onClick={() => copy("link", referralLink)}>
                  {copied === "link" ? <Check size={16} /> : <Copy size={16} />} {copied === "link" ? "Copied" : "Copy link"}
                </button>
              </div>
            </section>

            <section className="referral-stats" aria-label="Summary">
              <div>
                <Users size={18} />
                <strong>{data.totals.users}</strong>
                <span>Users joined</span>
              </div>
              <div>
                <CircleCheck size={18} />
                <strong>{data.totals.emailVerified}</strong>
                <span>Email verified</span>
              </div>
              <div>
                <Wallet size={18} />
                <strong>{data.totals.firstTopup}</strong>
                <span>Wallet top-up done</span>
              </div>
              <div>
                <Gift size={18} />
                <strong>Rs. {data.totals.topupAmount}</strong>
                <span>Total top-ups</span>
              </div>
            </section>

            <section className="referral-card">
              <h2>Your coupon codes</h2>
              {data.coupons.length ? (
                <div className="referral-actions">
                  {data.coupons.map((coupon) => (
                    <button type="button" key={coupon.id} onClick={() => copy(`c${coupon.id}`, coupon.code)} title="Copy coupon code">
                      {copied === `c${coupon.id}` ? <Check size={16} /> : <Ticket size={16} />} {coupon.code} - Rs. {coupon.amount} -{" "}
                      {coupon.redeemedCount} used{coupon.isActive ? "" : " (disabled)"}
                    </button>
                  ))}
                </div>
              ) : (
                <UiState icon={Megaphone} title="No coupon codes yet" description="Coupon codes issued for you will appear here." />
              )}
            </section>

            <section className="referral-card">
              <h2>Users</h2>
              {data.users.length ? (
                <div className="referral-table-wrap">
                  <table className="referral-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Via</th>
                        <th>Joined</th>
                        <th>Email</th>
                        <th>Wallet top-up</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                            <small>{item.email}</small>
                          </td>
                          <td>{item.source}</td>
                          <td>{formatDate(item.joinedAt)}</td>
                          <td>
                            <span className={`referral-pill ${item.emailVerified ? "done" : ""}`}>
                              {item.emailVerified ? <CircleCheck size={13} /> : <Clock3 size={13} />}{" "}
                              {item.emailVerified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td>
                            <span className={`referral-pill ${item.firstTopupDone ? "done" : ""}`}>
                              {item.firstTopupDone ? <CircleCheck size={13} /> : <Clock3 size={13} />}{" "}
                              {item.firstTopupDone ? `Done - Rs. ${item.topupTotal}` : "Not yet"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <UiState icon={Users} title="No users yet" description="People who sign up with your code or redeem your coupons will show up here." />
              )}
            </section>
          </>
        ) : null}
      </div>
    </DashboardShell>
  );
}
