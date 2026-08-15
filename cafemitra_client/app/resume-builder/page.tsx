import type { Metadata } from "next";
import { DashboardShell } from "../DashboardShell";
import ResumeGalleryClient from "./ResumeGalleryClient";

const pageUrl = "https://repetigo.com/resume-builder";

export const metadata: Metadata = {
  title: "Free Resume Builder Online - Choose a Template | RepetiGo",
  description: "Pick a resume template, fill in your details, and download a clean PDF. Free, no sign-up required.",
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
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
