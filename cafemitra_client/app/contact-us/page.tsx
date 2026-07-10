import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Clock3,
  CreditCard,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { LandingNavbar } from "../LandingNavbar";
import { PublicFooter } from "../PublicFooter";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact RepetiGo - Print Shop Software Support India",
  description:
    "Get in touch with RepetiGo. Sales, technical support, billing, and partnerships for print shops and cyber cafes across India. We respond within 24 hours.",
};

const responsePromises = [
  [MessageCircle, "Live Chat", "< 5 min"],
  [Mail, "Email", "Within 24 hours"],
  [Phone, "WhatsApp", "Within 2 hours"],
] as const;

const contactCards = [
  // [Mail, "Email", "hello@repetigo.com", "For general questions, partnerships, press."],
  [Wrench, "Support", "support@repetigo.com", "For technical issues, setup help, printer problems."],
  // [CreditCard, "Billing", "billing@repetigo.com", "For invoices, refunds, subscription changes."],
  // [Building2, "Enterprise", "enterprise@repetigo.com", "For multi-location setups, API access, custom SLA."],
  // [MapPin, "Office", "Bengaluru, Karnataka, India.", "Remote-first team serving shops across India."],
  // [Clock3, "Support Hours", "Monday - Saturday, 9:00 AM - 7:00 PM IST", "Email monitored 24/7. Chat and WhatsApp during business hours."],
] as const;

const routes = [
  ["I'm setting up RepetiGo", "Live Chat or Setup Guide", "Setup takes 10 minutes. Our guides walk through every step.", "/help-support"],
  ["I have a billing question", "billing@repetigo.com", "Include your account email and invoice number for the fastest resolution.", "mailto:billing@repetigo.com"],
  ["I want to partner or integrate", "enterprise@repetigo.com", "We respond to partner enquiries within 1 business day.", "mailto:enterprise@repetigo.com"],
];

const selfService = [
  [BookOpen, "Help Center", "Guides, troubleshooting, FAQs, and setup docs.", "/help-support"],
  [Download, "Download Print Bridge", "Connect your printer to RepetiGo in under 5 minutes.", "/help-support"],
  [CreditCard, "Pricing & Plans", "Compare plans, see what is included, start free trial.", "/pricing"],
  [ShieldCheck, "Security & Privacy", "How we protect your data and your customers' documents.", "/privacy-policy"],
] as const;

export default function ContactUsPage() {
  return (
    <main className="contact-shell">
      <LandingNavbar />

      <section className="contact-hero">
        <div className="contact-container">
          <span className="contact-kicker">
            <Sparkles size={14} /> Contact
          </span>
          <h1>We'd Love to Hear From You.</h1>
          <p>
            Whether you're setting up your first shop, have a billing question, or want to explore a partnership -
            we're here.
          </p>
          <div className="contact-promise-grid">
            {responsePromises.map(([Icon, label, time]) => (
              <div key={label}>
                <Icon size={20} />
                <strong>{label}</strong>
                <span>{time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-main contact-container">
        <div className="contact-form-card">
          <span className="contact-section-label">Send Us a Message</span>
          <h2>Tell us how we can help.</h2>
          <p>
            Fill out the form and we will respond within 24 hours. For faster help, start a live chat or message us on
            WhatsApp.
          </p>
          <ContactForm />
        </div>

        <aside className="contact-info-panel">
          <span className="contact-section-label">Contact Information</span>
          <h2>Reach the right team.</h2>
          <div className="contact-info-list">
            {contactCards.map(([Icon, label, value, detail]) => (
              <article key={label}>
                <span>
                  <Icon size={19} />
                </span>
                <div>
                  <strong>{label}</strong>
                  <p>{value}</p>
                  <small>{detail}</small>
                </div>
              </article>
            ))}
          </div>
          <div className="contact-security-note">
            <ShieldCheck size={19} />
            <p>
              Security or privacy emergency? Email <strong>security@repetigo.com</strong> with subject line
              <strong> URGENT</strong>. Monitored around the clock.
            </p>
          </div>
        </aside>
      </section>

      {/* <section className="contact-soft-section">
        <div className="contact-container">
          <div className="contact-heading">
            <span className="contact-section-label">Quick Routes</span>
            <h2>Not Sure Where to Start?</h2>
            <p>Use the right channel for your question and get a faster response.</p>
          </div>
          <div className="contact-route-grid">
            {routes.map(([title, channel, body, href]) => (
              <Link href={href} key={title}>
                <h3>{title}</h3>
                <strong>Best place: {channel}</strong>
                <p>{body}</p>
                <span>
                  Open route <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section> */}

      <section className="contact-self-service">
        <div className="contact-container">
          <div className="contact-heading">
            <span className="contact-section-label">Self-Service</span>
            <h2>Find Your Answer Faster</h2>
            <p>Most questions are answered instantly in our Help Center - no waiting required.</p>
          </div>
          <div className="contact-self-grid">
            {selfService.map(([Icon, title, body, href]) => (
              <Link href={href} key={title}>
                <span>
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
                <strong>
                  Visit <ArrowRight size={16} />
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-final-cta">
        <div className="contact-container">
          <h2>Prefer self-service?</h2>
          <p>
            Check our support centre for step-by-step guides, printer setup, and FAQs. Most issues are resolved in under
            5 minutes without contacting us.
          </p>
          <div>
            <Link href="/help-support">Visit Support Centre <ArrowRight size={17} /></Link>
            <Link href="/register">Start Free Trial</Link>
          </div>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
