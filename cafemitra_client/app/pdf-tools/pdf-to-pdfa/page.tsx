import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import ConversionTool from "../ConversionTool";

const pageUrl = "https://repetigo.com/pdf-tools/pdf-to-pdfa";

export const metadata: Metadata = {
  title: "PDF to PDF/A Converter Free - ISO 19005 Compliant | RepetiGo",
  description: "Convert PDF to PDF/A online free for courts, government portals, archives, and academic repositories. PDF/A-1b, PDF/A-1a, and PDF/A-2 support. No sign-up.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "PDF to PDF/A Converter Free - ISO 19005 Compliant | RepetiGo",
    description: "Create a verified archival PDF/A file online. PDF/A-1b, PDF/A-1a, and PDF/A-2 support with automatic file deletion.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Convert PDF to PDF/A Free Online | RepetiGo",
    description: "Create ISO 19005-compliant PDF/A files for courts, government, and archives. No sign-up.",
  },
  robots: { index: true, follow: true },
};

const content = "H1: Convert PDF to PDF/A Free. ISO 19005 Compliant. For Courts, Government, and Archives.\nA portal has asked for PDF/A. A court e-filing system has rejected your document. An institutional repository requires ISO 19005 compliance. The format itself is not obvious - it is a specific archival standard that most PDF tools do not produce by default.\nRepetiGo's free PDF to PDF/A converter produces ISO 19005-compliant archival PDFs that meet the submission requirements of courts, government portals, regulatory bodies, and academic repositories. Upload your PDF, choose your standard (PDF/A-1b, PDF/A-2), and download a verified compliant file.\n✓ PDF/A-1b · PDF/A-1a · PDF/A-2 supported  ✓ Fonts and colour profiles embedded  ✓ ISO 19005 compliance validated  ✓ No sign-up  ✓ Files deleted in 60 minutes\n\n➜  [ Convert PDF to PDF/A Free → repetigo.com/pdf-tools/pdf-to-pdfa ]\n\n\nH2: What Is PDF/A? The Archival Standard That Institutions Require.\nPDF/A is a version of the PDF format defined under ISO Standard 19005, specifically designed for long-term archiving and electronic document preservation. Unlike a regular PDF, a PDF/A file is self-contained: it embeds everything the document needs to display identically regardless of the software, operating system, or device used to open it - now or decades from now.\nThe key technical requirements that make a PDF/A-compliant file different from a standard PDF:\n•  All fonts must be embedded: A standard PDF can reference system fonts (Arial, Times New Roman, etc.) that may not exist on future systems. PDF/A embeds the complete font data inside the file, so the document always renders correctly.\n•  Colour spaces must be specified: PDF/A requires device-independent colour profiles (typically sRGB or CMYK ICC profiles) so colours render consistently across any display.\n•  No encryption permitted: Password-protected PDFs cannot be PDF/A. Encryption creates a dependency on external key management systems that may not persist long-term.\n•  No audio, video, or JavaScript: Interactive and media-dependent elements are prohibited because they require external software that may not be available in the future.\n•  Metadata must be XMP-compliant: Document metadata (author, creation date, title) must be embedded in XMP format for automated archival cataloguing.\n💡  PDF/A is not a 'lighter' or 'compressed' version of PDF - it is typically the same size or slightly larger because it embeds more data. Its purpose is reliability and longevity, not size reduction. If you need to reduce file size, use RepetiGo's Compress PDF tool separately.\n\nH2: PDF vs PDF/A: What Actually Changes.\nThe differences between a standard PDF and a PDF/A file are not visible to the reader - the document content looks identical. The differences are structural, ensuring the file remains readable and reproducible under any future conditions.\nProperty\nStandard PDF\nPDF/A\nFont handling\nMay reference system fonts (not embedded)\nAll fonts fully embedded in the file\nColour spaces\nCan use device-dependent colours\nDevice-independent ICC colour profiles required\nEncryption\nPasswords and DRM permitted\nEncryption not permitted - file must be open\nMultimedia\nAudio, video, Flash, JavaScript allowed\nNo multimedia or executable content permitted\nExternal references\nCan link to external websites and resources\nNo external dependencies - fully self-contained\nMetadata\nProprietary metadata formats permitted\nXMP metadata required in specific schema\nFile size\nTypically smaller (references external resources)\nOften slightly larger (all resources embedded)\nLong-term reliability\nDepends on external resources staying available\nGuaranteed self-contained - readable in isolation\nInstitutional acceptance\nAccepted for general sharing and editing\nRequired for courts, archives, government portals\n\n\nH2: How to Convert PDF to PDF/A in 3 Steps.\nThe conversion process handles all technical requirements automatically - font embedding, colour profile insertion, metadata compliance - in a single pass.\n\nH3: Step 1 - Upload Your PDF\nUpload your PDF by clicking the Upload button or dragging the file into the tool. Any standard PDF works - typed documents, scanned PDFs that have been OCR-processed, exported presentations, compiled reports. The upload travels over an encrypted TLS connection. No account required.\nNote: if your PDF is encrypted (password-protected), remove the password first using RepetiGo's Unlock PDF tool before converting to PDF/A. Encrypted PDFs cannot be made PDF/A-compliant.\nH3: Step 2 - Choose Your PDF/A Standard\nSelect the PDF/A conformance level required by your institution:\n•  PDF/A-1b: ISO 19005-1 basic conformance. The most widely required standard. Accepted by courts, most government portals, and academic repositories. This is the correct choice for the vast majority of compliance requirements.\n•  PDF/A-1a: ISO 19005-1 full conformance. Includes all PDF/A-1b requirements plus additional accessibility requirements (tagged PDF structure). Required by some archival institutions and mandated for accessibility-first government documents.\n•  PDF/A-2: ISO 19005-2. Supports JPEG 2000 compression and allows optional digital signatures and file attachments. Suitable when the source document uses newer compression formats.\nH3: Step 3 - Download and Verify\nClick Download. Your PDF/A-compliant file is ready - all fonts embedded, colour profiles assigned, metadata structured. The file is validated against the ISO 19005 specification before download. Your uploaded file is permanently deleted from our servers within 60 minutes.\nTo independently verify compliance after downloading, open the file in Adobe Acrobat Reader and check File → Properties → Description for the PDF/A identification, or use the free veraPDF tool (verapdf.org) for a detailed conformance report.\n💡  If your PDF/A conversion produces an error, the source PDF likely has a property incompatible with archival format - encryption, unsupported embedded objects, or corrupted structure. Use RepetiGo's Repair PDF tool first, then retry the conversion.\n\n➜  [ Convert PDF to PDF/A Now - Free → repetigo.com/pdf-tools/pdf-to-pdfa ]\n\n\nH2: PDF/A Sub-Standards: Which Version Do You Need?\nPDF/A is not a single standard - it is a family of ISO specifications with different conformance levels. Most institutions specify which version they require. If they do not specify, PDF/A-1b is the correct default.\nH3: PDF/A-1b - The Default. ISO 19005-1 Basic Conformance.\nPDF/A-1b (Level B, 'basic') ensures that the document will look exactly the same when rendered in any compliant PDF reader, now and in the future. It requires embedded fonts, device-independent colour spaces, and XMP metadata - but does not require a tagged PDF structure (which provides document accessibility to screen readers).\nUse PDF/A-1b for: Indian High Court and Supreme Court e-filing, MCA21 company filings, SEBI and RBI regulatory submissions, INFLIBNET thesis submissions, and most government portal submissions that specify PDF/A without a version number.\nH3: PDF/A-1a - Full Conformance with Accessibility Requirements.\nPDF/A-1a (Level A, 'accessible') includes everything in PDF/A-1b plus a requirement for a tagged PDF structure - a hierarchical mapping of the document's logical content (headings, paragraphs, figures, tables) that enables screen readers and other assistive technologies to navigate the document.\nPDF/A-1a requires the source document to have proper heading structure and alt text for images. Documents created from unstructured sources (scanned PDFs, flat exported files) typically cannot achieve PDF/A-1a compliance. Use PDF/A-1a only when specifically required by the receiving institution.\nH3: PDF/A-2 and PDF/A-3 - Later Standards.\nPDF/A-2 (ISO 19005-2) extends PDF/A-1 to support JPEG 2000 compression, optional digital signatures, and transparency. PDF/A-3 (ISO 19005-3) is identical to PDF/A-2 but additionally permits embedding of arbitrary file attachments (including non-PDF files) within the archival document.\nMost legal, regulatory, and academic institutions in India and globally accept or require PDF/A-1 (specifically 1b). Specify PDF/A-2 or PDF/A-3 only when the receiving institution explicitly requests it.\n💡  When in doubt, use PDF/A-1b. It has the broadest institutional acceptance, the simplest technical requirements, and is the most reliably convertible from standard PDFs. If the portal rejects PDF/A-1b and requests a different version, check the specific submission guidelines.\n\nH2: Who Needs to Convert PDF to PDF/A?\nPDF/A is a specialist format. Most people will never need it. But for those who do, it is a non-negotiable institutional requirement. Here are the primary use cases:\n•  Legal and court filings: Indian High Courts, the Supreme Court, and the eCourts platform increasingly mandate PDF/A for electronic case filing. International courts (ICC, ICJ, ECHR) require ISO 19005-compliant formats for evidence submission and case records. A non-compliant PDF file is rejected at intake.\n•  Government and regulatory submissions: SEBI, RBI, IRDAI, and other Indian regulators require PDF/A for certain filings. The MCA21 portal for company filings, the CERSAI register, and GSTN return documentation increasingly specify archival PDF formats.\n•  Library and institutional archives: INFLIBNET's Shodhganga national thesis repository requires PDF/A for thesis submissions. Most university digital repositories worldwide mandate PDF/A to ensure thesis documents remain accessible indefinitely. Public libraries digitising their collections use PDF/A for scan preservation.\n•  Enterprise records management: Organisations subject to data retention mandates under the Companies Act, the IT Act, or sector-specific regulations use PDF/A to ensure electronic records remain readable for the full statutory retention period - which can be 7-30 years.\n•  Medical and clinical records: Hospitals and medical institutions archiving patient records in electronic document management systems use PDF/A to meet HIPAA-equivalent and national health data retention standards.\n•  Academic publishing and research output: Journals, preprint servers, and funding body research data repositories increasingly require PDF/A for article and data submission to ensure long-term access to published research.\n💡  If you have been told your PDF was 'rejected' or 'non-compliant' by a portal or institution, and compression or editing did not help, the issue is almost certainly the archival format requirement. Converting to PDF/A-1b resolves most institutional submission errors of this type.\n\nH2: Convert PDF to PDF/A in India - Required for Courts and Regulatory Filings.\nIndia's transition to digital court and regulatory infrastructure has made PDF/A a growing professional requirement across legal, financial, and academic sectors:\n•  eCourts platform (e-Filing): The Supreme Court of India and various High Courts operating on the eCourts digital infrastructure specify PDF/A for electronic case filing. Documents submitted in standard PDF format may be rejected during intake processing.\n•  MCA21 and Registrar of Companies: The Ministry of Corporate Affairs' MCA21 portal processes annual returns, incorporation documents, and other statutory filings. PDF/A is the recommended format for documents that form part of the permanent corporate record.\n•  SEBI and financial regulatory filings: Securities and Exchange Board of India filings, annual reports submitted to stock exchanges, and offer documents require archival-quality documentation. PDF/A ensures these records remain readable for the regulatory retention period.\n•  INFLIBNET and Shodhganga: The national electronic thesis and dissertation database operated by INFLIBNET requires PDF/A-1b for all thesis submissions. University libraries processing these submissions must convert student-submitted PDFs before upload.\n•  UIDAI and government benefit schemes: Administrative documents for Aadhaar-linked benefit programmes and government scheme applications increasingly use PDF/A as the archival format for records that may be referenced decades later.\n•  Indian Patent Office: Patent applications and supporting documentation submitted to the Controller General of Patents, Designs and Trade Marks increasingly specify PDF/A for document submissions.\nWith RepetiGo you can convert PDF to PDF/A free online in India - upload the document, select PDF/A-1b (the standard required by most Indian institutions), and download a verified compliant file in seconds. Files are automatically deleted within 60 minutes.\n⚠️  Under India's DPDP Act 2023, compliance documents containing personal data, financial records, or legal information should only be processed on platforms with documented auto-deletion policies. RepetiGo permanently deletes all uploaded files within 60 minutes.\n\n\n\nH2: Your PDF Is Safe. Always.\nCompliance documents - court filings, regulatory submissions, thesis documents, corporate records - are often among the most sensitive files a professional handles. Here is exactly what happens to your file:\n•  🔒 Encrypted upload: Your file travels over TLS encryption. It cannot be intercepted in transit.\n•  🔐 Isolated processing: Your file processes in a temporary, isolated session. No link to any account, user ID, or persistent identifier.\n•  🗑️ Auto-deleted in 60 minutes: Both your uploaded PDF and the converted PDF/A output are permanently deleted within 60 minutes - whether you download the result or not.\n•  👁️ Content never read: The PDF/A conversion engine embeds fonts and colour profiles and restructures metadata. It never reads, stores, or analyses the substantive content of your document.\n•  🚫 No account = no data: No sign-up means we hold zero personal data about you. No name, no email, no document history.\n🔒  For court filings, regulatory submissions, and institutional records, your document's content confidentiality is as important as its format compliance. RepetiGo's 60-minute auto-deletion is non-negotiable - not a premium feature.\nPrivacy Policy → /security/ | Auto-Delete feature → /features/auto-delete/\n\nH2: PDF/A for Print Shops and Document Management.\nPrint shops and document service centres handling legal, government, and institutional clients regularly receive standard PDFs that need to be submitted in PDF/A format before filing. Converting documents to PDF/A as a value-added service is increasingly common in shops near courts, government offices, and university campuses.\nPrintPilot - RepetiGo's print shop automation platform - integrates PDF/A conversion into the document processing queue. When a client submits a document that requires PDF/A compliance for a specific institution, PrintPilot can automatically apply the required conversion, validate the output, and deliver a compliance-ready file alongside the print job.\n🖨️  PrintPilot handles PDF/A conversion, OCR, compression, watermarking, and print queue management automatically - giving document service shops a full compliance workflow without manual tool use for every file.\nLearn about PrintPilot → /products/printpilot/\n\n➜  [ Try PrintPilot Free → repetigo.com/pricing/ ]\n[ Or Just Convert PDF to PDF/A Now → repetigo.com/pdf-tools/pdf-to-pdfa ]\n\nH2: Common Questions About PDF to PDF/A Conversion.\nH3: Q1: What is PDF/A and how is it different from a regular PDF?\nPDF/A is a version of the PDF format defined under ISO Standard 19005, designed for long-term archiving. Unlike a standard PDF, a PDF/A file is fully self-contained: all fonts are embedded, colour spaces are specified using device-independent ICC profiles, and no external dependencies (encryption, multimedia, JavaScript) are permitted. This guarantees the document will render identically in any environment, now or in the future.\nH3: Q2: Which PDF/A version should I use?\nFor most institutional requirements - Indian courts, government portals, university repositories, and regulatory filings - use PDF/A-1b (ISO 19005-1, Level B). It has the broadest acceptance and the most reliable conversion from standard PDFs. Choose PDF/A-1a only if the receiving institution specifically requires it (it additionally requires a tagged document structure). PDF/A-2 or PDF/A-3 are only needed when the institution explicitly requests them.\nH3: Q3: How do I know if my converted file is actually PDF/A compliant?\nAfter downloading your converted file, you can verify compliance two ways. Open the file in Adobe Acrobat Reader and check File → Properties → Description - a PDF/A file shows 'PDF/A' in the document properties. For a detailed technical compliance report, upload the file to veraPDF (verapdf.org), which is the industry-standard free PDF/A validator endorsed by the PDF Association. RepetiGo validates compliance during conversion, but independent verification is always recommended before official submission.\nH3: Q4: Can I convert a scanned PDF to PDF/A?\nYes, with one prerequisite: scanned PDFs must be OCR-processed first. A scanned PDF is an image of a page - it has no text layer, which means it cannot meet the PDF/A requirement for readable text content. Use RepetiGo's OCR PDF tool at /pdf-tools/ocr-pdf to add a text layer to the scan first, then convert the OCR-processed PDF to PDF/A. The resulting file will be PDF/A-compliant with searchable text.\nH3: Q5: Why won't my encrypted PDF convert to PDF/A?\nPDF/A does not permit encryption. Password-protected PDFs contain a DRM layer that creates an external dependency (the password/key system), which violates the archival self-containment requirement. Remove the password first using RepetiGo's Unlock PDF tool at /pdf-tools/unlock-pdf, then convert the unlocked PDF to PDF/A.\nH3: Q6: Does converting to PDF/A increase the file size?\nUsually yes, often significantly. PDF/A embeds complete font data and colour profile information that a standard PDF may reference externally. A standard PDF that uses a 10-point Arial font references the system's Arial font installation; a PDF/A file embeds the entire Arial font file. For documents with many fonts or complex colour profiles, the PDF/A file can be 2-3 times the size of the original. This is by design - completeness and longevity are more important than file size for archival documents.\nH3: Q7: How do I convert a Word document to PDF/A?\nThe most reliable path for converting a Word document to PDF/A is a two-step process. First, export the Word document to a standard PDF (File → Save As → PDF in Microsoft Word). Then upload the PDF to RepetiGo's PDF to PDF/A converter and select your required standard. This approach produces a cleaner PDF/A than Word's built-in 'Save as PDF/A' option, which has known compatibility issues with some institutional validators.\nH3: Q8: Can all PDFs be converted to PDF/A?\nMost standard text-based PDFs convert cleanly to PDF/A. However, some files cannot be converted or require remediation: encrypted/DRM-protected PDFs (remove protection first), PDFs with embedded multimedia (audio, video, interactive Flash), PDFs with unsupported colour spaces (some specialist print-production PDFs use proprietary colour profiles), and severely corrupted PDFs. If conversion fails, try RepetiGo's Repair PDF tool first, then retry.\nH3: Q9: Is PDF/A the same as PDF accessibility?\nNo - they are different compliance standards. PDF/A (ISO 19005) is an archival format standard that ensures long-term readability. PDF accessibility (often called PDF/UA, ISO 14289, or WCAG 2.x for PDFs) ensures documents are usable by people with disabilities via screen readers and assistive technologies. PDF/A-1a has some accessibility requirements (tagged structure), but a PDF/A-1b compliant document is not necessarily accessible, and an accessible PDF is not necessarily PDF/A compliant. If you need both, the document must meet both standards independently.\nH3: Q10: Is it safe to upload a confidential legal or regulatory document?\nWith RepetiGo, yes. Your file uploads over TLS encryption, processes in an isolated temporary session, and is permanently deleted within 60 minutes of upload - whether you download the result or not. The conversion engine restructures document metadata and embeds resources; it does not read, store, or analyse your document's content. No account sign-up means we hold no personal data about you or your documents.\n\nH2: More Free PDF Tools from RepetiGo.\n•  OCR PDF → /pdf-tools/ocr-pdf - make scanned PDFs text-searchable before PDF/A conversion\n•  Unlock PDF → /pdf-tools/unlock-pdf - remove encryption before PDF/A conversion\n•  Repair PDF → /pdf-tools/repair-pdf - fix corrupted PDFs before PDF/A conversion\n•  Sign PDF → /pdf-tools/sign-pdf - add digital signatures to PDF/A files\n•  Compress PDF → /pdf-tools/compress-pdf - reduce PDF size (separate from PDF/A conversion)\n•  All PDF Tools → /pdf-tools - complete free PDF tools library\n\n➜  [ Convert PDF to PDF/A Free Now → repetigo.com/pdf-tools/pdf-to-pdfa ]\nISO 19005 compliant · PDF/A-1b · PDF/A-2 · Auto-deleted in 60 minutes";

