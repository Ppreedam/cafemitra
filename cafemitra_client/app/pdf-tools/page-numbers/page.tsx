import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "../../DashboardShell";
import PdfEditTool from "../PdfEditTool";

const pageUrl = "https://repetigo.com/pdf-tools/page-numbers";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF - Free Online, No Sign-Up | RepetiGo",
  description:
    "Add page numbers to any PDF free online - choose position, format, and starting number. No sign-up, no install. Works on any device. Files processed in your browser - never uploaded.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Add Page Numbers to PDF - Free Online, No Sign-Up | RepetiGo",
    description: "Add page numbers to any PDF free - choose position, format, and start number. No sign-up, browser-only - never uploaded.",
    type: "website",
    url: pageUrl,
    images: ["https://repetigo.com/og-add-page-numbers.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Add Page Numbers to PDF Free Online - RepetiGo",
    description: "Add page numbers to PDF free. Choose position and format. No sign-up, browser-only - never uploaded.",
  },
  robots: { index: true, follow: true },
};

const whyRows = [
  ["'Can you refer to that paragraph?' - 'Which one? It's somewhere in the middle...'", "'See page 14, second paragraph.' Discussion over."],
  ["Print shops can't verify a 40-page document is complete without counting manually", "Print operator confirms 'all 40 pages received' from the footer instantly"],
  ["University submission portal rejects the document - page numbers are required", "Submission accepted. Evaluators can cite specific pages in feedback"],
  ["Legal filing returned - court requires numbered pages for case records", "Filed without issue. Opposing counsel references 'Exhibit A, page 7'"],
  ["Reader loses place in a 25-page report; no anchor to return to", "Reader bookmarks 'page 18' and returns exactly there next session"],
  ["Reviewer feedback: 'Please add page numbers to this draft'", "Never hear this feedback again"],
];

const positionRows = [
  ["Bottom Centre", "Academic papers, thesis documents, most formal reports", "The universal default. Balanced, clean, widely expected."],
  ["Bottom Right", "Corporate reports, business proposals, legal filings", "Professional standard in many office environments. Right-aligned reads naturally."],
  ["Bottom Left", "Legal documents, contracts, US court filings", "Common in legal contexts where right margin is reserved for judge stamps or annotations."],
  ["Top Centre", "Technical manuals, reference documents", "Clean header position. More common in technical documentation than reports."],
  ["Top Right", "Government forms, official submissions", "Often specified by government portals for official document formats."],
  ["Top Left", "Rarely preferred; used when bottom space is reserved", "Use only if the document's layout specifically requires this position."],
];

const skipRows = [
  ["Skip the cover page - start numbering from page 2", "Deselect the cover page in the page picker, then set the starting number to 1", "Cover page has no number; page 2 shows '1'"],
  ["Start from a custom number - for documents that continue from another file", "Set the starting number to your desired value, for example 47", "The first selected page shows '47' and counts up from there"],
  ["Add page numbers to only part of the document", "Deselect any pages you don't want numbered - a cover, TOC, or preface", "Only the pages you keep selected get a number, counting from your starting number"],
];

const whoRows = [
  ["Student", "University submission system requires paginated PDF for thesis, project report, or dissertation", "Bottom-centre numbering starting from page 1; deselect the cover and TOC pages if they shouldn't be numbered"],
  ["Legal professional", "Court requires numbered pages on all exhibits and filings - without them the document is rejected", "Bottom-right or bottom-left numbering; deselect any pages that shouldn't carry a number"],
  ["CA / Finance professional", "Audit reports, financial statements, and company filings submitted to MCA, SEBI, or RBI require page numbers", "Bottom-right numbering; deselect the cover page if numbering should begin on page 2"],
  ["Government submission", "State and central government portals specify page numbering format for tenders, proposals, and scheme applications", "Top-right position is common in government document standards; check the exact format specified per scheme"],
  ["Print shop operator", "Customer brings a 200-page document for binding and printing - page numbers must be added before the job starts", "Any position; operator configures based on customer spec; must be embedded in PDF before sending to printer"],
  ["Author / Publisher", "Book manuscript, research paper, or training manual needs pagination before submission", "Deselect preface/TOC pages if they need different treatment; number the main body starting from page 1 - use a second pass for a different starting number per section"],
];

