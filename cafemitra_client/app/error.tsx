"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { UiState } from "./UiState";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="system-state-page">
      <UiState
        icon={AlertTriangle}
        title="Something went wrong"
        description="We could not load this page. Please retry, or return to the dashboard."
        tone="danger"
        action={
          <div className="system-state-actions">
            <button className="btn btn-primary" type="button" onClick={reset}>
              <RefreshCw size={16} /> Retry
            </button>
            <Link className="btn" href="/dashboard">
              <Home size={16} /> Dashboard
            </Link>
          </div>
        }
      />
    </main>
  );
}
