"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Filter,
  FileText,
  Home,
  IdCard,
  Image,
  Inbox,
  Landmark,
  LayoutGrid,
  MessageCircle,
  Printer,
  Settings,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { apiFetch, apiUrl, hasStoredSession } from "@/lib/api";
import { DashboardShell } from "../DashboardShell";
import { SkeletonBlock, UiState } from "../UiState";

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

type PrintFilter = "all" | "pass" | "fail";

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

const ORDERS_PER_PAGE = 15;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("Loading orders...");
  const [printFilter, setPrintFilter] = useState<PrintFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const cashApprovalOrders = orders.filter((order) => order.paymentStatus === "cash_counter" && order.status === "awaiting_approval");
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesPrint =
          printFilter === "all" ||
          (printFilter === "pass" && order.status === "printed") ||
          (printFilter === "fail" && order.status === "failed");
        const matchesDate = !dateFilter || getLocalDateInputValue(order.createdAt) === dateFilter;
        return matchesPrint && matchesDate;
      }),
    [dateFilter, orders, printFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safeCurrentPage - 1) * ORDERS_PER_PAGE, safeCurrentPage * ORDERS_PER_PAGE);
  const pageStart = filteredOrders.length ? (safeCurrentPage - 1) * ORDERS_PER_PAGE + 1 : 0;
  const pageEnd = Math.min(safeCurrentPage * ORDERS_PER_PAGE, filteredOrders.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, printFilter]);

  useEffect(() => {
    if (!hasStoredSession()) {
      setMessage("Please login to view order history.");
      return;
    }

    async function loadOrders() {
      try {
        const response = await apiFetch("/api/orders/");
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 401) {
            setMessage("Session expired. Please login again to view orders.");
            return;
          }
          throw new Error(result.message || "Could not load orders.");
        }
        setOrders(result.orders || []);
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load orders.");
      }
    }

    loadOrders();
  }, []);

  return (
    <DashboardShell activePath="/orders">
      <div className="dashboard orders-dashboard">
          <div className="dashboard-hero">
            <div>
              <h1>Order History</h1>
              <p>Manage customer print handover by token.</p>
            </div>
            <span className="status-pill">{orders.length} Orders</span>
          </div>

          {cashApprovalOrders.length ? (
            <section className="cash-approval-panel">
              <div>
                <strong>Cash Counter Approval</strong>
                <p>The Reptigo Windows Agent will ask for cash collection confirmation before printing.</p>
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
                      <span className="order-status awaiting_approval">Waiting for agent</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="panel orders-panel">
            {!message && orders.length ? (
              <div className="orders-toolbar">
                <div className="orders-filter-group" aria-label="Print result filter">
                  <Filter size={16} />
                  <button className={printFilter === "all" ? "active" : ""} type="button" onClick={() => setPrintFilter("all")}>
                    All
                  </button>
                  <button className={printFilter === "pass" ? "active" : ""} type="button" onClick={() => setPrintFilter("pass")}>
                    Pass
                  </button>
                  <button className={printFilter === "fail" ? "active" : ""} type="button" onClick={() => setPrintFilter("fail")}>
                    Fail
                  </button>
                </div>

                <label className="orders-date-filter">
                  <CalendarDays size={16} />
                  <input aria-label="Filter orders by date" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
                </label>

                {(printFilter !== "all" || dateFilter) && (
                  <button className="orders-clear-filter" type="button" onClick={() => {
                    setPrintFilter("all");
                    setDateFilter("");
                  }}>
                    Clear
                  </button>
                )}
              </div>
            ) : null}
            {message ? (
              message === "Loading orders..." ? (
                <div className="orders-state-wrap">
                  <SkeletonBlock lines={5} />
                </div>
              ) : (
                <UiState icon={Inbox} title="Orders unavailable" description={message} tone="danger" />
              )
            ) : null}
            {!message && orders.length === 0 ? <UiState icon={Inbox} title="No orders yet" description="Customer print orders will appear here after they upload or pay." /> : null}
            {!message && orders.length > 0 && filteredOrders.length === 0 ? <UiState icon={Inbox} title="No matching orders" description="Try changing the status or date filter." /> : null}
            {paginatedOrders.length ? (
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
                    {paginatedOrders.map((order) => (
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
            {!message && filteredOrders.length ? (
              <div className="orders-pagination">
                <span>
                  Showing {pageStart}-{pageEnd} of {filteredOrders.length}
                </span>
                <div className="orders-page-actions">
                  <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={safeCurrentPage === 1} aria-label="Previous page">
                    <ChevronLeft size={16} />
                  </button>
                  <strong>
                    Page {safeCurrentPage} of {totalPages}
                  </strong>
                  <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={safeCurrentPage === totalPages} aria-label="Next page">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : null}
          </section>
      </div>
    </DashboardShell>
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

function getLocalDateInputValue(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
