"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type React from "react";
import { apiUrl } from "@/lib/api";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = password.length >= 8 && password === confirmPassword && Boolean(token);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!isValid) {
      setError("Password must be at least 8 characters and match confirmation.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl("/api/auth/reset-password/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not reset password.");
      setMessage(result.message || "Password reset successful.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-simple-card" aria-label="Reset password">
        <div className="auth-form-side">
          <h1>Choose new password</h1>
          <p className="auth-switch">Set a new password for your Repetigo account.</p>
          <form className="auth-form" onSubmit={submit} noValidate>
            <label className="auth-field">
              <span>New Password</span>
              <span className="auth-input-wrap">
                <input type="password" placeholder="Minimum 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} />
              </span>
            </label>
            <label className="auth-field">
              <span>Confirm Password</span>
              <span className="auth-input-wrap">
                <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              </span>
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            {message ? <p className="auth-success">{message}</p> : null}
            <button className="btn btn-primary auth-submit" type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Updating..." : "Reset password"}
            </button>
          </form>
          <p className="auth-switch"><Link href="/login">Back to login</Link></p>
        </div>
      </section>
    </main>
  );
}
