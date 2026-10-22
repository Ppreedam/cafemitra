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
  Zap,
  type LucideIcon,
} from "lucide-react";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";
import { BUSINESS } from "../../../lib/businessInfo";
import { LINKS, Rich, plain, type LinkKey } from "../solutionKit";

const PAGE_PATH = "/solutions/schools";
const PAGE_URL = `${BUSINESS.website}${PAGE_PATH}`;

const TITLE = "RepetiGo for Schools: Secure Document Printing Software India";
const DESCRIPTION =
  "RepetiGo: school document printing software India - secure admit cards, marksheets, Aadhaar verification. No WhatsApp. Auto-delete. Zero training for admin staff.";
const OG_TITLE = "School Document Printing Software India | Secure, Staff-Ready - RepetiGo";
const OG_DESCRIPTION =
  "Admit cards, marksheets, Aadhaar verification, exam papers - all printed securely via QR upload with AI processing and auto-delete. No WhatsApp. No training needed.";

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

const badges = ["No WhatsApp Required", "AI Formats Every Document", "Auto-Delete in 15 Min", "Zero Training Needed"];

const problemParagraphs = [
  `Admission season at an Indian school looks like this from the admin office: 800 students. Each needs an admit card printed before the exam. The class teachers send the admit cards over WhatsApp - some as images, some as PDFs, some as Word files. The admin staff download them one by one, open each file, check the formatting, adjust the size, print, and then file them in a physical folder while trying to answer the phone from a parent asking about fee payment.`,
  `Outside exam season, the daily flow continues: a student needs their Aadhaar verification printed for the Mid-Day Meal scheme. Another needs their marksheet for a college application. A teacher needs class photos for ID card printing. A parent needs a fee receipt. Each document arrives over WhatsApp or is handed to the admin desk on a USB drive - and each one requires manual handling, manual formatting, and manual deletion that nobody has time for.`,
  `The result is not just inefficiency. It is accumulated student data - Aadhaar numbers, home addresses, academic records - sitting on admin staff's personal phones and the school's office computers, undeleted, for months or years. Under India's DPDP Act 2023, student data is classified as children's personal data, which carries the strictest protection requirements of any data category. Most Indian schools today are not compliant with these requirements - not because they are negligent, but because the student document printing software india they have been using is WhatsApp and a printer.`,
  `RepetiGo's school document workflow software india changes the structure. Documents come in via QR. AI formats them. They print. They delete. No personal device involved. No data accumulation.`,
];

type Step = { title: string; body: string };

const steps: Step[] = [
  {
    title: "Step 1 - Document Uploaded via QR - No Staff Training Needed",
    body: `A laminated QR code at the school's admin counter or print room. A teacher, parent, or student scans it with any phone. They upload the document - admit card file, marksheet PDF, Aadhaar image - from their gallery or files app. The [student document printing software india](@qr) upload process is TLS-encrypted and goes directly into the RepetiGo cloud. No WhatsApp. No email. No admin staff phone number shared. The document appears in the print queue. The process requires zero training for the person uploading - they just scan and upload.`,
  },
  {
    title: "Step 2 - AI Handles Every Format Automatically",
    body: `The [school management printing software](@ai) AI pipeline runs the moment the document arrives. It detects the document type - Aadhaar card, A4 document, passport-size photo - and sizes it correctly without any staff action. For Aadhaar cards: 15x10 cm, shadow removed, contrast enhanced. For marksheets and admit cards: A4 layout verified, orientation corrected. For ID card photos: sized to school ID card dimensions. Whatever format the document arrives in - image, PDF, Word file photographed on a phone - the AI produces a print-ready output in under 30 seconds. The school exam paper printing software india capability means exam papers sent by teachers for printing are processed and formatted immediately, without a staff member manually opening and adjusting each file.`,
  },
  {
    title: "Step 3 - Organised Print Queue for All Document Types",
    body: `Every document - from multiple teachers, multiple parents, multiple students - arrives in a single organised [print queue](@queue) on the admin counter screen. Each job shows the document type, upload time, and page count. The admin staff confirm and print with one tap. For schools with multiple printers - an A4 printer for documents and a photo printer for ID cards - the queue routes each job to the correct machine automatically. No file management. No calling back to ask for a re-send. No searching through WhatsApp chats for a document that arrived three days ago.`,
  },
  {
    title: "Step 4 - Automatic Deletion - No Student Data Retained",
    body: `After each print job completes, an S3 lifecycle policy permanently deletes the document from the cloud within 15 minutes. A student's Aadhaar card is gone. A marksheet is gone. An exam paper that has been printed is gone. The [school secure document printing india](@autodelete) process leaves no student data on any server, any counter computer, or any personal device - automatically, for every document, without the admin staff needing to act. For a school that handles hundreds of student documents a week, this is the difference between accumulating a privacy liability and having none.`,
  },
];

