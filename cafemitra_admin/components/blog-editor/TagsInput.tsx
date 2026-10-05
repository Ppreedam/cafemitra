"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  max?: number;
};

/** Chip input: type and press Enter (or comma) to add, click x to remove. */
export default function TagsInput({ label, values, onChange, placeholder, max = 20 }: Props) {
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const text = raw.trim();
    if (!text || values.length >= max) return;
    if (values.some((value) => value.toLowerCase() === text.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, text]);
    setDraft("");
  }

  return (
    <div className="text-sm text-slate-700">
      <div className="mb-1 font-medium">{label}</div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
            {value}
            <button type="button" aria-label={`Remove ${value}`} onClick={() => onChange(values.filter((v) => v !== value))}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        value={draft}
        placeholder={placeholder ?? "Type and press Enter"}
        disabled={values.length >= max}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => add(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
      />
    </div>
  );
}
