import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Repair PDF Online Free - Fix Corrupt, Damaged or Broken PDFs | RepetiGo",
  description: "Repair damaged, corrupt, or unreadable PDF files online for free. Rebuild PDF structure or enhance scanned pages in your browser. No sign-up. Files auto-delete in 60 minutes.",
  alternates: { canonical: "https://repetigo.com/pdf-tools/repair-pdf" },
  openGraph: {
    title: "Repair PDF Online Free - Fix Corrupt PDFs | RepetiGo",
    description: "Recover readable PDFs from corrupt or damaged files. Free online PDF repair with automatic file deletion.",
    type: "website",
    url: "https://repetigo.com/pdf-tools/repair-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Repair PDF Online Free | RepetiGo",
    description: "Fix corrupt, damaged, or unreadable PDFs in your browser. No sign-up. Auto-deletes in 60 minutes.",
  },
  robots: { index: true, follow: true },
};

export default function RepairPdfLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
