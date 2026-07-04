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

type PdfTool = {
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
      { name: "PDF Tools", icon: FileText, href: "/pdf-tools", active: true },
      { name: "Image Tools", icon: Image, href: "/image-tools" },
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

const pdfTools: PdfTool[] = [
  { name: "Merge PDF", description: "Combine PDFs in the order you want with an easy PDF merger.", badge: "PDF", color: "#f26b4f" },
  { name: "Split PDF", description: "Separate pages or whole sets into independent PDF files.", badge: "PDF", color: "#f26b4f" },
  { name: "Compress PDF", description: "Reduce file size while keeping maximum PDF quality.", badge: "ZIP", color: "#83bd55" },
  { name: "PDF to Word", description: "Convert PDF files into easy to edit DOC and DOCX documents.", badge: "W", color: "#4d80c5" },
  { name: "PDF to PowerPoint", description: "Turn PDF files into editable PPT and PPTX slideshows.", badge: "P", color: "#f26b4f" },
  { name: "PDF to Excel", description: "Pull PDF data into Excel spreadsheets in a few seconds.", badge: "X", color: "#58a86b" },
  { name: "Word to PDF", description: "Make DOC and DOCX files easy to read by converting them to PDF.", badge: "W", color: "#5c8ddd" },
  { name: "PowerPoint to PDF", description: "Convert PPT and PPTX slideshows into easy to view PDFs.", badge: "P", color: "#f26b4f" },
  { name: "Excel to PDF", description: "Convert Excel spreadsheets into shareable PDF documents.", badge: "X", color: "#58a86b" },
  { name: "Edit PDF", description: "Add text, images, shapes, or freehand annotations to a PDF.", badge: "EDIT", color: "#b0649b" },
  { name: "PDF to JPG", description: "Convert each PDF page into JPG or extract images from a PDF.", badge: "JPG", color: "#e4c32f" },
  { name: "JPG to PDF", description: "Convert JPG images to PDF and adjust orientation or margins.", badge: "JPG", color: "#e0c024" },
  { name: "Sign PDF", description: "Sign yourself or request electronic signatures from others.", badge: "SIGN", color: "#4e82bd" },
  { name: "Watermark", description: "Stamp an image or text over your PDF with position controls.", badge: "WM", color: "#b0649b" },
  { name: "Rotate PDF", description: "Rotate one page or many pages at once.", badge: "ROT", color: "#b0649b" },
  { name: "HTML to PDF", description: "Convert webpages in HTML to PDF from a pasted URL.", badge: "HTML", color: "#e4c32f" },
  { name: "Unlock PDF", description: "Remove PDF password security when you have permission.", badge: "KEY", color: "#4e82bd" },
  { name: "Protect PDF", description: "Encrypt PDF documents with a password to prevent access.", badge: "LOCK", color: "#4e82bd" },
  { name: "Organize PDF", description: "Sort, delete, or add PDF pages to your document.", badge: "ABC", color: "#f26b4f" },
  { name: "PDF to PDF/A", description: "Transform PDFs into ISO-standard PDF/A archive files.", badge: "A", color: "#4e82bd" },
  { name: "Repair PDF", description: "Repair damaged PDFs and recover data from corrupt files.", badge: "FIX", color: "#83bd55" },
  { name: "Page numbers", description: "Add page numbers with custom position and typography.", badge: "123", color: "#b0649b" },
  { name: "Scan to PDF", description: "Capture document scans from mobile and send them to browser.", badge: "SCAN", color: "#f26b4f" },
  { name: "OCR PDF", description: "Convert scanned PDFs into searchable, selectable documents.", badge: "OCR", color: "#83bd55" },
  { name: "Compare PDF", description: "Compare two PDFs side by side and spot changes.", badge: "CMP", color: "#4e82bd" },
  { name: "Redact PDF", description: "Permanently remove sensitive text and graphics from a PDF.", badge: "RED", color: "#4e82bd" },
  { name: "Crop PDF", description: "Crop margins or selected areas, then apply to pages.", badge: "CROP", color: "#b0649b" },
  { name: "PDF Forms", description: "Detect form fields and create fillable PDFs.", badge: "FORM", color: "#b0649b", isNew: true },
  { name: "AI Summarizer", description: "Quickly generate concise summaries from long documents.", badge: "AI", color: "#7154e8", isNew: true },
  { name: "Translate PDF", description: "Translate PDFs while keeping fonts, layout, and formatting.", badge: "A", color: "#7154e8", isNew: true },
];

export default function PdfToolsPage() {
  return (
    <DashboardShell activePath="/pdf-tools">
      <div className="dashboard pdf-tools-page">
          <div className="dashboard-hero pdf-tools-hero">
            <div>
              <span className="auto-print-kicker">PrintPilot PDF Tools</span>
              <h1>PDF Tools</h1>
              <p>Merge, split, compress, convert, scan, OCR, and AI tools for daily PDF work in one place.</p>
            </div>
            <span className="status-pill">30 Tools Ready</span>
          </div>

          <section className="pdf-tool-grid" aria-label="PDF tools">
            {pdfTools.map((tool) => (
              <Link className="pdf-tool-card" href="#" key={tool.name}>
                {tool.isNew ? <span className="new-ribbon">New!</span> : null}
                <span className="pdf-tool-icon" style={{ "--tool-color": tool.color } as React.CSSProperties}>
                  <FileText size={22} />
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
