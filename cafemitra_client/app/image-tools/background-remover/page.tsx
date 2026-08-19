import type { Metadata } from "next";
import BackgroundRemoverClient from "./BackgroundRemoverClient";

const pageUrl = "https://repetigo.com/image-tools/background-remover";

export const metadata: Metadata = {
  title: "Remove Background from Image Free - AI Background Remover | RepetiGo",
  description:
    "Remove the background from an image free with an AI background remover. Get a clean transparent PNG in seconds - or add a white / custom colour. No sign-up, no watermark.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Remove Background from Image Free - AI Background Remover",
    description: "Get a clean transparent PNG in seconds, or add a white / custom colour. Free, no watermark.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Remove Background from Image Free - AI Background Remover",
    description: "Free AI background remover. Transparent PNG, white/colour swatch, Enhance edges toggle.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Remove Background from Image Free - AI Background Remover for Photos, Logos & Signatures.

RepetiGo's remove background tool is a free, AI background remover that automatically detects the subject of a photo and deletes everything behind it - giving you a clean transparent PNG in seconds. Upload one image, let the AI do the cut-out, and either download it transparent or drop in a white or custom-colour background first. It works for portraits, ID photos, product shots, logos, and signatures.
You do not need Photoshop or any design skill. This image background remover reads the main subject, removes the background, and hands you a ready-to-use file. It is a free background remover with no sign-up and no watermark: choose Transparent for a see-through PNG, or click White for a compliant ID-photo background. If you want to remove background from image free without installing anything, this is the fastest route.

✓ Free · No sign-up · No watermark   ✓ JPG, PNG, WebP up to 15 MB   ✓ Transparent, white or custom colour   ✓ Output is always a clean PNG

H2: How to Remove a Background in 3 Steps.
Here is how to remove the background from an image with RepetiGo. It handles one image at a time, and the AI does the hard part for you.

Step
What You Do
What Happens
1. Upload one image
Click or drag-and-drop a JPG, PNG, or WebP file (up to 15 MB).
The file is validated; you can turn on "Enhance edges" before removing.
2. Remove the background
The AI detects the subject and deletes the background automatically.
A side-by-side grid shows the original and the transparent result.
3. Choose colour & download
Keep it Transparent, or click White / a colour swatch, then download.
Saves as <name>-no-bg.png (transparent) or <name>-bg.png (coloured).

🔒 The AI cut-out runs on our server; recolouring then happens instantly on your device. Sensitive ID photo? See the safety section below before uploading anywhere.

H2: What the "Enhance Edges" Toggle Does.
Next to the upload area is an "Enhance edges" checkbox. Turn it on before you remove the background, and the AI works harder around fine, tricky edges - especially hair, fur, and thin details - to strip away the faint colour halo that background removers often leave behind. The result is a cleaner cut-out that sits naturally on any new background.
One thing to know: the toggle has to be set before processing, because it changes how the removal is done - you cannot add it afterwards. If your first result has a slight fringe around the hair or edges, turn on Enhance edges and remove the background again. For simple subjects with clear outlines, you usually will not need it.

💡 Rule of thumb: leave Enhance edges off for products, documents, and hard-edged logos; turn it on for people, pets, and anything with hair or soft edges.

H2: Transparent, White, or a Custom Colour - Your Choice.
Once the background is gone, you decide what goes behind the subject. This is instant - picking a colour does not re-run the AI; the tool recomposes the transparent PNG with your chosen background live, right in your browser.

Option
What you get
Best for
Transparent
A see-through PNG (checkerboard preview)
Logos, signatures, overlays, design work
White
A clean white background
Aadhaar / PAN / passport / exam ID photos
Light Grey / Sky Blue / Red / Black
A preset solid colour
Profile photos, product shots, thumbnails
Custom colour
Any colour from the picker
Brand colours, specific backdrops

Whatever you choose, the file downloads as a PNG - transparent versions save as <name>-no-bg.png and coloured versions as <name>-bg.png. There is no JPG export inside the tool, so if a portal specifically needs a .jpg, take the white-background PNG and convert it with PNG to JPG afterward.

H2: Why Your Result Shows a Grey-and-White Checkerboard.
If your removed-background result shows a grey-and-white checkerboard, nothing is wrong - that pattern is not part of your image. It is simply how editors and file previews display transparency, meaning the background was removed successfully and those areas are now see-through. When you place the PNG on a document, slide, website, or form, the checkerboard disappears and whatever is behind it shows through.
This is the answer to the common "remove the white and grey checkerboard" question people ask ChatGPT and search engines: you do not remove the checkerboard - it represents transparency. If you actually want a solid area there instead, click the White swatch (or any colour) before downloading, and the checkerboard is replaced by that colour.

📊 Checkerboard = transparency, not a defect. Want a solid background instead? Click White or a colour swatch before you download.

H2: ★ Indian Use Cases - ID Photos, Signatures & Logos.
Background removal is one of the most practical image jobs in India. Government portals, exam bodies, and professional forms all set strict rules about photo backgrounds and signature formats - and a background remover is how you meet them.
H3: White Background for Aadhaar, PAN, Passport & Exam Photos
Indian government portals and official documents require a plain white background. Phone photos usually carry whatever was behind you - a wall, a room, the outdoors. Remove the background, click the White swatch, and you have a compliant white-background image ready to upload.

Document / Portal
Background rule
Workflow with RepetiGo
Passport Seva
Plain white / off-white
Remove background → White → resize → upload
NTA exam photo (NEET/JEE)
White or light background
Remove background → White → compress to KB limit
Aadhaar / UIDAI update
White or light background
Remove background → White → resize → upload
Voter ID / EPIC
Plain light background
Remove background → White → resize to spec
Bank KYC
White passport-size photo
Remove background → White → use for KYC

🇮🇳 Full ID-photo workflow: (1) Remove the background here and click White. (2) Resize to the required size at /image-tools/resize-image (413×531px for passport). (3) Compress to the KB limit at /image-tools/compress-image. All free and linked below.

H3: Signature Background Removal for Digital Forms
Attaching your signature to an online form or PDF needs a signature with a transparent background - not white paper. A white-paper signature dropped into a document shows up as an ugly white rectangle over the text. RepetiGo works as a dedicated signature background remover: the AI reads the dark ink as the subject and drops the paper away. To remove a signature background: sign with a dark pen on plain white paper, photograph just the signature, upload it, keep it Transparent (do not add a white swatch), and download the PNG. Pasted into a Word file, Google Doc, or PDF, the signature sits directly on the page with no white box.
H3: Logo Background Removal for Print Shops
Print shops constantly need a logo on a coloured material, mug, or banner - which needs the logo on a transparent background, not a white box. Upload the JPG or PNG logo, let the AI read the graphic as the subject, keep it Transparent, and download the PNG. Now the logo drops onto any colour with no white rectangle. For fine lines or gradients, turn on Enhance edges before removing and check the result after download.

H2: How to Remove a Background in GIMP, Photoshop, Illustrator, Google Slides & PowerPoint.
If you would rather use software you already have, here are the standard routes - and where the browser tool is simply faster.
H3: GIMP
GIMP is a free editor. To remove background in GIMP: (1) File → Open. (2) Right-click the layer → Add Alpha Channel. (3) Use the Fuzzy Select tool (U) and click the background. (4) Press Delete to make it transparent. (5) File → Export As → filename.png → Export. For a white background specifically, use Select → By Colour, click the white, then Delete. Hair and detailed edges take extra work with the paths or scissors tool - an AI remover like RepetiGo handles those with far less effort. This is the full answer to how to remove background in gimp.
H3: Photoshop
In Photoshop CC: select the layer → Properties → Quick Actions → Remove Background, then export as PNG. In older versions: Select → Subject → Select → Inverse → Delete → export. To remove a white background in Photoshop, use Select → Color Range, click the white, then delete. If you hit the "couldn't find background to remove" message, it usually means the subject and background are too similar in colour - try Select Subject manually, or use RepetiGo's AI, which separates low-contrast subjects better.
H3: Illustrator
Illustrator is for vector work, so it handles logos well. To remove a background in Illustrator: place the image → Object → Image Trace → Make and Expand → ungroup → select and delete the background shapes. For a photo rather than a logo, Illustrator is awkward - a browser AI remover is quicker and cleaner.
H3: Google Slides & PowerPoint
Google Slides has no true background remover - to remove a background in Google Slides, remove it first with RepetiGo, download the transparent PNG, then insert that into your slide. PowerPoint does have one: click the image → Picture Format → Remove Background → mark areas to keep/remove → Keep Changes. For a clean cut-out on a complex photo, removing it with AI first and inserting the PNG is usually tidier.
H3: MS Paint & iPhone
MS Paint cannot make true transparency reliably - for how to remove PNG backgrounds in MS Paint, people use Paint 3D's "Magic select," but the edges are rough; a browser AI tool gives a cleaner PNG. On an iPhone, iOS can lift a subject by long-pressing it in Photos, but for a proper file with a chosen background, RepetiGo runs in Safari with no app to install - the simplest way to remove a background on the phone itself.

H2: Is It Safe to Upload an ID Photo to a Background Remover?
It is a fair question, because removing a background means the image is processed on a server. Here is how RepetiGo handles it: the image is sent over an encrypted HTTPS connection to do the AI cut-out, it is processed in a temporary session that is not linked to any account, and it is not used to train the AI model. The recolouring step afterwards happens entirely on your device, not the server.
Before uploading a sensitive ID photo to any background remover, check two things: that the address is repetigo.com and that the connection is HTTPS. For RepetiGo's full data-handling and retention details, see the security policy linked below. If a document is extremely sensitive, the safest general rule for any online tool is to use it only when you need to and keep a local copy.

🔒 The AI removal is server-side over HTTPS; recolouring is on-device. Your image is not linked to an account or used to train the model. See the RepetiGo security policy for full details.

H2: Remove Background - Frequently Asked Questions.
H3: Is this background remover really free?
Yes - RepetiGo's AI background remover is free with no sign-up and no watermark. You can remove background from image free, add a white or custom colour, and download a clean PNG without creating an account. It removes one image at a time, so there is no cost to cover and nothing to unlock.
H3: How do I get a white background for a passport or exam photo?
Upload your photo, let the AI remove the background, then click the White swatch - you now have a compliant white-background image. For exact portal specs, resize it at /image-tools/resize-image (413×531px for passport) and compress to the KB limit at /image-tools/compress-image (many exam portals cap the photo well under 50KB). Download the white PNG and upload it.
H3: How do I remove a signature background for a digital form?
Sign with a dark pen on plain white paper, photograph just the signature, and upload it. The AI reads the ink as the subject and removes the paper. Keep it Transparent (do not add a white swatch) and download the PNG. Pasted into a Word file, Google Doc, PDF, or online form, the signature sits directly on the page with no white rectangle - the correct format for digital signature blocks.
H3: How do I remove a background in GIMP?
In GIMP: File → Open, then right-click the layer and Add Alpha Channel. Use the Fuzzy Select tool (U), click the background, and press Delete to make it transparent. For a white background, use Select → By Colour, click the white, and Delete. Then File → Export As → PNG. Hair and fine edges need extra work in GIMP; an AI remover like RepetiGo handles those with much less effort.
H3: Why does my result show a grey-and-white checkerboard?
That checkerboard is not part of your image - it is how editors display transparency, which means the background was removed successfully and those areas are see-through. When you place the PNG on a document, slide, or website, the checkerboard disappears. If you want a solid area there instead, click the White swatch or a colour before downloading.
H3: What does the "Enhance edges" toggle do?
Turned on before removal, Enhance edges makes the AI work harder around hair, fur, and fine details to strip the faint colour halo that background removers can leave. It must be set before processing - you cannot add it afterwards. Leave it off for hard-edged subjects like products and logos; turn it on for people and pets.
H3: Can I remove backgrounds from several images at once?
No - this tool removes the background from one image at a time. There is no batch upload or ZIP download here. Upload an image, remove its background, download it, then start over with the next one. For batch work on file size, the Compress Image tool does support multiple files and a ZIP download.
H3: What file formats can I use, and what do I get back?
You can upload a JPG, PNG, or WebP image up to 15 MB. The output is always a PNG, because PNG is the format that stores transparency. If you need a JPG for a portal that only accepts JPG, add a white background first, download the PNG, then convert it with the PNG to JPG tool.
H3: Can I remove a white background specifically?
Yes. The AI detects the main subject and removes the surrounding area, including a plain white background behind a logo, product, or signature. Download the transparent PNG. If the subject itself is also nearly white, the AI can struggle to separate them - in that case GIMP's Select by Colour gives you manual control.
H3: Is it safe to upload my Aadhaar or passport photo?
RepetiGo sends the image over encrypted HTTPS to perform the AI removal, processes it in a temporary session that is not tied to an account, and does not use it to train the model. Recolouring happens on your device. Before uploading a sensitive ID photo anywhere, check the URL is repetigo.com and the connection is HTTPS, and see the security policy for full data-handling details.

H2: Related Image Tools.
Tool
What It Does
Link
Resize Image
Resize to exact portal dimensions after background removal
→ /image-tools/resize-image
Compress Image
Reduce to the exact KB limit for portal upload
→ /image-tools/compress-image
Crop Image
Frame the photo correctly before removing the background
→ /image-tools/crop-image
Convert from JPG
Convert a JPG to PNG (PNG preserves transparency)
→ /image-tools/convert-from-jpg
PNG to JPG
Flatten a transparent/white PNG to a JPG
→ /image-tools/png-to-jpg
All Image Tools
The complete image tools suite
→ /image-tools

[ Remove Background Free - No Sign-Up → repetigo.com/image-tools/background-remover ]
[ Explore All Image Tools → repetigo.com/image-tools ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: ([^\n]+\?)\n([\s\S]*?)(?=\nH3:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function BackgroundRemoverPage() {
  return (
    <BackgroundRemoverClient>
      <JsonLd />
      <article className="tool-seo-content compress-pdf-seo" id="remove-background-guide">
        <StructuredSeoCopy content={content} />
      </article>
    </BackgroundRemoverClient>
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
  if (lines[0] === "Option" && lines[1] === "What you get") return { headers: ["Option", "What you get", "Best for"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Document / Portal" && lines[1] === "Background rule") return { headers: ["Document / Portal", "Background rule", "Workflow with RepetiGo"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#remove-background-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
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
    "/image-tools/background-remover": "/image-tools/background-remover",
    "/image-tools/crop-image": "/image-tools/crop-image",
    "/image-tools/resize-image": "/image-tools/resize-image",
    "/image-tools/compress-image": "/image-tools/compress-image",
    "/image-tools/convert-from-jpg": "/image-tools/convert-from-jpg",
    "/image-tools/png-to-jpg": "/image-tools/png-to-jpg",
    "/products/printpilot": "/print-automation",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/crop-image": "Open Crop Image",
    "/image-tools/resize-image": "Open Resize Image",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/convert-from-jpg": "Open Convert from JPG",
    "/image-tools/png-to-jpg": "Open PNG to JPG",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Remove Background", applicationCategory: "MultimediaApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free AI background remover - automatically detects the subject of a photo and produces a clean transparent PNG, with an option to add a white or custom colour background. The AI cut-out runs on our server over HTTPS; recolouring then happens instantly on your device.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to remove a background from an image", step: [{ "@type": "HowToStep", name: "Upload one image", text: "Click or drag-and-drop a JPG, PNG, or WebP file (up to 15 MB)." }, { "@type": "HowToStep", name: "Remove the background", text: "The AI detects the subject and deletes the background automatically." }, { "@type": "HowToStep", name: "Choose colour & download", text: "Keep it Transparent, or click White / a colour swatch, then download." }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://repetigo.com/image-tools" }, { "@type": "ListItem", position: 3, name: "Remove Background", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
