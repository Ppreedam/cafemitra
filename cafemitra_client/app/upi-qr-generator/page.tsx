import type { Metadata } from "next";
import { Suspense } from "react";
import UpiQrGeneratorClient from "./UpiQrGeneratorClient";

const pageUrl = "https://repetigo.com/upi-qr-generator";

export const metadata: Metadata = {
  title: "UPI QR Code Generator - Fixed or Any Amount, Free | RepetiGo",
  description:
    "Generate a UPI payment QR code with your shop name, UPI ID, and amount pre-filled. Fixed or any-amount QR, save multiple accounts, download, share, or print as a counter standee. Free.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "UPI QR Code Generator - Fixed or Any Amount, Free | RepetiGo",
    description:
      "Enter your UPI ID and shop name, generate a scannable payment QR that auto-fills the payer's app. Save multiple accounts, download or print for your counter.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
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
