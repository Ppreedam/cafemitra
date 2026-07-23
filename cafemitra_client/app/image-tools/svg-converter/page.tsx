import type { Metadata } from "next";
import SvgConverterClient from "./SvgConverterClient";

const pageUrl = "https://repetigo.com/image-tools/svg-converter";

export const metadata: Metadata = {
  title: "SVG Converter Free Online - Convert SVG to PNG or JPG | RepetiGo",
  description:
    "Convert SVG to PNG or JPG free online - export logos, icons, and illustrations at any size, transparency preserved. Batch convert multiple files. No sign-up, 100% browser-based - nothing is ever uploaded.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "SVG Converter Free Online - Convert SVG to PNG or JPG | RepetiGo",
    description: "Convert SVG to PNG or JPG free - any export size, transparency preserved. Batch convert. No sign-up, 100% browser-based.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "SVG Converter Free - RepetiGo",
    description: "Convert SVG to PNG or JPG free, any size, one file or a batch. 100% browser-based.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: SVG Converter Online Free. Convert SVG to PNG or JPG - Any Size, No Sign-Up.
RepetiGo's free SVG converter renders your SVG file into a PNG or JPG raster image at any size you choose. Because SVG is a vector format with no fixed resolution, you decide the output size at export time - a small icon can become a crisp 4000px banner, or a large illustration can become a small favicon, with no loss of sharpness from the vector source.

This tool solves a common, simple problem: you have a logo, icon, or illustration as an .svg file, but the place you need to use it - a social media upload, a Word document, an old design tool, a print layout, a form field - only accepts PNG or JPG. Upload the SVG, choose your output format and size, and download a raster file ready to use anywhere.

✓ Export at Any Size   ✓ PNG (Transparent) or JPG Output   ✓ Batch Convert   ✓ No Sign-Up   ✓ 100% Browser-Based - Nothing Uploaded

[ Convert SVG Free - No Sign-Up → repetigo.com/image-tools/svg-converter ]

H2: What Is an SVG File, and Why Convert It to PNG or JPG?
SVG (Scalable Vector Graphics) stores an image as mathematical shapes and paths rather than a fixed grid of pixels. This makes SVG ideal for logos, icons, and illustrations that need to look sharp at any size - but it also means many everyday tools and platforms don't accept it. Social media uploads, most Microsoft Office and Google Docs image fields, older design software, ID card and print layout tools, and most Indian government portals all expect a standard raster image - PNG or JPG - not SVG.

Converting SVG to PNG or JPG "flattens" the vector shapes into a fixed grid of pixels at whatever size you choose. This is the opposite operation to vectorizing a PNG into SVG - both are legitimate needs depending on which direction you're working in.

H3: SVG vs PNG vs JPG - Format Comparison

Feature
SVG (Vector)
PNG (Raster)
JPG (Raster)
Made of
Mathematical paths and shapes
A fixed grid of pixels
A fixed grid of pixels
Resizing
Scales to any size, always crisp
Fixed resolution - enlarging causes blur
Fixed resolution - enlarging causes blur
Transparency
✓ Supported
✓ Supported - full alpha channel
✗ Not supported
File size
Very small for simple graphics
Larger than SVG for the same graphic
Smallest of the three for photos
Universal acceptance
✗ Rejected by many upload forms, older software, most Indian portals
✓ Nearly universal
✓ Universal
Editable as shapes
✓ Yes, in Illustrator, Inkscape, Figma
✗ Pixel editing only
✗ Pixel editing only
Best for
Logos, icons, source design files
Logos and icons once rasterized - keeps transparency
Photos, portal uploads, printing, general sharing
When to convert SVG → PNG/JPG
-
When you need transparency in the raster output
When you need the smallest possible file and don't need transparency

💡 Choosing between PNG and JPG output: if your SVG has a transparent background and you need to keep it transparent - a logo going onto a colored page, a sticker, a UI icon - export to PNG. If the destination doesn't support transparency anyway, or you want the smallest possible file, export to JPG; RepetiGo fills the transparent areas with white automatically.

H2: How to Convert SVG to PNG or JPG Online Free in 3 Steps.
H3: Step 1 - Upload Your SVG File
Click Select SVG Files or drag and drop your .svg file - or several SVG files at once for batch conversion. RepetiGo reads the SVG's declared size automatically, so you can see exactly what dimensions it will export at before converting. There's no fixed file size cap, because everything runs on your own device.
H3: Step 2 - Choose Output Format and Size
As soon as you upload, RepetiGo converts your SVG automatically at the default settings - PNG format at 4x the SVG's native size. Change the Output Format to JPG if you don't need transparency and want the smallest file. Change the Export Size to 1x for the SVG's original declared dimensions, or 2x, 4x, or 8x to render a larger, higher-resolution image - the dropdown shows the exact pixel dimensions each option will produce. Every uploaded file re-converts automatically whenever you change these settings.
H3: Step 3 - Download Your PNG or JPG
Click Download for a single file. For a batch, click Download ZIP to get every converted file in one archive. File names are preserved with the new extension (logo.svg → logo.png). Because nothing was ever uploaded, there's nothing left on any server once you're done.

[ Convert SVG Free Now → repetigo.com/image-tools/svg-converter ]

H2: ★ Batch SVG Conversion.
Icon libraries, logo variations, and illustration sets are usually a folder of SVG files, not a single one. RepetiGo's batch converter handles any number of files in one session:
Upload all SVG files at once - drag a multi-file selection or Ctrl+Click (Windows) / Cmd+Click (Mac) to multi-select.
Each file converts automatically at your chosen format and size as it's added.
Change the format or export size at any point to re-convert every file in the batch to the new setting.
Click Download ZIP to get one archive containing all the converted files, named identically to the originals.

💡 Batch converting a mixed icon set works well because every file is rendered at the same relative scale you choose (1x, 2x, 4x, or 8x) - a 24px icon and a 512px logo in the same batch each come out proportionally larger, preserving their relative sizes.

H2: ★ Indian Use Cases - Who Converts SVG Files in India?
H3: Web Developers and Designers Exporting Assets
Indian developers and designers frequently need a raster export of an SVG icon or logo - for a favicon, an app store listing image, a social media profile picture, or a design handoff document that doesn't support vector embeds. Converting once at the right size avoids re-exporting from design software for every use case.
H3: Print Shops and Offices Using Older Software
Many Indian print shops, DTP centres, and offices still run older versions of CorelDRAW, Photoshop, or basic layout software that can't import SVG directly, or need a flattened raster version to place inside a specific document layout. Converting the customer's SVG logo to a high-resolution PNG first removes the compatibility problem entirely.
H3: Students and Freelancers Submitting Documents
Students, freelancers, and small business owners often have a logo or certificate design only as an SVG - from a design tool or downloaded template - and need a PNG or JPG to paste into a Word document, a PowerPoint presentation, a project report, or an online form that only accepts standard image uploads.

H2: Choosing the Right Export Size.

Use Case
Recommended Setting
Why
Favicon or browser tab icon
1x or 2x, PNG
Favicons are small (16-64px) - the SVG's native size is usually enough
Social media profile picture
4x, PNG
Platforms display profile images at various sizes - a larger source avoids blur on high-DPI screens
Website header logo
2x-4x, PNG
Matches typical retina/high-DPI display requirements without an oversized file
Print layout (visiting cards, banners)
4x-8x, PNG or JPG
Print needs higher resolution than screen use - larger export avoids pixelation
Word document or presentation
2x, PNG
Documents are usually viewed on screen - 2x balances clarity and file size
Portal or form upload with a KB limit
1x or 2x, JPG
Smaller file size helps meet strict upload limits - use Compress Image if still too large

H2: Why Use RepetiGo's SVG Converter?

Feature
RepetiGo
Adobe Illustrator / Photoshop
Online SVG Converters
Browser "Save As" / Screenshot
Free to use
✓ Always free
✗ Paid subscription
~ Varies, often limited
✓ Free
Choose exact export size
✓ 1x to 8x, shown in pixels
✓ Full manual control
~ Often fixed or limited
✗ Fixed to screen resolution
PNG with transparency
✓ Yes
✓ Yes
~ Varies
✗ Screenshots are usually opaque
Batch conversion
✓ Yes - upload any number of files
~ Manual per file
~ Limited on free tiers
✗ Not possible
No software install
✓ Browser-based
✗ Requires installation
~ Varies
✓ Built into the OS
Files ever leave your device?
✗ Never - 100% browser-based
✓ Never - local software
✓ Yes - uploaded to their servers
✓ Never - local
No watermark on output
✓ Always
✓ Yes
~ Some add watermarks
✓ Yes

H2: Your Files Are Safe. Always.

Protection Layer
What It Means in Practice
🖥️ 100% Browser-Based Conversion
Your SVG is rendered into PNG or JPG using your own device's processing power via the browser. It is never uploaded to any server.
🚫 Nothing Ever Leaves Your Device
Because conversion happens locally, there is no upload, no transfer, and nothing on any server for us to store or delete.
🔒 Safe Rendering, Even for Untrusted SVGs
SVG files can technically contain embedded scripts. RepetiGo renders your SVG using the browser's image element, the same safe method used to display images on any webpage - embedded scripts are never executed.
🚫 No Account = No Data Profile
No sign-up means no personal data, no file history, and no usage profile is ever created.
👁️ No Content Is Read
RepetiGo's code cannot see, analyse, or extract what's in your file - it only renders pixels on your own device.

[ Read Our Privacy Policy → /privacy-policy ]

H2: Common Questions About SVG Conversion.
H3: Q1: Does Converting SVG to PNG or JPG Lose Quality?
Converting from SVG always involves choosing a fixed output size, since SVG has no inherent resolution of its own - once rendered at that size, the PNG or JPG is a normal raster image with the same quality characteristics as any other. PNG output is lossless at the size you choose - no compression artifacts. JPG output uses standard JPG compression, which is visually near-identical to the source at quality 90+. The only thing to get right is the export size: choose a size too small for your use case (for example, exporting a favicon-sized SVG at 1x and then trying to print it as a banner) and the result will look blocky, not because the conversion lost quality, but because you're enlarging a fixed-resolution image after the fact. Export at a large enough size for your intended use and there is no visible quality loss.
H3: Q2: What Size Should I Export My SVG At?
It depends on where the image will be used. For on-screen use like a website logo or a document image, 2x to 4x the SVG's native size is usually enough to look sharp on modern high-DPI screens. For print - banners, visiting cards, signage - use 4x to 8x, since print resolution requirements are higher than screen resolution. If you're unsure, exporting larger is safer than exporting too small: you can always resize a large PNG down, but enlarging a small one will look blurry. See the Export Size guide above for specific recommendations by use case.
H3: Q3: Can I Convert SVG to JPG Instead of PNG?
Yes. Select JPG as the output format before or after uploading. Since JPG doesn't support transparency, RepetiGo fills any transparent areas of the SVG with a white background automatically - this is the correct, expected behaviour, not an error. Use JPG when you don't need transparency and want the smallest possible file size; use PNG when you need the transparent background preserved.
H3: Q4: Why Won't My Converted File Open in Some Programs?
This is unlikely once converted - PNG and JPG are among the most universally supported file formats and open in essentially all image viewers, editors, browsers, office software, and upload portals. If a converted file doesn't open somewhere, check that the file downloaded completely and that you're opening the actual .png or .jpg file, not the original .svg. If you specifically need PNG for a program that says it doesn't support your file, confirm you selected PNG (not JPG) as the output format before converting.
H3: Q5: Is It Safe to Convert an SVG File I Downloaded From an Unknown Source?
SVG is an XML-based format that can technically include embedded JavaScript, which is a real security consideration if an untrusted SVG is opened in certain contexts, like directly in a browser tab or embedded live in a webpage. RepetiGo's converter avoids this risk entirely: it loads your SVG using the browser's standard image element - the same mechanism used to display any image on any website - which renders the visual content but never executes any embedded script. The output PNG or JPG is a plain raster image with no possibility of embedded code, regardless of what the source SVG contained.
H3: Q6: What Is the Difference Between SVG Converter and PNG to SVG?
These tools do opposite jobs. SVG Converter (this page) takes a vector SVG file and rasterizes it into a fixed-pixel PNG or JPG - useful when you have an SVG and need a standard image file. PNG to SVG does the reverse: it traces a raster PNG image into vector paths, useful when you only have a PNG logo or icon and need a scalable SVG version of it. If you're starting from an SVG and need PNG or JPG, use this page. If you're starting from a PNG and need SVG, use the PNG to SVG converter instead.

H2: More Free Image Tools from RepetiGo.

Tool
What It Does
Link
PNG to SVG
Vectorize a PNG logo or icon into a real, scalable SVG
→ /image-tools/png-to-svg
Compress Image
Reduce PNG or JPG file size after conversion
→ /image-tools/compress-image
Resize Image
Resize the converted PNG or JPG to exact pixel dimensions
→ /image-tools/resize-image
Remove Background
Remove the background from a converted PNG
→ /image-tools/background-remover
PNG to JPG
Convert a PNG (including one exported here) into JPG
→ /image-tools/png-to-jpg
All Image Tools
Complete free image tools suite
→ /image-tools

[ Convert SVG Free - No Sign-Up → repetigo.com/image-tools/svg-converter ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

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
  if (lines[0] === "Feature" && lines[1] === "SVG (Vector)") return { headers: ["Feature", "SVG (Vector)", "PNG (Raster)", "JPG (Raster)"], rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Use Case" && lines[1] === "Recommended Setting") return { headers: ["Use Case", "Recommended Setting", "Why"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Feature" && lines[1] === "RepetiGo") return { headers: ["Feature", "RepetiGo", "Adobe Illustrator / Photoshop", "Online SVG Converters", "Browser \"Save As\" / Screenshot"], rows: chunkRows(lines.slice(5), 5) };
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
    "/image-tools/png-to-svg": "/image-tools/png-to-svg",
    "/image-tools/png-to-jpg": "/image-tools/png-to-jpg",
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
    "/image-tools/png-to-svg": "Open PNG to SVG",
    "/image-tools/png-to-jpg": "Open PNG to JPG",
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
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo SVG Converter", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online SVG to PNG or JPG converter with adjustable export size and batch conversion. Runs entirely in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Convert SVG to PNG or JPG Online Free", step: [{ "@type": "HowToStep", name: "Upload SVG", text: "Upload Your SVG File" }, { "@type": "HowToStep", name: "Choose Settings", text: "Choose Output Format and Size" }, { "@type": "HowToStep", name: "Download", text: "Download Your PNG or JPG" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "SVG Converter", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
