import type { Metadata } from "next";

// Admin support login link (token in the URL hash) - never index it.
// page.tsx is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Signing in | RepetiGo",
  robots: { index: false, follow: false },
};

export default function ImpersonateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
