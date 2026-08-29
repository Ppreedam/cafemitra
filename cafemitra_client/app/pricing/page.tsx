import type { Metadata } from "next";
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
import { apiUrl } from "../../lib/api";

const pageUrl = "https://repetigo.com/pricing";

export const metadata: Metadata = {
  title: "Pricing - Pay Only When You Earn | RepetiGo PrintPilot",
  description:
    "RepetiGo pricing for print shops and cyber cafes: everyday PDF, image, and document tools stay free. Prepaid service credits are only spent on completed PrintPilot print jobs - no fixed monthly software fee.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Pricing - Pay Only When You Earn | RepetiGo PrintPilot",
    description:
      "Prepaid service credits, spent only on completed print jobs. Everyday tools stay free for every print shop and cyber cafe.",
    type: "website",
    url: pageUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing - Pay Only When You Earn | RepetiGo",
    description: "No fixed monthly fee. Prepaid service credits are only spent on completed PrintPilot print jobs.",
  },
  robots: { index: true, follow: true },
};

type WalletConfig = {
  signupBonus: number;
  referralBonus: number;
  creditLimit: number;
  dailyGraceLimit: number;
  tools: { toolKey: string; label: string; unit: string; price: number }[];
};

// Falls back to these numbers if the API is unreachable at render time, so
// the page never breaks - but the live values above always win when available.
const FALLBACK_CONFIG: WalletConfig = {
  signupBonus: 10,
  referralBonus: 0,
  creditLimit: -50,
  dailyGraceLimit: 5,
  tools: [
    { toolKey: "print_bw_page", label: "Black & White Print", unit: "per page", price: 0.5 },
    { toolKey: "print_color_page", label: "Color Print", unit: "per page", price: 1 },
    { toolKey: "passport_photo", label: "Passport / ID Photo", unit: "per request", price: 5 },
  ],
};

async function getWalletConfig(): Promise<WalletConfig> {
  try {
    const response = await fetch(apiUrl("/api/wallet/config/"), { next: { revalidate: 300 } });
    if (!response.ok) return FALLBACK_CONFIG;
    const data = await response.json();
    if (!Array.isArray(data.tools) || !data.tools.length) return FALLBACK_CONFIG;
    return data as WalletConfig;
  } catch {
    return FALLBACK_CONFIG;
  }
}

function formatRupees(value: number) {
  return Number.isInteger(value) ? `Rs. ${value}` : `Rs. ${value.toFixed(2)}`;
}

function toolPrice(config: WalletConfig, toolKey: string) {
  return config.tools.find((tool) => tool.toolKey === toolKey) || FALLBACK_CONFIG.tools.find((tool) => tool.toolKey === toolKey)!;
}

const freeTools = [
  "PDF Tools - completely free",
  "Image Tools - completely free",
  "Background Remover - free",
  "Merge, Split & Compress PDF - free",
  "Meme Generator & Photo Editor - free",
  "PrintPilot dashboard & queue - free to use",
];

