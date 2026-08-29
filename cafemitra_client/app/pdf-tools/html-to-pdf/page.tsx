import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import ConversionTool from "../ConversionTool";

const pageUrl = "https://repetigo.com/pdf-tools/html-to-pdf";

export const metadata: Metadata = {
  title: "HTML to PDF Converter - Free Online, No Sign-Up | RepetiGo",
  description: "Convert HTML to PDF free online - upload an .html file and download a clean text PDF in seconds. No sign-up, no install. Files browser-only - never uploaded.",
  alternates: { canonical: pageUrl },
  twitter: { card: "summary_large_image", title: "HTML to PDF Converter Free Online - RepetiGo", description: "Convert HTML to PDF free - upload your file. No sign-up, no install, browser-only - never uploaded." },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: HTML to PDF Converter. Free Online. Upload .html Files.
RepetiGo's free HTML to PDF converter converts uploaded HTML files into plain-text PDF documents - without writing a single line of code, installing any software, or creating an account. Upload your .html file and download a PDF with the text content extracted. Note: CSS styling and images are not preserved - the output is the text content of your HTML file. Done.
The HTML to PDF free tool works on any device with a browser - phone, tablet, or laptop. Your file is processed entirely within your browser - never uploaded, never stored, never shared.
✓ No Sign-Up Required  ✓ No Software to Install  ✓ No Coding Needed  ✓ Files Never Uploaded - Browser-Only Processing

➜  [ Convert HTML to PDF Now - Free, No Sign-Up → repetigo.com/tools/pdf/html-to-pdf/ ]

H2: What Does Converting HTML to PDF Actually Do?
When you convert HTML to PDF, the text content is extracted from your HTML file and placed into a PDF. CSS styling, images, and visual layout are not preserved - the output contains the readable text from your HTML. For full visual rendering, use your browser's File → Print → Save as PDF option.
An HTML file is a living document - it depends on a browser to display it, and it can look different on different screens. A PDF is a fixed document - it looks exactly the same everywhere it is opened, on any device, in any PDF reader. Converting HTML to PDF with this tool gives you a portable, fixed text record of your HTML's content - not its original visual design.
You might need to convert HTML to PDF to:
•  Save a downloaded or exported HTML page as a permanent, portable text record.
•  Share the text content of a web-designed report, certificate, or form as a PDF attachment.
•  Get a plain-text PDF copy of an HTML file for archiving or search.
•  Submit the text content of an HTML-based document to a portal that requires PDF format.
•  Create a text-only PDF record of a web-based invoice, receipt, or ticket you have saved as HTML.

💡  Converting HTML to PDF is different from printing a webpage. This tool extracts text content from your HTML file and outputs it as a readable PDF. For a visually styled conversion (CSS preserved), use your browser's File → Print → Save as PDF option instead.

H2: How to Convert HTML to PDF in 3 Steps.
Every conversion happens in the same three steps. There is no account to create, no software to install, and no daily limit on how many files you can convert.

H3: Step 1 - Upload Your HTML File
Click Upload or drag and drop your .html or .htm file into the upload area. You can select multiple files at once if you need to convert several. There is no fixed file size limit - conversion runs in your own browser. No account required.
H3: Step 2 - RepetiGo Extracts the Text
As soon as you upload, RepetiGo reads the visible text content of your HTML file - stripping out script, style, and hidden elements - and lays it out as plain paragraphs in a new PDF. There are no page size, margin, or background settings to configure; the output is a straightforward, readable text document, not a styled reproduction of the page.
H3: Step 3 - Download Your PDF
After processing - usually under 30 seconds for most files - a download button appears. Click it to save your HTML to PDF output to your device. Nothing is uploaded - the file is processed and saved locally in your browser. The original HTML file on your device is not affected.
📱  The HTML to PDF converter works on mobile browsers - Safari on iPhone, Chrome on Android - without any app download. Upload an HTML file directly from your Files app. Useful for turning a saved HTML form or document into a PDF on the go.

➜  [ Convert Your HTML to PDF Now - Free → repetigo.com/tools/pdf/html-to-pdf/ ]

H2: Can I Convert a Webpage URL Directly? What This Tool Actually Supports.
RepetiGo's HTML to PDF converter works on a saved .html or .htm file - it does not accept a web address (URL) directly, and it does not fetch a live page for you. If you want to turn a webpage into a PDF, you have two options:
1.  Save the page as HTML first: in your browser, use File → Save Page As → Webpage, HTML Only, then upload the saved .html file here to get its text content as a PDF.
2.  Use your browser's built-in Print to PDF instead: for a visually accurate copy of the page - with images, CSS, and layout intact - open the page and use your browser's File → Print → Save as PDF option. This captures the page exactly as your browser renders it, which RepetiGo's text-extraction tool does not attempt to replicate.
💡  If you need the exact visual design of a webpage preserved, your browser's print-to-PDF (or a dedicated screenshot-to-PDF tool) will get you there. RepetiGo's converter is built for quickly getting an HTML file's text content into a portable PDF, not for pixel-accurate page capture.

H2: Does HTML to PDF Preserve Formatting and Styles?
This is the most important technical question about HTML to PDF conversion. The short answer: no - this tool is a plain-text extractor, not a rendering engine.
Element
Preservation
Notes
CSS inline styles
✗ Not applied
Only the visible text content is extracted; all styling is stripped
<style> tag CSS
✗ Not applied
Style blocks are removed before text extraction
External CSS files (linked)
✗ Not applied
Not fetched or applied - this tool does not load external resources
Web fonts (Google Fonts, etc.)
✗ Not applied
Output uses a standard PDF font regardless of the HTML's fonts
Images (embedded / base64)
✗ Not included
Only text is extracted; no images appear in the output
Images (external URLs)
✗ Not included
Not fetched or embedded
Background colours
✗ Not applied
Output is plain black text on a white PDF page
Print CSS (@media print)
✗ Not applied
Not read or applied
Flexbox / Grid layouts
✗ Not applied
Visual layout is discarded; text is extracted in document order
JavaScript-rendered content
✗ Not included
Only the HTML file's static markup is read; no scripts run
Animations / Videos
✗ Not preserved
Not applicable - only readable text is extracted

💡  In short: this tool pulls the words out of your HTML file quickly and for free, entirely in your browser - it does not try to reproduce the page's look. If formatting matters for your output, use your browser's File → Print → Save as PDF instead, which applies the full CSS, images, and layout exactly as the browser renders them.

H2: Who Should Use a Free HTML to PDF Converter?
Use Case
Why Convert HTML to PDF?
What to Expect
🎓 Student saving a research article or web-based assignment
PDF is required for submission; webpage link may break later
Save the page as HTML first, then upload - you get the text content, not a visual copy
👔 Professional saving an online invoice or receipt
Need a permanent, printable copy for accounts or expenses
Better suited to a receipt already saved as HTML; for a visual copy, use your browser's print-to-PDF instead
🏛️ Government form or portal page (India-specific)
Many government portals display forms in HTML; submission requires PDF
Save the portal page as HTML first, then upload here for a text-only PDF
💼 Developer building HTML templates
Need a quick check of a template's text content before wiring up a real rendering pipeline
Upload the .html file directly - useful for a fast text check, not a visual preview
🖨️ Print shop converting customer HTML files
Customer submits an HTML-based certificate or invitation; shop needs the text content quickly
Upload the customer's .html file - this extracts text only, not the visual design
📄 Anyone wanting a plain-text PDF record of an HTML file
Webpages can disappear; a PDF is a permanent, searchable text archive
Save the page as HTML first, then upload for a lightweight, text-only archive

H2: How to Convert HTML to PDF Without Coding.
There are many ways to convert HTML to PDF - from browser tricks to developer libraries. If you need to do it regularly as part of an application, a code library like wkhtmltopdf, Puppeteer, or WeasyPrint is the right tool. But if you just need to convert HTML to PDF once - or a handful of times - without writing any code, here are your options:
Method
Cost
Requires Coding?
Quality
Best For
RepetiGo HTML to PDF
Free
No
High for plain text; no CSS or images preserved
One-off text extraction, any user
Browser Print to PDF
Free
No
High - full CSS, images, and layout preserved
A visually accurate copy of a page
wkhtmltopdf
Free
Yes (command line)
Very High
Developers, batch processing
Puppeteer / Playwright
Free
Yes (JavaScript)
Very High
Developers, dynamic content
Adobe Acrobat
Paid
No
High
Enterprise users with subscription
ilovepdf HTML to PDF
Free (limited)
No
Medium
Occasional use, no account

✅  For non-developers who just need the text out of an HTML file without writing any code, RepetiGo's tool is the straightforward option: upload the file, download the PDF. No terminal, no npm install, no API key.

H2: HTML to PDF Converter for India.
India's digital document ecosystem has a specific need for HTML to PDF conversion that most global tools don't address directly:
•  Government portal forms: UIDAI, MCA21, Income Tax, EPFO, DigiLocker - many display data in HTML format. Saving these as PDF is often required for submission elsewhere or as a permanent record.
•  State-specific certificates: caste certificates, income certificates, residence proofs issued by state portals are often HTML-rendered pages. Converting them to PDF creates an archivable, printable copy.
•  Educational portals: CBSE, state board, university result pages are often HTML. Students need PDF copies for mark sheet submission, college applications, and scholarship forms.
•  GST invoices and tax documents: many accounting systems generate HTML invoices. Converting them to PDF is required for client sharing and audit records.
•  CSC centre workflows: Common Service Centre operators often receive HTML-format documents from customers. Converting to PDF before printing ensures consistent formatting across printers.
With RepetiGo you can convert HTML to PDF online free in India - save the government portal page as HTML and upload it here, and download a clean text PDF. Because nothing is stored and no sign-up is needed, your government documents never sit on a stranger's server.
⚠️  Under India's DPDP Act 2023, documents containing personal information (Aadhaar numbers, PAN, financial data) deserve careful handling. RepetiGo processes your file entirely in your browser - nothing is uploaded.

H2: Your HTML File Is Safe. Always.
When you upload an HTML file for conversion, you may be processing a document containing personal or confidential information. Here is exactly what happens:
Protection Layer
What It Means in Practice
🔒 Stays in Your Browser
Your HTML file is processed entirely within your browser - it is never uploaded to any server.
🔐 Local Browser Processing
Your file is processed in a temporary session with no link to any account, user ID, or persistent identifier. We do not know who you are.
🗑️ Never Uploaded
Your original HTML file and the PDF output are both processed locally in your browser and never sent to any server. Nothing is retained.
👁️ No Content Is Read
The conversion happens locally on your device - no one at RepetiGo reads, stores, or has access to your document's content.
🚫 No Account = No Data Profile
Since no sign-up is required, we hold zero personal data about you. No name, email, usage history, or file history is stored anywhere.

🔒  Your HTML file and converted PDF are processed locally in your browser - never stored on any server. You always retain your original file on your own device.
Read our Privacy Policy → /security/ | Learn about Secure Document Processing → /use-cases/secure-printing/

H2: HTML to PDF for Print Shops - The Automated Way.
If you run a print shop, cyber cafe, or CSC centre, you occasionally receive HTML files from customers who need them printed - web-designed invitations, certificates built in HTML, or downloaded portal forms. The standalone HTML to PDF tool handles these one at a time. But if you're processing a high volume of documents daily, manual conversion for each file is not practical.
This is where PrintPilot - RepetiGo's print shop software - changes the workflow. When a customer uploads a document via QR code, the PrintPilot AI processing engine handles format conversion, optimisation, and print-ready preparation automatically - whether the source is an HTML file, a scanned PDF, or an image.
🖨️  PrintPilot automatically converts, compresses, orients, enhances, and formats every customer document before it enters the print queue. What the standalone HTML to PDF converter does in 3 manual steps, PrintPilot does automatically - for every document, every time.
Learn about PrintPilot → /products/printpilot/ | QR Document Upload → /features/qr-upload/

➜  [ Try PrintPilot Free - Full Print Shop Automation → repetigo.com/pricing/ ]
[ Or Just Convert an HTML File Now → repetigo.com/tools/pdf/html-to-pdf/ ]

H2: Common Questions About Converting HTML to PDF Online Free.
H3: Q1: How do I convert HTML to PDF online for free in India?
To convert HTML to PDF free using RepetiGo: go to repetigo.com/tools/pdf/html-to-pdf/, upload your .html file, and click Convert. Your PDF downloads automatically. No account is required. No software is needed. The HTML to PDF free tool works from any browser in India - on phone or laptop - with no restrictions or daily limits.
H3: Q2: Can I convert a URL/webpage directly, or only an HTML file?
Only a saved HTML file - RepetiGo's converter does not accept a web address or fetch a live page for you. If you want to convert a webpage, first save it from your browser (File → Save Page As → Webpage, HTML Only), then upload the saved .html file here. Keep in mind this tool extracts text content only; it does not preserve CSS, images, or layout even from a saved page. For a visually accurate copy of a webpage, use your browser's own File → Print → Save as PDF instead.
H3: Q3: How do I save a webpage as a PDF?
For a text-only PDF: save the webpage from your browser as an HTML file (File → Save Page As → Webpage, HTML Only), then upload that .html file to RepetiGo and download the text-content PDF. For a visually accurate copy of the page - with images, CSS, and layout intact - your browser's own File → Print → Save as PDF option is the better tool for the job; RepetiGo's converter is built for extracting readable text, not for pixel-accurate page capture.
H3: Q4: Does HTML to PDF preserve my CSS formatting and styles?
No - RepetiGo's HTML to PDF converter extracts the readable text content of your HTML file only; CSS (inline, <style> blocks, and linked stylesheets), images, fonts, and layout are all stripped out before conversion. If you need your styling preserved, use your browser's File → Print → Save as PDF option instead, which renders the page with its full CSS applied.
H3: Q5: What is the best free HTML to PDF converter online?
For Indian users and general use, RepetiGo's HTML to PDF converter offers: no sign-up required, no daily limit, genuinely private browser-only processing (nothing is ever uploaded), and no watermark on the output. It's a fast way to pull the text content out of a saved HTML file - for a visually accurate copy of a page instead, your browser's own File → Print → Save as PDF will preserve the CSS, images, and layout that RepetiGo's text-extraction tool does not.
H3: Q6: Can I convert HTML to PDF without Adobe Acrobat?
Yes. Adobe Acrobat Pro can convert HTML to PDF but requires a paid subscription. RepetiGo lets you convert HTML to PDF without Adobe for free - in any browser, without installing any software. Open the tool, upload your .html file, and download. No licence required.
H3: Q7: How do I convert HTML to PDF without coding?
Use RepetiGo's free online HTML to PDF converter. No code, no terminal, no npm packages. Upload your .html file and download the PDF. The tool handles the text extraction and PDF creation locally, right in your browser. If you later need to automate HTML to PDF conversion at scale for an application, a code library or API-based service designed for that purpose - rather than a browser tool - would be the right choice.
H3: Q8: Does the HTML to PDF converter work on a mobile phone?
Yes. RepetiGo's HTML to PDF tool works on any mobile browser - Safari on iPhone, Chrome on Android - without any app download. Upload your HTML file from your phone's Files app. The conversion runs locally in your phone's browser - lightweight enough that it works smoothly even on modest devices. The downloaded PDF saves directly to your device.
H3: Q9: Is it safe to upload an HTML file to an online converter?
With RepetiGo, yes. Your file is processed entirely within your browser - never uploaded to any server. The conversion engine processes the HTML structure locally - it does not extract or store the content of your file anywhere else. No sign-up means no data profile is created. For HTML files containing personal information or confidential data, this browser-only processing protects you.
H3: Q10: Why doesn't my converted PDF look exactly like the webpage?
Because this tool doesn't try to reproduce the webpage visually - it extracts the readable text only, by design. CSS styling, images, fonts, colours, and layout from the HTML are all stripped out before conversion, regardless of how the page looked in a browser. If you need a PDF that looks like the actual page, use your browser's own File → Print → Save as PDF option instead, which renders the page with its full styling applied.

H2: More Free PDF Tools from RepetiGo.
Tool
URL
Best For
JPG to PDF
/tools/pdf/jpg-to-pdf/
Convert image files to PDF
Word to PDF
/tools/pdf/word-to-pdf/
Convert Word .docx to PDF
PowerPoint to PDF
/tools/pdf/powerpoint-to-pdf/
Convert presentation slides to PDF
Compress PDF
/tools/pdf/compress-pdf/
Reduce PDF file size
Merge PDF
/tools/pdf/merge-pdf/
Combine multiple PDFs into one
All PDF Tools →
/tools/pdf/
View the complete free PDF tools library

➜  [ Convert HTML to PDF Free Now → repetigo.com/tools/pdf/html-to-pdf/ ]
No sign-up · Browser-only processing · .html file upload`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function HtmlToPdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><ConversionTool slug="html-to-pdf"><JsonLd /><article className="tool-seo-content" id="html-to-pdf-guide"><StructuredSeoCopy content={content} /></article></ConversionTool></div></DashboardShell>;
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "📱", "🇮🇳", "🔒", "🖨️", "✅", "⚠️"];

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
  if (lines[0] === "Element" && lines[1] === "Preservation" && lines[2] === "Notes") return { headers: ["Element", "Preservation", "Notes"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Use Case" && lines[1] === "Why Convert HTML to PDF?") return { headers: ["Use Case", "Why Convert HTML to PDF?", "What to Expect"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Method" && lines[1] === "Cost") return { headers: ["Method", "Cost", "Requires Coding?", "Quality", "Best For"], rows: chunkRows(lines.slice(5), 5) };
  if (lines[0] === "Protection Layer" && lines[1] === "What It Means in Practice") return { headers: ["Protection Layer", "What It Means in Practice"], rows: chunkRows(lines.slice(2), 2) };
  if (lines[0] === "Tool" && lines[1] === "URL" && lines[2] === "Best For") return { headers: ["Tool", "Link", "Best For"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={href || "#html-to-pdf-guide"}>{label}{href ? <span>→</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:tools\/pdf\/[a-z-]+|pricing)\/?|\/tools\/pdf\/[a-z-]*\/?|\/tools\/pdf\/?|\/products\/printpilot\/?|\/features\/qr-upload\/?|\/features\/auto-delete\/?|\/security\/?|\/pricing\/?|\/use-cases\/secure-printing\/?)/g);
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
    "/pdf-tools/html-to-pdf": "/pdf-tools/html-to-pdf",
    "/pdf-tools/jpg-to-pdf": "/pdf-tools/jpg-to-pdf",
    "/pdf-tools/word-to-pdf": "/pdf-tools/word-to-pdf",
    "/pdf-tools/powerpoint-to-pdf": "/pdf-tools/powerpoint-to-pdf",
    "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf",
    "/pdf-tools/merge-pdf": "/pdf-tools/merge-pdf",
    "/products/printpilot": "/print-automation",
    "/features/qr-upload": "/print-automation",
    "/features/auto-delete": "/privacy-policy",
    "/security": "/privacy-policy",
    "/use-cases/secure-printing": "/privacy-policy",
    "/pricing": "/pricing",
  };
  if (routeMap[cleanRoute]) return routeMap[cleanRoute];
  if (/^\/tools\/pdf\//.test(cleanRoute)) return `/pdf-tools/${cleanRoute.split("/")[3]}`;
  return "";
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/pdf-tools": "Explore All PDF Tools",
    "/pdf-tools/html-to-pdf": "Open HTML to PDF",
    "/pdf-tools/jpg-to-pdf": "Open JPG to PDF",
    "/pdf-tools/word-to-pdf": "Open Word to PDF",
    "/pdf-tools/powerpoint-to-pdf": "Open PowerPoint to PDF",
    "/pdf-tools/compress-pdf": "Open Compress PDF",
    "/pdf-tools/merge-pdf": "Open Merge PDF",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo HTML to PDF Converter", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online HTML to PDF converter that extracts a saved HTML file's text content into a PDF. Runs entirely in the browser - no file is ever uploaded to a server. Does not accept URLs and does not preserve CSS, images, or layout.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Convert HTML to PDF Online Free", step: [{ "@type": "HowToStep", name: "Upload your HTML file" }, { "@type": "HowToStep", name: "RepetiGo extracts the text" }, { "@type": "HowToStep", name: "Download your PDF" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "HTML to PDF", item: pageUrl }] };
  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
