import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { UiState } from "./UiState";

export default function NotFound() {
  return (
    <main className="system-state-page">
      <UiState
        icon={SearchX}
        title="Page not found"
        description="This page may have moved, or the link is no longer available."
        action={
          <div className="system-state-actions">
            <Link className="btn btn-primary" href="/dashboard">
              <Home size={16} /> Go to Dashboard
            </Link>
            <Link className="btn" href="/">
              Home
            </Link>
          </div>
        }
      />
    </main>
  );
}
