import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { blogHasNoArticles, fetchBlogArticles } from "@/lib/blog";

const siteUrl = "https://repetigo.com";

const privateRoutePrefixes = [
  "/analytics",
  "/auto-print",
  "/dashboard",
  "/forgot-password",
  "/login",
  "/orders",
  "/pricing-settings",
  "/profile",
  "/register",
  "/reset-password",
  "/s",
  "/verify-email",
  "/wallet",
];

// Public URLs that must not be in the sitemap: noindex pages, redirects, duplicates,
// and app/editor screens with no indexable content.
const excludedRoutes = new Set([
  "/impersonate", // admin support login link (token in URL hash)
  "/influencer", // noindex
  "/referral", // noindex
  "/print-desk", // redirects to /photo-copy
  "/card-print", // unlinked legacy page without metadata
  "/pdf-tools/pdf-forms", // duplicate of /pdf-tools/pdf-form
]);

// Route endings for per-user or editor screens (e.g. /resume-builder/saved,
// /biodata-maker/build, /id-card-maker/aadhaar/design) - all noindex or empty.
const excludedRouteSuffixes = ["/saved", "/build", "/design"];

function isPublicRoute(route: string) {
  if (excludedRoutes.has(route)) return false;
  if (excludedRouteSuffixes.some((suffix) => route.endsWith(suffix))) return false;
  return !privateRoutePrefixes.some(
    (prefix) => route === prefix || route.startsWith(`${prefix}/`),
  );
}

function collectPageRoutes(directory: string, segments: string[] = []): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      // Dynamic pages need known params before they can be included in a sitemap.
      if (entry.name.startsWith("[") || entry.name.startsWith("_")) {
        return [];
      }

      const nextSegments =
        entry.name.startsWith("(") && entry.name.endsWith(")")
          ? segments
          : [...segments, entry.name];

      return collectPageRoutes(path.join(directory, entry.name), nextSegments);
    }

    if (entry.isFile() && entry.name === "page.tsx") {
      const route = segments.length ? `/${segments.join("/")}` : "/";
      return isPublicRoute(route) ? [route] : [];
    }

    return [];
  });
}

const publicRoutes = collectPageRoutes(path.join(process.cwd(), "app")).sort();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /blog is noindex while no article is published (see app/blog/page.tsx).
  const hideBlog = await blogHasNoArticles();
  const staticEntries: MetadataRoute.Sitemap = publicRoutes.filter((route) => !(hideBlog && route === "/blog")).map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/pdf-tools/") ? 0.8 : 0.7,
  }));

  // Articles written in the admin panel - listed as soon as they are live.
  const articles = await fetchBlogArticles();
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/blog/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...articleEntries];
}
