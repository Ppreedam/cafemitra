"use client";

import TemplateGalleryGrid from "./TemplateGalleryGrid";
import { TEMPLATES } from "./templates";
import { sampleResume } from "./resumeModel";
import { ResumePreviewPage } from "./ResumePreview";
import { buildResumePdf } from "./pdfBuilder";

// Thin client wrapper so the server-component gallery page (needed for its
// `metadata` export) never has to pass functions as props across the
// server/client boundary - React only allows serializable props there.
export default function ResumeGalleryClient() {
  return (
    <TemplateGalleryGrid
      templates={TEMPLATES}
      sampleData={sampleResume}
      renderPreview={(d) => <ResumePreviewPage resume={d} />}
      buildPdf={buildResumePdf}
      cacheNamespace="resume"
      toolPrefix="resume_builder_"
      basePath="/resume-builder"
    />
  );
}
