import type { Metadata } from "next";
import { Suspense } from "react";
import IdCardPrintClient from "./IdCardPrintClient";
import { ogStaticImage } from "@/lib/og";

const pageUrl = "https://repetigo.com/id-card-print";

const shareImage = ogStaticImage("id-card-print.jpg", "RepetiGo ID Card Print - any ID card printed front and back at true size on an A4 sheet");

export const metadata: Metadata = {
  title: "Print ID Card Online Free - Front & Back, True Size | RepetiGo",
  description:
    "Print ID cards online free - upload front & back of Aadhaar, PAN, voter ID or any card, crop to true size, and print many on one A4 sheet.",
  alternates: { canonical: pageUrl },
  openGraph: {
    images: [shareImage],
    title: "Print ID Card Online Free - Front & Back, True Size | RepetiGo",
    description:
      "Upload front & back photo of Aadhaar, PAN, voter ID or any ID card. Crop to true card size (85.6x53.98mm). Adjust brightness. Print multiple cards on A4. No software.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    images: [shareImage],
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
