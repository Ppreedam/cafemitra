import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  ClipboardList,
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

const PAGE_PATH = "/solutions/print-shops";
const PAGE_URL = `${BUSINESS.website}${PAGE_PATH}`;

const TITLE = "Print Shop Management Software India | Automate - RepetiGo";
const DESCRIPTION =
  "RepetiGo is the print shop management software India trusts - QR document upload, AI preparation in 30 seconds, auto-delete after printing. No more WhatsApp. No more manual editing.";
const OG_TITLE = "Print Shop Management Software India | Automate Every Job - RepetiGo";
const OG_DESCRIPTION =
  "QR upload. AI in 30 seconds. Auto-delete. Replace WhatsApp-based document workflows at your print shop with RepetiGo.";

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

const badges = ["QR Upload - No WhatsApp", "AI in 30 Seconds", "Auto-Delete in 15 Min", "Built-in UPI Billing"];

const problemParagraphs = [
  `You have six jobs in the queue. One customer is waiting for their resume. Another sent their Aadhaar card to your WhatsApp but the image is blurry and needs to be cropped and adjusted. A third is calling to ask if their certificates are ready. Your counter staff is manually opening files on the desktop one at a time - downloading from WhatsApp, editing in paint or a photo app, sizing to A4, sending to the printer - while the queue keeps growing.`,
  `This is the hidden cost of running a print shop in India without proper print shop automation software india. The actual printing takes seconds. The document preparation around it - receiving over WhatsApp, manual editing, finding the right file in the downloads folder, guessing the right size, deleting after - takes three to five minutes per job. In a print shop handling 60 jobs a day, that is three to five hours of manual labour every single working day, spent entirely on tasks that should not require human attention at all.`,
  `Beyond the time cost is the compliance cost. Every Aadhaar card, PAN card, bank statement, and certificate that passes through your counter is personal data under India's Digital Personal Data Protection Act 2023. As a print shop owner, you become a data fiduciary the moment that document arrives - responsible for its security, its use, and its deletion. If it is still on your WhatsApp or your counter computer's download folder after the job is done, you are not compliant. Most print shops in India are not. The right WhatsApp alternative for print shop india changes that structurally, not through policy.`,
];

type Step = { title: string; body: string };

const steps: Step[] = [
  {
    title: "Step 1 - Secure Document Receipt via QR Upload",
    body: `A laminated QR code sits at your counter - one for each counter position if you run multiple. The customer scans it with their phone camera. A browser opens. They upload their document directly from their gallery or files app. The [print shop QR upload india](@qr) process is TLS-encrypted end-to-end - the document travels from their phone directly into the RepetiGo document cloud, without touching your phone, your email, or your WhatsApp. The moment it arrives, you see it in your queue. The print shop document management india workflow begins automatically.`,
  },
  {
    title: "Step 2 - AI Preparation in 30 Seconds",
    body: `The moment the upload completes, the [print shop AI document processing](@ai) pipeline runs. It detects the document type, corrects orientation for tilted or rotated images, removes shadows from phone-photographed documents, enhances contrast and resolution, and resizes the file to the exact dimensions your printer needs - A4 for most documents, 15x10 cm for Aadhaar cards, passport dimensions for ID photos. Documents that arrive blurry become print-ready. Documents that arrive sideways are corrected. Whatever condition the file arrives in, what reaches your printer is optimised. This is what print shop automation software india does instead of your counter staff.`,
  },
  {
    title: "Step 3 - Managed Print Queue - One Screen, All Jobs",
    body: `Every job - regardless of which counter received it or which customer uploaded it - appears in a single, [real-time print queue](@queue) on your counter screen. The print job management software india shows you a thumbnail, document type, upload time, and page count for each job in sequence. You confirm and print with one tap. For print shops with multiple printers, the print shop workflow software india routes each job to the correct machine based on document type: A4 documents to the document printer, photos to the photo printer, certificates to the higher-quality output machine. No manual routing. No wrong-printer mistakes. No missed jobs.`,
  },
  {
    title: "Step 4 - Automatic Deletion After Every Print Job",
    body: `After each job prints, an S3 lifecycle policy permanently deletes the document from the cloud within 15 minutes. This is not a setting your staff manages - it is the infrastructure behaviour. The document ceases to exist: not on the cloud, not on your counter computer, not in any backup. For [print shop auto delete documents india](@autodelete) to work correctly, no human action is required at any step. It happens automatically, for every job, across every shift, regardless of how busy your counter is. The print shop's document management cycle closes completely, on its own.`,
  },
];

