import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import ConversionTool from "../ConversionTool";

const pageUrl = "https://repetigo.com/pdf-tools/pdf-to-powerpoint";

export const metadata: Metadata = {
  title: "PDF to PowerPoint Converter - Free Online, No Sign-Up | RepetiGo",
  description: "Convert PDF to PowerPoint free online - turn any PDF into editable .pptx slides in seconds. Fonts and layout preserved. No sign-up, no install. Files auto-deleted after 60 min.",
  alternates: { canonical: pageUrl },
  openGraph: { title: "PDF to PowerPoint Converter - Free Online, No Sign-Up | RepetiGo", description: "Convert PDF to PowerPoint free - turn any PDF into editable .pptx slides. Layout preserved. No sign-up, auto-deleted after 60 min.", type: "website", url: pageUrl, images: ["https://repetigo.com/og-pdf-to-ppt.jpg"] },
  twitter: { card: "summary_large_image", title: "PDF to PowerPoint Converter Free Online - RepetiGo", description: "Convert PDF to editable PowerPoint slides free. No sign-up, no install, auto-deleted." },
  robots: { index: true, follow: true },
};

const pdfToPowerPointContent = String.raw`H1: PDF to PowerPoint Converter. Free Online. Editable Slides in Seconds.
RepetiGo's free PDF to PowerPoint converter turns any PDF into a fully editable Microsoft PowerPoint .pptx file - without installing software, subscribing to Adobe Acrobat, or creating an account. Upload your PDF and download a presentation file you can actually edit, redesign, and present. Done.
The convert PDF to PowerPoint free tool works on any device with a browser - phone, tablet, laptop. Your file is automatically deleted 60 minutes after you download it. Nothing is stored. Nothing is shared.
✓ No Sign-Up Required  ✓ No Adobe Acrobat Needed  ✓ Editable .pptx Output  ✓ Files Auto-Deleted in 60 Minutes

➜  [ Convert PDF to PowerPoint Now - Free, No Sign-Up → repetigo.com/pdf-tools/pdf-to-powerpoint ]

H2: What Happens When You Convert a PDF to PowerPoint?
When you convert a PDF to PowerPoint, RepetiGo's conversion engine processes each page of your PDF and reconstructs it as a slide in a .pptx file. Text is extracted and placed in editable text boxes. Images are embedded as picture objects. The layout and positioning of each element is matched as closely as possible to the original PDF page.
The result is a .pptx file you can open in Microsoft PowerPoint, Google Slides, LibreOffice Impress, or Keynote - and edit, rearrange, add content to, or present directly. This is fundamentally different from a PDF viewer that just displays slides: you get actual, manipulable slide objects.
Why do people need to convert PDF to PowerPoint? Because presentations are often shared as PDFs to prevent editing - but sometimes the recipient needs to edit or reuse the content:
You Need to Convert PDF to PowerPoint When...
Example Scenario
You received a PDF presentation and need to add your own slides
Conference PDF deck you need to customise with your company branding
You need to update a presentation template saved as PDF
Annual report template issued as PDF that needs new data for this year
You're studying from PDF lecture slides and want to add notes
University lecture slides in PDF that you want to annotate in PowerPoint
You received a PDF proposal and want to reformat it as a presentation
Client brief PDF that needs to become a pitch deck
Your professor or manager sent a PDF deck and needs an editable version
Sharing a presentation with collaborators who need to edit specific sections
You want to extract individual slides from a PDF presentation as editable content
Taking one strong slide from a large PDF deck to reuse in a new presentation

💡  Converting a PDF to PowerPoint gives you editable slide objects - text, images, and shapes you can move, resize, and reformat. This is not a screenshot of your PDF placed on a slide. RepetiGo extracts the actual content elements and places them as editable PowerPoint objects.

H2: How to Convert PDF to PowerPoint in 3 Steps.
Every conversion happens in the same three steps. No account, no software, no daily limit.

H3: Step 1 - Upload Your PDF File
Click the Upload button or drag and drop your PDF into the upload area. The tool accepts any PDF - a text-based PDF, a PDF of slides, or a multi-page document you want to break into slides. Upload works on any device using your browser. No app download required.
For the best results: use a text-based PDF (not a scan). PDFs where you can select and copy text convert with the highest accuracy. Scanned PDFs require an extra OCR step - see the Scanned PDF section below.
H3: Step 2 - RepetiGo Converts Each Page into a Slide
After upload, RepetiGo's conversion engine processes your PDF page by page. Each page becomes one slide in the .pptx output. The engine:
•  Extracts all text from the page and places it in editable text boxes at matching positions
•  Embeds all images from the page as picture objects at their original locations
•  Reconstructs the page layout - headings, columns, tables, borders - as slide elements
•  Applies detected font families, sizes, and basic styles to the text objects
H3: Step 3 - Download Your Editable .pptx File
After processing - usually under 60 seconds for most PDFs - a download button appears. Click it to save your .pptx file to your device. Your file is automatically and permanently deleted from our servers within 60 minutes. The original PDF on your device is not affected.
📱  The PDF to PowerPoint converter works on mobile browsers - Safari on iPhone, Chrome on Android - without any app download. Upload a PDF from your Files app and download the .pptx directly to your device. The file can then be opened in the mobile PowerPoint app.

➜  [ Convert Your PDF to PowerPoint Now - Free → repetigo.com/pdf-tools/pdf-to-powerpoint ]

H2: What Gets Preserved - and What You May Need to Adjust.
Here is an honest breakdown of PDF to PowerPoint conversion results:
Element
Conversion Result
Notes
Running text
✓ Excellent for clear PDFs
Extracted into editable text boxes; font family and size matched
Standard fonts
✓ Good
Common fonts matched in PowerPoint output
Custom/embedded fonts
⚠️ Good
Closest available font substituted if custom font not found
Images and photos
✓ Excellent
Embedded as editable picture objects at original quality
Tables
⚠️ Good
Simple tables reconstructed; complex tables may need reformatting
Single-column layouts
✓ Very Good
Clean, well-structured PDFs convert with high accuracy
Multi-column complex layouts
⚠️ Variable
May produce text boxes that need repositioning on the slide
Charts and graphs (vector)
⚠️ Good
Preserved as image objects - not as editable PowerPoint charts
Animations and transitions
✕ Not generated
PDF is static; no animations in output - must be added manually
Slide background colours
⚠️ Variable
Detected where clearly defined; may need manual setting
Scanned PDFs (image-based)
⚠️ OCR required
Must run OCR on the PDF first to get editable text in output
Hyperlinks
✓ Preserved
Clickable links carried over to .pptx output

💡  For cleanest PDF to PowerPoint output: use a well-structured, text-based PDF with single-column layout and standard fonts. After conversion, review the slide layout - text box positions may need minor adjustment on slides with complex designs. Charts will appear as images and need to be recreated in PowerPoint if full editability is required.

H2: How to Convert a Scanned PDF to PowerPoint.
A scanned PDF contains images of pages, not actual text. When you upload a scanned PDF directly to a PDF to PowerPoint converter, each slide will contain an image of the page rather than editable text - because there is no text to extract. To get editable text in your PowerPoint slides from a scanned PDF, you need to complete two steps:
1.  Run OCR on the scanned PDF first using RepetiGo's OCR PDF tool at /pdf-tools/ocr-pdf. This adds a real text layer to the scan by recognising the characters in the image. Processing takes 10-60 seconds per page.
2.  Return to this page and upload the OCR-processed PDF. Now each page contains actual text that the converter can extract into editable text boxes on your PowerPoint slides.
💡  How to tell if your PDF is scanned: try selecting and copying text from it. If you cannot select any text, it is a scanned/image-based PDF and needs OCR before conversion. If you can select text, it is a text-based PDF and will convert directly.

H2: How to Convert PDF to PowerPoint Without Adobe Acrobat.
Adobe Acrobat Pro can export PDFs to PowerPoint .pptx format - but at the cost of a paid subscription. RepetiGo gives you the same output free, in any browser, on any device.
Method
Cost
Sign-Up?
Output Quality
Available On
RepetiGo PDF to PowerPoint
Free
No
High - editable text + images
Any browser
Adobe Acrobat Pro
Paid subscription
Yes
Very High - native conversion
Windows + Mac app
Microsoft Word (open PDF then paste)
Paid (Office 365)
Yes
Medium - manual workaround
Windows + Mac
Google Slides (insert PDF pages)
Free (Google account)
Yes
Medium - pages as images, not editable
Any browser
ilovepdf PDF to PPT
Free (limited)
No (basic)
Good
Any browser
Canva (import PDF)
Free (limited)
Yes
Good - some editability
Any browser

For Mac users: to convert PDF to PowerPoint on Mac, open RepetiGo in Safari or Chrome, upload your PDF, and download the .pptx. No software installation required. The downloaded file opens in Microsoft PowerPoint for Mac, Keynote, or LibreOffice Impress.
✅  RepetiGo is the only free, no-account, no-install option for converting PDF to PowerPoint that auto-deletes your file in 60 minutes - making it the right choice for confidential presentations.

H2: Who Should Use a Free PDF to PowerPoint Converter?
Use Case
Why Convert?
Expected Quality
🎓 Student adapting lecture slides
PDF lecture notes need annotation, extra content, and speaker note additions
Good - text-heavy lecture slides convert cleanly
👔 Professional customising a received proposal
PDF deck from a vendor or partner needs company branding applied
Good for text+image slides; complex graphic slides need adjustment
🏛️ Government officer updating a PDF report for presentation
Annual policy documents issued as PDF need to become slide presentations
Good - structured text PDFs convert accurately
📚 Researcher reusing conference PDF slides
Academic conference PDF proceedings where individual slides need extraction
Good - clean academic PDFs convert well
📋 Event organiser adapting a sponsor's PDF presentation
Sponsor delivered a PDF deck that needs co-branding added
Requires manual review of complex graphic slides
🖨️ Print shop customer needing editable version of a printed poster
Scanned or PDF poster needs to become an editable template - OCR first
OCR step needed for scans; layout review recommended

H2: PDF to PowerPoint for India.
India's academic, government, and professional environments generate significant volumes of PDF presentations that need to be converted to editable PowerPoint files:
•  IIT / NIT / University research submissions: Research papers and thesis presentations submitted as PDF must sometimes be converted back to .pptx for defence presentations, conference submissions, or republication with updated data.
•  UPSC and civil services study material: Study groups share exam preparation material as PDF presentations. Converting to PowerPoint enables annotation, rearrangement, and collaborative editing of study decks.
•  Government RFP and tender documents: Many government departments issue presentation-format RFPs as PDFs. Vendors converting the RFP to PowerPoint can structure their response slide by slide, ensuring they address each requirement.
•  Corporate training materials: Companies issue training modules as PDF presentations. HR teams converting them to PowerPoint can update content, add company-specific examples, and rebrand for internal use.
•  Conference poster PDFs: Academic and industry conference posters are often A0 or A1 PDF format. Converting to PowerPoint enables resizing to different formats and extraction of individual sections for slide presentations.
With RepetiGo you can convert PDF to PowerPoint online free in India - upload any PDF and download an editable .pptx in seconds. Because nothing is stored and no sign-up is needed, your research or business presentation never sits on a stranger's server.
⚠️  Under India's DPDP Act 2023, presentations containing personal data, financial projections, or confidential research deserve careful handling. Always use a tool that auto-deletes your file after processing.

H2: Your PDF Is Safe. Always.
When you upload a PDF for conversion, you may be sharing a confidential business presentation, unpublished research, or an internal company document. Here is exactly what happens:
Protection Layer
What It Means in Practice
🔒 HTTPS Encrypted Transfer
Your PDF travels from your device to our server over HTTPS (TLS encryption). It cannot be intercepted in transit.
🔐 Isolated Processing Session
Your file is processed in a temporary session with no link to any account, user ID, or persistent identifier. We do not know who you are.
🗑️ Auto-Deleted in 60 Minutes
Your original uploaded PDF and the converted .pptx are both automatically deleted from our servers within 60 minutes. Nothing is retained.
👁️ No Content Is Read
The conversion engine processes the PDF's visual structure and text positions. No human reads your document. Content is never extracted for any other purpose.
🚫 No Account = No Data Profile
Since no sign-up is required, we hold zero personal data about you. No name, email, usage history, or file history is stored anywhere.

🔒  Your PDF and converted PowerPoint file are deleted 60 minutes after download. If you close the browser before downloading, both are deleted within the hour regardless.
Read our Privacy Policy → /security/ | Learn about Auto-Delete → /features/auto-delete/

H2: PDF to PowerPoint for Print Shops - The Automated Way.
If you run a print shop, cyber cafe, or CSC centre, customers occasionally bring PDF presentations they need printed as individual slides or as handouts - conference posters, project reports, academic presentations. When the customer later asks for an editable version to update before reprinting, the standalone PDF to PowerPoint converter handles one-off conversions. For shops dealing with frequent document processing, PrintPilot's automated document workflow handles format detection and conversion as part of the print queue - no manual conversion needed.
🖨️  PrintPilot automatically processes every customer document - detecting format, running conversions where needed, applying AI quality enhancement, and delivering a print-ready file to your queue. What the standalone PDF to PowerPoint converter does manually, PrintPilot does automatically for every job.
Learn about PrintPilot → /products/printpilot/ | QR Document Upload → /features/qr-upload/

➜  [ Try PrintPilot Free - Full Print Shop Automation → repetigo.com/pricing/ ]
[ Or Just Convert a PDF Now → repetigo.com/pdf-tools/pdf-to-powerpoint ]

H2: Common Questions About Converting PDF to PowerPoint Online Free.
H3: Q1: How do I convert a PDF to PowerPoint for free?
To convert PDF to PowerPoint free using RepetiGo: go to repetigo.com/pdf-tools/pdf-to-powerpoint, click Upload and select your PDF file, wait for the conversion to complete (usually under 60 seconds), and download your .pptx file. No account is required. No software is needed. The tool works from any browser - on phone or laptop - with no daily limits and no watermarks on the output.
H3: Q2: Can I actually edit the slides after converting PDF to PowerPoint?
Yes - that is the point of converting PDF to PowerPoint. The output is a genuine .pptx file where text is in editable text boxes, images are moveable picture objects, and the slide layout can be changed. You can add new text, move elements, change fonts, add slides, apply a new theme, and present from the file normally. The quality of editability depends on the complexity of the original PDF: text-heavy, well-structured PDFs convert with the highest degree of editability. Graphic-heavy slides with complex layouts may have text placed in multiple boxes that you reorganise into a cleaner layout.
H3: Q3: Does converting PDF to PowerPoint preserve formatting?
For standard, text-based PDFs, yes - fonts, images, and basic layout are preserved. Text is placed in matching positions as editable text boxes; images are embedded at original quality. Complex multi-column layouts, custom fonts, and charts may need adjustments: charts from the PDF appear as image objects rather than editable PowerPoint charts; unusual fonts are substituted with the closest available font; multi-column layouts may need text box repositioning. After any PDF to PowerPoint conversion, a quick review of the slides is recommended.
H3: Q4: How do I convert a scanned PDF to PowerPoint?
Scanned PDFs contain images of text rather than actual text data. Uploading a scanned PDF directly to the PDF to PowerPoint converter will produce slides with images of the pages - not editable text. To get editable text from a scanned PDF: first run OCR on it using RepetiGo's OCR PDF tool at /pdf-tools/ocr-pdf - this adds a text layer to the scan. Then return here and convert the OCR-processed PDF to PowerPoint. The result will be slides with editable text boxes rather than static images.
H3: Q5: What is the best free PDF to PowerPoint converter?
For most users, RepetiGo's PDF to PowerPoint converter offers the strongest combination of features: no sign-up, no daily limit, genuine editable .pptx output (not slides with embedded images), automatic 60-minute file deletion for privacy, and no watermarks on the output. Adobe Acrobat Pro produces excellent output but requires a paid subscription. Google Slides can import PDFs but renders pages as images rather than extracting editable text. Canva offers PDF import with some editability but requires a free account.
H3: Q6: How do I convert PDF to PowerPoint without Adobe Acrobat?
You don't need Adobe Acrobat. Acrobat Pro's PowerPoint export requires a paid subscription. RepetiGo lets you convert PDF to PowerPoint without Adobe for free - open the tool in any browser, upload your PDF, and download the .pptx file. No licence, no installation, no account required. The output quality is comparable to Acrobat for text-based PDFs.
H3: Q7: How do I convert PDF to PowerPoint on Mac?
To convert PDF to PowerPoint on Mac: open RepetiGo in Safari or Chrome, upload your PDF from Finder, wait for conversion, and download the .pptx file. You don't need Microsoft PowerPoint or Adobe Acrobat installed on your Mac. The downloaded .pptx can be opened in Microsoft PowerPoint for Mac, Keynote (with .pptx import), or LibreOffice Impress.
H3: Q8: Do animations come through when converting PDF to PowerPoint?
No - and this is expected. PDF is a static format with no animation data. When you convert a PDF to PowerPoint, each page is reconstructed as a static slide. No slide transitions, animations, or motion effects are generated in the output .pptx file - you would need to add these manually in PowerPoint after conversion. If your original presentation had animations that were 'frozen' into the PDF, you will get the final state of those animations as static objects on the slide.
H3: Q9: Is it safe to upload a presentation PDF to a free online converter?
With RepetiGo, yes. Your file is uploaded over an encrypted TLS connection, processed in an isolated workspace, and permanently deleted within 60 minutes. The conversion engine processes the document's structure - no content is read or stored by any person for any other purpose. No sign-up means no data profile is created. For confidential business presentations, unpublished research, and sensitive reports, this auto-deletion policy is essential.
H3: Q10: How large a PDF can I convert to PowerPoint?
RepetiGo's PDF to PowerPoint converter accepts files up to [FILE SIZE LIMIT]. For large PDFs with many high-resolution images, processing may take 1-3 minutes. If your PDF is very large, consider compressing it first with RepetiGo's Compress PDF tool at /pdf-tools/compress-pdf to reduce the file size before conversion. For very long presentations (50+ pages), consider splitting the PDF first into smaller sections for faster, more manageable conversion.

H2: More Free PDF Tools from RepetiGo.
Tool
URL
Best For
PowerPoint to PDF (reverse)
/pdf-tools/powerpoint-to-pdf
Convert .pptx back to PDF for sharing
PDF to Word
/pdf-tools/pdf-to-word
Convert PDF to editable Word .docx instead
OCR PDF
/pdf-tools/ocr-pdf
Make scanned PDFs searchable before converting
Compress PDF
/pdf-tools/compress-pdf
Reduce large PDF size before converting
Merge PDF
/pdf-tools/merge-pdf
Combine multiple PDFs before conversion
All PDF Tools →
/pdf-tools
View the complete free PDF tools library

➜  [ Convert PDF to PowerPoint Free Now → repetigo.com/pdf-tools/pdf-to-powerpoint ]
No sign-up · Auto-deletes in 60 minutes · Editable .pptx output`;

