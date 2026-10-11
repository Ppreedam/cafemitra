"use client";

import { useParams } from "next/navigation";
import PrintPilotScan from "./PrintPilotScan";

// Customer QR page. The tool itself lives in PrintPilotScan so the cafe
// dashboard can reuse it (app/print-desk, owner mode - no payment).
export default function CustomerScanPage() {
  const params = useParams<{ code: string }>();
  return <PrintPilotScan code={params.code} />;
}
