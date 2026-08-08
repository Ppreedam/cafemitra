import { ClipboardList, FileText, Home, IdCard, Image, Printer, type LucideIcon } from "lucide-react";
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
