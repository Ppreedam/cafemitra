import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  Clock3,
  FileText,
  Heart,
  Landmark,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";
import { PublicFooter } from "../PublicFooter";

export const metadata: Metadata = {
  title: "About RepetiGo - India's Document Infrastructure Platform",
  description:
    "RepetiGo is building AI-powered print shop software that eliminates WhatsApp-based document sharing, automates processing, and protects customer privacy across India.",
};

const workflow = [
  {
    icon: QrCode,
    title: "Customer scans QR code",
    detail: "No app. No account. Any phone.",
  },
  {
    icon: Lock,
    title: "Encrypted upload",
    detail: "TLS 1.3 - never touches WhatsApp.",
  },
  {
    icon: Bot,
    title: "AI processes in < 30 seconds",
    detail: "Crop, enhance, and make print-ready.",
  },
  {
    icon: FileText,
    title: "Prints automatically",
    detail: "Sent directly to the connected printer.",
  },
  {
    icon: Trash2,
    title: "Auto-deleted in 15 minutes",
    detail: "Zero retention. Zero liability.",
  },
];

const stats = [
  ["500+", "Partner Shops"],
  ["50K+", "Documents Processed"],
  ["15 min", "Auto-Delete Default"],
  ["AES-256", "Encryption Standard"],
];

const values = [
  {
    icon: Lock,
    title: "Privacy by Design",
    body: "Privacy is not a setting or a toggle. It is the architecture. Every decision starts with protecting the customer's document.",
  },
  {
    icon: ShieldCheck,
    title: "Security First",
    body: "AES-256. TLS 1.3. Auto-deletion at 15 minutes. We do not add security features - we build secure systems.",
  },
  {
    icon: Bot,
    title: "AI with Responsibility",
    body: "Our AI enhances documents to help users. It never reads content, builds profiles, or trains on customer files without consent.",
  },
  {
    icon: Zap,
    title: "Speed Without Compromise",
    body: "Documents should print in under 2 minutes, start to finish. Speed and security are not opposites - we build both.",
  },
  {
    icon: Landmark,
    title: "Built for India",
    body: "Aadhaar, PAN, UPI, DPDP Act - we understand the Indian context deeply. This is not a Western product localised for India.",
  },
  {
    icon: Heart,
    title: "Long-Term Thinking",
    body: "We are building infrastructure that India's businesses can rely on for decades, not just optimising for this quarter.",
  },
];

const roadmap = [
  {
    phase: "Phase 1 - Now",
    title: "Print Shops & Cyber Cafes",
    body: "Secure QR upload, AI processing, direct printing, auto-delete.",
  },
  {
    phase: "Phase 2",
    title: "CSC Centres & Government",
    body: "DPDP-compliant workflows, audit logs, DigiLocker integration.",
  },
  {
    phase: "Phase 3",
    title: "Healthcare & Education",
    body: "Patient records, student documents, bulk printing - all secure.",
  },
  {
    phase: "Phase 4",
    title: "Enterprise & APIs",
    body: "India document infrastructure platform - powering any business.",
  },
];

const beliefs = [
  {
    title: "Every customer document deserves to be treated like it matters.",
    body: "Because it does. Aadhaar, PAN, medical records, certificates - these are not files. They are people's lives.",
  },
  {
    title: "Manual work is a solvable problem.",
    body: "Three to five minutes editing each document is not the cost of running a print shop. It is the cost of not having the right software.",
  },
  {
    title: "Small businesses deserve enterprise-grade infrastructure.",
    body: "The cyber cafe owner serving 100 customers a day should have the same security as a bank. Technology should close that gap.",
  },
  {
    title: "Compliance should be the default, not the upgrade.",
    body: "DPDP Act compliance should not require a legal team. It should be built into the software from day one.",
  },
];

const exploreLinks = [
  ["See the Platform", "/print-automation", "How the technology works"],
  ["Security & Privacy", "/privacy-policy", "Our security architecture"],
  ["View Pricing", "/pricing", "Plans for every shop size"],
  ["Contact Us", "/contact-us", "Talk to our team"],
];

