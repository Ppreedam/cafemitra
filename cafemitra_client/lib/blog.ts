import { apiUrl } from "./api";

export type BlogArticleSummary = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverImage: string;
  metaTitle: string;
  metaDescription: string;
  coverImageAlt?: string;
  lazyLoadImages?: boolean;
  autoCaptionImages?: boolean;
  template?: "default" | "wide";
  tags?: string[];
  focusKeywords?: string[];
  authorName: string;
  readMinutes: number;
  publishedAt: string;
  updatedAt: string;
};

export type BlogArticle = BlogArticleSummary & { content: string };

// Pages that use these helpers are server-rendered and cached (ISR): the
// backend pings /api/revalidate on every publish/edit, and this interval is
// only the fallback (also what makes a scheduled article appear on time).
export const BLOG_REVALIDATE_SECONDS = 300;

export async function fetchBlogArticles(): Promise<BlogArticleSummary[]> {
  try {
    const response = await fetch(apiUrl("/api/blog/"), { next: { revalidate: BLOG_REVALIDATE_SECONDS } });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.articles) ? data.articles : [];
  } catch {
    return [];
  }
}

export async function fetchBlogArticle(slug: string): Promise<BlogArticle | null> {
  try {
    const response = await fetch(apiUrl(`/api/blog/${encodeURIComponent(slug)}/`), { next: { revalidate: BLOG_REVALIDATE_SECONDS } });
    if (!response.ok) return null;
    const data = await response.json();
    return data.article ?? null;
  } catch {
    return null;
  }
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Applies the article's image settings to the HTML rendered from its Markdown. */
export function applyImageSettings(html: string, options: { lazy?: boolean; caption?: boolean }): string {
  let result = html;
  if (options.caption) {
    // An image alone in its paragraph becomes <figure> with its alt text as the caption.
    result = result.replace(/<p>\s*(<img\b[^>]*>)\s*<\/p>/g, (whole, img: string) => {
      const alt = /\balt="([^"]*)"/.exec(img)?.[1]?.trim();
      return alt ? `<figure>${img}<figcaption>${escapeHtml(alt)}</figcaption></figure>` : whole;
    });
  }
  if (options.lazy) {
    result = result.replace(/<img\b(?![^>]*\bloading=)/g, '<img loading="lazy" decoding="async"');
  }
  return result;
}
