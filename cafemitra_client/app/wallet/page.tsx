"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowUpToLine, Banknote, Clock3, ReceiptText, Ticket, Wallet } from "lucide-react";
import { apiFetch, hasStoredSession } from "@/lib/api";
import { DashboardShell } from "../DashboardShell";
import { SkeletonBlock, UiState } from "../UiState";

type WalletTransaction = {
  id: number;
  kind: string;
  direction: "credit" | "debit" | "info";
  amount: number;
  affectsBalance: boolean;
  note: string;
  orderId?: number;
  createdAt: string;
};

type Withdrawal = {
  id: number;
  amount: number;
  feeAmount: number;
  method: string;
  accountDetail: string;
  note: string;
  status: string;
  createdAt: string;
};

type WalletData = {
  balance: number;
  summary: {
    onlineCollected: number;
    cashCounterCollected: number;
    totalCollected: number;
    signupBonusCredited: number;
    couponCreditReceived: number;
    netWithdrawable: number;
    pendingWithdrawal: number;
    paidWithdrawal: number;
    withdrawalFeePercent: number;
  };
  limits: {
    creditLimit: number;
    dailyGraceLimit: number;
    todayGraceUsed: number;
    isLowBalance: boolean;
    isBlocked: boolean;
  };
  transactions: WalletTransaction[];
  ledgerPagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  withdrawals: Withdrawal[];
};

const emptyWallet: WalletData = {
  balance: 0,
  summary: {
    onlineCollected: 0,
    cashCounterCollected: 0,
    totalCollected: 0,
    signupBonusCredited: 0,
    couponCreditReceived: 0,
    netWithdrawable: 0,
    pendingWithdrawal: 0,
    paidWithdrawal: 0,
    withdrawalFeePercent: 0,
  },
  limits: {
    creditLimit: -50,
    dailyGraceLimit: 5,
    todayGraceUsed: 0,
    isLowBalance: false,
    isBlocked: false,
  },
  transactions: [],
  ledgerPagination: {
    page: 1,
    pageSize: 8,
    total: 0,
    totalPages: 1,
  },
  withdrawals: [],
};

type LedgerType = "all" | "withdrawable" | "tracked";

