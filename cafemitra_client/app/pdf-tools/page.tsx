import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  IdCard,
  Image,
  LayoutGrid,
  MessageCircle,
  Printer,
  Settings,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { DashboardShell } from "../DashboardShell";

type NavItem = {
  name: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type PdfTool = {
  name: string;
  description: string;
  badge: string;
  color: string;
  isNew?: boolean;
  href?: string;
};

const pageUrl = "https://repetigo.com/pdf-tools";

export const metadata: Metadata = {
  title: "Free PDF Tools Online - Merge, Split, Compress, Convert & Sign | RepetiGo",
  description:
    "30+ free PDF tools online - merge, split, compress, convert PDF to/from Word, Excel, and PowerPoint, sign, watermark, OCR, and more. No sign-up, no watermark, 100% browser-based - nothing is ever uploaded.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free PDF Tools Online - Merge, Split, Compress, Convert & Sign | RepetiGo",
    description: "30+ free PDF tools in one place - merge, split, compress, convert, sign, watermark, OCR. No sign-up, nothing uploaded.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free PDF Tools Online - RepetiGo",
    description: "Merge, split, compress, convert, sign, and edit PDFs free. No sign-up, 100% browser-based.",
  },
  robots: { index: true, follow: true },
};

const navGroups: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", icon: Home, href: "/dashboard" }] },
  { label: "", items: [{ name: "Orders", icon: ClipboardList, href: "/orders" }] },
  {
    label: "Services",
    items: [
      { name: "PrintPilot", icon: Printer, href: "/auto-print" },
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools", active: true },
      { name: "Image Tools", icon: Image, href: "/image-tools" },
      { name: "WhatsApp Print", icon: MessageCircle },
      { name: "Passport Photo", icon: UserRound },
      { name: "ID Card Print", icon: IdCard },
      { name: "Admit Card Hub", icon: ClipboardList },
      { name: "Document Services", icon: FileText },
      { name: "All Services", icon: LayoutGrid },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Customers", icon: Users },
      { name: "Wallet & Settlement", icon: Wallet },
      { name: "Pricing & Settings", icon: Settings, href: "/pricing-settings" },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileText },
    ],
  },
];

