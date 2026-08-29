// Fixed palette for lead/customer tags, mirrored on the backend
// (cafemitra_server/api/views.py LEAD_TAG_COLORS) - storing a palette key instead of a
// free hex value keeps every tag chip consistent with the rest of the admin UI's
// Tailwind-based chip pattern (see LEAD_STATUSES in leadStatus.ts).
export const TAG_COLORS = [
  { key: "emerald", badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  { key: "amber", badge: "bg-amber-50 text-amber-700", dot: "bg-amber-400" },
  { key: "blue", badge: "bg-blue-50 text-blue-700", dot: "bg-blue-400" },
  { key: "violet", badge: "bg-violet-50 text-violet-700", dot: "bg-violet-400" },
  { key: "rose", badge: "bg-rose-50 text-rose-700", dot: "bg-rose-400" },
  { key: "slate", badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  { key: "cyan", badge: "bg-cyan-50 text-cyan-700", dot: "bg-cyan-400" },
  { key: "orange", badge: "bg-orange-50 text-orange-700", dot: "bg-orange-400" },
] as const;

export type TagColorKey = (typeof TAG_COLORS)[number]["key"];

export function tagColorMeta(color: string) {
  return TAG_COLORS.find((c) => c.key === color) ?? TAG_COLORS[5];
}
