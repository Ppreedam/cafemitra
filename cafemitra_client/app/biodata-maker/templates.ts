export type BiodataTemplateId = "classic" | "modern" | "simple";

export type BiodataTemplateMeta = { id: BiodataTemplateId; label: string; description: string };

export const BIODATA_TEMPLATES: BiodataTemplateMeta[] = [
  { id: "classic", label: "Classic", description: "Traditional matrimonial biodata layout - personal, family, and astrology details in one clean column." },
  { id: "modern", label: "Modern", description: "Same matrimonial sections with a bold colored header band." },
  { id: "simple", label: "Simple", description: "General-purpose biodata - personal, education, and contact details only, no astrology/family section. Good for non-matrimonial use." },
];
