import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import InPlacePdfEditor from "../InPlacePdfEditor";

const pageUrl = "https://repetigo.com/pdf-tools/edit-pdf";

export const metadata: Metadata = {
  title: "Edit PDF Online Free - Add and Edit Text | RepetiGo",
  description: "Edit PDF free - click to edit existing text, add new text anywhere, bold/italic/colour/size. Unlimited undo/redo. Edited pages become image-based. Browser-only. No sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Edit PDF Online Free - Add and Edit Text | RepetiGo",
    description: "Edit PDF free - click to edit existing text, add new text anywhere, bold/italic/colour/size. Unlimited undo/redo. Edited pages become image-based. Browser-only. No sign-up.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Edit PDF Online Free - RepetiGo",
    description: "Click to edit existing text or add new text, with unlimited undo/redo. No sign-up, browser-only.",
  },
  robots: { index: true, follow: true },
};

const editPdfContent = String.raw`H1: Edit PDF Online Free. Click to Edit Text. Add New Text Anywhere. Full Undo/Redo.
RepetiGo's free edit PDF tool lets you click directly on existing text in any PDF to edit it inline - correct errors, update names, change numbers, modify any text content - and add new text boxes anywhere on any page.
Format text with bold, italic, font size (any value), font family (four options), and colour. Every edit is tracked in an unlimited undo/redo history. Download your edited PDF when you are ready.
Note: pages you edit are rendered as high-resolution images in the output - text on edited pages is not searchable or selectable after editing. Pages you leave untouched remain in their original format.
✓ Click-to-Edit Existing Text  ✓ Add New Text Anywhere  ✓ Bold / Italic / Colour / Size  ✓ Unlimited Undo / Redo  ✓ Browser-Only - Never Uploaded

➜  [ Edit Your PDF Free - No Sign-Up → repetigo.com/pdf-tools/edit-pdf ]

H2: What Can You Edit in a PDF with RepetiGo?
RepetiGo's editor works with the existing text layer of your PDF. Here is exactly what you can and cannot do:

Capability
Available
Notes
Click to edit existing text
✅ Yes
Detects text spans from the PDF text layer - click any text to enter edit mode
Add new text boxes
✅ Yes
Switch to 'Add text' mode, click any blank area to place a new text box
Bold formatting
✅ Yes
Toggle on selected text
Italic formatting
✅ Yes
Toggle on selected text
Font size
✅ Yes
Any value - no minimum or maximum
Font family
✅ Yes (4 options)
Arial, Times New Roman, Courier New, Georgia
Colour picker
✅ Yes
Any colour for selected text
Duplicate text box
✅ Yes
Clone selected text box at a slightly offset position
Whiteout (delete appearance)
✅ Yes
Fills area white - visual removal; original content may remain in PDF structure
Undo / Redo
✅ Unlimited
Ctrl+Z / Ctrl+Y - full edit history from session start
Zoom
✅ Yes
65% to 180% zoom range
Insert images
❌ No
Image insertion is not available
Edit table cell content
❌ Limited
Table text may be detected and editable, but table structure is not preserved as a table after editing
Find and replace text
❌ No
No multi-page search-and-replace
Edit scanned PDFs without text layer
❌ No
Editor requires an existing text layer to detect clickable text

H2: How to Edit a PDF in 3 Steps.
H3: Step 1 - Upload and Browse Your PDF
Click Upload and select your PDF. All pages are rendered at high resolution in a scrolling viewer. Use the zoom control (65%-180%) to view pages at a comfortable working size. Navigate between pages using the scroll or page navigation controls.
H3: Step 2 - Edit Existing Text or Add New Text
Click any existing text to enter edit mode - a text box appears over the text with the detected font properties. Edit the content directly. Press Tab or click elsewhere to confirm. For existing text that is longer than the original after editing, the tool automatically adjusts spacing to avoid overlap with adjacent content. To add new text: click the 'Add text' button, then click any location on the page - a new text box appears at your click position. Type your content and format using the toolbar: Bold, Italic, font size (any value), font family (Arial, Times New Roman, Courier New, or Georgia), and colour via the colour picker. To remove visible text: select the text box and click Whiteout - the area is filled with a white block that hides the text visually. Note: this is a visual overlay, not a true deletion from the PDF structure.
H3: Step 3 - Download Your Edited PDF
Click Download. Pages you edited are saved as high-resolution PNG image pages in the output PDF (at 2× pixel density for sharp rendering). Pages you did not edit pass through in their original vector format unchanged. All processing runs in your browser - your file is never uploaded.

H2: Formatting Options Available in the Editor.
The editing toolbar appears when you select or create a text box. Here are all available formatting controls:

Control
Options
What It Does
Bold
On / Off toggle
Makes selected text bold weight
Italic
On / Off toggle
Makes selected text italic
Font size
Any numeric value
Sets text size - increase for headings, decrease for annotations
Font family
Arial · Times New Roman · Courier New · Georgia
Sets the typeface for selected text - limited to four browser-safe fonts
Colour
Colour picker (any colour)
Sets the text colour - use for corrections, annotations, or highlighting
Duplicate
Button
Clones the selected text box at a slightly offset position
Whiteout
Button
Fills the text area with a white block (visual removal only)

💡  For edited text, the font family applied in the output image is the browser-safe font closest to the original. If the source PDF used a custom font not available in browsers (such as a specific corporate or decorative font), the edited version will substitute with the nearest browser-safe equivalent - typically Arial.

H2: Undo and Redo - Full Edit History.
Every edit action in the session is tracked in an unlimited undo/redo history stack. This includes: text edits, new text box additions, formatting changes, whiteout applications, and text box duplications.
•  Undo: Press Ctrl+Z (Windows/Linux) or Cmd+Z (Mac) to undo the most recent action. Repeat to step back through the full edit history
•  Redo: Press Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac) to redo an undone action
•  No undo limit: You can undo all the way back to the original unedited state from the moment of upload
•  Session-only: The undo history exists only for your current session. Once you download the PDF and reload the page, the history is cleared

H2: Important - Edited Pages Become Image-Based.
When you edit a page, RepetiGo re-renders the entire page as a high-resolution PNG image (at 2× pixel density) and embeds it as an image page in the output PDF. This is how your edits are applied universally - any PDF viewer on any device sees exactly what you designed, without font or rendering dependencies.
What this means for pages you edited:
•  Text on edited pages is part of the image - it cannot be selected, copied, or searched in any PDF reader
•  Ctrl+F (Find) will not find words on edited pages
•  Screen readers cannot read text on edited pages (accessibility impact)
•  File size may increase - image pages are typically larger than vector pages
What this means for pages you did NOT edit:
•  Unedited pages pass through the tool unchanged in their original format
•  Text on unedited pages remains searchable, selectable, and accessible
•  Unedited pages retain their original file efficiency
Practical recommendation: edit as few pages as possible to minimise raster impact. If you need to make corrections across many pages of a text-heavy document, editing the original source document (Word, Google Docs, Pages) and re-exporting the PDF is always cleaner than editing the PDF directly.
⚠️  The raster conversion of edited pages is a necessary trade-off for universal edit rendering across all PDF viewers. For documents where full text searchability after editing is essential - legal documents submitted to courts, searchable archives - consider editing the original source document instead.

H2: Edit PDF Without Adobe Acrobat.
Adobe Acrobat Pro offers true vector text editing - it modifies the PDF text layer directly, so edited pages remain searchable. But it requires a paid subscription (₹1,500-₹3,500/month). RepetiGo's free option uses image-based rendering for edits, which gives broad compatibility without requiring installation or payment:

Feature
RepetiGo
Adobe Acrobat Pro
Cost
Free
₹1,500-₹3,500/month
Server upload
No - browser-only
Cloud sync
Edit existing text
Yes - click-to-edit
Yes - true vector edit
Add new text
Yes
Yes
Insert images
No
Yes
Output text searchable (edited pages)
No - raster image pages
Yes - text remains in PDF layer
Undo/redo
Unlimited (session)
Unlimited (session)
Works without install
Yes (browser)
No (desktop app)
No sign-up
✅ Yes
Adobe ID required

H2: Edit PDF in India - Common Use Cases.
•  Correcting errors in exported PDFs: Documents exported from Word, Excel, or other software that contain typos, wrong dates, or outdated reference numbers - correct them directly in the PDF without returning to the source application
•  Adding annotations to shared documents: Mark up specifications, reports, and proposals with text annotations before sharing - add reviewer notes, markup questions, or approval stamps as text overlays
•  Updating contact information on letterheads: Official letterhead PDFs with outdated phone numbers, addresses, or designations - update the specific fields without recreating the entire document
•  Filling flat forms without form fields: Application forms, declaration templates, and self-attestation forms that are flat PDFs (no interactive fields) - add text boxes at the required positions
•  Adding reference numbers or dates: Invoice PDFs, delivery notes, and official correspondence that need a reference number or date stamp added before sending - place a text box at the exact position without reprinting
•  Print shop document corrections: Customer documents that need minor corrections (wrong date, wrong name spelling) before printing - edit and print without the customer needing to return with a corrected original

H2: Your Files Never Leave Your Browser.
RepetiGo's PDF tools run entirely in your browser. Your PDF is never uploaded to any server - it is processed locally on your device.
•  🔒 Browser-only processing: Your file never travels over any network to any server. No upload occurs at any stage.
•  🔐 No server session: There is no remote processing session, no isolated server workspace. Everything happens inside your browser tab.
•  🚫 No account = no data: No sign-up means we hold zero personal data about you. No file history, no email, no usage tracking.
•  👁️ Content never leaves device: No text, image, or document content is sent to or read by any external system or person.
•  ✅ Cleared on tab close: All local working data clears when you close or refresh the tab. Nothing persists on your device or any server.
🔒  Your file never leaves your device - not for 60 minutes, not ever. Browser-only processing is stronger privacy than any server-side deletion policy.
Privacy Policy → /security/ | Browser-only processing - no upload, no storage

H2: Edit PDF for Print Shops - Built into PrintPilot.
Print shop owners, cyber cafe operators, and CSC centre managers use RepetiGo's edit pdf tool as part of their customer document processing workflow - without switching to separate applications.
PrintPilot - RepetiGo's print shop management platform - integrates all 30 PDF tools directly into the shop dashboard. Customer documents uploaded by QR code are processed automatically before reaching the print queue.
•  Correct minor errors in customer documents before printing - without returning the document to the customer
•  Add reference numbers, dates, or shop stamps to customer-submitted PDFs before printing
•  Annotate or mark up documents for customers who need printed copies with corrections noted
🖨️  PrintPilot gives you all 30 PDF tools plus QR code document upload, AI document enhancement, secure print queue, UPI payments, and auto-delete compliance - built into one platform.

➜  [ Try PrintPilot Free - Print Shop Automation for India → repetigo.com/products/printpilot/ ]

H2: Common Questions About Editing a PDF.
H3: Q1: How do I edit text in a PDF online for free?
Go to repetigo.com/pdf-tools/edit-pdf, upload your PDF, and click any text on the page to enter edit mode. An editable text box appears over the text - type your corrections, format with the toolbar, and click elsewhere to confirm. Use 'Add text' mode to place new text boxes. Click Download when finished. Browser-only - no upload, no sign-up.
H3: Q2: Will the text in my edited PDF still be searchable?
Only on pages you did not edit. Pages you edited are rendered as image pages in the output PDF - text on those pages is part of the image and cannot be searched, selected, or copied. Pages you left untouched pass through in their original format and remain fully searchable. To minimise the searchability impact, edit only the specific pages that need changes.
H3: Q3: Can I undo my edits?
Yes - unlimited undo is available throughout your editing session. Press Ctrl+Z (or Cmd+Z on Mac) to undo any edit, and Ctrl+Y (or Cmd+Shift+Z) to redo. You can step back through the full edit history to the original unedited state. The undo history exists only for your current session - once you close the tab or reload the page, the history is cleared.
H3: Q4: What fonts can I use for new text?
For text you add (new text boxes), you can choose from four font families: Arial, Times New Roman, Courier New, and Georgia. These are browser-safe fonts that render consistently. For text you edit inline (existing text), the tool detects the original font from the PDF and uses the closest browser-safe equivalent - typically Arial for sans-serif fonts and Times New Roman for serif fonts.
H3: Q5: Can I edit a scanned PDF?
Scanned PDFs with no text layer cannot be directly edited using click-to-edit. If the PDF was scanned without OCR (no text layer), there is no text for the editor to detect and make clickable. Run the PDF through the OCR PDF tool at /pdf-tools/ocr-pdf first to add a text layer, then open the resulting PDF in the editor. If the scanned PDF has a text layer added by OCR, the editor can work with it.
H3: Q6: What does Whiteout do - does it delete the text?
Whiteout fills the selected text box area with a solid white block, making the text visually invisible in the output PDF. It does not delete the underlying text from the PDF structure - in some PDF editors, the original text may still be accessible beneath the white block. For permanent, irrecoverable content removal, use the Redact PDF tool at /pdf-tools/redact-pdf instead.
H3: Q7: Can I edit a PDF on my iPhone or Android phone?
Yes - the editor works in any mobile browser. Open Safari on iPhone or Chrome on Android, go to repetigo.com/pdf-tools/edit-pdf, upload your PDF from the Files app, and use the touch interface to interact with the editor. Tap existing text to select it, tap 'Add text' and tap the page to add new text boxes. The toolbar is accessible on mobile screens. Download the edited PDF when finished.
H3: Q8: Why does my edited PDF look the same but now the file size is much larger?
Image pages (raster) are significantly larger in file size than vector text pages. When a page is edited, it is converted from a compact vector representation (where text is stored as character codes and font references) to a pixel image (where every dot on the page is stored as colour data). A single edited A4 page at 2× resolution may be 500KB-2MB in size. If file size is a concern after editing, run the edited PDF through the Compress PDF tool at /pdf-tools/compress-pdf.

H2: More Free PDF Editing Tools from RepetiGo.
•  Add Text with PDF Forms → /pdf-tools/pdf-form - add text overlays to flat PDFs without entering full edit mode
•  Crop PDF → /pdf-tools/crop-pdf - trim margins before or after editing
•  Rotate PDF → /pdf-tools/rotate-pdf - fix orientation before editing
•  Compress PDF → /pdf-tools/compress-pdf - reduce file size after editing (image pages are larger)
•  All PDF Tools → /pdf-tools

➜  [ Edit Your PDF Free - No Sign-Up → repetigo.com/pdf-tools/edit-pdf ]`;

