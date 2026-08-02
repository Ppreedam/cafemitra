import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  IdCard,
  Image,
  LayoutGrid,
  MessageCircle,
  Printer,
  Settings,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { DashboardShell } from "../DashboardShell";

type NavItem = {
  name: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type ImageTool = {
  category: "Optimize" | "Create" | "Modify" | "Convert" | "Security";
  name: string;
  description: string;
  badge: string;
  color: string;
  isNew?: boolean;
  href?: string;
};

const pageUrl = "https://repetigo.com/image-tools";

export const metadata: Metadata = {
  title: "Image Converter Online Free - Convert JPG PNG WebP SVG BMP ICO | RepetiGo",
  description:
    "Free image converter online - convert any image format: JPG, PNG, WebP, SVG, BMP, ICO, HEIC, TIFF, PDF. No sign-up, no watermark, batch convert. India portal-ready. Files auto-deleted 60 minutes.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Image Converter Online Free - JPG PNG WebP SVG BMP ICO PDF | RepetiGo",
    description: "Free online image converter. Convert any format: JPG, PNG, WebP, SVG, BMP, ICO, HEIC, TIFF. No sign-up, batch convert, India portal-ready. Auto-deleted 60 min.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Converter Online Free - RepetiGo",
    description: "Convert any image format free - JPG, PNG, WebP, SVG, BMP, ICO. No sign-up, batch convert.",
  },
  robots: { index: true, follow: true },
};

const navGroups: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", icon: Home, href: "/dashboard" }] },
  { label: "", items: [{ name: "Orders", icon: ClipboardList, href: "/orders" }] },
  {
    label: "Services",
    items: [
      { name: "PrintPilot", icon: Printer, href: "/auto-print" },
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools" },
      { name: "Image Tools", icon: Image, href: "/image-tools", active: true },
      { name: "WhatsApp Print", icon: MessageCircle },
      { name: "Passport Photo", icon: UserRound },
      { name: "ID Card Print", icon: IdCard },
      { name: "Admit Card Hub", icon: ClipboardList },
      { name: "Document Services", icon: FileText },
      { name: "All Services", icon: LayoutGrid },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Customers", icon: Users },
      { name: "Service Credits & Settlement", icon: Wallet },
      { name: "Pricing & Settings", icon: Settings, href: "/pricing-settings" },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileText },
    ],
  },
];

