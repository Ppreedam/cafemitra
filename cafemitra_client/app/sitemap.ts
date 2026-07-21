import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";

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

function isPublicRoute(route: string) {
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

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route.startsWith("/pdf-tools/") ? 0.8 : 0.7,
  }));
}