const pdfTools: PdfTool[] = [
  { name: "Merge PDF", description: "Combine PDFs in the order you want with an easy PDF merger.", badge: "PDF", color: "#f26b4f", href: "/pdf-tools/merge-pdf" },
  { name: "Split PDF", description: "Separate pages or whole sets into independent PDF files.", badge: "PDF", color: "#f26b4f" },
  { name: "Extract Pages", description: "Pull selected PDF pages into a new file without changing the original.", badge: "EXT", color: "#2563eb", href: "/pdf-tools/extract-pages" },
  { name: "Remove Pages", description: "Delete unwanted, blank, or duplicate PDF pages and download a clean file.", badge: "DEL", color: "#2563eb", href: "/pdf-tools/remove-pages" },
  { name: "Compress PDF", description: "Reduce file size while keeping maximum PDF quality.", badge: "ZIP", color: "#83bd55", href: "/pdf-tools/compress-pdf" },
  { name: "PDF to Word", description: "Convert PDF files into easy to edit DOC and DOCX documents.", badge: "W", color: "#4d80c5" },
  { name: "PDF to PowerPoint", description: "Turn PDF files into editable PPT and PPTX slideshows.", badge: "P", color: "#f26b4f" },
  { name: "PDF to Excel", description: "Pull PDF data into Excel spreadsheets in a few seconds.", badge: "X", color: "#58a86b" },
  { name: "Word to PDF", description: "Make DOC and DOCX files easy to read by converting them to PDF.", badge: "W", color: "#5c8ddd" },
  { name: "PowerPoint to PDF", description: "Convert PPT and PPTX slideshows into easy to view PDFs.", badge: "P", color: "#f26b4f" },
  { name: "Excel to PDF", description: "Convert Excel spreadsheets into shareable PDF documents.", badge: "X", color: "#58a86b" },
  { name: "Edit PDF", description: "Add text, images, shapes, or freehand annotations to a PDF.", badge: "EDIT", color: "#b0649b" },
  { name: "PDF to JPG", description: "Convert each PDF page into JPG or extract images from a PDF.", badge: "JPG", color: "#e4c32f" },
  { name: "JPG to PDF", description: "Convert JPG images to PDF and adjust orientation or margins.", badge: "JPG", color: "#e0c024" },
  { name: "Sign PDF", description: "Sign yourself or request electronic signatures from others.", badge: "SIGN", color: "#4e82bd" },
  { name: "Watermark", description: "Stamp an image or text over your PDF with position controls.", badge: "WM", color: "#b0649b" },
  { name: "Rotate PDF", description: "Rotate one page or many pages at once.", badge: "ROT", color: "#b0649b" },
  { name: "HTML to PDF", description: "Convert saved HTML pages into clean PDF documents.", badge: "HTML", color: "#e4c32f", href: "/pdf-tools/html-to-pdf" },
  { name: "Markdown to PDF", description: "Convert Markdown files into clean, shareable PDF documents.", badge: "MD", color: "#4d80c5", href: "/pdf-tools/markdown-to-pdf", isNew: true },
  { name: "Unlock PDF", description: "Remove PDF password security when you have permission.", badge: "KEY", color: "#4e82bd" },
  { name: "Protect PDF", description: "Encrypt PDF documents with a password to prevent access.", badge: "LOCK", color: "#4e82bd" },
  { name: "Organize PDF", description: "Sort, delete, or add PDF pages to your document.", badge: "ABC", color: "#f26b4f" },
  { name: "PDF to PDF/A", description: "Transform PDFs into ISO-standard PDF/A archive files.", badge: "A", color: "#4e82bd" },
  { name: "Repair PDF", description: "Repair damaged PDFs and recover data from corrupt files.", badge: "FIX", color: "#83bd55" },
  { name: "Page numbers", description: "Add page numbers with custom position and typography.", badge: "123", color: "#b0649b" },
  { name: "OCR PDF", description: "Convert scanned PDFs into searchable, selectable documents.", badge: "OCR", color: "#83bd55" },
  { name: "Compare PDF", description: "Compare two PDFs side by side and spot changes.", badge: "CMP", color: "#4e82bd" },
  { name: "Redact PDF", description: "Permanently remove sensitive text and graphics from a PDF.", badge: "RED", color: "#4e82bd" },
  { name: "Crop PDF", description: "Crop margins or selected areas, then apply to pages.", badge: "CROP", color: "#b0649b" },
  { name: "PDF Forms", description: "Detect form fields and create fillable PDFs.", badge: "FORM", color: "#b0649b", isNew: true },
];

export default function PdfToolsPage() {
  return (
    <DashboardShell activePath="/pdf-tools">
      <div className="dashboard pdf-tools-page">
          <div className="dashboard-hero pdf-tools-hero">
            <div>
              <span className="auto-print-kicker">PrintPilot PDF Tools</span>
              <h1>PDF Tools</h1>
              <p>Merge, split, compress, convert, scan, OCR, and AI tools for daily PDF work in one place.</p>
            </div>
            <span className="status-pill">30 Tools Ready</span>
          </div>

          <section className="pdf-tool-grid" aria-label="PDF tools">
            {pdfTools.map((tool) => (
              <Link className="pdf-tool-card" href={tool.href || pdfToolHref(tool.name)} key={tool.name}>
                {tool.isNew ? <span className="new-ribbon">New!</span> : null}
                <span className="pdf-tool-icon" style={{ "--tool-color": tool.color } as React.CSSProperties}>
                  <FileText size={22} />
                  <small>{tool.badge}</small>
                </span>
                <h2>{tool.name}</h2>
                <p>{tool.description}</p>
              </Link>
            ))}
          </section>

          <JsonLd />
          <article className="tool-seo-content compress-pdf-seo" id="pdf-tools-guide">
            <StructuredSeoCopy content={seoContent} />
          </article>
      </div>
    </DashboardShell>
  );
}

