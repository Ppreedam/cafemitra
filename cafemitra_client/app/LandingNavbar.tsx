"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Archive,
  Bot,
  BookUser,
  ChevronDown,
  Crop,
  FileWarning,
  FileImage,
  FileLock2,
  FileOutput,
  FilePenLine,
  FileScan,
  FileText,
  FileUser,
  Files,
  IdCard,
  Images,
  Menu,
  Printer,
  RotateCw,
  Scissors,
  Sparkles,
  Stamp,
  Table2,
  TextSelect,
  LockOpen,
  ListOrdered,
  Presentation,
  QrCode,
  ReceiptText,
  Search,
  Shield,
  Users,
  X,
} from "lucide-react";
import { HomeHeaderActions } from "./HomeHeaderActions";
import { ToolSearch } from "./ToolSearch";
import { apiUrl, hasStoredSession } from "@/lib/api";
import { releaseFlags } from "./release-flags";
import { blogPosts } from "./blog-data";

const serviceMenu = [
  {
    name: "PrintPilot",
    href: "/auto-print",
    icon: Printer,
    color: "#2563eb",
    summary: "AI-powered print queue, counter workflow, and printer automation.",
    description: "Manage queues, shop terminals, uploads, billing, and print status from one calm dashboard.",
    metric: "Live queue",
    toolKey: "auto_document_print",
  },
  {
    name: "Resume Builder",
    href: "/resume-builder",
    icon: FileUser,
    color: "#16a34a",
    summary: "Build and print professional resumes with ready-made templates.",
    description: "Pick a template, fill in details, and print a polished resume right from the counter.",
    metric: "Resume templates",
    openAccess: true,
    toolKey: "resume_builder",
  },
  {
    name: "Biodata Maker",
    href: "/biodata-maker",
    icon: BookUser,
    color: "#c026d3",
    summary: "Build and print matrimonial or general biodata with ready-made templates.",
    description: "Pick a template, fill in personal and family details, and print a clean biodata right from the counter.",
    metric: "Biodata templates",
    openAccess: true,
    toolKey: "biodata_maker",
  },
  // {
  //   name: "Document AI",
  //   href: "/#services",
  //   icon: Bot,
  //   color: "#e11d48",
  //   summary: "Auto-enhance, clean, and prepare customer documents before printing.",
  //   description: "Reduce manual edits with document cleanup, smart suggestions, and ready-to-print outputs.",
  //   metric: "Smart cleanup",
  //   comingSoon: true,
  // },
  {
    name: "Passport Photo",
    href: "/passport-photo",
    icon: Users,
    color: "#5740ed",
    summary: "Government-size photo sheets with cropping and background assistance.",
    description: "Create consistent photo sheets for common ID requirements without opening separate tools.",
    metric: "Photo sheet",
    toolKey: "passport_photo",
  },
  {
    name: "Photo Print Sheet",
    href: "/photo-print-sheet",
    icon: Images,
    color: "#0891b2",
    summary: "Print multiple passport photos - different people, different sizes - on one sheet.",
    description: "Queue as many photos as you need, set the size and quantity for each, and print or download a print-ready A4/4x6/5x7 sheet.",
    metric: "Print sheet",
    openAccess: true,
    toolKey: "photo_print_sheet",
  },
  {
    name: "UPI QR Generator",
    href: "/upi-qr-generator",
    icon: QrCode,
    color: "#059669",
    summary: "Generate a shareable UPI payment QR with your shop name, amount, and note pre-filled.",
    description: "Save your shop's UPI ID once, then generate fixed or open-amount QR codes that auto-fill the payer's UPI app - download, share, or print as a counter standee.",
    metric: "Instant QR",
    openAccess: true,
    toolKey: "upi_qr_generator",
  },
  // {
  //   name: "Agreement Maker",
  //   href: "/#services",
  //   icon: ReceiptText,
  //   color: "#f13d7d",
  //   summary: "Generate neat agreements and shop documents from guided inputs.",
  //   description: "Turn repeated typing into reusable flows for agreements, declarations, and customer paperwork.",
  //   metric: "Guided forms",
  //   comingSoon: true,
  // },
  // {
  //   name: "Photo Resize",
  //   href: "/#free-tools",
  //   icon: Crop,
  //   color: "#0d9488",
  //   summary: "Resize and prepare photos for forms, cards, uploads, and print sheets.",
  //   description: "Quick image tools for everyday counter jobs, built into the same RepetiGo workflow.",
  //   metric: "Image tools",
  //   comingSoon: true,
  // },
  {
    name: "ID Card Maker",
    href: "/id-card-maker",
    icon: FileScan,
    color: "#0d9488",
    summary: "Design ID cards with ready-made templates and instant preview.",
    description: "Pick a template, fill in holder details and photo, and generate print-ready ID cards.",
    metric: "Card templates",
    toolKey: "id_card_maker",
  },
  {
    name: "ID Card Print",
    href: "/id-card-print",
    icon: IdCard,
    color: "#f97316",
    summary: "Batch-ready ID card layouts for schools, offices, and local businesses.",
    description: "Prepare reusable ID card templates, customer records, and print-ready card batches.",
    metric: "Batch cards",
    openAccess: true,
    toolKey: "id_card_print",
  },
];

