import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Lock,
  Printer,
  QrCode,
  ShieldCheck,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";
import { BUSINESS } from "../../../lib/businessInfo";
import { LINKS, Rich, plain, type LinkKey } from "../solutionKit";

const PAGE_PATH = "/solutions/colleges";
const PAGE_URL = `${BUSINESS.website}${PAGE_PATH}`;

const TITLE = "RepetiGo for Colleges: Secure Bulk Document Printing India";
const DESCRIPTION =
  "RepetiGo: college printing software India - bulk admit cards, hall tickets, student printing. AI in 30 seconds, auto-delete. Handles thousands of documents per exam cycle.";
const OG_TITLE = "College Printing Software India | Bulk Admit Card & Document Printing - RepetiGo";
const OG_DESCRIPTION =
  "Bulk admit cards, hall tickets, student assignment printing - AI-processed, auto-deleted. RepetiGo handles thousands of college documents per exam cycle securely.";

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

const badges = ["Bulk Printing at Exam Scale", "AI in 30 Seconds", "Auto-Delete in 15 Min", "Multi-Department Queue"];

const problemParagraphs = [
  `It is the week before the semester examination at a degree college in Tamil Nadu. The examination department needs to print 2,800 hall tickets for students across 47 departments. Each department head has sent their batch of files over WhatsApp - some as PDFs, some as Word documents, some as image files photographed from the original printed roll. The examination officer downloads them one by one, checks each format, adjusts the layout, prints, and stacks by department. Three print counters are running simultaneously. Students are queued outside waiting for their hall tickets. Faculty members are calling to ask if their department batch is done.`,
  `Simultaneously, the student print counter on the ground floor is handling assignment submissions. Students arrive with their project files and theses on USB drives and phone galleries. Each needs to be printed, sometimes formatted, sometimes enlarged for poster printing. The counter staff are managing a queue that is growing faster than they can process the files.`,
  `This is the dual reality of college printing in India: bulk institutional documents that need to be produced at exam-cycle scale, and individual student documents that need to be printed on demand throughout the year. The college bulk printing software india that can handle both - without WhatsApp, without manual formatting, without accumulated student data on personal devices - has not existed in India until now.`,
  `RepetiGo's college document workflow india platform handles both workflows in the same system, with the same QR-based receipt, AI processing, and auto-delete - scaled to college volumes.`,
];

type Step = { title: string; body: string };

const steps: Step[] = [
  {
    title: "Step 1 - Any Department Uploads, Any Time, via QR",
    body: `Each print counter in the college has its own QR code - the examination counter, the student print counter, the admin office counter. Department heads upload their batch files by scanning the examination counter QR code. Individual students upload their assignments and documents at the student counter. The [college QR document upload india](@qr) process is TLS-encrypted for every upload, from every source, simultaneously. No WhatsApp chain. No USB drives. No file emailed to a shared inbox that nobody manages. Everything arrives in the correct print queue - examination jobs in the examination queue, student jobs in the student queue - automatically.`,
  },
  {
    title: "Step 2 - AI Formats Every Document Type in 30 Seconds",
    body: `The [AI pipeline](@ai) processes each document the moment it arrives. For admit card printing software india: the AI detects the hall ticket layout, verifies the A4 format, corrects any orientation issues from file conversions, and produces a clean print-ready output. For student assignments: page layout verified, margins corrected, multi-page documents properly sequenced. For Aadhaar verification prints: 15x10 cm auto-sized, shadow removed. For certificate templates: A4 verified, letterhead preserved. Whatever the source format - PDF, Word, image, scanned document - the AI produces a consistent, correct output in 30 seconds. No staff member manually opens a single file during the entire batch run.`,
  },
  {
    title: "Step 3 - Unified Queue - All Departments, One Screen",
    body: `All jobs - from all departments, from all upload sources - appear in a single unified [print queue](@queue) on the counter screen. The queue shows department label, document type, upload time, and page count for each job. Examination department batches are grouped. Individual student jobs are labelled separately. The counter staff confirm and print in sequence. For college bulk printing software india operations during peak exam periods, the queue can be set to auto-confirm for batches approved by the examination officer - removing the need for individual job-by-job confirmation during high-volume runs.`,
  },
  {
    title: "Step 4 - Automatic Deletion After Every Batch",
    body: `After each print job completes - whether it is a single student assignment or the last hall ticket in a 2,800-document batch - an S3 lifecycle policy permanently deletes the document within 15 minutes. No hall ticket remains on the system after printing. No student's assignment, no Aadhaar card, no migration certificate. The [bulk admit card printing software india](@autodelete) auto-deletion applies to every document in the batch, individually, as each one is printed. When the batch is complete, nothing remains.`,
  },
];

