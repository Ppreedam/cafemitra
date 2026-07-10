"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { apiUrl } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const isValid = password.length >= 8 && password === confirmPassword && Boolean(token) && !isComplete;
  const passwordError = touched.password && password.length > 0 && password.length < 8 ? "Password must be at least 8 characters." : "";
  const confirmError = touched.confirmPassword && confirmPassword.length > 0 && password !== confirmPassword ? "Passwords must match." : "";

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  useEffect(() => {
    if (!isComplete) return;
    const redirectTimer = window.setTimeout(() => router.push("/login"), 1400);
    return () => window.clearTimeout(redirectTimer);
  }, [isComplete, router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ password: true, confirmPassword: true });
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
      setIsComplete(true);
      setPassword("");
      setConfirmPassword("");
      setMessage("Password reset successful. Redirecting to login...");
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
          <div className="auth-avatar">
            <LockKeyhole size={26} />
          </div>
          <h1>Choose new password</h1>
          <p className="auth-switch">Create a strong password for your RepetiGo account. You will be sent back to login after success.</p>
          <form className="auth-form" onSubmit={submit} noValidate>
            <label className="auth-field">
              <span>New Password</span>
              <span className="auth-input-wrap">
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  disabled={isComplete}
                  aria-invalid={Boolean(passwordError)}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                />
              </span>
              {passwordError ? <span className="auth-error">{passwordError}</span> : null}
            </label>
            <label className="auth-field">
              <span>Confirm Password</span>
              <span className="auth-input-wrap">
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  disabled={isComplete}
                  aria-invalid={Boolean(confirmError)}
                  onBlur={() => setTouched((current) => ({ ...current, confirmPassword: true }))}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError("");
                    setMessage("");
                  }}
                />
              </span>
              {confirmError ? <span className="auth-error">{confirmError}</span> : null}
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            {message ? <p className="auth-success">{message}</p> : null}
            <button className={isValid || isComplete ? "btn btn-primary auth-submit auth-submit-ready" : "btn btn-primary auth-submit"} type="submit" disabled={isSubmitting || isComplete} aria-disabled={!isValid}>
              {isSubmitting ? (
                <>
                  <span className="auth-button-spinner" aria-hidden />
                  Updating...
                </>
              ) : isComplete ? (
                <>
                  <span className="auth-button-spinner auth-button-spinner-success" aria-hidden />
                  Redirecting...
                </>
              ) : (
                "Reset password"
              )}
            </button>
          </form>
          <p className="auth-switch"><Link href="/login">Back to login</Link></p>
        </div>
      </section>
    </main>
  );
}
