import type { Metadata } from "next";
import { Suspense } from "react";
import PhotoPrintSheetClient from "./PhotoPrintSheetClient";

const pageUrl = "https://repetigo.com/photo-print-sheet";

export const metadata: Metadata = {
  title: "Print Multiple Passport Photos on One Page Free | RepetiGo",
  description:
    "Print multiple passport photos on one page free - different people, different sizes, one sheet. Live preview. A4, 4x6, 5x7 paper. 300 DPI download or direct print. No signup.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Print Multiple Passport Photos on One Page Free | RepetiGo",
    description:
      "Print multiple passport photos on one page free - different people, different sizes, one sheet. Live preview. A4, 4x6, 5x7 paper. 300 DPI download or direct print. No signup.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Print Sheet Maker - Multiple Photos, One Sheet | RepetiGo",
    description: "Different people, different sizes, one sheet. Live preview. Free. No signup.",
  },
  robots: { index: true, follow: true },
};

export default function PhotoPrintSheetPage() {
  return (
    <Suspense fallback={null}>
      <PhotoPrintSheetClient />
    </Suspense>
  );
}
