import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "../../DashboardShell";
import PdfEditTool from "../PdfEditTool";

const pageUrl = "https://repetigo.com/tools/pdf/crop-pdf/";

export const metadata: Metadata = {
  title: "Crop PDF Free Online - Trim Margins and Resize Pages | RepetiGo",
  description: "Crop PDF pages online for free, remove white space and scanner borders, resize pages, and download a permanently trimmed PDF without Adobe Acrobat.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Crop PDF Free Online - Trim Margins and Resize Pages | RepetiGo",
    description: "Remove unwanted PDF margins, scanner borders, and white space in your browser. No sign-up and files auto-deleted in 60 minutes.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Crop PDF Free Online | RepetiGo",
    description: "Trim PDF margins, remove white space, and resize pages without Adobe Acrobat.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Crop PDF Free Online. Trim Margins, Remove White Space, Resize Pages.
A scanned document with wide grey borders. A presentation with excessive white margins. A report where the page is A4 but the content fits on A5. These are the problems RepetiGo's free PDF cropping tool solves in seconds - upload your PDF, set the crop area, and download a cleanly trimmed document.
No Adobe Acrobat. No software install. Works on Mac, Windows, and iPhone. Files auto-deleted in 60 minutes.
✓ Trim all margins equally  ✓ Custom crop by dragging  ✓ Crop to specific dimensions  ✓ Apply to all pages at once  ✓ No sign-up

➜  [ Crop PDF Now - Free, No Sign-Up → repetigo.com/tools/pdf/crop-pdf/ ]

H2: What Does Cropping a PDF Actually Do?
When you crop a PDF, you trim the visible page area - removing content or whitespace from the edges of the page and reducing the page dimensions to whatever you select as your new boundary. The result is a PDF with smaller page dimensions where the unwanted edge content is removed.
Cropping a PDF is not the same as:
•  Editing text inside the PDF - that is /tools/pdf/edit-pdf/
•  Removing specific pages - that is /tools/pdf/organize-pdf/
•  Extracting an image from inside the PDF - that is a separate extraction tool
•  Removing printer's crop marks - those are trim marks used in commercial print design, an unrelated feature
The primary use cases for cropping a PDF are:
•  Removing scanner border noise: Flatbed scanners often add a dark grey or black border around the scanned image. Cropping removes this, leaving only the document content.
•  Trimming excessive white margins: Documents exported from Word, PowerPoint, or InDesign sometimes have far more white margin than needed. Cropping tightens the page to the content area.
•  Resizing a page to a standard format: A document with irregular page dimensions can be cropped to A4, A5, Letter, or any custom size.
•  Removing headers/footers before reuse: Cropping from the top or bottom removes unwanted headers, date stamps, or page footers added by software.
💡  Cropping permanently removes the cropped edge from the PDF file - the trimmed content is gone from the file, not just hidden. This reduces file size slightly. It is different from macOS Preview's crop tool, which only masks the area without removing it from the file. See the Mac section below.

H2: When Do You Need to Crop a PDF?
Here are the most common real-world situations where cropping is the right tool:
•  Thesis or research paper submission: University portals often require specific page dimensions. A scanned reference document or a PDF exported with incorrect margins needs cropping before upload.
•  Scan cleanup: A document scanned on a flatbed or MFP printer typically has a 10-15mm dark border on all sides from the glass edges. One crop removes all of it across every page.
•  Presentation PDF trimming: A 16:9 slide deck exported to PDF on an A4 page has massive white top and bottom margins. Cropping gives each slide its natural widescreen proportions.
•  Before printing: Removing white margins before printing reduces paper waste and makes the document fit better on the intended paper size. Print shops often need a properly cropped PDF to run a bleed-free job.
•  Page size standardisation: A collection of documents with mixed page sizes (some A4, some Letter, some A5) can each be individually cropped to a consistent dimension before merging into a single PDF.

H2: How to Crop a PDF in 3 Steps.
The complete crop workflow - from upload to download - takes under a minute.

H3: Step 1 - Upload Your PDF
Click Upload or drag your PDF into the cropping tool. Any PDF works - scanned documents, exported presentations, text-based reports. Multi-page PDFs are supported: you can crop all pages simultaneously in a single pass. Upload travels over an encrypted TLS connection. No account required.
H3: Step 2 - Set Your Crop Area
Choose how you want to define the crop:
•  Drag the crop handles: Click and drag from the edges or corners of the page preview to define your new page boundary. Visual and immediate - what you see is exactly what you get.
•  Enter margin values: Type the number of millimetres to remove from each side - top, bottom, left, and right. Useful when you need precision (e.g., remove exactly 15mm from all sides to eliminate scanner borders).
•  Enter target dimensions: Type the exact output width and height in mm. The tool calculates the crop automatically to reach your target page size from the current page size.
•  Apply to all pages: Toggle 'apply to all pages' to apply the same crop uniformly across every page in the PDF. Essential for multi-page documents.
H3: Step 3 - Download Your Cropped PDF
Click Download. Your cropped PDF saves to your device - same document, now with reduced page dimensions and trimmed edges. The file is permanently deleted from our servers within 60 minutes. Open the downloaded PDF in any reader and the crop is baked in: there is no 'uncrop' in the file.
📱  The PDF crop tool works on mobile browsers - Safari on iPhone, Chrome on Android - without any app download. Upload a scanned PDF from your Files app, set the crop margins, and download. Useful for trimming scanner borders when no desktop is available.

➜  [ Crop Your PDF Now - Free → repetigo.com/tools/pdf/crop-pdf/ ]

H2: What Crop Options Are Available?
Different documents need different cropping approaches. RepetiGo supports all of them:

H3: Crop All Pages at Once
For multi-page documents, the most common need is applying the same crop to every page simultaneously - particularly for scanned documents where every page has the same scanner border. The 'apply to all pages' setting does this in one pass. The same margin values or the same crop selection is applied to every page before download, so you don't have to set each page individually.
H3: Custom Crop by Dragging or Entering Measurements
For precise control, enter exact measurements for each side independently:
•  Crop all sides equally: e.g., remove 10mm from all four sides - useful for removing uniform scanner borders
•  Crop one side only: e.g., remove 30mm from the bottom to eliminate a footer - leave other sides unchanged
•  Crop to a target page size: e.g., crop to A4 (210×297mm) or Letter (215.9×279.4mm) from a larger page size
•  Asymmetric crop: Remove different amounts from each side - e.g., left-heavy scanner bias, or a document with binding gutters on one side
💡  After cropping, if you want to further reduce file size, run the cropped PDF through RepetiGo's Compress PDF tool. Cropping reduces page dimensions but doesn't always significantly reduce file size on its own - compression does.

H2: How to Crop a PDF on Mac Free.
Mac users have two options for cropping a PDF: the built-in macOS Preview app, and RepetiGo in a browser. They work very differently - and for most purposes, only one of them actually permanently crops the file.
H3: A Note About macOS Preview's Crop Tool
macOS Preview has a crop function (Tools → Rectangular Selection, then Tools → Crop). However, Preview's crop does not actually remove the cropped content from the PDF file - it adds a 'CropBox' instruction that tells PDF readers to display only the selected area. The content outside the crop boundary is still present in the file.
This means:
•  The file size does not reduce - the original page data is still there
•  Any PDF reader that ignores CropBox (including some printers and print RIPs) will display the full uncropped page
•  If you open the file in Acrobat or another editor, you can 'uncrop' it and recover the hidden content
•  For a permanently cropped PDF where the trimmed margins are truly gone, use a tool that renders and re-outputs the page - like RepetiGo
✅  To permanently crop a PDF on Mac - where the white margins are truly removed from the file and the page dimensions physically change - use RepetiGo in Safari or Chrome. Open the browser, go to repetigo.com/tools/pdf/crop-pdf/, upload your PDF, set the crop, and download. The result is a permanently and cleanly trimmed PDF.
Steps to crop a PDF on Mac with RepetiGo:
1.  Open Safari or Chrome on your Mac
2.  Go to repetigo.com/tools/pdf/crop-pdf/ and upload your PDF from Finder
3.  Drag the crop handles or enter margin values in millimetres
4.  Toggle 'apply to all pages' if the document has multiple pages
5.  Click Download - the cropped PDF saves to your Mac, permanently trimmed

H2: Crop PDF Without Adobe Acrobat.
Adobe Acrobat Pro has a PDF cropping tool (Edit → Crop Pages) that permanently crops the PDF. But Acrobat Pro requires a paid subscription. RepetiGo provides permanent PDF cropping free, in any browser, without a licence.
The difference between the two approaches:
•  RepetiGo: free, browser-based, no install, permanent crop, auto-deletes your file in 60 minutes, works on Mac/Windows/Linux/phone
•  Adobe Acrobat Pro: paid subscription, desktop app, permanent crop, full-featured professional PDF editor
•  macOS Preview: free, built-in on Mac, non-permanent crop only (CropBox mask - see Mac section above)
•  LibreOffice Draw: free, requires download and install, can crop PDFs, no auto-delete consideration needed
✅  For a one-time or occasional crop task, RepetiGo gives you the same permanent result as Acrobat Pro without the subscription cost.

H2: Crop PDF for Free in India.
PDF cropping is a regular task in India's academic, professional, and print ecosystems:
•  Thesis and dissertation formatting: UGC and university guidelines specify page margins. A PDF exported with incorrect margins must be cropped to exact specifications before submission to INFLIBNET or the university portal.
•  Government document scans: Documents scanned at e-Seva, CSC centres, or office MFPs typically have 10-20mm scanner borders on all sides. These must be removed before submission to UIDAI, MCA, IT Department, or other portals that check for clean, properly formatted documents.
•  CA and audit documents: Scanned physical documents - balance sheets, partner agreements, MOUs - need their scan borders removed before being attached to ITR filings, GST submissions, or audit annexures.
•  Print shop pre-press: Before printing visiting cards, pamphlets, or brochures, print shop operators crop PDFs to remove white margins and ensure the print bleeds correctly to the paper edge.
•  Presentation trimming: College project presentations exported from PowerPoint to PDF on A4 paper have large top and bottom margins. Cropping tightens them to the slide's natural 16:9 or 4:3 ratio for cleaner sharing.
With RepetiGo you can crop a PDF free online in India - upload the document, set your margins, and download a clean trimmed PDF in seconds. No account required, and your file is deleted within 60 minutes.
⚠️  Under India's DPDP Act 2023, documents submitted for cropping may contain personal data from scanned government IDs or financial records. Always use a tool that auto-deletes your file after processing.

H2: Your PDF Is Safe. Always.
When you upload a PDF to crop, you may be trimming a scanned government document, a financial statement, or a confidential report. Here is exactly what happens:
•  🔒 Encrypted upload: Your file travels over TLS encryption. Cannot be intercepted.
•  🔐 Isolated processing: Your file is processed in a temporary session with no link to any account or identifier.
•  🗑️ Auto-deleted in 60 minutes: Your uploaded PDF and the cropped output are both permanently deleted within 60 minutes.
•  👁️ Content never read: The cropping engine adjusts page dimensions - it never reads, stores, or analyses the content of your document.
•  🚫 No account = no data profile: No sign-up means we hold zero personal data about you.
🔒  Files are deleted within 60 minutes whether you download the result or not. Your original file on your device is never affected.
Privacy Policy → /security/ | Auto-Delete → /features/auto-delete/

H2: Cropping PDFs for Print Shops.
Print shop operators crop PDFs constantly - removing scanner borders before reprinting customer documents, trimming presentation margins before binding, standardising page sizes before running a batch job. The standalone crop tool handles one file at a time. For shops processing dozens of documents daily, PrintPilot - RepetiGo's print shop automation platform - handles cropping, compression, orientation correction, and AI quality enhancement automatically as part of the print queue workflow.
🖨️  PrintPilot automatically processes every customer document - detecting and removing scanner borders, correcting orientation, applying AI quality enhancement, and delivering a print-ready PDF to the queue. What the standalone crop tool does manually, PrintPilot does for every job automatically.
Learn about PrintPilot → /products/printpilot/ | Bulk Printing → /use-cases/bulk-printing/

➜  [ Try PrintPilot Free → repetigo.com/pricing/ ]
[ Or Just Crop a PDF Now → repetigo.com/tools/pdf/crop-pdf/ ]

H2: Common Questions About Cropping PDFs Online Free.
H3: Q1: How do I crop a PDF for free?
Go to repetigo.com/tools/pdf/crop-pdf/, upload your PDF, set the crop margins or drag the crop handles on the page preview, and download. Free. No account. Files auto-deleted in 60 minutes.
H3: Q2: What does cropping a PDF actually do?
Cropping a PDF permanently reduces the page dimensions by trimming content from one or more edges. The cropped content (typically white margins, scanner borders, or unwanted headers/footers) is removed from the file entirely. The resulting PDF has smaller page dimensions, slightly smaller file size, and no way to 'uncrop' the removed edges. This is different from macOS Preview's crop, which only masks the edges without removing them.
H3: Q3: How do I remove white space or margins from a PDF?
Upload your PDF to RepetiGo's crop tool. Enter equal margin values on all sides (e.g., 15mm for each of top/bottom/left/right) or drag the crop handles inward until the white space is excluded from the selection. Apply to all pages and download. The result is a PDF where the white margins are permanently removed and the page dimensions are reduced accordingly.
H3: Q4: How do I crop a PDF on Mac?
Open RepetiGo in Safari or Chrome on your Mac, upload your PDF, set the crop area (drag or enter mm values), and download the cropped file. This produces a permanently cropped PDF. macOS Preview also has a crop tool - but it only masks the cropped area without removing it from the file, and the full page can be recovered by any PDF editor. For a truly permanent crop on Mac, use RepetiGo.
H3: Q5: Can I crop all pages of a PDF at the same time?
Yes. After uploading your multi-page PDF, enable the 'apply to all pages' option before downloading. The same crop settings (margin values or custom crop boundary) are applied uniformly to every page. This is the standard approach for scanned multi-page documents where every page has the same border to remove.
H3: Q6: Can I crop a PDF to a specific page size like A4 or Letter?
Yes. Enter your target dimensions (width × height in mm) in the dimension input fields. A4 is 210×297mm; Letter is 215.9×279.4mm; A5 is 148×210mm. The tool calculates the required crop from the current page size to reach your target size. Note: you can only crop to a size smaller than the current page - you cannot use the crop tool to add margins (that is a different operation).
H3: Q7: Does cropping a PDF reduce the file size?
Yes, modestly. Cropping permanently removes the cropped page edges, which slightly reduces the page content data in the file. The reduction in file size depends on how much content was in the cropped area - removing white margins reduces size less than removing scanner border noise. For significant file size reduction, use RepetiGo's Compress PDF tool after cropping.
H3: Q8: How is cropping different from removing pages?
Cropping adjusts the dimensions of each page - removing content from the edges of existing pages. Removing (or extracting) pages deletes entire pages from the document. If you have a 20-page document and want to cut out pages 5-10, use RepetiGo's Organize PDF tool. If you want to trim the white margin from all 20 pages, use the Crop PDF tool.
H3: Q9: Can I crop a scanned PDF to remove scanner borders?
Yes - this is one of the most common crop use cases. When a flatbed or MFP scanner creates a PDF, it typically adds a dark grey or black border on the edges from the scanner glass frame. Upload the scanned PDF, enter margin values that cover the border width (usually 10-20mm on each side), apply to all pages, and download. Every page's scanner border is removed in one step.
H3: Q10: Is there a way to crop a PDF without Adobe Acrobat?
Yes. RepetiGo's crop tool works entirely in the browser - no Adobe Acrobat licence required. Upload your PDF, set the crop margins or drag the selection, download the permanently cropped PDF. The result is equivalent to Acrobat Pro's crop function, without the subscription cost.

H2: More Free PDF Tools from RepetiGo.
•  Compress PDF → /tools/pdf/compress-pdf/ - reduce file size after cropping
•  Edit PDF → /tools/pdf/edit-pdf/ - edit text, fill forms, annotate pages
•  Add Watermark → /tools/pdf/add-watermark/ - stamp DRAFT or CONFIDENTIAL on pages
•  Add Page Numbers → /tools/pdf/add-page-numbers/ - number pages after cropping
•  Organize PDF → /tools/pdf/organize-pdf/ - reorder or remove pages
•  All PDF Tools → /tools/pdf/ - complete free PDF tools library

➜  [ Crop PDF Free Now → repetigo.com/tools/pdf/crop-pdf/ ]
No sign-up · Trim margins · All pages at once · Auto-deleted in 60 minutes`;

const routeMap: Record<string, string> = {
  "/tools/pdf": "/pdf-tools",
  "/tools/pdf/crop-pdf": "/pdf-tools/crop-pdf",
  "/tools/pdf/edit-pdf": "/pdf-tools/edit-pdf",
  "/tools/pdf/organize-pdf": "/pdf-tools/organize-pdf",
  "/tools/pdf/compress-pdf": "/pdf-tools/compress-pdf",
  "/tools/pdf/add-watermark": "/pdf-tools/watermark-pdf",
  "/tools/pdf/add-page-numbers": "/pdf-tools/page-numbers",
  "/products/printpilot": "/print-automation",
  "/use-cases/bulk-printing": "/print-automation",
  "/features/auto-delete": "/privacy-policy",
  "/security": "/privacy-policy",
  "/pricing": "/pricing",
};

const routeLabels: Record<string, string> = {
  "/pdf-tools": "Explore All PDF Tools",
  "/pdf-tools/crop-pdf": "Open Crop PDF",
  "/pdf-tools/edit-pdf": "Open Edit PDF",
  "/pdf-tools/organize-pdf": "Open Organize PDF",
  "/pdf-tools/compress-pdf": "Open Compress PDF",
  "/pdf-tools/watermark-pdf": "Open Add Watermark",
  "/pdf-tools/page-numbers": "Open Add Page Numbers",
  "/print-automation": "Learn About PrintPilot",
  "/privacy-policy": "Read Privacy Policy",
  "/pricing": "Start Free Trial",
};

function mapRoute(value: string) {
  const clean = value.trim().replace(/[.,;!?)]$/, "").replace(/^(?:https?:\/\/)?(?:www\.)?repetigo\.com/i, "").replace(/\/$/, "");
  if (routeMap[clean]) return routeMap[clean];
  if (/^\/tools\/pdf\//.test(clean)) return `/pdf-tools/${clean.split("/")[3]}`;
  return "";
}

function renderInline(text: string) {
  const routePattern = /((?:https?:\/\/)?(?:www\.)?repetigo\.com(?:\/[^\s.,;!?)]*)?|\/(?:tools|features|products|security|pricing|use-cases)\/[^\s.,;!?)]*)/gi;
  return text.split(routePattern).map((part, index) => {
    const href = mapRoute(part);
    return href ? <a key={`${part}-${index}`} href={href}>{routeLabels[href] || "Open PDF Tool"}</a> : part;
  });
}

function renderLines(lines: string[], keyPrefix: string): ReactNode[] {
  const output: ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith("✓")) {
      output.push(<div className="tool-seo-badges" key={`${keyPrefix}-badges-${index}`}>{line.split(/\s{2,}/).map((item) => <span key={item}>{item}</span>)}</div>);
      index += 1;
      continue;
    }
    if (/^(?:💡|📋|✅|⚠️|🔒|🖨️|📱|Note:)/.test(line)) {
      output.push(<aside className="tool-seo-callout" key={`${keyPrefix}-callout-${index}`}><p>{renderInline(line)}</p></aside>);
      index += 1;
      continue;
    }
    if (line.startsWith("•")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith("•")) {
        items.push(lines[index].replace(/^•\s*/, ""));
        index += 1;
      }
      output.push(<ul className="tool-seo-list" key={`${keyPrefix}-list-${index}`}>{items.map((item) => <li key={item}>{renderInline(item)}</li>)}</ul>);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s*/, ""));
        index += 1;
      }
      output.push(<ol className="tool-seo-list" key={`${keyPrefix}-ordered-${index}`}>{items.map((item) => <li key={item}>{renderInline(item)}</li>)}</ol>);
      continue;
    }
    if (line.includes("→ /") || /^Learn about PrintPilot/.test(line)) {
      output.push(<div className="tool-seo-cta-stack" key={`${keyPrefix}-actions-${index}`}>{line.split("|").map((part) => { const arrow = part.indexOf("→"); const label = arrow >= 0 ? part.slice(0, arrow).trim() : part.trim(); const href = arrow >= 0 ? mapRoute(part.slice(arrow + 1)) : ""; return href ? <a className="tool-seo-inline-cta" href={href} key={part}>{label} <span>→</span></a> : null; })}</div>);
      index += 1;
      continue;
    }
    if (/^(?:➜|➤|→)?\s*\[.*\]$/.test(line.trim())) {
      const inner = line.trim().replace(/^(?:➜|➤|→)\s*/, "").replace(/^\[/, "").replace(/\]$/, "");
      const arrow = inner.indexOf("→");
      const label = arrow >= 0 ? inner.slice(0, arrow).trim() : inner.trim();
      const href = arrow >= 0 ? mapRoute(inner.slice(arrow + 1)) : "/pdf-tools/crop-pdf";
      output.push(<div className="tool-seo-cta-stack" key={`${keyPrefix}-cta-${index}`}><a className="tool-seo-inline-cta" href={href || "/pdf-tools/crop-pdf"}>{label} <span>→</span></a></div>);
      index += 1;
      continue;
    }
    output.push(<p key={`${keyPrefix}-paragraph-${index}`}>{renderInline(line)}</p>);
    index += 1;
  }
  return output;
}

function normalizeContent(source: string) {
  return source.replace(/(^|\n)(H[123]: [^\n]+)\n/g, "\n\n$2\n\n").replace(/\n{3,}/g, "\n\n");
}

function StructuredSeoCopy() {
  const blocks = normalizeContent(content).split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return <>{blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const first = lines[0];
    if (first.startsWith("H1: ")) return <h1 key={index}>{first.slice(4)}</h1>;
    if (first.startsWith("H2: ")) return <h2 key={index}>{first.slice(4)}</h2>;
    if (first.startsWith("H3: ")) return <h3 key={index}>{first.slice(4)}</h3>;
    return <div className={index === 1 ? "tool-seo-copy-paragraph tool-seo-hero" : "tool-seo-copy-paragraph"} key={index}>{renderLines(lines, `${index}`)}</div>;
  })}</>;
}

function JsonLd() {
  const faqStart = content.indexOf("H2: Common Questions About Cropping PDFs Online Free.");
  const faqEnd = content.indexOf("H2: More Free PDF Tools from RepetiGo.", faqStart);
  const faqQuestions = Array.from(content.slice(faqStart, faqEnd).matchAll(/H3: ([^\n]+)\n([\s\S]*?)(?=\nH3: |\nH2:|$)/g)).map((match) => ({ "@type": "Question", name: match[1], acceptedAnswer: { "@type": "Answer", text: match[2].trim() } }));
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Crop PDF", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF cropping tool for trimming margins, removing white space, and resizing PDF pages.", url: pageUrl },
    { "@context": "https://schema.org", "@type": "HowTo", name: "How to Crop a PDF Online", step: [{ "@type": "HowToStep", name: "Upload your PDF" }, { "@type": "HowToStep", name: "Set your crop area" }, { "@type": "HowToStep", name: "Download your cropped PDF" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqQuestions },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/tools/pdf/" }, { "@type": "ListItem", position: 3, name: "Crop PDF", item: pageUrl }] },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}

export default function CropPdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><PdfEditTool slug="crop-pdf" headingLevel="h2" /><JsonLd /><article className="tool-seo-content" id="crop-pdf-guide"><StructuredSeoCopy /></article></div></DashboardShell>;
}
