import type { Lead } from "./leads";
import { statusMeta } from "./leadStatus";

function escapeCell(value: unknown) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function leadsToCsv(leads: Lead[]) {
  const headers = [
    "Name",
    "Phone",
    "Address",
    "Rating",
    "Reviews",
    "Website",
    "Status",
    "Next follow-up",
    "Notes",
    "Maps URL",
    "Updated",
  ];
  const rows = leads.map((lead) => [
    lead.name,
    lead.phone,
    lead.address,
    lead.rating ?? "",
    lead.reviews ?? "",
    lead.website,
    statusMeta(lead.status).label,
    lead.next_follow_up_at ?? "",
    lead.notes,
    lead.maps_url,
    lead.updatedAt,
  ]);
  return [headers, ...rows].map((row) => row.map(escapeCell).join(",")).join("\n");
}

export function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
