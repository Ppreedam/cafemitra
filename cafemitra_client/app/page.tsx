import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  ClipboardList,
  Clock,
  Coffee,
  Compass,
  FileText,
  Gauge,
  GraduationCap,
  KeyRound,
  Landmark,
  Languages,
  Layers,
  Lock,
  MessageCircle,
  Play,
  Printer,
  QrCode,
  Rocket,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Target,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { LandingNavbar } from "./LandingNavbar";
import { PublicFooter } from "./PublicFooter";
import { HeroStepsProgress } from "./HeroStepsProgress";

type IconType = ElementType;

const siteUrl = "https://repetigo.com";
const pageUrl = `${siteUrl}/`;

const trust = [
  { icon: MessageCircle, label: "No WhatsApp required" },
  { icon: Printer, label: "Works with your existing printer" },
  { icon: Lock, label: "Secure document upload" },
  { icon: Trash2, label: "Auto-delete after printing" },
  { icon: Zap, label: "Setup in 10 minutes" },
];

const socialStats = [
  { icon: Store, value: "Built for", label: "Print Shops Across India" },
  { icon: FileText, value: "AES-256", label: "Encryption Standard" },
  { icon: Landmark, value: "15 min", label: "Auto-Delete Default" },
  { icon: Clock, value: "< 2 min", label: "Avg. Print Time" },
];

const howSteps = [
  {
    icon: QrCode,
    title: "Customer Scans Your QR Code",
    body: "Your shop gets a unique QR code. Display it at your counter - printed on a card or shown on a small screen. When a customer needs to print, they open their phone camera, scan the code, and a secure upload page opens instantly in their browser. No app download, no WhatsApp, no phone number exchange - just a working camera.",
  },
  {
    icon: Lock,
    title: "Secure Document Upload",
    body: "The customer selects their file and uploads it directly from their device. The upload travels end-to-end encrypted - AES-256 at rest, TLS in transit - directly into the RepetiGo print queue. The document never touches your personal phone, your WhatsApp, or your email.",
  },
  {
    icon: Sparkles,
    title: "AI Processing - Automatic",
    body: "The moment the document arrives, AI takes over. It detects page count, corrects orientation, removes shadows and noise from phone photos, enhances brightness and clarity, resizes to the correct print dimensions, and optimises for your specific printer model - automatically, in under 30 seconds.",
  },
  {
    icon: Trash2,
    title: "Print & Auto-Delete",
    body: "The processed document appears in your print queue. You review, confirm, and print - directly to your connected printer, no USB transfer, no manual file management. After printing, the document is automatically and permanently deleted from the RepetiGo system within 15 minutes. Not a setting - the default behaviour of the system.",
  },
];

const features = [
  {
    icon: QrCode,
    title: "Secure QR Code Document Upload",
    body: "Your shop gets a unique QR code. Customers scan and upload from their own phone - no WhatsApp, no email, no personal numbers exchanged. The secure upload goes directly into your encrypted queue. Every upload is logged. Nothing sits on your personal device.",
  },
  {
    icon: Sparkles,
    title: "AI Document Processing - Fully Automatic",
    body: "The AI document processing engine handles everything your staff used to do manually. It detects pages, corrects skewed phone photos, removes shadows, fixes brightness, resizes to exact print dimensions, and optimises for your printer model - the print shop computer software that eliminates the most time-consuming part of every print job.",
  },
  {
    icon: Printer,
    title: "Print Queue and Job Management",
    body: "RepetiGo connects directly to your existing printer via the Print Bridge application. The print shop job management software manages your entire queue from a single dashboard - job status, document preview, priority, customer wait time. Multi-printer setups supported. No more guessing.",
  },
  {
    icon: ScanLine,
    title: "Passport Photo Generator",
    body: "Generate government-standard passport and visa photos automatically. AI detects face boundaries, corrects background, applies correct dimensions for any country's requirements. Output is print-ready immediately - no Photoshop, no manual cropping, no sizing errors.",
  },
  {
    icon: Languages,
    title: "OCR - Extract Text from Any Document",
    body: "The OCR engine extracts text from scanned documents, handwritten forms, and image-based PDFs automatically. Supports Hindi and 10 regional Indian languages alongside English - converting physical documents into searchable, editable digital text.",
  },
  {
    icon: Trash2,
    title: "Auto-Delete After Printing",
    body: "After a print job completes, the document is automatically and permanently deleted from the RepetiGo system within 15 minutes. Not manual. Not a setting. Not something that can be forgotten - built into the architecture, protecting your customers' privacy by default.",
  },
];

const comparisonRows = [
  ["Customer privacy protection", "Built-in", "No", "No"],
  ["QR code document upload", "Yes", "No", "No"],
  ["AI document processing", "Automatic", "Manual", "No"],
  ["Direct printer integration", "Yes", "No", "No"],
  ["Auto-delete after printing", "15 min", "No", "No"],
  ["Built for Indian print shops", "Yes", "No", "Partial"],
  ["Setup time", "10 minutes", "Hours", "Instant"],
];

