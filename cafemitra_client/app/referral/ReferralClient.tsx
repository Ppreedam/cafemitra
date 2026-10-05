"use client";

import { useEffect, useState } from "react";
import { Check, CircleCheck, Clock3, Copy, Gift, Share2, Users } from "lucide-react";
import { apiFetch, hasStoredSession } from "@/lib/api";
import { DashboardShell } from "../DashboardShell";
import { SkeletonBlock, UiState } from "../UiState";

type ReferralItem = {
  id: number;
  name: string;
  email: string;
  registeredAt: string;
  emailVerified: boolean;
  firstTopupDone: boolean;
  bonusPaid: boolean;
  bonusAmount: number | null;
  bonusPaidAt: string | null;
};

type ReferralData = {
  referralCode: string;
  bonusAmount: number;
  trigger: "email_verified" | "first_topup";
  minTopupAmount: number;
  totals: { registered: number; emailVerified: number; firstTopup: number; bonusEarned: number };
  referrals: ReferralItem[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ReferralClient() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  useEffect(() => {
    async function load() {
      if (!hasStoredSession()) {
        setMessage("Please login to view your referrals.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiFetch("/api/referrals/");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not load referrals.");
        setData(result);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load referrals.");
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, []);

  const referralLink = data && typeof window !== "undefined" ? `${window.location.origin}/register?ref=${data.referralCode}` : "";

  async function copy(kind: "code" | "link") {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(kind === "code" ? data.referralCode : referralLink);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setMessage("Could not copy - please copy it manually.");
    }
  }

  async function share() {
    if (!data) return;
    const text = `Join RepetiGo with my code ${data.referralCode} and run your print shop on autopilot.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "RepetiGo", text, url: referralLink });
      } catch {
        // Share sheet dismissed - nothing to do.
      }
    } else {
      void copy("link");
    }
  }

  return (
    <DashboardShell activePath="/referral">
      <div className="referral-page">
        <header className="referral-head">
          <h1>Refer &amp; Earn</h1>
          <p>
            Earn {data ? `Rs. ${data.bonusAmount}` : "a bonus"} in service credits every time a shop you refer{" "}
            {data?.trigger === "first_topup"
              ? `registers and makes a wallet top-up of Rs. ${data.minTopupAmount} or more.`
              : "registers and verifies their email."}
          </p>
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
                <button type="button" onClick={() => copy("code")}>
                  {copied === "code" ? <Check size={16} /> : <Copy size={16} />} {copied === "code" ? "Copied" : "Copy code"}
                </button>
                <button type="button" onClick={() => copy("link")}>
                  {copied === "link" ? <Check size={16} /> : <Copy size={16} />} {copied === "link" ? "Copied" : "Copy link"}
                </button>
                <button type="button" className="referral-share" onClick={share}>
                  <Share2 size={16} /> Share
                </button>
              </div>
            </section>

            <section className="referral-stats" aria-label="Referral summary">
              <div>
                <Users size={18} />
                <strong>{data.totals.registered}</strong>
                <span>Registered</span>
              </div>
              <div>
                <CircleCheck size={18} />
                <strong>{data.totals.emailVerified}</strong>
                <span>Email verified</span>
              </div>
              <div>
                <Gift size={18} />
                <strong>{data.totals.firstTopup}</strong>
                <span>First top-up done</span>
              </div>
              <div>
                <Gift size={18} />
                <strong>Rs. {data.totals.bonusEarned}</strong>
                <span>Bonus earned</span>
              </div>
            </section>

            <section className="referral-card">
              <h2>Referral history</h2>
              {data.referrals.length ? (
                <div className="referral-table-wrap">
                  <table className="referral-table">
                    <thead>
                      <tr>
                        <th>Referred</th>
                        <th>Registered</th>
                        <th>Email verified</th>
                        <th>First top-up</th>
                        <th>Bonus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.referrals.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                            <small>{item.email}</small>
                          </td>
                          <td>{formatDate(item.registeredAt)}</td>
                          <td>
                            <StatusPill done={item.emailVerified} doneLabel="Verified" pendingLabel="Pending" />
                          </td>
                          <td>
                            <StatusPill done={item.firstTopupDone} doneLabel="Done" pendingLabel="Not yet" />
                          </td>
                          <td>
                            {item.bonusPaid ? (
                              <span className="referral-pill done">+ Rs. {item.bonusAmount}</span>
                            ) : (
                              <span className="referral-pill">
                                {data.trigger === "first_topup"
                                  ? item.emailVerified
                                    ? `Awaiting top-up of Rs. ${data.minTopupAmount}+`
                                    : "Awaiting email verification"
                                  : "Awaiting email verification"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <UiState
                  icon={Users}
                  title="No referrals yet"
                  description="Share your code or link. People who sign up with it will show up here."
                />
              )}
            </section>
          </>
        ) : null}
      </div>
    </DashboardShell>
  );
}

function StatusPill({ done, doneLabel, pendingLabel }: { done: boolean; doneLabel: string; pendingLabel: string }) {
  return (
    <span className={`referral-pill ${done ? "done" : ""}`}>
      {done ? <CircleCheck size={13} /> : <Clock3 size={13} />} {done ? doneLabel : pendingLabel}
    </span>
  );
}
