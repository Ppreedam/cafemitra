"use client";

import { useEffect, useState, type ElementType } from "react";
import Link from "next/link";
import { ArrowRight, Camera, Check, FileSearch, Image as ImageIcon, Printer, Scissors, Sparkles, Wrench } from "lucide-react";

type Promotion = { kicker: string; title: string; description: string; icon: ElementType; href: string; cta: string; points: string[]; note: string; combo: string };

const promotions: Promotion[] = [
  { kicker: "Made for print shops", title: "Meet RepetiGo PrintPilot", description: "Turn customer document uploads into an organized print queue without repeatedly checking WhatsApp.", icon: Printer, href: "/print-automation", cta: "Explore PrintPilot", points: ["QR-based customer uploads", "Live print queue and status", "Local printer automation", "Built for cyber cafés"], combo: "PDF Tools + PrintPilot", note: "PDF tools stay free. Login is needed only for shop automation." },
  { kicker: "Fast photo service", title: "Selfie to Passport Photo", description: "Help customers turn a phone selfie into clean, print-ready passport photo sheets in minutes.", icon: Camera, href: "/image-tools", cta: "Explore Image Tools", points: ["Background cleanup", "Passport-size cropping", "Print-sheet preparation", "Useful for forms and IDs"], combo: "Selfie + RepetiGo Photo Tools", note: "Discover image tools designed for daily cyber café work." },
  { kicker: "Stop repetitive typing", title: "Scan, extract, verify, print", description: "Use OCR to extract text from scanned forms, verify it, and prepare typing or print work without re-entering everything.", icon: FileSearch, href: "/pdf-tools/ocr-pdf", cta: "Open OCR PDF", points: ["English and Hindi OCR", "Recognized text preview", "Searchable PDF output", "TXT download for typing"], combo: "OCR + Typing workflow", note: "Scan once, verify the text, then reuse it for typing and printing." },
  { kicker: "Clean customer photos", title: "Remove image backgrounds", description: "Create transparent photos for forms, product images, profile pictures and print layouts.", icon: ImageIcon, href: "/image-tools/background-remover", cta: "Remove Background", points: ["AI background removal", "Transparent PNG output", "Private browser processing", "Ready for photo layouts"], combo: "Image Tools + Print Work", note: "A practical add-on for passport photo and design jobs." },
];

const related = [
  { name: "OCR PDF", detail: "Extract text for typing", href: "/pdf-tools/ocr-pdf", icon: FileSearch },
  { name: "Repair & enhance", detail: "Improve scan clarity", href: "/pdf-tools/repair-pdf", icon: Wrench },
  { name: "Compress PDF", detail: "Reduce document size", href: "/pdf-tools/compress-pdf", icon: Sparkles },
  { name: "Split PDF", detail: "Separate pages and ranges", href: "/pdf-tools/split-pdf", icon: Scissors },
  { name: "Background remover", detail: "Clean customer photos", href: "/image-tools/background-remover", icon: ImageIcon },
  { name: "PrintPilot", detail: "Automate print queues", href: "/print-automation", icon: Printer },
];

export function ToolPromotionRail({ context }: { context: string }) {
  const [index, setIndex] = useState(hash(context) % promotions.length);
  useEffect(() => {
    const key = `repetigo-promo-${context}`; const stored = sessionStorage.getItem(key);
    if (stored !== null) setIndex(Number(stored) % promotions.length);
    else { const next = Math.floor(Math.random() * promotions.length); sessionStorage.setItem(key, String(next)); setIndex(next); }
  }, [context]);
  const promo = promotions[index]; const Icon = promo.icon;
  return <aside className="tool-promotion-rail"><span className="tool-promo-mark"><Icon size={25} /></span><span className="auto-print-kicker">{promo.kicker}</span><h2>{promo.title}</h2><p>{promo.description}</p><ul>{promo.points.map((point) => <li key={point}><Check size={15} /> {point}</li>)}</ul><div className="tool-promo-combo"><strong>{promo.combo}</strong><span>{promo.note}</span></div><Link href={promo.href}>{promo.cta} <ArrowRight size={16} /></Link><button type="button" onClick={() => { const next = (index + 1) % promotions.length; sessionStorage.setItem(`repetigo-promo-${context}`, String(next)); setIndex(next); }}>Show another RepetiGo tool</button></aside>;
}

export function RelatedToolSuggestions({ context, limit = 4 }: { context: string; limit?: number }) {
  const start = hash(context) % related.length; const tools = Array.from({ length: Math.min(limit, related.length) }, (_, offset) => related[(start + offset) % related.length]);
  return <section className="shared-related-tools"><header><div><strong>Continue with another tool</strong><small>Useful RepetiGo tools for your next task</small></div><Link href="/pdf-tools">View all <ArrowRight size={14} /></Link></header><div>{tools.map((tool) => { const Icon = tool.icon; return <Link href={tool.href} key={tool.name}><span><Icon size={17} /></span><div><strong>{tool.name}</strong><small>{tool.detail}</small></div><ArrowRight size={15} /></Link>; })}</div></section>;
}

function hash(value: string) { return Array.from(value).reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7); }
