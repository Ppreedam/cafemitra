"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api";

// Reads the token straight from window.location instead of
// next/navigation's useSearchParams() so this page doesn't need a
// <Suspense> boundary around it (same approach as the cafe-owner app's
// ResetPasswordClient.tsx).
export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => router.push("/login"), 1500);
    return () => window.clearTimeout(timer);
  }, [done, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset link is invalid or missing a token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords must match.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setMessage(res.message || "Password reset successful. Redirecting to login...");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
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
        <p className="text-sm text-slate-500 mb-6">Choose a new password for your account.</p>

        {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
        {message && <div className="mb-4 rounded-md bg-green-50 text-green-700 text-sm px-3 py-2">{message}</div>}

        <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
        <input
          type="password"
          required
          disabled={done}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
        <input
          type="password"
          required
          disabled={done}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-6 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={loading || done}
          className="w-full rounded-md bg-indigo-600 text-white text-sm font-medium py-2 hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Updating..." : done ? "Redirecting..." : "Reset password"}
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
