"use client";

import Link from "next/link";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  FileText,
  IdCard,
  MessageCircle,
  Printer,
  Shield,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { apiFetch, hasStoredSession, storeSession } from "@/lib/api";
import { DashboardShell } from "../DashboardShell";
import { SkeletonBlock } from "../UiState";

type Order = {
  id: number;
  orderNumber: string;
  tokenId: string;
  serviceKey?: string;
  serviceName: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  customerPhone?: string;
  createdAt: string;
};

type ProfileSummary = {
  user: {
    fullName: string;
    balance: number;
  };
};

type WalletSummary = {
  balance: number;
  summary?: {
    netWithdrawable?: number;
  };
};

type Metric = {
  label: string;
  value: string;
  meta: string;
  icon: LucideIcon;
  color: string;
};

const serviceCatalog = [
  { key: "auto_document_print", aliases: ["cafemitra printpilot", "printpilot"], name: "PrintPilot", icon: Printer, color: "#2563eb", href: "/auto-print" },
  { key: "whatsapp_print", aliases: ["whatsapp print"], name: "WhatsApp Print", icon: MessageCircle, color: "#0d9488", href: "#" },
  { key: "passport_photo", aliases: ["passport size photo", "passport photo"], name: "Passport Photo", icon: UserRound, color: "#5740ed", href: "#" },
  { key: "id_card_print", aliases: ["id card print"], name: "ID Card Print", icon: IdCard, color: "#16a1bd", href: "#" },
  { key: "admit_card_hub", aliases: ["admit card hub"], name: "Admit Card Hub", icon: ClipboardList, color: "#f97316", href: "#" },
  { key: "document_services", aliases: ["document services"], name: "Document Services", icon: FileText, color: "#1688f5", href: "#" },
];

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [message, setMessage] = useState("Loading dashboard...");

  useEffect(() => {
    hydrateProfileFromStorage();

    if (!hasStoredSession()) {
      setMessage("Please login to view live analytics.");
      return;
    }

    async function loadDashboard() {
      try {
        const [ordersResponse, profileResponse, walletResponse] = await Promise.all([apiFetch("/api/orders/"), apiFetch("/api/profile/"), apiFetch("/api/wallet/")]);
        const ordersResult = await ordersResponse.json().catch(() => ({}));
        const profileResult = await profileResponse.json().catch(() => ({}));
        const walletResult = await walletResponse.json().catch(() => ({}));

        if (!ordersResponse.ok) throw new Error(ordersResult.message || "Could not load dashboard analytics.");
        setOrders(Array.isArray(ordersResult.orders) ? ordersResult.orders : []);

        if (profileResponse.ok) {
          storeSession(profileResult);
          setProfile(profileResult as ProfileSummary);
        }
        if (walletResponse.ok) {
          setWallet(walletResult as WalletSummary);
        }

        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load dashboard analytics.");
      }
    }

    loadDashboard();
  }, []);

  function hydrateProfileFromStorage() {
    try {
      const storedUser = JSON.parse(localStorage.getItem("cafemitra_user") || "{}") as Partial<ProfileSummary["user"]>;
      if (storedUser.fullName || storedUser.balance !== undefined) {
        setProfile({ user: { fullName: storedUser.fullName || "Owner", balance: Number(storedUser.balance || 0) } });
      }
    } catch {
      undefined;
    }
  }

  const analytics = useMemo(() => buildDashboardAnalytics(orders, profile, wallet), [orders, profile, wallet]);
  const ownerName = profile?.user.fullName?.trim().split(" ")[0] || "Owner";

  return (
    <DashboardShell activePath="/dashboard">
      <div className="dashboard">
          <div className="dashboard-hero">
            <div>
              <h1>{getGreeting()}, {ownerName}</h1>
              <p>{message || "Here is what is happening with your business today."}</p>
            </div>
            <span className="status-pill">All Systems Operational</span>
          </div>

          <section className="metrics-grid" aria-label="Business metrics">
            {message === "Loading dashboard..." ? (
              <>
                <SkeletonBlock lines={3} />
                <SkeletonBlock lines={3} />
                <SkeletonBlock lines={3} />
                <SkeletonBlock lines={3} />
              </>
            ) : analytics.metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article className="metric-card" key={metric.label}>
                  <span className="icon-tile" style={{ "--tile-color": metric.color } as React.CSSProperties}>
                    <Icon size={22} />
                  </span>
                  <div className="metric-content">
                    <div className="metric-label">{metric.label}</div>
                    <div className="metric-value">{metric.value}</div>
                    <div className="metric-meta">{metric.meta}</div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="dashboard-section">
            <div className="section-title-row">
              <h2>Quick Access Services</h2>
              <Link className="mini-link" href="/pricing-settings">
                View All Services
              </Link>
            </div>
            <div className="quick-grid">
              {analytics.quickServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Link className="quick-card" href={service.href} key={service.name}>
                    <span className="icon-tile" style={{ "--tile-color": service.color } as React.CSSProperties}>
                      <Icon size={23} />
                    </span>
                    <div>
                      <h3>{service.name}</h3>
                      <span className="order-count" style={{ "--tile-color": service.color } as React.CSSProperties}>
                        {service.orders} {service.orders === 1 ? "order" : "orders"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

      </div>
    </DashboardShell>
  );
}

function buildDashboardAnalytics(orders: Order[], profile: ProfileSummary | null, wallet: WalletSummary | null) {
  const todayOrders = orders.filter((order) => isSameLocalDay(order.createdAt, 0));
  const yesterdayOrders = orders.filter((order) => isSameLocalDay(order.createdAt, -1));
  const todayRevenue = sumRevenue(todayOrders);
  const yesterdayRevenue = sumRevenue(yesterdayOrders);
  const pendingOrders = orders.filter((order) => !["printed", "failed"].includes(order.status)).length;
  const customerIds = new Set(
    orders
      .map((order) => order.customerPhone || order.tokenId || order.orderNumber)
      .filter(Boolean),
  );
  const yesterdayCustomerIds = new Set(
    orders
      .filter((order) => isBeforeToday(order.createdAt))
      .map((order) => order.customerPhone || order.tokenId || order.orderNumber)
      .filter(Boolean),
  );

  const metrics: Metric[] = [
    { label: "Today's Revenue", value: formatCurrency(todayRevenue), meta: formatDelta(todayRevenue, yesterdayRevenue, "vs yesterday"), icon: Shield, color: "#2563eb" },
    { label: "Today's Orders", value: String(todayOrders.length), meta: formatDelta(todayOrders.length, yesterdayOrders.length, "vs yesterday"), icon: ClipboardList, color: "#1688f5" },
    { label: "Pending Orders", value: String(pendingOrders), meta: pendingOrders ? "View pending" : "No pending orders", icon: ClipboardList, color: "#f97316" },
    { label: "Wallet Balance", value: formatCurrency(Number(wallet?.summary?.netWithdrawable ?? profile?.user.balance ?? 0)), meta: "After commission", icon: Wallet, color: "#0d9488" },
    { label: "Total Customers", value: String(customerIds.size), meta: formatDelta(customerIds.size, yesterdayCustomerIds.size, "total growth"), icon: Users, color: "#5740ed" },
  ];

  const quickServices = serviceCatalog.map((service) => ({
    ...service,
    orders: orders.filter((order) => matchesService(order, service.key, service.aliases)).length,
  }));

  return { metrics, quickServices };
}

function sumRevenue(orders: Order[]) {
  return orders
    .filter((order) => order.paymentStatus !== "pending" && order.status !== "failed")
    .reduce((total, order) => total + Number(order.totalAmount || 0), 0);
}

function matchesService(order: Order, key: string, aliases: string[]) {
  const serviceKey = String(order.serviceKey || "").toLowerCase();
  const serviceName = String(order.serviceName || "").toLowerCase();
  return serviceKey === key || aliases.includes(serviceName);
}

function isSameLocalDay(value: string, dayOffset: number) {
  if (!value) return false;
  const date = new Date(value);
  const target = new Date();
  target.setDate(target.getDate() + dayOffset);
  return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth() && date.getDate() === target.getDate();
}

function isBeforeToday(value: string) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function formatCurrency(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;
}

function formatDelta(current: number, previous: number, suffix: string) {
  if (previous > 0) {
    const delta = ((current - previous) / previous) * 100;
    return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% ${suffix}`;
  }
  if (current > 0) return `+${current} new ${suffix}`;
  return `No change ${suffix}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}
