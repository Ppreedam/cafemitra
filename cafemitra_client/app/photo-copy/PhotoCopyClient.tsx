"use client";

import { DashboardShell } from "../DashboardShell";
import PhotoCopyStudio from "./PhotoCopyStudio";
import PhotoCopySeoContent from "./PhotoCopySeoContent";

// The cafe owner's photo copy studio: PDFs and photos in, then crop, clean, rearrange, put
// pages on one sheet and print straight on this PC's printer through the PrintPilot agent -
// no order, no payment, no wallet.
export default function PhotoCopyClient() {
  return (
    <DashboardShell activePath="/photo-copy">
      <div className="dashboard pcs-page">
        <PhotoCopyStudio />
      </div>
      <PhotoCopySeoContent />
    </DashboardShell>
  );
}
