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
import { DashboardShell } from "../DashboardShell";

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
  category: "Optimize" | "Create" | "Modify" | "Convert" | "Security";
  name: string;
  description: string;
  badge: string;
  color: string;
  isNew?: boolean;
  href?: string;
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
  { category: "Optimize", name: "Compress IMAGE", description: "Compress JPG, PNG, and WebP images while saving space and maintaining quality.", badge: "ZIP", color: "#83bd55", href: "/image-tools/compress-image" },
  { category: "Optimize", name: "Upscale", description: "Enlarge images with high resolution while maintaining visual quality.", badge: "UP", color: "#83bd55", isNew: true, href: "/image-tools/upscale-image" },
  { category: "Optimize", name: "Remove background", description: "Quickly remove image backgrounds and download a transparent PNG.", badge: "BG", color: "#83bd55", isNew: true, href: "/image-tools/background-remover" },
  { category: "Create", name: "Meme generator", description: "Create custom memes online with captions, meme images, or uploaded pictures.", badge: "MEME", color: "#b0649b", href: "/image-tools/meme-generator" },
  { category: "Create", name: "Photo editor", description: "Spice up pictures with text, effects, frames, or stickers using simple editing tools.", badge: "EDIT", color: "#b0649b", href: "/image-tools/photo-editor" },
  { category: "Modify", name: "Resize IMAGE", description: "Define dimensions by percent or pixel, and resize JPG, PNG, and WebP images.", badge: "SIZE", color: "#35b5df", href: "/image-tools/resize-image" },
  { category: "Modify", name: "Crop IMAGE", description: "Crop JPG, PNG, or WebP images with centered aspect-ratio controls.", badge: "CUT", color: "#35b5df", href: "/image-tools/crop-image" },
  { category: "Modify", name: "Rotate IMAGE", description: "Rotate JPG, PNG, or WebP images in one click.", badge: "ROT", color: "#35b5df", href: "/image-tools/rotate-image" },
  { category: "Convert", name: "Convert to JPG", description: "Turn PNG and WebP images into compact JPG files.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "Convert from JPG", description: "Turn JPG images into PNG or WebP files.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-from-jpg" },
  { category: "Convert", name: "HTML to IMAGE", description: "Render readable HTML file content into a PNG image.", badge: "HTML", color: "#efc91e", href: "/image-tools/html-to-image" },
  { category: "Convert", name: "Website to Image", description: "Capture a complete public webpage as one full-page PNG or JPG image.", badge: "WEB", color: "#efc91e", href: "/image-tools/website-to-image" },
  { category: "Convert", name: "Image Converter", description: "Convert images into JPG, PNG, WebP, SVG, BMP, ICO, or PDF.", badge: "IMG", color: "#efc91e", href: "/image-tools/image-converter" },
  { category: "Convert", name: "HEIC to JPG", description: "Prepare HEIC photos for conversion into widely supported JPG files.", badge: "HEIC", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "SVG Converter", description: "Convert SVG artwork into a standard image format.", badge: "SVG", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "WebP to PNG", description: "Convert WebP images into lossless PNG files.", badge: "PNG", color: "#efc91e", href: "/image-tools/convert-from-jpg" },
  { category: "Convert", name: "PNG Converter", description: "Convert PNG images into compact, shareable formats.", badge: "PNG", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "WebP to JPG", description: "Convert modern WebP images into compatible JPG files.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "JPG Converter", description: "Convert JPG images into PNG or WebP outputs.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-from-jpg" },
  { category: "Convert", name: "PNG to JPG", description: "Convert transparent or lossless PNG files into JPG.", badge: "JPG", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "GIF Converter", description: "Prepare GIF images for conversion to another format.", badge: "GIF", color: "#efc91e", href: "/image-tools/convert-to-jpg" },
  { category: "Convert", name: "PNG to SVG", description: "Prepare PNG graphics for an SVG conversion workflow.", badge: "SVG", color: "#efc91e", href: "/image-tools" },
  { category: "Security", name: "Watermark IMAGE", description: "Stamp an image or text over your images with typography, transparency, and position.", badge: "WM", color: "#4e82bd", href: "/image-tools/watermark-image" },
  { category: "Security", name: "Blur face", description: "Blur faces, license plates, and private objects in photos.", badge: "BLUR", color: "#4e82bd", isNew: true, href: "/image-tools/blur-face" },
];

export default function ImageToolsPage() {
  return (
    <DashboardShell activePath="/image-tools">
      <div className="dashboard image-tools-page">
          <div className="dashboard-hero pdf-tools-hero">
            <div>
              <span className="auto-print-kicker">PrintPilot Image Tools</span>
              <h1>Image Tools</h1>
              <p>Compress, resize, crop, convert, remove backgrounds, add watermarks, and blur images from one place.</p>
            </div>
            <span className="status-pill">{imageTools.length} Tools Ready</span>
          </div>

          <section className="pdf-tool-grid" aria-label="Image tools">
            {imageTools.map((tool) => (
              <Link className="pdf-tool-card" href={tool.href || "/image-tools"} key={tool.name}>
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
    </DashboardShell>
  );
}
