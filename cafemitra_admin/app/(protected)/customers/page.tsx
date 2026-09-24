"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink, NotebookPen, Plus, RefreshCw, Tag as TagIcon, Trash2, X } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import Pagination from "@/components/Pagination";
import {
  createCustomerNote,
  createCustomerTag,
  deleteCustomerNote,
  deleteCustomerTag,
  exportCustomersCsv,
  fetchCustomerNotes,
  fetchCustomers,
  fetchCustomerTags,
  impersonateShop,
  setCustomerTags,
  type Customer,
  type CustomerNote,
  type CustomerTag,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const PAGE_SIZE = 20;
type SortValue = "orders_asc" | "orders_desc" | "wallet_asc" | "wallet_desc" | null;

// Stable per-tag color, purely derived from tag.id so it never changes across
// reloads without needing a `color` column.
const TAG_COLORS = [
  { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
  { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700", dot: "bg-fuchsia-500" },
  { bg: "bg-lime-50", text: "text-lime-800", dot: "bg-lime-600" },
  { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
];

function tagColor(tagId: number) {
  return TAG_COLORS[tagId % TAG_COLORS.length];
}

// Indian mobile numbers are stored as plain 10-digit strings with no
// country code - wa.me needs the full international number with no
// leading + or 0, so a bare 10-digit number gets "91" prefixed.
function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountryCode}`;
}

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.29.638 4.43 1.744 6.256L4 29l7.94-1.71A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.818a9.77 9.77 0 0 1-4.986-1.363l-.358-.213-4.71 1.014 1.005-4.59-.234-.372A9.77 9.77 0 0 1 5.182 15c0-5.976 4.846-10.818 10.822-10.818S26.818 9.024 26.818 15 21.98 24.818 16.004 24.818Zm5.6-8.15c-.307-.153-1.817-.897-2.098-1-.281-.102-.486-.153-.69.154-.204.307-.792 1-1.98 1.256-.363.077-.686.153-1.408-.256-.722-.41-1.66-.964-2.72-1.947-1.006-.936-1.72-1.884-1.98-2.24-.256-.358-.028-.55.194-.75.198-.192.44-.5.66-.75.22-.25.293-.428.44-.714.147-.286.073-.536-.037-.75-.11-.212-.99-2.386-1.357-3.27-.357-.858-.72-.742-.99-.756l-.844-.015c-.294 0-.77.11-1.174.5-.404.39-1.54 1.505-1.54 3.67s1.577 4.256 1.797 4.55c.22.294 3.104 4.74 7.523 6.65 1.05.454 1.87.726 2.51.928.055 0 .105-.01.146-.024.792-.22 2.4-1.098 2.74-2.157.34-1.06.34-1.966.238-2.157-.1-.19-.375-.303-.782-.5Z" />
    </svg>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [tagFilter, setTagFilter] = useState<number | "">("");
  const [walletOp, setWalletOp] = useState<"gte" | "lte">("gte");
  const [walletValue, setWalletValue] = useState("");
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagError, setTagError] = useState("");
  const [openTagMenuFor, setOpenTagMenuFor] = useState<number | null>(null);
  const [savingCustomerId, setSavingCustomerId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [launchingCustomerId, setLaunchingCustomerId] = useState<number | null>(null);

  const [openNotesFor, setOpenNotesFor] = useState<number | null>(null);
  const [notesByCustomer, setNotesByCustomer] = useState<Record<number, CustomerNote[]>>({});
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetchCustomers({
      search,
      page,
      pageSize: PAGE_SIZE,
      sort: sort || undefined,
      tagId: tagFilter || undefined,
      walletOp: walletValue.trim() ? walletOp : undefined,
      walletValue: walletValue.trim() ? walletValue.trim() : undefined,
    })
      .then((res) => {
        setCustomers(res.customers);
        setCount(res.count);
        setPageSize(res.pageSize);
        setError("");
        setSelectedIds(new Set());
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load customers."))
      .finally(() => setLoading(false));
  }, [search, page, sort, tagFilter, walletOp, walletValue]);

  const loadTags = useCallback(() => {
    fetchCustomerTags()
      .then((res) => setTags(res.tags))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  useEffect(loadTags, [loadTags]);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function toggleOrderSort() {
    setSort((cur) => (cur === "orders_desc" ? "orders_asc" : cur === "orders_asc" ? null : "orders_desc"));
    setPage(1);
  }

  function toggleWalletSort() {
    setSort((cur) => (cur === "wallet_desc" ? "wallet_asc" : cur === "wallet_asc" ? null : "wallet_desc"));
    setPage(1);
  }

  function updateWalletValue(value: string) {
    setWalletValue(value);
    setPage(1);
  }

  function updateWalletOp(op: "gte" | "lte") {
    setWalletOp(op);
    setPage(1);
  }

  function handleTagFilterChange(value: string) {
    setTagFilter(value ? Number(value) : "");
    setPage(1);
  }

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) => (prev.size === customers.length ? new Set() : new Set(customers.map((c) => c.id))));
  }

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    setTagError("");
    try {
      await createCustomerTag(newTagName.trim());
      setNewTagName("");
      loadTags();
    } catch (err) {
      setTagError(err instanceof Error ? err.message : "Failed to create tag.");
    } finally {
      setCreatingTag(false);
    }
  }

  async function handleDeleteTag(tagId: number) {
    if (!confirm("Delete this tag? It will be removed from every customer it's assigned to.")) return;
    try {
      await deleteCustomerTag(tagId);
      loadTags();
      if (tagFilter === tagId) {
        setTagFilter("");
        setPage(1);
      }
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete tag.");
    }
  }

  async function toggleCustomerTag(customer: Customer, tagId: number) {
    const has = customer.tags.some((t) => t.id === tagId);
    const nextIds = has ? customer.tags.filter((t) => t.id !== tagId).map((t) => t.id) : [...customer.tags.map((t) => t.id), tagId];
    setSavingCustomerId(customer.id);
    try {
      const res = await setCustomerTags(customer.id, nextIds);
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, tags: res.tags } : c)));
      loadTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update tags.");
    } finally {
      setSavingCustomerId(null);
    }
  }

  async function handleLaunchDashboard(customer: Customer) {
    if (!window.confirm(`Open ${customer.fullName || customer.email}'s dashboard on repetigo.com in a new tab, logged in as them? Logged in the activity log.`)) {
      return;
    }
    setLaunchingCustomerId(customer.id);
    try {
      await impersonateShop(customer.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to launch dashboard.");
    } finally {
      setLaunchingCustomerId(null);
    }
  }

  function openNotes(customerId: number) {
    if (openNotesFor === customerId) {
      setOpenNotesFor(null);
      return;
    }
    setOpenNotesFor(customerId);
    setNewNoteText("");
    setNoteError("");
    if (!notesByCustomer[customerId]) {
      setNotesLoading(true);
      fetchCustomerNotes(customerId)
        .then((res) => setNotesByCustomer((prev) => ({ ...prev, [customerId]: res.notes })))
        .catch((err) => setNoteError(err instanceof Error ? err.message : "Failed to load notes."))
        .finally(() => setNotesLoading(false));
    }
  }

  async function handleAddNote(customerId: number) {
    if (!newNoteText.trim()) return;
    setSavingNote(true);
    setNoteError("");
    try {
      const res = await createCustomerNote(customerId, newNoteText.trim());
      setNotesByCustomer((prev) => ({ ...prev, [customerId]: [res.note, ...(prev[customerId] || [])] }));
      setNewNoteText("");
    } catch (err) {
      setNoteError(err instanceof Error ? err.message : "Failed to add note.");
    } finally {
      setSavingNote(false);
    }
  }

  async function handleDeleteNote(customerId: number, noteId: number) {
    if (!confirm("Delete this note?")) return;
    try {
      await deleteCustomerNote(noteId);
      setNotesByCustomer((prev) => ({ ...prev, [customerId]: (prev[customerId] || []).filter((n) => n.id !== noteId) }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete note.");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Customers</h1>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <p className="text-sm text-slate-500 shrink-0">{count} customers on the platform.</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => updateSearch(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={tagFilter}
            onChange={(e) => handleTagFilterChange(e.target.value)}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Filter by tag: all</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name} ({tag.customerCount ?? 0})
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <select
              value={walletOp}
              onChange={(e) => updateWalletOp(e.target.value as "gte" | "lte")}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              title="Wallet amount filter"
            >
              <option value="gte">Wallet ≥</option>
              <option value="lte">Wallet ≤</option>
            </select>
            <input
              type="number"
              placeholder="Threshold, e.g. 100"
              value={walletValue}
              onChange={(e) => updateWalletValue(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {walletValue && (
              <button
                onClick={() => updateWalletValue("")}
                title="Clear wallet filter"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-1.5 text-slate-500 hover:bg-slate-50"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              load();
              loadTags();
            }}
            disabled={loading}
            title="Refresh"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white p-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowTagManager((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <TagIcon size={14} />
            Manage tags
          </button>
          <button
            onClick={() =>
              exportCustomersCsv({ search, ids: selectedIds.size > 0 ? Array.from(selectedIds) : undefined }).catch((err) =>
                setError(err instanceof Error ? err.message : "Export failed.")
              )
            }
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            title={selectedIds.size > 0 ? `Export the ${selectedIds.size} selected customer(s)` : "Export all customers matching the current search"}
          >
            Export CSV{selectedIds.size > 0 ? ` (${selectedIds.size} selected)` : ""}
          </button>
        </div>
      </div>

      {showTagManager && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4 space-y-3">
          <form onSubmit={handleCreateTag} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="New tag name, e.g. VIP"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm w-56"
            />
            <button
              type="submit"
              disabled={creatingTag || !newTagName.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Plus size={14} /> Add tag
            </button>
            {tagError && <span className="text-sm text-red-600">{tagError}</span>}
          </form>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">
              {tags.length === 0 ? "No tags yet - create one above." : "Click a tag to delete it (removes it from every customer):"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const color = tagColor(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleDeleteTag(tag.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full ${color.bg} px-2.5 py-1 text-xs font-medium ${color.text} hover:opacity-70`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                    {tag.name}
                    <span className="opacity-60">({tag.customerCount ?? 0})</span>
                    <X size={11} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium w-8">
                <input
                  type="checkbox"
                  checked={customers.length > 0 && selectedIds.size === customers.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">
                <button onClick={toggleWalletSort} className="inline-flex items-center gap-1 hover:text-slate-700">
                  Wallet amount
                  {sort === "wallet_desc" ? (
                    <ArrowDown size={13} />
                  ) : sort === "wallet_asc" ? (
                    <ArrowUp size={13} />
                  ) : (
                    <ArrowUpDown size={13} className="opacity-40" />
                  )}
                </button>
              </th>
              <th className="px-4 py-2 font-medium">
                <button onClick={toggleOrderSort} className="inline-flex items-center gap-1 hover:text-slate-700">
                  Orders
                  {sort === "orders_desc" ? (
                    <ArrowDown size={13} />
                  ) : sort === "orders_asc" ? (
                    <ArrowUp size={13} />
                  ) : (
                    <ArrowUpDown size={13} className="opacity-40" />
                  )}
                </button>
              </th>
              <th className="px-4 py-2 font-medium">Address</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium">Last seen</th>
              <th className="px-4 py-2 font-medium">Tags</th>
              <th className="px-4 py-2 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-center text-slate-500">
                  No customers match these filters.
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2">
                  <input type="checkbox" checked={selectedIds.has(customer.id)} onChange={() => toggleSelected(customer.id)} />
                </td>
                <td className="px-4 py-2 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/customers/${customer.id}`} className="text-indigo-700 hover:underline">
                      {customer.fullName || "-"}
                    </Link>
                    <button
                      onClick={() => handleLaunchDashboard(customer)}
                      disabled={launchingCustomerId === customer.id}
                      title="Launch this customer's dashboard on repetigo.com (impersonate)"
                      className="text-slate-400 hover:text-indigo-600 disabled:opacity-40"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span>{customer.email}</span>
                    {customer.email && <CopyButton value={customer.email} />}
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {customer.phone ? (
                    <div className="flex items-center gap-1.5">
                      <span>{customer.phone}</span>
                      <CopyButton value={customer.phone} />
                      <a
                        href={whatsappLink(customer.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="text-emerald-600 hover:text-emerald-700"
                      >
                        <WhatsAppIcon />
                      </a>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className={`px-4 py-2 font-medium ${customer.walletAmount < 0 ? "text-red-600" : "text-slate-900"}`}>
                  {formatCurrency(customer.walletAmount)}
                </td>
                <td className="px-4 py-2 text-slate-900 font-medium">{customer.orderCount}</td>
                <td className="px-4 py-2 text-slate-700">{customer.address || "-"}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(customer.dateJoined).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-2 text-slate-500">
                  {customer.lastSeen ? new Date(customer.lastSeen).toLocaleDateString("en-IN") : "-"}
                </td>
                <td className="px-4 py-2 relative">
                  <div className="flex flex-wrap items-center gap-1 max-w-[12rem]">
                    {customer.tags.map((tag) => {
                      const color = tagColor(tag.id);
                      return (
                        <span key={tag.id} className={`inline-flex items-center gap-1 rounded-full ${color.bg} px-2 py-0.5 text-xs ${color.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                          {tag.name}
                          <button
                            onClick={() => toggleCustomerTag(customer, tag.id)}
                            disabled={savingCustomerId === customer.id}
                            className="opacity-60 hover:opacity-100 hover:text-red-600 disabled:opacity-30"
                            title={`Remove "${tag.name}" from this customer`}
                          >
                            <X size={10} />
                          </button>
                        </span>
                      );
                    })}
                    <button
                      onClick={() => setOpenTagMenuFor((cur) => (cur === customer.id ? null : customer.id))}
                      disabled={savingCustomerId === customer.id}
                      className="inline-flex items-center justify-center h-5 w-5 rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50"
                      title="Assign tags"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                  {openTagMenuFor === customer.id && (
                    <div className="absolute right-4 top-9 z-10 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                      {tags.length === 0 ? (
                        <p className="px-2 py-1 text-xs text-slate-400">No tags yet - create one above.</p>
                      ) : (
                        tags.map((tag) => {
                          const checked = customer.tags.some((t) => t.id === tag.id);
                          const color = tagColor(tag.id);
                          return (
                            <label key={tag.id} className="flex items-center gap-2 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleCustomerTag(customer, tag.id)}
                                className="rounded border-slate-300"
                              />
                              <span className={`h-2 w-2 rounded-full ${color.dot}`} />
                              {tag.name}
                            </label>
                          );
                        })
                      )}
                      <button
                        onClick={() => setOpenTagMenuFor(null)}
                        className="mt-1 w-full rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 relative">
                  <button
                    onClick={() => openNotes(customer.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    title="View / add dated notes"
                  >
                    <NotebookPen size={12} />
                    {notesByCustomer[customer.id]?.length ? `${notesByCustomer[customer.id].length} note${notesByCustomer[customer.id].length === 1 ? "" : "s"}` : "Notes"}
                  </button>
                  {openNotesFor === customer.id && (
                    <div className="absolute right-4 top-9 z-20 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
                      <p className="mb-2 text-xs font-medium text-slate-500">Notes for {customer.fullName || customer.email}</p>
                      <div className="max-h-48 overflow-y-auto space-y-2 mb-2">
                        {notesLoading && !notesByCustomer[customer.id] ? (
                          <p className="px-1 py-1 text-xs text-slate-400">Loading...</p>
                        ) : (notesByCustomer[customer.id] || []).length === 0 ? (
                          <p className="px-1 py-1 text-xs text-slate-400">No notes yet.</p>
                        ) : (
                          (notesByCustomer[customer.id] || []).map((note) => (
                            <div key={note.id} className="rounded-md bg-slate-50 px-2 py-1.5 text-xs">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-slate-700 whitespace-pre-wrap break-words">{note.body}</p>
                                <button
                                  onClick={() => handleDeleteNote(customer.id, note.id)}
                                  className="shrink-0 text-slate-400 hover:text-red-600"
                                  title="Delete note"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                              <p className="mt-1 text-[11px] text-slate-400">
                                {new Date(note.createdAt).toLocaleDateString("en-IN")} {new Date(note.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                {note.authorName ? ` · ${note.authorName}` : ""}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      {noteError && <p className="mb-2 text-xs text-red-600">{noteError}</p>}
                      <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Add a short note..."
                        rows={2}
                        className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <button onClick={() => setOpenNotesFor(null)} className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
                          Close
                        </button>
                        <button
                          onClick={() => handleAddNote(customer.id)}
                          disabled={savingNote || !newNoteText.trim()}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                          <Plus size={12} /> Add note
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}
