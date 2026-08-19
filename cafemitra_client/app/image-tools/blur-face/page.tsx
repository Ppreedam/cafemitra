import type { Metadata } from "next";
import BlurFaceClient from "./BlurFaceClient";

const pageUrl = "https://repetigo.com/image-tools/blur-face";

export const metadata: Metadata = {
  title: "Blur Face Free - Auto-Detect & Blur Faces in Photos | RepetiGo",
  description:
    "Free tool to blur faces in a photo - it auto-detects faces, and you can add custom blur areas too. Adjust blur strength and download. Faces detected, then discarded.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Blur Face Free - Auto-Detect & Blur Faces in Photos",
    description: "Auto-detect and blur faces in a photo, or add custom blur areas. Adjust strength and download.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Blur Face Free - Auto Face Blur for Photos",
    description: "Free: auto-detect & blur faces in a photo, custom blur areas, adjustable strength.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Blur Face - Automatically Blur Faces in a Photo, Free.
RepetiGo's blur face tool automatically detects and blurs faces in a photo - free, and with no watermark. Upload an image, and it finds the faces and blurs them for you; you can adjust how strong the blur is, add your own blur areas for anything the detector misses, and download the result. It is the quick way to protect people's identities in a picture before you share it. Whether you need to blur a face in a picture for privacy, cover a bystander, or hide a child's face on social media, this does it in seconds.
It works on a single photo at a time and gives you both automatic and manual control: let it find faces on its own, or drag your own blur boxes exactly where you want them. The blurring itself happens in your browser, and your image is used only to detect faces and then discarded - more on that below.

✅ Free · No sign-up · No watermark   |   ✅ Automatic face detection   |   ✅ Custom blur areas + adjustable strength   |   ✅ Image discarded after detection

H2: Why Blur Faces in a Photo?
Sharing photos online often means capturing people who did not agree to appear - bystanders in the background, other people's children, or strangers in a public place. Blurring their faces is a simple, respectful way to protect their privacy before you post. It is increasingly expected on social media, in blog posts, and in any image shared publicly, and in some contexts it is a genuine safeguarding step.
There are practical reasons too. Journalists and researchers blur faces to protect sources and subjects; parents blur their children's faces before posting; and anyone sharing a group photo may want to hide the identity of people who would rather not be recognised. Whatever the reason, adding a blur over a face is the standard way to keep a photo shareable while respecting the people in it - and this tool makes that fast and free.

H2: How to Blur a Face in 3 Steps.
Here is how to blur a face in a picture with RepetiGo. The automatic detection does most of the work.

Step
What You Do
What Happens
1. Upload your photo
Add the image (JPG/PNG/WebP).
It detects faces automatically and marks them to blur.
2. Adjust or add areas
Set the blur strength; add custom blur boxes if needed.
The preview updates so you can see the result.
3. Download
Download the blurred image.
It saves as a PNG with the faces blurred.

💡 If a face is missed or you want to blur something else, switch to a custom blur area and drag a box over it - you are not limited to the auto-detected faces.

H2: Automatic Face Detection.
The tool's main feature is that it finds faces for you. When you upload a photo, it automatically detects the faces in it and marks each one to be blurred, so often you can simply download the result. If you need it to be more or less aggressive, three sensitivity levels - Low, Recommended, and High - let you tune how eagerly it looks for faces; changing the level re-runs the detection. Recommended suits most photos, while High can help catch smaller or partly-hidden faces.
If no face is confidently found - or the detection service is briefly unavailable - the tool does not leave you stuck. It applies a suggested blur area based on the photo's orientation and tells you what happened, so you can adjust it or add your own boxes. That fallback means you always have something to start from, even on a tricky image where automatic detection is uncertain.

H2: Custom Blur Areas - Blur Anything.
Automatic detection handles faces, but sometimes you need to blur something it will not find on its own - a face it missed, a name badge, a license plate, a house number, a screen, or a document in shot. For those, switch to a custom blur area: click "Add blur area", then drag the box into place and use its handle to resize it over whatever you want hidden. You can add as many boxes as you need and delete any of them with the corner button.
This makes the tool useful well beyond faces. While the automatic detection is face-focused, the manual boxes let you blur any sensitive detail in a photo before sharing it. Combine the two - let it blur the faces automatically, then add a couple of custom boxes for anything else - and you can clean up a picture for privacy in moments.

🔒 Custom boxes blur anything: license plates, ID cards, name badges, house numbers, screens. Auto-detection covers faces; manual boxes cover the rest.

H2: Blur Strength & Selective Blurring.
You control how heavy the blur is with a strength slider, from a light 6-pixel softening up to a strong 50-pixel blur that makes a face completely unrecognisable. Lower settings keep a hint of the shape while obscuring identity; higher settings hide it entirely. Choose based on how much you need to conceal.
Importantly, only the areas you blur are affected - the rest of the photo stays perfectly sharp. The tool does this cleverly: it makes a fully-blurred copy of the image behind the scenes and then shows only the selected regions from that copy over the otherwise-sharp original, with padding so there are no ugly edges around each blurred patch. The result is a clean photo where the faces (and any custom areas) are smoothly blurred and everything else is untouched.

H2: How Your Image Is Handled.
It is worth being clear and honest about privacy, because this tool works a little differently from some of RepetiGo's others. To find faces automatically, your image is sent to a detection service, which returns the positions of the faces - and your image is then discarded, not stored. The actual blurring happens in your browser, on your device. So your photo is used only for the moment of face detection and is not kept afterwards.
In other words, the automatic detection needs to look at the image once to locate faces, but nothing is retained, and the blurred result is produced locally on your device. If you would rather not use automatic detection at all, you can rely on custom blur areas, which you position yourself. Either way, the finished image is downloaded straight to your device with no watermark and no account required.

ℹ️ Honest note: to detect faces automatically, your image is sent to a detection service and then discarded (not stored). The blurring itself happens in your browser. This differs from RepetiGo's fully on-device tools.

H2: ★ Use Cases - Social, Privacy & Sharing.
Blurring faces comes up constantly once you start sharing photos responsibly.

Scenario
Why blur
How
Posting a group or crowd photo
Protect bystanders' privacy
Auto-detect blurs everyone
Sharing a photo with children
Hide kids' faces
Auto-detect + adjust strength
Journalism / research
Protect sources and subjects
Blur faces + custom boxes
Selling something online
Hide a license plate or address
Custom blur area over the detail
Screenshots to share
Hide names or a face on screen
Custom blur boxes

🇮🇳 Tip: blur faces for privacy, then resize and compress for the platform at /image-tools/resize-image and /image-tools/compress-image before posting.

H2: What This Tool Does Not Do.
So you know whether it fits before you start, here is what this tool is not for - and where to go instead.

People often ask for…
The honest answer
Blur faces in a video
No - this works on static photos, not video
Blur many photos at once
No - it processes one image at a time
Pixelate / mosaic instead of blur
No - it applies a Gaussian blur, not pixelation
Cover a face with a black box or emoji
No - it blurs; it does not place a solid cover
Un-blur or restore a blurred face
No - it adds blur; it cannot remove it
Blur the background, keep the face sharp
No - this blurs faces/areas, not backgrounds
Save as JPG or WebP
No - the download is a PNG

H2: Blur Face - Frequently Asked Questions.
H3: Is this blur face tool free?
Yes - RepetiGo's blur face tool is completely free with no sign-up and no watermark. You can automatically detect and blur faces, add custom blur areas, adjust the blur strength, and download the result at no cost. There is nothing to unlock, and the finished image has no mark added to it.
H3: How do I blur a face in a picture?
Upload your photo and the tool automatically detects the faces and marks them to blur. Adjust the blur strength if you like, add custom blur boxes for anything it missed, and download the result as a PNG. In most cases the automatic detection does the work, so blurring a face takes just a few seconds.
H3: Does it detect faces automatically?
Yes - when you upload a photo it automatically finds the faces and prepares to blur them. You can set the sensitivity to Low, Recommended, or High to control how eagerly it detects, and if it is unsure or cannot find a face, it suggests a blur area and lets you adjust it or add your own. Recommended works well for most photos.
H3: Can I blur something other than a face?
Yes. Alongside automatic face detection, you can add custom blur areas: click "Add blur area" and drag a box over anything you want to hide - a license plate, a name badge, a house number, a screen, or a document. You can add as many boxes as you need, so you can clean up any sensitive detail, not just faces.
H3: Can it blur faces in a video?
No - this tool works on static photos, not video. It blurs faces (and any custom areas) in a single image and downloads a still picture. If you need to blur faces across a moving video, that is a different kind of tool; this one is focused on photos.
H3: How strong can the blur be?
You control it with a strength slider from 6 pixels up to 50 pixels. A light blur softens a face while keeping its shape; a strong blur makes it completely unrecognisable. Only the areas you blur are affected - the rest of the photo stays sharp - so you can conceal identities cleanly without degrading the whole image.
H3: Is my photo uploaded or stored?
To detect faces automatically, your image is sent to a detection service and then discarded - it is not stored. The blurring itself happens in your browser on your device. So your photo is used only for the moment of detection and nothing is kept. If you prefer, you can skip automatic detection and use custom blur areas, which you position yourself.
H3: Can I un-blur or restore a face later?
No - the tool adds a blur to protect privacy, and that is a one-way change in the downloaded image; it cannot remove a blur or restore a face. Keep your original photo if you might need the un-blurred version later. The blurred PNG you download is meant for sharing safely.
H3: Can I blur several photos at once?
Not currently - the tool processes one image at a time rather than a batch. Blur one photo, download it, then upload the next. For most privacy tasks - a single photo before posting - that is exactly what is needed; there is no multi-file or ZIP option here.
H3: What format is the download?
The blurred image downloads as a PNG, which keeps the quality high. If you need a JPG or WebP for a smaller file or a specific platform, you can convert the downloaded PNG afterwards using RepetiGo's Convert to JPG or Image Converter tools, which are free and linked from the image tools hub.

H2: Related Image Tools.
Tool
What It Does
Link
Compress Image
Shrink the blurred photo before sharing
→ /image-tools/compress-image
Resize Image
Resize for social platforms
→ /image-tools/resize-image
Crop Image
Crop before or after blurring
→ /image-tools/crop-image
Photo Editor
Adjust, filter, and edit photos
→ /image-tools/photo-editor
Watermark Image
Add a watermark before sharing
→ /image-tools/watermark-image
All Image Tools
The complete image tools suite
→ /image-tools

[ Blur Faces in a Photo Free - Auto + Custom → repetigo.com/image-tools/blur-face ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function BlurFacePage() {
  return (
    <BlurFaceClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="blur-face-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </BlurFaceClient>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "🇮🇳", "🔒", "🖨️", "📱", "✅", "⚠️", "🖥️", "🔁", "🔄", "★", "👁️", "ℹ️"];

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
  if (lines[0] === "Scenario" && lines[1] === "Why blur") return { headers: ["Scenario", "Why blur", "How"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#blur-face-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/blur-face": "/image-tools/blur-face",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/crop-image": "/image-tools/crop-image",
    "/image-tools/photo-editor": "/image-tools/photo-editor",
    "/image-tools/watermark-image": "/image-tools/watermark-image",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/blur-face": "Open Blur Face",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/crop-image": "Open Crop Image",
    "/image-tools/photo-editor": "Open Photo Editor",
    "/image-tools/watermark-image": "Open Watermark Image",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Blur Face", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online tool that automatically detects and blurs faces in a photo, with custom blur areas and adjustable blur strength. The image is used only to detect faces and then discarded; the blurring itself happens in the browser.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Blur a Face in a Photo", step: [{ "@type": "HowToStep", name: "Upload your photo", text: "Upload your photo" }, { "@type": "HowToStep", name: "Adjust or add areas", text: "Adjust or add areas" }, { "@type": "HowToStep", name: "Download", text: "Download" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Blur Face", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