const documentRows: [string, string, string][] = [
  [
    "Admit Cards",
    "AI detects A4 layout. Batch processing for full class sets. Organised queue by class/section.",
    "Before every exam - Term 1, Term 2, Board Exams, unit tests",
  ],
  [
    "Marksheets & Report Cards",
    "A4 document processing. Each student's sheet queued individually. Auto-delete after printing.",
    "After exam results, board results, term end",
  ],
  [
    "Student ID Cards",
    "AI sizes to standard ID card dimensions. Photo enhancement for phone-photographed student photos.",
    "Beginning of academic year, new admissions, replacements",
  ],
  [
    "Aadhaar Verification Documents",
    "15x10 cm auto-sized. Shadow removal. Permanent deletion 15 minutes after printing. [How to print Aadhaar cards securely](@aadhaar)",
    "Mid-Day Meal scheme, PM Poshan, RTE admission, scheme enrollment",
  ],
  [
    "School Certificates",
    "A4 processing. Deskew for scanned originals. AI contrast enhancement.",
    "Leaving certificates, transfer certificates, bonafide certificates",
  ],
  [
    "Exam Papers",
    "Uploaded by subject teachers via QR. AI formatted. Printed directly. Auto-deleted - no exam paper copy retained on system.",
    "All internal exams - critical for question paper confidentiality",
  ],
  [
    "Fee Receipts & Forms",
    "Standard A4 processing. Batch support for class-level fee collection periods.",
    "Fee submission, scholarship applications, government forms",
  ],
];

const dpdpParagraphs = [
  `India's Digital Personal Data Protection Act 2023 places special obligations on organisations that handle children's personal data - and schools are explicitly in this category. Students under 18 are classified as children under the DPDP Act. Their personal data - Aadhaar numbers, academic records, home addresses, photographs - receives the strictest protection of any data category in the Act.`,
  `For schools, this creates a concrete obligation that most are currently not meeting. Every time a student's Aadhaar card is sent to an admin staff member's personal WhatsApp for printing, that constitutes collection of a child's personal data on a personal device without documented purpose and without deletion after use. Every marksheet that sits in a teacher's phone camera roll is children's personal data being retained without lawful basis.`,
  `RepetiGo's school document workflow software india addresses these obligations structurally. Documents are received via QR upload - no personal device, no WhatsApp, no admin staff phone number. They are processed and deleted within 15 minutes of printing. The audit trail records the transaction metadata without retaining the document content. No student's Aadhaar number, photo, or academic record remains on any system after their document has been printed.`,
  `For school administrations that are preparing for DPDP Act compliance or responding to questions from parents about student data privacy, RepetiGo's architecture provides a concrete, demonstrable answer: student documents are collected for printing, used for printing, and deleted after printing. Automatically. Every time.`,
];

type Feature = { icon: LucideIcon; title: string; body: string; href?: LinkKey };

const features: Feature[] = [
  {
    icon: QrCode,
    title: "QR Document Upload",
    body: "Teachers, parents, students upload from any phone - no WhatsApp, no email, no staff phone number. TLS-encrypted.",
    href: "qr",
  },
  {
    icon: Bot,
    title: "AI Document Processing",
    body: "Auto-formats every document type: Aadhaar (15x10 cm), marksheets (A4), ID photos (passport size), exam papers (A4). No manual formatting.",
    href: "ai",
  },
  {
    icon: Trash2,
    title: "Auto-Delete in 15 Minutes",
    body: "Every student document permanently deleted after printing. S3 lifecycle enforcement - not a staff responsibility. DPDP Act 2023 aligned for children's data.",
    href: "autodelete",
  },
  {
    icon: Printer,
    title: "Organised Print Queue",
    body: "All documents from all uploaders in one queue, sorted by upload time. Document type visible before confirming. Multi-printer routing.",
    href: "queue",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    body: "All student documents encrypted in transit (TLS) and at rest (AES-256). No unencrypted student data at any point.",
    href: "security",
  },
  {
    icon: BarChart3,
    title: "School Print Analytics",
    body: "Daily volume, document types printed, peak usage hours. Useful for planning admin resources during exam seasons and result days.",
  },
  {
    icon: ShieldCheck,
    title: "Print Bridge - Works with School Printers",
    body: "Connects to HP, Canon, Epson, Brother printers - USB and WiFi network. Setup in under 10 minutes. No IT technician required.",
    href: "bridge",
  },
];

