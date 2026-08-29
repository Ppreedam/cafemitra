import type { Metadata } from "next";
import { DashboardShell } from "../../DashboardShell";
import PdfSecurityTool from "../PdfSecurityTool";

const pageUrl = "https://repetigo.com/pdf-tools/sign-pdf";

export const metadata: Metadata = {
  title: "Sign PDF Online Free - Draw, Type or Upload | RepetiGo",
  description: "Sign PDF online free - draw your signature, type it, or upload a photo. Apply to one page or all pages. No Adobe. No sign-up. Browser-only - files never uploaded.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Sign PDF Online Free - Draw, Type or Upload | RepetiGo",
    description: "Sign PDF online free - draw your signature, type it, or upload a photo. Apply to one page or all pages. No Adobe. No sign-up. Browser-only - files never uploaded.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign PDF Online Free - RepetiGo",
    description: "Draw, type, or upload your signature - apply it to any PDF for free. No Adobe, no sign-up, browser-only.",
  },
  robots: { index: true, follow: true },
};

const content = String.raw`H1: Sign PDF Online Free. Draw, Type, or Upload Your Signature. No Adobe.
RepetiGo's free sign PDF online tool lets you add your signature to any PDF document in seconds - without installing Adobe Acrobat, without creating an account, and without uploading anything to a server.
Choose how you want to sign: type your name in a signature font, draw your signature using your mouse or finger, or upload a photo of your actual handwritten signature. Apply it to one page or every page. Download the signed PDF.
✓ Three Signature Methods  ✓ Apply to Any or All Pages  ✓ No Adobe Required  ✓ No Sign-Up  ✓ Browser-Only - Never Uploaded

➜  [ Sign Your PDF Now - Free, No Sign-Up → repetigo.com/tools/pdf/sign-pdf/ ]

H2: What Is an Electronic Signature on a PDF?
An electronic signature on a PDF is a visual mark - your name, initials, or a drawn or uploaded image of your handwriting - placed on the page to indicate agreement, approval, or authorisation.
This is different from a digital signature, which is a cryptographic certificate issued by a Certificate Authority that mathematically proves the document was signed by a specific person and has not been modified since signing. Cryptographic digital signatures are required for government e-filings, court submissions, and regulated financial instruments.
For the vast majority of everyday professional and personal documents - employment contracts, NDAs, rental agreements, offer letters, vendor agreements, consent forms - an electronic visual signature is accepted. Legal enforceability depends on your jurisdiction and the specific document type; for documents where legal certainty is critical, consult a legal professional.
⚠️  RepetiGo's Sign PDF tool adds a visual signature stamp to your PDF. It is not a PKI-based cryptographic digital signature. For Aadhaar-based eSign (legally binding under the IT Act 2000), see RepetiGo's eSign product - coming soon.

H2: Three Ways to Sign a PDF with RepetiGo.
H3: Option 1 - Type Your Signature
Type your name and RepetiGo renders it in a signature-style italic font (HelveticaOblique). Clean, professional, and consistent across documents. Choose your font size (12-72px) and position on the page. This option works best when you need a consistent signature across multiple documents.
H3: Option 2 - Draw Your Signature
Use your mouse on a laptop or your finger on a touchscreen to draw your signature in the signature pad. Your drawn signature is captured as a PNG image and placed on the PDF exactly as drawn. This option feels closest to a physical pen signature.
H3: Option 3 - Upload a Signature Image
Upload a PNG or JPG photo of your existing handwritten signature. The tool places it on the PDF at your chosen position and size. For the best result, photograph your signature on white paper in good lighting - this gives the cleanest image for overlay on the PDF.

H2: How to Sign a PDF in 3 Steps.
H3: Step 1 - Upload Your PDF
Click Upload or drag your PDF into the tool. All pages are rendered as thumbnails. Select which pages will receive your signature - any combination, or all pages at once.
H3: Step 2 - Choose Your Signature Method and Position
Select Type, Draw, or Upload. Set the signature position using the From-left and From-top percentage sliders - a live preview overlay shows exactly where the signature will land on the page. Adjust the size (12-72px) until it looks right.
H3: Step 3 - Download Your Signed PDF
Click Sign PDF. The signature is applied to all selected pages. Download your signed PDF. The file is processed locally in your browser - nothing is uploaded.

H2: Which Pages Get Your Signature?
The page selector shows a thumbnail grid of every page in your PDF. Click any page to toggle whether it receives the signature. The same signature position and size applies to all selected pages.
•  Sign page 1 only - for a single-page contract or cover sheet
•  Sign the last page only - for multi-page agreements where only the final page needs signing
•  Sign every page - for multi-page documents where each page needs individual sign-off
•  Sign specific pages - select any combination by clicking the thumbnails
💡  The signature position is a percentage of the page dimensions, not a fixed pixel value. This means the same From-left/From-top settings will place the signature in the same relative position on every selected page, regardless of page size.

H2: Sign PDF Without Adobe Acrobat.
Adobe Acrobat Pro includes electronic signature tools - but it requires a paid subscription (₹1,500-₹3,500/month). Most people need to sign a PDF occasionally, not professionally, and paying a subscription for that one task is not practical.
RepetiGo lets you sign PDF without Adobe for free, in any browser, on any device:

Method
Cost
Install Required?
Works on All Devices?
Server Upload?
RepetiGo Sign PDF
Free
No (browser)
Yes - phone, tablet, laptop
No - browser only
Adobe Acrobat Pro
₹1,500-₹3,500/month
Yes (desktop app)
Desktop only
Cloud sync
Adobe Acrobat Free
Free (limited)
No (browser/app)
Limited
Yes - Adobe servers
Preview on Mac
Free (built-in)
No (Mac only)
Mac only
No
iPhone Mail / Files
Free
No (iOS only)
iPhone/iPad only
No

H2: Sign PDF in India - Common Use Cases.
Electronic signatures on PDFs are used across India for a wide range of professional and personal documents:
•  Employment documents: Offer letters, appointment letters, NDAs, and contractor agreements sent by HR teams as PDFs for candidate signature
•  Vendor and service agreements: Small business owners and freelancers signing service contracts, purchase orders, and invoice acknowledgements
•  Rental agreements: Landlords and tenants signing rental agreements drafted as PDFs before the formal stamp paper registration
•  Academic and institutional forms: College admission forms, scholarship applications, and consent letters that require a parent or guardian signature
•  Government portal submissions: Some state portal submissions require a self-attested signature on a scanned PDF - the Sign PDF tool adds it without a printer
📋  For formal government e-signatures (income tax, MCA21, EPFO, UIDAI) that legally require an Aadhaar-based DSC or USB token signature, the standard electronic stamp from this tool may not be sufficient. Check the portal's specific requirements. For Aadhaar eSign, see RepetiGo's eSign product - coming soon.

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

H2: Sign PDF for Print Shops - Built into PrintPilot.
If you run a print shop, cyber cafe, or CSC centre, you can access the sign pdf tool directly from the PrintPilot dashboard - no separate browser tab, no manual upload.
When a customer uploads a document via QR code, PrintPilot routes it through the relevant tools automatically before it reaches the print queue. You get consistent results for every customer document without running tools one file at a time.
🖨️  PrintPilot - RepetiGo's print shop software - gives you all 30 PDF tools plus QR code document upload, AI document enhancement, secure print queue, UPI payments, and auto-delete compliance built in.

➜  [ Try PrintPilot Free - Print Shop Automation for India → repetigo.com/products/printpilot/ ]

H2: Common Questions About Sign PDF Online Free.
H3: Q1: How do I sign a PDF online for free?
Go to repetigo.com/tools/pdf/sign-pdf/, upload your PDF, choose your signature method (Type, Draw, or Upload), position the signature on the selected pages, and click Sign PDF. Download your signed PDF. No account needed, no software to install, and the file is processed entirely in your browser - never uploaded to any server.
H3: Q2: Is an electronic signature on a PDF legally accepted?
Electronic visual signatures are accepted for the vast majority of everyday professional and personal documents: employment contracts, NDAs, rental agreements, vendor agreements, and general business correspondence. Legal enforceability depends on your jurisdiction and document type. For documents where legal certainty is critical - court filings, government forms, regulated financial instruments - a PKI-based digital signature certificate from a Certificate Authority may be required. Check your specific requirements.
H3: Q3: What is the difference between an electronic signature and a digital signature?
An electronic signature is a visual mark on the PDF - a typed name, a drawn signature, or an uploaded image. It shows intent to sign but provides no cryptographic proof. A digital signature uses a certificate from a Certificate Authority to mathematically prove the signer's identity and certify the document has not been changed. For Aadhaar-based eSign in India (legally binding under the IT Act 2000), see RepetiGo's eSign product - coming soon.
H3: Q4: Can I sign a PDF on my iPhone or Android phone?
Yes. The Sign PDF tool works in any mobile browser - Safari on iPhone, Chrome on Android. Upload your PDF from your Files app, draw your signature with your finger in the Draw mode, position it on the selected pages, and download. No app download required.
H3: Q5: How do I sign a PDF without printing it?
Open RepetiGo's Sign PDF tool at repetigo.com/tools/pdf/sign-pdf/, upload the PDF, add your signature electronically using Type, Draw, or Upload - and download the signed PDF. You never need to print, physically sign, and scan back. The entire process is done digitally in your browser.
H3: Q6: Is it safe to upload my documents for signing?
With RepetiGo, your file is never uploaded. The Sign PDF tool runs entirely within your browser - your PDF is processed locally on your device. No file travels over any network. No server receives your document. Nothing is stored. You can sign contracts, agreements, and legal documents without any privacy risk from the tool itself.
H3: Q7: Can I sign multiple pages at once?
Yes. The page selector lets you click individual pages to toggle them on or off. Select any combination - a single page, the last page only, or all pages. The same signature position and size applies to all selected pages simultaneously.
H3: Q8: What file format is the output?
The output is a standard PDF file. The signature is embedded directly onto the page content - it is not an annotation layer that can be removed by another PDF reader. The signed PDF can be opened in any PDF viewer on any device and the signature will appear exactly as it was placed.

H2: More Free PDF Tools from RepetiGo.
•  Protect PDF → /tools/pdf/protect-pdf/ - add a password to your signed PDF
•  Redact PDF → /tools/pdf/redact-pdf/ - permanently remove sensitive information before signing
•  Edit PDF → /tools/pdf/edit-pdf/ - add text, notes, or corrections before signing
•  Fill PDF Form → /tools/pdf/pdf-form/ - complete form fields before signing
•  All PDF Tools → /tools/pdf/ - complete free PDF tools library

➜  [ Sign Your PDF Now - Free, No Sign-Up → repetigo.com/tools/pdf/sign-pdf/ ]`;

