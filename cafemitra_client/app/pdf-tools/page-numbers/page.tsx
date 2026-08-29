import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "../../DashboardShell";
import PdfEditTool from "../PdfEditTool";

const pageUrl = "https://repetigo.com/pdf-tools/page-numbers";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Free Online | RepetiGo",
  description:
    "Add page numbers to PDF free - choose position (top/bottom, left/centre/right), font size, colour, and starting number. 6 placement options. Browser-only. No sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Add Page Numbers to PDF Free Online | RepetiGo",
    description: "Add page numbers to PDF free - choose position (top/bottom, left/centre/right), font size, colour, and starting number. 6 placement options. Browser-only. No sign-up.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Page Numbers to PDF Free Online - RepetiGo",
    description: "6 positions, custom starting number, font size and colour. No sign-up, browser-only.",
  },
  robots: { index: true, follow: true },
};

const positionRows = [
  ["Top-left", "Header - left edge", "Legal documents, formal reports"],
  ["Top-centre", "Header - horizontally centred", "Academic papers, theses"],
  ["Top-right", "Header - right edge", "Landscape-orientation documents"],
  ["Bottom-left", "Footer - left edge", "Internal documents, drafts"],
  ["Bottom-centre", "Footer - horizontally centred", "Most common - widely expected position"],
  ["Bottom-right", "Footer - right edge", "Multi-column documents"],
];

const withoutAdobeRows = [
  ["Cost", "Free", "₹1,500-₹3,500/month"],
  ["Server upload", "No - browser-only", "Cloud sync"],
  ["Positions", "6", "Many"],
  ["Number format", "Sequential plain numbers", "Many (Roman, Page X of Y, etc.)"],
  ["Works without install", "Yes (browser)", "No (desktop app)"],
];

const safetyRows = [
  ["🔒 Browser-only processing", "Your file never travels over any network. No server receives it. No upload occurs."],
  ["🔐 No server, no session", "There is no remote processing session. The tool runs inside your browser tab using local resources."],
  ["🚫 No account = no data", "No sign-up means we hold zero personal data. No file history, no usage tracking."],
  ["👁️ Content never leaves device", "No text, image, or document content is sent to or read by any external system."],
  ["✅ Cleared on tab close", "All working data is cleared when you close or refresh the browser tab."],
];

const relatedRows = [
  ["Add Watermark", "Stamp text on every page", "/pdf-tools/watermark-pdf"],
  ["Rotate PDF", "Fix page orientation", "/pdf-tools/rotate-pdf"],
  ["All PDF Tools", "Complete free PDF tools library", "/pdf-tools"],
];

const faqs = [
  ["Q1: How do I add page numbers to a PDF for free?", "Go to repetigo.com/tools/pdf/add-page-numbers/, upload your PDF, select which pages get numbers, choose your position (Top/Bottom, Left/Centre/Right), set your starting number and font details, and click Add Page Numbers. Download the numbered PDF. Browser-only - no upload, no sign-up."],
  ["Q2: Can I start page numbers from a specific number?", "Yes. The starting number input lets you set any starting value - for example, start at 5 if the PDF represents pages 5-20 of a larger document. The numbers increment sequentially from your starting value across all selected pages."],
  ["Q3: Can I number only specific pages?", "Yes. The page selector shows thumbnails of all pages. Click any thumbnail to toggle whether it receives a number. Unselected pages pass through unchanged - they appear in the output PDF but without a page number."],
  ["Q4: Does the page number appear in the same position on all pages?", "Yes. The position (e.g. Bottom-centre) and all formatting settings apply uniformly to all selected pages. The number value increments sequentially across selected pages - unselected pages break the sequence but do not receive a number."],
  ["Q5: What number format does the tool support?", "The tool adds sequential plain numbers (1, 2, 3...) starting from your chosen starting number. Roman numerals, 'Page X of Y' formats, and prefix/suffix text are not currently supported."],
];

export default function PageNumbersPage() {
  return (
    <DashboardShell activePath="/pdf-tools">
      <div className="dashboard generic-pdf-tool-page">
        <PdfEditTool
          slug="page-numbers"
          headingLevel="h1"
          uploadTitle="Add Page Numbers to Any PDF. Free. Choose Your Position and Format."
          uploadDescription="Upload any PDF, pick where the numbers go, choose your starting number, and download. No Adobe Acrobat. No sign-up. Files never uploaded."
        >
          <JsonLd />
          <article className="tool-seo-content" id="page-numbers-guide">
            <HeroIntro />
            <WhatItDoes />
            <HowTo />
            <Options />
            <WithoutAdobe />
            <Safety />
            <Faq />
            <Related />
            <section className="tool-seo-cta"><h2>Add Page Numbers Free</h2><p>No sign-up. Choose position and starting number. Browser-only processing.</p><Link href="/pdf-tools/page-numbers">Add Page Numbers Free</Link></section>
          </article>
        </PdfEditTool>
      </div>
    </DashboardShell>
  );
}

