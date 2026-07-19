import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "../../DashboardShell";
import PdfSecurityTool from "../PdfSecurityTool";

const pageUrl = "https://repetigo.com/tools/pdf/redact-pdf/";

export const metadata: Metadata = {
  title: "Redact PDF Free Online - Permanently Remove Sensitive Data | RepetiGo",
  description: "Redact sensitive text, images, and data from PDFs permanently. Free online PDF redaction without Adobe Acrobat, no sign-up, and auto-delete in 60 minutes.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Redact PDF Free Online - Permanently Remove Sensitive Data | RepetiGo",
    description: "Permanently remove sensitive information from PDFs before sharing. Free, private, and browser-based.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Redact PDF Free Online | RepetiGo",
    description: "Permanently redact text, images, and sensitive data from a PDF without Adobe Acrobat.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Redact PDF Free. Permanently Remove Sensitive Data Before Sharing. No Adobe.
You need to share a PDF - but it contains information that should not be seen. A name. An account number. A salary figure. A medical record. An identity number. Simply hiding the text is not enough - it needs to be gone permanently.
RepetiGo's free PDF redaction tool permanently blacks out selected text, images, and data from your PDF before you download and share it. The redacted content is destroyed - not hidden, not masked, not covered. Permanently removed.
✓ Permanently remove text, images, and data  ✓ DPDP Act and GDPR compliant workflows  ✓ Mac, Windows, iPhone  ✓ No Adobe Acrobat Pro  ✓ No sign-up  ✓ Files deleted in 60 minutes

➜  [ Redact PDF Free Now → repetigo.com/tools/pdf/redact-pdf/ ]

H2: What Does Redacting a PDF Mean?
Redacting a PDF means permanently removing selected content from the document so that it cannot be read, recovered, or reconstructed. The redacted areas are replaced with solid black bars - but unlike simply drawing a black box over the text, true redaction destroys the underlying data entirely.
When you redact a PDF correctly:
•  The selected text, image, or data is permanently deleted from the PDF's content stream
•  It is replaced with a black bar or redaction mark in the document
•  The underlying data is gone - it cannot be copied, searched, or retrieved
•  The redacted version is a new, clean PDF that can be shared without exposing the removed information
💡  Redaction is different from just covering text. It is a one-way operation. Once content is truly redacted, it is permanently gone - even from the PDF's internal data structures. This is what makes redaction the correct tool for removing personal data, confidential information, and legally privileged content from documents you need to share.

H2: True Redaction vs Blacking Out: A Critical Difference.
One of the most common - and dangerous - mistakes people make is drawing a black rectangle over sensitive text and believing it is redacted. It is not. Here is the critical difference:

Method
How It Works
Is the Underlying Data Gone?
The Risk
True Redaction (RepetiGo)
Permanently removes the selected content from the PDF's data layer. Replaces it with a solid black redaction mark.
✅ YES - data permanently destroyed. Cannot be copied, searched, extracted, or recovered.
None - the data is gone from the document entirely.
Black Annotation Box (Drawing a box)
Places a black rectangle shape on top of the text - like putting a sticker over a word on paper. The underlying text is still in the PDF.
❌ NO - text still exists in the PDF. Remove the annotation box and the text reappears. Or just select-all and copy - the hidden text pastes into a Word doc.
Very high - recipients can remove the box, copy the text, or use PDF editing software to expose the 'redacted' content. Has caused serious data breaches.
Dark Highlight
Changes the text colour to black on a black/dark background. Text appears invisible on screen.
❌ NO - text still in the PDF. Change the highlight colour or select-all copy - all text is exposed.
Same as annotation box - the underlying text is completely accessible to anyone who knows how.

⚠️  Multiple high-profile data breaches have occurred because organisations sent PDFs 'redacted' with annotation boxes or dark highlights. The underlying text was still present and accessible. True redaction - permanently destroying the data from the document - is the only safe approach.

H2: How to Redact a PDF Free Online.
Three steps. Most documents are redacted and ready to share in under two minutes.

H3: Step 1 - Upload Your PDF
Click Upload or drag your PDF into the tool. Any PDF works - contracts, statements, reports, forms, letters, medical documents. Upload travels over TLS encryption. No account required.
Note: if the PDF has editing restrictions applied, remove them first using RepetiGo's Unlock PDF tool at /tools/pdf/unlock-pdf/ - some PDFs block content selection and redaction when permission-restricted.
H3: Step 2 - Select and Redact the Sensitive Content
Use the redaction tool to select the content you want to remove:
•  Text redaction: Click and drag to select any text - a name, an account number, a date of birth, a sentence, a full paragraph. All selected text is permanently removed.
•  Image redaction: Draw a redaction box over any image, photo, signature, or graphic that should not be shared.
•  Area redaction: Select an entire area of the page - useful for redacting a block of data, a table cell, or a section with mixed content.
Review your selections before proceeding - redaction is permanent and cannot be reversed once applied.

H3: Step 3 - Download Your Redacted PDF
Click Apply Redactions and Download. Your redacted PDF saves to your device - all selected content permanently destroyed, replaced with clean black redaction marks. The document looks exactly as it did, except the sensitive content is visibly removed. Both your uploaded original and the redacted output are deleted from our servers within 60 minutes.
🔒  Always keep a copy of the original unredacted PDF in a secure, access-controlled location before distributing the redacted version. Redaction is irreversible - the original cannot be reconstructed from the redacted file.

➜  [ Redact Your PDF Now - Free → repetigo.com/tools/pdf/redact-pdf/ ]

H2: What Information Should You Redact?
Before sharing any PDF that was not created specifically for the recipient, check it for the following categories of information. Each type carries compliance, legal, or reputational risk if shared unredacted:

Information Type
Examples
Why Redact Before Sharing
Personal Identity Data
Full name + address combination, date of birth, passport number, driver's licence number, Aadhaar number, PAN number, voter ID
Personally identifiable information (PII) protected under DPDP Act 2023 (India), GDPR (EU), and CCPA (US). Sharing without necessity is a compliance violation.
Financial Data
Bank account numbers, IFSC codes, credit/debit card numbers, salary figures, loan amounts, income tax figures, UAN/EPF numbers
Financial fraud risk. Account numbers + IFSC codes are sufficient for unauthorised transfers in some systems.
Medical and Health Data
Medical record numbers, diagnoses, treatment details, prescription details, test results
Sensitive personal data under DPDP Act, HIPAA equivalent regulations. Carries additional legal protection.
Legal and Privileged Information
Client names in privileged communications, matter numbers, settlement figures, confidential clauses
Attorney-client privilege. Inadvertent disclosure can waive privilege or breach confidentiality obligations.
Authentication Credentials
Passwords, security question answers, PINs, OTP references, API keys
Security risk - exposure allows unauthorised access to accounts and systems.
Third-Party Data
Names and details of individuals who are not party to the document's purpose (witnesses, referees, employees not relevant to the matter)
Data minimisation principle under DPDP Act 2023 - share only what the recipient needs to see.

💡  The safest approach: before sharing any PDF with an external party, treat every piece of data that is not directly necessary for the recipient's purpose as a candidate for redaction. Redact first - you can always send an unredacted version separately if genuinely needed.

H2: How to Redact a PDF on Mac Free.
macOS Preview does not have a built-in redaction tool. The annotation tools in Preview (including its signature drawing tool) do not permanently remove content - they layer marks on top of text, leaving the underlying data intact. Adobe Acrobat Pro has redaction on Mac, but requires a paid subscription.
To redact a PDF on Mac for free, open RepetiGo in Safari or Chrome, upload your PDF, select the content to redact, apply the redaction, and download the permanently redacted file. No software installation, no Adobe licence, no subscription.
1.  Open Safari or Chrome on your Mac
2.  Go to repetigo.com/tools/pdf/redact-pdf/ and upload your PDF
3.  Use the redaction selector to mark text, images, or areas for removal
4.  Click Apply Redactions - the content is permanently destroyed
5.  Download the redacted PDF - share with confidence
⚠️  macOS Preview's annotation tools do NOT redact - they cover text with shapes that can be removed. Only true redaction, like RepetiGo provides, permanently destroys the underlying content.

H2: Redact PDF Without Adobe Acrobat.
Adobe Acrobat Pro is the traditional tool for PDF redaction - but at a monthly subscription cost that is impractical for individuals and small teams who need to redact PDFs occasionally. Adobe Reader (the free version) has no redaction capability at all.
RepetiGo provides the same true permanent redaction - content permanently destroyed from the PDF's data layer - free, in any browser, no Adobe licence required. The output files are fully PDF-standard compliant and open correctly in every PDF reader.
•  RepetiGo: Free · browser-based · true permanent redaction · text + image + area · auto-deletes in 60 min · no account
•  Adobe Acrobat Pro: Paid subscription · desktop app · full redaction features · best for enterprise high-volume workflows
•  Adobe Reader: Free · no redaction capability whatsoever
•  macOS Preview: Free built-in · annotation tools only - NOT true redaction · underlying data remains accessible
✅  For occasional or one-off redaction - a client document, a shared report, a form with personal data - RepetiGo permanently removes the content without any subscription.

H2: Redacting PDFs for Compliance - DPDP Act, GDPR, and HIPAA.
Regulatory frameworks around personal data are increasingly explicit about what must happen to sensitive information before it is shared. PDF redaction is one of the primary technical controls for complying with these requirements:
•  DPDP Act 2023 (India): India's Digital Personal Data Protection Act 2023 requires organisations to collect, process, and share only the personal data necessary for the stated purpose. Sharing a PDF containing Aadhaar numbers, financial records, or health data beyond what the recipient needs to see is a compliance risk. Redacting unnecessary personal data before sharing is a direct data minimisation control.
•  GDPR (European Union): The principle of data minimisation under GDPR requires that personal data shared with third parties is limited to what is strictly necessary. Organisations sharing contracts, reports, or correspondence containing EU residents' personal data must redact what is not relevant to the sharing purpose.
•  HIPAA (United States - Healthcare): Protected Health Information (PHI) in medical records, clinical reports, and patient communications must be de-identified or redacted before sharing with parties who are not authorised recipients under HIPAA's minimum necessary standard.
•  Legal professional privilege: In legal proceedings, document discovery and production requires redacting privileged communications, irrelevant personal data, and commercially sensitive information that falls outside the scope of the disclosure order.
💡  Compliance-grade redaction means permanently destroying the data - not covering it. RepetiGo's permanent redaction meets the technical standard for data removal required by DPDP Act, GDPR, and HIPAA workflows.

H2: Redact PDF for Free in India.
India's DPDP Act 2023 and the everyday volume of Aadhaar, PAN, and financial data in professional documents makes PDF redaction a growing requirement across legal, financial, HR, and government sectors:
•  Aadhaar and PAN numbers: The most commonly over-shared personal data in India. Many documents - bank statements, KYC forms, employment records - contain Aadhaar or PAN numbers that should be redacted before the document is shared with parties who do not need them. UIDAI guidelines specifically discourage unnecessary sharing of complete Aadhaar numbers.
•  Legal filings and court submissions: Indian courts increasingly require that personal data not relevant to the matter - party addresses, identity numbers, third-party details - be redacted from documents before submission. High Courts and the Supreme Court eCourt platform have specific guidelines on PII in filed documents.
•  HR and employee documents: Employee salary slips, appraisal documents, background verification reports, and medical certificates shared with managers, auditors, or third parties should have non-relevant personal data (other employees' salaries, unrelated medical details) redacted.
•  CA and audit workpapers: Financial statements, ITR documents, and audit reports shared with clients or regulatory bodies should have third-party account numbers, personal financial details, and confidential business information redacted unless specifically required.
•  Government document processing: Government offices processing citizen applications that contain identity documents - Aadhaar, voter ID, ration cards - should redact identity numbers from copies retained in files that are shared more broadly.
With RepetiGo you can redact PDF documents free online in India - upload your PDF, permanently remove the sensitive content, and download a clean redacted version in seconds. Files are auto-deleted within 60 minutes.
⚠️  India's DPDP Act 2023 makes the data fiduciary (the organisation collecting and processing data) responsible for limiting personal data shared with third parties to what is necessary. PDF redaction is a direct technical compliance control for this requirement.

H2: Your PDF Is Safe. Always.
Documents submitted for redaction are the most sensitive you will handle - they contain exactly the personal data, financial information, and confidential content that needs to be protected. Here is what happens to your file:
•  🔒 Encrypted upload: TLS encryption in transit. Your file cannot be intercepted.
•  🔐 Isolated processing: Your file processes in a temporary session with no link to any account or persistent identifier.
•  🗑️ Auto-deleted in 60 minutes: Both your original uploaded PDF and the redacted output are permanently deleted within 60 minutes - the sensitive data in the original is gone.
•  👁️ Content never read: The redaction engine marks and removes your selected content. It does not read, store, analyse, or index the rest of your document.
•  🚫 No account = no data: No sign-up means we hold zero information about you, your documents, or your redaction sessions.
🔒  The document you are redacting contains exactly the data that should not be on a stranger's server. RepetiGo's 60-minute auto-deletion means the original - with the unredacted sensitive data - is gone before it could ever be at risk.
Privacy Policy → /security/ | Auto-Delete → /features/auto-delete/

H2: PDF Redaction for Print Shops and Document Services.
Document service centres that handle customer identity documents - Aadhaar copies, PAN cards, bank statements, salary slips - routinely retain copies or scans of customer documents for record-keeping. Under DPDP Act 2023, retaining more personal data than necessary creates compliance liability. PrintPilot - RepetiGo's document shop automation platform - can automatically redact identity numbers and personal data from document copies before they are filed or archived, so only the job record is retained without the sensitive data.
🖨️  PrintPilot auto-redacts personal data from retained document copies - print shops serve customers without accumulating unnecessary PII in their records.
Learn about PrintPilot → /products/printpilot/

➜  [ Try PrintPilot Free → repetigo.com/pricing/ ]
[ Or Redact a PDF Now - Free → repetigo.com/tools/pdf/redact-pdf/ ]

H2: Common Questions About Redacting PDFs.
H3: Q1: How do I redact a PDF for free without Adobe?
Go to repetigo.com/tools/pdf/redact-pdf/, upload your PDF, select the text, images, or areas to redact, apply the redactions, and download the permanently redacted file. Free, no account, files deleted in 60 minutes. Works in any browser on Mac, Windows, and mobile.
H3: Q2: What does redacting a PDF mean exactly?
Redacting a PDF means permanently removing selected content from the document. The redacted content is destroyed from the PDF's internal data - not hidden, not covered, not masked. It is replaced with a solid black bar. The underlying data is gone and cannot be retrieved, copied, searched, or reconstructed from the redacted file.
H3: Q3: Is blacking out text in a PDF the same as redacting it?
No - and this is critical. Drawing a black annotation box or rectangle over text does NOT redact it. The underlying text is still present in the PDF. Anyone can remove the annotation box to expose the text, or simply select-all and paste into a Word document - all the 'hidden' text will appear. Multiple data breaches have resulted from this mistake. True redaction (which RepetiGo provides) permanently destroys the underlying data.
H3: Q4: Can redaction be undone or reversed?
True permanent redaction cannot be reversed - the data is permanently destroyed. This is the entire point of redaction. However, if you only drew an annotation box or black shape over the text (not true redaction), that is removable - the underlying text was never actually deleted. This is why it is important to use a proper redaction tool rather than annotation tools. Always keep the original unredacted document securely before distributing the redacted version.
H3: Q5: How do I redact a PDF on Mac without Adobe Acrobat?
Open RepetiGo in Safari or Chrome on your Mac, upload your PDF, use the redaction selector to mark the content for removal, apply redactions, and download. macOS Preview cannot redact PDFs - its annotation tools only cover text without destroying it. RepetiGo performs true permanent redaction in the browser without any software installation.
H3: Q6: What types of information should I redact before sharing a PDF?
Personal identity data (Aadhaar, PAN, passport numbers), financial data (account numbers, IFSC codes, salary figures), medical information, legal privileged content, authentication credentials (passwords, PINs), and any personal data about third parties not relevant to the recipient's purpose. See the What Information Should You Redact section above for a full category list.
H3: Q7: Does redacting a PDF reduce its file size?
Slightly - removing content from the PDF reduces the data in the content stream. However, the reduction is usually minimal for text redactions. Image redactions can reduce file size more noticeably if large images are removed. The change is unlikely to be significant enough to affect email or portal submission limits.
H3: Q8: Can I redact a PDF on iPhone or Android?
Yes. Open RepetiGo in Safari on iPhone or Chrome on Android, upload your PDF from the Files app, use the redaction tool to select and mark content, apply the redaction, and download the redacted file. No app installation required. The permanently redacted PDF can be shared immediately from your phone.
H3: Q9: How do I know the redaction was applied correctly?
After downloading the redacted PDF, open it and attempt to select and copy text in the redacted areas. If true redaction was applied, no text will be selectable or copyable in those areas - the content is gone. You can also use RepetiGo's Compare PDF tool at /tools/pdf/compare-pdf/ to compare the original and redacted versions side by side and verify that the correct content was removed.
H3: Q10: Is it safe to upload a document with sensitive data to redact it online?
With RepetiGo, yes. Your file uploads over TLS encryption, processes in an isolated temporary session, and both the original and the redacted output are permanently deleted within 60 minutes. The redaction engine marks and removes your selected content; it does not read, extract, or store the document's content. No sign-up means we hold no data about you or your documents.

H2: More Free PDF Tools from RepetiGo.
•  Protect PDF → /tools/pdf/protect-pdf/ - add password protection after redacting
•  Edit PDF → /tools/pdf/edit-pdf/ - modify non-sensitive content before redacting
•  Sign PDF → /tools/pdf/sign-pdf/ - sign the redacted document before sending
•  Compare PDF → /tools/pdf/compare-pdf/ - verify the redacted version against the original
•  Unlock PDF → /tools/pdf/unlock-pdf/ - remove restrictions if the PDF is locked before redacting
•  PDF Form → /tools/pdf/pdf-form/ - fill forms then redact sensitive fields before sharing
•  All PDF Tools → /tools/pdf/ - complete free PDF tools library

➜  [ Redact PDF Free Now → repetigo.com/tools/pdf/redact-pdf/ ]
Permanently remove sensitive data · DPDP Act compliant · No sign-up · Auto-deleted in 60 minutes`;

type SeoTable = { headers: string[]; rows: string[][] };

const tables: SeoTable[] = [
  {
    headers: ["Method", "How It Works", "Is the Underlying Data Gone?", "The Risk"],
    rows: [
      ["True Redaction (RepetiGo)", "Permanently removes the selected content from the PDF's data layer. Replaces it with a solid black redaction mark.", "✅ YES - data permanently destroyed. Cannot be copied, searched, extracted, or recovered.", "None - the data is gone from the document entirely."],
      ["Black Annotation Box (Drawing a box)", "Places a black rectangle shape on top of the text - like putting a sticker over a word on paper. The underlying text is still in the PDF.", "❌ NO - text still exists in the PDF. Remove the annotation box and the text reappears. Or just select-all and copy - the hidden text pastes into a Word doc.", "Very high - recipients can remove the box, copy the text, or use PDF editing software to expose the 'redacted' content. Has caused serious data breaches."],
      ["Dark Highlight", "Changes the text colour to black on a black/dark background. Text appears invisible on screen.", "❌ NO - text still in the PDF. Change the highlight colour or select-all copy - all text is exposed.", "Same as annotation box - the underlying text is completely accessible to anyone who knows how."],
    ],
  },
  {
    headers: ["Information Type", "Examples", "Why Redact Before Sharing"],
    rows: [
      ["Personal Identity Data", "Full name + address combination, date of birth, passport number, driver's licence number, Aadhaar number, PAN number, voter ID", "Personally identifiable information (PII) protected under DPDP Act 2023 (India), GDPR (EU), and CCPA (US). Sharing without necessity is a compliance violation."],
      ["Financial Data", "Bank account numbers, IFSC codes, credit/debit card numbers, salary figures, loan amounts, income tax figures, UAN/EPF numbers", "Financial fraud risk. Account numbers + IFSC codes are sufficient for unauthorised transfers in some systems."],
      ["Medical and Health Data", "Medical record numbers, diagnoses, treatment details, prescription details, test results", "Sensitive personal data under DPDP Act, HIPAA equivalent regulations. Carries additional legal protection."],
      ["Legal and Privileged Information", "Client names in privileged communications, matter numbers, settlement figures, confidential clauses", "Attorney-client privilege. Inadvertent disclosure can waive privilege or breach confidentiality obligations."],
      ["Authentication Credentials", "Passwords, security question answers, PINs, OTP references, API keys", "Security risk - exposure allows unauthorised access to accounts and systems."],
      ["Third-Party Data", "Names and details of individuals who are not party to the document's purpose (witnesses, referees, employees not relevant to the matter)", "Data minimisation principle under DPDP Act 2023 - share only what the recipient needs to see."],
    ],
  },
];

const routeMap: Record<string, string> = {
  "/tools/pdf": "/pdf-tools",
  "/tools/pdf/redact-pdf": "/pdf-tools/redact-pdf",
  "/tools/pdf/protect-pdf": "/pdf-tools/protect-pdf",
  "/tools/pdf/edit-pdf": "/pdf-tools/edit-pdf",
  "/tools/pdf/sign-pdf": "/pdf-tools/sign-pdf",
  "/tools/pdf/compare-pdf": "/pdf-tools/compare-pdf",
  "/tools/pdf/unlock-pdf": "/pdf-tools/unlock-pdf",
  "/tools/pdf/pdf-form": "/pdf-tools/pdf-form",
  "/products/printpilot": "/print-automation",
  "/features/auto-delete": "/privacy-policy",
  "/security": "/privacy-policy",
  "/pricing": "/pricing",
};

const routeLabels: Record<string, string> = {
  "/pdf-tools": "Explore All PDF Tools",
  "/pdf-tools/redact-pdf": "Open Redact PDF",
  "/pdf-tools/protect-pdf": "Open Protect PDF",
  "/pdf-tools/edit-pdf": "Open Edit PDF",
  "/pdf-tools/sign-pdf": "Open Sign PDF",
  "/pdf-tools/compare-pdf": "Open Compare PDF",
  "/pdf-tools/unlock-pdf": "Open Unlock PDF",
  "/pdf-tools/pdf-form": "Open PDF Form",
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

function renderTable(table: SeoTable) {
  return <div className="tool-seo-table-wrap"><table><thead><tr>{table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => <td key={`${cell}-${index}`}>{renderInline(cell)}</td>)}</tr>)}</tbody></table></div>;
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
    if (/^(?:💡|📋|✅|⚠️|🔒|🖨️|Note:)/.test(line)) {
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
      const href = arrow >= 0 ? mapRoute(inner.slice(arrow + 1)) : "/pdf-tools/redact-pdf";
      output.push(<div className="tool-seo-cta-stack" key={`${keyPrefix}-cta-${index}`}><a className="tool-seo-inline-cta" href={href || "/pdf-tools/redact-pdf"}>{label} <span>→</span></a></div>);
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
  const faqStart = content.indexOf("H2: Common Questions About Redacting PDFs.");
  const faqEnd = content.indexOf("H2: More Free PDF Tools from RepetiGo.", faqStart);
  const faqQuestions = Array.from(content.slice(faqStart, faqEnd).matchAll(/H3: ([^\n]+)\n([\s\S]*?)(?=\nH3: |\nH2:|$)/g)).map((match) => ({ "@type": "Question", name: match[1], acceptedAnswer: { "@type": "Answer", text: match[2].trim() } }));
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Redact PDF", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF redaction tool for permanently removing sensitive text, images, and data before sharing.", url: pageUrl },
    { "@context": "https://schema.org", "@type": "HowTo", name: "How to Redact a PDF Online", step: [{ "@type": "HowToStep", name: "Upload your PDF" }, { "@type": "HowToStep", name: "Select and redact sensitive content" }, { "@type": "HowToStep", name: "Download your redacted PDF" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqQuestions },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/tools/pdf/" }, { "@type": "ListItem", position: 3, name: "Redact PDF", item: pageUrl }] },
  ];
  return <>{schemas.map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}

export default function RedactPdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><PdfSecurityTool slug="redact-pdf"><JsonLd /><article className="tool-seo-content" id="redact-pdf-guide"><StructuredSeoCopy /></article></PdfSecurityTool></div></DashboardShell>;
}
