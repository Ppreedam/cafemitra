import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import ConversionTool from "../ConversionTool";

const pageUrl = "https://repetigo.com/pdf-tools/excel-to-pdf";
export const metadata: Metadata = {
  title: "Excel to PDF Converter Free - Save Spreadsheets as PDF | RepetiGo",
  description: "Convert Excel to PDF free - save spreadsheets, charts, and multiple sheets as PDF. Works without Microsoft Excel. No sign-up. Files auto-deleted after 60 min. Try free.",
  alternates: { canonical: pageUrl },
  openGraph: { title: "Excel to PDF Converter Free - Save Spreadsheets as PDF | RepetiGo", description: "Convert Excel to PDF free online. Works without Microsoft Excel. Save multiple sheets as one PDF. No sign-up, auto-deleted 60 min.", type: "website", url: pageUrl, images: ["https://repetigo.com/og-excel-to-pdf.jpg"] },
  twitter: { card: "summary_large_image", title: "Excel to PDF Converter Free - RepetiGo", description: "Convert Excel to PDF free. Works without Excel. Multiple sheets to one PDF. No sign-up, auto-deleted." },
  robots: { index: true, follow: true },
};

const excelToPdfContent = String.raw`H1: Excel to PDF Converter. Save Any Spreadsheet as PDF - With or Without Excel.
There are three ways to convert Excel to PDF. If you have Microsoft Excel installed, the built-in Save As option is the fastest. If you use Google Sheets, it has a built-in PDF download. If you do not have Excel installed - or need to convert an .xlsx file someone sent you - RepetiGo's free online converter handles it in your browser, no installation needed.
This page covers all three methods, the most common formatting problems (columns getting cut off, multi-sheet PDF issues), and when to use RepetiGo's online converter over the built-in options.
✓ Works Without Microsoft Excel   ✓ Multiple Sheets → One PDF   ✓ No Sign-Up   ✓ Files Auto-Deleted in 60 Min

[ Convert Excel to PDF Free - No Excel Required → repetigo.com/pdf-tools/excel-to-pdf ]

H2: Which Method Should I Use to Convert Excel to PDF?
The right method depends on what software you have and what outcome you need:
Method
When to Use
Pros
Cons
★ Microsoft Excel - File → Save As → PDF (Method 1)
You have Microsoft Excel installed (Windows or Mac)
Fastest. Best formatting preservation. No internet needed.
Only works if Excel installed. Cannot batch convert multiple .xlsx files at once.
Google Sheets - File → Download → PDF (Method 2)
You use Google Sheets, or have the file in Google Drive
Free. No installation. Available on phone.
Requires Google account. Minor formatting differences from Excel.
RepetiGo Online Converter (Method 3)
No Excel installed. Chromebook. Batch conversion. Received .xlsx from someone.
Browser-based. No Excel needed. Auto-deletes files. Precise page settings.
Requires internet connection. File size limit applies.
Print to PDF (any app)
Quick single-page capture when other methods aren't available
Available on any OS. No tool needed.
Poor column control. Wide sheets may be cut off. No batch.

💡  If you have Microsoft Excel installed on your computer, Method 1 (Save As → PDF) is always the fastest and produces the most accurate output. RepetiGo's tool is for when you don't have Excel - or when you need to convert an .xlsx file you received without opening it first.

H2: Method 1 - Save as PDF Using Microsoft Excel (Built-In).
The fastest and most accurate way to convert Excel to PDF is the built-in Save As function in Microsoft Excel. This method works on Windows and Mac, preserves all formatting, and does not require any additional software or internet connection.
H3: On Windows - File → Save As → PDF
Step 1: Open your Excel file in Microsoft Excel. Step 2: Go to File → Save As. Step 3: In the 'Save as type' dropdown, select 'PDF (*.pdf)'. Step 4: Choose where to save the file. Optionally click 'Options' to select which sheets to include, the page range, or whether to optimize for Standard or Minimum size. Step 5: Click Save. Your PDF is created in the same folder.
Alternative on Windows: File → Export → Create PDF/XPS → Publish. Both produce the same output.
H3: On Mac - File → Export → PDF
Step 1: Open your Excel file in Excel for Mac. Step 2: Go to File → Export. Step 3: Select 'PDF' as the file format. Step 4: In the export dialog, choose the sheet(s) and any print area options. Step 5: Click Export. Alternatively: File → Print → PDF dropdown (bottom-left) → Save as PDF.
Mac users: if your columns are getting cut off, go to Page Layout tab → Scale to Fit → set Width to 1 page before exporting.
✅  Microsoft Excel's built-in PDF export preserves your exact formatting - fonts, cell colours, borders, merged cells, charts, and frozen rows/columns all transfer correctly. For professional documents (financial statements, reports, invoices), the built-in method always produces the most accurate PDF.

H2: Method 2 - Convert to PDF Using Google Sheets (Free).
If you use Google Sheets instead of Microsoft Excel - or if you have uploaded your .xlsx file to Google Drive - you can download it as a PDF directly from Google Sheets. This is a free option that requires no additional software.
Steps: (1) Open your file in Google Sheets (go to Google Drive, right-click the .xlsx file, select Open with → Google Sheets). (2) Go to File → Download → PDF Document (.pdf). (3) A PDF export dialog opens - choose your page orientation, scale, margins, and which sheets to include. (4) Click Export to download the PDF.
Google Sheets PDF export works well for standard spreadsheets. For complex Excel files with many custom fonts, advanced conditional formatting, or Excel-specific features (like pivot table slicers), there may be minor formatting differences compared to exporting directly from Excel.
Indian users: if you use Google Workspace through your school or office (common in Indian educational institutions and startups), Google Sheets is already available. File → Download → PDF Document is the built-in free method.

H2: Method 3 - RepetiGo Online Converter (No Excel Required).
When you need to convert an Excel file to PDF without Microsoft Excel installed - or when you received an .xlsx file and need to convert it without opening it - RepetiGo's free online converter handles it in your browser.
Steps: (1) Go to repetigo.com/pdf-tools/excel-to-pdf. (2) Upload your .xlsx, .xls, or .csv file by clicking Upload or dragging and dropping. (3) Choose which sheets to convert, your page orientation (portrait or landscape), and your scaling preference (fit to page or actual size). (4) Click Convert. (5) Download your PDF - your file is deleted from our servers within 60 minutes.
RepetiGo's online converter is particularly useful for:
Chromebook users (Chrome OS does not run Microsoft Excel natively)
Linux users (Excel is not available on Linux - LibreOffice can be used but may have formatting differences)
Received an .xlsx file and need a PDF version without opening it in Excel
Converting a batch of .xlsx files from colleagues or clients
Mobile users on Android or iPhone who need to convert a spreadsheet on the go

H2: Why Indian Professionals Convert Excel to PDF.
Use Case
Why Excel → PDF
Common in India
📊  Financial Reports & Statements
Share formatted financial data that cannot be accidentally edited. PDF locks formatting so the document looks identical for every recipient.
GST reconciliation, P&L statements, balance sheets sent to CAs and auditors
🏛️  Government Tender Submissions
Government portals (GeM, CPPP, state portals) require price schedules and item lists in PDF. These are usually created in Excel first.
BoQ sheets, rate analysis, quantity schedules converted to PDF for online tender submission
🎓  Academic Submission
Colleges and universities require research data, timetables, and project reports in PDF format.
Student project data tables, faculty timetables, research results submitted in PDF
🧾  Invoice and Billing
Excel-based invoice templates converted to PDF for professional delivery to clients.
Freelancer and small business invoices created in Excel, sent as PDF to clients
📋  MIS Reports
Management information system reports created in Excel are distributed as PDF to prevent modification.
Monthly MIS reports shared with senior management via email as non-editable PDF
🏢  HR & Payroll
Salary slips and HR documents formatted in Excel are distributed as individual PDFs.
Payroll sheets converted to PDF for emailing individual salary slips to employees

H2: When to Use RepetiGo Instead of Built-In Excel.
For most users with Excel installed, the built-in Save As → PDF is the best option. However, RepetiGo's online excel to pdf converter is the better choice in these specific situations:
Situation
Why RepetiGo Is Better
How It Helps
No Microsoft Excel installed
Excel is not free - Microsoft 365 subscription required for the desktop app. Without Excel, you cannot use the built-in method.
RepetiGo converts .xlsx files to PDF in the browser without any software installation.
Chromebook or Linux
Microsoft Excel does not run natively on Chrome OS or Linux. The web version of Excel (Excel Online) cannot export to PDF in all subscription tiers.
RepetiGo works in Chrome on Chromebook - no compatibility issues.
Received .xlsx - need PDF without opening
Sometimes you receive a spreadsheet file and need a PDF without opening it in Excel or changing anything.
Upload to RepetiGo, convert, download. The original file is not opened or modified.
Phone or tablet
The Excel mobile app has limited PDF export options. Google Sheets mobile export is more capable but has limitations.
RepetiGo's browser-based converter works on Android (Chrome) and iPhone (Safari).
Privacy - auto-delete required
You need to convert a sensitive spreadsheet and want it deleted immediately after.
RepetiGo permanently deletes all uploaded files 60 minutes after download.

H2: Common Formatting Problems - and How to Fix Them.
The most common complaint when converting Excel to PDF is that columns get cut off - part of the spreadsheet is missing from the PDF output. Here are the fixes:
Problem
Cause
Fix
Columns cut off on right side
Spreadsheet is wider than the page. Default page is A4 portrait which cuts wide spreadsheets.
In Excel: Page Layout → Orientation → Landscape. Or: Page Layout → Scale to Fit → Width: 1 page.
Rows cut off at bottom
Too many rows for one page. Page breaks are in unexpected places.
In Excel: View → Page Break Preview → drag page breaks to adjust. Or: Scale to Fit → Height: set to specific number of pages.
Gridlines not showing
Excel doesn't print gridlines by default.
Page Layout → Sheet Options → Gridlines → check 'Print'.
Charts or images missing
Charts outside the print area are not included.
Set the print area to include charts: Page Layout → Print Area → Set Print Area.
Sheet 1 only - other sheets missing
When you Save As PDF without selecting all sheets, only the active sheet converts.
Before saving: right-click on the first sheet tab → Select All Sheets → then File → Save As → PDF.
Tiny text - spreadsheet shrunk to fit
Scale to Fit has shrunk the text to fit on one page, making it unreadable.
In Excel: Page Layout → Scale to Fit → set Width and Height to 'Automatic'. Then set Landscape and reduce margins instead.

★  The most common fix for cut-off columns: Page Layout tab → Orientation → Landscape → Scale to Fit → Width: 1 page. This forces all columns onto each page by using landscape orientation and auto-scaling the content to fit.

H2: Your Spreadsheet Is Safe. Always.
When you upload an Excel file to RepetiGo's converter - especially one containing financial data, salary information, or business reports - here is exactly what happens:
Protection Layer
What It Means in Practice
🔒  HTTPS Encrypted Transfer
Your Excel file travels from your device to our server over HTTPS (TLS encryption). It cannot be intercepted in transit.
🔐  Isolated Processing Session
Your file is processed in a temporary session with no link to any user account or persistent identifier.
🗑️  Auto-Deleted in 60 Minutes
Your uploaded Excel file and the converted PDF are automatically and permanently deleted within 60 minutes of download.
👁️  No Data Is Read or Stored
The converter reads the file structure to render it as PDF. No cell data, financial figures, or personal information is stored, logged, or used for any purpose beyond conversion.
🚫  No Account = No Data Profile
No sign-up means no personal data is held. No file history, no usage profile.

Read our Privacy Policy → /security/

H2: Excel to PDF for Print Shops - The Automated Way.
Print shop owners sometimes receive customer files in Excel format - pricing lists, order forms, inventory tables - that need to be printed or shared as PDFs. The standalone excel to pdf free converter handles one-off conversions.
For print shops integrated with PrintPilot - RepetiGo's print shop software - document processing is handled automatically. When a customer uploads an Excel file via QR code, PrintPilot's AI converts it to a print-ready PDF as part of the automated workflow, without requiring Excel to be installed on the shop's computer.
Learn about PrintPilot → /products/printpilot/ | QR Document Upload → /features/qr-upload/

[ Try PrintPilot Free → repetigo.com/pricing/ ]
[ Or Convert Excel to PDF Now → repetigo.com/pdf-tools/excel-to-pdf ]

H2: Common Questions About Converting Excel to PDF.
H3: Q1: How do I convert Excel to PDF?
There are three methods. If you have Excel installed: File → Save As → select PDF as the file format → Save (Windows) or File → Export → PDF (Mac). If you use Google Sheets: open the file in Google Sheets → File → Download → PDF Document. If you don't have Excel installed: go to repetigo.com/pdf-tools/excel-to-pdf, upload your .xlsx file, configure your settings, click Convert, and download the PDF. All three methods are free. The built-in Excel method is fastest if you have Excel. RepetiGo is for when you don't.
H3: Q2: How do I save an Excel file as a PDF?
In Microsoft Excel on Windows: File → Save As → change the file type to 'PDF (*.pdf)' → click Options to choose which sheets or page ranges to include → Save. On Mac: File → Export → select PDF → Export. The PDF is saved to the same location as your Excel file. If you want to include all sheets (not just the active one), select all sheet tabs first by right-clicking the first tab → 'Select All Sheets', then perform the Save As.
H3: Q3: How do I convert an Excel file to PDF using Google Sheets?
Open Google Drive (drive.google.com). Right-click your .xlsx file → Open with → Google Sheets. Once open in Google Sheets: File → Download → PDF Document (.pdf). A dialog opens where you choose: Page orientation (portrait or landscape), Scale (fit to page or normal), Margins, and which sheets to include. Click Export and the PDF downloads. For Indian users who use Google Workspace (school or business Gmail accounts), this is the most accessible free method without any subscription.
H3: Q4: Can I convert Excel to PDF without Microsoft Excel installed?
Yes. Two options: (1) Google Sheets - upload your .xlsx to Google Drive, open in Google Sheets, File → Download → PDF. Requires a Google account. (2) RepetiGo - go to repetigo.com/pdf-tools/excel-to-pdf, upload your .xlsx file, convert, and download. Works in any browser, no account or software required. For Chromebook users (Chrome OS), LibreOffice is not available natively, so RepetiGo's online converter or Google Sheets are the practical options.
H3: Q5: How do I convert multiple sheets in Excel to one PDF?
Using Microsoft Excel: Before saving, right-click any sheet tab and choose 'Select All Sheets'. All tabs should now be selected (the tab names appear bold). Go to File → Save As → PDF → Save. Excel combines all selected sheets into one PDF with each sheet starting on a new page. If you want to select specific sheets (not all), hold Ctrl and click each tab you want, then Save As → PDF. Using RepetiGo: upload the .xlsx file, in the settings choose 'All sheets' or select specific sheets, then convert - the output is a single PDF with all selected sheets.
H3: Q6: How do I save multiple sheets in an Excel workbook as one PDF?
This is the most common multi-sheet challenge. In Excel: right-click the leftmost sheet tab → 'Select All Sheets' (all tab names turn white/bold, indicating selection). While all sheets are selected: File → Save As → choose PDF. Click 'Options' in the save dialog and make sure 'Entire Workbook' is selected (not just 'Active Sheets'). Click OK → Save. The output PDF contains all sheets in order. If sheet page breaks are wrong, adjust them using View → Page Break Preview on each sheet individually before combining.
H3: Q7: How do I convert Excel to PDF without columns being cut off?
Columns getting cut off is the most common formatting problem. Fix 1 (Landscape): Page Layout tab → Orientation → Landscape. This gives more horizontal space for wide spreadsheets. Fix 2 (Scale to Fit): Page Layout → Scale to Fit → Width: 1 page. This shrinks the spreadsheet to fit all columns on each page. Be careful - very wide spreadsheets shrunk to fit may produce tiny, unreadable text. Fix 3 (Print Area): Select only the columns you need → Page Layout → Print Area → Set Print Area. This excludes unused columns from the PDF. Fix 4 (RepetiGo): Upload to our converter and choose the 'Fit to Width' option - the converter automatically scales to fit all columns.
H3: Q8: How do I convert Excel to PDF on a Mac?
In Microsoft Excel for Mac: File → Export → PDF. Or: File → Print → click the 'PDF' dropdown in the bottom-left of the print dialog → 'Save as PDF'. For the best formatting preservation, use File → Export → PDF and set your page orientation and scale before exporting. On Mac, you can also open the .xlsx in Numbers (Apple's free spreadsheet app), then File → Export To → PDF. Numbers may reformat the spreadsheet slightly but works for simple files.
H3: Q9: How do I convert Excel to PDF on my phone?
On Android: if you have the Microsoft Excel app (free with limited features), open your file → File → Export → PDF. Or: open the file in Google Sheets app (free) → three-dot menu → Share & Export → Download as PDF. On iPhone: if you have the Excel app, the same export path works. Alternatively, use Google Sheets on the browser or app. RepetiGo's browser-based converter also works on Android (Chrome) and iPhone (Safari) - upload from Files app, convert, download PDF.
H3: Q10: Is it safe to upload an Excel file with financial data to a free online converter?
RepetiGo uses HTTPS for all transfers. Your Excel file is processed in an isolated temporary session with no user account linkage. The file and the converted PDF are automatically deleted within 60 minutes of download. No cell data, financial figures, names, or personal information is read, stored, or used for any purpose beyond rendering the PDF. For maximum security with highly sensitive spreadsheets (complete financial records, payroll data, legal documents), consider whether the 60-minute retention window is acceptable, or use the built-in Excel export which never leaves your local computer.

H2: More Free PDF Tools from RepetiGo.
Tool
What It Does
Link
PDF to Excel
Extract tables and data from PDF into Excel - the reverse of this tool
→ /pdf-tools/pdf-to-excel
Word to PDF
Convert Word documents to PDF - same workflow as Excel to PDF
→ /pdf-tools/word-to-pdf
Compress PDF
Reduce the PDF file size after conversion
→ /pdf-tools/compress-pdf
Split PDF
Split the multi-sheet PDF into individual pages or sections
→ /pdf-tools/split-pdf
Rotate PDF
Fix page orientation if pages appear sideways after conversion
→ /pdf-tools/rotate-pdf
JPG to PDF
Convert images to PDF
→ /pdf-tools/jpg-to-pdf
All PDF Tools
Complete PDF tools suite
→ /pdf-tools

[ Convert Excel to PDF Free - No Sign-Up → repetigo.com/pdf-tools/excel-to-pdf ]
[ Explore All PDF Tools → repetigo.com/pdf-tools ]`;

