import type { Metadata } from "next";
import ResizeImageClient from "./ResizeImageClient";

const pageUrl = "https://www.repetigo.com/tools/image/resize-image/";

export const metadata: Metadata = {
  title: "Resize Image Online Free India - Exact Pixels, Social Media Sizes | RepetiGo",
  description:
    "Resize image online free - change dimensions in pixels, resize for Instagram, Facebook, YouTube, or Indian document photos. No sign-up. 100% browser-based, nothing uploaded.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Resize Image Online Free India - Exact Pixels, Social Media Sizes | RepetiGo",
    description: "Free image resizer - resize for Instagram, Facebook, YouTube, or enter exact pixel dimensions for government forms. No sign-up, nothing uploaded.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Resize Image Free Online - RepetiGo",
    description: "Resize images to exact pixels or social media presets, free. No sign-up, 100% browser-based.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Resize Image Online Free. Change Dimensions in Pixels, or Choose a Preset for Instagram, Facebook, or YouTube.
RepetiGo's free image resizer lets you change the dimensions of any photo or image to whatever size you need. Enter exact pixel dimensions, choose a percentage of the original size, or pick from built-in presets for Instagram, Facebook, and YouTube. No software required. No account needed. Your image is never uploaded to a server - resizing happens entirely in your browser.
The resize image online free tool accepts JPG, PNG, and WEBP files and works on any device with a browser - phone, tablet, laptop, or desktop. The output downloads as WebP or PNG - if you need a JPG for a government portal upload, run the result through the Convert to JPG tool afterward.

✓ Enter Exact Pixel Dimensions   ✓ Instagram, Facebook, YouTube Presets   ✓ Aspect Ratio Lock   ✓ No Sign-Up   ✓ 100% Browser-Based - Nothing Uploaded

[ Resize Image Free - No Sign-Up → repetigo.com/tools/image/resize-image/ ]

H2: What Does Resizing an Image Do?
Resizing an image changes its dimensions - the width and height, measured in pixels. When you resize an image, you are making it physically larger or smaller. A 4000×3000 pixel photo resized to 400×300 pixels becomes 10 times smaller in each dimension and roughly 100 times smaller in file size, since file size is broadly proportional to the number of pixels.
Resizing is different from cropping (which cuts off parts of the image), compressing (which reduces file size while keeping the same dimensions), and upscaling (which uses AI to intelligently increase image size). These are four separate operations that serve different purposes. The right tool depends on what you need:

Operation
What It Does
When to Use
RepetiGo Tool
Resize
Changes width and height in pixels - scales the entire image up or down
Making an image fit specific portal dimensions, social media requirements, or print sizes
This page - Resize Image
Crop
Cuts away the edges - keeps only the selected area
Creating a square crop for a profile photo, or removing unwanted background areas
Crop Image → /image-tools/crop-image
Compress
Reduces file size while keeping the same pixel dimensions
Making an image small enough to upload to a government portal with a KB size limit
Compress Image → /image-tools/compress-image
AI Upscale
Increases image size using AI to add detail intelligently
Making a small or low-resolution image larger without visible pixelation
AI Image Upscaler → /image-tools/ai-upscale-image

💡 For most Indian government portal uploads, you typically need resize (correct pixel dimensions), then Convert to JPG at /image-tools/convert-to-jpg (since this resizer outputs WebP or PNG, not JPG), then compress if the file is still over the portal's KB limit at /image-tools/compress-image.

H2: How to Resize an Image Online Free in 3 Steps.
Every resize follows the same simple process. No account required, no daily limit.
H3: Step 1 - Upload Your Image
Click the Upload button or drag and drop your image. Supported formats: JPG/JPEG, PNG, WEBP. There is no fixed file size cap - because everything runs on your own device, a very large image simply takes a little longer to process. This tool works with one image at a time. Upload works on any device - Android phone, iPhone, Windows laptop, Mac, or Chromebook - from your browser, with no app to install.
H3: Step 2 - Enter Your Target Size or Choose a Preset
You have three ways to set your target size:
By Size - enter the width and height in pixels. Enable Lock Aspect Ratio to automatically calculate the other dimension without distorting the image. If you turn Lock Aspect Ratio off and enter dimensions with a different ratio than the original, the image is stretched to fit exactly - there is no padding or white-border option, so leave the lock on unless you specifically want that stretched look.
As Percentage - drag the scale slider from 10% to 200% of the original. Under 100% makes the image smaller with no quality loss. Over 100% stretches the existing pixels rather than adding new detail - for enlarging with genuinely added detail instead, use the AI Image Upscaler at /image-tools/ai-upscale-image.
Social Media - five built-in one-click presets: Instagram Post (1080×1080), Instagram Story (1080×1920), Facebook Post (1200×630), LinkedIn Post (1200×627), and YouTube Thumbnail (1280×720). Selecting one fills in the width and height automatically.
In Export Settings, choose WebP (smaller file, adjustable quality) or PNG (lossless, no quality slider) as your output format, and optionally set a Target File Size in KB - the tool will step down the WebP quality until it fits, when possible.

H3: Step 3 - Download Your Resized Image
Click Resize. Processing happens on your own device in under a second for most images. Download the result. The output is always WebP or PNG - if your form or portal specifically requires a JPG (most Indian government portals do), open the result in Convert to JPG at /image-tools/convert-to-jpg before uploading.

[ Resize Image Free Now → repetigo.com/tools/image/resize-image/ ]

H2: Image Size Reference - India Documents & Social Media.
The tool has five built-in one-click presets for social media, listed below. For Indian document photos and every other platform size, enter the width and height manually using the By Size tab and Lock Aspect Ratio - the reference numbers below are commonly cited specs, but government portals do update their requirements from time to time, so always confirm against the current form before submitting.
H3: Indian Document Photo Sizes (Enter Manually)
Document / Form
Commonly Cited Size
Pixels (approx.)
Notes
Indian Passport (Passport Seva, current ICAO format)
35 mm × 45 mm
630 × 810 px
JPEG under 250 KB. Resize, then Convert to JPG, then Compress if needed.
Voter ID / EPIC Online Upload (NVSP)
Portal-specified, commonly around 200×230 px
200 × 230 px
10-200 KB JPEG. Figures vary slightly by state portal - confirm on the form.
PAN Card Application
Commonly cited as 25 mm × 35 mm (some forms cite 35×45mm - check your form)
350 × 350 px minimum
20-200 KB JPEG. Confirm the exact spec on your NSDL/UTIITSL form.
NEET / NTA Postcard Photo
4 cm × 6 cm (postcard), no fixed pixel mandate
No official pixel requirement
10-200 KB JPG - the KB limit matters more than an exact pixel count here.
State Govt. Scholarship Portal
Varies by state and scheme
Varies by portal
Always check the specific portal's stated requirement before resizing.

H3: Social Media Platform Sizes
Platform
Image Type
Recommended Size
Preset in Tool?
Instagram
Feed Post (Square)
1080 × 1080 px
✓ One-click preset
Instagram
Story / Reel
1080 × 1920 px
✓ One-click preset
Instagram
Profile Photo
320 × 320 px
Enter manually
Facebook
Post
1200 × 630 px
✓ One-click preset
Facebook
Cover Photo
851 × 315 px
Enter manually
Facebook
Profile Photo
170 × 170 px
Enter manually
YouTube
Thumbnail
1280 × 720 px
✓ One-click preset
YouTube
Channel Banner
2560 × 1440 px
Enter manually
LinkedIn
Post Image
1200 × 627 px
✓ One-click preset
LinkedIn
Profile Photo
400 × 400 px
Enter manually
WhatsApp
Profile Photo
500 × 500 px
Enter manually
Twitter/X
Profile Photo
400 × 400 px
Enter manually

🇮🇳 India is one of the world's largest social media markets - Instagram and WhatsApp each have hundreds of millions of Indian users, and YouTube is the most-used video platform in the country. The five sizes marked as one-click presets above are built directly into RepetiGo's resize tool; everything else in this table is a widely-cited reference size you can type into the Width and Height fields yourself.

H2: Resize Image Without Losing Quality - What Actually Happens.
The honest answer depends on which direction you are resizing:
Resizing DOWN (making an image smaller in pixels) - no quality loss. When you go from 4000×3000 pixels to 400×300 pixels, you are removing most of the pixels, but the remaining pixels are resampled together and the result looks sharp and clear at the new, smaller size.
Resizing UP (making an image larger in pixels) using this tool's As Percentage slider above 100% - causes pixelation. The tool duplicates and interpolates existing pixels to fill the larger canvas rather than inventing new detail, which creates a blurry or softer result the further above 100% you go. This is a mathematical limitation of resizing without AI, not a bug.
For genuine quality-preserving enlargement, use RepetiGo's AI Image Upscaler instead at /image-tools/ai-upscale-image. It sends your image to a trained AI model that predicts and adds realistic new detail, producing a noticeably sharper result than stretching pixels with this resize tool.

Resize Direction
Quality Result
Pixelation?
Recommended Tool
Downsizing - making smaller (e.g. 4000px → 400px)
Excellent - proportional reduction
✗ No - always sharp
This Resize Image tool
Same size - no dimension change
Identical - no change
✗ No
Not applicable
Upsizing via this tool's percentage slider (e.g. 400px → 1200px)
Degraded - pixels stretched, not invented
✓ Yes - visibly softer the larger you go
Not recommended above roughly 110-120%
Upsizing via the AI Image Upscaler
Good to excellent - AI adds detail
✗ Minimal
AI Image Upscaler → /image-tools/ai-upscale-image

★ Resizing for Instagram or Facebook? Downsizing a large photo to 1080×1080 or 1200×630 always looks sharp - no quality concern. Trying to make a small 200×200 photo fit a YouTube banner (2560×1440)? That will look soft with this resizer - use the AI Image Upscaler first, then resize.

H2: Who Uses RepetiGo's Free Image Resizer?

User
What They Resize
Most Used Feature
Students
Passport-style photos for exam applications and college admissions, resized to the correct pixel dimensions before converting to JPG.
Manual pixel entry with Lock Aspect Ratio for ID-style photos.
Job Seekers
Resume profile photos and LinkedIn profile photos to exact portal dimensions.
LinkedIn Post preset, and pixel-exact entry for other application portals.
Social Media Creators
Profile photos, thumbnails, and post images resized to exact platform specifications.
The five one-click social presets - Instagram, Facebook, LinkedIn, YouTube.
Government Form Applicants
Aadhaar, Voter ID, PAN, and passport application photos resized toward the portal's stated dimensions.
Manual entry with Lock Aspect Ratio, then Convert to JPG, then Compress.
Print Shop Owners
Resizing a customer's photo to print-ready dimensions before printing, one photo at a time.
Exact pixel entry for standard print sizes.
Developers & Designers
Resizing images for web use, app UI, or banner ads to an exact spec.
Pixel-exact entry, percentage resize, and WebP/PNG output.

H2: Why Use RepetiGo's Image Resizer?

Feature
RepetiGo
Adobe Express
Canva
iloveimg
Free to use
✓ Always free
✓ Free tier (limited)
✓ Free tier (limited)
✓ Limited free
Sign-up required
✓ Never
✗ Account required
✗ Account required
~ Optional
Social media presets
✓ 5 one-click presets
✓ Many platforms
✓ Many platforms
✓ Some
Exact pixel dimensions
✓ Width + Height input
✓ Yes
✓ Yes
✓ Yes
Aspect ratio lock
✓ Yes
✓ Yes
✓ Yes
~ Limited
Files ever leave your device?
✗ Never - 100% browser-based
✓ Yes - uploaded to their servers
✓ Yes - uploaded to their servers
✓ Yes - uploaded to their servers
Works without account
✓ Yes
✗ No
✗ No
~ Optional

H2: Your Images Are Safe. Always.

Protection Layer
What It Means in Practice
🖥️ 100% Browser-Based Resizing
Your image is resized using your own device's processing power via the browser's Canvas API. It is never uploaded to any server.
🚫 Nothing Ever Leaves Your Device
Because resizing happens locally, there is no upload, no transfer, and nothing on any server for us to store or delete.
👁️ No Image Content Is Read
RepetiGo's code cannot see, analyse, or extract what's in your photo - it only reads pixel dimensions and re-encodes the image on your own device.
🚫 No Account = No Data Profile
No sign-up means no personal data, no file history, and no usage profile is ever created.
🔒 Well Suited to Aadhaar, PAN, and ID Photos
Because nothing is transmitted anywhere, this is one of the safer ways to resize an identity document photo online.

[ Read Our Privacy Policy → /privacy-policy ]

H2: Image Resizing for Print Shops - The Automated Way.
Print shop owners regularly need to resize customer photos before printing - a WhatsApp photo may be 1080×1080, but the print order is for a 4R (4×6 inch at 300 DPI = 1200×1800 pixels) photo. Resizing manually for every customer adds minutes to every job.
PrintPilot - RepetiGo's print shop software - can fold correct-dimension resizing into the same automated workflow customers already use to upload documents via QR code, instead of a shop owner resizing every photo by hand before it reaches the print queue.

[ Learn About PrintPilot → /products/printpilot/ ]
[ Try PrintPilot Free → repetigo.com/pricing/ ]
[ Or Resize an Image Now → repetigo.com/tools/image/resize-image/ ]

H2: Common Questions About Resizing Images Online Free.
H3: Q1: How do I resize an image online for free in India?
Go to repetigo.com/tools/image/resize-image/, upload your JPG, PNG, or WEBP image, then enter your target dimensions in pixels, choose a percentage, or select one of the five built-in social media presets. Click Resize and download. No account is required, no software is needed, and there is no daily limit. Since the tool runs entirely in your browser, your image is never uploaded anywhere.
H3: Q2: How do I resize a photo for an Indian government form or passport?
This tool doesn't have a one-click "Indian Passport" preset - enter the dimensions manually. For the current Passport Seva format, that's commonly cited as 630×810 pixels (35×45mm) with the file under 250 KB in JPEG. Enter those pixel values with Lock Aspect Ratio on, resize, then use Convert to JPG at /image-tools/convert-to-jpg (since this tool outputs WebP or PNG, not JPG), and finally Compress Image at /image-tools/compress-image if the file is still over the portal's KB limit. Government photo specs do change from time to time, so confirm the exact figure on the form you're submitting.
H3: Q3: How do I resize an image without cropping or distorting it?
Enable Lock Aspect Ratio before entering your target dimensions. With it on, entering the width automatically calculates the correct height (and vice versa) to maintain the original proportions, and the entire image is scaled with nothing cut off. If you turn Lock Aspect Ratio off and enter a width and height with a different ratio than the original, the image is stretched to fit exactly - this tool doesn't have a white-border or padding option, so keep the lock on unless you intentionally want a stretched result.
H3: Q4: What is the difference between resize, crop, and compress?
Resize changes the pixel dimensions of the entire image, scaling it up or down. Crop removes the edges, keeping only the selected central area. Compress reduces file size in KB while keeping the same pixel dimensions. They are three separate operations, each with its own RepetiGo tool: Resize Image (this page), Crop Image at /image-tools/crop-image, and Compress Image at /image-tools/compress-image.
H3: Q5: Can I resize an image to a specific KB size like 20KB or 100KB?
This tool has an optional Target File Size (KB) field in Export Settings - set it, and if your output format is WebP, the tool automatically steps down the quality until the file fits your target, where possible. This option isn't available for PNG output, since PNG has no quality setting to adjust. If you need a precise KB target on a JPG specifically, resize here first, then fine-tune with the Compress Image tool at /image-tools/compress-image.
H3: Q6: How do I resize an image in Canva?
In Canva: open your design, go to File → Resize (the Magic Resize feature), enter your target dimensions, and click Resize. Canva's free tier limits resizing to the current design's dimensions, and Magic Resize for standalone images requires a Canva Pro subscription. For resizing a standalone image file (JPG, PNG, WEBP) without a Canva subscription, RepetiGo's resize tool is simpler - upload the file, enter dimensions, download. No account required, no subscription needed.
H3: Q7: How do I resize an image on iPhone?
The built-in Photos app lets you crop (Edit → Crop icon) but doesn't resize to exact pixel dimensions. For exact pixel dimensions on iPhone, open Safari, go to repetigo.com/tools/image/resize-image/, upload the photo from your Camera Roll, enter your target dimensions, and download - the file saves to your Files app or Photos. This is useful for resizing before uploading directly to a government portal from your phone.
H3: Q8: How do I resize an image in Photoshop or GIMP?
In Photoshop: go to Image → Image Size, enter your target width and height, ensure Constrain Proportions is checked, choose Bicubic (for downsizing) or Bicubic Smoother (for upsizing) from the Resample dropdown, and click OK. In GIMP (free, open-source): go to Image → Scale Image, enter target width and height, set interpolation to Cubic or Sinc for best quality, click Scale Image, then File → Export As to save. For quick resizing without installing software, RepetiGo's browser-based tool does the same core operation with no installation required.
H3: Q9: Can I resize multiple images at once?
Not on this tool - it processes one image at a time: upload, resize, download, then start over for the next one. If you regularly need to resize many customer photos in a print shop setting, PrintPilot's automated workflow (linked above) handles that at scale; for occasional multi-image needs on this page, repeat the upload-resize-download cycle for each file.
H3: Q10: Is it safe to upload my photo or ID image to a free online resizer?
Yes - and more so than most alternatives, because there is no upload at all. RepetiGo's resize tool processes your image entirely inside your browser using your device's own processing power. The file never reaches any RepetiGo server, so there's nothing to intercept in transit and nothing for us to store, because we never receive the image in the first place.

H2: More Free Image Tools from RepetiGo.

Tool
What It Does
Link
Convert to JPG
Convert the WebP or PNG output from this tool into JPG for portal uploads
→ /image-tools/convert-to-jpg
Compress Image
Reduce file size to fit a portal's KB limit after resizing
→ /image-tools/compress-image
Crop Image
Remove edges and frame ID photos correctly - use before or after resizing
→ /image-tools/crop-image
AI Image Upscaler
AI-powered enlargement - for making small images larger without visible softness
→ /image-tools/ai-upscale-image
Remove Background
Clean plain background for ID or passport photos - combine with resize
→ /image-tools/background-remover
All Image Tools
Complete free image tools suite
→ /image-tools

[ Resize Image Free - No Sign-Up → repetigo.com/tools/image/resize-image/ ]
[ Explore All Image Tools → repetigo.com/tools/image/ ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

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
  if (lines[0] === "Operation" && lines[1] === "What It Does" && lines[2] === "When to Use") return { headers: ["Operation", "What It Does", "When to Use", "RepetiGo Tool"], rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Document / Form" && lines[1] === "Commonly Cited Size") return { headers: ["Document / Form", "Commonly Cited Size", "Pixels (approx.)", "Notes"], rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Platform" && lines[1] === "Image Type") return { headers: ["Platform", "Image Type", "Recommended Size", "Preset in Tool?"], rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Resize Direction" && lines[1] === "Quality Result") return { headers: ["Resize Direction", "Quality Result", "Pixelation?", "Recommended Tool"], rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "User" && lines[1] === "What They Resize") return { headers: ["User", "What They Resize", "Most Used Feature"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Feature" && lines[1] === "RepetiGo") return { headers: ["Feature", "RepetiGo", "Adobe Express", "Canva", "iloveimg"], rows: chunkRows(lines.slice(5), 5) };
  if (lines[0] === "Protection Layer" && lines[1] === "What It Means in Practice") return { headers: ["Protection Layer", "What It Means in Practice"], rows: chunkRows(lines.slice(2), 2) };
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
  const parts = text.split(/(repetigo\.com\/(?:tools\/image\/[a-z-]*|pricing)\/?|\/image-tools\/[a-z-]*\/?|\/image-tools\/?|\/products\/printpilot\/?|\/privacy-policy\/?|\/pricing\/?)/g);
  return parts.map((part, index) => {
    const href = mapSeoRoute(part.startsWith("repetigo.com") ? "https://" + part : part);
    if (!href) return part;
    return <a href={href} key={part + "-" + index}>{getRouteLabel(href)}</a>;
  });
}

function mapSeoRoute(route: string) {
  const cleanRoute = route.trim().replace(/^(https?:\/\/)?(www\.)?repetigo\.com/i, "").replace(/\/$/, "");
  const routeMap: Record<string, string> = {
    "/tools/image": "/image-tools",
    "/tools/image/resize-image": "/image-tools/resize-image",
    "/tools/image/crop-image": "/image-tools/crop-image",
    "/tools/image/compress-image": "/image-tools/compress-image",
    "/tools/image/upscale-image": "/image-tools/ai-upscale-image",
    "/tools/image/ai-upscale-image": "/image-tools/ai-upscale-image",
    "/tools/image/background-remover": "/image-tools/background-remover",
    "/tools/image/convert-to-jpg": "/image-tools/convert-to-jpg",
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
    "/image-tools/ai-upscale-image": "Open AI Image Upscaler",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/convert-to-jpg": "Open Convert to JPG",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Resize Image", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online image resizer - change pixel dimensions or use a social media preset. Runs entirely in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Resize an Image Online Free", step: [{ "@type": "HowToStep", name: "Upload Image", text: "Upload Your Image" }, { "@type": "HowToStep", name: "Choose Size", text: "Enter Your Target Size or Choose a Preset" }, { "@type": "HowToStep", name: "Download", text: "Download Your Resized Image" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: "https://www.repetigo.com/tools/image/" }, { "@type": "ListItem", position: 3, name: "Resize Image", item: pageUrl }] };

  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
