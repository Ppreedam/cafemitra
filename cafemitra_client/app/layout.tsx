import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://repetigo.com/";
const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://repetigo.com/#organization",
      name: "RepetiGo",
      url: "https://repetigo.com/",
      logo: {
        "@type": "ImageObject",
        url: "https://repetigo.com/hero-print-queue.png",
      },
      description:
        "AI-powered print shop and cyber cafe software to automate document printing, passport photos, PDF tools and repetitive daily tasks.",
    },
    {
      "@type": "WebSite",
      "@id": "https://repetigo.com/#website",
      name: "RepetiGo",
      url: "https://repetigo.com/",
      publisher: {
        "@id": "https://repetigo.com/#organization",
      },
      inLanguage: "en",
    },
  ],
};
const shouldLoadAnalytics = process.env.NODE_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "RepetiGo - AI-Powered Print Shop & Cyber Cafe Automation",
  description:
    "AI-powered print shop and cyber cafe software to automate document printing, passport photos, PDF tools and repetitive daily tasks.",
  keywords: [
    "print shop software",
    "cyber cafe software",
    "document printing automation",
    "passport photo software",
    "online PDF tools",
    "customer document management",
  ],
  publisher: "RepetiGo",
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "RepetiGo",
    title: "RepetiGo - AI-Powered Print Shop & Cyber Cafe Automation",
    description:
      "AI-powered print shop and cyber cafe software to automate document printing, passport photos, PDF tools and repetitive daily tasks.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {shouldLoadAnalytics ? (
          <script
            dangerouslySetInnerHTML={{
              __html:
                "(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-K3BV3MCP');",
            }}
          />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData) }}
        />
      </head>
      <body>
        {shouldLoadAnalytics ? (
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-K3BV3MCP"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
        {children}
      </body>
    </html>
  );
}
