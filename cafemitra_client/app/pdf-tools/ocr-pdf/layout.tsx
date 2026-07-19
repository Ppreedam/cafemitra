import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR PDF Online Free - Make Scanned PDFs Searchable | RepetiGo",
  description: "OCR PDF free online - make any scanned or image-based PDF searchable. Extract text. No sign-up, no install. Files auto-deleted after 60 min. Works on any device.",
  alternates: { canonical: "https://repetigo.com/tools/pdf/ocr-pdf/" },
  openGraph: {
    title: "OCR PDF Online Free - Make Scanned PDFs Searchable | RepetiGo",
    description: "Free OCR PDF tool - make scanned PDFs searchable and copyable. No sign-up, auto-deleted after 60 min.",
    type: "website",
    url: "https://repetigo.com/tools/pdf/ocr-pdf/",
    images: ["https://repetigo.com/og-ocr-pdf.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "OCR PDF Free Online - RepetiGo",
    description: "Make scanned PDFs searchable free. No sign-up, no install, auto-deleted.",
  },
  robots: { index: true, follow: true },
};

export default function OcrPdfLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