const seoContent = String.raw`RepetiGo's free PDF tools cover the entire day-to-day PDF workflow - merge, split, compress, convert to and from Word, Excel, and PowerPoint, sign, watermark, OCR, and more - all in one place, with no sign-up and no watermark on your output. Every tool runs entirely inside your browser: your document is never uploaded to a server, which matters when the file is a scanned Aadhaar card, a mark sheet, a contract, or anything else you'd rather not send anywhere.
Pick any tool from the grid above and get started immediately - no account, no install, no credit card.

H2: What Can You Do With RepetiGo's Free PDF Tools?
The 30+ tools on this page cover eight common categories of PDF work. Here's what each group is for and when you'd reach for it:

Category
Tools Included
Common Use
Organize & Manage Pages
Merge PDF, Split PDF, Extract Pages, Remove Pages, Organize PDF, Rotate PDF, Crop PDF, Page Numbers
Combining scanned pages into one file, splitting a large PDF into chapters, removing blank scanned pages, reordering a report before sharing
Compress & Repair
Compress PDF, Repair PDF
Shrinking a scanned PDF under a portal's KB limit, recovering a PDF that won't open after a bad download
Convert PDF to Office
PDF to Word, PDF to Excel, PDF to PowerPoint
Editing a scanned contract in Word, pulling a table from a PDF into Excel, turning a PDF report into an editable slide deck
Convert Office to PDF
Word to PDF, Excel to PDF, PowerPoint to PDF
Sending a finished document in a format nobody can accidentally edit
Convert Images & Web
PDF to JPG, JPG to PDF, HTML to PDF, Markdown to PDF
Turning ID scans into a single PDF, saving a webpage as a PDF, exporting notes to a shareable file
Edit & Sign
Edit PDF, Watermark, Sign PDF, PDF Forms
Adding your signature to a contract, stamping "confidential" across a document, filling out a fillable form
Security
Protect PDF, Unlock PDF, Redact PDF
Password-protecting a salary slip, removing a forgotten password from your own file, blacking out an Aadhaar number before sharing
Advanced
OCR PDF, Compare PDF, PDF to PDF/A
Making an old scanned PDF searchable, spotting changes between two contract drafts, archiving a document to the ISO PDF/A standard

H2: How to Use RepetiGo's PDF Tools Online Free.
H3: Step 1 - Pick a Tool
Click any tool card above - Merge PDF, Compress PDF, PDF to Word, whichever you need. Each tool opens its own focused page with just the controls relevant to that job.
H3: Step 2 - Upload Your File
Click Select File or drag and drop your PDF (or Word/Excel/PowerPoint/image file, depending on the tool). There's no fixed file size cap - because everything runs on your own device, very large files just take a little longer.
H3: Step 3 - Download Your Result
Most tools process automatically as soon as you upload. Download the result, or download a ZIP if the tool produces multiple files. Because nothing was ever uploaded, there's nothing left on any server once you're done.

H2: ★ Why 100% Browser-Based PDF Tools Matter for Sensitive Documents.
Most free PDF tool websites work by uploading your file to their server, processing it there, and sending the result back. That means your Aadhaar card, PAN card, mark sheet, salary slip, or signed contract sits on someone else's server, even if only briefly. RepetiGo's PDF tools work differently: every merge, split, compress, convert, sign, and edit operation runs using your own browser's processing power. Your file never leaves your device. There's no upload step to intercept, no server storage to worry about, and no account tying your documents to your identity.

H2: ★ Indian Use Cases - Who Uses RepetiGo's PDF Tools?
Who Uses It
Common Need
Tool They Use
Students and job applicants
Compressing a scanned certificate under a portal's KB limit
Compress PDF
Print shops and cyber cafes
Converting a customer's Word resume to PDF before printing
Word to PDF
HR and office staff
Merging multiple offer letter pages into one PDF
Merge PDF
Freelancers and consultants
Sending a signed contract without printing and scanning
Sign PDF
Government portal applicants
Removing a password from an old PDF to re-upload it
Unlock PDF
Small business owners
Watermarking invoices before sending to clients
Watermark

H2: Why Use RepetiGo's PDF Tools?
Feature
RepetiGo
iLovePDF
Smallpdf
Adobe Acrobat Online
Free to use
✓ Always free
✓ Free with limits
✓ Free with limits
~ Free tier limited
Sign-up required
✓ Never
~ Sometimes
~ Sometimes
✗ Account required
Tools in one place
✓ 30+ tools
✓ Many tools
✓ Many tools
~ Fewer tools
Files ever leave your device?
✗ Never - 100% browser-based
✓ Yes - uploaded to their servers
✓ Yes - uploaded to their servers
✓ Yes - uploaded to their servers
No watermark on output
✓ Always
✓ Yes
✓ Yes
~ Varies by plan
Daily usage limit
✓ None
~ Limited free operations per day
~ Limited free operations per day
~ Limited free operations per day

H2: Your Files Are Safe. Always.
Protection Layer
What It Means in Practice
🖥️ 100% Browser-Based Processing
Your PDF is processed using your own device's processing power. It is never uploaded to any server.
🚫 Nothing Ever Leaves Your Device
Because processing happens locally, there is no upload, no transfer, and nothing on any server for us to store or delete.
👁️ No Document Content Is Read
RepetiGo's code cannot see, analyse, or extract what's in your document - it only re-encodes the file on your own device.
🚫 No Account = No Data Profile
No sign-up means no personal data, no file history, and no usage profile is ever created.
🔒 Well Suited to Aadhaar, Contracts, and Confidential Files
Because nothing is transmitted anywhere, this is one of the safer ways to process a sensitive document online.

[ Read Our Privacy Policy → /privacy-policy ]

H2: Common Questions About RepetiGo's PDF Tools.
H3: Q1: Are RepetiGo's PDF Tools Really Free?
Yes. All 30+ PDF tools on this page are free to use, with no sign-up, no credit card, and no watermark added to your output. There's no hidden daily limit either, since processing happens on your own device rather than a metered server.
H3: Q2: Is It Safe to Use These Tools for Aadhaar, PAN, or Other Sensitive Documents?
Yes - more so than most alternatives, because there is no upload at all. Every tool processes your file entirely inside your browser using your device's own processing power. The file never reaches any RepetiGo server, so there's nothing to intercept in transit and nothing for us to store, because we never receive the document in the first place.
H3: Q3: Does Merging or Compressing a PDF Reduce Its Quality?
Merging PDF pages doesn't change their content or quality at all - it just combines files. Compress PDF does reduce file size by re-encoding embedded images at a lower quality, which is the standard trade-off for any PDF compression tool; text and vector content stay sharp, and image compression is tuned to stay visually clean at normal viewing sizes.
H3: Q4: Is There a File Size or Page Limit?
There's no fixed file size cap set by RepetiGo, because everything runs on your own device rather than a server with a processing quota. Very large files or PDFs with many pages will simply take a little longer to process, depending on your device's speed.
H3: Q5: Do I Need to Install Any Software or Create an Account?
No. Every tool works directly in your browser - Chrome, Safari, Firefox, or Edge - on Windows, Mac, Android, or iPhone. No app to install, no plugin, no account required for any of the 30+ tools.
H3: Q6: Can I Use These PDF Tools on My Phone?
Yes. All tools work in any mobile browser the same way they work on desktop - open the tool, upload your file from your phone's storage or Files app, and download the result. No app store download needed.

H2: More Free Tools from RepetiGo.
Tool
What It Does
Link
Merge PDF
Combine multiple PDFs into one file
→ /pdf-tools/merge-pdf
Compress PDF
Reduce PDF file size for portal uploads
→ /pdf-tools/compress-pdf
Sign PDF
Add your signature or request one from others
→ /pdf-tools/sign-pdf
PDF to Word
Convert a PDF into an editable DOC/DOCX file
→ /pdf-tools/pdf-to-word
Image Tools
Compress, resize, crop, and convert images
→ /image-tools
All Image Tools
Complete free image tools suite
→ /image-tools

[ Explore All PDF Tools Above → /pdf-tools ]`;

