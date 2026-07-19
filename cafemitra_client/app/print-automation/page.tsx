import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Landmark,
  LockKeyhole,
  MessageCircleOff,
  Printer,
  QrCode,
  Sparkles,
  Trash2,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";
import { PublicFooter } from "../PublicFooter";

const siteUrl = "https://repetigo.com";
const pageUrl = `${siteUrl}/print-automation`;

export const metadata: Metadata = {
  title: "PrintPilot: Print Automation Software for Indian Shops | RepetiGo",
  description:
    "PrintPilot is RepetiGo's print automation software for cyber cafes, print shops & CSC centres. QR upload, AI processing, auto-delete. Try free for 14 days.",
  alternates: {
    canonical: pageUrl,
  },
  openGraph: {
    title: "PrintPilot: Print Automation Software for Indian Shops | RepetiGo",
    description:
      "AI-powered print automation software. QR upload, secure document printing, auto-delete in 15 min. Built for cyber cafes & print shops.",
    type: "website",
    url: pageUrl,
    images: [`${siteUrl}/og-printpilot.jpg`],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrintPilot - Print Automation Software by RepetiGo",
    description:
      "QR upload. AI processing. Auto-delete. The complete print automation software for Indian print shops and cyber cafes.",
    images: [`${siteUrl}/og-printpilot.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const heroBadges = [
  "No WhatsApp Required",
  "AI-Powered",
  "Auto-Delete in 15 Min",
  "Works With Your Existing Printer",
];

const workflowSteps = [
  {
    title: "Step 1 - Customer Scans Your QR Code",
    icon: QrCode,
    text:
      "Your shop gets a unique QR code from PrintPilot. Display it at your counter - printed on a card, stuck to the desk, or shown on a small screen. When a customer needs to print, they open their phone camera, scan the code, and a secure upload page opens directly in their browser. No app download. No form to fill. No WhatsApp number to type. The QR document upload works on any smartphone camera - iPhone or Android. No installation required.",
  },
  {
    title: "Step 2 - Secure Document Upload",
    icon: LockKeyhole,
    text:
      "The customer selects their file - PDF, photo, Word document, or any common format - and uploads it directly from their device. The secure document upload is end-to-end encrypted from the moment the file leaves the customer's phone. It goes directly into the PrintPilot print queue - never to your personal WhatsApp, never to your email, never to your phone's storage. AES-256 encryption at rest. TLS in transit. The customer's document never touches your personal device.",
  },
  {
    title: "Step 3 - AI Processing (Automatic)",
    icon: Bot,
    text:
      "The moment the document arrives, the AI takes over. It detects page count. Corrects orientation. Removes shadows and noise from phone photos. Enhances brightness and clarity. Resizes to the correct print dimensions. Optimises settings for your specific printer model. This is the AI document processing that turns a blurry phone photo of an Aadhaar card into a clean, print-ready file - without any human intervention. What took your staff 3 to 5 minutes now takes under 30 seconds.",
  },
  {
    title: "Step 4 - Print and Auto-Delete",
    icon: Printer,
    text:
      "The processed document appears in your print queue. You review it with a print preview, confirm, and print. The job goes directly to your connected printer - no USB, no download, no manual file management. After printing, the document is automatically and permanently deleted from the system within 15 minutes. This is not a setting. It is the default behaviour of PrintPilot, built into the architecture so nothing can be accidentally left behind. Auto delete documents after printing happens within 15 minutes - always, for every job, automatically.",
  },
];

const features = [
  {
    id: "qr-upload",
    title: "QR Document Upload - No WhatsApp. No Email.",
    icon: QrCode,
    text:
      "Your shop gets a unique QR code. Customers scan and upload from their own device - nothing ever touches your personal phone. Every QR document upload is logged with timestamp and document type. Multiple customers can upload simultaneously without confusion. The queue updates in real time on your dashboard. This one feature eliminates the privacy risk that every print shop in India currently carries.",
    link: "Explore QR Upload",
    href: "#workflow",
  },
  {
    id: "ai-processing",
    title: "AI Document Processing - Fully Automatic",
    icon: Sparkles,
    text:
      "The AI document processing engine handles everything your staff previously did manually. It detects whether a multi-page document has all pages oriented correctly. It removes shadows from phone photos of documents - the most common problem when customers photograph their Aadhaar or PAN card at home. It enhances contrast, corrects brightness, and adjusts image dimensions to exactly what your printer needs. No input from you required. By the time you see the job in the queue, it is print-ready.",
  },
  {
    id: "print-queue",
    title: "Print Queue Management - Real-Time Control",
    icon: BarChart3,
    text:
      "The print queue management software gives you complete visibility over every job - incoming, processing, ready to print, and completed. You see document previews before printing. You can reorder jobs, put a job on hold, or cancel it from the dashboard. The print job tracking shows you which documents are waiting, which are printing, and which have been deleted. For shops with high volume, the queue dashboard replaces the mental overhead of keeping track of what needs to happen next.",
    link: "See Print Queue Flow",
    href: "#comparison",
  },
  {
    id: "multi-printer",
    title: "Multi-Printer Support - Manage Every Machine",
    icon: Printer,
    text:
      "PrintPilot's multi printer management software connects all your printers to a single dashboard. You can assign specific document types to specific printers - colour jobs to the colour printer, black-and-white documents to the standard machine, large-format prints to the plotter. If a printer goes offline, the dashboard alerts you instantly and holds the job rather than sending it into a void. Multi-printer support is available on Business and Enterprise plans.",
    link: "Explore Multi-Printer Support",
    href: "#comparison",
  },
  {
    id: "passport-photo",
    title: "Passport Photo Creation - Revenue on Demand",
    icon: Users,
    text:
      "PrintPilot includes a built-in passport photo creation tool that generates government-standard passport and visa photos automatically. AI detects face boundaries, corrects background colour, applies the correct dimensions for any country's visa requirements, and outputs a print-ready file immediately. No Photoshop. No manual sizing. No guessing whether the dimensions are correct. For shops that offer this service, passport photo creation is typically one of the highest-margin daily revenue streams.",
  },
  {
    id: "analytics",
    title: "Print Job Tracking and Analytics Dashboard",
    icon: BarChart3,
    text:
      "Every print job is tracked from upload to deletion. The analytics dashboard shows you daily job volume, peak hours, document types processed, revenue per day, and per-printer utilisation. Print job tracking gives you the data to make staffing, pricing, and equipment decisions. The audit log retains job metadata - timestamp, page count, printer used - for 7 years for business compliance, while document content is deleted after 15 minutes.",
  },
  {
    id: "auto-delete",
    title: "Auto Delete Documents After Printing",
    icon: Trash2,
    text:
      "After a job is completed, the document is automatically and permanently deleted from PrintPilot within 15 minutes. This is not optional. It cannot be disabled. It is how the system works by default, because we built it this way from day one. The auto delete documents feature means your shop never accumulates a library of customer data that you did not ask for and cannot legally retain.",
    link: "Read Security Details",
    href: "#security",
  },
  {
    id: "pdf-tools",
    title: "OCR, PDF Tools, and Image Enhancement",
    icon: FileText,
    text:
      "PrintPilot includes OCR to extract text from scanned documents and image-based PDFs - supporting Hindi and 10 regional Indian languages alongside English. The PDF tools let you merge, split, compress, and convert files without leaving the platform. Image enhancement corrects documents that arrive as blurry phone photos, applying contrast, sharpening, and noise reduction automatically. These capabilities mean your shop can handle any document type a customer brings - not just clean, well-formatted files.",
    link: "Open PDF Tools",
    href: "/pdf-tools",
  },
];

const comparisonRows = [
  ["Customer document receipt", "QR code - secure, encrypted", "Personal WhatsApp number"],
  ["Secure document upload", "End-to-end encrypted upload", "No encryption on device"],
  ["AI document processing", "Automatic - under 30 seconds", "Manual - 3 to 5 minutes"],
  ["Print queue management", "Real-time dashboard", "Mental tracking / paper"],
  ["Multi-printer support", "Yes - all machines in one view", "No - manual per printer"],
  ["Auto delete documents", "15 minutes - automatic always", "Never - stays permanently"],
  ["Print job tracking", "Full audit log + analytics", "No tracking"],
  ["DPDP Act compliance", "Designed for it", "Creates data liability"],
  ["Passport photo creation", "Built-in AI - any country format", "External tool required"],
  ["Setup time", "10 minutes", "Instant - but builds liability"],
  ["Cost of document data breach", "Near zero - no retention", "Unlimited - data lives forever"],
];

const protectionRows = [
  [
    "End-to-End Encryption",
    "AES-256 encryption at rest. TLS in transit. Documents are encrypted the moment they leave the customer's phone and remain encrypted until deletion.",
  ],
  [
    "Direct QR Upload - No WhatsApp",
    "Customers upload from their own device via a secure browser page. The document never touches your personal WhatsApp, email, phone, or any personal device.",
  ],
  [
    "Auto-Delete in 15 Minutes",
    "Every document is permanently and automatically deleted within 15 minutes of a successful print job. This cannot be disabled - it is the system default.",
  ],
  [
    "DPDP Act 2023 Alignment",
    "PrintPilot is designed to align with India's Digital Personal Data Protection Act 2023. Zero document retention by default means zero data liability for your shop.",
  ],
  [
    "Audit Log (Metadata Only)",
    "Every print job is logged - timestamp, page count, printer, processing time - for 7-year compliance. Document content is never retained in the log.",
  ],
  [
    "Role-Based Access Control",
    "Shop owners, staff members, and admins have separate access levels. Staff see only what they need to do their job - nothing more.",
  ],
];

const businessRows = [
  {
    type: "Cyber Cafes",
    help: "Handle high daily document volume without WhatsApp chaos. Customers upload securely, AI processes automatically, staff just confirms and prints.",
    benefit: "Serve 40% more customers daily",
    icon: Building2,
  },
  {
    type: "Print Shops & Xerox Centres",
    help: "Replace manual document handling entirely. Every job processed in under 30 seconds. Every file deleted after printing.",
    benefit: "Save 3-5 hours of manual work daily",
    icon: Printer,
  },
  {
    type: "CSC Centres",
    help: "Government document printing with DPDP Act compliance built in. Audit logs for every transaction. Zero data retention by default.",
    benefit: "DPDP Act compliant from day one",
    icon: Landmark,
  },
  {
    type: "Schools & Colleges",
    help: "Handle student document printing at volume - marksheets, ID cards, application forms - without privacy risk or manual processing.",
    benefit: "Zero staff training required",
    icon: GraduationCap,
  },
  {
    type: "Offices & Businesses",
    help: "Automate internal document printing workflows. No more email attachments, USB drives, or shared folders for print jobs.",
    benefit: "Integrates with existing workflow",
    icon: BriefcaseBusiness,
  },
];

const faqs = [
  [
    "What is print automation software?",
    "Print automation software is a platform that automates the workflow of receiving, processing, and printing customer documents in a print service business. Instead of the shop owner manually receiving documents on WhatsApp, reformatting them, and sending them to the printer, print automation software handles each step automatically. PrintPilot is AI-powered print automation software that replaces the manual WhatsApp workflow with secure QR upload, automatic AI processing, direct printer integration, and auto-deletion after every job - built specifically for Indian print shops, cyber cafes, and CSC centres.",
  ],
  [
    "Is PrintPilot the same as digital printing software?",
    "PrintPilot is a print automation software platform, not digital printing software in the traditional sense. Digital printing software typically refers to design tools used to create artwork for printing on physical materials - banners, t-shirts, packaging. PrintPilot is a document service software that automates the workflow for print shops receiving customer documents to print - Aadhaar cards, PAN cards, resumes, forms, and similar documents. If you run a print shop that prints customer documents rather than custom products, PrintPilot is the right tool.",
  ],
  [
    "Can PrintPilot be used as online print shop software?",
    "Yes. PrintPilot is entirely cloud-based - you access the dashboard from any web browser, on any device. Customers upload documents remotely via QR code, which means they do not need to be physically present to initiate a print job. In practice, this means a customer can scan your QR code from anywhere, upload their document, and collect their printout when they arrive. This makes PrintPilot functional as online print shop software for shops that offer remote document submission.",
  ],
  [
    "How does the print queue management software work?",
    "PrintPilot's print queue management software shows every incoming print job in a real-time dashboard. Each job displays the document name, page count, upload time, processing status, and a preview before printing. You can reorder jobs, place a job on hold, or cancel it directly from the dashboard. Jobs move automatically through the queue from upload to AI processing to ready to print to completed and deleted. For shops with multiple printers, the print queue management software lets you assign specific jobs to specific machines and monitor all printer statuses from one screen.",
  ],
  [
    "Does PrintPilot work with my existing printer?",
    "Yes. PrintPilot works with standard USB and network printers commonly used in Indian print shops - including HP, Canon, Epson, Brother, and Xerox models. You install the RepetiGo Print Bridge application on the computer connected to your printer. Setup takes approximately 10 minutes. No new hardware purchase is required. Multi-printer support allows you to connect multiple printers of different makes to the same PrintPilot dashboard, managing all of them from one interface.",
  ],
  [
    "What is the difference between PrintPilot and WhatsApp for print shops?",
    "WhatsApp was designed for personal messaging - not for document handling in a business context. When customers send documents via WhatsApp, the files are stored permanently on the shop owner's personal phone, in WhatsApp's servers, and in the phone's media gallery - with no deletion schedule and no encryption on the device itself. PrintPilot is purpose-built print automation software: documents go encrypted from the customer's phone directly to the print queue, never to a personal device, and are automatically deleted within 15 minutes of printing. PrintPilot also adds AI processing that WhatsApp cannot provide - automatic resizing, orientation correction, shadow removal, and print optimisation for each document.",
  ],
  [
    "What happens to customer documents after printing?",
    "Documents processed through PrintPilot are automatically and permanently deleted from the system within 15 minutes of a successful print job. This is not a manual process and cannot be disabled - it is built into the platform architecture. Only minimal job metadata is retained in the audit log: timestamp, page count, printer used, and processing time. The actual document content - the Aadhaar card, PAN card, medical report, or resume - is gone from the system within 15 minutes. No data is retained beyond its purpose.",
  ],
  [
    "How does multi printer management software work in PrintPilot?",
    "PrintPilot's multi printer management software connects multiple printers to a single dashboard. You install the Print Bridge application on each computer connected to a printer. From the dashboard, you can see all connected printers, their current status, the jobs assigned to each, and any error alerts. You can assign specific document types to specific printers - for example, route colour documents to the colour printer and standard documents to the black-and-white machine. If a printer goes offline, PrintPilot holds the job in queue rather than failing silently. Multi-printer support is included in Business and Enterprise plans.",
  ],
  [
    "Is PrintPilot DPDP Act compliant?",
    "PrintPilot is designed to align with India's Digital Personal Data Protection Act (DPDP Act) 2023. The key compliance mechanisms are: zero document retention by default, end-to-end encryption from upload to deletion, no collection of data beyond what is needed to process the print job, and an audit log that retains only metadata - not document content - for business compliance. We recommend consulting your legal advisor for specific DPDP Act compliance obligations applicable to your business.",
  ],
  [
    "How long does PrintPilot take to set up?",
    "Most print shops are fully operational with PrintPilot in under 10 minutes. The setup process: sign up for a free trial, download and install the Print Bridge application on the computer connected to your printer, run the printer connection wizard for HP, Canon, Epson, Brother, and Xerox, print your shop's QR code, and display it at your counter. Your first customer can upload a document and receive a print in the same session. No training is required for staff - the dashboard is designed to be self-explanatory for any shop owner, regardless of technical background.",
  ],
];

const relatedLinks = [
  ["QR Upload Feature", "Deep dive into how secure QR document upload works - architecture, security, and setup.", "#workflow"],
  ["Auto-Delete Feature", "Full explanation of how and when documents are deleted - including audit log retention policy.", "#security"],
  ["Print Queue Management", "Everything about the real-time dashboard, job management, and print job tracking.", "#print-queue"],
  ["Multi-Printer Support", "How to connect and manage multiple printers from one PrintPilot dashboard.", "#multi-printer"],
  ["Cyber Cafe Solution", "PrintPilot configured specifically for high-volume cyber cafe document workflows.", "#who-its-for"],
  ["Print Shop Solution", "PrintPilot for standalone print shops and Xerox centres.", "#who-its-for"],
  ["RepetiGo vs WhatsApp", "Honest comparison of PrintPilot and WhatsApp for document handling in print shops.", "#comparison"],
  ["Pricing", "All PrintPilot plans, features included, and how to start your free trial.", "/pricing"],
];

const schemaGraph = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PrintPilot",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: "0",
      description: "14-day free trial. No credit card required.",
      url: `${siteUrl}/pricing`,
    },
    description:
      "AI-powered print automation software for Indian print shops, cyber cafes, and CSC centres.",
    url: pageUrl,
    publisher: {
      "@type": "Organization",
      name: "RepetiGo",
      url: siteUrl,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Use PrintPilot Print Automation Software",
    description: "Process customer documents securely in 4 steps.",
    step: workflowSteps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      text: step.text,
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Print Automation",
        item: pageUrl,
      },
    ],
  },
];

function CtaButtons() {
  return (
    <div className="printpilot-cta-row">
      <Link className="printpilot-primary-cta" href="/pricing">
        Start Free Trial - 14 Days Free <ArrowRight size={18} aria-hidden />
      </Link>
      <Link className="printpilot-secondary-cta" href="/contact-us">
        Book a Demo
      </Link>
    </div>
  );
}

function Note({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "green" | "amber" }) {
  return (
    <div className={`printpilot-note printpilot-note-${tone}`}>
      <Sparkles size={18} aria-hidden />
      <p>{children}</p>
    </div>
  );
}

export default function PrintAutomationPage() {
  return (
    <div className="ai-landing-shell printpilot-landing-shell">
      <LandingNavbar />
      <main className="printpilot-page">
        <section className="printpilot-hero">
          <div className="printpilot-shell printpilot-hero-grid">
            <div className="printpilot-hero-copy">
              <span className="printpilot-kicker">
                <Zap size={16} aria-hidden />
                AI-powered print workflow for India
              </span>
              <h1>PrintPilot. Print Automation Software That Runs Your Shop on Autopilot.</h1>
              <div className="printpilot-hero-summary">
                <article>
                  <strong>Built for Indian document counters</strong>
                  <p>
                    PrintPilot is RepetiGo's flagship print automation software - built for Indian print shops, cyber
                    cafes, Xerox centres, and CSC centres.
                  </p>
                </article>
                <article>
                  <strong>Replaces WhatsApp-based document handling</strong>
                  <p>
                    It replaces the broken WhatsApp-based document workflow with secure QR upload, AI document
                    processing, direct printer integration, and automatic deletion after every job.
                  </p>
                </article>
                <article>
                  <strong>Designed for sensitive daily documents</strong>
                  <p>
                    PrintPilot is print management software built specifically for the 2.5 million document service
                    businesses that handle India's most sensitive documents every day.
                  </p>
                </article>
              </div>
              <div className="printpilot-badges">
                {heroBadges.map((badge) => (
                  <span key={badge}>
                    <CheckCircle2 size={15} aria-hidden />
                    {badge}
                  </span>
                ))}
              </div>
              <CtaButtons />
            </div>

            <div className="printpilot-dashboard-visual" aria-label="PrintPilot print automation software dashboard">
              <div className="printpilot-visual-top">
                <span>PrintPilot Queue</span>
                <strong>Live</strong>
              </div>
              <div className="printpilot-qr-panel">
                <div className="printpilot-qr">
                  <QrCode size={72} aria-hidden />
                </div>
                <div>
                  <span>Counter QR</span>
                  <strong>Customer uploads securely</strong>
                  <small>No WhatsApp. No USB. No personal phone.</small>
                </div>
              </div>
              <div className="printpilot-job-stack">
                {[
                  ["aadhaar_front.pdf", "AI clean", "Ready"],
                  ["passport_photo.jpg", "Background", "Processing"],
                  ["marksheet_scan.pdf", "Queue", "Printing"],
                ].map(([file, action, status]) => (
                  <div className="printpilot-job" key={file}>
                    <FileText size={20} aria-hidden />
                    <div>
                      <strong>{file}</strong>
                      <span>{action}</span>
                    </div>
                    <em>{status}</em>
                  </div>
                ))}
              </div>
              <div className="printpilot-visual-stats">
                <span>
                  <strong>30 sec</strong>
                  AI prep
                </span>
                <span>
                  <strong>15 min</strong>
                  auto-delete
                </span>
                <span>
                  <strong>10 min</strong>
                  setup
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="printpilot-section" id="what-is-printpilot">
          <div className="printpilot-shell">
            <h2>What Is PrintPilot?</h2>
            <p>
              PrintPilot is a cloud-based print automation software platform that automates the complete document
              workflow for print service businesses - from the moment a customer wants to print, to the moment the
              document is permanently deleted after printing. It is the core product within the RepetiGo platform,
              designed to replace three inefficient tools that most print shops rely on today: WhatsApp for document
              receipt, manual staff effort for document preparation, and physical memory for managing what gets deleted.
            </p>
            <p>
              In practice, PrintPilot works like this: a customer scans a QR code at your counter, uploads their document
              securely from their own phone, the AI prepares it automatically, and it lands in your print queue ready to
              print - in under 30 seconds, without you touching a single file.
            </p>
            <Note>
              PrintPilot automates the three most time-consuming and privacy-risky tasks in a print shop: document
              receipt, document preparation, and post-print deletion. Each one is handled by the system, not by the shop
              owner.
            </Note>
          </div>
        </section>

        <section className="printpilot-section printpilot-soft-band" id="problem">
          <div className="printpilot-shell">
            <h2>The Problem Every Print Shop Has. And No One Talks About.</h2>
            <div className="printpilot-two-column">
              <article>
                <MessageCircleOff size={28} aria-hidden />
                <h3>Your Customer's Aadhaar Card Is Sitting on Your WhatsApp.</h3>
                <p>
                  Every time a customer sends a document to your personal WhatsApp to get it printed, that document
                  stays on your phone. In your chat history. In your media gallery. On WhatsApp's servers. Permanently,
                  unless you manually delete it - which almost no one does.
                </p>
                <p>
                  That Aadhaar card, PAN card, bank statement, or medical report is now sitting on a device that also
                  contains your personal photos, your family's contact numbers, and your banking app. Your customer has
                  no idea their most sensitive identity document is stored on a stranger's personal phone, with no
                  deletion schedule and no encryption on the device itself.
                </p>
                <p>
                  This is not just a privacy problem. Under India's Digital Personal Data Protection Act (DPDP Act) 2023,
                  businesses that collect and retain personal data without a legitimate purpose and without a deletion
                  policy face regulatory exposure. Most print shop owners don't know this. Yet.
                </p>
              </article>
              <article>
                <Clock3 size={28} aria-hidden />
                <h3>Manual Document Prep Is Costing You 3-5 Minutes Per Job.</h3>
                <p>
                  The document arrives on WhatsApp. You download it. You open it on the computer. It's the wrong
                  orientation - you rotate it. The photo is too dark - you adjust brightness. The margins are wrong - you
                  resize it. The file needs to be in a specific format for this printer - you convert it. Then you print.
                </p>
                <p>
                  That is 3 to 5 minutes of skilled manual work for every single document. For a busy shop processing 60
                  to 100 documents a day, that is 3 to 8 hours of pure manual effort - time that could be serving more
                  customers, not reformatting files.
                </p>
                <p>
                  PrintPilot eliminates both problems completely. The document workflow is automated. The privacy risk is
                  eliminated by design.
                </p>
              </article>
            </div>
            <Note tone="amber">
              A print shop processing 80 documents per day wastes 4-6 hours daily on manual document preparation.
              PrintPilot reduces this to near zero - AI processes each document in under 30 seconds, automatically.
            </Note>
          </div>
        </section>

        <section className="printpilot-section" id="solution">
          <div className="printpilot-shell">
            <h2>PrintPilot: Print Management Software Built Differently.</h2>
            <p>
              Most print management software was designed to solve large print shop problems - order management,
              production scheduling, invoicing for commercial printers. PrintPilot was designed to solve a different
              problem: the document service business in India that receives 50-200 sensitive documents per day over
              WhatsApp, spends hours preparing them manually, and has no deletion system in place.
            </p>
            <p>
              PrintPilot is business automation for the document workflow - every step, from customer intent to printed
              page to secure deletion, managed by software instead of by memory and manual effort.
            </p>
            <p>
              The result: your staff stops doing data-entry-level document work. Your customers stop sending sensitive
              files to personal WhatsApp numbers. And your shop starts processing documents faster, cleaner, and with
              zero privacy liability.
            </p>
            <div className="printpilot-before-after">
              <div>
                <XCircle size={22} aria-hidden />
                <strong>Before PrintPilot</strong>
                <span>Customer sends Aadhaar on WhatsApp to 5 minutes of manual prep to printed to file stays on phone forever.</span>
              </div>
              <div>
                <CheckCircle2 size={22} aria-hidden />
                <strong>After PrintPilot</strong>
                <span>Customer scans QR to secure document upload to AI processes in 30 seconds to printed to auto-deleted in 15 minutes.</span>
              </div>
            </div>
            <Link className="printpilot-primary-cta printpilot-inline-cta" href="/pricing">
              Try PrintPilot Free - 14 Days <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </section>

        <section className="printpilot-section printpilot-soft-band" id="workflow">
          <div className="printpilot-shell">
            <h2>From Customer Upload to Printed Document in 4 Steps.</h2>
            <p>
              This is what print workflow software looks like when it genuinely works - not a tool that adds steps, but a
              system that removes them. Every step below is handled by PrintPilot, not by your staff.
            </p>
            <div className="printpilot-step-grid">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title}>
                    <span className="printpilot-step-number">{index + 1}</span>
                    <Icon size={28} aria-hidden />
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="printpilot-section" id="features">
          <div className="printpilot-shell">
            <h2>Everything in One Print Workflow Software Platform.</h2>
            <p>
              PrintPilot is not a collection of separate tools. It is a single print workflow software platform where
              every capability works together. Here is what is included in every PrintPilot plan.
            </p>
            <div className="printpilot-feature-grid">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article id={feature.id} key={feature.title}>
                    <span>
                      <Icon size={24} aria-hidden />
                    </span>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                    {feature.link && feature.href ? (
                      <Link href={feature.href}>
                        {feature.link} <ArrowRight size={15} aria-hidden />
                      </Link>
                    ) : null}
                  </article>
                );
              })}
            </div>
            <CtaButtons />
          </div>
        </section>

        <section className="printpilot-section printpilot-soft-band" id="why-printpilot">
          <div className="printpilot-shell">
            <h2>Why Print Shops Choose PrintPilot Over Everything Else.</h2>
            <p>
              There are many reasons print shops choose PrintPilot as their print automation software. But most shop
              owners who switch describe the same two moments: the moment they realised how much time manual document
              prep was costing them, and the moment a customer asked where their Aadhaar card went after printing.
            </p>
            <p>
              PrintPilot is the only software for print shops that solves both problems in one platform. Other tools
              handle order management, or PDF conversion, or print queue control - but none of them eliminate WhatsApp
              document sharing, automate preparation with AI, and auto-delete every file by default.
            </p>
            <p>
              PrintPilot is smart printing for the Indian market - built for the conditions, printer brands, document
              types, and regulatory context that Indian print shops actually work with. Not adapted from a US product.
              Not translated from a European platform. Built here, for here.
            </p>
            <Note>
              Setup takes 10 minutes. You install the Print Bridge application on your counter computer, connect your
              printer, and display your QR code. Your first customer can upload and print before your next break. No IT
              department. No consultant. No training manual for staff.
            </Note>
          </div>
        </section>

        <section className="printpilot-section" id="comparison">
          <div className="printpilot-shell">
            <h2>PrintPilot vs WhatsApp vs Generic PDF Tools.</h2>
            <p>
              If you are currently using WhatsApp or generic PDF tools to manage your print shop's document workflow,
              here is an honest comparison of what each approach actually delivers:
            </p>
            <div className="printpilot-table-wrap">
              <table className="printpilot-table">
                <thead>
                  <tr>
                    <th>Capability</th>
                    <th>PrintPilot</th>
                    <th>WhatsApp + Manual</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(([capability, printpilot, manual]) => (
                    <tr key={capability}>
                      <td>{capability}</td>
                      <td>
                        <CheckCircle2 size={16} aria-hidden />
                        {printpilot}
                      </td>
                      <td>
                        <XCircle size={16} aria-hidden />
                        {manual}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="printpilot-section printpilot-soft-band" id="security">
          <div className="printpilot-shell">
            <h2>Secure Document Printing. Built into the Architecture.</h2>
            <p>
              PrintPilot's approach to secure document printing is not a feature you enable - it is the architecture the
              entire platform is built on. Every design decision in PrintPilot starts with one question: does this
              protect the customer's document?
            </p>
            <p>Here is how the protection works in practice:</p>
            <div className="printpilot-table-wrap">
              <table className="printpilot-table printpilot-security-table">
                <thead>
                  <tr>
                    <th>Protection Layer</th>
                    <th>What It Means in Practice</th>
                  </tr>
                </thead>
                <tbody>
                  {protectionRows.map(([layer, meaning]) => (
                    <tr key={layer}>
                      <td>{layer}</td>
                      <td>{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Note tone="green">
              At a PrintPilot-enabled shop, a customer's Aadhaar card or PAN card is encrypted from the moment it leaves
              their phone, never stored on any personal device, processed automatically by AI, printed, and permanently
              deleted within 15 minutes. The customer's data exists in the system for less than 20 minutes total.
            </Note>
            <div className="printpilot-link-row">
              <Link href="/privacy-policy">Read our full Security Policy</Link>
              <Link href="#security">Learn about Encryption</Link>
            </div>
          </div>
        </section>

        <section className="printpilot-section" id="who-its-for">
          <div className="printpilot-shell">
            <h2>Built for Every Business That Handles Documents.</h2>
            <p>
              PrintPilot is printing business software that serves any business where customers bring documents to be
              printed. The core workflow - secure upload, AI processing, print, auto-delete - is the same across every
              business type. What changes is the volume, the document mix, and the specific compliance needs.
            </p>
            <div className="printpilot-business-grid">
              {businessRows.map(({ type, help, benefit, icon: Icon }) => (
                <article key={type}>
                  <Icon size={26} aria-hidden />
                  <h3>{type}</h3>
                  <p>{help}</p>
                  <strong>{benefit}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="printpilot-section printpilot-pricing-band" id="pricing">
          <div className="printpilot-shell printpilot-pricing-grid">
            <div>
              <h2>Start Free. See the Difference in 10 Minutes.</h2>
              <div className="printpilot-pricing-points">
                <article>
                  <span>01</span>
                  <strong>Full 14-day free trial</strong>
                  <p>
                    Get QR upload, AI processing, print queue management, multi-printer support, passport photo
                    creation, and the complete analytics dashboard. No credit card required to start.
                  </p>
                </article>
                <article>
                  <span>02</span>
                  <strong>First print job in 30 minutes</strong>
                  <p>
                    Install the Print Bridge application, connect your counter printer, and place your QR code at the
                    counter. Most shops finish setup in 10 minutes.
                  </p>
                </article>
                <article>
                  <span>03</span>
                  <strong>Simple paid plans after trial</strong>
                  <p>
                    After the trial, paid plans are available on the pricing page with full plan details and included
                    features.
                  </p>
                </article>
              </div>
              <CtaButtons />
            </div>
            <div className="printpilot-pricing-card">
              <span>Launch offer</span>
              <strong>14 days free</strong>
              <ul>
                <li>No credit card required</li>
                <li>QR upload included</li>
                <li>AI workflow included</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="printpilot-section" id="faq">
          <div className="printpilot-shell">
            <h2>Questions About PrintPilot Print Automation Software.</h2>
            <p>Every answer is written to be citable by AI assistants and to capture featured snippets in Google Search.</p>
            <div className="printpilot-faq-list">
              {faqs.map(([question, answer], index) => (
                <details key={question}>
                  <summary>
                    <h3>Q{index + 1}: {question}</h3>
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="printpilot-section printpilot-soft-band" id="more-from-repetigo">
          <div className="printpilot-shell">
            <h2>More from RepetiGo.</h2>
            <p>
              PrintPilot is the starting point. The RepetiGo platform is growing - each new product automates another
              layer of document work that your business should not have to do manually.
            </p>
            <div className="printpilot-related-grid">
              {relatedLinks.map(([label, text, href]) => (
                <Link href={href} key={label}>
                  <strong>{label}</strong>
                  <span>{text}</span>
                  <ArrowRight size={16} aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
      {schemaGraph.map((schema) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={schema["@type"]}
          type="application/ld+json"
        />
      ))}
    </div>
  );
}