const imageTools: ImageTool[] = [
  { category: "Optimize", name: "Compress IMAGE", description: "Compress JPG, PNG, and WebP images while saving space and maintaining quality.", badge: "ZIP", color: "#83bd55", href: "/image-tools/compress-image" },
  { category: "Optimize", name: "Upscale", description: "Instantly enlarge images 2x or 4x, entirely in your browser.", badge: "UP", color: "#83bd55", isNew: true, href: "/image-tools/upscale-image" },
  { category: "Optimize", name: "AI Image Upscaler", description: "Enlarge blurry scans and old photos with real AI-added detail.", badge: "AI", color: "#83bd55", isNew: true, href: "/image-tools/ai-upscale-image" },
  { category: "Optimize", name: "Remove background", description: "Quickly remove image backgrounds and download a transparent PNG.", badge: "BG", color: "#83bd55", isNew: true, href: "/image-tools/background-remover" },
  { category: "Create", name: "Meme generator", description: "Create custom memes online with captions, meme images, or uploaded pictures.", badge: "MEME", color: "#b0649b", href: "/image-tools/meme-generator" },
  { category: "Create", name: "Photo editor", description: "Spice up pictures with text, effects, frames, or stickers using simple editing tools.", badge: "EDIT", color: "#b0649b", href: "/image-tools/photo-editor" },
  { category: "Modify", name: "Resize IMAGE", description: "Define dimensions by percent or pixel, and resize JPG, PNG, and WebP images.", badge: "SIZE", color: "#35b5df", href: "/image-tools/resize-image" },
  { category: "Modify", name: "Crop IMAGE", description: "Crop JPG, PNG, or WebP images with centered aspect-ratio controls.", badge: "CUT", color: "#35b5df", href: "/image-tools/crop-image" },
  { category: "Modify", name: "Rotate IMAGE", description: "Rotate to any angle, flip, and batch-process JPG, PNG, or WebP images.", badge: "ROT", color: "#35b5df", href: "/image-tools/rotate-image" },
  { category: "Convert", name: "Convert to JPG", description: "Convert PNG, WebP, GIF, BMP, SVG, or HEIC into JPG - one tool, every format.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "Convert from JPG", description: "Turn JPG images into PNG or WebP files.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-from-jpg" },
  { category: "Convert", name: "HTML to IMAGE", description: "Render readable HTML file content into a PNG image.", badge: "HTML", color: "#efc91e", href: "/image-tools/html-to-image" },
  { category: "Convert", name: "Website to Image", description: "Capture a complete public webpage as one full-page PNG or JPG image.", badge: "WEB", color: "#efc91e", href: "/image-tools/website-to-image" },
  { category: "Convert", name: "Image Converter", description: "Convert images into JPG, PNG, WebP, SVG, BMP, ICO, or PDF.", badge: "IMG", color: "#efc91e", href: "/image-tools/image-converter" },
  { category: "Convert", name: "HEIC to JPG", description: "Convert iPhone HEIC photos into widely supported JPG files - single or batch.", badge: "HEIC", color: "#efc91e", href: "/image-tools/heic-to-jpg" },
  { category: "Convert", name: "SVG Converter", description: "Convert SVG artwork into PNG or JPG at any size.", badge: "SVG", color: "#efc91e", href: "/image-tools/svg-converter" },
  { category: "Convert", name: "WebP to PNG", description: "Convert WebP images into lossless PNG files - transparency preserved.", badge: "PNG", color: "#efc91e", href: "/image-tools/webp-to-png" },
  { category: "Convert", name: "PNG Converter", description: "Convert PNG into JPG, WebP, GIF, BMP, ICO, or PDF - one tool, every format.", badge: "PNG", color: "#efc91e", href: "/image-tools/png-converter" },
  { category: "Convert", name: "WebP to JPG", description: "Convert WebP images into compatible JPG files - single or batch.", badge: "JPG", color: "#efc91e", href: "/image-tools/webp-to-jpg" },
  { category: "Convert", name: "JPG to WebP", description: "Convert JPG images into smaller WebP files for faster websites.", badge: "WEBP", color: "#efc91e", href: "/image-tools/jpg-to-webp" },
  { category: "Convert", name: "JPG Converter", description: "Convert JPG into PNG, WebP, GIF, BMP, ICO, PDF, or SVG - one tool, every format.", badge: "JPG", color: "#efc91e", href: "/image-tools/jpg-converter" },
  { category: "Convert", name: "PNG to JPG", description: "Convert transparent or lossless PNG files into JPG.", badge: "JPG", color: "#efc91e", href: "/image-tools/png-to-jpg" },
  { category: "Convert", name: "GIF Converter", description: "Convert GIF into JPG, PNG, WebP, BMP, ICO, PDF, or SVG - one tool, every format.", badge: "GIF", color: "#efc91e", href: "/image-tools/gif-converter" },
  { category: "Convert", name: "PNG to SVG", description: "Vectorize PNG logos and icons into scalable SVG files.", badge: "SVG", color: "#efc91e", href: "/image-tools/png-to-svg" },
  { category: "Security", name: "Watermark IMAGE", description: "Stamp an image or text over your images with typography, transparency, and position.", badge: "WM", color: "#4e82bd", href: "/image-tools/watermark-image" },
  { category: "Security", name: "Blur face", description: "Blur faces, license plates, and private objects in photos.", badge: "BLUR", color: "#4e82bd", isNew: true, href: "/image-tools/blur-face" },
];

export default function ImageToolsPage() {
  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard image-tools-page">
          <JsonLd />
          <article className="tool-seo-content compress-pdf-seo" id="image-tools-guide">
            <StructuredSeoCopy content={seoContent} />
          </article>

          <div className="dashboard-hero pdf-tools-hero">
            <div>
              <span className="auto-print-kicker">PrintPilot Image Tools</span>
              <h2>Image Tools</h2>
              <p>Compress, resize, crop, convert, remove backgrounds, add watermarks, and blur images from one place.</p>
            </div>
            <span className="status-pill">{imageTools.length} Tools Ready</span>
          </div>

          <section className="pdf-tool-grid" aria-label="Image tools">
            {imageTools.map((tool) => (
              <Link className="pdf-tool-card" href={tool.href || "/image-tools"} key={tool.name}>
                {tool.isNew ? <span className="new-ribbon">New!</span> : null}
                <span className="pdf-tool-icon" style={{ "--tool-color": tool.color } as React.CSSProperties}>
                  <Image size={22} />
                  <small>{tool.badge}</small>
                </span>
                <h2>{tool.name}</h2>
                <p>{tool.description}</p>
              </Link>
            ))}
          </section>
      </div>
    </DashboardShell>
  );
}

