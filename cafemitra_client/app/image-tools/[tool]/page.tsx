import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import ImageTransformTool from "../ImageTransformTool";
import { isImageTransformSlug, type ImageTransformSlug } from "../imageTransformSlugs";

type Props = { params: Promise<{ tool: string }> };

const seo: Partial<Record<ImageTransformSlug, { title: string; description: string; ogDescription: string; twitterDescription: string }>> = {
  "image-converter": {
    title: "Image Converter Online Free - JPG, PNG, WebP, SVG, BMP, ICO, PDF | RepetiGo",
    description: "Convert images online free between JPG, PNG, WebP, SVG, BMP, ICO, and PDF. Resize, adjust quality, and strip metadata. No sign-up, 100% browser-based - nothing is ever uploaded.",
    ogDescription: "Free image converter - JPG, PNG, WebP, SVG, BMP, ICO, PDF. No sign-up, nothing uploaded.",
    twitterDescription: "Convert images between JPG, PNG, WebP, SVG, BMP, ICO, and PDF, free. No sign-up, 100% browser-based.",
  },
  "convert-from-jpg": {
    title: "JPG to PNG & WebP Converter Online Free | RepetiGo",
    description: "Convert JPG or WebP images into PNG or WebP free online. Batch convert multiple files with adjustable quality. No sign-up, 100% browser-based - nothing is ever uploaded.",
    ogDescription: "Free JPG to PNG/WebP converter. Batch convert. No sign-up, nothing uploaded.",
    twitterDescription: "Convert JPG or WebP images into PNG or WebP, free. No sign-up, 100% browser-based.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params;
  const pageUrl = `https://repetigo.com/image-tools/${tool}`;
  const entry = isImageTransformSlug(tool) ? seo[tool] : undefined;
  if (!entry) return { title: "Image Tool | RepetiGo", robots: { index: false, follow: false } };
  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: pageUrl },
    openGraph: { title: entry.title, description: entry.ogDescription, type: "website", url: pageUrl },
    twitter: { card: "summary_large_image", title: entry.title, description: entry.twitterDescription },
    robots: { index: true, follow: true },
  };
}

export default async function ImageToolPage({ params }: Props) {
  const { tool } = await params;
  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard image-transform-shell">
        {isImageTransformSlug(tool) ? <ImageTransformTool slug={tool} /> : <section className="pdf-tool-placeholder"><h1>Image tool not found</h1></section>}
      </div>
    </DashboardShell>
  );
}
