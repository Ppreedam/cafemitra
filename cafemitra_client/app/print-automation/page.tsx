"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { hasStoredSession } from "@/lib/api";

export default function PrintAutomationRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasStoredSession() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="redirect-page">
      <Loader2 size={24} aria-hidden />
      <span>Opening Print Automation...</span>
    </main>
  );
}
