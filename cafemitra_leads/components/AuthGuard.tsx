"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchAdminMe } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(pathname !== "/login");

  useEffect(() => {
    if (pathname === "/login") return;
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    fetchAdminMe()
      .then(() => setChecking(false))
      .catch(() => router.replace("/login"));
  }, [pathname, router]);

  if (pathname !== "/login" && checking) {
    return <div className="p-6 text-sm text-slate-500">Checking session...</div>;
  }

  return <>{children}</>;
}