const products = [
  { name: "PrintPilot", desc: "The core print shop management product. QR upload, AI processing, print queue, direct printer integration, auto-delete, full business dashboard. Most shops print their first job within 30 minutes of signing up.", href: "/print-automation", status: "Available" },
  { name: "PDF Tools", desc: "Create PDFs from phone photos. Merge multiple documents, split large PDFs, compress for faster upload, and convert between formats - the PDF tools your shop needs for daily document handling.", href: "/pdf-tools", status: "Available" },
  { name: "Website to JPG", desc: "Capture any public webpage as a full-page JPG for portfolios, printing, and OG preview checks.", href: "/image-tools/website-to-image", status: "Available" },
  { name: "OCR", desc: "Extract text from any scanned document or image. Supports Hindi and 10 regional Indian languages. Converts image-based PDFs into searchable, editable text.", href: "/pdf-tools/ocr-pdf", status: "Available" },
  { name: "Passport Photo Tool", desc: "Government-standard passport and visa photos, generated automatically. Correct dimensions, correct background, correct format for any country's requirements - a significant daily revenue generator for shops that offer this service.", href: "/tools/photo/passport-photo/", status: "Available" },
  { name: "Cloud Printing", desc: "Print from anywhere, to any connected RepetiGo shop - part of the document infrastructure roadmap ahead.", href: "", status: "Coming Soon" },
  { name: "Digital Locker + eSign", desc: "Secure digital document storage and Aadhaar-based eSign, plus enterprise API access - on the roadmap as RepetiGo becomes a complete document infrastructure platform.", href: "", status: "Coming Soon" },
];

const industries = [
  { icon: Coffee, title: "Cyber Cafes", desc: "Handle high document volume without WhatsApp chaos.", benefit: "Serve 40% more customers per day", href: "/print-automation#who-its-for" },
  { icon: Printer, title: "Print Shops & Xerox", desc: "Complete printing business software. Automate every job.", benefit: "Save 150+ min manual work daily", href: "/print-automation#who-its-for" },
  { icon: Landmark, title: "CSC Centres", desc: "Printing customer-provided government documents, with audit logs and privacy-first architecture aligned with DPDP Act 2023 principles.", benefit: "Built for DPDP-aligned workflows", href: "/print-automation#who-its-for" },
  { icon: GraduationCap, title: "Schools & Colleges", desc: "Marksheets, ID cards, application forms - handled securely at scale.", benefit: "Zero staff training required", href: "/print-automation#who-its-for" },
  { icon: Building2, title: "Offices & Businesses", desc: "Automate repetitive document tasks across your team.", benefit: "Integrate with existing workflow", href: "/print-automation#who-its-for" },
];

const values = [
  { icon: ShieldCheck, title: "Security First - Always.", body: "Every product decision starts with one question: does this protect the customer's document? If the answer is no, we do not build it. End-to-end encryption, auto-deletion, and zero-retention architecture are not features. They are the foundation." },
  { icon: Zap, title: "Automation with Purpose.", body: "We automate tasks that should not require human effort. We do not automate decisions that require human judgment. RepetiGo removes the tedious - it does not replace the human." },
  { icon: Lock, title: "Privacy by Design.", body: "We do not collect data we do not need. We do not retain data beyond its purpose. Customer documents are deleted within 15 minutes of printing - not because we are required to, but because we believe that is simply the right way to handle someone else's private information." },
  { icon: Layers, title: "Simplicity that Scales.", body: "A platform serving print shops across India must work for the shop owner who is not technical, the student printing their marksheet, and the enterprise deploying it at 500 locations. Simple for the user. Scalable for the platform." },
  { icon: Gauge, title: "Reliability at the Counter.", body: "When a customer is standing at the counter, the software cannot fail. RepetiGo is built for real-world conditions - variable internet, USB printers, older hardware. It works when you need it to work." },
];

const roadmapPhases = [
  ["Phase 1", "PrintPilot - Print Shop Automation", "Available Now"],
  ["Phase 2", "PDF Tools, OCR, Passport Photo Generator", "Available Now"],
  ["Phase 3", "Cloud Printing - Print from anywhere", "Roadmap"],
  ["Phase 4", "Digital Locker - Secure document storage", "Roadmap"],
  ["Phase 5", "eSign - Aadhaar-based digital signing", "Roadmap"],
  ["Phase 6", "Enterprise APIs - Document Infrastructure", "Future"],
];

