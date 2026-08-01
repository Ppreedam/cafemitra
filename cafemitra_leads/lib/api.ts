const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
export const API_BASE_URL = rawBase.replace(/\/+$/, "");

export type Lead = {
  id: number;
  name: string;
  address: string;
  image: string;
  latitude: number | null;
  longitude: number | null;
  maps_url: string;
  phone: string;
  rating: number | null;
  reviews: number | null;
  website: string;
  status: string;
  notes: string;
  next_follow_up_at: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeadActivity = {
  id: number;
  leadId: number;
  kind: "status_change" | "note";
  fromStatus: string;
  toStatus: string;
  note: string;
  createdAt: string;
};

export type QueueItem = {
  id: number;
  link: string;
  name: string;
  extracted_status: boolean;
  extractedby: string;
  createdAt: string;
  updatedAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const message = (body && (body.message as string)) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body as T;
}

// --- Leads (GooglePlaceDetail) ----------------------------------------

export function fetchLeads(search: string) {
  const query = search.trim() ? `?name=${encodeURIComponent(search.trim())}` : "";
  return request<{ count: number; placeDetails: Lead[] }>(`/google-place-details/${query}`);
}

export function updateLeadStatus(id: number, status: string) {
  return updateLead(id, { status });
}

export function createLead(data: Partial<Lead>) {
  return request<{ message: string; placeDetail: Lead }>(`/google-place-details/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function importLeads(items: Partial<Lead>[]) {
  return request<{ message: string; created: Lead[]; skipped: { name: string; reason: string }[] }>(
    `/google-place-details/`,
    { method: "POST", body: JSON.stringify(items) }
  );
}

export function updateLead(id: number, data: Partial<Lead>) {
  return request<{ message: string; placeDetail: Lead }>(`/google-place-details/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteLead(id: number) {
  return request<{ message: string }>(`/google-place-details/${id}/`, { method: "DELETE" });
}

export function fetchLeadActivities(id: number) {
  return request<{ count: number; activities: LeadActivity[] }>(`/google-place-details/${id}/activities/`);
}

export function addLeadNote(id: number, note: string) {
  return request<{ message: string; activity: LeadActivity }>(`/google-place-details/${id}/activities/`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

// --- Scrape queue (GooglePlace) ----------------------------------------

export function fetchQueue(statusFilter: "all" | "true" | "false") {
  return request<{ count: number; places: QueueItem[] }>(`/google-places/?extracted_status=${statusFilter}`);
}

export function addQueueItem(data: { name: string; link: string; extractedby?: string }) {
  return request<{ message: string; place: QueueItem }>(`/google-places/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function importQueueItems(items: { name: string; link: string; extractedby?: string }[]) {
  return request<{ message: string; created: QueueItem[]; skipped: { name: string; reason: string }[] }>(
    `/google-places/`,
    { method: "POST", body: JSON.stringify(items) }
  );
}

export function markQueueItemExtracted(id: number) {
  return request<{ message: string; place: QueueItem }>(`/google-places/${id}/`, { method: "PATCH" });
}

export function deleteQueueItem(id: number) {
  return request<{ message: string }>(`/google-places/${id}/`, { method: "DELETE" });
}