const pdfToolGroups = [
  { label: "Organize PDF", color: "#2563eb", tools: [
    ["Merge PDF", "/pdf-tools/merge-pdf", Files], ["Split PDF", "/pdf-tools/split-pdf", Scissors], ["Remove pages", "/pdf-tools/remove-pages", FileOutput], ["Extract pages", "/pdf-tools/extract-pages", FileOutput], ["Organize PDF", "/pdf-tools/organize-pdf", ListOrdered],
  ]},
  { label: "Optimize PDF", color: "#0d9488", tools: [
    ["Compress PDF", "/pdf-tools/compress-pdf", Archive], ["Repair PDF", "/pdf-tools/repair-pdf", FileWarning], ["OCR PDF", "/pdf-tools/ocr-pdf", TextSelect],
  ]},
  { label: "Convert to PDF", color: "#1688f5", tools: [
    ["JPG to PDF", "/pdf-tools/jpg-to-pdf", FileImage], ["Word to PDF", "/pdf-tools/word-to-pdf", FileText], ["PowerPoint to PDF", "/pdf-tools/powerpoint-to-pdf", Presentation], ["Excel to PDF", "/pdf-tools/excel-to-pdf", Table2], ["HTML to PDF", "/pdf-tools/html-to-pdf", FileText], ["Markdown to PDF", "/pdf-tools/markdown-to-pdf", FileText],
  ]},
  { label: "Convert from PDF", color: "#2563eb", tools: [
    ["PDF to JPG", "/pdf-tools/pdf-to-jpg", FileImage], ["PDF to Word", "/pdf-tools/pdf-to-word", FileText], ["PDF to PowerPoint", "/pdf-tools/pdf-to-powerpoint", Presentation], ["PDF to Excel", "/pdf-tools/pdf-to-excel", Table2], ["PDF to PDF/A", "/pdf-tools/pdf-to-pdfa", FileOutput],
  ]},
  { label: "Edit PDF", color: "#16a1bd", tools: [
    ["Rotate PDF", "/pdf-tools/rotate-pdf", RotateCw], ["Add page numbers", "/pdf-tools/page-numbers", ListOrdered], ["Add watermark", "/pdf-tools/watermark-pdf", Stamp], ["Crop PDF", "/pdf-tools/crop-pdf", Crop], ["Edit PDF", "/pdf-tools/edit-pdf", FilePenLine], ["PDF Forms", "/pdf-tools/pdf-forms", ReceiptText],
  ]},
  { label: "PDF Security", color: "#0d1748", tools: [
    ["Unlock PDF", "/pdf-tools/unlock-pdf", LockOpen], ["Protect PDF", "/pdf-tools/protect-pdf", FileLock2], ["Sign PDF", "/pdf-tools/sign-pdf", FilePenLine], ["Redact PDF", "/pdf-tools/redact-pdf", Shield], ["Compare PDF", "/pdf-tools/compare-pdf", Files],
  ]},
] as const;