const automateRows = [
  ["Document Printing (QR upload -> AI process -> print -> delete)", "Live", ""],
  ["Passport & Visa Photo Generation", "Live", ""],
  ["PDF Tools (compress, merge, split, convert)", "Live", ""],
  ["OCR (image/scan to searchable text - Hindi + 10 languages)", "Live", ""],
  ["ID Card Printing", "Live", ""],
  ["AI Document Enhancement (shadow removal, resize, orientation)", "Live", ""],
  ["Print Queue & Job Management", "Live", ""],
  ["UPI & Razorpay Payment Collection", "Live", ""],
  ["Customer Analytics & Business Dashboard", "Live", ""],
  ["Cloud Printing (print from any location)", "", "Phase 3"],
  ["Digital Document Storage (secure, encrypted, retrievable)", "", "Phase 4"],
  ["Aadhaar-based eSign", "", "Phase 5"],
  ["Government Form Auto-Fill", "", "Phase 5"],
  ["Enterprise Document Workflow APIs", "", "Phase 6"],
];

const securityLayers = [
  { icon: Lock, title: "End-to-End Encryption", body: "AES-256 encryption at rest. TLS in transit. Documents are encrypted the moment they are uploaded, until the moment they are deleted." },
  { icon: Smartphone, title: "Direct Customer Upload", body: "Customers upload directly from their own phone. No document ever touches the shop owner's personal WhatsApp, email, or device." },
  { icon: Trash2, title: "Auto-Delete Within 15 Minutes", body: "After printing, documents are scheduled for automatic, permanent deletion within 15 minutes. Not manual. Not optional. Built into the system." },
  { icon: ShieldCheck, title: "DPDP Act Compliance", body: "RepetiGo is designed to align with India's Digital Personal Data Protection Act (DPDP Act) 2023. Zero retention by default." },
  { icon: ClipboardList, title: "Audit Logs", body: "Every print job is logged with timestamp, document type, and processing record. 7-year metadata retention for compliance - document content is never retained." },
  { icon: KeyRound, title: "Role-Based Access Control", body: "Shop owners, staff, and admins have different access levels. No staff member can access what they do not need." },
];

const testimonials = [
  {
    quote: "RepetiGo saved me 3 hours every day. My customers scan the QR, the AI does everything, I just confirm and print.",
    name: "Rakesh Sharma",
    role: "Owner, Sharma Xerox",
    city: "Jaipur",
  },
  {
    quote: "The privacy protection alone was worth it. Customers were uncomfortable sending Aadhaar to my WhatsApp. Now they scan a QR.",
    name: "Priya Nair",
    role: "Owner, Digital Point",
    city: "Kochi",
  },
  {
    quote: "The passport photo tool alone pays for the subscription. I make 25-30 passport photos per day without Photoshop.",
    name: "Amit Patel",
    role: "Owner, Patel Cyber Cafe",
    city: "Ahmedabad",
  },
];

const faqs = [
  {
    q: "What is print shop software?",
    a: "Print shop software is a platform that helps print shops, cyber cafes, and document service centres manage the full workflow of receiving, processing, and printing customer documents. RepetiGo is AI-powered print shop software that replaces manual WhatsApp-based document handling with secure QR code uploads, automated AI processing, and direct printer integration - with every document auto-deleted after printing.",
  },
  {
    q: "What is the best print shop software in India?",
    a: "RepetiGo is built specifically for Indian cyber cafes, print shops, and CSC centres handling sensitive documents like Aadhaar and PAN cards daily. It automates the full workflow - secure QR upload, AI processing, direct printing, and auto-deletion - in a platform that sets up in 10 minutes and works on any standard Indian printer (HP, Canon, Epson, Brother, Xerox).",
  },
  {
    q: "What is RepetiGo and what does it do?",
    a: "RepetiGo is an AI-powered document automation platform. Its first product, PrintPilot, is print shop software for cyber cafes, print shops, and CSC centres. RepetiGo replaces insecure WhatsApp-based document handling with a secure QR code upload system, automates document processing with AI, connects directly to printers, and auto-deletes every document within 15 minutes of printing.",
  },
  {
    q: "Is there a free version of RepetiGo?",
    a: "RepetiGo offers a 14-day free trial with full access to all features, including the PrintPilot dashboard, QR upload, AI processing, and direct printer integration. No credit card is required to start. Paid plans are available on the pricing page after the trial.",
  },
  {
    q: "How does QR code document upload work for customers?",
    a: "Your shop receives a unique QR code from RepetiGo. You place it at your counter. When a customer needs to print, they scan the QR code with their phone camera, which opens a secure upload page directly in their browser - no app download required. The document goes encrypted into your print queue and never touches your personal WhatsApp or email.",
  },
  {
    q: "Is it safe to print documents at a cyber cafe using RepetiGo?",
    a: "Yes. At a RepetiGo-enabled shop, customers upload directly from their own phone via a QR code. The document is encrypted end-to-end using AES-256 standards, is never saved to the shop owner's personal device, WhatsApp, or email, and is automatically deleted from the system within 15 minutes after printing.",
  },
  {
    q: "What happens to customer documents after printing?",
    a: "Documents are automatically and permanently deleted from the RepetiGo system within 15 minutes of a successful print job. This is not a manual process - it is built into the system architecture. Only minimal job metadata (timestamp, page count, print settings) is retained in the audit log for business records.",
  },
  {
    q: "Does RepetiGo work with my existing printer?",
    a: "Yes. RepetiGo works with standard USB and network printers commonly used in Indian print shops - including HP, Canon, Epson, Brother, and Xerox models. You install the RepetiGo Print Bridge application on the computer connected to your printer. Setup takes approximately 10 minutes and no new hardware purchase is required.",
  },
  {
    q: "What is print shop management software and how is RepetiGo different?",
    a: "Print shop management software manages the operational side of a print business - jobs, queues, billing, and scheduling. RepetiGo also transforms how documents arrive at the shop, replacing insecure WhatsApp sharing with encrypted QR upload, and adds AI processing to eliminate manual document preparation.",
  },
  {
    q: "How long does RepetiGo take to set up?",
    a: "Most print shops are fully operational with RepetiGo in under 10 minutes. You sign up, install the Print Bridge application on your counter computer, connect your printer, and place your QR code at the counter. There is no training required for staff.",
  },
  {
    q: "Is RepetiGo screen printing shop software?",
    a: "No. RepetiGo is not screen printing shop management software. Screen printing is a specialised production process for printing on fabric, merchandise, and custom products. RepetiGo serves document print shops - cyber cafes, Xerox centres, CSC centres, and offices that print documents like Aadhaar cards, PAN cards, marksheets, and forms.",
  },
  {
    q: "Is WhatsApp safe for sending documents to a print shop?",
    a: "No. WhatsApp was not designed as a document handling platform. When a customer sends their Aadhaar card or PAN card via WhatsApp, the file is stored on the shop owner's personal phone, on WhatsApp's servers, and in the phone's media gallery indefinitely, with no auto-deletion - creating privacy risk and data liability under India's DPDP Act 2023. RepetiGo exists specifically to replace this workflow.",
  },
];