const faqSchemaQuestions = Array.from(seoContent.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "🔁", "🔄", "★"];

function StructuredSeoCopy({ content: source }: { content: string }) {
  const blocks = source.replace(/(^|\n)(H[123]: [^\n]+)\n/g, "$1\n$2\n\n").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const first = lines[0];
        if (first.startsWith("H1: ")) return <h1 key={index}>{first.slice(4)}</h1>;
        if (first.startsWith("H2: ")) return <h2 key={index}>{first.slice(4)}</h2>;
        if (first.startsWith("H3: ")) {
          const heading = first.slice(4);
          const body = lines.slice(1);
          return (
            <section className="tool-seo-copy-block" key={index}>
              <h3>{heading}</h3>
              {body.map((line) => <p key={line}>{renderInlineMappedLinks(line)}</p>)}
            </section>
          );
        }
        const table = getKnownTable(lines);
        if (table) return <SeoTable key={index} {...table} />;
        if (first.startsWith("✓ ")) {
          return <div className="tool-seo-badges" key={index}>{first.split(/\s{2,}/).map((item) => <span key={item}>{item}</span>)}</div>;
        }
        if (lines.length && lines.every((line) => line.startsWith("[ ") && line.endsWith(" ]"))) {
          return <div className="tool-seo-cta-stack" key={index}>{lines.map((line) => <CtaLine key={line} text={line} />)}</div>;
        }
        if (CALLOUT_EMOJI.some((emoji) => first.startsWith(emoji))) {
          return <aside className="tool-seo-callout" key={index}>{lines.map((line) => <p key={line}>{renderInlineMappedLinks(line)}</p>)}</aside>;
        }
        return <div className="tool-seo-copy-paragraph" key={index}>{lines.map((line) => <p key={line}>{renderInlineMappedLinks(line)}</p>)}</div>;
      })}
    </>
  );
}