const imageToolGroups = [
  { label: "Optimize", color: "#65b741", tools: [
    ["Compress IMAGE", "/image-tools/compress-image", Archive], ["Upscale", "/image-tools/upscale-image", Sparkles], ["Remove background", "/image-tools/background-remover", FileImage],
  ]},
  { label: "Create", color: "#b05a9d", tools: [
    ["Meme generator", "/image-tools/meme-generator", Sparkles], ["Photo editor", "/image-tools/photo-editor", FilePenLine],
  ]},
  { label: "Modify", color: "#20b4d7", tools: [
    ["Resize IMAGE", "/image-tools/resize-image", Crop], ["Crop IMAGE", "/image-tools/crop-image", Scissors], ["Rotate IMAGE", "/image-tools/rotate-image", RotateCw],
  ]},
  { label: "Convert", color: "#f2c400", tools: [
    ["Image Converter", "/image-tools/image-converter", FileImage], ["Website to Image", "/image-tools/website-to-image", FileImage], ["HEIC to JPG", "/image-tools/heic-to-jpg", FileOutput], ["SVG Converter", "/image-tools/svg-converter", FileImage], ["WebP to PNG", "/image-tools/webp-to-png", FileOutput], ["PNG Converter", "/image-tools/png-converter", FileImage], ["WebP to JPG", "/image-tools/webp-to-jpg", FileOutput], ["JPG Converter", "/image-tools/jpg-converter", FileImage], ["PNG to JPG", "/image-tools/png-to-jpg", FileOutput], ["GIF Converter", "/image-tools/gif-converter", FileImage], ["PNG to SVG", "/image-tools/png-to-svg", FileOutput], ["Convert to JPG", "/image-tools/convert-to-jpg", FileOutput], ["JPG to WebP", "/image-tools/jpg-to-webp", FileOutput], ["HTML to IMAGE", "/image-tools/html-to-image", FileText],
  ]},
  { label: "Security", color: "#4e82bd", tools: [
    ["Watermark IMAGE", "/image-tools/watermark-image", Stamp], ["Blur face", "/image-tools/blur-face", Shield],
  ]},
] as const;

export function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="brand-main">
        Repeti<span className="brand-accent">Go</span>
      </span>
    </Link>
  );
}

