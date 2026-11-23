import type { Metadata } from "next";
import { Suspense } from "react";
import PhotoCopyClient from "./PhotoCopyClient";
import { ogImage } from "@/lib/og";

const pageUrl = "https://repetigo.com/photo-copy";
const title = "Photo Copy & Print Documents From Your Computer Online | RepetiGo";
const description =
  "Print documents from your computer - upload PDF, JPG or PNG, pick pages and copies, straighten and crop, and print. Built for print shops and cyber cafes.";

const shareImage = ogImage({
  title: "Photo Copy & Print From Your Computer",
  subtitle: "Upload, tidy up and print documents from your computer in one screen.",
  category: "Free Tool",
  icon: "print",
});

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: { images: [shareImage], title, description, type: "website", url: pageUrl },
  twitter: { images: [shareImage], card: "summary_large_image", title: "Photo Copy & Print From Your Computer | RepetiGo", description: "Upload, tidy up and print documents from your computer in one screen." },
  robots: { index: true, follow: true },
};

export default function PhotoCopyPage() {
  return (
    <Suspense fallback={null}>
      <PhotoCopyClient />
    </Suspense>
  );
}
