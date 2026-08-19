import type { Metadata } from "next";
import PngConverterClient from "./PngConverterClient";

const pageUrl = "https://repetigo.com/image-tools/png-converter";

export const metadata: Metadata = {
  title: "PNG Converter Free - PNG to PDF, WebP, ICO, GIF & BMP | RepetiGo",
  description:
    "Free PNG converter - convert PNG to PDF, WebP, ICO, GIF or BMP in your browser. Batch-convert and download a ZIP. No upload, no watermark, nothing to install.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "PNG Converter Free - PNG to PDF, WebP, ICO, GIF & BMP",
    description: "Convert PNG to PDF, WebP, ICO, GIF or BMP in your browser. Batch + ZIP, nothing uploaded.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "PNG Converter Free - PNG to 6 Formats",
    description: "Free PNG converter: PDF/WebP/ICO/GIF/BMP/JPG. Batch + ZIP, 100% in your browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: PNG Converter - Convert PNG to PDF, WebP, ICO, GIF, BMP or JPG.

RepetiGo's PNG converter turns a PNG image into one of six formats - PDF, WebP, ICO, GIF, BMP, or JPG - free and in your browser. Upload one PNG or a whole batch, pick the output format, and download. It is the all-in-one tool for the conversions people need most from a PNG: a PDF for a document upload, a WebP for a faster website, an ICO for an app or site icon, and more. Everything runs on your device, so nothing is uploaded to a server.
PNG is a great lossless format, but plenty of situations call for something else - a portal that wants a PDF, a website that needs WebP, or software that requires a BMP. Rather than hunting for a different tool each time, this png converter handles them all in one place. Below, each output is explained honestly, including exactly what you get for GIF and ICO.

✓ Free · No sign-up · No watermark   ✓ PNG → PDF · WebP · ICO · GIF · BMP · JPG   ✓ Batch + ZIP   ✓ 100% in your browser - nothing uploaded

H2: How to Convert a PNG in 3 Steps.
Here is how to convert a PNG with RepetiGo. Choose your target format and go.

Step
What You Do
What Happens
1. Upload your PNG(s)
Drop or select one or more .png files.
Each converts to JPG at 90% by default to start.
2. Choose the output
Pick PDF, WebP, ICO, GIF, BMP or JPG; set quality for JPG/WebP.
A helper note explains what that format gives you.
3. Download
Convert and download each file, or grab a ZIP.
You get the file in your chosen format.

🔒 Every conversion happens in your browser - your PNG files are never uploaded to RepetiGo or any server.

H2: The Six Output Formats.
Here is what each output is for - and, where it matters, an honest note on exactly what you get.

Format
Best for
Note
PDF
Document uploads, sharing
Single page; image = full page
WebP
Faster websites, smaller files
Quality slider (40–100%)
JPG
Photos, small files, portals
Quality slider; transparency → white
ICO
App / site icons
Single-size icon (not a multi-size favicon set)
GIF
A simple image as .gif
Single frame, 256 colours (not animated)
BMP
Legacy software needing bitmaps
24-bit BMP

The JPG and WebP outputs have a quality slider; GIF, BMP, ICO, and PDF do not, because those formats do not use the same lossy quality setting. Two outputs - GIF and ICO - come with caveats worth reading before you rely on them, covered below.

H2: Convert PNG to PDF.
Turning a PNG into a PDF is one of the most useful conversions, because so many portals, forms, and email workflows expect PDF documents. To convert PNG to PDF, upload the image, choose PDF as the output, and download a single-page PDF with your image embedded. It is the quick way to make a screenshot, scan, or graphic into an uploadable document. This covers the common convert PNG to PDF and how to convert PNG to PDF needs directly, right in the browser.
One honest note on the format: it produces a single-page PDF where the page is sized to your image, rather than a fixed A4 or Letter page, and it converts one PNG into one PDF. There is no option to set margins, orientation, or combine several PNGs into a multi-page PDF here. For a straightforward PNG-to-PDF, that is exactly what you want; if you need to merge many images into one paged document, that is a job for a dedicated PDF tool.

📄 PNG → PDF is single-image, single-page, sized to the image. No margins, A4/Letter, or multi-image merge - use a dedicated PDF tool for those.

H2: Convert PNG to WebP.
WebP makes noticeably smaller files than PNG at similar quality, which is why it is popular for websites - smaller images mean faster pages. To convert PNG to WebP, upload the file, choose WebP as the output, and use the quality slider (40–100%) to balance size against detail. It is an easy way to shrink heavy PNGs for a site without a visible quality drop, and the quality slider gives you control that the lossless formats do not need.

H2: Convert PNG to ICO / Icon.
An ICO file is the classic Windows icon format, used for application icons and website favicons. To convert a PNG to an icon, upload a square PNG (icons look best square), choose ICO as the output, and download the .ico file. The tool builds a genuine ICO that wraps your image, ready to use as an app or site icon.
The honest caveat, the same as with any single-step icon maker: this creates a single-size .ico file. A fully standards-compliant website favicon bundles several sizes (16×16, 32×32, 48×48, 256×256) into one file so browsers can pick the right one. This tool makes a single-resolution icon, which works for many uses but is not the complete multi-size favicon set. For a basic app or site icon it is perfect; for a full favicon bundle, use a dedicated favicon generator. Start from a good-sized square PNG for the crispest result.

💡 For an icon, start from a square PNG (e.g. 256×256). Note the .ico is a single size - great as an app/site icon, but not the full multi-size favicon bundle.

H2: Convert PNG to GIF - Single Frame.
You can convert a PNG to a GIF here, with one important thing to understand: it produces a single-frame, 256-colour GIF - not an animation. To convert PNG to GIF, upload the PNG, choose GIF, and download. The tool reduces the image to a 256-colour palette (which is how GIF works) and saves it as one still frame. That is exactly right when you simply need a .gif version of a static image.
What it does not do is create an animated GIF. If you were hoping to combine several PNG frames into a moving GIF, that is a different feature this tool does not have - it converts one PNG into one still GIF. Also note that GIF's 256-colour limit can shift the look of a photo with many colours, so for detailed images WebP or JPG is usually a better choice than GIF.

⚠️ PNG → GIF is a SINGLE, still frame (256 colours) - it does NOT make an animated GIF from multiple PNGs. For a photo with many colours, WebP or JPG keeps the look better.

H2: Convert PNG to BMP.
BMP is an old, uncompressed bitmap format that some legacy software and specific workflows still require. To convert a PNG to BMP, upload it, choose BMP, and download. The tool uses a purpose-built 24-bit BMP encoder that writes a proper bitmap file from your image. Because BMP is uncompressed, the file will be larger than the PNG - that is normal for the format. It is a handy conversion precisely because BMP support is rare in simple online tools.

H2: Quality & Transparency Notes.
A couple of details help you get the result you expect. The quality slider (40–100%) appears only for JPG and WebP outputs, because those are the formats where you trade file size against detail; for GIF, BMP, ICO, and PDF there is no such setting, so the slider is hidden. The default is a high 90% for JPG and WebP, which suits most uses.
On transparency: PNG supports it, but not every output format does. When you convert a PNG with a transparent background to JPG, the transparent areas are filled with white, because JPG cannot store transparency. WebP and GIF handle transparency differently, and PDF places the image on a page. If keeping a transparent background is essential, JPG is not the right output - but for most document and web uses, these behaviours are exactly what you want.

H2: Batch Convert Multiple PNGs (with ZIP).
You are not limited to one file. Add as many PNGs as you like - each gets its own card - pick your output format, and convert them all at once. Download each result individually or grab the whole set as a single ZIP, named for the format so you know what is inside. If one file has a problem, it fails on its own without stopping the rest of the batch, so a large set converts reliably.

✅ Real batch support: convert a whole set of PNGs to your chosen format and download them as one ZIP - all in your browser, with per-file error handling.

H2: ★ Indian Use Cases - Documents & Web.
For users in India, PNG conversion is a daily need - especially turning images into PDFs for the many portals and forms that require documents.

Scenario
Need
How to do it here
Portal wants a PDF
A screenshot/scan as a document
Convert PNG → PDF, then upload
Faster website
Heavy PNGs slow the site
Convert PNG → WebP with the quality slider
Website favicon / app icon
A .ico from a logo
Convert PNG → ICO (single size)
Portal wants JPG
A flat JPG image
Use the PNG to JPG tool (linked)
Legacy software
A 24-bit bitmap
Convert PNG → BMP

🇮🇳 Document tip: convert a screenshot or scan PNG to PDF here for a portal upload; if the PDF or image must be under a size limit, compress first at /image-tools/compress-image.

H2: What This Converter Does Not Do.
So you know whether it fits before you start, here is what this converter is not for - and where to go instead.

People often ask for…
The honest answer
Convert PNG to JPG
Yes it can - but the dedicated PNG to JPG tool is the focused option
Convert PNG to SVG (vectorise)
No - there is no SVG output; this does not vectorise
Convert PNG to TIFF, CDR, DXF, PSD or a CAD format
No - the outputs are PDF/WebP/ICO/GIF/BMP/JPG only
Convert PNG to Word / Excel / PPT
No - those are documents, not image outputs
Make an animated GIF from several PNGs
No - GIF output is a single still frame
A full multi-size favicon (16/32/48/256)
No - the .ico is a single size
Convert another format INTO a PNG
No - input here is PNG only (see reverse tools)

H2: PNG Converter - Frequently Asked Questions.
H3: Is this PNG converter free?
Yes - RepetiGo's PNG converter is completely free with no sign-up and no watermark. Because it converts in your browser rather than on a paid server, all six outputs - PDF, WebP, ICO, GIF, BMP, and JPG - plus batch conversion with a ZIP are available at no cost. There is nothing to unlock.
H3: How do I convert a PNG to PDF?
Upload the PNG, choose PDF as the output, and download - you get a single-page PDF with your image embedded, sized to the image. It is ideal for a portal or form that only accepts PDF documents. Note it makes one PDF per image and does not merge several PNGs into a multi-page document; for that, use a dedicated PDF tool.
H3: How do I convert a PNG to WebP?
Upload the PNG, choose WebP, and use the quality slider (40–100%) to balance size against detail. WebP makes much smaller files than PNG at similar quality, which is great for speeding up a website. The quality slider appears for WebP and JPG only, since those are the formats where the size-versus-detail trade-off applies.
H3: Can I make an animated GIF from PNGs?
No - the GIF output is a single, still frame (256 colours), not an animation. Converting a PNG to GIF gives you a .gif version of that one image; it does not combine several PNG frames into a moving GIF. If you need a still .gif, this works well, but for animation you would need a dedicated animated-GIF maker.
H3: Will the ICO work as a website favicon?
It works as a basic icon, with a caveat: the tool makes a single-size .ico, while a fully standards-compliant favicon bundles several sizes (16, 32, 48, 256px) in one file. For an app icon or a simple favicon it is fine; for a complete multi-size favicon set, use a dedicated favicon generator. Start from a square PNG for the best result.
H3: Can it convert a PNG to JPG?
Yes - JPG is one of the six outputs, and transparent areas are filled white since JPG has no transparency. That said, if converting to JPG is your main goal, the dedicated PNG to JPG tool is the focused option and is linked below. Use this converter when you want PDF, WebP, ICO, GIF, or BMP, or the convenience of choosing among all of them.
H3: Can it convert PNG to SVG, TIFF, or a CAD format?
No. The outputs are PDF, WebP, ICO, GIF, BMP, and JPG only. It does not produce SVG (it does not vectorise a PNG), TIFF, or CAD/vector formats like CDR, DXF, DWG, or PSD. If you need one of those, this is not the right tool; it is focused on the six common outputs above.
H3: What happens to transparency?
It depends on the output. Converting a transparent PNG to JPG fills the transparent areas with white, because JPG cannot store transparency. WebP and GIF handle transparency in their own way, and PDF places the image on a page. If keeping a transparent background is essential, avoid JPG output; for most document and web uses, the default behaviour is what you want.
H3: Can I convert several PNGs at once?
Yes. Add as many PNGs as you like, choose an output format, and convert them all - then download each file or grab the whole set as a single ZIP named for the format. If one file has a problem it fails on its own without stopping the others, so large batches convert reliably in one go.
H3: Are my PNG files uploaded to a server?
No. The converter runs entirely in your browser using the canvas and purpose-built encoders, so your PNG files never leave your device and nothing is sent to RepetiGo. That keeps your files private, works on a weak connection, and is why there is no watermark on your converted images.

H2: Related Image Tools.
Tool
What It Does
Link
PNG to JPG
Dedicated PNG → JPG converter
→ /image-tools/png-to-jpg
WebP to PNG
The reverse: WebP → lossless PNG
→ /image-tools/webp-to-png
Image Converter
Convert any image between formats
→ /image-tools/image-converter
Compress Image
Shrink the converted file (batch + ZIP)
→ /image-tools/compress-image
Resize Image
Precise pixel resizing
→ /image-tools/resize-image
All Image Tools
The complete image tools suite
→ /image-tools

[ Convert a PNG Free - to PDF, WebP, ICO & More → repetigo.com/image-tools/png-converter ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function PngConverterPage() {
  return (
    <PngConverterClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="png-converter-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </PngConverterClient>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "🔁", "🔄", "★", "📄"];

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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#png-converter-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/png-converter": "/image-tools/png-converter",
    "/image-tools/png-to-jpg": "/image-tools/png-to-jpg",
    "/image-tools/webp-to-png": "/image-tools/webp-to-png",
    "/image-tools/image-converter": "/image-tools/image-converter",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/products/printpilot": "/print-automation",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/png-converter": "Open PNG Converter",
    "/image-tools/png-to-jpg": "Open PNG to JPG",
    "/image-tools/webp-to-png": "Open WebP to PNG",
    "/image-tools/image-converter": "Open Image Converter",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PNG Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based PNG converter - convert a PNG to PDF, WebP, ICO, GIF, BMP, or JPG, with batch conversion to a ZIP. Runs 100% in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to convert a PNG", step: [{ "@type": "HowToStep", name: "Upload your PNG(s)", text: "Drop or select one or more .png files." }, { "@type": "HowToStep", name: "Choose the output", text: "Pick PDF, WebP, ICO, GIF, BMP or JPG; set quality for JPG/WebP." }, { "@type": "HowToStep", name: "Download", text: "Convert and download each file, or grab a ZIP." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "PNG Converter", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