const withoutAdobeRows = [
  ["RepetiGo Add Page Numbers", "Free", "No, browser", "Position, starting number, font size and colour - plain numbers only, no format templates", "Never uploaded"],
  ["Adobe Acrobat Pro (Header & Footer)", "Paid subscription", "Yes, desktop app", "Full control, including format templates", "No"],
  ["macOS Preview", "Free, built-in", "No", "No page numbering feature", "N/A"],
  ["LibreOffice", "Free", "Yes, download", "Full control", "No"],
  ["ilovepdf add page numbers", "Free, limited", "No, browser", "Basic options", "No"],
];

const safetyRows = [
  ["Stays in Your Browser", "Your PDF is processed entirely within your browser - it is never uploaded to any server."],
  ["Local Processing", "Your file is processed locally with no link to any account, user ID, or persistent identifier."],
  ["Never Uploaded", "Your original PDF and the numbered output are both processed locally in your browser. No archive. No backup. No trace."],
  ["No Content Is Read", "The page numbering engine stamps numbers on page positions - it never reads, analyses, or stores the text or images in your document."],
  ["No Account, No Data Profile", "No sign-up means we hold zero personal data about you. No usage history. No file history. Nothing."],
];

const relatedRows = [
  ["Add Watermark to PDF", "Stamp 'Confidential', 'Draft', or custom text on every page", "/pdf-tools/watermark-pdf"],
  ["Merge PDF", "Combine documents before numbering them together", "/pdf-tools/merge-pdf"],
  ["Organize PDF Pages", "Reorder pages before adding page numbers", "/pdf-tools/organize-pdf"],
  ["Crop PDF", "Trim white margins before finalising a document", "/pdf-tools/crop-pdf"],
  ["Compress PDF", "Reduce size of numbered PDF before submitting", "/pdf-tools/compress-pdf"],
  ["All PDF Tools", "Complete free PDF tools library", "/pdf-tools"],
];

const faqs = [
  ["Q1: How do I add page numbers to a PDF for free?", "Upload your PDF to RepetiGo's free tool, configure your page number settings - position, starting number, and which pages to include - and download the numbered PDF. No account, no software, no watermarks. Works on any device with a browser. Your file is never uploaded - processed in your browser."],
  ["Q2: Can I add page numbers to an existing PDF?", "Yes - that is exactly what this tool does. Whether your PDF was created in Word, exported from PowerPoint, scanned from paper, or merged from multiple files, RepetiGo stamps page numbers directly onto the existing document. The content of your PDF is unchanged; the page numbers are embedded as a new layer on top of the existing pages."],
  ["Q3: What position options are available?", "Six positions: bottom-left, bottom-centre (the most common default), bottom-right, top-left, top-centre, and top-right. You also control the starting number, font size, and colour. RepetiGo currently stamps a plain sequential number (1, 2, 3...) - there's no format template for 'Page X', 'Page X of Y', or roman numerals yet."],
  ["Q4: How do I add page numbers to a PDF on Mac?", "macOS Preview does not have a page numbering feature. Open RepetiGo in Safari or Chrome on your Mac, upload your PDF, configure the numbering settings, and download the numbered file. It takes under a minute and requires no software installation."],
  ["Q5: How do I add page numbers to a PDF without Adobe Acrobat?", "RepetiGo provides a free PDF page numbering tool - no Adobe Acrobat licence needed. Choose your position, starting number, font size, and colour in the browser, then download the numbered PDF. It covers the core use case well; if you specifically need formatted labels like 'Page 1 of 20' or roman numerals, Acrobat's Header & Footer tool offers more format templates."],
  ["Q6: How do I start numbering from page 2 and skip the cover?", "Deselect the cover page in RepetiGo's page picker so it's excluded from numbering, then set the starting number to 1. The cover page will have no page number; the next page you kept selected will display '1'. For a document with a cover, table of contents, and preface you want left unnumbered, deselect all of those pages before applying."],
  ["Q7: Can I use roman numerals or 'Page X of Y' formatting?", "Not currently - RepetiGo stamps a plain sequential number (1, 2, 3...) at your chosen position. There's no dropdown yet for roman numerals (i, ii, iii), 'Page X', or 'Page X of Y' labels. If your document needs that specific formatting, you'll need to add it with a different PDF editor for now."],
  ["Q8: How do I add page numbers to a PDF after merging multiple files?", "Merge your files first using RepetiGo's Merge PDF tool to create a single combined document, then use this Add Page Numbers tool to apply continuous numbering across the whole merged PDF. Adding numbers before merging would reset or conflict at each file boundary - always merge first, then number."],
  ["Q9: Will the page numbers appear when I print the PDF?", "Yes. RepetiGo embeds the page numbers directly into the PDF file as part of the document content - not as a software annotation. They appear consistently in every PDF reader, at every zoom level, and in print."],
  ["Q10: Can I add page numbers to a scanned PDF?", "Yes. RepetiGo's page numbering tool works on scanned PDFs - the page numbers are stamped onto the image pages without needing to process the text content of the scan. If you also need the scanned text to be searchable, run OCR on the PDF first using RepetiGo's OCR PDF tool, then add page numbers as a second step."],
];

