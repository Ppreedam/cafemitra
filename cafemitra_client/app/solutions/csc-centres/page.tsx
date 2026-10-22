import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  FileClock,
  Lock,
  Printer,
  QrCode,
  Trash2,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";
import { BUSINESS } from "../../../lib/businessInfo";
import { LINKS, Rich, plain, type LinkKey } from "../solutionKit";

const PAGE_PATH = "/solutions/csc-centres";
const PAGE_URL = `${BUSINESS.website}${PAGE_PATH}`;

const TITLE = "RepetiGo for CSC Centres: Secure Government Document Printing India";
const DESCRIPTION =
  "RepetiGo is the CSC centre printing software India uses for secure government document printing - QR upload, AI processing, DPDP Act compliant auto-delete. Built for VLEs.";
const OG_TITLE = "CSC Centre Printing Software India | Secure Government Document Printing - RepetiGo";
const OG_DESCRIPTION =
  "QR upload. AI processing. DPDP Act compliant auto-delete. RepetiGo is the secure document printing platform built for CSC centres and VLEs across India.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    type: "website",
    url: PAGE_URL,
    siteName: "RepetiGo",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
};

const badges = ["Secure QR Upload", "AI in 30 Seconds", "Auto-Delete in 15 Min", "DPDP Act 2023 Compliant"];

const problemParagraphs = [
  `An elderly woman comes to your CSC centre in the morning. She needs her Aadhaar linked to her Jan Dhan account, her income certificate renewed for the PM Kisan scheme, and a passport-size photo printed for her ration card application. She does not have a smartphone. Her son sends the documents to your WhatsApp instead. You download the Aadhaar, crop it to the right size, adjust the brightness, print it. Then you open the income certificate, format it for A4, print that. Then you take a fresh passport photo on your phone's camera and print that separately. Three documents. Twenty minutes. The citizen leaves satisfied.`,
  `Her Aadhaar is now on your personal WhatsApp. Her income certificate is in your downloads folder. Her passport photo is in your phone's camera roll. These documents - government-issued, identity-linked, personal data under India's DPDP Act 2023 - now sit on your private device indefinitely, alongside your personal messages and family photos.`,
  `This is not a hypothetical. This is the current reality at the majority of CSC centres in India. And it is not a workflow problem - it is a compliance gap that places the legal burden directly on the VLE operating the centre. As a CSC operator, you are a data fiduciary under the DPDP Act 2023. The documents citizens bring to you are not just paper - they are personal data you are legally required to collect, use for a specific purpose, and delete when that purpose is fulfilled.`,
  `RepetiGo's CSC printing management india infrastructure ends this cycle completely. WhatsApp out. QR in. Deletion automatic. Audit trail intact. Compliance by architecture.`,
];

type Step = { title: string; body: string };

const steps: Step[] = [
  {
    title: "Step 1 - Citizen Uploads Their Document via QR Code",
    body: `A laminated QR code at your counter - one for each service window. If the citizen has a smartphone, they scan the QR code and upload directly from their gallery. If they do not, you can initiate an upload session from your counter screen and guide them through it. The [CSC Aadhaar printing software india](@qr) upload process is TLS-encrypted end-to-end - the document goes from the citizen's phone directly into the RepetiGo cloud without touching your personal phone, your WhatsApp, or your email. The document arrives in your print queue. Your phone number is never involved.`,
  },
  {
    title: "Step 2 - AI Processes the Document in 30 Seconds",
    body: `The AI pipeline runs the moment the document arrives. For an Aadhaar card: it detects the document type, sizes it automatically to 15x10 cm, removes the shadow from phone photography, and enhances the contrast for clean print output. For a PAN card: sized correctly, enhanced, print-ready. For an income certificate or government form: detected as A4, deskewed, optimised for document printing. The [CSC document management software india](@ai) handles the preparation step that used to take you 3 to 5 minutes per document - in 30 seconds, automatically, for every document type.`,
  },
  {
    title: "Step 3 - Print Queue with Full Audit Trail Entry",
    body: `The processed document appears in your [CSC printing management india](@queue) queue the moment AI completes. You see the document type, upload time, citizen queue number, and page count. You confirm and print with one tap. Simultaneously, the system creates an audit trail entry: timestamp, document type, page count, printer used, and the operator session ID. This metadata - not the document content - is retained in the secure audit log. For CSC operators who may need to demonstrate accountability to CSC Academy or MeitY oversight, this record exists and is accessible in your dashboard. The [CSC centre audit trail software india](@audit) capability protects you as the operator, not just the citizen.`,
  },
  {
    title: "Step 4 - Document Permanently Deleted After Printing",
    body: `After the print job completes, an S3 lifecycle policy permanently deletes the document from the cloud within 15 minutes. The document - the Aadhaar card, the PAN card, the income certificate - ceases to exist on any system. Not on the cloud. Not on your counter computer. Not on your phone. The audit trail retains only the metadata: the fact that a document was printed, when, and on which printer. Not what the document contained. For the purposes of the DPDP Act 2023, the data processing purpose has been fulfilled and the data has been [deleted automatically](@autodelete). For every job. Without your staff needing to remember.`,
  },
];

