"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type SavedEntry = { id: number; template: string; label: string; createdAt: string };

// Generic "saved drafts" list - shared by every document builder's
// `/<tool>/saved` route. `responseKey` is the JSON field the list endpoint
// returns entries under (e.g. "resumes", "biodatas").
export default function SavedDocumentsList<TId extends string>({
  listUrl,
  buildPath,
  galleryPath,
  templates,
  itemLabel,
  responseKey,
}: {
  // e.g. "/api/tools/resume-builder/saved/" - the delete endpoint for a
  // given entry is derived as `${listUrl}${id}/delete/`, so this prop stays
  // a plain string rather than a function (server-component pages that
  // render this list can't pass function props across the boundary).
  listUrl: string;
  buildPath: string;
  galleryPath: string;
  templates: { id: TId; label: string }[];
  itemLabel: string;
  responseKey: string;
}) {
  const [entries, setEntries] = useState<SavedEntry[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function load() {
    apiFetch(listUrl)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || `Could not load your saved ${itemLabel}s.`);
        setEntries((body as Record<string, SavedEntry[]>)[responseKey] || []);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : `Could not load your saved ${itemLabel}s.`));
  }

  useEffect(load, []);

  async function remove(id: number) {
    if (!window.confirm(`Delete this saved ${itemLabel}? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const response = await apiFetch(`${listUrl}${id}/delete/`, { method: "POST" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || `Could not delete this ${itemLabel}.`);
      }
      setEntries((list) => (list ? list.filter((entry) => entry.id !== id) : list));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `Could not delete this ${itemLabel}.`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="resbuild-saved">
      {error ? <p className="resbuild-error">{error}</p> : null}

      {entries === null ? (
        <p className="resbuild-saved-empty">Loading...</p>
      ) : entries.length === 0 ? (
        <div className="resbuild-saved-empty">
          <p>You haven't saved any {itemLabel}s yet. Build one, then click "Save" to keep it here.</p>
          <Link href={galleryPath} className="resbuild-btn-primary"><Plus size={16} /> Start a {itemLabel}</Link>
        </div>
      ) : (
        <div className="resbuild-saved-list">
          {entries.map((entry) => (
            <div className="resbuild-saved-card" key={entry.id}>
              <div className="resbuild-saved-card-info">
                <strong>{entry.label}</strong>
                <p>{templates.find((tpl) => tpl.id === entry.template)?.label || entry.template} - saved {formatDate(entry.createdAt)}</p>
              </div>
              <div className="resbuild-saved-card-actions">
                <Link href={`${buildPath}?savedId=${entry.id}`} className="resbuild-btn-primary">Open</Link>
                <button
                  type="button"
                  className="resbuild-icon-btn"
                  onClick={() => remove(entry.id)}
                  disabled={deletingId === entry.id}
                  aria-label={`Delete ${itemLabel}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
