import type { Metadata } from "next";
import { ogImage } from "@/lib/og";

const shareImage = ogImage({
  title: "Organize PDF Pages",
  subtitle: "Rearrange PDF pages free in your browser.",
  category: "Free PDF Tool",
  icon: "split",
});

export const metadata: Metadata = {
  title: "Organize PDF Pages Free - Drag & Drop Online | RepetiGo",
  description: "Organize PDF pages free - drag and drop to rearrange or fix page order in any PDF. No sign-up. Runs entirely in your browser, never uploaded.",
  alternates: { canonical: "https://repetigo.com/pdf-tools/organize-pdf" },
  openGraph: {
    images: [shareImage],
    title: "Organize PDF Pages - Free Online, Drag & Drop | RepetiGo",
    description: "Rearrange PDF pages free in your browser. Drag and drop to fix page order. No sign-up. Files are processed locally - never uploaded in browser-only.",
    type: "website",
    url: "https://repetigo.com/pdf-tools/organize-pdf",
  },
  twitter: {
    images: [shareImage],
    card: "summary_large_image",
    title: "Organize PDF Pages Free Online - Drag & Drop | RepetiGo",
    description: "Free online PDF organizer - rearrange, reorder, and fix page order. No sign-up. Browser-only processing.",
  },
  robots: { index: true, follow: true },
};

export default function OrganizePdfLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