const faqSchemaQuestions = Array.from(pdfToPowerPointContent.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function PdfToPowerPointPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><ConversionTool slug="pdf-to-powerpoint"><JsonLd /><article className="tool-seo-content" id="pdf-to-powerpoint-guide"><StructuredSeoCopy content={pdfToPowerPointContent} /></article></ConversionTool></div></DashboardShell>;
}

type SeoTable = { headers: string[]; rows: string[][] };
type ContentBlock = { kind: "heading"; level: 1 | 2 | 3; text: string } | { kind: "table"; table: SeoTable } | { kind: "text"; lines: string[] };

function StructuredSeoCopy({ content }: { content: string }) {
  return <>{toContentBlocks(content).map((block, index) => {
    if (block.kind === "heading") {
      const Heading = `h${block.level}` as "h1" | "h2" | "h3";
      return <Heading key={index}>{block.text}</Heading>;
    }
    if (block.kind === "table") return <SeoTable key={index} {...block.table} />;
    if (block.lines[0]?.startsWith("✓")) return <div className="tool-seo-badges" key={index}>{block.lines.join(" ").split(/\s{2,}/).map((item) => <span key={item}>{item}</span>)}</div>;
    const ctas = block.lines.filter(isCtaLine);
    if (ctas.length) return <section className="tool-seo-copy-block" key={index}><div className="tool-seo-cta-stack">{ctas.map((line) => <CtaLine key={line} text={line} />)}</div>{block.lines.filter((line) => !isCtaLine(line)).map((line) => <p key={line}>{renderInlineMappedLinks(line)}</p>)}</section>;
    return <div className="tool-seo-copy-paragraph" key={index}>{block.lines.map((line, lineIndex) => <p key={lineIndex}>{renderInlineMappedLinks(line)}</p>)}</div>;
  })}</>;
}

