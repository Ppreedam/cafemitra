"use client";

import { DashboardShell } from "../DashboardShell";
import PrintPilotScan from "../s/[code]/PrintPilotScan";

// The customer PrintPilot upload tool for the cafe owner: same upload,
// straighten/scan, crop and page tools, printed straight on this PC's
// printer through the PrintPilot agent - no order, no payment, no wallet.
export default function PrintDeskPage() {
  return (
    <DashboardShell activePath="/print-desk">
      <PrintPilotScan code="" ownerMode />
    </DashboardShell>
  );
}
