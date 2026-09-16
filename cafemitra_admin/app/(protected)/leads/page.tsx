"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Layers, MapPin, Tags, UploadCloud, Users } from "lucide-react";
import StatCard from "@/components/StatCard";
import { fetchLeadStates, importLeadAgentTags, importLeadState, type LeadState, type LeadTagImportResult } from "@/lib/api";

export default function LeadsPage() {
  const [states, setStates] = useState<LeadState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showImport, setShowImport] = useState(false);
  const [importState, setImportState] = useState("");
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importResult, setImportResult] = useState("");

  const [showTagImport, setShowTagImport] = useState(false);
  const [tagImportMode, setTagImportMode] = useState<"file" | "paste">("file");
  const [tagImportFile, setTagImportFile] = useState<File | null>(null);
  const [tagImportText, setTagImportText] = useState("");
  const [tagImporting, setTagImporting] = useState(false);
  const [tagImportError, setTagImportError] = useState("");
  const [tagImportResults, setTagImportResults] = useState<LeadTagImportResult[] | null>(null);

  function load() {
    setLoading(true);
    fetchLeadStates()
      .then((res) => setStates(res.states))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load states."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!importState.trim() || importFiles.length === 0) return;
    setImporting(true);
    setImportError("");
    setImportResult("");
    try {
      const res = await importLeadState(importState.trim(), importFiles);
      setImportResult(`Imported ${res.agentsImported.toLocaleString("en-IN")} agents across ${res.divisions.length} division(s) into "${res.state}".`);
      setImportState("");
      setImportFiles([]);
      load();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setImporting(false);
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
      load();
    } catch (err) {
      setTagImportError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      setTagImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">Agent-locator listings by state, sourced from the agents_data import. Pick a state to see its divisions.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowTagImport((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Tags size={14} />
            Import tags from JSON
          </button>
          <button
            onClick={() => setShowImport((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <UploadCloud size={14} />
            Add state
          </button>
        </div>
      </div>

      {showTagImport && (
        <form onSubmit={handleTagImport} className="rounded-xl border border-slate-200 bg-white p-4 max-w-lg flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Delivery report JSON - a list of <code>{"{phone, name, status}"}</code>, e.g. a WhatsApp broadcast export
            </label>
            <div className="inline-flex rounded-md border border-slate-300 overflow-hidden text-sm mb-2">
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
                rows={8}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            )}
            <p className="mt-1 text-xs text-slate-400">
              Every distinct <code>status</code> value (e.g. &quot;sent&quot;, &quot;invalid&quot;) becomes a tag, and every agent - in any state/division - whose mobile number matches a phone gets that tag. Works with or without the &quot;91&quot; country code prefix.
            </p>
          </div>
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

      {showImport && (
        <form onSubmit={handleImport} className="rounded-xl border border-slate-200 bg-white p-4 max-w-lg flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">State name</label>
            <input
              type="text"
              required
              placeholder="e.g. Uttar Pradesh"
              value={importState}
              onChange={(e) => setImportState(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Division JSON file(s) - same format as agents_data/&lt;State&gt;/&lt;Division&gt;.json
            </label>
            <input
              type="file"
              required
              multiple
              accept="application/json,.json"
              onChange={(e) => setImportFiles(Array.from(e.target.files || []))}
              className="w-full text-sm"
            />
            {importFiles.length > 0 && (
              <p className="mt-1 text-xs text-slate-500">{importFiles.length} file(s) selected.</p>
            )}
          </div>
          {importError && <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{importError}</div>}
          {importResult && <div className="rounded-md bg-green-50 text-green-700 text-sm px-3 py-2">{importResult}</div>}
          <button
            type="submit"
            disabled={importing}
            className="self-start rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {importing ? "Importing..." : "Import"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {states.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 max-w-2xl">
          <StatCard label="Total agents" value={states.reduce((sum, s) => sum + s.agentCount, 0).toLocaleString("en-IN")} icon={<Users size={18} />} />
          <StatCard label="States" value={states.length} icon={<MapPin size={18} />} />
          <StatCard label="Divisions" value={states.reduce((sum, s) => sum + s.divisionCount, 0)} icon={<Layers size={18} />} />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : states.length === 0 ? (
        <p className="text-sm text-slate-400">No lead data imported yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {states.map((s) => (
            <Link
              key={s.state}
              href={`/leads/${encodeURIComponent(s.state)}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{s.state}</p>
                  <p className="text-xs text-slate-500">{s.divisionCount} division{s.divisionCount === 1 ? "" : "s"}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700 tabular-nums">{s.agentCount.toLocaleString("en-IN")}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
