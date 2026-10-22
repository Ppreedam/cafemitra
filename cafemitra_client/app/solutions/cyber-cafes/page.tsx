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

const PAGE_PATH = "/solutions/cyber-cafes";
const PAGE_URL = `${BUSINESS.website}${PAGE_PATH}`;

const TITLE = "RepetiGo for Cyber Cafes: Secure Document Printing Software India";
const DESCRIPTION =
  "RepetiGo is the cyber cafe management software India trusts for secure document printing - QR upload, AI in 30 seconds, auto-delete in 15 minutes. Replace WhatsApp today.";
const OG_TITLE = "Cyber Cafe Management Software India | Secure Document Printing - RepetiGo";
const OG_DESCRIPTION =
  "QR upload. AI in 30 seconds. Auto-delete in 15 minutes. Replace WhatsApp-based document sharing at your cyber cafe with RepetiGo.";

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

const badges = ["No WhatsApp Required", "AI in 30 Seconds", "Auto-Delete in 15 Min", "DPDP Act 2023 Aligned"];

const problemParagraphs = [
  `It starts the same way in every cyber cafe. A customer walks up to the counter. 'Bhaiya, Aadhaar print karna hai.' You say: 'WhatsApp karo.' They find your number in their contacts - or you write it on a piece of paper - and they send it to your personal phone. You download it, open it, crop it, resize it to 15x10 cm, adjust the brightness, print it, and then - if you remember, and if you have the time - delete it from your phone.`,
  `Three to five minutes. For one document. And that customer's Aadhaar card is now on your personal WhatsApp, potentially on your phone's cloud backup, and sitting in your counter computer's download folder - for months.`,
  `Now multiply that by 50 documents a day. Every day. For every year your cyber cafe has been running. That is not a workflow. That is a privacy liability accumulating in the background of your business, invisibly, every single working day.`,
  `India's Digital Personal Data Protection Act 2023 requires businesses to collect personal data only for a defined purpose and delete it when that purpose is fulfilled. A customer's Aadhaar card on your WhatsApp, three months after they visited your shop, is a direct compliance failure - and most cyber cafe owners have thousands of such documents stored without ever meaning to retain them.`,
  `RepetiGo's cyber cafe printing software india was built to solve this problem. Not the symptom. The structure. WhatsApp out. QR in.`,
];

type Step = { title: string; body: string };

const steps: Step[] = [
  {
    title: "Step 1 - Customer Scans Your QR Code",
    body: `A laminated QR code sits on your counter - permanent, always-on, shared with every customer. The customer scans it with any phone camera. A browser opens on their phone. They upload their document directly from their gallery or files app. No app download. No login. No WhatsApp number shared. The [cyber cafe QR upload system](@qr) transfers the document over a TLS-encrypted connection directly into the RepetiGo document cloud. The document leaves their phone and arrives in your print queue - without touching yours.`,
  },
  {
    title: "Step 2 - AI Prepares the Document in 30 Seconds",
    body: `While the customer stands at your counter, the [cyber cafe AI document processing](@ai) pipeline runs automatically. It detects the document type, corrects the orientation if it was photographed at an angle, removes the shadow that phone cameras cast on documents, enhances the contrast and brightness, and resizes the file to the exact dimensions your printer needs - A4, 15x10 cm for Aadhaar, passport size, whatever you have set. This is what the cyber cafe time management software handles instead of you. Three minutes of manual editing, in 30 seconds, automatically.`,
  },
  {
    title: "Step 3 - You Print. One Tap.",
    body: `The processed, print-ready document appears in your [real-time print queue](@queue) on the counter screen the moment AI finishes - no page refresh, no delay. You see a thumbnail preview, document type, upload time, and page count. You confirm. It prints. The cyber cafe management system software handles routing automatically for multi-printer shops: the photo printer gets passport photos, the A4 printer gets documents. No manual file transfer. No USB. No opening folders. One tap.`,
  },
  {
    title: "Step 4 - Document Deleted in 15 Minutes",
    body: `After the print job completes, an S3 lifecycle policy activates and permanently deletes the document from the RepetiGo cloud within 15 minutes. This is infrastructure behaviour - not a setting that can be forgotten, turned off, or misconfigured by a staff member. The document no longer exists anywhere: not on the cloud, not on your counter computer, not on your phone. The [cyber cafe auto delete after printing](@autodelete) cycle happens automatically, every time, for every document, across every job - without any action from you or your staff.`,
  },
];