export default function Home() {
  return (
    <main className="ai-landing-shell">
      <LandingNavbar />
      <Hero />
      <SocialProof />
      <WhatIsRepetiGo />
      <WhyExists />
      <Mission />
      <Vision />
      <Values />
      <WhatWeAutomate />
      <Problem />
      <Solution />
      <HowItWorks />
      <Features />
      <InlineCTA />
      <WhyRepetigo />
      <FutureRoadmap />
      <Products />
      <Industries />
      <Security />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <PublicFooter />
      <HomeSchema />
    </main>
  );
}

function Hero() {
  return (
    <section className="ai-hero">
      <div className="ai-dot-pattern ai-dot-pattern-left" aria-hidden />
      <div className="ai-dot-pattern ai-dot-pattern-right" aria-hidden />
      <div className="ai-hero-wash" aria-hidden />
      <div className="ai-container ai-hero-grid">
        <div>
          <SectionTag icon={Sparkles}>AI-powered print shop automation</SectionTag>
          <h1>
            Stop Repetitive Work. Run Your Print Shop on <span>Autopilot.</span>
          </h1>
          <p>
            RepetiGo is an AI-powered software platform for cyber cafés and print shops that streamlines document printing, passport photo formatting, PDF form filling assistance, PDF tools, agreement preparation, and customer workflows.
          </p>
          <div className="ai-actions">
            <Link className="ai-btn ai-btn-gradient" href="/register">
              Start Free Trial - No Credit Card <ArrowRight size={17} />
            </Link>
            <a className="ai-btn ai-btn-light" href="#demo">
              <Play size={17} /> Watch Demo (2 min)
            </a>
          </div>
          <ul className="ai-trust-grid">
            {trust.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <span><Icon size={20} /></span>
                  {item.label}
                </li>
              );
            })}
          </ul>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="ai-hero-visual">
      <img
        className="ai-dashboard-image"
        src="/hero-print-queue.jpeg"
        alt="RepetiGo live print queue dashboard"
      />
      <HeroStepsProgress />
    </div>
  );
}