const faqStart = content.indexOf("H2: Common Questions About PDF to PDF/A Conversion.");
const faqEnd = content.indexOf("H2: More Free PDF Tools from RepetiGo.", faqStart);
const faqSchemaQuestions = Array.from(
  content.slice(faqStart, faqEnd).matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g),
).map((match) => [match[1], match[2].trim()] as const);

type SeoTable = { headers: string[]; rows: string[][] };

const comparisonTable: SeoTable = {
  headers: ["Property", "Standard PDF", "PDF/A"],
  rows: [
    ["Font handling", "May reference system fonts (not embedded)", "All fonts fully embedded in the file"],
    ["Colour spaces", "Can use device-dependent colours", "Device-independent ICC colour profiles required"],
    ["Encryption", "Passwords and DRM permitted", "Encryption not permitted - file must be open"],
    ["Multimedia", "Audio, video, Flash, JavaScript allowed", "No multimedia or executable content permitted"],
    ["External references", "Can link to external websites and resources", "No external dependencies - fully self-contained"],
    ["Metadata", "Proprietary metadata formats permitted", "XMP metadata required in specific schema"],
    ["File size", "Typically smaller (references external resources)", "Often slightly larger (all resources embedded)"],
    ["Long-term reliability", "Depends on external resources staying available", "Guaranteed self-contained - readable in isolation"],
    ["Institutional acceptance", "Accepted for general sharing and editing", "Required for courts, archives, government portals"],
  ],
};

