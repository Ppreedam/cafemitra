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
  FileText,
  GraduationCap,
  KeyRound,
  Landmark,
  Languages,
  Lock,
  MessageCircle,
  Play,
  Printer,
  QrCode,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { LandingNavbar } from "./LandingNavbar";
import { PublicFooter } from "./PublicFooter";

type IconType = ElementType;

const trust = [
  { icon: MessageCircle, label: "No WhatsApp required" },
  { icon: Printer, label: "Works with your existing printer" },
  { icon: Lock, label: "Secure document upload" },
  { icon: Trash2, label: "Auto-delete after printing" },
  { icon: Zap, label: "Setup in 10 minutes" },
];

const socialStats = [
  { icon: Store, value: "2,500+", label: "Print Shops" },
  { icon: FileText, value: "8M+", label: "Documents Processed" },
  { icon: Landmark, value: "180+", label: "Cities Covered" },
  { icon: Clock, value: "< 2 min", label: "Avg. Print Time" },
];

const howSteps = [
  {
    icon: QrCode,
    title: "Customer Scans Your QR Code",
    body: "Place the RepetiGo QR at your counter. Customers scan with their phone camera - no app, no login. A secure upload page opens instantly.",
  },
  {
    icon: Lock,
    title: "Secure Document Upload",
    body: "Files travel encrypted directly into your print queue. Never touches your phone, WhatsApp, or email.",
  },
  {
    icon: Sparkles,
    title: "AI Processing - Automatic",
    body: "AI detects pages, fixes orientation, removes shadows, resizes, and optimises for your printer. Under 30 seconds.",
  },
  {
    icon: Trash2,
    title: "Print & Auto-Delete",
    body: "One-click print to your connected printer. Document permanently deleted within 15 minutes. No storage. No liability.",
  },
];

const features = [
  {
    icon: QrCode,
    title: "Secure QR Code Document Upload",
    body: "Your shop gets a unique QR. Customers scan and upload from their own phone - no WhatsApp, no email exchanged.",
  },
  {
    icon: Sparkles,
    title: "AI Document Processing",
    body: "Detects pages, corrects skewed photos, removes shadows, resizes, and optimises for your printer model automatically.",
  },
  {
    icon: Printer,
    title: "Direct Printer Integration",
    body: "Connects to your existing USB/network printer via Print Bridge. Manage queue, status, and priority from one dashboard.",
  },
  {
    icon: ScanLine,
    title: "Passport Photo Generator",
    body: "Government-standard passport and visa photos generated automatically with AI face detection and exact dimensions.",
  },
  {
    icon: Languages,
    title: "OCR - Extract Text",
    body: "Extract text from scanned docs, handwritten forms, and image PDFs. Hindi plus regional Indian languages supported.",
  },
  {
    icon: Trash2,
    title: "Auto-Delete After Printing",
    body: "Documents permanently deleted within 15 minutes of printing. Not a setting - built into the architecture.",
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
  { name: "PrintPilot", desc: "QR upload, AI processing, print queue, auto-delete, full dashboard.", href: "/print-automation", status: "Available" },
  { name: "PDF Tools", desc: "Create, merge, split, compress, and convert - all in one place.", href: "/pdf-tools", status: "Available" },
  { name: "OCR", desc: "Extract text from any scanned doc. Hindi plus Indian languages.", href: "#", status: "Available" },
  { name: "Passport Photo Tool", desc: "Government-standard photos generated automatically.", href: "#", status: "Available" },
  { name: "Cloud Printing", desc: "Print from anywhere, to any connected RepetiGo shop.", href: "#", status: "Coming Soon" },
  { name: "Digital Locker + eSign", desc: "Secure document storage and Aadhaar-based eSign.", href: "#", status: "Coming Soon" },
];

const industries = [
  { icon: Coffee, title: "Cyber Cafes", desc: "Handle high document volume without WhatsApp chaos.", benefit: "Serve 40% more customers per day", href: "#" },
  { icon: Printer, title: "Print Shops & Xerox", desc: "Complete printing business software. Automate every job.", benefit: "Save 150+ min manual work daily", href: "#" },
  { icon: Landmark, title: "CSC Centres", desc: "Government document printing with DPDP compliance and audit logs.", benefit: "DPDP Act compliant", href: "#" },
  { icon: GraduationCap, title: "Schools & Colleges", desc: "Marksheets, ID cards, application forms - handled securely at scale.", benefit: "Zero staff training required", href: "#" },
  { icon: Building2, title: "Offices & Businesses", desc: "Automate repetitive document tasks across your team.", benefit: "Integrate with existing workflow", href: "#" },
];

const securityLayers = [
  { icon: Lock, title: "End-to-End Encryption", body: "AES-256 at rest. TLS in transit. Encrypted from upload until deletion." },
  { icon: Smartphone, title: "Direct Customer Upload", body: "Customers upload from their own phone. Never touches your WhatsApp or device." },
  { icon: Trash2, title: "Auto-Delete Within 15 Minutes", body: "Permanent deletion after printing. Built into the system, not optional." },
  { icon: ShieldCheck, title: "DPDP Act Compliance", body: "Aligned with India's Digital Personal Data Protection Act 2023. Zero retention." },
  { icon: ClipboardList, title: "Audit Logs", body: "Every job logged with timestamp and metadata. Content never stored." },
  { icon: KeyRound, title: "Role-Based Access Control", body: "Owners, staff, and admins have different access levels. Nothing more than needed." },
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
    a: "Print shop software helps print shops, cyber cafes, and document service centres manage receiving, processing, and printing customer documents. RepetiGo replaces manual WhatsApp handling with secure QR uploads, AI processing, and direct printer integration.",
  },
  {
    q: "What is the best print shop software in India?",
    a: "RepetiGo is built specifically for Indian cyber cafes, print shops, and CSC centres handling sensitive documents like Aadhaar and PAN daily.",
  },
  {
    q: "Is there a free version of RepetiGo?",
    a: "RepetiGo offers a 14-day free trial with full access to PrintPilot, QR upload, AI processing, and direct printer integration.",
  },
  {
    q: "How does QR code document upload work for customers?",
    a: "Your shop receives a unique QR. Customers scan with their phone camera, open a secure browser upload page, and send files directly into your queue.",
  },
  {
    q: "Does RepetiGo work with my existing printer?",
    a: "Yes. It works with standard USB and network printers from brands like HP, Canon, Epson, Brother, and Xerox.",
  },
  {
    q: "What happens to customer documents after printing?",
    a: "Documents are automatically and permanently deleted within 15 minutes of a successful print job.",
  },
];