const faqs = Array.from(excelToPdfContent.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);
export default function ExcelToPdfPage() { return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><ConversionTool slug="excel-to-pdf"><JsonLd /><article className="tool-seo-content" id="excel-to-pdf-guide"><StructuredSeoCopy content={excelToPdfContent} /></article></ConversionTool></div></DashboardShell>; }

type SeoTable = { headers: string[]; rows: string[][] };
function StructuredSeoCopy({ content }: { content: string }) { const normal = separateBlocks(content); return <>{normal.split(/\n{2,}/).map((block, index) => { const text = block.trim(); if (!text) return null; const [first, ...rest] = text.split("\n"); if (first.startsWith("H1: ")) return <h1 key={index}>{first.slice(4)}</h1>; if (first.startsWith("H2: ")) return <h2 key={index}>{first.slice(4)}</h2>; if (first.startsWith("H3: ")) return <h3 key={index}>{first.slice(4)}</h3>; const table = getKnownTable(text); if (table) return <SeoTable key={index} {...table} />; if (first.startsWith("✓")) return <div className="tool-seo-badges" key={index}>{text.split(/\s{2,}/).map((item) => <span key={item}>{item}</span>)}</div>; const lines = text.split("\n"); const ctas = lines.filter(isCtaLine); if (ctas.length) return <section className="tool-seo-copy-block" key={index}><div className="tool-seo-cta-stack">{ctas.map((line) => <CtaLine key={line} text={line} />)}</div>{renderContentLines(lines.filter((line) => !isCtaLine(line)), `${index}-cta`)}</section>; return <div className="tool-seo-copy-paragraph" key={index}>{renderContentLines(lines, `${index}`)}</div>; })}</>; }
function renderContentLines(lines: string[], prefix: string) { const output: React.ReactNode[] = []; for (let index = 0; index < lines.length; index += 1) { const line = lines[index]; if (isUsefulListItem(line)) { const items: string[] = []; while (index < lines.length && isUsefulListItem(lines[index])) { items.push(lines[index]); index += 1; } index -= 1; output.push(<ul className="tool-seo-list" key={`${prefix}-list-${index}`}>{items.map((item) => <li key={item}>{renderInlineMappedLinks(item)}</li>)}</ul>); } else output.push(renderContentLine(line, `${prefix}-${index}`)); } return output; }
function isUsefulListItem(line: string) { return /^(Chromebook users|Linux users|Received an \.xlsx file|Converting a batch|Mobile users)/.test(line); }
function renderContentLine(line: string, key: string) { const steps = line.split(/(?=Step \d+:)/).map((part) => part.trim()).filter(Boolean); if (steps.length > 1 && steps.every((part) => /^Step \d+:/.test(part))) return <ol className="tool-seo-steps" key={key}>{steps.map((step) => <li key={step}>{renderInlineMappedLinks(step.replace(/^Step \d+:\s*/, ""))}</li>)}</ol>; const numbered = line.split(/(?=\(\d+\)\s)/).map((part) => part.trim()).filter(Boolean); if (line.startsWith("Steps:") && numbered.length > 1) return <ol className="tool-seo-steps" key={key}>{numbered.slice(1).map((step) => <li key={step}>{renderInlineMappedLinks(step.replace(/^\(\d+\)\s*/, ""))}</li>)}</ol>; if (/^(?:💡|✅|★|⚠️|🔒|â|ð)/.test(line)) return <aside className="tool-seo-callout" key={key}>{renderInlineMappedLinks(line)}</aside>; return <p key={key}>{renderInlineMappedLinks(line)}</p>; }
function separateBlocks(content: string) { const starts = ["Method\nWhen to Use", "Use Case\nWhy Excel → PDF", "Situation\nWhy RepetiGo Is Better", "Problem\nCause", "Protection Layer\nWhat It Means in Practice", "Tool\nWhat It Does"]; const withHeadings = content.replace(/(^|\n)(H[123]: [^\n]+)\n/g, "$1\n$2\n\n"); return starts.reduce((result, start) => result.replaceAll(`\n${start}`, `\n\n${start}`), withHeadings); }
function getKnownTable(text: string): SeoTable | null { const lines = text.split("\n").filter(Boolean); const defs: Record<string, string[]> = { Method: ["Method", "When to Use", "Pros", "Cons"], "Use Case": ["Use Case", "Why Excel → PDF", "Common in India"], Situation: ["Situation", "Why RepetiGo Is Better", "How It Helps"], Problem: ["Problem", "Cause", "Fix"], "Protection Layer": ["Protection Layer", "What It Means in Practice"], Tool: ["Tool", "What It Does", "Link"] }; const headers = defs[lines[0]]; if (!headers || !headers.every((header, index) => lines[index] === header)) return null; return { headers: headers[0] === "Tool" ? ["Tool", "What It Does", "Link"] : headers, rows: chunkRows(lines.slice(headers.length), headers.length) }; }
function chunkRows(values: string[], size: number) { const rows: string[][] = []; for (let index = 0; index < values.length; index += size) rows.push(values.slice(index, index + size)); return rows; }
function SeoTable({ headers, rows }: SeoTable) { return <div className="tool-seo-table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{renderTableCell(cell)}</td>)}</tr>)}</tbody></table></div>; }
function isCtaLine(line: string) { return line.trim().startsWith("[") && line.trim().endsWith("]"); }
function CtaLine({ text }: { text: string }) { const inner = text.trim().slice(2, -2); const arrow = inner.indexOf("→"); const href = mapSeoRoute(arrow >= 0 ? inner.slice(arrow + 1) : ""); return <a className="tool-seo-inline-cta" href={href || "#excel-to-pdf-guide"}>{(arrow >= 0 ? inner.slice(0, arrow) : inner).trim()}{href ? <span>→</span> : null}</a>; }
function renderTableCell(cell: string) { const href = mapSeoRoute(cell.replace(/^→\s*/, "")); return href ? <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a> : renderInlineMappedLinks(cell); }
function renderInlineMappedLinks(text: string) { return text.split(/(repetigo\.com\/(?:tools\/pdf\/[a-z-]+|tools\/excel-to-pdf|pricing)\/?|\/tools\/pdf\/[a-z-]*\/?|\/tools\/excel-to-pdf\/?|\/products\/printpilot\/?|\/features\/(?:qr-upload|auto-delete)\/?|\/security\/?)/g).map((part, index) => { const href = mapSeoRoute(part.startsWith("repetigo.com") ? `https://${part}` : part); return href ? <a href={href} key={`${part}-${index}`}>{getRouteLabel(href)}</a> : part; }); }
function mapSeoRoute(route: string) { const clean = route.trim().replace(/^https?:\/\/(www\.)?repetigo\.com/i, "").replace(/\/$/, ""); const routes: Record<string, string> = { "/pdf-tools": "/pdf-tools", "/pdf-tools/excel-to-pdf": "/pdf-tools/excel-to-pdf", "/pdf-tools/pdf-to-excel": "/pdf-tools/pdf-to-excel", "/pdf-tools/word-to-pdf": "/pdf-tools/word-to-pdf", "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf", "/pdf-tools/split-pdf": "/pdf-tools/split-pdf", "/pdf-tools/merge-pdf": "/pdf-tools/merge-pdf", "/pdf-tools/rotate-pdf": "/pdf-tools/rotate-pdf", "/pdf-tools/jpg-to-pdf": "/pdf-tools/jpg-to-pdf", "/products/printpilot": "/print-automation", "/features/qr-upload": "/print-automation", "/features/auto-delete": "/privacy-policy", "/security": "/privacy-policy", "/pricing": "/pricing" }; return routes[clean] || ""; }
function getRouteLabel(href: string) { const labels: Record<string, string> = { "/pdf-tools": "Explore All PDF Tools", "/pdf-tools/excel-to-pdf": "Open Excel to PDF", "/pdf-tools/pdf-to-excel": "Open PDF to Excel", "/pdf-tools/word-to-pdf": "Open Word to PDF", "/pdf-tools/compress-pdf": "Open Compress PDF", "/pdf-tools/split-pdf": "Open Split PDF", "/pdf-tools/merge-pdf": "Open Merge PDF", "/pdf-tools/rotate-pdf": "Open Rotate PDF", "/pdf-tools/jpg-to-pdf": "Open JPG to PDF", "/print-automation": "Learn About PrintPilot", "/privacy-policy": "Read Privacy Policy", "/pricing": "Start Free Trial" }; return labels[href] || "Open Tool"; }
function JsonLd() { const schemas = [{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Excel to PDF Converter", applicationCategory: "BusinessApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free Excel to PDF converter - convert .xlsx, .xls, .csv files to PDF without Microsoft Excel. No sign-up.", url: pageUrl }, { "@context": "https://schema.org", "@type": "HowTo", name: "How to Convert Excel to PDF Online Free", step: [{ "@type": "HowToStep", name: "Upload Excel file" }, { "@type": "HowToStep", name: "Choose sheet and range settings" }, { "@type": "HowToStep", name: "Download PDF" }] }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Excel to PDF", item: pageUrl }] }]; return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>; }
