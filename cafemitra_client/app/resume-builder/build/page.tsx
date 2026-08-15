import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardShell } from "../../DashboardShell";
import ResumeBuilderClient from "./ResumeBuilderClient";

const pageUrl = "https://repetigo.com/resume-builder/build";

export const metadata: Metadata = {
  title: "Free Resume Builder Online - Build & Download PDF | RepetiGo",
  description:
    "Build a clean, ATS-friendly resume online for free. Fill in your details, see a live preview, and download as PDF. No sign-up required.",
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
};

export default function ResumeBuilderEditPage() {
  return (
    <DashboardShell activePath="/resume-builder">
      <Suspense fallback={null}>
        <ResumeBuilderClient />
      </Suspense>
    </DashboardShell>
  );
}
