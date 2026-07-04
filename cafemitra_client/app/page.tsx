import Link from "next/link";
import type React from "react";
import {
  BadgeCheck,
  Bot,
  Clock3,
  Crop,
  Download,
  FileImage,
  FileText,
  IdCard,
  Image as ImageIcon,
  LockKeyhole,
  MessageCircle,
  Printer,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  SplitSquareVertical,
  UploadCloud,
  Users,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Brand, LandingNavbar } from "./LandingNavbar";

const freeTools = [
  {
    name: "PDF to JPG",
    desc: "Convert customer PDFs into clear printable images.",
    icon: FileImage,
    color: "#1688f5",
  },
  {
    name: "JPG to PDF",
    desc: "Turn scanned images and photos into PDF documents.",
    icon: FileText,
    color: "#ff7b1a",
  },
  {
    name: "Image to PDF",
    desc: "Combine multiple images into a single PDF file.",
    icon: ImageIcon,
    color: "#f13d7d",
  },
  {
    name: "Compress PDF",
    desc: "Reduce file size before upload, email, or print.",
    icon: ScanLine,
    color: "#f13d7d",
  },
  {
    name: "Merge PDF",
    desc: "Join forms, certificates, and IDs in one click.",
    icon: FileText,
    color: "#1688f5",
  },
  {
    name: "Split PDF",
    desc: "Extract only the pages your customer needs.",
    icon: SplitSquareVertical,
    color: "#5740ed",
  },
  {
    name: "Resize Image",
    desc: "Prepare images for forms, portals, and print sizes.",
    icon: ScanLine,
    color: "#16a1bd",
  },
  {
    name: "Crop Image",
    desc: "Cleanly crop photos for applications and IDs.",
    icon: Crop,
    color: "#5740ed",
  },
];

const services = [
  { name: "Print Automation", icon: Printer, color: "#5740ed" },
  { name: "WhatsApp Print", icon: MessageCircle, color: "#16b978" },
  { name: "Passport Photo", icon: Users, color: "#f13d7d" },
  { name: "ID Photo & Card", icon: IdCard, color: "#16a1bd" },
  { name: "AI Form Filling", icon: Bot, color: "#ff7b1a" },
  { name: "Agreement Maker", icon: ReceiptText, color: "#1688f5" },
];

const problems = [
  "Repeating the same printing and document tasks all day.",
  "Manual photo resizing, cropping, and passport layout work.",
  "Filling customer forms again and again from loose details.",
  "Creating agreements and PDF files under rush-hour pressure.",
];

const workflow = [
  { title: "Add customer details", desc: "Upload files or enter details once.", icon: UploadCloud },
  { title: "Choose the tool", desc: "Pick print, PDF, photo, form, or agreement.", icon: WandSparkles },
  { title: "Automate the work", desc: "Repetigo prepares the final output fast.", icon: Zap },
  { title: "Print or share", desc: "Download, print, or send the completed file.", icon: Download },
];

const benefits = [
  { title: "Save daily time", desc: "Finish routine document jobs in fewer clicks.", icon: Clock3 },
  { title: "Reduce mistakes", desc: "Use consistent workflows for staff and customers.", icon: ShieldCheck },
  { title: "Serve more customers", desc: "Handle busy hours with faster job completion.", icon: Users },
  { title: "Increase revenue", desc: "Offer more services from one simple platform.", icon: BadgeCheck },
];