const admitParagraphs = [
  `Admit card printing is the single highest-pressure document printing event in a college's calendar. In the week before semester examinations, the examination department needs to produce hall tickets for every registered student - often 2,000 to 5,000 documents - in the correct format, with the correct student information, before the examination begins.`,
  `The current method at most Indian colleges is: export a batch from the ERP system, format in Excel or Word, send batches to the printing department over WhatsApp or email, print one by one, and distribute. If a file is formatted incorrectly, it goes back for correction. If a student's name is wrong, the entire batch pauses. If a printer runs out of paper at 11pm the night before exams, someone is at the counter until midnight.`,
  `RepetiGo's admit card printing software india handles the batch upload from any source - ERP export, Excel file, PDF batch - via the examination counter QR code. The AI processes each document in 30 seconds. The examination officer sees the queue in real time, approves the batch, and the counter prints in sequence. Student documents are never on a personal phone. The batch is done when the last hall ticket exits the printer. Every document is deleted 15 minutes later.`,
];

const documentRows: [string, string, string][] = [
  [
    "Admit Cards / Hall Tickets",
    "500–5,000 per exam cycle",
    "Batch upload via QR. AI formats every ticket. Auto-delete after printing. Queue shows department-wise progress.",
  ],
  [
    "Marksheets & Grade Cards",
    "500–5,000 per result cycle",
    "A4 processing. Individual student sheets queued by roll number. Each deleted 15 minutes after printing.",
  ],
  [
    "Migration Certificates",
    "Graduating batch (200–2,000)",
    "Standard A4 with letterhead preserved. Batch processing with auto-delete.",
  ],
  [
    "Student Assignments & Theses",
    "Daily counter queue (20–200/day)",
    "Student uploads via QR at student counter. AI formats page layout. Auto-delete protects student work.",
  ],
  [
    "Provisional Certificates",
    "On-demand + graduation batch",
    "A4 with college seal area preserved. Individual and batch modes.",
  ],
  [
    "Bonafide & Transfer Certificates",
    "On-demand",
    "A4 processing. Formatted and printed on request. Deleted within 15 minutes.",
  ],
  [
    "Aadhaar Verification Prints",
    "Ongoing (scholarship, schemes)",
    "15x10 cm auto-sized. Shadow removal. Deleted in 15 min. [How to print Aadhaar cards securely](@aadhaar)",
  ],
  [
    "Question Papers (Internal Exams)",
    "Per department per exam",
    "Uploaded by faculty. AI formats. Printed. Deleted - no question paper retained on system after printing.",
  ],
];

type Feature = { icon: LucideIcon; title: string; body: string; href?: LinkKey };

const features: Feature[] = [
  {
    icon: QrCode,
    title: "QR Upload - Multi-Counter",
    body: "Separate QR codes for each counter - examination, student print, admin office. All queues managed from a central dashboard.",
    href: "qr",
  },
  {
    icon: Bot,
    title: "AI Document Processing",
    body: "Handles every college document format: admit card templates, A4 documents, certificate layouts, student photos. 30 seconds per document.",
    href: "ai",
  },
  {
    icon: Trash2,
    title: "Auto-Delete in 15 Minutes",
    body: "Every document permanently deleted after printing. S3 lifecycle enforcement applies to batch jobs and individual documents equally.",
    href: "autodelete",
  },
  {
    icon: Printer,
    title: "High-Volume Print Queue",
    body: "Batch approve for exam-season runs. Department-labelled queue sections. Auto-confirm mode for bulk jobs. Real-time progress tracking.",
    href: "queue",
  },
  {
    icon: BarChart3,
    title: "College Print Analytics",
    body: "Documents printed per department, per document type, peak usage by day. Useful for planning examination season staffing and printer capacity.",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    body: "Every student document encrypted in transit (TLS) and at rest (AES-256). No unencrypted student data at any point.",
    href: "security",
  },
  {
    icon: ShieldCheck,
    title: "Print Bridge - Multi-Printer",
    body: "Routes different document types to different printers automatically. Examination counter and student counter can share or separate printer pools. Setup in under 10 minutes.",
    href: "bridge",
  },
];

