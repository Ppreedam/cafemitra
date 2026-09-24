"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { fetchAdminMe, fetchNotifications, type AdminNotifications, type AdminRoleValue, type AdminUser } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<AdminRoleValue | null>(null);
  const [notifications, setNotifications] = useState<AdminNotifications | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    fetchAdminMe()
      .then((res) => {
        setUser(res.user);
        setRole(res.role);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, [router]);

  function loadNotifications() {
    setNotificationsLoading(true);
    fetchNotifications()
      .then(setNotifications)
      .catch(() => {
        // Notification badges are non-critical - a failed load just skips
        // updating the counts until the admin refreshes again.
      })
      .finally(() => setNotificationsLoading(false));
  }

  // Loaded once on page load only (no background polling) - the admin
  // refreshes manually via the bell icon's refresh button in Topbar.
  useEffect(() => {
    if (checking) return;
    loadNotifications();
  }, [checking]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Checking session...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} role={role} notifications={notifications} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar notifications={notifications} onRefreshNotifications={loadNotifications} notificationsLoading={notificationsLoading} />
        <main className="flex-1 min-w-0 p-6">{children}</main>
      </div>
    </div>
  );
}
