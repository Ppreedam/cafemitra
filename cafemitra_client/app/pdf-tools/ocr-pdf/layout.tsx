import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OCR PDF Online Free - Make Scanned PDFs Searchable | RepetiGo",
  description: "OCR PDF free online - extract text from any text-based PDF searchable. Extract text. No sign-up, no install. Files auto-deleted after 60 min. Works on any device.",
  alternates: { canonical: "https://repetigo.com/pdf-tools/ocr-pdf" },
  openGraph: {
    title: "OCR PDF Online Free - Make Scanned PDFs Searchable | RepetiGo",
    description: "Free OCR PDF tool - make scanned PDFs searchable and copyable. No sign-up, auto-deleted after 60 min.",
    type: "website",
    url: "https://repetigo.com/pdf-tools/ocr-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Text Extractor Free Online - RepetiGo",
    description: "Make scanned PDFs searchable free. No sign-up, no install, auto-deleted.",
  },
  robots: { index: true, follow: true },
};

export default function OcrPdfLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
