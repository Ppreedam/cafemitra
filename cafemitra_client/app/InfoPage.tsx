import { BadgeCheck, FileText, Sparkles } from "lucide-react";
import type { InfoPageData } from "./info-page-data";
import { LandingNavbar } from "./LandingNavbar";

export function InfoPage({ page }: { page: InfoPageData }) {
  return (
    <main className="info-page-shell">
      <LandingNavbar />

      <section className="section-inner info-hero">
        <div>
          <div className="eyebrow">
            <Sparkles size={15} fill="currentColor" aria-hidden />
            {page.eyebrow}
          </div>
          <h1>{page.title}</h1>
          <p>{page.summary}</p>
          <div className="info-highlight-row">
            {page.highlights.map((highlight) => (
              <span key={highlight}>
                <BadgeCheck size={16} />
                {highlight}
              </span>
            ))}
          </div>
        </div>
        <aside className="info-summary-card">
          <FileText size={28} />
          <strong>{page.eyebrow}</strong>
          <span>{page.updated}</span>
        </aside>
      </section>

      <section className="section-inner info-content-grid">
        {page.sections.map((section) => (
          <article className="info-content-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
