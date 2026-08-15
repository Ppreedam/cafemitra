import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import SavedDocumentsList from "../../resume-builder/saved/SavedResumesList";
import { BIODATA_TEMPLATES } from "../templates";

export const metadata: Metadata = {
  title: "My Biodatas | RepetiGo",
  robots: { index: false, follow: false },
};

export default function SavedBiodatasPage() {
  return (
    <DashboardShell activePath="/biodata-maker">
      <div className="resbuild-gallery">
        <header className="resbuild-gallery-head">
          <h1>My Biodatas</h1>
          <p>Biodatas you've saved while editing. Open one to keep working on it, or start a new one from the template gallery.</p>
        </header>
        <SavedDocumentsList
          listUrl="/api/tools/biodata-maker/saved/"
          buildPath="/biodata-maker/build"
          galleryPath="/biodata-maker"
          templates={BIODATA_TEMPLATES}
          itemLabel="biodata"
          responseKey="biodatas"
        />
      </div>
    </DashboardShell>
  );
}
