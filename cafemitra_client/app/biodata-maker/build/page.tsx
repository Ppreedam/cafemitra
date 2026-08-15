import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardShell } from "../../DashboardShell";
import BiodataBuilderClient from "./BiodataBuilderClient";

const pageUrl = "https://repetigo.com/biodata-maker/build";

export const metadata: Metadata = {
  title: "Free Biodata Maker Online - Build & Download PDF | RepetiGo",
  description:
    "Build a clean matrimonial or general biodata online for free. Fill in your details, see a live preview, and download as PDF. No sign-up required.",
  alternates: { canonical: pageUrl },
  robots: { index: true, follow: true },
};

export default function BiodataMakerEditPage() {
  return (
    <DashboardShell activePath="/biodata-maker">
      <Suspense fallback={null}>
        <BiodataBuilderClient />
      </Suspense>
    </DashboardShell>
  );
}
