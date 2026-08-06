import type { LucideIcon } from "lucide-react";
import { IdCard, Printer } from "lucide-react";

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
];
