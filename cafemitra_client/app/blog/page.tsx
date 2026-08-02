import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";
import { PublicFooter } from "../PublicFooter";
import { blogPosts } from "../blog-data";

const siteUrl = "https://repetigo.com";

export const metadata: Metadata = {
  title: "Blog | RepetiGo",
  description:
    "Guides and how-tos on print automation, PDF tools, and image tools from RepetiGo.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | RepetiGo",
    description: "Guides and how-tos on print automation, PDF tools, and image tools from RepetiGo.",
    type: "website",
    url: `${siteUrl}/blog`,
  },
};

export default function BlogIndexPage() {
  return (
    <div className="ai-landing-shell blog-index-shell">
      <LandingNavbar />
      <main className="blog-page">
        <section className="blog-hero">
          <div className="ai-dot-pattern ai-dot-pattern-left" aria-hidden />
          <div className="ai-dot-pattern ai-dot-pattern-right" aria-hidden />
          <div className="blog-hero-inner">
            <span className="blog-kicker">
              <Sparkles size={16} aria-hidden />
              RepetiGo Blog
            </span>
            <h1>Guides for Print Shops, PDFs, and Images.</h1>
            <p>Practical, step-by-step guides to help you get more out of RepetiGo - written for Indian print shops, cyber cafes, and everyday document work.</p>
            <span className="blog-hero-count">{blogPosts.length} guides and counting</span>
          </div>
        </section>

        <section className="blog-list-section">
          <div className="blog-index-grid">
            {blogPosts.map((post) => {
              const Icon = post.icon;
              return (
                <Link
                  className="blog-index-card"
                  href={post.href}
                  key={post.slug}
                  style={{ "--card-color": post.color } as React.CSSProperties}
                >
                  <div className="blog-index-card-image">
                    <Icon size={40} aria-hidden />
                  </div>
                  <div className="blog-index-card-body">
                    <span className="blog-index-card-category">{post.category}</span>
                    <h2>{post.title}</h2>
                    <p>{post.excerpt}</p>
                    <div className="blog-index-card-meta">
                      <span>{post.readTime}</span>
                      <span className="blog-index-card-link">
                        {post.ctaLabel || "Read guide"} <ArrowRight size={15} aria-hidden />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
