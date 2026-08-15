"use client";

import { useEffect, useState } from "react";
import { calculatePriceItemRate, fetchPricingServiceByKey, type PricingService } from "@/lib/pricing";

/// What THIS shop charges its own walk-in customer per template for the
/// given service (e.g. "resume_builder", "biodata_maker") - separate from
/// useTemplatePrices, which is RepetiGo's own per-template fee charged to
/// the shop's wallet.
export function useCustomerPricing(serviceKey: string) {
  const [service, setService] = useState<PricingService | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPricingServiceByKey(serviceKey)
      .then((result) => {
        if (!cancelled) setService(result || null);
      })
      .catch(() => {
        if (!cancelled) setService(null);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceKey]);

  return service;
}

export function customerPriceForTemplate<TId extends string>(service: PricingService | null, template: TId) {
  if (!service) return 0;
  const items = Array.isArray(service.settings.priceItems) ? service.settings.priceItems : [];
  const item = items.find((entry) => entry.id === template);
  return calculatePriceItemRate(item, 1);
}
