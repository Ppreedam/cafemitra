import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import ConversionTool from "../ConversionTool";

const pageUrl = "https://repetigo.com/pdf-tools/pdf-to-word";

export const metadata: Metadata = {
  title: "PDF to Word Converter - Free Online, No Sign-Up | RepetiGo",
  description: "Convert PDF to Word free online - turn any PDF into an editable .docx file in seconds - text content extracted, ready to edit. No sign-up, no install. Files browser-only - never uploaded.",
  alternates: { canonical: pageUrl },
  openGraph: { title: "PDF to Word Converter - Free Online, No Sign-Up | RepetiGo", description: "Convert PDF to Word free - turn any PDF into an editable .docx in seconds. Layout preserved. No sign-up, browser-only - never uploaded.", type: "website", url: pageUrl, images: ["https://repetigo.com/og-pdf-to-word.jpg"] },
  twitter: { card: "summary_large_image", title: "PDF to Word Converter Free Online - RepetiGo", description: "Convert PDF to editable Word free. No sign-up, no install, browser-only - never uploaded." },
  robots: { index: true, follow: true },
};

const pdfToWordContent = String.raw`H1: PDF to Word Converter. Free Online. Editable Text in Seconds.
RepetiGo's free PDF to Word converter extracts the text content from your PDF into an editable Microsoft Word .docx file - without installing software, subscribing to Adobe Acrobat, or creating an account. Upload your PDF and download a .docx with the extracted text. Note: tables, images, and complex formatting are not preserved - this is a text extraction tool, best suited for text-based PDFs. Done.
The convert PDF to Word free tool works on any device with a browser - phone, tablet, laptop. Your file is processed entirely within your browser - never uploaded to any server, never stored, never shared.
✓ No Sign-Up Required  ✓ No Adobe Acrobat Needed  ✓ Editable Text .docx Output  ✓ Files Never Uploaded - Browser-Only Processing

➜  [ Convert PDF to Word Now - Free, No Sign-Up → repetigo.com/tools/pdf/pdf-to-word/ ]

H2: What Happens When You Convert a PDF to Word?
When you convert a PDF to Word, RepetiGo's conversion engine extracts the text content from your PDF and places it into a .docx file you can open and edit in Microsoft Word, Google Docs, LibreOffice, or any other word processor.
Why do people need to convert PDF to Word? Because PDFs are designed for reading, not editing. When someone sends you a PDF contract, a report, a form, or a certificate, the text is locked inside. You can read it but you can't easily change it. Converting the PDF to Word unlocks the document - you can correct errors, update details, copy paragraphs, and start reformatting the content in Word.
You Need to Convert PDF to Word When...
Common Example
You received a PDF and need to make edits
Contract received from a client with sections to redline
You need to copy large amounts of text accurately
Research paper or report where manual retyping would take hours
You need to reuse a PDF template with updated details
Certificate or official letter format you need to reissue
A government portal or college has given you a PDF form to fill and return
University admission form, income certificate, or tender document issued as PDF
You need to translate a PDF document
Legal or technical PDF to be translated by a human editor
You want to edit a scanned document after OCR processing
Old printed document digitised and needing corrections

💡  Converting PDF to Word is different from inserting a PDF into Word. If you want to embed a PDF as an attachment inside a Word document (rather than converting it to editable text), use Word's Insert → Object feature instead. This tool converts the PDF's text into editable Word content - line by line, without preserving layout, tables, or images.

H2: How to Convert PDF to Word in 3 Steps.
Every conversion happens in the same three steps. No account, no software, no daily limit.

H3: Step 1 - Upload Your PDF File
Click the Upload button or drag and drop your PDF into the upload area. The tool accepts any PDF - a text-based PDF, a scanned document, or a PDF with mixed content (text + images + tables). Upload works on any device using your browser. No app download required.
File types accepted: PDF (any version). There is no fixed file size limit - conversion runs on your own device, so the practical limit is your browser's available memory. If your PDF has many pages with high-resolution images, it will take slightly longer to process.
H3: Step 2 - RepetiGo Converts Your PDF to .docx
After upload, RepetiGo's conversion engine reads the text on each page of your PDF and reconstructs it in a Word document, one page at a time. Each page starts with a "Page N" heading, followed by that page's text broken into paragraphs line by line, then a page break before the next page. This is a text-extraction pass: it does not rebuild tables as Word tables, does not embed images, does not detect heading styles from the PDF's design, and does not preserve columns, margins, or hyperlinks. What you get is the words, in reading order, ready to edit.
H3: Step 3 - Download Your Editable Word Document
After processing - usually under 60 seconds - a download button appears. Click it to save your .docx file to your device. Nothing is uploaded - the file is processed and saved locally in your browser. The original PDF on your device is not affected.
📱  The PDF to Word converter works on mobile browsers - Safari on iPhone, Chrome on Android - without any app download. Upload directly from your Files app. The downloaded .docx saves to your device and can be opened in any mobile Word editor.

➜  [ Convert Your PDF to Word Now - Free → repetigo.com/tools/pdf/pdf-to-word/ ]

H2: What Gets Preserved - and What You May Need to Adjust.
Here is an honest breakdown of what PDF to Word conversion handles well and where you'll need to do manual work after conversion:
Element
Conversion Result
Notes
Running text
✓ Excellent
Extracted accurately, line by line, as plain paragraphs
Fonts and font sizes
✗ Not preserved
Word applies its own default paragraph style - font, size, bold/italic from the PDF are not carried over
Tables
✗ Not preserved as tables
Table text is extracted as plain lines, not rebuilt as a Word table - reformat manually if you need real table structure
Images and photos
✗ Not included
Images in the PDF are not embedded in the output - only the surrounding text is extracted
Headings and styles
✗ Not detected
A generic "Page N" heading is added per page; the PDF's own heading hierarchy is not recreated
Multi-column layouts
⚠️ Reading order may mix columns
Text is extracted in the order the engine reads it, which can interleave column content on complex layouts
Scanned PDFs (image-based)
⚠️ OCR required
Scanned PDFs return no text - see Scanned PDF section below
Hyperlinks
✗ Not preserved
Link text remains but is no longer clickable
Page layout and margins
✗ Not preserved
Output uses a standard Word page layout, not the PDF's original dimensions
Mathematical equations
⚠️ Variable
Equations made of text characters extract oddly; equations rendered as images will not appear at all
PDF forms (fillable fields)
⚠️ Field labels only
Visible field labels are extracted as text; the fillable structure itself is not recreated

💡  RepetiGo's PDF to Word converter is a text-extraction tool, not a full document reconstruction tool - it is best suited to pulling clean, editable text out of a text-based PDF quickly, not to preserving exact formatting. If you need the original layout, fonts, tables, and images to carry over closely, a dedicated conversion tool (like Adobe Acrobat Pro) will get you closer; RepetiGo's strength is getting the words out fast, for free, entirely in your browser.

H2: How to Convert a Scanned PDF to Word.
A scanned PDF is a document that was printed, physically scanned on a scanner or photocopied, and saved as an image-based PDF. Unlike a text-based PDF, a scanned PDF contains no actual text - only a picture of text. This means a standard PDF to Word converter cannot extract the text directly.
To convert a scanned PDF to Word, you need to complete two steps:
1.  Run OCR (Optical Character Recognition) on the scanned PDF first. OCR reads the pixels in the image, identifies text characters, and adds a real text layer to the PDF. Use RepetiGo's OCR PDF tool for this step.
2.  Once the scanned PDF has been OCR-processed, convert it to Word using this tool. The conversion will now find actual text to extract rather than just an image.
💡  If you upload a scanned PDF directly to the PDF to Word converter without running OCR first, the output Word document will contain no text at all, since there is nothing to extract. For scanned documents, use /tools/pdf/ocr-pdf/ first, then come back here to convert.
Note on handwritten documents: OCR technology can convert typed/printed text to Word with high accuracy, but handwriting recognition is significantly less reliable. For handwritten PDFs, manual re-entry or a specialist handwriting OCR tool will produce better results.

H2: How to Convert PDF to Word Without Adobe Acrobat.
Adobe Acrobat Pro can export PDFs to Word .docx format - but it requires a paid subscription that costs thousands of rupees per year, and its conversion rebuilds fonts, tables, and layout, not just the text. Most people receive a PDF occasionally and just need the words out - they do not need an annual Acrobat licence just for that.
RepetiGo lets you convert PDF to Word without Adobe Acrobat completely free, in any browser, on any device. For Mac users: open RepetiGo in Safari or Chrome, upload your PDF, and download the .docx. No Office licence, no Acrobat subscription, no software installation.
Method
Cost
Sign-Up?
Output Quality
Available On
RepetiGo PDF to Word
Free
No
High for plain text extraction (fonts and layout not preserved)
Any browser
Adobe Acrobat Pro
Paid subscription
Yes (account required)
Very High - native conversion with layout, fonts, and tables rebuilt
Windows + Mac app
Microsoft Word (Open PDF)
Paid (Office 365)
Yes
High - built-in conversion
Windows + Mac
Google Docs (import PDF)
Free (Google account)
Yes (Google account)
Medium - simpler layouts
Any browser
ilovepdf
Free (limited)
No (basic)
Good
Any browser

✅  RepetiGo is the only free, no-account, no-install option for converting PDF to Word that processes your file entirely in the browser - protecting the privacy of sensitive documents.

H2: Who Should Use a Free PDF to Word Converter?
Use Case
Why Convert PDF to Word?
Expected Conversion Quality
🎓 Student editing a research paper received as PDF
Need to add comments, correct citations, or reformat for submission
Text extracts cleanly; expect to reapply headings and check citation formatting
👔 Professional redlining a PDF contract
Need to mark up clauses with tracked changes in Word
Text extracts cleanly; expect to rebuild any tables or numbered clause formatting
🏛️ Government form or tender document (India)
Government-issued PDF forms often need to be filled, updated, and resubmitted as Word
Text extracts cleanly; expect to rebuild form fields and table layouts manually
📋 HR team updating a PDF job description or policy
Company policy PDFs need annual updates - Word makes this easy
Text extracts cleanly; light reformatting needed for headings and bullets
🏫 Teacher or lecturer editing a PDF course material
Updating teaching materials received in PDF format
Text extracts cleanly; expect to reapply headings and any table structure
📑 Legal professional editing court documents
Court orders and legal notices issued as PDF need annotation and editing
Text extracts cleanly for text-based PDFs; scanned court docs need OCR first, and numbered paragraph formatting needs rebuilding

H2: PDF to Word Converter for India.
India's professional and government ecosystem generates enormous volumes of PDFs that regularly need to be converted to editable Word documents:
•  Government tenders and RFPs: Ministry, department, and PSU RFPs are issued as PDFs. Vendors must prepare responses in Word and submit. Converting the tender PDF to Word lets you copy and address each clause directly.
•  CA and legal documents: Chartered accountants receive ITR notices, assessment orders, and legal documents as PDFs. Converting to Word enables accurate clause-by-clause responses and annotations.
•  University and college documents: Admission letters, exam schedules, syllabus documents, and academic calendars issued as PDFs need to be edited or reformatted for college notice boards and internal use.
•  Court orders and legal notices: Lawyers and litigants receive digitised court orders as PDFs. Converting to Word enables preparation of replies that reference specific paragraphs.
•  Hindi-language PDFs: Devanagari script PDFs can be converted to Word. Note: accuracy depends on font embedding in the original PDF. PDFs with embedded Unicode Devanagari fonts convert well; older legacy-font Hindi PDFs may need manual correction.
With RepetiGo you can convert PDF to Word online free in India - upload any PDF and download an editable .docx in seconds. Because nothing is stored and no sign-up is needed, your confidential legal or financial PDF never sits on a stranger's server.
⚠️  Under India's DPDP Act 2023, documents containing Aadhaar numbers, PAN details, financial records, or legal information deserve careful handling. RepetiGo processes your file entirely in your browser - nothing is uploaded.

H2: Your PDF Never Leaves Your Browser.
When you upload a PDF to convert, you may be sharing a confidential contract, a legal notice, a financial report, or a personal document. Here is exactly what happens:
Protection Layer
What It Means in Practice
🔒 Stays in Your Browser
Your PDF is processed entirely within your browser - it is never uploaded to any server.
🔐 Local Browser Processing
Your file is processed locally with no link to any account, user ID, or persistent identifier.
🗑️ Never Uploaded
Both your PDF and the converted .docx are processed locally in your browser and never sent to any server. Nothing is retained.
👁️ No Content Is Read
The conversion happens locally on your device; no one at RepetiGo reads, stores, or has access to your document's content.
🚫 No Account = No Data Profile
Since no sign-up is required, we hold zero personal data about you. No name, email, usage history, or file history is stored anywhere.

🔒  Your PDF and converted Word file are processed locally in your browser - never stored on any server. You always retain the originals on your own device.
Read our Privacy Policy → /security/ | Learn about Auto-Delete → /features/auto-delete/

H2: PDF to Word for Print Shops - The Automated Way.
If you run a print shop, cyber cafe, or CSC centre, customers occasionally bring PDFs they need edited before printing - a form that needs new details filled in, a certificate template that needs to be updated, a government document that needs corrections. The standalone PDF to Word converter handles one-off requests. For shops dealing with high volumes, PrintPilot's document processing engine handles format conversion automatically as part of the print workflow - no manual conversion step needed.
🖨️  PrintPilot automatically handles PDF processing for every customer document - including format conversion, compression, orientation correction, and AI quality enhancement. What the standalone PDF to Word converter does in 3 manual steps, PrintPilot handles for every job automatically.
Learn about PrintPilot → /products/printpilot/ | QR Document Upload → /features/qr-upload/

➜  [ Try PrintPilot Free - Full Print Shop Automation → repetigo.com/pricing/ ]
[ Or Just Convert a PDF Now → repetigo.com/tools/pdf/pdf-to-word/ ]

H2: Common Questions About Converting PDF to Word Online Free.
H3: Q1: How do I convert a PDF to Word for free?
To convert PDF to Word free using RepetiGo: go to repetigo.com/tools/pdf/pdf-to-word/, click Upload and select your PDF file, wait for the conversion to complete (usually under 60 seconds), and download your .docx Word document. No account is required. No software is needed. The PDF to Word free tool works from any browser in India - on phone or laptop - with no daily limits and no watermarks on the output.
H3: Q2: Can I convert a PDF to Word and still edit the text?
Yes - the text itself is fully editable in Microsoft Word, Google Docs, or LibreOffice as soon as you open the .docx. Keep in mind this is a text-extraction conversion: tables, images, and the original page layout are not rebuilt, so you're editing plain paragraphs of text, not a formatted replica of the PDF. The quality of the extracted text depends on the type of PDF: text-based PDFs extract with very high accuracy; scanned (image-based) PDFs require OCR processing first before there's any text to extract. See the 'Scanned PDF to Word' section above for instructions.
H3: Q3: Does converting PDF to Word keep the formatting?
Not the visual formatting, no - RepetiGo's PDF to Word converter is a text-extraction tool. It pulls the words out accurately and lays them out as plain paragraphs, but it does not preserve the original fonts, rebuild tables, embed images, apply heading styles, or keep hyperlinks clickable. If you need a document that looks like the original PDF and is editable, expect to do some manual reformatting after conversion - or use a dedicated tool like Adobe Acrobat Pro for closer layout fidelity.
H3: Q4: How do I convert a scanned PDF to Word?
Scanned PDFs contain images of text rather than actual text, so a direct PDF to Word conversion will produce no text at all - there's nothing to extract from a picture. To get editable text from a scanned PDF: first, run OCR on the scanned PDF using RepetiGo's OCR PDF tool at /tools/pdf/ocr-pdf/ - this adds a text layer to the scan. Then return here and convert the OCR-processed PDF to Word. The two-step process gives you a properly editable Word document from a scanned original.
H3: Q5: What is the best free PDF to Word converter?
For Indian users and general use, RepetiGo's PDF to Word converter offers: no sign-up required, no daily conversion limit, genuinely private browser-only processing (nothing is ever uploaded), no watermark on the output, and support for Hindi and regional Indian language PDFs with embedded Unicode fonts. It's best suited to quickly pulling editable text out of a PDF, not to reproducing the PDF's exact look - for that, Adobe Acrobat Pro's paid conversion does more layout, table, and image reconstruction. If you just need the words out fast and for free, RepetiGo gets you there without an account or a subscription.
H3: Q6: How do I convert PDF to Word without Adobe Acrobat?
You don't need Adobe Acrobat. Acrobat Pro's Word export requires a paid subscription. RepetiGo lets you convert PDF to Word without Adobe for free - open the tool in any browser, upload your PDF, and download the .docx file. No licence, no installation, no account required. Unlike Acrobat's native conversion, RepetiGo extracts plain text rather than rebuilding fonts, tables, and layout - it's the fastest free way to get editable text out of a PDF, though you may need to reformat afterward if you want it to look like the original.
H3: Q7: How do I convert PDF to Word on Mac?
To convert PDF to Word on Mac: open RepetiGo in Safari or Chrome, upload your PDF from Finder or your Desktop, wait for conversion, and download the .docx file. You don't need Microsoft Word or Adobe Acrobat installed on your Mac. The downloaded Word file can be opened in Microsoft Word for Mac, Pages, LibreOffice, or uploaded to Google Docs.
H3: Q8: Is it safe to upload a confidential PDF to a free online converter?
With RepetiGo, yes. Your file is processed entirely within your browser - never uploaded to any server. The text extraction happens locally on your device; no one at RepetiGo reads, stores, or has access to your document's content. No sign-up means no data profile is created. This matters for confidential contracts, legal documents, financial reports, and government submissions.
H3: Q9: Why does my converted Word document look different from the PDF?
Because this tool extracts text, not layout - the Word document is always going to look different from the PDF, by design. Every page becomes a 'Page N' heading followed by plain paragraphs of the extracted text; fonts, colours, tables, images, columns, and page dimensions from the PDF are not carried over. If your PDF is a scan (no text layer), you'll also see no text extracted at all until you run it through RepetiGo's OCR PDF tool first. If you need the output to visually resemble the original PDF, plan on some manual reformatting in Word, or use a dedicated layout-preserving tool for that specific need.
H3: Q10: Can I convert PDF to Word offline without internet?
Almost - RepetiGo's conversion actually runs entirely in your browser, not on a server, so once the page has loaded you can lose your internet connection and the conversion itself will still work; you just need connectivity to load the page in the first place, and it's safest to stay online throughout in case your browser needs to reload anything. If you want a fully offline desktop tool instead: Microsoft Word (open a PDF directly in Word 2013 or later), LibreOffice Writer (free, fully offline), or Adobe Acrobat Pro (paid, offline) are dedicated options that don't need a browser tab open at all.

H2: More Free PDF Tools from RepetiGo.
Tool
URL
Best For
Word to PDF (reverse)
/tools/pdf/word-to-pdf/
Convert Word .docx back to PDF
OCR PDF
/tools/pdf/ocr-pdf/
Add a text layer to scanned PDFs before converting
PDF to Text
/tools/ocr/pdf-to-text/
Extract plain text from PDF (no Word format needed)
Compress PDF
/tools/pdf/compress-pdf/
Reduce large PDF size before converting
Merge PDF
/tools/pdf/merge-pdf/
Combine multiple PDFs before conversion
All PDF Tools →
/tools/pdf/
View the complete free PDF tools library

➜  [ Convert PDF to Word Free Now → repetigo.com/tools/pdf/pdf-to-word/ ]
No sign-up · Browser-only processing · Editable .docx output`;

