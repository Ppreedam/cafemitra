import type { Metadata } from "next";
import JpgConverterClient from "./JpgConverterClient";

const pageUrl = "https://repetigo.com/image-tools/jpg-converter";

export const metadata: Metadata = {
  title: "JPG Converter Free - JPG to SVG, PDF, ICO, GIF & BMP | RepetiGo",
  description:
    "Free JPG converter - convert JPG to SVG (real vector tracing), PDF, ICO, GIF or BMP in your browser. Batch-convert and download a ZIP. No upload, no watermark.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "JPG Converter Free - JPG to SVG, PDF, ICO, GIF & BMP",
    description: "Convert JPG to SVG (vector tracing), PDF, ICO, GIF or BMP in your browser. Batch + ZIP, nothing uploaded.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "JPG Converter Free - JPG to 7 Formats",
    description: "Free JPG converter: SVG (real trace)/PDF/ICO/GIF/BMP/PNG/WebP. Batch + ZIP, in your browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: JPG Converter - Convert JPG to SVG, PDF, ICO, GIF, BMP, PNG or WebP.

RepetiGo's JPG converter turns a JPG or JPEG image into one of seven formats - including a real, path-traced SVG, plus PDF, ICO, GIF, BMP, PNG, and WebP - free and in your browser. Upload one JPG or a whole batch, pick the output, and download. It is the all-in-one tool for the conversions people need most from a JPG, from making a document PDF to genuinely vectorising a logo into an SVG. Everything runs on your device, so nothing is uploaded to a server.
JPG is the world's most common photo format, but it is a fixed-pixel image, so there are many times you need it as something else - a scalable SVG, a PDF for a form, an ICO for a site icon, or a BMP for older software. Rather than hunting for a separate tool each time, this jpg converter handles them in one place. Below, each output is explained honestly, including exactly what the SVG tracing can and cannot do.

✓ Free · No sign-up · No watermark   ✓ JPG → SVG (real trace) · PDF · ICO · GIF · BMP · PNG · WebP   ✓ Batch + ZIP   ✓ 100% in your browser

H2: How to Convert a JPG in 3 Steps.
Here is how to convert a JPG with RepetiGo. Choose your target format and go.

Step
What You Do
What Happens
1. Upload your JPG(s)
Drop or select one or more JPG/JPEG files.
Each converts to PNG by default to start.
2. Choose the output
Pick SVG, PDF, ICO, GIF, BMP, PNG or WebP.
A helper note explains what that format gives you.
3. Download
Convert and download each file, or grab a ZIP.
You get the file in your chosen format.

🔒 Every conversion happens in your browser - your JPG files are never uploaded to RepetiGo or any server.

H2: The Seven Output Formats.
Here is what each output is for - and, where it matters, an honest note on exactly what you get.

Format
Best for
Note
SVG
Scaling a logo / simple graphic
Real vector tracing (fixed preset - see below)
PDF
Document uploads, sharing
Single page; image = full page
PNG
Lossless, editing
Handled by Convert from JPG too
WebP
Faster websites
Quality slider; see JPG to WebP tool
ICO
App / site icons
Single-size icon (not a multi-size favicon set)
GIF
A simple image as .gif
Single frame, 256 colours (not animated)
BMP
Legacy software
24-bit BMP

Only the WebP output has a quality slider; the others use their own encoding without a lossy quality setting. The SVG, GIF, and ICO outputs each have a caveat worth reading before you rely on them, covered below.

H2: Convert JPG to SVG - Real Vector Tracing.
This is the standout feature, and it is worth being precise about. Unlike some "image to SVG" tools that simply wrap your picture inside an SVG file without changing it, this converter performs genuine vector tracing: it analyses the image and redraws it as actual vector paths and shapes. The result is a true SVG made of scalable paths, not a raster hidden in an SVG container - so it can scale up cleanly the way a real vector should.
Two honest points so you get a good result. First, tracing uses a single built-in detail preset - there is no slider to fine-tune the level of detail or the number of colours, so you get one consistent trace rather than adjustable settings. Second, vector tracing works best on simple, flat images - logos, icons, line art, and bold graphics - where it can find clean shapes. A detailed photograph does not trace well: it has too many subtle colours and gradients to become tidy vector paths, so the result would be huge and messy. For a logo or a simple graphic, though, this genuinely turns your JPG into a scalable SVG.

✨ Real tracing (not a wrapper): your JPG becomes actual scalable vector paths. Best for logos, icons, and line art - a single fixed detail preset, and large images are traced at up to 1000px for performance. Detailed photos do not trace cleanly.

H2: Convert JPG to PDF.
Turning a JPG into a PDF is one of the most-used conversions, because so many forms, portals, and email workflows expect PDF documents. To convert JPG to PDF, upload the image, choose PDF, and download a single-page PDF with your photo embedded. It is the quick way to make a photo or scan into an uploadable document, and it covers the common convert JPG to PDF and how to convert JPG to PDF needs right in the browser.
One honest limit: it makes a single-page PDF from one image, where the page is sized to the image, and it does not combine several JPGs into one multi-page PDF here. If you need to merge many photos into a single paged document - a very common need - that is a job for a dedicated multi-image PDF tool. For turning one JPG into one PDF, this is exactly right.

📄 JPG → PDF is single-image, single-page, sized to the image. It does not merge multiple JPGs into one document - use a dedicated PDF tool for that.

H2: Convert JPG to ICO / Icon.
An ICO file is the classic Windows icon format for application icons and website favicons. To convert a JPG to an icon, upload a square JPG, choose ICO, and download the .ico file. The tool builds a genuine ICO that wraps your image, ready to use as an app or site icon. The honest caveat is the usual one: it makes a single-size .ico, not the full multi-size favicon bundle (16/32/48/256) that a fully standards-compliant favicon uses. For a basic icon it is perfect; for a complete favicon set, use a dedicated favicon generator. Start from a square image for the crispest result.

H2: Convert JPG to GIF - Single Frame.
You can convert a JPG to a GIF here, producing a single-frame, 256-colour GIF - not an animation. To convert JPG to GIF, upload the JPG, choose GIF, and download. The tool reduces the image to a 256-colour palette (how GIF works) and saves it as one still frame, which is right when you simply need a .gif of a static image. It does not create an animated GIF from multiple frames - that is a different feature this tool does not have. Also note that GIF's 256-colour limit can change the look of a colourful photo, so for a detailed image, PNG or WebP is usually a better choice.

⚠️ JPG → GIF is a SINGLE, still frame (256 colours) - not an animated GIF. For a colourful photo, PNG or WebP preserves the look better.

H2: Convert JPG to BMP.
BMP is an old, uncompressed bitmap format that some legacy software and specific workflows still require. To convert a JPG to BMP, upload it, choose BMP, and download. The tool uses a purpose-built 24-bit BMP encoder that writes a proper bitmap file. Because BMP is uncompressed, the file will be larger than the JPG - normal for the format. It is a handy conversion precisely because BMP support is rare in simple online tools.

H2: Convert JPG to PNG or WebP.
The converter can also output PNG and WebP. PNG gives you a lossless copy, useful for editing; WebP gives you a smaller file for the web, with a quality slider. Both are available here, but because these two conversions are so common, RepetiGo also has focused tools for them: Convert from JPG for a clean JPG-to-PNG, and JPG to WebP for web-optimised WebP with full quality control. Use whichever is handier - the dedicated tools are linked below.

H2: Batch Convert Multiple JPGs (with ZIP).
You are not limited to one file. Add as many JPGs as you like - each on its own card - pick your output format, and convert them all at once. Download each result individually or grab the whole set as a single ZIP, named for the format. If one file has a problem, it fails on its own without stopping the rest of the batch, so a large set converts reliably.

✅ Real batch support: convert a whole set of JPGs to your chosen format and download them as one ZIP - all in your browser, with per-file error handling.

H2: Everything Runs in Your Browser.
Like the rest of RepetiGo's image tools, the converter does all its work on your own device. Your JPG is read and re-encoded locally using the browser's canvas and purpose-built encoders - nothing is uploaded, and no server processes your file. That keeps your images private, works on a weak connection, and means there is no watermark and no account wall.

🔒 Client-side and private: your JPG files stay on your device, nothing is uploaded, and no watermark is added.

H2: ★ Indian Use Cases - Documents, Web & Design.
For users in India, JPG conversion spans documents, websites, and design work.

Scenario
Need
How to do it here
Portal wants a PDF
A photo/scan as a document
Convert JPG → PDF, then upload
Logo for print/web
A scalable vector of a simple logo
Convert JPG → SVG (real trace)
Website favicon
A .ico from an image
Convert JPG → ICO (single size)
Legacy software
A 24-bit bitmap
Convert JPG → BMP
Faster website
Smaller web images
Use the JPG to WebP tool (linked)

🇮🇳 Note: to hit a size limit like 100 KB, use /image-tools/compress-image; for a higher-resolution ("HD") image, use /image-tools/upscale-image - this converter changes format, not file size or resolution.

H2: What This Converter Does Not Do.
So you know whether it fits before you start, here is what this converter is not for - and where to go instead.

People often ask for…
The honest answer
Convert JPG to Word / Excel / PPT / text
No - those are documents/OCR, not image outputs
Convert JPG to TIFF, DXF or CDR
No - the vector output is SVG; no TIFF/CAD formats
Shrink a JPG to 100 KB / 50 KB
No - that is compression; use the Compress Image tool
Make a JPG "HD" / higher resolution
No - that is upscaling; use the Upscale Image tool
Merge many JPGs into one PDF
No - one JPG → one page; use a dedicated PDF tool
Adjust the SVG trace detail
No - tracing uses one fixed preset
An animated GIF / a multi-size favicon
No - GIF is one frame; ICO is one size

H2: JPG Converter - Frequently Asked Questions.
H3: Is this JPG converter free?
Yes - RepetiGo's JPG converter is completely free with no sign-up and no watermark. Because it converts in your browser rather than on a paid server, all seven outputs - SVG, PDF, ICO, GIF, BMP, PNG, and WebP - plus batch conversion with a ZIP are available at no cost. There is nothing to unlock.
H3: Does it really convert a JPG to a vector SVG?
Yes - it performs genuine vector tracing, redrawing the image as actual scalable paths rather than wrapping the raster in an SVG file. It works best on simple, flat images like logos, icons, and line art, where it can find clean shapes. A detailed photograph does not trace well, because it has too many colours and gradients to become tidy vector paths. Tracing uses a single fixed detail preset.
H3: How do I convert a JPG to PDF?
Upload the JPG, choose PDF, and download - you get a single-page PDF with your image embedded, sized to the image. It is ideal for a portal or form that only accepts PDF. Note it makes one PDF per image and does not merge several JPGs into a multi-page document; for that, use a dedicated PDF tool.
H3: Can I make an animated GIF from JPGs?
No - the GIF output is a single, still frame (256 colours), not an animation. Converting a JPG to GIF gives you a .gif of that one image; it does not combine several frames into a moving GIF. For a still .gif this works well, but for animation you would need a dedicated animated-GIF maker.
H3: Will the ICO work as a website favicon?
It works as a basic icon, with a caveat: the tool makes a single-size .ico, while a fully standards-compliant favicon bundles several sizes (16, 32, 48, 256px) in one file. For an app icon or a simple favicon it is fine; for a complete set, use a dedicated favicon generator. Start from a square image for the best result.
H3: Can it convert a JPG to PNG or WebP?
Yes - both are among the outputs. PNG gives a lossless copy; WebP gives a smaller web file with a quality slider. Because these are such common conversions, RepetiGo also has focused tools - Convert from JPG for JPG-to-PNG and JPG to WebP for web-optimised WebP - which are linked below. Use whichever is handier.
H3: Can it convert a JPG to Word, Excel, or TIFF?
No. The outputs are SVG, PDF, ICO, GIF, BMP, PNG, and WebP. It does not produce Word, Excel, PPT, or plain text (those need OCR/document tools), and it does not output TIFF or CAD formats like DXF or CDR. Its vector output is SVG, made by real tracing; for the others, this is not the right tool.
H3: How do I make my JPG 100 KB or HD?
This converter changes the format, not the file size or resolution. To reduce a JPG to a target size like 100 KB, use the Compress Image tool. To increase resolution for a sharper, larger ("HD") image, use the Upscale Image tool. Both are free and linked below; this tool is for converting a JPG into another format.
H3: Can I convert several JPGs at once?
Yes. Add as many JPGs as you like, choose an output format, and convert them all - then download each file or grab the whole set as a single ZIP named for the format. If one file has a problem it fails on its own without stopping the others, so large batches convert reliably.
H3: Are my JPG files uploaded to a server?
No. The converter runs entirely in your browser using the canvas and purpose-built encoders, so your JPG files never leave your device and nothing is sent to RepetiGo. That keeps your files private, works on a weak connection, and is why there is no watermark on your converted images.

H2: Related Image Tools.
Tool
What It Does
Link
Convert from JPG
Dedicated JPG → PNG (or WebP)
→ /image-tools/convert-from-jpg
JPG to WebP
Dedicated JPG → WebP (web speed)
→ /image-tools/jpg-to-webp
Compress Image
Reduce a JPG to a target KB size
→ /image-tools/compress-image
Upscale Image
Make a JPG higher-resolution
→ /image-tools/upscale-image
PNG Converter
The PNG-source equivalent
→ /image-tools/png-converter
All Image Tools
The complete image tools suite
→ /image-tools

[ Convert a JPG Free - to SVG, PDF, ICO & More → repetigo.com/image-tools/jpg-converter ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

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
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "🔁", "🔄", "★", "✨", "📄"];

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
  if (lines[0] === "Format" && lines[1] === "Best for" && lines[2] === "Note") return { headers: ["Format", "Best for", "Note"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Scenario" && lines[1] === "Need") return { headers: ["Scenario", "Need", "How to do it here"], rows: chunkRows(lines.slice(3), 3) };
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
    "/image-tools/convert-from-jpg": "/image-tools/convert-from-jpg",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/upscale-image": "/image-tools/upscale-image",
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
    "/image-tools/convert-from-jpg": "Open Convert from JPG",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/upscale-image": "Open Upscale Image",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo JPG Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based JPG converter - convert a JPG to a real path-traced SVG, PDF, ICO, GIF, BMP, PNG, or WebP, with batch conversion to a ZIP. Runs 100% in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to convert a JPG", step: [{ "@type": "HowToStep", name: "Upload your JPG(s)", text: "Drop or select one or more JPG/JPEG files." }, { "@type": "HowToStep", name: "Choose the output", text: "Pick SVG, PDF, ICO, GIF, BMP, PNG or WebP." }, { "@type": "HowToStep", name: "Download", text: "Convert and download each file, or grab a ZIP." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "JPG Converter", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
