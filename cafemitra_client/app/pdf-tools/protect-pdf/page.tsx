import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import PdfSecurityTool from "../PdfSecurityTool";

const pageUrl = "https://repetigo.com/pdf-tools/protect-pdf";

export const metadata: Metadata = {
  title: "Password Protect PDF Free - AES-256 | RepetiGo",
  description: "Password protect PDF free - AES-256 encryption, open password + permission controls. No sign-up, browser-only - file never leaves your device. Stronger than most paid tools.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Password Protect PDF Free - AES-256 | RepetiGo",
    description: "Password protect PDF free - AES-256 encryption, open password + permission controls. No sign-up, browser-only - file never leaves your device. Stronger than most paid tools.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Password Protect PDF Free - AES-256 | RepetiGo",
    description: "AES-256 encryption, open password + permission controls. No sign-up, browser-only.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Password Protect PDF Free. AES-256 Encryption. Browser-Only.
RepetiGo's free password protect PDF tool applies AES-256 encryption - the strongest available standard for PDF password protection - directly in your browser. No server upload. No Adobe Acrobat subscription.
Set an open password to restrict who can open the document. Add permission controls to prevent printing, copying, or editing. Both layers can be applied together in one step.
✓ AES-256 Encryption - Stronger Than Most Paid Tools  ✓ Open Password + Permission Controls  ✓ No Adobe Required  ✓ Browser-Only - File Never Uploaded

➜  [ Protect Your PDF Now - Free, No Sign-Up → repetigo.com/tools/pdf/protect-pdf/ ]

H2: What Does Protecting a PDF Do?
Protecting a PDF adds a password that must be entered before the document can be opened - and optionally restricts what the person who opens it can do with it. Without the correct password, the PDF cannot be read by anyone.
PDF protection uses PDF encryption - the document's content is mathematically scrambled so that it is unreadable without the decryption key. RepetiGo uses AES-256 (Advanced Encryption Standard, 256-bit) - the same standard used by banks and government systems, and stronger than the AES-128 used by many older or cheaper PDF tools.

H2: Two Protection Layers - Open Password and Permission Controls.
H3: Open Password (Encryption)
The open password encrypts the document. Anyone who tries to open the PDF without the correct password sees an empty document or a prompt for a password. The password must be at least 4 characters. Use a strong password for sensitive documents - longer and mixed with numbers and symbols.
H3: Permission Controls
Once the document is unlocked with the open password, permission controls restrict what the reader can do:
•  Allow Printing: if unchecked, the reader cannot print the document even after opening it
•  Allow Copying: if unchecked, the reader cannot copy or extract text from the document
•  Allow Editing: if unchecked, the reader cannot modify the document using a PDF editor
You can set an open password with no permission restrictions (open and use freely), permission restrictions with no open password (anyone can open, but cannot copy/edit/print), or both layers together (most secure).

H2: How to Password Protect a PDF in 3 Steps.
H3: Step 1 - Upload Your PDF
Click Upload or drag your PDF into the tool. The PDF does not need to be encrypted already - you can protect any unprotected PDF.
H3: Step 2 - Set Your Password and Permissions
Enter your open password (required, minimum 4 characters). Optionally enter a separate owner password for additional control. Set your permission preferences: Allow printing, Allow copying, Allow editing - toggle each on or off.
H3: Step 3 - Download Your Protected PDF
Click Protect PDF. The AES-256 encryption is applied in your browser. Download the protected PDF. The file is processed entirely in your browser - nothing is uploaded to any server.

H2: What Encryption Standard Does RepetiGo Use?
RepetiGo uses AES-256 encryption - Advanced Encryption Standard with a 256-bit key. This is:
•  Stronger than AES-128, which is what many older PDF tools and PDF 1.6 standard tools use
•  The same standard used by banks, government systems, and enterprise security software worldwide
•  Compliant with current PDF encryption standards (PDF 2.0 / PDF 1.7)
•  Recognised under India's IT Act 2000 as an acceptable encryption mechanism for electronic documents
🔒  AES-256 means an attacker would need to try 2²⁵⁶ possible keys to break the encryption by brute force - a number larger than the estimated atoms in the observable universe. The practical strength of your protection depends most on the strength of your password choice.

H2: Protect PDF Without Adobe Acrobat.
Adobe Acrobat Pro can password protect PDFs - but requires a paid subscription. RepetiGo lets you protect a PDF without Adobe for free, with stronger encryption (AES-256 vs Acrobat's default AES-128 in some versions), and without uploading your document to any server.

Feature
RepetiGo
Adobe Acrobat Pro
Smallpdf / iLovePDF
Cost
Free
₹1,500-₹3,500/month
Free (limited) or paid
Encryption standard
AES-256
AES-128 or AES-256 (version-dependent)
Varies
Server upload
No - browser-only
Cloud sync
Yes - server upload
File deletion
N/A - never uploaded
Cloud storage policy
Server-side deletion
Permission controls
Printing, copying, editing
Full granular controls
Limited
Works without install
Yes (browser)
No (desktop app)
Yes (browser)

H2: Protect PDF in India - When You Need It.
•  Government portal submissions: Password-protect financial statements, income certificates, and legal affidavits before submitting to portals that handle sensitive personal data
•  Academic documents: Mark sheets, degree certificates, and recommendation letters sent to institutions - protect them from modification during transit
•  Legal and compliance documents: Contracts, agreements, and board resolutions circulated to multiple parties - permission controls prevent unauthorised editing
•  Business documents: Price lists, internal policies, and reports shared with external partners - prevent copying and distribution of proprietary content
⚠️  Under India's DPDP Act 2023, documents containing personal data (Aadhaar numbers, PAN, financial data) should be protected during electronic transmission. AES-256 password encryption is a recognised and practical measure for this purpose.

H2: Your Files Never Leave Your Browser.
RepetiGo's PDF tools run entirely in your browser. Your file is never uploaded to any server.

Protection Layer
What It Means in Practice
🔒 Stays in your browser
Your PDF is processed entirely within your browser tab - it never travels over any network to any server.
🔐 No server, no session
There is no server-side processing session, no isolated workspace, no upload of any kind. The tool runs using your device's own computing resources.
🚫 No account = no data
No sign-up means we hold zero personal data about you. No name, email, usage history, or file history is stored anywhere.
👁️ Content never leaves device
The processing engine runs inside your browser. No text, image, or document content is ever sent to or read by any external system.
✅ Files cleared on tab close
When you close or refresh the browser tab, all local working data is cleared. Nothing persists.

🔒  Unlike tools that upload your file to a server and promise to delete it - RepetiGo's tool never uploads it at all. Your file stays on your device throughout the entire process.
Privacy Policy → /security/ | Browser-only processing - no upload, no storage

H2: Common Questions About Password Protecting a PDF.
H3: Q1: How do I password protect a PDF for free?
Go to repetigo.com/tools/pdf/protect-pdf/, upload your PDF, enter your chosen password (minimum 4 characters), set your permission preferences (allow/block printing, copying, editing), and click Protect PDF. Download the encrypted PDF. No account, no software, browser-only processing.
H3: Q2: What encryption standard does RepetiGo use?
RepetiGo uses AES-256 - the strongest PDF encryption standard available. This is stronger than the AES-128 used by some older tools and fully compliant with current PDF encryption standards.
H3: Q3: Can I remove the password from a protected PDF later?
Yes - use RepetiGo's Unlock PDF tool at /tools/pdf/unlock-pdf/. Enter the correct open password to decrypt the PDF and download an unprotected version.
H3: Q4: What is the difference between an open password and permissions?
An open password encrypts the document - nobody can read it without the password. Permissions restrict what an authorised reader (who knows the password) can do: printing, copying text, or editing. You can use either layer independently or both together.
H3: Q5: Is my PDF safe if I protect it with a password?
AES-256 encryption is extremely strong - the security of a protected PDF depends primarily on the strength of the password you choose. Use a long password with mixed characters for sensitive documents. With RepetiGo, the protection is applied in your browser - the file is never uploaded, so there is no transmission risk during the protection process itself.

H2: More Free PDF Security Tools.
•  Unlock PDF → /tools/pdf/unlock-pdf/ - remove password from a PDF
•  Redact PDF → /tools/pdf/redact-pdf/ - permanently remove sensitive content
•  Sign PDF → /tools/pdf/sign-pdf/ - add your signature
•  All PDF Tools → /tools/pdf/

➜  [ Protect Your PDF Now - Free, AES-256 → repetigo.com/tools/pdf/protect-pdf/ ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function ProtectPdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><PdfSecurityTool slug="protect-pdf"><JsonLd /><article className="tool-seo-content" id="protect-pdf-guide"><StructuredSeoCopy content={content} /></article></PdfSecurityTool></div></DashboardShell>;
}

type SeoTableData = { headers: string[]; rows: string[][] };
const CALLOUT_EMOJI = ["💡", "📱", "🇮🇳", "🔒", "🖨️", "✅", "⚠️", "📋"];

function StructuredSeoCopy({ content: source }: { content: string }) {
  const blocks = source.replace(/(^|\n)(H[123]: [^\n]+)\n/g, "$1\n$2\n\n").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const first = lines[0];
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
        if (lines.length && lines.every((line) => line.startsWith("•") || /^\d+\.\s/.test(line))) {
          return <ul className="tool-seo-list" key={index}>{lines.map((line) => <li key={line}>{renderInlineMappedLinks(line.replace(/^•\s*|^\d+\.\s*/, ""))}</li>)}</ul>;
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
  if (lines[0] === "Protection Type" && lines[1] === "What It Does" && lines[2] === "Who Needs It" && lines[3] === "Can the Recipient Override It?") return { headers: ["Protection Type", "What It Does", "Who Needs It", "Can the Recipient Override It?"], rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Feature" && lines[1] === "RepetiGo" && lines[2] === "Adobe Acrobat Pro" && lines[3] === "Smallpdf / iLovePDF") return { headers: lines.slice(0, 4), rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Protection Layer" && lines[1] === "What It Means in Practice") return { headers: ["Protection Layer", "What It Means in Practice"], rows: chunkRows(lines.slice(2), 2) };
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
  return <a className="tool-seo-inline-cta" href={href || "#protect-pdf-guide"}>{label}{href ? <span>→</span> : null}</a>;
}

function renderTableCell(cell: string) {
  const cleaned = cell.replace(/^→\s*/, "").trim();
  const href = mapSeoRoute(cleaned);
  if (!href) return renderInlineMappedLinks(cell);
  return <a className="tool-seo-table-link" href={href}>{getRouteLabel(href)}</a>;
}

function renderInlineMappedLinks(text: string) {
  const parts = text.split(/(repetigo\.com\/(?:tools\/pdf\/[a-z-]+|pricing)\/?|\/tools\/pdf\/[a-z-]*\/?|\/tools\/pdf\/?|\/products\/printpilot\/?|\/features\/auto-delete\/?|\/security\/?|\/pricing\/?)/g);
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
    "/pdf-tools/protect-pdf": "/pdf-tools/protect-pdf",
    "/pdf-tools/unlock-pdf": "/pdf-tools/unlock-pdf",
    "/pdf-tools/sign-pdf": "/pdf-tools/sign-pdf",
    "/pdf-tools/redact-pdf": "/pdf-tools/redact-pdf",
    "/pdf-tools/edit-pdf": "/pdf-tools/edit-pdf",
    "/pdf-tools/pdf-form": "/pdf-tools/pdf-form",
    "/products/printpilot": "/print-automation",
    "/features/auto-delete": "/privacy-policy",
    "/security": "/privacy-policy",
    "/pricing": "/pricing",
  };
  if (routeMap[cleanRoute]) return routeMap[cleanRoute];
  if (/^\/tools\/pdf\//.test(cleanRoute)) return `/pdf-tools/${cleanRoute.split("/")[3]}`;
  return "";
}

function getRouteLabel(href: string) {
  const labels: Record<string, string> = {
    "/pdf-tools": "Explore All PDF Tools",
    "/pdf-tools/protect-pdf": "Open Protect PDF",
    "/pdf-tools/unlock-pdf": "Open Unlock PDF",
    "/pdf-tools/sign-pdf": "Open Sign PDF",
    "/pdf-tools/redact-pdf": "Open Redact PDF",
    "/pdf-tools/edit-pdf": "Open Edit PDF",
    "/pdf-tools/pdf-form": "Open PDF Form",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo PDF Protector", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF password protection tool - AES-256 encryption with open password and permission controls, entirely in the browser. No file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Password Protect a PDF", step: [{ "@type": "HowToStep", name: "Upload Your PDF", text: "Upload Your PDF" }, { "@type": "HowToStep", name: "Set Your Password and Permissions", text: "Set Your Password and Permissions" }, { "@type": "HowToStep", name: "Download Your Protected PDF", text: "Download Your Protected PDF" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Protect PDF", item: pageUrl }] };
  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
