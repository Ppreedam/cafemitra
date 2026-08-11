"use client";

import { useEffect, useState } from "react";
import Pagination from "@/components/Pagination";
import { fetchContactMessages, updateContactMessage, type ContactMessage } from "@/lib/api";

export default function SupportPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("unread");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [error, setError] = useState("");

  function load() {
    fetchContactMessages(statusFilter || undefined, page)
      .then((res) => {
        setMessages(res.messages);
        setCount(res.count);
        setPageSize(res.pageSize);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load messages."));
  }

  useEffect(load, [statusFilter, page]);

  function openMessage(msg: ContactMessage) {
    setSelected(msg);
    setNoteDraft(msg.adminNote);
  }

  async function handleToggleRead(msg: ContactMessage) {
    try {
      await updateContactMessage(msg.id, { isRead: !msg.isRead });
      load();
      if (selected?.id === msg.id) setSelected({ ...msg, isRead: !msg.isRead });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  }

  async function handleSaveNote() {
    if (!selected) return;
    try {
      const res = await updateContactMessage(selected.id, { adminNote: noteDraft });
      setSelected(res.contactMessage);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Support Inbox</h1>
      <p className="text-sm text-slate-500 mb-4">Contact-us messages submitted from the marketing site.</p>

      <div className="mb-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="unread">Unread</option>
          <option value="resolved">Resolved</option>
          <option value="">All</option>
        </select>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
          {messages.length === 0 && <p className="p-4 text-sm text-slate-500">No messages here.</p>}
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`w-full text-left p-3 hover:bg-slate-50 ${selected?.id === msg.id ? "bg-indigo-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 truncate">{msg.subject}</span>
                {!msg.isRead && <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {msg.fullName} · {msg.email}
              </div>
              <div className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleString("en-IN")}</div>
            </button>
          ))}
          <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          {!selected && <p className="text-sm text-slate-500">Select a message to view details.</p>}
          {selected && (
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">{selected.subject}</h2>
                  <p className="text-xs text-slate-500">
                    {selected.fullName} · {selected.email} {selected.phone && `· ${selected.phone}`}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleRead(selected)}
                  className={`rounded-md px-2 py-1 text-xs font-medium ${
                    selected.isRead ? "bg-slate-100 text-slate-600" : "bg-green-600 text-white"
                  }`}
                >
                  {selected.isRead ? "Mark unread" : "Mark resolved"}
                </button>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap mb-4 rounded-md bg-slate-50 p-3">{selected.message}</p>

              <label className="block text-xs font-medium text-slate-700 mb-1">Internal note</label>
              <textarea
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                rows={3}
                className="w-full mb-3 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                onClick={handleSaveNote}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Save note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
