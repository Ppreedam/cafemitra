"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarX2,
  Download,
  ExternalLink,
  Globe,
  History,
  LayoutGrid,
  Pencil,
  Phone,
  Search,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import LeadFormModal, { LeadFormValues } from "@/components/LeadFormModal";
import ImportModal from "@/components/ImportModal";
import LeadTimelineModal from "@/components/LeadTimelineModal";
import { initials, domainOf, followUpState, formatFollowUp, FollowUpState } from "@/lib/format";
import { LEAD_STATUSES, statusMeta } from "@/lib/leadStatus";
import { leadsToCsv, downloadTextFile } from "@/lib/csv";
import {
  Lead,
  createLead,
  deleteLead,
  fetchLeads,
  importLeads,
  updateLead,
  updateLeadStatus,
} from "@/lib/api";

const FOLLOW_UP_FILTERS: { value: FollowUpState | "all"; label: string; badge: string }[] = [
  { value: "overdue", label: "Overdue", badge: "bg-red-50 text-red-700 ring-red-300" },
  { value: "today", label: "Due today", badge: "bg-amber-50 text-amber-700 ring-amber-300" },
  { value: "upcoming", label: "Upcoming", badge: "bg-blue-50 text-blue-700 ring-blue-300" },
  { value: "none", label: "No date set", badge: "bg-slate-100 text-slate-600 ring-slate-300" },
];

