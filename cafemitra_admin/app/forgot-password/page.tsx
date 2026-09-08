"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await requestPasswordReset(email.trim().toLowerCase());
      setMessage(res.message || "If an active account exists, a password reset link has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900 mb-1">
          RepetiGo <span className="text-indigo-600">Admin</span>
        </h1>
        <p className="text-sm text-slate-500 mb-6">Enter your account email and we&apos;ll send a reset link.</p>

        {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
        {message && <div className="mb-4 rounded-md bg-green-50 text-green-700 text-sm px-3 py-2">{message}</div>}

        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-6 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 text-white text-sm font-medium py-2 hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <p className="text-sm text-slate-500 mt-4 text-center">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}
