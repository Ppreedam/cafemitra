import { apiUrl } from "./api";

// Live per-use charge for a billable tool, read from the same wallet config the
// /pricing page uses, so page copy never shows a stale hard-coded price.
// b2c = charge when a customer order triggers the tool, b2b = shop's own use.
export type ToolCharge = { b2c: number; b2b: number } | null;

const REVALIDATE_SECONDS = 300;

export async function getToolCharge(toolKey: string): Promise<ToolCharge> {
  try {
    const response = await fetch(apiUrl("/api/wallet/config/"), { next: { revalidate: REVALIDATE_SECONDS } });
    if (!response.ok) return null;
    const data: { tools?: { toolKey?: string; price?: number; priceB2b?: number; priceB2c?: number }[] } = await response.json();
    const tool = Array.isArray(data.tools) ? data.tools.find((entry) => entry?.toolKey === toolKey) : undefined;
    if (!tool) return null;
    const b2c = Number(tool.priceB2c ?? tool.price);
    const b2b = Number(tool.priceB2b ?? tool.price);
    if (!Number.isFinite(b2c) || !Number.isFinite(b2b) || b2c < 0 || b2b < 0) return null;
    return { b2c, b2b };
  } catch {
    return null;
  }
}

function rupees(value: number) {
  return Number.isInteger(value) ? `₹${value}` : `₹${value.toFixed(2)}`;
}

/** One sentence for shop owners, e.g. "For shop owners, each AI passport photo uses ₹5 from your RepetiGo service credits."
 * Without a live price (API down) it names no amount rather than a possibly wrong one. */
export function shopChargeSentence(charge: ToolCharge, item: string) {
  if (!charge) return `For shop owners, each ${item} uses a small charge from your RepetiGo service credits.`;
  if (charge.b2c === 0 && charge.b2b === 0) return `For shop owners, each ${item} is currently free.`;
  const amount = charge.b2c === charge.b2b ? rupees(charge.b2c) : `${rupees(charge.b2c)} per customer order (${rupees(charge.b2b)} for your own use)`;
  return `For shop owners, each ${item} uses ${amount} from your RepetiGo service credits.`;
}
