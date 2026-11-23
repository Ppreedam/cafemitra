import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // This app's own folder is the project root. Without it, a stray
  // package-lock.json higher up makes Turbopack treat the whole repo (server,
  // media, print agent...) as the workspace, and dev hangs / eats memory.
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  // HTTP-level permanent redirects (308). A redirect() inside a page can't change
  // the status code here because app/loading.tsx makes pages stream with 200.
  async redirects() {
    return [
      { source: "/print-desk", destination: "/photo-copy", permanent: true },
      // Old site URLs (still linked from SEO copy / known to Google) -> current pages.
      // Order matters: specific renames first, then the generic /tools/pdf/:slug rule.
      { source: "/tools/pdf/add-page-numbers/:rest*", destination: "/pdf-tools/page-numbers", permanent: true },
      { source: "/tools/pdf/add-watermark/:rest*", destination: "/pdf-tools/watermark-pdf", permanent: true },
      { source: "/tools/pdf/pdf-to-pdf-a/:rest*", destination: "/pdf-tools/pdf-to-pdfa", permanent: true },
      { source: "/tools/pdf/-:n(\\d+)", destination: "/pdf-tools", permanent: true },
      { source: "/tools/pdf/:slug/:rest*", destination: "/pdf-tools/:slug", permanent: true },
      { source: "/tools/pdf", destination: "/pdf-tools", permanent: true },
      { source: "/tools/photo", destination: "/passport-photo", permanent: true },
      { source: "/tools", destination: "/pdf-tools", permanent: true },
      { source: "/pdf-tools-:n(\\d+)", destination: "/pdf-tools", permanent: true },
      { source: "/products/ocr", destination: "/pdf-tools/ocr-pdf", permanent: true },
      { source: "/products/:path*", destination: "/print-automation", permanent: true },
      { source: "/features/auto-delete", destination: "/privacy-policy", permanent: true },
      { source: "/features/ocr", destination: "/pdf-tools/ocr-pdf", permanent: true },
      { source: "/features/:path*", destination: "/print-automation", permanent: true },
      { source: "/use-cases/:path*", destination: "/print-automation", permanent: true },
      { source: "/security/:path*", destination: "/privacy-policy", permanent: true },
      { source: "/blog/pdf/how-to-merge-pdf-online", destination: "/pdf-tools/merge-pdf", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
