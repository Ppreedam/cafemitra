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
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { LandingNavbar } from "../../LandingNavbar";
import { PublicFooter } from "../../PublicFooter";
import { BUSINESS } from "../../../lib/businessInfo";
import { LINKS, Rich, plain, type LinkKey } from "../solutionKit";

const PAGE_PATH = "/solutions/xerox-shops";
const PAGE_URL = `${BUSINESS.website}${PAGE_PATH}`;

const TITLE = "RepetiGo for Xerox Shops: Secure Document Printing Software India";
const DESCRIPTION =
  "RepetiGo is the xerox shop software India uses for secure document printing - QR upload, AI in 30 seconds, auto-delete. For Xerox centres, photocopy shops and copy centres.";
const OG_TITLE = "Xerox Shop Software India | Secure Document Printing - RepetiGo";
const OG_DESCRIPTION =
  "QR upload. AI in 30 seconds. Auto-delete. RepetiGo replaces WhatsApp-based document sharing at every Xerox shop, photocopy centre and copy shop in India.";

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

const badges = ["QR Upload - No WhatsApp", "AI in 30 Seconds", "Auto-Delete in 15 Min", "DPDP Act 2023"];

const problemParagraphs = [
  `You are the only person at the counter. Two customers are waiting in line. One is sending their Aadhaar card to your phone right now - you can hear the WhatsApp notification. Another wants to scan a document and print two copies. Your printer needs more A4 paper. And your phone is pinging with a third customer asking whether you can print their bank statement and a passport-size photo before lunch.`,
  `This is the reality of running a xerox shop in India today. The document copying software india that most Xerox shop owners use is not software at all - it is WhatsApp, a downloads folder, and a printer. Documents arrive unsecured, get edited manually one by one, print, and then stay on the phone or computer for months. No deletion. No audit trail. No compliance.`,
  `The problem is not the volume. The problem is the workflow. Every Aadhaar card that sits on your personal WhatsApp is a liability. Every PAN card in your downloads folder is a DPDP Act 2023 compliance failure. Every government certificate that gets manually cropped and resized is three minutes of your time that your customer watches you spend. RepetiGo's xerox shop automation software india was built to end all three of these at once.`,
];

type Step = { title: string; body: string };

const steps: Step[] = [
  {
    title: "Step 1 - Customer Scans Your Counter QR Code",
    body: `A laminated QR code sits at your counter. The customer scans it with their phone. A browser opens on their phone - no app needed. They upload their document from their gallery or files. The [xerox shop QR document upload](@qr) sends the file over a TLS-encrypted connection directly into the RepetiGo cloud. It arrives in your print queue. Your phone is never involved. Your WhatsApp is never involved. The customer's document is already in the queue by the time they look up from their phone.`,
  },
  {
    title: "Step 2 - AI Processes the Document in 30 Seconds",
    body: `The [xerox shop AI document processing](@ai) pipeline runs the moment the upload completes. It corrects the orientation of the document, removes the shadow from phone-camera photographs, enhances the contrast and brightness to a printable level, and resizes the file to the exact dimensions your printer needs. For an Aadhaar card photographed in poor lighting: shadow removed, enhanced, sized to 15x10 cm, print-ready. For a certificate photographed at an angle: corrected, enhanced, A4 output. All in under 30 seconds, automatically, for every document.`,
  },
  {
    title: "Step 3 - Print Queue - Every Job in One Screen",
    body: `The [real-time print queue](@queue) updates live on your counter screen as each job is processed. You see every pending job - document type, upload time, customer queue number, page count. You confirm and print with one tap. For xerox shops running two printers - one for A4 documents and one for photo prints - the queue routes each job to the right machine automatically. No file transfers. No opening folders. No calling the customer back to re-send a blurry image.`,
  },
  {
    title: "Step 4 - Document Deleted Automatically After Printing",
    body: `After each job prints, an S3 lifecycle policy permanently deletes the document from the cloud within 15 minutes. The [xerox shop auto delete after printing](@autodelete) process requires nothing from you or your staff - it is infrastructure behaviour, not a reminder or a button. The document no longer exists: not in the cloud, not on your counter computer, not on any backup. Every Aadhaar card, every PAN card, every bank statement that passes through your xerox shop is gone within 20 minutes of the customer walking in.`,
  },
];

