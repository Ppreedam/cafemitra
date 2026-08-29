import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import PdfSecurityTool from "../PdfSecurityTool";

const pageUrl = "https://repetigo.com/pdf-tools/compare-pdf";

export const metadata: Metadata = {
  title: "Compare PDF Files Free - Similarity Score | RepetiGo",
  description: "Compare PDF files free - upload two PDFs and get a page-by-page word-overlap similarity score (0-100%) with side-by-side thumbnails. Text-layer comparison. Browser-only. No sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Compare PDF Files Free - Similarity Score | RepetiGo",
    description: "Compare PDF files free - upload two PDFs and get a page-by-page word-overlap similarity score (0-100%) with side-by-side thumbnails. Text-layer comparison. Browser-only. No sign-up.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare PDF Files Free - RepetiGo",
    description: "Word-overlap similarity score with side-by-side thumbnails. No sign-up, browser-only.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Compare PDF Files Free. Upload Two PDFs and Get a Similarity Score.
RepetiGo's free compare PDF tool analyses two PDF documents and gives you a similarity score - showing how much the text content of the two documents overlaps, page by page and overall.
Upload both PDFs, view the overall similarity percentage and per-page breakdown, and review side-by-side thumbnails of each page pair. Useful for version checking, draft comparison, contract review, and duplicate detection.
✓ Overall Similarity Score (0-100%)  ✓ Per-Page Breakdown  ✓ Side-by-Side Thumbnails  ✓ No Adobe Required  ✓ Browser-Only - Never Uploaded

➜  [ Compare Your PDFs Free - No Sign-Up → repetigo.com/tools/pdf/compare-pdf/ ]

H2: What Does PDF Comparison Actually Show?
The tool compares the text content of each page pair using word-overlap scoring (Jaccard similarity). For each page pair, it calculates: the number of words in common ÷ total unique words across both pages × 100 = similarity percentage.
Here is what the results display shows:

Result Element
What It Shows
How to Use It
Overall similarity score
A single percentage (0-100%) showing average text overlap across all page pairs
Quick check: are these two PDFs substantially the same or different?
Per-page breakdown
A similarity percentage for each individual page pair
Identifies which specific pages changed between versions
Side-by-side thumbnails
Visual preview of both PDFs' pages placed next to each other
Spot layout changes, added/removed pages, or structural shifts visually
Different page counts
Pages that exist on one side but not the other score 0% similar
Identifies when a version has pages added or removed relative to the other

⚠️  This tool produces a similarity percentage score - not colour-coded diff highlighting. Changed words are not highlighted individually in red or green. A downloadable comparison report PDF is not generated. For word-level change tracking, Microsoft Word's Compare Documents (for DOCX files) or dedicated legal document comparison tools provide more granular output.

H2: How to Compare Two PDF Files in 3 Steps.
H3: Step 1 - Upload Both PDF Files
Click Upload and select your first PDF, then your second PDF. Or drag both files into the upload area at the same time. Exactly two PDFs are required - the tool compares a pair, not a batch.
H3: Step 2 - Wait for Analysis
The tool extracts the text content from each page of both PDFs and calculates the word-overlap similarity score for each page pair. For most documents, this takes 5-30 seconds depending on page count and file size. Processing runs entirely in your browser - nothing is uploaded.
H3: Step 3 - Review the Similarity Results
The overall similarity percentage appears at the top. Below it, each page pair is displayed side-by-side with its individual score. A score above 85% means the pages are mostly the same text. A score below 50% indicates significant content differences. Review side-by-side thumbnails for a visual comparison of layout and content.

H2: Interpreting Similarity Scores - What Do the Numbers Mean?

Score Range
What It Typically Indicates
Common Scenario
95-100%
Virtually identical content - same text with at most minor punctuation or spacing differences
Same document saved twice, or a version with only a date or reference number changed
80-94%
Largely the same with some differences - paragraphs added, removed, or modified
Draft vs near-final version - most clauses the same, some updated
50-79%
Significant differences - substantial sections changed, replaced, or rewritten
Major revision between versions - same structure but much of the content updated
20-49%
Partial overlap - some shared sections but substantially different documents
Different documents in the same domain that share some standard clauses
0-19%
Minimal or no overlap - essentially different documents
Unrelated documents, or documents using completely different terminology

Note: similarity scores measure word overlap, not meaning overlap. A page that has been heavily paraphrased (same meaning, different words) will score low even if the intent is unchanged. A page with identical formatting but different numbers in a table will score high because the non-numeric words match - while the substantive differences (the numbers) may be missed by the text comparison.

H2: Compare PDF Without Adobe Acrobat.
Adobe Acrobat Pro includes a Compare Documents function that produces a colour-coded side-by-side comparison with individual change markers. It is powerful but requires a paid subscription. RepetiGo provides a free similarity score alternative:

Feature
RepetiGo
Adobe Acrobat Pro
Cost
Free
₹1,500-₹3,500/month
Server upload
No - browser-only
Cloud sync
Comparison result
Similarity % score per page
Colour-coded word-level diff
Downloadable comparison report
No - on-screen only
Yes - marked-up PDF
Move detection
No
Yes
Works on scanned PDFs
Limited (no text layer = limited results)
Requires OCR first
Works without install
Yes (browser)
No (desktop app)

H2: Compare PDF in India - Common Use Cases.
Document comparison is a frequent need across Indian legal, financial, and administrative workflows:
•  Contract version review: Legal teams reviewing redlined contracts between two parties - check which pages changed between the draft sent and the version returned
•  Tender document verification: Compare the final submitted tender document against the working draft to confirm no unauthorised changes occurred before submission
•  Property document comparison: Compare sale deed drafts between iterations to confirm only the agreed changes were incorporated by the opposite party's lawyer
•  Regulatory filing verification: Compare the PDF submitted to a regulator against the approved internal version - confirm the documents are identical before filing
•  Academic and research: Compare thesis drafts or research paper versions to identify which sections were substantially revised between rounds of supervisor feedback
•  HR policy documents: Compare the current employee handbook against the previous version - identify which policies changed for the annual employee communication

H2: Limitations - When PDF Comparison Has Reduced Accuracy.
The word-overlap comparison works best on text-based PDFs. Several conditions reduce the accuracy of the similarity score:
•  Scanned image PDFs: PDFs created by scanning physical documents have no text layer - only image data. The comparison has no text to compare and falls back to checking whether page images are byte-identical (100% if identical, 50% if different). For scanned PDFs, run them through the OCR PDF tool first to add a text layer before comparing
•  PDF/A and complex structured PDFs: Some compliance PDFs and structured forms use non-standard text encoding that reduces extraction accuracy
•  Number-heavy documents: Tables of financial data where the key differences are in the numbers (not the surrounding words) may show high similarity despite substantive differences in the underlying values
•  Multi-column layouts: PDFs with complex multi-column page layouts may have text extracted in a non-linear reading order, reducing comparison accuracy for column-heavy documents
•  PDFs with significant images: Documents where a large portion of the page content is image-based (charts, diagrams, photographs) are compared only on their text content - image differences are not detected

H2: Your Files Never Leave Your Browser.
RepetiGo's PDF tools run entirely in your browser. Your PDF is never uploaded to any server - it is processed locally on your device.
•  🔒 Browser-only processing: Your file never travels over any network to any server. No upload occurs at any stage.
•  🔐 No server session: There is no remote processing session, no isolated server workspace. Everything happens inside your browser tab.
•  🚫 No account = no data: No sign-up means we hold zero personal data about you. No file history, no email, no usage tracking.
•  👁️ Content never leaves device: No text, image, or document content is sent to or read by any external system or person.
•  ✅ Cleared on tab close: All local working data clears when you close or refresh the tab. Nothing persists on your device or any server.
🔒  Your file never leaves your device - not for 60 minutes, not ever. Browser-only processing is stronger privacy than any server-side deletion policy.
Privacy Policy → /security/ | Browser-only processing - no upload, no storage

H2: Common Questions About Comparing PDFs.
H3: Q1: How do I compare two PDF files for free?
Go to repetigo.com/tools/pdf/compare-pdf/, upload your two PDF files, and the tool analyses their text content and produces a similarity score. You get an overall percentage and a per-page breakdown with side-by-side thumbnails. Browser-only - no upload, no sign-up, no software.
H3: Q2: Does it highlight the differences between the two PDFs?
No - the comparison produces a similarity percentage score. Individual changed words are not highlighted in red or green. The result shows how much the content overlaps as a number, not a visual diff. For word-level change highlighting, Microsoft Word's Compare Documents (File → Compare → Compare) works on DOCX files; for PDF-specific visual diffs, Adobe Acrobat Pro's Compare Documents tool provides colour-coded output.
H3: Q3: Can I compare scanned PDFs?
The comparison works on the text layer of PDFs. Scanned image PDFs with no text layer cannot be meaningfully compared using text analysis - the tool falls back to checking whether pages are byte-identical (score 100%) or different (score 50%), which is not a real textual comparison. For better results with scanned PDFs, run them through the OCR PDF tool at /tools/pdf/ocr-pdf/ to extract and embed a text layer, then compare.
H3: Q4: Can I compare more than two PDFs at once?
No - exactly two PDFs are compared per session. For multiple comparisons, run the tool once for each pair. There is no batch comparison mode.
H3: Q5: What does a score of 0% mean?
A score of 0% means no words in common between the two pages - they share zero text content. This happens when the pages are completely different in wording, or when one or both pages have no text layer and their scanned images also differ. It also occurs when pages exist on one side of the comparison but not the other - missing pages always score 0%.
H3: Q6: Can I download the comparison results?
The comparison results are displayed on-screen - overall score and per-page breakdown. A downloadable comparison report PDF is not generated. To save your results, take a screenshot of the results page or note the key scores manually.
H3: Q7: Is a high similarity score always good?
It depends on the context. For confirming a document was not changed between sending and receiving, a high score (95-100%) confirms the documents are identical. For confirming that agreed changes were correctly incorporated into a revised draft, you would expect a score slightly below 100% - and the per-page breakdown helps identify which pages changed as expected.
H3: Q8: What if the two PDFs have different numbers of pages?
If PDF A has 10 pages and PDF B has 12 pages, the extra 2 pages in PDF B score 0% (no matching pages in PDF A). The tool handles different page counts - it pairs matching pages and scores unmatched pages as 0% similar. The per-page breakdown shows clearly which pages are paired and which have no match.

H2: More Free PDF Tools from RepetiGo.
•  Redact PDF → /tools/pdf/redact-pdf/ - permanently remove sensitive information
•  Sign PDF → /tools/pdf/sign-pdf/ - sign the confirmed final version
•  Protect PDF → /tools/pdf/protect-pdf/ - lock the final document
•  All PDF Tools → /tools/pdf/

➜  [ Compare Your PDFs Free - Browser-Only → repetigo.com/tools/pdf/compare-pdf/ ]`;

const faqStart = content.indexOf("H2: Common Questions About Comparing PDFs.");
const faqEnd = content.indexOf("H2: More Free PDF Tools from RepetiGo.", faqStart);
const faqSchemaQuestions = Array.from(
  content.slice(faqStart, faqEnd).matchAll(/H3: ([^\n]+)\n([\s\S]*?)(?=\nH3: |\nH2:|$)/g),
).map((match) => [match[1], match[2].trim()] as const);

type SeoTable = { headers: string[]; rows: string[][] };

const tables: SeoTable[] = [
  {
    headers: ["Result Element", "What It Shows", "How to Use It"],
    rows: [
      ["Overall similarity score", "A single percentage (0-100%) showing average text overlap across all page pairs", "Quick check: are these two PDFs substantially the same or different?"],
      ["Per-page breakdown", "A similarity percentage for each individual page pair", "Identifies which specific pages changed between versions"],
      ["Side-by-side thumbnails", "Visual preview of both PDFs' pages placed next to each other", "Spot layout changes, added/removed pages, or structural shifts visually"],
      ["Different page counts", "Pages that exist on one side but not the other score 0% similar", "Identifies when a version has pages added or removed relative to the other"],
    ],
  },
  {
    headers: ["Score Range", "What It Typically Indicates", "Common Scenario"],
    rows: [
      ["95-100%", "Virtually identical content - same text with at most minor punctuation or spacing differences", "Same document saved twice, or a version with only a date or reference number changed"],
      ["80-94%", "Largely the same with some differences - paragraphs added, removed, or modified", "Draft vs near-final version - most clauses the same, some updated"],
      ["50-79%", "Significant differences - substantial sections changed, replaced, or rewritten", "Major revision between versions - same structure but much of the content updated"],
      ["20-49%", "Partial overlap - some shared sections but substantially different documents", "Different documents in the same domain that share some standard clauses"],
      ["0-19%", "Minimal or no overlap - essentially different documents", "Unrelated documents, or documents using completely different terminology"],
    ],
  },
  {
    headers: ["Feature", "RepetiGo", "Adobe Acrobat Pro"],
    rows: [
      ["Cost", "Free", "₹1,500-₹3,500/month"],
      ["Server upload", "No - browser-only", "Cloud sync"],
      ["Comparison result", "Similarity % score per page", "Colour-coded word-level diff"],
      ["Downloadable comparison report", "No - on-screen only", "Yes - marked-up PDF"],
      ["Move detection", "No", "Yes"],
      ["Works on scanned PDFs", "Limited (no text layer = limited results)", "Requires OCR first"],
      ["Works without install", "Yes (browser)", "No (desktop app)"],
    ],
  },
];

function normalizeContent(source: string) {
  return source.replace(/(^|\n)(H[123]: [^\n]+)\n/g, "$1\n$2\n\n");
}

function mapRoute(value: string) {
  const raw = value.trim().replace(/[.,;!?)]$/, "");
  if (!raw) return "";
  const clean = raw.replace(/^(?:https?:\/\/)?(?:www\.)?repetigo\.com/i, "").replace(/\/$/, "");
  const routes: Record<string, string> = {
    "": "/",
    "/tools/pdf": "/pdf-tools",
    "/pdf-tools": "/pdf-tools",
    "/pdf-tools/compare-pdf": "/pdf-tools/compare-pdf",
    "/pdf-tools/ocr-pdf": "/pdf-tools/ocr-pdf",
    "/pdf-tools/unlock-pdf": "/pdf-tools/unlock-pdf",
    "/pdf-tools/edit-pdf": "/pdf-tools/edit-pdf",
    "/pdf-tools/protect-pdf": "/pdf-tools/protect-pdf",
    "/pdf-tools/sign-pdf": "/pdf-tools/sign-pdf",
    "/pdf-tools/merge-pdf": "/pdf-tools/merge-pdf",
    "/pdf-tools/redact-pdf": "/pdf-tools/redact-pdf",
    "/products/printpilot": "/print-automation",
    "/features/auto-delete": "/privacy-policy",
    "/security": "/privacy-policy",
    "/pricing": "/pricing",
  };
  if (routes[clean]) return routes[clean];
  if (/^\/tools\/pdf\//.test(clean)) return `/pdf-tools/${clean.split("/")[3]}`;
  if (/^\/features\//.test(clean) || /^\/security/.test(clean)) return "/privacy-policy";
  if (/^\/products\//.test(clean) || /^\/use-cases\//.test(clean)) return "/print-automation";
  if (/^\/pricing/.test(clean)) return "/pricing";
  return "";
}

function labelFor(route: string) {
  const labels: Record<string, string> = {
    "/": "RepetiGo",
    "/pdf-tools": "Explore All PDF Tools",
    "/pdf-tools/compare-pdf": "Open Compare PDF",
    "/pdf-tools/ocr-pdf": "Open OCR PDF",
    "/pdf-tools/unlock-pdf": "Open Unlock PDF",
    "/pdf-tools/edit-pdf": "Open Edit PDF",
    "/pdf-tools/protect-pdf": "Open Protect PDF",
    "/pdf-tools/sign-pdf": "Open Sign PDF",
    "/pdf-tools/merge-pdf": "Open Merge PDF",
    "/pdf-tools/redact-pdf": "Open Redact PDF",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[route] || "Open PDF Tool";
}

function renderInline(text: string) {
  const routePattern = /((?:https?:\/\/)?(?:www\.)?repetigo\.com(?:\/[^\s.,;!?)]*)?|\/(?:tools|features|products|security|pricing|use-cases)\/[^\s.,;!?)]*)/gi;
  return text.split(routePattern).map((part, index) => {
    const href = mapRoute(part);
    if (href) return <a key={`${part}-${index}`} href={href}>{labelFor(href)}</a>;
    return part;
  });
}

function isCallout(line: string) {
  return /^(?:💡|📋|✅|⚠️|🔒|🖨️)/.test(line);
}

function isRouteAction(line: string) {
  return line.includes("→ /") || /^Learn about PrintPilot/.test(line);
}

function renderRouteActions(line: string, key: string) {
  return <div className="tool-seo-cta-stack" key={key}>{line.split("|").map((part) => {
    const arrow = part.indexOf("→");
    const label = arrow >= 0 ? part.slice(0, arrow).trim() : part.trim();
    const href = arrow >= 0 ? mapRoute(part.slice(arrow + 1)) : "";
    return href ? <a className="tool-seo-inline-cta" href={href} key={part}>{label} <span>→</span></a> : null;
  })}</div>;
}

function isBracketCta(line: string) {
  return /^(?:➜|➤|→)?\s*\[.*\]$/.test(line.trim());
}

function renderBracketCta(line: string) {
  const inner = line.trim().replace(/^(?:➜|➤|→)\s*/, "").replace(/^\[/, "").replace(/\]$/, "");
  const arrow = inner.indexOf("→");
  const label = arrow >= 0 ? inner.slice(0, arrow).trim() : inner.trim();
  const href = arrow >= 0 ? mapRoute(inner.slice(arrow + 1)) : "/pdf-tools/compare-pdf";
  return <a className="tool-seo-inline-cta" href={href || "/pdf-tools/compare-pdf"}>{label} <span>→</span></a>;
}

function renderTable(table: SeoTable) {
  return <div className="tool-seo-table-wrap"><table><thead><tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{renderInline(cell)}</td>)}</tr>)}</tbody></table></div>;
}

function renderLines(lines: string[], keyPrefix: string): React.ReactNode[] {
  const output: React.ReactNode[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith("✓")) {
      output.push(<div className="tool-seo-badges" key={`${keyPrefix}-badges-${index}`}>{line.split(/\s{2,}/).map((item) => <span key={item}>{item}</span>)}</div>);
      index += 1;
      continue;
    }
    if (isCallout(line)) {
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
    if (isRouteAction(line)) {
      output.push(renderRouteActions(line, `${keyPrefix}-actions-${index}`));
      index += 1;
      continue;
    }
    if (isBracketCta(line)) {
      output.push(<div className="tool-seo-cta-stack" key={`${keyPrefix}-cta-${index}`}>{renderBracketCta(line)}</div>);
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

function StructuredSeoCopy({ source }: { source: string }) {
  const blocks = normalizeContent(source).split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return <>{blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const first = lines[0];
    if (!first) return null;
    if (first.startsWith("H1: ")) return <h1 key={index}>{first.slice(4)}</h1>;
    if (first.startsWith("H2: ")) return <h2 key={index}>{first.slice(4)}</h2>;
    if (first.startsWith("H3: ")) return <h3 key={index}>{first.slice(4)}</h3>;
    const table = findTable(lines);
    if (table) {
      return <div key={index}>{table.start > 0 ? <div className="tool-seo-copy-paragraph">{renderLines(lines.slice(0, table.start), `${index}-before-table`)}</div> : null}{renderTable(table.table)}{table.end < lines.length ? <div className="tool-seo-copy-paragraph">{renderLines(lines.slice(table.end), `${index}-after-table`)}</div> : null}</div>;
    }
    return <div className={index === 1 ? "tool-seo-copy-paragraph tool-seo-hero" : "tool-seo-copy-paragraph"} key={index}>{renderLines(lines, `${index}`)}</div>;
  })}</>;
}

function JsonLd() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "RepetiGo PDF Compare Tool",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      description: "Free online PDF comparison tool - Jaccard word-overlap similarity score and page-by-page breakdown with side-by-side thumbnails for two PDF files, processed entirely in the browser.",
      url: pageUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Compare Two PDF Files in 3 Steps",
      step: [
        { "@type": "HowToStep", name: "Upload Both PDF Files" },
        { "@type": "HowToStep", name: "Wait for Analysis" },
        { "@type": "HowToStep", name: "Review the Similarity Results" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqSchemaQuestions.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" },
        { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Compare PDF", item: pageUrl },
      ],
    },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}

export default function ComparePdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><PdfSecurityTool slug="compare-pdf"><JsonLd /><article className="tool-seo-content" id="compare-pdf-guide"><StructuredSeoCopy source={content} /></article></PdfSecurityTool></div></DashboardShell>;
}

