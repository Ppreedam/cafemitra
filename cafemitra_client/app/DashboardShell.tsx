"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { useState } from "react";
import {
  CircleHelp,
  ClipboardList,
  FileText,
  Home,
  Image,
  Printer,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { ProfileTopbar } from "./profile/ProfileTopbar";

type NavItem = {
  name: string;
  icon: LucideIcon;
  href: string;
  match?: string[];
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
      { name: "PrintPilot", icon: Printer, href: "/auto-print", match: ["/auto-print"] },
      // { name: "PDF Tools", icon: FileText, href: "/pdf-tools", match: ["/pdf-tools"] },
      // { name: "Image Tools", icon: Image, href: "/image-tools", match: ["/image-tools"] },
    ],
  },
];

export function DashboardShell({ activePath, children }: { activePath: string; children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <main className={`app-frame ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <AppSidebar activePath={activePath} isCollapsed={isSidebarCollapsed} />
      <section className="app-main">
        <ProfileTopbar isSidebarCollapsed={isSidebarCollapsed} onMenuClick={() => setIsSidebarCollapsed((current) => !current)} />
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
          Repeti<span className="brand-accent">go</span>
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
                <Link className={`side-link ${isActive ? "active" : ""}`} href={item.href} key={item.name} title={isCollapsed ? item.name : undefined}>
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
