// Remembers a passport photo that was still being generated when the shop owner left (or gave up on) the
// Passport Photo page, so the dashboard shell can keep checking for it on any page and pop up once it is ready.
// localStorage (not sessionStorage) so it survives a reload; it is only ever a convenience, so every access is guarded.
const STORAGE_KEY = "cafemitra:pending-photo-watch";

// How long the shell keeps checking after the photo was handed off. Past this the photo is still in the Orders page.
export const PHOTO_WATCH_WINDOW_MS = 6 * 60 * 1000;
export const PHOTO_WATCH_INTERVAL_MS = 15_000;
export const PHOTO_WATCH_EVENT = "cafemitra:photo-watch-changed";
// Fired (detail: { id }) when a watched photo turns up while the Orders page is open - that page opens the order itself instead of the popup.
export const PHOTO_READY_EVENT = "cafemitra:photo-ready";

// kind picks the check endpoint and how the photo is handed to the print sheet (family photos are landscape).
export type PhotoWatchKind = "passport" | "family";
export type PendingPhotoWatch = { id: number; kind: PhotoWatchKind; name: string; count: number; startedAt: number };

export function startPhotoWatch(id: number, name: string, count: number, kind: PhotoWatchKind = "passport") {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, kind, name, count, startedAt: Date.now() }));
    window.dispatchEvent(new Event(PHOTO_WATCH_EVENT));
  } catch {
    // Storage unavailable - the photo is still reachable from the Orders page.
  }
}

export function clearPhotoWatch() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(PHOTO_WATCH_EVENT));
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

export function readPhotoWatch(): PendingPhotoWatch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Number.isFinite(parsed.id) || !Number.isFinite(parsed.startedAt)) return null;
    if (Date.now() - parsed.startedAt > PHOTO_WATCH_WINDOW_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return {
      id: parsed.id,
      kind: parsed.kind === "family" ? "family" : "passport",
      name: typeof parsed.name === "string" ? parsed.name : "passport-photo.jpg",
      count: Number.isFinite(parsed.count) && parsed.count > 0 ? Math.floor(parsed.count) : 6,
      startedAt: parsed.startedAt,
    };
  } catch {
    return null;
  }
}
