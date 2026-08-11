"use client";

import { useEffect, useState } from "react";
import { ArrowRight, MessageSquare, Send } from "lucide-react";
import Modal from "./Modal";
import { addLeadNote, fetchLeadActivities, type Lead, type LeadActivity } from "@/lib/leads";
import { statusMeta } from "@/lib/leadStatus";

export default function LeadTimelineModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeadActivities(lead.id)
      .then((res) => setActivities(res.activities))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load history."))
      .finally(() => setLoading(false));
  }, [lead.id]);

  async function handleAddNote() {
    if (!note.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await addLeadNote(lead.id, note.trim());
      setActivities((prev) => [res.activity, ...prev]);
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`History - ${lead.name}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note - what happened, next step..."
            rows={2}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddNote}
            disabled={submitting || !note.trim()}
            className="flex shrink-0 items-center gap-1 self-start rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="max-h-80 space-y-3 overflow-y-auto border-t border-slate-100 pt-3">
          {loading ? (
            <p className="text-sm text-slate-400">Loading history...</p>
          ) : activities.length === 0 ? (
            <p className="text-sm text-slate-400">No history yet.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex gap-2.5 text-sm">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  {activity.kind === "status_change" ? <ArrowRight size={12} /> : <MessageSquare size={12} />}
                </div>
                <div className="min-w-0 flex-1">
                  {activity.kind === "status_change" ? (
                    <p className="flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta(activity.fromStatus).badge}`}>
                        {statusMeta(activity.fromStatus).label}
                      </span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusMeta(activity.toStatus).badge}`}>
                        {statusMeta(activity.toStatus).label}
                      </span>
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap text-slate-700">{activity.note}</p>
                  )}
                  <p className="mt-0.5 text-xs text-slate-400">
                    {new Date(activity.createdAt).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
