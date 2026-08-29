"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { LeadTag } from "@/lib/leads";
import { tagColorMeta } from "@/lib/tagColors";

// Small popover for toggling which of the global tags are assigned to one
// customer row - the "assign multiple tags to one customer" picker.
export default function TagPicker({
  allTags,
  assignedIds,
  onToggle,
}: {
  allTags: LeadTag[];
  assignedIds: number[];
  onToggle: (tagId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Add tag"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600"
      >
        <Plus size={12} />
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-20 w-48 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg">
          {allTags.length === 0 ? (
            <p className="px-2 py-1.5 text-xs text-slate-400">No tags yet.</p>
          ) : (
            allTags.map((tag) => {
              const meta = tagColorMeta(tag.color);
              const checked = assignedIds.includes(tag.id);
              return (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(tag.id)}
                    className="h-3.5 w-3.5 accent-indigo-600"
                  />
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {tag.name}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
