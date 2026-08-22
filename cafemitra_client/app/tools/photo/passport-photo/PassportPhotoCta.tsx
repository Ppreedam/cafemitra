import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PassportPhotoCta({ label, className }: { label: string; className?: string }) {
  return (
    <Link className={className} href="/passport-photo">
      {label} <ArrowRight size={18} aria-hidden />
    </Link>
  );
}
