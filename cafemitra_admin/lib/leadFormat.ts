export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function domainOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

export type FollowUpState = "overdue" | "today" | "upcoming" | "none";

export function followUpState(dateStr: string | null): FollowUpState {
  if (!dateStr) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dateStr}T00:00:00`);
  if (due.getTime() < today.getTime()) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "upcoming";
}

export function formatFollowUp(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// wa.me needs digits-only, full international format (no "+", no leading "0") -
// Indian numbers are stored as plain 10-digit locals, so default to prefixing "91"
// unless the number already looks like it has a country code on it.
export function whatsappLink(phone: string, name: string) {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  const message = `Hi ${name.trim() || "there"}, this is the RepetiGo team! Just checking in - let us know if you need any help with your print shop tools.`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
