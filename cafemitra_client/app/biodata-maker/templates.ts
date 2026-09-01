export type BiodataTemplateId = "classic" | "modern" | "royal" | "shubh" | "heritage" | "krishna" | "marriage" | "indigo" | "redbeige" | "simple";

export type BiodataTemplateMeta = { id: BiodataTemplateId; label: string; description: string };

export const BIODATA_TEMPLATES: BiodataTemplateMeta[] = [
  { id: "classic", label: "Classic", description: "Traditional matrimonial biodata layout - personal, family, and astrology details in one clean column." },
  { id: "modern", label: "Modern", description: "Same matrimonial sections with a bold colored header band." },
  { id: "royal", label: "Royal", description: "Festive maroon & gold matrimonial biodata with a decorative border and centered header - the classic Indian shaadi biodata look." },
  { id: "shubh", label: "Shubh Vivah", description: "Devotional Hindu matrimonial biodata - Shree Ganeshay Namah header, swastik motifs, a festive toran border, and a two-column layout." },
  { id: "heritage", label: "Heritage", description: "Wood-framed matrimonial biodata with a circular gold emblem, a Ganeshaya Namah header, and a single-column colon-style layout." },
  { id: "krishna", label: "Krishna", description: "Cream matrimonial biodata with a maroon & gold emblem, corner ornaments, and a Shree Krishnaya Namah header." },
  { id: "marriage", label: "Marriage Biodata", description: "Tan matrimonial biodata with a green emblem, a Marriage Biodata title, and a Shree Ganeshay Namah header." },
  { id: "indigo", label: "Indigo", description: "Deep blue & gold matrimonial biodata with a striped border band and a gold emblem header." },
  { id: "redbeige", label: "Red & Beige", description: "Illustrated Ganesha biodata document with ornate corner artwork, a Shree Ganeshaya Namah header, a photo box, and pill-style section badges." },
  { id: "simple", label: "Simple", description: "General-purpose biodata - personal, education, and contact details only, no astrology/family section. Good for non-matrimonial use." },
];
