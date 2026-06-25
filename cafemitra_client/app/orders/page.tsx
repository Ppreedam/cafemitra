"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileText,
  Home,
  IdCard,
  Image,
  Landmark,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Printer,
  Settings,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { apiFetch, apiUrl, clearSession, hasStoredSession } from "@/lib/api";

type Order = {
  id: number;
  orderNumber: string;
  tokenId: string;
  serviceName: string;
  priceLabel: string;
  pages: number;
  copies: number;
  totalAmount: number;
  paymentMode: string;
  paymentStatus: string;
  status: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
};

type NavItem = {
  name: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", icon: Home, href: "/dashboard" }] },
  { label: "", items: [{ name: "Orders", icon: ClipboardList, href: "/orders", active: true }] },
  {
    label: "Services",
    items: [
      { name: "PrintPilot", icon: Printer, href: "/auto-print" },
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools" },
      { name: "Image Tools", icon: Image, href: "/image-tools" },
      { name: "WhatsApp Print", icon: MessageCircle, href: "#" },
      { name: "Passport Photo", icon: UserRound, href: "#" },
      { name: "ID Card Print", icon: IdCard, href: "#" },
      { name: "Admit Card Hub", icon: ClipboardList, href: "#" },
      { name: "Document Services", icon: FileText, href: "#" },
      { name: "All Services", icon: LayoutGrid, href: "#" },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Customers", icon: Users, href: "#" },
      { name: "Wallet & Settlement", icon: Wallet, href: "#" },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileText, href: "#" },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "PrintPilot Setup", icon: Printer, href: "/auto-print" },
      { name: "Pricing & Settings", icon: Settings, href: "/pricing-settings" },
      { name: "Withdraw", icon: Landmark, href: "#" },
    ],
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("Loading orders...");
  const [actionMessage, setActionMessage] = useState("");
  const cashApprovalOrders = orders.filter((order) => order.paymentStatus === "cash_counter" && order.status === "awaiting_approval");

  useEffect(() => {
    if (!hasStoredSession()) {
      setMessage("Please login to view order history.");
      return;
    }

    apiFetch("/api/orders/")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((result) => {
        setOrders(result.orders || []);
        setMessage("");
      })
      .catch(() => setMessage("Could not load orders."));
  }, []);

  async function updateCashOrder(orderId: number, action: "approve" | "reject") {
    setActionMessage("");
    try {
      const response = await apiFetch(`/api/orders/${orderId}/${action}-cash/`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update order.");
      setOrders((current) => current.map((order) => (order.id === orderId ? result.order : order)));
      setActionMessage(action === "approve" ? "Order print queue me bhej diya gaya." : "Cash order reject kar diya gaya.");
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : "Could not update order.");
    }
  }

  return (
    <main className="app-frame">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-main">
            Cafe<span className="brand-accent">Mitra</span>
          </span>
          <span className="brand-dot">.online</span>
        </Link>

        <nav className="side-nav" aria-label="Dashboard navigation">
          {navGroups.map((group, index) => (
            <div key={`${group.label}-${index}`}>
              {group.label ? <div className="nav-label">{group.label}</div> : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link className={`side-link ${item.active ? "active" : ""}`} href={item.href} key={item.name}>
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
          <Link className="btn" href="#">
            <CircleHelp size={15} /> Contact Support
          </Link>
        </div>
      </aside>

      <section className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <Link href="/" aria-label="Open menu">
              <Menu size={22} />
            </Link>
          </div>
          <div className="topbar-right">
            <div className="business-switcher">
              <Building2 size={17} />
              Cafe Orders
              <ChevronDown size={15} />
            </div>
            <div className="notification-dot">
              <Bell size={23} />
            </div>
            <details className="profile-menu">
              <summary className="user-menu">
                <span className="avatar">S</span>
                <span>
                  <strong>Owner</strong>
                  <small style={{ display: "block", color: "#697397" }}>Order Desk</small>
                </span>
                <ChevronDown size={15} />
              </summary>
              <div className="profile-dropdown">
                <div className="profile-list">
                  <Link href="/dashboard">
                    <Bookmark size={18} /> Dashboard
                  </Link>
                  <Link href="/profile">
                    <UserRound size={18} /> My Profile
                  </Link>
                  <Link href="/login" onClick={clearSession}>
                    <LogOut size={18} /> Sign Out
                  </Link>
                </div>
              </div>
            </details>
          </div>
        </header>

        <div className="dashboard orders-dashboard">
          <div className="dashboard-hero">
            <div>
              <h1>Order History</h1>
              <p>Token wise customer print handover yahan manage karo.</p>
            </div>
            <span className="status-pill">{orders.length} Orders</span>
          </div>

          {cashApprovalOrders.length ? (
            <section className="cash-approval-panel">
              <div>
                <strong>Cash Counter Approval</strong>
                <p>Customer ne cash counter select kiya hai. Cash receive karne ke baad hi print approve karo.</p>
              </div>
              <div className="cash-approval-list">
                {cashApprovalOrders.map((order) => (
                  <article className="cash-approval-card" key={order.id}>
                    <div>
                      <span className="token-pill">{order.tokenId}</span>
                      <strong>{order.fileName || order.orderNumber}</strong>
                      <small>
                        {order.pages} x {order.copies} pages | Rs. {order.totalAmount}
                      </small>
                    </div>
                    <div className="cash-approval-actions">
                      <button type="button" onClick={() => updateCashOrder(order.id, "approve")}>
                        Yes, Print
                      </button>
                      <button className="danger" type="button" onClick={() => updateCashOrder(order.id, "reject")}>
                        No
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              {actionMessage ? <div className="orders-action-message">{actionMessage}</div> : null}
            </section>
          ) : null}

          <section className="panel orders-panel">
            {message ? <div className="orders-empty">{message}</div> : null}
            {!message && orders.length === 0 ? <div className="orders-empty">Abhi koi order nahi hai.</div> : null}
            {orders.length ? (
              <div className="orders-table-wrap">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Order</th>
                      <th>Service</th>
                      <th>File</th>
                      <th>Pages</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Print</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong className="token-pill">{order.tokenId}</strong>
                        </td>
                        <td>{order.orderNumber}</td>
                        <td>
                          <strong>{order.serviceName}</strong>
                          <small>{order.priceLabel}</small>
                        </td>
                        <td>
                          <a href={apiUrl(order.fileUrl)} target="_blank" rel="noreferrer">
                            {order.fileName || "Document"}
                          </a>
                        </td>
                        <td>{order.pages} x {order.copies}</td>
                        <td>Rs. {order.totalAmount}</td>
                        <td>
                          <span className={`order-status ${order.paymentStatus}`}>{formatStatus(order.paymentStatus)}</span>
                        </td>
                        <td>
                          <span className={`order-status ${order.status}`}>{formatStatus(order.status)}</span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
