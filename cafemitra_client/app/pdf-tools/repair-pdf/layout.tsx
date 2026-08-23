import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Repair Tool - Fix Corrupt, Damaged & Broken PDFs Free | RepetiGo",
  description: "Free PDF repair tool online - fix corrupt, damaged, or broken PDF files in seconds. No sign-up. Upload your PDF and download a recovered version instantly. Processed entirely in your browser - never uploaded.",
  alternates: { canonical: "https://repetigo.com/pdf-tools/repair-pdf" },
  openGraph: {
    title: "PDF Repair Tool - Fix Corrupt, Damaged & Broken PDFs Free | RepetiGo",
    description: "Fix a corrupt, damaged, or broken PDF file free online. No sign-up. Processed entirely in your browser - never uploaded.",
    type: "website",
    url: "https://repetigo.com/pdf-tools/repair-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Repair Tool - Fix Corrupt & Damaged PDFs | RepetiGo",
    description: "Repair a broken PDF online free. No sign-up. Processed entirely in your browser - never uploaded.",
  },
  robots: { index: true, follow: true },
};

export default function RepairPdfLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