function toPayload(values: LeadFormValues) {
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    phone: values.phone.trim(),
    website: values.website.trim(),
    maps_url: values.maps_url.trim(),
    rating: values.rating.trim() === "" ? null : Number(values.rating),
    reviews: values.reviews.trim() === "" ? null : Number(values.reviews),
    status: values.status,
    notes: values.notes.trim(),
    next_follow_up_at: values.next_follow_up_at.trim(),
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [followUpFilter, setFollowUpFilter] = useState<FollowUpState | "all">("all");
  const [editing, setEditing] = useState<Lead | null>(null);
  const [timelineLead, setTimelineLead] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStatus, setBulkStatus] = useState(LEAD_STATUSES[0].value as string);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback((query: string) => {
    setLoading(true);
    setError("");
    fetchLeads(query)
      .then((res) => setLeads(res.placeDetails))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load leads."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => load(search), 300);
    return () => clearTimeout(handle);
  }, [search, load]);

  const total = leads.length;
  const withPhone = leads.filter((l) => l.phone).length;
  const withWebsite = leads.filter((l) => l.website).length;
  const rated = leads.filter((l) => l.rating != null);
  const avgRating = rated.length ? (rated.reduce((sum, l) => sum + (l.rating ?? 0), 0) / rated.length).toFixed(1) : "-";

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads) counts[lead.status] = (counts[lead.status] ?? 0) + 1;
    return counts;
  }, [leads]);

  const followUpCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lead of leads) {
      const state = followUpState(lead.next_follow_up_at);
      counts[state] = (counts[state] ?? 0) + 1;
    }
    return counts;
  }, [leads]);

  const visibleLeads = leads
    .filter((l) => statusFilter === "all" || l.status === statusFilter)
    .filter((l) => followUpFilter === "all" || followUpState(l.next_follow_up_at) === followUpFilter);

  const allVisibleSelected = visibleLeads.length > 0 && visibleLeads.every((l) => selectedIds.has(l.id));
  const someVisibleSelected = visibleLeads.some((l) => selectedIds.has(l.id));

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const l of visibleLeads) next.delete(l.id);
      } else {
        for (const l of visibleLeads) next.add(l.id);
      }
      return next;
    });
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this lead? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete lead.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStatusChange(id: number, nextStatus: string) {
    const previous = leads;
    setStatusUpdatingId(id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: nextStatus } : l)));
    try {
      await updateLeadStatus(id, nextStatus);
    } catch (err) {
      setLeads(previous);
      alert(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleBulkStatus() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      await Promise.all(ids.map((id) => updateLeadStatus(id, bulkStatus)));
      setLeads((prev) => prev.map((l) => (selectedIds.has(l.id) ? { ...l, status: bulkStatus } : l)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bulk status update failed for some leads.");
      load(search);
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} lead(s)? This cannot be undone.`)) return;
    setBulkBusy(true);
    try {
      await Promise.all(ids.map((id) => deleteLead(id)));
      setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)));
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof Error ? err.message : "Bulk delete failed for some leads.");
      load(search);
    } finally {
      setBulkBusy(false);
    }
  }

  function handleExportCsv() {
    const csv = leadsToCsv(visibleLeads);
    downloadTextFile(`leads-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv;charset=utf-8;");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">Businesses scraped from Google Maps, ready for outreach.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={visibleLeads.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Bulk import
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Add lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total leads" value={total} icon={<Users size={18} />} />
        <StatCard label="With phone" value={withPhone} icon={<Phone size={18} />} />
        <StatCard label="With website" value={withWebsite} icon={<Globe size={18} />} />
        <StatCard label="Avg rating" value={avgRating} icon={<Star size={18} />} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          <LayoutGrid size={13} /> Pipeline
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white ring-slate-900"
                : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
            }`}
          >
            All <span className="tabular-nums opacity-70">{total}</span>
          </button>
          {LEAD_STATUSES.map((s) => {
            const active = statusFilter === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                  active ? `${s.badge} ${s.ring}` : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                {s.label}
                <span className="tabular-nums opacity-70">{statusCounts[s.value] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
          <CalendarClock size={13} /> Follow-up
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFollowUpFilter("all")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
              followUpFilter === "all"
                ? "bg-slate-900 text-white ring-slate-900"
                : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
            }`}
          >
            All <span className="tabular-nums opacity-70">{total}</span>
          </button>
          {FOLLOW_UP_FILTERS.map((f) => {
            const active = followUpFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFollowUpFilter(f.value)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
                  active ? f.badge : "bg-white text-slate-500 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
                <span className="tabular-nums opacity-70">{followUpCounts[f.value] ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search leads by name..."
          className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2.5">
          <span className="text-sm font-medium text-indigo-900">{selectedIds.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-md border border-indigo-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkStatus}
            disabled={bulkBusy}
            className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Apply status
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={bulkBusy}
            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            <Trash2 size={12} /> Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
          >
            <X size={12} /> Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="w-10 px-4 py-2.5">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected;
                  }}
                  onChange={toggleSelectAll}
                  className="h-3.5 w-3.5 accent-indigo-600"
                  aria-label="Select all visible leads"
                />
              </th>
              <th className="px-4 py-2.5">Business</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Follow-up</th>
              <th className="px-4 py-2.5">Address</th>
              <th className="px-4 py-2.5">Rating</th>
              <th className="px-4 py-2.5">Website</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  Loading leads...
                </td>
              </tr>
            ) : visibleLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  No leads found.
                </td>
              </tr>
            ) : (
              visibleLeads.map((lead) => {
                const meta = statusMeta(lead.status);
                const fu = followUpState(lead.next_follow_up_at);
                return (
                  <tr key={lead.id} className={`hover:bg-slate-50 ${selectedIds.has(lead.id) ? "bg-indigo-50/40" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="h-3.5 w-3.5 accent-indigo-600"
                        aria-label={`Select ${lead.name}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100">
                          {initials(lead.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{lead.name}</p>
                          <a
                            href={lead.maps_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                          >
                            View on Maps <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone.replace(/\s+/g, "")}`}
                          className="inline-flex items-center gap-1.5 tabular-nums hover:text-indigo-600"
                        >
                          <Phone size={13} className="text-slate-400" />
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        disabled={statusUpdatingId === lead.id}
                        className={`cursor-pointer rounded-full border-0 py-1 pl-2 pr-6 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 ${meta.badge}`}
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {lead.next_follow_up_at ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            fu === "overdue"
                              ? "bg-red-50 text-red-700"
                              : fu === "today"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {fu === "overdue" ? <CalendarX2 size={12} /> : <CalendarClock size={12} />}
                          {formatFollowUp(lead.next_follow_up_at)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600" title={lead.address}>
                      {lead.address || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      {lead.rating != null ? (
                        <div className="inline-flex items-center gap-1.5">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span className="font-medium tabular-nums text-slate-800">{lead.rating.toFixed(1)}</span>
                          <span className="text-xs text-slate-400">({lead.reviews ?? 0})</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[10rem]">
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-full items-center gap-1.5 text-indigo-600 hover:underline"
                        >
                          <Globe size={13} className="shrink-0 text-slate-400" />
                          <span className="truncate">{domainOf(lead.website)}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setTimelineLead(lead)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          <History size={13} />
                        </button>
                        <button
                          onClick={() => setEditing(lead)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          disabled={deletingId === lead.id}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={13} /> {deletingId === lead.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <LeadFormModal
          title="Add lead"
          onClose={() => setShowAdd(false)}
          onSubmit={async (values) => {
            const created = await createLead(toPayload(values));
            setLeads((prev) => [created.placeDetail, ...prev]);
            setShowAdd(false);
          }}
        />
      )}

      {editing && (
        <LeadFormModal
          title={`Edit ${editing.name}`}
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (values) => {
            const updated = await updateLead(editing.id, toPayload(values));
            setLeads((prev) => prev.map((l) => (l.id === editing.id ? updated.placeDetail : l)));
            setEditing(null);
          }}
        />
      )}

      {timelineLead && <LeadTimelineModal lead={timelineLead} onClose={() => setTimelineLead(null)} />}

      {showImport && (
        <ImportModal
          title="Bulk import leads"
          placeholder={`[\n  {\n    "name": "Cafe Mitra",\n    "maps_url": "https://maps.google.com/...",\n    "phone": "9876543210",\n    "address": "MG Road, Pune",\n    "website": "https://cafemitra.example",\n    "rating": 4.5,\n    "reviews": 120,\n    "status": "new"\n  }\n]`}
          onClose={() => setShowImport(false)}
          onImport={async (items) => {
            const res = await importLeads(items);
            load(search);
            return res;
          }}
        />
      )}
    </div>
  );
}
