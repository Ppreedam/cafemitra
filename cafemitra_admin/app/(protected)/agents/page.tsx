"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAgents, onboardAgent, type AdminAgent } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default function AgentsPage() {
  const [agents, setAgents] = useState<AdminAgent[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [commissionType, setCommissionType] = useState("percentage");
  const [commissionRate, setCommissionRate] = useState("10");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetchAgents(statusFilter || undefined)
      .then((res) => setAgents(res.agents))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load agents."));
  }

  useEffect(load, [statusFilter]);

  async function handleOnboard(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onboardAgent({ email, commissionType, commissionRate: Number(commissionRate) });
      setEmail("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-slate-900">Referral Agents / Partner Program</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Onboard agent
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Cybercafes/partners who refer new shops and earn a commission on their referred shops&apos; printed orders.
      </p>

      {showForm && (
        <form onSubmit={handleOnboard} className="mb-4 rounded-xl border border-slate-200 bg-white p-4 max-w-md flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Existing account email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">Commission type</label>
              <select
                value={commissionType}
                onChange={(e) => setCommissionType(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              >
                <option value="percentage">Percentage of fee</option>
                <option value="fixed">Fixed per settlement</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Rate {commissionType === "percentage" ? "(%)" : "(Rs.)"}
              </label>
              <input
                type="number"
                step="0.01"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="self-start rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Onboarding..." : "Create agent (starts pending)"}
          </button>
        </form>
      )}

      <div className="mb-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Referral code</th>
              <th className="px-4 py-2 font-medium">Owner</th>
              <th className="px-4 py-2 font-medium">Commission</th>
              <th className="px-4 py-2 font-medium">Referred shops</th>
              <th className="px-4 py-2 font-medium">Total earned</th>
              <th className="px-4 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No agents yet.
                </td>
              </tr>
            )}
            {agents.map((agent) => (
              <tr key={agent.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link href={`/agents/${agent.id}`} className="font-medium text-indigo-700 hover:underline">
                    {agent.referralCode}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  <div>{agent.fullName || "-"}</div>
                  <div className="text-xs text-slate-500">{agent.email}</div>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {agent.commissionRate}
                  {agent.commissionType === "percentage" ? "%" : " Rs. fixed"}
                </td>
                <td className="px-4 py-2 text-slate-700">{agent.referredShopsCount}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(agent.totalCommissionEarned)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      agent.status === "active"
                        ? "bg-green-50 text-green-700"
                        : agent.status === "pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
