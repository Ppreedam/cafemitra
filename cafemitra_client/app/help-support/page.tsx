import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  Bug,
  Check,
  CircleHelp,
  Clock3,
  CreditCard,
  Download,
  FileText,
  Lightbulb,
  Lock,
  Mail,
  MessageCircle,
  PlayCircle,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";
import { PublicFooter } from "../PublicFooter";

export const metadata: Metadata = {
  title: "RepetiGo Help & Support Center - Print Shop Software Guides",
  description:
    "Get help with RepetiGo print shop software. Troubleshooting guides, setup instructions, FAQs, downloads, and contact support for Indian print shops and cyber cafes.",
};

const popularSearches = ["Printer offline", "Upload failed", "QR not working", "Cancel subscription", "Connect printer", "Aadhaar printing"];

const categories = [
  { icon: Zap, title: "Getting Started", body: "Account setup, first print, printer connection.", count: "6 articles" },
  { icon: Printer, title: "Printer Setup & Troubleshooting", body: "Connect printers, fix offline errors, Print Bridge.", count: "12 articles" },
  { icon: QrCode, title: "Document Upload & QR Code", body: "QR upload flow, file types, upload errors.", count: "8 articles" },
  { icon: Bot, title: "AI Processing", body: "Enhancement settings, OCR, passport photo.", count: "9 articles" },
  { icon: CreditCard, title: "Billing & Subscriptions", body: "Plans, invoices, cancellations, refunds.", count: "10 articles" },
  { icon: Lock, title: "Security & Privacy", body: "DPDP, auto-delete, encryption, account safety.", count: "7 articles" },
  { icon: Activity, title: "Dashboard & Analytics", body: "Reports, revenue tracking, job history.", count: "6 articles" },
  { icon: FileText, title: "Integrations & API", body: "API docs, webhooks, Razorpay, UPI setup.", count: "8 articles" },
];

const setupSteps = [
  ["1", "2 min", "Create Your Account", "Sign up, verify email, and complete your shop profile."],
  ["2", "3 min", "Download Print Bridge", "Install the Windows app on the computer connected to your printer."],
  ["3", "3 min", "Connect Your Printer", "Open Print Bridge and follow the setup wizard."],
  ["4", "1 min", "Get Your QR Code", "Download and print your shop QR code from dashboard settings."],
  ["5", "1 min", "Print Your First Job", "Scan your own QR, upload a test file, and watch it print."],
];

const troubleshooting = [
  {
    title: "Printer Offline or Not Responding",
    symptom: "Printer shows Offline in dashboard. Jobs are queued but not printing.",
    causes: ["Print Bridge is not running", "Printer is asleep or powered off", "Cable disconnected", "Firewall blocking Print Bridge"],
    steps: ["Power on the printer and wake it from sleep.", "Open Print Bridge and confirm it shows Connected.", "If disconnected, click Reconnect and wait 30 seconds.", "Restart Print Bridge, then refresh your RepetiGo dashboard."],
  },
  {
    title: "Document Upload Failed",
    symptom: "Customer gets an upload error and the file does not appear in your queue.",
    causes: ["File exceeds plan limit", "Unsupported file format", "Poor mobile internet", "Phone browser cache issue"],
    steps: ["Check file size. Compress files above 25MB.", "Confirm format is PDF, JPG, PNG, DOCX, HEIC, or TIFF.", "Ask the customer to rescan the QR code and retry in a fresh session."],
  },
  {
    title: "QR Code Not Scanning",
    symptom: "Phone camera cannot read the QR code or upload page does not load.",
    causes: ["Low-quality QR print", "Third-party scanner issue", "Expired or inactive QR code"],
    steps: ["Print QR clearly at A5 size or larger on white paper.", "Use the default phone camera app.", "Regenerate QR from dashboard and reprint it."],
  },
  {
    title: "AI Processing Looks Wrong",
    symptom: "Processed document is over-cropped, too dark, or rotated incorrectly.",
    causes: ["Poor source photo", "Wrong crop defaults", "Unusual document layout"],
    steps: ["Open job preview and adjust crop, brightness, or rotation.", "Update AI Settings defaults for recurring document types."],
  },
  {
    title: "Payment Failed or Not Recorded",
    symptom: "Customer paid but the transaction is not visible in dashboard.",
    causes: ["UPI confirmation delay", "Delayed payment webhook", "Payment gateway issue"],
    steps: ["Wait 2 minutes and refresh dashboard.", "Check Billing > Transactions by date and amount.", "Contact billing@repetigo.com with the transaction reference."],
  },
];

