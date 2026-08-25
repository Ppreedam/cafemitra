"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens } from "@/lib/auth";
import type { AdminNotifications, AdminRoleValue, AdminUser } from "@/lib/api";

// Mirrors the backend's SECTION_ROLES in admin_auth.py - kept here only to
// decide what to SHOW; the real enforcement is server-side, so a mismatch
// here is a UX bug (wrong link visible/hidden), never a security hole.
const SECTION_ROLES: Record<string, AdminRoleValue[]> = {
  shops: ["finance", "support"],
  orders: ["support"],
  wallet: ["finance"],
  agents: ["finance", "sales"],
  coupons: ["finance"],
  support: ["support"],
  leads: ["sales"],
  print_agent: ["support"],
  analytics: ["finance", "sales"],
  activity_log: [],
  security: [],
  staff: [],
};

type NavLink = {
  href: string;
  label: string;
  section: string | null;
  badgeKey?: keyof AdminNotifications;
  children?: NavLink[];
};

const links: NavLink[] = [
  { href: "/dashboard", label: "Overview", section: null },
  { href: "/analytics", label: "Analytics", section: "analytics" },
  { href: "/shops", label: "Shops", section: "shops" },
  { href: "/orders", label: "Orders", section: "orders" },
  { href: "/wallet", label: "Wallet & Finance", section: "wallet", badgeKey: "pendingWithdrawals" },
  { href: "/agents", label: "Referral Agents", section: "agents", badgeKey: "pendingAgents" },
  { href: "/coupons", label: "Coupon Codes", section: "coupons" },
  { href: "/support", label: "Support Inbox", section: "support", badgeKey: "unreadMessages" },
  {
    href: "/leads",
    label: "Leads CRM",
    section: "leads",
    children: [
      { href: "/leads/pipeline", label: "Pipeline", section: "leads" },
      { href: "/leads/queue", label: "Scrape Queue", section: "leads" },
    ],
  },
  { href: "/print-agent", label: "Print Agent", section: "print_agent" },
  { href: "/security", label: "Security Alerts", section: "security" },
  { href: "/activity-log", label: "Activity Log", section: "activity_log" },
  { href: "/staff", label: "Staff & Roles", section: "staff" },
];

function canSeeSection(role: AdminRoleValue | null, section: string | null) {
  if (!section) return true;
  if (!role) return false;
  if (role === "super_admin") return true;
  return (SECTION_ROLES[section] || []).includes(role);
}

export default function Sidebar({
  user,
  role,
  notifications,
}: {
  user: AdminUser | null;
  role: AdminRoleValue | null;
  notifications: AdminNotifications | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearTokens();
    router.replace("/login");
  }

  const visibleLinks = links.filter((link) => canSeeSection(role, link.section));

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white min-h-screen flex flex-col">
      <div className="h-14 flex items-center px-4 border-b border-slate-200">
        <span className="font-semibold text-slate-900">
          RepetiGo <span className="text-indigo-600">Admin</span>
        </span>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-1">
        {visibleLinks.map((link) => {
          const active = pathname?.startsWith(link.href);
          const count = link.badgeKey && notifications ? notifications[link.badgeKey] : 0;
          return (
            <div key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition ${
                  active && !link.children ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{link.label}</span>
                {count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-red-600 text-white text-xs font-semibold">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </Link>
              {link.children && (
                <div className="ml-3 border-l border-slate-200 pl-2 mt-1 space-y-0.5">
                  {link.children.map((child) => {
                    const childActive = pathname?.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-1.5 rounded-md text-sm transition ${
                          childActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="px-4 py-3 border-t border-slate-200">
        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
        {role && <p className="text-xs text-slate-400 mb-2 capitalize">{role.replace("_", " ")}</p>}
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-slate-600 hover:text-red-600 transition"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
