import type { LucideIcon } from "lucide-react";
import { BookUser, FileUser, IdCard, Printer } from "lucide-react";

export type BlogPost = {
  slug: string;
  href: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  ctaLabel?: string;
  icon: LucideIcon;
  color: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "printpilot-print-automation",
    href: "/print-automation",
    category: "Product",
    title: "PrintPilot: Print Automation Software",
    excerpt:
      "QR upload, AI document processing, print queue management, and auto-delete after every job - see how PrintPilot runs your print shop on autopilot.",
    readTime: "Explore feature",
    ctaLabel: "Explore PrintPilot",
    icon: Printer,
    color: "#0d9488",
  },
  {
    slug: "passport-size-photo-maker",
    href: "/tools/photo/passport-photo/",
    category: "Free Tool",
    title: "Passport Size Photo Maker",
    excerpt:
      "Upload a selfie, choose Casual, Normal, or Official attire, let AI process it, then print government-compliant passport photos at home.",
    readTime: "AI + Attire Selection",
    ctaLabel: "Make Your Photo",
    icon: IdCard,
    color: "#5740ed",
  },
  {
    slug: "resume-maker",
    href: "/tools/resume-maker/",
    category: "Free Tool",
    title: "Resume Maker",
    excerpt:
      "9 professional templates, including an ATS-safe design. Add your photo, fill your details, and download a print-ready PDF - online or at a nearby cyber cafe.",
    readTime: "9 Templates + PDF",
    ctaLabel: "Make Your Resume",
    icon: FileUser,
    color: "#16a34a",
  },
  {
    slug: "biodata-maker",
    href: "/tools/biodata-maker/",
    category: "Free Tool",
    title: "Marriage Biodata Maker",
    excerpt:
      "Matrimonial and simple templates - add your photo and details, and download a print-ready PDF. Online or at a nearby cyber cafe.",
    readTime: "Templates + PDF",
    ctaLabel: "Make Your Biodata",
    icon: BookUser,
    color: "#c026d3",
  },
];
