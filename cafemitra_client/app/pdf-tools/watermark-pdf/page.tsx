import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import PdfEditTool from "../PdfEditTool";

const pageUrl = "https://repetigo.com/pdf-tools/watermark-pdf";

export const metadata: Metadata = {
  title: "Add Watermark to PDF Free - DRAFT/CONFIDENTIAL | RepetiGo",
  description: "Add watermark to PDF free - custom text (DRAFT, CONFIDENTIAL, company name), opacity 5-80%, rotation, font size and colour. Apply to any pages. Text-only. Browser-only. No sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Add Watermark to PDF Free - DRAFT/CONFIDENTIAL | RepetiGo",
    description: "Add watermark to PDF free - custom text (DRAFT, CONFIDENTIAL, company name), opacity 5-80%, rotation, font size and colour. Apply to any pages. Text-only. Browser-only. No sign-up.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Watermark to PDF Free - RepetiGo",
    description: "Custom text watermark, opacity 5-80%, rotation, font size and colour. No sign-up, browser-only.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Add Watermark to PDF Free. Text Watermarks. Custom Opacity and Angle.
RepetiGo's free add watermark to PDF tool stamps any text watermark across your PDF pages - DRAFT, CONFIDENTIAL, COPY, your company name, or any custom label. Set the opacity, rotation angle, font size, and colour. Apply to any pages you choose.
The watermark is centred on the page and embedded directly into the page content - not a removable overlay. Processing runs entirely in your browser. Your file is never uploaded to any server.
✓ Custom Text - Up to 60 Characters  ✓ Opacity 5-80%  ✓ Rotation -90° to 90°  ✓ Any Colour  ✓ No Adobe Required  ✓ Browser-Only - Never Uploaded

➜  [ Add Watermark Free - No Sign-Up → repetigo.com/tools/pdf/add-watermark/ ]

H2: What Is a PDF Watermark and When Do You Need One?
A PDF watermark is a semi-transparent text overlay that appears across the page - typically at a diagonal angle - visible to the reader while still allowing the underlying document content to show through.
Watermarks serve a clear communication purpose: they tell the reader the status or sensitivity of the document before they read a single word of content. A DRAFT watermark tells a reviewer they are reading a preliminary version. A CONFIDENTIAL watermark signals the content should not be shared. A COPY watermark distinguishes a reproduction from an original.
Common situations where a PDF watermark is needed:
•  DRAFT documents: Mark contracts, reports, proposals, and specifications that are still being reviewed - prevent recipients from treating a working version as the final approved document
•  CONFIDENTIAL documents: Salary slips, board meeting minutes, financial statements, legal agreements - signal that the content is restricted and should not be distributed beyond the intended recipient
•  COPY or SAMPLE: Mark template documents, sample contracts, or specimen copies to distinguish them from originals that carry legal force
•  Company branding: Add a company name or logo text as a faint background watermark on documents shared externally - establishes ownership and brand presence
•  VOID or CANCELLED: Mark superseded documents, invalidated certificates, or cancelled invoices to prevent misuse
•  FOR REVIEW: Mark documents sent for stakeholder review to distinguish them from the final version pending sign-off
💡  A watermark communicates intent at a glance. A DRAFT watermark on a contract prevents a counterparty from acting on preliminary terms as if they were final. A CONFIDENTIAL watermark on a salary slip discourages redistribution without a single word of instruction.

H2: How to Add a Watermark to a PDF in 3 Steps.
The entire process takes under one minute. No account, no software, no server upload.
H3: Step 1 - Upload Your PDF and Select Pages
Click Upload or drag your PDF into the tool. All pages are rendered as thumbnails. Click individual page thumbnails to toggle which pages will receive the watermark. Use Select All to apply to every page, or click individual thumbnails to apply selectively - for example, watermarking only the first page of a document, or every page except the cover.
H3: Step 2 - Enter Watermark Text and Customise Settings
Type your watermark text - up to 60 characters. Common choices: DRAFT, CONFIDENTIAL, COPY, FOR REVIEW, VOID, SAMPLE, or your company name. Then set your appearance preferences: Opacity (5% to 80%) - how strongly the watermark shows through the page content. Rotation (-90° to 90°) - the angle of the text across the page. 45° diagonal is the most common professional standard. Font size (6 to 96) - scaled to your page size. A font size of 24-48 works well for most A4 documents. Colour - open the colour picker and select any colour. Grey works for subtle watermarks; red commands attention for CONFIDENTIAL or URGENT labels. A live preview shows the watermark positioned on the page thumbnails as you adjust these settings.
H3: Step 3 - Download Your Watermarked PDF
Click Add Watermark. The watermark is embedded into every selected page's content - not placed as an annotation that can be toggled off. Download your watermarked PDF. The file processes entirely in your browser - nothing is uploaded at any stage.

H2: Watermark Settings - What Each Control Does.

Setting
Range
What It Controls
Best Practice
Text
Up to 60 characters
The watermark label shown on the page
DRAFT · CONFIDENTIAL · COPY · Company Name · FOR REVIEW
Opacity
5%-80%
Transparency of the watermark (5% = nearly invisible, 80% = strongly visible)
50-65% for most documents - visible but not obscuring the content
Rotation
-90° to 90°
Angle of the text across the page
45° diagonal - the standard professional watermark orientation
Font size
6-96
Size of the watermark text as rendered on the page
24-48 for A4 documents; 36-60 for A3 or landscape
Colour
Any (colour picker)
Colour of the watermark text
Grey for subtle; Red for urgent/confidential; Blue for draft

⚠️  The watermark is always centred on the page - custom X/Y positioning is not currently available. Image or logo watermarks are also not supported - text only. Tiled or repeating watermarks and multiple watermarks per page are not available in this tool.

H2: Add Watermark to PDF Without Adobe Acrobat.
Adobe Acrobat Pro includes a watermark function under Tools → Edit PDF → Watermark - but requires a paid subscription. For most people who occasionally need to mark a document as DRAFT or CONFIDENTIAL, paying a subscription for that one task is not practical.
RepetiGo lets you add a watermark to PDF without Adobe for free, in any browser, without installing anything:

Feature
RepetiGo
Adobe Acrobat Pro
Smallpdf / iLovePDF
Cost
Free
₹1,500-₹3,500/month
Free (limited) or paid
Server upload
No - browser-only
Cloud sync
Yes - server upload
Watermark type
Text only
Text and image
Text and image
Position control
Centred only
Full X/Y positioning
Limited
Opacity control
5-80%
Full range
Limited
Works without install
Yes (browser)
No (desktop app)
Yes (browser)
No sign-up
✅ Yes
Adobe ID required
Account required for full features

H2: Watermark Use Cases - Who Uses PDF Watermarks?
Watermarks are used across a wide range of professional and personal contexts. Here are the most common:
•  Legal professionals: Mark draft contracts, pleadings, and legal opinions as DRAFT or FOR REVIEW before circulating to clients or opposing counsel. Prevent any version being acted upon before final sign-off.
•  HR departments: Watermark salary slips, offer letters, and employment contracts as CONFIDENTIAL before distributing to employees or third-party verification agencies. Mark samples and templates as SAMPLE to prevent use as actual documents.
•  Finance and accounts teams: Mark financial statements, audit reports, and budgets as DRAFT during review cycles. Mark shared reports as CONFIDENTIAL before distribution to investors or board members.
•  Academic institutions: Mark examination papers and answer keys as CONFIDENTIAL before the exam. Mark student reports and certificates as COPY or SAMPLE when sharing examples.
•  Businesses sharing proprietary documents: Add a faint company name watermark to price lists, technical specifications, and product documentation sent to external parties - establishes ownership without obscuring the content.
•  Individual professionals: Mark portfolio samples, proposals, and presentations as SAMPLE or DRAFT when sharing with prospective clients before engagement is confirmed.

H2: Add Watermark to PDF in India - Common Applications.
India's professional and regulatory environment creates several specific watermarking needs that are distinct from global use cases:
•  Tender documents: Government and corporate tender responses must often be marked DRAFT during the preparation phase to distinguish working versions from the final submitted bid
•  CA and legal firm documents: Audit reports, tax filings, and legal opinions shared for review between partners or with clients carry DRAFT or CONFIDENTIAL watermarks as standard professional practice
•  Property documents: Sale deeds, lease agreements, and property valuation reports shared for review - mark as DRAFT or FOR REVIEW before the final registered version is executed
•  Academic marksheets and certificates (sample): Educational institutions sharing sample documents for reference mark them as SAMPLE to prevent misuse as authentic certificates
•  MSME and startup documentation: Business plans, financial projections, and investor pitch decks shared during fundraising marked as CONFIDENTIAL to restrict external distribution
With RepetiGo you can add watermark to PDF free in India - type your watermark text, set opacity and rotation, and download in seconds. No subscription, no account, browser-only.
📋  Under India's DPDP Act 2023, marking documents as CONFIDENTIAL and restricting their distribution is a data handling best practice - particularly for documents containing personal data (employee records, client details, financial information). A visible watermark communicates sensitivity even when formal access controls are not in place.

H2: Why Is the Watermark Always Centred?
The current implementation automatically centres the watermark horizontally and vertically on the page. This is the most common and visually clean placement for text watermarks - a centred diagonal watermark is immediately recognisable as a watermark, not as a content element.
Custom X/Y positioning - placing a watermark in a specific corner or at a specific coordinate - is not currently available. If you need watermarks at specific positions (for example, a bottom-right corner stamp), alternative approaches include:
•  Use the Add Page Numbers tool for sequential stamp-style text in 6 fixed positions (header/footer)
•  Use the Edit PDF tool to place text boxes at specific positions on any page
•  Use Adobe Acrobat Pro or LibreOffice for full positioning control over watermark placement

H2: Your Files Never Leave Your Browser.
RepetiGo's PDF tools run entirely in your browser. Your PDF is never uploaded to any server - it is processed locally on your device.

Protection Layer
What It Means in Practice
🔒 Browser-only processing
Your file never travels over any network. No server receives it. No upload of any kind occurs.
🔐 No server session
There is no remote processing session or isolated server workspace. Everything runs inside your browser tab.
🚫 No account = no data
No sign-up means we hold zero personal data. No file history, no name, no email stored anywhere.
👁️ Content never leaves device
No text, image, or document content is sent to or read by any external system or person.
✅ Cleared on tab close
All local working data is cleared when you close or refresh the browser tab. Nothing persists.

🔒  Your file never leaves your device - not for 60 minutes, not ever. Browser-only processing is stronger privacy than any server-side deletion policy.
Privacy Policy → /security/ | Browser-only processing - no upload, no storage

H2: Add Watermark for Print Shops - Built into PrintPilot.
Print shop operators and CSC centre staff who regularly process customer documents can use the watermark tool as part of PrintPilot - RepetiGo's print shop management software.
Common print shop watermarking workflows:
•  Apply a shop name or COPY watermark to printed documents before handing them back to customers - establishes that the printed copy is a reproduction of the original
•  Mark customer-submitted drafts as DRAFT before editing or scanning, to distinguish working copies from originals
•  Apply SAMPLE watermarks to template documents used as printing references
🖨️  PrintPilot integrates all 30 PDF tools into the print shop workflow. Customer documents uploaded via QR code can be watermarked, compressed, rotated, and printed without switching between separate tools.

➜  [ Try PrintPilot Free - Print Shop Automation for India → repetigo.com/products/printpilot/ ]

H2: Common Questions About Adding Watermarks to PDFs.
H3: Q1: How do I add a watermark to a PDF for free?
Go to repetigo.com/tools/pdf/add-watermark/, upload your PDF, select the pages to watermark, enter your watermark text (up to 60 characters), set opacity, rotation, font size and colour, and click Add Watermark. Download the watermarked PDF. No account needed, browser-only processing - your file is never uploaded to any server.
H3: Q2: How do I add a DRAFT watermark to a PDF?
Upload your PDF to the watermark tool, type 'DRAFT' in the watermark text field, set opacity to around 50-60% so it is clearly visible but not obscuring the content, set rotation to 45° for the standard diagonal orientation, and click Add Watermark. The DRAFT label appears diagonally centred across every selected page. The same process works for CONFIDENTIAL, COPY, FOR REVIEW, SAMPLE, or any custom text.
H3: Q3: Can I add an image or logo as a watermark?
No - RepetiGo's watermark tool supports text watermarks only. You can enter up to 60 characters of text as your watermark label. For image or logo watermarks, you would need a tool that supports image overlays - such as Adobe Acrobat Pro or a desktop PDF editor.
H3: Q4: Can I position the watermark in a specific corner or location?
The watermark is automatically centred on the page. Custom X/Y positioning - placing the watermark in a specific corner or at specific coordinates - is not currently available. For precisely positioned text, use the Edit PDF tool to place a text box at any location on the page.
H3: Q5: Is the watermark permanent - can it be removed?
The watermark is embedded directly into the PDF page content at the pixel/vector level - not placed as a removable annotation or comment layer. In a standard PDF reader, there is no 'remove watermark' option. However, with professional PDF editing tools, a determined user could potentially redraw the page or use image editing to remove a watermark. For documents where tamper-resistance is critical, combine the watermark with password protection using the Protect PDF tool at /tools/pdf/protect-pdf/.
H3: Q6: What is the maximum opacity for the watermark?
The opacity slider ranges from 5% (nearly transparent - very subtle, barely noticeable) to 80% (clearly visible, strong overlay). 100% opacity is not available - at maximum 80%, the watermark is strongly visible while still allowing the underlying page content to be read through it. For most professional watermarking purposes, 50-65% opacity is the standard recommended range.
H3: Q7: How do I add a watermark to only specific pages?
The page selector shows thumbnails of every page in your PDF. Click any page thumbnail to toggle whether it receives the watermark. Pages with a selected/highlighted state receive the watermark; unselected pages pass through unchanged. This lets you apply the watermark only to the main content pages while skipping the cover, index, or appendix pages.
H3: Q8: Does adding a watermark change the file size?
Adding a text watermark increases the file size slightly - the additional text content and positioning data adds a small amount to the file. For typical A4 documents, the increase is minimal (usually less than 5-10 KB per page). If you need to reduce the file size after watermarking, use the Compress PDF tool at /tools/pdf/compress-pdf/.

H2: More Free PDF Editing Tools from RepetiGo.
•  Add Page Numbers → /tools/pdf/add-page-numbers/ - add sequential numbers in 6 positions
•  Edit PDF → /tools/pdf/edit-pdf/ - add text boxes at specific positions on any page
•  Protect PDF → /tools/pdf/protect-pdf/ - combine with watermark for stronger document control
•  Rotate PDF → /tools/pdf/rotate-pdf/ - fix page orientation before watermarking
•  All PDF Tools → /tools/pdf/ - complete free PDF toolkit

➜  [ Add Watermark to Your PDF Free - No Sign-Up → repetigo.com/tools/pdf/add-watermark/ ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function WatermarkPdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><JsonLd /><article className="tool-seo-content" id="watermark-pdf-guide"><StructuredSeoCopy content={content} /></article><PdfEditTool slug="watermark-pdf" headingLevel="h2" /></div></DashboardShell>;
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "📱", "🇮🇳", "🔒", "🖨️", "✅", "⚠️", "📋"];

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
        if (lines.length && lines.every((line) => /^(?:➜|➤|→)?\s*\[.*\]$/.test(line))) {
          return <div className="tool-seo-cta-stack" key={index}>{lines.map((line) => <CtaLine key={line} text={line} />)}</div>;
        }
        if (lines.length && lines.every((line) => line.startsWith("•") || /^\d+\.\s/.test(line))) {
          return <ul className="tool-seo-list" key={index}>{lines.map((line) => <li key={line}>{renderInlineMappedLinks(line.replace(/^•\s*|^\d+\.\s*/, ""))}</li>)}</ul>;
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
  if (lines[0] === "Who" && lines[1] === "What They Watermark" && lines[2] === "Typical Text Used") return { headers: ["Who", "What They Watermark", "Typical Text Used"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Setting" && lines[1] === "Range" && lines[2] === "What It Controls" && lines[3] === "Best Practice") return { headers: lines.slice(0, 4), rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Feature" && lines[1] === "RepetiGo" && lines[2] === "Adobe Acrobat Pro" && lines[3] === "Smallpdf / iLovePDF") return { headers: lines.slice(0, 4), rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Protection Layer" && lines[1] === "What It Means in Practice") return { headers: ["Protection Layer", "What It Means in Practice"], rows: chunkRows(lines.slice(2), 2) };
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
  const inner = text.trim().replace(/^(?:➜|➤|→)\s*/, "").replace(/^\[\s*/, "").replace(/\s*\]$/, "");
  const arrowIndex = inner.indexOf("→");
  const label = arrowIndex >= 0 ? inner.slice(0, arrowIndex).trim() : inner.trim();
  const href = arrowIndex >= 0 ? mapSeoRoute(inner.slice(arrowIndex + 1)) : "";
  return <a className="tool-seo-inline-cta" href={href || "#watermark-pdf-guide"}>{label}{href ? <span>→</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:tools\/pdf\/[a-z-]+|pricing)\/?|\/tools\/pdf\/[a-z-]*\/?|\/tools\/pdf\/?|\/products\/printpilot\/?|\/features\/auto-delete\/?|\/security\/?|\/pricing\/?)/g);
  return parts.map((part, index) => {
    const href = mapSeoRoute(part.startsWith("repetigo.com") ? "https://" + part : part);
    if (!href) return part;
    return <a href={href} key={part + "-" + index}>{getRouteLabel(href)}</a>;
  });
}

function mapSeoRoute(route: string) {
  const cleanRoute = route.trim().replace(/^https?:\/\/(www\.)?repetigo\.com/i, "").replace(/\/$/, "");
  const routeMap: Record<string, string> = {
    "/tools/pdf": "/pdf-tools",
    "/pdf-tools": "/pdf-tools",
    "/pdf-tools/watermark-pdf": "/pdf-tools/watermark-pdf",
    "/pdf-tools/add-page-numbers": "/pdf-tools/page-numbers",
    "/pdf-tools/protect-pdf": "/pdf-tools/protect-pdf",
    "/pdf-tools/crop-pdf": "/pdf-tools/crop-pdf",
    "/pdf-tools/sign-pdf": "/pdf-tools/sign-pdf",
    "/pdf-tools/merge-pdf": "/pdf-tools/merge-pdf",
    "/pdf-tools/edit-pdf": "/pdf-tools/edit-pdf",
    "/pdf-tools/rotate-pdf": "/pdf-tools/rotate-pdf",
    "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf",
    "/products/printpilot": "/print-automation",
    "/features/auto-delete": "/privacy-policy",
    "/security": "/privacy-policy",
    "/pricing": "/pricing",
  };
  if (routeMap[cleanRoute]) return routeMap[cleanRoute];
  if (/^\/tools\/pdf\//.test(cleanRoute)) return `/pdf-tools/${cleanRoute.split("/")[3]}`;
  return "";
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/pdf-tools": "Explore All PDF Tools",
    "/pdf-tools/watermark-pdf": "Open Add Watermark",
    "/pdf-tools/page-numbers": "Open Add Page Numbers",
    "/pdf-tools/protect-pdf": "Open Protect PDF",
    "/pdf-tools/crop-pdf": "Open Crop PDF",
    "/pdf-tools/sign-pdf": "Open Sign PDF",
    "/pdf-tools/merge-pdf": "Open Merge PDF",
    "/pdf-tools/edit-pdf": "Open Edit PDF",
    "/pdf-tools/rotate-pdf": "Open Rotate PDF",
    "/pdf-tools/compress-pdf": "Open Compress PDF",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PDF Watermark Tool", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF watermark tool - stamp custom text (up to 60 characters) on selected pages, with adjustable opacity (5-80%), rotation, font size, and colour. Text-only, always centred. Runs entirely in the browser - no file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Add a Watermark to a PDF", step: [{ "@type": "HowToStep", name: "Upload Your PDF and Select Pages", text: "Upload Your PDF and Select Pages" }, { "@type": "HowToStep", name: "Enter Watermark Text and Customise Settings", text: "Enter Watermark Text and Customise Settings" }, { "@type": "HowToStep", name: "Download Your Watermarked PDF", text: "Download Your Watermarked PDF" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Add Watermark", item: pageUrl }] };
  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
