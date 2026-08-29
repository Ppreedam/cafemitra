"use client";

import { FormEvent, useState } from "react";
import Modal from "./Modal";
import type { Lead } from "@/lib/leads";
import { LEAD_STATUSES } from "@/lib/leadStatus";

export type LeadFormValues = {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  maps_url: string;
  rating: string;
  reviews: string;
  status: string;
  notes: string;
  next_follow_up_at: string;
};

export default function LeadFormModal({
  initial,
  title,
  onClose,
  onSubmit,
}: {
  initial?: Lead;
  title: string;
  onClose: () => void;
  onSubmit: (values: LeadFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<LeadFormValues>({
    name: initial?.name ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    website: initial?.website ?? "",
    maps_url: initial?.maps_url ?? "",
    rating: initial?.rating?.toString() ?? "",
    reviews: initial?.reviews?.toString() ?? "",
    status: initial?.status ?? "new",
    notes: initial?.notes ?? "",
    next_follow_up_at: initial?.next_follow_up_at ?? "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof LeadFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!values.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!values.maps_url.trim()) {
      setError("Maps URL is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Name" value={values.name} onChange={(v) => update("name", v)} required />
        <Field label="Maps URL" value={values.maps_url} onChange={(v) => update("maps_url", v)} required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" value={values.phone} onChange={(v) => update("phone", v)} />
          <Field label="Email" value={values.email} onChange={(v) => update("email", v)} />
        </div>
        <Field label="Website" value={values.website} onChange={(v) => update("website", v)} />
        <Field label="Address" value={values.address} onChange={(v) => update("address", v)} textarea />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Rating" value={values.rating} onChange={(v) => update("rating", v)} />
          <Field label="Reviews" value={values.reviews} onChange={(v) => update("reviews", v)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Status</span>
            <select
              value={values.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-600">Next follow-up</span>
            <input
              type="date"
              value={values.next_follow_up_at}
              onChange={(e) => update("next_follow_up_at", e.target.value)}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </label>
        </div>

        <Field label="Notes" value={values.notes} onChange={(v) => update("notes", v)} textarea />

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
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      )}
    </label>
  );
}