export default function AboutUsPage() {
  return (
    <main className="about-shell">
      <LandingNavbar />

      <section className="about-hero">
        <div className="about-container">
          <span className="about-kicker">
            <Sparkles size={14} /> About RepetiGo
          </span>
          <h1>We're Building the Infrastructure Behind Every Document.</h1>
          <p>
            RepetiGo started with one observation: millions of sensitive documents
            travel over WhatsApp every day in India. We built the platform that fixes that.
          </p>
        </div>
      </section>

      <section className="about-section about-origin">
        <div className="about-container about-narrow">
          <span className="about-section-label">Our Origin</span>
          <h2>A Problem Hiding in Plain Sight.</h2>
          <div className="about-copy">
            <p>
              Walk into any cyber cafe in India. Watch what happens when someone needs to print their Aadhaar card.
              The owner says: <strong>"Send it on WhatsApp."</strong>
            </p>
            <p>
              A government-issued identity document - one of the most sensitive pieces of personal data a person owns -
              travels to a stranger's personal phone number. It sits there. It never gets deleted. Nobody thinks about it.
            </p>
            <p>
              This happens across 500,000+ print shops, cyber cafes, and CSC centres in India. Every single day.
              And nobody had built a better way.
            </p>
            <p className="about-punch">That's why we built RepetiGo.</p>
          </div>
        </div>
      </section>

      <section className="about-section about-mission">
        <div className="about-container about-split">
          <div>
            <span className="about-section-label">Mission</span>
            <h2>Make Document Handling Instant, Secure, and Invisible.</h2>
            <div className="about-copy">
              <p>
                We believe the infrastructure behind document printing should work the way great software always does:
                you stop noticing it because it never fails you.
              </p>
              <p>
                Print shop owners should not spend 3 hours a day manually editing documents. Customers should not hand over
                their Aadhaar to a stranger's WhatsApp. And nobody should worry about whether their data was deleted.
              </p>
              <p>
                RepetiGo automates all of it - from QR upload through AI processing to automatic deletion - so the document
                lifecycle is secure, fast, and completely hands-free.
              </p>
            </div>
          </div>

          <aside className="about-workflow-card">
            <h3>The RepetiGo Workflow</h3>
            <div>
              {workflow.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title}>
                    <span>
                      <Icon size={18} />
                    </span>
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.detail}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      <section className="about-stats">
        <div className="about-container">
          <div className="about-stats-head">
            <span className="about-kicker dark">
              <Clock3 size={14} /> Platform Statistics
            </span>
            <h2>Built for high-trust, high-volume document workflows.</h2>
          </div>
          <div className="about-stats-grid">
            {stats.map(([value, label]) => (
              <div key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container">
          <div className="about-heading">
            <span className="about-section-label">Values</span>
            <h2>Principles We Don't Compromise On.</h2>
          </div>
          <div className="about-card-grid">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article className="about-value-card" key={value.title}>
                  <span>
                    <Icon size={22} />
                  </span>
                  <h3>{value.title}</h3>
                  <p>{value.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="about-section about-roadmap-section">
        <div className="about-container">
          <div className="about-heading">
            <span className="about-section-label">Vision & Roadmap</span>
            <h2>Print Shops Today. Document Infrastructure Tomorrow.</h2>
            <p>We start where the problem is most acute. Then we build outward.</p>
          </div>
          <div className="about-roadmap">
            {roadmap.map((item) => (
              <article key={item.phase}>
                <span>{item.phase}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <blockquote className="about-quote">
            "We believe document handling should be as secure and effortless as online payments."
            <span>- The RepetiGo Team</span>
          </blockquote>
        </div>
      </section>

      <section className="about-section">
        <div className="about-container about-beliefs">
          <div>
            <span className="about-section-label">What We Believe</span>
            <h2>A Few Things We Believe Deeply.</h2>
          </div>
          <div className="about-belief-list">
            {beliefs.map((belief) => (
              <article key={belief.title}>
                <h3>{belief.title}</h3>
                <p>{belief.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-explore">
        <div className="about-container">
          <div className="about-heading">
            <span className="about-section-label">Explore RepetiGo</span>
            <h2>Keep exploring the platform.</h2>
          </div>
          <div className="about-explore-grid">
            {exploreLinks.map(([title, href, body]) => (
              <Link href={href} key={title}>
                <strong>{title}</strong>
                <p>{body}</p>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="about-final-cta">
        <div className="about-container">
          <h2>Ready to see RepetiGo in action?</h2>
          <p>Start your free trial today. No credit card. No manual setup. Up and running in 10 minutes.</p>
          <div className="about-cta-actions">
            <Link href="/register">Start Free Trial <ArrowRight size={18} /></Link>
            <Link href="/contact-us">Book a Demo</Link>
          </div>
          <ul>
            <li><Check size={16} /> 14-day free trial</li>
            <li><Check size={16} /> No credit card required</li>
            <li><Check size={16} /> Cancel anytime</li>
          </ul>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
