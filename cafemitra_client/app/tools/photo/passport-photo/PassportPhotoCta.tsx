"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { hasStoredSession } from "@/lib/api";

export function PassportPhotoCta({ label, className }: { label: string; className?: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(hasStoredSession());
  }, []);

  const href = isLoggedIn ? "/passport-photo" : `/login?next=${encodeURIComponent("/passport-photo")}`;

  return (
    <Link className={className} href={href}>
      {label} <ArrowRight size={18} aria-hidden />
    </Link>
  );
}