function SocialProof() {
  return (
    <section className="ai-social-proof">
      <div className="ai-container ai-stat-grid">
        {socialStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div className="ai-stat" key={stat.label}>
              <span><Icon size={20} /></span>
              <div>
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WhatIsRepetiGo() {
  return (
    <section className="ai-container ai-narrow ai-section">
      <SectionTag icon={Compass}>Meet RepetiGo</SectionTag>
      <h2>What Is RepetiGo?</h2>
      <div className="ai-copy-stack">
        <p>
          RepetiGo is an AI-powered document automation platform. We build software that eliminates repetitive,
          manual, insecure document work - one workflow at a time. Today, that means print shop automation.
          Tomorrow, it means complete document infrastructure for every business in India.
        </p>
        <p>
          We are not just another piece of print management software. RepetiGo is a platform. PrintPilot is our
          first product - the entry point into a much larger vision of what document work can look like when
          intelligence replaces manual effort.
        </p>
        <p>
          Think of RepetiGo the way you think of Stripe for payments, or Shopify for commerce. We are building the
          infrastructure layer for document service businesses - starting with the print shops, cyber cafes, and CSC
          centres that process India&apos;s most sensitive documents every day.
        </p>
      </div>
      <div className="tool-seo-callout">
        <p>🤖 RepetiGo is the brand. PrintPilot is the product. The platform is the mission.</p>
      </div>
    </section>
  );
}

function WhyExists() {
  return (
    <section className="ai-soft-section">
      <div className="ai-container ai-narrow">
        <SectionTag icon={Target}>Why We Exist</SectionTag>
        <h2>Why RepetiGo Exists.</h2>
        <div className="ai-copy-stack">
          <p>
            Every day in India, millions of Aadhaar cards, PAN cards, medical records, and bank statements travel
            over WhatsApp to reach a print shop counter.
          </p>
          <p>
            Think about what that means. A customer sends their most sensitive identity document - the one that
            proves who they are to the Indian government - to a stranger&apos;s personal phone number. The shop owner
            receives it on the same device where family photos, personal messages, and payment details live. The
            document sits in WhatsApp forever, accessible to anyone who picks up the phone.
          </p>
          <p>No one intended for this to become the document infrastructure of India. It just happened because there was nothing better.</p>
          <p>
            On the other side of the counter, the shop owner spends 3 to 5 minutes per document manually resizing,
            reformatting, correcting orientation, and adjusting print settings - for every single job, every single
            day. A busy shop loses 3 to 4 hours of productive time to repetitive manual work that a machine could do
            in 30 seconds.
          </p>
          <p><strong>Two problems. One platform. That is why RepetiGo exists.</strong></p>
        </div>
        <div className="tool-seo-callout">
          <p>
            ⚠️ WhatsApp document sharing violates customer privacy and creates data liability under India&apos;s Digital
            Personal Data Protection Act (DPDP Act) 2023. RepetiGo exists to replace it.
          </p>
        </div>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section className="ai-container ai-narrow ai-section">
      <SectionTag icon={Target}>Our Mission</SectionTag>
      <h2>Our Mission.</h2>
      <div className="ai-copy-stack">
        <p><strong>Make repetitive document work disappear.</strong></p>
        <p>
          Not simplify it. Not organise it. Make it disappear - so the business owner can focus on serving customers
          instead of fighting with files.
        </p>
        <p>
          Every feature we build, every product we launch, every line of code we write asks the same question: does
          this eliminate a repetitive task that a human should never have to do twice?
        </p>
      </div>
    </section>
  );
}

function Vision() {
  return (
    <section className="ai-soft-section">
      <div className="ai-container ai-narrow">
        <SectionTag icon={Rocket}>Our Vision</SectionTag>
        <h2>Where RepetiGo Is Going.</h2>
        <div className="ai-copy-stack">
          <p>Print shop automation is where we begin. Document infrastructure is where we are going.</p>
          <p>
            Soon, when a customer walks into a RepetiGo-enabled shop anywhere in India, they will be able to print
            any document, generate a passport photo, extract text from a scanned form via OCR, sign digitally, store
            securely in a digital locker, and retrieve it from any device - without sharing a single file over
            WhatsApp, email, or USB.
          </p>
          <p>
            Further ahead, enterprise teams, government agencies, legal firms, and hospitals will use RepetiGo&apos;s
            API to build document workflows into their own systems - the same way developers use Stripe&apos;s API for
            payments today.
          </p>
          <p>That is the vision. One document platform. Infinite use cases. Starting here, starting now, starting with print shops.</p>
        </div>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead>
              <tr><th>Phase</th><th>Product / Capability</th><th>Status</th></tr>
            </thead>
            <tbody>
              {roadmapPhases.map(([phase, capability, status]) => (
                <tr key={phase}>
                  <td>{phase}</td>
                  <td>{capability}</td>
                  <td><ValueCell value={status} good={status === "Available Now"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Values() {
  return (
    <section className="ai-container ai-section">
      <div className="ai-section-head">
        <SectionTag icon={ShieldCheck}>What We Stand For</SectionTag>
        <h2>What We Stand For.</h2>
      </div>
      <div className="ai-card-grid">
        {values.map((value) => <InfoCard key={value.title} {...value} />)}
      </div>
    </section>
  );
}

function WhatWeAutomate() {
  return (
    <section className="ai-soft-section">
      <div className="ai-container">
        <SectionTag icon={Layers}>What We Automate</SectionTag>
        <h2>Everything We Automate - Today and Tomorrow.</h2>
        <p>
          RepetiGo is not a single-feature tool. It is a growing platform that automates an expanding universe of
          document tasks. Here is what we automate today - and what is coming:
        </p>
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead>
              <tr><th>What We Automate</th><th>Today</th><th>Tomorrow</th></tr>
            </thead>
            <tbody>
              {automateRows.map(([task, today, tomorrow]) => (
                <tr key={task}>
                  <td>{task}</td>
                  <td>{today ? <ValueCell value="Live" good /> : ""}</td>
                  <td>{tomorrow ? <ValueCell value={tomorrow} /> : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tool-seo-callout">
          <p>
            💡 When we say &quot;document infrastructure&quot;, this is what we mean - every layer of the document
            journey, automated, secured, and delivered. RepetiGo is building this layer by layer.
          </p>
        </div>
      </div>
    </section>
  );
}

function FutureRoadmap() {
  return (
    <section className="ai-container ai-narrow ai-section">
      <SectionTag icon={Rocket}>Roadmap</SectionTag>
      <h2>The Future of RepetiGo.</h2>
      <div className="ai-copy-stack">
        <p>
          RepetiGo is not a finished product. It is a growing platform. Every phase adds a new layer of automation
          that eliminates another class of repetitive document work.
        </p>
        <p>
          Phase 1 is complete - PrintPilot is live, serving print shops and cyber cafes across India. Phase 2 is
          live - PDF tools, OCR, and the passport photo generator are available now. The roadmap ahead is ambitious,
          and built on what print shop owners and their customers actually need.
        </p>
      </div>
      <div className="tool-seo-callout">
        <p>
          🤖 By the time RepetiGo reaches Phase 6, a business will be able to receive, process, sign, store,
          retrieve, and audit any document - without a single human task that a machine could do instead. That is
          what document infrastructure looks like.
        </p>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="ai-container ai-narrow ai-section">
      <SectionTag>The Problem</SectionTag>
      <h2>Your Print Shop Has a Document Problem Nobody Talks About.</h2>
      <div className="ai-copy-stack">
        <p>Walk into any cyber cafe or print shop in India today. Watch what happens when a customer needs to print their Aadhaar card.</p>
        <blockquote>"Send it on WhatsApp," the owner says.</blockquote>
        <p>The customer shares one of the most sensitive government-issued documents they own over a personal phone number, to a stranger's device, with no guarantee it will ever be deleted.</p>
        <p>The shop owner downloads it, opens it, manually adjusts the size, fixes the orientation, figures out the print settings, and finally prints it. Five minutes gone. The document is still on their phone.</p>
        <p><strong>This is how document printing works in India. Right now. Today. In hundreds of thousands of shops.</strong></p>
      </div>
      <div className="ai-two-grid">
        <InfoCard icon={Smartphone} title="Customer Documents on Your Personal WhatsApp. Every Day." body="Aadhaar, PAN, marksheets, medical reports - sitting on your phone. Under the DPDP Act 2023, storing personal data without consent creates serious legal risk." danger />
        <InfoCard icon={Clock} title="3 to 5 Minutes of Manual Work. Per Document." body="Skewed phone photos. Wrong sizes. Manual cropping, rotating, adjusting margins. 50 documents a day equals 150+ minutes of pure labour software should handle." danger />
      </div>
      <p className="ai-center-note">It does not have to work this way. →</p>
    </section>
  );
}

function Solution() {
  const rows = [
    ["Customer sends Aadhaar on WhatsApp", "Customer scans QR - nothing on WhatsApp"],
    ["Document sits on your phone forever", "Scheduled for auto-deletion shortly after printing"],
    ["3-5 minutes manual editing per document", "AI processes everything in under 30 seconds"],
    ["Print settings guessed manually each time", "Optimal settings applied automatically"],
    ["No record of what was printed or when", "Full print log in your dashboard"],
  ];

  return (
    <section className="ai-dark-section">
      <div className="ai-container">
        <div className="ai-section-head">
          <SectionTag variant="dark">The Solution</SectionTag>
          <h2>Meet PrintPilot. Print Shop Software Built Differently.</h2>
          <p>
            PrintPilot is RepetiGo&apos;s flagship product - the print shop software that replaces the WhatsApp
            workflow entirely. Customers upload securely via QR code, AI processes the document automatically, and
            the file auto-deletes within 15 minutes. This is print shop computer software built for Indian cyber
            cafes, print shops, and CSC centres - not for large commercial printers in the US or Europe.
          </p>
        </div>
        <div className="ai-before-after">
          <div className="ai-ba-head"><span><X size={16} /> Before RepetiGo</span><span><Check size={16} /> After RepetiGo</span></div>
          {rows.map(([before, after]) => (
            <div className="ai-ba-row" key={before}><span>{before}</span><strong>{after}</strong></div>
          ))}
        </div>
        <div className="ai-actions">
          <Link className="ai-btn ai-btn-white" href="/print-automation">Try PrintPilot Free <ArrowRight size={17} /></Link>
          <Link className="ai-btn ai-btn-glass" href="/print-automation#features">View All Features</Link>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="ai-container ai-section" id="demo">
      <div className="ai-section-head">
        <SectionTag>How It Works</SectionTag>
        <h2>From Customer to Printed Document in 4 Steps.</h2>
        <p>Simple enough that any customer can use without instructions. Powerful enough to replace an entire manual workflow.</p>
      </div>
      <div className="ai-four-grid">
        {howSteps.map((step, index) => <StepCard key={step.title} step={index + 1} {...step} />)}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="ai-soft-section" id="features">
      <div className="ai-container">
        <div className="ai-section-head">
          <SectionTag>Features</SectionTag>
          <h2>Complete Print Shop Management Software - In One Platform.</h2>
          <p>
            Every feature your print shop needs. Not a collection of separate tools you have to stitch together. One
            system - the print management software built for how Indian print shops actually work.
          </p>
        </div>
        <div className="ai-card-grid">
          {features.map((feature) => <InfoCard key={feature.title} {...feature} />)}
        </div>
      </div>
    </section>
  );
}

function InlineCTA() {
  return (
    <section className="ai-container ai-inline-wrap">
      <div className="ai-inline-cta">
        <div>
          <h3>Ready to automate your print shop?</h3>
          <p>14 days free. No credit card. Works with your existing printer.</p>
        </div>
        <div className="ai-actions">
          <Link className="ai-btn ai-btn-white" href="/register">Start Free Trial <ArrowRight size={17} /></Link>
          <a className="ai-btn ai-btn-glass" href="/print-automation">View All Features</a>
        </div>
      </div>
    </section>
  );
}

function WhyRepetigo() {
  return (
    <section className="ai-container ai-section">
      <div className="ai-section-head">
        <SectionTag>Why RepetiGo</SectionTag>
        <h2>The Only Software for Print Shops Built for Indian Businesses.</h2>
        <p>
          Most print management software was built for large commercial printers in the US or Europe. RepetiGo was
          built for the print shop that serves 50 to 200 customers daily, handles sensitive government documents
          like Aadhaar and PAN cards, uses standard USB or network printers, and needs everything to work without an
          IT department.
        </p>
      </div>
      <div className="ai-two-grid">
        <InfoCard
          icon={Store}
          title="Built for Small Print Shops - Not Enterprise Giants"
          body="This is small print shop management software for real shop owners. Setup takes 10 minutes. No technical background required. If you have a printer and a Wi-Fi connection, you have everything you need. Software for managing print shops efficiently should not require a consultant. RepetiGo does not."
        />
        <InfoCard
          icon={Target}
          title="Built to Fit the Indian Print Shop Counter"
          body="For the best print shop software for small business owners in India, the question is not about features - it is about fit. RepetiGo fits the Indian print shop counter, the cyber cafe with two printers and a WhatsApp problem, and the CSC centre printing government forms for hundreds of customers a day."
        />
      </div>
      <div className="ai-table-wrap">
        <table className="ai-table">
          <thead>
            <tr><th>Capability</th><th>RepetiGo</th><th>Generic PDF Tools</th><th>WhatsApp Workflow</th></tr>
          </thead>
          <tbody>
            {comparisonRows.map(([cap, repetigo, generic, whatsapp]) => (
              <tr key={cap}>
                <td>{cap}</td>
                <td><ValueCell value={repetigo} good /></td>
                <td><ValueCell value={generic} /></td>
                <td><ValueCell value={whatsapp} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Products() {
  return (
    <section className="ai-soft-section">
      <div className="ai-container">
        <div className="ai-section-head">
          <SectionTag>Products</SectionTag>
          <h2>A Growing Platform. Starting with What You Need Today.</h2>
          <p>RepetiGo is a document infrastructure platform. We launch capabilities in phases - each one designed to eliminate a specific layer of repetitive document work.</p>
        </div>
        <div className="ai-card-grid">
          {products.map((product) => {
            const isFlagship = product.name === "PrintPilot";
            const cardClassName = isFlagship ? "ai-product-card ai-product-card-flagship" : "ai-product-card";
            const cardContent = (
              <>
                {isFlagship ? <Sparkles className="ai-product-flagship-icon" size={16} aria-hidden /> : null}
                <div>
                  <span className={product.status === "Available" ? "ai-pill success" : "ai-pill"}>{product.status}</span>
                  {product.href ? <ChevronRight size={17} /> : null}
                </div>
                <h3>{product.name}</h3>
                <p>{product.desc}</p>
              </>
            );
            if (!product.href) {
              return <div className={cardClassName} key={product.name}>{cardContent}</div>;
            }
            return (
              <Link className={cardClassName} href={product.href} key={product.name}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Industries() {
  return (
    <section className="ai-container ai-section">
      <div className="ai-section-head">
        <SectionTag>Industries</SectionTag>
        <h2>Built for Every Business That Handles Documents.</h2>
      </div>
      <div className="ai-card-grid">
        {industries.map((industry) => {
          const Icon = industry.icon;
          return (
            <Link className="ai-industry-card" href={industry.href} key={industry.title}>
              <span><Icon size={24} /></span>
              <h3>{industry.title}</h3>
              <p>{industry.desc}</p>
              <strong>{industry.benefit}<ArrowRight size={16} /></strong>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function Security() {
  return (
    <section className="ai-dark-section ai-security">
      <div className="ai-container">
        <div className="ai-section-head">
          <SectionTag variant="dark">Security</SectionTag>
          <h2>Document Security That Never Sleeps.</h2>
          <p>Privacy is not a feature in RepetiGo. It is the architecture.</p>
        </div>
        <div className="ai-card-grid">
          {securityLayers.map((layer) => <InfoCard key={layer.title} {...layer} dark />)}
        </div>
        <div className="ai-centered-action">
          <Link href="/privacy-policy">Read our full Security Policy <ArrowRight size={17} /></Link>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="ai-container ai-section">
      <div className="ai-section-head">
        <SectionTag>Testimonials</SectionTag>
        <h2>What Print Shop Owners Say About RepetiGo.</h2>
      </div>
      <div className="ai-three-grid">
        {testimonials.map((testimonial) => (
          <figure className="ai-testimonial" key={testimonial.name}>
            <div>{Array.from({ length: 5 }).map((_, i) => <Star fill="currentColor" size={16} key={i} />)}</div>
            <blockquote>"{testimonial.quote}"</blockquote>
            <figcaption>
              <span>{testimonial.name.charAt(0)}</span>
              <p><strong>{testimonial.name}</strong><small>{testimonial.role} - {testimonial.city}</small></p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="ai-join-band">
        <p><Users size={24} /> Join Print Shops Across India Using RepetiGo</p>
        <Link className="ai-btn ai-btn-navy" href="/register">Start Free Trial <ArrowRight size={17} /></Link>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="ai-soft-section">
      <div className="ai-container ai-faq-container">
        <div className="ai-section-head">
          <SectionTag>FAQ</SectionTag>
          <h2>Questions Print Shop Owners Ask Most.</h2>
        </div>
        <div className="ai-faq-list">
          {faqs.map((faq) => (
            <details className="ai-faq-item" key={faq.q}>
              <summary><span>{faq.q}</span><em>+</em></summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const checks = ["Full access for 14 days", "Works with your existing printer", "Cancel anytime", "Setup in 10 minutes"];
  return (
    <section className="ai-final-cta">
      <div className="ai-container">
        <h2>Your Print Shop. Automated. Starting Today.</h2>
        <p>
          Every day you use WhatsApp to receive documents, you are creating a data liability you did not sign up
          for. Every day your staff spends 3 to 5 minutes preparing each document, you are losing time that should
          be serving customers. RepetiGo ends both problems - in 10 minutes of setup. The best print shop software
          for small business owners in India should not be expensive, complicated, or require an IT team. RepetiGo
          is none of those things.
        </p>
        <div className="ai-actions centered">
          <Link className="ai-btn ai-btn-brand" href="/register">Start Free Trial - No Credit Card <ArrowRight size={17} /></Link>
          <Link className="ai-btn ai-btn-glass" href="/contact-us">Book a 15-Min Demo</Link>
        </div>
        <ul>
          {checks.map((check) => <li key={check}><Check size={16} />{check}</li>)}
        </ul>
      </div>
    </section>
  );
}

function HomeSchema() {
  const schemaGraph = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "RepetiGo",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "AI-powered print shop software platform for document service businesses in India.",
      url: pageUrl,
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: "0",
        description: "14-day free trial. No credit card required.",
        url: `${siteUrl}/pricing`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to Use RepetiGo Print Shop Software",
      description: "Process customer documents securely in 4 steps - scan, upload, AI process, print and auto-delete.",
      step: howSteps.map((step, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.title,
        text: step.body,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
  ];

  return (
    <>
      {schemaGraph.map((schema) => (
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={schema["@type"]}
          type="application/ld+json"
        />
      ))}
    </>
  );
}

function StepCard({ icon: Icon, step, title, body }: { icon: IconType; step: number; title: string; body: string }) {
  return (
    <article className="ai-step-card">
      <span>STEP {step}</span>
      <div><Icon size={24} /></div>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function InfoCard({ icon: Icon, title, body, danger = false, dark = false }: { icon: IconType; title: string; body: string; danger?: boolean; dark?: boolean }) {
  return (
    <article className={dark ? "ai-info-card dark" : "ai-info-card"}>
      <span className={danger ? "danger" : undefined}><Icon size={21} /></span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function ValueCell({ value, good = false }: { value: string; good?: boolean }) {
  const isNo = value.toLowerCase() === "no";
  return (
    <span className={good ? "ai-value good" : isNo ? "ai-value muted" : "ai-value"}>
      {good ? <Check size={16} /> : isNo ? <X size={16} /> : null}
      {value}
    </span>
  );
}

function SectionTag({ children, variant = "light", icon: Icon = Zap }: { children: ReactNode; variant?: "light" | "dark"; icon?: IconType }) {
  return (
    <span className={variant === "dark" ? "ai-section-tag dark" : "ai-section-tag"}>
      <Icon size={13} /> {children}
    </span>
  );
}
