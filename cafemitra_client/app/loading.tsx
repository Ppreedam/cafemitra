import { SkeletonBlock } from "./UiState";

export default function Loading() {
  return (
    <main className="system-loading-page" aria-label="Loading page">
      <section className="system-loading-shell">
        <div>
          <span className="skeleton-title" />
          <SkeletonBlock lines={2} />
        </div>
        <div className="skeleton-card-grid">
          <SkeletonBlock lines={3} />
          <SkeletonBlock lines={3} />
          <SkeletonBlock lines={3} />
        </div>
      </section>
    </main>
  );
}
