import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
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
      <div className="dashboard idcard-page idstudio-page">
        <div className="idstudio-head">
          <span className="auto-print-kicker">PrintPilot ID Card Maker</span>
          <h1>ID Card Maker from PDF</h1>
          <p>Choose the document type you want to recreate. Upload the downloaded PDF, review the extracted details, and print a card-sized copy.</p>
        </div>
        <div className="idcard-type-grid">
          {DOC_TYPES.map((doc) => {
            const Icon = doc.icon;
            const style = { "--doc-color": doc.color } as React.CSSProperties;
            const inner = (
              <>
                {doc.comingSoon ? <span className="idcard-coming-soon-badge">Coming Soon</span> : null}
                <div className={`idcard-type-tile-band${doc.realistic ? " is-govt-doc" : ""}`}>
                  <span className="idcard-type-tile-icon">
                    <Icon size={18} />
                  </span>
                  <span className="idcard-type-tile-code">{doc.shortLabel}</span>
                </div>
                {doc.tricolor ? (
                  <div className="idcard-type-tile-tricolor" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                ) : null}
                <div className="idcard-type-tile-body">
                  <h2>{doc.label}</h2>
                  <p>{doc.description}</p>
                </div>
              </>
            );
            const tileClass = `idcard-type-tile${doc.comingSoon ? " is-coming-soon" : ""}${doc.tricolor ? " is-govt-doc-tile" : ""}`;
            return doc.comingSoon ? (
              <div key={doc.key} className={tileClass} style={style} aria-disabled="true">
                {inner}
              </div>
            ) : (
              <Link key={doc.key} href={`/id-card-maker/${doc.key}`} className={tileClass} style={style}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
