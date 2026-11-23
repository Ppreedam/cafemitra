import type { Metadata } from "next";
import { DashboardShell } from "../DashboardShell";
import ResumeGalleryClient from "./ResumeGalleryClient";
import { ogStaticImage } from "@/lib/og";

const pageUrl = "https://repetigo.com/resume-builder";

const shareImage = ogStaticImage("resume-builder.jpg", "RepetiGo Resume Builder - 9 templates including an ATS-safe design, download as PDF");

export const metadata: Metadata = {
  title: "Free Resume Builder Online - Choose a Template | RepetiGo",
  description: "Pick a resume template, fill in your details, and download a clean PDF. Free, no sign-up required.",
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: "https://repetigo.com/resume-builder", siteName: "RepetiGo", images: [shareImage] },
  twitter: { card: "summary_large_image", images: [shareImage] },
};

export default function ResumeBuilderGalleryPage() {
  return (
    <DashboardShell activePath="/resume-builder">
      <div className="resbuild-gallery">
        <header className="resbuild-gallery-head">
          <h1>Choose a resume template</h1>
          <p>Pick a look to start with. You can switch templates anytime while editing - your content carries over.</p>
        </header>
        <ResumeGalleryClient />
      </div>
    </DashboardShell>
  );
}
