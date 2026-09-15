"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CopyButton from "@/components/CopyButton";
import Pagination from "@/components/Pagination";
import {
  fetchCustomerDetail,
  fetchCustomerTransactions,
  fetchShopOrders,
  type Customer,
  type CustomerCouponUsed,
  type CustomerTransaction,
  type ShopOrder,
} from "@/lib/api";
import { formatCurrency, orderResultMessage, orderStatusBadgeClass, orderEffectiveStatus } from "@/lib/format";

const TABS = ["Order History", "Wallet History", "Both"] as const;
type Tab = (typeof TABS)[number];

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customerId = Number(id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [couponsUsed, setCouponsUsed] = useState<CustomerCouponUsed[]>([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("Order History");

  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderMeta, setOrderMeta] = useState({ count: 0, pageSize: 20 });
  const [ordersError, setOrdersError] = useState("");

  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [txnPage, setTxnPage] = useState(1);
  const [txnMeta, setTxnMeta] = useState({ count: 0, pageSize: 20 });
  const [txnError, setTxnError] = useState("");

  useEffect(() => {
    fetchCustomerDetail(customerId)
      .then((res) => {
        setCustomer(res.customer);
        setOrderCount(res.orderCount);
        setCouponsUsed(res.couponsUsed);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load customer."));
  }, [customerId]);

  useEffect(() => {
    fetchShopOrders(customerId, { page: orderPage })
      .then((res) => {
        setOrders(res.orders);
        setOrderMeta({ count: res.count, pageSize: res.pageSize });
        setOrdersError("");
      })
      .catch((err) => setOrdersError(err instanceof Error ? err.message : "Failed to load order history."));
  }, [customerId, orderPage]);

  useEffect(() => {
    fetchCustomerTransactions(customerId, { page: txnPage })
      .then((res) => {
        setTransactions(res.transactions);
        setTxnMeta({ count: res.count, pageSize: res.pageSize });
        setTxnError("");
      })
      .catch((err) => setTxnError(err instanceof Error ? err.message : "Failed to load wallet history."));
  }, [customerId, txnPage]);

  if (error) {
    return <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>;
  }

  if (!customer) {
    return <p className="text-sm text-slate-500">Loading customer...</p>;
  }

  return (
    <div>
      <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-3">
        <ArrowLeft size={14} /> Back to customers
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">{customer.fullName || "(unnamed)"}</h1>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mt-3">
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-900 flex items-center gap-1.5">
              <span>{customer.email}</span>
              {customer.email && <CopyButton value={customer.email} />}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="text-slate-900 flex items-center gap-1.5">
              <span>{customer.phone || "-"}</span>
              {customer.phone && <CopyButton value={customer.phone} />}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Wallet amount</dt>
            <dd className={`font-medium ${customer.walletAmount < 0 ? "text-red-600" : "text-slate-900"}`}>
              {formatCurrency(customer.walletAmount)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Address</dt>
            <dd className="text-slate-900">{customer.address || "-"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Joined</dt>
            <dd className="text-slate-900">{new Date(customer.dateJoined).toLocaleDateString("en-IN")}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Last seen</dt>
            <dd className="text-slate-900">
              {customer.lastSeen ? new Date(customer.lastSeen).toLocaleDateString("en-IN") : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Orders generated so far</dt>
            <dd className="text-slate-900 font-medium">{orderCount}</dd>
          </div>
        </dl>

        <div className="border-t border-slate-100 pt-3 mt-1">
          <p className="text-slate-500 text-sm mb-1.5">Coupons used</p>
          {couponsUsed.length === 0 ? (
            <p className="text-sm text-slate-400">No coupons redeemed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {couponsUsed.map((coupon) => (
                <span
                  key={coupon.code}
                  title={new Date(coupon.redeemedAt).toLocaleString("en-IN")}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                >
                  {coupon.code}
                  <span className="text-indigo-400">({formatCurrency(coupon.amount)})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

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

      {(tab === "Order History" || tab === "Both") && (
        <div className={tab === "Both" ? "mb-6" : undefined}>
          {tab === "Both" && <h2 className="text-sm font-semibold text-slate-900 mb-2">Order history</h2>}

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
                      No orders yet.
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
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${orderStatusBadgeClass(orderEffectiveStatus({ order }))}`}>
                        {orderEffectiveStatus({ order })}
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

      {(tab === "Wallet History" || tab === "Both") && (
        <div>
          {tab === "Both" && <h2 className="text-sm font-semibold text-slate-900 mb-2">Wallet history</h2>}

          {txnError && <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{txnError}</div>}

          <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">Kind</th>
                  <th className="px-4 py-2 font-medium">Direction</th>
                  <th className="px-4 py-2 font-medium">Amount</th>
                  <th className="px-4 py-2 font-medium">Note</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      No wallet activity yet.
                    </td>
                  </tr>
                )}
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2 text-slate-700">{txn.kind}</td>
                    <td className="px-4 py-2 text-slate-700">{txn.direction}</td>
                    <td className={`px-4 py-2 font-medium ${txn.direction === "debit" ? "text-red-600" : "text-slate-900"}`}>
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="px-4 py-2 text-slate-500 max-w-xs truncate">{txn.note}</td>
                    <td className="px-4 py-2 text-slate-500">{new Date(txn.createdAt).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={txnPage} pageSize={txnMeta.pageSize} count={txnMeta.count} onPageChange={setTxnPage} />
          </div>
        </div>
      )}
    </div>
  );
}
