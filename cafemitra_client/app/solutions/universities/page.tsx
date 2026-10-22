import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  FileClock,
  Lock,
  Plug,
  Printer,
  QrCode,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";
import { BUSINESS } from "../../../lib/businessInfo";
import { LINKS, Rich, plain, type LinkKey } from "../solutionKit";

const PAGE_PATH = "/solutions/universities";
const PAGE_URL = `${BUSINESS.website}${PAGE_PATH}`;
const DOCS_URL = "https://docs.repetigo.com";

const TITLE = "RepetiGo: University Printing Management India - Secure, Scalable";
const DESCRIPTION =
  "RepetiGo: university printing management India. Multi-department QR, ERP integration, AI formatting, auto-delete. Secure document printing at examination scale across campuses.";
const OG_TITLE = "University Printing Management India | Multi-Department Document System - RepetiGo";
const OG_DESCRIPTION =
  "Multi-department QR upload, ERP integration, AI formatting, auto-delete. RepetiGo handles university document printing at examination scale across departments and campuses.";

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

const badges = ["Multi-Department QR Upload", "ERP Integration", "AI in 30 Seconds", "DPDP Act 2023 Compliant"];

const problemParagraphs = [
  `A central university in Rajasthan with 32 affiliated colleges and 45,000 enrolled students is coordinating its semester-end examinations. The examination controller's office is managing question paper printing from 120 faculty across 8 academic schools - each paper requiring confidential handling before the examination date. Hall tickets for all 45,000 students are being generated from the university ERP and need to be printed and distributed to the affiliated college examination centres. Research scholars in the doctoral programme need thesis copies printed for their viva voce committees. Faculty members are submitting conference papers and research documents to the faculty print counter. The university's IT department has been asked for a solution that integrates with the existing student information system and does not involve WhatsApp.`,
  `This is university document printing in India. The scale is not the only complexity - it is the coordination of multiple simultaneous workflows, across multiple departments, with different confidentiality requirements, different document formats, and different user types (students, faculty, research scholars, administrative staff), all running through the same document printing infrastructure.`,
  `RepetiGo's university document workflow india handles this coordination centrally - one platform, multiple QR counters, department-labelled queues, ERP integration for batch document generation, and a single dashboard for the examination controller and IT administrator to monitor everything in real time.`,
];

type Step = { title: string; body: string };

const steps: Step[] = [
  {
    title: "Step 1 - Secure Upload from Any Department, Any Campus",
    body: `Each department, counter, and campus location has its own [QR code](@qr). The examination department uses the examination counter QR for question paper uploads and hall ticket batch submissions. The student services counter uses its own QR for individual student document requests. The faculty print counter has a separate QR for research and administrative documents. All of these upload channels are TLS-encrypted. Documents from every source arrive in the correct departmental queue without routing decisions required from any staff member. For multi-campus universities, each campus operates its own counter set within the same unified management dashboard.`,
  },
  {
    title: "Step 2 - AI Processing for Every University Document Format",
    body: `The [AI pipeline](@ai) processes each document individually regardless of its source format - ERP export, PDF, Word document, image file, scanned paper. For university exam printing software india: question papers are detected as A4 landscape or portrait, formatted correctly, with no content exposed to any system outside the secure print queue. For hall tickets: student information is formatted to the standard ticket layout. For research documents and theses: multi-page PDF processing with page order verification. For faculty conference papers: A4 layout preserved, references and footnotes maintained. Every document in every format receives the same 30-second AI processing.`,
  },
  {
    title: "Step 3 - Centralised Queue with Department-Level Control",
    body: `The [multi-department document printing india](@queue) queue organises all jobs by department, document type, and upload time. The examination controller sees only examination-related jobs in the examination queue. The department head sees only their department's jobs. The central IT administrator sees all queues across all departments and campuses in the management dashboard. Batch approve mode for high-volume runs - such as the complete hall ticket batch for a semester examination - allows the examination controller to approve the full batch with a single authorisation, after which the counter runs continuously without individual job confirmation.`,
  },
  {
    title: "Step 4 - University-Wide Automatic Deletion",
    body: `After each document prints - whether it is a single thesis chapter or the last hall ticket in a 45,000-document batch - an S3 lifecycle policy permanently deletes the document within 15 minutes. This applies to every document across every department and campus without exception. The [university document workflow india deletion](@autodelete) is infrastructure behaviour, not a policy. No question paper remains accessible after printing. No student's hall ticket data is retained. The audit trail records the transaction metadata for institutional accountability - the fact that a document was printed, when, and on which counter. Not the document content.`,
  },
];

