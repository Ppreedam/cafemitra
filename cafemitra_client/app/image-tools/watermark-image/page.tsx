import type { Metadata } from "next";
import WatermarkImageClient from "./WatermarkImageClient";

const pageUrl = "https://repetigo.com/image-tools/watermark-image";

export const metadata: Metadata = {
  title: "Watermark Image Free - Add Text or Logo Watermarks | RepetiGo",
  description:
    "Free tool to add a text or logo watermark to your images - drag to position, set opacity and rotation, and batch-watermark many photos at once. In your browser, no upload.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Watermark Image Free - Add Text or Logo Watermarks",
    description: "Add a text or logo watermark to your images. Drag to position, set opacity, batch-watermark many photos.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Watermark Image Free - Text & Logo",
    description: "Free: add text/logo watermarks, drag to position, batch + ZIP, 100% in your browser.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Watermark Image - Add a Text or Logo Watermark, Free.
RepetiGo's watermark image tool lets you add a text or logo watermark to your photos - free and in your browser. Upload an image, add a text watermark, your own logo, or both, then drag each one into place and fine-tune its size, opacity, and angle. When it looks right, download it as a PNG or JPG. You can even apply the same watermark to a whole batch of images at once. Everything runs on your device, so your photos are never uploaded.
It is built for protecting and branding your own work: photographers marking their photos, sellers branding product images, and creators adding a logo before posting online. With multiple layers, full styling control, and batch processing, it does the job properly without any sign-up or watermark of its own. To be clear, this tool adds a watermark to your image - it is not a watermark remover.

✅ Free · No sign-up · No watermark of its own   |   ✅ Text + logo layers   |   ✅ Drag, opacity, rotation   |   ✅ Batch + ZIP · 100% in your browser

H2: Why Watermark Your Images?
A watermark is a simple, effective way to protect and brand your images. For photographers and artists, a discreet name or logo across a photo discourages others from using it without credit and marks it as yours wherever it travels online. For businesses and online sellers, a logo watermark on product shots reinforces the brand and helps stop images being lifted by competitors or copycat listings.
Watermarking is also just good practice before posting anything publicly. Once an image is online it can be copied endlessly, and a watermark is your signature on it - a claim of authorship that stays with the file. This tool makes adding that mark quick and flexible, whether you want subtle text in a corner or a bold logo across the middle.

H2: How to Add a Watermark in 3 Steps.
Here is how to watermark an image with RepetiGo. It is quick, and you can preview everything as you go.

Step
What You Do
What Happens
1. Upload your image
Add the photo you want to watermark (JPG/PNG/WebP).
It appears on the canvas, ready to mark.
2. Add text or a logo
Add a text layer, upload a logo, or both; style and drag them.
Each layer previews live on the image.
3. Download
Download as PNG or JPG (or batch-apply and get a ZIP).
Your watermarked image saves to your device.

🔒 Everything is rendered in your browser on a canvas - your images are never uploaded to RepetiGo or any server.

H2: Text and Logo Watermark Layers.
The tool works in layers, so you can combine as many watermarks as you like on one image. Add a text layer to type your name, website, or a copyright line, and choose the font (Arial, Georgia, Verdana, Impact, or Courier New), the size, and the colour, with bold, italic, and underline toggles for the exact look you want. Add a logo layer by uploading your own logo or graphic to use as an image watermark - ideal for branding.
Because layers are unlimited, you can, for example, put a logo in one corner and a copyright line along the bottom, styling each independently. Click directly on any layer in the image preview to select it, then adjust or delete it from the side panel. This is what makes it a proper image watermark creator rather than a one-line stamp: you build exactly the watermark your images need.

H2: Position, Size, Opacity & Rotation.
Each layer has its own controls, so you have full command over how the watermark looks. Drag any layer directly on the preview to position it exactly where you want. A size slider scales it (text from 10% up to 250%, a logo from 10% to 100%), an opacity slider (5–100%) lets you make the watermark bold or barely-there, and a rotation slider (−180° to 180°) can angle it - useful for a diagonal line of text across the image.
Opacity is the key to a good watermark: high opacity for a strong, obvious mark, or low opacity for a subtle one that protects the image without dominating it. Because the render scales the text relative to the image, your watermark comes out at the right proportion whatever the image's resolution, so it looks consistent on both small and large photos.

💡 For a subtle mark, lower the opacity to around 20–40%; for strong protection, raise it and increase the size. Rotate a text layer for a diagonal watermark across the image.

H2: Batch-Watermark Many Images (with ZIP).
If you have a set of photos to protect - a shoot, a product range, a portfolio - you do not need to watermark them one by one. Once your watermark looks right, use batch apply to stamp the exact same layer stack (text, logo, position, size, opacity, and rotation) onto a whole set of additional images at once. Each processed image gets its own thumbnail with an individual download, and you can grab them all as a single ZIP.

✅ Real batch support: design your watermark once, then apply it to a whole set of images and download them all as one ZIP - perfect for protecting a full shoot or product range.

H2: Your Images Never Leave Your Device.
This matters especially for watermarking, because you are often protecting work that has not been published yet. The entire tool runs on your own device using the browser's canvas - your images and your logo are never uploaded, and no server processes them. So your unpublished photos stay completely private while you mark them, which is exactly how it should be. There is no watermark of the tool's own added, and no account wall.

🔒 Client-side and private: your photos and logo stay on your device, nothing is uploaded, and the tool adds no mark of its own.

H2: One Positioned Watermark, Not a Tiled Pattern.
One thing to know so the result matches your expectation: this tool places your watermark at a position (or several positions, if you add multiple layers) on the image. It does not create a tiled, repeating diagonal pattern that covers the entire image edge to edge. If you want a single clear watermark - a logo in the corner, a name across the middle, a copyright line along the bottom - that is exactly what it does, and you can add several layers for more coverage.
If your goal is specifically the all-over repeating pattern some stock sites use, that particular mode is not available here; you would place individual watermark layers instead. For the vast majority of watermarking - branding, crediting, and protecting your photos - a well-placed watermark or two does the job, and the layer system gives you the flexibility to arrange them how you like.

H2: ★ Use Cases - Photographers, Sellers & Creators.
A flexible watermark tool earns its place across photography, e-commerce, and content work.

Who
What they watermark
Why
Photographers
Photos before sharing
Credit and protect their work online
Online sellers
Product images
Brand shots and deter image theft
Designers
Portfolio pieces
Mark work shared with clients
Content creators
Images for social
Add a logo or handle for recognition
Small businesses
Marketing images
Consistent branding across a set (batch)

🇮🇳 Tip: watermark a whole product range in one batch, then compress the set at /image-tools/compress-image before uploading to your store or marketplace.

H2: What This Tool Does Not Do.
So you know whether it fits before you start, here is what this tool is not for - and where to go instead.

People often ask for…
The honest answer
Remove a watermark from an image
No - this tool adds watermarks, it does not remove them
A tiled / repeating diagonal pattern
No - it places positioned watermarks, not an all-over pattern
Watermark a PDF, video, or Word file
No - it watermarks images (JPG/PNG/WebP) only
Save a watermark design for next time
No - the design is for the current session
Blend modes or a text shadow/outline
No - opacity, colour, and rotation are the controls
Snap-to-corner or alignment guides
No - position layers by dragging them freely

H2: Watermark Image - Frequently Asked Questions.
H3: Is this watermark tool free?
Yes - RepetiGo's watermark image tool is completely free with no sign-up, and it adds no watermark of its own to your images. Because it runs in your browser rather than on a paid server, you can add text and logo watermarks, use unlimited layers, and batch-process images at no cost. There is nothing to unlock.
H3: How do I add a watermark to an image?
Upload your image, then add a text layer, a logo layer, or both. Style the text (font, size, colour, bold/italic/underline) or upload your logo, drag each into place, and adjust opacity and rotation. When it looks right, download as PNG or JPG. You can preview everything live on the image as you work.
H3: Can I use my own logo as a watermark?
Yes. Add an image layer and upload your logo or graphic to use it as a watermark. You can position it by dragging, scale it, set its opacity, and rotate it, just like a text layer. Combining a logo in one corner with a text credit elsewhere is a common, effective way to brand and protect an image.
H3: Can I watermark many images at once?
Yes. Design your watermark on one image, then use batch apply to stamp the exact same layer stack - text, logo, position, size, opacity, and rotation - onto a whole set of additional images. Each result has its own download, and you can grab them all as a single ZIP. It is ideal for protecting a full shoot or product range.
H3: Can it make a repeating, all-over watermark pattern?
No - it places your watermark at a position (or several, if you add multiple layers), rather than tiling a repeating diagonal pattern across the whole image. For a clear logo, name, or copyright line, that is exactly what you want; if you specifically need the all-over stock-site pattern, that mode is not available here.
H3: Does it remove watermarks?
No - this tool adds watermarks to your images; it does not remove them. It is designed to help you protect and brand your own work by placing a text or logo mark on it. If you are looking to take a watermark off an image, that is a different kind of task and not what this tool does.
H3: How do I make the watermark subtle or bold?
Use the opacity slider, which runs from 5% to 100%. Lower it to around 20–40% for a subtle watermark that protects the image without dominating it, or raise it for a strong, obvious mark. Combine opacity with the size slider and rotation to get exactly the balance of visibility and protection you want.
H3: What image formats can I use and save?
You can upload a JPG, PNG, or WebP as your base image, and download the watermarked result as a PNG or JPG. Choose PNG if you want to keep the highest quality or any transparency in the output, or JPG for a smaller file - for example when preparing images for a website or marketplace.
H3: Are my images uploaded to a server?
No. The tool runs entirely in your browser using the canvas, so your images and your logo never leave your device and nothing is sent to RepetiGo. That is especially important for watermarking, since you are often protecting work that has not been published yet - it stays completely private while you mark it.
H3: Does it add its own watermark or a sign-up wall?
No to both. RepetiGo does not stamp its own watermark on your images and does not require an account. The only watermark on your image is the one you add yourself. You get the full, clean result to download, free, which is the whole point of a tool meant to protect your work.

H2: Related Image Tools.
Tool
What It Does
Link
Compress Image
Shrink the watermarked image (batch + ZIP)
→ /image-tools/compress-image
Resize Image
Resize before sharing online
→ /image-tools/resize-image
Crop Image
Crop before watermarking
→ /image-tools/crop-image
Convert to JPG
Convert the final image to JPG
→ /image-tools/convert-to-jpg
Meme Generator
Add caption text to an image
→ /image-tools/meme-generator
All Image Tools
The complete image tools suite
→ /image-tools

[ Watermark Your Images Free - Text + Logo → repetigo.com/image-tools/watermark-image ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function WatermarkImagePage() {
  return (
    <WatermarkImageClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="watermark-image-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </WatermarkImageClient>
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
  if (lines[0] === "Who" && lines[1] === "What they watermark") return { headers: ["Who", "What they watermark", "Why"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "People often ask for…" && lines[1] === "The honest answer") return { headers: ["People often ask for…", "The honest answer"], rows: chunkRows(lines.slice(2), 2) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#watermark-image-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/watermark-image": "/image-tools/watermark-image",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/crop-image": "/image-tools/crop-image",
    "/image-tools/convert-to-jpg": "/image-tools/convert-to-jpg",
    "/image-tools/meme-generator": "/image-tools/meme-generator",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/watermark-image": "Open Watermark Image",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/crop-image": "Open Crop Image",
    "/image-tools/convert-to-jpg": "Open Convert to JPG",
    "/image-tools/meme-generator": "Open Meme Generator",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Watermark Image", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online tool to add a text or logo watermark to images, with drag positioning, opacity and rotation control, and batch watermarking with ZIP download. Runs entirely in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Add a Watermark to an Image", step: [{ "@type": "HowToStep", name: "Upload your image", text: "Upload your image" }, { "@type": "HowToStep", name: "Add text or a logo", text: "Add text or a logo" }, { "@type": "HowToStep", name: "Download", text: "Download" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Watermark Image", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