const costItems = [
  `**Time - the invisible overhead:** At 60 jobs a day, three minutes of manual preparation per job is 180 minutes - three hours - of staff time spent on document editing alone. At five minutes per job, it is five hours. That is time your staff spend not serving the customer at the counter, not answering the phone, not managing the queue. It is time you pay for, every working day, to do something that printing business software india should handle automatically.`,
  `**Print quality - the silent refund driver:** A blurry Aadhaar card that prints unreadable, a certificate that arrives rotated and goes out rotated, a resume that was photographed in poor lighting and prints with visible shadows - these are refund requests, reputation problems, and customers who do not come back. The AI processing in RepetiGo eliminates the quality variable entirely: every document goes through the same enhancement pipeline, every time, regardless of how it arrived.`,
  `**Compliance - the accumulating liability:** Every document that arrives at your print shop and is not deleted after printing is a compliance failure under the DPDP Act 2023. Most print shops have months or years of customer documents accumulated on WhatsApp and in download folders. The liability grows silently, with no visible cost, until it is not silent anymore. The print shop DPDP compliance india approach that RepetiGo enforces - automatic deletion at the infrastructure level - is the only approach that does not rely on someone remembering.`,
];

type Feature = { icon: LucideIcon; title: string; body: string; href?: LinkKey };

const features: Feature[] = [
  {
    icon: QrCode,
    title: "QR Document Upload",
    body: "Customers upload from any phone, any camera - no WhatsApp, no email. TLS-encrypted. One QR per counter position.",
    href: "qr",
  },
  {
    icon: Bot,
    title: "AI Document Processing",
    body: "Shadow removal, deskew, contrast enhancement, upscaling. Runs on every document in 30 seconds. Every job print-ready automatically.",
    href: "ai",
  },
  {
    icon: Trash2,
    title: "Auto-Delete in 15 Minutes",
    body: "S3 lifecycle deletion - infrastructure-enforced, not staff-dependent. Every document gone after printing.",
    href: "autodelete",
  },
  {
    icon: Printer,
    title: "Real-Time Print Queue",
    body: "WebSocket-based live queue. Multi-printer routing by document type. One screen for all jobs across all counters.",
    href: "queue",
  },
  {
    icon: Wallet,
    title: "UPI + Razorpay Billing",
    body: "Collect payment per job directly in the print workflow. Digital receipts. Daily revenue tracked automatically in the dashboard.",
    href: "payment",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    body: "Real-time dashboard: daily volume, revenue per job type, peak hours, AI success rate, printer utilisation. Know which jobs are most profitable.",
    href: "analytics",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    body: "Every document encrypted at rest and in transit via TLS. No unencrypted file at any point.",
    href: "security",
  },
  {
    icon: ClipboardList,
    title: "Print Shop Order Management",
    body: "Track each print order from upload to completion. Audit trail of every job for business and compliance records.",
    href: "audit",
  },
  {
    icon: ShieldCheck,
    title: "Print Bridge - Multi-Printer Support",
    body: "Works with HP, Canon, Epson, Brother, Xerox - USB and network. Multiple printers per shop with automatic routing by document type.",
    href: "bridge",
  },
];

