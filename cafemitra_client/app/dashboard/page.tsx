import Link from "next/link";
import type React from "react";
import {
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileText,
  Landmark,
  Home,
  IdCard,
  Image,
  LogOut,
  LayoutGrid,
  Menu,
  MessageCircle,
  Printer,
  Settings,
  Shield,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", icon: Home, href: "/dashboard", active: true }] },
  { label: "", items: [{ name: "Orders", icon: ClipboardList, href: "/orders" }] },
  {
    label: "Services",
    items: [
      { name: "PrintPilot", icon: Printer, href: "/auto-print" },
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools" },
      { name: "Image Tools", icon: Image, href: "/image-tools" },
      { name: "WhatsApp Print", icon: MessageCircle },
      { name: "Passport Photo", icon: UserRound },
      { name: "ID Card Print", icon: IdCard },
      { name: "Admit Card Hub", icon: ClipboardList },
      { name: "Document Services", icon: FileText },
      { name: "All Services", icon: LayoutGrid },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Customers", icon: Users },
      { name: "Wallet & Settlement", icon: Wallet },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileText },
    ],
  },
];

const metrics = [
  { label: "Today's Revenue", value: "Rs. 1,250", meta: "+18.6% vs yesterday", icon: Shield, color: "#6d63df" },
  { label: "Today's Orders", value: "42", meta: "+16.3% vs yesterday", icon: ClipboardList, color: "#4a9dec" },
  { label: "Pending Orders", value: "3", meta: "View pending", icon: ClipboardList, color: "#ff9a52" },
  { label: "Wallet Balance", value: "Rs. 5,000", meta: "View wallet", icon: Wallet, color: "#42b98e" },
  { label: "Total Customers", value: "86", meta: "+12.5% vs yesterday", icon: Users, color: "#8b79e8" },
];

const quickServices = [
  { name: "PrintPilot", orders: "18 orders", icon: Printer, color: "#6d63df" },
  { name: "WhatsApp Print", orders: "5 orders", icon: MessageCircle, color: "#42b98e" },
  { name: "Passport Photo", orders: "2 orders", icon: UserRound, color: "#e95c8d" },
  { name: "ID Card Print", orders: "6 orders", icon: IdCard, color: "#45aabc" },
  { name: "Admit Card Hub", orders: "3 orders", icon: ClipboardList, color: "#ff9a52" },
  { name: "Document Services", orders: "8 orders", icon: FileText, color: "#4a9dec" },
];

export default function Dashboard() {
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
                  <Link className={`side-link ${item.active ? "active" : ""}`} href={item.href ?? "#"} key={item.name}>
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
              Cyber Cafe Shankar
              <ChevronDown size={15} />
            </div>
            <details className="printer-menu">
              <summary>
                <Printer size={17} />
                <span className="printer-dot online" />
                <span>Epson L805</span>
                <small>Connected</small>
                <ChevronDown size={14} />
              </summary>
              <div className="printer-dropdown">
                <div className="printer-option">
                  <span className="printer-dot online" />
                  <div>
                    <strong>Epson L805</strong>
                    <small>Connected</small>
                  </div>
                </div>
                <div className="printer-option">
                  <span className="printer-dot offline" />
                  <div>
                    <strong>Canon G3010</strong>
                    <small>Disconnected</small>
                  </div>
                </div>
              </div>
            </details>
            <div className="notification-dot">
              <Bell size={23} />
            </div>
            <details className="profile-menu">
              <summary className="user-menu">
                <span className="avatar">S</span>
                <span>
                  <strong>Shankar Kumar</strong>
                  <small style={{ display: "block", color: "#697397" }}>Owner</small>
                </span>
                <ChevronDown size={15} />
              </summary>
              <div className="profile-dropdown">
                <div className="profile-head">
                  <span className="profile-photo">S</span>
                  <div>
                    <strong>Shankar Kumar</strong>
                    <span>sk6201184579@gmail.com</span>
                    <span>Balance: 0</span>
                    <span>User ID: 204927</span>
                  </div>
                </div>
                <div className="profile-list">
                  <Link href="/dashboard">
                    <Bookmark size={18} /> Dashboard
                  </Link>
                  <Link href="/profile">
                    <UserRound size={18} /> My Profile
                  </Link>
                  <Link href="#">
                    <Printer size={18} /> PrintPilot Setup
                  </Link>
                  <Link href="/pricing-settings">
                    <Settings size={18} /> Pricing & Settings
                  </Link>
                  <Link href="#">
                    <Landmark size={18} /> Withdraw
                  </Link>
                  <Link href="/login">
                    <LogOut size={18} /> Sign Out
                  </Link>
                </div>
              </div>
            </details>
          </div>
        </header>

        <div className="dashboard">
          <div className="dashboard-hero">
            <div>
              <h1>Good Morning, Shankar</h1>
              <p>Here is what is happening with your business today.</p>
            </div>
            <span className="status-pill">All Systems Operational</span>
          </div>

          <section className="metrics-grid" aria-label="Business metrics">
            {metrics.map((metric) => {
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
              <Link className="mini-link" href="#">
                View All Services
              </Link>
            </div>
            <div className="quick-grid">
              {quickServices.map((service) => {
                const Icon = service.icon;
                return (
                  <article className="quick-card" key={service.name}>
                    <span className="icon-tile" style={{ "--tile-color": service.color } as React.CSSProperties}>
                      <Icon size={23} />
                    </span>
                    <div>
                      <h3>{service.name}</h3>
                      <span className="order-count" style={{ "--tile-color": service.color } as React.CSSProperties}>
                        {service.orders}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

        </div>
      </section>
    </main>
  );
}