const documentRows: [string, string, string][] = [
  [
    "Aadhaar Card",
    "Auto-detected and sized to 15x10 cm standard. Shadow removal for phone photos. AES-256 encrypted, deleted in 15 min after printing. [How to print Aadhaar cards securely](@aadhaar)",
    "Aadhaar linking, Jan Dhan, schemes",
  ],
  ["PAN Card", "Auto-sized to PAN dimensions. AI contrast enhancement. Deleted automatically after printing.", "Bank account opening, ITR, KYC"],
  [
    "Passport-Size Photos",
    "AI detects photo format, sizes to passport/visa standards. QR upload from citizen's camera. No copies retained.",
    "Scheme applications, IDs, ration card",
  ],
  [
    "Income & Caste Certificates",
    "A4 document processing. Deskew and contrast enhancement for scanned copies. Auto-deletion after print.",
    "Educational reservations, scheme eligibility",
  ],
  [
    "Government Forms",
    "A4 processing for all standard government form formats. AI-enhanced output for clear printing. [Government form printing](@govforms)",
    "Scheme enrolment, applications",
  ],
  [
    "Land Records & Revenue Documents",
    "Multi-page document support. Each page processed individually. Batch print queue.",
    "Property registration, ROR",
  ],
  [
    "DigiLocker Documents",
    "DigiLocker CSC integration india - roadmap feature for direct pull from citizen's DigiLocker account (coming soon - see [PrintPilot](@printpilot) for updates).",
    "All DigiLocker-issued certificates",
  ],
];

const auditParagraphs = [
  `The audit trail in RepetiGo is not designed for government oversight - it is designed for you, the CSC operator. As a VLE running a Common Service Centre, you are accountable to multiple authorities: CSC Academy, your district coordinator, and under the DPDP Act 2023, to the citizens whose data you process. Disputes, complaints, and accountability questions are a reality of running a government service point.`,
  `The CSC centre audit trail software india in RepetiGo creates a tamper-proof record of every document transaction at your centre: the date and time, the document type, the page count, the printer used, and the operator session. This record is retained in the secure audit log for seven years - long enough to address any accountability question that could arise about how a citizen's document was handled.`,
  `What the audit trail does NOT retain is the document content itself. The Aadhaar number, the citizen's name, the income figure - none of this is in the audit log. Only the transaction metadata. This is precisely what the DPDP Act 2023 permits: retaining records of data processing for accountability purposes, without retaining the personal data itself beyond its stated purpose.`,
  `For CSC operators, this is the difference between being able to prove you handled a document correctly and being unable to verify anything at all. The CSC centre audit trail software india in RepetiGo gives you the first. Without it, you only have the second.`,
];

type Feature = { icon: LucideIcon; title: string; body: string; href?: LinkKey };

const features: Feature[] = [
  {
    icon: QrCode,
    title: "QR Document Upload",
    body: "Citizens upload from any phone - no WhatsApp, no personal number shared. Assisted upload mode for citizens without smartphones. TLS-encrypted.",
    href: "qr",
  },
  {
    icon: Bot,
    title: "AI Document Processing",
    body: "Aadhaar sizing, PAN card formatting, government form processing, passport photo sizing - all automatic. Every document type handled correctly in 30 seconds.",
    href: "ai",
  },
  {
    icon: Trash2,
    title: "Auto-Delete in 15 Minutes",
    body: "Every document permanently deleted after printing - S3 lifecycle enforcement. No staff action required. DPDP Act 2023 compliant by architecture.",
    href: "autodelete",
  },
  {
    icon: Printer,
    title: "Print Queue",
    body: "Real-time queue with document type identification. Multi-document batch processing for high-volume service days. One-tap confirm and print.",
    href: "queue",
  },
  {
    icon: FileClock,
    title: "Audit Trail",
    body: "7-year metadata log: timestamp, doc type, page count, printer, operator session. Tamper-proof. Accessible for accountability and oversight.",
    href: "audit",
  },
  {
    icon: Wallet,
    title: "UPI + Razorpay Billing",
    body: "CSC centre billing software india built in - collect service fees per document type, issue digital receipts, track daily revenue by service.",
    href: "payment",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    body: "Daily volume by document type, revenue per service, peak hours. Know which government services drive the most footfall at your CSC centre.",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    body: "Every government document encrypted in transit (TLS) and at rest (AES-256). No unencrypted document at any point.",
    href: "security",
  },
];

