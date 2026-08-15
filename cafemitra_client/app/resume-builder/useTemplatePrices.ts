"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

type WalletConfigTool = { toolKey: string; price: number };

/// Fetches RepetiGo's own per-template document PDF fee from the public
/// wallet config endpoint (no auth needed - the pricing page reads the same
/// numbers). `toolPrefix` picks the tool family, e.g. "resume_builder_" or
/// "biodata_maker_". Missing/not-yet-billable templates resolve to 0 (free),
/// never undefined, once loaded - `null` means "still loading".
export function useTemplatePrices<TId extends string>(toolPrefix: string) {
  const [prices, setPrices] = useState<Partial<Record<TId, number>> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/wallet/config/"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { tools?: WalletConfigTool[] } | null) => {
        if (cancelled) return;
        const map: Partial<Record<TId, number>> = {};
        (data?.tools || []).forEach((tool) => {
          if (tool.toolKey.startsWith(toolPrefix)) {
            map[tool.toolKey.replace(toolPrefix, "") as TId] = tool.price;
          }
        });
        setPrices(map);
      })
      .catch(() => {
        if (!cancelled) setPrices({});
      });
    return () => {
      cancelled = true;
    };
  }, [toolPrefix]);

  return prices;
}