export default function PageNumbersPage() {
  return (
    <DashboardShell activePath="/pdf-tools">
      <div className="dashboard generic-pdf-tool-page">
        <PdfEditTool
          slug="page-numbers"
          headingLevel="h1"
          uploadTitle="Add Page Numbers to Any PDF. Free. Choose Your Position and Format."
          uploadDescription="Upload any PDF, pick where the numbers go, choose your starting number, and download. No Adobe Acrobat. No sign-up. Files never uploaded."
        >
          <JsonLd />
          <article className="tool-seo-content" id="page-numbers-guide">
            <HeroIntro />
            <section><h2>Why PDF Page Numbers Matter More Than You Think.</h2><p>A PDF without page numbers is finished content sitting in an unfinished container. It might look polished on screen - but the moment it's printed, bound, shared in a meeting room, or submitted to an institution, the absence of page numbers creates real problems:</p><SeoTable headers={["Without Page Numbers", "With Page Numbers Added"]} rows={whyRows} /><Callout>Page numbering is one of those finishing steps that takes 30 seconds and signals the document is professionally complete. A PDF without page numbers reads as a draft. A PDF with them reads as the final version.</Callout></section>
            <HowTo />
            <Options />
            <section><h2>Who Needs to Add Page Numbers to a PDF?</h2><SeoTable headers={["Who", "The Situation", "What They Need"]} rows={whoRows} /></section>
            <WithoutAdobe />
            <India />
            <Safety />
            <PrintShop />
            <Faq />
            <Related />
            <section className="tool-seo-cta"><h2>Add Page Numbers to PDF Free Now</h2><p>No sign-up. Choose position and starting number. Browser-only processing.</p><Link href="/pdf-tools/page-numbers">Add Page Numbers to PDF Free Now</Link></section>
          </article>
        </PdfEditTool>
      </div>
    </DashboardShell>
  );
}

function HeroIntro() {
  return <section className="tool-seo-hero"><p>Your report is done. Your presentation is ready. Your legal filing is compiled. The last thing a professional document needs is page numbers - and RepetiGo's free tool stamps them on in seconds. Upload any PDF, pick where the numbers go, choose your starting number, and download.</p><p>Add page numbers to a PDF free online. No Adobe Acrobat. No sign-up. No watermarks. Files never uploaded - processed in your browser.</p><div className="tool-seo-badges"><span>✓ Bottom centre, bottom right, top left - you choose</span><span>✓ Choose your starting number and which pages get numbered</span><span>✓ Adjust font size and colour</span></div><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/page-numbers">Add Page Numbers to PDF - Free, No Sign-Up <span>→</span></Link></div></section>;
}

