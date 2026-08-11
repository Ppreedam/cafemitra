"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { fetchAdminMe, fetchNotifications, type AdminNotifications, type AdminRoleValue, type AdminUser } from "@/lib/api";
import { getToken } from "@/lib/auth";

const NOTIFICATION_POLL_MS = 30000;

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<AdminRoleValue | null>(null);
  const [notifications, setNotifications] = useState<AdminNotifications | null>(null);
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

  useEffect(() => {
    if (checking) return;
    function poll() {
      fetchNotifications()
        .then(setNotifications)
        .catch(() => {
          // Notification badges are non-critical - a transient poll failure
          // (e.g. a slow request) shouldn't surface an error to the admin,
          // it just skips updating the counts until the next poll.
        });
    }
    poll();
    const interval = setInterval(poll, NOTIFICATION_POLL_MS);
    return () => clearInterval(interval);
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
      <div className="flex-1 flex flex-col">
        <Topbar notifications={notifications} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
