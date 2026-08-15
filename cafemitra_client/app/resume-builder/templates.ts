export type TemplateId = "classic" | "modern" | "minimal" | "elegant" | "bold" | "sidebar" | "sidebar-right" | "ats" | "timeline";

export type TemplateMeta = { id: TemplateId; label: string; description: string; swatch: string };

export const TEMPLATES: TemplateMeta[] = [
  { id: "classic", label: "Classic", description: "Clean single column, blue accent. Safe default.", swatch: "#2563eb" },
  { id: "modern", label: "Modern", description: "Bold colored header band. Still ATS-friendly.", swatch: "#0f766e" },
  { id: "minimal", label: "Minimal", description: "Tight spacing, grayscale. Fits more on one page.", swatch: "#111827" },
  { id: "elegant", label: "Elegant", description: "Serif type, centered header, black and gold. Formal roles.", swatch: "#a16207" },
  { id: "bold", label: "Bold", description: "Violet banner header with pill-style section labels.", swatch: "#6d28d9" },
  { id: "sidebar", label: "Sidebar Photo", description: "Two-column layout with a photo, dark sidebar for contact and skills.", swatch: "#1f2937" },
  { id: "sidebar-right", label: "Sidebar Photo (Right)", description: "Same two-column layout, dark sidebar on the right instead.", swatch: "#1f2937" },
  { id: "ats", label: "ATS-Ultra", description: "Zero color, single font. Maximum applicant-tracking-system safety.", swatch: "#000000" },
  { id: "timeline", label: "Timeline", description: "Experience and education laid out along a connected timeline.", swatch: "#de6133" },
];
