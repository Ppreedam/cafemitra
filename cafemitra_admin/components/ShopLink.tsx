"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ShopDetailView from "@/components/ShopDetailView";

// A shop name that opens the shop detail in a modal instead of navigating
// away, so the list underneath keeps its filters, page and scroll position.
export default function ShopLink({
  shopId,
  className = "hover:underline",
  children,
}: {
  shopId: number;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={`text-left ${className}`}
      >
        {children}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <div className="relative w-full max-w-5xl rounded-xl bg-slate-50 p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              title="Close (Esc)"
              className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={18} />
            </button>
            <ShopDetailView shopId={shopId} embedded onDeleted={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
