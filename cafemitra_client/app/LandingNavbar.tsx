"use client";

import Link from "next/link";
import type React from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  ChevronDown,
  CircleHelp,
  Crop,
  FileImage,
  FilePlus2,
  FileText,
  FileWarning,
  IdCard,
  Image as ImageIcon,
  Info,
  Printer,
  ReceiptText,
  ScrollText,
  Shield,
  SplitSquareVertical,
  Trash2,
  Users,
} from "lucide-react";
import { HomeHeaderActions } from "./HomeHeaderActions";
import { releaseFlags } from "./release-flags";

const serviceMenu = [
  { name: "Print Automation", href: "/print-automation", icon: Printer, color: "#2563eb" },
  { name: "AI Form Filling", href: "/#services", icon: Bot, color: "#e11d48", comingSoon: true },
  { name: "Passport Photo", href: "/#services", icon: Users, color: "#5740ed", comingSoon: true },
  { name: "Agreement Maker", href: "/#services", icon: ReceiptText, color: "#f13d7d", comingSoon: true },
  { name: "Photo Resize", href: "/#free-tools", icon: Crop, color: "#0d9488", comingSoon: true },
  { name: "ID Card Print", href: "/#services", icon: IdCard, color: "#f97316", comingSoon: true },
];

const convertMenu = [
  { name: "JPG to PDF", href: "/#free-tools", icon: FileText, color: "#ef4444" },
  { name: "Merge PDF", href: "/#free-tools", icon: SplitSquareVertical, color: "#a855f7" },
  { name: "Delete PDF", href: "/#free-tools", icon: Trash2, color: "#e11d48" },
  { name: "PNG to PDF", href: "/#free-tools", icon: FilePlus2, color: "#2563eb" },
  { name: "PDF to JPG", href: "/#free-tools", icon: FileImage, color: "#16a34a" },
  { name: "PNG to JPG", href: "/#free-tools", icon: ImageIcon, color: "#f97316" },
];

const moreMenu = [
  { name: "About Us", href: "/about-us", icon: Info },
  { name: "Help & Support", href: "/help-support", icon: CircleHelp },
  { name: "Privacy Policy", href: "/privacy-policy", icon: Shield },
  { name: "Disclaimer", href: "/disclaimer", icon: FileWarning },
  { name: "Terms & Conditions", href: "/terms-conditions", icon: ScrollText },
];

export function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="brand-main">
        Repeti<span className="brand-accent">go</span>
      </span>
    </Link>
  );
}

export function LandingNavbar() {
  const pathname = usePathname();
  const morePaths = moreMenu.map((item) => item.href);
  const isHomeActive = pathname === "/";
  const isServicesActive = pathname === "/print-automation";
  const isPricingActive = pathname === "/pricing";
  const isMoreActive = morePaths.includes(pathname);
  const isContactActive = pathname === "/contact-us";

  return (
    <header className="site-header">
      <div className="section-inner header-inner">
        <Brand />
        <nav className="main-nav" aria-label="Primary navigation">
          <Link className={isHomeActive ? "nav-link-active" : undefined} href="/">
            Home
          </Link>
          <div className="nav-dropdown">
            <button className={isServicesActive ? "nav-dropdown-trigger nav-link-active" : "nav-dropdown-trigger"} type="button">
              Services <ChevronDown size={14} aria-hidden />
            </button>
            <div className="nav-mega-menu" aria-label="Services menu">
              <MegaMenuColumn title="Important Services" items={serviceMenu} />
              <MegaMenuColumn title="Convert Tools" items={convertMenu} hasViewAll />
            </div>
          </div>
          {releaseFlags.showLatestJobs ? <Link href="/#workflow">Latest Jobs</Link> : null}
          <Link className={isPricingActive ? "nav-link-active" : undefined} href="/pricing">
            Pricing
          </Link>
          <div className="nav-dropdown nav-more">
            <button className={isMoreActive ? "nav-dropdown-trigger nav-link-active" : "nav-dropdown-trigger"} type="button">
              More <ChevronDown size={14} aria-hidden />
            </button>
            <div className="nav-simple-menu" aria-label="More pages menu">
              {moreMenu.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    className={index === 2 ? "simple-menu-link simple-menu-link-separated" : "simple-menu-link"}
                    href={item.href}
                    key={item.name}
                  >
                    <Icon size={17} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
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

type MegaMenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  color: string;
  comingSoon?: boolean;
};

function MegaMenuColumn({ title, items, hasViewAll = false }: { title: string; items: MegaMenuItem[]; hasViewAll?: boolean }) {
  return (
    <div className="mega-column">
      <h3>{title}</h3>
      <div className="mega-list">
        {items.map((item) => {
          const Icon = item.icon;
          if (item.comingSoon) {
            return (
              <span className="mega-link mega-link-disabled" aria-disabled="true" key={item.name}>
                <span className="mega-icon" style={{ "--tile-color": item.color } as React.CSSProperties}>
                  <Icon size={17} />
                </span>
                <span className="mega-link-content">
                  <span>{item.name}</span>
                  <span className="coming-soon-badge">Coming Soon</span>
                </span>
              </span>
            );
          }

          return (
            <Link className="mega-link" href={item.href} key={item.name}>
              <span className="mega-icon" style={{ "--tile-color": item.color } as React.CSSProperties}>
                <Icon size={17} />
              </span>
              <span className="mega-link-content">
                <span>{item.name}</span>
              </span>
            </Link>
          );
        })}
      </div>
      {hasViewAll ? (
        <Link className="mega-view-all" href="/#free-tools">
          View All Tools <span aria-hidden>-&gt;</span>
        </Link>
      ) : null}
    </div>
  );
}