const faqs = Array.from(editPdfContent.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function EditPdfPage() { return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><JsonLd /><article className="tool-seo-content" id="edit-pdf-guide"><StructuredSeoCopy content={editPdfContent} /></article><InPlacePdfEditor headingLevel="h2" /></div></DashboardShell>; }

type SeoTable = { headers: string[]; rows: string[][] };
function StructuredSeoCopy({ content }: { content: string }) { return <>{splitBlocks(content).map((block, index) => { if (block.kind === "heading") { const Heading = `h${block.level}` as "h1" | "h2" | "h3"; return <Heading key={index}>{block.text}</Heading>; } if (block.kind === "table") return <SeoTable key={index} {...block.table} />; if (block.lines[0]?.startsWith("✓")) return <div className="tool-seo-badges" key={index}>{block.lines.join(" ").split(/\s{2,}/).map((item) => <span key={item}>{item}</span>)}</div>; const ctas = block.lines.filter(isCtaLine); if (ctas.length) return <section className="tool-seo-copy-block" key={index}><div className="tool-seo-cta-stack">{ctas.map((line) => <CtaLine key={line} text={line} />)}</div>{renderLines(block.lines.filter((line) => !isCtaLine(line)), `${index}`)}</section>; return <div className="tool-seo-copy-paragraph" key={index}>{renderLines(block.lines, `${index}`)}</div>; })}</>; }
type ContentBlock = { kind: "heading"; level: 1 | 2 | 3; text: string } | { kind: "table"; table: SeoTable } | { kind: "text"; lines: string[] };
function splitBlocks(content: string): ContentBlock[] { const lines = content.split(/\r?\n/).map((line) => line.trim()); const blocks: ContentBlock[] = []; let text: string[] = []; const flush = () => { if (text.length) blocks.push({ kind: "text", lines: text }); text = []; }; for (let index = 0; index < lines.length;) { const heading = lines[index].match(/^H([123]):\s*(.+)$/); const table = getTableDefinition(lines, index); if (heading) { flush(); blocks.push({ kind: "heading", level: Number(heading[1]) as 1 | 2 | 3, text: heading[2] }); index += 1; continue; } if (table) { flush(); const values: string[] = []; index += table.headerLines; while (index < lines.length && lines[index]) { values.push(lines[index]); index += 1; } blocks.push({ kind: "table", table: { headers: table.headers, rows: chunkRows(values, table.headers.length) } }); continue; } if (!lines[index]) { flush(); index += 1; continue; } text.push(lines[index]); index += 1; } flush(); return blocks; }
const TABLE_HEADER_SETS = [
  ["Capability", "Available", "Notes"],
  ["Control", "Options", "What It Does"],
  ["Feature", "RepetiGo", "Adobe Acrobat Pro"],
  ["The Real Situation", "What They Think They Need", "What Actually Helps"],
];
function getTableDefinition(lines: string[], index: number): { headers: string[]; headerLines: number } | null {
  for (const headers of TABLE_HEADER_SETS) {
    if (headers.every((header, offset) => lines[index + offset] === header)) return { headers, headerLines: headers.length };
  }
  return null;
}
function chunkRows(values: string[], size: number) { const rows: string[][] = []; for (let index = 0; index < values.length; index += size) rows.push(values.slice(index, index + size)); return rows; }
function renderLines(lines: string[], prefix: string) { const output: React.ReactNode[] = []; for (let index = 0; index < lines.length; index += 1) { const line = lines[index]; if (/^[•-]\s/.test(line) || /^\d+\.\s/.test(line)) { const ordered = /^\d+\./.test(line); const items: string[] = []; while (index < lines.length && (ordered ? /^\d+\.\s/.test(lines[index]) : /^[•-]\s/.test(lines[index]))) { items.push(lines[index].replace(/^(?:•|-|\d+\.)\s*/, "")); index += 1; } index -= 1; output.push(ordered ? <ol className="tool-seo-steps" key={`${prefix}-list-${index}`}>{items.map((item) => <li key={item}>{renderInlineMappedLinks(item)}</li>)}</ol> : <ul className="tool-seo-list" key={`${prefix}-list-${index}`}>{items.map((item) => <li key={item}>{renderInlineMappedLinks(item)}</li>)}</ul>); } else if (/^(?:💡|✅|⚠️|🔒|🔐|🗑️|👁️|🚫|🖨️|â|ð)/.test(line)) output.push(<aside className="tool-seo-callout" key={`${prefix}-${index}`}>{renderInlineMappedLinks(line)}</aside>); else output.push(<p key={`${prefix}-${index}`}>{renderInlineMappedLinks(line)}</p>); } return output; }
function SeoTable({ headers, rows }: SeoTable) { return <div className="tool-seo-table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{renderInlineMappedLinks(cell)}</td>)}</tr>)}</tbody></table></div>; }
function isCtaLine(line: string) { return line.trim().startsWith("[") && line.trim().endsWith("]"); }
function CtaLine({ text }: { text: string }) { const inner = text.trim().slice(2, -2); const arrow = inner.indexOf("→"); const href = mapSeoRoute(arrow >= 0 ? inner.slice(arrow + 1) : ""); return <a className="tool-seo-inline-cta" href={href || "#edit-pdf-guide"}>{(arrow >= 0 ? inner.slice(0, arrow) : inner).trim()}{href ? <span>→</span> : null}</a>; }
function renderInlineMappedLinks(text: string) { return text.split(/(repetigo\.com\/(?:tools\/pdf\/[a-z-]+|pricing)\/?|\/tools\/pdf\/[a-z-]*\/?|\/products\/printpilot\/?|\/features\/(?:auto-delete|qr-upload)\/?|\/security\/?)/g).map((part, index) => { const href = mapSeoRoute(part.startsWith("repetigo.com") ? `https://${part}` : part); return href ? <a href={href} key={`${part}-${index}`}>{getRouteLabel(href)}</a> : part; }); }
function mapSeoRoute(route: string) { const clean = route.trim().replace(/^https?:\/\/(www\.)?repetigo\.com/i, "").replace(/\/$/, ""); const routes: Record<string, string> = { "/pdf-tools": "/pdf-tools", "/pdf-tools/edit-pdf": "/pdf-tools/edit-pdf", "/pdf-tools/unlock-pdf": "/pdf-tools/unlock-pdf", "/pdf-tools/pdf-to-word": "/pdf-tools/pdf-to-word", "/pdf-tools/ocr-pdf": "/pdf-tools/ocr-pdf", "/pdf-tools/watermark-pdf": "/pdf-tools/watermark-pdf", "/pdf-tools/add-page-numbers": "/pdf-tools/page-numbers", "/pdf-tools/redact-pdf": "/pdf-tools/redact-pdf", "/pdf-tools/pdf-form": "/pdf-tools/pdf-form", "/pdf-tools/crop-pdf": "/pdf-tools/crop-pdf", "/pdf-tools/rotate-pdf": "/pdf-tools/rotate-pdf", "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf", "/products/printpilot": "/print-automation", "/security": "/privacy-policy", "/features/auto-delete": "/privacy-policy", "/features/qr-upload": "/print-automation", "/pricing": "/pricing" }; return routes[clean] || ""; }
function getRouteLabel(href: string) { const labels: Record<string, string> = { "/pdf-tools": "Explore All PDF Tools", "/pdf-tools/edit-pdf": "Open PDF Editor", "/pdf-tools/unlock-pdf": "Open Unlock PDF", "/pdf-tools/pdf-to-word": "Open PDF to Word", "/pdf-tools/ocr-pdf": "Open OCR PDF", "/pdf-tools/watermark-pdf": "Open Add Watermark", "/pdf-tools/page-numbers": "Open Page Numbers", "/pdf-tools/redact-pdf": "Open Redact PDF", "/pdf-tools/pdf-form": "Open PDF Form", "/pdf-tools/crop-pdf": "Open Crop PDF", "/pdf-tools/rotate-pdf": "Open Rotate PDF", "/pdf-tools/compress-pdf": "Open Compress PDF", "/print-automation": "Learn About PrintPilot", "/privacy-policy": "Read Privacy Policy", "/pricing": "Start Free Trial" }; return labels[href] || "Open Tool"; }
function JsonLd() { const schemas = [{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PDF Editor", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF editor - click to edit existing text or add new text anywhere, with bold/italic/colour/size formatting and unlimited undo/redo, entirely in the browser. Edited pages become image-based; unedited pages stay in their original format.", url: pageUrl }, { "@context": "https://schema.org", "@type": "HowTo", name: "How to Edit a PDF in 3 Steps", step: [{ "@type": "HowToStep", name: "Upload and Browse Your PDF" }, { "@type": "HowToStep", name: "Edit Existing Text or Add New Text" }, { "@type": "HowToStep", name: "Download Your Edited PDF" }] }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Edit PDF", item: pageUrl }] }]; return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>; }
