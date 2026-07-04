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
import { DashboardShell } from "../DashboardShell";

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
  { label: "", items: [{ name: "Dashboard", icon: Home, href: "/dashboard" }] },
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
      { name: "Analytics", icon: BarChart3, href: "/analytics", active: true },
      { name: "Reports", icon: FileText },
    ],
  },
];

const orders = [
  ["#ORD1256", "PrintPilot", "Rahul Kumar", "Rs. 20", "Printed", "10:30 AM", "#42b98e"],
  ["#ORD1255", "WhatsApp Print", "Pooja Singh", "Rs. 15", "Printing", "10:29 AM", "#6d63df"],
  ["#ORD1254", "Passport Photo", "Aman Verma", "Rs. 30", "Completed", "10:22 AM", "#4a9dec"],
  ["#ORD1253", "ID Card Print", "Vikash Yadav", "Rs. 40", "Pending", "10:20 AM", "#ff9a52"],
  ["#ORD1252", "Document Service", "Neha Gupta", "Rs. 25", "Failed", "10:15 AM", "#e9546a"],
];

const topServices = [
  ["PrintPilot", "18 (42.9%)", "#6d63df"],
  ["Document Services", "10 (23.8%)", "#4a9dec"],
  ["WhatsApp Print", "7 (16.7%)", "#42b98e"],
  ["ID Card Print", "5 (11.9%)", "#ff9a52"],
  ["Passport Photo", "2 (4.8%)", "#e95c8d"],
];

export default function AnalyticsPage() {
  return (
    <DashboardShell activePath="/analytics">
      <div className="dashboard">
          <div className="dashboard-hero">
            <div>
              <h1>Analytics</h1>
              <p>Review orders, revenue trends, and top performing services.</p>
            </div>
            <span className="status-pill">Updated Today</span>
          </div>

          <section className="content-grid analytics-grid">
            <article className="panel">
              <div className="section-title-row">
                <h2>Recent Orders</h2>
                <Link className="mini-link" href="#">
                  View All Orders
                </Link>
              </div>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Service</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(([id, service, customer, amount, status, time, color]) => (
                    <tr key={id}>
                      <td>{id}</td>
                      <td>{service}</td>
                      <td>{customer}</td>
                      <td>{amount}</td>
                      <td>
                        <span className="tag" style={{ "--tag-color": color } as React.CSSProperties}>
                          {status}
                        </span>
                      </td>
                      <td>{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>

            <article className="panel">
              <div className="section-title-row">
                <div>
                  <h2>Revenue Overview</h2>
                  <div className="metric-value">Rs. 8,450</div>
                  <div className="metric-meta">+22.5% vs last week</div>
                </div>
                <Link className="btn" href="#">
                  This Week <ChevronDown size={15} />
                </Link>
              </div>
              <div className="chart-bars" aria-label="Weekly revenue chart">
                {[35, 52, 43, 61, 82, 68, 40].map((height, index) => (
                  <span key={index} style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="chart-days">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </article>

            <article className="panel">
              <h2>Top Services</h2>
              <div className="donut-wrap">
                <div className="donut">
                  <div className="donut-center">
                    42
                    <small>Total Orders</small>
                  </div>
                </div>
                <div className="legend">
                  {topServices.map(([name, value, color]) => (
                    <span key={name}>
                      <i style={{ "--legend-color": color } as React.CSSProperties} />
                      {name}
                      <strong>{value}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </section>
      </div>
    </DashboardShell>
  );
}