const seoContent = String.raw`H1: Image Converter Online Free. Convert Any Image Format - JPG, PNG, WebP, SVG, BMP, ICO, or PDF. No Sign-Up.
RepetiGo's free image converter lets you convert any image file from one format to another - JPG, PNG, WebP, SVG, BMP, ICO, HEIC, TIFF, GIF, or PDF - without downloading software, creating an account, or receiving a watermark on the result. Upload your image, choose the output format, convert, and download. Your files are permanently deleted from our servers within 60 minutes.

The converter handles the most common image format conversion needs in a single tool: iPhone HEIC photos to JPG for portal uploads, PNG logos to SVG for scalable printing, WebP browser downloads to JPG for compatibility, and any-to-any format conversion for designers, developers, print shops, and students. For high-volume conversion of specific format pairs, dedicated converters are linked at the bottom of this page.

✓ 10+ Formats Supported   ✓ Any-to-Any Conversion   ✓ Batch Convert   ✓ No Sign-Up   ✓ No Watermark   ✓ Auto-Deleted 60 Min

[ Convert Your Image Free - No Sign-Up → /image-tools/image-converter ]

H2: All Image Formats in One Converter - What Can You Convert?
RepetiGo's image converter supports 10+ image formats as both input and output. The table below shows all supported conversion directions and links to dedicated converters for the most common format pairs:

From Format
To Format
Use This For
Dedicated Tool
JPG / JPEG
PNG, WebP, SVG, BMP, ICO, TIFF, PDF
Sharing, web, conversion to any format
→ /image-tools/jpg-converter
PNG
JPG, WebP, SVG, BMP, ICO, PDF
Logos, icons, transparent images to any format
→ /image-tools/png-to-svg
WebP
JPG, PNG, BMP, TIFF, PDF
Chrome downloads, web images needing compatibility
→ /image-tools/webp-to-jpg
HEIC
JPG, PNG, WebP, TIFF, PDF
iPhone photos for Windows, portals, print shops
→ /image-tools/heic-to-jpg
SVG
PNG, JPG, WebP
Vector logos to raster for email, portals, apps
→ /image-tools/image-converter
BMP
JPG, PNG, WebP, TIFF
Legacy Windows format to modern formats
→ /image-tools/image-converter
TIFF
JPG, PNG, WebP, PDF
Professional scan/print files to sharing formats
→ /image-tools/image-converter
ICO
PNG, JPG
Favicon files to editable format
→ /image-tools/image-converter
GIF
JPG, PNG, WebP
Animated or static GIF to still image
→ /image-tools/gif-converter
PDF (image)
JPG, PNG, TIFF
Extract image pages from PDF
→ /image-tools/image-converter
Any format
ICO (favicon)
Create favicons from any image
→ /image-tools/image-converter

All conversions preserve the original image quality at the output quality level you select. For conversions involving transparency (PNG, WebP, SVG, ICO), the alpha channel is preserved when converting to a format that supports it. Converting a transparent image to JPG will set the transparent areas to white.

H2: How to Convert an Image Online Free in 3 Steps.
H3: Step 1 - Upload Your Image
Click Upload or drag and drop your image file into the converter. Supported input formats: JPG, JPEG, PNG, WebP, SVG, BMP, ICO, HEIC, TIFF, GIF. The converter works in any browser (Chrome, Safari, Firefox, Edge) on any device including Android phone, iPhone, Windows PC, Mac, or Linux. For batch conversion, drag multiple image files at once.
H3: Step 2 - Choose Your Output Format
Select your output format from the dropdown. The available output formats depend on your input: most formats convert to JPG, PNG, WebP, PDF, TIFF, and BMP. SVG output (for PNG and similar inputs) requires AI bitmap tracing. For format-specific guidance on which output to choose, see the format guide table in the next section.
H3: Step 3 - Download Your Converted Image
Click Convert. Single files download immediately on completion. Batch conversions deliver a zip archive - click Download All, then extract. File names are preserved with the new extension (photo.heic → photo.jpg). All original uploads and converted outputs are permanently deleted from our servers within 60 minutes.

[ Convert Image Free Now → /image-tools/image-converter ]

H2: Which Image Format Should You Use? A Practical Guide.
The most common question after uploading an image is: which output format should I choose? The answer depends on what you intend to do with the converted image. Use this guide:

Your Use Case
Best Format
Why
Portal upload (Aadhaar, NTA, IRCTC, Passport)
JPG
Accepted by all Indian government portals. Maximum 50-200KB typically. Convert any format to JPG first.
Website images - photographs
WebP (first choice), JPG (fallback)
WebP is 25-35% smaller than JPG. Modern browsers support WebP. Use JPG for email and older systems.
Logo or icon on a website
SVG (first choice), PNG (fallback)
SVG scales infinitely for any screen size. PNG preserves transparency for fixed-size logos.
Transparent background (logo, icon, cutout)
PNG
PNG supports full alpha channel transparency. JPG destroys transparency (white box). WebP also supports it.
Printing - standard documents
JPG at 300 DPI
JPG at 300 DPI is universally accepted by print shops. PDF for multi-page documents.
Printing - professional/archival
TIFF
Lossless compression, maximum print quality. Accepted by professional print software.
iPhone photos to share on WhatsApp/Windows
JPG
Convert HEIC to JPG. JPG opens on all devices and software. WhatsApp accepts JPG universally.
Browser favicon
ICO
ICO format is required for browser favicons. Standard sizes: 16×16, 32×32, 48×48 pixels.
Email attachment
JPG or PNG
Keep file size small. JPG for photos, PNG for screenshots and graphics with text.
App icons (Android/iOS)
PNG (various sizes)
PNG with transparency for app icons. Generate multiple sizes from one high-res PNG.

💡 Not sure which format to choose? The safest default for most India use cases - portal uploads, WhatsApp sharing, printing, and email - is JPG. JPG opens on every device, is accepted by every Indian government portal, and produces compact file sizes. Choose PNG when transparency is needed, WebP when you're optimising for website loading speed.

H2: Image Converter Features - Beyond Basic Format Conversion.
RepetiGo's image converter includes additional processing options that go beyond simple format re-encoding:

H3: Black and White Image Conversion
Convert any colour image to greyscale in the same operation as format conversion. The black and white image converter option is available for all input formats and produces a greyscale output in your chosen format. Useful for: document scans that should be black and white for smaller file size, ID photos for specific portals that require black and white, artistic photography workflows, and reducing file size (greyscale images are smaller than colour at the same quality).
India use case: Aadhaar enrolment forms and some government applications require black and white passport photos. Convert HEIC to JPG with Black & White mode in one step.
H3: DPI and Resolution Conversion
Change the DPI (dots per inch) setting of your image without resizing the pixel dimensions. The image dpi converter option lets you set the target DPI in the output file metadata: 72 DPI for web display, 150 DPI for basic office printing, 300 DPI for standard professional print quality, 600 DPI for high-end print reproduction. Note: DPI is a metadata tag in the image file - it tells printing software how large to print the image, but it does not add pixels that were not in the original. If you need higher actual resolution (more pixels), use the AI Upscaler tool.
H3: HD and Image Enhancement
The standard converter delivers the output image at the same pixel dimensions and quality as the input. For upscaling low-resolution images - adding pixels to increase the actual resolution - use the AI Image Upscaler at /image-tools/ai-upscale-image which uses neural network upscaling (2x or 4x). The image converter's DPI setting adjusts the print metadata only - for true HD upscaling, the dedicated tool is required.
H3: Batch Image Conversion
Convert any number of images in a single operation. For batch image conversion: upload multiple files by dragging a folder selection or using Ctrl+Click (Windows) / Cmd+Click (Mac) in the file picker. Select your output format and any processing options - these are applied identically to all files. Click Convert All. All files process simultaneously. Click Download All to get a zip archive. File names are preserved with the new extension. No per-batch file count limit.

💡 Print shop batch workflow: receive a customer's USB drive with mixed image formats (JPG, PNG, HEIC, WebP). Upload all files → select JPG output at quality 90, 300 DPI → Convert All → Download ZIP → print from the unified JPG set. One operation converts an entire mixed-format job.

H2: ★ Indian Use Cases - Image Conversion in India.
H3: Portal Compliance - Aadhaar, NTA, IRCTC Photo Requirements
Indian government and examination portals have strict image format requirements that the default camera app on many phones doesn't produce. iPhone users get HEIC. Chrome browser downloads arrive as WebP. Older cameras produce TIFF. None of these are accepted by Indian portals, which universally require JPG.
The image converter solves this in one step: upload any format, select JPG output, set file size appropriately (quality 75-85 usually brings file within 10-50KB portal limits), download portal-ready JPG. For further file size reduction after conversion, use the /image-tools/compress-image tool. For background change to white (required for Aadhaar and NTA passport photos), use the /image-tools/background-remover tool after conversion.
Common portal requirements: Aadhaar Update Portal requires JPG under 50KB. NTA (NEET/JEE/CUET) requires JPG between 10-50KB. IRCTC photo upload requires JPG under 50KB. Passport application requires JPG under 200KB. Digilocker accepts JPG and PNG. Bank KYC typically accepts JPG and PNG under 200KB.
H3: Print Shops - Any Format to Print-Ready JPG
Print shops and cyber cafes across India receive customer files in every format imaginable - HEIC from iPhones, WebP from Chrome downloads, PNG from design files, BMP from legacy Windows software, TIFF from professional scanners, and GIF from old web assets. Every format needs to become a print-ready JPG before the job can proceed. The batch image converter handles the entire queue: upload all customer files regardless of format, convert the whole batch to JPG at 300 DPI in one operation, download the unified set, and proceed to print.
For print shops with automated customer upload workflows, PrintPilot - RepetiGo's automated print shop software - detects and converts any incoming image format to the required output format automatically, without manual intervention from the shop operator. Learn more at /auto-print.

[ Convert Images Free - No Sign-Up → /image-tools/image-converter ]
[ Try PrintPilot for Print Shops → /pricing ]

H2: Why Use RepetiGo's Image Converter?
Free, no sign-up, no watermark on output - these are the baseline. Beyond that: RepetiGo's converter handles every common image format in one place, processes batch jobs simultaneously rather than one at a time, includes DPI and colour mode options that most free converters don't offer, is optimised for India portal use cases, and auto-deletes your files within 60 minutes for privacy. For specific high-frequency conversion workflows (HEIC to JPG, WebP to JPG, PNG to SVG), dedicated tools with more advanced settings are available from the links at the bottom of this page.

H2: Your Files Are Safe. Always.
Every image uploaded to RepetiGo's converter is processed in an isolated temporary session with no account linkage. Files are transferred over HTTPS encryption. Converted outputs are never stored beyond 60 minutes. Image content is never analysed, indexed, or used to train AI models. No personal data is collected during conversions.

[ Read Our Privacy Policy → /privacy-policy ]

H2: Common Questions About Online Image Conversion.
H3: Q1: What Image Formats Does RepetiGo Support?
RepetiGo's image converter supports the following input formats: JPG/JPEG, PNG, WebP, SVG (raster output), BMP, ICO, HEIC/HEIF (iPhone format), TIFF/TIF, GIF, and image-containing PDF pages. Supported output formats: JPG, PNG, WebP, BMP, ICO (favicon), TIFF, PDF, and SVG (for PNG and simple-colour inputs via AI tracing). For conversions involving complex format pairs - such as PNG to SVG (which requires AI bitmap tracing) or HEIC to JPG (which is the most common iPhone photo conversion) - dedicated specialist tools provide more settings and are linked at the bottom of this page.
H3: Q2: How Do I Convert an Image for a Government Portal in India?
Step 1: upload your image (HEIC from iPhone, WebP from Chrome, PNG, BMP - any format). Step 2: select JPG as the output format. Step 3: set quality to 75-85 (this typically produces a file under 50KB which most Indian portals accept). Step 4: download the JPG. Step 5: check the file size - if it's still over the portal's limit, use the /image-tools/compress-image tool to reduce it further. For photos requiring a white background (Aadhaar, NTA, passport), after converting to JPG, use the /image-tools/background-remover tool to set the background to white.
H3: Q3: What Is the Best Format for Each Use Case?
Short guide: Portal uploads (Aadhaar, NTA, IRCTC, Passport) → JPG. WhatsApp sharing → JPG (opens on all Android/iPhone/Windows). Website photos → WebP (smallest files for browsers). Website logos and icons → SVG (scalable) or PNG (with transparency). App icons → PNG. Browser favicon → ICO. Standard printing → JPG at 300 DPI. Professional/archival printing → TIFF (lossless). Transparent images for design work → PNG. iPhone camera photos for sharing → convert HEIC to JPG. See the format guide table above for more detail.
H3: Q4: Can I Convert Multiple Images at Once?
Yes. Upload multiple image files at once by dragging a folder selection or using Ctrl+Click (Windows) / Cmd+Click (Mac) in the upload dialog. All selected files upload simultaneously. After uploading, select your output format and any processing options (quality, DPI, colour mode) - these are applied to all files in the batch. Click Convert All. All files process simultaneously regardless of count. Click Download All to get a zip archive of converted files. There is no per-batch file count limit. File names are preserved with the new extension. This batch image conversion feature is particularly useful for print shop operators converting mixed-format customer jobs to a unified JPG set.

H2: Dedicated Image Converters - Specific Format Pairs.
For the most common format conversion workflows, RepetiGo offers dedicated tools with more advanced settings, higher batch limits, and format-specific guidance:
WebP to JPG → /image-tools/webp-to-jpg - Convert Chrome browser downloads and website WebP images to JPG for printing, portals, and universal compatibility. Batch convert entire libraries.
HEIC to JPG → /image-tools/heic-to-jpg - Convert iPhone photos from HEIC to JPG for Windows, Android, print shops, and government portals.
WebP to PNG → /image-tools/webp-to-png - Convert WebP to PNG with full transparency preservation. For logos, icons, and design assets.
PNG to SVG → /image-tools/png-to-svg - Convert PNG logos to scalable SVG using AI bitmap tracing with colour accuracy. For print, Cricut, and design workflows.
JPG to WebP → /image-tools/jpg-to-webp - Convert JPG images to WebP for website performance optimisation. Reduces file size 25-35%.
PNG to JPG → /image-tools/png-to-jpg - Convert PNG to JPG for smaller file sizes and universal compatibility.
AI Image Upscaler → /image-tools/ai-upscale-image - Enlarge blurry scans and old photos with real AI-added detail, 2x or 4x.
Compress Image → /image-tools/compress-image - Compress JPG, PNG, and WebP images while saving space and maintaining quality.
Remove Background → /image-tools/background-remover - Quickly remove image backgrounds and download a transparent PNG.
All Image Tools → /image-tools - Full suite of free image tools including compression, resizing, background removal, AI upscaling, watermarking, and more.

[ Convert Any Image Free - No Sign-Up → /image-tools/image-converter ]
[ Explore All Image Tools → /image-tools ]`;

