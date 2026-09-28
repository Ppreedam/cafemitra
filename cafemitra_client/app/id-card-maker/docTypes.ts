import {
  BadgeCheck,
  Car,
  Contact,
  Fingerprint,
  HeartPulse,
  Landmark,
  Sprout,
  UserCheck,
  Vote,
  Wheat,
  type LucideIcon,
} from "lucide-react";

export type DocType = "aadhaar" | "pan" | "voter" | "eshram" | "ayushman" | "ration" | "apaar" | "epfo" | "dl" | "agriculture";

export type FieldDef = { key: string; label: string; demo: string };
export type DocLayout = { title: string; front: string[]; back: string[] };

export type DocTypeMeta = {
  key: DocType;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  color: string;
  comingSoon?: boolean;
  // A solid, saturated fill of the right colour still reads as "a coloured
  // tile", not "this document" - the real cards (Aadhaar, PAN) are pale/
  // white with the colour carried by text, a line or a hologram tint.
  // Opting a tile into this swaps the header to that pale-background,
  // coloured-text look instead of a solid fill.
  realistic?: boolean;
  // India's tricolour line under the header - Aadhaar only, it's the one
  // card whose real design actually carries it.
  tricolor?: boolean;
};

// Tile colors follow each document's own real-world colours (Aadhaar's UIDAI
// saffron, PAN's Income-Tax-Dept blue, the EPIC card's teal map-watermark,
// ...) rather than an arbitrary palette, so a tile reads as "this document"
// at a glance.
export const DOC_TYPES: DocTypeMeta[] = [
  { key: "aadhaar", label: "Aadhaar Card", shortLabel: "AADHAAR", description: "Recreate a printable Aadhaar card from the downloaded e-Aadhaar PDF.", icon: Fingerprint, color: "#F7941E", realistic: true, tricolor: true },
  { key: "pan", label: "PAN Card", shortLabel: "PAN", description: "Recreate a printable PAN card from the downloaded e-PAN PDF.", icon: Contact, color: "#1565C0", realistic: true },
  { key: "voter", label: "Voter ID Card", shortLabel: "VOTER ID", description: "Recreate a printable Voter ID (EPIC) card from the downloaded e-EPIC PDF.", icon: Vote, color: "#2E8B92", realistic: true },
  { key: "eshram", label: "e-Shram Card", shortLabel: "E-SHRAM", description: "Recreate a printable e-Shram card from the downloaded UAN PDF.", icon: UserCheck, color: "#00838F", comingSoon: true },
  { key: "ayushman", label: "Ayushman Card", shortLabel: "AYUSHMAN", description: "Recreate a printable Ayushman Bharat (PM-JAY) card from the downloaded PDF.", icon: HeartPulse, color: "#00897B", comingSoon: true },
  { key: "ration", label: "Ration Card", shortLabel: "RATION", description: "Recreate a printable Ration card from the downloaded PDF.", icon: Wheat, color: "#C9A227", comingSoon: true },
  { key: "apaar", label: "APAAR ID", shortLabel: "APAAR", description: "Recreate a printable APAAR (student) ID card from the downloaded PDF.", icon: BadgeCheck, color: "#5E35B1", comingSoon: true },
  { key: "epfo", label: "EPFO / UAN Card", shortLabel: "EPFO", description: "Recreate a printable EPFO / UAN card from the downloaded PDF.", icon: Landmark, color: "#00695C", comingSoon: true },
  { key: "dl", label: "Driving Licence", shortLabel: "DRIVING LICENCE", description: "Recreate a printable Driving Licence from the downloaded DL PDF.", icon: Car, color: "#37474F", comingSoon: true },
  { key: "agriculture", label: "Agriculture Card", shortLabel: "AGRICULTURE", description: "Recreate a printable Agriculture / Kisan card from the downloaded PDF.", icon: Sprout, color: "#2E7D32", comingSoon: true },
];

