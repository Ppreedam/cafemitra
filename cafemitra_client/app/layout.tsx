import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepetiGo",
  description:
    "Cyber cafe automation platform for document printing, passport photos, PDF tools, AI form filling, and agreements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
