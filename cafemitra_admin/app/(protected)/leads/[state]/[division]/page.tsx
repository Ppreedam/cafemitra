"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download, Plus, Tag as TagIcon, X } from "lucide-react";
import Pagination from "@/components/Pagination";
import {
  bulkTagLeadAgents,
  createLeadTag,
  deleteLeadTag,
  exportLeadAgentsCsv,
  fetchLeadAgentMobiles,
  fetchLeadAgents,
  fetchLeadTags,
  importLeadAgentTags,
  setLeadAgentTags,
  type LeadAgent,
  type LeadTag,
  type LeadTagImportResult,
} from "@/lib/api";

const PAGE_SIZE = 25;

// Stable per-tag color, purely derived from tag.id so it never changes across
// reloads without needing a `color` column - cycles through a fixed palette
// so tags stay visually distinguishable at a glance in the table/chips.
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

// Same palette as TAG_COLORS, as hex, for contexts (native <option> text
// color) that can't take Tailwind classes.
const TAG_DOT_HEX = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9", "#d946ef", "#65a30d", "#f97316"];

export default function LeadDivisionPage({ params }: { params: Promise<{ state: string; division: string }> }) {
  const { state: stateParam, division: divisionParam } = use(params);
  const state = decodeURIComponent(stateParam);
  const division = decodeURIComponent(divisionParam);

  const [agents, setAgents] = useState<LeadAgent[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tags, setTags] = useState<LeadTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagError, setTagError] = useState("");
  const [tagFilter, setTagFilter] = useState<number | "">("");
  const [openTagMenuFor, setOpenTagMenuFor] = useState<number | null>(null);
  const [savingAgentId, setSavingAgentId] = useState<number | null>(null);

  const [bulkTagId, setBulkTagId] = useState<number | "">("");
  const [bulkCount, setBulkCount] = useState("20");
  const [bulkAction, setBulkAction] = useState<"assign" | "remove">("assign");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [bulkResult, setBulkResult] = useState("");
  const [lastBatchMobiles, setLastBatchMobiles] = useState<string[]>([]);
  const [batchCopyMessage, setBatchCopyMessage] = useState("");

  const [copying, setCopying] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);

  const [tagPanelTab, setTagPanelTab] = useState<"manage" | "bulk" | "import">("manage");
  const [tagImportMode, setTagImportMode] = useState<"file" | "paste">("file");
  const [tagImportFile, setTagImportFile] = useState<File | null>(null);
  const [tagImportText, setTagImportText] = useState("");
  const [tagImporting, setTagImporting] = useState(false);
  const [tagImportError, setTagImportError] = useState("");
  const [tagImportResults, setTagImportResults] = useState<LeadTagImportResult[] | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchLeadAgents({ state, division, search, tagId: tagFilter || undefined, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setAgents(res.agents);
        setCount(res.count);
        setSelectedIds(new Set());
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load agents."))
      .finally(() => setLoading(false));
  }, [state, division, search, tagFilter, page]);

  const loadTags = useCallback(() => {
    fetchLeadTags()
      .then((res) => setTags(res.tags))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handle = setTimeout(load, 0);
    return () => clearTimeout(handle);
  }, [load]);

  useEffect(loadTags, [loadTags]);

  function handleSearchChange(value: string) {
    setSearch(value);
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
    setSelectedIds((prev) => (prev.size === agents.length ? new Set() : new Set(agents.map((a) => a.id))));
  }

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      await exportLeadAgentsCsv({
        state,
        division,
        search,
        tagId: tagFilter || undefined,
        ids: selectedIds.size > 0 ? Array.from(selectedIds) : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  function handleTagFilterChange(value: string) {
    setTagFilter(value ? Number(value) : "");
    setPage(1);
  }

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    setTagError("");
    try {
      await createLeadTag(newTagName.trim());
      setNewTagName("");
      loadTags();
    } catch (err) {
      setTagError(err instanceof Error ? err.message : "Failed to create tag.");
    } finally {
      setCreatingTag(false);
    }
  }

  async function handleDeleteTag(tagId: number) {
    if (!confirm("Delete this tag? It will be removed from every agent it's assigned to.")) return;
    try {
      await deleteLeadTag(tagId);
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

  async function handleBulkAssign(e: React.FormEvent) {
    e.preventDefault();
    const count = Number(bulkCount);
    if (!bulkTagId || !count || count <= 0) return;
    setBulkBusy(true);
    setBulkError("");
    setBulkResult("");
    setBatchCopyMessage("");
    try {
      const res = await bulkTagLeadAgents({ state, division, tagId: bulkTagId, count, action: bulkAction });
      const tagName = tags.find((t) => t.id === bulkTagId)?.name || "tag";
      if (res.affected > 0) {
        setBulkResult(
          bulkAction === "assign"
            ? `Tagged ${res.affected} more agent(s) with "${tagName}" - ${res.totalWithTag}/${res.totalInDivision} in this division now have it.`
            : `Removed "${tagName}" from ${res.affected} agent(s) - ${res.totalWithTag}/${res.totalInDivision} in this division still have it.`
        );
      } else {
        setBulkResult(
          bulkAction === "assign"
            ? `Every agent in this division already has "${tagName}" (${res.totalWithTag}/${res.totalInDivision}).`
            : `No agent in this division currently has "${tagName}" to remove it from.`
        );
      }
      setLastBatchMobiles(res.mobiles);
      loadTags();
      load();
    } catch (err) {
      setBulkError(err instanceof Error ? err.message : "Bulk update failed.");
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleCopyBatchNumbers() {
    if (lastBatchMobiles.length === 0) return;
    try {
      await navigator.clipboard.writeText(lastBatchMobiles.join(", "));
      setBatchCopyMessage(`Copied ${lastBatchMobiles.length} number(s) from just this batch.`);
    } catch (err) {
      setBatchCopyMessage(err instanceof Error ? err.message : "Copy failed.");
    }
  }

  async function handleCopyNumbers() {
    setCopying(true);
    setCopyMessage("");
    try {
      const res = await fetchLeadAgentMobiles({ state, division, search, tagId: tagFilter || undefined });
      if (res.mobiles.length === 0) {
        setCopyMessage("No mobile numbers in the current filter.");
      } else {
        await navigator.clipboard.writeText(res.mobiles.join(", "));
        setCopyMessage(`Copied ${res.mobiles.length} number(s).`);
      }
    } catch (err) {
      setCopyMessage(err instanceof Error ? err.message : "Copy failed.");
    } finally {
      setCopying(false);
    }
  }

  async function handleTagImport(e: React.FormEvent) {
    e.preventDefault();
    const input = tagImportMode === "file" ? tagImportFile : tagImportText.trim();
    if (!input) return;
    if (tagImportMode === "paste") {
      try {
        JSON.parse(tagImportText);
      } catch {
        setTagImportError("Pasted text is not valid JSON.");
        return;
      }
    }
    setTagImporting(true);
    setTagImportError("");
    setTagImportResults(null);
    try {
      const res = await importLeadAgentTags(input);
      setTagImportResults(res.results);
      setTagImportFile(null);
      setTagImportText("");
      loadTags();
      load();
    } catch (err) {
      setTagImportError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setTagImporting(false);
    }
  }

  async function toggleAgentTag(agent: LeadAgent, tagId: number) {
    const has = agent.tags.some((t) => t.id === tagId);
    const nextIds = has ? agent.tags.filter((t) => t.id !== tagId).map((t) => t.id) : [...agent.tags.map((t) => t.id), tagId];
    setSavingAgentId(agent.id);
    try {
      const res = await setLeadAgentTags(agent.id, nextIds);
      setAgents((prev) => prev.map((a) => (a.id === agent.id ? res.agent : a)));
      loadTags();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update tags.");
    } finally {
      setSavingAgentId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/leads/${encodeURIComponent(state)}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={14} /> {state} divisions
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{division}</h1>
        <p className="text-sm text-slate-500">{count.toLocaleString("en-IN")} agent{count === 1 ? "" : "s"} across this division&apos;s pincodes.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 pt-4 text-sm font-medium text-slate-700">
          <TagIcon size={15} /> Tags
        </div>

        <div className="flex flex-wrap items-center gap-1.5 px-4 pt-3">
          {tags.length === 0 && <span className="text-sm text-slate-400">No tags yet - create one in the Manage tab.</span>}
          {tags.map((tag) => {
            const color = tagColor(tag.id);
            return (
              <span
                key={tag.id}
                className={`inline-flex items-center gap-1.5 rounded-full ${color.bg} px-2.5 py-1 text-xs font-medium ${color.text}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                {tag.name}
                <span className="opacity-60">({tag.agentCount ?? 0})</span>
              </span>
            );
          })}
        </div>

        <div className="mt-3 flex gap-1 border-b border-slate-200 px-4">
          {(
            [
              ["manage", "Manage"],
              ["bulk", "Bulk assign/remove"],
              ["import", "Import from JSON"],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setTagPanelTab(tab)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                tagPanelTab === tab ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tagPanelTab === "manage" && (
            <div className="space-y-3">
              <form onSubmit={handleCreateTag} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New tag name, e.g. message sent"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm w-64"
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

              {tags.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Delete a tag (removes it from every agent):</p>
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
                          <X size={11} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {tagPanelTab === "bulk" && (
            <div>
              <form onSubmit={handleBulkAssign} className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-sm">
                  <button
                    type="button"
                    onClick={() => setBulkAction("assign")}
                    className={`px-2.5 py-1.5 font-medium ${bulkAction === "assign" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkAction("remove")}
                    className={`px-2.5 py-1.5 font-medium border-l border-slate-300 ${bulkAction === "remove" ? "bg-red-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    Remove
                  </button>
                </div>
                <select
                  value={bulkTagId}
                  onChange={(e) => setBulkTagId(e.target.value ? Number(e.target.value) : "")}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                >
                  <option value="">Choose a tag...</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-slate-500">for next</span>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={bulkCount}
                  onChange={(e) => setBulkCount(e.target.value)}
                  className="w-20 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
                <span className="text-sm text-slate-500">{bulkAction === "assign" ? "untagged" : "tagged"} agent(s)</span>
                <button
                  type="submit"
                  disabled={bulkBusy || !bulkTagId || !Number(bulkCount)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 ${
                    bulkAction === "assign" ? "bg-slate-800 hover:bg-slate-900" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {bulkBusy ? "Working..." : bulkAction === "assign" ? "Assign" : "Remove"}
                </button>
              </form>
              <p className="mt-2 text-xs text-slate-400">
                Applies to this division only, in table order - assign skips agents that already have the tag, remove skips agents that don&apos;t, so running it again with the same number picks up right after the last batch.
              </p>
              {bulkError && <p className="mt-2 text-sm text-red-600">{bulkError}</p>}
              {bulkResult && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-sm text-green-700">{bulkResult}</p>
                  {lastBatchMobiles.length > 0 && (
                    <button
                      onClick={handleCopyBatchNumbers}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      title="Copy only the numbers from this batch, not every agent with this tag"
                    >
                      <Copy size={12} /> Copy this batch&apos;s {lastBatchMobiles.length} number(s)
                    </button>
                  )}
                  {batchCopyMessage && <span className="text-xs text-slate-500">{batchCopyMessage}</span>}
                </div>
              )}
            </div>
          )}

          {tagPanelTab === "import" && (
            <form onSubmit={handleTagImport} className="flex flex-col gap-2 max-w-lg">
              <label className="text-xs font-medium text-slate-500">
                Delivery report JSON - a list of <code>{"{phone, name, status}"}</code>, e.g. a WhatsApp broadcast export
              </label>
              <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-sm w-fit">
                <button
                  type="button"
                  onClick={() => setTagImportMode("file")}
                  className={`px-3 py-1 font-medium ${tagImportMode === "file" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  Upload file
                </button>
                <button
                  type="button"
                  onClick={() => setTagImportMode("paste")}
                  className={`px-3 py-1 font-medium border-l border-slate-300 ${tagImportMode === "paste" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                >
                  Paste JSON
                </button>
              </div>
              {tagImportMode === "file" ? (
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => setTagImportFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
              ) : (
                <textarea
                  value={tagImportText}
                  onChange={(e) => setTagImportText(e.target.value)}
                  placeholder={'[{"phone": "918651830104", "name": "", "status": "sent"}, ...]'}
                  rows={6}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              )}
              <p className="text-xs text-slate-400">
                Every distinct <code>status</code> value becomes a tag, and every agent - in any state/division - whose mobile matches a phone gets that tag. Works with or without the &quot;91&quot; prefix.
              </p>
              {tagImportError && <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{tagImportError}</div>}
              {tagImportResults && (
                <div className="rounded-md bg-green-50 text-green-800 text-sm px-3 py-2 space-y-1">
                  {tagImportResults.map((r) => (
                    <p key={r.status}>
                      <span className="font-medium">&quot;{r.status}&quot;</span>: {r.matchedPhones}/{r.phonesInFile} phone(s) matched, {r.agentsTagged} agent record(s) tagged.
                    </p>
                  ))}
                </div>
              )}
              <button
                type="submit"
                disabled={tagImporting || (tagImportMode === "file" ? !tagImportFile : !tagImportText.trim())}
                className="self-start rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {tagImporting ? "Importing..." : "Import"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search name, company, mobile, city or pincode..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={tagFilter}
          onChange={(e) => handleTagFilterChange(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-2 text-sm"
        >
          <option value="">Filter by tag: all</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id} style={{ color: TAG_DOT_HEX[tag.id % TAG_DOT_HEX.length] }}>
              ● {tag.name} ({tag.agentCount ?? 0})
            </option>
          ))}
        </select>
        {tagFilter !== "" && (
          <button
            onClick={handleCopyNumbers}
            disabled={copying}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            title="Copy every mobile number in the current filter, comma-separated"
          >
            <Copy size={14} />
            {copying ? "Copying..." : "Copy numbers"}
          </button>
        )}
        {copyMessage && <span className="text-sm text-slate-500">{copyMessage}</span>}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 ml-auto"
          title={selectedIds.size > 0 ? `Export the ${selectedIds.size} selected agent(s)` : "Export every agent matching the current search/tag filter"}
        >
          <Download size={14} />
          {exporting ? "Exporting..." : `Export CSV${selectedIds.size > 0 ? ` (${selectedIds.size} selected)` : ""}`}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5 w-8">
                <input
                  type="checkbox"
                  checked={agents.length > 0 && selectedIds.size === agents.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-2.5">Pincode</th>
              <th className="px-4 py-2.5">Agent</th>
              <th className="px-4 py-2.5">Company</th>
              <th className="px-4 py-2.5">City</th>
              <th className="px-4 py-2.5">Mobile</th>
              <th className="px-4 py-2.5">Address</th>
              <th className="px-4 py-2.5">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : agents.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No agents found.
                </td>
              </tr>
            ) : (
              agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <input type="checkbox" checked={selectedIds.has(agent.id)} onChange={() => toggleSelected(agent.id)} />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">{agent.pincode}</td>
                  <td className="px-4 py-2.5 text-slate-900">{agent.agentName || "-"}</td>
                  <td className="px-4 py-2.5 text-slate-700">{agent.company || "-"}</td>
                  <td className="px-4 py-2.5 text-slate-500">{agent.city || "-"}</td>
                  <td className="px-4 py-2.5 text-slate-700">{agent.mobile || "-"}</td>
                  <td className="px-4 py-2.5 max-w-xs truncate text-slate-500" title={agent.address}>
                    {agent.address || "-"}
                  </td>
                  <td className="px-4 py-2.5 relative">
                    <div className="flex flex-wrap items-center gap-1 max-w-[14rem]">
                      {agent.tags.map((tag) => {
                        const color = tagColor(tag.id);
                        return (
                          <span key={tag.id} className={`inline-flex items-center gap-1 rounded-full ${color.bg} px-2 py-0.5 text-xs ${color.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
                            {tag.name}
                            <button
                              onClick={() => toggleAgentTag(agent, tag.id)}
                              disabled={savingAgentId === agent.id}
                              className="opacity-60 hover:opacity-100 hover:text-red-600 disabled:opacity-30"
                              title={`Remove "${tag.name}" from this agent`}
                            >
                              <X size={10} />
                            </button>
                          </span>
                        );
                      })}
                      <button
                        onClick={() => setOpenTagMenuFor((cur) => (cur === agent.id ? null : agent.id))}
                        disabled={savingAgentId === agent.id}
                        className="inline-flex items-center justify-center h-5 w-5 rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50"
                        title="Assign tags"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                    {openTagMenuFor === agent.id && (
                      <div className="absolute right-4 top-9 z-10 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                        {tags.length === 0 ? (
                          <p className="px-2 py-1 text-xs text-slate-400">No tags yet - create one above.</p>
                        ) : (
                          tags.map((tag) => {
                            const checked = agent.tags.some((t) => t.id === tag.id);
                            const color = tagColor(tag.id);
                            return (
                              <label key={tag.id} className="flex items-center gap-2 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleAgentTag(agent, tag.id)}
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
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}