const aadhaarParagraphs = [
  `Aadhaar card printing is the single most common service at Indian xerox shops. On any given day, more customers bring Aadhaar cards to be printed than any other document - for bank account opening, SIM card verification, school admissions, government scheme applications, and dozens of other purposes.`,
  `It is also the highest-risk document your shop handles. An Aadhaar card contains a person's name, date of birth, address, and a 12-digit unique identification number linked to their biometric data. When a customer sends their Aadhaar to your personal WhatsApp, that data sits on your phone - potentially indefinitely - connected to your personal account and your phone's cloud backup.`,
  `RepetiGo's xerox centre Aadhaar printing india workflow changes this completely. The customer scans your QR code. Their Aadhaar uploads securely. The AI automatically detects it as an Aadhaar card and sizes it to the standard 15x10 cm format - no manual cropping, no guessing at the dimensions. It prints. It is deleted within 15 minutes. The customer never shares it with your phone. You never have it on your WhatsApp. After 15 minutes, it does not exist on any system your business operates.`,
];

type Feature = { icon: LucideIcon; title: string; body: string; href?: LinkKey };

const features: Feature[] = [
  {
    icon: QrCode,
    title: "QR Document Upload",
    body: "Customers upload from any phone - no WhatsApp, no app, no personal number shared. TLS-encrypted.",
    href: "qr",
  },
  {
    icon: Bot,
    title: "AI Document Processing",
    body: "Aadhaar sizing, shadow removal, deskew, contrast enhancement. Every document type, automatically.",
    href: "ai",
  },
  {
    icon: Trash2,
    title: "Auto-Delete in 15 Minutes",
    body: "Every document permanently deleted after printing - infrastructure-enforced. No staff action needed.",
    href: "autodelete",
  },
  {
    icon: Printer,
    title: "Real-Time Print Queue",
    body: "All jobs in one screen. Multi-printer routing. One-tap confirm and print.",
    href: "queue",
  },
  {
    icon: Wallet,
    title: "UPI + Razorpay Billing",
    body: "xerox shop billing software india built in - collect payment per job, issue digital receipts, track daily revenue.",
    href: "payment",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    body: "Daily volume, revenue per document type, peak hours. Know which services your xerox shop earns most from.",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    body: "Every document encrypted in transit (TLS) and at rest (AES-256). No unencrypted document at any stage.",
  },
  {
    icon: ShieldCheck,
    title: "Print Bridge",
    body: "Works with Xerox, Canon, HP, Epson, Brother printers - USB and WiFi network. Under 10 minutes to connect.",
    href: "bridge",
  },
];

const dpdpParagraphs = [
  `India's Digital Personal Data Protection Act 2023 places direct obligations on every Xerox shop that handles personal documents. Aadhaar cards, PAN cards, bank statements, medical reports - these are personal data under the DPDP Act. As a data fiduciary, your xerox shop is required to collect this data only for the stated purpose (printing), use it only for that purpose, and delete it when that purpose is fulfilled.`,
  `For most xerox shops in India today, xerox shop DPDP Act compliance india is a gap that exists silently. The documents are collected for printing. But they are not deleted afterward. They remain on WhatsApp. They remain in download folders. They accumulate over months and years, building a compliance liability that grows with every customer who walks in.`,
  `RepetiGo's approach to DPDP compliance is structural, not procedural. The S3 lifecycle policy deletes every document within 15 minutes of print completion - automatically, for every job, without any staff action. There is no reminder your counter staff could miss. There is no setting to misconfigure. The document is gone because the infrastructure makes retention impossible after the purpose is fulfilled.`,
];

const setupParagraphs = [
  `You do not need a new printer. You do not need a new computer. RepetiGo's xerox shop software india is designed to work with the equipment your shop already has - from older Xerox machines connected via USB to newer network printers with WiFi.`,
  `**Supported printers:** Xerox, Canon, HP, Epson, Brother - USB and WiFi network models. Print Bridge connects automatically to printers on your local network.`,
  `**Counter computer:** Windows 7 or later, and Linux. Print Bridge runs as a background service - no open window, no manual action. It watches for confirmed print jobs and sends them directly to the correct printer.`,
  `**Multiple printers:** If your Xerox shop runs both a document printer and a photo printer, Print Bridge routes each job type automatically - A4 documents to one machine, passport photos to another.`,
  `**Setup time:** Under 10 minutes from download to first printed job. [Download Print Bridge](@bridge).`,
];