const faqGroups = [
  {
    topic: "Getting Started",
    items: [
      ["What is RepetiGo and what does it do?", "RepetiGo is AI-powered print shop software for cyber cafes, print shops, and CSC centres in India. Customers scan a QR code, upload documents from their own phone, and documents are processed and printed securely without WhatsApp sharing."],
      ["How long does setup take?", "Most shops are fully set up and printing their first job within 10 minutes after account creation, Print Bridge installation, printer connection, and QR placement."],
      ["Is there a free trial?", "Yes. New accounts get a 14-day free trial with full access to PrintPilot. No credit card is required to start."],
      ["Which printers does RepetiGo support?", "RepetiGo works with most standard USB and network printers from HP, Canon, Epson, Brother, Xerox, and other major brands."],
      ["Can I use RepetiGo on mobile?", "The shop dashboard is mobile-responsive. End customers already use mobile phones to scan QR codes and upload documents."],
    ],
  },
  {
    topic: "Document Upload & QR",
    items: [
      ["How does QR code upload work?", "Your shop receives a unique QR code. Customers scan it with their phone camera, open a secure upload page, and send files directly into your encrypted print queue."],
      ["Can customers upload without an account?", "Yes. End customers do not need a RepetiGo account. They scan the QR code and upload without login or registration."],
      ["What file types are supported?", "PDF, JPG, PNG, DOCX, XLSX, HEIC, and TIFF are supported. File limits depend on your plan."],
      ["Can customers upload multiple files?", "Yes. Multiple files can be selected and submitted together for queue processing."],
      ["What happens if a customer sends the wrong file?", "The customer or shop owner can cancel the job before printing starts. Cancelled jobs are deleted like completed jobs."],
    ],
  },
  {
    topic: "AI Processing",
    items: [
      ["What does the AI do to documents?", "AI detects pages, corrects orientation, removes shadows, enhances contrast, resizes images, and optimises print settings."],
      ["Does AI read or store document content?", "No. AI analyses visual properties for processing. Documents are not used to train public AI models."],
      ["How do I generate a passport photo?", "Go to Dashboard > New Job > Passport Photo, upload a face photo, and RepetiGo creates a print-ready government-standard output."],
      ["Can I turn off AI processing?", "Yes. In job preview, disable AI to send a document to print as-is."],
      ["Why does OCR sometimes produce incorrect text?", "OCR depends on source quality. Low-resolution, handwritten, or unusual-font documents may produce errors."],
    ],
  },
  {
    topic: "Security & Privacy",
    items: [
      ["How secure is RepetiGo?", "Documents are encrypted in transit and at rest, automatically deleted after printing, and kept away from personal WhatsApp workflows."],
      ["What happens after printing?", "Documents are automatically and permanently deleted within the configured retention window. Only job metadata remains for audit records."],
      ["Can the shop owner download customer documents?", "Documents are visible only for review and printing. Downloading or forwarding is restricted and access is logged."],
      ["Is RepetiGo DPDP aligned?", "RepetiGo is designed around purpose limitation, storage limitation, data minimisation, and security safeguards."],
      ["Can I request account data deletion?", "Yes. Contact privacy@repetigo.com from your account email. Some statutory records may be retained where required by law."],
    ],
  },
  {
    topic: "Billing & Hardware",
    items: [
      ["How does billing work?", "Subscriptions are billed monthly or annually. Invoices are available from the dashboard."],
      ["What payment methods are accepted?", "UPI, debit cards, credit cards, and net banking are supported through payment gateway partners."],
      ["How do I cancel my subscription?", "Go to Dashboard > Billing > Subscription > Cancel Plan. Access remains until the end of the current period."],
      ["Can I connect multiple printers?", "Yes. Business and Enterprise plans support multiple printers through Print Bridge."],
      ["Does RepetiGo work without internet?", "Print Bridge has limited offline queuing. AI processing requires internet and resumes when connectivity returns."],
    ],
  },
];

const docs = [
  ["PrintPilot", "Overview · Queue Management · Dashboard · Auto-Delete · Multi-Printer · Analytics · Offline Mode"],
  ["QR Upload", "How It Works · Customising QR Code · Troubleshooting · Security Architecture"],
  ["AI Processing", "Enhancement Pipeline · OCR · Passport Photo · Supported Formats · AI Settings"],
  ["PDF Tools", "Compress · Merge · Split · Convert · Rotate · Word to PDF"],
  ["Billing", "Plans & Pricing · Invoices · Payment Methods · Upgrades · Cancellation · Refunds"],
  ["Security", "Encryption Standards · DPDP Compliance · Auto-Delete Policy · Audit Logs"],
  ["API & Integrations", "Authentication · Endpoints · Rate Limits · Webhooks · Razorpay Setup"],
];

const videos = [
  ["Getting Started with RepetiGo", "5:00", "Beginner"],
  ["Connect Your Printer Using Print Bridge", "3:30", "Beginner"],
  ["Setting Up Your Shop QR Code", "1:45", "Beginner"],
  ["AI Document Enhancement", "4:30", "Feature"],
  ["Generating Passport Photos", "2:00", "Feature"],
  ["Fix: Printer Shows Offline", "2:30", "Troubleshooting"],
];

