import Link from "next/link";
import {
  BadgeCheck,
  Check,
  CircleHelp,
  CreditCard,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";
import { PublicFooter } from "../PublicFooter";

const coreFeatures = [
  "Secure QR Upload",
  "AI Print Automation",
  "Auto Crop",
  "Auto Rotation",
  "Auto Deskew",
  "AI Image Enhancement",
  "Print Queue Management",
  "Shop Dashboard",
  "Automatic File Deletion",
  "Cloud Updates",
  "Standard Support",
];

const feeExamples = [
  ["Rs. 20", "Rs. 0.60"],
  ["Rs. 50", "Rs. 1.50"],
  ["Rs. 100", "Rs. 3.00"],
  ["Rs. 200", "Rs. 6.00"],
];

const modelSteps = [
  ["1", "Customer pays your shop", "You set your own document service prices and collect payment through the RepetiGo workflow."],
  ["2", "RepetiGo charges 3%", "A small platform fee is applied only after the customer transaction succeeds."],
  ["3", "You keep the rest", "No fixed software bill, no monthly pressure, and no payment when your shop does not earn."],
];

const modelHighlights = [
  ["Monthly software fee", "Rs. 0"],
  ["Setup fee", "Rs. 0"],
  ["Trial", "30 days free"],
  ["Platform fee", "3% per successful transaction"],
];

const faqs = [
  [
    "Is there any fixed monthly plan?",
    "No. RepetiGo is currently keeping pricing simple with one usage-based model: pay only when your shop earns from a successful customer transaction.",
  ],
  [
    "How does the 3% platform fee work?",
    "Instead of paying monthly, RepetiGo deducts a 3% platform fee from each successful customer transaction. If a customer pays Rs. 100, the platform fee is Rs. 3 and you receive Rs. 97.",
  ],
  [
    "Do I pay when there are no customer orders?",
    "No. If your shop has no successful customer transaction through RepetiGo, there is no platform fee for that period.",
  ],
  [
    "Are all core features included?",
    "Yes. The core RepetiGo workflow is included: QR upload, AI print automation, queue management, shop dashboard, automatic file deletion, cloud updates, and standard support.",
  ],
];

export default function PricingPage() {
  return (
    <main className="pricing-shell">
      <LandingNavbar />

      <section className="pricing-hero">
        <div className="pricing-container">
          <span className="pricing-kicker">
            <Sparkles size={14} /> Pricing
          </span>
          <h1>Pricing That Starts Only When Your Shop Earns</h1>
          <p>
            Start with zero monthly software cost. RepetiGo earns only when your shop earns from a successful customer transaction.
          </p>
          <div className="pricing-hero-meta">
            <span>Rs. 0 monthly fee</span>
            <span>30-day free trial</span>
            <span>3% only on successful transactions</span>
          </div>
        </div>
      </section>

      <section className="pricing-options pricing-container">
        <div className="pricing-heading">
          <span className="pricing-section-label">One simple model</span>
          <h2>Pay Only When You Earn</h2>
        </div>
        <div className="pricing-tabs pricing-single-pill" aria-label="Current pricing model">
          <span className="active">Usage-Based Pricing</span>
        </div>
      </section>

      <section className="pricing-offer">
        <div className="pricing-container pricing-offer-card">
          <div>
            <span className="pricing-section-label">Launch Offer</span>
            <h2>
              <Rocket size={30} /> Launch Offer
            </h2>
          </div>
          <div className="pricing-offer-grid">
            {["30-Day Free Trial", "No Monthly Bill", "Free Setup", "Free Onboarding", "3% Only After Successful Orders"].map((item) => (
              <span key={item}>
                <BadgeCheck size={17} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-container pricing-earn-grid">
        <article className="pricing-usage-card">
          <span className="pricing-section-label">Usage-Based Pricing</span>
          <h2>Pay Only When You Earn</h2>
          <p>
            Perfect for cyber cafes and print shops that want powerful automation without a fixed monthly commitment.
            You start with RepetiGo, process customer orders, and pay only after money comes into your shop.
          </p>

          <div className="pricing-fee-panel">
            <CreditCard size={24} />
            <div>
              <strong>3% Platform Fee</strong>
              <span>charged only on every successful customer transaction.</span>
            </div>
          </div>

          <div className="pricing-example-table">
            <div className="pricing-example-head">
              <span>Customer Pays</span>
              <span>RepetiGo Fee</span>
            </div>
            {feeExamples.map(([pay, fee]) => (
              <div className="pricing-example-row" key={pay}>
                <span>{pay}</span>
                <strong>{fee}</strong>
              </div>
            ))}
          </div>
          <p className="pricing-small-note">You keep the remaining amount.</p>

          <div className="pricing-best-for">
            <strong>Best For</strong>
            <span>New Cyber Cafes</span>
            <span>Low-volume Shops</span>
            <span>Businesses that want zero monthly commitment</span>
          </div>

          <Link className="pricing-primary-link" href="/register">
            Start Free Trial <Zap size={17} />
          </Link>
        </article>

        <aside className="pricing-model-card">
          <span className="pricing-section-label">How it works</span>
          <h2>No monthly bill. No inactive-shop penalty.</h2>
          <p>
            RepetiGo grows with your transaction volume. If you process more jobs, the platform earns a small share.
            If business is quiet, your fixed software cost stays at zero.
          </p>

          <div className="pricing-model-highlights">
            {modelHighlights.map(([label, value]) => (
              <span key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </span>
            ))}
          </div>

          <div className="pricing-step-list">
            {modelSteps.map(([step, title, text]) => (
              <div className="pricing-step" key={step}>
                <span>{step}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="pricing-included pricing-container">
        <div className="pricing-heading">
          <span className="pricing-section-label">Included from day one</span>
          <h2>One model includes the core RepetiGo workflow</h2>
        </div>
        <div className="pricing-included-grid">
          {coreFeatures.map((feature) => (
            <span key={feature}>
              <Check size={16} /> {feature}
            </span>
          ))}
        </div>
      </section>

      <section className="pricing-faq pricing-container">
        <div className="pricing-heading">
          <span className="pricing-section-label">Frequently Asked Questions</span>
          <h2>Clear answers before you choose</h2>
        </div>
        <div className="pricing-faq-grid">
          {faqs.map(([question, answer]) => (
            <article key={question}>
              <CircleHelp size={20} />
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-why">
        <div className="pricing-container">
          <span className="pricing-section-label">Why this model is stronger</span>
          <h2>Simple, fair pricing for shops that want to grow without fixed software pressure.</h2>
          <div className="pricing-why-grid">
            {[
              "New shops can start with zero fixed cost and only pay when they earn.",
              "Seasonal or low-volume shops are not punished during quiet days.",
              "Every successful order contributes a small platform fee that keeps RepetiGo improving.",
            ].map((item) => (
              <div key={item}>
                <ShieldCheck size={20} />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
