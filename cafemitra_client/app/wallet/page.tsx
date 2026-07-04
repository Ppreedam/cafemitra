"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ArrowDownToLine, Banknote, Clock3, Landmark, ReceiptText, Wallet } from "lucide-react";
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
    commissionRate: number;
    commissionPending: number;
    netWithdrawable: number;
    pendingWithdrawal: number;
    paidWithdrawal: number;
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
    commissionRate: 0.03,
    commissionPending: 0,
    netWithdrawable: 0,
    pendingWithdrawal: 0,
    paidWithdrawal: 0,
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

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData>(emptyWallet);
  const [message, setMessage] = useState("Loading wallet...");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("UPI");
  const [accountDetail, setAccountDetail] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ledgerType, setLedgerType] = useState<LedgerType>("all");
  const [ledgerFrom, setLedgerFrom] = useState("");
  const [ledgerTo, setLedgerTo] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);

  useEffect(() => {
    loadWallet();
  }, [ledgerPage, ledgerType, ledgerFrom, ledgerTo]);

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
      const nextWallet = { ...emptyWallet, ...result, summary: { ...emptyWallet.summary, ...(result.summary || {}) } };
      setWallet(nextWallet);
      setAmount(formatAmountInput(nextWallet.summary.netWithdrawable));
      setMessage("");
      window.dispatchEvent(new Event("cafemitra:wallet-updated"));
    } catch (error) {
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
      setMessage("Withdrawal request created.");
      await loadWallet();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not request withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const cards = [
    { label: "Withdrawable Balance", value: formatCurrency(wallet.summary.netWithdrawable), icon: Wallet, color: "#42b98e" },
    { label: "Reptigo Commission", value: formatCurrency(wallet.summary.commissionPending), icon: Landmark, color: "#6d63df" },
    { label: "Online Balance", value: formatCurrency(wallet.balance), icon: Clock3, color: "#ff9a52" },
    { label: "Cash Counter Collected", value: formatCurrency(wallet.summary.cashCounterCollected), icon: Banknote, color: "#4a9dec" },
  ];
  const trimmedAccountDetail = accountDetail.trim();
  const upiError = method === "UPI" && trimmedAccountDetail && !upiIdPattern.test(trimmedAccountDetail)
    ? "Enter a valid UPI ID like name@bank or mobile@upi."
    : "";
  const canSubmitWithdrawal = Number(amount) > 0 && Boolean(trimmedAccountDetail) && !upiError;
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
            <h1>Wallet & Settlement</h1>
            <p>{message || "Online payments are withdrawable. Cash counter money stays with the cafe, and Reptigo commission is deducted from the request amount."}</p>
          </div>
          <span className="status-pill">Wallet Active</span>
        </div>

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
                  <div className="metric-meta">{metricMeta(card.label, wallet.summary.commissionRate)}</div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="wallet-layout">
          <form className="panel wallet-withdraw-panel" onSubmit={submitWithdrawal}>
            <div className="panel-title-row compact">
              <div>
                <h2>Request Withdrawal</h2>
                <p>Amount is auto-filled after Reptigo commission.</p>
              </div>
              <ArrowDownToLine size={20} />
            </div>
            <label className="auto-field">
              <span>Amount</span>
              <input min="0" step="0.01" max={wallet.summary.netWithdrawable || undefined} type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
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

          <article className="panel">
            <div className="panel-title-row compact">
              <h2>Withdrawal History</h2>
              <ReceiptText size={20} />
            </div>
            <div className="wallet-list">
              {wallet.withdrawals.length ? wallet.withdrawals.map((withdrawal) => (
                <div className="wallet-row" key={withdrawal.id}>
                  <div>
                    <strong>{formatCurrency(withdrawal.amount)}</strong>
                    <span>{withdrawal.method} | {withdrawal.accountDetail}</span>
                  </div>
                  <span className={`order-status ${withdrawal.status}`}>{formatLabel(withdrawal.status)}</span>
                </div>
              )) : <UiState icon={ReceiptText} title="No withdrawal requests" description="Your withdrawal requests will appear here after you submit one." />}
            </div>
          </article>
        </section>

        <section className="panel wallet-ledger-panel">
          <div className="panel-title-row compact">
            <h2>Wallet Ledger</h2>
            <ReceiptText size={20} />
          </div>
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
              <UiState icon={ReceiptText} title="No wallet transactions" description="Collected payments and settlement activity will appear here." />
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

function metricMeta(label: string, commissionRate: number) {
  if (label === "Withdrawable Balance") return "After commission";
  if (label === "Reptigo Commission") return `${Math.round(Number(commissionRate || 0) * 100)}% of total collection`;
  if (label === "Online Balance") return "Before commission";
  if (label === "Cash Counter Collected") return "Already with cafe";
  return "Wallet ledger";
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
