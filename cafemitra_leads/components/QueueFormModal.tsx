"use client";

import { FormEvent, useState } from "react";
import Modal from "./Modal";

export default function QueueFormModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (values: { name: string; link: string; extractedby: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [extractedby, setExtractedby] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !link.trim()) {
      setError("Name and link are both required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), link: link.trim(), extractedby: extractedby.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add place to queue" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Name <span className="text-red-500">*</span>
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">
            Google Maps link <span className="text-red-500">*</span>
          </span>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Extracted by (optional)</span>
          <input
            value={extractedby}
            onChange={(e) => setExtractedby(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Add"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
