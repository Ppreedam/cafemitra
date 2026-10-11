"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { createWaitingJoke, deleteWaitingJoke, fetchWaitingJokes, updateWaitingJoke, type WaitingJoke } from "@/lib/api";

const MAX_LENGTH = 400;

export default function JokesPage() {
  const [jokes, setJokes] = useState<WaitingJoke[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<WaitingJoke | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    fetchWaitingJokes()
      .then((res) => setJokes(res.jokes))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load jokes."))
      .finally(() => setLoaded(true));
  }

  useEffect(load, []);

  function resetForm() {
    setText("");
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (editing) await updateWaitingJoke(editing.id, { text: text.trim() });
      else await createWaitingJoke(text.trim());
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the joke.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(joke: WaitingJoke) {
    setBusyId(joke.id);
    setError("");
    try {
      await updateWaitingJoke(joke.id, { isActive: !joke.isActive });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the joke.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(joke: WaitingJoke) {
    if (!window.confirm("Delete this joke? This cannot be undone.")) return;
    setBusyId(joke.id);
    setError("");
    try {
      await deleteWaitingJoke(joke.id);
      if (editing?.id === joke.id) resetForm();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the joke.");
    } finally {
      setBusyId(null);
    }
  }

  const activeCount = jokes.filter((joke) => joke.isActive).length;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Waiting Jokes</h1>
      <p className="text-sm text-slate-500 mb-4">
        Customers see these one at a time (with Prev / Next) while their AI passport or family photo is being generated. Only active
        jokes are shown. If none are active, the built-in set is used instead.
      </p>

      <form onSubmit={handleSubmit} className="mb-4 rounded-xl border border-slate-200 bg-white p-4 max-w-2xl flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">{editing ? "Edit joke" : "Add a joke"}</h2>
        <textarea
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={3}
          placeholder="e.g. Teacher: Tumhara homework kahan hai? Student: Sir, wo bhi AI processing me hai."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : editing ? "Save changes" : "Add joke"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
          <span className="ml-auto text-xs text-slate-400">
            {text.length}/{MAX_LENGTH}
          </span>
        </div>
      </form>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <div className="px-4 py-2 border-b border-slate-200 text-xs text-slate-500">
          {jokes.length} jokes - {activeCount} active
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Joke</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loaded && jokes.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                  No jokes yet - customers will see the built-in set.
                </td>
              </tr>
            )}
            {jokes.map((joke) => (
              <tr key={joke.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 align-top">
                <td className={`px-4 py-2 max-w-xl ${joke.isActive ? "text-slate-800" : "text-slate-400"}`}>{joke.text}</td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={joke.isActive}
                    disabled={busyId === joke.id}
                    onClick={() => toggleActive(joke)}
                    className="inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <span className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${joke.isActive ? "bg-green-500" : "bg-slate-300"}`}>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${joke.isActive ? "translate-x-4" : "translate-x-0.5"}`}
                      />
                    </span>
                    <span className={`text-xs font-medium ${joke.isActive ? "text-green-700" : "text-slate-500"}`}>{joke.isActive ? "Active" : "Hidden"}</span>
                  </button>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(joke);
                        setText(joke.text);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      title="Edit joke"
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(joke)}
                      disabled={busyId === joke.id}
                      title="Delete joke"
                      className="text-slate-400 hover:text-red-600 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
