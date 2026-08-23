import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organize PDF Pages - Free Online, Drag & Drop, No Sign-Up | RepetiGo",
  description: "Organize PDF pages in seconds - drag and drop to rearrange, reorder, or fix page order in any PDF. Free, online, no sign-up. Processed entirely in your browser - never uploaded.",
  alternates: { canonical: "https://repetigo.com/pdf-tools/organize-pdf" },
  openGraph: {
    title: "Organize PDF Pages - Free Online, Drag & Drop | RepetiGo",
    description: "Rearrange PDF pages free in your browser. Drag and drop to fix page order. No sign-up. Files are processed locally - never uploaded in browser-only.",
    type: "website",
    url: "https://repetigo.com/pdf-tools/organize-pdf",
  },
  twitter: {
    card: "summary_large_image",
    title: "Organize PDF Pages Free Online - Drag & Drop | RepetiGo",
    description: "Free online PDF organizer - rearrange, reorder, and fix page order. No sign-up. Browser-only processing.",
  },
  robots: { index: true, follow: true },
};

export default function OrganizePdfLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
