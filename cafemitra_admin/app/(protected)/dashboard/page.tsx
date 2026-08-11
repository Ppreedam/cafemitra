"use client";

import { useEffect, useState } from "react";
import { Store, Printer, Wallet, AlertTriangle, Inbox, Users, IndianRupee, ShoppingCart, TrendingUp, UserPlus } from "lucide-react";
import StatTile from "@/components/StatTile";
import ActivityFeed from "@/components/ActivityFeed";
import Pagination from "@/components/Pagination";
import { fetchOverview, fetchRecentActivity, type ActivityEvent, type OverviewResponse } from "@/lib/api";
import { formatCompactNumber, formatCurrency } from "@/lib/format";

const ACTIVITY_PAGE_SIZE = 15;

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [error, setError] = useState("");
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));

  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [activityCount, setActivityCount] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    fetchOverview({ from, to })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load overview."));
  }, [from, to]);

  useEffect(() => {
    fetchRecentActivity(activityPage, ACTIVITY_PAGE_SIZE)
      .then((res) => {
        setActivity(res.events);
        setActivityCount(res.count);
      })
      .catch((err) => setActivityError(err instanceof Error ? err.message : "Failed to load recent activity."));
  }, [activityPage]);

  if (error) {
    return <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>;
  }

  if (!data) {
    return <p className="text-sm text-slate-500">Loading overview...</p>;
  }

  const stuckOrders = data.orders.stuckAwaitingApproval + data.orders.stuckPhotoJobs;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">Overview</h1>
      <p className="text-sm text-slate-500 mb-6">Platform-wide health across every shop, order, and rupee.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatTile
          icon={Store}
          label="Shops"
          value={formatCompactNumber(data.shops.total)}
          hint={`${data.shops.active} active · ${data.shops.signupsToday} signed up today`}
        />
        <StatTile
          icon={Printer}
          label="Orders this week"
          value={formatCompactNumber(data.orders.week)}
          hint={`${data.orders.today} today`}
        />
        <StatTile
          icon={AlertTriangle}
          label="Stuck orders"
          value={formatCompactNumber(stuckOrders)}
          tone={stuckOrders > 0 ? "critical" : "good"}
          hint={`${data.orders.stuckAwaitingApproval} awaiting approval · ${data.orders.stuckPhotoJobs} photo jobs`}
          href="/orders/stuck"
        />
        <StatTile
          icon={Wallet}
          label="Total wallet balance"
          value={formatCurrency(data.wallet.totalBalance)}
          tone={data.wallet.totalBalance < 0 ? "critical" : "neutral"}
          hint={`${data.wallet.topupsToday} top-ups today (${formatCurrency(data.wallet.topupsTodayAmount)})`}
        />
        <StatTile
          icon={Wallet}
          label="Pending withdrawals"
          value={formatCompactNumber(data.wallet.pendingWithdrawals)}
          tone={data.wallet.pendingWithdrawals > 0 ? "warning" : "good"}
          hint={formatCurrency(data.wallet.pendingWithdrawalsAmount)}
          href="/wallet"
        />
        <StatTile
          icon={Inbox}
          label="Unread support messages"
          value={formatCompactNumber(data.support.unreadMessages)}
          tone={data.support.unreadMessages > 0 ? "warning" : "good"}
          href="/support"
        />
        <StatTile
          icon={Users}
          label="Referral agents"
          value={formatCompactNumber(data.agents.active)}
          hint={`${data.agents.pending} pending approval`}
          href="/agents"
        />
        <StatTile label="Active payment gateway" value={data.activePaymentGateway ?? "None configured"} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-900">Revenue & growth</h2>
        <div className="flex flex-wrap items-end gap-2">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-xs" />
          <span className="text-xs text-slate-400">to</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-xs" />
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => {
                setFrom(isoDaysAgo(days));
                setTo(isoDaysAgo(0));
              }}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile
          icon={IndianRupee}
          label="Net platform revenue"
          value={formatCurrency(data.revenue.netRevenue)}
          tone="good"
          hint={`${formatCurrency(data.revenue.platformFeeRevenue)} fees - ${formatCurrency(data.revenue.commissionsPaid)} commissions`}
        />
        <StatTile
          icon={ShoppingCart}
          label="Orders value (GMV)"
          value={formatCurrency(data.revenue.ordersValue)}
          hint={`${formatCompactNumber(data.revenue.ordersCount)} orders in range`}
        />
        <StatTile
          icon={UserPlus}
          label="New signups"
          value={formatCompactNumber(data.revenue.newSignups)}
          hint="in selected range"
        />
        <StatTile
          icon={TrendingUp}
          label="Top-ups collected"
          value={formatCurrency(data.revenue.topupsAmount)}
          hint={`${formatCompactNumber(data.revenue.topupsCount)} top-ups in range`}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <h2 className="text-sm font-semibold text-slate-900 px-4 pt-4">Recent activity</h2>
        {activityError && <div className="mx-4 mt-2 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{activityError}</div>}
        <div className="px-4">
          <ActivityFeed events={activity} />
        </div>
        <Pagination page={activityPage} pageSize={ACTIVITY_PAGE_SIZE} count={activityCount} onPageChange={setActivityPage} />
      </div>
    </div>
  );
}
