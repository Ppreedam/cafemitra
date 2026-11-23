import type { Metadata } from "next";
import FamilyPassportPhotoClient from "./FamilyPassportPhotoClient";
import { ogStaticImage } from "@/lib/og";

const pageUrl = "https://repetigo.com/family-passport-photo";

const shareImage = ogStaticImage("family-passport-photo.jpg", "RepetiGo Family Passport Photo - separate photos of 2 to 6 people merged into one family group photo");

export const metadata: Metadata = {
  title: "Family Passport Photo Maker Online - AI Group Photo | RepetiGo",
  description:
    "Upload one photo per family member and get a single AI-merged family group photo - print-ready studio-style output for framing or gifting.",
  alternates: { canonical: pageUrl },
  openGraph: {
    images: [shareImage],
    title: "Family Passport Photo Maker Online - AI Group Photo | RepetiGo",
    description: "Upload individual photos of each family member and get one AI-merged group photo.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    images: [shareImage],
    card: "summary_large_image",
    title: "Family Passport Photo Maker - RepetiGo",
    description: "Upload individual photos of each family member and get one AI-merged group photo.",
  },
  robots: { index: true, follow: true },
};

export default function FamilyPassportPhotoPage() {
  return <FamilyPassportPhotoClient />;
}
