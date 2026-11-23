import type { Metadata } from "next";
import { ogImage } from "@/lib/og";

const shareImage = ogImage({
  title: "PDF Repair Tool",
  subtitle: "Fix a corrupt, damaged, or broken PDF file free online.",
  category: "Free PDF Tool",
  icon: "file",
});

export const metadata: Metadata = {
  title: "Repair PDF Free - Fix Corrupt or Damaged PDFs | RepetiGo",
  description: "Repair PDF free - fix corrupt, damaged or broken PDF files and download a recovered version in seconds. No sign-up, runs in your browser.",
  alternates: { canonical: "https://repetigo.com/pdf-tools/repair-pdf" },
  openGraph: {
    images: [shareImage],
    title: "Repair PDF Free - Fix Corrupt or Damaged PDFs | RepetiGo",
    description: "Fix a corrupt, damaged, or broken PDF file free online. No sign-up. Processed entirely in your browser - never uploaded.",
    type: "website",
    url: "https://repetigo.com/pdf-tools/repair-pdf",
  },
  twitter: {
    images: [shareImage],
    card: "summary_large_image",
    title: "Free PDF Repair Tool - Fix Corrupt & Damaged PDFs | RepetiGo",
    description: "Repair a broken PDF online free. No sign-up. Processed entirely in your browser - never uploaded.",
  },
  robots: { index: true, follow: true },
};

export default function RepairPdfLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
