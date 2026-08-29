import type { Metadata } from "next";
import PassportPhotoClient from "./PassportPhotoClient";

const pageUrl = "https://repetigo.com/passport-photo";

export const metadata: Metadata = {
  title: "Passport Size Photo Maker Online - AI Background & Crop | RepetiGo",
  description:
    "Create a passport size photo online - AI background removal, precise crop to exact passport dimensions, and a built-in photo editor. Print-ready output for passport, Aadhaar, PAN and visa photo requirements.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Passport Size Photo Maker Online - AI Background & Crop | RepetiGo",
    description: "AI background removal, precise crop, and photo editor - print-ready passport size photos in seconds.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Passport Size Photo Maker - RepetiGo",
    description: "AI background removal and precise crop for print-ready passport size photos.",
  },
  robots: { index: true, follow: true },
};

export default function PassportPhotoPage() {
  return <PassportPhotoClient />;
}