function toContentBlocks(content: string): ContentBlock[] {
  const lines = content.split(/\r?\n/).map((line) => line.trim()); const blocks: ContentBlock[] = []; let paragraph: string[] = [];
  const flush = () => { if (paragraph.length) blocks.push({ kind: "text", lines: paragraph }); paragraph = []; };
  for (let index = 0; index < lines.length;) {
    const heading = lines[index].match(/^H([123]):\s*(.+)$/);
    const tableDefinition = getTableDefinition(lines, index);
    if (heading) { flush(); blocks.push({ kind: "heading", level: Number(heading[1]) as 1 | 2 | 3, text: heading[2] }); index += 1; continue; }
    if (tableDefinition) { flush(); const values: string[] = []; index += tableDefinition.headerLines; while (index < lines.length && lines[index]) { values.push(lines[index]); index += 1; } blocks.push({ kind: "table", table: { headers: tableDefinition.headers, rows: chunkRows(values, tableDefinition.headers.length) } }); continue; }
    if (!lines[index]) { flush(); index += 1; continue; }
    paragraph.push(lines[index]); index += 1;
  }
  flush(); return blocks;
}

function getTableDefinition(lines: string[], index: number): { headers: string[]; headerLines: number } | null {
  const first = lines[index]; const second = lines[index + 1]; const third = lines[index + 2];
  if (first === "You Need to Convert PDF to PowerPoint When..." && second === "Example Scenario") return { headers: [first, second], headerLines: 2 };
  if (first === "Element" && second === "Conversion Result" && third === "Notes") return { headers: [first, second, third], headerLines: 3 };
  if (first === "Method" && second === "Cost" && third === "Sign-Up?") return { headers: [first, second, third, lines[index + 3], lines[index + 4]], headerLines: 5 };
  if (first === "Use Case" && second === "Why Convert?" && third === "Expected Quality") return { headers: [first, second, third], headerLines: 3 };
  if (first === "Protection Layer" && second === "What It Means in Practice") return { headers: [first, second], headerLines: 2 };
  if (first === "Tool" && second === "URL" && third === "Best For") return { headers: ["Tool", "Link", "Best For"], headerLines: 3 };
  return null;
}