const comparison: [string, string, string][] = [
  ["Document receipt", "Customer sends to your personal phone number", "Customer scans QR at your counter - no number shared"],
  ["Your personal privacy", "Customer has your WhatsApp number permanently", "No personal contact shared at any point"],
  ["Document preparation", "Manual: crop, resize, adjust - 3 to 5 minutes per job", "Automatic: AI in under 30 seconds"],
  ["Document storage", "Stays on your phone and backup - indefinitely", "Deleted within 15 minutes of printing"],
  ["Print quality", "Variable - depends on manual editing skill", "Consistent - AI-optimised for your printer every time"],
  ["Billing", "Cash, manual receipt - separate from the workflow", "Built in - UPI + Razorpay integrated"],
  ["DPDP Act 2023 compliance", "✗ Not compliant - documents retained without purpose", "✓ Compliant by architecture - zero retention"],
  ["Monthly cost", "₹0 (but 65+ hours of manual labour per month)", "Monthly subscription - see [pricing](@pricing)"],
];

const bestSoftwareItems = [
  `**Privacy liability that accumulates silently:** Your customer's Aadhaar card on your WhatsApp is not just inconvenient. Under the DPDP Act 2023, retaining someone's personal data beyond its purpose is a legal liability. The best cyber cafe management software in india makes retention structurally impossible - not just optional - by deleting every document at the infrastructure level within 15 minutes of printing.`,
  `**Time cost that makes scaling impossible:** Three to five minutes of manual document preparation per job adds up to 65 hours of staff time every month in a busy cyber cafe. That is not a workflow - it is a ceiling on how many customers you can serve. The right cyber cafe owner software india removes that ceiling by making preparation automatic.`,
  `**Print quality inconsistency that causes refunds:** A blurry Aadhaar card photograph that prints unreadable is a refund request, a frustrated customer, and a reputation problem. The cyber cafe accounting and security management software that includes AI enhancement produces consistent, printable output from any quality of input - phone photos taken in bad lighting, old scanned images, low-resolution PDFs - every time.`,
];

type Feature = { icon: LucideIcon; title: string; body: string; href?: LinkKey };

const features: Feature[] = [
  {
    icon: QrCode,
    title: "QR Document Upload",
    body: "Customers upload from any phone, any camera - no WhatsApp, no app download, no personal number. TLS-encrypted.",
    href: "qr",
  },
  {
    icon: Bot,
    title: "AI Document Processing",
    body: "Shadow removal, deskew, contrast enhancement, resolution upscaling. Runs on every document in under 30 seconds. Aadhaar, PAN, certificates - all optimised automatically.",
    href: "ai",
  },
  {
    icon: Trash2,
    title: "Auto-Delete in 15 Minutes",
    body: "Every document permanently deleted within 15 minutes of printing. S3 lifecycle enforcement - not a button, not a reminder.",
    href: "autodelete",
  },
  {
    icon: Printer,
    title: "Real-Time Print Queue",
    body: "WebSocket-based live queue. Multi-printer routing. One-tap confirmation. No file downloads, no USB transfers.",
    href: "queue",
  },
  {
    icon: Wallet,
    title: "UPI + Razorpay Billing",
    body: "Collect payment directly in the print workflow. Issue digital receipts. Track daily revenue in the analytics dashboard.",
    href: "payment",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    body: "Daily document volume, revenue, peak hours, AI success rate - all real-time. Know when your shop is busiest and how much you are earning.",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    body: "Documents encrypted at rest and in transit via TLS. No unencrypted document exposure at any point.",
    href: "security",
  },
  {
    icon: ShieldCheck,
    title: "Print Bridge - Printer Support",
    body: "Works with HP, Canon, Epson, Brother, and Xerox. Installs on Windows or Linux. Setup in under 10 minutes.",
    href: "bridge",
  },
];

