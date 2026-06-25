import Link from "next/link";
import type React from "react";
import {
  BadgeCheck,
  ChevronDown,
  Crop,
  FileImage,
  FileText,
  IdCard,
  Image as ImageIcon,
  LockKeyhole,
  MessageCircle,
  Printer,
  ScanLine,
  ShieldCheck,
  Sparkles,
  SplitSquareVertical,
  Star,
  Users,
  Zap,
} from "lucide-react";
import { HomeHeaderActions } from "./HomeHeaderActions";

const freeTools = [
  {
    name: "PDF to JPG",
    desc: "Convert PDF files to JPG images.",
    icon: FileImage,
    color: "#1688f5",
  },
  {
    name: "JPG to PDF",
    desc: "Convert JPG images to PDF files.",
    icon: FileText,
    color: "#ff7b1a",
  },
  {
    name: "Image to PDF",
    desc: "Convert images to PDF.",
    icon: ImageIcon,
    color: "#f13d7d",
  },
  {
    name: "Compress PDF",
    desc: "Reduce PDF file size easily.",
    icon: ScanLine,
    color: "#f13d7d",
  },
  {
    name: "Merge PDF",
    desc: "Merge multiple PDF files into one.",
    icon: FileText,
    color: "#1688f5",
  },
  {
    name: "Split PDF",
    desc: "Split PDF into multiple pages.",
    icon: SplitSquareVertical,
    color: "#5740ed",
  },
  {
    name: "Resize Image",
    desc: "Resize your image in any size.",
    icon: ScanLine,
    color: "#16a1bd",
  },
  {
    name: "Crop Image",
    desc: "Crop your image online.",
    icon: Crop,
    color: "#5740ed",
  },
];

const services = [
  { name: "PrintPilot", icon: Printer, color: "#5740ed" },
  { name: "WhatsApp Print", icon: MessageCircle, color: "#16b978" },
  { name: "Passport Photo", icon: Users, color: "#f13d7d" },
  { name: "ID Card Print", icon: IdCard, color: "#16a1bd" },
  { name: "Admit Card Hub", icon: FileText, color: "#ff7b1a" },
  { name: "Document Services", icon: FileText, color: "#1688f5" },
];

function Brand() {
  return (
    <Link className="brand" href="/">
      <span className="brand-main">
        Cafe<span className="brand-accent">Mitra</span>
      </span>
      <span className="brand-dot">.online</span>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="section-inner header-inner">
          <Brand />
          <nav className="main-nav" aria-label="Primary navigation">
            <Link href="/">Home</Link>
            <Link href="#services">
              Services <ChevronDown size={14} aria-hidden />
            </Link>
            <Link href="#free-tools">Free Tools</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#about">About Us</Link>
            <Link href="#blog">Blog</Link>
          </nav>
          <HomeHeaderActions />
        </div>
      </header>

      <section className="section-inner hero">
        <div>
          <div className="eyebrow">
            <Star size={15} fill="currentColor" aria-hidden />
            All-in-One Platform for Cyber Cafes
          </div>
          <h1>
            Run Your Cyber Cafe <span>Smarter</span>, Faster &amp; Easier
          </h1>
          <p className="hero-copy">
            CafeMitra.online helps you automate printing, documents, payments, and daily operations
            in one calm, reliable platform.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/register">
              Get Started Free
            </Link>
            <Link className="btn" href="#services">
              Explore Services
            </Link>
          </div>
          <div className="trust-row">
            <span>
              <BadgeCheck size={16} /> Easy to Use
            </span>
            <span>
              <ShieldCheck size={16} /> Secure &amp; Reliable
            </span>
            <span>
              <Zap size={16} /> 24/7 Support
            </span>
          </div>
        </div>

        <div className="hero-visual" aria-label="CafeMitra dashboard and printer illustration">
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
            <ScanLine size={24} />
          </span>
          <span className="float-icon" style={{ "--tile-color": "#ff7b1a", right: 34, top: 218 } as React.CSSProperties}>
            <SettingsMark />
          </span>
          <span className="float-icon" style={{ "--tile-color": "#16b978", left: 50, top: 100 } as React.CSSProperties}>
            <FileImage size={24} />
          </span>
        </div>
      </section>

      <section className="tools-band" id="free-tools">
        <div className="section-inner">
          <h2 className="section-heading">Free Tools</h2>
          <p className="section-subtitle">Use our free tools instantly. No login required.</p>
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
                  <span className="free-badge">Free</span>
                </article>
              );
            })}
          </div>

          <div className="services-box" id="services">
            <h2 className="section-heading">Powerful Tools for Your Business</h2>
            <p className="section-subtitle">Unlock advanced features and automate your cyber cafe operations.</p>
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
                      <LockKeyhole size={12} /> Login Required
                    </span>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="cta-band">
            <h2>Ready to Grow Your Cyber Cafe Business?</h2>
            <p>Join thousands of cafe owners who trust CafeMitra.online.</p>
            <Link className="btn" href="/dashboard">
              Get Started Now <Sparkles size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="section-inner">
          <div className="footer-grid">
            <div>
              <Brand />
              <p>Your digital partner for modern cyber cafes.</p>
            </div>
            <FooterColumn title="Quick Links" items={["Home", "Services", "Free Tools", "Pricing", "About Us", "Contact"]} />
            <FooterColumn title="Top Services" items={["PrintPilot", "WhatsApp Print", "Passport Photo", "ID Card Print", "Document Services", "Admit Card Hub"]} />
            <FooterColumn title="Support" items={["Help Center", "Privacy Policy", "Terms & Conditions"]} />
            <FooterColumn title="Follow Us" items={["Facebook", "Instagram", "YouTube"]} />
          </div>
          <div className="copyright">© 2024 CafeMitra.online. All rights reserved.</div>
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

function SettingsMark() {
  return (
    <span aria-hidden style={{ fontWeight: 950, fontSize: 24, lineHeight: 1 }}>
      @
    </span>
  );
}
