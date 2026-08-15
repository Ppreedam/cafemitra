"use client";

import TemplateGalleryGrid from "../resume-builder/TemplateGalleryGrid";
import { BIODATA_TEMPLATES } from "./templates";
import { sampleBiodata } from "./biodataModel";
import { BiodataPreviewPage } from "./BiodataPreview";
import { buildBiodataPdf } from "./pdfBuilder";

// Thin client wrapper - see ResumeGalleryClient.tsx for why this can't just
// be inlined into the server-component gallery page.
export default function BiodataGalleryClient() {
  return (
    <TemplateGalleryGrid
      templates={BIODATA_TEMPLATES}
      sampleData={sampleBiodata}
      renderPreview={(d) => <BiodataPreviewPage data={d} />}
      buildPdf={buildBiodataPdf}
      cacheNamespace="biodata"
      toolPrefix="biodata_maker_"
      basePath="/biodata-maker"
    />
  );
}
