import { ClipboardList, FileScan, FileText, FileUser, Home, IdCard, Image, Printer, Users, type LucideIcon } from "lucide-react";
import { pdfTools, pdfToolHref } from "./pdfToolsData";
import { imageTools } from "./imageToolsData";

export type SearchableTool = {
  name: string;
  href: string;
  icon: LucideIcon;
  group: string;
};

const coreServices: SearchableTool[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home, group: "Core" },
  { name: "Orders", href: "/orders", icon: ClipboardList, group: "Core" },
  { name: "PrintPilot", href: "/auto-print", icon: Printer, group: "Services" },
  { name: "Passport Photo", href: "/passport-photo", icon: IdCard, group: "Services" },
  { name: "ID Card Maker", href: "/id-card-maker", icon: FileScan, group: "Services" },
  { name: "ID Card Print", href: "/id-card-print", icon: IdCard, group: "Services" },
  { name: "Resume Builder", href: "/resume-builder", icon: FileUser, group: "Services" },
  { name: "Biodata Maker", href: "/biodata-maker", icon: Users, group: "Services" },
];

export const toolsCatalog: SearchableTool[] = [
  ...coreServices,
  ...pdfTools.map((tool) => ({
    name: tool.name,
    href: tool.href || pdfToolHref(tool.name),
    icon: FileText,
    group: "PDF Tools",
  })),
  ...imageTools.map((tool) => ({
    name: tool.name,
    href: tool.href!,
    icon: Image,
    group: "Image Tools",
  })),
];
