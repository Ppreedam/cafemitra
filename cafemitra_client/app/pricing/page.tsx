import Link from "next/link";
import { BadgeCheck, Clock3, Printer, Sparkles, Zap } from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";

const plans = [
  {
    name: "Starter",
    price: "Free",
    note: "For testing Repetigo tools",
    features: ["Basic PDF and image tools", "Manual print workflow", "Limited monthly usage"],
    cta: "Start Free",
    href: "/register",
  },
  {
    name: "Cyber Cafe Pro",
    price: "Coming Soon",
    note: "For daily shop automation",
    features: ["Print automation", "Customer-ready dashboard", "Priority workflow tools", "Staff-friendly operations"],
    cta: "Contact Us",
    href: "/contact-us",
    featured: true,
  },
  {
    name: "Business",
    price: "Custom",
    note: "For multi-counter or high-volume shops",
    features: ["Custom setup help", "Advanced workflow planning", "Business support", "Future integrations"],
    cta: "Request Demo",
    href: "/contact-us",
  },
];

export default function PricingPage() {
  return (
    <main className="info-page-shell">
      <LandingNavbar />

      <section className="section-inner pricing-public-hero">
        <div className="eyebrow">
          <Sparkles size={15} fill="currentColor" aria-hidden />
          Repetigo Pricing
        </div>
        <h1>Simple pricing for cyber cafe automation.</h1>
        <p>
          Start with the current release and move to paid automation plans when advanced shop
          workflows are ready.
        </p>
      </section>

      <section className="section-inner pricing-public-grid">
        {plans.map((plan) => (
          <article className={plan.featured ? "pricing-public-card featured" : "pricing-public-card"} key={plan.name}>
            <div className="pricing-card-icon">
              {plan.featured ? <Printer size={24} /> : <Zap size={24} />}
            </div>
            <h2>{plan.name}</h2>
            <strong>{plan.price}</strong>
            <p>{plan.note}</p>
            <div className="pricing-feature-list">
              {plan.features.map((feature) => (
                <span key={feature}>
                  <BadgeCheck size={16} />
                  {feature}
                </span>
              ))}
            </div>
            <Link className={plan.featured ? "btn btn-primary" : "btn"} href={plan.href}>
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="section-inner pricing-note-panel">
        <Clock3 size={24} />
        <div>
          <h2>Paid plans are being prepared for launch.</h2>
          <p>
            Pricing may change as new tools like AI form filling, agreement generation, and
            passport photo automation become available.
          </p>
        </div>
      </section>
    </main>
  );
}
