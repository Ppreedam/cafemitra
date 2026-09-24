import type { Metadata } from "next";
import { DashboardShell } from "../DashboardShell";
import IdCardStudioClient from "./IdCardStudioClient";

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
          <p>Open an e-Aadhaar, e-PAN, Voter ID or DL PDF, enter the password if it asks, adjust the cut and print a card-sized copy.</p>
        </div>
        <IdCardStudioClient />
      </div>
    </DashboardShell>
  );
}
