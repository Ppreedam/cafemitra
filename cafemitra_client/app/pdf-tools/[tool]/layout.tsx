import type { Metadata } from "next";
import type { ReactNode } from "react";

// Only these tools are served by the dynamic [tool] page; every other PDF tool
// has its own folder. Any other /pdf-tools/<name> now gets a real 404 instead
// of a 200 "being prepared" page that Google could index.
const toolTitles: Record<string, string> = {
  "ai-summarizer": "AI PDF Summarizer",
  "pdf-to-markdown": "PDF to Markdown",
  "scan-to-pdf": "Scan to PDF",
  "translate-pdf": "Translate PDF",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(toolTitles).map((tool) => ({ tool }));
}

// Dashboard tools with no public content yet: give each its own title and keep
// them out of Google until they have a real landing page.
export async function generateMetadata({ params }: { params: Promise<{ tool: string }> }): Promise<Metadata> {
  const { tool } = await params;
  return {
    title: `${toolTitles[tool] ?? "PDF Tool"} | RepetiGo`,
    robots: { index: false, follow: true },
  };
}

export default function PdfToolLayout({ children }: { children: ReactNode }) {
  return children;
}
