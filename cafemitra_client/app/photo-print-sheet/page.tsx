import type { Metadata } from "next";
import { Suspense } from "react";
import PhotoPrintSheetClient from "./PhotoPrintSheetClient";
import PhotoPrintSheetSeoContent from "./PhotoPrintSheetSeoContent";
import { ogStaticImage } from "@/lib/og";

const pageUrl = "https://repetigo.com/photo-print-sheet";

const shareImage = ogStaticImage("photo-print-sheet.jpg", "RepetiGo Photo Print Sheet - many photos, many sizes, one A4, 4x6 or 5x7 sheet with cut lines");

export const metadata: Metadata = {
  title: "Print Multiple Passport Photos on One Page Free | RepetiGo",
  description:
    "Print multiple passport photos on one page free - different people and sizes on one sheet. Live preview, A4/4x6/5x7 paper, 300 DPI. No signup.",
  alternates: {
    canonical: pageUrl,
    languages: { "en-IN": pageUrl, "hi-IN": "https://repetigo.com/hi/photo-print-sheet" },
  },
  openGraph: {
    images: [shareImage],
    title: "Print Multiple Passport Photos on One Page Free | RepetiGo",
    description:
      "Print multiple passport photos on one page free - different people and sizes on one sheet. Live preview, A4/4x6/5x7 paper, 300 DPI. No signup.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    images: [shareImage],
    card: "summary_large_image",
    title: "Photo Print Sheet Maker - Multiple Photos, One Sheet | RepetiGo",
    description: "Different people, different sizes, one sheet. Live preview. Free. No signup.",
  },
  robots: { index: true, follow: true },
};

export default function PhotoPrintSheetPage() {
  return (
    <Suspense fallback={null}>
      <PhotoPrintSheetClient seo={<PhotoPrintSheetSeoContent />} />
    </Suspense>
  );
}
