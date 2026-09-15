"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import Pagination from "@/components/Pagination";
import { fetchCustomers, type Customer } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const PAGE_SIZE = 20;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [count, setCount] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetchCustomers({ search, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setCustomers(res.customers);
        setCount(res.count);
        setPageSize(res.pageSize);
        setError("");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load customers."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Customers</h1>
      <p className="text-sm text-slate-500 mb-4">{count} customers on the platform.</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={(e) => updateSearch(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Phone</th>
              <th className="px-4 py-2 font-medium">Wallet amount</th>
              <th className="px-4 py-2 font-medium">Orders</th>
              <th className="px-4 py-2 font-medium">Address</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                  No customers match these filters.
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium">
                  <Link href={`/customers/${customer.id}`} className="text-indigo-700 hover:underline">
                    {customer.fullName || "-"}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span>{customer.email}</span>
                    {customer.email && <CopyButton value={customer.email} />}
                  </div>
                </td>
                <td className="px-4 py-2 text-slate-700">
                  {customer.phone ? (
                    <div className="flex items-center gap-1.5">
                      <span>{customer.phone}</span>
                      <CopyButton value={customer.phone} />
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className={`px-4 py-2 font-medium ${customer.walletAmount < 0 ? "text-red-600" : "text-slate-900"}`}>
                  {formatCurrency(customer.walletAmount)}
                </td>
                <td className="px-4 py-2 text-slate-900 font-medium">{customer.orderCount}</td>
                <td className="px-4 py-2 text-slate-700">{customer.address || "-"}</td>
                <td className="px-4 py-2 text-slate-500">{new Date(customer.dateJoined).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-2 text-slate-500">
                  {customer.lastSeen ? new Date(customer.lastSeen).toLocaleDateString("en-IN") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} count={count} onPageChange={setPage} />
      </div>
    </div>
  );
}