const dpdpParagraphs = [
  `India's Digital Personal Data Protection Act 2023 applies directly to college document printing operations. When a college's examination department handles student admit cards - which contain student names, roll numbers, examination centre details, and in many cases Aadhaar numbers - they are processing personal data as a data fiduciary. The obligations are specific: collect for a defined purpose (printing the admit card), use for that purpose, and delete after.`,
  `When admit cards, marksheets, and student Aadhaar verification documents travel through WhatsApp to reach the printing department, they remain on personal devices after the purpose is fulfilled. This is a DPDP Act 2023 compliance failure that accumulates with every exam cycle.`,
  `RepetiGo's college document workflow india architecture addresses this structurally. Documents arrive via QR upload - no personal device involved. The S3 lifecycle policy deletes every document within 15 minutes of printing - automatically, for every job in every batch. The audit trail records the transaction metadata without retaining the document content. For colleges operating under UGC regulations, NAAC accreditation requirements, or state university guidelines that address student data privacy, RepetiGo's architecture provides a demonstrable, auditable compliance posture.`,
];

const pricingParagraphs = [
  `RepetiGo is available on a monthly subscription - no annual commitment, no setup fee. The 14-day free trial gives full access to every feature: multi-counter QR upload, AI processing, auto-delete, high-volume print queue, analytics, and multi-printer support. No credit card required.`,
  `The trial is suitable for real college operations. The examination department can run a pilot batch of admit cards during the trial period. The student print counter can operate on QR upload simultaneously. Most colleges see the operational difference within the first exam cycle run.`,
];

const pricingLinks: [string, LinkKey][] = [
  ["Pricing plans", "pricing"],
  ["Multi-college and university-level enquiries", "contact"],
];

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "How do colleges manage bulk document printing in India?",
    a: `How colleges manage bulk printing india currently varies, but the dominant approach is: ERP export to Excel or PDF, WhatsApp to the printing department, manual formatting, printing in batches, physical distribution. This works at small scale but breaks under exam-cycle volume - 2,000 to 5,000 admit cards for a single examination cycle - because the bottleneck is always the formatting and file management step, not the actual printing speed. RepetiGo's college bulk printing software india removes the bottleneck: batch files are uploaded via QR, AI formats every document in 30 seconds, the queue processes them in sequence, and every document is deleted after printing.`,
  },
  {
    q: "What is the best college document printing system in India?",
    a: `The best college document printing system india is one that handles batch scale (thousands of documents per exam cycle), accepts uploads from multiple departments simultaneously, formats every document type automatically, and ensures student data is not retained on any device after printing. RepetiGo meets all four requirements: the batch queue scales to exam-cycle volumes, multi-counter QR upload handles simultaneous department submissions, AI formatting covers every college document type, and the S3 lifecycle policy auto-deletes within 15 minutes. It also provides a print analytics dashboard that helps examination departments plan staffing for high-volume periods.`,
  },
  {
    q: "Can RepetiGo print thousands of admit cards in a single exam cycle?",
    a: `Yes. The admit card printing software india batch capability handles exam-cycle volumes - 2,000 to 5,000 hall tickets in a single run - through the examination counter queue. The examination officer uploads the batch via QR, the AI processes each admit card individually, and the queue displays them in sequence for the counter staff to confirm and print. For fully approved batches, auto-confirm mode allows continuous printing without individual job confirmation. The batch admit card run is tracked in the analytics dashboard by department, by document count, and by time. Every hall ticket is deleted within 15 minutes of printing.`,
  },
  {
    q: "How does RepetiGo handle student assignment printing at colleges?",
    a: `Student assignment printing management india at colleges is a different workflow from institutional batch printing - individual students arrive at the print counter with their assignment files throughout the day. With RepetiGo, students scan the student counter QR code and upload their assignment or project file from their phone. The AI processes the file - checks page layout, corrects orientation, verifies margins - and the counter staff confirm and print with one tap. The assignment file is deleted from the cloud within 15 minutes. For colleges that run a paid student print service, the UPI billing feature collects the print fee directly in the workflow with a digital receipt.`,
  },
  {
    q: "Is student data protected under the DPDP Act at college print counters?",
    a: `Yes. Under India's DPDP Act 2023, student personal data processed at a college's print counter - admit cards, Aadhaar verification prints, marksheets, assignment documents - is subject to the Act's storage limitation principle: retain only as long as needed, delete when the purpose is fulfilled. RepetiGo's auto-delete system fulfils this obligation automatically: every document is deleted within 15 minutes of print completion, at the infrastructure level, for every document, without staff action. No student document is retained on any personal device, any counter computer, or any cloud storage after printing. For full documentation, see the [DPDP Act 2023 compliance documentation](@compliance).`,
  },
  {
    q: "Is there a free trial for college printing software?",
    a: `Yes - 14 days free, no credit card required. Every feature is available during the trial: multi-counter QR upload, AI processing, auto-delete, the batch print queue with auto-confirm mode, analytics, and multi-printer routing. The trial supports real college operations - the examination department can run a pilot admit card batch, and the student counter can operate simultaneously. Setup takes under 10 minutes. Start on the [pricing page](@pricing) and [download Print Bridge](@bridge).`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.website },
        { "@type": "ListItem", position: 2, name: "Colleges", item: PAGE_URL },
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
      name: "How College Bulk Document Printing Works with RepetiGo",
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

