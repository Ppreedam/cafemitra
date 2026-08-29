import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { DashboardShell } from "../DashboardShell";
import { DOC_TYPES } from "./docTypes";

const pageUrl = "https://repetigo.com/id-card-maker";

export const metadata: Metadata = {
  title: "ID Card Maker from PDF Online Free | RepetiGo",
  description:
    "Create printable ID cards from a PDF online, free - Aadhaar, PAN, Voter ID, e-Shram, Ayushman, Ration, APAAR, EPFO, Driving Licence, or Agriculture card. Upload, review, and print.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "ID Card Maker from PDF Online Free | RepetiGo",
    description: "Upload any supported ID PDF, review the details, and print a ready-to-use ID card. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ID Card Maker from PDF - RepetiGo",
    description: "Create printable ID cards from a PDF - upload, review, and print.",
  },
  robots: { index: true, follow: true },
};

export default function IdCardMakerHubPage() {
  return (
    <DashboardShell activePath="/id-card-maker">
      <div className="dashboard idcard-page">
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">PrintPilot ID Card Maker</span>
            <h1>ID Card Maker from PDF</h1>
            <p>Choose the document type you want to recreate. Upload the downloaded PDF, review the extracted details, and print a clean, card-sized copy.</p>
          </div>
        </div>

        <section className="idcard-type-grid" aria-label="ID card types">
          {DOC_TYPES.map((doc) => {
            const DocIcon = doc.icon;
            return (
              <Link className="idcard-type-tile" href={`/id-card-maker/${doc.key}`} key={doc.key} style={{ "--doc-color": doc.color } as CSSProperties}>
                <div className="idcard-type-tile-band">
                  <span className="idcard-type-tile-icon">
                    <DocIcon size={18} />
                  </span>
                  <span className="idcard-type-tile-code">{doc.shortLabel}</span>
                </div>
                <div className="idcard-type-tile-body">
                  <h2>{doc.label}</h2>
                  <p>{doc.description}</p>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </DashboardShell>
  );
}
