"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, RefreshCw, Tag as TagIcon, X } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import Pagination from "@/components/Pagination";
import {
  createCustomerTag,
  deleteCustomerTag,
  exportCustomersCsv,
  fetchCustomers,
  fetchCustomerTags,
  setCustomerTags,
  type Customer,
  type CustomerTag,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const PAGE_SIZE = 20;
type OrderSort = "orders_asc" | "orders_desc" | null;

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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [orderSort, setOrderSort] = useState<OrderSort>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [tagFilter, setTagFilter] = useState<number | "">("");
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagError, setTagError] = useState("");
  const [openTagMenuFor, setOpenTagMenuFor] = useState<number | null>(null);
  const [savingCustomerId, setSavingCustomerId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const load = useCallback(() => {
    setLoading(true);
    fetchCustomers({ search, page, pageSize: PAGE_SIZE, sort: orderSort || undefined, tagId: tagFilter || undefined })
      .then((res) => {
        setCustomers(res.customers);
        setCount(res.count);
        setPageSize(res.pageSize);
        setError("");
        setSelectedIds(new Set());
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load customers."))
      .finally(() => setLoading(false));
  }, [search, page, orderSort, tagFilter]);

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
    setOrderSort((cur) => (cur === "orders_desc" ? "orders_asc" : cur === "orders_asc" ? null : "orders_desc"));
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
              <th className="px-4 py-2 font-medium">Wallet amount</th>
              <th className="px-4 py-2 font-medium">
                <button onClick={toggleOrderSort} className="inline-flex items-center gap-1 hover:text-slate-700">
                  Orders
                  {orderSort === "orders_desc" ? (
                    <ArrowDown size={13} />
                  ) : orderSort === "orders_asc" ? (
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
            </tr>
          </thead>
          <tbody>
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-6 text-center text-slate-500">
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
                  <Link href={`/customers/${customer.id}`} className="text-indigo-700 hover:underline">
                    {customer.fullName || "-"}
                  </Link>
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
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}
