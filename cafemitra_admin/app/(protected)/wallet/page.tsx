"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { Check, Copy, IndianRupee } from "lucide-react";
import Pagination from "@/components/Pagination";
import StatTile from "@/components/StatTile";
import {
  approveWithdrawal,
  exportWalletLedgerCsv,
  fetchToolPricing,
  fetchWalletEarningsSummary,
  fetchWalletLedger,
  fetchWalletLedgerSummary,
  fetchWalletSettings,
  fetchWalletTopups,
  fetchWithdrawals,
  rejectWithdrawal,
  updateToolPricing,
  updateWalletSetting,
  type AdminToolPricing,
  type AdminTopup,
  type AdminTransaction,
  type AdminWalletSetting,
  type AdminWithdrawal,
  type EarningsPeriod,
  type WalletLedgerSummary,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const TABS = ["Withdrawals", "Ledger", "Top-ups", "Wallet Settings", "Tool Pricing"] as const;
type Tab = (typeof TABS)[number];

const TXN_KIND_LABELS: Record<string, string> = {
  signup_bonus: "Signup Bonus",
  referral_bonus: "Referral Bonus",
  online_order_credit: "Online Order Payment",
  cash_counter_collection: "Cash Collected (Counter)",
  tool_usage: "Tool Usage Fee",
  tool_usage_blocked: "Tool Usage (Blocked)",
  withdrawal: "Withdrawal",
  withdrawal_reversal: "Withdrawal Reversal",
  topup: "Wallet Top-up",
  admin_adjustment: "Admin Adjustment",
  referral_commission: "Referral Commission",
};

function DirectionBadge({ direction }: { direction: string }) {
  const styles: Record<string, string> = {
    credit: "bg-green-50 text-green-700",
    debit: "bg-red-50 text-red-700",
    info: "bg-slate-100 text-slate-500",
  };
  const labels: Record<string, string> = {
    credit: "+ Credit",
    debit: "− Debit",
    info: "Info only",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[direction] || "bg-slate-100 text-slate-500"}`}>
      {labels[direction] || direction}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, non-HTTPS context) - not
      // worth surfacing an error banner for a convenience copy button.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy"}
      className="inline-flex items-center text-slate-400 hover:text-slate-700"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
    </button>
  );
}

function ShopLedgerModal({
  shopId,
  shopName,
  shopEmail,
  withdrawal,
  onClose,
}: {
  shopId: number;
  shopName: string;
  shopEmail: string;
  withdrawal: AdminWithdrawal;
  onClose: () => void;
}) {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<WalletLedgerSummary | null>(null);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchWalletLedger({ shop: String(shopId), page })
      .then((res) => {
        setTransactions(res.transactions);
        setCount(res.count);
        setPageSize(res.pageSize);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load wallet transactions."))
      .finally(() => setLoading(false));
  }, [shopId, page]);

  useEffect(() => {
    fetchWalletLedgerSummary(shopId)
      .then(setSummary)
      .catch((err) => setSummaryError(err instanceof Error ? err.message : "Failed to load wallet summary."));
  }, [shopId]);

  // Read from the wallet transaction's own balance_after snapshot (taken at
  // request time), not the shop's *current* balance - tool usage after the
  // request (grace-credit spending) can drag the current balance negative
  // for reasons that have nothing to do with whether this withdrawal itself
  // was covered when it was made.
  const balanceAfterRequest = withdrawal.balanceAfterRequest;
  const balanceBeforeRequest = balanceAfterRequest !== null ? balanceAfterRequest + withdrawal.amount : null;
  const balanceCoveredWithdrawal = balanceAfterRequest !== null ? balanceAfterRequest >= 0 : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{shopName || shopEmail}</h2>
            <p className="text-sm text-slate-500">{shopEmail}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">
            &times;
          </button>
        </div>

        <div className="mx-5 mt-4 rounded-md bg-indigo-50 border border-indigo-100 px-4 py-2 text-sm text-indigo-800">
          Validating withdrawal request: <strong>{formatCurrency(withdrawal.amount)}</strong> via {withdrawal.method} to{" "}
          <span className="inline-flex items-center gap-1.5 font-mono">
            {withdrawal.accountDetail}
            <CopyButton value={withdrawal.accountDetail} />
          </span>
          , requested {new Date(withdrawal.createdAt).toLocaleString("en-IN")}.
        </div>

        <div className="mx-5 mt-4">
          {summaryError && <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{summaryError}</div>}
          {summary && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-md border border-slate-200 px-3 py-2">
                  <div className="text-xs text-slate-500">Total Credit</div>
                  <div className="text-sm font-semibold text-green-700">{formatCurrency(summary.totalCredit)}</div>
                </div>
                <div className="rounded-md border border-slate-200 px-3 py-2">
                  <div className="text-xs text-slate-500">Total Debit</div>
                  <div className="text-sm font-semibold text-red-700">{formatCurrency(summary.totalDebit)}</div>
                </div>
                <div className="rounded-md border border-slate-200 px-3 py-2" title="RepetiGo's own fee earned from this shop's tool usage (e.g. PrintPilot page fees)">
                  <div className="text-xs text-slate-500">Platform Revenue</div>
                  <div className="text-sm font-semibold text-indigo-700">{formatCurrency(summary.platformRevenue)}</div>
                </div>
                <div className="rounded-md border border-slate-200 px-3 py-2" title="Wallet balance right before this specific request was made">
                  <div className="text-xs text-slate-500">Balance Before Request</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {balanceBeforeRequest !== null ? formatCurrency(balanceBeforeRequest) : "—"}
                  </div>
                </div>
                <div className="rounded-md border border-slate-200 px-3 py-2">
                  <div className="text-xs text-slate-500">Current Balance</div>
                  <div className="text-sm font-semibold text-slate-900">{formatCurrency(summary.currentBalance)}</div>
                </div>
              </div>
              <div
                className={`mt-3 rounded-md px-4 py-2 text-sm font-medium ${
                  balanceCoveredWithdrawal === null
                    ? "bg-slate-50 text-slate-600 border border-slate-200"
                    : balanceCoveredWithdrawal
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-red-50 text-red-700 border border-red-100"
                }`}
              >
                {balanceCoveredWithdrawal === null
                  ? "Couldn't find the matching wallet debit for this request, so it can't be verified against the balance at request time."
                  : balanceCoveredWithdrawal
                    ? "Valid — wallet balance covered this withdrawal at the time it was requested."
                    : "Invalid — this withdrawal exceeded the available balance at request time. Investigate before approving."}
              </div>
              {summary.currentBalance < 0 && balanceCoveredWithdrawal && (
                <p className="mt-2 text-xs text-slate-500">
                  Note: the shop's current balance is negative, but that's from grace-credit tool usage after this
                  request — unrelated to whether this specific withdrawal was valid.
                </p>
              )}
            </>
          )}
        </div>

        <div className="p-5">
          {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
          <p className="mb-3 text-xs text-slate-500">
            <span className="font-medium text-red-700">Debit</span> = money left the shop's wallet (often RepetiGo's tool-usage fee).{" "}
            <span className="font-medium text-green-700">Credit</span> = money added (top-ups, bonuses, order payments).{" "}
            <span className="font-medium text-slate-600">Info only</span> = just a log entry (e.g. cash the shop collected at its
            own counter) — it doesn't move wallet balance.
          </p>
          {loading && <p className="text-sm text-slate-500">Loading wallet transactions…</p>}
          {!loading && transactions.length === 0 && !error && (
            <p className="text-sm text-slate-500">No wallet transactions found for this shop.</p>
          )}
          {!loading && transactions.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="px-3 py-2 font-medium">Kind</th>
                    <th className="px-3 py-2 font-medium">Direction</th>
                    <th className="px-3 py-2 font-medium">Amount</th>
                    <th className="px-3 py-2 font-medium">Note</th>
                    <th className="px-3 py-2 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id} className={`border-b border-slate-100 last:border-0 ${txn.direction === "info" ? "opacity-70" : ""}`}>
                      <td className="px-3 py-2 text-slate-700">{TXN_KIND_LABELS[txn.kind] || txn.kind}</td>
                      <td className="px-3 py-2">
                        <DirectionBadge direction={txn.direction} />
                      </td>
                      <td className="px-3 py-2 text-slate-900 font-medium">{formatCurrency(txn.amount)}</td>
                      <td className="px-3 py-2 text-slate-500 max-w-xs truncate">{txn.note}</td>
                      <td className="px-3 py-2 text-slate-500">{new Date(txn.createdAt).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [emailFilter, setEmailFilter] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminWithdrawal | null>(null);

  function load() {
    fetchWithdrawals(statusFilter || undefined, page, emailFilter || undefined)
      .then((res) => {
        setWithdrawals(res.withdrawals);
        setCount(res.count);
        setPageSize(res.pageSize);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load withdrawals."));
  }

  useEffect(load, [statusFilter, emailFilter, page]);

  function handleEmailSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setEmailFilter(emailInput.trim());
  }

  async function handleApprove(id: number) {
    setBusyId(id);
    try {
      await approveWithdrawal(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: number) {
    const reason = window.prompt("Reason for rejecting this withdrawal (credited back to the shop's wallet):");
    if (reason === null) return;
    setBusyId(id);
    try {
      await rejectWithdrawal(id, reason);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reject failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
        <form onSubmit={handleEmailSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Search by email..."
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm w-56"
          />
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Search
          </button>
          {emailFilter && (
            <button
              type="button"
              onClick={() => {
                setEmailInput("");
                setEmailFilter("");
                setPage(1);
              }}
              className="rounded-md px-2 py-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </form>
      </div>
      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Shop</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Method</th>
              <th className="px-4 py-2 font-medium">UPI ID / Account</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Requested</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                  No withdrawals here.
                </td>
              </tr>
            )}
            {withdrawals.map((w) => (
              <tr
                key={w.id}
                onClick={() => setSelectedWithdrawal(w)}
                className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50"
              >
                <td className="px-4 py-2 text-slate-700">{w.shopName || w.shopEmail}</td>
                <td className="px-4 py-2 text-slate-700">{w.shopEmail}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(w.amount)}</td>
                <td className="px-4 py-2 text-slate-700">{w.method}</td>
                <td className="px-4 py-2 text-slate-700 font-mono text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    {w.accountDetail}
                    <CopyButton value={w.accountDetail} />
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-700">{w.status}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(w.createdAt).toLocaleString("en-IN")}</td>
                <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                  {w.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        disabled={busyId === w.id}
                        onClick={() => handleApprove(w.id)}
                        className="rounded-md bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        disabled={busyId === w.id}
                        onClick={() => handleReject(w.id)}
                        className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>
      {selectedWithdrawal && (
        <ShopLedgerModal
          shopId={selectedWithdrawal.shopId}
          shopName={selectedWithdrawal.shopName}
          shopEmail={selectedWithdrawal.shopEmail}
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
        />
      )}
    </div>
  );
}

function EarningBox({ label, period, comparisonLabel }: { label: string; period: EarningsPeriod; comparisonLabel: string }) {
  return (
    <StatTile
      icon={IndianRupee}
      label={label}
      value={formatCurrency(period.amount)}
      tone="good"
      delta={{ percent: period.changePercent, comparisonLabel, goodDirection: "up" }}
    />
  );
}

function LedgerTab() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [earnings, setEarnings] = useState<{ today: EarningsPeriod; thisWeek: EarningsPeriod; thisMonth: EarningsPeriod } | null>(null);

  useEffect(() => {
    fetchWalletLedger({ page })
      .then((res) => {
        setTransactions(res.transactions);
        setCount(res.count);
        setPageSize(res.pageSize);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load ledger."));
  }, [page]);

  useEffect(() => {
    fetchWalletEarningsSummary()
      .then(setEarnings)
      .catch(() => {
        // Earnings comparison boxes are a bonus view on top of the ledger -
        // a failure here shouldn't block the ledger table itself.
      });
  }, []);

  return (
    <div>
      {earnings && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <EarningBox label="Today's earning" period={earnings.today} comparisonLabel="vs yesterday" />
          <EarningBox label="This week's earning" period={earnings.thisWeek} comparisonLabel="vs last week" />
          <EarningBox label="This month's earning" period={earnings.thisMonth} comparisonLabel="vs last month" />
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">{count} total ledger entries platform-wide.</p>
        <button
          onClick={() => exportWalletLedgerCsv().catch((err) => setError(err instanceof Error ? err.message : "Export failed."))}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </button>
      </div>
      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Shop</th>
              <th className="px-4 py-2 font-medium">Kind</th>
              <th className="px-4 py-2 font-medium">Direction</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Note</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-700">{txn.shopName || txn.shopEmail}</td>
                <td className="px-4 py-2 text-slate-700">{txn.kind}</td>
                <td className="px-4 py-2 text-slate-700">{txn.direction}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(txn.amount)}</td>
                <td className="px-4 py-2 text-slate-500 max-w-xs truncate">{txn.note}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(txn.createdAt).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}

function TopupsTab() {
  const [topups, setTopups] = useState<AdminTopup[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWalletTopups({ page })
      .then((res) => {
        setTopups(res.topups);
        setCount(res.count);
        setPageSize(res.pageSize);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load top-ups."));
  }, [page]);

  return (
    <div>
      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Shop</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Gateway</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {topups.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-700">{t.shopName || t.shopEmail}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(t.amount)}</td>
                <td className="px-4 py-2 text-slate-700">{t.paymentGateway}</td>
                <td className="px-4 py-2 text-slate-700">{t.status}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(t.createdAt).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}

function WalletSettingsTab() {
  const [settings, setSettings] = useState<AdminWalletSetting[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function load() {
    fetchWalletSettings()
      .then((res) => {
        setSettings(res.settings);
        setDrafts(Object.fromEntries(res.settings.map((s) => [s.key, String(s.value)])));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load settings."));
  }

  useEffect(load, []);

  async function handleSave(key: string) {
    setSavingKey(key);
    try {
      await updateWalletSetting(key, { value: Number(drafts[key]) });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
      {error && <div className="m-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="px-4 py-2 font-medium">Setting</th>
            <th className="px-4 py-2 font-medium">Value</th>
            <th className="px-4 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {settings.map((s) => (
            <tr key={s.key} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2 text-slate-700">
                <div className="font-medium">{s.label}</div>
                {s.description && <div className="text-xs text-slate-500">{s.description}</div>}
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={drafts[s.key] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [s.key]: e.target.value }))}
                  className="w-32 rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </td>
              <td className="px-4 py-2">
                <button
                  disabled={savingKey === s.key}
                  onClick={() => handleSave(s.key)}
                  className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ToolPricingTab() {
  const [pricing, setPricing] = useState<AdminToolPricing[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);

  function load() {
    fetchToolPricing()
      .then((res) => {
        setPricing(res.pricing);
        setDrafts(Object.fromEntries(res.pricing.map((p) => [p.toolKey, String(p.price)])));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tool pricing."));
  }

  useEffect(load, []);

  async function handleSave(toolKey: string) {
    setSavingKey(toolKey);
    try {
      await updateToolPricing(toolKey, { price: Number(drafts[toolKey]) });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSavingKey(null);
    }
  }

  async function handleToggleBillable(item: AdminToolPricing) {
    try {
      await updateToolPricing(item.toolKey, { isBillable: !item.isBillable });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
      {error && <div className="m-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="px-4 py-2 font-medium">Tool</th>
            <th className="px-4 py-2 font-medium">Unit</th>
            <th className="px-4 py-2 font-medium">Price</th>
            <th className="px-4 py-2 font-medium">Billable</th>
            <th className="px-4 py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {pricing.map((p) => (
            <tr key={p.toolKey} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-2 text-slate-700">{p.label}</td>
              <td className="px-4 py-2 text-slate-500">{p.unit}</td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  step="0.01"
                  value={drafts[p.toolKey] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [p.toolKey]: e.target.value }))}
                  className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleToggleBillable(p)}
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.isBillable ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.isBillable ? "On" : "Off"}
                </button>
              </td>
              <td className="px-4 py-2">
                <button
                  disabled={savingKey === p.toolKey}
                  onClick={() => handleSave(p.toolKey)}
                  className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WalletPage() {
  const [tab, setTab] = useState<Tab>("Withdrawals");

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Wallet & Finance</h1>
      <p className="text-sm text-slate-500 mb-4">Withdrawal approvals, platform-wide ledger, top-ups, and pricing config.</p>

      <div className="border-b border-slate-200 mb-4 flex gap-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Withdrawals" && <WithdrawalsTab />}
      {tab === "Ledger" && <LedgerTab />}
      {tab === "Top-ups" && <TopupsTab />}
      {tab === "Wallet Settings" && <WalletSettingsTab />}
      {tab === "Tool Pricing" && <ToolPricingTab />}
    </div>
  );
}
