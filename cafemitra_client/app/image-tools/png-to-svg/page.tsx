import type { Metadata } from "next";
import PngToSvgClient from "./PngToSvgClient";

const pageUrl = "https://repetigo.com/image-tools/png-to-svg";

export const metadata: Metadata = {
  title: "PNG to SVG Free - Real Vector Tracing for Logos & Cricut | RepetiGo",
  description:
    "Free PNG to SVG converter with real vector tracing - turn a PNG logo, icon or line art into a scalable SVG in your browser. 4 detail presets, great for Cricut. No upload.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "PNG to SVG Free - Real Vector Tracing for Logos & Cricut",
    description: "Turn a PNG logo, icon or line art into a scalable SVG with real vector tracing. 4 presets, great for Cricut.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "PNG to SVG Free - Real Vector Tracing",
    description: "Free PNG→SVG with real path tracing. 4 detail presets, great for logos & Cricut, in your browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: PNG to SVG - Convert a PNG to a Real, Scalable SVG.
RepetiGo's PNG to SVG converter turns a PNG into a true, scalable SVG using real vector tracing - free and in your browser. It does not just wrap your image inside an SVG file; it traces the picture into actual vector paths, so the result scales up cleanly to any size, the way a real vector should. Upload one PNG or a batch, choose a detail level, and download an SVG made of genuine paths. Everything runs on your device, so nothing is uploaded.
This is the tool you want for turning a logo, icon, or piece of line art into a vector you can resize infinitely - for large-format printing, crisp web graphics, or a Cricut cutting project. With four detail presets and a clear preview, you can pick the trace that suits your image. It is free, needs no sign-up, and adds no watermark.

✅ Free · No sign-up · No watermark   |   ✅ Real vector tracing (scalable paths)   |   ✅ 4 detail presets   |   ✅ Batch + ZIP · 100% in your browser

H2: What "PNG to SVG" Really Means - Real Vectorization.
It is worth being precise, because not all "PNG to SVG" tools do the same thing. Some simply take your PNG and embed it, unchanged, inside an SVG file - the result has an .svg extension but is still the same fixed-pixel image, so it pixelates when you scale it up. That is not real vectorization.
This tool does the real thing. It analyses the image and traces it into actual vector paths and shapes - bezier curves defined mathematically - so the SVG can scale to any size without losing sharpness. That is what makes an SVG genuinely useful: a logo traced to a true SVG stays crisp whether it is on a business card or a billboard. The difference matters, and this converter is built for the real, scalable kind.

✨ Real tracing, not a wrapper: your PNG becomes actual scalable vector paths - crisp at any size - not a fixed-pixel image with an .svg extension.

H2: Best for Logos, Icons & Line Art - Not Photos.
Vector tracing works by finding clean shapes and colour areas and redrawing them as paths, so it shines on images that are already made of clear, flat shapes: logos, icons, symbols, simple illustrations, and line art. On those, it produces a tidy, scalable SVG that looks great and often has a small file size.
Photographs are a different story. A photo has thousands of subtle colours, gradients, and fine texture, none of which turn into clean vector paths - tracing one produces a huge, messy SVG that looks worse than the original and is not useful. The tool says so directly in its interface: best results come from flat-colour logos, icons, and line art, not photos. So bring a logo or a simple graphic, and this delivers; bring a photo, and vectorization is simply the wrong tool for the job.

H2: How to Convert PNG to SVG in 3 Steps.
Here is how to convert PNG to SVG with RepetiGo. It traces automatically as soon as you add a file.

Step
What You Do
What Happens
1. Upload your PNG(s)
Drop or select one or more PNG files.
Each is traced to an SVG using the Balanced preset.
2. Pick a detail level
Choose Simple, Balanced, Detailed, or Line Art.
Click Convert again to re-trace; the preview shows the SVG vs the PNG.
3. Download
Download each SVG, or grab them all as a ZIP.
You get true, scalable vector SVG files.

🔒 The tracing happens in your browser - your PNG files are never uploaded to RepetiGo or any server.

H2: The Four Detail Presets.
Different images trace best at different detail levels, so the tool gives you four presets to choose from. Pick the one that matches your image, and re-trace so you can compare in the preview.

Preset
Best for
What it does
Simple - Logos & Icons
Flat logos, simple icons
Fewer colours and paths, clean result
Balanced (Recommended)
Most images
A good general-purpose trace (the default)
Detailed
Richer illustrations
More paths and colours, finer detail
Black & White - Line Art
Sketches, outlines, line art
A crisp two-tone trace

Balanced is the default and works well for most graphics. Drop to Simple for a very clean logo, go Detailed when you need to keep more nuance, or choose Line Art for black-and-white sketches and outlines. Switching presets clears the current result, so click Convert to SVG again to re-trace with the new setting - it only takes a moment to try a couple and keep the one that looks best.

H2: PNG to SVG for Cricut & Cutting.
If you use a Cricut or another cutting machine, you need real SVG cut paths - and that is exactly what this tool produces. A traced SVG is made of actual vector paths, which is what cutting software follows to cut your design. To prepare a PNG for Cricut, upload it, pick a detail level (Simple often works well for clean cut lines), and download the SVG to import into your cutting software.
Because the tracing is real vectorization and not a wrapped image, the SVG will scale and cut cleanly rather than coming in as an un-cuttable raster. For the best cutting results, start from a clean, flat-colour design - a bold logo or a simple silhouette traces into crisp, cuttable paths, while a busy or photographic image will not. This makes it a genuinely useful free step in a Cricut workflow.

✂️ For Cricut: a traced SVG has real cut paths your cutting software can follow. Start from a clean, flat design; the Simple preset often gives the cleanest cut lines.

H2: Colour or Black & White Line Art.
The tool traces in colour by default - the Simple, Balanced, and Detailed presets all produce a colour SVG, reproducing the flat colours of your logo or graphic as separate vector shapes. So converting a PNG to SVG with colour is straightforward: just keep one of the colour presets. If you specifically want a two-tone result - for a stamp, a stencil, or clean line art - the Black & White Line Art preset traces the image into a crisp monochrome SVG instead. Between the four presets, you can get either a faithful colour vector or a clean line-art one from the same PNG.

H2: Batch Convert Multiple PNGs (with ZIP).
You are not limited to one file. Add as many PNGs as you like - each on its own card showing its size and the traced SVG size - pick a detail preset, and trace them all. Download each SVG individually or grab the whole set as a single ZIP. It is a quick way to vectorise a set of icons or logos in one go, with the same preset applied across the batch.

✅ Real batch support: trace a whole set of PNGs to SVG at once and download them as one ZIP - all in your browser, nothing uploaded.

H2: Everything Runs in Your Browser.
Like the rest of RepetiGo's image tools, the converter does all its work on your own device. Your PNG is traced to an SVG locally using the tracing engine loaded into your browser - nothing is uploaded, and no server processes your file. That keeps your designs private, works on a weak connection, and is why the tool carries a "Files stay in your browser" badge. There is no watermark and no account wall.

🔒 Client-side and private: your PNG files stay on your device, nothing is uploaded, and no watermark is added.

H2: ★ Use Cases - Design, Print & Craft.
Turning a PNG into a real SVG unlocks a lot across design, print, and craft.

Who
What they convert
Why
Designers
A raster logo → SVG
A scalable vector for any size
Print shops
A logo PNG → SVG
Sharp at banner and signage sizes
Cricut / crafters
A design PNG → SVG
Real cut paths for the machine
Web developers
An icon PNG → SVG
Crisp, lightweight vector icons
Anyone with a flat logo
PNG → SVG
Future-proof, resolution-independent art

🇮🇳 Tip: for a clean trace, remove a busy background first at /image-tools/background-remover, then vectorise the isolated logo here.

H2: What This Tool Does Not Do.
So you know whether it fits before you start, here is what this converter is not for - and where to go instead.

People often expect…
The honest answer
Vectorise a photograph
No - tracing is for flat logos/icons/line art, not photos
Fine-tune colours, smoothness, or paths
No - you choose from four presets, not detailed settings
A live preview as you change settings
No - pick a preset and it re-traces
Minify / optimise the SVG file
No - there is no SVG optimisation step
Convert an SVG back to PNG
No - use the SVG Converter for the reverse
Trace a JPG
No - input is PNG (use the JPG Converter to trace a JPG)

H2: PNG to SVG - Frequently Asked Questions.
H3: Is this PNG to SVG converter free?
Yes - RepetiGo's PNG to SVG converter is completely free with no sign-up and no watermark. Because it traces in your browser rather than on a paid server, you can vectorise as many PNGs as you like, with all four detail presets and batch conversion with a ZIP, at no cost. There is nothing to unlock.
H3: Does it really vectorise the PNG, or just wrap it in an SVG?
It really vectorises. The tool traces your image into actual vector paths - bezier curves - rather than embedding the raster inside an SVG file. That means the result is a true, scalable SVG that stays crisp at any size, not a fixed-pixel image with an .svg extension. It is real vectorization, which is what makes the SVG genuinely useful.
H3: Can I use this for Cricut?
Yes. A traced SVG is made of real vector paths, which is exactly what Cricut and other cutting machines follow to cut a design. Upload your PNG, choose a detail preset (Simple often gives the cleanest cut lines), and download the SVG to import into your cutting software. Start from a clean, flat design for the best cutting result.
H3: Which detail preset should I use?
Balanced is the recommended default and works for most images. Use Simple for a very clean logo or icon, Detailed when you want to keep more nuance in a richer graphic, and Black & White Line Art for sketches and outlines. Switching presets clears the current result - click Convert to SVG again to re-trace with the new setting, so it's still quick to try a couple and keep the best.
H3: Can it vectorise a photo?
Not usefully. Vector tracing works on flat shapes and clear colour areas, so it is made for logos, icons, and line art. A photograph has too many subtle colours and gradients to become clean paths, so tracing one produces a huge, messy SVG. The tool says so directly: best results come from flat-colour logos, icons, and line art, not photos.
H3: Can it make a colour SVG or only black and white?
Both. The Simple, Balanced, and Detailed presets produce a colour SVG, reproducing your image's flat colours as separate vector shapes. The Black & White Line Art preset produces a crisp two-tone SVG instead, which is ideal for stencils, stamps, or line work. So you can get either a colour vector or a monochrome one from the same PNG.
H3: Can I convert several PNGs at once?
Yes. Add as many PNGs as you like, pick a detail preset, and trace them all - then download each SVG or grab the whole set as a single ZIP. Each file shows its original and traced sizes on its own card. It is a quick way to vectorise a set of icons or logos with the same preset in one go.
H3: Can I fine-tune the trace settings?
You choose from four detail presets rather than adjusting individual settings like colour count or smoothness. The presets cover the common cases - simple logos, balanced graphics, detailed art, and line art - but there are no advanced sliders for fine-grained control. For most logo and icon work, a preset gives a good result directly.
H3: Can it convert an SVG back to a PNG?
No - this tool goes one way, from PNG to SVG (tracing a raster into a vector). To go the other way and turn an SVG into a PNG or JPG, use the SVG Converter, which renders an SVG to a raster image. And to trace a JPG rather than a PNG, the JPG Converter offers SVG tracing too.
H3: Are my PNG files uploaded to a server?
No. The converter runs entirely in your browser using the tracing engine, so your PNG files never leave your device and nothing is sent to RepetiGo. That keeps your designs private, works on a weak connection, and is why there is no watermark on your converted SVGs.

H2: Related Image Tools.
Tool
What It Does
Link
SVG Converter
The reverse: SVG → PNG or JPG
→ /image-tools/svg-converter
JPG Converter
Trace a JPG → SVG (and more)
→ /image-tools/jpg-converter
Remove Background
Clean up a logo before tracing
→ /image-tools/background-remover
PNG Converter
PNG → PDF/WebP/ICO/GIF/BMP
→ /image-tools/png-converter
Image Converter
Convert between many image formats
→ /image-tools/image-converter
All Image Tools
The complete image tools suite
→ /image-tools

[ Convert PNG to SVG Free - Real Vector Tracing → repetigo.com/image-tools/png-to-svg ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function PngToSvgPage() {
  return (
    <PngToSvgClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="png-to-svg-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </PngToSvgClient>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "🔁", "🔄", "★", "✨", "✂️"];

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
  if (lines[0] === "Preset" && lines[1] === "Best for") return { headers: ["Preset", "Best for", "What it does"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Who" && lines[1] === "What they convert") return { headers: ["Who", "What they convert", "Why"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "People often expect…" && lines[1] === "The honest answer") return { headers: ["People often expect…", "The honest answer"], rows: chunkRows(lines.slice(2), 2) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#png-to-svg-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:image-tools\/[a-z-]*|pricing)\/?|\/image-tools\/[a-z-]*\/?|\/image-tools\/?)/g);
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
    "/image-tools/png-to-svg": "/image-tools/png-to-svg",
    "/image-tools/svg-converter": "/image-tools/svg-converter",
    "/image-tools/jpg-converter": "/image-tools/jpg-converter",
    "/image-tools/background-remover": "/image-tools/background-remover",
    "/image-tools/png-converter": "/image-tools/png-converter",
    "/image-tools/image-converter": "/image-tools/image-converter",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/png-to-svg": "Open PNG to SVG",
    "/image-tools/svg-converter": "Open SVG Converter",
    "/image-tools/jpg-converter": "Open JPG Converter",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/png-converter": "Open PNG Converter",
    "/image-tools/image-converter": "Open Image Converter",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PNG to SVG", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PNG to SVG converter with real vector tracing, four detail presets, and batch conversion with ZIP download. Runs entirely in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Convert PNG to SVG", step: [{ "@type": "HowToStep", name: "Upload PNG", text: "Upload your PNG(s)" }, { "@type": "HowToStep", name: "Pick a detail level", text: "Pick a detail level" }, { "@type": "HowToStep", name: "Download", text: "Download" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "PNG to SVG", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