const pricingParagraphs = [
  `RepetiGo is available on a monthly subscription - no setup fee, no annual commitment. The 14-day free trial gives you full access to every feature with no credit card required: QR document upload, AI processing, auto-delete, real-time print queue, UPI billing, and analytics.`,
  `The trial is designed for real operational use. You can process actual customer jobs during the 14 days. Most xerox shop owners make a decision within the first three days - after seeing how differently the counter operates when documents arrive via QR instead of WhatsApp.`,
];

const pricingLinks: [string, LinkKey][] = [
  ["Pricing plans", "pricing"],
  ["Multi-location and enterprise pricing", "contact"],
];

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "What software should a Xerox shop use in India?",
    a: `Xerox shop software india should do three things that most xerox shops currently do manually: receive customer documents securely without WhatsApp, prepare documents for printing automatically, and delete them after the job is done. RepetiGo is the only document printing platform in India built specifically for this workflow - covering QR-based document receipt, AI preparation in 30 seconds, automatic deletion within 15 minutes, UPI-integrated billing, and a real-time analytics dashboard, all in a single system that works with your existing printers. It is used by photocopy centre software india operators, copy shops, and xerox centres across the country.`,
  },
  {
    q: "How do I manage my Xerox shop operations in India?",
    a: `How to manage xerox shop india efficiently comes down to three operational systems: document intake, job processing, and billing. Currently, most xerox shops handle all three manually - WhatsApp for intake, manual editing for processing, and cash for billing. RepetiGo automates all three: QR upload replaces WhatsApp, AI processing replaces manual editing, and integrated UPI billing replaces manual cash reconciliation. The analytics dashboard gives you real-time visibility into volume, revenue, and peak hours - so management becomes data-driven rather than instinct-driven.`,
  },
  {
    q: "How do I automate document printing at my Xerox shop?",
    a: `Xerox shop printing automation india with RepetiGo works in four steps: sign up for a [free trial](@pricing) → download and install Print Bridge on your counter computer → connect your existing Xerox or printer via Print Bridge → print the QR code your dashboard generates and laminate it at your counter. From that moment: customers scan, upload, documents appear in your queue processed and sized correctly, you print with one tap, the document is deleted in 15 minutes. Total setup time: under 10 minutes. [Download Print Bridge](@bridge) to get started.`,
  },
  {
    q: "Is Aadhaar card printing safe at a Xerox shop using RepetiGo?",
    a: `Yes. With RepetiGo, Aadhaar card printing at your xerox shop is protected across the complete lifecycle. The Aadhaar is uploaded via TLS-encrypted QR connection - your phone is never involved. It is stored with AES-256 encryption in the RepetiGo cloud. The AI automatically formats it to the standard 15x10 cm Aadhaar print size. Your counter computer receives only a print-ready stream and never stores the original file. After printing, the S3 lifecycle policy deletes the Aadhaar card within 15 minutes. No Aadhaar data remains on any system. For the complete Aadhaar printing guide, see [how to print Aadhaar cards securely](@aadhaar). For [full security documentation](@security), see our privacy page.`,
  },
  {
    q: "Does RepetiGo work for photocopy centres and copy shops?",
    a: `Yes. RepetiGo works for every type of document copying and printing business in India - whether you call it a Xerox shop, a photocopy centre, a photocopy shop, a copy shop, or a Xerox centre. The platform is the same regardless of the name. The core workflow - QR upload, AI processing, real-time print queue, auto-delete - is identical across all these business types. The only thing that changes is the document mix: some xerox shops focus primarily on Aadhaar and government forms, others handle a broader range of personal and professional documents. RepetiGo's AI handles all of them.`,
  },
  {
    q: "Is there a free trial for Xerox shop management software?",
    a: `Yes - 14 days free, no credit card required. Every feature is available during the free trial: QR document upload, AI processing, auto-delete in 15 minutes, real-time print queue, UPI billing, and the business analytics dashboard. The trial is designed for real operational testing - you can process actual customer jobs. Most xerox shop owners see the full operational benefit within the first week. To start, go to the [pricing page](@pricing) and click Start Free Trial.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.website },
        { "@type": "ListItem", position: 2, name: "Xerox Shops", item: PAGE_URL },
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
      name: "How Xerox Shop Document Printing Works With RepetiGo",
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

export default function XeroxShopsSolutionPage() {
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
            <span aria-current="page">Xerox Shops</span>
          </nav>
          <h1>Xerox Shop Software India - Secure, AI-Powered Document Printing for Every Photocopy Centre.</h1>
          <p>
            RepetiGo is xerox shop software india - a secure document printing platform built for every Xerox shop,
            photocopy centre, photocopy shop, and copy centre in India that handles Aadhaar cards, PAN cards, government
            forms, and personal documents for its customers every day. Whether your shop is called a Xerox centre, a
            photocopy shop, or simply a copy shop, the operational reality is the same: customer documents arrive on
            personal WhatsApp, need manual editing, get printed, and then either sit on your phone indefinitely or get
            deleted when someone remembers.
          </p>
          <p>
            RepetiGo&apos;s xerox shop management software india replaces that informal chain with a structured,
            automated, and DPDP Act 2023 compliant workflow - QR upload, AI processing in 30 seconds, one-tap printing,
            automatic deletion in 15 minutes. Built for the Indian document printing context. Built for the way xerox
            shops in India actually operate.
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
          <h2>The Document Problem Every Xerox Shop in India Is Running Into.</h2>
          <div className="about-copy">
            {problemParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Zap size={20} aria-hidden />
            <p>
              <strong>
                Receiving Aadhaar cards over WhatsApp is the single biggest privacy risk at Indian Xerox shops.
              </strong>{" "}
              See the dedicated guide. <Link href={LINKS.whatsapp}>Why WhatsApp is not safe for Aadhaar printing</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>How RepetiGo&apos;s Xerox Shop Software Works.</h2>
          <div className="about-copy">
            <p>
              The complete document workflow at a RepetiGo-enabled xerox shop runs in four steps - the same four steps
              for every document, every customer, every shift.
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
              <strong>From QR scan to printed output: under 90 seconds.</strong> From upload to permanent deletion:
              under 20 minutes. Your counter computer never holds the original document file.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>Aadhaar Card Printing - The Highest-Volume Service at Every Xerox Shop.</h2>
          <div className="about-copy">
            {aadhaarParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Lock size={20} aria-hidden />
            <p>
              <strong>
                For the complete guide to printing Aadhaar cards securely at a Xerox shop - including DPDP Act 2023
                obligations and how RepetiGo addresses them - see the dedicated Aadhaar printing page.
              </strong>{" "}
              <Link href={LINKS.aadhaar}>How to print Aadhaar cards securely</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container">
          <div className="about-heading">
            <h2>Features Built for Xerox Centre Operations in India.</h2>
            <p>
              RepetiGo&apos;s xerox shop printing management software is built around the specific operational demands
              of Indian xerox centres - not adapted from enterprise document management tools, not repurposed from
              software built for office printing. Every feature addresses a real problem at a real Xerox shop counter:
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

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>The DPDP Act 2023 - What Your Xerox Shop Needs to Know.</h2>
          <div className="about-copy">
            {dpdpParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Lock size={20} aria-hidden />
            <p>
              <Link href={LINKS.compliance}>DPDP Act 2023 compliance documentation</Link> is available on our privacy
              page. We recommend consulting a legal advisor for DPDP Act 2023 obligations specific to your xerox shop.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>How RepetiGo Connects to Your Existing Xerox and Printer Setup.</h2>
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
          <h2>Frequently Asked Questions - Xerox Shop Software India.</h2>
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
          <h2>Secure Document Printing - Built for Every Xerox Shop and Photocopy Centre in India.</h2>
          <p>
            Every Aadhaar card, every PAN card, every certificate that passes through your xerox shop is someone&apos;s
            personal data. RepetiGo&apos;s xerox shop software india handles it the way it should have always been
            handled - uploaded securely, processed precisely, printed correctly, and deleted within 15 minutes.
            Automatically. Every time. For every customer. Without you having to think about it.
          </p>
          <p>14-day free trial. No credit card. Your existing Xerox printer. Under 10 minutes to your first automated print job.</p>
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
