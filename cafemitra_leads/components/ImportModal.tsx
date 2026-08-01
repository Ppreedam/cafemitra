"use client";

import { useState } from "react";
import Modal from "./Modal";

export default function ImportModal({
  title,
  placeholder,
  onClose,
  onImport,
}: {
  title: string;
  placeholder: string;
  onClose: () => void;
  onImport: (items: Record<string, unknown>[]) => Promise<{ message: string }>;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleImport() {
    setError("");
    setResult("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError("Invalid JSON. Paste an array of objects, e.g. [{\"name\": \"...\", \"maps_url\": \"...\"}]");
      return;
    }
    if (!Array.isArray(parsed)) {
      setError("Expected a JSON array of objects.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await onImport(parsed as Record<string, unknown>[]);
      setResult(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={10}
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 font-mono text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {result && <p className="text-sm text-emerald-600">{result}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={handleImport}
            disabled={submitting || !text.trim()}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {submitting ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
