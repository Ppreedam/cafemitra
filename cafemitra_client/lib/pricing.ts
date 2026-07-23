import { apiFetch, hasStoredSession } from "@/lib/api";

export type PriceItem = {
  id: string;
  label: string;
  rate: number;
  ranges?: PriceRange[];
};

export type PriceRange = {
  id: string;
  minPages: number;
  maxPages?: number;
  rate: number;
};

export type PricingValue = string | number | boolean | PriceItem[];

export type PricingService = {
  serviceKey: string;
  serviceName: string;
  settings: Record<string, PricingValue>;
  updatedAt?: string;
};

export const defaultPricingServices: PricingService[] = [
  {
    serviceKey: "auto_document_print",
    serviceName: "RepetiGo PrintPilot",
    settings: {
      paymentMode: "Online Payment",
      selectedPrinter: "",
      pricingSaved: false,
      priceItems: [
        { id: "black_white", label: "Black & White", rate: 2 },
        { id: "color", label: "Color", rate: 10 },
      ],
    },
  },
  {
    serviceKey: "passport_photo",
    serviceName: "Passport Size Photo",
    settings: {
      paymentMode: "Online Payment",
      priceItems: [{ id: "six_pcs", label: "6 pcs", rate: 30 }],
    },
  },
];

export async function fetchPricingServices() {
  if (!hasStoredSession()) return defaultPricingServices;

  const response = await apiFetch("/api/pricing-settings/");

  if (!response.ok) return defaultPricingServices;
  const result = (await response.json()) as { services: PricingService[] };
  return mergePricingDefaults(result.services || []);
}

export async function fetchPricingServiceByKey(serviceKey: string) {
  const fallback = defaultPricingServices.find((service) => service.serviceKey === serviceKey);
  if (!hasStoredSession()) return fallback;

  try {
    const response = await apiFetch("/api/pricing-settings/");
    if (!response.ok) return fallback;
    const result = (await response.json()) as { services: PricingService[] };
    return (result.services || []).find((service) => service.serviceKey === serviceKey) || fallback;
  } catch {
    return fallback;
  }
}

export async function savePricingService(serviceKey: string, settings: Record<string, PricingValue>) {
  if (!hasStoredSession()) throw new Error("Please login first.");

  const response = await apiFetch("/api/pricing-settings/", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serviceKey, settings }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Could not save pricing.");
  return result.service as PricingService;
}

export async function saveServicePrinter(serviceKey: string, printerName: string) {
  return savePricingService(serviceKey, { selectedPrinter: printerName });
}

export function calculatePriceItemRate(item: PriceItem | undefined, pages: number) {
  if (!item) return 0;
  const pageCount = Math.max(1, Number(pages || 1));
  const matchedRange = (item.ranges || []).find((range) => {
    const minPages = Math.max(1, Number(range.minPages || 1));
    const maxPages = range.maxPages === undefined || range.maxPages === null || Number(range.maxPages) <= 0 ? Infinity : Number(range.maxPages);
    return pageCount >= minPages && pageCount <= maxPages;
  });

  return Number((matchedRange || item).rate || 0);
}

export function normalizePaymentMode(value: string) {
  return value === "Both" || value === "Cash Counter" ? "Both" : "Online Payment";
}

export function getAllowedPaymentModes(service: PricingService | undefined) {
  const mode = normalizePaymentMode(String(service?.settings.paymentMode || "Online Payment"));
  return mode === "Both" ? ["Online Payment", "Cash Counter"] : ["Online Payment"];
}

export function formatPriceItem(item: PriceItem) {
  const ranges = item.ranges || [];
  if (!ranges.length) return `${item.label} Rs. ${item.rate}`;
  const rangeSummary = ranges
    .map((range) => {
      const maxPages = range.maxPages === undefined || range.maxPages === null || Number(range.maxPages) <= 0 ? "up" : range.maxPages;
      return `${range.minPages}-${maxPages} Rs. ${range.rate}`;
    })
    .join(", ");
  return `${item.label}: ${rangeSummary}`;
}

export function mergePricingDefaults(services: PricingService[]) {
  return defaultPricingServices.map((defaultService) => {
    const saved = services.find((service) => service.serviceKey === defaultService.serviceKey);
    const allowedFields = Object.keys(defaultService.settings);
    const normalizedSettings = normalizeLegacySettings(defaultService.serviceKey, saved?.settings || {});
    const savedSettings = Object.fromEntries(
      Object.entries(normalizedSettings).filter(([field]) => allowedFields.includes(field)),
    ) as Record<string, PricingValue>;

    return {
      ...defaultService,
      ...saved,
      settings: { ...defaultService.settings, ...savedSettings },
    };
  });
}

function normalizeLegacySettings(serviceKey: string, settings: Record<string, PricingValue>) {
  if (Array.isArray(settings.priceItems)) return settings;

  if (serviceKey === "auto_document_print") {
    return {
      ...settings,
      priceItems: [
        { id: "black_white", label: "Black & White", rate: Number(settings.blackWhiteRate ?? 2) },
        { id: "color", label: "Color", rate: Number(settings.colorRate ?? 10) },
      ],
    };
  }

  if (serviceKey === "passport_photo") {
    return {
      ...settings,
      priceItems: [{ id: "six_pcs", label: "6 pcs", rate: Number(settings.sixPieceRate ?? 30) }],
    };
  }

  return settings;
}