const setupParagraphs = [
  `Schools do not need new hardware, a new printer, or a new computer to use RepetiGo. The school document printing software india works with whatever your school already has.`,
  `**Printers:** HP, Canon, Epson, Brother - USB and WiFi network. The Print Bridge agent connects to your school's existing printer automatically. No configuration required beyond the initial setup.`,
  `**Admin computer:** Windows 7 or later. Print Bridge runs silently in the background - no open window during class hours.`,
  `**Staff training:** None required. The QR code does the work for anyone uploading. The admin staff see a simple print queue - one screen, one tap to print. No file management, no downloads, no folder organisation.`,
  `**QR placement:** Print and laminate one QR card for your admin counter. Print a second one for your staffroom if needed. New QR codes can be regenerated from the dashboard if the card is lost or damaged.`,
  `[Download Print Bridge](@bridge)`,
];

const pricingParagraphs = [
  `RepetiGo is available on a monthly subscription - no annual commitment, no setup fee. The 14-day free trial gives full access to every feature: QR document upload, AI processing, auto-delete, print queue, and analytics. No credit card required to start.`,
  `The trial is designed for real use. Schools can process actual student documents - admit cards, Aadhaar verification prints, marksheets - during the 14-day period. The transition from WhatsApp-based document handling typically becomes visible within the first day.`,
];

