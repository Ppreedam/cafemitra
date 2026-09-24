declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

type ToolEventParams = Record<string, string | number | boolean | undefined>;

// Only the opaque account id - never a name/email/phone, which GA4's terms
// prohibit sending as event data.
function currentIdentity(): { user_id?: string } {
  try {
    const user = JSON.parse(localStorage.getItem("cafemitra_user") || "null") as { id?: string } | null;
    return { user_id: user?.id || undefined };
  } catch {
    return {};
  }
}

/**
 * Pushes a custom GTM dataLayer event so tool usage that never touches the
 * backend (ID Card Maker, PDF/Image Tools, etc.) is still visible in GA4/GTM,
 * tagged with the logged-in account so usage can be traced per user.
 */
export function trackToolEvent(toolKey: string, action: string, params?: ToolEventParams) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "tool_usage",
    tool_key: toolKey,
    tool_action: action,
    ...currentIdentity(),
    ...params,
  });
}