const downloads = [
  [Download, "Print Bridge", "Connects your printer to the RepetiGo cloud.", "Windows 10/11", "Available"],
  [Smartphone, "Mobile App - iOS", "Manage your shop queue from iPhone or iPad.", "iOS", "Roadmap"],
  [Smartphone, "Mobile App - Android", "Manage your shop queue from Android.", "Android", "Roadmap"],
  [BookOpen, "Quick Start Guide", "Printable one-pager for setup in 10 minutes.", "Any", "Available"],
  [FileText, "API Documentation", "Full REST API reference for developers.", "Any", "Available"],
] as const;

const community = [
  [Lightbulb, "Feature Requests", "Vote on what gets built next.", "ideas.repetigo.com"],
  [Bug, "Bug Reports", "Report bugs and track fixes.", "bugs.repetigo.com"],
  [Activity, "Product Roadmap", "See what we are building next.", "roadmap.repetigo.com"],
  [BookOpen, "Release Notes", "Every update, fix, and feature listed.", "repetigo.com/changelog"],
] as const;

const channels = [
  [MessageCircle, "Live Chat", "Quick questions, guided setup, real-time troubleshooting", "Mon-Sat 9-7 IST", "< 5 min", true],
  [Mail, "Email Support", "Detailed technical issues, account problems, bug reports", "24/7 intake", "< 24 hrs", false],
  [MessageCircle, "WhatsApp", "Quick shop-owner queries in Hindi and English", "Mon-Sat 9-7 IST", "< 2 hrs", false],
  [CreditCard, "Billing", "Invoices, refunds, payment disputes, plan changes", "Mon-Fri 9-6 IST", "< 4 hrs", false],
  [Users, "Enterprise", "Multi-location setup, custom SLA, API integration", "By appointment", "Same day", false],
] as const;

const trustResources = [
  ["System Status", "Live health of dashboard, print queue, AI, and API.", "status.repetigo.com"],
  ["Incident History", "Past incidents with root-cause analysis.", "status.repetigo.com/history"],
  ["Security Center", "Encryption, DPDP, auto-delete, audit logs.", "/privacy-policy"],
  ["Privacy Policy", "How we protect data and documents.", "/privacy-policy"],
  ["Terms of Service", "Legal terms governing RepetiGo.", "/terms-conditions"],
];

