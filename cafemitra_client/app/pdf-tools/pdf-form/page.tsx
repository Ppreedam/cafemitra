import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "../../DashboardShell";
import PdfEditTool from "../PdfEditTool";

const pageUrl = "https://repetigo.com/pdf-tools/pdf-form";

export const metadata: Metadata = {
  title: "Fill PDF Form Online Free - Fill or Create Fields | RepetiGo",
  description: "Fill PDF form free - detect and fill existing text fields, checkboxes, and dropdowns. Or create a new text field at a custom position. Browser-only. No Adobe. No sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Fill PDF Form Online Free - Fill or Create Fields | RepetiGo",
    description: "Fill PDF form free - detect and fill existing text fields, checkboxes, and dropdowns. Or create a new text field at a custom position. Browser-only. No Adobe. No sign-up.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Fill PDF Form Online Free - RepetiGo",
    description: "Fill existing fields or create one new text field on a flat PDF. No sign-up, browser-only.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Fill PDF Form Online Free. Fill Existing Fields or Add a New Text Field.
RepetiGo's free fill PDF form tool lets you complete interactive PDF forms in your browser - type into text fields, check checkboxes, and select dropdown options. Download a filled PDF ready for submission without printing, signing by hand, and scanning back.
If your PDF has no existing form fields - it is a flat or scanned form - the tool switches to creation mode, where you can add one new text field at a custom position on the page.
✓ Fill Text Fields, Checkboxes, and Dropdowns  ✓ Create a New Text Field on Flat PDFs  ✓ No Adobe Required  ✓ No Printing or Scanning  ✓ Browser-Only - Never Uploaded

➜  [ Fill Your PDF Form Free - No Sign-Up → repetigo.com/tools/pdf/pdf-form/ ]

H2: What Is a Fillable PDF Form?
A fillable PDF form is a PDF document that contains interactive form fields - defined areas where the reader can type, check boxes, or make selections without printing the document. Form fields are embedded in the PDF structure with specific properties: field name, field type, current value, and position on the page.
Common types of interactive PDF form fields:
•  Text fields: Single-line or multi-line boxes where the user types text - for names, addresses, dates, signatures, or any written response
•  Checkboxes: Toggle fields that are either checked (true) or unchecked (false) - for yes/no options, consent agreements, or multi-select lists
•  Dropdown menus: Selection lists with predefined options - for choosing from a fixed set of values (state, category, type)
•  Radio button groups: Single-select groups where only one option in the group can be selected at a time
Not all PDFs are fillable. Many PDF forms are 'flat' - they look like forms (with lines and boxes) but contain no interactive fields. These are essentially images of forms. For flat forms, see the Create New Text Field section below.

H2: Two Modes - Fill Existing Form or Add a New Text Field.
When you upload a PDF, the tool automatically detects whether interactive form fields exist and switches to the appropriate mode:
H3: Mode 1 - Fill Existing Interactive Form Fields
If the PDF has interactive fields, every field is detected and listed with its field name and current value. Three field types are fillable:
•  Text fields: Click the field in the list and type your response. The text is placed in the PDF at the field's defined position
•  Checkboxes: Click the checkbox field in the list to toggle it on or off. The check mark appears at the field's defined position
•  Dropdowns: Click the dropdown in the list and select from the predefined options already in the PDF form
H3: Mode 2 - Create a New Text Field on a Flat PDF
If the PDF has no interactive fields (a flat, static, or scanned PDF), the tool switches to creation mode. You can add one new text field per session:
•  Enter a field name (used as a label identifier - not shown on the PDF page)
•  Enter the default text value for the field
•  Set the horizontal position: From-left (as a % of page width)
•  Set the vertical position: From-top (as a % of page height)
The new text field is embedded in the PDF as an interactive field - the recipient can also type in it. Only one text field can be created per session. Checkboxes, radio buttons, dropdown menus, and signature fields cannot be created - those field types require the fields to already exist in the PDF when uploaded.
💡  Mode 2 is useful for adding a text overlay (name, date, reference number) to a flat PDF that cannot be typed into. For full form creation with multiple fields of different types, a dedicated PDF form creator tool is more appropriate.

H2: How to Fill a PDF Form in 3 Steps.
H3: Step 1 - Upload Your PDF Form
Click Upload and select your PDF form. The tool detects whether interactive fields exist. If fields are found, they are listed automatically. If no fields are found, the creation mode appears.
H3: Step 2 - Fill the Fields or Set Up Your New Text Field
Mode 1: Scroll through the field list. Each field shows its name, type, and current value. Click a text field and type your content. Toggle checkboxes. Select dropdown options. Mode 2: Enter your field name, default text value, and position (From-left and From-top as percentages of the page dimensions). The tool shows a preview of where the field will be placed.
H3: Step 3 - Download Your Completed PDF
Click Complete Form (Mode 1) or Add Field (Mode 2). Your filled or field-added PDF downloads. For Mode 1, field values are embedded in the PDF structure. For Mode 2, the new text field is embedded as an interactive element. Your file is processed entirely in your browser - nothing is uploaded.

H2: Common PDF Form Scenarios - When to Use This Tool.

Situation
Best Approach
You received an interactive PDF form with fillable text boxes
Upload → Mode 1 → fill fields → download
Your PDF form has checkboxes - you need to tick some
Upload → Mode 1 → toggle checkboxes → download
You have a flat PDF form (printed look, no interactive fields)
Upload → Mode 2 → add one text field → download
You need to add a date or reference number to a document
Upload → Mode 2 → position text field over the date line → download
You need to complete a government form PDF
Upload → if fields detected: Mode 1; if flat: Mode 2 for text overlay
You need a form with 10 different fields created from scratch
Use a dedicated PDF form creator - this tool supports one new field per session
You need to add a signature to the completed form
After filling, use Sign PDF at /tools/pdf/sign-pdf/

H2: Fill PDF Form in India - Government and Institutional Forms.
India's government portals and institutional processes involve a large volume of PDF forms - many of which are fillable interactive PDFs, while others are flat scanned or printed-design PDFs:
•  Government service forms: Central and state government service forms (RTI applications, utility connections, property registrations) are often interactive PDFs - Mode 1 fills them directly
•  Bank and financial forms: KYC forms, loan application forms, account opening forms from banks and NBFCs - these are typically interactive PDFs with named fields for personal details, address, and income information
•  Insurance claim forms: Health, vehicle, and life insurance claim forms sent as PDF - fill in-browser and download for submission without printing
•  Educational institution forms: College application forms, examination registration forms, and scholarship applications - many are interactive PDFs designed for digital completion
•  MSME and startup registration: Many DPIIT, MCA, and state government startup scheme application forms are PDF-based - fill and submit digitally
With RepetiGo you can fill PDF forms free in India - complete any interactive PDF in your browser, add text overlays to flat forms, and download the filled document in seconds. No account, no software, browser-only.

H2: Fill PDF Form Without Adobe Acrobat.
Adobe Acrobat Reader (free) can fill interactive PDF forms - but requires installation. Adobe Acrobat Pro adds form creation capabilities but requires a paid subscription. RepetiGo lets you fill PDF forms without any Adobe installation, in any browser:

Feature
RepetiGo
Adobe Acrobat Reader (Free)
Adobe Acrobat Pro
Cost
Free
Free
₹1,500-₹3,500/month
Fill existing fields
✅ Yes
✅ Yes
✅ Yes
No install required
✅ Yes (browser)
❌ Requires desktop install
❌ Requires desktop install
Create new text field
✅ Yes (one per session)
❌ No
✅ Yes (unlimited)
Create checkboxes/radio/dropdown
❌ No
❌ No
✅ Yes
Server upload
No - browser-only
Local file processing
Cloud sync

H2: Your Files Never Leave Your Browser.
RepetiGo's PDF tools run entirely in your browser. Your PDF is never uploaded to any server - it is processed locally on your device.
•  🔒 Browser-only processing: Your file never travels over any network to any server. No upload occurs at any stage.
•  🔐 No server session: There is no remote processing session, no isolated server workspace. Everything happens inside your browser tab.
•  🚫 No account = no data: No sign-up means we hold zero personal data about you. No file history, no email, no usage tracking.
•  👁️ Content never leaves device: No text, image, or document content is sent to or read by any external system or person.
•  ✅ Cleared on tab close: All local working data clears when you close or refresh the tab. Nothing persists on your device or any server.
🔒  Your file never leaves your device - not for 60 minutes, not ever. Browser-only processing is stronger privacy than any server-side deletion policy.
Privacy Policy → /security/ | Browser-only processing - no upload, no storage

H2: PDF Forms for Print Shops - Built into PrintPilot.
Print shop owners, cyber cafe operators, and CSC centre managers use RepetiGo's pdf forms tool as part of their customer document processing workflow - without switching to separate applications.
PrintPilot - RepetiGo's print shop management platform - integrates all 30 PDF tools directly into the shop dashboard. Customer documents uploaded by QR code are processed automatically before reaching the print queue.
•  Help customers fill government service applications and bank forms on the counter computer
•  Add reference numbers or dates to flat form PDFs before printing for customers
•  Complete KYC forms for customers at CSC centres without printing, writing, and scanning back
🖨️  PrintPilot gives you all 30 PDF tools plus QR code document upload, AI document enhancement, secure print queue, UPI payments, and auto-delete compliance - built into one platform.

➜  [ Try PrintPilot Free - Print Shop Automation for India → repetigo.com/products/printpilot/ ]

H2: Common Questions About Filling PDF Forms.
H3: Q1: How do I fill out a PDF form online for free?
Go to repetigo.com/tools/pdf/pdf-form/, upload your PDF. If it has interactive fields, they are detected and listed automatically - click each field to fill it. If it has no interactive fields, creation mode appears where you can add one text field. Download when complete. Browser-only - no upload, no sign-up, no software.
H3: Q2: My PDF looks like a form but I cannot type in it. What do I do?
Your PDF is a flat form - it looks like a form but has no interactive fields. It may have been created by scanning a paper form, or by exporting from Word/Excel without adding form fields. In creation mode, RepetiGo lets you add one new text field at a custom position on the page. For more complex overlays, use the Edit PDF tool at /tools/pdf/edit-pdf/ to place text boxes anywhere on flat PDF pages.
H3: Q3: Can I create a fillable PDF form with multiple fields?
One new text field can be created per session in creation mode. For a full fillable form with multiple text fields, checkboxes, dropdowns, and signature fields, you would need a dedicated PDF form creation tool (such as Adobe Acrobat Pro, PDF.js Express, or Jotform's PDF Editor).
H3: Q4: What types of form fields can I fill?
In Mode 1 (interactive fields detected), you can fill: text fields (type any content), checkboxes (toggle on/off), and dropdown menus (select from predefined options). Radio button groups are detected but may behave as individual checkboxes depending on the PDF's field structure.
H3: Q5: Can I fill a PDF form on my phone?
Yes. The PDF form tool works in any mobile browser - Safari on iPhone, Chrome on Android. Upload from your Files app, type in text fields, toggle checkboxes, and download the filled form. No app download required. The interface adapts to mobile screen widths.
H3: Q6: Why can't I create a checkbox or dropdown in Mode 2?
Mode 2 (creation mode) supports adding one new text field only. Checkboxes, radio buttons, dropdown menus, and signature fields require additional properties (predefined options, grouping, value lists) that are not available in the current creation interface. These field types can only be filled in Mode 1 if they already exist in the PDF when uploaded.
H3: Q7: Is the filled form saved permanently?
The filled values are embedded in the PDF file that you download. That PDF retains the filled values when shared with others or re-opened in any PDF reader. The Mode 2 text field is embedded as an interactive field that the recipient can also edit. For Mode 1 filled forms, some PDF creators lock the form after filling - in that case, the values are visible but the fields may appear read-only to subsequent readers.
H3: Q8: How do I sign the form after filling it?
After filling the form and downloading it, open the Sign PDF tool at /tools/pdf/sign-pdf/. Upload the filled form, choose your signature method (type, draw, or upload), position it on the signature line, and download the signed PDF. This two-step process - fill then sign - covers the complete digital form workflow.

H2: More Free PDF Tools from RepetiGo.
•  Sign PDF → /tools/pdf/sign-pdf/ - add your signature after filling the form
•  Edit PDF → /tools/pdf/edit-pdf/ - add text boxes at any position on flat PDF pages
•  Protect PDF → /tools/pdf/protect-pdf/ - lock the filled form before sending
•  All PDF Tools → /tools/pdf/

➜  [ Fill Your PDF Form Free - No Sign-Up → repetigo.com/tools/pdf/pdf-form/ ]`;

type SeoTable = { headers: string[]; rows: string[][] };

const tables: SeoTable[] = [
  {
    headers: ["Situation", "Best Approach"],
    rows: [
      ["You received an interactive PDF form with fillable text boxes", "Upload → Mode 1 → fill fields → download"],
      ["Your PDF form has checkboxes - you need to tick some", "Upload → Mode 1 → toggle checkboxes → download"],
      ["You have a flat PDF form (printed look, no interactive fields)", "Upload → Mode 2 → add one text field → download"],
      ["You need to add a date or reference number to a document", "Upload → Mode 2 → position text field over the date line → download"],
      ["You need to complete a government form PDF", "Upload → if fields detected: Mode 1; if flat: Mode 2 for text overlay"],
      ["You need a form with 10 different fields created from scratch", "Use a dedicated PDF form creator - this tool supports one new field per session"],
      ["You need to add a signature to the completed form", "After filling, use Sign PDF at /tools/pdf/sign-pdf/"],
    ],
  },
  {
    headers: ["Feature", "RepetiGo", "Adobe Acrobat Reader (Free)", "Adobe Acrobat Pro"],
    rows: [
      ["Cost", "Free", "Free", "₹1,500-₹3,500/month"],
      ["Fill existing fields", "✅ Yes", "✅ Yes", "✅ Yes"],
      ["No install required", "✅ Yes (browser)", "❌ Requires desktop install", "❌ Requires desktop install"],
      ["Create new text field", "✅ Yes (one per session)", "❌ No", "✅ Yes (unlimited)"],
      ["Create checkboxes/radio/dropdown", "❌ No", "❌ No", "✅ Yes"],
      ["Server upload", "No - browser-only", "Local file processing", "Cloud sync"],
    ],
  },
];

const routeMap: Record<string, string> = {
  "/pdf-tools": "/pdf-tools",
  "/pdf-tools/pdf-form": "/pdf-tools/pdf-form",
  "/pdf-tools/sign-pdf": "/pdf-tools/sign-pdf",
  "/pdf-tools/edit-pdf": "/pdf-tools/edit-pdf",
  "/pdf-tools/ocr-pdf": "/pdf-tools/ocr-pdf",
  "/pdf-tools/watermark-pdf": "/pdf-tools/watermark-pdf",
  "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf",
  "/pdf-tools/protect-pdf": "/pdf-tools/protect-pdf",
  "/products/printpilot": "/print-automation",
  "/features/auto-delete": "/privacy-policy",
  "/security": "/privacy-policy",
  "/pricing": "/pricing",
};

const routeLabels: Record<string, string> = {
  "/pdf-tools": "Explore All PDF Tools",
  "/pdf-tools/pdf-form": "Open PDF Form",
  "/pdf-tools/sign-pdf": "Open Sign PDF",
  "/pdf-tools/edit-pdf": "Open Edit PDF",
  "/pdf-tools/ocr-pdf": "Open OCR PDF",
  "/pdf-tools/watermark-pdf": "Open Add Watermark",
  "/pdf-tools/compress-pdf": "Open Compress PDF",
  "/pdf-tools/protect-pdf": "Open Protect PDF",
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
      const items: Array<{ text: string; bullets: string[] }> = [];
      while (index < lines.length && /^\d+\.\s/.test(lines[index])) {
        const text = lines[index].replace(/^\d+\.\s*/, "");
        index += 1;
        const bullets: string[] = [];
        while (index < lines.length && lines[index].startsWith("•")) {
          bullets.push(lines[index].replace(/^•\s*/, ""));
          index += 1;
        }
        items.push({ text, bullets });
      }
      output.push(<ol className="tool-seo-list" key={`${keyPrefix}-ordered-${index}`}>{items.map((item) => <li key={item.text}>{renderInline(item.text)}{item.bullets.length ? <ul className="tool-seo-list">{item.bullets.map((bullet) => <li key={bullet}>{renderInline(bullet)}</li>)}</ul> : null}</li>)}</ol>);
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
      const href = arrow >= 0 ? mapRoute(inner.slice(arrow + 1)) : "/pdf-tools/pdf-form";
      output.push(<div className="tool-seo-cta-stack" key={`${keyPrefix}-cta-${index}`}><a className="tool-seo-inline-cta" href={href || "/pdf-tools/pdf-form"}>{label} <span>→</span></a></div>);
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

function renderTable(table: SeoTable) {
  return <div className="tool-seo-table-wrap"><table><thead><tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{renderInline(cell)}</td>)}</tr>)}</tbody></table></div>;
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
  const faqStart = content.indexOf("H2: Common Questions About Filling PDF Forms.");
  const faqEnd = content.indexOf("H2: More Free PDF Tools from RepetiGo.", faqStart);
  const faqQuestions = Array.from(content.slice(faqStart, faqEnd).matchAll(/H3: ([^\n]+)\n([\s\S]*?)(?=\nH3: |\nH2:|$)/g)).map((match) => ({ "@type": "Question", name: match[1], acceptedAnswer: { "@type": "Answer", text: match[2].trim() } }));
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PDF Forms", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF form tool - fills detected text fields, checkboxes, and dropdowns on interactive PDFs, or creates one new text field on a flat PDF, entirely in the browser. No file is ever uploaded to a server.", url: pageUrl },
    { "@context": "https://schema.org", "@type": "HowTo", name: "How to Fill a PDF Form in 3 Steps", step: [{ "@type": "HowToStep", name: "Upload Your PDF Form" }, { "@type": "HowToStep", name: "Fill the Fields or Set Up Your New Text Field" }, { "@type": "HowToStep", name: "Download Your Completed PDF" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqQuestions },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "PDF Form", item: pageUrl }] },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}

export default function PdfFormPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><JsonLd /><article className="tool-seo-content" id="pdf-form-guide"><StructuredSeoCopy /></article><PdfEditTool slug="pdf-forms" headingLevel="h2" /></div></DashboardShell>;
}
