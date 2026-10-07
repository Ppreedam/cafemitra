import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { marked } from "marked";
import { ArrowLeft } from "lucide-react";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";
import { BLOG_REVALIDATE_SECONDS, applyImageSettings, fetchBlogArticle } from "@/lib/blog";

const siteUrl = "https://repetigo.com";

// Statically cached and refreshed on demand (see /api/revalidate) - crawlers
// always get the full article HTML.
export const revalidate = BLOG_REVALIDATE_SECONDS;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchBlogArticle(slug);
  if (!article) return { title: "Article not found | RepetiGo", robots: { index: false } };

  const title = article.metaTitle || `${article.title} | RepetiGo`;
  const description = article.metaDescription || article.excerpt;
  const url = `${siteUrl}/blog/${article.slug}`;
  const keywords = [...(article.focusKeywords ?? []), ...(article.tags ?? [])];
  return {
    title,
    description,
    ...(keywords.length ? { keywords } : {}),
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.authorName],
      ...(article.tags?.length ? { tags: article.tags } : {}),
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
    twitter: {
      card: article.coverImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(article.coverImage ? { images: [article.coverImage] } : {}),
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await fetchBlogArticle(slug);
  if (!article) notFound();

  // Content is written by RepetiGo staff in the admin panel (trusted).
  const html = applyImageSettings(marked.parse(article.content, { async: false }) as string, {
    lazy: article.lazyLoadImages,
    caption: article.autoCaptionImages,
  });
  const url = `${siteUrl}/blog/${article.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.coverImage ? [article.coverImage] : undefined,
    keywords: [...(article.focusKeywords ?? []), ...(article.tags ?? [])].join(", ") || undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { "@type": "Organization", name: article.authorName },
    publisher: { "@type": "Organization", name: "RepetiGo", url: siteUrl },
    mainEntityOfPage: url,
  };

  return (
    <div className="ai-landing-shell blog-index-shell">
      <LandingNavbar />
      <main className="blog-article-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <article className={`blog-article${article.template === "wide" ? " blog-article-wide" : ""}`}>
          <Link className="blog-article-back" href="/blog">
            <ArrowLeft size={15} aria-hidden /> All guides
          </Link>
          <span className="blog-index-card-category">{article.category}</span>
          <h1>{article.title}</h1>
          <p className="blog-article-meta">
            {article.authorName} · {new Date(article.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
            {article.readMinutes} min read
          </p>
          {article.coverImage ? <img className="blog-article-cover" src={article.coverImage} alt={article.coverImageAlt || article.title} /> : null}
          <div className="blog-article-body" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}
