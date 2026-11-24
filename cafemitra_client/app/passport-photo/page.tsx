import type { Metadata } from "next";
import PassportPhotoClient from "./PassportPhotoClient";
import PassportPhotoSeoContent from "./PassportPhotoSeoContent";
import { ogStaticImage } from "@/lib/og";
import { getToolCharge } from "@/lib/toolCharge";

const pageUrl = "https://repetigo.com/passport-photo";

const shareImage = ogStaticImage("passport-photo.jpg", "RepetiGo AI Passport Photo - casual photo to passport photo with blazer, white background and a 6-photo sheet");

export const metadata: Metadata = {
  title: "Passport Size Photo Maker - AI Background & Crop | RepetiGo",
  description:
    "Create a passport size photo online - AI background removal, exact passport-size crop and a built-in editor. Print-ready for passport, Aadhaar, PAN and visa.",
  alternates: {
    canonical: pageUrl,
    languages: { "en-IN": pageUrl, "hi-IN": "https://repetigo.com/hi/passport-photo" },
  },
  openGraph: {
    images: [shareImage],
    title: "Passport Size Photo Maker - AI Background & Crop | RepetiGo",
    description: "AI background removal, precise crop, and photo editor - print-ready passport size photos in seconds.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    images: [shareImage],
    card: "summary_large_image",
    title: "Passport Size Photo Maker - RepetiGo",
    description: "AI background removal and precise crop for print-ready passport size photos.",
  },
  robots: { index: true, follow: true },
};

export default async function PassportPhotoPage() {
  // Live charge from the wallet config, so the guide never shows a stale price.
  const charge = await getToolCharge("passport_photo");
  return <PassportPhotoClient seo={<PassportPhotoSeoContent charge={charge} />} />;
}
