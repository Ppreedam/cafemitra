import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "../../DashboardShell";
import PdfSecurityTool from "../PdfSecurityTool";

const pageUrl = "https://repetigo.com/pdf-tools/redact-pdf";

export const metadata: Metadata = {
  title: "Redact PDF Free - Permanently Remove Sensitive Data | RepetiGo",
  description: "Redact PDF free - permanently black out sensitive text and images with a rectangular area. Applied identically across selected pages. Entire output rasterised. DPDP Act compliant. No sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Redact PDF Free - Permanently Remove Sensitive Data | RepetiGo",
    description: "Redact PDF free - permanently black out sensitive text and images with a rectangular area. Applied identically across selected pages. Entire output rasterised. DPDP Act compliant. No sign-up.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Redact PDF Free - RepetiGo",
    description: "Permanently black out sensitive content with a rectangular area. Entire output rasterised. No sign-up, browser-only.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Redact PDF Free. Permanently Remove Sensitive Information. No Recovery Possible.
RepetiGo's free redact PDF tool permanently removes sensitive information from PDF documents before sharing. Aadhaar numbers, PAN numbers, account numbers, addresses, personal identifiers - black them out permanently with a rectangular redaction area.
Redaction with RepetiGo is permanent and irreversible. The content under the black box is destroyed at the pixel level - not hidden under a coloured layer, not stored in a separate data stream. The entire output PDF is rendered as a flat image to ensure nothing recoverable remains.
✓ Permanent - Content Destroyed, Not Hidden  ✓ Entire PDF Flattened for Maximum Security  ✓ DPDP Act 2023 Data Minimisation Compliant  ✓ No Adobe Required  ✓ Browser-Only - Never Uploaded

➜  [ Redact Your PDF Free - No Sign-Up → repetigo.com/tools/pdf/redact-pdf/ ]

H2: What Is PDF Redaction - and How Is It Different from a Black Box?
The difference between true redaction and a black box overlay is the difference between destroying information and covering it up.
A black box drawn over text in a PDF editor or word processor is a visual layer placed on top of the text. The text itself remains in the file. Any person with access to a PDF editor can move or delete the black box to reveal the content underneath. This is not redaction - it is hiding. Many sensitive documents have been inadvertently exposed this way, including court filings and government reports.
True PDF redaction destroys the underlying content. The original text, image, or vector element is removed or rendered unrecoverable, and the redacted area is filled with a permanent black block at the pixel level.
RepetiGo's redaction engine takes this further: the entire page is rendered to a pixel canvas and saved as a flat raster image. Not just the redacted area - every page that receives a redaction mark is flattened completely. This means:
•  The content under the black box cannot be recovered - not by removing an annotation, not by copying text, not by editing the PDF structure
•  The redacted information is not stored in any PDF metadata, hidden layer, or embedded content stream
•  The output is a standard PDF containing image pages - viewable in any PDF reader, printable on any printer, but with no recoverable text layer on redacted pages
⚠️  Important trade-off: because the entire page is rasterised during redaction, text on the redacted pages is no longer searchable or selectable in the output - not just the redacted areas, but the entire page content. If text searchability on non-redacted sections of those pages is critical, plan accordingly before applying redaction.

H2: How to Redact a PDF in 3 Steps.
H3: Step 1 - Upload Your PDF and Select Pages
Upload your PDF. All pages are displayed as thumbnails. Click individual page thumbnails to select which pages will receive the redaction mark. The same redaction rectangle will be applied to every selected page - if different pages need redaction in different positions, you will need to process the PDF in multiple passes.
H3: Step 2 - Position the Redaction Rectangle
Four controls define the redaction area. From-left: sets the horizontal start position of the rectangle as a percentage of page width (0% = left edge). From-top: sets the vertical start position as a percentage of page height (0% = top edge). Width: sets the width of the black box as a percentage of page width. Height: sets the height of the black box as a percentage of page height. A live preview overlay shows the black rectangle on the page thumbnails as you adjust these values. Position the rectangle precisely over the content you need to permanently remove.
H3: Step 3 - Download the Permanently Redacted PDF
Click Redact PDF. Each selected page is rendered to a pixel canvas, the redaction rectangle is filled solid black, and the entire page is saved as a flattened image in the output PDF. The content is permanently destroyed. Download your redacted PDF. Processing runs entirely in your browser - your document is never uploaded.

H2: Redact PDF Without Adobe Acrobat.
Adobe Acrobat Pro includes a Redact tool under Tools → Redact. It offers text selection redaction, area redaction, and search-and-redact for finding specific words or patterns automatically - but requires a paid subscription (₹1,500-₹3,500/month).
RepetiGo lets you redact a PDF without Adobe for free, in any browser, with permanent pixel-level redaction. Here is how the options compare:

Feature
RepetiGo
Adobe Acrobat Pro
LibreOffice (free)
Cost
Free
₹1,500-₹3,500/month
Free (desktop app)
Redaction method
Rectangular area - permanent raster
Text select + area - true vector redact
Rectangular area (limited)
Multiple areas per page
No - one area per pass
Yes - unlimited
Limited
Per-page different positions
No - same on all selected pages
Yes - per page control
Manual
Text search and redact
No
Yes - auto-find by keyword
No
Output text searchable
No - full raster
Yes - non-redacted areas remain searchable
Varies
Server upload
No - browser-only
Cloud sync
No - local only
Works without install
Yes (browser)
No (desktop app)
No - must install

H2: Redact PDF in India - DPDP Act Compliance and Use Cases.
Under India's DPDP Act 2023, personal data must be minimised before sharing with third parties. Documents containing Aadhaar numbers, PAN numbers, financial account details, health information, and other personal identifiers must have that data removed or masked before distribution outside the organisation.
Permanent redaction - not just masking or hiding - is the appropriate data minimisation measure for document sharing. Common Indian use cases:
•  Aadhaar number redaction: The UIDAI guideline permits sharing a Masked Aadhaar (last 4 digits visible). Use RepetiGo's redaction tool to permanently black out the first 8 digits before sharing with employers, landlords, banks, or service providers. The UIDAI Masked Aadhaar feature in the official portal provides official masked versions - for scanned Aadhaar cards, RepetiGo's redaction tool covers the first 8 digits with a precisely positioned rectangle
•  PAN card sharing: PAN numbers are sensitive tax identifiers. Redact the PAN number from document images before sharing with third parties who do not need the full number for their stated purpose
•  Bank account numbers and IFSC codes: Financial documents shared for verification (KYC, loan applications) often contain full account numbers. Redact account numbers and leave only the last 4 digits visible - consistent with standard data minimisation practice
•  Medical records and health documents: Discharge summaries, prescription documents, and health reports shared for insurance claims - redact personal health information not required by the specific recipient
•  Legal documents: Court orders, affidavits, and property documents shared with multiple parties - redact witness addresses, personal contact information, and financial details before broad distribution
•  HR and payroll documents: Salary slips and employment verification letters shared with third-party background verification agencies - redact compensation details and retain only the employment dates and designation
⚠️  DPDP Act 2023 applies to the processing of personal data of Indian citizens by any entity. Sharing a document containing personal data without minimising that data to what is necessary for the specific purpose may constitute a violation. Permanent redaction before sharing is a direct, auditable compliance measure.

H2: Understanding the Rasterisation Trade-Off.
When RepetiGo applies redaction to a page, the entire page is converted from its original vector/text format to a pixel image. This is how the redaction becomes permanent - the text layer is destroyed, not just hidden.
What this means for your output PDF:

Aspect
Before Redaction
After Redaction (on redacted pages)
Text selectability
Text can be selected and copied
Text is part of the image - cannot be selected
Text searchability
Ctrl+F finds words
Ctrl+F does not find words on these pages
File size
Original size
May increase - image pages are typically larger than vector pages
Print quality
Vector - scales to any resolution
Image at 2× pixel density - high quality but fixed resolution
Non-redacted pages
Original format
Unchanged - remain as original text/vector

Practical implication: if you need to redact a 20-page document where only page 3 contains sensitive data, apply the redaction only to page 3. Pages 1-2 and 4-20 remain in their original searchable format. Only page 3 becomes a raster image.
💡  Strategy for minimal raster impact: select only the specific pages that need redaction. Unselected pages pass through unchanged in their original format - text remains searchable on all pages that do not receive a redaction mark.

H2: Your Files Never Leave Your Browser.
RepetiGo's PDF tools run entirely in your browser. Your PDF is never uploaded to any server - it is processed locally on your device.
•  🔒 Browser-only processing: Your file never travels over any network to any server. No upload occurs at any stage.
•  🔐 No server session: There is no remote processing session, no isolated server workspace. Everything happens inside your browser tab.
•  🚫 No account = no data: No sign-up means we hold zero personal data about you. No file history, no email, no usage tracking.
•  👁️ Content never leaves device: No text, image, or document content is sent to or read by any external system or person.
•  ✅ Cleared on tab close: All local working data clears when you close or refresh the tab. Nothing persists on your device or any server.
🔒  Your file never leaves your device - not for 60 minutes, not ever. Browser-only processing is stronger privacy than any server-side deletion policy.
Privacy Policy → /security/ | Browser-only processing - no upload, no storage

H2: Redact PDF for Print Shops - Built into PrintPilot.
Print shop owners, cyber cafe operators, and CSC centre managers use RepetiGo's redact pdf tool as part of their customer document processing workflow - without switching to separate applications.
PrintPilot - RepetiGo's print shop management platform - integrates all 30 PDF tools directly into the shop dashboard. Customer documents uploaded by QR code are processed automatically before reaching the print queue.
•  Redact customer Aadhaar numbers before filing copies in the shop's customer records
•  Process legal documents for clients who need PAN or account numbers blacked out before submission
•  Remove personal contact details from shared documents before printing and distributing to multiple parties
🖨️  PrintPilot gives you all 30 PDF tools plus QR code document upload, AI document enhancement, secure print queue, UPI payments, and auto-delete compliance - built into one platform.

➜  [ Try PrintPilot Free - Print Shop Automation for India → repetigo.com/products/printpilot/ ]

H2: Common Questions About Redacting a PDF.
H3: Q1: How do I permanently redact a PDF for free?
Go to repetigo.com/tools/pdf/redact-pdf/, upload your PDF, select the pages to redact, position the black rectangle using the From-left, From-top, Width, and Height percentage sliders, and click Redact PDF. The selected pages are permanently rendered as flat image pages with the redacted area filled solid black. Download. Browser-only - no upload, no sign-up.
H3: Q2: Is the content under the black box really gone?
Yes - permanently and irrecoverably. RepetiGo renders the entire page to a pixel canvas and fills the redaction area with solid black pixels. The underlying text, image, or vector content is completely destroyed. Unlike a black box drawn in a PDF editor (which just covers the text), this process eliminates the source content. It cannot be recovered by moving a layer, copying text, or editing the PDF structure.
H3: Q3: Can I redact different areas on different pages?
Not in one operation - the same rectangle position and size applies to all selected pages in a single pass. To redact different areas on different pages, process the PDF in multiple passes: first select and redact the pages where the sensitive content is in position A, download the result, then re-upload and apply a different rectangle for pages where the content is in a different position.
H3: Q4: Why is the text no longer searchable after redaction?
The redaction process rasterises the entire page - converting it from text/vector format to a pixel image - to ensure the redacted content is permanently destroyed. This affects the entire page, not just the redacted area. Text on a rasterised page is part of the image and cannot be selected, copied, or searched. This is a necessary trade-off for permanent, irrecoverable redaction. To minimise the impact, select only the specific pages that require redaction - unselected pages remain in their original searchable format.
H3: Q5: How do I redact an Aadhaar number from a PDF?
Upload the PDF containing the Aadhaar card image. Select the page(s) containing the Aadhaar number. Use the From-left and From-top sliders to position the rectangle over the first 8 digits of the 12-digit number (the last 4 digits are typically left visible as the Masked Aadhaar standard). Set Width and Height to cover the digits precisely. Apply and download. For scanned Aadhaar cards, the number is typically in the middle-lower section of the card.
H3: Q6: Is this tool compliant with India's DPDP Act 2023?
The permanent pixel-level redaction method meets the data minimisation requirement of the DPDP Act 2023 for documents shared externally - the personal data is destroyed, not merely hidden. The processing itself is browser-only (no server upload), which further reduces privacy risk during handling. For formal compliance programmes, document the redaction process as part of your data handling procedures.
H3: Q7: Can I redact text by selecting it rather than drawing a rectangle?
No - the current tool uses a rectangular area defined by percentage-based position and size controls. Text selection redaction (clicking on specific words or sentences to remove them) is not available. Use the rectangle controls to cover the area of the page containing the sensitive text. For most document redaction needs - a specific number, address, or identifier in a consistent location - the rectangle method is effective.
H3: Q8: What happens if I redact the wrong area?
Once you click Redact PDF and download, the redaction is permanent and cannot be reversed on the output file. Before clicking Redact PDF, use the live preview overlay to verify the rectangle covers exactly the right area. The preview shows the black box on the page thumbnails before you apply the redaction. If you apply the wrong area, you will need to redact the original unredacted PDF - keep your original as a backup before redacting.

H2: More Free PDF Security Tools from RepetiGo.
•  Protect PDF → /tools/pdf/protect-pdf/ - combine with redaction for complete document security
•  Sign PDF → /tools/pdf/sign-pdf/ - sign the redacted document electronically
•  Compare PDF → /tools/pdf/compare-pdf/ - verify redacted version against original
•  All PDF Tools → /tools/pdf/

➜  [ Redact Your PDF Free - Permanent and Browser-Only → repetigo.com/tools/pdf/redact-pdf/ ]`;

type SeoTable = { headers: string[]; rows: string[][] };

const tables: SeoTable[] = [
  {
    headers: ["Feature", "RepetiGo", "Adobe Acrobat Pro", "LibreOffice (free)"],
    rows: [
      ["Cost", "Free", "₹1,500-₹3,500/month", "Free (desktop app)"],
      ["Redaction method", "Rectangular area - permanent raster", "Text select + area - true vector redact", "Rectangular area (limited)"],
      ["Multiple areas per page", "No - one area per pass", "Yes - unlimited", "Limited"],
      ["Per-page different positions", "No - same on all selected pages", "Yes - per page control", "Manual"],
      ["Text search and redact", "No", "Yes - auto-find by keyword", "No"],
      ["Output text searchable", "No - full raster", "Yes - non-redacted areas remain searchable", "Varies"],
      ["Server upload", "No - browser-only", "Cloud sync", "No - local only"],
      ["Works without install", "Yes (browser)", "No (desktop app)", "No - must install"],
    ],
  },
  {
    headers: ["Aspect", "Before Redaction", "After Redaction (on redacted pages)"],
    rows: [
      ["Text selectability", "Text can be selected and copied", "Text is part of the image - cannot be selected"],
      ["Text searchability", "Ctrl+F finds words", "Ctrl+F does not find words on these pages"],
      ["File size", "Original size", "May increase - image pages are typically larger than vector pages"],
      ["Print quality", "Vector - scales to any resolution", "Image at 2× pixel density - high quality but fixed resolution"],
      ["Non-redacted pages", "Original format", "Unchanged - remain as original text/vector"],
    ],
  },
];

const routeMap: Record<string, string> = {
  "/tools/pdf": "/pdf-tools",
  "/pdf-tools": "/pdf-tools",
  "/pdf-tools/redact-pdf": "/pdf-tools/redact-pdf",
  "/pdf-tools/protect-pdf": "/pdf-tools/protect-pdf",
  "/pdf-tools/edit-pdf": "/pdf-tools/edit-pdf",
  "/pdf-tools/sign-pdf": "/pdf-tools/sign-pdf",
  "/pdf-tools/compare-pdf": "/pdf-tools/compare-pdf",
  "/pdf-tools/unlock-pdf": "/pdf-tools/unlock-pdf",
  "/pdf-tools/pdf-forms": "/pdf-tools/pdf-form",
  "/products/printpilot": "/print-automation",
  "/features/auto-delete": "/privacy-policy",
  "/security": "/privacy-policy",
  "/pricing": "/pricing",
};

const routeLabels: Record<string, string> = {
  "/pdf-tools": "Explore All PDF Tools",
  "/pdf-tools/redact-pdf": "Open Redact PDF",
  "/pdf-tools/protect-pdf": "Open Protect PDF",
  "/pdf-tools/edit-pdf": "Open Edit PDF",
  "/pdf-tools/sign-pdf": "Open Sign PDF",
  "/pdf-tools/compare-pdf": "Open Compare PDF",
  "/pdf-tools/unlock-pdf": "Open Unlock PDF",
  "/pdf-tools/pdf-form": "Open PDF Form",
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

function renderTable(table: SeoTable) {
  return <div className="tool-seo-table-wrap"><table><thead><tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{renderInline(cell)}</td>)}</tr>)}</tbody></table></div>;
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
    if (/^(?:💡|📋|✅|⚠️|🔒|🖨️|Note:)/.test(line)) {
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
      const href = arrow >= 0 ? mapRoute(inner.slice(arrow + 1)) : "/pdf-tools/redact-pdf";
      output.push(<div className="tool-seo-cta-stack" key={`${keyPrefix}-cta-${index}`}><a className="tool-seo-inline-cta" href={href || "/pdf-tools/redact-pdf"}>{label} <span>→</span></a></div>);
      index += 1;
      continue;
    }
    output.push(<p key={`${keyPrefix}-paragraph-${index}`}>{renderInline(line)}</p>);
    index += 1;
  }
  return output;
}

function findTable(lines: string[]) {
  for (const table of tables) {
    const start = lines.findIndex((line, index) => table.headers.every((header, offset) => lines[index + offset] === header));
    if (start >= 0) return { table, start, end: start + table.headers.length + table.rows.length * table.headers.length };
  }
  return null;
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
    const table = findTable(lines);
    if (table) {
      return <div key={index}>{table.start > 0 ? <div className="tool-seo-copy-paragraph">{renderLines(lines.slice(0, table.start), `${index}-before-table`)}</div> : null}{renderTable(table.table)}{table.end < lines.length ? <div className="tool-seo-copy-paragraph tool-seo-table-followup">{renderLines(lines.slice(table.end), `${index}-after-table`)}</div> : null}</div>;
    }
    return <div className={index === 1 ? "tool-seo-copy-paragraph tool-seo-hero" : "tool-seo-copy-paragraph"} key={index}>{renderLines(lines, `${index}`)}</div>;
  })}</>;
}

function JsonLd() {
  const faqStart = content.indexOf("H2: Common Questions About Redacting a PDF.");
  const faqEnd = content.indexOf("H2: More Free PDF Security Tools from RepetiGo.", faqStart);
  const faqQuestions = Array.from(content.slice(faqStart, faqEnd).matchAll(/H3: ([^\n]+)\n([\s\S]*?)(?=\nH3: |\nH2:|$)/g)).map((match) => ({ "@type": "Question", name: match[1], acceptedAnswer: { "@type": "Answer", text: match[2].trim() } }));
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Redact PDF", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF redaction tool - permanently black out sensitive content with a rectangular area, applied identically across selected pages. Entire output rasterised. No file is ever uploaded to a server.", url: pageUrl },
    { "@context": "https://schema.org", "@type": "HowTo", name: "How to Redact a PDF in 3 Steps", step: [{ "@type": "HowToStep", name: "Upload Your PDF and Select Pages" }, { "@type": "HowToStep", name: "Position the Redaction Rectangle" }, { "@type": "HowToStep", name: "Download the Permanently Redacted PDF" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqQuestions },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Redact PDF", item: pageUrl }] },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}

export default function RedactPdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><PdfSecurityTool slug="redact-pdf"><JsonLd /><article className="tool-seo-content" id="redact-pdf-guide"><StructuredSeoCopy /></article></PdfSecurityTool></div></DashboardShell>;
}