const dpdpParagraphs = [
  `India's Digital Personal Data Protection Act 2023 is a law that directly affects every cyber cafe in the country. It is not a future concern or a large-enterprise issue. It is a present, operational requirement for any business that handles personal data - and cyber cafes handle some of the most personal data in the country, every day.`,
  `When a customer sends their Aadhaar card to your WhatsApp to get it printed, you become a data fiduciary under the DPDP Act. You have obligations: collect the data only for the defined purpose (printing), use it only for that purpose, and delete it when that purpose is fulfilled. The moment the print job is complete, there is no longer a lawful basis for retaining that Aadhaar image. But on WhatsApp, it stays - in your chat history, in your phone's backup, in your download folder - until someone manually deletes it.`,
  `Most Indian cyber cafe owners are not compliant with this requirement. Not because they are negligent, but because the tool they have been using - WhatsApp - was never designed to enforce deletion.`,
  `RepetiGo's cyber cafe DPDP Act compliance india approach is different: deletion is not a feature your staff need to remember. It is the infrastructure behaviour. The S3 lifecycle policy deletes the document within 15 minutes of printing. This happens automatically, for every document, across every shift, regardless of how busy the counter is or whether your staff member thought about it.`,
];

const experienceParagraphs = [
  `The experience at a RepetiGo-enabled cyber cafe is different from the moment a customer walks in. There is no awkward moment where they need to find your personal WhatsApp in their contacts, or where you hand them a piece of paper with your number written on it. There is no uncertainty about whether their Aadhaar card will remain on your phone after they leave. There is no waiting while you manually crop and resize their document.`,
  `They scan the QR code at your counter. They upload from their phone. Their document prints. They leave knowing - if they ask - that the document has been deleted. For customers who have had their personal documents misused after a visit to a cyber cafe, this is not a small thing. It is the reason they come back to your shop and not the one down the street.`,
  `For your staff, the change is equally significant. The 3–5 minutes per document that used to go into manual editing goes back into serving the next customer in the queue. A busy cyber cafe that handles 50 documents a day gains back over 3 hours of productive counter time - every single working day.`,
];

const pricingParagraphs = [
  `RepetiGo's cyber cafe billing software india is available on a monthly subscription. There is a 14-day free trial - no credit card required, no setup fee, no commitment. Every feature is available during the trial: QR document upload, AI processing, auto-delete, print queue, analytics dashboard, and UPI billing integration.`,
  `The trial is designed to be self-serve. You can complete a full QR-to-print cycle in under 10 minutes of setup. Download Print Bridge, connect your existing printer, print your first QR code card, and serve your first customer through RepetiGo - all before your afternoon tea.`,
];

