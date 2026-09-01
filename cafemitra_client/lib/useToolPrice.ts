"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "./api";

type WalletConfigTool = { toolKey: string; price: number };

/// Fetches RepetiGo's own per-use fee for a single tool_key from the public
/// wallet config endpoint (no auth needed). Unlike useTemplatePrices (which
/// resolves a whole family of per-template keys), this is for tools with
/// just one flat price. Resolves to 0 (free) once loaded if the tool has no
/// ToolPricing row yet, or isn't billable - never undefined. `null` means
/// "still loading".
export function useToolPrice(toolKey: string) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/wallet/config/"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { tools?: WalletConfigTool[] } | null) => {
        if (cancelled) return;
        const match = (data?.tools || []).find((tool) => tool.toolKey === toolKey);
        setPrice(match?.price || 0);
      })
      .catch(() => {
        if (!cancelled) setPrice(0);
      });
    return () => {
      cancelled = true;
    };
  }, [toolKey]);

  return price;
}
