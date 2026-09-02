export type CardCropRect = { x: number; y: number; width: number; height: number };

export type CardFaceTemplate = { page: number; rect: CardCropRect };

export type CardTemplate = {
  pageCount: number;
  front: CardFaceTemplate;
  back: CardFaceTemplate;
};

export type CardTypeKey = "aadhaar" | "pan" | "voter_id" | "driving_licence" | "passport" | "generic";

export type CardTypeInfo = {
  key: CardTypeKey;
  label: string;
  color: string;
};

export const CARD_TYPES: Record<CardTypeKey, CardTypeInfo> = {
  aadhaar: { key: "aadhaar", label: "Aadhaar Card", color: "#e9546a" },
  pan: { key: "pan", label: "PAN Card", color: "#2563eb" },
  voter_id: { key: "voter_id", label: "Voter ID Card", color: "#f97316" },
  driving_licence: { key: "driving_licence", label: "Driving Licence", color: "#16a1bd" },
  passport: { key: "passport", label: "Passport", color: "#5740ed" },
  generic: { key: "generic", label: "ID Document", color: "#667795" },
};

// Ordered most-specific first: Aadhaar/PAN text often also contains generic
// "Government of India" phrasing, so those specific keyword sets are checked
// before anything broader like the passport/generic fallback.
const DETECTORS: Array<{ key: CardTypeKey; pattern: RegExp }> = [
  { key: "aadhaar", pattern: /aadhaar|uidai|unique identification authority/i },
  { key: "pan", pattern: /income tax department|permanent account number|\bpan\b.{0,20}card/i },
  { key: "voter_id", pattern: /election commission of india|elector'?s photo identity|\bepic\b/i },
  { key: "driving_licence", pattern: /driving licen[cs]e|transport department|\bmcwg\b|\blmv\b/i },
  { key: "passport", pattern: /republic of india.*passport|passport.{0,20}republic of india|\bpassport no\b/i },
];

export function detectCardType(fullText: string): CardTypeInfo {
  for (const detector of DETECTORS) {
    if (detector.pattern.test(fullText)) return CARD_TYPES[detector.key];
  }
  return CARD_TYPES.generic;
}

export const DEFAULT_FACE_RECT: CardCropRect = { x: 8, y: 8, width: 84, height: 40 };

// Starting-point crop guesses per card type/page-count combination. Real
// government e-card layouts vary by issue date and state, so these are only
// a first pass — the shopkeeper fine-tunes once with the crop handles and
// the result is remembered per card type via saveCardTemplate().
const DEFAULT_TEMPLATES: Partial<Record<CardTypeKey, { single: CardTemplate; multi: CardTemplate }>> = {
  aadhaar: {
    single: {
      pageCount: 1,
      front: { page: 1, rect: { x: 4, y: 8, width: 46, height: 40 } },
      back: { page: 1, rect: { x: 52, y: 8, width: 44, height: 40 } },
    },
    multi: {
      pageCount: 2,
      front: { page: 1, rect: { x: 10, y: 10, width: 80, height: 80 } },
      back: { page: 2, rect: { x: 10, y: 10, width: 80, height: 80 } },
    },
  },
  pan: {
    single: {
      pageCount: 1,
      front: { page: 1, rect: { x: 6.4, y: 77.8, width: 40.9, height: 18.9 } },
      back: { page: 1, rect: { x: 53, y: 78.5, width: 41.6, height: 17.8 } },
    },
    multi: {
      pageCount: 2,
      front: { page: 1, rect: { x: 10, y: 10, width: 80, height: 80 } },
      back: { page: 2, rect: { x: 10, y: 10, width: 80, height: 80 } },
    },
  },
};

function fallbackTemplate(pageCount: number): CardTemplate {
  if (pageCount >= 2) {
    return {
      pageCount: 2,
      front: { page: 1, rect: { ...DEFAULT_FACE_RECT, y: 10, height: 80 } },
      back: { page: 2, rect: { ...DEFAULT_FACE_RECT, y: 10, height: 80 } },
    };
  }
  return {
    pageCount: 1,
    front: { page: 1, rect: { x: 6, y: 6, width: 88, height: 42 } },
    back: { page: 1, rect: { x: 6, y: 50, width: 88, height: 42 } },
  };
}

const STORAGE_KEY = "cafemitra_card_print_templates";

function readSavedTemplates(): Partial<Record<string, CardTemplate>> {
  if (typeof window === "undefined") return {};
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return stored && typeof stored === "object" ? stored : {};
  } catch {
    return {};
  }
}

function templateStorageKey(type: CardTypeKey, pageCount: number) {
  return `${type}:${pageCount >= 2 ? "multi" : "single"}`;
}

export function getDefaultCardTemplate(type: CardTypeKey, pageCount: number): CardTemplate {
  const defaults = DEFAULT_TEMPLATES[type];
  if (defaults) return pageCount >= 2 ? defaults.multi : defaults.single;
  return fallbackTemplate(pageCount);
}

export function getCardTemplate(type: CardTypeKey, pageCount: number): CardTemplate {
  const saved = readSavedTemplates()[templateStorageKey(type, pageCount)];
  return saved || getDefaultCardTemplate(type, pageCount);
}

export function saveCardTemplate(type: CardTypeKey, pageCount: number, template: CardTemplate) {
  if (typeof window === "undefined") return;
  try {
    const all = readSavedTemplates();
    all[templateStorageKey(type, pageCount)] = template;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    undefined;
  }
}

export function hasSavedCardTemplate(type: CardTypeKey, pageCount: number) {
  return Boolean(readSavedTemplates()[templateStorageKey(type, pageCount)]);
}
