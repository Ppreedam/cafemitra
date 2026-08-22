"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdjustBalanceModal from "@/components/AdjustBalanceModal";
import DeleteShopModal from "@/components/DeleteShopModal";
import Pagination from "@/components/Pagination";
import { useRouter } from "next/navigation";
import {
  deleteShop,
  fetchActivityLog,
  fetchShopDetail,
  fetchShopOrders,
  impersonateShop,
  sendShopPasswordReset,
  setShopActive,
  updateShop,
  type AdminActivityLogEntry,
  type ShopDetailResponse,
  type ShopOrder,
} from "@/lib/api";
import { formatCurrency, orderResultMessage, orderStatusBadgeClass } from "@/lib/format";

const TABS = ["Profile", "Orders", "Wallet", "Pricing", "Timeline"] as const;
type Tab = (typeof TABS)[number];

const ORDER_STATUSES = ["", "awaiting_payment", "awaiting_approval", "queued", "printing", "printed", "failed"];

type PriceItem = { id?: string; label?: string; rate?: number };

function humanizeSettingKey(key: string): string {
  const withSpaces = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function formatSettingValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

type TimelineEvent = {
  key: string;
  type: "order" | "wallet" | "admin_action";
  label: string;
  detail: string;
  createdAt: string;
};

export default function ShopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const shopId = Number(id);
  const router = useRouter();

  const [data, setData] = useState<ShopDetailResponse | null>(null);
  const [tab, setTab] = useState<Tab>("Profile");
  const [error, setError] = useState("");
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [creditLimitInput, setCreditLimitInput] = useState("");
  const [cashCounterInput, setCashCounterInput] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [activityLog, setActivityLog] = useState<AdminActivityLogEntry[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [orderFrom, setOrderFrom] = useState("");
  const [orderTo, setOrderTo] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [orderMeta, setOrderMeta] = useState({ count: 0, pageSize: 20 });
  const [ordersError, setOrdersError] = useState("");

  function updateOrderFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setOrderPage(1);
    };
  }

  useEffect(() => {
    if (tab !== "Orders") return;
    fetchShopOrders(shopId, { status: orderStatusFilter, from: orderFrom, to: orderTo, page: orderPage })
      .then((res) => {
        setOrders(res.orders);
        setOrderMeta({ count: res.count, pageSize: res.pageSize });
        setOrdersError("");
      })
      .catch((err) => setOrdersError(err instanceof Error ? err.message : "Failed to load orders."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, shopId, orderStatusFilter, orderFrom, orderTo, orderPage]);

  function load() {
    fetchShopDetail(shopId)
      .then((res) => {
        setData(res);
        setCreditLimitInput(res.shop.creditLimitOverride === null ? "" : String(res.shop.creditLimitOverride));
        setCashCounterInput(res.shop.cashCounterPermitted);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load shop."));
    fetchActivityLog({ targetType: "shop", targetId: String(shopId) })
      .then((res) => setActivityLog(res.logs))
      .catch(() => {
        // Timeline is a convenience view - a failed activity-log fetch
        // shouldn't block the rest of the shop detail page from working.
      });
  }

  useEffect(load, [shopId]);

  const timelineEvents: TimelineEvent[] = data
    ? [
        ...data.recentOrders.map((order) => ({
          key: `order-${order.id}`,
          type: "order" as const,
          label: `Order ${order.orderNumber} - ${order.serviceName}`,
          detail: `${order.status} - ${formatCurrency(order.totalAmount)}`,
          createdAt: order.createdAt,
        })),
        ...data.recentTransactions.map((txn) => ({
          key: `wallet-${txn.id}`,
          type: "wallet" as const,
          label: `${txn.kind} (${txn.direction})`,
          detail: `${formatCurrency(txn.amount)}${txn.note ? ` - ${txn.note}` : ""}`,
          createdAt: txn.createdAt,
        })),
        ...activityLog.map((log) => ({
          key: `admin-${log.id}`,
          type: "admin_action" as const,
          label: `${log.action} by ${log.adminEmail}`,
          detail: log.detail,
          createdAt: log.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await updateShop(shopId, {
        creditLimitOverride: creditLimitInput.trim() === "" ? null : Number(creditLimitInput),
        cashCounterPermitted: cashCounterInput,
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!data) return;
    try {
      await setShopActive(shopId, !data.shop.isActive);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  }

  async function handleSendPasswordReset() {
    setActionMessage("");
    try {
      const res = await sendShopPasswordReset(shopId);
      setActionMessage(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    }
  }

  async function handleImpersonate() {
    if (!window.confirm("This opens the cafe-owner dashboard as this shop, in a new tab. Logged in the activity log. Continue?")) {
      return;
    }
    try {
      await impersonateShop(shopId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start impersonation.");
    }
  }

  if (error) {
    return <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>;
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Loading shop...</p>;
  }

  return (
    <div>
      <Link href="/shops" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-3">
        <ArrowLeft size={14} /> Back to shops
      </Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{data.shop.shopName || "(unnamed shop)"}</h1>
          <p className="text-sm text-slate-500">
            {data.shop.fullName} · {data.shop.email} · {data.shop.phone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              data.shop.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {data.shop.isActive ? "Active" : "Suspended"}
          </span>
          <button
            onClick={handleSendPasswordReset}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Send password reset
          </button>
          <button
            onClick={handleImpersonate}
            className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-100"
          >
            Impersonate
          </button>
          <button
            onClick={handleToggleActive}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            {data.shop.isActive ? "Suspend" : "Reactivate"}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>

      {actionMessage && <div className="mb-4 rounded-md bg-green-50 text-green-700 text-sm px-3 py-2">{actionMessage}</div>}

      <div className="border-b border-slate-200 mb-4 flex gap-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Profile" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 max-w-xl">
          <dl className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <dt className="text-slate-500">Address</dt>
              <dd className="text-slate-900">{data.profile.address || "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">City / State</dt>
              <dd className="text-slate-900">
                {data.profile.city || "-"} {data.profile.state && `, ${data.profile.state}`}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Mobile</dt>
              <dd className="text-slate-900">{data.profile.mobile || "-"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">WhatsApp</dt>
              <dd className="text-slate-900">{data.profile.whatsapp || "-"}</dd>
            </div>
          </dl>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-medium text-slate-700 mb-1">Credit limit override (Rs.)</label>
            <input
              type="number"
              value={creditLimitInput}
              onChange={(e) => setCreditLimitInput(e.target.value)}
              placeholder="Leave blank to use platform default"
              className="w-full mb-3 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="flex items-center gap-2 text-sm text-slate-700 mb-4">
              <input
                type="checkbox"
                checked={cashCounterInput}
                onChange={(e) => setCashCounterInput(e.target.checked)}
              />
              Cash Counter permitted
            </label>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}

      {tab === "Orders" && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select
              value={orderStatusFilter}
              onChange={(e) => updateOrderFilter(setOrderStatusFilter)(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s || "All status"}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1 text-xs text-slate-500">
              From
              <input
                type="date"
                value={orderFrom}
                onChange={(e) => updateOrderFilter(setOrderFrom)(e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700"
              />
            </label>
            <label className="flex items-center gap-1 text-xs text-slate-500">
              To
              <input
                type="date"
                value={orderTo}
                onChange={(e) => updateOrderFilter(setOrderTo)(e.target.value)}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-700"
              />
            </label>
            {(orderStatusFilter || orderFrom || orderTo) && (
              <button
                onClick={() => {
                  setOrderStatusFilter("");
                  setOrderFrom("");
                  setOrderTo("");
                  setOrderPage(1);
                }}
                className="text-xs text-indigo-700 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {ordersError && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{ordersError}</div>}

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">Order</th>
                  <th className="px-4 py-2 font-medium">Service</th>
                  <th className="px-4 py-2 font-medium">Amount</th>
                  <th className="px-4 py-2 font-medium">Payment</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Result / Message</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                      {orderStatusFilter || orderFrom || orderTo ? "No orders match these filters." : "No orders yet."}
                    </td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2">
                      <Link href={`/orders/${order.id}`} className="font-medium text-indigo-700 hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-700">{order.serviceName}</td>
                    <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-2 text-slate-700">
                      {order.paymentMode} <span className="text-xs text-slate-400">({order.paymentStatus})</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 max-w-xs truncate text-slate-600" title={orderResultMessage({ order })}>
                      {orderResultMessage({ order })}
                    </td>
                    <td className="px-4 py-2 text-slate-500">{new Date(order.createdAt).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={orderPage} pageSize={orderMeta.pageSize} count={orderMeta.count} onPageChange={setOrderPage} />
          </div>
        </div>
      )}

      {tab === "Wallet" && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Current balance</p>
              <p className={`text-lg font-semibold ${data.shop.balance < 0 ? "text-red-600" : "text-slate-900"}`}>
                {formatCurrency(data.shop.balance)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Online collected</p>
              <p className="text-lg font-semibold text-slate-900">{formatCurrency(data.walletSummary.onlineCollected)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Cash counter collected</p>
              <p className="text-lg font-semibold text-slate-900">{formatCurrency(data.walletSummary.cashCounterCollected)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Net withdrawable</p>
              <p className="text-lg font-semibold text-slate-900">{formatCurrency(data.walletSummary.netWithdrawable)}</p>
            </div>
          </div>

          <div className="mb-3">
            <button
              onClick={() => setShowAdjustModal(true)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Adjust balance
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">Kind</th>
                  <th className="px-4 py-2 font-medium">Direction</th>
                  <th className="px-4 py-2 font-medium">Amount</th>
                  <th className="px-4 py-2 font-medium">Balance after</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      No wallet activity yet.
                    </td>
                  </tr>
                )}
                {data.recentTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 text-slate-700">{txn.kind}</td>
                    <td className="px-4 py-2 text-slate-700">{txn.direction}</td>
                    <td className="px-4 py-2 text-slate-900 font-medium">{formatCurrency(txn.amount)}</td>
                    <td className="px-4 py-2 text-slate-700">{txn.balanceAfter !== null ? formatCurrency(txn.balanceAfter) : "-"}</td>
                    <td className="px-4 py-2 text-slate-500 max-w-xs truncate">{txn.note}</td>
                    <td className="px-4 py-2 text-slate-500">{new Date(txn.createdAt).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Pricing" && (
        <div className="space-y-3">
          {data.pricing.length === 0 && <p className="text-sm text-slate-500">No pricing configured yet.</p>}
          {data.pricing.map((item) => {
            const settings = item.settings || {};
            const priceItems = Array.isArray(settings.priceItems) ? (settings.priceItems as PriceItem[]) : [];
            const paymentMode = typeof settings.paymentMode === "string" ? settings.paymentMode : "";
            const otherEntries = Object.entries(settings).filter(([key]) => key !== "priceItems" && key !== "paymentMode");

            return (
              <div key={item.serviceKey} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">{item.serviceName}</h3>
                  {paymentMode && (
                    <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {paymentMode}
                    </span>
                  )}
                </div>

                {priceItems.length > 0 ? (
                  <table className="w-full text-sm mb-3">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-500">
                        <th className="py-1.5 font-medium">Item</th>
                        <th className="py-1.5 font-medium">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceItems.map((priceItem, index) => (
                        <tr key={priceItem.id ?? index} className="border-b border-slate-100 last:border-0">
                          <td className="py-1.5 text-slate-700">{priceItem.label || priceItem.id || "-"}</td>
                          <td className="py-1.5 text-slate-900 font-medium">
                            {typeof priceItem.rate === "number" ? formatCurrency(priceItem.rate) : formatSettingValue(priceItem.rate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-slate-500 mb-3">No price items configured.</p>
                )}

                {otherEntries.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-x-4 gap-y-1">
                    {otherEntries.map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500">{humanizeSettingKey(key)}</span>
                        <span className="text-slate-700 truncate">{formatSettingValue(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "Timeline" && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {timelineEvents.length === 0 && <p className="p-4 text-sm text-slate-500">No activity recorded yet.</p>}
          <ul className="divide-y divide-slate-100">
            {timelineEvents.map((event) => (
              <li key={event.key} className="flex items-start gap-3 px-4 py-3">
                <span
                  className={`mt-0.5 inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    event.type === "order"
                      ? "bg-indigo-50 text-indigo-700"
                      : event.type === "wallet"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {event.type === "order" ? "Order" : event.type === "wallet" ? "Wallet" : "Admin"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900">{event.label}</p>
                  <p className="text-xs text-slate-500">{event.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{new Date(event.createdAt).toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showAdjustModal && (
        <AdjustBalanceModal
          shopId={shopId}
          onClose={() => setShowAdjustModal(false)}
          onDone={() => {
            setShowAdjustModal(false);
            load();
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteShopModal
          shopId={shopId}
          shopName={data.shop.shopName}
          shopEmail={data.shop.email}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => router.push("/shops")}
        />
      )}
    </div>
  );
}