const dpdpParagraphs = [
  `Among all the businesses that handle personal documents in India, CSC centres carry the highest compliance obligation under the Digital Personal Data Protection Act 2023. The reason is the nature of the documents they process and the vulnerability of the citizens who bring them.`,
  `The DPDP Act 2023 classifies personal data by sensitivity. Aadhaar numbers, income levels, caste classifications, and government identification numbers are among the most sensitive categories of personal data in India. Every document that passes through a CSC centre is, in the DPDP Act's terms, significant personal data about citizens who often have limited ability to understand or enforce their data rights.`,
  `CSC operators are explicitly data fiduciaries under this framework. The obligations are concrete: collect only for the stated purpose, use only for that purpose, delete when the purpose is fulfilled. For a CSC centre, this means: collect the document for printing, print it, delete it. No retention. No WhatsApp copies. No download folder accumulation.`,
  `RepetiGo's CSC DPDP Act compliance india architecture fulfils these obligations structurally. The S3 lifecycle policy deletes every document within 15 minutes of printing - not because a staff member acts, but because the infrastructure enforces it. The audit trail retains only the metadata required for accountability. The document content is gone. Permanently. Every time.`,
];

const pricingParagraphs = [
  `RepetiGo is available on a monthly subscription - no annual commitment, no setup fee. The 14-day free trial gives every CSC operator full access to the complete platform: QR document upload, AI processing, auto-delete, real-time print queue, audit trail, UPI billing integration, and the analytics dashboard. No credit card required.`,
  `The trial is designed for real operational use. You can process actual citizen documents during the 14 days. Most CSC operators see the compliance difference within the first day of use - the moment they realise no government document has touched their WhatsApp since the QR code went up.`,
];

