import type { Metadata } from "next";
import IdCardPrintClient from "./IdCardPrintClient";

const pageUrl = "https://repetigo.com/id-card-print";

export const metadata: Metadata = {
  title: "ID Card Print - Upload Front & Back Photos Online | RepetiGo",
  description:
    "Upload front and back ID card photos, arrange them, and print - free online ID card print tool for print shops and cyber cafes. No design software needed.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "ID Card Print - Upload Front & Back Photos Online | RepetiGo",
    description: "Upload front and back photos, arrange the card layout, and print. Free, built for print shops.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ID Card Print - RepetiGo",
    description: "Upload front and back photos, arrange, and print ID cards. Free online tool.",
  },
  robots: { index: true, follow: true },
};

export default function IdCardPrintPage() {
  return <IdCardPrintClient />;
}
