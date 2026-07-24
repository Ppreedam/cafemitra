const STORAGE_KEY = "cafemitra_recent_services";
const MAX_RECENT = 6;

export function recordServiceVisit(serviceKey: string) {
  if (typeof window === "undefined" || !serviceKey) return;
  try {
    const current = readRecentServiceKeys();
    const next = [serviceKey, ...current.filter((key) => key !== serviceKey)].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    undefined;
  }
}

export function readRecentServiceKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.filter((key): key is string => typeof key === "string") : [];
  } catch {
    return [];
  }
}