export default function Home() {
  return (
    <main className="ai-landing-shell">
      <LandingNavbar />
      <Hero />
      <SocialProof />
      <Problem />
      <Solution />
      <HowItWorks />
      <Features />
      <InlineCTA />
      <WhyRepetigo />
      <Products />
      <Industries />
      <Security />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <PublicFooter />
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
            RepetiGo is an AI-powered automation platform for cyber cafés and print shops that automates document printing, passport photos, AI form filling, PDF tools, agreements, and customer workflows.
          </p>
          <div className="ai-actions">
            <Link className="ai-btn ai-btn-brand" href="/register">
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
        src="/hero-print-queue.png"
        alt="RepetiGo live print queue dashboard"
      />
      <div className="ai-qr-card">
        <span className="ai-qr-box">
          <QrCode size={64} strokeWidth={1.5} />
        </span>
        <div>
          <strong>Scan the QR code</strong>
          <p>Let your customers upload documents in seconds.</p>
          <a href="#demo">
            <Play size={12} /> How it works
          </a>
        </div>
      </div>
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
        <InfoCard icon={Clock} title="3-5 Minutes of Manual Work. Per Document." body="Skewed phone photos. Wrong sizes. Manual cropping, rotating, adjusting margins. 50 documents a day equals 150+ minutes of pure labour software should handle." danger />
      </div>
      <p className="ai-center-note">It does not have to work this way. -&gt;</p>
    </section>
  );
}

function Solution() {
  const rows = [
    ["Customer sends Aadhaar on WhatsApp", "Customer scans QR - nothing on WhatsApp"],
    ["Document sits on your phone forever", "Auto-deleted within 15 minutes of printing"],
    ["3-5 minutes manual editing per document", "AI processes everything in under 30 seconds"],
    ["Print settings guessed manually each time", "Optimal settings applied automatically"],
    ["No record of what was printed or when", "Full print log in your dashboard"],
  ];

  return (
    <section className="ai-dark-section">
      <div className="ai-container">
        <div className="ai-section-head">
          <SectionTag variant="dark">The Solution</SectionTag>
          <h2>Meet RepetiGo. Print Shop Software Built Differently.</h2>
          <p>AI-powered print shop software that automates your entire document workflow - from the moment a customer walks in to the moment their document is printed and deleted.</p>
        </div>
        <div className="ai-before-after">
          <div className="ai-ba-head"><span><X size={16} /> Before RepetiGo</span><span><Check size={16} /> After RepetiGo</span></div>
          {rows.map(([before, after]) => (
            <div className="ai-ba-row" key={before}><span>{before}</span><strong>{after}</strong></div>
          ))}
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
          <h2>Complete Print Shop Management - In One Platform.</h2>
          <p>Every feature your print shop needs. One system, built for how Indian print shops actually work.</p>
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
          <a className="ai-btn ai-btn-glass" href="#features">View All Features</a>
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
        <h2>The Only Software Built for Indian Print Shops.</h2>
        <p>Most print management software was built for large commercial printers. RepetiGo is built for the shop that serves 50-200 customers a day, handles Aadhaar and PAN, and needs everything to just work.</p>
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
          <h2>A Growing Platform. Starting With What You Need Today.</h2>
        </div>
        <div className="ai-card-grid">
          {products.map((product) => (
            <Link className="ai-product-card" href={product.href} key={product.name}>
              <div>
                <span className={product.status === "Available" ? "ai-pill success" : "ai-pill"}>{product.status}</span>
                <ChevronRight size={17} />
              </div>
              <h3>{product.name}</h3>
              <p>{product.desc}</p>
            </Link>
          ))}
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
        <p><Users size={24} /> Join 2,500+ Print Shops Using RepetiGo</p>
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
        <p>Every day without RepetiGo is another day of customer documents on your WhatsApp. Another day of manual work per job. Another day of privacy risk. RepetiGo changes that. In 10 minutes.</p>
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