function HowTo() {
  return <section><h2>How to Add Page Numbers to a PDF in 3 Steps.</h2><p>Three steps. Under a minute for most documents. No software to install.</p><h3>Step 1 - Upload Your PDF</h3><p>Click the Upload button or drag and drop your PDF. Any PDF works - a typed document, a scanned file, a merged report, a legal filing. Nothing is uploaded - your file is read directly in your browser. No sign-in required.</p><h3>Step 2 - Configure Your Page Number Settings</h3><p>This is where you make it yours. Choose:</p><ul className="tool-seo-list"><li>Position: where the number appears on each page - bottom centre, bottom right, top left, and three more options.</li><li>Starting number: which number the first numbered page receives.</li><li>Which pages get numbered: every page is selected by default - deselect any page, like a cover, you don't want numbered.</li><li>Font size and colour: adjust to match your document.</li></ul><p>Preview the setting before you download. What you see is what gets stamped on the document.</p><h3>Step 3 - Download Your Numbered PDF</h3><p>Click Download. Your numbered PDF saves to your device - same document, same content, now professionally paginated. Nothing was uploaded - the file was processed locally in your browser throughout. The numbering is embedded in the PDF itself: it appears in every PDF reader, in print, and on every device without any extra settings needed.</p><Callout>The PDF page numbering tool works on mobile browsers - Safari on iPhone, Chrome on Android - without any app. Upload from your Files app, configure the settings, download.</Callout><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pdf-tools/page-numbers">Add Page Numbers Now - Free <span>→</span></Link></div></section>;
}

function Options() {
  return <section><h2>Every Page Number Option, Explained.</h2><p>Different documents call for different numbering conventions. Here is what each setting does:</p><h3>Where to Place Page Numbers</h3><SeoTable headers={["Position", "Convention Used In", "When to Choose It"]} rows={positionRows} /><h3>About Page Number Formatting</h3><p>RepetiGo currently stamps a plain sequential number (1, 2, 3...) at your chosen position - there's no dropdown yet for 'Page 1', 'Page 1 of 20', or roman numerals like i, ii, iii. You do control the starting number, font size, and colour, so you can still make the numbering fit your document's style. If you specifically need a formatted label like 'Page 1 of 24' or roman numerals, add that manually afterward in a PDF editor, or check back as this feature expands.</p><h3>Starting Page and Custom Numbers</h3><p>Not every document starts numbering at page 1 with the number 1. Common configurations:</p><SeoTable headers={["Need", "How To Do It", "Example"]} rows={skipRows} /></section>;
}

function WithoutAdobe() {
  return <section><h2>Add Page Numbers to PDF Without Adobe Acrobat.</h2><p>Adobe Acrobat Pro's Bates Numbering and Header & Footer tools can add page numbers to PDFs - but Acrobat Pro costs thousands of rupees per year. For most people, adding page numbers to a PDF happens once, or a handful of times. A paid subscription makes no sense for that.</p><p>RepetiGo lets you add page numbers to a PDF without Adobe Acrobat completely free, in any browser. On Mac, the built-in Preview app does not support adding page numbers - it can annotate PDFs but has no header/footer/page number stamping function. On Windows, browser-based tools or dedicated desktop apps like LibreOffice Draw are the free alternatives. RepetiGo works on both - and never uploads your file.</p><SeoTable headers={["Method", "Cost", "Requires Install?", "Position & Format Control?", "Uploaded to a Server?"]} rows={withoutAdobeRows} /><Callout>RepetiGo is the only free, no-account, no-install PDF page numbering tool that never uploads your file at all - the right choice when the document contains draft financial data, legal content, or personal information.</Callout><p>For Mac users: open RepetiGo in Safari, upload your PDF, configure your numbering, and download. The numbered PDF saves directly to your Mac - no software installation, no Adobe subscription.</p></section>;
}

function India() {
  const items = ["University submissions: UGC, NAAC, and most Indian university guidelines require paginated thesis and project reports. Missing page numbers = document returned for correction.", "MCA and company filings: Forms and annexures submitted to the Ministry of Corporate Affairs require sequential page numbering for proper record-keeping.", "Income tax and GST documents: Compilation documents submitted to the IT Department or GST portal require numbered pages for cross-referencing during hearings.", "High Court and court filings: Every exhibit, petition annexure, and document bundle filed in Indian High Courts must be page-numbered in the prescribed format.", "Government tender documents: State and central government RFPs frequently specify page numbering as a mandatory requirement.", "SEBI and RBI filings: Financial regulatory submissions require numbered pages to support document integrity and audit trail requirements."];
  return <section><h2>Add Page Numbers to PDF in India - Required, Not Optional.</h2><p>In India's formal document ecosystem, page numbers are not a cosmetic preference - they are frequently a hard requirement that determines whether a document is accepted or returned:</p><ul className="tool-seo-list">{items.map((item) => <li key={item}>{item}</li>)}</ul><p>With RepetiGo you can add page numbers to a PDF online free in India - upload the document, choose the position and starting number your institution requires, and download a correctly paginated PDF in seconds. Because nothing is stored and no sign-up is needed, your CA report, legal filing, or tender document never sits on a stranger's server.</p><Callout>Under India's DPDP Act 2023, documents containing personal data, financial records, or legal information deserve careful handling. RepetiGo processes your file entirely in your browser - nothing is uploaded.</Callout></section>;
}

