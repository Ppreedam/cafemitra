"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  CircleHelp,
  ClipboardList,
  FileText,
  Home,
  IdCard,
  Image,
  Printer,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { ProfileTopbar } from "./profile/ProfileTopbar";
import { recordServiceVisit } from "@/lib/recentServices";

type NavItem = {
  name: string;
  icon: LucideIcon;
  href: string;
  match?: string[];
  serviceKey?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [{ name: "Dashboard", icon: Home, href: "/dashboard", match: ["/dashboard"] }],
  },
  {
    label: "",
    items: [{ name: "Orders", icon: ClipboardList, href: "/orders", match: ["/orders"] }],
  },
  {
    label: "Services",
    items: [
      { name: "PrintPilot", icon: Printer, href: "/auto-print", match: ["/auto-print"], serviceKey: "auto_document_print" },
      { name: "Passport Photo", icon: IdCard, href: "/passport-photo", match: ["/passport-photo"], serviceKey: "passport_photo" },
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools", match: ["/pdf-tools"], serviceKey: "pdf_tools" },
      { name: "Image Tools", icon: Image, href: "/image-tools", match: ["/image-tools"], serviceKey: "image_tools" },
    ],
  },
];

// Each page's printer selection is kept independent: PrintPilot saves under
// "auto_document_print", Passport Photo under its own "passport_photo" key.
const printerServiceKeyByPath: Record<string, string> = {
  "/passport-photo": "passport_photo",
};

export function DashboardShell({ activePath, children }: { activePath: string; children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const printerServiceKey = printerServiceKeyByPath[activePath] || "auto_document_print";

  useEffect(() => {
    // Reset whenever the viewport crosses the mobile breakpoint - "collapsed"
    // means "hidden off-canvas" on mobile and "icon rail" on desktop, so a
    // toggle state from one side doesn't mean anything useful on the other.
    // A mount-only check would get stuck: resizing from mobile to desktop
    // (e.g. dragging DevTools' responsive width) without a reload left the
    // sidebar stuck collapsed to an icon rail instead of showing in full.
    const mql = window.matchMedia("(max-width: 820px)");
    const handleChange = (event: MediaQueryListEvent) => setIsSidebarCollapsed(event.matches);
    setIsSidebarCollapsed(mql.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return (
    <main className={`app-frame ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <AppSidebar activePath={activePath} isCollapsed={isSidebarCollapsed} />
      <div className="sidebar-backdrop" onClick={() => setIsSidebarCollapsed(true)} aria-hidden />
      <section className="app-main">
        <ProfileTopbar
          isSidebarCollapsed={isSidebarCollapsed}
          onMenuClick={() => setIsSidebarCollapsed((current) => !current)}
          printerServiceKey={printerServiceKey}
        />
        {children}
      </section>
    </main>
  );
}

function AppSidebar({ activePath, isCollapsed }: { activePath: string; isCollapsed: boolean }) {
  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <span className="brand-main">
          Repeti<span className="brand-accent">Go</span>
        </span>
      </Link>

      <nav className="side-nav" aria-label="Dashboard navigation">
        {navGroups.map((group, index) => (
          <div key={`${group.label}-${index}`}>
            {group.label ? <div className="nav-label">{group.label}</div> : null}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = item.match?.includes(activePath);
              return (
                <Link
                  className={`side-link ${isActive ? "active" : ""}`}
                  href={item.href}
                  key={item.name}
                  title={isCollapsed ? item.name : undefined}
                  onClick={item.serviceKey ? () => recordServiceVisit(item.serviceKey!) : undefined}
                >
                  <Icon size={17} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="help-box">
        <div className="help-avatar">
          <UserRound size={21} />
        </div>
        <strong>Need Help?</strong>
        <p>We are here to assist you.</p>
        <Link className="btn" href="/contact-us">
          <CircleHelp size={15} /> Contact Support
        </Link>
      </div>
    </aside>
  );
}