function chunkRows(values: string[], size: number) { const rows: string[][] = []; for (let index = 0; index < values.length; index += size) rows.push(values.slice(index, index + size)); return rows; }
function SeoTable({ headers, rows }: SeoTable) { return <div className="tool-seo-table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{renderTableCell(cell)}</td>)}</tr>)}</tbody></table></div>; }
function isCtaLine(line: string) { return /^[^\[]*\[ .+ \]$/.test(line); }
function CtaLine({ text }: { text: string }) { const inner = text.slice(text.indexOf("[") + 2, -2); const arrowIndex = inner.indexOf("→"); const label = (arrowIndex >= 0 ? inner.slice(0, arrowIndex) : inner).trim(); const href = mapSeoRoute(arrowIndex >= 0 ? inner.slice(arrowIndex + 1) : ""); return <a className="tool-seo-inline-cta" href={href || "#pdf-to-powerpoint-guide"}>{label}{href ? <span>→</span> : null}</a>; }
function renderTableCell(cell: string) { const href = mapSeoRoute(cell.replace(/^→\s*/, "")); return href ? <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a> : renderInlineMappedLinks(cell); }
function renderInlineMappedLinks(text: string) { return text.split(/(repetigo\.com\/(?:tools\/pdf\/[a-z-]+|pricing)\/?|\/tools\/pdf\/[a-z-]*\/?|\/products\/printpilot\/?|\/features\/(?:qr-upload|auto-delete)\/?|\/security\/?)/g).map((part, index) => { const href = mapSeoRoute(part.startsWith("repetigo.com") ? `https://${part}` : part); return href ? <a href={href} key={`${part}-${index}`}>{getRouteLabel(href)}</a> : part; }); }
function mapSeoRoute(route: string) { const clean = route.trim().replace(/^https?:\/\/(www\.)?repetigo\.com/i, "").replace(/\/$/, ""); const routes: Record<string, string> = { "/pdf-tools": "/pdf-tools", "/pdf-tools/pdf-to-powerpoint": "/pdf-tools/pdf-to-powerpoint", "/pdf-tools/powerpoint-to-pdf": "/pdf-tools/powerpoint-to-pdf", "/pdf-tools/pdf-to-word": "/pdf-tools/pdf-to-word", "/pdf-tools/ocr-pdf": "/pdf-tools/ocr-pdf", "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf", "/pdf-tools/merge-pdf": "/pdf-tools/merge-pdf", "/products/printpilot": "/print-automation", "/features/qr-upload": "/print-automation", "/features/auto-delete": "/privacy-policy", "/security": "/privacy-policy", "/pricing": "/pricing" }; return routes[clean] || ""; }
function getRouteLabel(href: string) { const labels: Record<string, string> = { "/pdf-tools": "Explore All PDF Tools", "/pdf-tools/pdf-to-powerpoint": "Open PDF to PowerPoint", "/pdf-tools/powerpoint-to-pdf": "Open PowerPoint to PDF", "/pdf-tools/pdf-to-word": "Open PDF to Word", "/pdf-tools/ocr-pdf": "Open OCR PDF", "/pdf-tools/compress-pdf": "Open Compress PDF", "/pdf-tools/merge-pdf": "Open Merge PDF", "/print-automation": "Learn About PrintPilot", "/privacy-policy": "Read Privacy Policy", "/pricing": "Start Free Trial" }; return labels[href] || "Open Tool"; }
function JsonLd() { const schemas = [{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PDF to PowerPoint Converter", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF to PowerPoint converter - turn any PDF into editable .pptx slides.", url: pageUrl }, { "@context": "https://schema.org", "@type": "HowTo", name: "How to Convert PDF to PowerPoint Online Free", step: [{ "@type": "HowToStep", name: "Upload PDF" }, { "@type": "HowToStep", name: "Convert each page to a slide" }, { "@type": "HowToStep", name: "Download .pptx" }] }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "PDF to PowerPoint", item: pageUrl }] }]; return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>; }
