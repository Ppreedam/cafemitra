import { SplitPdfTool } from "../split-pdf/SplitPdfClient";

export default function ExtractPagesPage() {
  return <SplitPdfTool
    initialMode="pages"
    toolTitle="Extract pages"
    uploadTitle="Extract PDF pages"
    uploadDescription="Select pages from a PDF and export each one as a separate PDF file."
  />;
}
