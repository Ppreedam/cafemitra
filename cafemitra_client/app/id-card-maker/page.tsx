import type { Metadata } from "next";
import IdCardMakerClient from "./IdCardMakerClient";

const pageUrl = "https://repetigo.com/id-card-maker";

export const metadata: Metadata = {
  title: "ID Card Maker from PDF Online Free | RepetiGo",
  description:
    "Create printable ID cards from a PDF online, free - upload your PDF, choose a layout, preview the card, and print. Built for print shops and cyber cafes.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "ID Card Maker from PDF Online Free | RepetiGo",
    description: "Upload a PDF, choose a layout, preview, and print ready-to-use ID cards. Free, no sign-up required to try.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ID Card Maker from PDF - RepetiGo",
    description: "Create printable ID cards from a PDF - upload, choose a layout, preview, and print.",
  },
  robots: { index: true, follow: true },
};

export default function IdCardMakerPage() {
  return <IdCardMakerClient />;
}
