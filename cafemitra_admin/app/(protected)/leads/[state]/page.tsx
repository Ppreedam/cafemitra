"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { fetchLeadDivisions, type LeadDivision } from "@/lib/api";

export default function LeadStatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state: stateParam } = use(params);
  const state = decodeURIComponent(stateParam);

  const [divisions, setDivisions] = useState<LeadDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchLeadDivisions(state)
      .then((res) => setDivisions(res.divisions))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load divisions."))
      .finally(() => setLoading(false));
  }, [state]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/leads" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={14} /> All states
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{state}</h1>
        <p className="text-sm text-slate-500">Divisions in {state}. Pick one to see its agents.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : divisions.length === 0 ? (
        <p className="text-sm text-slate-400">No divisions found for this state.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {divisions.map((d) => (
            <Link
              key={d.division}
              href={`/leads/${encodeURIComponent(state)}/${encodeURIComponent(d.division)}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <Layers size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{d.division}</p>
                  <p className="text-xs text-slate-500">{d.pincodeCount} pincode{d.pincodeCount === 1 ? "" : "s"}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700 tabular-nums">{d.agentCount.toLocaleString("en-IN")}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
