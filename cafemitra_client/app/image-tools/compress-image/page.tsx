import type { Metadata } from "next";
import CompressImageClient from "./CompressImageClient";

const pageUrl = "https://repetigo.com/image-tools/compress-image";

export const metadata: Metadata = {
  title: "Compress Image Free - Reduce Image Size in Your Browser | RepetiGo",
  description:
    "Compress image files free - reduce JPG, PNG & WebP size right in your browser. Nothing is uploaded. Adjust quality, batch-compress, and download in seconds.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Compress Image Free - Reduce Image Size in Your Browser",
    description: "Reduce JPG, PNG & WebP file size free. Nothing uploaded - everything runs in your browser.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Compress Image Free - In Your Browser",
    description: "Free image compressor. Adjustable quality, batch + ZIP download, 100% client-side.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Compress Image Free - Reduce Image File Size Right in Your Browser.

RepetiGo's compress image tool is a free, browser-based image compressor that reduces the file size of JPG, PNG, and WebP images without sending them anywhere. You drop in one image or many, choose how much to shrink them, and download the smaller files in seconds. Because it runs entirely in your browser, your photos never leave your device - there is no upload to a server, which makes it a safe way to compress images that contain personal or official information.
Large images slow down websites, bounce back from email attachments, and get rejected by government portals that cap the file size. This image compression tool fixes all three. Use the slider to control how aggressively each file shrinks, watch the exact size and percentage saved on every image, and grab them one at a time or as a single ZIP. No sign-up, no watermark, no software to install.

✓ Free · No sign-up · No watermark   ✓ JPG, PNG, WebP   ✓ Batch + ZIP download   ✓ 100% in your browser - nothing uploaded

H2: How to Compress an Image in 3 Steps.
Here is how to compress an image with RepetiGo. The whole process happens on your screen - the moment you add a file it is already compressed at the default level, so most people are done in one step.

Step
What You Do
What Happens
1. Add your images
Click to select or drag-and-drop JPG, PNG, or WebP files - one or many at once.
Each image is validated and auto-compressed at 60% straight away.
2. Adjust the level
Move the compression slider between 10% and 90%. Higher means a smaller file and lower quality.
All files re-compress at the new level; a live card shows the new size and % saved.
3. Download
Click download on any single image, or download every compressed image as one ZIP.
Files save with a "-compressed" suffix. Nothing was ever uploaded.

🔒 Every step above runs inside your browser using the Canvas API. Your original photos are never transmitted to RepetiGo or any server.

H2: What the Compression Level Slider Actually Does.
The single most important control is the compression level slider. It runs from 10% to 90% in steps of 5. The rule is simple: a higher level makes a smaller file at lower visual quality, and a lower level keeps more quality but saves less space. When you first add an image it starts at 60%, which is a good balance for most photos.
Behind the slider, the tool aims for a target file size equal to your original size reduced by the level you chose - so 70% means it tries to reach roughly 30% of the original size. To get there it runs several passes, gently lowering quality and, if needed, scaling the image down, until it reaches the target. It will never make a file larger than the original, and it stops at a floor of about 18KB - the smallest it will produce even at maximum compression.

💡 Change your mind about the level? Just move the slider and press "Compress" again. The previous results clear and every file re-compresses at the new setting - no re-upload needed.

H2: How to Compress an Image to a Target Size - 20KB, 50KB, 200KB, 1MB, 2MB.
A lot of people do not just want a smaller image - they need to compress an image to a specific size because a form or portal sets a hard limit. RepetiGo does this with the level slider: pick how much smaller you need, compress, and read the exact resulting size on each file's card. Push the slider higher until the number drops under your limit.
One honest note so you are not surprised: the slider reduces a file by up to 90%, and the tool will not go below about 18KB. That means very small targets like 20KB are easy for an already-small image, but a heavy 4MB phone photo may not reach 20KB from compression alone. When that happens, resize the image smaller first, then compress - the two tools together will hit almost any limit.

Target you need
How to get there
Common reason
compress image to 2mb / 5mb / 10mb
Low–medium level (20–40%) is usually enough.
Upload limits on forums, WhatsApp, CMS
compress image to 1mb
Medium level (40–60%) on a normal photo.
Website images, email attachments
compress image to 200kb / 500kb
Higher level (60–80%); a large photo may need a resize first.
Job portals, college applications
compress image to 100kb
High level (75–90%); resize to passport size first for big photos.
Government forms, KYC uploads
compress image to 50kb
Max level after resizing the image smaller.
NTA / exam photo uploads
compress image to 20kb
Resize to a small dimension, then compress at max (floor ~18KB).
Strict exam / signature limits

🇮🇳 The reliable workflow for tight KB limits: (1) Resize the image to the required dimensions at /image-tools/resize-image. (2) Come here and push the level up until the size drops under your limit. (3) Download. This resize-then-compress combo meets nearly every Indian portal rule.

H2: Why Everything Happens Inside Your Browser.
Most online image compression tools work by uploading your picture to their server, compressing it there, and sending it back. That means a copy of your image - which could be an ID photo, a signed document, or a private picture - sits on someone else's computer. RepetiGo works differently. This compress image tool uses your browser's built-in Canvas engine to do all the work on your own device.
In practice that means three things. Your image is never uploaded, so there is no copy of it on any server. It works even on a weak or intermittent connection, because there is no round trip. And it is fast, because the file never has to travel anywhere. A small badge on the tool - "Files stay in your browser" - is a literal description of what happens, not a marketing line.

🔒 Because compression is client-side, RepetiGo cannot see, store, or train on your images. This is the safest way to compress an image that contains Aadhaar, PAN, exam, or KYC details.

H2: ★ Indian Use Cases - Portal & Exam Photo Size Limits.
Indian government portals, exam bodies, and job sites almost all cap the photo file size - and reject anything over it. That is the single most common reason people search for how to compress an image. Here are the limits that come up most, and how to meet them.

Portal / Use
Typical size limit
How to meet it
NTA exam photo (NEET / JEE)
10–50 KB
Resize to spec, then compress at max level
Aadhaar / UIDAI update
under ~50–100 KB
Resize to passport size, then compress high
Passport Seva photo
under ~1 MB
Compress at medium–high level
Job portals (Naukri, govt jobs)
200 KB – 1 MB
Compress at 60–80% level
Bank KYC / account opening
under ~200 KB
Resize then compress
Email attachments
under 25 MB total
Compress each image; send as a ZIP

💡 Always check the exact limit on the portal itself before you upload - exam bodies in particular are strict, and an oversized photo is a common reason applications get rejected.

H2: How to Bulk Compress Multiple Images at Once.
You do not have to compress images one by one. RepetiGo lets you bulk compress images: drop in a whole batch, set one compression level, and every file shrinks together. You can keep adding more files after the first batch is loaded, remove any single image you did not mean to include, and preview each result before downloading.
When you are done, you have two choices. Download any single compressed image on its own, or use the bulk ZIP download to get every compressed image in one file - handy when you need to batch compress images for a website gallery, an email, or a print job. Each file inside the ZIP keeps its name with a "-compressed" suffix so you can tell the new versions apart.

✅ Real batch support: multi-file upload, one shared level, per-image preview and % saved, individual downloads, and a single ZIP of all results. Add more files any time before you download.

H2: Which Format Will Your Compressed Image Be?
You do not have to pick an output format - the tool chooses the most efficient one automatically. If your image has transparency (a see-through background), it is saved as WebP so the transparency is preserved. If it is a solid photo with no transparency, it is saved as JPEG, which compresses photographs the smallest. If you upload a WebP file, it stays WebP.
This is why you can compress a png image and get back a lighter file without a white box appearing behind a transparent logo, and why you can compress a webp image without it being converted to a heavier format. If you specifically need a different format afterwards - say a plain JPG for a portal that only accepts JPG - convert it with the linked format tools below, then compress.

You upload
You get back
Why
JPG / JPEG photo
Compressed JPEG
JPEG is smallest for photos without transparency
PNG with transparency
Compressed WebP
WebP keeps the transparent background at a smaller size
PNG without transparency
Compressed JPEG
No transparency to keep, so JPEG saves more
WebP image
Compressed WebP
Already an efficient format - stays WebP

H2: How to Compress Images in PowerPoint, Word, Krita, Mac & iPhone.
If your images are already inside another app, you can often compress them there. Here are the quickest routes in the tools people ask about most - and when it is easier to just use RepetiGo instead.
H3: PowerPoint & Word
To compress images in PowerPoint: click any picture → Picture Format tab → Compress Pictures → choose a resolution (e.g. 150 ppi for on-screen) → untick "Apply only to this picture" to compress the whole deck → OK, then save. The steps are identical for how to compress images in Word. This shrinks the file inside the document, but if you need the standalone image file smaller, compress it with RepetiGo first and then insert it.
H3: Krita
To compress an image in Krita, use File → Export (or "Save As") and pick JPEG, then lower the Quality slider in the export dialog before saving - a lower quality number gives a smaller file. For PNG, enable the compression option in the export box. Krita is a full painting app, so for a quick one-off compression a browser tool is faster.
H3: Mac & iPhone
On a Mac, open the image in Preview → Tools → Adjust Size to shrink dimensions, or File → Export and drag the Quality slider down, then save. On an iPhone there is no built-in compressor, so people usually resize by screenshotting or use a web tool - RepetiGo runs in Safari on the iPhone with no app to install, which is the simplest way to compress an image on the phone itself.
H3: Google Sheets & Photoshop
Google Sheets does not compress images directly - to compress an image in Google Sheets, shrink the image file first with a tool like RepetiGo, then insert the lighter version. In Photoshop, use File → Export → Save for Web (Legacy) and lower the quality, or Export As and reduce the quality percentage. For anyone without Photoshop, the browser tool gives a similar result for free.

H2: Lossy vs Lossless - Will Compression Ruin Image Quality?
There are two kinds of image compression. Lossless compression makes a file smaller without throwing away any detail - the image is identical, just stored more efficiently, which is why it saves less space. Lossy compression removes fine detail the eye barely notices to save far more space. RepetiGo uses smart lossy compression, which is why it can shrink files dramatically.
Will it ruin the quality? At a moderate level, the difference is hard to see and the file is a fraction of the size - that is the point of the tool. At very high levels you may notice softness or blockiness, especially in text and sharp edges. The fix is easy: use the preview to compare the original and compressed versions side by side, and if it looks too soft, lower the level a little. That is how you compress an image without losing quality that matters.

📊 Rule of thumb: 40–60% is invisible on most photos. 70–80% is fine for web and email. Above 85%, always check the preview before you download.

H2: Compress Image - Frequently Asked Questions.
H3: Is this image compression tool really free?
Yes - RepetiGo's compress image tool is completely free with no sign-up, no watermark, and no file limit on the number of images. Because compression runs in your browser rather than on a paid server, there is no cost to cover and nothing to unlock. You can compress images, batch-compress a folder, and download everything as a ZIP without ever creating an account.
H3: Are my images uploaded to a server?
No. Every part of the compression happens inside your browser using the Canvas engine on your own device. Your images are never sent to RepetiGo or any third party, which is why the tool works offline once loaded and is safe for private or official photos. This is the main difference between RepetiGo and most online image compression tools, which upload your file to their servers.
H3: How do I compress an image to under 200KB?
Add your image, then push the compression level slider up until the size shown on the card drops under 200KB, and download. For a large photo that will not reach 200KB from compression alone, first resize it smaller at /image-tools/resize-image, then come back and compress - the resize-then-compress combination reaches almost any KB limit.
H3: Can I compress an image to 20KB or 50KB?
Often yes, but it depends on the starting image. The tool reduces a file by up to 90% and will not go below about 18KB. A small image can hit 20–50KB easily; a heavy multi-megapixel photo usually needs to be resized to smaller dimensions first, then compressed at a high level. For strict exam limits like NTA, resize to the required pixel size, then compress at maximum.
H3: Can I compress multiple images at once?
Yes. You can bulk compress images by dropping in many files together - they all compress at the same level, and you can keep adding more before you download. Grab each compressed image individually, or use the ZIP button to batch download every result in one file. Each file keeps its name with a "-compressed" suffix.
H3: Will compressing an image reduce its quality?
It can, but you control how much. RepetiGo uses lossy compression, so higher levels save more space but remove more detail. At moderate levels the change is hard to see. Use the built-in preview to compare the original and compressed image side by side, and if it looks too soft, move the slider down and compress again.
H3: What image formats can I compress?
You can compress JPG, JPEG, PNG, and WebP images. The tool picks the most efficient output automatically: images with transparency are saved as WebP to keep the see-through background, and solid photos are saved as JPEG, which is smallest for photographs. A WebP file you upload stays WebP.
H3: How do I compress images in PowerPoint?
In PowerPoint, click a picture, open the Picture Format tab, choose Compress Pictures, pick a resolution, untick "Apply only to this picture" to compress the whole deck, and save. That shrinks images inside the file. If you need the separate image file itself smaller, compress it with RepetiGo first, then insert it.
H3: Does this work for compressing images for email?
Yes. Email services usually cap attachments at around 25MB total, and large photos hit that fast. Compress each image at a medium–high level to bring the total down, then attach them - or download them all as one ZIP and send that. Because nothing is uploaded, you can prepare email images even on a slow connection.
H3: Why is the smallest file about 18KB?
The tool has a built-in floor of roughly 18KB - the smallest file it will produce even at maximum compression - so that images do not turn into unusable blocks of colour. If you need something under that, you would have to resize the image to very small dimensions first. For nearly every real-world portal and email use, 18KB is already smaller than the limit.

H2: Related Image Tools.
Tool
What It Does
Link
Resize Image
Shrink the pixel dimensions first to hit strict KB limits
→ /image-tools/resize-image
Crop Image
Trim to just the area you need before compressing
→ /image-tools/crop-image
Convert from JPG
Change format, then compress the result
→ /image-tools/convert-from-jpg
PNG to JPG
Flatten a PNG to a smaller JPG
→ /image-tools/png-to-jpg
Remove Background
Clean the subject before compressing
→ /image-tools/background-remover
All Image Tools
The complete image tools suite
→ /image-tools

[ Compress Images Free - No Upload, No Sign-Up → repetigo.com/image-tools/compress-image ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function CompressImagePage() {
  return (
    <CompressImageClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="compress-image-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </CompressImageClient>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "📊"];

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
  if (lines[0] === "Step" && lines[1] === "What You Do") return { headers: ["Step", "What You Do", "What Happens"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Target you need" && lines[1] === "How to get there") return { headers: ["Target you need", "How to get there", "Common reason"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Portal / Use" && lines[1] === "Typical size limit") return { headers: ["Portal / Use", "Typical size limit", "How to meet it"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "You upload" && lines[1] === "You get back") return { headers: ["You upload", "You get back", "Why"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#compress-image-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:image-tools\/[a-z-]*|pdf-tools\/compress-pdf|pricing)\/?|\/image-tools\/[a-z-]*\/?|\/image-tools\/?|\/pdf-tools\/compress-pdf\/?|\/products\/printpilot\/?|\/privacy-policy\/?|\/pricing\/?)/g);
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
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/crop-image": "/image-tools/crop-image",
    "/image-tools/convert-to-jpg": "/image-tools/convert-to-jpg",
    "/image-tools/convert-from-jpg": "/image-tools/convert-from-jpg",
    "/image-tools/png-to-jpg": "/image-tools/png-to-jpg",
    "/image-tools/background-remover": "/image-tools/background-remover",
    "/image-tools/upscale-image": "/image-tools/upscale-image",
    "/image-tools/ai-upscale-image": "/image-tools/ai-upscale-image",
    "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf",
    "/products/printpilot": "/print-automation",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") || cleanRoute.startsWith("/pdf-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/crop-image": "Open Crop Image",
    "/image-tools/convert-to-jpg": "Open Convert to JPG",
    "/image-tools/convert-from-jpg": "Open Convert from JPG",
    "/image-tools/png-to-jpg": "Open PNG to JPG",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/upscale-image": "Open Upscale Image",
    "/image-tools/ai-upscale-image": "Open AI Image Upscaler",
    "/pdf-tools/compress-pdf": "Open Compress PDF",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Compress Image", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free browser-based image compressor for JPG, PNG, and WebP. Adjustable compression slider, batch compression with ZIP download. Runs 100% in your browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to compress an image", step: [{ "@type": "HowToStep", name: "Add your images", text: "Click to select or drag-and-drop JPG, PNG, or WebP files - one or many at once." }, { "@type": "HowToStep", name: "Adjust the level", text: "Move the compression slider between 10% and 90%. Higher means a smaller file and lower quality." }, { "@type": "HowToStep", name: "Download", text: "Click download on any single image, or download every compressed image as one ZIP." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Compress Image", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
