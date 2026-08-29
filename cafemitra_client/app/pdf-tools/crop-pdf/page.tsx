import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "../../DashboardShell";
import PdfEditTool from "../PdfEditTool";

const pageUrl = "https://repetigo.com/pdf-tools/crop-pdf";

export const metadata: Metadata = {
  title: "Crop PDF Online Free - Trim Margins | RepetiGo",
  description: "Crop PDF free - trim margins by entering Top, Right, Bottom, Left values in points (72pt = 1 inch). Same values apply to all selected pages. Browser-only. No sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Crop PDF Online Free - Trim Margins | RepetiGo",
    description: "Crop PDF free - trim margins by entering Top, Right, Bottom, Left values in points (72pt = 1 inch). Same values apply to all selected pages. Browser-only. No sign-up.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Crop PDF Online Free - RepetiGo",
    description: "Trim margins with Top/Right/Bottom/Left point values. No sign-up, browser-only.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Crop PDF Online Free. Trim Margins by Entering Values. Apply to Any Pages.
RepetiGo's free crop PDF tool removes unwanted margins from any PDF - enter your crop values for Top, Right, Bottom, and Left margins, apply to all or selected pages, and download a trimmed PDF.
Crop values are entered in points - the standard PDF coordinate unit. 72 points equals one inch. A reference table on this page shows common conversions so you can work in the measurements you are comfortable with.
✓ Top / Right / Bottom / Left Margin Control  ✓ Apply to All or Specific Pages  ✓ Same Crop on All Selected Pages  ✓ No Adobe Required  ✓ Browser-Only - Never Uploaded

➜  [ Crop Your PDF Free - No Sign-Up → repetigo.com/tools/pdf/crop-pdf/ ]

H2: What Does Cropping a PDF Do?
PDF cropping changes the visible area of each page by applying a crop box - a rectangle that defines which portion of the page content is displayed and printed. Content outside the crop box is hidden from view in standard PDF readers.
Important distinction: cropping does not delete the content outside the crop area. The hidden content remains in the PDF file - it is simply not displayed. If you open the cropped PDF in a full PDF editor, the hidden content may still be accessible. For permanent removal of content, use the Redact PDF tool at /tools/pdf/redact-pdf/.
Common reasons to crop a PDF:
•  Remove excessive white borders: Scanned documents often have large white margins around the content area - cropping removes the border and makes the content fill more of the page when printed
•  Remove headers or footers: PDFs exported from web pages, applications, or software often include headers or footers with website URLs, timestamps, or application branding - cropping removes these before sharing
•  Standardise margins: Documents created with inconsistent margins across pages - from different source files or scanning setups - can be standardised to a consistent visible area
•  Resize presentation slides: PowerPoint or Keynote slides exported as PDFs often have significant white space around the slide content - cropping reduces this to focus on the actual slide area
•  Prepare for print: Remove printer-unfriendly margins before printing to maximise the printable area on A4 or letter-size paper

H2: How to Crop a PDF in 3 Steps.
H3: Step 1 - Upload Your PDF and Select Pages
Click Upload or drag your PDF into the tool. All pages are rendered as thumbnails. Click individual thumbnails to select which pages will be cropped. Use Select All if you want the same crop applied to every page in the document.
H3: Step 2 - Enter Your Margin Values in Points
Four input fields appear for Top, Right, Bottom, and Left. Enter the amount you want to remove from each edge, in points. For reference: 72 points = 1 inch = approximately 2.54 cm. To remove a 1cm border, enter approximately 28 points. To remove a 2cm border, enter approximately 57 points. The maximum crop per side is one-third of that page dimension - the tool prevents you from cropping so much that less than 10 points of page remain. The same crop values apply to all selected pages - there is no per-page customisation in one pass.
H3: Step 3 - Download Your Cropped PDF
Click Crop PDF. The crop box is applied to all selected pages. Download your trimmed PDF. Unselected pages pass through unchanged with their original margins intact. Processing runs entirely in your browser - nothing is uploaded.

H2: Understanding Points - The PDF Measurement Unit.
PDF files use points as their native coordinate and measurement unit. One point equals 1/72 of an inch. This is a typographic measurement inherited from print design - the same unit used for font sizes.

Measurement
In Points
Approximate Equivalent
Use Case
1 inch
72 pt
2.54 cm
Removing a standard 1-inch border
1 cm
~28 pt
0.39 inches
Removing a 10mm border
2 cm
~57 pt
0.79 inches
Removing a 20mm border
0.5 cm
~14 pt
0.20 inches
Removing a small 5mm border
A4 width (210mm)
595 pt
8.27 inches
Full A4 page width for reference
A4 height (297mm)
842 pt
11.69 inches
Full A4 page height for reference
A4 left margin 25mm
71 pt
~1 inch
Typical document left margin

💡  To find the right crop value for your document: open the original PDF in any PDF reader, check the page dimensions, and calculate: crop amount = (page dimension in inches × 72). For most standard margin removal, 28-72 points (1-2.5 cm) covers the most common use cases.

H2: Crop PDF Without Adobe Acrobat.
Adobe Acrobat Pro includes a Crop Pages tool - but requires a paid subscription. RepetiGo lets you crop PDF without Adobe for free, in any browser, with no software to install.

Feature
RepetiGo
Adobe Acrobat Pro
PDF24 / Smallpdf
Cost
Free
₹1,500-₹3,500/month
Free (limited) or paid
Server upload
No - browser-only
Cloud sync
Yes - server upload
Crop method
Numeric margin inputs (points)
Visual drag + numeric
Numeric or visual
Per-page different crops
No - same values on all selected
Yes - full per-page control
Limited
Works without install
Yes (browser)
No (desktop app)
Yes (browser)
No sign-up
✅ Yes
Adobe ID required
Account for full features

H2: Crop PDF Use Cases - When Does This Help?
Cropping is a routine document preparation step in many workflows:
•  Scanned document cleanup: Scanners often capture a border of the scanner bed or paper edge around the actual document content. Cropping 20-40 points from each side removes this dead border and produces a cleaner, tighter scan
•  Web-to-PDF export cleanup: Browser print-to-PDF exports frequently include the website URL, print date, and browser chrome in the header and footer. Cropping 50-80 points from the top and bottom removes these automatically added elements
•  Slide deck tightening: PowerPoint slides exported as PDF often have wide white borders around the slide content. Cropping reduces these borders and makes slides fill more of each page when shared as a PDF document
•  Multi-source document standardisation: When merging PDFs from different sources with inconsistent margins into one document, cropping each source PDF to consistent margins before merging produces a uniform-looking output
•  Print shop document preparation: Before printing customer documents, a consistent crop ensures the printable content area is correctly sized for the paper and printer settings

H2: Crop PDF in India - Common Applications.
•  Government form submissions: Many Indian government portal PDF forms have wide white borders from the original template design - cropping before submission makes the document more professional and avoids unnecessary blank space in the printed output
•  DigiLocker and Aadhaar document exports: PDFs downloaded from DigiLocker or the Aadhaar portal sometimes include application headers and footers - cropping removes these for clean document sharing
•  Scanned certificate cleanup: Educational certificates, marksheets, and official documents scanned for online submission often have scanner-bed borders - a uniform 20-30 point crop cleans these before uploading to admission or verification portals
•  Bank statement PDFs: Bank statements exported as PDFs often have large header areas with bank branding and footer areas with disclaimers - cropping to the transaction data area creates a cleaner document for CA or accountant submission
With RepetiGo you can crop PDF online free in India - enter your margin values, apply to all pages, and download in seconds. No account, no software, browser-only.

H2: Your Files Never Leave Your Browser.
RepetiGo's PDF tools run entirely in your browser. Your PDF is never uploaded to any server - it is processed locally on your device.
•  🔒 Browser-only processing: Your file never travels over any network. No server receives it. No upload of any kind occurs.
•  🔐 No server session: There is no remote processing session or isolated server workspace. Everything runs inside your browser tab.
•  🚫 No account = no data: No sign-up means we hold zero personal data. No file history, no name, no email stored anywhere.
•  👁️ Content never leaves device: No text, image, or document content is sent to or read by any external system or person.
•  ✅ Cleared on tab close: All local working data is cleared when you close or refresh the browser tab. Nothing persists.
🔒  Your file never leaves your device - not for 60 minutes, not ever. Browser-only processing is stronger privacy than any server-side deletion policy.
Privacy Policy → /security/ | Browser-only processing - no upload, no storage

H2: Common Questions About Cropping a PDF.
H3: Q1: How do I crop a PDF online for free?
Go to repetigo.com/tools/pdf/crop-pdf/, upload your PDF, select the pages to crop, enter crop values for Top, Right, Bottom, and Left in points (72pt = 1 inch), and click Crop PDF. Download the cropped result. Browser-only - no upload, no sign-up, no software.
H3: Q2: Why are the units in points instead of millimetres?
PDF files use points as their native coordinate system (1 point = 1/72 inch). The crop tool works directly with PDF coordinates, so inputs are in the same unit. Common conversions: 28pt ≈ 1cm, 72pt = 1 inch. For most document margin trimming, entering 28-57 points (1-2cm) covers the most common use cases.
H3: Q3: Can I crop different amounts on different pages?
The same Top/Right/Bottom/Left values apply to all selected pages in one operation. To crop different pages with different values, process the PDF in multiple passes - crop pages 1-5 with one set of values, then process the same PDF again for pages 6-10 with different values, and merge the results using the Merge PDF tool.
H3: Q4: Does cropping delete the content outside the crop area?
No. PDF cropping sets a visual boundary (the CropBox) that hides content beyond the crop edges - but the content remains in the file. If you open the cropped PDF in Adobe Acrobat or another full PDF editor, you may still be able to access the hidden content. For permanent, irreversible removal of content, use the Redact PDF tool instead.
H3: Q5: How much can I crop from each edge?
The maximum crop per side is one-third of that page dimension. For a standard A4 page (595pt wide), you can crop a maximum of approximately 198pt (about 7cm) from each side. The minimum resulting page must be at least 10 points in each dimension - the tool prevents you from cropping to the point where nothing visible remains.
H3: Q6: Can I use this tool on a scanned PDF to remove scanner borders?
Yes - this is one of the most common use cases. Scanners often capture the edge of the scanner bed as a dark or grey border around the document. Crop 20-50 points from each side to remove this border. The optimal amount depends on your scanner - start with 28pt (about 1cm) and increase if the border is still visible.
H3: Q7: What happens to the pages I did not select?
Pages you did not select pass through the tool unchanged - they appear in the output PDF with their original margins intact. Only the pages you selected receive the crop. This allows you to crop only specific sections of a document (for example, cropping only the scanned pages in a mixed document that also contains clean digital pages).
H3: Q8: Is there a maximum file size for cropping?
The crop tool processes your PDF locally in your browser using your device's resources. Very large PDFs (above 50-100MB) may process slowly on older or lower-memory devices. For large files, consider compressing the PDF first using the Compress PDF tool at /tools/pdf/compress-pdf/, then crop the compressed version.

H2: More Free PDF Tools from RepetiGo.
•  Rotate PDF → /tools/pdf/rotate-pdf/ - fix page orientation
•  Edit PDF → /tools/pdf/edit-pdf/ - add or edit text anywhere on the page
•  Redact PDF → /tools/pdf/redact-pdf/ - permanently remove content (vs crop which hides it)
•  Compress PDF → /tools/pdf/compress-pdf/ - reduce file size after cropping
•  All PDF Tools → /tools/pdf/

➜  [ Crop Your PDF Free - No Sign-Up → repetigo.com/tools/pdf/crop-pdf/ ]`;

const routeMap: Record<string, string> = {
  "/tools/pdf": "/pdf-tools",
  "/pdf-tools": "/pdf-tools",
  "/pdf-tools/crop-pdf": "/pdf-tools/crop-pdf",
  "/pdf-tools/edit-pdf": "/pdf-tools/edit-pdf",
  "/pdf-tools/organize-pdf": "/pdf-tools/organize-pdf",
  "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf",
  "/pdf-tools/watermark-pdf": "/pdf-tools/watermark-pdf",
  "/pdf-tools/add-page-numbers": "/pdf-tools/page-numbers",
  "/pdf-tools/rotate-pdf": "/pdf-tools/rotate-pdf",
  "/pdf-tools/redact-pdf": "/pdf-tools/redact-pdf",
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
  "/pdf-tools/rotate-pdf": "Open Rotate PDF",
  "/pdf-tools/redact-pdf": "Open Redact PDF",
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

type SeoTableData = { headers: string[]; rows: string[][] };

function getKnownTable(lines: string[]): SeoTableData | null {
  if (lines[0] === "Measurement" && lines[1] === "In Points" && lines[2] === "Approximate Equivalent" && lines[3] === "Use Case") return { headers: lines.slice(0, 4), rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Feature" && lines[1] === "RepetiGo" && lines[2] === "Adobe Acrobat Pro" && lines[3] === "PDF24 / Smallpdf") return { headers: lines.slice(0, 4), rows: chunkRows(lines.slice(4), 4) };
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
          {rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={cell + "-" + index}>{renderInline(cell)}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function StructuredSeoCopy() {
  const blocks = normalizeContent(content).split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return <>{blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const first = lines[0];
    if (first.startsWith("H1: ")) return <h1 key={index}>{first.slice(4)}</h1>;
    if (first.startsWith("H2: ")) return <h2 key={index}>{first.slice(4)}</h2>;
    if (first.startsWith("H3: ")) return <h3 key={index}>{first.slice(4)}</h3>;
    const table = getKnownTable(lines);
    if (table) return <SeoTable key={index} {...table} />;
    return <div className={index === 1 ? "tool-seo-copy-paragraph tool-seo-hero" : "tool-seo-copy-paragraph"} key={index}>{renderLines(lines, `${index}`)}</div>;
  })}</>;
}

function JsonLd() {
  const faqStart = content.indexOf("H2: Common Questions About Cropping a PDF.");
  const faqEnd = content.indexOf("H2: More Free PDF Tools from RepetiGo.", faqStart);
  const faqQuestions = Array.from(content.slice(faqStart, faqEnd).matchAll(/H3: ([^\n]+)\n([\s\S]*?)(?=\nH3: |\nH2:|$)/g)).map((match) => ({ "@type": "Question", name: match[1], acceptedAnswer: { "@type": "Answer", text: match[2].trim() } }));
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Crop PDF", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF cropping tool - enter Top/Right/Bottom/Left margin values in points and apply to selected pages by setting the PDF's CropBox, entirely in the browser. No file is ever uploaded to a server.", url: pageUrl },
    { "@context": "https://schema.org", "@type": "HowTo", name: "How to Crop a PDF in 3 Steps", step: [{ "@type": "HowToStep", name: "Upload Your PDF and Select Pages" }, { "@type": "HowToStep", name: "Enter Your Margin Values in Points" }, { "@type": "HowToStep", name: "Download Your Cropped PDF" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqQuestions },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Crop PDF", item: pageUrl }] },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}

export default function CropPdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><JsonLd /><article className="tool-seo-content" id="crop-pdf-guide"><StructuredSeoCopy /></article><PdfEditTool slug="crop-pdf" headingLevel="h2" /></div></DashboardShell>;
}
