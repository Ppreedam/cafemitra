import type { Metadata } from "next";
import UpscaleImageClient from "./UpscaleImageClient";

const pageUrl = "https://repetigo.com/image-tools/upscale-image";

export const metadata: Metadata = {
  title: "Upscale Image Free - 2× / 4× AI Image Upscaler | RepetiGo",
  description:
    "Upscale image resolution free - enlarge JPG, PNG & WebP up to 4× with a browser-based image upscaler. Standard 2×/4× runs in your browser; AI mode for tougher photos.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Upscale Image Free - 2× / 4× Image Upscaler",
    description: "Enlarge JPG, PNG & WebP up to 4×. Standard mode runs in your browser; AI mode for tougher photos.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Upscale Image Free - 2× / 4× Image Upscaler",
    description: "Free image upscaler. 2×/4×, choose WebP/PNG/JPG, standard mode 100% in-browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Upscale Image Free - Enlarge to 2× or 4× Right in Your Browser.

RepetiGo's upscale image tool is a free, browser-based image upscaler that enlarges JPG, PNG, and WebP images to 2× or 4× their original size while keeping them as sharp as possible. Add an image, pick your scale, and download the larger version in seconds. Standard upscaling runs entirely in your browser, so your photo never leaves your device - and for tougher pictures there is an optional AI mode for smarter enhancement.
A small or low-resolution image looks soft and blocky the moment you enlarge it or try to print it. This image upscaler adds pixels intelligently instead of just stretching, so edges stay cleaner and the picture holds up at a bigger size. It is a free image upscaler with no sign-up and no watermark: choose 2× or 4×, pick your output format, compare the before and after side by side, and download.

✓ Free · No sign-up · No watermark   ✓ 2× or 4× scale   ✓ WebP, PNG or JPG output   ✓ Standard mode runs 100% in your browser

H2: How to Upscale an Image in 3 Steps.
Here is how to upscale an image with RepetiGo. A 2× preview appears automatically the moment you add a file, so you see a result almost instantly.

Step
What You Do
What Happens
1. Add your image
Click to select or drag-and-drop a JPG, PNG, or WebP file.
A 2× preview generates automatically so you see the result at once.
2. Pick scale & format
Choose 2× or 4×, and set the output to WebP, PNG, or JPG.
The image is re-processed at your chosen scale; a side-by-side panel shows old vs new dimensions and file size.
3. Download
Click download once the transformed image is ready.
It saves with a "-2x-upscaled" or "-4x-upscaled" suffix in your chosen format.

🔒 In standard mode, all of this happens in your browser using the Canvas engine - your image is never uploaded. (AI mode is different; see below.)

H2: 2× or 4× - How Much Bigger Can You Go?
RepetiGo offers two fixed scales: 2× doubles the width and height, and 4× quadruples them. There is no custom multiplier and no 8× - 2× and 4× cover almost every real need, from making a web image sharper to preparing a photo for print. A 1000×1000 image becomes 2000×2000 at 2×, or 4000×4000 at 4×.
There is one hard limit to know about: the final image cannot be larger than 48 megapixels. If your chosen scale would push the output past that - for example, 4× on an already-large photo - the tool stops and shows an "Image too large" message. If you hit that, switch to 2×, or crop the image to just the part you need first, then upscale.

📊 Quick maths: 48 megapixels is roughly a 6928×6928 square, or about 8000×6000. Most 2× jobs are well within it; very large 4× jobs are where you may see the limit.

H2: Standard Mode vs AI Mode - Which One to Use.
The tool has two engines, and the difference matters for both quality and privacy. Standard mode is the default: it enlarges the image using your browser's Canvas engine with high-quality smoothing, entirely on your device. It is fast, works offline once loaded, and nothing is uploaded - the "Files stay in your browser" badge applies to this mode.
AI mode is the optional upgrade. When you turn on "Need smarter enhancement? Use AI Image Upscaler," the image is sent to RepetiGo's server, where an AI model reconstructs detail - better for photos, faces, and heavily pixelated pictures. The trade-off is that AI mode does upload your image for processing. So the honest rule is simple: for a private or official photo, use standard mode; for a difficult photo where quality matters more than privacy, use AI mode.

Standard Mode
AI Mode
Where it runs
Your browser (client-side)
RepetiGo server (AI model)
Best for
Web images, quick enlargements, private photos
Blurry photos, faces, heavy pixelation
Privacy
Image never leaves your device
Image is uploaded for processing
Speed
Instant, works offline
Depends on connection

🔒 Handling an Aadhaar, PAN, or exam photo? Stay in standard mode - it keeps the image on your device. Only switch to AI mode for pictures you are comfortable processing on a server.

H2: Can You Upscale an Image to 4K?
Yes - 4× is the fastest way to reach 4K. A standard 1920×1080 (Full HD) image upscaled 4× becomes 7680×4320, which is 8K-wide on paper but, more usefully, comfortably covers a true 4K (3840×2160) target with room to spare. Even a smaller 960×540 clip reaches 3840×2160 at 4×. That makes this a practical upscale image to 4K route for wallpapers, presentations, and large prints.
Two honest caveats. First, remember the 48-megapixel cap - a very large source at 4× can exceed it, so you may need 2× or a crop. Second, upscaling adds pixels; it cannot invent detail that was never captured. A genuinely sharp source scales up beautifully to 4K; a tiny, blurry source will be bigger and cleaner but will not magically become studio-quality. For the hardest cases, AI mode gives the best 4K result.

H2: Choose Your Output Format - WebP, PNG, or JPG.
Unlike some tools, RepetiGo lets you pick the format of the upscaled file. Each has a best use:

Format
Best for
Note
WebP
Websites and previews
Smallest file at the same quality; keeps transparency
PNG
Logos, graphics, transparency
Lossless; larger file; keeps a transparent background
JPG
Photos and print uploads
Widely accepted; a white background is added (no transparency)

If you pick JPG and your image had a transparent background, the tool fills that area with white, because JPG cannot store transparency. If you need to keep a see-through background, choose PNG or WebP instead. Once upscaled, you can shrink the file with the compress tool or change format with the convert tools linked below.

H2: ★ Indian Use Cases - Print Shops, Old Photos & Scanned Documents.
Upscaling is one of the most common jobs at an Indian print shop or cyber cafe. A customer brings a small WhatsApp photo and wants it printed as a poster; an old family photograph needs enlarging; a low-resolution logo has to go on a banner. In every case, enlarging without upscaling gives a soft, pixelated print - and an unhappy customer.

Scenario
Problem
How the upscaler helps
Print a small WhatsApp photo
Low resolution looks blocky when printed big
Upscale 4× (or AI mode) before sending to the printer
Enlarge an old scanned photo
Original scan is small and soft
Upscale 2×/4×, then print or share
Low-res logo on a banner
Logo pixelates at large size
Upscale, keep PNG for transparency, then print
Product photo for a catalogue
Supplier image is too small
Upscale to a usable size for the layout
Passport photo enlarged to a frame
Small ID photo looks soft when enlarged
Upscale 2× for a cleaner framed print

🇮🇳 Print-shop workflow: upscale the image here → check the side-by-side dimensions → if the file is now heavy, compress it at /image-tools/compress-image → send to the printer. For the softest sources, AI mode gives the cleanest enlargement.

H2: Working With More Than One Image.
You can load several images at once. They appear as a thumbnail strip along the top, and you switch between them with a click; a "+" tile lets you add more at any time, and you can drag-and-drop new files straight onto the workspace. This makes it easy to work through a set of photos one after another without reloading the page.
One thing to be clear about, so there is no confusion: the tool upscales the image you are currently viewing - it processes them one at a time, not all at once. There is no single "upscale every image" button and no ZIP download here. You upscale and download each image individually. If you need to enlarge a large batch, work through the thumbnail strip image by image.

💡 Need one-click batch processing with a ZIP? That is how the Compress Image tool works - for upscaling, process each image from the thumbnail strip and download it before moving to the next.

H2: How to Upscale an Image in Photoshop, GIMP & Without Any Software.
If you would rather use desktop software, here are the standard routes - and where a browser tool is simply quicker.
H3: Photoshop
To upscale an image in Photoshop: Image → Image Size → tick Resample and choose "Preserve Details 2.0" (or "Preserve Details Enlargement") from the resample menu, set your new width/height or percentage, and click OK. Recent versions add a Super Resolution option in Camera Raw for a cleaner result. This is how to upscale an image in Photoshop with the most control - but it needs a paid licence, which is why many people use a free browser upscaler instead.
H3: GIMP
GIMP is free. To gimp upscale image: Image → Scale Image → enter the new dimensions → set Interpolation to "NoHalo" or "LoHalo" for the best enlargement → Scale. GIMP does a solid job for a free desktop app, though for photos and faces an AI upscaler usually produces cleaner detail with far less effort.
H3: Without Photoshop (Browser)
You do not need any software at all. To upscale an image without Photoshop, use RepetiGo in your browser: add the image, pick 2× or 4×, and download. Standard mode keeps everything on your device, and AI mode is one click away when a photo needs extra help. This is the fastest free route for anyone who does not own Photoshop.
H3: Can ChatGPT Upscale Images?
Not reliably. ChatGPT can generate new images, but it does not truly upscale your existing photo - it may recreate something similar rather than enlarge the actual file, and detail can drift. For a faithful enlargement of your own image, a dedicated image upscaler like RepetiGo is the right tool: it keeps your picture and simply makes it bigger and cleaner.

H2: Will Upscaling Fix a Blurry or Pixelated Image?
Partly - and it helps to be realistic about what upscaling can and cannot do. When you upscale and enhance image files, the tool adds pixels and smooths the jagged "staircase" edges of a pixelated picture, which makes it look noticeably better at a larger size. Standard mode handles mild softness well; AI mode is the one to reach for on a genuinely blurry photo, because it reconstructs detail rather than just smoothing.
What upscaling cannot do is recover detail that was never in the original. If a photo is badly out of focus or extremely low resolution, no upscaler - AI included - can invent a face or text that the camera never captured. It will be bigger and cleaner, but not perfect. For the best result on a blurry image, start from the highest-quality copy you have and use AI mode.

📊 Best-result checklist: use the largest original you have · try AI mode for photos and faces · upscale 2× first and check before going to 4× · compare the side-by-side panel before you download.

H2: Upscale Image - Frequently Asked Questions.
H3: Is this image upscaler free?
Yes - RepetiGo's upscale image tool is free with no sign-up and no watermark. Standard 2× and 4× upscaling runs in your browser at no cost. The optional AI mode, which sends the image to a server for smarter enhancement, is also available free. You can upscale image files, choose your output format, and download without ever creating an account.
H3: Can I upscale an image to 4K?
Yes. Choose 4× and most Full HD or smaller images comfortably reach a 4K resolution - a 1920×1080 image becomes 7680×4320 at 4×. Keep the 48-megapixel output cap in mind: a very large source at 4× may exceed it, in which case use 2× or crop first. Remember that upscaling enlarges and cleans an image but cannot add detail the camera never captured.
H3: Does upscaling upload my image to a server?
It depends on the mode. Standard 2×/4× upscaling runs entirely in your browser - your image never leaves your device, shown by the "Files stay in your browser" badge. AI mode is different: it sends the image to RepetiGo's server so an AI model can enhance it. For private or official photos, stay in standard mode; use AI mode only for pictures you are comfortable processing on a server.
H3: What is the maximum size I can upscale to?
The output cannot exceed 48 megapixels - roughly a 6928×6928 square or about 8000×6000. If your scale would push past that, the tool shows an "Image too large" message. Switch to 2×, or crop the image to just the area you need, then upscale. This cap keeps processing fast and prevents your browser from running out of memory.
H3: How do I upscale an image without Photoshop?
Use RepetiGo in your browser: add the image, choose 2× or 4×, pick a format, and download - no software or licence needed. Standard mode keeps everything on your device, and AI mode is one click away for harder photos. It is the fastest free way to upscale an image without Photoshop, and it works on a phone browser too.
H3: Can it upscale anime or artwork?
Yes. An anime image upscaler works well because line-art and flat colour enlarge cleanly. Standard mode handles most anime and illustration nicely; for detailed or compressed artwork, AI mode gives crisper lines. Keep PNG or WebP as the output to preserve any transparency in the artwork.
H3: Can I upscale several images at once?
You can load several images and switch between them using the thumbnail strip, but the tool upscales them one at a time - it processes the image you are currently viewing. There is no single "upscale all" button and no ZIP download. Upscale and download each image, then move to the next one in the strip.
H3: Which output format should I choose?
Pick WebP for the smallest web-ready file, PNG for logos and anything that needs a transparent background, and JPG for photos or portal uploads. Note that choosing JPG adds a white background if your image was transparent, because JPG cannot store transparency. You can change format later with the convert tools if needed.
H3: Will upscaling fix a blurry photo?
It helps but has limits. Upscaling adds pixels and smooths jagged edges, so a mildly soft image looks better enlarged. For a genuinely blurry photo, AI mode reconstructs detail far better than standard smoothing. However, no upscaler can recover detail the camera never captured - start from the sharpest copy you have for the best result.
H3: Can I upscale an image for printing at 300 DPI?
Yes, indirectly. Print sharpness depends on having enough pixels for the print size, and upscaling adds pixels - so a 4× enlargement gives you far more pixels to print with, which raises the effective DPI at a given size. The tool does not set a DPI value itself; it increases resolution. Upscale to the pixel count your print needs, then send it to the printer.

H2: Related Image Tools.
Tool
What It Does
Link
Resize Image
Change dimensions without adding new detail
→ /image-tools/resize-image
Compress Image
Shrink the file size of your upscaled image
→ /image-tools/compress-image
Crop Image
Trim to the subject before enlarging
→ /image-tools/crop-image
Convert from JPG
Change format before or after upscaling
→ /image-tools/convert-from-jpg
Remove Background
Isolate the subject, then upscale
→ /image-tools/background-remover
All Image Tools
The complete image tools suite
→ /image-tools

[ Upscale Images Free - 2× / 4× → repetigo.com/image-tools/upscale-image ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function UpscaleImagePage() {
  return (
    <UpscaleImageClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="upscale-image-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </UpscaleImageClient>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "★", "📊"];

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
  if (lines[0] === "Standard Mode" && lines[1] === "AI Mode") return { headers: ["", "Standard Mode", "AI Mode"], rows: chunkRows(lines.slice(2), 3) };
  if (lines[0] === "Format" && lines[1] === "Best for" && lines[2] === "Note") return { headers: ["Format", "Best for", "Note"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Scenario" && lines[1] === "Problem") return { headers: ["Scenario", "Problem", "How the upscaler helps"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#upscale-image-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/upscale-image": "/image-tools/upscale-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/compress-image": "/image-tools/compress-image",
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
    "/image-tools/upscale-image": "Open Upscale Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/compress-image": "Open Compress Image",
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
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Upscale Image", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based image upscaler for JPG, PNG, and WebP. Enlarge to 2x or 4x, choose WebP/PNG/JPG output. Standard mode runs 100% in your browser - no file is ever uploaded to a server; AI mode is available for tougher photos.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to upscale an image", step: [{ "@type": "HowToStep", name: "Add your image", text: "Click to select or drag-and-drop a JPG, PNG, or WebP file." }, { "@type": "HowToStep", name: "Pick scale & format", text: "Choose 2x or 4x, and set the output to WebP, PNG, or JPG." }, { "@type": "HowToStep", name: "Download", text: "Click download once the transformed image is ready." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Upscale Image", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
