"use client";

import { useEffect, useState } from "react";
import { IndianRupee } from "lucide-react";
import Pagination from "@/components/Pagination";
import StatTile from "@/components/StatTile";
import {
  approveWithdrawal,
  exportWalletLedgerCsv,
  fetchToolPricing,
  fetchWalletEarningsSummary,
  fetchWalletLedger,
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
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const TABS = ["Withdrawals", "Ledger", "Top-ups", "Wallet Settings", "Tool Pricing"] as const;
type Tab = (typeof TABS)[number];

function WithdrawalsTab() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    fetchWithdrawals(statusFilter || undefined, page)
      .then((res) => {
        setWithdrawals(res.withdrawals);
        setCount(res.count);
        setPageSize(res.pageSize);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load withdrawals."));
  }

  useEffect(load, [statusFilter, page]);

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
      <div className="mb-3">
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
      </div>
      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Shop</th>
              <th className="px-4 py-2 font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">Method</th>
              <th className="px-4 py-2 font-medium">Account</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Requested</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No withdrawals here.
                </td>
              </tr>
            )}
            {withdrawals.map((w) => (
              <tr key={w.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-700">{w.shopName || w.shopEmail}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(w.amount)}</td>
                <td className="px-4 py-2 text-slate-700">{w.method}</td>
                <td className="px-4 py-2 text-slate-700">{w.accountDetail}</td>
                <td className="px-4 py-2 text-slate-700">{w.status}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(w.createdAt).toLocaleString("en-IN")}</td>
                <td className="px-4 py-2">
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
