import Link from "next/link";
import type React from "react";
import {
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileText,
  Home,
  IdCard,
  Image,
  Landmark,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Printer,
  Settings,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type ImageTool = {
  name: string;
  description: string;
  badge: string;
  color: string;
  isNew?: boolean;
};

const navGroups: NavGroup[] = [
  { label: "", items: [{ name: "Dashboard", icon: Home, href: "/dashboard" }] },
  { label: "", items: [{ name: "Orders", icon: ClipboardList, href: "/orders" }] },
  {
    label: "Services",
    items: [
      { name: "PrintPilot", icon: Printer, href: "/auto-print" },
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools" },
      { name: "Image Tools", icon: Image, href: "/image-tools", active: true },
      { name: "WhatsApp Print", icon: MessageCircle },
      { name: "Passport Photo", icon: UserRound },
      { name: "ID Card Print", icon: IdCard },
      { name: "Admit Card Hub", icon: ClipboardList },
      { name: "Document Services", icon: FileText },
      { name: "All Services", icon: LayoutGrid },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Customers", icon: Users },
      { name: "Wallet & Settlement", icon: Wallet },
      { name: "Pricing & Settings", icon: Settings, href: "/pricing-settings" },
      { name: "Analytics", icon: BarChart3, href: "/analytics" },
      { name: "Reports", icon: FileText },
    ],
  },
];

const imageTools: ImageTool[] = [
  { name: "Compress IMAGE", description: "Compress JPG, PNG, SVG, and GIFs while saving space and maintaining quality.", badge: "ZIP", color: "#83bd55" },
  { name: "Resize IMAGE", description: "Define dimensions by percent or pixel, and resize JPG, PNG, SVG, and GIF images.", badge: "SIZE", color: "#35b5df" },
  { name: "Crop IMAGE", description: "Crop JPG, PNG, or GIFs with ease; choose pixels or use a visual editor.", badge: "CUT", color: "#35b5df" },
  { name: "Convert to JPG", description: "Turn PNG, GIF, TIF, PSD, SVG, WEBP, HEIC, or RAW images to JPG in bulk.", badge: "JPG", color: "#efc91e" },
  { name: "Convert from JPG", description: "Turn JPG images to PNG and GIF, or create animated GIFs from several JPGs.", badge: "JPG", color: "#efc91e" },
  { name: "Photo editor", description: "Spice up pictures with text, effects, frames, or stickers using simple editing tools.", badge: "EDIT", color: "#b0649b" },
  { name: "Upscale Image", description: "Enlarge images with high resolution while maintaining visual quality.", badge: "UP", color: "#83bd55", isNew: true },
  { name: "Remove background", description: "Quickly remove image backgrounds and cut out detected objects.", badge: "BG", color: "#83bd55", isNew: true },
  { name: "Watermark IMAGE", description: "Stamp an image or text over your images with typography, transparency, and position.", badge: "WM", color: "#4e82bd" },
  { name: "Meme generator", description: "Create custom memes online with captions, meme images, or uploaded pictures.", badge: "MEME", color: "#b0649b" },
  { name: "Rotate IMAGE", description: "Rotate many JPG, PNG, or GIF images at the same time.", badge: "ROT", color: "#35b5df" },
  { name: "HTML to IMAGE", description: "Convert webpages in HTML to JPG or SVG by pasting a URL.", badge: "HTML", color: "#efc91e" },
  { name: "Blur face", description: "Blur faces, license plates, and private objects in photos.", badge: "BLUR", color: "#4e82bd", isNew: true },
];

export default function ImageToolsPage() {
  return (
    <main className="app-frame">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <span className="brand-main">
            Cafe<span className="brand-accent">Mitra</span>
          </span>
          <span className="brand-dot">.online</span>
        </Link>

        <nav className="side-nav" aria-label="Dashboard navigation">
          {navGroups.map((group, index) => (
            <div key={`${group.label}-${index}`}>
              {group.label ? <div className="nav-label">{group.label}</div> : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link className={`side-link ${item.active ? "active" : ""}`} href={item.href ?? "#"} key={item.name}>
                    <Icon size={17} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="help-box">
          <div className="help-avatar">
            <UserRound size={21} />
          </div>
          <strong>Need Help?</strong>
          <p>We are here to assist you.</p>
          <Link className="btn" href="#">
            <CircleHelp size={15} /> Contact Support
          </Link>
        </div>
      </aside>

      <section className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <Link href="/" aria-label="Open menu">
              <Menu size={22} />
            </Link>
          </div>
          <div className="topbar-right">
            <div className="business-switcher">
              <Building2 size={17} />
              Cyber Cafe Shankar
              <ChevronDown size={15} />
            </div>
            <details className="printer-menu">
              <summary>
                <Printer size={17} />
                <span className="printer-dot online" />
                <span>Epson L805</span>
                <small>Connected</small>
                <ChevronDown size={14} />
              </summary>
              <div className="printer-dropdown">
                <div className="printer-option">
                  <span className="printer-dot online" />
                  <div>
                    <strong>Epson L805</strong>
                    <small>Connected</small>
                  </div>
                </div>
                <div className="printer-option">
                  <span className="printer-dot offline" />
                  <div>
                    <strong>Canon G3010</strong>
                    <small>Disconnected</small>
                  </div>
                </div>
              </div>
            </details>
            <div className="notification-dot">
              <Bell size={23} />
            </div>
            <details className="profile-menu">
              <summary className="user-menu">
                <span className="avatar">S</span>
                <span>
                  <strong>Shankar Kumar</strong>
                  <small style={{ display: "block", color: "#697397" }}>Owner</small>
                </span>
                <ChevronDown size={15} />
              </summary>
              <div className="profile-dropdown">
                <div className="profile-head">
                  <span className="profile-photo">S</span>
                  <div>
                    <strong>Shankar Kumar</strong>
                    <span>sk6201184579@gmail.com</span>
                    <span>Balance: 0</span>
                    <span>User ID: 204927</span>
                  </div>
                </div>
                <div className="profile-list">
                  <Link href="/dashboard">
                    <Bookmark size={18} /> Dashboard
                  </Link>
                  <Link href="/profile">
                    <UserRound size={18} /> My Profile
                  </Link>
                  <Link href="/auto-print">
                    <Printer size={18} /> PrintPilot Setup
                  </Link>
                  <Link href="/pricing-settings">
                    <Settings size={18} /> Pricing & Settings
                  </Link>
                  <Link href="#">
                    <Landmark size={18} /> Withdraw
                  </Link>
                  <Link href="/login">
                    <LogOut size={18} /> Sign Out
                  </Link>
                </div>
              </div>
            </details>
          </div>
        </header>

        <div className="dashboard image-tools-page">
          <div className="dashboard-hero pdf-tools-hero">
            <div>
              <span className="auto-print-kicker">PrintPilot Image Tools</span>
              <h1>Image Tools</h1>
              <p>Daily photo aur image work ke liye compress, resize, crop, convert, background remove, watermark aur blur tools ek jagah.</p>
            </div>
            <span className="status-pill">13 Tools Ready</span>
          </div>

          <section className="pdf-tool-grid" aria-label="Image tools">
            {imageTools.map((tool) => (
              <Link className="pdf-tool-card" href="#" key={tool.name}>
                {tool.isNew ? <span className="new-ribbon">New!</span> : null}
                <span className="pdf-tool-icon" style={{ "--tool-color": tool.color } as React.CSSProperties}>
                  <Image size={22} />
                  <small>{tool.badge}</small>
                </span>
                <h2>{tool.name}</h2>
                <p>{tool.description}</p>
              </Link>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