const departmentRows: [string, string, string][] = [
  [
    "Examination Department",
    "Question papers (confidential), hall tickets, attendance sheets, result marksheets",
    "High volume - concentrated at exam cycles (2–3 times/year)",
  ],
  [
    "Research & Doctoral Office",
    "Thesis copies for viva, research paper prints, PhD registration documents",
    "Ongoing - individual scholars on demand",
  ],
  [
    "Student Services Counter",
    "Aadhaar verification, bonafide certificates, fee receipts, admit cards",
    "Daily - individual student requests throughout the year",
  ],
  [
    "Faculty Print Counter",
    "Research papers, conference presentations, grant applications, lecture notes",
    "Daily - individual faculty requests, peaks before conferences",
  ],
  [
    "Administrative Offices",
    "Affiliation documents, government correspondence, UGC/AICTE submissions",
    "Regular - administrative document cycle",
  ],
  [
    "Affiliated Colleges (Coordination)",
    "Hall ticket batch distribution, mark entry forms, result compilation documents",
    "Exam cycle - coordinated from the university examination department",
  ],
];

const erpParagraphs = [
  `Most Indian universities operate student information systems, academic ERP platforms, or custom university management systems - whether developed in-house, built on SAP, Oracle, or open-source frameworks. The examination department generates hall tickets from this system. The student services office pulls bonafide certificates from the student database. The accounts department generates fee receipts from the financial module.`,
  `RepetiGo's university ERP print integration india capability connects these existing systems to the secure print workflow via a REST API. The university ERP generates the document batch - hall tickets, grade cards, certificates - and pushes them to the RepetiGo print queue via API, without any manual upload step. The examination counter receives the batch, the AI processes each document, and the queue runs. The ERP knows when each document has been confirmed for printing via webhook notification.`,
];

const erpSpecs = [
  `**API documentation:** [docs.repetigo.com/reference/](${DOCS_URL}/reference/) - REST API versioned at /v1/, full OpenAPI 3.0 specification`,
  `**Supported integration methods:** REST API, webhooks, OAuth2 authentication, batch document push from ERP`,
  `**SDK availability:** Node.js and Python SDK libraries at [docs.repetigo.com/sdks/](${DOCS_URL}/sdks/)`,
];

const erpClosing = `For universities where the IT department needs to evaluate the API before institutional adoption, the full API sandbox is available under the free trial. Technical integration queries can be directed to [our team](@contact) for a solution architecture discussion.`;

type Feature = { icon: LucideIcon; title: string; body: string; href?: LinkKey };

const features: Feature[] = [
  {
    icon: QrCode,
    title: "Multi-Counter QR Upload",
    body: "Department-specific QR codes. Student counter, examination counter, faculty counter, admin office - all separate queues, one dashboard.",
    href: "qr",
  },
  {
    icon: Bot,
    title: "AI Document Processing",
    body: "Processes every university document format: hall ticket templates, thesis PDFs, A4 research papers, certificate layouts, question papers. 30 seconds per document.",
    href: "ai",
  },
  {
    icon: Trash2,
    title: "Auto-Delete in 15 Minutes",
    body: "University-wide S3 lifecycle deletion - applies to batch jobs and individual documents equally across all departments and campuses.",
    href: "autodelete",
  },
  {
    icon: Printer,
    title: "High-Volume Batch Queue",
    body: "Tens-of-thousands batch processing with auto-confirm mode for examination runs. Department-labelled queues. Examination controller authorisation workflow.",
    href: "queue",
  },
  {
    icon: Plug,
    title: "REST API + ERP Integration",
    body: "Full REST API for ERP-to-print-queue integration. Webhooks for print completion events. OAuth2 auth. OpenAPI 3.0 documentation at docs.repetigo.com.",
  },
  {
    icon: FileClock,
    title: "Audit Trail",
    body: "7-year tamper-proof metadata log across all departments. Useful for UGC/NAAC accreditation documentation and institutional accountability.",
    href: "audit",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    body: "All student and faculty documents encrypted in transit (TLS) and at rest (AES-256). Question papers stored securely in the queue until printing.",
    href: "security",
  },
  {
    icon: BarChart3,
    title: "University-Wide Analytics",
    body: "Document volume by department, by document type, by campus. Peak usage tracking for examination seasons. Printer utilisation across counters.",
  },
];