function Safety() {
  return <section><h2>Your PDF Never Leaves Your Browser.</h2><p>The documents that most often need page numbers - legal filings, financial statements, thesis drafts, government submissions - are also the documents that need the most careful handling online. Here is what happens when you upload a PDF to RepetiGo:</p><SeoTable headers={["Protection Layer", "What It Means"]} rows={safetyRows} /><Callout>Your PDF is processed locally in your browser - it never reaches any server, whether or not you finish the download.</Callout><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/privacy-policy">Read Privacy Policy <span>→</span></Link></div></section>;
}

function PrintShop() {
  return <section><h2>For Print Shops - Numbered PDFs, Automated.</h2><p>At a print counter, a customer asks for 150 copies of a 40-page document bound into booklets - without page numbers. You add them manually using a browser tool. That works for one job. For a shop handling 50 such jobs daily, manual page numbering per document is a bottleneck.</p><p>PrintPilot - RepetiGo's print shop automation platform - handles page numbering as part of the automated document processing workflow. When a customer uploads a document via QR code, the system applies required page numbers based on shop settings, compresses, orients, and delivers a print-ready PDF to the queue. Zero manual steps per job.</p><Callout>PrintPilot handles page numbering, AI quality enhancement, compression, and print queue management automatically - for every document, every customer, every job.</Callout><div className="tool-seo-cta-stack"><Link className="tool-seo-inline-cta" href="/pricing">Try PrintPilot Free - Full Print Shop Automation <span>→</span></Link><Link className="tool-seo-inline-cta" href="/pdf-tools/page-numbers">Or Just Add Page Numbers Now <span>→</span></Link></div></section>;
}

function Faq() {
  return <section><h2>Common Questions About Adding Page Numbers to PDFs.</h2><div className="tool-seo-faq-list">{faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section>;
}

function Related() {
  return <section><h2>More Free PDF Tools from RepetiGo.</h2><SeoTable headers={["Tool", "Best For", "Link"]} rows={relatedRows.map(([tool, best, href]) => [tool, best, labelFor(href)])} /><div className="tool-seo-related-grid">{relatedRows.map(([tool, best, href]) => <Link href={href} key={tool}>{tool}<span>{best}</span></Link>)}</div></section>;
}

function Callout({ children }: { children: React.ReactNode }) {
  return <aside className="tool-seo-callout"><p>{children}</p></aside>;
}

function SeoTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return <div className="tool-seo-table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function labelFor(href: string) {
  const labels: Record<string, string> = {
    "/pdf-tools/watermark-pdf": "Open Add Watermark",
    "/pdf-tools/merge-pdf": "Open Merge PDF",
    "/pdf-tools/organize-pdf": "Open Organize PDF",
    "/pdf-tools/crop-pdf": "Open Crop PDF",
    "/pdf-tools/compress-pdf": "Open Compress PDF",
    "/pdf-tools": "Explore All PDF Tools",
  };
  return labels[href] || "Open PDF Tool";
}

function JsonLd() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PDF Page Numbering Tool", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online tool to add plain sequential page numbers to a PDF - choose position, starting number, font size and colour, entirely in the browser. No file is ever uploaded to a server.", url: pageUrl },
    { "@context": "https://schema.org", "@type": "HowTo", name: "How to Add Page Numbers to a PDF", step: [{ "@type": "HowToStep", name: "Upload PDF", text: "Upload your PDF document." }, { "@type": "HowToStep", name: "Configure position and starting number", text: "Choose page number position, starting number, and which pages to include." }, { "@type": "HowToStep", name: "Download numbered PDF", text: "Download your numbered PDF." }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Add Page Numbers", item: pageUrl }] },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
