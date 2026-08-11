"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchAgentDetail, updateAgent, type AdminAgent, type AgentCommissionEntry } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const agentId = Number(id);

  const [agent, setAgent] = useState<AdminAgent | null>(null);
  const [shops, setShops] = useState<{ id: number; shopName: string; email: string }[]>([]);
  const [ledger, setLedger] = useState<AgentCommissionEntry[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [commissionType, setCommissionType] = useState("percentage");
  const [commissionRate, setCommissionRate] = useState("0");
  const [status, setStatus] = useState("pending");
  const [offerNote, setOfferNote] = useState("");

  function load() {
    fetchAgentDetail(agentId)
      .then((res) => {
        setAgent(res.agent);
        setShops(res.referredShops);
        setLedger(res.commissionLedger);
        setCommissionType(res.agent.commissionType);
        setCommissionRate(String(res.agent.commissionRate));
        setStatus(res.agent.status);
        setOfferNote(res.agent.specialOfferNote);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load agent."));
  }

  useEffect(load, [agentId]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateAgent(agentId, {
        commissionType,
        commissionRate: Number(commissionRate),
        status,
        specialOfferNote: offerNote,
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>;
  }
  if (!agent) {
    return <p className="text-sm text-slate-500">Loading agent...</p>;
  }

  return (
    <div>
      <Link href="/agents" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-3">
        <ArrowLeft size={14} /> Back to agents
      </Link>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">{agent.referralCode}</h1>
      <p className="text-sm text-slate-500 mb-4">
        {agent.fullName} · {agent.email} · wallet balance {formatCurrency(agent.currentBalance)}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Settings</h2>
          <label className="block text-xs font-medium text-slate-700 mb-1">Commission type</label>
          <select
            value={commissionType}
            onChange={(e) => setCommissionType(e.target.value)}
            className="w-full mb-3 rounded-md border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="percentage">Percentage of fee</option>
            <option value="fixed">Fixed per settlement</option>
          </select>

          <label className="block text-xs font-medium text-slate-700 mb-1">
            Rate {commissionType === "percentage" ? "(%)" : "(Rs.)"}
          </label>
          <input
            type="number"
            step="0.01"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            className="w-full mb-3 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full mb-3 rounded-md border border-slate-300 px-2 py-2 text-sm">
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <label className="block text-xs font-medium text-slate-700 mb-1">Special offer note</label>
          <textarea
            value={offerNote}
            onChange={(e) => setOfferNote(e.target.value)}
            rows={3}
            className="w-full mb-4 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Referred shops ({shops.length})</h2>
            {shops.length === 0 && <p className="text-sm text-slate-500">No shops referred yet.</p>}
            <ul className="divide-y divide-slate-100">
              {shops.map((s) => (
                <li key={s.id} className="py-2 text-sm">
                  <Link href={`/shops/${s.id}`} className="text-indigo-700 hover:underline">
                    {s.shopName || s.email}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Commission ledger</h2>
            {ledger.length === 0 && <p className="text-sm text-slate-500">No commission earned yet.</p>}
            <ul className="divide-y divide-slate-100">
              {ledger.map((entry) => (
                <li key={entry.id} className="py-2 text-sm flex justify-between">
                  <span className="text-slate-600 truncate pr-2">{entry.note}</span>
                  <span className="font-medium text-slate-900 shrink-0">{formatCurrency(entry.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
