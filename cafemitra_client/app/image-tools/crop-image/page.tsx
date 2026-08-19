import type { Metadata } from "next";
import CropImageClient from "./CropImageClient";

const pageUrl = "https://repetigo.com/image-tools/crop-image";

export const metadata: Metadata = {
  title: "Crop Image Free Online - Rectangle & Circle Crop | RepetiGo",
  description:
    "Free online crop image tool - drag to crop, use exact numbers, or pick a ratio (1:1, 16:9). Crop an image into a circle with a transparent PNG. Runs in your browser.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Crop Image Free Online - Rectangle & Circle Crop",
    description: "Drag to crop, use exact numbers, or pick a ratio. Crop into a circle with a transparent PNG.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Crop Image Free Online - Rectangle & Circle Crop",
    description: "Free crop tool. Drag + 8 handles + exact numbers, ratio presets, circle → transparent PNG.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Crop Image Free Online - Rectangle & Circle Crop in the Browser.

RepetiGo's crop image tool is a free, browser-based crop editor that lets you cut a JPG, PNG, or WebP picture down to exactly the part you want. Drag a selection box straight on the image, fine-tune it with the eight handles, or type exact numbers - and pick a ratio like 1:1 or 16:9 when you need it. You can even crop an image into a circle and get a clean transparent PNG. Because it runs entirely in your browser, your image is never uploaded to a server.
Cropping is about choosing what stays in the frame, and this tool makes that precise and fast. Move and resize the crop box by hand, or set Width, Height, and position by number for pixel-perfect results. It is a genuinely free crop image online tool - no account, no watermark, nothing to install - with a live preview so you see the result before you download.

✓ Free · No sign-up · No watermark   ✓ Drag + 8 handles + exact numbers   ✓ Ratio presets + Circle crop (transparent PNG)   ✓ 100% in your browser

H2: How to Crop an Image in 3 Steps.
Here is how to crop an image with RepetiGo. The crop box appears on your image the moment it loads, ready to drag.

Step
What You Do
What Happens
1. Upload your image
Click or drag-and-drop a JPG, PNG, or WebP file.
A crop box appears on the image with a live, shaded preview.
2. Set your crop
Drag the box, pull the handles, type exact numbers, or pick a ratio.
The area outside the crop dims so you see exactly what you will keep.
3. Download
Check the result dimensions and download the cropped image.
For a Circle crop, you get a transparent PNG; otherwise the cropped picture.

🔒 Every crop happens in your browser using the Canvas engine - your image is never uploaded to RepetiGo or any server.

H2: Three Ways to Set Your Crop - Drag, Handles & Exact Numbers.
You can crop by feel or by numbers, whichever suits the job. The interactive editor gives you a draggable selection box you can move anywhere on the image, plus eight resize handles - one on each corner and each edge - so you can pull the crop to precisely the shape you want.
When precision matters, use the numeric inputs instead: type an exact Width, Height, and Position X / Position Y, and the crop box snaps to those values (auto-clamped so it never runs off the image). This is ideal when a document or template needs an exact crop size and position. The two methods work together - drag to get close, then fine-tune the numbers.

💡 Tip: pull a rough crop by dragging the box, then nudge the Width/Height/X/Y numbers for a pixel-perfect result. The Reset button returns the box to the full image at any time.

H2: Aspect Ratio Presets - 1:1, 4:3, 16:9 and More.
Often you do not want a random crop - you want a specific shape. Pick an aspect ratio preset and the crop box locks to that ratio and auto-centres, so you just position and resize it while it stays perfectly proportioned.

Preset
Shape
Common use
FreeForm
Any shape
Crop to whatever you like
1:1
Square
Profile pictures, Instagram posts, thumbnails
4:3
Landscape
Standard photos, presentations
3:4
Portrait
Vertical photos, ID-style framing
16:9
Wide
YouTube thumbnails, banners, wallpapers
9:16
Tall
Stories, reels, phone wallpapers
Circle
Round
Profile pictures / DPs (transparent PNG)

Select a preset and the box reshapes instantly; switch back to FreeForm any time for a custom crop. This is the quickest way to crop an image to a shape that a platform or document expects.

H2: How to Crop an Image into a Circle.
A round crop is one of the most-requested jobs, and RepetiGo does it properly. To crop an image into a circle, pick the Circle preset, position the round selection over the part you want (a face works best centred), and download. The result is a transparent PNG - the area outside the circle is removed, not filled with white - so your circular image drops cleanly onto any background, slide, or profile field.
This is exactly what you need for a profile picture or DP: a circle crop image with a see-through background sits perfectly in the round photo slots that apps and websites use, with no ugly square corners behind it. Because the output is a transparent PNG, keep it as PNG when you save - converting it to JPG would add a white background and lose the transparency.

🔵 Circle crop = transparent PNG. Perfect for round profile pictures and DPs. Keep it as PNG so the transparent corners stay transparent.

H2: ★ Indian Use Cases - ID Photos & Profile Pictures.
Cropping is a daily task at Indian print shops and cyber cafes, and for anyone preparing documents or social profiles.

Use
How to crop it
Tip
Passport / ID photo framing
Use 3:4 to frame the head-and-shoulders correctly
Then resize to the exact portal px
WhatsApp / Instagram DP
Circle crop for a round profile picture
Keep PNG for the transparent corners
Square social post
1:1 preset
Position the subject centrally
Document scan cleanup
FreeForm to cut off edges and margins
Type exact numbers for a clean rectangle
YouTube thumbnail
16:9 preset
Crop the key part of the frame

🇮🇳 ID-photo workflow: crop to frame the face (3:4) here → remove the background and add white at /image-tools/background-remover → resize to the exact px and KB at /image-tools/resize-image. All free and linked below.

H2: How to Crop an Image in PowerPoint, Word, Photoshop, Illustrator, Inkscape, GIMP & Mac.
Prefer software you already have open? Here are the standard routes - and where the browser tool is quicker, especially for a circle crop.
How to crop an image in PowerPoint (and Word): click the picture → Picture Format tab → Crop → drag the black crop handles → click Crop again to apply. For a round crop, use Crop → Crop to Shape → Oval. In Photoshop, select the Crop tool (C), drag the box, and press Enter; for how to crop an image in Photoshop to a circle, use the Elliptical Marquee → Select Inverse → Delete on a layer with transparency. In Illustrator, place the image, draw a shape on top, select both, and use Object → Clipping Mask → Make.
Inkscape is free: to crop, draw a rectangle over the area, select both the image and the rectangle, then Object → Clip → Set - this is the quick inkscape crop image method. In GIMP, use the Crop tool (Shift+C) and drag, or Image → Crop to Selection. On a Mac, open the image in Preview, drag a selection with the rectangular tool, and press Command+K to crop. All of these work, but for a fast rectangular or circular crop with a transparent PNG, the browser tool needs no software at all.

H2: Crop vs Resize - What Is the Difference?
These two get mixed up, so here is the simple distinction. Cropping cuts away part of the image - the pixels you remove are gone, and the subject gets larger in the frame because you kept a smaller area. Resizing scales the whole image up or down - nothing is cut, the dimensions just change. In short: crop changes what is in the picture; resize changes how big the picture is.
You often use both together. For an ID photo, you might crop to frame the face correctly, then resize to the exact pixel size a portal wants. This crop tool handles the cutting; the Resize Image tool, linked below, handles the scaling. If you need to make the file smaller without changing dimensions, that is compression - a job for the Compress Image tool.

H2: Everything Runs in Your Browser - Nothing Uploaded.
RepetiGo crops your image on your own device using the browser's Canvas engine. Your picture is never sent to a server, which keeps private photos and ID images private, works on a weak connection, and means there is no watermark and no account wall. The cropped image you download is the full, clean file.

🔒 Client-side means private: your image stays on your device, nothing is uploaded, and no watermark is added.

H2: What This Crop Tool Does Not Do.
So you know whether it fits before you start, here is what the crop tool is not built for - and where to go instead.

People often ask for…
The honest answer
Batch cropping many images
No - one image at a time (no multi-file)
Heart, star, or rounded-rectangle crops
No - the shape options are rectangle/ratio and Circle
Rotating the crop box at an angle
No - the crop box is a straight (axis-aligned) rectangle
A rule-of-thirds grid overlay
No - there is a live shaded preview, but no grid lines
Zoom / pan inside the crop editor
No - you crop at the fitted preview size
Resizing or enlarging
No - cropping cuts; use Resize or Upscale for size

H2: Crop Image - Frequently Asked Questions.
H3: Is this crop tool free?
Yes - RepetiGo's crop image tool is completely free with no sign-up and no watermark. Because it crops in your browser rather than on a paid server, everything is available at no cost: drag-and-numeric cropping, ratio presets, and circle crop with a transparent PNG. There is no premium tier to unlock.
H3: How do I crop an image into a circle?
Pick the Circle preset, position the round selection over the part you want (a centred face works best), and download. The result is a transparent PNG - the area outside the circle is removed, not filled with white - so it sits cleanly in round profile slots. Keep it as PNG, because saving as JPG would add a white background and lose the transparency.
H3: How do I crop to an exact size?
Use the numeric inputs: type an exact Width, Height, Position X, and Position Y, and the crop box snaps to those values (clamped so it stays on the image). This is ideal when a document or template needs a precise crop. You can drag the box to get close first, then fine-tune the numbers for a pixel-perfect result.
H3: How do I crop an image in PowerPoint?
Click the picture, open the Picture Format tab, click Crop, drag the black handles to trim, and click Crop again to apply. For a round crop, use Crop → Crop to Shape → Oval. That crops inside the slide; if you need the standalone image file cropped, do it here first and then insert it into PowerPoint.
H3: Can I crop several images at once?
No - this tool crops one image at a time; there is no batch or multi-file option. Crop an image, download it, then start over with the next one. If cropping is part of a larger edit across tools, the Photo Editor lets you crop alongside filters, text, and more on a single image.
H3: What is the difference between crop and resize?
Cropping cuts away part of the image, so the pixels you remove are gone and the subject fills more of the frame. Resizing scales the whole image up or down without cutting anything - only the dimensions change. Use crop to choose what stays in the picture, and resize to change how big it is; the Resize Image tool handles the second job.
H3: What image formats can I crop?
You can crop JPG, PNG, and WebP images. A normal rectangular crop downloads the cropped picture, and a Circle crop always downloads a transparent PNG so the area outside the circle stays see-through. If you need a specific output format afterwards, use the convert tools linked below.
H3: How do I crop an image in Inkscape or GIMP?
In Inkscape: draw a rectangle over the area you want, select both it and the image, then Object → Clip → Set. In GIMP: use the Crop tool (Shift+C) and drag, or Image → Crop to Selection. Both are free desktop options; for a quick rectangular or circular crop with a transparent PNG, the browser tool needs no install.
H3: Can I rotate or use a heart/star shaped crop?
No - the crop box is a straight rectangle (you cannot rotate it to an angle), and the only non-rectangular shape is Circle. There are no heart, star, or rounded-rectangle crop shapes. For a circular profile picture, use the Circle preset; for other creative shapes you would need a dedicated design tool.
H3: Is my image uploaded to a server?
No. The crop tool runs entirely in your browser using the Canvas engine, so your image never leaves your device - nothing is sent to RepetiGo. That keeps ID photos and personal pictures private, works on a weak connection, and is why there is no watermark on your cropped image.

H2: Related Image Tools.
Tool
What It Does
Link
Resize Image
Scale the image size after cropping
→ /image-tools/resize-image
Compress Image
Shrink the cropped file for sharing
→ /image-tools/compress-image
Remove Background
Transparent background for a DP or ID photo
→ /image-tools/background-remover
Photo Editor
Crop as part of a bigger edit
→ /image-tools/photo-editor
Convert from JPG
Change format after cropping
→ /image-tools/convert-from-jpg
All Image Tools
The complete image tools suite
→ /image-tools

[ Crop an Image Free - Rectangle or Circle → repetigo.com/image-tools/crop-image ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function CropImagePage() {
  return (
    <CropImageClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="crop-image-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </CropImageClient>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "🔁", "🔄", "★", "🔵"];

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
  if (lines[0] === "Preset" && lines[1] === "Shape") return { headers: ["Preset", "Shape", "Common use"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Use" && lines[1] === "How to crop it") return { headers: ["Use", "How to crop it", "Tip"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#crop-image-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/crop-image": "/image-tools/crop-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/background-remover": "/image-tools/background-remover",
    "/image-tools/convert-from-jpg": "/image-tools/convert-from-jpg",
    "/image-tools/photo-editor": "/image-tools/photo-editor",
    "/products/printpilot": "/print-automation",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/crop-image": "Open Crop Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/convert-from-jpg": "Open Convert from JPG",
    "/image-tools/photo-editor": "Open Photo Editor",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Crop Image", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based crop tool - drag, resize handles, or exact numbers to crop a rectangle, ratio preset, or circle with a transparent PNG. Runs 100% in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to crop an image", step: [{ "@type": "HowToStep", name: "Upload your image", text: "Click or drag-and-drop a JPG, PNG, or WebP file." }, { "@type": "HowToStep", name: "Set your crop", text: "Drag the box, pull the handles, type exact numbers, or pick a ratio." }, { "@type": "HowToStep", name: "Download", text: "Check the result dimensions and download the cropped image." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Crop Image", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