const faqSchemaQuestions = Array.from(seoContent.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

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
  if (lines[0] === "Category" && lines[1] === "Tools Included") return { headers: ["Category", "Tools Included", "Common Use"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Who Uses It" && lines[1] === "Common Need") return { headers: ["Who Uses It", "Common Need", "Tool They Use"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Feature" && lines[1] === "RepetiGo") return { headers: ["Feature", "RepetiGo", "iLoveIMG", "Canva", "Photoshop Express"], rows: chunkRows(lines.slice(5), 5) };
  if (lines[0] === "Protection Layer" && lines[1] === "What It Means in Practice") return { headers: ["Protection Layer", "What It Means in Practice"], rows: chunkRows(lines.slice(2), 2) };
  if (lines[0] === "Tool" && lines[1] === "What It Does" && lines[2] === "Link") return { headers: ["Tool", "What It Does", "Link"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "From Format" && lines[1] === "To Format") return { headers: ["From Format", "To Format", "Use This For", "Dedicated Tool"], rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Your Use Case" && lines[1] === "Best Format") return { headers: ["Your Use Case", "Best Format", "Why"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={mappedHref || "#image-tools-guide"}>{label}{mappedHref ? <span>{"→"}</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:image-tools\/[a-z-]*|pdf-tools\/[a-z-]*|auto-print|pricing)\/?|\/image-tools\/[a-z-]*\/?|\/image-tools\/?|\/pdf-tools\/[a-z-]*\/?|\/pdf-tools\/?|\/auto-print\/?|\/privacy-policy\/?|\/pricing\/?)/g);
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
    "/image-tools/heic-to-jpg": "/image-tools/heic-to-jpg",
    "/image-tools/background-remover": "/image-tools/background-remover",
    "/image-tools/convert-to-jpg": "/image-tools/convert-to-jpg",
    "/image-tools/image-converter": "/image-tools/image-converter",
    "/image-tools/jpg-converter": "/image-tools/jpg-converter",
    "/image-tools/gif-converter": "/image-tools/gif-converter",
    "/image-tools/png-to-svg": "/image-tools/png-to-svg",
    "/image-tools/webp-to-jpg": "/image-tools/webp-to-jpg",
    "/image-tools/webp-to-png": "/image-tools/webp-to-png",
    "/image-tools/jpg-to-webp": "/image-tools/jpg-to-webp",
    "/image-tools/png-to-jpg": "/image-tools/png-to-jpg",
    "/image-tools/ai-upscale-image": "/image-tools/ai-upscale-image",
    "/pdf-tools": "/pdf-tools",
    "/auto-print": "/auto-print",
    "/privacy-policy": "/privacy-policy",
    "/pricing": "/pricing",
  };
  return routeMap[cleanRoute] || (cleanRoute.startsWith("/image-tools") || cleanRoute.startsWith("/pdf-tools") ? cleanRoute : "");
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/image-tools": "Explore All Image Tools",
    "/image-tools/compress-image": "Open Compress Image",
    "/image-tools/heic-to-jpg": "Open HEIC to JPG",
    "/image-tools/background-remover": "Open Remove Background",
    "/image-tools/convert-to-jpg": "Open Convert to JPG",
    "/image-tools/image-converter": "Open Image Converter",
    "/image-tools/jpg-converter": "Open JPG Converter",
    "/image-tools/gif-converter": "Open GIF Converter",
    "/image-tools/png-to-svg": "Open PNG to SVG",
    "/image-tools/webp-to-jpg": "Open WebP to JPG",
    "/image-tools/webp-to-png": "Open WebP to PNG",
    "/image-tools/jpg-to-webp": "Open JPG to WebP",
    "/image-tools/png-to-jpg": "Open PNG to JPG",
    "/image-tools/ai-upscale-image": "Open AI Image Upscaler",
    "/pdf-tools": "Explore All PDF Tools",
    "/auto-print": "Explore PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Image Converter", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online image converter - convert any image format: JPG, PNG, WebP, SVG, BMP, ICO, HEIC, TIFF, PDF. No sign-up, no watermark, batch convert.", url: pageUrl };
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", name: "RepetiGo Image Tools", itemListElement: imageTools.map((tool, index) => ({ "@type": "ListItem", position: index + 1, name: tool.name, url: `https://repetigo.com${tool.href || "/image-tools"}` })) };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Convert an Image Online Free in 3 Steps",
    step: [
      { "@type": "HowToStep", position: 1, name: "Upload Your Image", text: "Click Upload or drag and drop your image file into the converter. Supported input formats: JPG, JPEG, PNG, WebP, SVG, BMP, ICO, HEIC, TIFF, GIF." },
      { "@type": "HowToStep", position: 2, name: "Choose Your Output Format", text: "Select your output format from the dropdown - JPG, PNG, WebP, PDF, TIFF, BMP, or SVG depending on your input." },
      { "@type": "HowToStep", position: 3, name: "Download Your Converted Image", text: "Click Convert. Single files download immediately; batch conversions deliver a zip archive. Files are auto-deleted within 60 minutes." },
    ],
  };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "Image Tools", item: pageUrl }] };

  return <>{[softwareApplication, itemList, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
