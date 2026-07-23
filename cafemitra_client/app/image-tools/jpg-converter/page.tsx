import type { Metadata } from "next";
import JpgConverterClient from "./JpgConverterClient";

const pageUrl = "https://repetigo.com/image-tools/jpg-converter";

export const metadata: Metadata = {
  title: "JPG Converter Free Online - JPG to PNG, WebP, GIF, ICO, PDF, SVG | RepetiGo",
  description:
    "Convert JPG to PNG, WebP, GIF, BMP, ICO, PDF, or SVG free online - one tool, every format. Batch convert multiple files. No sign-up, no watermark, 100% browser-based - nothing is ever uploaded.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "JPG Converter Free Online - JPG to PNG, WebP, GIF, ICO, PDF, SVG | RepetiGo",
    description: "Convert JPG to PNG, WebP, GIF, BMP, ICO, PDF, or SVG free - one tool, every format. Batch convert. No sign-up, 100% browser-based.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "JPG Converter Free - RepetiGo",
    description: "Convert JPG to any format free, one file or a batch. No sign-up, 100% browser-based.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: JPG Converter Online Free. Convert JPG to PNG, WebP, GIF, BMP, ICO, PDF, or SVG - One Tool, No Sign-Up.
RepetiGo's free JPG Converter turns your JPG or JPEG photo into whichever format the destination actually needs - PNG, WebP, GIF, BMP, ICO, PDF, or even a vector-traced SVG - from a single tool. Upload a JPG, pick an output format, and download the result. Upload a batch and convert every file to the same format at once. No account, no watermark, and your files are never uploaded anywhere - conversion runs entirely inside your browser.

JPG is the default format for camera photos, scans, and most downloads, but it isn't always the right format to send onward: a design tool wants PNG, a website wants WebP, a favicon wants ICO, and a document workflow wants PDF. Instead of juggling separate converters for each destination, this page covers every common JPG output in one place.

✓ 7 Output Formats in One Tool   ✓ Batch Convert   ✓ Adjustable Quality Where It Applies   ✓ No Sign-Up   ✓ 100% Browser-Based - Nothing Uploaded

[ Convert JPG Free - No Sign-Up → repetigo.com/image-tools/jpg-converter ]

H2: What Format Should You Convert Your JPG To?
JPG uses lossy compression and has no transparency, so converting it to a different format changes different things depending on where the file is headed. Here's how the common JPG output formats compare:

H3: JPG Output Format Comparison

Format
Best For
Transparency
File Size vs JPG
When to Choose It
PNG
Design tools, screenshots, logos, editing workflows
✓ Supported (source stays opaque)
Larger - lossless
You need a lossless, widely compatible format for further editing
WebP
Website images, faster page loads
✓ Supported
Smaller at similar quality
You're optimizing images for a website and control what serves them
GIF
Simple flat-colour graphics, basic icons
✓ 1-bit only (fully on or off)
Usually smaller
You specifically need the legacy GIF format, not photos or gradients
BMP
Legacy Windows software, some print or embedded systems
✓ Supported (uncompressed)
Much larger - uncompressed
An older system specifically requires BMP and file size doesn't matter
ICO
Favicons, Windows application icons
✓ Supported
Similar to PNG
You need a small icon file for a browser tab or a Windows app
PDF
Document workflows, sharing a single photo as a document
Not applicable
Similar to JPG
The destination expects a document file, not an image file
SVG
Logos, icons, and line art that need to scale infinitely
✓ Supported
Varies - large for photos
Your JPG is a simple flat-colour graphic, not a photo

💡 SVG vectorization works by tracing shapes out of the pixels - it is not a good fit for photographs. A photo traced to SVG becomes a large file full of thousands of tiny shapes instead of a clean vector graphic. Use it only for logos, icons, and simple line art that happen to be saved as JPG.

H2: How to Convert JPG Online Free in 3 Steps.
H3: Step 1 - Upload Your JPG File
Click Select JPG Images or drag and drop your .jpg or .jpeg file - or several files at once for batch conversion. There's no fixed file size cap, because everything runs on your own device. The converter works in any browser on any device.
H3: Step 2 - Choose Your Output Format
As soon as you upload, RepetiGo converts your JPG automatically to PNG by default. Change Output Format to switch between PNG, WebP, GIF, BMP, ICO, PDF, or SVG - every uploaded file re-converts automatically to the new format. A quality slider appears only for WebP, since PNG is lossless and the other formats don't use a quality setting the same way.
H3: Step 3 - Download Your Converted File
Click Download for a single file. For a batch, click Download ZIP to get every converted file in one archive. File names are preserved with the new extension (photo.jpg → photo.png). Because nothing was ever uploaded, there's nothing left on any server once you're done.

[ Convert JPG Free Now → repetigo.com/image-tools/jpg-converter ]

H2: ★ Batch JPG Conversion.
Whether it's a folder of camera photos, a set of scanned documents, or a batch of product images, converting JPG files one at a time is slow. RepetiGo's batch converter handles any number of files in one session:
Upload all JPG files at once - drag a multi-file selection or Ctrl+Click (Windows) / Cmd+Click (Mac) to multi-select.
Each file converts automatically to your chosen format as it's added.
Change the output format or quality at any point to re-convert every file in the batch.
Click Download ZIP to get one archive containing all the converted files, named identically to the originals.

💡 Every file in a batch converts to the same output format. If you need some JPGs as PNG and others as PDF, run them through in two separate batches - upload, convert, download, then start over with the next group and a different format.

H2: ★ Indian Use Cases - Who Uses a JPG Converter in India?
JPG is the default format for phone cameras, WhatsApp downloads, and scanned documents across India, which means JPG files constantly need to become something else depending on where they're headed next.

Who Uses It
Common Need
Format They Choose
Students and job applicants
Converting a scanned certificate or photo for a design tool or editing app
PNG - lossless and widely supported by editors
Web developers and agencies
Preparing JPG photos for faster-loading websites
WebP - smaller files at similar visual quality
Small business owners
Creating a favicon or app icon from a JPG logo photo
ICO - the format browsers and Windows expect for icons
Freelancers and consultants
Sending a single photo or scan as a shareable document
PDF - opens the same way on any device without an image viewer
Print shops and DTP centres
Handling JPG files for older layout or print software
BMP - universally readable by legacy software
Designers with a scanned or photographed logo
Getting a scalable version of a simple flat-colour logo
SVG - vector tracing for logos and line art only

H2: PNG, GIF, BMP, and ICO from JPG - What These Conversions Actually Change.
Converting JPG to a different format is not just relabeling the file - each format changes something real about how the image behaves:
JPG to PNG makes the file lossless (no further quality loss on repeated saves) but typically larger, since JPG's compression is what keeps it small in the first place.
JPG to GIF forces the image down to a maximum of 256 colours, which visibly changes photos with gradients or smooth colour transitions - it's built for flat-colour graphics, not photography.
JPG to BMP removes compression entirely, producing an uncompressed file that can be several times larger than the JPG source, useful only for legacy software that requires it.
JPG to ICO wraps the image in a small icon container - best kept to square, simple images since it's meant for favicons and app icons, not full photos.

H2: Why Use RepetiGo's JPG Converter?

Feature
RepetiGo
CloudConvert
Online-Convert.com
Windows Paint
Free to use
✓ Always free
✓ Free (25 conversions/day)
✓ Free with limits
✓ Free (built-in)
Multiple output formats in one tool
✓ PNG, WebP, GIF, BMP, ICO, PDF, SVG
✓ Many formats
✓ Many formats
~ Limited formats
Sign-up required
✓ Never
✗ Account for higher limits
~ Sometimes
✓ No account
Batch conversion
✓ Yes - upload any number of files
✓ Yes (limit applies)
~ Limited
✗ One file at a time
Files ever leave your device?
✗ Never - 100% browser-based
✓ Yes - uploaded to their servers
✓ Yes - uploaded to their servers
✓ Never - local
No watermark on output
✓ Always
✓ Yes
~ Some tiers add watermarks
✓ Yes

H2: Your Files Are Safe. Always.

Protection Layer
What It Means in Practice
🖥️ 100% Browser-Based Conversion
Your JPG is converted using your own device's processing power via the browser. It is never uploaded to any server.
🚫 Nothing Ever Leaves Your Device
Because conversion happens locally, there is no upload, no transfer, and nothing on any server for us to store or delete.
👁️ No Image Content Is Read
RepetiGo's code cannot see, analyse, or extract what's in your photo - it only re-encodes pixel data on your own device.
🚫 No Account = No Data Profile
No sign-up means no personal data, no file history, and no usage profile is ever created.
🔒 Well Suited to Personal Photos and Documents
Because nothing is transmitted anywhere, this is a safe way to convert a personal photo, an ID scan, or a confidential document image.

[ Read Our Privacy Policy → /privacy-policy ]

H2: Common Questions About JPG Conversion.
H3: Q1: Does Converting JPG to PNG Improve Quality?
No. JPG is a lossy format, so any detail already discarded during the original JPG compression is permanently gone - converting to PNG afterward cannot recover it. What PNG conversion does give you is a lossless container going forward: once converted, further edits and re-saves in PNG won't introduce any additional compression artifacts, unlike re-saving as JPG repeatedly.
H3: Q2: Why Is My Converted PNG or BMP Larger Than the Original JPG?
This is expected. JPG's small file size comes specifically from its lossy compression - PNG is lossless and BMP is uncompressed, so both will almost always produce a larger file than the JPG source, even though the image looks the same or better. If file size matters, WebP is usually the better choice since it also compresses efficiently.
H3: Q3: Can I Convert a JPG Photo to SVG With Good Results?
Only if the JPG is a simple, flat-colour image like a logo or an icon. SVG conversion works by tracing shapes out of pixel data, and a photograph has far too much colour detail and noise to trace cleanly - the result would be an enormous file with thousands of tiny shapes instead of a clean vector graphic. For genuine photos, keep the output as PNG, WebP, or JPG instead.
H3: Q4: What's the Difference Between ICO and PNG for a Favicon Made from a JPG Photo?
Browsers and operating systems have historically expected the ICO format specifically for favicons and Windows application icons, and some older browsers only support ICO, not PNG, in that role. If your logo was photographed or saved as JPG, converting it to ICO here gives you a properly formatted favicon file, though a simple, high-contrast logo works far better as an icon than a busy photo.
H3: Q5: How Do I Batch Convert Multiple JPG Files at Once?
Go to repetigo.com/image-tools/jpg-converter. Click Select JPG Images and choose multiple files using Ctrl+Click (Windows) or Cmd+Click (Mac), or drag several files into the upload area at once. Each file converts automatically to your chosen output format. Click Download ZIP to get an archive containing all the converted files, named identically to the originals. There's no file count limit per batch, and every file in the batch converts to the same format and quality setting.

H2: More Free Image Tools from RepetiGo.

Tool
What It Does
Link
PNG Converter
Convert a PNG into JPG, WebP, GIF, BMP, ICO, or PDF
→ /image-tools/png-converter
JPG to WebP
Dedicated JPG to WebP converter with quality control
→ /image-tools/jpg-to-webp
PNG to SVG
Vectorize a PNG logo or icon into a real, scalable SVG
→ /image-tools/png-to-svg
SVG Converter
Convert an SVG file into PNG or JPG at any size
→ /image-tools/svg-converter
Compress Image
Reduce file size further after conversion
→ /image-tools/compress-image
All Image Tools
Complete free image tools suite
→ /image-tools

[ Convert JPG Free - No Sign-Up → repetigo.com/image-tools/jpg-converter ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function JpgConverterPage() {
  return (
    <JpgConverterClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="jpg-converter-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </JpgConverterClient>
  );
}

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
  if (lines[0] === "Format" && lines[1] === "Best For") return { headers: ["Format", "Best For", "Transparency", "File Size vs JPG", "When to Choose It"], rows: chunkRows(lines.slice(5), 5) };
  if (lines[0] === "Who Uses It" && lines[1] === "Common Need") return { headers: ["Who Uses It", "Common Need", "Format They Choose"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Feature" && lines[1] === "RepetiGo") return { headers: ["Feature", "RepetiGo", "CloudConvert", "Online-Convert.com", "Windows Paint"], rows: chunkRows(lines.slice(5), 5) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#jpg-converter-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:image-tools\/[a-z-]*|pricing)\/?|\/image-tools\/[a-z-]*\/?|\/image-tools\/?|\/products\/printpilot\/?|\/privacy-policy\/?|\/pricing\/?)/g);
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
    "/image-tools/jpg-converter": "/image-tools/jpg-converter",
    "/image-tools/png-converter": "/image-tools/png-converter",
    "/image-tools/jpg-to-webp": "/image-tools/jpg-to-webp",
    "/image-tools/png-to-svg": "/image-tools/png-to-svg",
    "/image-tools/svg-converter": "/image-tools/svg-converter",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/products/printpilot": "/print-automation",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/jpg-converter": "Open JPG Converter",
    "/image-tools/png-converter": "Open PNG Converter",
    "/image-tools/jpg-to-webp": "Open JPG to WebP",
    "/image-tools/png-to-svg": "Open PNG to SVG",
    "/image-tools/svg-converter": "Open SVG Converter",
    "/image-tools/compress-image": "Open Compress Image",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo JPG Converter", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online JPG converter supporting PNG, WebP, GIF, BMP, ICO, PDF, and SVG output with batch conversion. Runs entirely in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Convert JPG Online Free", step: [{ "@type": "HowToStep", name: "Upload JPG", text: "Upload Your JPG File" }, { "@type": "HowToStep", name: "Choose Format", text: "Choose Your Output Format" }, { "@type": "HowToStep", name: "Download", text: "Download Your Converted File" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "JPG Converter", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
