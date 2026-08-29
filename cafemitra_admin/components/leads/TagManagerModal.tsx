"use client";

import { FormEvent, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import Modal from "./Modal";
import { createLeadTag, deleteLeadTag, updateLeadTag, type LeadTag } from "@/lib/leads";
import { TAG_COLORS, tagColorMeta } from "@/lib/tagColors";

export default function TagManagerModal({
  tags,
  onClose,
  onChange,
}: {
  tags: LeadTag[];
  onClose: () => void;
  onChange: () => void;
}) {
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState<string>(TAG_COLORS[0].key);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<string>(TAG_COLORS[0].key);
  const [creating, setCreating] = useState(false);

  function startEdit(tag: LeadTag) {
    setError("");
    setEditingId(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  }

  async function saveEdit(id: number) {
    if (!editName.trim()) {
      setError("Tag name cannot be empty.");
      return;
    }
    setError("");
    try {
      await updateLeadTag(id, { name: editName.trim(), color: editColor });
      setEditingId(null);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update tag.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this tag? It will be removed from every customer it's assigned to.")) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteLeadTag(id);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete tag.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Enter a tag name.");
      return;
    }
    setError("");
    setCreating(true);
    try {
      await createLeadTag(newName.trim(), newColor);
      setNewName("");
      setNewColor(TAG_COLORS[0].key);
      onChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create tag.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal title="Manage tags" onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          {tags.length === 0 && <p className="text-sm text-slate-400">No tags yet - create one below.</p>}
          {tags.map((tag) => {
            const meta = tagColorMeta(tag.color);
            const isEditing = editingId === tag.id;
            return (
              <div key={tag.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2">
                {isEditing ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex shrink-0 gap-1">
                      {TAG_COLORS.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          title={c.key}
                          onClick={() => setEditColor(c.key)}
                          className={`h-5 w-5 rounded-full ${c.dot} ${editColor === c.key ? "ring-2 ring-offset-1 ring-slate-500" : ""}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => saveEdit(tag.id)}
                      className="shrink-0 rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"
                      aria-label="Save"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100"
                      aria-label="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`inline-flex flex-1 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                      {tag.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEdit(tag)}
                      className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                      aria-label={`Rename ${tag.name}`}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      disabled={deletingId === tag.id}
                      className="shrink-0 rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                      aria-label={`Delete ${tag.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={handleCreate} className="space-y-2 border-t border-slate-200 pt-3">
          <span className="block text-xs font-medium text-slate-600">New tag</span>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. VIP, Needs Call"
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {creating ? "Adding..." : "Add"}
            </button>
          </div>
          <div className="flex gap-1.5">
            {TAG_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                title={c.key}
                onClick={() => setNewColor(c.key)}
                className={`h-5 w-5 rounded-full ${c.dot} ${newColor === c.key ? "ring-2 ring-offset-1 ring-slate-500" : ""}`}
              />
            ))}
          </div>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
