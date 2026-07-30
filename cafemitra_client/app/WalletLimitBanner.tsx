"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { apiFetch, hasStoredSession } from "@/lib/api";

type WalletLimits = {
  balance: number;
  limits?: {
    creditLimit: number;
    dailyGraceLimit: number;
    todayGraceUsed: number;
    isLowBalance: boolean;
    isBlocked: boolean;
  };
};

function formatCurrency(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value || 0))}`;
}

/** Drop into any paid-tool page (PrintPilot, Passport Photo) to warn the
 * shop owner when their wallet is low, or block-message them once the
 * grace limit is reached. Fetches independently so it never depends on
 * that page's own state.
 */
export function WalletLimitBanner() {
  const [wallet, setWallet] = useState<WalletLimits | null>(null);

  useEffect(() => {
    if (!hasStoredSession()) return;
    apiFetch("/api/wallet/")
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => setWallet(result))
      .catch(() => undefined);

    function onUpdate() {
      apiFetch("/api/wallet/")
        .then((response) => (response.ok ? response.json() : null))
        .then((result) => setWallet(result))
        .catch(() => undefined);
    }
    window.addEventListener("cafemitra:wallet-updated", onUpdate);
    return () => window.removeEventListener("cafemitra:wallet-updated", onUpdate);
  }, []);

  if (!wallet?.limits?.isBlocked && !wallet?.limits?.isLowBalance) return null;

  const blocked = wallet.limits.isBlocked;

  return (
    <div className={`profile-alert wallet-limit-alert ${blocked ? "error" : "warning"}`}>
      <AlertTriangle size={18} />
      <span>
        {blocked ? (
          <>
            Service credits limit reached ({formatCurrency(wallet.balance)}, minimum allowed {formatCurrency(wallet.limits.creditLimit)}).
            Paid jobs are paused until you top up.
          </>
        ) : (
          <>
            Service credits balance is low ({formatCurrency(wallet.balance)}). You can keep going up to{" "}
            {formatCurrency(wallet.limits.creditLimit)}, capped at {formatCurrency(wallet.limits.dailyGraceLimit)} per day.
          </>
        )}{" "}
        <Link href="/wallet">Top up now</Link>
      </span>
    </div>
  );
}