const analyticsParagraphs = [
  `[Print shop analytics software india](@analytics) has historically meant a counter book and a calculator at the end of the day. RepetiGo changes what analytics means for a print shop: the real-time dashboard gives you live visibility into every aspect of your business as it happens.`,
  `You see daily document volume - how many jobs have been processed today, how many are in the queue, how many have completed. You see revenue by job type - what you earn from Aadhaar prints versus resume prints versus certificate prints - so you know which services are most profitable and which take the most counter time. You see peak hours - when your shop is busiest - so you can schedule staff accordingly.`,
  `The AI success rate metric tells you what percentage of documents were processed without needing any manual intervention. The printer utilisation breakdown shows you which printer is handling the most load and whether your queue is balanced across machines.`,
  `For print shop owners who have been running their business on instinct and experience, this data changes how decisions are made. Not guessing whether to open earlier on Saturdays - knowing. Not guessing whether a second printer pays for itself - calculating it from real throughput data.`,
];

const dpdpParagraphs = [
  `India's Digital Personal Data Protection Act 2023 applies to your print shop in a direct and practical way. When a customer brings their PAN card, Aadhaar card, bank statement, or medical certificate to your counter for printing, you collect their personal data. Under the DPDP Act, you are required to: collect it only for the purpose stated (printing), use it only for that purpose, and delete it when that purpose is fulfilled.`,
  `In practice, this means: the moment the print job is complete, there is no lawful basis under the DPDP Act to retain that document. If it is on your WhatsApp, in your downloads folder, or in any cloud storage, you are in breach of the data minimisation and retention limitation principles of the Act.`,
  `RepetiGo's print shop DPDP compliance india approach makes compliance structural rather than procedural. The S3 lifecycle policy deletes every document within 15 minutes of print completion - not because a staff member clicks delete, but because the infrastructure makes retention impossible. There is no setting to turn off. There is no reminder to miss. The document is gone, automatically, after every job.`,
];

const setupParagraphs = [
  `You do not need new hardware. You do not need a new printer, a new computer, or a new network setup. RepetiGo's print shop management software india is designed to work with the printers your shop already runs.`,
  `**Supported printers:** HP, Canon, Epson, Brother, and Xerox - both USB-connected and WiFi network printers. The Print Bridge desktop agent connects RepetiGo to your printer automatically.`,
  `**Counter computer:** Print Bridge installs on Windows 7 or later, and Linux. It runs as a background service - no window open, no manual action required. It simply watches for print-confirmed jobs and sends them to the correct printer.`,
  `**Multiple printers:** If you run two or three printers for different job types, Print Bridge handles routing automatically. You configure which printer handles which document type once - it follows those rules for every job after that.`,
  `**Setup time:** Under 10 minutes from download to first print. Most print shop owners complete setup and process their first QR-to-print job before their counter opens for the day.`,
];

const pricingParagraphs = [
  `RepetiGo's print shop billing software india is available on a monthly subscription - no annual commitment required, no setup fee. A 14-day free trial gives you full access to every feature: QR document upload, AI processing, auto-delete, real-time print queue, UPI billing integration, and the analytics dashboard. No credit card required to start.`,
  `The free trial is designed to be a full operational test, not a demo. You can process real jobs during the trial period. Most print shop owners make a clear decision within the first week - not because the trial ends, but because the operational difference is immediately visible.`,
];

