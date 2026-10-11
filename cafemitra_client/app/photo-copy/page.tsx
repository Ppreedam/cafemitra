import type { Metadata } from "next";
import { Suspense } from "react";
import PhotoCopyClient from "./PhotoCopyClient";

const pageUrl = "https://repetigo.com/photo-copy";
const title = "Photo Copy & Print Documents From Your Computer Online | RepetiGo";
const description =
  "Photo copy or print documents stored on your computer - upload PDF, JPG or PNG, pick pages and copies, straighten and crop, and print straight on your printer. Built for print shops and cyber cafes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: { title, description, type: "website", url: pageUrl },
  twitter: { card: "summary_large_image", title: "Photo Copy & Print From Your Computer | RepetiGo", description: "Upload, tidy up and print documents from your computer in one screen." },
  robots: { index: true, follow: true },
};

export default function PhotoCopyPage() {
  return (
    <Suspense fallback={null}>
      <PhotoCopyClient />
    </Suspense>
  );
}
