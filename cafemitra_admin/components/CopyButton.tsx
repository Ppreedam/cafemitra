"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can fail (permissions, insecure context) - nothing
      // to recover from here, the click just silently does nothing.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy"
      aria-label="Copy to clipboard"
      className="inline-flex shrink-0 items-center text-slate-400 hover:text-indigo-600"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}