function HeroIntro() {
  return <section className="tool-seo-hero"><p>RepetiGo's free add page numbers to PDF tool lets you number the pages of any PDF in seconds - choose from 6 positions, set your starting number, pick your font size and colour. Download a cleanly numbered PDF.</p><p>Sequential page numbers are applied to the pages you select. Unselected pages are passed through unchanged.</p><div className="tool-seo-badges"><span>✓ 6 Position Options</span><span>✓ Custom Starting Number</span><span>✓ Font Size and Colour Control</span><span>✓ No Adobe Required</span><span>✓ Browser-Only - Never Uploaded</span></div><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/page-numbers">Add Page Numbers Free - No Sign-Up <span>→</span></Link></div></section>;
}

function WhatItDoes() {
  return <section><h2>What Does Adding Page Numbers to a PDF Do?</h2><p>Page numbers added by RepetiGo are embedded directly into the PDF page content - not as an annotation or comment layer. They appear in every PDF viewer on every device, and they print correctly on every printer.</p><p>The numbers are rendered using Helvetica Bold at your chosen font size, positioned exactly at the location you select, and coloured using your chosen colour. They are part of the PDF page - not overlaid metadata.</p></section>;
}

function HowTo() {
  return <section><h2>How to Add Page Numbers to a PDF in 3 Steps.</h2><h3>Step 1 - Upload Your PDF</h3><p>Click Upload or drag your PDF into the tool. All pages are rendered as thumbnails. Select which pages will receive page numbers - click to toggle individual pages, or use Select All.</p><h3>Step 2 - Choose Position, Number, Font and Colour</h3><p>Select one of six positions (Top-left, Top-centre, Top-right, Bottom-left, Bottom-centre, Bottom-right). Set your starting number - useful when this PDF is part of a larger document that already has a fixed page count. Choose your font size (6-96) and colour using the colour picker.</p><h3>Step 3 - Download Your Numbered PDF</h3><p>Click Add Page Numbers. The numbers are applied to selected pages only. Download your PDF. Processing runs in your browser - nothing is uploaded.</p><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/page-numbers">Add Page Numbers Now - Free <span>→</span></Link></div></section>;
}

function Options() {
  return <section><h2>All 6 Position Options Explained.</h2><SeoTable headers={["Position", "Where Numbers Appear", "Best For"]} rows={positionRows} /></section>;
}

function WithoutAdobe() {
  return <section><h2>Add Page Numbers Without Adobe Acrobat.</h2><p>Adobe Acrobat Pro includes page numbering via the Headers & Footers feature - but requires a paid subscription. RepetiGo lets you add page numbers to PDF without Adobe for free, in any browser, with no software to install.</p><SeoTable headers={["Feature", "RepetiGo", "Adobe Acrobat Pro"]} rows={withoutAdobeRows} /></section>;
}

function Safety() {
  return <section><h2>Your Files Never Leave Your Browser.</h2><p>RepetiGo's PDF tools run entirely in your browser. Your file is never uploaded to any server - it is processed locally using your device's computing resources.</p><SeoTable headers={["Protection Layer", "What It Means"]} rows={safetyRows} /><Callout>Your file never leaves your device - not for 60 minutes, not ever. Browser-only processing is stronger privacy than any server-side deletion policy.</Callout><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/privacy-policy">Read Privacy Policy <span>→</span></Link></div></section>;
}

function Faq() {
  return <section><h2>Common Questions About Adding Page Numbers to a PDF.</h2><div className="tool-seo-faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>;
}

function Related() {
  return <section><h2>More Free PDF Tools.</h2><SeoTable headers={["Tool", "Best For", "Link"]} rows={relatedRows.map(([tool, best, href]) => [tool, best, labelFor(href)])} /><div className="tool-seo-related-grid">{relatedRows.map(([tool, best, href]) => <Link href={href} key={tool}>{tool}<span>{best}</span></Link>)}</div></section>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return <aside className="tool-seo-callout"><p>{children}</p></aside>;
}

function SeoTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="tool-seo-table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function labelFor(href: string) {
  const labels: Record<string, string> = {
    "/pdf-tools/watermark-pdf": "Open Add Watermark",
    "/pdf-tools/rotate-pdf": "Open Rotate PDF",
    "/pdf-tools": "Explore All PDF Tools",
  };
  return labels[href] || "Open PDF Tool";
}

function JsonLd() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PDF Page Numbering Tool", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online tool to add plain sequential page numbers to a PDF - 6 positions, starting number, font size and colour, entirely in the browser. No file is ever uploaded to a server.", url: pageUrl },
    { "@context": "https://schema.org", "@type": "HowTo", name: "How to Add Page Numbers to a PDF", step: [{ "@type": "HowToStep", name: "Upload Your PDF", text: "Upload Your PDF" }, { "@type": "HowToStep", name: "Choose Position, Number, Font and Colour", text: "Choose Position, Number, Font and Colour" }, { "@type": "HowToStep", name: "Download Your Numbered PDF", text: "Download Your Numbered PDF" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Add Page Numbers", item: pageUrl }] },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
