import type { Metadata } from "next";
import { Suspense } from "react";
import IdCardPrintClient from "./IdCardPrintClient";

const pageUrl = "https://repetigo.com/id-card-print";

export const metadata: Metadata = {
  title: "Print ID Card Online Free - Front & Back, True Size | RepetiGo",
  description:
    "Print id card online free - upload front & back photo of Aadhaar, PAN, voter ID or any card. Crop to true card size. Adjust brightness. Print multiple cards on one A4 sheet. No software needed.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Print ID Card Online Free - Front & Back, True Size | RepetiGo",
    description:
      "Upload front & back photo of Aadhaar, PAN, voter ID or any ID card. Crop to true card size (85.6x53.98mm). Adjust brightness. Print multiple cards on A4. No software.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ID Card Print - Front & Back at True Size | RepetiGo",
    description: "Print Aadhaar, PAN, voter ID at correct 85.6x53.98mm size. Front+back. Batch A4. Free.",
  },
  robots: { index: true, follow: true },
};

export default function IdCardPrintPage() {
  return (
    <Suspense fallback={null}>
      <IdCardPrintClient />
    </Suspense>
  );
}
