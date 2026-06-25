import { apiFetch, hasStoredSession } from "@/lib/api";

export type PriceItem = {
  id: string;
  label: string;
  rate: number;
};

export type PricingValue = string | number | PriceItem[];

export type PricingService = {
  serviceKey: string;
  serviceName: string;
  settings: Record<string, PricingValue>;
  updatedAt?: string;
};

export const defaultPricingServices: PricingService[] = [
  {
    serviceKey: "auto_document_print",
    serviceName: "CafeMitra PrintPilot",
    settings: {
      paymentMode: "Online Payment",
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