const faqSchemaQuestions = Array.from(pdfToWordContent.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function PdfToWordPage() {
  return (
    <DashboardShell activePath="/pdf-tools">
      <div className="dashboard generic-pdf-tool-page">
        <ConversionTool slug="pdf-to-word">
          <JsonLd />
          <article className="tool-seo-content pdf-to-word-seo" id="pdf-to-word-guide">
            <StructuredSeoCopy content={pdfToWordContent} />
          </article>
        </ConversionTool>
      </div>
    </DashboardShell>
  );
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "📱", "🇮🇳", "🔒", "🖨️", "✅", "⚠️", "🖥️"];

function StructuredSeoCopy({ content }: { content: string }) {
  const blocks = content.replace(/(^|\n)(H[123]: [^\n]+)\n/g, "$1\n$2\n\n").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const first = lines[0];
        if (!first) return null;
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
        if (CALLOUT_EMOJI.some((emoji) => first.startsWith(emoji))) {
          return <aside className="tool-seo-callout" key={index}>{lines.map((line) => <p key={line}>{renderInlineMappedLinks(line)}</p>)}</aside>;
        }
        return <div className="tool-seo-copy-paragraph" key={index}>{lines.map((line) => <p key={line}>{renderInlineMappedLinks(line)}</p>)}</div>;
      })}
    </>
  );
}

