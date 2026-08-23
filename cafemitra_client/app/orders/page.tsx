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
  RefreshCw,
  Settings,
  UserRound,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { apiFetch, apiUrl, hasStoredSession } from "@/lib/api";
import { passportAttireLabels } from "@/lib/passport-attire";
import { DashboardShell } from "../DashboardShell";
import { SkeletonBlock, UiState } from "../UiState";

type Order = {
  id: number;
  orderNumber: string;
  tokenId: string;
  serviceKey: string;
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
  attireCategory?: string;
  geminiPhoto?: string;
  hasRawPhoto?: boolean;
  hasGeminiPhoto?: boolean;
  photoStatus?: string;
  photoErrorMessage?: string;
  passportPrompt?: string;
  createdAt: string;
};

type PrintFilter = "all" | "pass" | "fail" | "passport_queue";

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
      { name: "Service Credits & Settlement", icon: Wallet, href: "#" },
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
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null);
  const [cashActionId, setCashActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [compareOrder, setCompareOrder] = useState<Order | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const cashApprovalOrders = orders.filter((order) => order.paymentStatus === "cash_counter" && order.status === "awaiting_approval");
  const passportQueuedCount = orders.filter((order) => order.serviceKey === "passport_photo" && order.status === "queued").length;
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesPrint =
          printFilter === "all" ||
          (printFilter === "pass" && order.status === "printed") ||
          (printFilter === "fail" && order.status === "failed") ||
          (printFilter === "passport_queue" && order.serviceKey === "passport_photo" && order.status === "queued");
        const orderDate = getLocalDateInputValue(order.createdAt);
        const matchesDate = (!dateFrom || orderDate >= dateFrom) && (!dateTo || orderDate <= dateTo);
        return matchesPrint && matchesDate;
      }),
    [dateFrom, dateTo, orders, printFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice((safeCurrentPage - 1) * ORDERS_PER_PAGE, safeCurrentPage * ORDERS_PER_PAGE);
  const pageStart = filteredOrders.length ? (safeCurrentPage - 1) * ORDERS_PER_PAGE + 1 : 0;
  const pageEnd = Math.min(safeCurrentPage * ORDERS_PER_PAGE, filteredOrders.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo, printFilter]);

  async function loadOrders(options: { silent?: boolean } = {}) {
    if (!hasStoredSession()) {
      setMessage("Please login to view order history.");
      return;
    }

    if (options.silent) {
      setIsRefreshing(true);
    } else {
      setMessage("Loading orders...");
    }

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
    } finally {
      if (options.silent) setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markOrderPaid(orderId: number) {
    setMarkingPaidId(orderId);
    setActionError("");
    try {
      const response = await apiFetch(`/api/orders/${orderId}/mark-paid/`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not mark this order as paid.");
      setOrders((current) => current.map((order) => (order.id === orderId ? result.order : order)));
      // Narrow update only - the compare modal's order carries base64 image
      // payloads the list-style mark-paid response omits, so a full spread
      // would wipe the photos already shown.
      setCompareOrder((current) =>
        current && current.id === orderId ? { ...current, paymentStatus: result.order.paymentStatus, status: result.order.status } : current,
      );
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not mark this order as paid.");
    } finally {
      setMarkingPaidId(null);
    }
  }

  async function respondToCashOrder(orderId: number, approve: boolean) {
    setCashActionId(orderId);
    setActionError("");
    try {
      const response = await apiFetch(`/api/orders/${orderId}/${approve ? "approve-cash" : "reject-cash"}/`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || `Could not ${approve ? "approve" : "reject"} this order.`);
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, ...result.order } : order)));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : `Could not ${approve ? "approve" : "reject"} this order.`);
    } finally {
      setCashActionId(null);
    }
  }

  async function markToolOrderPaid(orderId: number, endpoint: string) {
    setMarkingPaidId(orderId);
    setActionError("");
    try {
      const response = await apiFetch(endpoint, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not mark this order as paid.");
      // The resume/biodata endpoints return their own summary shape, not
      // public_order() - patch just paymentStatus rather than overwriting the whole row.
      setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, paymentStatus: result.paymentStatus } : order)));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not mark this order as paid.");
    } finally {
      setMarkingPaidId(null);
    }
  }

  async function openCompare(order: Order) {
    // The list response omits the base64 photo payloads to keep /api/orders/
    // fast - fetch the single order here to get the actual image data.
    setCompareOrder(order);
    setCompareLoading(true);
    try {
      const response = await apiFetch(`/api/orders/${order.id}/`);
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.order) {
        setCompareOrder(result.order);
      }
    } finally {
      setCompareLoading(false);
    }
  }

  return (
    <DashboardShell activePath="/orders">
      <div className="dashboard orders-dashboard">
          <div className="dashboard-hero">
            <div>
              <h1>Order History</h1>
              <p>Manage customer print handover by token.</p>
            </div>
            <div className="orders-hero-actions">
              <button
                type="button"
                className="orders-refresh-btn"
                onClick={() => loadOrders({ silent: true })}
                disabled={isRefreshing}
                aria-label="Refresh orders"
                title="Refresh orders"
              >
                <RefreshCw size={16} className={isRefreshing ? "spinning" : ""} /> {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <span className="status-pill">{orders.length} Orders</span>
            </div>
          </div>

          {cashApprovalOrders.length ? (
            <section className="cash-approval-panel">
              <div>
                <strong>Cash Counter Approval</strong>
                <p>
                  Confirm you&apos;ve collected cash for these before they&apos;re processed - for document print, the desktop Print
                  Agent also asks for this; passport photo can only be approved here.
                </p>
              </div>
              <div className="cash-approval-list">
                {cashApprovalOrders.map((order) => (
                  <article className="cash-approval-card" key={order.id}>
                    <div>
                      <span className="token-pill">{order.tokenId}</span>
                      <strong>{order.fileName || order.serviceName || order.orderNumber}</strong>
                      <small>
                        {order.pages} x {order.copies} pages | Rs. {order.totalAmount}
                      </small>
                    </div>
                    <div className="cash-approval-actions">
                      <button
                        type="button"
                        disabled={cashActionId === order.id}
                        onClick={() => respondToCashOrder(order.id, true)}
                      >
                        {cashActionId === order.id ? "..." : "Approve"}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        disabled={cashActionId === order.id}
                        onClick={() => respondToCashOrder(order.id, false)}
                      >
                        Reject
                      </button>
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

                <div className="orders-date-filter">
                  <CalendarDays size={16} />
                  <input
                    aria-label="Filter orders from date"
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(event) => setDateFrom(event.target.value)}
                  />
                  <span className="orders-date-filter-sep">to</span>
                  <input
                    aria-label="Filter orders to date"
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(event) => setDateTo(event.target.value)}
                  />
                </div>

                <button
                  className={`orders-passport-queue-filter${printFilter === "passport_queue" ? " active" : ""}`}
                  type="button"
                  onClick={() => setPrintFilter(printFilter === "passport_queue" ? "all" : "passport_queue")}
                >
                  <IdCard size={16} /> Passport Queue
                  {passportQueuedCount > 0 ? <span className="orders-filter-badge">{passportQueuedCount}</span> : null}
                </button>

                {(printFilter !== "all" || dateFrom || dateTo) && (
                  <button className="orders-clear-filter" type="button" onClick={() => {
                    setPrintFilter("all");
                    setDateFrom("");
                    setDateTo("");
                  }}>
                    Clear
                  </button>
                )}
              </div>
            ) : null}
            {actionError ? <div className="profile-alert error orders-action-error">{actionError}</div> : null}
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
                          {order.attireCategory ? <small>{passportAttireLabels[order.attireCategory] || order.attireCategory}</small> : null}
                        </td>
                        <td>
                          {order.serviceKey === "passport_photo" ? (
                            order.hasRawPhoto ? (
                              <button type="button" className="orders-file-link" onClick={() => openCompare(order)}>
                                {order.fileName || "Document"}
                              </button>
                            ) : null
                          ) : order.serviceKey === "resume_builder" ? (
                            <Link href={`/resume-builder/build?savedId=${order.id}`} className="orders-print-link">
                              <FileText size={14} /> Open
                            </Link>
                          ) : order.serviceKey === "biodata_maker" ? (
                            <Link href={`/biodata-maker/build?savedId=${order.id}`} className="orders-print-link">
                              <FileText size={14} /> Open
                            </Link>
                          ) : order.fileUrl ? (
                            <a href={apiUrl(order.fileUrl)} target="_blank" rel="noreferrer">
                              {order.fileName || "Document"}
                            </a>
                          ) : null}
                          {order.serviceKey === "passport_photo" && order.photoStatus === "failed" ? (
                            <small className="order-status failed">{friendlyPhotoErrorMessage(order)}</small>
                          ) : order.serviceKey === "passport_photo" && !order.hasGeminiPhoto ? (
                            <small>Passport photo processing...</small>
                          ) : null}
                        </td>
                        <td>{order.pages} x {order.copies}</td>
                        <td>Rs. {order.totalAmount}</td>
                        <td>
                          <span className={`order-status ${order.paymentStatus}`}>{formatStatus(order.paymentStatus)}</span>
                          {order.serviceKey === "passport_photo" && order.paymentStatus === "no_payment" ? (
                            <button
                              type="button"
                              className="orders-mark-paid-link"
                              disabled={markingPaidId === order.id}
                              onClick={() => markOrderPaid(order.id)}
                            >
                              {markingPaidId === order.id ? "Marking..." : "Mark as Paid"}
                            </button>
                          ) : order.serviceKey === "resume_builder" && order.paymentMode === "Cash" && order.paymentStatus === "no_payment" ? (
                            <button
                              type="button"
                              className="orders-mark-paid-link"
                              disabled={markingPaidId === order.id}
                              onClick={() => markToolOrderPaid(order.id, `/api/tools/resume-builder/saved/${order.id}/mark-paid/`)}
                            >
                              {markingPaidId === order.id ? "Marking..." : "Mark as Paid"}
                            </button>
                          ) : order.serviceKey === "biodata_maker" && order.paymentMode === "Cash" && order.paymentStatus === "no_payment" ? (
                            <button
                              type="button"
                              className="orders-mark-paid-link"
                              disabled={markingPaidId === order.id}
                              onClick={() => markToolOrderPaid(order.id, `/api/tools/biodata-maker/saved/${order.id}/mark-paid/`)}
                            >
                              {markingPaidId === order.id ? "Marking..." : "Mark as Paid"}
                            </button>
                          ) : null}
                        </td>
                        <td>
                          <span className={`order-status ${order.status}`}>{formatStatus(order.status)}</span>
                          {order.serviceKey === "passport_photo" && order.status === "queued" && order.paymentStatus === "paid" ? (
                            <Link href={`/passport-photo?orderId=${order.id}`} className="orders-print-link">
                              <Printer size={14} /> Print
                            </Link>
                          ) : null}
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

      {compareOrder ? (
        <div className="document-preview-modal" role="dialog" aria-modal="true" aria-label="Compare passport photos" onClick={() => setCompareOrder(null)}>
          <div className="document-preview-window passport-compare-window" onClick={(event) => event.stopPropagation()}>
            <div className="document-preview-head">
              <div>
                <strong>{compareOrder.fileName || "Passport Photo"}</strong>
                <span>{compareOrder.tokenId}</span>
              </div>
              <button type="button" onClick={() => setCompareOrder(null)} aria-label="Close preview">
                <X size={18} />
              </button>
            </div>
            <div className="passport-compare-body">
              <div className="passport-compare-pane">
                <span>Raw Photo</span>
                {compareLoading ? (
                  <div className="passport-compare-spinner"><span className="passport-compare-spinner-ring" /></div>
                ) : compareOrder.fileUrl ? (
                  <img src={apiUrl(compareOrder.fileUrl)} alt="Raw upload" />
                ) : (
                  <p>Not available</p>
                )}
              </div>
              <div className="passport-compare-pane">
                <span>Your Passport Photo</span>
                {compareLoading ? (
                  <div className="passport-compare-spinner"><span className="passport-compare-spinner-ring" /></div>
                ) : compareOrder.geminiPhoto ? (
                  <img src={apiUrl(compareOrder.geminiPhoto)} alt="AI generated passport photo" />
                ) : compareOrder.photoStatus === "failed" ? (
                  <div className="passport-compare-empty">
                    <span className="order-status failed">{friendlyPhotoErrorMessage(compareOrder)}</span>
                  </div>
                ) : (
                  <p>Passport photo processing...</p>
                )}
              </div>
            </div>
            {compareOrder.paymentStatus === "no_payment" || (compareOrder.status === "queued" && compareOrder.paymentStatus === "paid") ? (
              <div className="passport-compare-actions">
                {compareOrder.paymentStatus === "no_payment" ? (
                  <button
                    type="button"
                    className="btn"
                    disabled={markingPaidId === compareOrder.id}
                    onClick={() => markOrderPaid(compareOrder.id)}
                  >
                    <Wallet size={16} /> {markingPaidId === compareOrder.id ? "Marking..." : "Mark as Paid"}
                  </button>
                ) : null}
                {compareOrder.status === "queued" && compareOrder.paymentStatus === "paid" ? (
                  <Link href={`/passport-photo?orderId=${compareOrder.id}`} className="btn btn-primary">
                    <Printer size={16} /> Print
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}

function friendlyPhotoErrorMessage(order: Order) {
  const message = (order.photoErrorMessage || "").trim();
  // Older/edge-case failures can carry a raw server error page or .NET
  // exception text instead of a short message - fall back to the service
  // title rather than showing that.
  if (!message || message.length > 200 || message.includes("<") || message.startsWith("HTTP ") || message.startsWith("Response status code")) {
    return `${order.serviceName || "Passport Size Photo"} failed`;
  }
  return message;
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
