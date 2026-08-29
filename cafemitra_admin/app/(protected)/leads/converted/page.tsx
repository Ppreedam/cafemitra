"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CalendarX2, ExternalLink, History, Mail, MessageCircle, Pencil, Phone, Tags, Trash2, Users } from "lucide-react";
import StatCard from "@/components/leads/StatCard";
import LeadFormModal, { type LeadFormValues } from "@/components/leads/LeadFormModal";
import LeadTimelineModal from "@/components/leads/LeadTimelineModal";
import TagManagerModal from "@/components/leads/TagManagerModal";
import TagPicker from "@/components/leads/TagPicker";
import { initials, followUpState, formatFollowUp, whatsappLink } from "@/lib/leadFormat";
import { tagColorMeta } from "@/lib/tagColors";
import {
  type Lead,
  type LeadTag,
  deleteLead,
  fetchConvertedLeads,
  fetchLeadTags,
  setLeadTags,
  updateLead,
} from "@/lib/leads";

function toPayload(values: LeadFormValues) {
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    website: values.website.trim(),
    maps_url: values.maps_url.trim(),
    rating: values.rating.trim() === "" ? null : Number(values.rating),
    reviews: values.reviews.trim() === "" ? null : Number(values.reviews),
    status: values.status,
    notes: values.notes.trim(),
    next_follow_up_at: values.next_follow_up_at.trim(),
  };
}

export default function ConvertedCustomersPage() {
  const [customers, setCustomers] = useState<Lead[]>([]);
  const [tags, setTags] = useState<LeadTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Lead | null>(null);
  const [timelineLead, setTimelineLead] = useState<Lead | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([fetchConvertedLeads(), fetchLeadTags()])
      .then(([leadsRes, tagsRes]) => {
        setCustomers(leadsRes.placeDetails);
        setTags(tagsRes.tags);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load converted customers."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const total = customers.length;
  const withPhone = customers.filter((c) => c.phone).length;
  const withEmail = customers.filter((c) => c.email).length;
  const tagged = customers.filter((c) => c.tags.length > 0).length;

  async function handleToggleTag(customer: Lead, tagId: number) {
    const currentIds = customer.tags.map((t) => t.id);
    const nextIds = currentIds.includes(tagId) ? currentIds.filter((id) => id !== tagId) : [...currentIds, tagId];
    const previous = customers;
    setCustomers((prev) =>
      prev.map((c) => (c.id === customer.id ? { ...c, tags: tags.filter((t) => nextIds.includes(t.id)) } : c))
    );
    try {
      await setLeadTags(customer.id, nextIds);
    } catch (err) {
      setCustomers(previous);
      alert(err instanceof Error ? err.message : "Failed to update tags.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteLead(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete customer.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Converted Customers</h1>
          <p className="text-sm text-slate-500">
            Leads whose pipeline status is Converted - tag them to track follow-up and keep them active on RepetiGo.
          </p>
        </div>
        <button
          onClick={() => setShowTagManager(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Tags size={14} /> Manage tags
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Converted customers" value={total} icon={<Users size={18} />} />
        <StatCard label="With phone" value={withPhone} icon={<Phone size={18} />} />
        <StatCard label="With email" value={withEmail} icon={<Mail size={18} />} />
        <StatCard label="Tagged" value={tagged} icon={<Tags size={18} />} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Business</th>
              <th className="px-4 py-2.5">Contact</th>
              <th className="px-4 py-2.5">Address</th>
              <th className="px-4 py-2.5">Tags</th>
              <th className="px-4 py-2.5">Follow-up</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Loading converted customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No converted customers yet - mark a lead as "Converted" on the Pipeline page.
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const fu = followUpState(customer.next_follow_up_at);
                return (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-100">
                          {initials(customer.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">{customer.name}</p>
                          {customer.maps_url.startsWith("internal://") ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <Users size={11} /> Registered customer
                            </span>
                          ) : (
                            <a
                              href={customer.maps_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                            >
                              View on Maps <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="space-y-1">
                        {customer.phone ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${customer.phone.replace(/\s+/g, "")}`}
                              className="flex items-center gap-1.5 tabular-nums hover:text-indigo-600"
                            >
                              <Phone size={13} className="text-slate-400" /> {customer.phone}
                            </a>
                            <a
                              href={whatsappLink(customer.phone, customer.name)}
                              target="_blank"
                              rel="noreferrer"
                              title="Message on WhatsApp"
                              className="text-emerald-500 hover:text-emerald-700"
                            >
                              <MessageCircle size={13} />
                            </a>
                          </div>
                        ) : null}
                        {customer.email ? (
                          <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 hover:text-indigo-600">
                            <Mail size={13} className="text-slate-400" /> {customer.email}
                          </a>
                        ) : null}
                        {!customer.phone && !customer.email && <span className="text-slate-300">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600" title={customer.address}>
                      {customer.address || <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {customer.tags.map((tag) => {
                          const meta = tagColorMeta(tag.color);
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleToggleTag(customer, tag.id)}
                              title="Remove tag"
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge} hover:opacity-70`}
                            >
                              {tag.name} <span className="text-[10px]">x</span>
                            </button>
                          );
                        })}
                        <TagPicker
                          allTags={tags}
                          assignedIds={customer.tags.map((t) => t.id)}
                          onToggle={(tagId) => handleToggleTag(customer, tagId)}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {customer.next_follow_up_at ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            fu === "overdue" ? "bg-red-50 text-red-700" : fu === "today" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {fu === "overdue" ? <CalendarX2 size={12} /> : <CalendarClock size={12} />}
                          {formatFollowUp(customer.next_follow_up_at)}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => setTimelineLead(customer)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        >
                          <History size={13} />
                        </button>
                        <button
                          onClick={() => setEditing(customer)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          disabled={deletingId === customer.id}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={13} /> {deletingId === customer.id ? "Deleting..." : "Delete"}
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

      {editing && (
        <LeadFormModal
          title={`Edit ${editing.name}`}
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (values) => {
            const updated = await updateLead(editing.id, toPayload(values));
            setCustomers((prev) =>
              prev.map((c) => (c.id === editing.id ? updated.placeDetail : c)).filter((c) => c.status === "converted")
            );
            setEditing(null);
          }}
        />
      )}

      {timelineLead && <LeadTimelineModal lead={timelineLead} onClose={() => setTimelineLead(null)} />}

      {showTagManager && (
        <TagManagerModal
          tags={tags}
          onClose={() => setShowTagManager(false)}
          onChange={load}
        />
      )}
    </div>
  );
}
