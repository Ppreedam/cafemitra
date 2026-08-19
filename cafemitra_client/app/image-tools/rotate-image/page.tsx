import type { Metadata } from "next";
import RotateImageClient from "./RotateImageClient";

const pageUrl = "https://repetigo.com/image-tools/rotate-image";

export const metadata: Metadata = {
  title: "Rotate Image Free - Rotate & Flip by 90° or Any Angle | RepetiGo",
  description:
    "Free image rotator - rotate a photo left, right, 180°, or any exact angle, and flip it. Batch-rotate many images and download a ZIP. Runs in your browser, no upload.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Rotate Image Free - Rotate & Flip by 90° or Any Angle",
    description: "Rotate left/right/180° or any exact angle, flip, and batch-rotate to a ZIP. In your browser.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Rotate Image Free - Rotate & Flip Online",
    description: "Free image rotator. 90°/180°/any angle, flip H/V, batch + ZIP, 100% in your browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Rotate Image Free - Rotate & Flip by 90° or Any Exact Angle.

RepetiGo's rotate image tool is a free, browser-based image rotator that turns a JPG, PNG, or WebP picture any way you need - left, right, 180°, or any exact angle from 0 to 360°. You can also flip it horizontally or vertically, and rotate a whole batch of images at once, downloading them together as a ZIP. Because everything runs in your browser, your files are never uploaded to a server.
It fixes the everyday problems: a photo that came out sideways, a scan that loaded rotated, or a set of images that all need the same turn. Use the quick 90° buttons for a fast fix, or type a precise angle to straighten something by hand. The output keeps your original format, and a preview shows the before and after so you know exactly what you are downloading.

✓ Free · No sign-up · No watermark   ✓ 90° / 180° / any custom angle   ✓ Flip H & V · batch + ZIP   ✓ 100% in your browser - nothing uploaded

H2: How to Rotate an Image in 3 Steps.
Here is how to rotate an image with RepetiGo. It starts working the moment you add a file, so a simple turn takes seconds.

Step
What You Do
What Happens
1. Upload your image(s)
Click or drag-and-drop one or more JPG, PNG, or WebP files.
Each file appears as a card and is processed with the current settings.
2. Set rotation & flip
Use Left 90° / Right 90° / 180°, type a custom angle, or flip H/V.
The setting applies to your images; open the preview to compare before/after.
3. Download
Download each image, or grab them all as a ZIP.
Files save with a "-rotated" suffix, keeping their original format.

🔒 Every rotation happens in your browser using the Canvas engine - your images are never uploaded to RepetiGo or any server.

H2: Quick 90° / 180° Buttons and Any Custom Angle (0–360°).
Most rotations are simple quarter-turns, so there are one-click buttons for them: Left 90°, Right 90°, and 180°. Tap Right 90° to fix a photo that is lying on its side, or 180° to flip an upside-down scan the right way up. A Reset button returns everything to 0° with no flip whenever you want to start again.
When you need something precise, the custom angle input takes any exact degree from 0 to 360 - so you can nudge a slightly tilted photo by 3° or 5° to straighten it, or set any specific angle you need. This is what sets a proper image rotator apart from a simple quarter-turn tool: you are not limited to 90° steps. The canvas expands to fit the rotated image, so nothing gets cut off at the corners.

💡 Straightening a slightly crooked photo? Try a small custom angle like 2–5° (or 355–358° the other way), check the preview, and adjust until the horizon looks level.

H2: Flip Horizontal & Vertical.
Rotation turns an image; flipping mirrors it. The Flip Horizontal toggle mirrors left-to-right (useful for a selfie that came out reversed, or to face a subject the other way), and Flip Vertical mirrors top-to-bottom. Both are independent toggles, and they combine with rotation - so you can rotate 90° and flip in the same step. Toggle them off or hit Reset to return to the original orientation.

H2: Rotate Many Images at Once - Batch + ZIP.
You are not limited to one image. Upload several at once - each gets its own card with a thumbnail and dimensions - and you can keep adding more after the studio is open. Apply your rotation and flip, then download each image individually or grab them all in one bulk ZIP download. It is a real time-saver for a folder of sideways scans or phone photos.
One honest detail so it works as you expect: the rotation and flip you set apply to every image in the batch - the same turn for all of them. That is perfect when a whole set needs the same fix (for example a stack of scans that all came in rotated the same way). If different images need different angles, rotate them in separate rounds, or remove the ones that are already correct before applying.

✅ Real batch support: upload many, apply one rotation/flip to all, then download individually or as a single ZIP - all in your browser. Same angle for every file in the batch.

H2: Rotating at Angles That Are Not 90° - Corner Gaps Explained.
When you rotate by a clean 90° or 180°, the result is a perfect rectangle. But when you rotate by any other angle - say 10° to straighten a photo - the tilted image no longer fits neatly in a rectangle, so the tool expands the canvas to fit the whole picture (nothing is cropped) and the four corners become empty, transparent areas. This is normal and unavoidable for angled rotation in any tool.
If you want a clean rectangle without those transparent corners, crop the result afterwards with the Crop Image tool - a quick rectangular crop removes the gaps and leaves a straight, tidy photo. So the workflow for straightening a tilted horizon is: rotate by the small angle here, then crop to taste. The transparent corners save as-is in a format that supports transparency; there is no background-fill colour option, so cropping is the way to remove them.

💡 Straighten-and-clean workflow: rotate by a few degrees here → then crop the transparent corners at /image-tools/crop-image for a neat rectangle.

H2: Why Does My Image Rotate by Itself on Export or on iPhone?
This is one of the most confusing image problems, and it has a simple cause. Photos from phones and cameras store an "EXIF orientation" tag - a hidden note that says "display this rotated." Some apps read that tag and show the photo correctly; others ignore it. So an image that looks upright on your phone can suddenly appear sideways when you export it from InDesign, open it somewhere else, or upload it - this is exactly the "image rotates when I export from InDesign" issue, and the same reason photos sometimes look wrong after moving off an iPhone.
The reliable fix is to "bake in" the correct orientation: rotate the image to look right and re-save it, so the pixels themselves are upright rather than relying on a tag some apps ignore. Upload the photo here, rotate it until it looks correct, and download - the saved file is now genuinely in that orientation and will display the same way everywhere. Note this tool does not auto-detect EXIF orientation for you, so set the rotation manually; once you do, the export or upload problem goes away.

H2: How to Rotate an Image in Photoshop, GIMP, Word, Google Docs, Paint & iPhone.
Prefer software you already have open? Here are the standard routes for each.
How to rotate an image in Photoshop: Image → Image Rotation → 90° CW / 90° CCW / 180°, or Arbitrary for a custom angle; to rotate just a layer, use Edit → Transform → Rotate. In GIMP: Image → Transform for 90°/180°, or Tools → Transform Tools → Rotate for a custom angle (this is the quick how to rotate an image in GIMP method). In Word: click the picture → Picture Format → Rotate → choose an option or More Rotation Options for an exact angle; the same menu appears in Google Docs under Image options → Size & rotation.
In MS Paint: use the Rotate button on the Home tab for 90°/180° and the flip options; Paint does not do arbitrary angles, so for a custom tilt a browser tool is easier. On an iPhone: open Photos → Edit → the crop icon → the rotate icon (top-left) for 90° turns or the dial for a fine angle, then Done. All of these work; for a quick 90° fix, a custom-angle straighten, or batch-rotating several files at once, the browser tool needs no software and keeps everything on your device.

H2: ★ Indian Use Cases - Scanned Documents & Phone Photos.
Rotation is a constant need at Indian print shops and cyber cafes, where scanned documents and phone photos routinely come in the wrong way round.

Scenario
Problem
How to fix it here
Scanned document sideways
Scanner fed the page landscape
Right 90° (or Left 90°) → download
Batch of scanned pages
A whole stack scanned rotated
Upload all → one 90° turn → ZIP download
Phone photo uploads sideways
EXIF orientation ignored by a portal
Rotate to look correct → re-save → upload
Upside-down scan
Page scanned inverted
180° → download
Slightly tilted photo
Crooked horizon
Custom small angle → then crop the corners

🇮🇳 Print-shop tip: for a stack of sideways scans that all need the same turn, upload them together, apply one 90° rotation, and download the ZIP - much faster than fixing each file. Then compress at /image-tools/compress-image if needed.

H2: Everything Runs in Your Browser - Nothing Uploaded.
RepetiGo rotates your images on your own device using the browser's Canvas engine. Your files are never sent to a server, which keeps scanned documents and personal photos private, works on a weak connection, and is why the tool carries a "Files stay in your browser" badge. There is no watermark and no account wall - the rotated images you download are the full, clean files, in their original format.

🔒 Client-side means private: your images stay on your device, nothing is uploaded, and no watermark is added - good for scanned documents and personal photos.

H2: What This Rotate Tool Does Not Do.
So you know whether it fits before you start, here is what the rotate tool is not built for - and where to go instead.

People often ask for…
The honest answer
Different angles for different files in a batch
No - one rotation/flip applies to all files at once
Auto-straighten / EXIF orientation auto-fix
No - set the rotation manually (which does fix it)
A grid or protractor to straighten by eye
No - use the custom angle input and the preview
Auto-crop the transparent corners after rotating
No - crop them with the Crop Image tool
A background colour behind an angled rotation
No - the corners are transparent (crop to remove)
Choosing a different output format
No - output keeps the original format (convert after)

H2: Rotate Image - Frequently Asked Questions.
H3: Is this image rotator free?
Yes - RepetiGo's rotate image tool is completely free with no sign-up and no watermark. Because it rotates in your browser rather than on a paid server, everything is available at no cost: quick 90°/180° turns, any custom angle, flip, and batch rotation with a ZIP download. There is no premium tier to unlock.
H3: How do I rotate an image by a custom angle?
Use the custom angle input and type any exact degree from 0 to 360 - for example 5° to straighten a slightly tilted photo, or 45° for a diagonal. The canvas expands so nothing is cut off, and the preview shows the result. For a quick quarter-turn instead, use the Left 90°, Right 90°, or 180° buttons.
H3: Can I rotate several images at once?
Yes. Upload multiple JPG, PNG, or WebP files, apply your rotation and flip, and download them individually or all together as a ZIP. The same rotation and flip apply to every image in the batch, which is ideal when a whole set of scans or photos needs the same turn. For different angles, rotate them in separate rounds.
H3: Why does my image rotate by itself when I export or upload it?
Phones and cameras store an EXIF "orientation" tag that tells apps to display the photo rotated. Some apps honour it and some ignore it, so an image can look upright in one place and sideways in another - the classic "rotates on InDesign export" problem. Fix it by rotating the photo here until it looks right and re-saving; the saved pixels are then genuinely upright everywhere.
H3: How do I rotate an image in GIMP?
In GIMP, use Image → Transform for a 90° or 180° turn, or Tools → Transform Tools → Rotate for a custom angle, then flatten and export. It is a solid free desktop option. If you just need a quick turn or a batch of files rotated, the browser tool does it without opening GIMP and keeps everything on your device.
H3: What happens to the corners when I rotate by an odd angle?
Rotating by anything other than 90° or 180° means the tilted image no longer fits a rectangle, so the tool expands the canvas to keep the whole picture (nothing is cropped) and the four corners become transparent. To get a clean rectangle, crop the result afterwards with the Crop Image tool - there is no background-fill colour option, so cropping is the way to remove the gaps.
H3: Does rotating reduce image quality?
Barely. The tool uses high-quality smoothing and re-encodes at a high quality setting, and a 90° or 180° turn is essentially lossless in visible terms. Custom angles re-sample the image slightly, but the difference is minimal for normal use. The output keeps your original file format.
H3: Can I flip an image as well as rotate it?
Yes. Flip Horizontal mirrors the image left-to-right and Flip Vertical mirrors it top-to-bottom, and both combine with rotation - so you can rotate and flip in the same step. Toggle them off or press Reset to return to the original orientation. Flipping is handy for reversed selfies or facing a subject the other way.
H3: Do my images get uploaded to a server?
No. The rotate tool runs entirely in your browser using the Canvas engine, so your images never leave your device - nothing is sent to RepetiGo. That keeps scanned documents and personal photos private, works on a weak connection, and is why there is no watermark on your rotated files.
H3: Can I choose the output format?
The output keeps the same format as the file you uploaded - a JPG stays a JPG, a PNG stays a PNG, and so on. There is no format-override option inside the rotate tool. If you need a different format afterwards, use the convert tools; if you rotated by an odd angle and want to keep transparency, PNG or WebP is best.

H2: Related Image Tools.
Tool
What It Does
Link
Crop Image
Trim the transparent corners after an angled rotate
→ /image-tools/crop-image
Resize Image
Change dimensions after rotating
→ /image-tools/resize-image
Compress Image
Shrink rotated files (supports batch + ZIP)
→ /image-tools/compress-image
Photo Editor
Rotate/flip as part of a bigger edit
→ /image-tools/photo-editor
Convert from JPG
Change output format after rotating
→ /image-tools/convert-from-jpg
All Image Tools
The complete image tools suite
→ /image-tools

[ Rotate an Image Free - 90° or Any Angle → repetigo.com/image-tools/rotate-image ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function RotateImagePage() {
  return (
    <RotateImageClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="rotate-image-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </RotateImageClient>
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#rotate-image-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/rotate-image": "/image-tools/rotate-image",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/crop-image": "/image-tools/crop-image",
    "/image-tools/convert-from-jpg": "/image-tools/convert-from-jpg",
    "/image-tools/background-remover": "/image-tools/background-remover",
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
    "/image-tools/rotate-image": "Open Rotate Image",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/crop-image": "Open Crop Image",
    "/image-tools/convert-from-jpg": "Open Convert from JPG",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/photo-editor": "Open Photo Editor",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Rotate Image", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based image rotator - rotate 90°, 180°, or any custom angle, flip horizontal or vertical, and batch-rotate multiple images with a ZIP download. Runs 100% in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to rotate an image", step: [{ "@type": "HowToStep", name: "Upload your image(s)", text: "Click or drag-and-drop one or more JPG, PNG, or WebP files." }, { "@type": "HowToStep", name: "Set rotation & flip", text: "Use Left 90° / Right 90° / 180°, type a custom angle, or flip H/V." }, { "@type": "HowToStep", name: "Download", text: "Download each image, or grab them all as a ZIP." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Rotate Image", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