export const DOC_FIELDS: Record<DocType, FieldDef[]> = {
  aadhaar: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "guardian", label: "S/O, D/O, W/O", demo: "Guardian Name" },
    { key: "dob", label: "Date of Birth", demo: "01/01/1990" },
    { key: "gender", label: "Gender", demo: "Male" },
    { key: "idNumber", label: "Aadhaar Number", demo: "XXXX XXXX XXXX" },
    { key: "address", label: "Address", demo: "House No, Street, City, State - PIN" },
  ],
  pan: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "guardian", label: "Father's Name", demo: "Father's Name" },
    { key: "dob", label: "Date of Birth", demo: "01/01/1990" },
    { key: "idNumber", label: "PAN Number", demo: "ABCDE1234F" },
  ],
  voter: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "guardian", label: "Father's / Husband's Name", demo: "Guardian Name" },
    { key: "dob", label: "Age / Date of Birth", demo: "34 Years" },
    { key: "gender", label: "Gender", demo: "Male" },
    { key: "idNumber", label: "EPIC Number", demo: "ABC1234567" },
    { key: "address", label: "Address", demo: "House No, Street, City, State - PIN" },
  ],
  eshram: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "dob", label: "Date of Birth", demo: "01/01/1990" },
    { key: "gender", label: "Gender", demo: "Male" },
    { key: "idNumber", label: "UAN (e-Shram)", demo: "1234 5678 9012" },
    { key: "category", label: "Occupation Category", demo: "Unorganised Worker" },
    { key: "address", label: "Address", demo: "House No, Street, City, State - PIN" },
  ],
  ayushman: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "dob", label: "Date of Birth", demo: "01/01/1990" },
    { key: "gender", label: "Gender", demo: "Male" },
    { key: "idNumber", label: "PM-JAY ID", demo: "PMJAY-XXXX-XXXX" },
    { key: "familyId", label: "Family ID", demo: "FAM-XXXXXXX" },
    { key: "address", label: "Address", demo: "House No, Street, City, State - PIN" },
  ],
  ration: [
    { key: "name", label: "Head of Family", demo: "Ravi Kumar" },
    { key: "idNumber", label: "Ration Card Number", demo: "RC-XXXXXXXXX" },
    { key: "category", label: "Category", demo: "Priority (PHH)" },
    { key: "address", label: "Address", demo: "House No, Street, City, State - PIN" },
  ],
  apaar: [
    { key: "name", label: "Student Name", demo: "Ravi Kumar" },
    { key: "dob", label: "Date of Birth", demo: "01/01/2010" },
    { key: "idNumber", label: "APAAR ID", demo: "XXXX-XXXX-XXXX" },
    { key: "institution", label: "School / Institution", demo: "Institution Name" },
  ],
  epfo: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "dob", label: "Date of Birth", demo: "01/01/1990" },
    { key: "idNumber", label: "UAN Number", demo: "1234 5678 9012" },
    { key: "employer", label: "Employer / Establishment", demo: "Employer Name" },
  ],
  dl: [
    { key: "name", label: "Full Name", demo: "Ravi Kumar" },
    { key: "dob", label: "Date of Birth", demo: "01/01/1990" },
    { key: "idNumber", label: "DL Number", demo: "BR01 2023 0012345" },
    { key: "validity", label: "Valid Till", demo: "01/01/2040" },
    { key: "bloodGroup", label: "Blood Group", demo: "O+" },
    { key: "address", label: "Address", demo: "House No, Street, City, State - PIN" },
  ],
  agriculture: [
    { key: "name", label: "Farmer Name", demo: "Ravi Kumar" },
    { key: "idNumber", label: "Farmer / Kisan ID", demo: "KID-XXXXXXX" },
    { key: "village", label: "Village / District", demo: "Village, District, State" },
    { key: "landArea", label: "Land Area", demo: "2.5 Acres" },
  ],
};

export const DOC_LAYOUT: Record<DocType, DocLayout> = {
  aadhaar: { title: "Aadhaar Card", front: ["name", "dob", "gender"], back: ["guardian", "address"] },
  pan: { title: "PAN Card", front: ["name", "guardian", "dob"], back: [] },
  voter: { title: "Voter ID Card", front: ["name", "dob", "gender"], back: ["guardian", "address"] },
  eshram: { title: "e-Shram Card", front: ["name", "dob", "gender"], back: ["category", "address"] },
  ayushman: { title: "Ayushman Card", front: ["name", "dob", "gender"], back: ["familyId", "address"] },
  ration: { title: "Ration Card", front: ["name", "category"], back: ["address"] },
  apaar: { title: "APAAR ID", front: ["name", "dob"], back: ["institution"] },
  epfo: { title: "EPFO / UAN Card", front: ["name", "dob"], back: ["employer"] },
  dl: { title: "Driving Licence", front: ["name", "dob", "bloodGroup"], back: ["validity", "address"] },
  agriculture: { title: "Agriculture Card", front: ["name", "village"], back: ["landArea"] },
};

export function ocrStorageKey(docType: DocType) {
  return `idcard-ocr-${docType}`;
}