export default function Home() {
  return (
    <main className="page-shell">
      <LandingNavbar />

      <section className="section-inner hero">
        <div>
          <div className="eyebrow">
            <Sparkles size={15} fill="currentColor" aria-hidden />
            Built for Cyber Cafe Automation
          </div>
          <h1>
            Automate Repetitive Work in Your <span>Cyber Cafe</span>
          </h1>
          <p className="hero-copy">
            Repetigo helps cyber cafes automate document printing, passport-size photo creation,
            PDF tools, image editing, AI form filling and agreement generation - all from one
            simple platform.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/register">
              Start Automating
            </Link>
            <Link className="btn" href="#services">
              Explore Features
            </Link>
          </div>
          <div className="trust-row">
            <span>
              <BadgeCheck size={16} /> Easy for Staff
            </span>
            <span>
              <ShieldCheck size={16} /> Secure Workflow
            </span>
            <span>
              <Zap size={16} /> Faster Service
            </span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Repetigo dashboard and printer illustration">
          <div className="dashboard-card">
            <div className="mock-browser" />
            <div className="mock-layout">
              <div className="mock-side" />
              <div>
                <div className="mock-line" style={{ width: "72%" }} />
                <div className="mock-line" style={{ width: "48%" }} />
                <div className="mock-grid">
                  <div className="mock-pill" />
                  <div className="mock-pill" />
                  <div className="mock-pill" />
                  <div className="mock-pill" />
                </div>
                <div className="mock-chart">
                  {[45, 72, 55, 86, 68, 92].map((height) => (
                    <span key={height} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="printer" />
          <span className="float-icon" style={{ "--tile-color": "#16b978", right: 44, top: 8 } as React.CSSProperties}>
            <FileText size={24} />
          </span>
          <span className="float-icon" style={{ "--tile-color": "#5740ed", right: 6, top: 112 } as React.CSSProperties}>
            <Bot size={24} />
          </span>
          <span className="float-icon" style={{ "--tile-color": "#ff7b1a", right: 34, top: 218 } as React.CSSProperties}>
            <ReceiptText size={24} />
          </span>
          <span className="float-icon" style={{ "--tile-color": "#16b978", left: 50, top: 100 } as React.CSSProperties}>
            <FileImage size={24} />
          </span>
        </div>
      </section>

      <section className="landing-section landing-section-white" id="services">
        <div className="section-inner">
          <h2 className="section-heading">Everything Your Cyber Cafe Repeats Daily</h2>
          <p className="section-subtitle">Bring printing, photo, PDF, image, AI form, and agreement tools into one clean workflow.</p>
          <div className="services-grid">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article className="service-card" key={service.name}>
                  <span className="icon-tile" style={{ "--tile-color": service.color } as React.CSSProperties}>
                    <Icon size={25} />
                  </span>
                  <h3>{service.name}</h3>
                  <span className="login-badge">
                    <LockKeyhole size={12} /> Dashboard Tool
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-inner problem-solution-grid">
          <div>
            <h2 className="section-heading align-left">The Daily Rush Should Not Slow You Down</h2>
            <p className="section-subtitle align-left">
              Cyber cafes lose time when staff must manually repeat small document jobs for every customer.
            </p>
            <div className="problem-list">
              {problems.map((problem) => (
                <span key={problem}>
                  <Zap size={16} />
                  {problem}
                </span>
              ))}
            </div>
          </div>
          <div className="solution-panel">
            <span className="icon-tile" style={{ "--tile-color": "#5740ed" } as React.CSSProperties}>
              <Sparkles size={24} />
            </span>
            <h3>Repetigo turns repeat work into guided actions.</h3>
            <p>
              Your team can prepare files, photos, forms, agreements, and print-ready outputs from
              the same workspace, so customers move faster and staff stay organized.
            </p>
          </div>
        </div>
      </section>

      <section className="tools-band" id="free-tools">
        <div className="section-inner">
          <h2 className="section-heading">Quick Document Tools</h2>
          <p className="section-subtitle">Useful PDF and image utilities for common customer requests.</p>
          <div className="tools-grid">
            {freeTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <article className="tool-card" key={tool.name}>
                  <span className="icon-tile" style={{ "--tile-color": tool.color } as React.CSSProperties}>
                    <Icon size={23} />
                  </span>
                  <div>
                    <h3>{tool.name}</h3>
                    <p>{tool.desc}</p>
                  </div>
                  <span className="free-badge">Tool</span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section landing-section-white" id="workflow">
        <div className="section-inner">
          <h2 className="section-heading">How Repetigo Works</h2>
          <p className="section-subtitle">A simple workflow for every document, photo, form, and agreement job.</p>
          <div className="workflow-grid">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="workflow-card" key={step.title}>
                  <span className="step-number">{index + 1}</span>
                  <Icon size={24} />
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-inner">
          <h2 className="section-heading">Built to Make Your Counter Faster</h2>
          <p className="section-subtitle">Repetigo helps your cyber cafe finish more jobs with less manual effort.</p>
          <div className="benefit-grid">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article className="benefit-card" key={benefit.title}>
                  <Icon size={24} />
                  <h3>{benefit.title}</h3>
                  <p>{benefit.desc}</p>
                </article>
              );
            })}
          </div>
          <div className="cta-band" id="contact">
            <h2>Run Your Cyber Cafe Faster with Repetigo</h2>
            <p>Start with one workflow today, then automate more services as your shop grows.</p>
            <Link className="btn" href="/register">
              Get Started <Sparkles size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-inner">
          <div className="footer-grid">
            <div>
              <Brand />
              <p>Automation software for cyber cafes, printing shops, and document service centers.</p>
            </div>
            <FooterColumn title="Platform" items={["Features", "Tools", "How It Works", "Contact"]} />
            <FooterColumn title="Top Tools" items={["Print Automation", "Passport Photo", "PDF Tools", "AI Form Filling", "Agreement Maker"]} />
            <FooterColumn title="Business" items={["Dashboard", "Pricing", "Support"]} />
            <FooterColumn title="Social" items={["Facebook", "Instagram", "YouTube"]} />
          </div>
          <div className="copyright">Copyright 2026 Repetigo. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4>{title}</h4>
      <div className="footer-links">
        {items.map((item) => (
          <Link key={item} href="#">
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}
