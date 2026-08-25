export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

const ORDER_STATUS_STYLES: Record<string, string> = {
  printed: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  printing: "bg-indigo-50 text-indigo-700",
  queued: "bg-amber-50 text-amber-700",
  awaiting_approval: "bg-amber-50 text-amber-700",
  awaiting_payment: "bg-slate-100 text-slate-500",
};

export function orderStatusBadgeClass(status: string): string {
  return ORDER_STATUS_STYLES[status] || "bg-slate-100 text-slate-500";
}

type OrderResultInfo = {
  order: {
    status: string;
    agentMessage: string;
    photoStatus?: string;
    photoErrorMessage?: string;
  };
};

// Picks the most relevant human-readable outcome for an order: the AI
// photo-generation error takes priority for passport-photo jobs (those
// don't flow through the physical print queue, so `status`/`agentMessage`
// stay blank for them), otherwise falls back to the print agent's message.
export function orderResultMessage({ order }: OrderResultInfo): string {
  if (order.photoStatus === "failed" && order.photoErrorMessage) return order.photoErrorMessage;
  if (order.status === "failed") return order.agentMessage || "Failed - no message from the print agent.";
  if (order.status === "printed") return order.agentMessage || "Printed successfully.";
  return order.agentMessage || "-";
}

// A passport-photo order's `status` tracks the print/token queue, not the
// AI generation step - so it can sit at "queued" indefinitely while
// photoStatus is "failed" and the server keeps retrying the Gemini fallback
// in the background (see resolve_passport_photo in views.py). That's
// correct for the retry logic, but shows admins a misleading "queued" badge
// next to an obvious failure message. This is the status to actually
// display: same as order.status, except a failed photo generation wins.
export function orderEffectiveStatus({ order }: OrderResultInfo): string {
  if (order.photoStatus === "failed") return "failed";
  return order.status;
}