function normalizeContent(source: string) {
  return source.replace(/(^|\n)(H[123]: [^\n]+)\n/g, "$1\n$2\n\n");
}

function mapRoute(value: string) {
  const raw = value.trim().replace(/[.,;!?)]$/, "");
  if (!raw) return "";
  if (/^(?:https?:\/\/)?(?:www\.)?verapdf\.org$/i.test(raw)) return "https://verapdf.org";
  const clean = raw.replace(/^(?:https?:\/\/)?(?:www\.)?repetigo\.com/i, "").replace(/\/$/, "");
  const routes: Record<string, string> = {
    "": "/",
    "/pdf-tools": "/pdf-tools",
    "/pdf-tools/pdf-to-pdfa": "/pdf-tools/pdf-to-pdfa",
    "/pdf-tools/ocr-pdf": "/pdf-tools/ocr-pdf",
    "/pdf-tools/unlock-pdf": "/pdf-tools/unlock-pdf",
    "/pdf-tools/repair-pdf": "/pdf-tools/repair-pdf",
    "/pdf-tools/sign-pdf": "/pdf-tools/sign-pdf",
    "/pdf-tools/compress-pdf": "/pdf-tools/compress-pdf",
    "/pdf-tools/organize-pdf": "/pdf-tools/organize-pdf",
    "/products/printpilot": "/print-automation",
    "/security": "/privacy-policy",
    "/features/auto-delete": "/privacy-policy",
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
    "/pdf-tools/pdf-to-pdfa": "Open PDF to PDF/A",
    "/pdf-tools/ocr-pdf": "Open OCR PDF",
    "/pdf-tools/unlock-pdf": "Open Unlock PDF",
    "/pdf-tools/repair-pdf": "Open Repair PDF",
    "/pdf-tools/sign-pdf": "Open Sign PDF",
    "/pdf-tools/compress-pdf": "Open Compress PDF",
    "/pdf-tools/organize-pdf": "Open Organize PDF",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
    "https://verapdf.org": "Open veraPDF Validator",
  };
  return labels[route] || "Open PDF Tool";
}

