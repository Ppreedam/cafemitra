import type { Metadata } from "next";
import PhotoEditorClient from "./PhotoEditorClient";

const pageUrl = "https://repetigo.com/image-tools/photo-editor";

export const metadata: Metadata = {
  title: "Free Photo Editor Online - Filters, Crop, Background Remover & Batch | RepetiGo",
  description:
    "Free online photo editor - remove backgrounds, adjust filters, crop to ID/passport sizes, add a Name & DOB caption, text, stickers, frames and merge photos in your browser. Batch-edit and download as PNG, JPG or WebP. No watermark.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free Photo Editor Online - Filters, Crop, Background Remover & Batch",
    description: "Remove backgrounds, adjust filters, crop, add text, stickers, frames and merge photos in your browser. No watermark.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Photo Editor Online - All-in-One, In Your Browser",
    description: "Background removal, filters, crop, transform, draw, text, stickers, frames, merge + batch. PNG/JPG/WebP, no watermark.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Free Photo Editor Online - Edit, Filter & Batch Your Photos in the Browser.

RepetiGo's photo editor is a free, all-in-one photo editor online that runs entirely in your browser. Upload a picture and you get thirteen editing tools in one place - background removal, filters and light, resize, crop (with passport/ID and print-size presets), transform, draw, text, an ID Caption tool for Name & DOB, shapes, stickers, frames, rounded corners, and merge - so you can do a whole edit without switching apps. Adjust it, style it, and download the result as a PNG, JPG, or WebP.
It is a genuinely free photo editor: no account, no watermark, and nothing to install. Because most of this online photo editor works on your own device, your photos generally stay local - the one exception is the Background Removal tool, which sends the image to RepetiGo's AI service to cut out the background and returns the result to keep editing. When you have a whole folder to get through, the batch feature applies the same edits to every photo and hands them back as a single ZIP. It is built to be the quick, no-nonsense editor you reach for when you do not want to open heavy software.

✓ Free · No sign-up · No watermark   ✓ 13 tools in one, incl. background removal   ✓ Batch-edit + ZIP download   ✓ Editing happens in your browser

H2: How to Edit a Photo in 3 Steps.
Here is how to edit a photo with RepetiGo. Every tool lives in a tab, so you move through your edit at your own pace, and Undo/Redo has your back for up to 24 steps.

Step
What You Do
What Happens
1. Upload your photo
Click or drag-and-drop a JPG, PNG, or WebP image.
The photo opens on the canvas with all 13 tool tabs ready.
2. Edit with any tools
Adjust filters, crop, draw, add text, stickers, frames - in any order.
Every change is live; Undo/Redo (up to 24 steps) and Reset are always there.
3. Download
Choose PNG, JPG, or WebP and download - or batch-apply to more photos.
Your edited photo saves to your device with no watermark.

🔒 Every edit happens in your browser using the Canvas engine - your photos are never uploaded to any server.

H2: Thirteen Editing Tools in One Place.
Most quick edits need more than one tool, so RepetiGo puts thirteen of them in a single editor. Here is what each tab does - you can use one, or chain several together in any order.

Tab
What it does
Filter & Light
Brightness, contrast, saturation, blur, grayscale, and sepia sliders
Background
AI background removal, plus a solid backdrop colour (white, grey, blue, red, or custom)
Resize
Set an exact output width and height
Crop
Manual crop or a preset - passport/ID sizes, standard print sizes, and common aspect ratios
Transform
Rotate 90°, flip horizontal, flip vertical
Draw
Freehand brush with colour and width (1–40px)
Text
Add draggable text labels in any colour
ID Caption
Adds a Name & Date of Birth caption band under the photo, for exam-form requirements
Shapes
Draggable rectangle and circle outlines
Stickers
Eight preset emoji stickers
Frame
A coloured border, up to 80px wide
Corners
Round the image corners (radius 0–200)
Merge
Overlay a second image and drag it into place

This is why people call it the best photo editor for beginners: everything is a slider or a drag, there is no learning curve, and Undo/Redo means you can experiment freely.

H2: Filters & Light - Brightness, Contrast, Black & White, Blur & Sepia.
The Filter & Light tab is where most edits start. Every adjustment is a live slider, so you drag and watch the photo change in real time. As a photo brightness editor and contrast editor it gives you direct control: push brightness and contrast up to lift a dull photo, or down to tame a harsh one.

Adjustment
Range
Use it for
Brightness
0–200
Lighten or darken the whole photo
Contrast
0–200
Add punch or soften flat images
Saturation
0–200
Boost or mute the colours
Grayscale
0–100
Turn a colour photo black and white
Sepia
0–100
A warm, vintage tone
Blur
0–20px
Soften the whole image

Need a black and white photo editor? Slide Grayscale to 100 and your colour photo becomes a clean monochrome - that is the whole "photo editor colour to black and white" job done in one move. Want a soft, aged look? Add some Sepia. The Blur slider softens the entire image (useful for backgrounds behind text or a dreamy effect); note that it blurs the whole photo, not a selected area.

💡 The adjustments stack: drop Saturation to zero for black and white, then nudge Contrast up for a punchier monochrome. Undo/Redo lets you try combinations freely.

H2: Crop, Resize & Transform.
Getting the frame right is often the first edit. The Crop tab lets you crop by exact percentage, or pick a preset that auto-centres the right ratio - passport/ID sizes (35×45mm, 1.2×1.6in, 1.3×1.7in, 2×2in), print sizes (4×6in, 5×7in, 8×10in), and common ratios (Square 1:1, Portrait 3:4, Landscape 4:3, 16:9, and more). The Resize tab sets an exact output width and height, and Transform handles a 90° rotate and horizontal or vertical flip.
These tabs cover quick, in-context crops and resizes as part of a bigger edit. If cropping or resizing is the only thing you need - with more presets and precision - the dedicated Crop Image and Resize Image tools are linked below and are purpose-built for exactly that.

H2: Background Removal & ID/Passport Photo Captions.
The Background tab removes the background from your photo using RepetiGo's AI background-removal service, then lets you pick a solid backdrop colour - white, light grey, sky blue, red, or a custom colour picker - which is exactly what most ID, passport, and exam-form photos require. Made a mistake or want to compare? "Restore Original" brings back the untouched upload instantly, no re-upload needed.
Pair it with the ID Caption tab, which stamps a Name & Date of Birth band under the photo - a common requirement on Indian government exam forms (SSC, Railway, Bank PO, and similar). Turn it on, type the name and DOB, and it renders directly onto the exported photo alongside whatever crop and colour adjustments you have already made.
🔒 Every other tool in this editor runs entirely on your device - the Background tab is the one exception, since removing a background needs an AI model that sends the photo to RepetiGo's server and gets the cut-out result back.

H2: Draw, Text, Shapes & Emoji Stickers.
Beyond adjustments, you can add things to a photo. The Draw tool is a freehand brush with a colour picker and a width slider (1–40px) - good for annotations, arrows, or a quick doodle; "Clear drawing" wipes the brush layer if you want to start again. The Text tool adds draggable labels in any colour, and you can add as many as you like.
The Shapes tab drops draggable rectangle and circle outlines to highlight part of a photo, and the Stickers tab gives you eight preset emoji you can drag anywhere. A couple of honest notes so you know what to expect: the text uses a single clean built-in font (there is no font-family picker here - for captions with font choice, use the Add Text to Photo tool), and the stickers are the eight built-in emoji rather than custom uploads.

💡 Use Shapes to circle something in a screenshot, the Draw brush to point at it, and a Text label to explain - a fast way to mark up an image without any design software.

H2: Frames, Rounded Corners & Merging Two Photos.
Three finishing tools round out the editor. The Frame tab adds a coloured border up to 80px wide - pick white for a clean print border, or a colour to match your brand. The Corners tab rounds the image corners with a radius slider (0–200), which is handy for profile pictures, app icons, and cards.
The Merge tab lets you overlay a second image on the first: upload it, and it appears as a draggable overlay you can position and size (it sits at a fixed 65% opacity, so it blends over the base photo). This covers the common "put one photo over another" job. Note that it is a single draggable overlay rather than a multi-cell collage grid - great for a watermark-style logo, a stamp, or blending two pictures, not for a photo-grid layout.

H2: Edit Many Photos at Once - Batch + ZIP.
This is where the editor saves real time. Once you have built an edit - filters, crop, drawings, text, stickers, an overlay, anything - the batch feature applies that exact edit stack to more photos you upload. Each one appears as a thumbnail you can download individually, or you can grab them all in one bulk ZIP download.
For anyone processing a set of images - a print shop editing a batch of customer photos, a seller preparing product shots, a student finishing a folder of assignment images - a batch photo editor that keeps everything on your device and exports a single ZIP is genuinely faster than editing one file at a time.

✅ Real batch support: build the edit once, apply it to every uploaded photo, preview each thumbnail, and download individually or as one ZIP. All in the browser.

H2: Almost Everything Runs in Your Browser - No Watermark, No Paywall.
RepetiGo's editor does nearly all of its work on your own device using the browser's Canvas engine - filters, crop, transform, draw, text, ID Caption, shapes, stickers, frames, corners, and merge never leave your device. The one exception is the Background tab: removing a background needs an AI model, so that specific action sends the photo to RepetiGo's server and gets the cut-out result back, and nothing else about the edit is uploaded. There is no watermark and no account wall either way. The free online photo editor you use is the full editor - nothing is held back behind a paywall, and the file you download is clean.

🔒 Client-side by default: everything except the Background Removal tool stays on your device - and even that step only sends the photo, gets the cut-out image back, and nothing else about your edit ever leaves your browser.

H2: ★ Indian Use Cases - Print Shops, Students & Small Business.
An all-in-one editor that runs in the browser fits the everyday jobs at Indian print shops, cyber cafes, and small businesses - quick edits, in bulk, without buying software.

Who
What they do
Which tools
Print shops & cyber cafes
Touch up customer photos, remove backgrounds, crop to passport/ID size, add Name & DOB for exam forms
Background, Crop (ID presets), ID Caption, Filters, Frame, Batch
Students
Edit assignment and project images
Crop, Text labels, Draw, Resize
Small businesses
Prep product photos with a logo overlay
Filters, Merge overlay, Batch + ZIP
Social creators
Black-and-white or sepia posts with stickers
Grayscale, Sepia, Stickers, Rounded corners
Offices
Mark up screenshots for a report
Shapes, Draw, Text, Frame

🇮🇳 Print-shop tip: remove the background and crop to a passport/ID preset first, add the Name & DOB caption if the form needs it, then build the rest of your standard edit (white frame, etc.) and batch-apply it to a whole set of customer photos before downloading the ZIP.

H2: What This Photo Editor Does Not Do.
So you know whether it fits before you start, here is what the editor is not built for - and where to go instead.

People often ask for…
The honest answer
A general AI photo editor
No - only the Background Removal tool uses AI; every other tool is hands-on sliders and drags
Instagram-style one-click presets
No - you set brightness, contrast, and tone manually
Red-eye, teeth-whitening, or green-screen
No - these retouch tools are not included
A collage grid
No - Merge is a single draggable overlay, not a grid layout
Custom fonts or custom stickers
No - one built-in text font and eight preset emoji
Curves / levels / vignette
No - basic brightness, contrast, and saturation only

For an everyday edit - background removal, adjust, crop, annotate, frame, merge, and batch - the thirteen tools here cover it. For heavier AI edits or professional retouching, a specialised tool is the better fit, and the most useful ones are linked below.

H2: Photo Editor - Frequently Asked Questions.
H3: Is this photo editor free?
Yes - RepetiGo's photo editor is completely free with no sign-up and no watermark. Every tool is available at no cost, including background removal: filters, crop, ID Caption, text, stickers, frames, merge, and batch editing, all with PNG, JPG, or WebP export. There is no premium tier to unlock.
H3: How do I edit a photo online for free?
Upload a JPG, PNG, or WebP image and use any of the thirteen tabs - Background, Filter & Light, Crop, Transform, Draw, Text, ID Caption, Shapes, Stickers, Frame, Corners, and Merge - in any order. Every change is live, Undo/Redo covers up to 24 steps, and when you are done you download the result.
H3: How do I make a photo black and white?
Open the Filter & Light tab and slide Grayscale up to 100 - your colour photo becomes clean black and white instantly. For a punchier monochrome, nudge Contrast up a little afterwards. You can preview it live, and Undo returns to colour if you change your mind. That is the full "photo editor colour to black and white" workflow.
H3: Can I remove the background in the photo editor?
Yes. Open the Background tab, click Remove Background, and RepetiGo's AI cuts the subject out - then pick a solid backdrop colour (white, light grey, sky blue, red, or a custom colour) right there, which is exactly what most ID and passport photos need. "Restore Original" brings the untouched photo back if you want to redo it. A dedicated standalone Remove Background tool also exists at /image-tools/background-remover if that is the only thing you need.
H3: Can I edit many photos at once?
Yes. Build your edit on one photo - filters, crop, text, stickers, an overlay, anything - then use the batch feature to apply that same edit stack to more photos you upload. Each result appears as a thumbnail you can download on its own, or you can download them all together as one ZIP file.
H3: Is this an AI photo editor?
Mostly no. RepetiGo's photo editor is a hands-on tool: you adjust sliders and use tabs like Crop, Draw, Text, and Merge yourself, and none of that uses AI to auto-edit, generate, or retouch your photo. The one exception is the Background tab, which uses an AI model specifically to cut out the subject - everything else stays manual and predictable.
H3: What file formats can I use and export?
You can upload JPG, PNG, and WebP images, and export your edited photo as PNG, JPG, or WebP. PNG keeps the sharpest quality and any transparency, JPG makes the smallest file for sharing, and WebP balances the two. If you need to shrink the file further afterwards, use the Compress Image tool.
H3: Can I change the font of the text I add?
The Text tool adds draggable labels in any colour using one clean built-in font, but it does not have a font-family picker. If you need to choose a specific font - for a caption, a quote, or a title - use the dedicated Add Text to Photo tool, which offers font options. For classic Impact-style meme captions, use the Meme Generator.
H3: Are my photos uploaded to a server?
Only for one step. Every tool except Background runs entirely in your browser using the Canvas engine, so that part of your photo never leaves your device. Removing a background needs an AI model, so that specific action sends the photo to RepetiGo's server and gets the cut-out image back - nothing else about your edit is ever uploaded, and there is no watermark on your finished result either way.
H3: Can I merge or overlay two photos?
Yes. The Merge tab lets you upload a second image and place it as a draggable overlay on the first - position and size it wherever you want. It sits at a set opacity so it blends over the base photo, which is ideal for adding a logo, a stamp, or blending two pictures. It is a single overlay rather than a multi-cell collage grid.

H2: Related Image Tools.
Tool
What It Does
Link
Remove Background
Standalone AI background removal → transparent PNG (also built into this editor's Background tab)
→ /image-tools/background-remover
Crop Image
Dedicated crop tool with more presets
→ /image-tools/crop-image
Resize Image
Dedicated resize with exact dimensions
→ /image-tools/resize-image
Meme Generator
Impact-style top/bottom meme captions
→ /image-tools/meme-generator
Compress Image
Shrink your edited photo for sharing
→ /image-tools/compress-image
All Image Tools
The complete image tools suite
→ /image-tools

[ Open the Free Photo Editor - No Watermark → repetigo.com/image-tools/photo-editor ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function PhotoEditorPage() {
  return (
    <PhotoEditorClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="photo-editor-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </PhotoEditorClient>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "🔁", "🔄", "★", "👁️"];

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
  if (lines[0] === "Tab" && lines[1] === "What it does") return { headers: ["Tab", "What it does"], rows: chunkRows(lines.slice(2), 2) };
  if (lines[0] === "Adjustment" && lines[1] === "Range") return { headers: ["Adjustment", "Range", "Use it for"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Who" && lines[1] === "What they do") return { headers: ["Who", "What they do", "Which tools"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#photo-editor-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/photo-editor": "/image-tools/photo-editor",
    "/image-tools/background-remover": "/image-tools/background-remover",
    "/image-tools/crop-image": "/image-tools/crop-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/meme-generator": "/image-tools/meme-generator",
    "/products/printpilot": "/print-automation",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/photo-editor": "Open Photo Editor",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/crop-image": "Open Crop Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/meme-generator": "Open Meme Generator",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Photo Editor", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free all-in-one photo editor with 13 tools - AI background removal, filters, crop with passport/ID presets, transform, draw, text, a Name & DOB ID caption, shapes, stickers, frames, rounded corners, and merge - plus batch editing with ZIP download. Every tool runs in the browser except background removal, which uses an AI model on RepetiGo's server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to edit a photo", step: [{ "@type": "HowToStep", name: "Upload your photo", text: "Click or drag-and-drop a JPG, PNG, or WebP image." }, { "@type": "HowToStep", name: "Edit with any tools", text: "Adjust filters, crop, draw, add text, stickers, frames - in any order." }, { "@type": "HowToStep", name: "Download", text: "Choose PNG, JPG, or WebP and download - or batch-apply to more photos." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Photo Editor", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
