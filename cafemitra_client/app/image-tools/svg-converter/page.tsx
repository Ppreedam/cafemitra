import type { Metadata } from "next";
import SvgConverterClient from "./SvgConverterClient";

const pageUrl = "https://repetigo.com/image-tools/svg-converter";

export const metadata: Metadata = {
  title: "SVG Converter Free - Convert SVG to PNG or JPG (up to 8×) | RepetiGo",
  description:
    "Free SVG converter - turn SVG files into PNG or JPG in your browser, scaled up to 8× for a crisp, high-resolution image. Batch-convert and download a ZIP.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "SVG Converter Free - Convert SVG to PNG or JPG (up to 8×)",
    description: "Turn SVG files into PNG or JPG, scaled up to 8× for a crisp image. Batch + ZIP, in your browser.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "SVG Converter Free - SVG to PNG or JPG",
    description: "Free SVG→PNG/JPG. Scale up to 8×, transparency preserved, batch + ZIP, 100% in your browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: SVG Converter - Convert SVG to PNG or JPG, up to 8× Resolution.

RepetiGo's SVG converter turns SVG files into standard PNG or JPG images, free and in your browser. Because an SVG is a vector, the tool can render it at up to 8× its native size, giving you a crisp, high-resolution raster image from even a tiny SVG. Drop in one file or many, choose your scale and format, and download - nothing is uploaded to a server.
SVG is perfect for the web and design, but plenty of places do not accept it - social platforms, many apps, documents, and some older software all want a PNG or JPG. This tool bridges that gap: convert SVG to PNG when you need transparency, or convert SVG to JPG when you want a simple flat image. And because it renders the vector at your chosen scale rather than just embedding it, the output is genuinely sharp at large sizes.

✓ Free · No sign-up · No watermark   ✓ SVG → PNG or JPG   ✓ Scale 1× / 2× / 4× / 8×   ✓ Batch + ZIP · 100% in your browser

H2: How to Convert an SVG in 3 Steps.
Here is how to convert an SVG to PNG or JPG with RepetiGo. It starts as soon as you add a file.

Step
What You Do
What Happens
1. Upload your SVG(s)
Drop or select one or more .svg files.
Each renders to PNG at 4× automatically; a card shows the dimensions.
2. Set scale & format
Choose 1×/2×/4×/8× and PNG or JPG.
The dropdown previews the exact output pixel size.
3. Download
Download each image, or grab them all as a ZIP.
Files save as .png or .jpg at your chosen resolution.

🔒 The rendering happens in your browser on a canvas - your SVG files are never uploaded to RepetiGo or any server.

H2: Scale Up to 8× for a Crisp, High-Resolution Image.
This is what makes converting an SVG special. Because an SVG describes shapes mathematically rather than as fixed pixels, it can be drawn at any size without losing sharpness. RepetiGo takes advantage of that: instead of just copying the SVG at its small native size, it renders the vector onto a canvas at the scale you pick - 1×, 2×, 4× (the default), or 8× - so an icon defined at 64px can become a clean 512px PNG at 8×, with crisp edges.
The scale dropdown shows the exact pixel dimensions you will get for each option, so you can pick the resolution you need. This is genuinely useful when you need a high-resolution PNG of a logo or icon for print, a presentation, or a retina display - you get a large, sharp image from a small vector file, which a simple screenshot or a 1× export could never match. High-quality smoothing keeps the result clean.

💡 Need a big, sharp image from a small SVG? Pick 8× - the dropdown shows the exact output pixels. Great for print, retina screens, and large icons.

H2: PNG or JPG Output - Which to Choose.
You can render your SVG to either PNG or JPG, and the right choice depends on the background. PNG preserves transparency - if your SVG has a transparent background (most icons and logos do), the PNG keeps it transparent, so the graphic sits cleanly on any colour. JPG does not support transparency, so any transparent areas are filled with white, giving you a flat image on a white background.

Output
Transparency
Best for
PNG
Preserved (transparent stays transparent)
Icons, logos, graphics for any background
JPG
Filled white
Flat images where a white background is fine

As a rule: choose PNG for icons and logos where you want the background to stay clear, and JPG when you specifically want a flat image or a smaller file and do not need transparency. The quality is set at a high fixed level for both, so you do not need to fiddle with settings.

H2: Convert SVG to PNG.
Converting SVG to PNG is the most common need, because PNG keeps the transparency that most SVG icons and logos rely on. To convert an SVG to PNG, upload the file, keep PNG selected, pick your scale, and download. The transparent parts of the SVG stay transparent in the PNG, so your icon or logo drops onto any background without a white box behind it.
This is the go-to when a platform, app, or document needs a PNG but you only have the vector. Rendered at 4× or 8×, the PNG is sharp enough for large uses too. Whether you search for how to convert SVG to PNG on Windows or on a Mac, the answer here is the same: it runs in the browser on any device, with no software to install.

H2: Convert SVG to JPG.
Sometimes you want a plain, flat image rather than a transparent one - for a document, an email, or a platform that prefers JPG. To convert an SVG to JPG, upload the file, choose JPG as the output, pick your scale, and download. Any transparent areas in the SVG become white in the JPG, giving you a clean flat image. It is a quick way to turn a vector graphic into a universally-accepted JPG at whatever resolution you need.

H2: Batch Convert Multiple SVGs (with ZIP Download).
If you have a set of SVGs - an icon pack, a folder of logos - you do not need to convert them one by one. Add as many SVG files as you like, each on its own card showing its source and output dimensions, and keep adding more. Convert them all at your chosen scale and format, then download each individually or grab the whole set as a single ZIP (named for the format, so you know what is inside).

✅ Real batch support: convert a whole set of SVGs to PNG or JPG at once and download them as one ZIP - all in your browser, nothing uploaded.

H2: Everything Runs in Your Browser.
Like the rest of RepetiGo's image tools, the SVG converter does all its work on your own device. Your SVG is parsed and rendered to a PNG or JPG locally using the browser's canvas - nothing is uploaded, and no server processes your files. That keeps your graphics private, works on a weak connection, and is why the tool carries a "Files stay in your browser" badge. There is no watermark and no account wall.

🔒 Client-side and private: your SVG files stay on your device, nothing is uploaded, and no watermark is added.

H2: ★ Use Cases - Icons, Logos & High-Res Exports.
Turning an SVG into a raster image comes up constantly in web, design, and print work.

Who
What they convert
Why
Web designers
SVG icons → PNG
Use icons where SVG is not supported
Brand / marketing
SVG logo → PNG or JPG
Drop a logo into docs, slides, or emails
Print shops
SVG → PNG at 8×
A high-resolution raster for printing
App makers
SVG → PNG at set scales
Raster assets from a vector source
Anyone with an SVG
SVG → JPG
A flat image a platform will accept

🇮🇳 Tip: render a vector logo at 8× for a crisp PNG, then compress it at /image-tools/compress-image if the high-res file is larger than you need.

H2: What This Converter Does Not Do.
So you know whether it fits before you start, here is what this converter is not for - and where to go instead.

People often expect…
The honest answer
Convert an image TO an SVG (vectorise)
No - this converts FROM svg to PNG/JPG, it does not vectorise
Output WebP, PDF, DXF, STL, EPS or ICO
No - the outputs are PNG and JPG only
Type exact pixel dimensions
No - you choose 1×/2×/4×/8× of the SVG size
A background colour other than white for JPG
No - JPG transparency is filled white
Export an icon set of many sizes at once
No - one scale per run
A quality slider
No - quality is set to a high fixed level
Keep an animated SVG moving
No - only a static frame is captured

H2: SVG Converter - Frequently Asked Questions.
H3: Is this SVG converter free?
Yes - RepetiGo's SVG converter is completely free with no sign-up and no watermark. Because it converts in your browser rather than on a paid server, you can convert SVG files to PNG or JPG, at up to 8× scale, in a batch, at no cost. There is nothing to unlock.
H3: How do I convert an SVG to PNG?
Upload your SVG, keep PNG selected as the output, choose a scale (1×, 2×, 4×, or 8×), and download. The transparent parts of the SVG stay transparent in the PNG. Rendering at a higher scale gives you a larger, sharper image - 8× turns a small icon into a high-resolution PNG. It works in any browser on Mac or Windows.
H3: How do I get a high-resolution PNG from an SVG?
Choose a higher scale before converting. Because an SVG is a vector, the tool can render it at 2×, 4×, or 8× its native size without losing sharpness, and the dropdown shows the exact output pixels. Pick 8× for the largest, crispest result - ideal for print, retina screens, or large icons - then download the PNG.
H3: Should I convert to PNG or JPG?
Choose PNG if your SVG has a transparent background you want to keep - icons and logos usually do - because PNG preserves transparency. Choose JPG for a flat image where a white background is fine; JPG fills transparent areas with white. For most SVG icons and logos, PNG is the better choice.
H3: Can I convert an image or PNG into an SVG here?
No - this tool works the other way round. It converts an SVG into a PNG or JPG (turning a vector into a raster image); it does not turn a PNG, JPG, or photo into an SVG. Converting a raster image into a true SVG is vectorization, which is a different kind of tool. This converter is for going from SVG to a standard image.
H3: Can I convert several SVGs at once?
Yes. Add as many SVG files as you like and convert them all to PNG or JPG at your chosen scale, then download each one or grab the whole set as a single ZIP. Each file shows its source and output dimensions on its own card, so batch-converting an icon pack or a folder of logos is quick.
H3: Does it keep the SVG's transparency?
Yes, when you choose PNG output - transparent areas of the SVG stay transparent in the PNG. If you choose JPG, transparency is not supported by the format, so those areas are filled with white. So for a graphic that needs a clear background, export as PNG.
H3: Can I set exact pixel dimensions?
Not directly - you choose a scale multiplier (1×, 2×, 4×, or 8×) relative to the SVG's own size, and the dropdown shows the exact pixels each option produces. If you need a specific size afterwards, convert here and then use the Resize Image tool to set precise dimensions.
H3: Can it output WebP, PDF, or a cutting format like DXF?
No - the outputs are PNG and JPG only. It does not produce WebP, PDF, or vector/CAD formats like DXF, STL, DWG, or EPS. If you need one of those, this is not the right tool; it is focused on turning an SVG into a high-quality PNG or JPG raster image.
H3: Are my SVG files uploaded to a server?
No. The converter runs entirely in your browser using the canvas, so your SVG files never leave your device and nothing is sent to RepetiGo. That keeps your graphics private, works on a weak connection, and is why there is no watermark on your converted images.

H2: Related Image Tools.
Tool
What It Does
Link
Convert to JPG
Convert HEIC/WebP/PNG/BMP/GIF → JPG
→ /image-tools/convert-to-jpg
Image Converter
Convert between many image formats
→ /image-tools/image-converter
Compress Image
Shrink the rendered PNG/JPG
→ /image-tools/compress-image
Resize Image
Set exact pixel dimensions
→ /image-tools/resize-image
Remove Background
Transparent PNG from a photo
→ /image-tools/background-remover
All Image Tools
The complete image tools suite
→ /image-tools

[ Convert SVG to PNG or JPG Free - up to 8× → repetigo.com/image-tools/svg-converter ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function SvgConverterPage() {
  return (
    <SvgConverterClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="svg-converter-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </SvgConverterClient>
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
  if (lines[0] === "Step" && lines[1] === "What You Do" && lines[2] === "What Happens") return { headers: ["Step", "What You Do", "What Happens"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Output" && lines[1] === "Transparency") return { headers: ["Output", "Transparency", "Best for"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Who" && lines[1] === "What they convert") return { headers: ["Who", "What they convert", "Why"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#svg-converter-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/svg-converter": "/image-tools/svg-converter",
    "/image-tools/convert-to-jpg": "/image-tools/convert-to-jpg",
    "/image-tools/image-converter": "/image-tools/image-converter",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/background-remover": "/image-tools/background-remover",
    "/products/printpilot": "/print-automation",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/svg-converter": "Open SVG Converter",
    "/image-tools/convert-to-jpg": "Open Convert to JPG",
    "/image-tools/image-converter": "Open Image Converter",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/background-remover": "Open Remove Background",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo SVG Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based SVG to PNG or JPG converter - render an SVG at up to 8× its native size for a crisp, high-resolution raster image, with batch conversion to a ZIP. Runs 100% in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to convert an SVG to PNG or JPG", step: [{ "@type": "HowToStep", name: "Upload your SVG(s)", text: "Drop or select one or more .svg files." }, { "@type": "HowToStep", name: "Set scale & format", text: "Choose 1×/2×/4×/8× and PNG or JPG." }, { "@type": "HowToStep", name: "Download", text: "Download each image, or grab them all as a ZIP." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "SVG Converter", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