const pricingLinks: [string, LinkKey][] = [
  ["Full pricing details and plan comparison", "pricing"],
  ["Enterprise and multi-location print shop pricing", "contact"],
  ["Download Print Bridge", "bridge"],
];

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "What software should a print shop use in India?",
    a: `Print shop management software india should do three things: replace WhatsApp as a document receipt channel, automate document preparation for printing, and ensure documents are deleted after the job is done. RepetiGo covers all three in a single platform - QR-based document upload, AI preparation in 30 seconds, and automatic deletion within 15 minutes of print completion. It also includes built-in UPI billing and a real-time business analytics dashboard. For a print shop in India handling any combination of Aadhaar cards, certificates, resumes, and government documents, this is the complete software for managing print shop india that addresses every operational stage.`,
  },
  {
    q: "What is the best software for a print shop in India?",
    a: `The best software for print shop india is one that eliminates manual document preparation, enforces data privacy by architecture rather than by policy, and gives you real business visibility through analytics. When evaluating the best print shop software india, look for: secure document receipt that replaces WhatsApp, automated AI preparation that handles every document type, automatic deletion that is infrastructure-enforced rather than staff-dependent, built-in billing, and a real-time analytics dashboard. RepetiGo is the only print shop management platform in India that addresses all five in a single integrated system designed specifically for Indian document printing workflows.`,
  },
  {
    q: "How do I automate my print shop in India?",
    a: `To automate a print shop india with RepetiGo: sign up for a [free trial](@pricing) → download and install Print Bridge on your counter computer → connect your existing printer → print and laminate the QR code your dashboard generates → place it at each counter position. From that moment, your workflow changes: customers scan the QR code, upload their document, and it appears in your print queue processed and ready. You confirm and print. The document is deleted after 15 minutes. Everything between upload and deletion is handled by the print shop automation software india automatically.`,
  },
  {
    q: "How much time does print shop software save?",
    a: `At a print shop handling 60 jobs a day with 3 minutes of manual document preparation per job, the total manual time is 180 minutes - 3 hours - every working day. At 5 minutes per job, it is 5 hours. Over a 26-day working month, that is between 78 and 130 hours of staff time spent on document editing alone. How much time does print shop software save india? RepetiGo reduces that to under 30 seconds per job - the AI processing time. The staff time saved goes back into serving customers at the counter, managing the queue, and handling more jobs in the same working hours.`,
  },
  {
    q: "Does RepetiGo work for print shops that handle high document volumes?",
    a: `Yes. RepetiGo is designed for print shop order management software india at any volume - from 20 jobs a day at a single counter to 200 jobs a day across multiple counters and printers. The print queue scales with WebSocket-based real-time updates - no page refresh, no latency as volume increases. Multi-printer routing handles high-volume shops by distributing jobs across machines automatically. The analytics dashboard provides throughput visibility so you can identify bottlenecks before they become queue problems. For very high-volume operations, [contact the team](@contact) to discuss enterprise configuration.`,
  },
  {
    q: "Is my customers' data safe at my print shop with RepetiGo?",
    a: `Yes. Every document processed through RepetiGo at your print shop is protected across four layers: TLS encryption during upload, AES-256 encryption at rest in the document cloud, a counter computer that receives only a print-ready stream and never stores the original file, and an S3 lifecycle policy that permanently deletes the document within 15 minutes of print completion. After those 15 minutes, the document does not exist on any system. This is print shop DPDP compliance india by architecture - the deletion is infrastructure behaviour, not a staff action. [Full security documentation](@security) is available on our privacy page.`,
  },
  {
    q: "Does RepetiGo handle billing and payment at print shops?",
    a: `Yes. RepetiGo's print shop billing software india includes integrated UPI and Razorpay payment collection. You set the price per job type in your dashboard - Aadhaar prints, A4 documents, photo prints - and the billing system collects payment from the customer as part of the print workflow. Digital receipts are generated automatically. Daily and monthly revenue is tracked in the analytics dashboard with breakdown by job type. No separate billing system required. No manual cash reconciliation at end of day for digital payments.`,
  },
  {
    q: "Is there a free trial?",
    a: `Yes - 14 days free, no credit card required, no setup fee. Every feature is active during the trial: QR document upload, AI processing, auto-delete in 15 minutes, real-time print queue, UPI billing, and the analytics dashboard. The trial is designed for full operational use - you can process real customer jobs during the trial period and make a decision based on actual operational experience, not a demo. To start, go to the [pricing page](@pricing) and click Start Free Trial. You can complete setup and process your first QR-to-print job in under 10 minutes.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.website },
        { "@type": "ListItem", position: 2, name: "Print Shops", item: PAGE_URL },
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
      name: "How Print Shop Document Management Works with RepetiGo",
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

export default function PrintShopsSolutionPage() {
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
            <span aria-current="page">Print Shops</span>
          </nav>
          <h1>Print Shop Management Software India - Automate Every Job, From First Upload to Final Deletion.</h1>
          <p>
            RepetiGo is print shop management software India - a secure document printing platform that automates the
            complete lifecycle of every job at your counter. Instead of receiving customer documents over WhatsApp,
            manually editing them for printing, and hoping someone remembers to delete them afterward, RepetiGo handles
            all three: documents arrive via secure QR upload, are AI-processed in under 30 seconds, and are permanently
            deleted within 15 minutes of printing. This is what software for managing print shop india is supposed to
            look like.
          </p>
          <p>
            From a single-counter print shop handling 40 jobs a day to a three-counter operation processing 150,
            RepetiGo&apos;s printing business software india runs the same system - scaling with your volume without
            adding manual work at every step.
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
          <h2>What Print Shops in India Are Losing to Manual Document Workflows.</h2>
          <div className="about-copy">
            {problemParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Zap size={20} aria-hidden />
            <p>
              <strong>Still receiving documents over WhatsApp at your print shop?</strong> See exactly how RepetiGo
              replaces it. <Link href={LINKS.whatsapp}>Why WhatsApp is not designed for document printing</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>How RepetiGo&apos;s Print Shop Management Software Works.</h2>
          <div className="about-copy">
            <p>
              RepetiGo&apos;s print shop workflow software india runs in four steps for every job at your counter. The
              entire cycle - from document receipt to printed output - takes under 90 seconds.
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
              <strong>QR receipt to printed output: under 90 seconds.</strong> Upload to permanent deletion: under 20
              minutes total. Your counter computer never holds the original document file at any point.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>The Real Cost of Running a Print Shop Without Automation.</h2>
          <div className="about-copy">
            <p>
              The cost of not using proper print shop management software india does not show up in a single line on
              your accounts. It spreads across three areas that most print shop owners underestimate:
            </p>
            {costItems.map((item) => (
              <p key={item}>
                <Rich text={item} />
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container">
          <div className="about-heading">
            <h2>Features Built for Professional Print Shop Management in India.</h2>
            <p>
              Every feature in RepetiGo is built around the specific operational demands of print shops in India - not
              adapted from generic document management tools designed for offices, not repurposed from tools built for
              other markets:
            </p>
          </div>
          <div className="sol-feature-grid sol-feature-grid-3">
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
          <h2>Print Shop Analytics - Know Your Business, Grow Your Business.</h2>
          <div className="about-copy">
            {analyticsParagraphs.map((p) => (
              <p key={p}>
                <Rich text={p} />
              </p>
            ))}
          </div>
          <aside className="sol-callout">
            <BarChart3 size={20} aria-hidden />
            <p>
              <strong>Analytics data is available in real time in your RepetiGo dashboard.</strong> No export needed.
              No end-of-day reconciliation. Live as jobs complete. Explore the{" "}
              <Link href={LINKS.analytics}>business analytics dashboard</Link>.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>The DPDP Act 2023 - Your Print Shop&apos;s Compliance Obligation.</h2>
          <div className="about-copy">
            {dpdpParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Lock size={20} aria-hidden />
            <p>
              <Link href={LINKS.compliance}>DPDP Act 2023 compliance documentation</Link> is available on our privacy
              page. We recommend consulting a legal advisor for DPDP Act obligations specific to your print shop
              business.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>How RepetiGo Fits Your Existing Print Shop Setup.</h2>
          <div className="about-copy">
            {setupParagraphs.map((p) => (
              <p key={p}>
                <Rich text={p} />
              </p>
            ))}
            <p>
              <Link href={LINKS.bridge}>Download Print Bridge</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="about-section sol-alt">
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

      <section className="about-section" id="faq">
        <div className="about-container about-narrow">
          <h2>Frequently Asked Questions - Print Shop Management Software India.</h2>
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
          <h2>Run a More Professional Print Shop. Starting Today.</h2>
          <p>
            The manual workflow that most print shops in India run today - WhatsApp, editing, printing, forgetting to
            delete - was never the right way to handle customer documents. It became the default because there was
            nothing better. Now there is. RepetiGo&apos;s print shop management software india automates every step
            between customer upload and document deletion, gives you real-time business analytics, and enforces DPDP Act
            2023 compliance by architecture. You focus on your counter. The software handles the rest.
          </p>
          <p>14-day free trial. No credit card. Your existing printers. Under 10 minutes to your first automated print job.</p>
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