function renderInline(text: string) {
  const routePattern = /((?:https?:\/\/)?(?:www\.)?repetigo\.com(?:\/[^\s.,;!?)]*)?|\/(?:tools|features|products|security|pricing|use-cases)\/[^\s.,;!?)]*|(?:https?:\/\/)?(?:www\.)?verapdf\.org)/gi;
  return text.split(routePattern).map((part, index) => {
    const href = mapRoute(part);
    if (href) return <a key={`${part}-${index}`} href={href}>{labelFor(href)}</a>;
    return part;
  });
}

function renderNamedRouteActions(line: string, key: string) {
  return <div className="tool-seo-cta-stack" key={key}>{line.split("|").map((part) => {
    const arrow = part.indexOf("→");
    const label = arrow >= 0 ? part.slice(0, arrow).trim() : part.trim();
    const href = arrow >= 0 ? mapRoute(part.slice(arrow + 1)) : "";
    return href ? <a className="tool-seo-inline-cta" href={href} key={part}>{label} <span>→</span></a> : null;
  })}</div>;
}

function renderBracketCta(line: string) {
  const inner = line.trim().replace(/^(?:➜|➤|→)\s*/, "").replace(/^\[/, "").replace(/\]$/, "");
  const arrow = inner.indexOf("→");
  const label = arrow >= 0 ? inner.slice(0, arrow).trim() : inner.trim();
  const href = arrow >= 0 ? mapRoute(inner.slice(arrow + 1)) : "/pdf-tools/pdf-to-pdfa";
  return <a className="tool-seo-inline-cta" href={href || "/pdf-tools/pdf-to-pdfa"}>{label} <span>→</span></a>;
}

