import type { Metadata } from "next";
import { DashboardShell } from "../DashboardShell";
import BiodataGalleryClient from "./BiodataGalleryClient";
import { ogImage } from "@/lib/og";

const pageUrl = "https://repetigo.com/biodata-maker";

const shareImage = ogImage({
  title: "Free Biodata Maker",
  subtitle: "Matrimonial and general biodata templates - download a clean PDF.",
  category: "Free Tool",
  icon: "resume",
});

export const metadata: Metadata = {
  title: "Free Biodata Maker Online - Matrimonial & General Biodata | RepetiGo",
  description: "Pick a biodata template, fill in your details, and download a clean PDF. Matrimonial and general biodata, free, no sign-up required.",
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: "https://repetigo.com/biodata-maker", siteName: "RepetiGo", images: [shareImage] },
  twitter: { card: "summary_large_image", images: [shareImage] },
};

export default function BiodataMakerGalleryPage() {
  return (
    <DashboardShell activePath="/biodata-maker">
      <div className="resbuild-gallery">
        <header className="resbuild-gallery-head">
          <h1>Choose a biodata template</h1>
          <p>Pick a look to start with - matrimonial or general. You can switch templates anytime while editing, your content carries over.</p>
        </header>
        <BiodataGalleryClient />
      </div>
    </DashboardShell>
  );
}
