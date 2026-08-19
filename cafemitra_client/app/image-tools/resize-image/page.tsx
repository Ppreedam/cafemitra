import type { Metadata } from "next";
import ResizeImageClient from "./ResizeImageClient";

const pageUrl = "https://repetigo.com/image-tools/resize-image";

export const metadata: Metadata = {
  title: "Resize Image Free - Image Resizer by Size, %, or Social | RepetiGo",
  description:
    "Free image resizer - resize an image by exact pixels, percentage, or a social-media preset. Lock the aspect ratio and export WebP or PNG. Runs in your browser.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Resize Image Free - Image Resizer by Size, %, or Social",
    description: "Resize by exact pixels, percentage, or a social preset. Lock aspect ratio, export WebP or PNG.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Resize Image Free - Image Resizer",
    description: "Free image resizer. By size, %, or social preset. Aspect-lock, WebP/PNG, 100% in your browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Resize Image Free - Image Resizer by Size, Percentage or Social Preset.

RepetiGo's resize image tool is a free, browser-based image resizer that changes the dimensions of a JPG, PNG, or WebP picture in three ways: by exact size in pixels, by percentage, or with a ready-made social-media preset. Upload one image, pick how you want to resize it, and download the result. Because it runs entirely in your browser, your image never leaves your device - nothing is uploaded to a server.
Whether you need an exact 512×512 icon, a photo scaled to 50%, or an image sized perfectly for an Instagram post, this free image resizer handles it. Lock the aspect ratio so nothing stretches, choose WebP for a smaller file or PNG to stay lossless, and even aim for a target file size in kilobytes. It is a fast, no-sign-up way to resize an image without installing anything.

✓ Free · No sign-up · No watermark   ✓ By size, %, or social preset   ✓ Lock aspect ratio · WebP/PNG   ✓ 100% in your browser - nothing uploaded

H2: How to Resize an Image in 3 Steps.
Here is how to resize an image with RepetiGo. Pick a mode, set your target, and download - the whole thing takes seconds.

Step
What You Do
What Happens
1. Upload your image
Click or drag-and-drop a JPG, PNG, or WebP file.
A live preview appears with the current dimensions and size.
2. Choose a mode & target
By Size (pixels), As Percentage (10–200%), or a Social Media preset.
Lock the aspect ratio if you want height to follow width automatically.
3. Download
Pick WebP or PNG, set quality if needed, and download.
The footer shows the final width × height and file size.

🔒 Every resize happens in your browser using the Canvas engine - your image is never uploaded to RepetiGo or any server.

H2: Three Ways to Resize: By Size, Percentage & Social Media.
Different jobs call for different ways to resize, so the tool gives you three modes you can switch between at any time.

Mode
What it does
Use it when
By Size
Enter an exact width and height in pixels
You need a precise size (e.g. 413×531 or 512×512)
As Percentage
Scale from 10% up to 200% with a slider
You just want it "half the size" or "double"
Social Media
Pick a ready-made platform preset
You are posting to Instagram, Facebook, LinkedIn or YouTube

By Size is the most precise - type the exact pixels you need. As Percentage is the quickest way to shrink a photo proportionally. And the Social Media presets set the right dimensions for you in one click, which we cover in detail below.

H2: Lock Aspect Ratio - Resize Without Stretching.
The single most useful option is the Lock aspect ratio toggle. With it on, changing the width automatically adjusts the height (and vice versa) so your image keeps its proportions - it shrinks or grows evenly, with no stretching or squashing. This is exactly what people mean when they want to resize an image for Instagram without cropping or distorting it: lock the ratio and scale it down proportionally.
Turn the lock off only when you deliberately need a specific width and height that do not match the original ratio - for example forcing an image to an exact 1200×627 box. Just know that unlocking and entering mismatched dimensions will stretch the image, because this tool scales to the size you set rather than cropping to fit. If you need to change the shape by cutting rather than stretching, use the Crop Image tool linked below.

💡 Rule: keep Lock aspect ratio ON for photos so they never distort. Turn it OFF only when a platform demands an exact non-proportional size.

H2: Resize to Exact Pixels (512×512, 72×72 and Any Size).
When you need a precise pixel size, use By Size mode and type the numbers. This is the fastest way to hit common exact dimensions - a 512×512 app icon, a 72×72 avatar, a 1024×1024 image, or any custom size a form or platform demands. Enter the width and height, and the tool resizes to exactly that.
For square targets like 512×512 or 72×72, turn Lock aspect ratio off if your source is not already square, so the tool produces the exact square you asked for. If keeping the proportions matters more than hitting the exact box, leave the lock on and match one dimension. Either way, the result footer confirms the final width × height before you download.

H2: Resize to a Target File Size in KB.
Sometimes the limit is not the dimensions but the file size - a portal that only accepts images under a certain number of kilobytes. RepetiGo has an optional target file size field for exactly this: enter a size in KB and the tool progressively lowers the quality to bring the file close to your target while resizing. It is how you resize an image to 20KB or resize an image to 100KB for a strict upload limit.
One important detail so it works for you: the target-size option applies to WebP output, not PNG, because PNG is lossless and cannot be squeezed to an arbitrary size the same way. So if you are aiming for a specific KB limit, choose WebP as the output format. If you need pure compression at the current dimensions instead of resizing, the dedicated Compress Image tool is the better fit and is linked below.

📊 To hit a KB limit: choose WebP output, enter your target in the KB field, and the quality auto-adjusts toward it. For strict exam/portal limits, combine a smaller pixel size with WebP.

H2: Social Media Sizes - Instagram, Facebook, LinkedIn & YouTube.
Getting a post to the right size is a one-click job with the Social Media mode. Select a platform and the width and height are set for you:

Preset
Dimensions
For
Instagram Post
1080 × 1080
Square feed posts
Instagram Story
1080 × 1920
Vertical stories & reels covers
Facebook Post
1200 × 630
Shared link/image posts
LinkedIn Post
1200 × 627
Feed posts
YouTube Thumbnail
1280 × 720
Video thumbnails

These five presets cover the most common posts. For sizes that are not in the list - a YouTube banner (2560×1440) or a Facebook cover - use By Size mode and type the exact dimensions; the presets handle posts and thumbnails, and By Size handles everything else. Keep Lock aspect ratio in mind: fitting a non-square photo into a square Instagram post proportionally means matching one side and accepting some empty space rather than stretching.

H2: ★ Indian Use Cases - ID & Exam Photo Dimensions.
Resizing to an exact pixel size is one of the most common document tasks in India, because government portals and exam bodies specify precise photo dimensions and reject anything that does not match.

Portal / Use
Typical dimensions
Workflow
Passport Seva photo
413 × 531 px
By Size → 413×531 → export
NTA exam photo (NEET/JEE)
Set px + under KB limit
By Size + WebP target KB
Aadhaar / UIDAI update
Portal-specified px
By Size → exact px
PAN application photo
Specified px size
By Size → exact px
Signature image
Portal-specified px
By Size → exact px

🇮🇳 Full ID-photo workflow: (1) White background at /image-tools/background-remover. (2) Resize to the exact px here (e.g. 413×531 for passport). (3) Hit the KB limit with WebP output, or compress at /image-tools/compress-image. All free and linked below.

H2: How to Resize an Image in Paint, Photoshop, Illustrator, InDesign, Mac & iPhone.
If you would rather use software you already have, here are the standard routes - and where the browser tool is quicker.
How to resize an image in Paint: open the image → Home tab → Resize → choose Pixels, tick "Maintain aspect ratio," enter the new width or height → OK → Save As. It is the simplest desktop option on Windows. In Photoshop (ps how to resize image): Image → Image Size → set width/height (keep the link icon on for proportional) → OK. In Photopea, the free browser Photoshop clone, it is the same Image → Image Size menu.
In Illustrator, select the object → use the Transform panel (W/H) or Object → Transform → Scale. In InDesign, select the frame → set W/H in the Control panel, holding Shift to keep proportions. On a Mac, open the image in Preview → Tools → Adjust Size → enter dimensions → keep "Scale proportionally" ticked. On an iPhone, there is no built-in resizer, so people use a web tool - RepetiGo runs in Safari with nothing to install, which is the easiest way to resize an image on the phone itself.

H2: Will Resizing Reduce Image Quality?
It depends on the direction. Making an image smaller (downsizing) keeps it looking sharp - you are removing pixels the screen did not need, so quality holds up well. That is why resizing down for a portal, an email, or the web is safe and common. Choosing PNG output keeps it lossless; WebP gives a smaller file at a quality you control with the slider.
Making an image larger than its original size is where quality drops. Because resizing only scales the pixels you already have (it does not invent new detail), pushing past 100% can make a photo look soft or pixelated. If you specifically need a bigger, cleaner image, that is a job for upscaling, not resizing - the Upscale Image tool adds detail as it enlarges. So to resize an image without pixelation, resize down freely, and enlarge with the upscaler rather than the resizer.

H2: Everything Runs in Your Browser - Nothing Uploaded.
RepetiGo resizes your image on your own device using the browser's Canvas engine. Your picture is never sent to a server, which keeps private photos private, works even on a weak connection, and is why the tool carries a "Files stay in your browser" badge. There is no account wall and no watermark - the resized image you download is the full, clean file.

🔒 Client-side means private: your image stays on your device, nothing is uploaded, and no watermark is added - good for ID photos and personal pictures.

H2: What This Image Resizer Does Not Do.
So you know whether it fits before you start, here is what this resizer is not built for - and where to go instead.

People often ask for…
The honest answer
Bulk / batch resizing
No - one image at a time (no multi-file, no ZIP)
Resize by DPI / print size (inches, cm)
No - it resizes in pixels only, not by DPI
JPG output
No - output is WebP or PNG (convert afterwards if you need JPG)
Crop-to-fit a different shape
No - it scales; use the Crop tool to change shape by cutting
Enlarge with added detail
No - resizing scales pixels; use the Upscale tool to add detail
A target KB on PNG output
No - the KB target works on WebP output only

H2: Resize Image - Frequently Asked Questions.
H3: Is this image resizer free?
Yes - RepetiGo's resize image tool is completely free with no sign-up and no watermark. Because it resizes in your browser rather than on a paid server, there is nothing to unlock: resize by pixels, percentage, or a social preset, lock the aspect ratio, and export as WebP or PNG at no cost.
H3: How do I resize an image to exact pixels like 512×512?
Use By Size mode and type the width and height - for example 512 and 512. If your source is not already square, turn off Lock aspect ratio so the tool produces the exact square you asked for. The result footer confirms the final dimensions before you download. The same steps work for any exact size, like 72×72 or 1024×1024.
H3: How do I resize an image without stretching or cropping?
Turn on Lock aspect ratio. With it on, changing one dimension adjusts the other automatically, so the image scales proportionally with no stretching. This is how you resize for Instagram or any platform without distorting the picture. If you need to change the actual shape, crop it with the Crop Image tool rather than resizing.
H3: How do I resize an image to a target KB size?
Choose WebP as the output format and enter your limit in the target file size field - the tool lowers the quality progressively to bring the file close to that KB target. This is how you resize an image to 20KB or 100KB for a strict upload. Note the KB target works for WebP output, not PNG, because PNG is lossless.
H3: Can I resize several images at once?
No - this tool resizes one image at a time; there is no batch or ZIP option here. Resize an image, download it, then start over with the next. If you need to shrink the file size of many images, the Compress Image tool supports multiple files and a ZIP download.
H3: How do I resize an image in Paint?
In MS Paint, open the image, click Resize on the Home tab, choose Pixels, tick "Maintain aspect ratio," enter a new width or height, and click OK, then Save As. It is the simplest option on Windows. If you would rather not open Paint, RepetiGo resizes in the browser with the same proportional control and a live preview.
H3: Which output format should I choose - WebP or PNG?
Choose WebP for a smaller file, with a quality slider from 40% to 100% and the option to hit a KB target. Choose PNG when you need lossless quality or must keep transparency. This tool exports WebP or PNG; if a portal specifically needs a JPG, convert the result afterwards with the convert tools.
H3: Will resizing reduce the quality?
Making an image smaller keeps it sharp, because you are only removing pixels - so resizing down for the web, email, or a portal is safe. Making it larger than the original can look soft or pixelated, because resizing does not add new detail. To enlarge cleanly, use the Upscale Image tool, which reconstructs detail as it grows the image.
H3: Can I resize for Instagram, Facebook or YouTube?
Yes. Switch to Social Media mode and pick a preset: Instagram Post (1080×1080), Instagram Story (1080×1920), Facebook Post (1200×630), LinkedIn Post (1200×627), or YouTube Thumbnail (1280×720). The dimensions are set for you. For sizes not in the list, like a YouTube banner, use By Size and type the exact pixels.
H3: Is my image uploaded to a server?
No. The resizer runs entirely in your browser using the Canvas engine, so your image never leaves your device - nothing is sent to RepetiGo. That keeps ID photos and personal pictures private, works on a weak connection, and is why there is no watermark on your resized image.

H2: Related Image Tools.
Tool
What It Does
Link
Compress Image
Pure file-size compression (supports batch + ZIP)
→ /image-tools/compress-image
Crop Image
Change the shape by cutting, not scaling
→ /image-tools/crop-image
Upscale Image
Enlarge with added detail (2×/4×)
→ /image-tools/upscale-image
Remove Background
White ID background before resizing
→ /image-tools/background-remover
Convert from JPG
Change format before or after resizing
→ /image-tools/convert-from-jpg
All Image Tools
The complete image tools suite
→ /image-tools

[ Resize an Image Free - No Upload → repetigo.com/image-tools/resize-image ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function ResizeImagePage() {
  return (
    <ResizeImageClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="resize-image-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </ResizeImageClient>
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
  if (lines[0] === "Mode" && lines[1] === "What it does") return { headers: ["Mode", "What it does", "Use it when"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Preset" && lines[1] === "Dimensions") return { headers: ["Preset", "Dimensions", "For"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Portal / Use" && lines[1] === "Typical dimensions") return { headers: ["Portal / Use", "Typical dimensions", "Workflow"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#resize-image-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/crop-image": "/image-tools/crop-image",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/upscale-image": "/image-tools/upscale-image",
    "/image-tools/background-remover": "/image-tools/background-remover",
    "/image-tools/convert-from-jpg": "/image-tools/convert-from-jpg",
    "/products/printpilot": "/print-automation",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/crop-image": "Open Crop Image",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/upscale-image": "Open Upscale Image",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/convert-from-jpg": "Open Convert from JPG",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Resize Image", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based image resizer - resize by exact pixels, percentage, or a social-media preset, with an aspect-ratio lock and WebP/PNG export. Runs 100% in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to resize an image", step: [{ "@type": "HowToStep", name: "Upload your image", text: "Click or drag-and-drop a JPG, PNG, or WebP file." }, { "@type": "HowToStep", name: "Choose a mode & target", text: "By Size (pixels), As Percentage (10–200%), or a Social Media preset." }, { "@type": "HowToStep", name: "Download", text: "Pick WebP or PNG, set quality if needed, and download." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Resize Image", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
