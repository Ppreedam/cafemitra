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

type ImageTool = {
  category: "Optimize" | "Create" | "Modify" | "Convert" | "Security";
  name: string;
  description: string;
  badge: string;
  color: string;
  isNew?: boolean;
  href?: string;
};

const pageUrl = "https://repetigo.com/image-tools";

export const metadata: Metadata = {
  title: "Free Image Tools Online - Compress, Convert, Resize & Edit | RepetiGo",
  description:
    "26+ free image tools online - compress, resize, crop, convert (HEIC/WebP/PNG/JPG/GIF/SVG), remove backgrounds, upscale, watermark, and blur faces. No sign-up, no watermark, 100% browser-based - nothing is ever uploaded.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free Image Tools Online - Compress, Convert, Resize & Edit | RepetiGo",
    description: "26+ free image tools in one place - compress, convert, resize, remove backgrounds, upscale, watermark. No sign-up, nothing uploaded.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Image Tools Online - RepetiGo",
    description: "Compress, convert, resize, and edit images free. No sign-up, 100% browser-based.",
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
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools" },
      { name: "Image Tools", icon: Image, href: "/image-tools", active: true },
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

const imageTools: ImageTool[] = [
  { category: "Optimize", name: "Compress IMAGE", description: "Compress JPG, PNG, and WebP images while saving space and maintaining quality.", badge: "ZIP", color: "#83bd55", href: "/image-tools/compress-image" },
  { category: "Optimize", name: "Upscale", description: "Instantly enlarge images 2x or 4x, entirely in your browser.", badge: "UP", color: "#83bd55", isNew: true, href: "/image-tools/upscale-image" },
  { category: "Optimize", name: "AI Image Upscaler", description: "Enlarge blurry scans and old photos with real AI-added detail.", badge: "AI", color: "#83bd55", isNew: true, href: "/image-tools/ai-upscale-image" },
  { category: "Optimize", name: "Remove background", description: "Quickly remove image backgrounds and download a transparent PNG.", badge: "BG", color: "#83bd55", isNew: true, href: "/image-tools/background-remover" },
  { category: "Create", name: "Meme generator", description: "Create custom memes online with captions, meme images, or uploaded pictures.", badge: "MEME", color: "#b0649b", href: "/image-tools/meme-generator" },
  { category: "Create", name: "Photo editor", description: "Spice up pictures with text, effects, frames, or stickers using simple editing tools.", badge: "EDIT", color: "#b0649b", href: "/image-tools/photo-editor" },
  { category: "Modify", name: "Resize IMAGE", description: "Define dimensions by percent or pixel, and resize JPG, PNG, and WebP images.", badge: "SIZE", color: "#35b5df", href: "/image-tools/resize-image" },
  { category: "Modify", name: "Crop IMAGE", description: "Crop JPG, PNG, or WebP images with centered aspect-ratio controls.", badge: "CUT", color: "#35b5df", href: "/image-tools/crop-image" },
  { category: "Modify", name: "Rotate IMAGE", description: "Rotate to any angle, flip, and batch-process JPG, PNG, or WebP images.", badge: "ROT", color: "#35b5df", href: "/image-tools/rotate-image" },
  { category: "Convert", name: "Convert to JPG", description: "Convert PNG, WebP, GIF, BMP, SVG, or HEIC into JPG - one tool, every format.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "Convert from JPG", description: "Turn JPG images into PNG or WebP files.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-from-jpg" },
  { category: "Convert", name: "HTML to IMAGE", description: "Render readable HTML file content into a PNG image.", badge: "HTML", color: "#efc91e", href: "/image-tools/html-to-image" },
  { category: "Convert", name: "Website to Image", description: "Capture a complete public webpage as one full-page PNG or JPG image.", badge: "WEB", color: "#efc91e", href: "/image-tools/website-to-image" },
  { category: "Convert", name: "Image Converter", description: "Convert images into JPG, PNG, WebP, SVG, BMP, ICO, or PDF.", badge: "IMG", color: "#efc91e", href: "/image-tools/image-converter" },
  { category: "Convert", name: "HEIC to JPG", description: "Convert iPhone HEIC photos into widely supported JPG files - single or batch.", badge: "HEIC", color: "#efc91e", href: "/image-tools/heic-to-jpg" },
  { category: "Convert", name: "SVG Converter", description: "Convert SVG artwork into PNG or JPG at any size.", badge: "SVG", color: "#efc91e", href: "/image-tools/svg-converter" },
  { category: "Convert", name: "WebP to PNG", description: "Convert WebP images into lossless PNG files - transparency preserved.", badge: "PNG", color: "#efc91e", href: "/image-tools/webp-to-png" },
  { category: "Convert", name: "PNG Converter", description: "Convert PNG into JPG, WebP, GIF, BMP, ICO, or PDF - one tool, every format.", badge: "PNG", color: "#efc91e", href: "/image-tools/png-converter" },
  { category: "Convert", name: "WebP to JPG", description: "Convert WebP images into compatible JPG files - single or batch.", badge: "JPG", color: "#efc91e", href: "/image-tools/webp-to-jpg" },
  { category: "Convert", name: "JPG to WebP", description: "Convert JPG images into smaller WebP files for faster websites.", badge: "WEBP", color: "#efc91e", href: "/image-tools/jpg-to-webp" },
  { category: "Convert", name: "JPG Converter", description: "Convert JPG into PNG, WebP, GIF, BMP, ICO, PDF, or SVG - one tool, every format.", badge: "JPG", color: "#efc91e", href: "/image-tools/jpg-converter" },
  { category: "Convert", name: "PNG to JPG", description: "Convert transparent or lossless PNG files into JPG.", badge: "JPG", color: "#efc91e", href: "/image-tools/png-to-jpg" },
  { category: "Convert", name: "GIF Converter", description: "Convert GIF into JPG, PNG, WebP, BMP, ICO, PDF, or SVG - one tool, every format.", badge: "GIF", color: "#efc91e", href: "/image-tools/gif-converter" },
  { category: "Convert", name: "PNG to SVG", description: "Vectorize PNG logos and icons into scalable SVG files.", badge: "SVG", color: "#efc91e", href: "/image-tools/png-to-svg" },
  { category: "Security", name: "Watermark IMAGE", description: "Stamp an image or text over your images with typography, transparency, and position.", badge: "WM", color: "#4e82bd", href: "/image-tools/watermark-image" },
  { category: "Security", name: "Blur face", description: "Blur faces, license plates, and private objects in photos.", badge: "BLUR", color: "#4e82bd", isNew: true, href: "/image-tools/blur-face" },
];

export default function ImageToolsPage() {
  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard image-tools-page">
          <div className="dashboard-hero pdf-tools-hero">
            <div>
              <span className="auto-print-kicker">PrintPilot Image Tools</span>
              <h1>Image Tools</h1>
              <p>Compress, resize, crop, convert, remove backgrounds, add watermarks, and blur images from one place.</p>
            </div>
            <span className="status-pill">{imageTools.length} Tools Ready</span>
          </div>

          <section className="pdf-tool-grid" aria-label="Image tools">
            {imageTools.map((tool) => (
              <Link className="pdf-tool-card" href={tool.href || "/image-tools"} key={tool.name}>
                {tool.isNew ? <span className="new-ribbon">New!</span> : null}
                <span className="pdf-tool-icon" style={{ "--tool-color": tool.color } as React.CSSProperties}>
                  <Image size={22} />
                  <small>{tool.badge}</small>
                </span>
                <h2>{tool.name}</h2>
                <p>{tool.description}</p>
              </Link>
            ))}
          </section>

          <JsonLd />
          <article className="tool-seo-content compress-pdf-seo" id="image-tools-guide">
            <StructuredSeoCopy content={seoContent} />
          </article>
      </div>
    </DashboardShell>
  );
}

const seoContent = String.raw`RepetiGo's free image tools cover the entire day-to-day image workflow - compress, resize, crop, rotate, convert between JPG, PNG, WebP, HEIC, GIF, BMP, and SVG, remove backgrounds, upscale, watermark, and blur faces - all in one place, with no sign-up and no watermark on your output. Every tool runs entirely inside your browser: your photo is never uploaded to a server, which matters when the image is an ID photo, a passport-size photo, or anything else you'd rather not send anywhere.
Pick any tool from the grid above and get started immediately - no account, no install, no credit card.

H2: What Can You Do With RepetiGo's Free Image Tools?
The 26+ tools on this page cover five common categories of image work. Here's what each group is for and when you'd reach for it:

Category
Tools Included
Common Use
Optimize
Compress Image, Upscale, AI Image Upscaler, Remove Background
Shrinking a photo for a portal upload, enlarging a blurry old scan, cleanly removing a background for a product or ID photo
Create
Meme Generator, Photo Editor
Adding captions to a photo for social sharing, applying filters, text, or frames to a picture
Modify
Resize Image, Crop Image, Rotate Image
Resizing a photo to exact pixel dimensions for a form, cropping to a passport-photo ratio, fixing a sideways phone photo
Convert
Convert to JPG, Convert from JPG, Image Converter, HEIC to JPG, SVG Converter, WebP to PNG, PNG Converter, WebP to JPG, JPG to WebP, JPG Converter, PNG to JPG, GIF Converter, PNG to SVG, HTML to Image, Website to Image
Turning an iPhone HEIC photo into JPG for a portal, converting a downloaded WebP icon into a transparent PNG, vectorizing a logo, preparing an image for a faster-loading website
Security
Watermark Image, Blur Face
Stamping a logo or "confidential" text across an image, hiding a face or number plate before sharing a photo publicly

💡 If you're not sure which convert tool to use: RepetiGo's Convert to JPG and GIF/PNG/JPG Converter tools accept multiple source formats in one upload box, so you don't need to pick the exact source format first. Dedicated tools like HEIC to JPG and WebP to PNG exist for when you already know exactly what you're starting with.

H2: How to Use RepetiGo's Image Tools Online Free.
H3: Step 1 - Pick a Tool
Click any tool card above - Compress Image, HEIC to JPG, Remove Background, whichever you need. Each tool opens its own focused page with just the controls relevant to that job.
H3: Step 2 - Upload Your Image
Click Select Images or drag and drop your file - JPG, PNG, WebP, HEIC, GIF, BMP, or SVG, depending on the tool. There's no fixed file size cap - because everything runs on your own device, very large files just take a little longer. Most tools also support batch upload for converting or editing several images at once.
H3: Step 3 - Download Your Result
Most tools process automatically as soon as you upload. Download the result, or download a ZIP if you uploaded a batch. Because nothing was ever uploaded, there's nothing left on any server once you're done.

H2: ★ Why 100% Browser-Based Image Tools Matter for Personal Photos.
Most free image tool websites work by uploading your photo to their server, processing it there, and sending the result back. That means your ID photo, passport-size photo, or a personal picture sits on someone else's server, even if only briefly. RepetiGo's image tools work differently: every compress, convert, resize, crop, and background-removal operation runs using your own browser's processing power, including the AI-based tools like Remove Background and AI Image Upscaler. Your photo never leaves your device. There's no upload step to intercept, no server storage to worry about, and no account tying your images to your identity.

H2: ★ Indian Use Cases - Who Uses RepetiGo's Image Tools?
Who Uses It
Common Need
Tool They Use
Students and job applicants
Compressing a photo under a portal's KB limit
Compress Image
iPhone users
Converting HEIC camera roll photos to JPG for a portal upload
HEIC to JPG
Print shops and cyber cafes
Converting a customer's logo to the format their layout software needs
Image Converter
UI/UX designers and developers
Converting a downloaded WebP icon into a transparent PNG
WebP to PNG
Freelancers and content creators
Creating a captioned meme or social media graphic quickly
Meme Generator
Privacy-conscious users
Blurring a face or number plate before posting a photo publicly
Blur Face

H2: Why Use RepetiGo's Image Tools?
Feature
RepetiGo
iLoveIMG
Canva
Photoshop Express
Free to use
✓ Always free
✓ Free with limits
✓ Free with limits
~ Free tier limited
Sign-up required
✓ Never
~ Sometimes
✗ Account required
✗ Account required
Tools in one place
✓ 26+ tools
✓ Many tools
~ Design-focused, fewer converters
~ Fewer tools
Files ever leave your device?
✗ Never - 100% browser-based
✓ Yes - uploaded to their servers
✓ Yes - uploaded to their servers
✓ Yes - uploaded to their servers
No watermark on output
✓ Always
✓ Yes
~ Varies by plan
✓ Yes
Daily usage limit
✓ None
~ Limited free operations per day
~ Limited free exports per day
~ Limited free operations per day

H2: Your Files Are Safe. Always.
Protection Layer
What It Means in Practice
🖥️ 100% Browser-Based Processing
Your image is processed using your own device's processing power, including AI tools like background removal and upscaling. It is never uploaded to any server.
🚫 Nothing Ever Leaves Your Device
Because processing happens locally, there is no upload, no transfer, and nothing on any server for us to store or delete.
👁️ No Image Content Is Read
RepetiGo's code cannot see, analyse, or extract what's in your photo - it only re-encodes pixel data on your own device.
🚫 No Account = No Data Profile
No sign-up means no personal data, no file history, and no usage profile is ever created.
🔒 Well Suited to ID Photos and Personal Pictures
Because nothing is transmitted anywhere, this is one of the safer ways to process a passport photo, ID scan, or personal picture online.

[ Read Our Privacy Policy → /privacy-policy ]

H2: Common Questions About RepetiGo's Image Tools.
H3: Q1: Are RepetiGo's Image Tools Really Free?
Yes. All 26+ image tools on this page are free to use, with no sign-up, no credit card, and no watermark added to your output. There's no hidden daily limit either, since processing happens on your own device rather than a metered server.
H3: Q2: Is It Safe to Use These Tools for ID Photos and Personal Pictures?
Yes - more so than most alternatives, because there is no upload at all. Every tool processes your image entirely inside your browser using your device's own processing power, including AI-based tools like Remove Background and AI Image Upscaler. The file never reaches any RepetiGo server, so there's nothing to intercept in transit and nothing for us to store, because we never receive the image in the first place.
H3: Q3: Does Compressing or Converting an Image Reduce Its Quality?
It depends on the tool and format. Compress Image reduces file size by re-encoding at a lower quality, which is the standard trade-off for any compression tool - a quality slider lets you balance size against detail. Converting between lossless formats (PNG, WebP lossless) doesn't lose any quality. Converting to JPG always involves some quality trade-off since JPG is a lossy format, though at quality 90 and above the difference is generally not visible.
H3: Q4: Is There a File Size Limit?
There's no fixed file size cap set by RepetiGo, because everything runs on your own device rather than a server with a processing quota. Very large or high-resolution images will simply take a little longer to process, depending on your device's speed.
H3: Q5: Do I Need to Install Any Software or Create an Account?
No. Every tool works directly in your browser - Chrome, Safari, Firefox, or Edge - on Windows, Mac, Android, or iPhone. No app to install, no plugin, no account required for any of the 26+ tools.
H3: Q6: Can I Use These Image Tools on My Phone?
Yes. All tools work in any mobile browser the same way they work on desktop - open the tool, upload your photo from your phone's gallery or Files app, and download the result. No app store download needed.

H2: More Free Tools from RepetiGo.
Tool
What It Does
Link
Compress Image
Reduce JPG, PNG, or WebP file size
→ /image-tools/compress-image
HEIC to JPG
Convert iPhone photos into universal JPG files
→ /image-tools/heic-to-jpg
Remove Background
Remove image backgrounds with AI, entirely in your browser
→ /image-tools/background-remover
Convert to JPG
Convert PNG, WebP, GIF, BMP, SVG, or HEIC into JPG
→ /image-tools/convert-to-jpg
PDF Tools
Merge, split, compress, convert, and sign PDFs
→ /pdf-tools
All PDF Tools
Complete free PDF tools suite
→ /pdf-tools

[ Explore All Image Tools Above → /image-tools ]`;

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
  if (lines[0] === "Feature" && lines[1] === "RepetiGo") return { headers: ["Feature", "RepetiGo", "iLoveIMG", "Canva", "Photoshop Express"], rows: chunkRows(lines.slice(5), 5) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#image-tools-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:image-tools\/[a-z-]*|pdf-tools\/[a-z-]*|pricing)\/?|\/image-tools\/[a-z-]*\/?|\/image-tools\/?|\/pdf-tools\/[a-z-]*\/?|\/pdf-tools\/?|\/privacy-policy\/?|\/pricing\/?)/g);
  return parts.map((part, index) => {
    const href = mapSeoRoute(part.startsWith("repetigo.com") ? "https://" + part : part);
    if (!href) return part;
    return <a href={href} key={part + "-" + index}>{getRouteLabel(href)}</a>;
  });
}

function mapSeoRoute(route: string) {
  const cleanRoute = route.trim().replace(/^(https?:\/\/)?(www\.)?repetigo\.com/i, "").replace(/\/$/, "");
  const routeMap: Record<string, string> = {
    "/image-tools": "/image-tools",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/heic-to-jpg": "/image-tools/heic-to-jpg",
    "/image-tools/background-remover": "/image-tools/background-remover",
    "/image-tools/convert-to-jpg": "/image-tools/convert-to-jpg",
    "/pdf-tools": "/pdf-tools",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") || cleanRoute.startsWith("/pdf-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/heic-to-jpg": "Open HEIC to JPG",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/convert-to-jpg": "Open Convert to JPG",
    "/pdf-tools": "Explore All PDF Tools",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Image Tools", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "26+ free online image tools - compress, resize, crop, convert, remove backgrounds, upscale, watermark, and blur faces. Runs entirely in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", name: "RepetiGo Image Tools", itemListElement: imageTools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: tool.name, url: `https://repetigo.com${tool.href || "/image-tools"}` })) };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: pageUrl }] };

  return <>{[softwareApplication, itemList, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