const pricingLinks: [string, LinkKey][] = [
  ["Full pricing details", "pricing"],
  ["Enterprise and multi-location pricing", "contact"],
  ["Download Print Bridge", "bridge"],
];

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "What software do cyber cafes use in India?",
    a: `Most cyber cafes in India currently use WhatsApp as a document transfer method - a workaround born from the absence of purpose-built tools, not a designed solution. RepetiGo is cyber cafe management software india built specifically for this gap: a secure document printing platform that handles QR-based document receipt, AI preparation, real-time queue management, billing, and automatic deletion. It runs in a browser on your counter computer and connects to your existing printer via the Print Bridge agent. No hardware investment. No separate billing system. No WhatsApp.`,
  },
  {
    q: "What is the best cyber cafe management software in India?",
    a: `The best cyber cafe software for document printing is one that eliminates the three problems every Indian cyber cafe owner faces: privacy liability from WhatsApp-based document sharing, time wasted on manual document editing, and inconsistent print quality. RepetiGo addresses all three: QR upload replaces WhatsApp, AI processing replaces manual editing, and the consistent AI output replaces variable manual results. For a list of the top 10 cyber cafe management software options in the Indian market, RepetiGo consistently appears as the only purpose-built document lifecycle platform rather than a general print management tool.`,
  },
  {
    q: "How do I manage customer documents at my cyber cafe without WhatsApp?",
    a: `With RepetiGo, the process is: print and laminate a QR code card for your counter → customer scans it → they upload their document from their phone → AI processes it in 30 seconds → you see it in your print queue → you print with one tap → it is deleted within 15 minutes. The entire workflow requires no WhatsApp, no personal phone number exchange, and no manual file management. Setup takes under 10 minutes. You can manage customer documents at your cyber cafe india through this QR-based workflow from day one of the free trial.`,
  },
  {
    q: "Is it safe for customers to print at a cyber cafe using RepetiGo?",
    a: `Yes - with RepetiGo, every document is protected at four distinct levels. First, the upload travels over TLS encryption from the customer's phone to the document cloud. Second, the document is stored with AES-256 encryption at rest. Third, the Print Bridge agent on your counter computer receives only a print-ready stream - it never downloads or stores the original file. Fourth, the S3 lifecycle policy deletes the document within 15 minutes of print completion. After those 15 minutes, the document does not exist on any system. For customers, this is the safest document printing experience available at a cyber cafe in India. [Full security documentation](@security) is available on our privacy page.`,
  },
  {
    q: "How do I replace WhatsApp in my cyber cafe?",
    a: `To replace WhatsApp as a document transfer method at your cyber cafe india, follow these steps: sign up for a RepetiGo [free trial](@pricing) → download and install Print Bridge on your counter computer → connect your existing printer → your RepetiGo dashboard generates a unique QR code for your shop → print this QR code and laminate it at your counter. From that moment, your workflow changes: when a customer arrives, point them to the QR code instead of your WhatsApp. The rest happens automatically. Most cyber cafe owners complete this transition within a single working day.`,
  },
  {
    q: "How much time does RepetiGo save at a busy cyber cafe?",
    a: `At a cyber cafe handling 50 documents a day, manual WhatsApp-based editing takes 3 to 5 minutes per document on average. That is 150 to 250 minutes - 2.5 to 4 hours - of manual editing every single working day. Over a 26-day working month, this is between 65 and 104 hours of staff time spent on document preparation alone. RepetiGo's AI processing handles the same task in under 30 seconds per document. The time saved goes back into serving more customers, managing the queue, or running the counter more efficiently. Most cyber cafe owners who switch to RepetiGo report serving 30 to 40 percent more customers in the same working hours.`,
  },
  {
    q: "Is there a free version of RepetiGo for cyber cafes?",
    a: `RepetiGo offers a 14-day free trial - no credit card required, no commitment. This is a full-feature trial: QR document upload, AI processing, auto-delete in 15 minutes, real-time print queue, UPI billing, and the analytics dashboard are all active during the trial period. There is no permanently free cyber cafe management software version - RepetiGo is a monthly subscription SaaS product. The trial is designed to give you enough time to run a full working week through the platform, experience the workflow shift, and make an informed decision before any payment. [Pricing details](@pricing) are on our pricing page.`,
  },
  {
    q: "Does RepetiGo work with WiFi printers in a cyber cafe?",
    a: `Yes. RepetiGo works with WiFi network printers as well as USB-connected printers via the Print Bridge desktop agent. Supported brands include HP, Canon, Epson, Brother, and Xerox - both USB and network models. For cyber cafe setups with cyber cafe management software wifi-connected printers, Print Bridge discovers them automatically on the local network during setup. No manual IP configuration is required for most supported models. Setup takes under 10 minutes. For a [full printer compatibility list](@printers), see our help and support page.`,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BUSINESS.website },
        { "@type": "ListItem", position: 2, name: "Cyber Cafes", item: PAGE_URL },
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
      name: "How Cyber Cafe Document Printing Works with RepetiGo",
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

