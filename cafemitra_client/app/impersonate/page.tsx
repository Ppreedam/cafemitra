"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { storeSession } from "@/lib/api";

export default function ImpersonatePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const token = params.get("token");
    const refreshToken = params.get("refreshToken");
    const accessTokenExpiresAt = params.get("accessTokenExpiresAt") || undefined;
    const refreshTokenExpiresAt = params.get("refreshTokenExpiresAt") || undefined;

    if (!token || !refreshToken) {
      setError("Missing or invalid impersonation link.");
      return;
    }

    storeSession({ token, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt });
    // Clear the token out of the URL/history immediately - it's only a
    // one-time bootstrap value, it shouldn't linger where it could be
    // re-shared or re-visited from browser history.
    window.history.replaceState(null, "", "/impersonate");
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-sm text-slate-500">{error || "Signing you in..."}</div>
    </div>
  );
}