const upiIdPattern = /^[A-Za-z0-9._-]{2,256}@[A-Za-z0-9]{2,64}$/;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => reject(new Error("Razorpay Checkout could not load."));
    document.body.appendChild(script);
  });
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData>(emptyWallet);
  const [message, setMessage] = useState("Loading wallet...");
  const [messageKind, setMessageKind] = useState<"success" | "error">("error");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [accountDetail, setAccountDetail] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ledgerType, setLedgerType] = useState<LedgerType>("all");
  const [ledgerFrom, setLedgerFrom] = useState("");
  const [ledgerTo, setLedgerTo] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);
  const [topupAmount, setTopupAmount] = useState("100");
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topupMessage, setTopupMessage] = useState("");
  const [topupMessageKind, setTopupMessageKind] = useState<"success" | "error">("error");
  const [couponCode, setCouponCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState("");
  const [redeemMessageKind, setRedeemMessageKind] = useState<"success" | "error">("error");
  const [historyTab, setHistoryTab] = useState<"ledger" | "withdrawals">("ledger");

  useEffect(() => {
    loadWallet();
  }, [ledgerPage, ledgerType, ledgerFrom, ledgerTo]);

  // Razorpay resolves the payment client-side, but PayU/PhonePe are
  // full-page redirects - after the backend callback sends the browser back
  // here, recover the result from the ?topup=&payment= query params it appended.
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentResult = searchParams.get("payment");
    if (!searchParams.get("topup")) return;
    if (paymentResult === "success") {
      setMessageKind("success");
      setMessage("Top-up successful. Your wallet balance has been updated.");
      loadWallet();
    } else if (paymentResult === "failure") {
      setMessageKind("error");
      setMessage("Top-up payment was not completed. Please try again.");
    }
  }, []);

  async function loadWallet() {
    if (!hasStoredSession()) {
      setMessage("Please login to view wallet.");
      return;
    }

    try {
      const params = new URLSearchParams({
        ledgerPage: String(ledgerPage),
        ledgerPageSize: "8",
        ledgerType,
      });
      if (ledgerFrom) params.set("ledgerFrom", ledgerFrom);
      if (ledgerTo) params.set("ledgerTo", ledgerTo);
      const response = await apiFetch(`/api/wallet/?${params.toString()}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not load wallet.");
      const nextWallet = {
        ...emptyWallet,
        ...result,
        summary: { ...emptyWallet.summary, ...(result.summary || {}) },
        limits: { ...emptyWallet.limits, ...(result.limits || {}) },
      };
      setWallet(nextWallet);
      setAmount(formatAmountInput(nextWallet.summary.netWithdrawable));
      setMessage("");
      window.dispatchEvent(new Event("cafemitra:wallet-updated"));
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Could not load wallet.");
    }
  }

  async function submitWithdrawal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await apiFetch("/api/wallet/withdraw/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method, accountDetail, note }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not request withdrawal.");
      setNote("");
      setMessageKind("success");
      const paidAmount = result.withdrawal?.amount;
      const feeAmount = result.withdrawal?.feeAmount;
      setMessage(
        typeof paidAmount === "number" && typeof feeAmount === "number" && feeAmount > 0
          ? `Withdrawal request created for Rs. ${paidAmount} (Rs. ${feeAmount} transaction fee deducted).`
          : "Withdrawal request created."
      );
      await loadWallet();
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Could not request withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitCoupon(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsRedeeming(true);
    setRedeemMessage("");

    try {
      const response = await apiFetch("/api/wallet/coupon/redeem/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not redeem this coupon.");
      setRedeemMessageKind("success");
      // The coupon's own admin-authored message is the confirmation - a
      // generic "success" string would hide the whole point of letting
      // admins write it (e.g. "Diwali offer! Rs. 50 credited.").
      setRedeemMessage(result.message || "Coupon redeemed successfully.");
      setCouponCode("");
      await loadWallet();
    } catch (error) {
      setRedeemMessageKind("error");
      setRedeemMessage(error instanceof Error ? error.message : "Could not redeem this coupon.");
    } finally {
      setIsRedeeming(false);
    }
  }

  async function submitTopup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsToppingUp(true);
    setTopupMessage("");

    try {
      const createResponse = await apiFetch("/api/wallet/topup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: topupAmount }),
      });
      const created = await createResponse.json().catch(() => ({}));
      if (!createResponse.ok) throw new Error(created.message || "Could not start top-up.");

      const topupId = created.topup.id;
      const gateway = created.topup.gateway as string;
      if (gateway === "razorpay") await openRazorpayTopup(topupId);
      else if (gateway === "payu") await openPayuTopup(topupId);
      else if (gateway === "phonepe") await openPhonepeTopup(topupId);
      else throw new Error("No online payment gateway is configured for top-up.");
    } catch (error) {
      setTopupMessageKind("error");
      setTopupMessage(error instanceof Error ? error.message : "Could not start top-up.");
      setIsToppingUp(false);
    }
  }

  async function openRazorpayTopup(topupId: number) {
    await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    const response = await apiFetch(`/api/wallet/topup/${topupId}/razorpay/order/`, { method: "POST" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Could not start Razorpay.");
    const Razorpay = (window as typeof window & { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;
    if (!Razorpay) throw new Error("Razorpay Checkout could not load.");
    const checkout = new Razorpay({
      key: result.payment.keyId,
      amount: result.payment.amount,
      currency: result.payment.currency,
      name: result.payment.name,
      description: result.payment.description,
      order_id: result.payment.gatewayOrderId,
      theme: { color: "#2563eb" },
      handler: async (payment: Record<string, string>) => {
        const verifyResponse = await apiFetch(`/api/wallet/topup/${topupId}/razorpay/verify/`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payment),
        });
        const verified = await verifyResponse.json().catch(() => ({}));
        setIsToppingUp(false);
        if (!verifyResponse.ok) {
          setTopupMessageKind("error");
          setTopupMessage(verified.message || "Payment verification failed.");
          return;
        }
        setTopupMessageKind("success");
        setTopupMessage("Top-up successful. Your wallet balance has been updated.");
        await loadWallet();
      },
      modal: {
        ondismiss: () => {
          setIsToppingUp(false);
          setTopupMessageKind("error");
          setTopupMessage("Payment was not completed.");
        },
      },
    });
    checkout.open();
  }

  async function openPayuTopup(topupId: number) {
    const response = await apiFetch(`/api/wallet/topup/${topupId}/payu/order/`, { method: "POST" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Could not start PayU.");

    // PayU has no JS popup for hosted checkout - submit a real form so the
    // browser navigates to PayU's page; it redirects back to our backend
    // callback, which then redirects here with ?topup=&payment=.
    const form = document.createElement("form");
    form.method = "POST";
    form.action = result.payment.actionUrl;
    Object.entries(result.payment.fields as Record<string, string>).forEach(([fieldName, fieldValue]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = fieldName;
      input.value = fieldValue;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }

  async function openPhonepeTopup(topupId: number) {
    const response = await apiFetch(`/api/wallet/topup/${topupId}/phonepe/order/`, { method: "POST" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "Could not start PhonePe.");
    window.location.href = result.payment.redirectUrl;
  }

  const cards = [
    { label: "Withdrawable Balance", value: formatCurrency(wallet.summary.netWithdrawable), icon: Wallet, color: "#42b98e" },
    { label: "Online Balance", value: formatCurrency(wallet.balance), icon: Clock3, color: "#ff9a52" },
    { label: "Cash Counter Collected", value: formatCurrency(wallet.summary.cashCounterCollected), icon: Banknote, color: "#4a9dec" },
  ];
  const trimmedAccountDetail = accountDetail.trim();
  const upiError = method === "UPI" && trimmedAccountDetail && !upiIdPattern.test(trimmedAccountDetail)
    ? "Enter a valid UPI ID like name@bank or mobile@upi."
    : "";
  const promoCredit = wallet.summary.signupBonusCredited + wallet.summary.couponCreditReceived;
  const promoCreditLabel =
    wallet.summary.signupBonusCredited > 0 && wallet.summary.couponCreditReceived > 0
      ? `Rs. ${promoCredit} signup bonus + coupon credit`
      : wallet.summary.couponCreditReceived > 0
        ? `Rs. ${wallet.summary.couponCreditReceived} coupon credit`
        : `Rs. ${wallet.summary.signupBonusCredited} signup bonus`;
  const amountError =
    Number(amount) > wallet.summary.netWithdrawable
      ? wallet.summary.netWithdrawable <= 0 && promoCredit > 0
        ? `Your Rs. ${wallet.balance} balance is still covered by your ${promoCreditLabel} - that's promotional credit for using tools, not withdrawable cash. Earn from online orders to unlock withdrawals.`
        : promoCredit > 0
          ? `You can withdraw up to Rs. ${wallet.summary.netWithdrawable} (the ${promoCreditLabel} isn't withdrawable).`
          : `You can withdraw up to Rs. ${wallet.summary.netWithdrawable}.`
      : "";
  const canSubmitWithdrawal =
    Number(amount) > 0 && Number(amount) <= wallet.summary.netWithdrawable && Boolean(trimmedAccountDetail) && !upiError;
  const withdrawFeePercent = wallet.summary.withdrawalFeePercent;
  const withdrawFeeAmount = Number(amount) > 0 && !amountError ? Math.round(Number(amount) * (withdrawFeePercent / 100) * 100) / 100 : 0;
  const withdrawNetAmount = Number(amount) > 0 && !amountError ? Math.round((Number(amount) - withdrawFeeAmount) * 100) / 100 : 0;
  const withdrawFeeHint =
    Number(amount) > 0 && !amountError && withdrawFeePercent > 0
      ? `You'll receive Rs. ${withdrawNetAmount} after the ${withdrawFeePercent}% transaction fee (Rs. ${withdrawFeeAmount}).`
      : "";
  const pagination = wallet.ledgerPagination || emptyWallet.ledgerPagination;

  function updateLedgerFilter(next: Partial<{ type: LedgerType; from: string; to: string }>) {
    if (next.type) setLedgerType(next.type);
    if (next.from !== undefined) setLedgerFrom(next.from);
    if (next.to !== undefined) setLedgerTo(next.to);
    setLedgerPage(1);
  }

  return (
    <DashboardShell activePath="/wallet">
      <div className="dashboard wallet-dashboard">
        <div className="dashboard-hero">
          <div>
            <h1>Service Credits & Settlement</h1>
            <p className={message ? messageKind : undefined}>
              {message || "Online payments are withdrawable, cash counter money stays with the cafe, and every paid tool use is deducted from your balance as it happens."}
            </p>
          </div>
          <span className="status-pill">Wallet Active</span>
        </div>

        {wallet.limits.isBlocked ? (
          <div className="profile-alert error wallet-limit-alert">
            <AlertTriangle size={18} />
            <span>
              Insufficient balance ({formatCurrency(wallet.balance)}). Please top up your wallet to continue using
              paid tools (PrintPilot, Passport Photo).
            </span>
          </div>
        ) : wallet.limits.isLowBalance ? (
          <div className="profile-alert warning wallet-limit-alert">
            <AlertTriangle size={18} />
            <span>
              Your service credits balance is {formatCurrency(wallet.balance)}. You can keep using paid tools up to{" "}
              {formatCurrency(wallet.limits.creditLimit)}, capped at {formatCurrency(wallet.limits.dailyGraceLimit)}{" "}
              per day (used {formatCurrency(wallet.limits.todayGraceUsed)} today) - top up to avoid interruption.
            </span>
          </div>
        ) : null}

        <section className="metrics-grid wallet-metrics" aria-label="Wallet summary">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article className="metric-card" key={card.label}>
                <span className="icon-tile" style={{ "--tile-color": card.color } as React.CSSProperties}>
                  <Icon size={22} />
                </span>
                <div className="metric-content">
                  <div className="metric-label">{card.label}</div>
                  <div className="metric-value">{card.value}</div>
                  <div className="metric-meta">{metricMeta(card.label, wallet.summary.signupBonusCredited, wallet.summary.couponCreditReceived)}</div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="wallet-layout">
          <div className="wallet-forms-stack">
            <form className="panel wallet-withdraw-panel" onSubmit={submitTopup}>
              <div className="panel-title-row compact">
                <div>
                  <h2>Top Up Wallet</h2>
                  <p>Add service credits to keep paid tools running.</p>
                </div>
                <ArrowUpToLine size={20} />
              </div>
              <label className="auto-field">
                <span>Amount</span>
                <input min="10" step="0.01" type="number" value={topupAmount} onChange={(event) => setTopupAmount(event.target.value)} />
              </label>
              {topupMessage ? <small className={`field-${topupMessageKind}`}>{topupMessage}</small> : null}
              <button className="btn btn-primary" type="submit" disabled={isToppingUp || Number(topupAmount) < 10}>
                <ArrowUpToLine size={16} /> {isToppingUp ? "Processing..." : "Top Up Now"}
              </button>
            </form>

            <form className="panel wallet-withdraw-panel" onSubmit={submitCoupon}>
              <div className="panel-title-row compact">
                <div>
                  <h2>Redeem Coupon</h2>
                  <p>Enter a coupon code to credit your wallet instantly.</p>
                </div>
                <Ticket size={20} />
              </div>
              <label className="auto-field">
                <span>Coupon Code</span>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  placeholder="e.g. DIWALI50"
                />
              </label>
              {redeemMessage ? <small className={`field-${redeemMessageKind}`}>{redeemMessage}</small> : null}
              <button className="btn btn-primary" type="submit" disabled={isRedeeming || !couponCode.trim()}>
                <Ticket size={16} /> {isRedeeming ? "Redeeming..." : "Redeem Coupon"}
              </button>
            </form>

            <form className="panel wallet-withdraw-panel" onSubmit={submitWithdrawal}>
              <div className="panel-title-row compact">
                <div>
                  <h2>Request Withdrawal</h2>
                  <p>Amount is auto-filled with your withdrawable balance.</p>
                </div>
                <ArrowDownToLine size={20} />
              </div>
              <label className="auto-field">
                <span>Amount</span>
                <input
                  aria-invalid={Boolean(amountError)}
                  min="0"
                  step="0.01"
                  max={wallet.summary.netWithdrawable}
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
                {amountError ? <small className="field-error">{amountError}</small> : null}
                {!amountError && withdrawFeeHint ? <small className="field-hint">{withdrawFeeHint}</small> : null}
              </label>
              <label className="auto-field">
                <span>Method</span>
                <select value={method} onChange={(event) => setMethod(event.target.value)}>
                  <option>UPI</option>
                  <option>Bank</option>
                </select>
              </label>
              <label className="auto-field">
                <span>{method === "UPI" ? "UPI ID" : "Bank Details"}</span>
                <input
                  aria-invalid={Boolean(upiError)}
                  placeholder={method === "UPI" ? "name@bank" : "Account number, IFSC, name"}
                  value={accountDetail}
                  onChange={(event) => setAccountDetail(event.target.value)}
                />
                {upiError ? <small className="field-error">{upiError}</small> : null}
              </label>
              <label className="auto-field">
                <span>Note</span>
                <input value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
              <button className="btn btn-primary" type="submit" disabled={isSubmitting || !canSubmitWithdrawal}>
                <ArrowDownToLine size={16} /> {isSubmitting ? "Requesting..." : "Request Withdrawal"}
              </button>
            </form>
          </div>

          <article className="panel wallet-history-panel">
            <div className="panel-title-row compact">
              <h2>{historyTab === "ledger" ? "Service Credits Ledger" : "Withdrawal History"}</h2>
              <div className="wallet-history-toggle" role="tablist" aria-label="Wallet history view">
                <button type="button" role="tab" aria-selected={historyTab === "ledger"} className={historyTab === "ledger" ? "active" : ""} onClick={() => setHistoryTab("ledger")}>
                  Ledger
                </button>
                <button type="button" role="tab" aria-selected={historyTab === "withdrawals"} className={historyTab === "withdrawals" ? "active" : ""} onClick={() => setHistoryTab("withdrawals")}>
                  Withdrawals
                </button>
              </div>
            </div>

            {historyTab === "ledger" ? (
              <>
                <div className="wallet-ledger-controls" aria-label="Wallet ledger filters">
                  <label className="auto-field">
                    <span>From</span>
                    <input type="date" value={ledgerFrom} onChange={(event) => updateLedgerFilter({ from: event.target.value })} />
                  </label>
                  <label className="auto-field">
                    <span>To</span>
                    <input type="date" value={ledgerTo} onChange={(event) => updateLedgerFilter({ to: event.target.value })} />
                  </label>
                  <label className="auto-field">
                    <span>Status</span>
                    <select value={ledgerType} onChange={(event) => updateLedgerFilter({ type: event.target.value as LedgerType })}>
                      <option value="all">All</option>
                      <option value="withdrawable">Withdrawable</option>
                      <option value="tracked">Tracked only</option>
                    </select>
                  </label>
                </div>
                <div className="wallet-list">
                  {wallet.transactions.length ? wallet.transactions.map((transaction) => (
                    <div className="wallet-row" key={transaction.id}>
                      <div>
                        <strong>{formatLabel(transaction.kind)}</strong>
                        <span>{transaction.note || (transaction.affectsBalance ? "Affects withdrawable balance" : "Tracked separately")}</span>
                      </div>
                      <div className="wallet-amount">
                        <strong className={transaction.direction}>{transaction.direction === "debit" ? "-" : transaction.direction === "credit" ? "+" : ""}{formatCurrency(transaction.amount)}</strong>
                        <small>{transaction.affectsBalance ? "Withdrawable" : "Tracked only"}</small>
                      </div>
                    </div>
                  )) : message === "Loading wallet..." ? (
                    <SkeletonBlock lines={4} />
                  ) : (
                    <UiState icon={ReceiptText} title="No service credits transactions" description="Collected payments and settlement activity will appear here." />
                  )}
                </div>
                <div className="wallet-pagination" aria-label="Wallet ledger pagination">
                  <span>
                    Page {pagination.page} of {pagination.totalPages} | {pagination.total} entries
                  </span>
                  <div>
                    <button type="button" onClick={() => setLedgerPage((page) => Math.max(page - 1, 1))} disabled={pagination.page <= 1}>
                      Previous
                    </button>
                    <button type="button" onClick={() => setLedgerPage((page) => Math.min(page + 1, pagination.totalPages))} disabled={pagination.page >= pagination.totalPages}>
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="wallet-list">
                {wallet.withdrawals.length ? wallet.withdrawals.map((withdrawal) => (
                  <div className="wallet-row" key={withdrawal.id}>
                    <div>
                      <strong>{formatCurrency(withdrawal.amount)}</strong>
                      <span>
                        {withdrawal.method} | {withdrawal.accountDetail}
                        {withdrawal.feeAmount > 0 ? ` | ${formatCurrency(withdrawal.feeAmount)} transaction fee deducted` : ""}
                      </span>
                    </div>
                    <span className={`order-status ${withdrawal.status}`}>{formatLabel(withdrawal.status)}</span>
                  </div>
                )) : <UiState icon={ReceiptText} title="No withdrawal requests" description="Your withdrawal requests will appear here after you submit one." />}
              </div>
            )}
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}

function formatCurrency(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(value || 0))}`;
}

function formatAmountInput(value: number) {
  const amount = Number(value || 0);
  return amount > 0 ? amount.toFixed(2).replace(/\.00$/, "") : "";
}

function metricMeta(label: string, signupBonusCredited: number, couponCreditReceived = 0) {
  if (label === "Withdrawable Balance") {
    const excluded = [
      signupBonusCredited > 0 ? `${formatCurrency(signupBonusCredited)} signup bonus` : "",
      couponCreditReceived > 0 ? `${formatCurrency(couponCreditReceived)} coupon credit` : "",
    ].filter(Boolean);
    return excluded.length ? `Excludes ${excluded.join(" and ")} (promotional, not withdrawable)` : "Ready to withdraw";
  }
  if (label === "Online Balance") return "Wallet balance";
  if (label === "Cash Counter Collected") return "Already with cafe";
  return "Wallet ledger";
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
