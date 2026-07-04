"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl, storeSession } from "@/lib/api";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function verify() {
      const token = new URLSearchParams(window.location.search).get("token") || "";
      if (!token) {
        setError("Verification token is missing.");
        setMessage("");
        return;
      }

      try {
        const response = await fetch(apiUrl("/api/auth/verify-email/"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "Could not verify email.");
        storeSession(result);
        setMessage("Email verified. Redirecting to dashboard...");
        setTimeout(() => router.push("/dashboard"), 900);
      } catch (verifyError) {
        setMessage("");
        setError(verifyError instanceof Error ? verifyError.message : "Could not verify email.");
      }
    }

    verify();
  }, [router]);

  return (
    <main className="auth-page">
      <section className="auth-card auth-simple-card" aria-label="Verify email">
        <div className="auth-form-side">
          <h1>Email verification</h1>
          {message ? <p className="auth-success">{message}</p> : null}
          {error ? <p className="auth-error">{error}</p> : null}
          <p className="auth-switch"><Link href="/login">Back to login</Link></p>
        </div>
      </section>
    </main>
  );
}