function getKnownTable(lines: string[]): SeoTableData | null {
  if (lines[0] === "You Need to Convert PDF to Word When..." && lines[1] === "Common Example") return { headers: ["You Need to Convert PDF to Word When...", "Common Example"], rows: chunkRows(lines.slice(2), 2) };
  if (lines[0] === "Element" && lines[1] === "Conversion Result" && lines[2] === "Notes") return { headers: ["Element", "Conversion Result", "Notes"], rows: chunkRows(lines.slice(3), 3) };
  if (lines[0] === "Method" && lines[1] === "Cost") return { headers: ["Method", "Cost", "Sign-Up?", "Output Quality", "Available On"], rows: chunkRows(lines.slice(5), 5) };
  if (lines[0] === "Use Case" && lines[1] === "Why Convert PDF to Word?") return { headers: ["Use Case", "Why Convert PDF to Word?", "Expected Conversion Quality"], rows: chunkRows(lines.slice(3), 3) };
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
  return <a className="tool-seo-inline-cta" href={href || "#pdf-to-word-guide"}>{label}{href ? <span>→</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:tools\/pdf\/[a-z-]+|pricing)\/?|\/tools\/pdf\/[a-z-]*\/?|\/tools\/pdf\/?|\/tools\/ocr\/pdf-to-text\/?|\/products\/printpilot\/?|\/features\/qr-upload\/?|\/features\/auto-delete\/?|\/security\/?|\/pricing\/?|\/use-cases\/secure-printing\/?)/g);
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
    "/pdf-tools/pdf-to-word": "/pdf-tools/pdf-to-word",
    "/pdf-tools/word-to-pdf": "/pdf-tools/word-to-pdf",
    "/pdf-tools/ocr-pdf": "/pdf-tools/ocr-pdf",
    "/tools/ocr/pdf-to-text": "/pdf-tools/pdf-to-markdown",
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
    "/pdf-tools/pdf-to-word": "Open PDF to Word",
    "/pdf-tools/word-to-pdf": "Open Word to PDF",
    "/pdf-tools/ocr-pdf": "Open OCR PDF",
    "/pdf-tools/pdf-to-markdown": "Open PDF to Text",
    "/pdf-tools/compress-pdf": "Open Compress PDF",
    "/pdf-tools/merge-pdf": "Open Merge PDF",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PDF to Word Converter", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF to Word converter that extracts a PDF's text into an editable .docx file. Runs entirely in the browser - no file is ever uploaded to a server. Best suited to text extraction, not layout reconstruction.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Convert PDF to Word Online Free", step: [{ "@type": "HowToStep", name: "Upload PDF", text: "Upload Your PDF File" }, { "@type": "HowToStep", name: "Convert to DOCX", text: "RepetiGo Converts Your PDF to .docx" }, { "@type": "HowToStep", name: "Download Word file", text: "Download Your Editable Word Document" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "PDF to Word", item: pageUrl }] };
  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
