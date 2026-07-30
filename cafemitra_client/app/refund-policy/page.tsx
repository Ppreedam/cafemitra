import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";
import { PublicFooter } from "../PublicFooter";
import { BUSINESS, formattedAddress } from "../../lib/businessInfo";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy - RepetiGo",
  description:
    "RepetiGo Refund & Cancellation Policy covering service credit top-ups, subscription plans, and print/passport photo job payments.",
  robots: {
    index: true,
    follow: true,
  },
};

const lastUpdated = BUSINESS.effectiveDate;

const sections = [
  {
    id: "scope",
    title: "1. What This Policy Covers",
    body: [
      "This Refund & Cancellation Policy applies to all payments made on the RepetiGo platform, including service credit top-ups by shop owners, paid subscription plans, and online payments made by end customers for print or passport photo jobs at a participating shop.",
    ],
  },
  {
    id: "service-credits-top-up",
    title: "2. Service Credits Top-up (Shop Owners)",
    bullets: [
      "Service credit top-ups are non-refundable once the amount is credited to your RepetiGo Service Credits balance, except where required by law or in case of a duplicate/failed transaction that was incorrectly charged.",
      "Unused Service Credits balance can be used for future print and passport photo jobs at any time; it does not expire.",
      "If a payment is deducted from your bank account or card but not credited to your Service Credits balance due to a technical error, contact billing@repetigo.com with your transaction reference within 7 days for reconciliation and refund.",
    ],
  },
  {
    id: "subscriptions",
    title: "3. Subscription Plans",
    bullets: [
      "Paid subscription plans are billed in advance and are non-refundable for the remaining period once a billing cycle has started.",
      "You can cancel a subscription at any time from account settings; cancellation takes effect at the end of the current billing period, and you retain access until then.",
      "No pro-rated refunds are issued for early cancellation unless required by applicable law.",
    ],
  },
  {
    id: "print-jobs",
    title: "4. Print & Passport Photo Job Payments (End Customers)",
    bullets: [
      "If an online-paid print or passport photo job fails to process due to a platform or technical error and the job is not delivered, the amount paid for that specific job is eligible for a full refund.",
      "Refunds are not provided for jobs that were completed and printed successfully, for wrong files uploaded by the customer, or for dissatisfaction with print quality caused by shop hardware (printer, ink, paper) outside RepetiGo's control.",
      "To request a refund for a failed job, contact support@repetigo.com with the order ID within 7 days of the transaction.",
    ],
  },
  {
    id: "process",
    title: "5. Refund Process & Timelines",
    bullets: [
      "Approved refunds are processed to the original payment method within 7-10 business days, subject to your bank or payment provider's processing timelines.",
      "You will receive an email confirmation once a refund is approved and once it is processed.",
    ],
  },
  {
    id: "contact",
    title: "6. Contact for Refund Requests",
    body: [`For any refund or cancellation request, email billing@repetigo.com or support@repetigo.com from your registered account email, or write to us at ${formattedAddress()}.`],
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="terms-shell">
      <LandingNavbar />

      <section className="terms-hero">
        <div className="terms-container">
          <span className="terms-kicker">
            <RotateCcw size={14} /> Refund & Cancellation Policy
          </span>
          <h1>Refund & Cancellation Policy</h1>
          <p>
            How refunds and cancellations work for service credit top-ups, subscription plans, and print or passport photo
            job payments on RepetiGo.
          </p>
          <div className="terms-hero-meta">
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      <section className="terms-layout terms-container">
        <aside className="terms-index">
          <strong>On this page</strong>
          <nav aria-label="Refund policy sections">
            {sections.map((section) => (
              <a href={`#${section.id}`} key={section.id}>
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <div className="terms-content">
          {sections.map((section) => (
            <section className="terms-card" id={section.id} key={section.id}>
              <span className="terms-section-label">Section {section.title.split(".")[0]}</span>
              <h2>{section.title}</h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets ? (
                <ul className="terms-bullets">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>
                      <Check size={16} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="terms-card terms-conclusion">
            <div className="terms-warning">
              <ShieldCheck size={18} />
              <p>
                This policy works alongside our <Link href="/terms-conditions">Terms & Conditions</Link> and{" "}
                <Link href="/privacy-policy">Privacy Policy</Link>.
              </p>
            </div>
            <Link href="/contact-us" className="terms-cta-btn">
              Contact RepetiGo <ArrowRight size={17} />
            </Link>
          </section>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
