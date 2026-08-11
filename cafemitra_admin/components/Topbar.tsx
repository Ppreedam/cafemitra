"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Zap, Wallet, Inbox, Users, AlertTriangle, Download, UserPlus, History } from "lucide-react";
import { exportOrdersCsv, exportWalletLedgerCsv, type AdminNotifications } from "@/lib/api";

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

export default function Topbar({ notifications }: { notifications: AdminNotifications | null }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const notifRef = useClickOutside(() => setShowNotifications(false));
  const actionsRef = useClickOutside(() => setShowActions(false));

  const totalCount = notifications
    ? notifications.pendingWithdrawals + notifications.unreadMessages + notifications.pendingAgents + notifications.stuckOrders
    : 0;

  const notificationItems = notifications
    ? [
        { count: notifications.pendingWithdrawals, label: "Pending withdrawals", href: "/wallet", icon: Wallet },
        { count: notifications.unreadMessages, label: "Unread support messages", href: "/support", icon: Inbox },
        { count: notifications.pendingAgents, label: "Pending agent approvals", href: "/agents", icon: Users },
        { count: notifications.stuckOrders, label: "Stuck orders", href: "/orders/stuck", icon: AlertTriangle },
      ].filter((item) => item.count > 0)
    : [];

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white flex items-center justify-end gap-2 px-4">
      <div className="relative" ref={actionsRef}>
        <button
          onClick={() => setShowActions((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Quick actions"
        >
          <Zap size={18} />
        </button>
        {showActions && (
          <div className="absolute right-0 mt-2 w-64 rounded-md border border-slate-200 bg-white shadow-lg z-20 py-1">
            <Link
              href="/agents"
              onClick={() => setShowActions(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <UserPlus size={14} /> Onboard referral agent
            </Link>
            <Link
              href="/orders/stuck"
              onClick={() => setShowActions(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <AlertTriangle size={14} /> View stuck orders
            </Link>
            <Link
              href="/activity-log"
              onClick={() => setShowActions(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <History size={14} /> View activity log
            </Link>
            <button
              onClick={() => {
                setShowActions(false);
                exportOrdersCsv();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
            >
              <Download size={14} /> Export orders CSV
            </button>
            <button
              onClick={() => {
                setShowActions(false);
                exportWalletLedgerCsv();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left"
            >
              <Download size={14} /> Export wallet ledger CSV
            </button>
          </div>
        )}
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifications((v) => !v)}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {totalCount > 0 && (
            <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[1rem] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold">
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 rounded-md border border-slate-200 bg-white shadow-lg z-20 py-1">
            {notificationItems.length === 0 && <p className="px-3 py-4 text-sm text-slate-500 text-center">Nothing needs attention.</p>}
            {notificationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setShowNotifications(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Icon size={16} className="text-slate-400" />
                  <span className="flex-1">{item.label}</span>
                  <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
