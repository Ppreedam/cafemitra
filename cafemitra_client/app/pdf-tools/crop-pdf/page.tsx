import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "../../DashboardShell";
import PdfEditTool from "../PdfEditTool";

const pageUrl = "https://repetigo.com/pdf-tools/crop-pdf";

export const metadata: Metadata = {
  title: "Crop PDF Online Free - Trim Margins, Remove White Space | RepetiGo",
  description: "Crop any PDF free online - trim white margins, remove borders, and resize page dimensions. Works on Mac, Windows, and iPhone. No sign-up. Files never uploaded - processed in your browser.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Crop PDF Online Free - Trim Margins, Remove White Space | RepetiGo",
    description: "Crop any PDF free - trim white margins, remove borders, resize pages. Mac, Windows, iPhone. No sign-up, browser-only - never uploaded.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Crop PDF Online Free - RepetiGo",
    description: "Trim PDF margins and remove white space free. Mac, Windows, iPhone. No sign-up, browser-only - never uploaded.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Crop PDF Free Online. Trim Margins, Remove White Space, Resize Pages.
A scanned document with wide grey borders. A presentation with excessive white margins. A report where the page is A4 but the content fits on A5. These are the problems RepetiGo's free PDF cropping tool solves in seconds - upload your PDF, set your margins in points, and download a cleanly trimmed document.
No Adobe Acrobat. No software install. Works on Mac, Windows, and iPhone. Files never uploaded - processed in your browser.
✓ Trim margins in points on each side  ✓ Same crop applied to every page you select  ✓ No sign-up  ✓ Browser-only processing

➜  [ Crop PDF Now - Free, No Sign-Up → repetigo.com/tools/pdf/crop-pdf/ ]

H2: What Does Cropping a PDF Actually Do?
When you crop a PDF, you set a new visible page boundary - trimming content or whitespace from the edges of the page so PDF readers display a smaller page. The result is a PDF that looks and prints like it has smaller page dimensions, with the unwanted edge content hidden from view.
Cropping a PDF is not the same as:
•  Editing text inside the PDF - that is /tools/pdf/edit-pdf/
•  Removing specific pages - that is /tools/pdf/organize-pdf/
•  Extracting an image from inside the PDF - that is a separate extraction tool
•  Removing printer's crop marks - those are trim marks used in commercial print design, an unrelated feature
The primary use cases for cropping a PDF are:
•  Removing scanner border noise: Flatbed scanners often add a dark grey or black border around the scanned image. Cropping hides this, leaving only the document content visible.
•  Trimming excessive white margins: Documents exported from Word, PowerPoint, or InDesign sometimes have far more white margin than needed. Cropping tightens the page to the content area.
•  Resizing a page to a standard format: A document with irregular page dimensions can be cropped down toward A4, A5, Letter, or any custom size by trimming the right amount of margin.
•  Removing headers/footers before reuse: Cropping from the top or bottom hides unwanted headers, date stamps, or page footers added by software.
💡  RepetiGo's crop works the same way as macOS Preview's crop: it sets a new visible page boundary (called a 'CropBox') that tells PDF readers to display only the selected area. The trimmed content is hidden, not deleted from the underlying file - so file size doesn't meaningfully shrink, and the crop could technically be reversed by adjusting the CropBox in another PDF tool. For nearly every real-world use - viewing, printing, submitting to a portal - this is exactly what you want: a cleanly trimmed page. See the Mac section below for more on this.

H2: When Do You Need to Crop a PDF?
Here are the most common real-world situations where cropping is the right tool:
•  Thesis or research paper submission: University portals often require specific page dimensions. A scanned reference document or a PDF exported with incorrect margins needs cropping before upload.
•  Scan cleanup: A document scanned on a flatbed or MFP printer typically has a 10-15mm dark border on all sides from the glass edges. One crop hides all of it across every page.
•  Presentation PDF trimming: A 16:9 slide deck exported to PDF on an A4 page has massive white top and bottom margins. Cropping gives each slide its natural widescreen proportions.
•  Before printing: Removing white margins before printing reduces paper waste and makes the document fit better on the intended paper size. Print shops often need a properly cropped PDF to run a bleed-free job.
•  Page size standardisation: A collection of documents with mixed page sizes (some A4, some Letter, some A5) can each be individually cropped toward a consistent dimension before merging into a single PDF.

H2: How to Crop a PDF in 3 Steps.
The complete crop workflow - from upload to download - takes under a minute.

H3: Step 1 - Upload Your PDF
Click Upload or drag your PDF into the cropping tool. Any PDF works - scanned documents, exported presentations, text-based reports. Multi-page PDFs are supported: you can crop several pages in a single pass. Nothing is uploaded - your file is read directly in your browser. No account required.
H3: Step 2 - Set Your Crop Area
Enter the number of points to remove from each side - top, right, bottom, and left (72 points is about one inch). This is the only way to set the crop right now - there's no drag-to-select handle on the page preview. Every page is selected by default in the page picker; deselect any page you want to leave untouched, and your margin values apply to the rest.
H3: Step 3 - Download Your Cropped PDF
Click Download. Your cropped PDF saves to your device - opened in a normal PDF reader, it displays at the trimmed page size. Nothing was uploaded - the file was processed locally in your browser throughout. As with any CropBox-based crop (including macOS Preview's), the hidden margins remain in the file's underlying data - see the note above if that distinction matters for your use case.
📱  The PDF crop tool works on mobile browsers - Safari on iPhone, Chrome on Android - without any app download. Upload a scanned PDF from your Files app, set the crop margins, and download. Useful for trimming scanner borders when no desktop is available.

➜  [ Crop Your PDF Now - Free → repetigo.com/tools/pdf/crop-pdf/ ]

H2: What Crop Options Are Available?
Different documents need different cropping approaches. Here's what RepetiGo supports today:

H3: Crop All Pages at Once
For multi-page documents, the most common need is applying the same crop to every page simultaneously - particularly for scanned documents where every page has the same scanner border. Every page is selected by default in RepetiGo's page picker, so leaving them all selected applies your margin values to the whole document in one pass. Deselect any page you want to leave untouched.
H3: Crop by Entering Margin Values
Enter exact point measurements for each side independently:
•  Crop all sides equally: e.g., remove 30pt from all four sides - useful for removing uniform scanner borders (72 points is about an inch, so 30pt is a little under half an inch)
•  Crop one side only: e.g., remove 85pt from the bottom to eliminate a footer - leave the other sides at 0
•  Asymmetric crop: Remove different amounts from each side - e.g., left-heavy scanner bias, or a document with binding gutters on one side
There's no 'crop to A4' or 'crop to Letter' auto-calculation - you set margins in points and see the resulting page size after cropping. To hit an exact target size, work out the difference between your current page size and the target size in points, then split that across the sides you want to trim. You can only trim margins down from the current size - the tool can't add margins to make a page larger.
💡  Cropping (via CropBox) barely changes file size at all, since the hidden content is still stored in the file - compression is what actually reduces file size. Run the cropped PDF through RepetiGo's Compress PDF tool afterward if size matters.

H2: How to Crop a PDF on Mac Free.
Mac users have two options for cropping a PDF: the built-in macOS Preview app, and RepetiGo in a browser. It's worth knowing upfront that both work the same fundamental way.
H3: A Note About How PDF Cropping Actually Works
macOS Preview has a crop function (Tools → Rectangular Selection, then Tools → Crop). Like RepetiGo, Preview's crop sets a 'CropBox' instruction that tells PDF readers to display only the selected area - it does not delete the trimmed content from the underlying file.
This means, for both Preview and RepetiGo:
•  File size doesn't meaningfully reduce - the original page data is still there
•  A PDF reader or tool that ignores the CropBox will display the full, uncropped page
•  The full page can, in principle, be recovered by adjusting the CropBox in another PDF editor
•  For everyday use - viewing, printing, submitting a cleanly trimmed document - this is exactly what you want, and it's how most PDF crop tools (including Adobe Acrobat's) actually work
✅  If you're on a Mac and just need a quick crop without opening Preview, RepetiGo works the same way, in any browser, with no software to open: go to repetigo.com/tools/pdf/crop-pdf/, upload your PDF, and enter your margins.
Steps to crop a PDF on Mac with RepetiGo:
1.  Open Safari or Chrome on your Mac
2.  Go to repetigo.com/tools/pdf/crop-pdf/ and upload your PDF from Finder
3.  Enter your margin values in points for each side
4.  Leave the pages you want cropped selected in the page picker
5.  Click Download - the cropped PDF saves to your Mac

H2: Crop PDF Without Adobe Acrobat.
Adobe Acrobat Pro has a PDF cropping tool (Edit → Crop Pages) that works the same CropBox way most PDF crop tools do. Acrobat Pro requires a paid subscription; RepetiGo provides the same style of cropping free, in any browser, without a licence.
The difference between the options:
•  RepetiGo: free, browser-based, no install, CropBox-based crop, browser-only processing, works on Mac/Windows/Linux/phone
•  Adobe Acrobat Pro: paid subscription, desktop app, CropBox-based crop, full-featured professional PDF editor
•  macOS Preview: free, built-in on Mac, CropBox-based crop - the same underlying approach as RepetiGo and Acrobat
•  LibreOffice Draw: free, requires download and install, can crop PDFs
✅  For a one-time or occasional crop task, RepetiGo gives you the same result as Acrobat Pro or Preview, without the subscription cost or the software install.

H2: Crop PDF for Free in India.
PDF cropping is a regular task in India's academic, professional, and print ecosystems:
•  Thesis and dissertation formatting: UGC and university guidelines specify page margins. A PDF exported with incorrect margins must be cropped to exact specifications before submission to INFLIBNET or the university portal.
•  Government document scans: Documents scanned at e-Seva, CSC centres, or office MFPs typically have 10-20mm scanner borders on all sides. These must be removed before submission to UIDAI, MCA, IT Department, or other portals that check for clean, properly formatted documents.
•  CA and audit documents: Scanned physical documents - balance sheets, partner agreements, MOUs - need their scan borders removed before being attached to ITR filings, GST submissions, or audit annexures.
•  Print shop pre-press: Before printing visiting cards, pamphlets, or brochures, print shop operators crop PDFs to remove white margins and ensure the print bleeds correctly to the paper edge.
•  Presentation trimming: College project presentations exported from PowerPoint to PDF on A4 paper have large top and bottom margins. Cropping tightens them to the slide's natural 16:9 or 4:3 ratio for cleaner sharing.
With RepetiGo you can crop a PDF free online in India - process the document in your browser - set your margins and download a clean trimmed PDF in seconds. No account required, and your file is never uploaded.
⚠️  Under India's DPDP Act 2023, documents submitted for cropping may contain personal data from scanned government IDs or financial records. RepetiGo processes your file entirely in your browser - nothing is uploaded.

H2: Your PDF Never Leaves Your Browser.
When you upload a PDF to crop, you may be trimming a scanned government document, a financial statement, or a confidential report. Here is exactly what happens:
•  🔒 Stays in your browser: Your file is processed entirely within your browser - it is never uploaded to any server.
•  🔐 Local processing: Your file is processed locally in your browser with no link to any account or identifier.
•  🔒 Never uploaded: Both your original file and the cropped output stay in your browser and are never sent to any server.
•  👁️ Content never leaves your device: The cropping engine adjusts the page boundary - it never reads, stores, or analyses the content of your document.
•  🚫 No account, no data profile: No sign-up means we hold zero personal data about you.
🔒  Files are never uploaded - processed locally whether you finish the download or not. Your original file on your device is never affected.
Privacy Policy → /security/ | Browser-only processing - no upload, no storage

H2: Cropping PDFs for Print Shops.
Print shop operators crop PDFs constantly - hiding scanner borders before reprinting customer documents, trimming presentation margins before binding, standardising page sizes before running a batch job. The standalone crop tool handles one file at a time. For shops processing dozens of documents daily, PrintPilot - RepetiGo's print shop automation platform - handles cropping, compression, orientation correction, and AI quality enhancement automatically as part of the print queue workflow.
🖨️  PrintPilot automatically processes every customer document - detecting and cropping out scanner borders, correcting orientation, applying AI quality enhancement, and delivering a print-ready PDF to the queue. What the standalone crop tool does manually, PrintPilot does for every job automatically.
Learn about PrintPilot → /products/printpilot/

➜  [ Try PrintPilot Free → repetigo.com/pricing/ ]
[ Or Just Crop a PDF Now → repetigo.com/tools/pdf/crop-pdf/ ]

H2: Common Questions About Cropping PDFs Online Free.
H3: Q1: How do I crop a PDF for free?
Go to repetigo.com/tools/pdf/crop-pdf/, upload your PDF, set the crop margins in points for the pages you want cropped, and download. Free. No account. Files never uploaded - processed in your browser.
H3: Q2: What does cropping a PDF actually do?
Cropping a PDF changes the visible page boundary (technically called the CropBox) so PDF readers display a smaller page - the same technique macOS Preview and Adobe Acrobat use. The trimmed edges are hidden from view but not deleted from the underlying file, so file size stays about the same, and the crop can technically be reversed by adjusting the CropBox in another PDF tool. For everyday purposes - viewing, printing, submitting a document - the result looks and behaves exactly like a trimmed page.
H3: Q3: How do I remove white space or margins from a PDF?
Upload your PDF to RepetiGo's crop tool. Enter equal margin values in points on all sides (e.g., 40pt for each of top/right/bottom/left - 72 points is about an inch). There's no drag-to-select handle currently, just numeric entry. Leave the pages you want trimmed selected and download. The result is a PDF where the white margins are hidden and the displayed page dimensions are reduced accordingly.
H3: Q4: How do I crop a PDF on Mac?
Open RepetiGo in Safari or Chrome on your Mac, upload your PDF, enter your margins in points, and download the cropped file. macOS Preview also has a crop tool that works the same way - both set a CropBox that hides the trimmed edges without deleting them from the file. RepetiGo's advantage on Mac is convenience: no need to open Preview and use its Rectangular Selection tool, just enter numbers in a browser tab.
H3: Q5: Can I crop all pages of a PDF at the same time?
Yes. Every page is selected by default in RepetiGo's page picker - leave them selected and your margin values apply to the whole document in one pass. Deselect any page you want to leave untouched. This is the standard approach for scanned multi-page documents where every page has the same border to remove.
H3: Q6: Can I crop a PDF to a specific page size like A4 or Letter?
Not directly - RepetiGo doesn't have a 'crop to A4' or 'crop to Letter' auto-calculation. You enter margins in points for each side, and the tool trims that amount, showing you the resulting page size after cropping. To hit an exact target size, work out the difference between your current page size and the target size in points, then split that across the sides you want to trim. You can only trim margins down from the current size - you cannot use the crop tool to add margins.
H3: Q7: Does cropping a PDF reduce the file size?
Not meaningfully. RepetiGo's crop - like Preview's and Acrobat's - works by setting a new visible page boundary rather than deleting the trimmed content from the file, so the underlying data, and the file size, stays about the same. If you need a smaller file, use RepetiGo's Compress PDF tool after cropping; that's what actually reduces size.
H3: Q8: How is cropping different from removing pages?
Cropping adjusts the visible dimensions of each page - hiding content from the edges of existing pages. Removing (or extracting) pages deletes entire pages from the document. If you have a 20-page document and want to cut out pages 5-10, use RepetiGo's Organize PDF tool. If you want to trim the white margin from all 20 pages, use the Crop PDF tool.
H3: Q9: Can I crop a scanned PDF to remove scanner borders?
Yes - this is one of the most common crop use cases. When a flatbed or MFP scanner creates a PDF, it typically adds a dark grey or black border on the edges from the scanner glass frame. Upload the scanned PDF, enter margin values in points that cover the border width (roughly 30-55pt covers a typical 10-20mm scanner border), leave the pages selected, and download. Every page's scanner border is hidden in one step.
H3: Q10: Is there a way to crop a PDF without Adobe Acrobat?
Yes. RepetiGo's crop tool works entirely in the browser - no Adobe Acrobat licence required. Upload your PDF, enter your margin values in points, download the cropped PDF. The result works the same way as Acrobat Pro's or Preview's crop function, without the subscription cost or any software to install.

H2: More Free PDF Tools from RepetiGo.
•  Compress PDF → /tools/pdf/compress-pdf/ - reduce file size after cropping
•  Edit PDF → /tools/pdf/edit-pdf/ - edit text, fill forms, annotate pages
•  Add Watermark → /tools/pdf/add-watermark/ - stamp DRAFT or CONFIDENTIAL on pages
•  Add Page Numbers → /tools/pdf/add-page-numbers/ - number pages after cropping
•  Organize PDF → /tools/pdf/organize-pdf/ - reorder or remove pages
•  All PDF Tools → /tools/pdf/ - complete free PDF tools library

➜  [ Crop PDF Free Now → repetigo.com/tools/pdf/crop-pdf/ ]
No sign-up · Trim margins · All pages at once · Browser-only processing`;

const routeMap: Record<string, string> = {
  "/tools/pdf": "/pdf-tools",
  "/pdf-tools": "/pdf-tools",
  "/pdf-tools/crop-pdf": "/pdf-tools/crop-pdf",
  "/pdf-tools/edit-pdf": "/pdf-tools/edit-pdf",
  "/pdf-tools/organize-pdf": "/pdf-tools/organize-pdf",
  "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf",
  "/pdf-tools/watermark-pdf": "/pdf-tools/watermark-pdf",
  "/pdf-tools/add-page-numbers": "/pdf-tools/page-numbers",
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
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Crop PDF", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF cropping tool that trims margins in points on selected pages by setting the PDF's CropBox, entirely in the browser. Runs entirely client-side; no file is ever uploaded to a server.", url: pageUrl },
    { "@context": "https://schema.org", "@type": "HowTo", name: "How to Crop a PDF Online", step: [{ "@type": "HowToStep", name: "Upload your PDF" }, { "@type": "HowToStep", name: "Set your crop margins" }, { "@type": "HowToStep", name: "Download your cropped PDF" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqQuestions },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Crop PDF", item: pageUrl }] },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}

export default function CropPdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><JsonLd /><article className="tool-seo-content" id="crop-pdf-guide"><StructuredSeoCopy /></article><PdfEditTool slug="crop-pdf" headingLevel="h2" /></div></DashboardShell>;
}
