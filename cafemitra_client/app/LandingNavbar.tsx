"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Archive,
  Bot,
  ChevronDown,
  Crop,
  FileWarning,
  FileImage,
  FileLock2,
  FileOutput,
  FilePenLine,
  FileText,
  Files,
  IdCard,
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
  ReceiptText,
  Shield,
  Users,
  X,
} from "lucide-react";
import { HomeHeaderActions } from "./HomeHeaderActions";
import { hasStoredSession } from "@/lib/api";
import { releaseFlags } from "./release-flags";

const serviceMenu = [
  {
    name: "PrintPilot",
    href: "/auto-print",
    icon: Printer,
    color: "#2563eb",
    summary: "AI-powered print queue, counter workflow, and printer automation.",
    description: "Manage queues, shop terminals, uploads, billing, and print status from one calm dashboard.",
    metric: "Live queue",
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
    href: "/dashboard",
    icon: Users,
    color: "#5740ed",
    summary: "Government-size photo sheets with cropping and background assistance.",
    description: "Create consistent photo sheets for common ID requirements without opening separate tools.",
    metric: "Photo sheet",
    comingSoon: true,
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
    name: "ID Card Print",
    href: "/dashboard",
    icon: IdCard,
    color: "#f97316",
    summary: "Batch-ready ID card layouts for schools, offices, and local businesses.",
    description: "Prepare reusable ID card templates, customer records, and print-ready card batches.",
    metric: "Batch cards",
    comingSoon: true,
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
    ["Image Converter", "/image-tools/image-converter", FileImage], ["Website to Image", "/image-tools/website-to-image", FileImage], ["HEIC to JPG", "/image-tools/convert-to-jpg", FileOutput], ["SVG Converter", "/image-tools/convert-to-jpg", FileImage], ["WebP to PNG", "/image-tools/convert-from-jpg", FileOutput], ["PNG Converter", "/image-tools/convert-to-jpg", FileImage], ["WebP to JPG", "/image-tools/convert-to-jpg", FileOutput], ["JPG Converter", "/image-tools/convert-from-jpg", FileImage], ["PNG to JPG", "/image-tools/convert-to-jpg", FileOutput], ["GIF Converter", "/image-tools/convert-to-jpg", FileImage], ["PNG to SVG", "/image-tools", FileOutput], ["Convert to JPG", "/image-tools/convert-to-jpg", FileOutput], ["Convert from JPG", "/image-tools/convert-from-jpg", FileImage], ["HTML to IMAGE", "/image-tools/html-to-image", FileText],
  ]},
  { label: "Security", color: "#4e82bd", tools: [
    ["Watermark IMAGE", "/image-tools/watermark-image", Stamp], ["Blur face", "/image-tools/blur-face", Shield],
  ]},
] as const;

export function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="brand-mark" aria-hidden>
        <Printer size={16} />
      </span>
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
  const isHomeActive = pathname === "/";
  const isServicesActive = pathname === "/print-automation";
  const isPdfToolsActive = pathname.startsWith("/pdf-tools");
  const isImageToolsActive = pathname.startsWith("/image-tools");
  const isContactActive = pathname === "/contact-us";

  useEffect(() => {
    setIsLoggedIn(hasStoredSession());
  }, []);

  return (
    <header className="site-header">
      {showNotice ? (
        <div className="notice-bar" role="region" aria-label="Launch offer">
          <div className="notice-bar-inner">
            <span>Launch offer - 14 days free, no credit card required.</span>
            <Link className="notice-bar-cta" href="/register">
              Start Free Trial <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
          <button className="notice-bar-close" type="button" aria-label="Dismiss launch offer" onClick={() => setShowNotice(false)}>
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
            <ProductMegaMenu items={serviceMenu} isLoggedIn={isLoggedIn} />
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
          <Link className={isContactActive ? "nav-link-active" : undefined} href="/contact-us">
            Contact Us
          </Link>
        </nav>
        <HomeHeaderActions />
      </div>
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
};

function ProductMegaMenu({ items, isLoggedIn }: { items: MegaMenuItem[]; isLoggedIn: boolean }) {
  return (
    <div className="nav-mega-menu services-simple-menu" aria-label="Services menu">
      {items.map((item) => {
        const Icon = item.icon;
        const href = isLoggedIn ? item.href : `/login?next=${encodeURIComponent(item.href)}`;

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
