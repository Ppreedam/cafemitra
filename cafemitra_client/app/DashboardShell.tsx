"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ClipboardList,
  FileScan,
  FileText,
  FileUser,
  Home,
  IdCard,
  Image,
  LayoutGrid,
  Printer,
  QrCode,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ProfileTopbar } from "./profile/ProfileTopbar";
import { recordServiceVisit } from "@/lib/recentServices";
import { apiUrl } from "@/lib/api";

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
      { name: "ID Card Maker", icon: FileScan, href: "/id-card-maker", match: ["/id-card-maker"], serviceKey: "id_card_maker" },
      { name: "ID Card Print", icon: IdCard, href: "/id-card-print", match: ["/id-card-print"], serviceKey: "id_card_print" },
      { name: "Photo Print Sheet", icon: LayoutGrid, href: "/photo-print-sheet", match: ["/photo-print-sheet"] },
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools", match: ["/pdf-tools"], serviceKey: "pdf_tools" },
      { name: "Image Tools", icon: Image, href: "/image-tools", match: ["/image-tools"], serviceKey: "image_tools" },
      { name: "Resume Builder", icon: FileUser, href: "/resume-builder", match: ["/resume-builder"], serviceKey: "resume_builder" },
      { name: "Biodata Maker", icon: Users, href: "/biodata-maker", match: ["/biodata-maker"], serviceKey: "biodata_maker" },
      { name: "UPI QR Generator", icon: QrCode, href: "/upi-qr-generator", match: ["/upi-qr-generator"] },
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
  const [disabledTools, setDisabledTools] = useState<Set<string>>(new Set());
  const printerServiceKey = printerServiceKeyByPath[activePath] || "auto_document_print";

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
      <AppSidebar activePath={activePath} isCollapsed={isSidebarCollapsed} disabledTools={disabledTools} />
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

function AppSidebar({
  activePath,
  isCollapsed,
  disabledTools,
}: {
  activePath: string;
  isCollapsed: boolean;
  disabledTools: Set<string>;
}) {
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
            {group.items
              .filter((item) => !item.serviceKey || !disabledTools.has(item.serviceKey))
              .map((item) => {
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
    </aside>
  );
}
