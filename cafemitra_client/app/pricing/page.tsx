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

const feeExamples = [
  ["Black & White Print", "Rs. 0.50 / page"],
  ["Color Print", "Rs. 1.00 / page"],
  ["Passport Size Photo", "Rs. 5.00 / request"],
];

const walletSteps = [
  ["1", "Your 14-day trial starts free", "The moment you sign up, RepetiGo credits Rs. 10 to your wallet for 14 days so you can try PrintPilot on real customer orders, risk free."],
  ["2", "Recharge when you need more", "Once your 14-day trial ends or your Rs. 10 credit runs out, simply top up your wallet to keep PrintPilot billing your print and photo jobs automatically."],
  ["3", "Apply for settlement every EOD", "At the end of each day, apply to settle that day's earnings. No waiting for a weekly or monthly payout cycle - your daily income is yours to withdraw the same day."],
];

const walletHighlights = [
  ["Free trial", "14 days"],
  ["Trial wallet credit", "Rs. 10"],
  ["Settlement cycle", "Every EOD"],
  ["Monthly software fee", "Rs. 0"],
];

const freeTools = [
  "PDF Tools - completely free",
  "Image Tools - completely free",
  "Background Remover - free",
  "Merge, Split & Compress PDF - free",
  "Meme Generator & Photo Editor - free",
  "PrintPilot dashboard & queue - free to use",
];

const faqs = [
  [
    "What does \"Pay Only When You Earn\" actually mean?",
    "It means RepetiGo never charges you a fixed monthly software bill. You only pay a small commission from your wallet when PrintPilot completes a real customer job - a printed page or a passport photo request. If you have no orders, you pay nothing.",
  ],
  [
    "How much commission does RepetiGo charge per job?",
    "Every black & white page printed through PrintPilot costs Rs. 0.50, every color page costs Rs. 1.00, and every passport size photo request costs Rs. 5.00. These small amounts are deducted automatically from your wallet - you are always free to charge your own customers whatever counter price you prefer.",
  ],
  [
    "What happens after my 14-day trial ends?",
    "RepetiGo gives every new shop Rs. 10 of free wallet credit that stays valid for 14 days, so you can put PrintPilot to work on real orders before spending anything. Once the 14 days are over or the Rs. 10 credit is used up, just recharge your wallet to keep PrintPilot billing your jobs without any interruption.",
  ],
  [
    "How and when do I get my money?",
    "Your daily earnings are always yours. At the end of each day (EOD) you can apply for settlement, and that day's income is processed for withdrawal - you are never asked to wait for a weekly or monthly cycle to access what you have earned.",
  ],
  [
    "Are the PDF tools and Image tools also charged from my wallet?",
    "No. PDF Tools, Image Tools, the background remover, meme generator, photo editor, and every everyday utility on RepetiGo are completely free to use. Only automated PrintPilot print jobs and passport photo requests use your wallet balance.",
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
          <h1>Pay Only When You Earn</h1>
          <p>
            No monthly software bill, no hidden charges. Keep a small prepaid wallet, and RepetiGo deducts a tiny
            commission only when PrintPilot completes a real customer print or photo job for your shop.
          </p>
          <div className="pricing-hero-meta">
            <span>14-day free trial</span>
            <span>Rs. 10 trial wallet credit</span>
            <span>Settlement every EOD</span>
          </div>
        </div>
      </section>

      <section className="pricing-options pricing-container">
        <div className="pricing-heading">
          <span className="pricing-section-label">One simple model</span>
          <h2>Pay Only When You Earn</h2>
        </div>
        <div className="pricing-tabs pricing-single-pill" aria-label="Current pricing model">
          <span className="active">Wallet-Based Commission</span>
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
            {["14-Day Free Trial", "Rs. 10 Free Wallet Credit", "No Setup Fee", "Free PDF & Image Tools", "Daily Settlement"].map((item) => (
              <span key={item}>
                <BadgeCheck size={17} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-container pricing-earn-grid">
        <article className="pricing-usage-card">
          <span className="pricing-section-label">How PrintPilot Billing Works</span>
          <h2>Pay Only When You Earn</h2>
          <p>
            When a customer's job runs through PrintPilot, RepetiGo deducts a small, fixed commission straight from
            your shop wallet - nothing more. You are always free to set and collect your own counter price from the
            customer; the amount below is only what RepetiGo keeps for automating the job.
          </p>

          <div className="pricing-fee-panel">
            <CreditCard size={24} />
            <div>
              <strong>Simple Per-Page Commission</strong>
              <span>deducted automatically from your wallet for every completed job.</span>
            </div>
          </div>

          <div className="pricing-example-table">
            <div className="pricing-example-head">
              <span>Service</span>
              <span>RepetiGo Commission</span>
            </div>
            {feeExamples.map(([label, fee]) => (
              <div className="pricing-example-row" key={label}>
                <span>{label}</span>
                <strong>{fee}</strong>
              </div>
            ))}
          </div>
          <p className="pricing-small-note">You keep everything you charge your customer beyond this small commission.</p>

          <Link className="pricing-primary-link" href="/register">
            Start Free Trial <Zap size={17} />
          </Link>
        </article>

        <aside className="pricing-model-card">
          <span className="pricing-section-label">Wallet & Settlement</span>
          <h2>Prepaid wallet. Same-day settlement.</h2>
          <p>
            Add credits to your wallet in advance, and RepetiGo draws from it as PrintPilot completes jobs. When it's
            time to get paid, you don't wait - apply for settlement of your day's earnings every single EOD.
          </p>

          <div className="pricing-model-highlights">
            {walletHighlights.map(([label, value]) => (
              <span key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </span>
            ))}
          </div>

          <div className="pricing-step-list">
            {walletSteps.map(([step, title, text]) => (
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
          <span className="pricing-section-label">Always free</span>
          <h2>Everyday tools stay free - your wallet is only for PrintPilot jobs</h2>
        </div>
        <div className="pricing-included-grid">
          {freeTools.map((feature) => (
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
          <h2>Simple, fair pricing built around a shop that wants to grow without fixed software pressure.</h2>
          <div className="pricing-why-grid">
            {[
              "You always know exactly what a job costs you - Rs. 0.50 a black & white page, Rs. 1 a color page, Rs. 5 a passport photo request.",
              "Your 14-day trial and Rs. 10 wallet credit let you try PrintPilot on real orders before you ever recharge.",
              "Every day's earnings settle at EOD, so cash keeps moving into your hands instead of sitting in a monthly queue.",
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