export default async function PricingPage() {
  const config = await getWalletConfig();
  const bwPage = toolPrice(config, "print_bw_page");
  const colorPage = toolPrice(config, "print_color_page");
  const passportPhoto = toolPrice(config, "passport_photo");
  const signupBonus = formatRupees(config.signupBonus);

  const feeExamples = [
    [bwPage.label, `${formatRupees(bwPage.price)} / page`],
    [colorPage.label, `${formatRupees(colorPage.price)} / page`],
    [passportPhoto.label, `${formatRupees(passportPhoto.price)} / request`],
  ];

  const walletSteps = [
    ["1", "Your 14-day trial starts free", `The moment you sign up, RepetiGo credits ${signupBonus} to your service credits balance for 14 days so you can try PrintPilot on real customer orders, risk free.`],
    ["2", "Recharge when you need more", `Once your 14-day trial ends or your ${signupBonus} credit runs out, simply add more service credits to keep PrintPilot billing your print and photo jobs automatically.`],
    ["3", "Pay only for completed jobs", "There is no fixed monthly bill. RepetiGo deducts a small, fixed commission from your service credits only when a job actually completes - you always know exactly what you're spending."],
  ];

  const walletHighlights = [
    ["Free trial", "14 days"],
    ["Trial service credit", signupBonus],
    ["Billing", "Pay-as-you-go"],
    ["Monthly software fee", "Rs. 0"],
  ];

  const faqs = [
    [
      "What does \"Pay Only When You Earn\" actually mean?",
      "It means RepetiGo never charges you a fixed monthly software bill. You only pay a small commission from your service credits when PrintPilot completes a real customer job - a printed page or a passport photo request. If you have no orders, you pay nothing.",
    ],
    [
      "How much commission does RepetiGo charge per job?",
      `Every black & white page printed through PrintPilot costs ${formatRupees(bwPage.price)}, every color page costs ${formatRupees(colorPage.price)}, and every passport size photo request costs ${formatRupees(passportPhoto.price)}. These small amounts are deducted automatically from your service credits - you are always free to charge your own customers whatever counter price you prefer.`,
    ],
    [
      "What happens after my 14-day trial ends?",
      `RepetiGo gives every new shop ${signupBonus} of free service credits that stays valid for 14 days, so you can put PrintPilot to work on real orders before spending anything. Once the 14 days are over or the credit is used up, just add more service credits to keep PrintPilot billing your jobs without any interruption.`,
    ],
    [
      "How does service credits billing work?",
      "Your service credits balance is a prepaid amount you top up yourself. There is no fixed monthly fee - RepetiGo deducts a small, fixed commission automatically only when PrintPilot completes a job, straight from your service credits balance. You always know exactly what a job costs before it happens.",
    ],
    [
      "What happens if my service credits balance runs low?",
      `You can keep using paid tools down to a balance of ${formatRupees(config.creditLimit)}, with usage capped at ${formatRupees(config.dailyGraceLimit)} per day once your balance is at or below zero. Beyond that, paid tools pause until you top up - free tools keep working regardless.`,
    ],
    [
      "Are the PDF tools and Image tools also charged from my service credits?",
      "No. PDF Tools, Image Tools, the background remover, meme generator, photo editor, and every everyday utility on RepetiGo are completely free to use. Only automated PrintPilot print jobs and passport photo requests use your service credits balance.",
    ],
  ];

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
            No monthly software bill, no hidden charges. Keep a small prepaid service credits balance, and RepetiGo deducts a tiny
            commission only when PrintPilot completes a real customer print or photo job for your shop.
          </p>
          <div className="pricing-hero-meta">
            <span>14-day free trial</span>
            <span>{signupBonus} trial service credit</span>
            <span>No monthly software fee</span>
          </div>
        </div>
      </section>

      <section className="pricing-options pricing-container">
        <div className="pricing-heading">
          <span className="pricing-section-label">One simple model</span>
          <h2>Pay Only When You Earn</h2>
        </div>
        <div className="pricing-tabs pricing-single-pill" aria-label="Current pricing model">
          <span className="active">Service Credits Commission</span>
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
            {["14-Day Free Trial", `${signupBonus} Free Service Credits`, "No Setup Fee", "Free PDF & Image Tools", "Pay-as-you-go Billing"].map((item) => (
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
            your shop service credits balance - nothing more. You are always free to set and collect your own counter price from the
            customer; the amount below is only what RepetiGo keeps for automating the job.
          </p>

          <div className="pricing-fee-panel">
            <CreditCard size={24} />
            <div>
              <strong>Simple Per-Page Commission</strong>
              <span>deducted automatically from your service credits for every completed job.</span>
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
          <span className="pricing-section-label">Service Credits Billing</span>
          <h2>Prepaid service credits. Pay only for completed jobs.</h2>
          <p>
            Add credits to your service credits balance in advance, and RepetiGo automatically deducts a small, fixed commission as
            PrintPilot completes each job - no fixed monthly bill, no manual invoicing to track.
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
          <h2>Everyday tools stay free - your service credits are only for PrintPilot jobs</h2>
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
              `You always know exactly what a job costs you - ${formatRupees(bwPage.price)} a black & white page, ${formatRupees(colorPage.price)} a color page, ${formatRupees(passportPhoto.price)} a passport photo request.`,
              `Your 14-day trial and ${signupBonus} service credit let you try PrintPilot on real orders before you ever recharge.`,
              "No fixed monthly software bill - you only pay the small per-job commission, straight from your prepaid service credits.",
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