export default function HelpSupportPage() {
  return (
    <main className="support-shell">
      <LandingNavbar />

      <section className="support-hero">
        <div className="support-container">
          <span className="support-kicker">
            <CircleHelp size={14} /> Support Center
          </span>
          <h1>How Can We Help You?</h1>
          <p>Find guides, fix common issues, and get answers - without waiting for a support ticket.</p>
          <form className="support-search" action="/help-support">
            <Search size={22} />
            <input placeholder="Search for help - printer setup, upload issues, QR code, billing..." aria-label="Search help" />
            <button type="submit">Search</button>
          </form>
          <div className="support-chips">
            <strong>Popular:</strong>
            {popularSearches.map((chip) => <span key={chip}>{chip}</span>)}
          </div>
          <div className="support-trust-strip">
            <span><BookOpen size={18} /> Documentation & Guides</span>
            <span><MessageCircle size={18} /> Live Chat Available</span>
            <span><Zap size={18} /> Most issues solved in &lt; 5 min</span>
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="support-container">
          <SectionHead label="Browse by Topic" title="Find help by product area." />
          <div className="support-category-grid">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <Link href="/help-support" className="support-category-card" key={item.title}>
                  <span><Icon size={25} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  <strong>{item.count} <ArrowRight size={15} /></strong>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="support-section support-soft">
        <div className="support-container">
          <SectionHead label="Getting Started" title="Set Up Your Shop in 10 Minutes" text="New to RepetiGo? Follow these steps in order. Most shops are printing their first job within 10 minutes of signing up." />
          <div className="support-steps">
            {setupSteps.map(([step, time, title, body]) => (
              <article key={step}>
                <span>{step}</span>
                <em>{time}</em>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
          <p className="support-note">Stuck on any step? Start a live chat - setup usually takes under 5 minutes with our team.</p>
        </div>
      </section>

      <section className="support-section">
        <div className="support-container">
          <SectionHead label="Troubleshooting" title="Fix Common Problems Fast" text="Step-by-step solutions for the most common issues. Most problems are solved in under 3 minutes." />
          <div className="support-accordion-list">
            {troubleshooting.map((problem) => (
              <details className="support-trouble" key={problem.title}>
                <summary><span>{problem.title}</span><strong>+</strong></summary>
                <p><b>Symptom:</b> {problem.symptom}</p>
                <div className="support-trouble-grid">
                  <div>
                    <h4>Possible Causes</h4>
                    <ul>{problem.causes.map((cause) => <li key={cause}>{cause}</li>)}</ul>
                  </div>
                  <div>
                    <h4>Fix Steps</h4>
                    <ol>{problem.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="support-section support-soft">
        <div className="support-container">
          <SectionHead label="FAQ" title="Frequently Asked Questions" text="30 questions across core topics. Every answer is self-contained for quick decisions." />
          <div className="support-faq-groups">
            {faqGroups.map((group) => (
              <article key={group.topic}>
                <h3>{group.topic}</h3>
                {group.items.map(([question, answer]) => (
                  <details key={question}>
                    <summary>{question}<span>+</span></summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="support-container support-docs-layout">
          <div>
            <SectionHead label="Documentation" title="Full Documentation" text="Detailed reference documentation for every RepetiGo feature." align="left" />
            <p className="support-note left">Full developer documentation: docs.repetigo.com</p>
          </div>
          <div className="support-doc-list">
            {docs.map(([title, articles]) => (
              <article key={title}><h3>{title}</h3><p>{articles}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="support-section support-soft">
        <div className="support-container">
          <SectionHead label="Video Tutorials" title="Learn Visually" text="Short, focused videos. No long intros. Each video solves exactly one problem." />
          <div className="support-video-grid">
            {videos.map(([title, duration, badge]) => (
              <article key={title}>
                <div><PlayCircle size={42} /></div>
                <span>{badge}</span>
                <h3>{title}</h3>
                <p>{duration}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="support-container">
          <SectionHead label="Downloads" title="Downloads" />
          <div className="support-download-grid">
            {downloads.map(([Icon, title, body, platform, status]) => (
              <article key={title}>
                <span><Icon size={23} /></span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <em>{platform}</em>
                </div>
                <strong className={status === "Available" ? "available" : undefined}>{status}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="support-section support-soft">
        <div className="support-container">
          <SectionHead label="Community" title="Built with shop owner feedback." text="Every feature request is reviewed. The ones that help the most shops get built next." />
          <div className="support-community-grid">
            {community.map(([Icon, title, body, link]) => (
              <article key={title}>
                <span><Icon size={22} /></span>
                <h3>{title}</h3>
                <p>{body}</p>
                <strong>{link}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="support-container">
          <SectionHead label="Contact Support" title="Reach Our Team" text="Most issues are solved without contacting support. If you need us, here are the fastest ways to get help." />
          <div className="support-channel-grid">
            {channels.map(([Icon, channel, bestFor, hours, response, featured]) => (
              <article className={featured ? "featured" : undefined} key={channel}>
                <span><Icon size={23} /></span>
                <h3>{channel}</h3>
                <p>{bestFor}</p>
                <div><em>{hours}</em><strong>{response}</strong></div>
                <Link href="/contact-us">Contact <ArrowRight size={15} /></Link>
              </article>
            ))}
          </div>
          <p className="support-note">For urgent security concerns: security@repetigo.com - subject line "URGENT". Monitored 24/7.</p>
        </div>
      </section>

      <section className="support-section support-status">
        <div className="support-container">
          <SectionHead label="Status & Trust" title="Platform Status & Trust" />
          <div className="support-status-card">
            <div>
              <span className="support-live-dot" /> All systems operational
            </div>
            <p>30-day uptime: 99.98%</p>
          </div>
          <div className="support-resource-grid">
            {trustResources.map(([title, body, href]) => (
              <Link href={href.startsWith("/") ? href : "/help-support"} key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
                <small>{href}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="support-final-cta">
        <div className="support-container">
          <h2>Still Need Help?</h2>
          <p>If you did not find what you were looking for, start a live chat. Most issues are resolved in under 5 minutes.</p>
          <div>
            <Link href="/contact-us">Start Live Chat <ArrowRight size={17} /></Link>
            <Link href="/contact-us">Submit a Ticket</Link>
          </div>
          <ul>
            <li><Check size={16} /> Most issues resolved in &lt; 5 min</li>
            <li><Check size={16} /> Mon-Sat, 9 AM - 7 PM IST</li>
            <li><Check size={16} /> Hindi and English support</li>
          </ul>
          <h3>Not a RepetiGo customer yet?</h3>
          <p>Start a free 14-day trial. No credit card. Setup in 10 minutes.</p>
          <div>
            <Link href="/register">Start Free Trial</Link>
            <Link href="/contact-us">Book a Demo</Link>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}

function SectionHead({ label, title, text, align = "center" }: { label: string; title: string; text?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "left" ? "support-heading align-left" : "support-heading"}>
      <span className="support-section-label"><Sparkles size={13} /> {label}</span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}
