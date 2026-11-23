import type { Metadata } from "next";
import { Suspense } from "react";
import UpiQrGeneratorClient from "./UpiQrGeneratorClient";
import { ogImage } from "@/lib/og";

const pageUrl = "https://repetigo.com/upi-qr-generator";

const shareImage = ogImage({
  title: "UPI QR Code Generator",
  subtitle: "Generate a payment QR for your shop counter in seconds.",
  category: "Free Tool",
  icon: "qr",
});

export const metadata: Metadata = {
  title: "UPI QR Code Generator - Fixed or Any Amount, Free | RepetiGo",
  description:
    "Free UPI payment QR code with your shop name, UPI ID and amount. Fixed or any-amount QR, multiple accounts - download, share or print as a standee.",
  alternates: { canonical: pageUrl },
  openGraph: {
    images: [shareImage],
    title: "UPI QR Code Generator - Fixed or Any Amount, Free | RepetiGo",
    description:
      "Enter your UPI ID and shop name, generate a scannable payment QR that auto-fills the payer's app. Save multiple accounts, download or print for your counter.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    images: [shareImage],
    card: "summary_large_image",
    title: "UPI QR Code Generator | RepetiGo",
    description: "Generate a UPI payment QR with amount and note pre-filled. Save accounts, download, share, or print. Free.",
  },
  robots: { index: true, follow: true },
};

export default function UpiQrGeneratorPage() {
  return (
    <Suspense fallback={null}>
      <UpiQrGeneratorClient />
    </Suspense>
  );
}
