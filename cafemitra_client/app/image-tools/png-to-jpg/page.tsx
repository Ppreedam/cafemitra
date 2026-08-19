import type { Metadata } from "next";
import PngToJpgClient from "./PngToJpgClient";

const pageUrl = "https://repetigo.com/image-tools/png-to-jpg";

export const metadata: Metadata = {
  title: "PNG to JPG Free - Convert & Batch, with Quality Control | RepetiGo",
  description:
    "Free PNG to JPG converter - turn PNG images into JPG in your browser, with a quality slider. Batch-convert many files and download a ZIP. No upload, no watermark.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "PNG to JPG Free - Convert & Batch, with Quality Control",
    description: "Turn PNG images into JPG with a quality slider. Batch-convert many files to a ZIP. In your browser.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "PNG to JPG Free - Convert & Batch",
    description: "Free PNG→JPG. Quality slider, batch + ZIP, 100% in your browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: PNG to JPG - Convert PNG to JPG in Your Browser.

RepetiGo's PNG to JPG converter turns PNG images into standard JPG files - free, fast, and entirely in your browser. Drop in one PNG or a whole batch, set the quality if you like, and download. You can convert a single file or bulk-convert many at once and grab them all as a ZIP. Because it all runs on your device, your images are never uploaded to a server, and there is no watermark.
Converting PNG to JPG is usually about size: PNG is lossless and can be large, while JPG is much smaller and works everywhere, which makes it ideal for photos, uploads, and sharing. With a quality slider and a "size saved" readout on every file, you stay in control of the trade-off between file size and detail. It is the quick, reliable way to turn a heavy PNG into a lightweight JPG.

✅ Free · No sign-up · No watermark   |   ✅ Quality slider (40–100%)   |   ✅ Batch + ZIP   |   ✅ 100% in your browser - nothing uploaded

H2: Why Convert PNG to JPG?
PNG is a lossless format, which keeps perfect quality but often produces large files - especially for photographs, which can be several times bigger as a PNG than as a JPG. JPG uses efficient lossy compression, so it makes much smaller files, and it is accepted absolutely everywhere: every website, every upload form, every device and app.
So converting PNG to JPG is the right move whenever file size matters or something will not accept a PNG. A photo saved as a PNG can shrink dramatically as a JPG with no visible quality loss, which speeds up uploads and saves space. The one thing to keep in mind is transparency, covered just below - but for photos and solid images, PNG to JPG is a simple, high-value conversion.

H2: How to Convert PNG to JPG in 3 Steps.
Here is how to convert PNG to JPG with RepetiGo. It starts converting the moment you add a file.

Step
What You Do
What Happens
1. Upload your PNG(s)
Drop or select one or more PNG files.
Each converts to JPG at 90% quality automatically.
2. Set quality (optional)
Adjust the quality slider between 40% and 100%.
Files re-convert; each card shows the size and % saved.
3. Download
Download each JPG, or grab them all as a ZIP.
Files save with a .jpg extension, ready to use anywhere.

🔒 The conversion happens in your browser on a canvas - your PNG files are never uploaded to RepetiGo or any server.

H2: Set the JPG Quality.
JPG lets you trade a little quality for a smaller file, and you control that with the quality slider - from 40% up to 100%, in small steps. The default is 90%, which keeps the image looking sharp while producing a sensible file size. Slide toward 100% for maximum detail, or lower it when a smaller file matters more. Each file card shows the converted size and the percentage saved, so you can see the trade-off instantly and pick the right balance.
If you need to hit a specific file-size limit, lower the quality and watch the size readout; for an exact kilobyte target, convert here and then use the Compress Image tool for precise control. The high-quality smoothing keeps edges clean even at lower quality settings.

H2: Transparent Areas Become White.
Here is the one thing to know before converting: JPG cannot store transparency. If your PNG has a transparent background - many logos, icons, and graphics do - those transparent areas are filled with white in the JPG. So a logo on a transparent PNG will come out on a white background once it is a JPG. For photos and images with a solid background, which have no transparency, this makes no difference at all.
If keeping the transparency matters - for a logo you will place on a coloured background, for instance - then JPG is not the right target, and you should keep the image as a PNG. Choosing the right format for the job avoids surprises: JPG for a smaller, flat image, and PNG when transparency needs to be preserved.

⚠️ Converting PNG → JPG removes transparency (it becomes white). If you need a transparent background kept, stay with PNG rather than converting to JPG.

H2: How Much Smaller? The Size Saving.
Every file shows a "size saved" percentage after conversion, so you can see the benefit immediately. Because PNG is lossless and JPG is compressed, a JPG is usually a good deal smaller than the same image as a PNG - and for photographs saved as PNG, the reduction can be dramatic, often cutting the file to a fraction of its original size with no visible quality loss. Simple graphics save less, but photos and detailed images save the most.
Across a batch, those savings add up fast, which is why converting PNGs to JPGs is a common step before uploading or emailing a set of images. The per-file percentage lets you confirm exactly how much lighter each image gets, rather than relying on a general estimate.

H2: How to Convert PNG to JPG on a Mac.
On a Mac you can convert a PNG to JPG using the built-in Preview app: open the PNG, choose File → Export, and set the format to JPEG. That works for a single file. For several files, you can select them in Finder and use Quick Actions → Convert Image → JPEG. Those are the native options if you prefer not to use a website.
That said, for a batch with a quality slider, a size-saved readout, and a single ZIP download, RepetiGo does it right in the browser on your Mac - no app to open, and the same tool works identically on Windows too. So whether you searched for how to convert PNG to JPG on Mac or just want the quickest route, adding your files here and downloading JPGs is the simplest way.

H2: It Also Handles WebP, GIF & SVG.
Although it is called PNG to JPG, this tool also accepts a few other inputs and converts them to JPG the same way: WebP, GIF, and SVG. So if you have a mix of those alongside your PNGs, you can drop them all in together and get JPGs out. Transparent areas in any of them are filled with white, just as with PNG, since the output is always JPG.
One honest exception: it does not reliably handle HEIC (the iPhone photo format). Most browsers other than Safari cannot decode a HEIC image at all, so a HEIC file usually fails with a "could not be opened" error here rather than converting. For iPhone HEIC photos, use the dedicated HEIC to JPG tool instead, which is built specifically to decode HEIC and is linked below. For PNG, WebP, GIF, and SVG, though, this tool has you covered.

💡 Also converts WebP, GIF, and SVG to JPG. For iPhone HEIC photos, use the HEIC to JPG tool - HEIC does not reliably convert here.

H2: Batch Convert Multiple Files (with ZIP Download).
You are not limited to one file. Add as many images as you like - each appears on its own card with its filename, size, dimensions, converted JPG size, and percentage saved - and keep adding more. They all convert automatically, and you can download each JPG individually or grab the whole set as a single ZIP. It is the fast way to turn a folder of PNGs into lightweight JPGs in one go.

✅ Real batch support: drop in many files, convert them all to JPG, and download individually or as one ZIP - all in your browser, nothing uploaded.

H2: Everything Runs in Your Browser.
Like the rest of RepetiGo's image tools, this converter does all its work on your own device. Each PNG is decoded and re-saved as a JPG locally using the browser's canvas - nothing is uploaded, and no server touches your files. That keeps your images private, works on a weak connection, and is why the tool carries a "Files stay in your browser" badge. There is no watermark and no account wall; the JPGs you download are the full, clean files.

🔒 Client-side and private: your files stay on your device, nothing is uploaded, and no watermark is added.

H2: What This Tool Does Not Do.
So you know whether it fits before you start, here is what this converter is not for - and where to go instead.

People often ask for…
The honest answer
Convert JPG back to PNG
No - this goes PNG → JPG (use Convert from JPG for the reverse)
Convert an iPhone HEIC to JPG
No - HEIC does not reliably decode here (use the HEIC to JPG tool)
Keep a transparent background
No - JPG fills transparency white (stay with PNG)
A fill colour other than white
No - transparent areas become white only
Convert PNG to PDF/WebP/ICO
No - output is JPG (use the PNG Converter for those)
Resize while converting
No - convert here, then resize separately
Keep an animated GIF moving
No - only the first frame is converted

H2: PNG to JPG - Frequently Asked Questions.
H3: Is this PNG to JPG converter free?
Yes - RepetiGo's PNG to JPG converter is completely free with no sign-up and no watermark. Because it converts in your browser rather than on a paid server, you can convert as many PNGs as you like to JPG, with a quality slider, individually or as a ZIP, at no cost. There is nothing to unlock.
H3: How do I convert PNG to JPG?
Drop your PNG files onto the tool and they convert to JPG automatically at 90% quality. Adjust the quality slider if you want, then download each JPG or grab them all as a ZIP. It works in any modern browser on any device, and your files are never uploaded to a server.
H3: How do I convert PNG to JPG on a Mac?
On a Mac you can use Preview (File → Export → JPEG) or select files in Finder and use Quick Actions → Convert Image → JPEG. Those are the built-in options. For a batch with a quality slider and a single ZIP download, RepetiGo does it in the browser on your Mac with no app to open - and it works the same on Windows.
H3: Why did my transparent PNG get a white background?
Because JPG cannot store transparency, so any transparent areas in the PNG are filled with white in the JPG. A logo on a transparent PNG will come out on a white background. For photos this makes no difference, but if you need to keep the transparency, do not convert to JPG - keep the image as a PNG instead.
H3: How much smaller is a JPG than a PNG?
It varies by image, but a JPG is usually a good deal smaller than the same image as a PNG, and for photographs the reduction can be dramatic - often a fraction of the original size with no visible quality loss. The tool shows the exact percentage saved for each file, so you can see the benefit for your specific images.
H3: Can I convert several PNGs at once?
Yes. Add as many files as you like and they all convert to JPG automatically, each on its own card showing the size saved. Download them individually or grab the whole set as a single ZIP. It is the quick way to turn a folder of PNGs into lightweight JPGs in one go, on any device.
H3: Can it convert other formats, like WebP or GIF, to JPG?
Yes - although it is called PNG to JPG, it also accepts WebP, GIF, and SVG and converts them to JPG the same way, filling any transparency with white. The one exception is HEIC (iPhone photos): most browsers other than Safari cannot decode HEIC, so it usually fails to open here; for those, use the dedicated HEIC to JPG tool, which is linked below.
H3: Can it convert a JPG back to a PNG?
No - this tool only goes one way, from PNG to JPG. Converting a JPG to a PNG is the opposite direction, handled by the Convert from JPG tool. Note that converting a JPG to PNG does not add transparency, since a JPG never had any - so PNG to JPG here simply makes a smaller, flat JPG.
H3: What happens with an animated GIF?
If you convert an animated GIF, only the first frame is turned into a JPG, since JPG is a still-image format. That is fine for grabbing a single still from an animation, but the movement is not preserved. For normal PNG, WebP, and SVG images this does not apply - it is only relevant for animated GIF input.
H3: Are my files uploaded to a server?
No. The converter runs entirely in your browser using the canvas, so your files never leave your device and nothing is sent to RepetiGo. That keeps your images private, works on a weak connection, and is why there is no watermark on your converted JPGs.

H2: Related Image Tools.
Tool
What It Does
Link
Convert from JPG
The reverse: JPG → PNG or WebP
→ /image-tools/convert-from-jpg
HEIC to JPG
iPhone HEIC → JPG (not handled here)
→ /image-tools/heic-to-jpg
WebP to JPG
Dedicated WebP → JPG
→ /image-tools/webp-to-jpg
PNG Converter
PNG → PDF/WebP/ICO/GIF/BMP
→ /image-tools/png-converter
Compress Image
Shrink the JPG to a KB limit (batch + ZIP)
→ /image-tools/compress-image
All Image Tools
The complete image tools suite
→ /image-tools

[ Convert PNG to JPG Free - Batch + Quality → repetigo.com/image-tools/png-to-jpg ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function PngToJpgPage() {
  return (
    <PngToJpgClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="png-to-jpg-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </PngToJpgClient>
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#png-to-jpg-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/png-to-jpg": "/image-tools/png-to-jpg",
    "/image-tools/convert-from-jpg": "/image-tools/convert-from-jpg",
    "/image-tools/heic-to-jpg": "/image-tools/heic-to-jpg",
    "/image-tools/webp-to-jpg": "/image-tools/webp-to-jpg",
    "/image-tools/png-converter": "/image-tools/png-converter",
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
    "/image-tools/png-to-jpg": "Open PNG to JPG",
    "/image-tools/convert-from-jpg": "Open Convert from JPG",
    "/image-tools/heic-to-jpg": "Open HEIC to JPG",
    "/image-tools/webp-to-jpg": "Open WebP to JPG",
    "/image-tools/png-converter": "Open PNG Converter",
    "/image-tools/compress-image": "Open Compress Image",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PNG to JPG Converter", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based PNG to JPG converter with a quality slider and batch conversion to a ZIP; also accepts WebP, GIF, and SVG input. Runs 100% in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to convert PNG to JPG", step: [{ "@type": "HowToStep", name: "Upload your PNG(s)", text: "Drop or select one or more PNG files." }, { "@type": "HowToStep", name: "Set quality (optional)", text: "Adjust the quality slider between 40% and 100%." }, { "@type": "HowToStep", name: "Download", text: "Download each JPG, or grab them all as a ZIP." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "PNG to JPG", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