export function LandingNavbar() {
  const pathname = usePathname();
  const [showNotice, setShowNotice] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [disabledTools, setDisabledTools] = useState<Set<string>>(new Set());
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const visibleServiceMenu = serviceMenu.filter((item) => !item.toolKey || !disabledTools.has(item.toolKey));
  const isHomeActive = pathname === "/";
  const isServicesActive = pathname === "/print-automation";
  const isPdfToolsActive = pathname.startsWith("/pdf-tools");
  const isImageToolsActive = pathname.startsWith("/image-tools");
  const isBlogActive = pathname.startsWith("/blog");
  const isContactActive = pathname === "/contact-us";

  useEffect(() => {
    setIsLoggedIn(hasStoredSession());
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/tools/visibility/"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Record<string, boolean> | null) => {
        if (cancelled || !data) return;
        setDisabledTools(new Set(Object.entries(data).filter(([, enabled]) => !enabled).map(([key]) => key)));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isSearchOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen]);

  return (
    <header className="site-header">
      {showNotice ? (
        <div className="notice-bar" role="region" aria-label="Free to use">
          <div className="notice-bar-inner">
            <span>RepetiGo is free to use - No credits or monthly charge required.</span>
            <Link className="notice-bar-cta" href="/register">
              Get Started Free <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <button className="notice-bar-close" type="button" aria-label="Dismiss notice" onClick={() => setShowNotice(false)}>
            <X size={15} aria-hidden />
          </button>
        </div>
      ) : null}
      <div className="section-inner header-inner">
        <Brand />
        <nav className="main-nav" aria-label="Primary navigation">
          <div className="nav-dropdown nav-services">
            <button className={isServicesActive ? "nav-dropdown-trigger nav-link-active" : "nav-dropdown-trigger"} type="button">
              Automation Tools <ChevronDown size={14} aria-hidden />
            </button>
            <ProductMegaMenu items={visibleServiceMenu} isLoggedIn={isLoggedIn} />
          </div>
          <div className="nav-dropdown nav-pdf-tools">
            <button className={isPdfToolsActive ? "nav-dropdown-trigger nav-link-active" : "nav-dropdown-trigger"} type="button">
              PDF Tools <ChevronDown size={14} aria-hidden />
            </button>
            <PdfToolsMegaMenu />
          </div>
          {releaseFlags.showLatestJobs ? <Link href="/#workflow">Latest Jobs</Link> : null}
          <div className="nav-dropdown nav-image-tools">
            <button className={isImageToolsActive ? "nav-dropdown-trigger nav-link-active" : "nav-dropdown-trigger"} type="button">
              Image Tools <ChevronDown size={14} aria-hidden />
            </button>
            <ImageToolsMegaMenu />
          </div>
          <div className="nav-dropdown nav-blog">
            <Link className={isBlogActive ? "nav-dropdown-trigger nav-link-active" : "nav-dropdown-trigger"} href="/blog">
              Blog <ChevronDown size={14} aria-hidden />
            </Link>
            <BlogMegaMenu />
          </div>
          <Link className={isContactActive ? "nav-link-active" : undefined} href="/contact-us">
            Contact Us
          </Link>
        </nav>
        <div className="header-inner-right">
          <div className="nav-search-wrap" ref={searchWrapRef}>
            <button
              type="button"
              className="nav-search-toggle"
              aria-label={isSearchOpen ? "Close search" : "Search tools"}
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((open) => !open)}
            >
              {isSearchOpen ? <X size={18} aria-hidden /> : <Search size={18} aria-hidden />}
            </button>
            {isSearchOpen ? (
              <div className="nav-search-panel">
                <ToolSearch />
              </div>
            ) : null}
          </div>
          <HomeHeaderActions />
          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>
      {isMobileMenuOpen ? (
        <nav className="mobile-nav-drawer" aria-label="Mobile navigation">
          <Link className={isServicesActive ? "nav-link-active" : undefined} href="/print-automation">
            Automation Tools
          </Link>
          <Link className={isPdfToolsActive ? "nav-link-active" : undefined} href="/pdf-tools">
            PDF Tools
          </Link>
          <Link className={isImageToolsActive ? "nav-link-active" : undefined} href="/image-tools">
            Image Tools
          </Link>
          <Link className={isBlogActive ? "nav-link-active" : undefined} href="/blog">
            Blog
          </Link>
          <Link className={isContactActive ? "nav-link-active" : undefined} href="/contact-us">
            Contact Us
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

function PdfToolsMegaMenu() {
  return <div className="nav-mega-menu pdf-tools-mega-menu" aria-label="PDF tools menu">
    {pdfToolGroups.map((group) => <section className="pdf-menu-group" key={group.label}>
      <div className="pdf-menu-group-title">{group.label}</div>
      <div>{group.tools.map(([name, href, Icon]) => <Link href={href} key={name}>
        <span style={{ "--pdf-menu-color": group.color } as React.CSSProperties}><Icon size={16} /></span>
        <strong>{name}</strong>
      </Link>)}</div>
    </section>)}
    <Link className="pdf-menu-all" href="/pdf-tools">View all PDF tools <ArrowRight size={15} /></Link>
  </div>;
}

function BlogMegaMenu() {
  return (
    <div className="nav-mega-menu blog-nav-menu" aria-label="Blog menu">
      {blogPosts.map((post) => {
        const Icon = post.icon;
        return (
          <Link href={post.href} key={post.slug}>
            <span className="blog-nav-menu-icon" style={{ "--service-menu-color": post.color } as React.CSSProperties}>
              <Icon size={16} aria-hidden />
            </span>
            <span className="blog-nav-menu-text">
              <span className="blog-nav-menu-category">{post.category}</span>
              <strong>{post.title}</strong>
            </span>
          </Link>
        );
      })}
      <Link className="pdf-menu-all" href="/blog">
        View all blog posts <ArrowRight size={15} />
      </Link>
    </div>
  );
}

function ImageToolsMegaMenu() {
  return <div className="nav-mega-menu pdf-tools-mega-menu image-tools-mega-menu" aria-label="Image tools menu">
    {imageToolGroups.map((group) => <section className="pdf-menu-group" key={group.label}>
      <div className="pdf-menu-group-title">{group.label}</div>
      <div>{group.tools.map(([name, href, Icon]) => <Link href={href} key={name}>
        <span style={{ "--pdf-menu-color": group.color } as React.CSSProperties}><Icon size={16} /></span>
        <strong>{name}</strong>
      </Link>)}</div>
    </section>)}
    <Link className="pdf-menu-all" href="/image-tools">View all image tools <ArrowRight size={15} /></Link>
  </div>;
}

type MegaMenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
  summary: string;
  description: string;
  metric: string;
  comingSoon?: boolean;
  openAccess?: boolean;
  toolKey?: string;
};

function ProductMegaMenu({ items, isLoggedIn }: { items: MegaMenuItem[]; isLoggedIn: boolean }) {
  return (
    <div className="nav-mega-menu services-simple-menu" aria-label="Services menu">
      {items.map((item) => {
        const Icon = item.icon;
        const href = isLoggedIn || item.openAccess ? item.href : `/login?next=${encodeURIComponent(item.href)}`;

        return (
          <Link href={href} key={item.name}>
            <span style={{ "--service-menu-color": item.color } as React.CSSProperties}>
              <Icon size={16} aria-hidden />
            </span>
            <strong>{item.name}</strong>
          </Link>
        );
      })}
    </div>
  );
}
