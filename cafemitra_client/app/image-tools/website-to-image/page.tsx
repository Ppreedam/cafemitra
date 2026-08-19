import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import WebsiteToImageClient from "./WebsiteToImageClient";

const pageUrl = "https://repetigo.com/image-tools/website-to-image";

export const metadata: Metadata = {
  title: "Website to Image Free - Full Page Screenshot Tool | RepetiGo",
  description:
    "Free website-to-image tool - capture a full-page or viewport screenshot of any URL as a JPG or PNG. Choose desktop, tablet or mobile width. No sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Website to Image Free - Full Page Screenshot Tool",
    description: "Capture a full-page or viewport screenshot of any URL as a JPG or PNG. Desktop, tablet, mobile.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Website to Image Free - Full Page Screenshot",
    description: "Free full-page website screenshots. Viewport or full page, device widths, JPG/PNG output.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Website to Image - Capture a Full-Page Screenshot of Any URL.

RepetiGo's website to image tool captures a screenshot of any public web page and gives you a downloadable image. Paste a URL, choose whether you want the full page or just the visible viewport, pick a device width, and download the result as a JPG or PNG. It is the fast, free way to turn a live website into an image - no browser extension, no sign-up, no watermark.
Unlike a manual screenshot that only grabs what is on screen, this tool can capture the entire page from top to bottom in one image - ideal for a full page screenshot of a long article, a landing page, or a design you want to save. You control the width too, so you can capture a desktop, tablet, or mobile view of the same page. It is a proper website screenshot tool that does the scrolling and stitching for you.

✓ Free · No sign-up · No watermark   ✓ Full page or viewport   ✓ Desktop / tablet / mobile widths   ✓ JPG or PNG output

H2: How to Capture a Website as an Image in 3 Steps.
Here is how to screenshot a website with RepetiGo. All you need is the URL.

Step
What You Do
What Happens
1. Enter the URL
Paste a public website URL and press Enter or the button.
The tool loads the page on our server and starts capturing.
2. Set mode & width
Choose full page or viewport, a device width, and JPG/PNG.
For JPG you can pick a quality preset; a spinner shows progress.
3. Download
Preview the screenshot inline and download it.
It saves as {site}-full-page.jpg or {site}-viewport.png.

ℹ️ This tool loads the page on RepetiGo's server to capture it (see "How It Works" below). Login-only, paywalled, private, and local URLs cannot be captured.

H2: Full Page vs Viewport - Which Capture Mode?
The mode dropdown decides how much of the page you get. Full page captures the entire web page from top to bottom as one tall image - everything you would see if you scrolled all the way down. Viewport captures only the visible area, as if you took a single screenshot without scrolling, at the chosen width and a standard height.

Mode
What you get
Best for
Full page
The whole page, top to bottom, stitched into one image
Articles, landing pages, whole-design captures
Viewport
Only the visible above-the-fold area
Hero sections, previews, above-the-fold checks

Full page is the reason most people use a tool like this - capturing a long page in one image is exactly what a manual screenshot cannot do. Use viewport when you only want the top of the page, the part a visitor sees first.

H2: Choose a Device Width - Desktop, Tablet & Mobile.
The same page looks different at different screen widths, so you can pick the browser width before capturing. This lets you grab a desktop, tablet, or mobile version of a responsive site.

Preset
Width
Represents
Desktop
1280px
Standard desktop view
Wide desktop (default)
1440px
Large desktop monitors
Full HD
1920px
Full-width, high-resolution capture
Tablet
768px
Tablet / iPad-width layout
Mobile
390px / 375px
Phone-width responsive layout

If you are checking how a site looks on a phone, choose Mobile and capture - you get the responsive mobile layout, not a squeezed desktop page. For a crisp, wide capture, Full HD at 1920px gives the most detail. Wide desktop (1440px) is the default and suits most captures.

H2: JPG or PNG Output (and JPG Quality).
Choose the output format to suit your need. JPG makes a smaller file, which is handy for a long full-page capture that would otherwise be heavy; PNG gives the best quality and crisp text, at a larger size. When you pick JPG, you also get a quality preset: Compressed (70%) for the smallest file, High (90%) for a strong balance, or Maximum (100%) for the best JPG quality.
As a rule of thumb: use PNG when text sharpness matters (documentation, design review) and JPG when file size matters (sharing a long page, emailing a capture). If a JPG full-page screenshot is still large, you can shrink it further with the Compress Image tool linked below.

H2: How It Works - Server-Side Capture.
It is worth being clear about how this tool works, because it is different from most of RepetiGo's image tools. To take a real screenshot of a live web page, the tool sends your URL to RepetiGo's server, which loads the page in a real browser environment and captures it, then returns the image to you. This is server-side capture - it is the only way to render a live page's actual layout, styles, and images faithfully.
That means, unlike the client-side tools on RepetiGo, this one does send the URL you enter to our server to do the rendering. The URL is a public web address rather than a personal file, but it is honest to be clear that the capture happens on the server, not in your browser. For full details on how RepetiGo handles requests, see the security policy linked below. If you need a purely local, in-browser tool that never sends anything to a server, that is a different kind of tool - this one has to render the page to screenshot it.

ℹ️ Server-side by necessity: your URL is sent to RepetiGo's server, which loads and captures the page. That is how a live screenshot works - see the security policy for details.

H2: What It Cannot Capture - Login, Paywalled & Local Pages.
A screenshot tool can only capture what a fresh, logged-out visitor would see, so a few kinds of pages are off-limits - and the tool tells you when it hits one. Pages behind a login, paywalled articles, private or internal pages, and local URLs (like localhost or an internal IP) cannot be captured, because the server cannot reach or authenticate into them. If you try one, you will get a clear error rather than a broken image.
Two more honest notes on what to expect. First, very JavaScript-heavy or lazy-loading pages may not be fully rendered, because the tool captures the page as it loads without a custom wait time - some late-loading content might be missing. Second, cookie notices and ad banners can appear in the screenshot, since the tool does not auto-dismiss pop-ups. For most standard public pages, though, the capture is clean and complete.

⚠️ Cannot capture: login-only, paywalled, private/internal, or local (localhost/IP) pages. Heads-up: JS-heavy/lazy content may not fully load, and cookie/ad banners can appear.

H2: Website to Image vs HTML to Image.
RepetiGo has two related tools that are easy to confuse, so here is the difference. This Website to Image tool takes a live URL and captures a real, full visual screenshot of the rendered page - layout, colours, images, and all - using server-side rendering. The HTML to Image tool is different: it takes an HTML file you upload and renders only its readable text to a PNG, locally in your browser, without running any of the file's code.

Website to Image
HTML to Image
Input
A live website URL
An uploaded .html file
Output
Full visual screenshot
Readable text as an image
Rendering
Server-side (real page)
Client-side, text only
Use it for
Capturing a real web page
Safely reading an HTML file's text

So: use this tool for a real screenshot of a page on the web; use HTML to Image when you have an HTML file and want a safe, local text snapshot of it.

H2: ★ Use Cases - Proposals, Archives & Responsive Previews.
Capturing a web page as an image is useful across a lot of everyday work.

Who
What they capture
Why
Freelancers & agencies
A client's current site for a proposal
Show the "before" in a redesign pitch
Designers & developers
Desktop vs mobile views of a page
Check and share responsive layouts
Marketers
Landing pages and competitor pages
Archive a page as it looked on a date
Students & researchers
A web page as a source
Save a visual record of a page
Anyone sharing a page
A full page as one image
Send a page on chat without a link

🇮🇳 Tip: capturing a long page as full-page JPG keeps the file manageable; if it is still heavy for WhatsApp or email, compress it at /image-tools/compress-image or crop to the key section at /image-tools/crop-image.

H2: What This Tool Does Not Do.
So you know whether it fits before you start, here is what this tool is not built for - and where to go instead.

People often ask for…
The honest answer
Capture many URLs at once
No - one URL at a time (no batch or ZIP)
Screenshot just one element/section
No - full page or viewport only
Wait for lazy-loaded / JS content
No - no custom wait-time control
Hide cookie or ad banners
No - pop-ups are not auto-dismissed
Capture a login/paywalled page
No - only public, reachable pages
Export as PDF, or add annotations
No - image output only (annotate with other tools)
A device-frame mockup around it
No - the raw screenshot is what you get

H2: Website to Image - Frequently Asked Questions.
H3: Is this website screenshot tool free?
Yes - RepetiGo's website to image tool is free with no sign-up and no watermark. Paste a public URL, choose full page or viewport, a device width, and JPG or PNG, and download the screenshot at no cost. It captures one URL at a time.
H3: How do I take a full-page screenshot of a website?
Paste the website's URL, choose "full page" as the capture mode, pick a device width and format, and press capture. The tool loads the page on our server, scrolls and stitches the entire page into one tall image, and lets you download it as a JPG or PNG. That captures the whole page top to bottom, which a manual screenshot cannot do.
H3: What is the difference between full page and viewport?
Full page captures the entire web page from top to bottom as one image - everything you would see if you scrolled all the way down. Viewport captures only the visible above-the-fold area at the chosen width. Use full page for a whole article or landing page, and viewport when you just want the top section a visitor sees first.
H3: Can I capture a mobile view of a site?
Yes. Choose the Mobile width preset (390/375px) before capturing and you get the site's responsive mobile layout, not a shrunk desktop page. There are also Tablet (768px), Desktop (1280px), Wide desktop (1440px, the default), and Full HD (1920px) presets, so you can capture the same page at several widths.
H3: Why can't it capture a page behind a login or paywall?
Because the tool captures what a fresh, logged-out visitor sees, and it cannot log in or get past a paywall. Login-only, paywalled, private or internal, and local (localhost/IP) pages are blocked, and you will get a clear error instead of a broken image. Only public, reachable pages can be captured.
H3: Does my URL get sent to a server?
Yes. Unlike RepetiGo's client-side tools, this one has to load the page to screenshot it, so the URL you enter is sent to our server, which renders the page in a real browser and returns the image. The URL is a public web address rather than a personal file; for full details on how requests are handled, see the security policy.
H3: Why is some content missing or a cookie banner showing?
Very JavaScript-heavy or lazy-loading pages may not fully render, because the tool captures the page as it loads without a custom wait time, so late-loading content can be missing. Cookie notices and ad banners can also appear, since pop-ups are not auto-dismissed. For most standard public pages the capture is clean; for tricky pages, try again or capture the viewport.
H3: Should I choose JPG or PNG?
Choose PNG for the sharpest text and best quality, which suits documentation and design review; choose JPG for a smaller file, which helps with a long full-page capture you want to share. With JPG you can pick a quality preset - Compressed (70%), High (90%), or Maximum (100%). A big JPG can be shrunk further with the Compress Image tool.
H3: Can I capture several websites at once?
No - the tool captures one URL at a time; there is no batch or multi-URL mode and no ZIP download. Capture a page, download it, then enter the next URL. It also captures the full page or viewport rather than a single selected element, so it is focused on whole-page screenshots.
H3: Is this the same as the HTML to Image tool?
No. This Website to Image tool takes a live URL and captures a real visual screenshot of the rendered page using server-side rendering. The HTML to Image tool takes an uploaded HTML file and renders only its readable text to a PNG, locally in your browser. Use this one for a real screenshot of a web page, and HTML to Image for a safe text snapshot of an HTML file.

H2: Related Image Tools.
Tool
What It Does
Link
HTML to Image
Render an HTML file's text to a PNG (local)
→ /image-tools/html-to-image
Compress Image
Shrink a large full-page screenshot
→ /image-tools/compress-image
Crop Image
Crop the screenshot to one section
→ /image-tools/crop-image
Resize Image
Resize the screenshot
→ /image-tools/resize-image
Photo Editor
Annotate the screenshot with text
→ /image-tools/photo-editor
All Image Tools
The complete image tools suite
→ /image-tools

[ Capture a Website as an Image - Free → repetigo.com/image-tools/website-to-image ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function WebsiteToImagePage() {
  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard website-image-page">
        <JsonLd />
        <article className="tool-seo-content compress-pdf-seo" id="website-to-image-guide">
          <StructuredSeoCopy content={content} />
        </article>
        <WebsiteToImageClient />
      </div>
    </DashboardShell>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "🔁", "🔄", "★", "ℹ️"];

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
  if (lines[0] === "Step" && lines[1] === "What You Do" && lines[2] === "What Happens") return { headers: ["Step", "What You Do", "What Happens"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Mode" && lines[1] === "What you get") return { headers: ["Mode", "What you get", "Best for"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Preset" && lines[1] === "Width") return { headers: ["Preset", "Width", "Represents"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Website to Image" && lines[1] === "HTML to Image") return { headers: ["", "Website to Image", "HTML to Image"], rows: chunkRows(lines.slice(2), 3) };
  if (lines[0] === "Who" && lines[1] === "What they capture") return { headers: ["Who", "What they capture", "Why"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "People often ask for…" || lines[0] === "People often ask for...") return { headers: ["People often ask for…", "The honest answer"], rows: chunkRows(lines.slice(2), 2) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#website-to-image-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:image-tools\/[a-z-]*|pricing)\/?|\/image-tools\/[a-z-]*\/?|\/image-tools\/?|\/privacy-policy\/?|\/pricing\/?)/g);
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
    "/image-tools/website-to-image": "/image-tools/website-to-image",
    "/image-tools/html-to-image": "/image-tools/html-to-image",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/crop-image": "/image-tools/crop-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/photo-editor": "/image-tools/photo-editor",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/website-to-image": "Open Website to Image",
    "/image-tools/html-to-image": "Open HTML to Image",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/crop-image": "Open Crop Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/photo-editor": "Open Photo Editor",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Website to Image", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free website-to-image tool that captures a full-page or viewport screenshot of a public URL as a JPG or PNG, with desktop, tablet, and mobile width presets. The URL is sent to RepetiGo's server, which renders and captures the page.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to capture a website as an image", step: [{ "@type": "HowToStep", name: "Enter the URL", text: "Paste a public website URL and press Enter or the button." }, { "@type": "HowToStep", name: "Set mode & width", text: "Choose full page or viewport, a device width, and JPG/PNG." }, { "@type": "HowToStep", name: "Download", text: "Preview the screenshot inline and download it." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Website to Image", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
