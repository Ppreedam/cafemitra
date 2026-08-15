import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import SavedDocumentsList from "./SavedResumesList";
import { TEMPLATES } from "../templates";

export const metadata: Metadata = {
  title: "My Resumes | RepetiGo",
  robots: { index: false, follow: false },
};

export default function SavedResumesPage() {
  return (
    <DashboardShell activePath="/resume-builder">
      <div className="resbuild-gallery">
        <header className="resbuild-gallery-head">
          <h1>My Resumes</h1>
          <p>Resumes you've saved while editing. Open one to keep working on it, or start a new one from the template gallery.</p>
        </header>
        <SavedDocumentsList
          listUrl="/api/tools/resume-builder/saved/"
          buildPath="/resume-builder/build"
          galleryPath="/resume-builder"
          templates={TEMPLATES}
          itemLabel="resume"
          responseKey="resumes"
        />
      </div>
    </DashboardShell>
  );
}
