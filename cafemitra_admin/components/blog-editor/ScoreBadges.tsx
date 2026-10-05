"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import type { Score, Scores } from "./scoring";

const BADGES: { key: keyof Scores; title: string; cls: string }[] = [
  { key: "readability", title: "Readability", cls: "text-pink-600 border-pink-200" },
  { key: "seo", title: "SEO", cls: "text-orange-600 border-orange-200" },
  { key: "performance", title: "Performance", cls: "text-blue-600 border-blue-200" },
  { key: "feedback", title: "Completeness", cls: "text-purple-600 border-purple-200" },
];

function Details({ title, score }: { title: string; score: Score }) {
  return (
    <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-lg">
      <div className="mb-2 text-sm font-semibold text-slate-800">
        {title}: {score.score}/100
      </div>
      <ul className="space-y-1.5">
        {score.checks.map((check) => (
          <li key={check.label} className="flex gap-2 text-xs">
            {check.ok ? <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" /> : <X size={14} className="mt-0.5 shrink-0 text-red-500" />}
            <span>
              <span className={check.ok ? "text-slate-700" : "font-medium text-slate-900"}>{check.label}</span>
              {!check.ok && <span className="block text-slate-500">{check.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Four live score badges; click one to see its checklist. */
export default function ScoreBadges({ scores }: { scores: Scores }) {
  const [open, setOpen] = useState<keyof Scores | null>(null);

  return (
    <div className="flex items-center gap-1.5">
      {open && <div className="fixed inset-0 z-20" onClick={() => setOpen(null)} />}
      {BADGES.map(({ key, title, cls }) => (
        <div key={key} className="relative z-30">
          <button
            type="button"
            title={`${title} score - click for details`}
            onClick={() => setOpen(open === key ? null : key)}
            className={`rounded border bg-white px-2 py-1 text-xs font-medium hover:bg-slate-50 ${cls}`}
          >
            {scores[key].score}/100
          </button>
          {open === key && <Details title={title} score={scores[key]} />}
        </div>
      ))}
    </div>
  );
}