const pricingLinks: [string, LinkKey][] = [
  ["Pricing plans", "pricing"],
  ["Multi-school and district-level enquiries", "contact"],
];

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "How do schools manage document printing in India?",
    a: `How schools manage document printing india today varies by school type and size, but the dominant method is informal: WhatsApp groups for document collection, manual editing by admin staff, and printing from a shared computer. This works for small volumes but creates two significant problems at scale: accumulated student data on personal devices (a DPDP Act 2023 compliance issue for children's data) and significant admin staff time spent on document formatting rather than administration. RepetiGo's school document printing software india replaces this with a QR-based upload workflow, AI formatting, organised queue, and automatic deletion - all without changing the school's existing printer or computer setup.`,
  },
  {
    q: "What is the best school printing software in India?",
    a: `The best school printing software india is one that works without training for admin staff, handles every document type a school uses, and ensures student data is not retained after printing. RepetiGo meets all three: the QR code requires no training to use, the AI handles Aadhaar cards, marksheets, admit cards, ID photos, and exam papers without manual formatting, and the S3 lifecycle policy deletes every document within 15 minutes of printing. The DPDP Act 2023 alignment for children's data is built into the architecture - not added as a compliance checkbox.`,
  },
  {
    q: "How does RepetiGo handle Aadhaar verification printing at schools?",
    a: `School Aadhaar verification printing india is one of the most common document printing tasks at Indian schools - required for Mid-Day Meal scheme enrollment, RTE admissions, and various state government educational schemes. With RepetiGo, the process is: student or parent scans the counter QR code → uploads the Aadhaar image from their phone → AI automatically detects the Aadhaar card and sizes it to 15x10 cm, removes shadows, enhances contrast → admin staff confirm and print → the Aadhaar image is permanently deleted from the cloud within 15 minutes. No Aadhaar number remains on any school system after printing. For the complete Aadhaar printing guide, see [how to print Aadhaar cards securely](@aadhaar).`,
  },
  {
    q: "Can RepetiGo print admit cards and marksheets in bulk for all students?",
    a: `Yes. Student marksheet printing software india with bulk capability is built into RepetiGo's print queue. Teachers can upload multiple documents - a full class set of admit cards, for example - and they arrive in the print queue in sequence, each individually processed and queued. The admin staff confirm and print each one in order, or set auto-confirm for batch jobs. For batch runs during exam season or results day, the queue organises all uploads by document type and upload time, preventing the chaos of multiple teachers sending documents to a single admin WhatsApp simultaneously. The school exam paper printing software india capability similarly allows teachers to upload exam papers directly to the queue for printing, without any paper copy being forwarded or shared.`,
  },
  {
    q: "Is student data protected under the DPDP Act at school print shops?",
    a: `Under India's DPDP Act 2023, children's personal data - which includes all student data - receives the strictest protection of any data category. Schools that collect student Aadhaar numbers, photographs, or academic records for printing are data fiduciaries under the Act and are required to delete that data when the purpose (printing) is fulfilled. With RepetiGo, this deletion happens automatically within 15 minutes of print completion - at the infrastructure level, not as a staff responsibility. No student Aadhaar number, photograph, or marksheet remains on any school system after printing. For full documentation, see the [DPDP Act 2023 compliance documentation](@compliance).`,
  },
  {
    q: "Is there a free trial for school document printing software?",
    a: `Yes - 14 days free, no credit card required. Every feature is available during the trial, including QR document upload, AI processing, auto-delete, the organised print queue, and the analytics dashboard. Schools can process actual student documents during the trial period. Setup takes under 10 minutes - [download Print Bridge](@bridge), connect to your existing school printer, and print your first QR code card for the admin counter. The first Aadhaar card or admit card printed through the QR workflow typically makes the operational difference immediately clear.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.website },
        { "@type": "ListItem", position: 2, name: "Schools", item: PAGE_URL },
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
      name: "How School Document Printing Works with RepetiGo",
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

export default function SchoolsSolutionPage() {
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
            <span aria-current="page">Schools</span>
          </nav>
          <h1>
            School Document Printing Software India - Secure, Organised, and Designed for Admin Staff Who Have Enough to
            Do.
          </h1>
          <p>
            RepetiGo is school document printing software India - a secure document printing platform that handles the
            complete range of document types that flow through a school&apos;s administrative office: admit cards before
            exams, marksheets after results, Aadhaar verification for government schemes, ID cards for new students, and
            daily documents for parents, teachers, and staff. The platform runs on your existing counter computer and
            connects to your existing printer. Your admin staff do not need training. The QR code does the work.
          </p>
          <p>
            RepetiGo&apos;s school printing management software india replaces the WhatsApp-and-download-folder workflow
            that most Indian schools currently run - with a secure, organised, auto-deleting system that leaves no
            student document on any device after the print job is done.
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
          <h2>The Document Printing Challenge Every Indian School Administration Knows.</h2>
          <div className="about-copy">
            {problemParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Zap size={20} aria-hidden />
            <p>
              <strong>Student documents on personal WhatsApp are children&apos;s personal data on a personal device.</strong>{" "}
              See why it matters.{" "}
              <Link href={LINKS.whatsapp}>Why WhatsApp is not safe for student documents</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>How RepetiGo&apos;s School Printing Management Software Works.</h2>
          <div className="about-copy">
            <p>
              The complete document workflow at a RepetiGo-enabled school runs in four steps. No IT expertise required at
              any stage.
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
              <strong>From QR scan to printed document: under 90 seconds.</strong> From upload to permanent deletion:
              under 20 minutes. No student document remains on any system after printing.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>Every School Document Type - Handled Correctly.</h2>
          <div className="about-copy">
            <p>
              Indian schools handle a wider range of document types than almost any other organisation. RepetiGo&apos;s
              school document printing software india handles all of them - automatically formatted for the correct
              output:
            </p>
          </div>
          <div className="sol-table-wrap">
            <table className="sol-table">
              <caption className="sol-sr-only">School document types and how RepetiGo handles each one</caption>
              <thead>
                <tr>
                  <th scope="col">Document Type</th>
                  <th scope="col">How RepetiGo Handles It</th>
                  <th scope="col">When Schools Need This</th>
                </tr>
              </thead>
              <tbody>
                {documentRows.map(([type, handling, when]) => (
                  <tr key={type}>
                    <th scope="row">{type}</th>
                    <td>
                      <Rich text={handling} />
                    </td>
                    <td>{when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>Student Data Privacy - What the DPDP Act 2023 Requires for Schools.</h2>
          <div className="about-copy">
            {dpdpParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Lock size={20} aria-hidden />
            <p>
              <Link href={LINKS.compliance}>Full DPDP Act 2023 compliance documentation</Link> is available on our
              privacy page. We recommend consulting a legal advisor for DPDP Act obligations specific to your school. The
              DPDP Act&apos;s provisions for children&apos;s data are among the strictest in the Act.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-heading">
            <h2>Features Built for School Document Management in India.</h2>
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
          <h2>How RepetiGo Fits Your School&apos;s Existing Setup.</h2>
          <div className="about-copy">
            {setupParagraphs.map((p) => (
              <p key={p}>
                <Rich text={p} />
              </p>
            ))}
          </div>
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
          <h2>Frequently Asked Questions - School Document Printing Software India.</h2>
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
          <h2>Secure Document Printing - Built for Every School in India.</h2>
          <p>
            Your school handles student documents every week - Aadhaar cards, marksheets, admit cards, ID photos, and
            government forms that contain children&apos;s personal data. RepetiGo&apos;s school document printing
            software india ensures that every document is uploaded securely, formatted automatically, printed correctly,
            and permanently deleted within 15 minutes. No WhatsApp. No accumulated student data. No DPDP Act compliance
            gap. And no training required for the admin staff who already have enough to manage.
          </p>
          <p>
            14-day free trial. No credit card. Your existing school printer. Under 10 minutes to the first secure student
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