function isBracketCta(line: string) {
  const trimmed = line.trim();
  return /^(?:➜|➤|→)?\s*\[.*\]$/.test(trimmed);
}

function isNamedRouteAction(line: string) {
  return /^(?:Privacy Policy|Learn about PrintPilot|QR Document Upload|Auto-Delete feature)\b/.test(line);
}

function isCallout(line: string) {
  return /^(?:💡|⚠️|🔒|🖨️)/.test(line);
}

function renderTable(table: SeoTable) {
  return <div className="tool-seo-table-wrap"><table><thead><tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{renderInline(cell)}</td>)}</tr>)}</tbody></table></div>;
}

function renderLines(lines: string[], keyPrefix: string) {
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
    if (isNamedRouteAction(line)) {
      output.push(renderNamedRouteActions(line, `${keyPrefix}-actions-${index}`));
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

function renderBlock(block: string, index: number): React.ReactNode {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  const first = lines[0];
  if (!first) return null;
  if (first.startsWith("H1: ")) return <h1 key={index}>{first.slice(4)}</h1>;
  if (first.startsWith("H2: ")) return <h2 key={index}>{first.slice(4)}</h2>;
  if (first.startsWith("H3: ")) return <h3 key={index}>{first.slice(4)}</h3>;

  const tableStart = lines.findIndex((line, lineIndex) => line === "Property" && lines.slice(lineIndex, lineIndex + 3).join("|") === "Property|Standard PDF|PDF/A");
  if (tableStart >= 0) {
    const tableEnd = tableStart + comparisonTable.headers.length + comparisonTable.rows.length * comparisonTable.headers.length;
    return <div key={index}>{tableStart > 0 ? <div className="tool-seo-copy-paragraph">{renderLines(lines.slice(0, tableStart), `${index}-before-table`)}</div> : null}{renderTable(comparisonTable)}{tableEnd < lines.length ? <div className="tool-seo-copy-paragraph">{renderLines(lines.slice(tableEnd), `${index}-after-table`)}</div> : null}</div>;
  }

  return <div className={index === 1 ? "tool-seo-copy-paragraph tool-seo-hero" : "tool-seo-copy-paragraph"} key={index}>{renderLines(lines, `${index}`)}</div>;
}

function StructuredSeoCopy({ source }: { source: string }) {
  const blocks = normalizeContent(source).split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return <>{blocks.map((block, index) => renderBlock(block, index))}</>;
}

function JsonLd() {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "RepetiGo PDF to PDF/A Converter",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      description: "Free online PDF to PDF/A converter for ISO 19005 archival documents.",
      url: pageUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Convert PDF to PDF/A Online",
      step: [
        { "@type": "HowToStep", name: "Upload Your PDF" },
        { "@type": "HowToStep", name: "Choose Your PDF/A Standard" },
        { "@type": "HowToStep", name: "Download and Verify" },
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
        { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "PDF to PDF/A", item: pageUrl },
      ],
    },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}

export default function PdfToPdfaPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><ConversionTool slug="pdf-to-pdfa"><JsonLd /><article className="tool-seo-content" id="pdf-to-pdfa-guide"><StructuredSeoCopy source={content} /></article></ConversionTool></div></DashboardShell>;
}