function getKnownTable(lines: string[]): SeoTableData | null {
  if (lines[0] === "Category" && lines[1] === "Tools Included") return { headers: ["Category", "Tools Included", "Common Use"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Who Uses It" && lines[1] === "Common Need") return { headers: ["Who Uses It", "Common Need", "Tool They Use"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Feature" && lines[1] === "RepetiGo") return { headers: ["Feature", "RepetiGo", "iLovePDF", "Smallpdf", "Adobe Acrobat Online"], rows: chunkRows(lines.slice(5), 5) };
  if (lines[0] === "Protection Layer" && lines[1] === "What It Means in Practice") return { headers: ["Protection Layer", "What It Means in Practice"], rows: chunkRows(lines.slice(2), 2) };
  if (lines[0] === "Tool" && lines[1] === "What It Does" && lines[2] === "Link") return { headers: ["Tool", "What It Does", "Link"], rows: chunkRows(lines.slice(3), 3) };
  return null;
}

function chunkRows(values: string[], size: number) {
  const rows: string[][] = [];
  for (let index = 0; index < values.length; index += size) rows.push(values.slice(index, index + size));
  return rows;
}

function SeoTable({ headers, rows }: SeoTableData) {
  return (
    <div className="tool-seo-table-wrap">
      <table>
        <thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={cell + "-" + index}>{renderTableCell(cell)}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function CtaLine({ text }: { text: string }) {
  const inner = text.slice(2, -2);
  const [, label = inner, href = ""] = inner.match(/^(.*?)\s*(?:→)\s*(.+)$/) || [];
  const mappedHref = mapSeoRoute(href || "");
  return <a className="tool-seo-inline-cta" href={mappedHref || "#pdf-tools-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:pdf-tools\/[a-z-]*|image-tools\/[a-z-]*|pricing)\/?|\/pdf-tools\/[a-z-]*\/?|\/pdf-tools\/?|\/image-tools\/[a-z-]*\/?|\/image-tools\/?|\/privacy-policy\/?|\/pricing\/?)/g);
  return parts.map((part, index) => {
    const href = mapSeoRoute(part.startsWith("repetigo.com") ? "https://" + part : part);
    if (!href) return part;
    return <a href={href} key={part + "-" + index}>{getRouteLabel(href)}</a>;
  });
}

function mapSeoRoute(route: string) {
  const cleanRoute = route.trim().replace(/^(https?:\/\/)?(www\.)?repetigo\.com/i, "").replace(/\/$/, "");
  const routeMap: Record<string, string> = {
    "/pdf-tools": "/pdf-tools",
    "/pdf-tools/merge-pdf": "/pdf-tools/merge-pdf",
    "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf",
    "/pdf-tools/sign-pdf": "/pdf-tools/sign-pdf",
    "/pdf-tools/pdf-to-word": "/pdf-tools/pdf-to-word",
    "/image-tools": "/image-tools",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/pdf-tools") || cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/pdf-tools": "Explore All PDF Tools",
    "/pdf-tools/merge-pdf": "Open Merge PDF",
    "/pdf-tools/compress-pdf": "Open Compress PDF",
    "/pdf-tools/sign-pdf": "Open Sign PDF",
    "/pdf-tools/pdf-to-word": "Open PDF to Word",
    "/image-tools": "Explore All Image Tools",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PDF Tools", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "30+ free online PDF tools - merge, split, compress, convert, sign, watermark, and OCR. Runs entirely in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", name: "RepetiGo PDF Tools", itemListElement: pdfTools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: tool.name, url: `https://repetigo.com${tool.href || pdfToolHref(tool.name)}` })) };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: pageUrl }] };

  return <>{[softwareApplication, itemList, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}

function pdfToolHref(name: string) {
  const specialRoutes: Record<string, string> = {
    "Watermark": "watermark-pdf",
    "Page numbers": "page-numbers",
    "PDF to PDF/A": "pdf-to-pdfa",
  };
  const slug = specialRoutes[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `/pdf-tools/${slug}`;
}