export default function CollegesSolutionPage() {
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
            <span aria-current="page">Colleges</span>
          </nav>
          <h1>College Printing Software India - Secure, High-Volume Document Printing for Every Degree College and Institution.</h1>
          <p>
            RepetiGo is college printing software India - a secure document printing platform that handles the scale and
            variety of document printing that degree colleges face every semester. Admit cards before exams. Marksheets
            after results. Migration certificates for graduating students. Assignment printouts at the student print
            counter throughout the year. Hall tickets for 3,000 students before the semester final. And through all of
            it, the constant pressure of student data - Aadhaar numbers, academic records, personal details - flowing
            through the college&apos;s print infrastructure without a clear deletion protocol.
          </p>
          <p>
            RepetiGo&apos;s college document management software india provides the infrastructure to handle all of
            this: secure QR-based document receipt from any department, AI formatting in 30 seconds for every document
            type, a high-volume print queue that handles thousands of jobs across multiple counters, and automatic
            deletion of every student document within 15 minutes of printing.
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
          <h2>The Bulk Printing Challenge That Defines Every College Semester.</h2>
          <div className="about-copy">
            {problemParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <BarChart3 size={20} aria-hidden />
            <p>
              <strong>
                RepetiGo can handle bulk admit card printing for thousands of students in a single exam cycle, with
                every document AI-formatted and auto-deleted after printing.
              </strong>{" "}
              No WhatsApp. No file management. No accumulated student data.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>How RepetiGo&apos;s College Printing Software Handles High-Volume Operations.</h2>
          <div className="about-copy">
            <p>
              The same four-step workflow that handles a single student&apos;s document also handles a batch of 2,800
              admit cards - the system scales with the volume automatically.
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
          <h2>Admit Card and Hall Ticket Printing - The Exam Cycle Challenge Solved.</h2>
          <div className="about-copy">
            {admitParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>
              For detailed admit card and hall ticket printing guidance:{" "}
              <Link href={LINKS.certificates}>certificate and admit card printing</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>Every College Document Type - Handled at Scale.</h2>
          <div className="sol-table-wrap">
            <table className="sol-table">
              <caption className="sol-sr-only">College document types, typical scale and how RepetiGo handles each one</caption>
              <thead>
                <tr>
                  <th scope="col">Document Type</th>
                  <th scope="col">Scale</th>
                  <th scope="col">How RepetiGo Handles It</th>
                </tr>
              </thead>
              <tbody>
                {documentRows.map(([type, scale, handling]) => (
                  <tr key={type}>
                    <th scope="row">{type}</th>
                    <td>{scale}</td>
                    <td>
                      <Rich text={handling} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-heading">
            <h2>Features Built for College Document Management in India.</h2>
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
          <h2>Student Data and the DPDP Act 2023 - What Colleges Need to Know.</h2>
          <div className="about-copy">
            {dpdpParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Lock size={20} aria-hidden />
            <p>
              <Link href={LINKS.compliance}>Full DPDP Act 2023 compliance documentation</Link> is available on our
              privacy page. We recommend consulting a legal advisor for DPDP Act 2023 obligations specific to your
              college.
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
          <h2>Frequently Asked Questions - College Printing Software India.</h2>
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
          <h2>High-Volume, Secure Document Printing - Built for Every College in India.</h2>
          <p>
            From 2,800 hall tickets the week before semester exams to a single student&apos;s assignment at the print
            counter on a Tuesday afternoon, RepetiGo&apos;s college printing software india handles every college
            document printing scenario in the same system - securely, automatically, and with every document deleted
            within 15 minutes of printing. No WhatsApp. No formatted files sitting on personal phones. No student data
            accumulating through exam cycle after exam cycle.
          </p>
          <p>14-day free trial. No credit card. Your existing printers. Under 10 minutes to your first QR-based batch print run.</p>
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