const dpdpParagraphs = [
  `India's Digital Personal Data Protection Act 2023 applies to universities as significant data fiduciaries - organisations that process large volumes of personal data of multiple individuals. A university that generates and prints hall tickets for 45,000 students, processes research scholar thesis documents, and handles faculty personal data across multiple departments is explicitly in this category.`,
  `The DPDP Act 2023 requirements for universities are the same as for any data fiduciary: collect personal data only for a stated purpose, use it only for that purpose, and delete it when the purpose is fulfilled. For document printing, this means: generate the hall ticket for printing, print it, and delete it. Generate the thesis copy for the viva, print it, and delete it. The data lifecycle must end when the printing purpose ends.`,
  `RepetiGo's university document software india enforces this lifecycle at the infrastructure level. The S3 lifecycle policy deletes every document within 15 minutes of printing - regardless of document type, regardless of department, regardless of volume. The audit trail retains only metadata - not document content - for the institutional record period. For NAAC accreditation cycles that now include data governance criteria, this architecture provides a demonstrable, auditable answer.`,
];

const pricingParagraphs = [
  `RepetiGo is available on a monthly subscription. The 14-day free trial provides full access to every feature: multi-counter QR upload, AI processing, auto-delete, batch queue with auto-confirm mode, REST API access, audit trail, and analytics. No credit card required.`,
  `University IT departments can evaluate the full API during the trial period - the sandbox environment is identical to production. Examination departments can run a pilot examination document batch to validate the workflow before institutional adoption.`,
];

const pricingLinks: [string, LinkKey][] = [
  ["Pricing plans", "pricing"],
  ["University and enterprise pricing - multi-campus, API integration, ERP consultation", "contact"],
];

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "How do universities manage document printing in India?",
    a: `How universities manage document printing india currently follows a fragmented model: ERP exports documents, staff download them, format them manually, send batches over WhatsApp or email to the printing department, which prints and distributes. This model fails at university examination scale - 45,000 hall tickets, 120 question papers from different faculty, research scholar documents - because the bottleneck is always the manual coordination and formatting step. RepetiGo's university printing management india replaces this with ERP-to-print-queue API integration, department-specific QR counters for non-ERP uploads, AI formatting for every document type, and automatic deletion for DPDP Act 2023 compliance.`,
  },
  {
    q: "Can RepetiGo integrate with a university's ERP system?",
    a: `Yes. RepetiGo's university ERP print integration india works via a REST API at api.repetigo.com, versioned at /v1/, with full OpenAPI 3.0 documentation at [docs.repetigo.com/reference/](${DOCS_URL}/reference/). The university ERP generates documents - hall tickets, grade cards, certificates - and pushes the batch to the RepetiGo print queue via API call. Webhook notifications confirm when each document has been printed. OAuth2 authentication handles ERP-level authorisation. SDK libraries for Node.js and Python are available at [docs.repetigo.com/sdks/](${DOCS_URL}/sdks/). The full API sandbox is available during the free trial for IT department evaluation.`,
  },
  {
    q: "How does RepetiGo handle examination printing for tens of thousands of students?",
    a: `The examination printing workflow at university scale uses the batch queue with auto-confirm mode. The examination department either uploads the hall ticket batch via QR or pushes it from the ERP via API. The examination controller reviews and authorises the batch. Auto-confirm mode then runs the queue continuously - the AI processes each document in 30 seconds, and the counter prints in sequence without individual job confirmation for each of the 45,000 documents. The university exam printing software india queue shows the department-wise progress in real time. Each document is deleted within 15 minutes of printing. The batch completion is confirmed in the management dashboard with the document count, completion time, and printer utilisation statistics.`,
  },
  {
    q: "Does RepetiGo support multi-campus university operations?",
    a: `Yes. Multi-campus operations are supported through campus-specific counter configurations within the same RepetiGo management account. Each campus has its own set of QR counters - examination, student services, faculty, administrative - and its own print queues. The central IT administrator and examination controller see all campuses in a unified dashboard, with campus-level filtering for volume, document type, and operational status. For universities that need to coordinate print jobs across campuses - such as sending examination materials from the central campus to affiliated college print centres - the API allows programmatic job routing between campus queues.`,
  },
  {
    q: "Is there a free trial for university document management software?",
    a: `Yes - 14 days free, no credit card required. The trial includes full access to all features: multi-counter QR upload, AI processing, auto-delete, batch queue with auto-confirm mode, REST API access (including the full sandbox environment for ERP integration testing), audit trail, and analytics dashboard. Universities can run a pilot examination document batch - a single department's worth of hall tickets, for example - during the trial to validate the workflow before institutional rollout. Enterprise pricing for multi-campus deployments and ERP integration projects is available by [contacting our team](@contact).`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.website },
        { "@type": "ListItem", position: 2, name: "Universities", item: PAGE_URL },
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
      name: "How University Document Printing Works with RepetiGo",
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