const pricingLinks: [string, LinkKey][] = [
  ["Pricing plans", "pricing"],
  ["Multi-location CSC network pricing", "contact"],
];

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "What software do CSC centres use in India?",
    a: `Most CSC centres in India currently use WhatsApp to receive government documents from citizens - a workaround that predates any purpose-built tool for CSC operations. RepetiGo is CSC centre software india designed specifically for this gap: a secure document printing platform that handles QR-based government document receipt, AI preparation in 30 seconds, automatic deletion in 15 minutes, and a 7-year audit trail for operator accountability. It covers every document type processed at a CSC centre - Aadhaar, PAN, income certificates, government forms, and passport photos - with DPDP Act 2023 compliance built into the architecture.`,
  },
  {
    q: "How do I print government documents at my CSC centre without WhatsApp?",
    a: `With RepetiGo, the workflow is: citizen scans the QR code at your counter → uploads their document from their phone → document arrives in your print queue processed and print-ready → you confirm and print → document is deleted within 15 minutes. For citizens without smartphones, you can initiate the upload session from your counter screen and guide them through using the counter device as the upload point. The entire workflow - from citizen document to printed output to permanent deletion - happens without your WhatsApp number being shared with any citizen. [Download Print Bridge](@bridge) and set up your QR code in under 10 minutes by starting your [free trial](@pricing).`,
  },
  {
    q: "Is my CSC centre DPDP Act compliant with RepetiGo?",
    a: `RepetiGo's CSC DPDP Act compliance india architecture is designed to meet the core DPDP Act 2023 requirements for document processing: purpose limitation (documents collected only for printing), data minimisation (only the document needed for the print job), and storage limitation (deleted within 15 minutes of print completion). The S3 lifecycle policy enforces deletion at the infrastructure level - it cannot be disabled by a staff member. The audit trail retains only transaction metadata - not document content - for the accountability period. For full documentation of how RepetiGo addresses the DPDP Act requirements, see the [DPDP Act 2023 compliance documentation](@compliance) and our [full security documentation](@security). We recommend consulting a legal advisor for DPDP Act obligations specific to your CSC centre.`,
  },
  {
    q: "Does RepetiGo support Aadhaar and PAN card printing at CSC centres?",
    a: `Yes. Aadhaar card printing is the most common document service at CSC centres, and RepetiGo's CSC Aadhaar printing software india handles it with specific AI configuration: the system automatically detects an Aadhaar card and sizes it to the standard 15x10 cm format, removes shadows from phone-camera photographs, and enhances contrast for clean print output. CSC PAN card printing india is also handled automatically - detected, formatted, and printed correctly without manual intervention. Both documents are permanently deleted from the cloud within 15 minutes of printing. For the complete Aadhaar printing guide, see [how to print Aadhaar cards securely](@aadhaar).`,
  },
  {
    q: "What is the audit trail feature and why does a CSC operator need it?",
    a: `The CSC centre audit trail software india creates a tamper-proof record of every document transaction at your centre: the date and time, document type, page count, printer used, and operator session ID. This record is retained securely for seven years. The audit trail does not retain document content - only the transaction metadata. For a CSC operator, this record provides accountability protection: if a question is ever raised about how a citizen's document was handled, the audit trail proves that it was processed at a specific time, printed, and then deleted. Without this, you have no way to verify what happened to any specific document. With it, you have a seven-year record.`,
  },
  {
    q: "Is there a free trial for CSC centre management software?",
    a: `Yes - 14 days free, no credit card required. Every feature is active during the trial: QR document upload, AI processing, auto-delete in 15 minutes, real-time print queue, audit trail, UPI billing, and the analytics dashboard. You can process actual citizen document jobs during the trial. To start, go to the [pricing page](@pricing) and click Start Free Trial. Setup - downloading Print Bridge and generating your counter QR code - takes under 10 minutes.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.website },
        { "@type": "ListItem", position: 2, name: "CSC Centres", item: PAGE_URL },
      ],
    },
    {
      "@type": "SoftwareApplication",
      name: "RepetiGo",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, Windows, Linux",
      description: DESCRIPTION,
      url: PAGE_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        description: "14-day free trial",
      },
    },
    {
      "@type": "HowTo",
      name: "How Government Document Printing Works at a CSC Centre with RepetiGo",
      step: steps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: plain(step.body),
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: plain(faq.a) },
      })),
    },
  ],
};

export default function CscCentresSolutionPage() {
  return (
    <main className="about-shell sol-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LandingNavbar />

      <header className="about-hero sol-hero">
        <div className="about-container">
          <nav aria-label="Breadcrumb" className="sol-breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">CSC Centres</span>
          </nav>
          <h1>CSC Centre Printing Software India - Secure Government Document Printing for Every Common Service Centre.</h1>
          <p>
            RepetiGo is CSC centre printing software India - a secure document printing platform built for the Village
            Level Entrepreneurs (VLEs) who operate Common Service Centres across India. Every day at your CSC centre,
            citizens bring their most sensitive documents: Aadhaar cards that need to be printed and linked, PAN cards
            for bank accounts, income certificates for government schemes, caste certificates for educational
            applications, and government forms for services that exist nowhere else in their village. They trust you -
            specifically you - to handle these documents correctly.
          </p>
          <p>
            RepetiGo&apos;s common service centre software india gives you the infrastructure to honour that trust.
            Documents arrive via secure QR upload - no WhatsApp number shared, no personal phone involved. AI processes
            them in 30 seconds. You print. The document is permanently deleted within 15 minutes. Every job leaves an
            audit trail entry that protects you as the operator. The government service centre software india your CSC
            counter needs was built around exactly this workflow.
          </p>
          <ul className="sol-badges">
            {badges.map((badge) => (
              <li key={badge}>
                <Check size={15} aria-hidden /> {badge}
              </li>
            ))}
          </ul>
          <div className="about-cta-actions">
            <Link href={LINKS.pricing}>
              Start Free Trial - 14 Days Free <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href={LINKS.contact}>Book a Demo</Link>
          </div>
        </div>
      </header>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>The Document Problem Every CSC Operator in India Is Responsible For.</h2>
          <div className="about-copy">
            {problemParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Zap size={20} aria-hidden />
            <p>
              <strong>
                Receiving government documents over WhatsApp is the single largest compliance risk for CSC operators in
                India.
              </strong>{" "}
              See why it matters. <Link href={LINKS.whatsapp}>Why WhatsApp is not safe for government documents</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>How RepetiGo&apos;s CSC Centre Printing Software Works.</h2>
          <div className="about-copy">
            <p>
              Every document that passes through a RepetiGo-enabled CSC centre follows the same four-step workflow -
              from citizen upload to permanent deletion, automatically, with a full audit record at every step.
            </p>
          </div>
          <ol className="sol-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="sol-step-num" aria-hidden>
                  {index + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>
                    <Rich text={step.body} />
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <aside className="sol-callout">
            <Check size={20} aria-hidden />
            <p>
              <strong>From QR upload to printed output: under 90 seconds.</strong> From upload to permanent deletion:
              under 20 minutes. The audit trail entry persists. The document content does not.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>Every Government Document Service - Handled Correctly.</h2>
          <div className="about-copy">
            <p>
              CSC centres handle a wider range of government documents than any other document service business in
              India. RepetiGo&apos;s CSC centre software india is designed to handle all of them - not just the most
              common ones:
            </p>
          </div>
          <div className="sol-table-wrap">
            <table className="sol-table">
              <caption className="sol-sr-only">Government document types and how RepetiGo handles each one</caption>
              <thead>
                <tr>
                  <th scope="col">Document Type</th>
                  <th scope="col">How RepetiGo Handles It</th>
                  <th scope="col">Related Service</th>
                </tr>
              </thead>
              <tbody>
                {documentRows.map(([type, handling, service]) => (
                  <tr key={type}>
                    <th scope="row">{type}</th>
                    <td>
                      <Rich text={handling} />
                    </td>
                    <td>{service}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>Audit Trail and Accountability - The CSC Operator&apos;s Protection.</h2>
          <div className="about-copy">
            {auditParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <FileClock size={20} aria-hidden />
            <p>
              <strong>
                Full audit trail documentation and access are in your RepetiGo operator dashboard. Audit records are
                available for download for compliance and accountability purposes.
              </strong>{" "}
              <Link href={LINKS.audit}>Audit trail and record-keeping</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-heading">
            <h2>Features Built for Common Service Centre Operations in India.</h2>
            <p>
              Every feature in RepetiGo&apos;s CSC centre software india was designed around the specific operational
              demands of a government document service centre - not adapted from tools built for offices or commercial
              print shops:
            </p>
          </div>
          <div className="sol-feature-grid">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title}>
                  <span>
                    <Icon size={22} aria-hidden />
                  </span>
                  <h3>{feature.href ? <Link href={LINKS[feature.href]}>{feature.title}</Link> : feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>The DPDP Act 2023 - Why CSC Centres Have the Highest Compliance Obligation.</h2>
          <div className="about-copy">
            {dpdpParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Lock size={20} aria-hidden />
            <p>
              <Link href={LINKS.compliance}>DPDP Act 2023 compliance documentation</Link> is available on our privacy
              page. We recommend consulting a legal advisor for DPDP Act 2023 obligations specific to your CSC centre
              operations.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>Getting Started - Free Trial and Pricing.</h2>
          <div className="about-copy">
            {pricingParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <ul className="sol-link-list">
            {pricingLinks.map(([label, key]) => (
              <li key={label}>
                <Link href={LINKS[key]}>{label}</Link>
                <ArrowRight size={16} aria-hidden />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-section sol-alt" id="faq">
        <div className="about-container about-narrow">
          <h2>Frequently Asked Questions - CSC Centre Printing Software India.</h2>
          <div className="sol-faq">
            {faqs.map((faq) => (
              <article key={faq.q}>
                <h3>{faq.q}</h3>
                <p>
                  <Rich text={faq.a} />
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-final-cta">
        <div className="about-container">
          <h2>Secure Government Document Printing - Built for Every CSC Centre and VLE in India.</h2>
          <p>
            Citizens come to your CSC centre because there is nowhere else in their village to access government
            services. They bring their Aadhaar cards, their PAN cards, their income certificates, and their government
            forms - and they trust you completely with all of it. RepetiGo&apos;s CSC centre printing software india is
            built to honour that trust automatically: every document uploaded securely, processed precisely, printed
            correctly, and deleted within 15 minutes. The audit trail protects you. The auto-delete protects them. The
            DPDP Act 2023 compliance is built in.
          </p>
          <p>
            14-day free trial. No credit card. Your existing printer. Under 10 minutes to your first secure government
            document print job.
          </p>
          <div className="about-cta-actions">
            <Link href={LINKS.pricing}>
              Start Free Trial - 14 Days Free <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href={LINKS.contact}>Book a Demo</Link>
            <Link href={LINKS.printpilot}>Explore PrintPilot - See the Full Platform</Link>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
