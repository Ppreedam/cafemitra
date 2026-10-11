"use client";

import { DashboardShell } from "../DashboardShell";
import PrintPilotScan from "../s/[code]/PrintPilotScan";
import PhotoCopySeoContent from "./PhotoCopySeoContent";

// The customer PrintPilot upload tool for the cafe owner: same upload,
// straighten/scan, crop and page tools, printed straight on this PC's
// printer through the PrintPilot agent - no order, no payment, no wallet.
export default function PhotoCopyClient() {
  return (
    <DashboardShell activePath="/photo-copy">
      {/* Says what this page is for before the tool itself starts. */}
      <div className="dashboard idcard-page">
        <div className="dashboard-hero pdf-tools-hero">
          <div>
            <span className="auto-print-kicker">RepetiGo Photo Copy</span>
            <h1>Photo Copy &amp; Print Documents From Your Computer</h1>
            <p>
              Print or photo copy any PDF, scan or phone photo that is on this computer - upload it, straighten or crop the pages, choose copies, and it prints straight on your printer.
            </p>
            <ul className="tool-seo-list">
              <li>Upload PDF, JPG or PNG - several files at once if needed.</li>
              <li>Pick only the pages you need and set the number of copies.</li>
              <li>No customer order or payment - made for your own counter work.</li>
            </ul>
          </div>
        </div>
      </div>
      <PrintPilotScan code="" ownerMode />
      <PhotoCopySeoContent />
    </DashboardShell>
  );
}
