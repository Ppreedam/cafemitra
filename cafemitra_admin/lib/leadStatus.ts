export const LEAD_STATUSES = [
  { value: "new", label: "New", badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400", ring: "ring-slate-300" },
  { value: "follow_up", label: "Follow-up", badge: "bg-amber-50 text-amber-700", dot: "bg-amber-400", ring: "ring-amber-300" },
  { value: "discussion", label: "In Discussion", badge: "bg-blue-50 text-blue-700", dot: "bg-blue-400", ring: "ring-blue-300" },
  { value: "interested", label: "Interested", badge: "bg-indigo-50 text-indigo-700", dot: "bg-indigo-400", ring: "ring-indigo-300" },
  { value: "call_discussed", label: "Call Discussed", badge: "bg-violet-50 text-violet-700", dot: "bg-violet-400", ring: "ring-violet-300" },
  { value: "converted", label: "Converted", badge: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500", ring: "ring-emerald-300" },
  { value: "not_interested", label: "Not Interested", badge: "bg-red-50 text-red-700", dot: "bg-red-400", ring: "ring-red-300" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["value"];

export function statusMeta(status: string) {
  return LEAD_STATUSES.find((s) => s.value === status) ?? LEAD_STATUSES[0];
}
