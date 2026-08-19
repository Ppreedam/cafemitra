import type { Metadata } from "next";
import ImageConverterClient from "./ImageConverterClient";

const pageUrl = "https://repetigo.com/image-tools/image-converter";

export const metadata: Metadata = {
  title: "Image Converter Free - JPG, PNG, WebP, BMP, ICO & PDF | RepetiGo",
  description:
    "Free image converter - convert any image to JPG, PNG, WebP, BMP, ICO or PDF in your browser. Resize and set quality while you convert. No upload, no watermark.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Image Converter Free - JPG, PNG, WebP, BMP, ICO & PDF",
    description: "Convert any image to JPG, PNG, WebP, BMP, ICO or PDF in your browser. Resize and set quality.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Converter Free - 7 Output Formats",
    description: "Free image converter: JPG/PNG/WebP/BMP/ICO/PDF (+SVG wrapper). Resize, quality, 100% in-browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Image Converter - Convert Any Image to JPG, PNG, WebP, BMP, ICO or PDF.

RepetiGo's image converter is a free, browser-based tool that converts almost any image into one of seven formats: JPG, PNG, WebP, SVG, BMP, ICO, or PDF. Upload an image, pick the output format, optionally resize or set the quality, and download. A clear "source → target" badge shows exactly what you are converting, so there is no guesswork. Everything runs in your browser, so your image is never uploaded to a server.
It is the all-in-one image format converter for the conversions the single-purpose tools do not cover on their own - turning an image into WebP for the web, a BMP for older software, an ICO for an app or site icon, or a PDF for a document upload. As with all of RepetiGo's tools, there is no sign-up and no watermark. Below, each format is explained honestly, including exactly what the SVG output is (and is not).

✓ Free · No sign-up · No watermark   ✓ 7 outputs: JPG · PNG · WebP · SVG · BMP · ICO · PDF   ✓ Resize + quality options   ✓ 100% in your browser - nothing uploaded

H2: How to Convert an Image in 3 Steps.
Here is how to convert an image with RepetiGo. Pick your target format and go.

Step
What You Do
What Happens
1. Upload your image
Add any image file (or an .svg).
The tool reads it and shows the source format.
2. Choose the output
Pick JPG, PNG, WebP, SVG, BMP, ICO or PDF; set resize/quality.
The "source → target" badge confirms the conversion.
3. Download
Convert and download the result.
You get the file in your chosen format.

🔒 Every conversion happens in your browser - your image is never uploaded to RepetiGo or any server.

H2: The Seven Output Formats.
Here is what each output is for - and, where it matters, an honest note on exactly what you get.

Format
Best for
Note
JPG
Photos, small files, uploads
Quality slider (40–100%)
PNG
Lossless, sharp graphics
No transparency added to opaque sources
WebP
Modern web, small files
Quality slider (40–100%)
BMP
Legacy software needing bitmaps
24-bit BMP
ICO
App / site icons
Single-size icon (not a multi-size favicon set)
SVG
An .svg file that contains your image
Wrapper only - NOT vectorised (see below)
PDF
Documents, uploads
Single page; page size = image size

The JPG, PNG, and WebP outputs are standard raster conversions. The BMP, ICO, SVG, and PDF outputs use purpose-built encoders, and two of them - SVG and ICO - come with important caveats explained below so you get exactly what you expect.

H2: Convert an Image to WebP.
WebP is a modern format that produces noticeably smaller files than JPG or PNG at similar quality, which is why it is popular for websites. To convert an image to WebP, upload it, choose WebP as the output, and use the quality slider (40–100%) to balance size against detail. It is a quick way to shrink images for a faster-loading site without a visible drop in quality.
Because this converter accepts almost any image type, you can convert a PNG, JPG, BMP, or other image to WebP in one step. If you specifically want to go from a JPG to WebP or WebP to PNG, the Convert from JPG tool is a focused option too - but for any-to-WebP, this converter handles it.

H2: Convert an Image to ICO / Icon.
An ICO file is the classic Windows icon format, used for application icons and website favicons. To convert an image to an icon, upload a square image (icons look best square), choose ICO as the output, and download the .ico file. The tool builds a genuine ICO that wraps your image, ready to use as an app or site icon.
One honest and important caveat: this creates a single-size .ico file. A full website favicon technically wants several sizes bundled into one file (16×16, 32×32, 48×48, and 256×256), so browsers can pick the right one. This tool makes a single-resolution icon, which works fine in many cases, but is not the complete multi-size favicon set. For a basic app or site icon, it is perfect; for a fully standards-compliant favicon bundle, you would use a dedicated favicon generator.

💡 For an icon: start from a square image at a good size (e.g. 256×256) so the .ico is crisp. Note it is a single-size icon, not the full multi-resolution favicon bundle.

H2: Convert an Image to BMP.
BMP is an old, uncompressed bitmap format that some legacy software, embedded systems, and specific workflows still require. To convert an image to BMP, upload it, choose BMP, and download. The tool uses a purpose-built 24-bit BMP encoder, producing a standard bitmap from your image's pixels. Because BMP is uncompressed, the file will be larger than a JPG or PNG - that is expected for the format.
This is one of the tool's most useful conversions precisely because BMP support is rare in simple online tools. If a program specifically asks for a 24-bit .bmp, this produces exactly that, in your browser, with no software to install.

H2: Convert an Image to PDF.
Turning an image into a PDF is handy when a portal or form only accepts PDF documents. To convert an image to PDF, upload it, choose PDF as the output, and download a single-page PDF with your image embedded. It is a fast way to make a photo or scan into an uploadable document. This covers the common "convert image to PDF" and "how to convert an image to PDF" needs directly.
Two honest limits to know. First, it makes a single-page PDF from one image - it does not combine several images into a multi-page PDF here. Second, the PDF page size matches your image's dimensions rather than a fixed A4 or Letter page, so the document is sized to the picture. For a straightforward image-to-PDF, that is exactly right; if you need multiple images merged into one paged document at A4, that is a different, dedicated PDF tool's job.

📄 Image → PDF here is single-image, single-page, sized to the image. It does not merge multiple images or use A4/Letter pages - use a dedicated PDF tool for those.

H2: About the SVG Output - It Is Not Vectorization.
This is the most important thing to understand about the converter, because it is easy to misread. The SVG output does not vectorise your image. When people convert an image to SVG they usually want true vectorization - tracing the picture into scalable paths and shapes that stay crisp at any size, the kind of file you would use for a logo or a Cricut cutting project. This tool does not do that.
What it actually produces is an SVG file that embeds your original raster image inside it (as an <image> element). The result is a valid .svg file, but it is not scalable in the true vector sense - zoom in and it will pixelate just like the original image, because it is still a raster picture wrapped in an SVG container. So if you only need a file with an .svg extension that holds your image, this works; but if you need genuine vector paths for scaling, cutting, or logo work, this is not the right output, and a dedicated vectorization tool is what you want. We would rather tell you that up front than have you download an SVG that does not behave the way you expected.

⚠️ Honest note: the SVG output wraps your raster image in an SVG file - it does NOT trace it into scalable vector paths. It is not suitable for Cricut, true logo scaling, or vector editing. For that, use a real vectorization tool.

H2: Resize, Quality & Auto-Orient Options.
While converting, you can also adjust a few things. The resize option lets you keep the original size or scale down to 75%, 50%, 25%, or a maximum of 1920px on the longest edge - handy for shrinking a large image as you convert it. The quality slider (40–100%) applies to JPG and WebP outputs, letting you trade file size against detail.
There is also an Auto-Orient option, which rotates the image to its correct orientation based on how it was captured - useful for phone photos that would otherwise appear sideways. One technical note: metadata such as EXIF is always removed during conversion (a side effect of how the browser exports the image), so the converted file will not carry the original's embedded camera data or location tags. For most people that is a privacy bonus; just know it is not something you can turn off here.

H2: ★ Use Cases - Web, Favicons & Documents.
A universal converter earns its place across web, design, and document tasks.

Need
Format
Why
Faster website images
WebP
Smaller files than JPG/PNG at similar quality
App or site icon
ICO
Turn a square logo into an .ico icon
Legacy software input
BMP
Some programs require a 24-bit bitmap
Upload a photo as a document
PDF
Portals that only accept PDF
Lossless graphic
PNG
Crisp, lossless output
Shrink while converting
Any + resize
Scale down to 1920px or a percentage

🇮🇳 Tip: converting a photo to PDF is handy for portals that only take PDF documents; to hit a size limit afterwards, compress at /image-tools/compress-image.

H2: Everything Runs in Your Browser.
Like the rest of RepetiGo's image tools, the converter does all its work on your own device. Your image is read and re-encoded locally using the browser's canvas and purpose-built encoders - nothing is uploaded, and no server processes your file. That keeps your images private, works on a weak connection, and, combined with the automatic metadata stripping, means the converted file carries none of the original's embedded EXIF data. There is no watermark and no account wall.

🔒 Client-side and private: your image stays on your device, nothing is uploaded, EXIF metadata is stripped, and no watermark is added.

H2: What This Converter Does Not Do.
So you know whether it fits before you start, here is what this converter is not for - and where to go instead.

People often expect…
The honest answer
Vectorise an image to a true SVG
No - the SVG output embeds the raster, it does not trace it
A full multi-size favicon (16/32/48/256)
No - the .ico is a single size
Merge many images into one A4 PDF
No - one image → one page, sized to the image
Extract text from an image (OCR)
No - this converts formats, not image → text
Convert a PDF into images
No - PDF is not an accepted input
Convert to Word / Excel
No - outputs are image formats and PDF only
Batch-convert many files, or keep EXIF
No - one file at a time; metadata is always stripped

For converting specifically TO JPG (from HEIC, WebP, PNG and more) or FROM a JPG to PNG/WebP, the dedicated Convert to JPG and Convert from JPG tools are focused options, and PNG to JPG has its own page. All are linked below.

H2: Image Converter - Frequently Asked Questions.
H3: Is this image converter free?
Yes - RepetiGo's image converter is completely free with no sign-up and no watermark. Because it converts in your browser rather than on a paid server, all seven output formats - JPG, PNG, WebP, SVG, BMP, ICO, and PDF - plus the resize and quality options are available at no cost. There is nothing to unlock.
H3: What formats can I convert to?
Seven: JPG, PNG, WebP, SVG, BMP, ICO, and PDF. You can start from almost any image type (plus .svg). The JPG, PNG, and WebP outputs are standard conversions; BMP is a 24-bit bitmap; ICO is a single-size icon; PDF is a single page sized to your image; and the SVG output wraps your raster image in an .svg file rather than vectorising it.
H3: Does the SVG output vectorise my image?
No - this is important. The SVG output embeds your original raster image inside an .svg file; it does not trace it into scalable vector paths. Zoom in and it pixelates like any raster. It is fine if you just need a file with an .svg extension that contains your image, but for true vectorization - for Cricut, logos, or infinite scaling - use a dedicated vectorization tool instead.
H3: Will the ICO work as a website favicon?
It will work as a basic icon, but with a caveat: the tool makes a single-size .ico, while a fully standards-compliant favicon bundles several sizes (16, 32, 48, and 256px) in one file. For an app icon or a simple favicon, the single-size .ico is fine; for a complete multi-size favicon set, use a dedicated favicon generator. Start from a square image for the best result.
H3: How do I convert an image to PDF?
Upload the image, choose PDF as the output, and download - you get a single-page PDF with your image embedded, sized to the image's dimensions. It is ideal for a portal that only accepts PDF. Note it does not merge several images into a multi-page document or use A4/Letter pages; for that, a dedicated PDF tool is the right choice.
H3: Can I convert an image to BMP or WebP?
Yes. Choose BMP for a 24-bit uncompressed bitmap that legacy software may require, or WebP for a small, modern web file with a quality slider. Both start from almost any image type. BMP files will be larger because the format is uncompressed; WebP files are usually much smaller than the original.
H3: Can I convert several images at once?
No - the converter handles one file at a time; there is no batch mode or ZIP download. Convert an image, download it, then do the next one. If you need to shrink many files, the Compress Image tool supports multiple files and a ZIP; for converting specifically to or from JPG, the dedicated converters are linked below.
H3: Does it keep the image's EXIF/metadata?
No - metadata such as EXIF, colour profiles, and comments is always removed during conversion, as a side effect of how the browser re-encodes the image. There is no working option to preserve it here. For most people this is a privacy benefit, since location and camera data are stripped, but if you specifically need to keep metadata, this tool is not the right choice.
H3: Can it extract text from an image or convert a PDF?
No to both. This tool converts image formats - it does not do OCR (image to text), and it does not accept a PDF as input to turn into images. It also does not output Word or Excel. It is focused on converting an image into another image format, or into a single-page PDF.
H3: Are my images uploaded to a server?
No. The converter runs entirely in your browser using canvas and purpose-built encoders, so your image never leaves your device and nothing is sent to RepetiGo. That keeps your files private, works on a weak connection, and is why there is no watermark on your converted image.

H2: Related Image Tools.
Tool
What It Does
Link
Convert to JPG
Convert HEIC/WebP/PNG/SVG/BMP/GIF → JPG
→ /image-tools/convert-to-jpg
Convert from JPG
Convert a JPG → PNG or WebP
→ /image-tools/convert-from-jpg
PNG to JPG
Dedicated PNG → JPG converter
→ /image-tools/png-to-jpg
Compress Image
Shrink the converted file (batch + ZIP)
→ /image-tools/compress-image
Resize Image
Precise pixel resizing
→ /image-tools/resize-image
All Image Tools
The complete image tools suite
→ /image-tools

[ Convert an Image Free - 7 Formats → repetigo.com/image-tools/image-converter ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function ImageConverterPage() {
  return (
    <ImageConverterClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="image-converter-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </ImageConverterClient>
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
  if (lines[0] === "Need" && lines[1] === "Format" && lines[2] === "Why") return { headers: ["Need", "Format", "Why"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "People often expect…" || lines[0] === "People often expect...") return { headers: ["People often expect…", "The honest answer"], rows: chunkRows(lines.slice(2), 2) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#image-converter-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/image-converter": "/image-tools/image-converter",
    "/image-tools/convert-to-jpg": "/image-tools/convert-to-jpg",
    "/image-tools/convert-from-jpg": "/image-tools/convert-from-jpg",
    "/image-tools/png-to-jpg": "/image-tools/png-to-jpg",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/image-converter": "Open Image Converter",
    "/image-tools/convert-to-jpg": "Open Convert to JPG",
    "/image-tools/convert-from-jpg": "Open Convert from JPG",
    "/image-tools/png-to-jpg": "Open PNG to JPG",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Image Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based image converter - convert any image to JPG, PNG, WebP, SVG, BMP, ICO, or PDF, with resize and quality options. Runs 100% in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to convert an image", step: [{ "@type": "HowToStep", name: "Upload your image", text: "Add any image file (or an .svg)." }, { "@type": "HowToStep", name: "Choose the output", text: "Pick JPG, PNG, WebP, SVG, BMP, ICO or PDF; set resize/quality." }, { "@type": "HowToStep", name: "Download", text: "Convert and download the result." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Image Converter", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
