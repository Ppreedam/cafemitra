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
import { apiUrl, getAuthToken, hasStoredSession, wsUrl } from "@/lib/api";
import { fetchPricingServiceByKey } from "@/lib/pricing";
import { isVirtualPrinter } from "@/lib/printpilot-agent";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [disabledTools, setDisabledTools] = useState<Set<string>>(new Set());
  const [virtualPrinterAlert, setVirtualPrinterAlert] = useState<string | null>(null);
  const printerServiceKey = printerServiceKeyByPath[activePath] || "auto_document_print";

  // Listens on the same signal-only WebSocket the desktop Print Agent uses
  // ("a new job exists, go check") so a shop owner sees this warning the
  // instant a PrintPilot job lands, no matter which page they're on -
  // rather than only when they happen to revisit /auto-print.
  useEffect(() => {
    if (!hasStoredSession()) return;
    const token = getAuthToken();
    if (!token) return;

    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    async function checkSelectedPrinter() {
      try {
        const service = await fetchPricingServiceByKey("auto_document_print");
        const printer = String(service?.settings.selectedPrinter || "");
        if (printer && isVirtualPrinter(printer)) setVirtualPrinterAlert(printer);
      } catch {
        // Non-critical - just skip this alert check if the fetch fails.
      }
    }

    function connect() {
      if (cancelled) return;
      socket = new WebSocket(wsUrl("/ws/agent/jobs/", token));
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "job_available") void checkSelectedPrinter();
        } catch {
          // Ignore malformed frames.
        }
      };
      socket.onclose = () => {
        if (cancelled) return;
        reconnectTimer = setTimeout(connect, 5000);
      };
    }
    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
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

      {virtualPrinterAlert && (
        <div
          role="dialog"
          aria-modal="true"
          className="virtual-printer-alert-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setVirtualPrinterAlert(null)}
        >
          <div className="virtual-printer-alert">
            <h2>Wrong printer selected</h2>
            <p>
              A new PrintPilot job just came in, but your selected printer is <strong>{virtualPrinterAlert}</strong> - a
              virtual printer that never produces physical paper. Please select a real printer.
            </p>
            <div className="virtual-printer-alert-actions">
              <button
                type="button"
                className="virtual-printer-alert-dismiss"
                onClick={() => setVirtualPrinterAlert(null)}
              >
                Dismiss
              </button>
              <button
                type="button"
                className="virtual-printer-alert-cta"
                onClick={() => {
                  setVirtualPrinterAlert(null);
                  router.push("/auto-print?step=printer");
                }}
              >
                Select printer
              </button>
            </div>
          </div>
        </div>
      )}
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
