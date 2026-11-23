import type { Metadata } from "next";

// Unlinked legacy card print page - keeps working for anyone who has the URL,
// but stays out of search results (the public tool is /id-card-print).
// page.tsx is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Card Print | RepetiGo",
  robots: { index: false, follow: true },
};

export default function CardPrintLayout({ children }: { children: React.ReactNode }) {
  return children;
}
