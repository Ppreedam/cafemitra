import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CafeMitra.online",
  description: "Cyber cafe automation platform for documents, printing, and daily operations.",
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
