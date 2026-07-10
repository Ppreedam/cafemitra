"use client";

import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  Bot,
  ChevronDown,
  CircleHelp,
  Crop,
  FileWarning,
  IdCard,
  Info,
  Printer,
  ReceiptText,
  ScrollText,
  Shield,
  Users,
  X,
} from "lucide-react";
import { HomeHeaderActions } from "./HomeHeaderActions";
import { releaseFlags } from "./release-flags";

const serviceMenu = [
  {
    name: "PrintPilot",
    href: "/print-automation",
    icon: Printer,
    color: "#2563eb",
    summary: "AI-powered print queue, counter workflow, and printer automation.",
    description: "Manage queues, shop terminals, uploads, billing, and print status from one calm dashboard.",
    metric: "Live queue",
  },
  {
    name: "Document AI",
    href: "/#services",
    icon: Bot,
    color: "#e11d48",
    summary: "Auto-enhance, clean, and prepare customer documents before printing.",
    description: "Reduce manual edits with document cleanup, smart suggestions, and ready-to-print outputs.",
    metric: "Smart cleanup",
    comingSoon: true,
  },
  {
    name: "Passport Photo",
    href: "/#services",
    icon: Users,
    color: "#5740ed",
    summary: "Government-size photo sheets with cropping and background assistance.",
    description: "Create consistent photo sheets for common ID requirements without opening separate tools.",
    metric: "Photo sheet",
    comingSoon: true,
  },
  {
    name: "Agreement Maker",
    href: "/#services",
    icon: ReceiptText,
    color: "#f13d7d",
    summary: "Generate neat agreements and shop documents from guided inputs.",
    description: "Turn repeated typing into reusable flows for agreements, declarations, and customer paperwork.",
    metric: "Guided forms",
    comingSoon: true,
  },
  {
    name: "Photo Resize",
    href: "/#free-tools",
    icon: Crop,
    color: "#0d9488",
    summary: "Resize and prepare photos for forms, cards, uploads, and print sheets.",
    description: "Quick image tools for everyday counter jobs, built into the same RepetiGo workflow.",
    metric: "Image tools",
    comingSoon: true,
  },
  {
    name: "ID Card Print",
    href: "/#services",
    icon: IdCard,
    color: "#f97316",
    summary: "Batch-ready ID card layouts for schools, offices, and local businesses.",
    description: "Prepare reusable ID card templates, customer records, and print-ready card batches.",
    metric: "Batch cards",
    comingSoon: true,
  },
];

const moreMenu = [
  {
    name: "About Us",
    href: "/about-us",
    icon: Info,
    color: "#2563eb",
    summary: "India's document infrastructure story.",
    description: "Learn why RepetiGo exists, what we are building for Indian print shops, and how our platform keeps document work private and fast.",
    metric: "Company",
  },
  {
    name: "Help & Support",
    href: "/help-support",
    icon: CircleHelp,
    color: "#0d9488",
    summary: "Guides, troubleshooting, and setup help.",
    description: "Find setup steps, FAQs, PrintPilot guidance, and support resources for running RepetiGo smoothly in your shop.",
    metric: "Support",
  },
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
    icon: Shield,
    color: "#16a34a",
    summary: "How we protect shop and customer data.",
    description: "Review how RepetiGo handles document uploads, customer data, AI processing, retention, security, and user rights.",
    metric: "Privacy",
  },
  {
    name: "Disclaimer",
    href: "/disclaimer",
    icon: FileWarning,
    color: "#f97316",
    summary: "Important platform limits and responsibilities.",
    description: "Understand the responsibilities of shop owners and customers when using automation, printing, AI tools, and third-party services.",
    metric: "Legal",
  },
  {
    name: "Terms & Conditions",
    href: "/terms-conditions",
    icon: ScrollText,
    color: "#5740ed",
    summary: "Rules for using RepetiGo services.",
    description: "Read the platform terms covering accounts, acceptable use, payments, content, service availability, and liability.",
    metric: "Agreement",
  },
];

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
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [activeMoreIndex, setActiveMoreIndex] = useState(0);
  const morePaths = moreMenu.map((item) => item.href);
  const isHomeActive = pathname === "/";
  const isServicesActive = pathname === "/print-automation";
  const isPricingActive = pathname === "/pricing";
  const isMoreActive = morePaths.includes(pathname);
  const isContactActive = pathname === "/contact-us";

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
          <Link className={isHomeActive ? "nav-link-active" : undefined} href="/">
            Home
          </Link>
          <div className="nav-dropdown nav-services">
            <button className={isServicesActive ? "nav-dropdown-trigger nav-link-active" : "nav-dropdown-trigger"} type="button">
              Services <ChevronDown size={14} aria-hidden />
            </button>
            <ProductMegaMenu activeIndex={activeServiceIndex} items={serviceMenu} setActiveIndex={setActiveServiceIndex} />
          </div>
          {releaseFlags.showLatestJobs ? <Link href="/#workflow">Latest Jobs</Link> : null}
          <Link className={isPricingActive ? "nav-link-active" : undefined} href="/pricing">
            Pricing
          </Link>
          <div className="nav-dropdown nav-more">
            <button className={isMoreActive ? "nav-dropdown-trigger nav-link-active" : "nav-dropdown-trigger"} type="button">
              More <ChevronDown size={14} aria-hidden />
            </button>
            <CompanyMegaMenu activeIndex={activeMoreIndex} items={moreMenu} setActiveIndex={setActiveMoreIndex} />
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

type CompanyMenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
  summary: string;
  description: string;
  metric: string;
};

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

function ProductMegaMenu({
  activeIndex,
  items,
  setActiveIndex,
}: {
  activeIndex: number;
  items: MegaMenuItem[];
  setActiveIndex: (index: number) => void;
}) {
  const activeItem = items[activeIndex] || items[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="nav-mega-menu product-mega-menu" aria-label="Services menu">
      <div className="product-menu-list">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;
          const className = isActive ? "product-menu-item product-menu-item-active" : "product-menu-item";
          const content = (
            <>
              <span className="product-menu-icon" style={{ "--tile-color": item.color } as React.CSSProperties}>
                <Icon size={17} />
              </span>
              <span className="product-menu-copy">
                <strong>{item.name}</strong>
                <span>{item.summary}</span>
              </span>
              {item.comingSoon ? <span className="coming-soon-badge">Soon</span> : null}
            </>
          );

          if (item.comingSoon) {
            return (
              <button className={className} key={item.name} onFocus={() => setActiveIndex(index)} onMouseEnter={() => setActiveIndex(index)} type="button">
                {content}
              </button>
            );
          }

          return (
            <Link className={className} href={item.href} key={item.name} onFocus={() => setActiveIndex(index)} onMouseEnter={() => setActiveIndex(index)}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="product-menu-preview">
        <span className="product-preview-icon" style={{ "--tile-color": activeItem.color } as React.CSSProperties}>
          <ActiveIcon size={22} />
        </span>
        <div className="product-preview-copy">
          <span>{activeItem.metric}</span>
          <h3>{activeItem.name}</h3>
          <p>{activeItem.description}</p>
        </div>

        <div className="product-preview-window">
          <div className="product-window-top">
            <span />
            <span />
            <span />
            <strong>app.repetigo.com</strong>
          </div>
          <div className="product-window-card">
            <div className="product-window-head">
              <span className="product-window-device">
                <Printer size={16} />
              </span>
              <div>
                <strong>HP LaserJet Pro</strong>
                <small>{activeItem.metric} - Page 3 of 5</small>
              </div>
              <span className="product-window-progress" />
            </div>
            <div className="product-window-row">
              <span>contract_final.pdf</span>
              <strong>85%</strong>
            </div>
            <div className="product-window-row">
              <span>photo_id.jpg</span>
              <strong>100%</strong>
            </div>
            <div className="product-window-row">
              <span>form_aadhaar.pdf</span>
              <strong>40%</strong>
            </div>
          </div>
        </div>

        <Link className="product-preview-link" href={activeItem.comingSoon ? "/#services" : activeItem.href}>
          Learn More <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function CompanyMegaMenu({
  activeIndex,
  items,
  setActiveIndex,
}: {
  activeIndex: number;
  items: CompanyMenuItem[];
  setActiveIndex: (index: number) => void;
}) {
  const activeItem = items[activeIndex] || items[0];
  const ActiveIcon = activeItem.icon;

  return (
    <div className="nav-mega-menu company-mega-menu" aria-label="More pages menu">
      <div className="company-menu-list">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === activeIndex;
          return (
            <Link
              className={isActive ? "company-menu-item company-menu-item-active" : "company-menu-item"}
              href={item.href}
              key={item.name}
              onFocus={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="company-menu-icon" style={{ "--tile-color": item.color } as React.CSSProperties}>
                <Icon size={17} />
              </span>
              <span className="company-menu-copy">
                <strong>{item.name}</strong>
                <span>{item.summary}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="company-menu-preview">
        <span className="company-preview-icon" style={{ "--tile-color": activeItem.color } as React.CSSProperties}>
          <ActiveIcon size={22} />
        </span>
        <div className="company-preview-copy">
          <span>{activeItem.metric}</span>
          <h3>{activeItem.name}</h3>
          <p>{activeItem.description}</p>
        </div>

        <div className="company-preview-window">
          <div className="company-window-top">
            <span />
            <span />
            <span />
            <strong>repetigo.com</strong>
          </div>
          <div className="company-window-body">
            <div className="company-window-hero">
              <strong>{activeItem.metric}</strong>
              <span>{activeItem.summary}</span>
            </div>
            <div className="company-window-grid">
              <span>Secure</span>
              <span>Clear</span>
              <span>India-ready</span>
            </div>
          </div>
        </div>

        <Link className="company-preview-link" href={activeItem.href}>
          Open {activeItem.name} <ArrowRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
