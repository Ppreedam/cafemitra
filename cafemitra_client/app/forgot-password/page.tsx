"use client";

import Link from "next/link";
import { useState } from "react";
import type React from "react";
import { apiUrl } from "@/lib/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = emailPattern.test(email.trim());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (!isValid) {
      setError("Enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(apiUrl("/api/auth/request-password-reset/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not send reset email.");
      setMessage(result.message || "Password reset email sent.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-simple-card" aria-label="Forgot password">
        <div className="auth-form-side">
          <h1>Reset password</h1>
          <p className="auth-switch">Enter your account email and we will send a reset link.</p>
          <form className="auth-form" onSubmit={submit} noValidate>
            <label className="auth-field">
              <span>Email ID</span>
              <span className="auth-input-wrap">
                <input type="email" placeholder="Enter email" value={email} aria-invalid={Boolean(error)} onChange={(event) => setEmail(event.target.value)} />
              </span>
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            {message ? <p className="auth-success">{message}</p> : null}
            <button className="btn btn-primary auth-submit" type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
          <p className="auth-switch"><Link href="/login">Back to login</Link></p>
        </div>
      </section>
    </main>
  );
}
