import type { ReactNode } from "react";

// Only these tools are served by the dynamic [tool] page; every other PDF tool
// has its own folder. Any other /pdf-tools/<name> now gets a real 404 instead
// of a 200 "being prepared" page that Google could index.
export const dynamicParams = false;

export function generateStaticParams() {
  return ["ai-summarizer", "pdf-to-markdown", "scan-to-pdf", "translate-pdf"].map((tool) => ({ tool }));
}

export default function PdfToolLayout({ children }: { children: ReactNode }) {
  return children;
}