export default function CyberCafesSolutionPage() {
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
            <span aria-current="page">Cyber Cafes</span>
          </nav>
          <h1>Cyber Cafe Management Software India - Secure, Fast, and Built for How You Actually Work.</h1>
          <p>
            RepetiGo is cyber cafe management software India - a secure document printing platform that handles the
            complete lifecycle of every print job at your counter. When a customer arrives with an Aadhaar card to
            print, here is what happens: they scan a QR code at your counter, their document uploads from their phone
            over an encrypted connection, the AI prepares it for printing in under 30 seconds, you print it with one
            tap, and it is permanently deleted within 15 minutes. No WhatsApp. No personal phone number shared. No
            document sitting on your counter computer.
          </p>
          <p>
            For cyber cafe owners across India - from a 4-system setup in a small town to a 20-machine shop in a metro
            - this is the cyber cafe software india that turns document printing from a daily privacy liability into a
            professional, DPDP Act 2023 compliant service.
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
          <h2>The Document Problem Every Cyber Cafe Owner in India Is Living With.</h2>
          <div className="about-copy">
            {problemParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Zap size={20} aria-hidden />
            <p>
              <strong>Still using WhatsApp for document printing?</strong> See exactly how RepetiGo replaces it - and why
              it matters under India&apos;s DPDP Act 2023.{" "}
              <Link href={LINKS.whatsapp}>Why WhatsApp is not the right tool for document printing</Link>
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>How RepetiGo&apos;s Cyber Cafe Management Software Works.</h2>
          <div className="about-copy">
            <p>
              The complete document workflow at a RepetiGo-enabled cyber cafe runs in four steps. The whole cycle - from
              QR scan to printed document - takes under 90 seconds.
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
              <strong>QR scan to completed print: under 90 seconds.</strong> Upload to permanent deletion: under 20
              minutes total. Your counter computer never holds a copy of the document at any point in the process.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>Why Cyber Cafe Owners Across India Replace WhatsApp With RepetiGo.</h2>
          <div className="about-copy">
            <p>
              WhatsApp was not designed for document printing. It was designed for messaging. The fact that Indian cyber
              cafes have been using it as a document transfer method for a decade is a sign of how absent purpose-built
              tools have been - not a sign that WhatsApp is the right tool. Here is a direct comparison:
            </p>
          </div>
          <div className="sol-table-wrap">
            <table className="sol-table">
              <caption className="sol-sr-only">WhatsApp versus RepetiGo for cyber cafe document printing</caption>
              <thead>
                <tr>
                  <th scope="col">What Matters</th>
                  <th scope="col">WhatsApp (Current)</th>
                  <th scope="col">RepetiGo</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(([topic, whatsapp, repetigo]) => (
                  <tr key={topic}>
                    <th scope="row">{topic}</th>
                    <td>{whatsapp}</td>
                    <td>
                      <Rich text={repetigo} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="about-copy">
            <p>
              The monthly cost of RepetiGo is less than what most cyber cafe owners spend in manual labour on document
              editing alone. Three minutes per document, 50 documents a day, 26 working days: that is 65 hours every
              month - spent on a task that this cyber cafe management software india handles automatically in 30
              seconds. Read the full comparison:{" "}
              <Link href={LINKS.whatsapp}>why WhatsApp is not the right tool for document printing</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>What the Best Cyber Cafe Management Software Actually Needs to Do.</h2>
          <div className="about-copy">
            <p>
              Searching for the best cyber cafe management software means looking for a system that solves the real
              operational problems - not just the visible ones. There are three real problems most cyber cafes face, and
              they are not the ones that show up first in a Google search:
            </p>
            {bestSoftwareItems.map((item) => (
              <p key={item}>
                <Rich text={item} />
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-heading">
            <h2>Every Feature Built for Indian Cyber Cafe Workflows.</h2>
            <p>
              Every feature in RepetiGo&apos;s cyber cafe document management india platform was built around the
              specific workflows that Indian cyber cafe owners actually run. Nothing generic. Nothing enterprise-first
              and then adapted down. Here is what you get:
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
          <h2>The DPDP Act 2023 - What It Means for Your Cyber Cafe.</h2>
          <div className="about-copy">
            {dpdpParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <aside className="sol-callout">
            <Lock size={20} aria-hidden />
            <p>
              <Link href={LINKS.compliance}>DPDP Act 2023 compliance documentation</Link> is available on our privacy
              page. We recommend consulting a legal advisor for the DPDP Act obligations specific to your business.
              RepetiGo&apos;s architecture is designed to support compliance - it does not constitute legal advice.
            </p>
          </aside>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-narrow">
          <h2>What Your Customers Experience at a RepetiGo-Enabled Cyber Cafe.</h2>
          <div className="about-copy">
            {experienceParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section sol-alt">
        <div className="about-container about-narrow">
          <h2>Getting Started - Pricing and Free Trial.</h2>
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
          <h2>Frequently Asked Questions - Cyber Cafe Management Software India.</h2>
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
          <h2>Your Customers Trust You With Their Most Sensitive Documents. Honour That Trust Automatically.</h2>
          <p>
            Every day, customers walk into cyber cafes across India and hand over their Aadhaar cards, PAN cards, bank
            statements, and medical certificates - trusting that these documents will be handled with care.
            RepetiGo&apos;s cyber cafe management software india makes that trust automatic: documents are uploaded
            securely, processed precisely, printed consistently, and deleted within 15 minutes. Not because someone
            remembered to delete them. Because the system makes retention impossible.
          </p>
          <p>
            14-day free trial. No credit card. No setup fee. Your existing printers. Under 10 minutes to your first
            QR-to-print cycle.
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