const faqSchemaQuestions = Array.from(content.matchAll(/H3: (Q\d+: [^\n]+)\n([\s\S]*?)(?=\nH3: Q\d+:|\nH2:|$)/g)).map((match) => [match[1], match[2].trim()] as const);

export default function SignPdfPage() {
  return <DashboardShell activePath="/pdf-tools"><div className="dashboard generic-pdf-tool-page"><PdfSecurityTool slug="sign-pdf"><JsonLd /><article className="tool-seo-content" id="sign-pdf-guide"><StructuredSeoCopy content={content} /></article></PdfSecurityTool></div></DashboardShell>;
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
  if (lines[0] === "Method" && lines[1] === "How It Works" && lines[2] === "Best For" && lines[3] === "Works On") return { headers: ["Method", "How It Works", "Best For", "Works On"], rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Type" && lines[1] === "What It Is" && lines[2] === "Legal Status" && lines[3] === "When to Use") return { headers: ["Type", "What It Is", "Legal Status", "When to Use"], rows: chunkRows(lines.slice(4), 4) };
  if (lines[0] === "Method" && lines[1] === "Cost" && lines[2] === "Install Required?" && lines[3] === "Works on All Devices?" && lines[4] === "Server Upload?") return { headers: lines.slice(0, 5), rows: chunkRows(lines.slice(5), 5) };
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
  return <a className="tool-seo-inline-cta" href={href || "#sign-pdf-guide"}>{label}{href ? <span>→</span> : null}</a>;
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
    "/pdf-tools/sign-pdf": "/pdf-tools/sign-pdf",
    "/pdf-tools/pdf-form": "/pdf-tools/pdf-form",
    "/pdf-tools/protect-pdf": "/pdf-tools/protect-pdf",
    "/pdf-tools/edit-pdf": "/pdf-tools/edit-pdf",
    "/pdf-tools/compare-pdf": "/pdf-tools/compare-pdf",
    "/pdf-tools/unlock-pdf": "/pdf-tools/unlock-pdf",
    "/pdf-tools/redact-pdf": "/pdf-tools/redact-pdf",
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
    "/pdf-tools/sign-pdf": "Open Sign PDF",
    "/pdf-tools/pdf-form": "Open PDF Form",
    "/pdf-tools/protect-pdf": "Open Protect PDF",
    "/pdf-tools/edit-pdf": "Open Edit PDF",
    "/pdf-tools/compare-pdf": "Open Compare PDF",
    "/pdf-tools/unlock-pdf": "Open Unlock PDF",
    "/pdf-tools/redact-pdf": "Open Redact PDF",
    "/print-automation": "Learn About PrintPilot",
    "/privacy-policy": "Read Privacy Policy",
    "/pricing": "Start Free Trial",
  };
  return labels[href] || "Open Tool";
}

function JsonLd() {
  const softwareApplication = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "RepetiGo Sign PDF", applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, description: "Free online PDF signing tool - draw, type, or upload a signature and apply it to any or all pages, entirely in the browser. No file is ever uploaded to a server.", url: pageUrl };
  const howTo = { "@context": "https://schema.org", "@type": "HowTo", name: "How to Sign a PDF Online Free", step: [{ "@type": "HowToStep", name: "Upload PDF", text: "Upload PDF" }, { "@type": "HowToStep", name: "Choose signature method and apply", text: "Choose signature method and apply" }, { "@type": "HowToStep", name: "Download signed PDF", text: "Download signed PDF" }] };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqSchemaQuestions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://repetigo.com/" }, { "@type": "ListItem", position: 2, name: "PDF Tools", item: "https://repetigo.com/pdf-tools" }, { "@type": "ListItem", position: 3, name: "Sign PDF", item: pageUrl }] };
  return <>{[softwareApplication, howTo, faqPage, breadcrumb].map((schema) => <script key={schema["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}</>;
}