export default function UniversitiesSolutionPage() {
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
            <span aria-current="page">Universities</span>
          </nav>
          <h1>University Printing Management India - Secure, Multi-Department Document Printing at University Scale.</h1>
          <p>
            RepetiGo is university printing management india - a secure document printing platform designed for the
            scale, complexity, and compliance requirements of Indian universities. Where a college handles thousands of
            documents per exam cycle, a university handles tens of thousands: hall tickets for 45,000 enrolled students,
            question papers from 120 faculty across 8 schools, thesis copies for research scholars, migration
            certificates for graduating batches, and daily document requests from administrative departments across
            multiple campuses.
          </p>
          <p>
            RepetiGo&apos;s university document software india addresses this at the infrastructure level - not as a
            feature added to general print management software, but as a purpose-built university print management
            system india with multi-department QR upload, AI formatting for every document type, a centralised queue
            with department-level controls, ERP integration via REST API, and automatic deletion within 15 minutes of
            printing. Across every department. Across every campus.
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
            <Link href={LINKS.contact}>Book a Demo - Enterprise and University Enquiries</Link>
          </div>
        </div>
      </header>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>Why University Document Printing Is a Different Problem.</h2>
          <div className="about-copy">
            {problemParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <BarChart3 size={20} aria-hidden />
            <p>
              <strong>RepetiGo scales to tens of thousands of documents per examination cycle.</strong> Each document
              AI-formatted, auto-deleted within 15 minutes of printing, with a full audit trail entry for institutional
              accountability.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>How RepetiGo&apos;s University Print Management System Works.</h2>
          <div className="about-copy">
            <p>
              The same four-step workflow scales from a single student&apos;s document to a 45,000-document examination
              batch - automatically, without additional configuration.
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
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>Multi-Department Document Printing - Coordinated at University Scale.</h2>
          <div className="about-copy">
            <p>
              A university&apos;s document printing requirements come from fundamentally different sources with
              different workflows, different document types, and different confidentiality levels. RepetiGo&apos;s
              university print management system india handles all of them through the same platform infrastructure with
              department-level separation:
            </p>
          </div>
          <div className="sol-table-wrap">
            <table className="sol-table">
              <caption className="sol-sr-only">University departments, their primary documents and print volumes</caption>
              <thead>
                <tr>
                  <th scope="col">Department / User Type</th>
                  <th scope="col">Primary Documents</th>
                  <th scope="col">Volume &amp; Frequency</th>
                </tr>
              </thead>
              <tbody>
                {departmentRows.map(([dept, docs, volume]) => (
                  <tr key={dept}>
                    <th scope="row">{dept}</th>
                    <td>{docs}</td>
                    <td>{volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>ERP and System Integration - For Universities with Existing IT Infrastructure.</h2>
          <div className="about-copy">
            {erpParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {erpSpecs.map((p) => (
              <p key={p}>
                <Rich text={p} />
              </p>
            ))}
            <p>
              <Rich text={erpClosing} />
            </p>
          </div>
          <aside className="sol-callout">
            <Plug size={20} aria-hidden />
            <p>
              <strong>
                The university ERP print integration india API removes the manual upload step entirely from examination
                department workflows.
              </strong>{" "}
              Hall tickets are generated in the ERP and pushed directly to the print queue via API - no file download,
              no WhatsApp, no email attachment.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-heading">
            <h2>Features Built for University Document Management in India.</h2>
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
          <h2>DPDP Act 2023 - University-Wide Compliance for Student and Faculty Data.</h2>
          <div className="about-copy">
            {dpdpParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Lock size={20} aria-hidden />
            <p>
              <Link href={LINKS.compliance}>Full DPDP compliance documentation</Link> is available on our privacy page.
              Consult a legal advisor for DPDP Act 2023 obligations specific to your university.
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
          <h2>Frequently Asked Questions - University Printing Management India.</h2>
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
          <h2>Secure Document Printing at University Scale - Built for Indian Universities.</h2>
          <p>
            From the examination controller printing hall tickets for 45,000 students to a research scholar submitting a
            thesis chapter at the faculty counter, RepetiGo&apos;s university printing management india handles every
            university document printing scenario in one platform - securely, at scale, with ERP integration, and with
            every document permanently deleted within 15 minutes of printing. No WhatsApp. No manual formatting. No
            student or faculty data retained beyond its printing purpose.
          </p>
          <p>14-day free trial. Full API sandbox for IT evaluation. Multi-campus support. No credit card required.</p>
          <div className="about-cta-actions">
            <Link href={LINKS.pricing}>
              Start Free Trial - 14 Days Free <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href={LINKS.contact}>Book a Demo - University and Enterprise Enquiries</Link>
            <a href={DOCS_URL}>API Documentation</a>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
