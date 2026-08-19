import type { Metadata } from "next";
import ConvertToJpgClient from "./ConvertToJpgClient";

const pageUrl = "https://repetigo.com/image-tools/convert-to-jpg";

export const metadata: Metadata = {
  title: "Convert to JPG Free - HEIC, WebP, PNG, SVG & GIF to JPG | RepetiGo",
  description:
    "Free image-to-JPG converter - turn HEIC, WebP, PNG, SVG, BMP or GIF into JPG in your browser. Batch-convert and download a ZIP. No upload, no watermark.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Convert to JPG Free - HEIC, WebP, PNG, SVG & GIF to JPG",
    description: "Turn HEIC, WebP, PNG, SVG, BMP or GIF into JPG in your browser. Batch-convert to a ZIP.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert to JPG Free - HEIC, WebP, PNG, SVG & GIF",
    description: "Free image-to-JPG converter. HEIC/WebP/PNG/SVG/BMP/GIF, quality slider, batch + ZIP, in-browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Convert to JPG Free - Turn HEIC, WebP, PNG, SVG & More into JPG.

RepetiGo's convert to JPG tool is a free, browser-based image-to-JPG converter. Drop in a HEIC, WebP, PNG, SVG, BMP, or GIF file and it turns it into a standard JPG in seconds - one image or a whole batch at once. JPG is the format almost every portal, printer, and app accepts, so this is the quick way to make an image universally usable. Because it all runs in your browser, your files are never uploaded to a server.
It is especially handy for iPhone photos: an HEIC file that a website refuses becomes a JPG that works everywhere. This jpg converter also handles the transparency question sensibly - transparent areas become white in the JPG, since JPG cannot store transparency - and lets you set the output quality. Convert one file, or upload many and download them together as a ZIP.

✓ Free · No sign-up · No watermark   ✓ HEIC · WebP · PNG · SVG · BMP · GIF → JPG   ✓ Quality slider · batch + ZIP   ✓ 100% in your browser - nothing uploaded

H2: How to Convert an Image to JPG in 3 Steps.
Here is how to convert an image to JPG with RepetiGo. It starts converting the moment you add a file, at a sensible default quality.

Step
What You Do
What Happens
1. Upload your image(s)
Drag-and-drop or click to add HEIC, WebP, PNG, SVG, BMP or GIF files.
Each file auto-converts to JPG at 90% quality; a card shows the size saved.
2. Adjust quality (optional)
Set the quality slider between 40% and 100%.
Higher keeps more detail; lower makes a smaller file. Re-run to apply.
3. Download
Download each JPG, or grab them all as a ZIP.
Files save with a .jpg extension; a preview compares before and after.

🔒 Every conversion - including HEIC decoding - happens in your browser. Your images are never uploaded to RepetiGo or any server.

H2: Which Formats Can You Convert to JPG?
The tool accepts six common image types as input and turns them all into JPG. Here is what each is and why you might convert it.

Input format
What it is
Note
HEIC / HEIF
Apple's iPhone photo format
Decoded in-browser; the most common conversion
WebP
Google's modern web format
Often downloaded from websites; not always accepted
PNG
Lossless web image (often transparent)
Transparency becomes white in the JPG
SVG
Vector graphic
Converted at its natural size
BMP
Old uncompressed bitmap
Large files that shrink well as JPG
GIF
Image / simple animation
Only the FIRST frame is converted

If your file is one of these, you are ready to go. Note that PDFs, Word or PowerPoint documents, and some formats like AVIF, TIFF, or PSD are not accepted here - this tool converts these six image types to JPG.

H2: Convert HEIC to JPG (iPhone Photos).
This is the conversion most people need. iPhones save photos as HEIC by default - a modern, space-saving format that many websites, portals, older apps, and Windows PCs simply do not accept. Converting HEIC to JPG makes the photo work everywhere. Upload the HEIC (or HEIF) file and RepetiGo decodes it right in your browser and converts it to JPG - no app to install and, importantly, nothing uploaded, which matters for personal photos.
To convert HEIC to JPG on an iPhone, Windows PC, or Mac, the steps are the same: open this page, drop in the HEIC file (or several at once), and download the JPG. It works on the phone's browser directly, so you do not need a separate app. If an HEIC file cannot be decoded, you will see a clear "could not be opened" message - re-export it from Photos and try again.

📱 iPhone tip: converting HEIC to JPG here is the fix when a form or website rejects your iPhone photo. Batch-drop several HEICs and download them all as a ZIP.

H2: Convert WebP, SVG & BMP to JPG.
Beyond HEIC, three other conversions come up a lot. WebP is Google's web format - images you save from websites are often WebP, and some apps or portals will not take them; convert WebP to JPG and the problem disappears. SVG is a vector graphic; converting SVG to JPG turns it into a normal raster image (it is rendered at its natural size). BMP is an old, bulky bitmap format; converting BMP to JPG usually makes the file dramatically smaller with no visible loss.
All three work the same way: drop the file in, and it converts to JPG automatically. For SVG and PNG inputs that have transparent areas, remember those areas become white in the JPG, because JPG does not support transparency - more on that below.

H2: Convert GIF to JPG - First Frame Only.
You can convert a GIF to JPG here, with one important thing to know: a GIF can be animated, but JPG cannot - so the tool converts the first frame of the GIF into a JPG and the animation is not kept. That is exactly what you want if the GIF is really a still image, or if you need a single poster frame from an animation.
If you specifically need to keep an animation, converting to JPG is not the right move for that file, because no JPG can hold multiple frames. But for turning a static GIF, or the opening frame of an animated one, into a standard JPG, this does the job cleanly.

⚠️ GIF conversion keeps the FIRST FRAME only - animation is not preserved (JPG cannot store animation). Perfect for a still image or a single poster frame.

H2: The JPG Quality Slider & File Size.
JPG is a compressed format, and you control how much with the quality slider - from 40% up to 100%, in small steps. Higher quality keeps more detail and makes a larger file; lower quality makes a smaller file with more compression. The default is 90%, a good balance for most photos. Each file card shows the converted size and the percentage saved, so you can see the trade-off instantly and re-run at a different quality if needed.
If you are trying to hit a specific file-size limit - say convert an image to a JPG under 50KB or 20KB for a portal - lower the quality slider and watch the size on the card. For an exact KB target, though, the dedicated Compress Image tool is more precise: convert to JPG here first, then compress to the precise limit there. That two-step route reliably gets you under a strict upload cap.

📊 For a rough size cut, drop the quality slider. For an exact KB limit (e.g. under 50KB for an exam form), convert here → then use /image-tools/compress-image.

H2: Transparent Areas Become White.
This trips people up, so it is worth being clear: JPG cannot store transparency. When you convert a PNG, WebP, or SVG that has transparent areas into a JPG, those transparent parts are filled with white in the result. A logo on a transparent background, for example, will come out on a white background as a JPG.
That is usually fine - and often exactly what you want for a document or upload. But if you need to keep the transparency (for a logo you will place on a coloured background, say), do not convert to JPG; keep it as a PNG instead. The conversion here always uses a white fill for transparent areas; there is no option to choose a different fill colour.

H2: Convert Many Images at Once - Batch + ZIP.
You are not limited to one file. Upload several images at once - each gets its own card showing the original size, dimensions, converted size, and percentage saved - and you can keep adding more. Convert them all, then download each JPG individually or grab the whole set as a single ZIP file. It is a real time-saver for a folder of iPhone HEICs or a batch of WebP downloads that all need to become JPGs.

✅ Real batch support: drop in many files, convert them all to JPG, and download individually or as one ZIP - all in your browser, nothing uploaded.

H2: ★ Indian Use Cases - HEIC Photos & Portal Uploads.
Converting to JPG is a daily need in India, where government portals and exam forms almost always demand a JPG and reject newer formats.

Scenario
Problem
How to fix it here
iPhone photo for a portal
Portal rejects HEIC
Convert HEIC → JPG, then upload
Image saved from a website
It downloaded as WebP
Convert WebP → JPG
Logo/graphic as SVG
Portal needs a JPG image
Convert SVG → JPG (white background)
Batch of iPhone photos
Many HEICs to convert
Upload all → convert → ZIP download
JPG under a KB limit
Exam form caps the size
Convert → then compress to the exact KB

🇮🇳 iPhone + Indian portal workflow: convert the HEIC to JPG here → resize to the required pixels at /image-tools/resize-image → compress to the KB limit at /image-tools/compress-image. All free and linked below.

H2: Everything Runs in Your Browser - Nothing Uploaded.
RepetiGo converts your images on your own device - even the HEIC decoding happens in the browser. Your files are never sent to a server, which keeps personal iPhone photos private, works on a weak connection, and is why the tool carries a "Files stay in your browser" badge. There is no watermark and no account wall; the JPGs you download are the full, clean files.

🔒 Client-side means private: your images stay on your device, nothing is uploaded, and no watermark is added - good for personal photos and documents.

H2: What This Converter Does Not Do.
So you know whether it fits before you start, here is what this converter is not for - and where to go instead.

People often ask for…
The honest answer
Convert PDF to JPG
No - this tool does not take PDFs (it converts images)
Convert Word / PowerPoint to JPG
No - documents are not accepted, only image files
Convert JPG to PNG / WebP (reverse)
No - this converts TO JPG; use the Convert from JPG tool
Convert AVIF / TIFF / JFIF / PSD
No - accepted inputs are HEIC/WebP/PNG/SVG/BMP/GIF
Keep a GIF's animation
No - only the first frame becomes a JPG
A non-white fill for transparency
No - transparent areas are filled white only
Set DPI, strip EXIF, or resize on convert
No - those options are not in this tool

H2: Convert to JPG - Frequently Asked Questions.
H3: Is this JPG converter free?
Yes - RepetiGo's convert to JPG tool is completely free with no sign-up and no watermark. Because it converts in your browser rather than on a paid server, everything is available at no cost: HEIC, WebP, PNG, SVG, BMP, and GIF to JPG, a quality slider, and batch conversion with a ZIP download.
H3: How do I convert HEIC to JPG from my iPhone?
Open this page in your iPhone's browser, drop in the HEIC (or HEIF) file - or several at once - and it converts to JPG right on the device, with nothing uploaded. Download the JPG and it will work on any portal or app that rejected the HEIC. The same steps work on Windows and Mac. If a file cannot be decoded, re-export it from Photos and try again.
H3: Can I convert a PDF to JPG here?
No - this tool converts image files (HEIC, WebP, PNG, SVG, BMP, GIF) to JPG, not PDFs. Converting a PDF to an image is a different job handled by a PDF tool. If you have an image inside a document, export or screenshot it first, then convert that image to JPG here.
H3: Is JPEG the same as JPG?
Yes - JPEG and JPG are exactly the same format; "JPG" is just the shorter file extension, kept from older systems that limited extensions to three letters. So there is nothing to convert between them. This tool converts other formats - like HEIC, WebP, PNG, SVG, BMP, and GIF - into JPG/JPEG.
H3: What happens to transparency when I convert to JPG?
JPG cannot store transparency, so any transparent areas in a PNG, WebP, or SVG are filled with white in the JPG. A logo on a transparent background will come out on a white background. If you need to keep the transparency, do not convert to JPG - keep the file as a PNG instead.
H3: Does converting a GIF keep the animation?
No. A GIF can be animated but a JPG cannot, so the tool converts only the first frame of the GIF into a JPG and the animation is not kept. That is ideal for a still GIF or when you want a single poster frame, but if you need to preserve an animation, JPG is not the right format for that file.
H3: How do I make the JPG smaller - or hit a KB limit?
Lower the quality slider (from 100% down toward 40%) and watch the converted size on the file card - more compression means a smaller file. For an exact KB limit, like a JPG under 50KB for an exam form, convert here first and then use the Compress Image tool, which lets you target a precise kilobyte size.
H3: Which formats can I convert to JPG?
The accepted inputs are HEIC/HEIF, WebP, PNG, SVG, BMP, and GIF. Documents (like PDF, Word, or PowerPoint) and some formats such as AVIF, TIFF, JFIF, and PSD are not accepted. If your file is one of the six supported types, just drop it in and it converts to JPG automatically.
H3: Can I convert several images at once?
Yes. Upload multiple files and each converts to JPG on its own card showing the size saved. Download them individually, or download the whole batch as a single ZIP. It is the fastest way to handle a folder of iPhone HEICs or a set of WebP images that all need to become JPGs.
H3: Are my images uploaded to a server?
No. The converter runs entirely in your browser - even HEIC decoding happens on your device - so your images never leave it and nothing is sent to RepetiGo. That keeps personal photos private, works on a weak connection, and is why there is no watermark on your converted JPGs.

H2: Related Image Tools.
Tool
What It Does
Link
PNG to JPG
Dedicated PNG → JPG converter
→ /image-tools/png-to-jpg
Convert from JPG
The reverse: JPG → PNG, WebP and more
→ /image-tools/convert-from-jpg
Compress Image
Hit an exact KB limit after converting
→ /image-tools/compress-image
Resize Image
Change dimensions after converting
→ /image-tools/resize-image
Upscale Image
"JPG to HD" - enlarge with added detail
→ /image-tools/upscale-image
All Image Tools
The complete image tools suite
→ /image-tools

[ Convert to JPG Free - HEIC, WebP, PNG & More → repetigo.com/image-tools/convert-to-jpg ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function ConvertToJpgPage() {
  return (
    <ConvertToJpgClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="convert-to-jpg-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </ConvertToJpgClient>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "🔁", "🔄", "★", "📊"];

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
  if (lines[0] === "Input format" && lines[1] === "What it is") return { headers: ["Input format", "What it is", "Note"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Scenario" && lines[1] === "Problem") return { headers: ["Scenario", "Problem", "How to fix it here"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#convert-to-jpg-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/convert-to-jpg": "/image-tools/convert-to-jpg",
    "/image-tools/heic-to-jpg": "/image-tools/heic-to-jpg",
    "/image-tools/png-to-jpg": "/image-tools/png-to-jpg",
    "/image-tools/webp-to-jpg": "/image-tools/webp-to-jpg",
    "/image-tools/convert-from-jpg": "/image-tools/convert-from-jpg",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
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
    "/image-tools/convert-to-jpg": "Open Convert to JPG",
    "/image-tools/heic-to-jpg": "Open HEIC to JPG",
    "/image-tools/png-to-jpg": "Open PNG to JPG",
    "/image-tools/webp-to-jpg": "Open WebP to JPG",
    "/image-tools/convert-from-jpg": "Open Convert from JPG",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/upscale-image": "Open Upscale Image",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Convert to JPG", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based image-to-JPG converter for HEIC, WebP, PNG, SVG, BMP, and GIF, with a quality slider and batch conversion to a ZIP. Runs 100% in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to convert an image to JPG", step: [{ "@type": "HowToStep", name: "Upload your image(s)", text: "Drag-and-drop or click to add HEIC, WebP, PNG, SVG, BMP or GIF files." }, { "@type": "HowToStep", name: "Adjust quality (optional)", text: "Set the quality slider between 40% and 100%." }, { "@type": "HowToStep", name: "Download", text: "Download each JPG, or grab them all as a ZIP." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Convert to JPG", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
